const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const potrace = require("potrace");

const app = express();
const JWT_SECRET = "vireta2_secret_key_2026_rw05";

// Pasang CORS untuk semua port lokal
app.use(
  cors({
    origin: [
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://localhost",
      // "https://a19e-114-10-64-129.ngrok-free.app",
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "ngrok-skip-browser-warning"]
  }),
);

app.use(express.json());
app.use(cookieParser());

// 1. Koneksi MySQL
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "vireta2_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.getConnection((err, conn) => {
  if (err) console.error("Koneksi Database Gagal:", err);
  else {
    console.log("Terhubung ke MySQL vireta2_db");
    conn.release();
  }
});

// 2. Middleware Authenticate Token
const authenticateToken = (req, res, next) => {
  const token =
    req.cookies.admin_token || req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Akses ditolak. Token tidak ditemukan.",
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Token tidak valid atau kadaluwarsa.",
      });
    }
    req.user = user;
    next();
  });
};

// 3. Konfigurasi Multer Upload (Cukup Sekali Saja)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "assets/galery/rt");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "raw-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// 4. Helper Konversi SVG Aman
const convertToSvg = (inputPath) => {
  return new Promise((resolve, reject) => {
    if (!inputPath || !fs.existsSync(inputPath)) return resolve(null);
    const svgPath =
      inputPath.replace(/raw-/, "").replace(/\.[^/.]+$/, "") + ".svg";
    potrace.trace(inputPath, { threshold: 128 }, (err, svg) => {
      if (err) {
        reject(err);
      } else {
        fs.writeFileSync(svgPath, svg);
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        resolve(path.basename(svgPath));
      }
    });
  });
};

// --- ENDPOINTS ---

// Endpoint Login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Username dan password wajib diisi!" });
  }

  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [username], async (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, message: "Kesalahan Server." });

    if (results.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Username atau Password salah!" });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: "Username atau Password salah!" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "8h" },
    );

    // Di endpoint app.post("/api/login", ...) pada server.js
    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: true, // Wajib true jika backend dipanggil via HTTPS (Ngrok)
      sameSite: "none", // Wajib "none" untuk cross-origin (localhost -> ngrok)
      maxAge: 8 * 60 * 60 * 1000,
    });
    res.json({
      success: true,
      message: "Login berhasil!",
      user: {
        username: user.username,
        nama: user.nama_lengkap,
        role: user.role,
      },
    });
  });
});

// Endpoint Protected Dashboard
app.get("/api/admin/dashboard-data", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: `Selamat datang ${req.user.username} di Dashboard Admin RW 05 Vireta 2.`,
  });
});

// Endpoint Read All RT
app.get("/api/admin/rt", authenticateToken, (req, res) => {
  const sql = `
    SELECT r.*, GROUP_CONCAT(p.foto_url) as foto_pendukung 
    FROM rt_details r 
    LEFT JOIN rt_photos p ON r.id = p.rt_id 
    GROUP BY r.id ORDER BY r.nomor_rt ASC
  `;
  db.query(sql, (err, results) => {
    if (err)
      return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: results });
  });
});

