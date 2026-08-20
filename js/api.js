/**
 * Global Configuration Endpoint API Proyek
 */

// 1. Deteksi otomatis Environment (Local vs Ngrok/Hosting)
const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);

const BASE_URL = isLocal
  ? "http://localhost:3000" // URL Backend Localhost
  : "https://tamela-hoary-sid.ngrok-free.dev"; // URL Backend Ngrok/Hosting

const ASSET_URL = window.location.origin;

const API = {
  BASE_URL,

  // Auth Endpoint
  LOGIN: `${BASE_URL}/api/login`,
  LOGOUT: `${BASE_URL}/api/logout`,
  CHECK_AUTH: `${BASE_URL}/api/admin/dashboard-data`,

  // Admin RT Endpoint
  RT: {
    GET_PUBLIC: `${BASE_URL}/api/public/rt`,
    GET_ALL: `${BASE_URL}/api/admin/rt`,
    SAVE: `${BASE_URL}/api/admin/rt`,
    DELETE: (id) => `${BASE_URL}/api/admin/rt/${id}`,
  },
  RW: {
    GET_PUBLIC: `${BASE_URL}/api/public/rw`,
    GET_ALL: `${BASE_URL}/api/admin/rw`,
    SAVE: `${BASE_URL}/api/admin/rw`,
    DELETE: (id) => `${BASE_URL}/api/admin/rw/${id}`,
  },
  // Endpoint Berita & Pengumuman
  BERITA: {
    GET_PUBLIC: `${BASE_URL}/api/public/berita`,
    GET_ALL: `${BASE_URL}/api/admin/berita`,
    SAVE: `${BASE_URL}/api/admin/berita`,
    DELETE: (id) => `${BASE_URL}/api/admin/berita/${id}`,
  },
  // Endpoint Galeri
  GALERI: {
    GET_PUBLIC: `${BASE_URL}/api/public/galeri`,
    GET_ALL: `${BASE_URL}/api/admin/galeri`,
    SAVE: `${BASE_URL}/api/admin/galeri`,
    DELETE: (id) => `${BASE_URL}/api/admin/galeri/${id}`,
  },
  // Endpoint Layanan
  LAYANAN: {
    GET_PUBLIC: `${BASE_URL}/api/public/layanan`,
    GET_ALL: `${BASE_URL}/api/admin/layanan`,
    SAVE: `${BASE_URL}/api/admin/layanan`,
    DELETE: (id) => `${BASE_URL}/api/admin/layanan/${id}`,
  },
  // Endpoint Surat
  SURAT: {
    SUBMIT_PUBLIC: `${BASE_URL}/api/public/surat-pengantar`,
    GET_QUEUE_RT: `${BASE_URL}/api/rt/surat-antrean`,
    APPROVE_RT: (id) => `${BASE_URL}/api/rt/surat/${id}/approve`,
    REJECT_RT: (id) => `${BASE_URL}/api/rt/surat/${id}/reject`,
    GET_QUEUE_RW: `${BASE_URL}/api/rw/surat-antrean`,
    APPROVE_RW: (id) => `${BASE_URL}/api/rw/surat/${id}/approve`,
    REJECT_RW: (id) => `${BASE_URL}/api/rw/surat/${id}/reject`,
  },
};

// Global Helper Fetcher Wrapper
async function apiFetch(url, options = {}) {
  const config = {
    mode: "cors",
    credentials: "include",
    ...options,
    headers: {
      "ngrok-skip-browser-warning": "69420",
      ...options.headers,
    },
  };

  return fetch(url, config);
}

window.API = API;
window.apiFetch = apiFetch;