const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const JWT_SECRET = "vireta2_secret_key_2026_rw05";

// Pasang CORS untuk semua port lokal
app.use(
  cors({
    origin: [
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://localhost",
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "ngrok-skip-browser-warning"]
  }),
);
// Izinkan akses folder static gambar oleh browser
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/assets/galery", express.static(path.join(__dirname, "assets/galery")));

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

// 3. Konfigurasi Multer Upload (RT)
const storageRt = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "assets/galery/rt");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || ".webp";
    cb(null, "rt-" + uniqueSuffix + ext);
  },
});
const uploadRt = multer({ storage: storageRt });

// Konfigurasi Multer Upload (RW)
const storageRw = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "assets/galery/rw");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || ".webp";
    cb(null, "rw-" + uniqueSuffix + ext);
  },
});
const uploadRw = multer({ storage: storageRw });

// Konfigurasi Multer Upload (Berita & Galeri Umum)
const storageBeritaGaleri = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "assets/galery/berita");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || ".webp";
    cb(null, "img-" + uniqueSuffix + ext);
  },
});
const uploadBeritaGaleri = multer({ storage: storageBeritaGaleri });

// Konfigurasi Multer Upload (Layanan)
const storageLayanan = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "assets/galery/layanan");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || ".webp";
    cb(null, "layanan-" + uniqueSuffix + ext);
  },
});
const uploadLayanan = multer({ storage: storageLayanan });


// --- AUTH ENDPOINTS ---

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

    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
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

app.get("/api/admin/dashboard-data", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: `Selamat datang ${req.user.username} di Dashboard Admin RW 05 Vireta 2.`,
  });
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("admin_token");
  res.json({ success: true, message: "Berhasil logout." });
});


// --- ENDPOINTS RT ---

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

app.post(
  "/api/admin/rt",
  authenticateToken,
  uploadRt.fields([
    { name: "foto_utama", maxCount: 1 },
    { name: "foto_pendukung", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const { id, nomor_rt, nama_ketua, masa_jabatan, nomor_telepon, ringkasan } = req.body;

      if (!nomor_rt || !nama_ketua || !nomor_telepon) {
        return res.status(400).json({
          success: false,
          message: "Nomor RT, Nama Ketua, dan No Telp wajib diisi!",
        });
      }

      let fotoUtama = null;
      if (req.files && req.files["foto_utama"] && req.files["foto_utama"][0]) {
        fotoUtama = req.files["foto_utama"][0].filename;
      }

      if (id && id.trim() !== "") {
        let sqlUpdate = "UPDATE rt_details SET nomor_rt=?, nama_ketua=?, masa_jabatan=?, nomor_telepon=?, ringkasan=? WHERE id=?";
        let params = [nomor_rt, nama_ketua, masa_jabatan, nomor_telepon, ringkasan, id];

        if (fotoUtama) {
          sqlUpdate = "UPDATE rt_details SET nomor_rt=?, nama_ketua=?, masa_jabatan=?, nomor_telepon=?, ringkasan=?, foto_utama=? WHERE id=?";
          params = [nomor_rt, nama_ketua, masa_jabatan, nomor_telepon, ringkasan, fotoUtama, id];
        }

        db.query(sqlUpdate, params, (err) => {
          if (err) return res.status(500).json({ success: false, message: err.message });
          return res.json({ success: true, message: "Data RT berhasil diperbarui!" });
        });
      } else {
        const sqlInsert =
          "INSERT INTO rt_details (nomor_rt, nama_ketua, masa_jabatan, nomor_telepon, ringkasan, foto_utama) VALUES (?, ?, ?, ?, ?, ?)";

        db.query(
          sqlInsert,
          [nomor_rt, nama_ketua, masa_jabatan, nomor_telepon, ringkasan, fotoUtama],
          async (err, result) => {
            if (err) {
              return res.status(500).json({
                success: false,
                message: err.code === "ER_DUP_ENTRY"
                  ? `[MySQL Error] RT 0${nomor_rt} sudah pernah disimpan sebelumnya!`
                  : `[MySQL Error] ${err.sqlMessage || err.message}`,
              });
            }

            const rtId = result.insertId;

            if (req.files && req.files["foto_pendukung"] && req.files["foto_pendukung"].length > 0) {
              for (const file of req.files["foto_pendukung"]) {
                await new Promise((resolve) => {
                  db.query(
                    "INSERT INTO rt_photos (rt_id, foto_url) VALUES (?, ?)",
                    [rtId, file.filename],
                    (err) => resolve()
                  );
                });
              }
            }

            return res.json({
              success: true,
              message: "Data RT berhasil ditambahkan!",
            });
          }
        );
      }
    } catch (err) {
      res.status(500).json({ success: false, message: "Server Crash: " + err.message });
    }
  }
);

app.delete("/api/admin/rt/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM rt_details WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Data RT berhasil dihapus." });
  });
});


