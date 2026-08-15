-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Aug 08, 2026 at 05:50 AM
-- Server version: 8.0.44
-- PHP Version: 8.3.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `vireta2_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `berita`
--

CREATE TABLE `berita` (
  `id` int NOT NULL,
  `judul` varchar(255) NOT NULL,
  `kategori` enum('Kegiatan','Pengumuman','Berita Utama','Lainnya') NOT NULL DEFAULT 'Kegiatan',
  `tanggal` date NOT NULL,
  `isi_berita` text,
  `foto_utama` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `berita`
--

INSERT INTO `berita` (`id`, `judul`, `kategori`, `tanggal`, `isi_berita`, `foto_utama`, `created_at`, `updated_at`) VALUES
(1, 'jljljlkj', 'Pengumuman', '2026-08-08', 'ihlhoihoihoih', '1786163292350-143461376.svg', '2026-08-08 04:28:13', '2026-08-08 04:28:13');

-- --------------------------------------------------------

--
-- Table structure for table `galeri`
--

CREATE TABLE `galeri` (
  `id` int NOT NULL,
  `judul` varchar(255) NOT NULL,
  `kategori` enum('umkm','kegiatan','ikon') NOT NULL,
  `deskripsi` text,
  `kontak` varchar(100) DEFAULT NULL,
  `foto_utama` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `galeri`
--

INSERT INTO `galeri` (`id`, `judul`, `kategori`, `deskripsi`, `kontak`, `foto_utama`, `created_at`) VALUES
(1, 'sadasd', 'umkm', 'kkjljljlk', '343421', '1786165090859-702257731.svg', '2026-08-08 04:58:12'),
(2, 'asdasdasd', 'kegiatan', 'lkjdlkajsdlkaj', '23120931098', '1786165120483-697347383.svg', '2026-08-08 04:58:41');

-- --------------------------------------------------------

--
-- Table structure for table `layanan_wa`
--

CREATE TABLE `layanan_wa` (
  `id` int NOT NULL,
  `jenis_layanan` enum('surat','iuran','layanan') NOT NULL,
  `nama_kegiatan` varchar(150) NOT NULL,
  `keterangan` text,
  `target_wilayah` varchar(50) NOT NULL,
  `nomor_telepon` varchar(20) NOT NULL,
  `gambar_umum` varchar(255) DEFAULT NULL,
  `gambar_qris` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `layanan_wa`
--

INSERT INTO `layanan_wa` (`id`, `jenis_layanan`, `nama_kegiatan`, `keterangan`, `target_wilayah`, `nomor_telepon`, `gambar_umum`, `gambar_qris`, `created_at`, `updated_at`) VALUES
(1, 'surat', 'pengajuan KTP  RT 1', 'KJLKJLJ', 'RT 01', '0293102931`', 'layanan-1786167156789-66188063.svg', NULL, '2026-08-08 05:32:39', '2026-08-08 05:32:39'),
(2, 'surat', 'pengajuan KTP  RT 2', 'KMLKJLKJ', 'RT 02', '0293102931`', 'layanan-1786167193126-986428933.svg', NULL, '2026-08-08 05:33:15', '2026-08-08 05:33:15'),
(3, 'iuran', 'PEMBAYARAN IURAN RT1', 'LHJLJAKJAJO', 'RT 01', '099827280', 'layanan-1786167230280-135780669.svg', 'layanan-1786167230367-775288116.svg', '2026-08-08 05:33:54', '2026-08-08 05:33:54'),
(4, 'layanan', 'PENYULUHAN KESEHATAN', 'HIHOIH', 'Ketua RW', '08987987987', 'layanan-1786167263057-578510575.svg', NULL, '2026-08-08 05:34:25', '2026-08-08 05:34:25');

-- --------------------------------------------------------

--
-- Table structure for table `rt_details`
--