// Endpoint Create RT
app.post(
  "/api/admin/rt",
  authenticateToken,
  upload.fields([
    { name: "foto_utama", maxCount: 1 },
    { name: "foto_pendukung", maxCount: 10 },
  ]),
  async (req, res) => {
    console.log("\n====== [LOG START] REQUEST SIMPAN RT ======");
    console.log("--> 1. Payload Body:", req.body);
    console.log(
      "--> 2. Files Loaded:",
      req.files ? Object.keys(req.files) : "Tidak ada file",
    );

    try {
      const { nomor_rt, nama_ketua, nomor_telepon, ringkasan } = req.body;

      if (!nomor_rt || !nama_ketua || !nomor_telepon) {
        console.error(
          "--> [LOG ERROR] Validasi Gagal: Field wajib ada yang kosong.",
        );
        return res.status(400).json({
          success: false,
          message: "Nomor RT, Nama Ketua, dan No Telp wajib diisi!",
        });
      }

      // Process Foto Utama (jika ada)
      let fotoUtamaSvg = null;
      if (req.files && req.files["foto_utama"] && req.files["foto_utama"][0]) {
        console.log("--> 3. Memproses Konversi Foto Utama ke SVG...");
        fotoUtamaSvg = await convertToSvg(req.files["foto_utama"][0].path);
        console.log("--> 3. Result SVG Foto Utama:", fotoUtamaSvg);
      }

      const sqlInsert =
        "INSERT INTO rt_details (nomor_rt, nama_ketua, nomor_telepon, ringkasan, foto_utama) VALUES (?, ?, ?, ?, ?)";

      console.log("--> 4. Menjalankan Query MySQL Insert RT...");
      db.query(
        sqlInsert,
        [nomor_rt, nama_ketua, nomor_telepon, ringkasan, fotoUtamaSvg],
        async (err, result) => {
          if (err) {
            console.error("--> [LOG MYSQL ERROR]:", err.sqlMessage || err);
            return res.status(500).json({
              success: false,
              message:
                err.code === "ER_DUP_ENTRY"
                  ? `[MySQL Error] RT 0${nomor_rt} sudah pernah disimpan sebelumnya!`
                  : `[MySQL Error] ${err.sqlMessage || err.message}`,
            });
          }

          const rtId = result.insertId;
          console.log(`--> 5. Berhasil Insert RT Details. ID RT baru: ${rtId}`);

          // Process Foto Pendukung (jika ada)
          if (
            req.files &&
            req.files["foto_pendukung"] &&
            req.files["foto_pendukung"].length > 0
          ) {
            console.log(
              `--> 6. Memproses ${req.files["foto_pendukung"].length} Foto Pendukung...`,
            );
            for (const file of req.files["foto_pendukung"]) {
              const svgName = await convertToSvg(file.path);
              if (svgName) {
                await new Promise((resolve) => {
                  db.query(
                    "INSERT INTO rt_photos (rt_id, foto_url) VALUES (?, ?)",
                    [rtId, svgName],
                    (err) => {
                      if (err)
                        console.error("--> [LOG ERROR PHOTO INSERT]:", err);
                      resolve();
                    },
                  );
                });
              }
            }
          }

          console.log("====== [LOG SUCCESS] TRANSAKSI SELESAI ======\n");
          return res.json({
            success: true,
            message: "Data RT berhasil ditambahkan ke MySQL!",
          });
        },
      );
    } catch (err) {
      console.error("--> [LOG FATAL CATCH ERROR]:", err);
      res.status(500).json({
        success: false,
        message: "Server Crash: " + err.message,
      });
    }
  },
);

// Endpoint Delete RT
app.delete("/api/admin/rt/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM rt_details WHERE id = ?", [id], (err) => {
    if (err)
      return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Data RT berhasil dihapus." });
  });
});

// Endpoint Logout
app.post("/api/logout", (req, res) => {
  res.clearCookie("admin_token");
  res.json({ success: true, message: "Berhasil logout." });
});


// --- ENDPOINTS RW ---

// 1. READ ALL RW
app.get("/api/admin/rw", authenticateToken, (req, res) => {
    const sql = "SELECT * FROM rw_details ORDER BY is_aktif DESC, created_at DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, data: results });
    });
});