// --- ENDPOINTS RW ---

app.get("/api/admin/rw", authenticateToken, (req, res) => {
  const sql = "SELECT * FROM rw_details ORDER BY is_aktif DESC, created_at DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: results });
  });
});

app.post("/api/admin/rw", authenticateToken, uploadRw.single("foto_utama"), async (req, res) => {
  try {
    const { id, nama_ketua, periode, nomor_telepon, visi_misi, is_aktif } = req.body;

    if (!nama_ketua || !periode) {
      return res.status(400).json({ success: false, message: "Nama Ketua dan Periode wajib diisi!" });
    }

    let fotoName = req.file ? req.file.filename : null;

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
    } else {
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

app.delete("/api/admin/rw/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM rw_details WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Data RW berhasil dihapus." });
  });
});


// --- ENDPOINTS BERITA & PENGUMUMAN ---

app.get("/api/admin/berita", authenticateToken, (req, res) => {
  const sql = "SELECT * FROM berita ORDER BY tanggal DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: results });
  });
});

app.post("/api/admin/berita", authenticateToken, uploadBeritaGaleri.single("foto_utama"), async (req, res) => {
  try {
    const { id, judul, kategori, tanggal, isi_berita } = req.body;

    if (!judul || !kategori || !tanggal) {
      return res.status(400).json({ success: false, message: "Judul, Kategori, dan Tanggal wajib diisi!" });
    }

    let fotoName = req.file ? req.file.filename : null;

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
    } else {
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

app.delete("/api/admin/berita/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM berita WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Berita berhasil dihapus." });
  });
});

app.get("/api/public/berita", (req, res) => {
  const sql = "SELECT * FROM berita ORDER BY tanggal DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: results });
  });
});


// --- ENDPOINTS GALERI WARGA ---

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

app.post("/api/admin/galeri", authenticateToken, uploadBeritaGaleri.single("foto_utama"), async (req, res) => {
  try {
    const { id, judul, kategori, deskripsi, kontak } = req.body;

    if (!judul || !kategori) {
      return res.status(400).json({ success: false, message: "Judul dan Kategori wajib diisi!" });
    }

    let fotoName = req.file ? req.file.filename : null;

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
    } else {
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

app.delete("/api/admin/galeri/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM galeri WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Data galeri berhasil dihapus." });
  });
});

app.get("/api/public/galeri", (req, res) => {
  const { kategori } = req.query;
  let sql = "SELECT * FROM galeri ORDER BY created_at DESC";
  let params = [];

  if (kategori && kategori !== 'semua') {
    const targetKategori = kategori === 'warga' ? 'ikon' : kategori;
    sql = "SELECT * FROM galeri WHERE kategori = ? ORDER BY created_at DESC";
    params.push(targetKategori);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: results });
  });
});


// --- ENDPOINTS LAYANAN WA ---

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

      let gambarUmum = (req.files && req.files["gambar_umum"] && req.files["gambar_umum"][0]) ? req.files["gambar_umum"][0].filename : null;
      let gambarQris = (req.files && req.files["gambar_qris"] && req.files["gambar_qris"][0]) ? req.files["gambar_qris"][0].filename : null;

      if (id && id.trim() !== "") {
        let sqlUpdate = `
          UPDATE layanan_wa 
          SET jenis_layanan=?, nama_kegiatan=?, keterangan=?, target_wilayah=?, nomor_telepon=?
          ${gambarUmum ? ", gambar_umum=?" : ""}
          ${gambarQris ? ", gambar_qris=?" : ""}
          WHERE id=?
        `;
        let params = [jenis_layanan, nama_kegiatan, keterangan, target_wilayah, nomor_telepon];
        if (gambarUmum) params.push(gambarUmum);
        if (gambarQris) params.push(gambarQris);
        params.push(id);

        db.query(sqlUpdate, params, (err) => {
          if (err) return res.status(500).json({ success: false, message: err.message });
          return res.json({ success: true, message: "Data layanan berhasil diperbarui!" });
        });
      } else {
        const sqlInsert = `
          INSERT INTO layanan_wa (jenis_layanan, nama_kegiatan, keterangan, target_wilayah, nomor_telepon, gambar_umum, gambar_qris) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(
          sqlInsert,
          [jenis_layanan, nama_kegiatan, keterangan, target_wilayah, nomor_telepon, gambarUmum, gambarQris],
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

app.delete("/api/admin/layanan/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM layanan_wa WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Data layanan berhasil dihapus." });
  });
});

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