CREATE TABLE `rt_details` (
  `id` int NOT NULL,
  `nomor_rt` int NOT NULL,
  `nama_ketua` varchar(150) NOT NULL,
  `nomor_telepon` varchar(20) NOT NULL,
  `ringkasan` text,
  `masa_jabatan` varchar(50) DEFAULT NULL,
  `foto_utama` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

--
-- Dumping data for table `rt_details`
--

INSERT INTO `rt_details` (`id`, `nomor_rt`, `nama_ketua`, `nomor_telepon`, `ringkasan`, `masa_jabatan`, `foto_utama`, `created_at`, `updated_at`) VALUES
(3, 1, 'Yusuf Randy', '081385266673', 'jelek', NULL, NULL, '2026-08-08 03:37:33', '2026-08-08 03:37:33'),
(23, 2, 'Yusuf Randy', '081385266673', 'jelek', NULL, '1786160353591-292545561.svg', '2026-08-08 03:40:05', '2026-08-08 03:40:05');

-- --------------------------------------------------------

--
-- Table structure for table `rt_photos`
--

CREATE TABLE `rt_photos` (
  `id` int NOT NULL,
  `rt_id` int NOT NULL,
  `foto_url` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `rt_photos`
--

INSERT INTO `rt_photos` (`id`, `rt_id`, `foto_url`, `created_at`) VALUES
(3, 23, '1786160401947-891316464.svg', '2026-08-08 03:40:09');

-- --------------------------------------------------------

--
-- Table structure for table `rw_details`
--

CREATE TABLE `rw_details` (
  `id` int NOT NULL,
  `nama_ketua` varchar(255) NOT NULL,
  `periode` varchar(100) NOT NULL,
  `nomor_telepon` varchar(50) DEFAULT NULL,
  `visi_misi` text,
  `foto_utama` varchar(255) DEFAULT NULL,
  `is_aktif` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `rw_details`
--

INSERT INTO `rw_details` (`id`, `nama_ketua`, `periode`, `nomor_telepon`, `visi_misi`, `foto_utama`, `is_aktif`, `created_at`, `updated_at`) VALUES
(1, 'gfhfghfg', '324243', '34124143143', 'werwerwerwrw', '1786161488565-223447073.svg', 1, '2026-08-08 03:58:09', '2026-08-08 03:58:09');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `role` enum('admin','pengurus') DEFAULT 'admin',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `nama_lengkap`, `role`, `created_at`) VALUES
(1, 'adminrw05', '$2b$10$e8R4a21Nl5c3O6zK8x.u0Oq.2d8eM2f5H5k9A0B1C2D3E4F5G6H7I', 'Administrator RW 05', 'admin', '2026-08-07 18:31:59'),
(2, 'admin1', '$2b$10$FUGQBjC/Ol2iRszh2oXDxuR5ivBVKJVjxohLGZ.sZNGBbsQudYphi', 'Administrator 1', 'admin', '2026-08-07 18:40:18');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `berita`
--
ALTER TABLE `berita`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `galeri`
--
ALTER TABLE `galeri`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `layanan_wa`
--
ALTER TABLE `layanan_wa`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `rt_details`
--
ALTER TABLE `rt_details`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nomor_rt` (`nomor_rt`);

--
-- Indexes for table `rt_photos`
--
ALTER TABLE `rt_photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rt_id` (`rt_id`);

--
-- Indexes for table `rw_details`
--
ALTER TABLE `rw_details`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `berita`
--
ALTER TABLE `berita`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `galeri`
--
ALTER TABLE `galeri`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `layanan_wa`
--
ALTER TABLE `layanan_wa`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `rt_details`
--
ALTER TABLE `rt_details`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rt_photos`
--
ALTER TABLE `rt_photos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `rw_details`
--
ALTER TABLE `rw_details`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `rt_photos`
--
ALTER TABLE `rt_photos`
  ADD CONSTRAINT `rt_photos_ibfk_1` FOREIGN KEY (`rt_id`) REFERENCES `rt_details` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