// 2. CREATE / UPDATE RW
app.post("/api/admin/rw", authenticateToken, upload.single("foto_utama"), async (req, res) => {
    try {
        const { id, nama_ketua, periode, nomor_telepon, visi_misi, is_aktif } = req.body;

        if (!nama_ketua || !periode) {
            return res.status(400).json({ success: false, message: "Nama Ketua dan Periode wajib diisi!" });
        }

        let fotoName = null;
        if (req.file) {
            fotoName = await convertToSvg(req.file.path);
        }

        // Mode UPDATE (jika ID dikirim)
        if (id && id.trim() !== "") {
            let sqlUpdate = "UPDATE rw_details SET nama_ketua=?, periode=?, nomor_telepon=?, visi_misi=?, is_aktif=? WHERE id=?";
            let params = [nama_ketua, periode, nomor_telepon, visi_misi, is_aktif, id];

            if (fotoName) {
                sqlUpdate = "UPDATE rw_details SET nama_ketua=?, periode=?, nomor_telepon=?, visi_misi=?, is_aktif=?, foto_utama=? WHERE id=?";
                params = [nama_ketua, periode, nomor_telepon, visi_misi, is_aktif, fotoName, id];
            }

            db.query(sqlUpdate, params, (err) => {
                if (err) return res.status(500).json({ success: false, message: err.message });
                return res.json({ success: true, message: "Data RW berhasil diperbarui!" });
            });
        } 
        // Mode INSERT Baru
        else {
            const sqlInsert = "INSERT INTO rw_details (nama_ketua, periode, nomor_telepon, visi_misi, is_aktif, foto_utama) VALUES (?, ?, ?, ?, ?, ?)";
            db.query(sqlInsert, [nama_ketua, periode, nomor_telepon, visi_misi, is_aktif || 1, fotoName], (err) => {
                if (err) return res.status(500).json({ success: false, message: err.message });
                return res.json({ success: true, message: "Data RW berhasil ditambahkan!" });
            });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error: " + err.message });
    }
});

// 3. DELETE RW
app.delete("/api/admin/rw/:id", authenticateToken, (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM rw_details WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: "Data RW berhasil dihapus." });
    });
});



// --- ENDPOINTS BERITA & PENGUMUMAN ---

// 1. READ ALL BERITA
app.get("/api/admin/berita", authenticateToken, (req, res) => {
    const sql = "SELECT * FROM berita ORDER BY tanggal DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, data: results });
    });
});

// 2. CREATE / UPDATE BERITA
app.post("/api/admin/berita", authenticateToken, upload.single("foto_utama"), async (req, res) => {
    try {
        const { id, judul, kategori, tanggal, isi_berita } = req.body;

        if (!judul || !kategori || !tanggal) {
            return res.status(400).json({ success: false, message: "Judul, Kategori, dan Tanggal wajib diisi!" });
        }

        let fotoName = null;
        if (req.file) {
            fotoName = await convertToSvg(req.file.path);
        }

        // Mode UPDATE
        if (id && id.trim() !== "") {
            let sqlUpdate = "UPDATE berita SET judul=?, kategori=?, tanggal=?, isi_berita=? WHERE id=?";
            let params = [judul, kategori, tanggal, isi_berita, id];

            if (fotoName) {
                sqlUpdate = "UPDATE berita SET judul=?, kategori=?, tanggal=?, isi_berita=?, foto_utama=? WHERE id=?";
                params = [judul, kategori, tanggal, isi_berita, fotoName, id];
            }

            db.query(sqlUpdate, params, (err) => {
                if (err) return res.status(500).json({ success: false, message: err.message });
                return res.json({ success: true, message: "Berita berhasil diperbarui!" });
            });
        } 
        // Mode INSERT
        else {
            const sqlInsert = "INSERT INTO berita (judul, kategori, tanggal, isi_berita, foto_utama) VALUES (?, ?, ?, ?, ?)";
            db.query(sqlInsert, [judul, kategori, tanggal, isi_berita, fotoName], (err) => {
                if (err) return res.status(500).json({ success: false, message: err.message });
                return res.json({ success: true, message: "Berita berhasil ditambahkan!" });
            });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error: " + err.message });
    }
});

// 3. DELETE BERITA
app.delete("/api/admin/berita/:id", authenticateToken, (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM berita WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: "Berita berhasil dihapus." });
    });
});

