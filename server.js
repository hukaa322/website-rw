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
    ],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// ... (sisa code database dan endpoints)

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

// 2. Middleware Authenticate Token (Memproteksi Akses Admin)
const authenticateToken = (req, res, next) => {
  const token =
    req.cookies.admin_token || req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({
        success: false,
        message: "Akses ditolak. Token tidak ditemukan.",
      });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Token tidak valid atau kadaluwarsa.",
        });
    }
    req.user = user;
    next();
  });
};

// 3. Endpoint Fungsi Login
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

    // Verifikasi Password Hash
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: "Username atau Password salah!" });
    }

    // Buat JWT Token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "8h" },
    );

    // Simpan token di HTTP-Only Cookie
    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax", // Tambahkan atribut ini agar cookie diizinkan browser
      maxAge: 8 * 60 * 60 * 1000, // 8 Jam
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

// 4. Endpoint Contoh Terproteksi Middleware
app.get("/api/admin/dashboard-data", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: `Selamat datang ${req.user.username} di Dashboard Admin RW 05 Vireta 2.`,
  });
});

// 5. Endpoint Logout
app.post("/api/logout", (req, res) => {
  res.clearCookie("admin_token");
  res.json({ success: true, message: "Berhasil logout." });
});

app.listen(3000, () => {
  console.log("Server API berjalan di http://localhost:3000");
});

// 1. Konfigurasi penyimpanan sementara Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../assets/galery/rt");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "raw-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// 2. Helper konversi gambar (JPG/PNG/WEBP) menjadi .SVG
const convertToSvg = (inputPath) => {
  return new Promise((resolve, reject) => {
    const svgPath = inputPath.replace(/raw-/, "").replace(/\.[^/.]+$/, "") + ".svg";
    potrace.trace(inputPath, { threshold: 128 }, (err, svg) => {
      if (err) {
        reject(err);
      } else {
        fs.writeFileSync(svgPath, svg);
        // Hapus file mentah setelah dikonversi ke SVG
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        resolve(path.basename(svgPath));
      }
    });
  });
};

// 1. Konfigurasi penyimpanan Multer (Folder berada di dalam root project)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "assets/galery/rt");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "raw-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// 2. Endpoint Create RT
app.post("/api/admin/rt", authenticateToken, upload.fields([
  { name: 'foto_utama', maxCount: 1 },
  { name: 'foto_pendukung', maxCount: 10 }
]), async (req, res) => {
  try {
    const { nomor_rt, nama_ketua, nomor_telepon, ringkasan } = req.body;
    
    let fotoUtamaSvg = null;
    if (req.files && req.files['foto_utama'] && req.files['foto_utama'][0]) {
      fotoUtamaSvg = await convertToSvg(req.files['foto_utama'][0].path);
    }

    const sqlInsert = "INSERT INTO rt_details (nomor_rt, nama_ketua, nomor_telepon, ringkasan, foto_utama) VALUES (?, ?, ?, ?, ?)";
    
    db.query(sqlInsert, [nomor_rt, nama_ketua, nomor_telepon, ringkasan, fotoUtamaSvg], async (err, result) => {
      if (err) {
        console.error("Database Insert Error:", err);
        return res.status(500).json({ success: false, message: "Gagal menyimpan ke database: " + err.message });
      }
      
      const rtId = result.insertId;

      if (req.files && req.files['foto_pendukung'] && req.files['foto_pendukung'].length > 0) {
        for (const file of req.files['foto_pendukung']) {
          const svgName = await convertToSvg(file.path);
          await new Promise((resolve, reject) => {
            db.query("INSERT INTO rt_photos (rt_id, foto_url) VALUES (?, ?)", [rtId, svgName], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
        }
      }

      return res.json({ success: true, message: "Data RT berhasil ditambahkan!" });
    });
  } catch (err) {
    console.error("Process Error:", err);
    res.status(500).json({ success: false, message: "Gagal memproses gambar: " + err.message });
  }
});