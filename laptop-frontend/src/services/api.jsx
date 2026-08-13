// api.js
import axios from "axios";

// ✅ API host strategy that works BOTH on desktop and mobile without
// changing the backend:
//  - Desktop (localhost / 127.0.0.1): calls the backend directly on port 8000.
//  - Mobile / LAN IP (e.g. 192.168.1.5): uses the same origin (Vite port 5173)
//    and the Vite dev proxy forwards /api and /storage to 127.0.0.1:8000.
const getApiPrefix = () => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return ""; // relative → same origin → Vite proxy
    }
  }
  return "http://127.0.0.1:8000";
};

const API_PREFIX = getApiPrefix();

// ✅ CORRECT BASE URL for Laravel backend
export const API_BASE_URL = `${API_PREFIX}/api/`;

// ✅ Fallback image
export const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f";

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// ✅ Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Media resolver - FIXED
export const resolveMediaUrl = (src) => {
  if (!src) return FALLBACK_IMAGE;
  if (src.startsWith("http")) return src;
  if (src.startsWith("data:image")) return src;
  const normalized = String(src).replace(/^\//, "");
  if (normalized.startsWith("storage/")) {
    return `${API_PREFIX}/${normalized}`;
  }
  return `${API_BASE_URL}${normalized}`;
};

// ✅ Keep old name as alias
export const resolveImageUrl = resolveMediaUrl;

// ✅ Resolve the active store company id.
// Uses the saved company from localStorage when available, otherwise fetches
// the first active company from the backend and caches it. This makes every
// storefront query hit the company that actually has products/banners.
let _activeCompanyPromise = null;

export const getActiveCompanyId = () => {
  if (_activeCompanyPromise) return _activeCompanyPromise;

  _activeCompanyPromise = api
    .get("/company/get_companies")
    .then((res) => {
      const payload = res.data?.data || res.data;
      const list = Array.isArray(payload) ? payload : payload?.data || [];
      const saved = parseInt(localStorage.getItem("selected_company_id"), 10);
      const savedCompany =
        saved > 0 ? list.find((c) => Number(c.id) === saved) : null;
      const company =
        savedCompany ||
        list.find((c) => String(c.status || "active") === "active") ||
        list[0];
      const id = company?.id ? Number(company.id) : 1;
      if (company?.id) {
        localStorage.setItem("selected_company_id", String(company.id));
      }
      return id;
    })
    .catch((err) => {
      console.error("Failed to resolve active company:", err);
      return 1;
    })
    .finally(() => {
      _activeCompanyPromise = null;
    });

  return _activeCompanyPromise;
};

export default api;