// Endpoint publik berita (Tanpa authenticateToken)
app.get("/api/public/berita", (req, res) => {
    const sql = "SELECT * FROM berita ORDER BY tanggal DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, data: results });
    });
});

// --- ENDPOINTS GALERI WARGA (UMKM, KEGIATAN, IKON) ---

// 1. READ ALL GALERI
app.get("/api/admin/galeri", authenticateToken, (req, res) => {
    const { kategori } = req.query;
    let sql = "SELECT * FROM galeri ORDER BY created_at DESC";
    let params = [];

    if (kategori) {
        sql = "SELECT * FROM galeri WHERE kategori = ? ORDER BY created_at DESC";
        params.push(kategori);
    }

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, data: results });
    });
});

// 2. CREATE / UPDATE GALERI
app.post("/api/admin/galeri", authenticateToken, upload.single("foto_utama"), async (req, res) => {
    try {
        const { id, judul, kategori, deskripsi, kontak } = req.body;

        if (!judul || !kategori) {
            return res.status(400).json({ success: false, message: "Judul dan Kategori wajib diisi!" });
        }

        let fotoName = null;
        if (req.file) {
            fotoName = await convertToSvg(req.file.path);
        }

        // Mode UPDATE
        if (id && id.trim() !== "") {
            let sqlUpdate = "UPDATE galeri SET judul=?, kategori=?, deskripsi=?, kontak=? WHERE id=?";
            let params = [judul, kategori, deskripsi, kontak, id];

            if (fotoName) {
                sqlUpdate = "UPDATE galeri SET judul=?, kategori=?, deskripsi=?, kontak=?, foto_utama=? WHERE id=?";
                params = [judul, kategori, deskripsi, kontak, fotoName, id];
            }

            db.query(sqlUpdate, params, (err) => {
                if (err) return res.status(500).json({ success: false, message: err.message });
                return res.json({ success: true, message: "Data galeri berhasil diperbarui!" });
            });
        } 
        // Mode INSERT
        else {
            const sqlInsert = "INSERT INTO galeri (judul, kategori, deskripsi, kontak, foto_utama) VALUES (?, ?, ?, ?, ?)";
            db.query(sqlInsert, [judul, kategori, deskripsi, kontak, fotoName], (err) => {
                if (err) return res.status(500).json({ success: false, message: err.message });
                return res.json({ success: true, message: "Data galeri berhasil ditambahkan!" });
            });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error: " + err.message });
    }
});

// 3. DELETE GALERI
app.delete("/api/admin/galeri/:id", authenticateToken, (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM galeri WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: "Data galeri berhasil dihapus." });
    });
});


// Endpoint Publik Galeri (Tanpa butuh Token / Auth)
app.get("/api/public/galeri", (req, res) => {
    const { kategori } = req.query;
    let sql = "SELECT * FROM galeri ORDER BY created_at DESC";
    let params = [];

    if (kategori && kategori !== 'semua') {
        // Pemetaan filter 'warga' pada tombol ke 'ikon' di database
        const targetKategori = kategori === 'warga' ? 'ikon' : kategori;
        sql = "SELECT * FROM galeri WHERE kategori = ? ORDER BY created_at DESC";
        params.push(targetKategori);
    }

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, data: results });
    });
});


// Konfigurasi Multer Upload Gambar Layanan
const storageLayanan = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "assets/galery/layanan");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "layanan-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const uploadLayanan = multer({ storage: storageLayanan });

// --- ENDPOINTS LAYANAN WA (Surat, Iuran, Kesehatan/Keamanan) ---

