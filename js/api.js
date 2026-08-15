/**
 * Global Configuration Endpoint API Proyek
 */
const BASE_URL = "http://localhost:3000"; // URL Backend Ngrok

const ASSET_URL = window.location.origin;

const API = {
  BASE_URL,

  // Auth Endpoint
  LOGIN: `${BASE_URL}/api/login`,
  LOGOUT: `${BASE_URL}/api/logout`,
  CHECK_AUTH: `${BASE_URL}/api/admin/dashboard-data`,

  // Admin RT Endpoint
  RT: {
    GET_PUBLIC: `${BASE_URL}/api/public/rt`, // Tambahkan ini
    GET_ALL: `${BASE_URL}/api/admin/rt`,
    SAVE: `${BASE_URL}/api/admin/rt`,
    DELETE: (id) => `${BASE_URL}/api/admin/rt/${id}`,
  },
  RW: {
    GET_PUBLIC: `${BASE_URL}/api/public/rw`, // Tambahkan ini
    GET_ALL: `${BASE_URL}/api/admin/rw`,
    SAVE: `${BASE_URL}/api/admin/rw`,
    DELETE: (id) => `${BASE_URL}/api/admin/rw/${id}`,
  },
  // Endpoint Berita & Pengumuman
  BERITA: {
    GET_PUBLIC: `${BASE_URL}/api/public/berita`, // Endpoint untuk Publik
    GET_ALL: `${BASE_URL}/api/admin/berita`,
    SAVE: `${BASE_URL}/api/admin/berita`,
    DELETE: (id) => `${BASE_URL}/api/admin/berita/${id}`,
  },
  // Tambahkan di dalam const API = { ... }
  GALERI: {
    GET_PUBLIC: `${BASE_URL}/api/public/galeri`, // Endpoint untuk Publik
    GET_ALL: `${BASE_URL}/api/admin/galeri`,
    SAVE: `${BASE_URL}/api/admin/galeri`,
    DELETE: (id) => `${BASE_URL}/api/admin/galeri/${id}`,
  },
  LAYANAN: {
    GET_PUBLIC: `${BASE_URL}/api/public/layanan`,
    GET_ALL: `${BASE_URL}/api/admin/layanan`,
    SAVE: `${BASE_URL}/api/admin/layanan`,
    DELETE: (id) => `${BASE_URL}/api/admin/layanan/${id}`,
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
