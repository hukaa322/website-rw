-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Aug 19, 2026 at 10:44 AM
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
(1, 'MALAM PUNCAK', 'Pengumuman', '2026-08-28', 'diberitahukan kepada seluruh warga bahwa acara malam puncak peringatan 17 agustusan akan dilaksanakan pada tanggal 29 agustus 2026. acara ini akan diisi dengan panggung hiburan, pembagian hadiah berbagai perlombaan, serta pentas seni. diharapkan kehadiran seluruh warga untuk memeriahkan dan menyukseskan acara penutupan ini', 'img-1787108230327-6601203.webp', '2026-08-19 02:52:54', '2026-08-19 02:57:10');

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
(1, '17 AGUSTUSAN', 'kegiatan', 'kegiatan peringatan hari kemerdekaan 17 agustusan di lapangan rt 10 berlangsung dengan meriah dan lancar. acara diisi dengan berbagai perlombaan antarwarga, penyerahan hadiah, serta silaturahmi bersama untuk mempererat kebersamaan seluruh warga.', 'LAPANGAN RT 10/ 17 AGUSTUS 2026', 'img-1787106117607-143541600.webp', '2026-08-19 02:21:57'),
(2, 'LOMBA SENAM', 'kegiatan', 'kegiatan lomba senam telah dilaksanakan dengan meriah dan penuh semangat pada 16 agustus 2026 dilapangan sekretariat RW. acara ini diikuti oleh para peserta dengan antusiasme tinggi untuk meningkatkan kebugaran jasmani sekaligus mempererat kebersamaan antarwarga', 'LAPANGAN SEKRETARIAT RW/16 AGUSTUS 2026', 'img-1787106511989-170312899.webp', '2026-08-19 02:28:31'),
(3, 'UST TAUFIK', 'ikon', 'UST TAUFIK adalah seorang tokoh agama yang berdedikasi tinggi dalam pendidikan  al-quran anak-anak. beliau aktif mengajar dan membimbing para santri di TPA yang bertempatan di RT 11, membina akhlak mulia, serta menanamkan nilai-nilai keagamaan sejak dini kepada generasi muda dilingkungan sekitar', 'TOKOH AGAMA', 'img-1787107163378-540057483.webp', '2026-08-19 02:39:23');

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

-- --------------------------------------------------------

--
-- Table structure for table `rt_details`
--

CREATE TABLE `rt_details` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
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

INSERT INTO `rt_details` (`id`, `user_id`, `nomor_rt`, `nama_ketua`, `nomor_telepon`, `ringkasan`, `masa_jabatan`, `foto_utama`, `created_at`, `updated_at`) VALUES
(31, NULL, 1, 'AHMAD ARYADITA', '0895331770856', '', '2026-2031', 'rt-1787112149708-591973776.webp', '2026-08-19 02:09:36', '2026-08-19 04:02:29'),
(32, NULL, 2, 'AGUS S', '081212356450', '', '2026-2031', 'rt-1787116266378-525563000.webp', '2026-08-19 02:10:15', '2026-08-19 05:11:06'),
(33, NULL, 3, 'WAKINO', '087884156449', '', '2026-2031', 'rt-1787114085324-547928288.webp', '2026-08-19 02:10:36', '2026-08-19 04:34:45'),
(34, NULL, 4, 'SUBAGYO', '085691178000', '', '2026-2031', 'rt-1787111460252-629192130.webp', '2026-08-19 02:10:55', '2026-08-19 03:51:00'),
(35, NULL, 5, 'SISWANTO', '0895405853499', '', '2026-2031', 'rt-1787111246644-280537668.webp', '2026-08-19 02:11:13', '2026-08-19 03:47:26'),
(36, NULL, 6, 'M SYAFAAT', '08119802288', '', '2026-2031', 'rt-1787111063773-752943001.webp', '2026-08-19 02:11:30', '2026-08-19 03:44:23'),
(37, NULL, 7, 'SUTARDI', '081388099579', '', '2026-2031', 'rt-1787111335714-773434193.webp', '2026-08-19 02:11:48', '2026-08-19 03:48:55'),
(38, NULL, 8, 'SLAMET R', '082261501129', '', '2026-2031', 'rt-1787114136035-389224067.webp', '2026-08-19 02:12:06', '2026-08-19 04:35:36'),
(39, NULL, 9, 'HARTONO', '081386735995', '', '2026-2031', 'rt-1787112266705-860638013.webp', '2026-08-19 02:12:24', '2026-08-19 04:04:26'),
(40, NULL, 10, 'SUJAI', '085591914220', '', '2026-2031', 'rt-1787116329508-350332164.webp', '2026-08-19 02:12:44', '2026-08-19 05:12:09'),
(41, NULL, 11, 'MARTONO', '08158860425', '', '2026-2031', 'rt-1787115282313-577030121.webp', '2026-08-19 02:13:08', '2026-08-19 04:54:42');

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
(11, 'ruslan gani', '2026-2011', '', '', NULL, 0, '2026-08-19 01:58:37', '2026-08-19 02:01:58'),
(12, 'H. sunarno', '2011-2016', '', '', NULL, 0, '2026-08-19 01:59:15', '2026-08-19 01:59:15'),
(13, 'H. aqsa', '2016-2019', '', '', NULL, 0, '2026-08-19 02:00:31', '2026-08-19 02:41:26'),
(14, 'drs sutarjo', '2020-2025', '', '', NULL, 0, '2026-08-19 02:01:24', '2026-08-19 02:40:58'),
(15, 'kaswadi', '2026-2031', '082112065544', '', 'rw-1787116146613-931927457.webp', 1, '2026-08-19 02:01:47', '2026-08-19 05:09:06');

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
  ADD UNIQUE KEY `nomor_rt` (`nomor_rt`),
  ADD KEY `fk_rt_user` (`user_id`);

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `layanan_wa`
--
ALTER TABLE `layanan_wa`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `rt_details`
--
ALTER TABLE `rt_details`
  ADD CONSTRAINT `fk_rt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `rt_photos`
--
ALTER TABLE `rt_photos`
  ADD CONSTRAINT `rt_photos_ibfk_1` FOREIGN KEY (`rt_id`) REFERENCES `rt_details` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