// 1. READ ALL (Admin Filter sesuai Target Wilayah / Jenis Layanan)
app.get("/api/admin/layanan", authenticateToken, (req, res) => {
  const { jenis_layanan, target_wilayah } = req.query;
  let sql = "SELECT * FROM layanan_wa WHERE 1=1";
  let params = [];

  if (jenis_layanan) {
    sql += " AND jenis_layanan = ?";
    params.push(jenis_layanan);
  }
  if (target_wilayah) {
    sql += " AND target_wilayah = ?";
    params.push(target_wilayah);
  }

  sql += " ORDER BY created_at DESC";

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: results });
  });
});

// 2. CREATE / UPDATE LAYANAN
app.post(
  "/api/admin/layanan",
  authenticateToken,
  uploadLayanan.fields([
    { name: "gambar_umum", maxCount: 1 },
    { name: "gambar_qris", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { id, jenis_layanan, nama_kegiatan, keterangan, target_wilayah, nomor_telepon } = req.body;

      if (!jenis_layanan || !nama_kegiatan || !target_wilayah || !nomor_telepon) {
        return res.status(400).json({
          success: false,
          message: "Jenis Layanan, Nama Kegiatan, Target Wilayah, dan Nomor Telepon wajib diisi!",
        });
      }

      let gambarUmumSvg = null;
      let gambarQrisSvg = null;

      if (req.files && req.files["gambar_umum"] && req.files["gambar_umum"][0]) {
        gambarUmumSvg = await convertToSvg(req.files["gambar_umum"][0].path);
      }
      if (req.files && req.files["gambar_qris"] && req.files["gambar_qris"][0]) {
        gambarQrisSvg = await convertToSvg(req.files["gambar_qris"][0].path);
      }

      // Mode UPDATE
      if (id && id.trim() !== "") {
        let sqlUpdate = `
          UPDATE layanan_wa 
          SET jenis_layanan=?, nama_kegiatan=?, keterangan=?, target_wilayah=?, nomor_telepon=?
          ${gambarUmumSvg ? ", gambar_umum=?" : ""}
          ${gambarQrisSvg ? ", gambar_qris=?" : ""}
          WHERE id=?
        `;
        let params = [jenis_layanan, nama_kegiatan, keterangan, target_wilayah, nomor_telepon];
        if (gambarUmumSvg) params.push(gambarUmumSvg);
        if (gambarQrisSvg) params.push(gambarQrisSvg);
        params.push(id);

        db.query(sqlUpdate, params, (err) => {
          if (err) return res.status(500).json({ success: false, message: err.message });
          return res.json({ success: true, message: "Data layanan berhasil diperbarui!" });
        });
      } 
      // Mode INSERT
      else {
        const sqlInsert = `
          INSERT INTO layanan_wa (jenis_layanan, nama_kegiatan, keterangan, target_wilayah, nomor_telepon, gambar_umum, gambar_qris) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(
          sqlInsert,
          [jenis_layanan, nama_kegiatan, keterangan, target_wilayah, nomor_telepon, gambarUmumSvg, gambarQrisSvg],
          (err) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            return res.json({ success: true, message: "Data layanan berhasil ditambahkan!" });
          }
        );
      }
    } catch (err) {
      res.status(500).json({ success: false, message: "Server Error: " + err.message });
    }
  }
);

// 3. DELETE LAYANAN
app.delete("/api/admin/layanan/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM layanan_wa WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Data layanan berhasil dihapus." });
  });
});

// Endpoint Publik Layanan WA (Tanpa auth)
app.get("/api/public/layanan", (req, res) => {
  const { jenis_layanan, target_wilayah } = req.query;
  let sql = "SELECT * FROM layanan_wa WHERE 1=1";
  let params = [];

  if (jenis_layanan) {
    sql += " AND jenis_layanan = ?";
    params.push(jenis_layanan);
  }
  if (target_wilayah) {
    sql += " AND target_wilayah = ?";
    params.push(target_wilayah);
  }

  sql += " ORDER BY created_at DESC";

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: results });
  });
});

// Listener Server Terakhir
app.listen(3000, () => {
  console.log("Server API berjalan di http://localhost:3000");
});
