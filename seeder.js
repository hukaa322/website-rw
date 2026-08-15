const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
    // 1. Konfigurasi Koneksi Database
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'vireta2_db'
    });

    try {
        console.log('Terhubung ke database...');

        // 2. Data Admin
        const username = 'admin1';
        const rawPassword = 'admin123';
        const namaLengkap = 'Administrator 1';
        const role = 'admin';

        // 3. Hash Password menggunakan bcrypt (10 rounds)
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        // 4. Query UPSERT (Insert jika belum ada, Update jika username sudah terdaftar)
        const sql = `
            INSERT INTO users (username, password, nama_lengkap, role)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                password = VALUES(password),
                nama_lengkap = VALUES(nama_lengkap),
                role = VALUES(role);
        `;

        await connection.execute(sql, [username, hashedPassword, namaLengkap, role]);

        console.log('====================================');
        console.log(' SUCCESS: Admin Seeder Berhasil!');
        console.log(` Username : ${username}`);
        console.log(` Password : ${rawPassword}`);
        console.log('====================================');

    } catch (error) {
        console.error('Gagal menjalankan seeder:', error.message);
    } finally {
        await connection.end();
    }
}

seedAdmin();