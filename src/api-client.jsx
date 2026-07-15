/* global window, fetch */
/* Cầu nối duy nhất giữa frontend tĩnh và backend Express thật (server/).
   Thay thế hoàn toàn cơ chế "?role=" giả danh trên URL — vai trò/định danh
   giờ lấy từ JWT thật do server cấp sau khi xác thực mật khẩu.
   Export: window.VAApi = { login, logout, getToken, getUser, isAuthed, request, hoSo, api } */

const API_BASE = window.VA_API_BASE || "http://localhost:4000";
const TOKEN_KEY = "va_token";
const USER_KEY = "va_user";

function getToken() {
  try { return window.localStorage.getItem(TOKEN_KEY); } catch (e) { return null; }
}
function getUser() {
  try { return JSON.parse(window.localStorage.getItem(USER_KEY) || "null"); } catch (e) { return null; }
}
function isAuthed() { return !!getToken() && !!getUser(); }

function setSession(token, nhanVien) {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(nhanVien));
  } catch (e) {}
}

function logout() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  } catch (e) {}
}

/* fetch wrapper: tự gắn Bearer token, tự parse JSON, ném lỗi có message tiếng Việt
   từ server để UI hiển thị thẳng (server luôn trả {error: "..."} khi thất bại). */
async function request(path, opts) {
  const o = opts || {};
  const headers = Object.assign({ "Content-Type": "application/json" }, o.headers || {});
  const token = getToken();
  if (token) headers.Authorization = "Bearer " + token;

  const res = await fetch(API_BASE + path, {
    method: o.method || "GET",
    headers,
    body: o.body != null ? JSON.stringify(o.body) : undefined,
  });

  if (res.status === 401) { logout(); }

  let data = null;
  try { data = await res.json(); } catch (e) {}
  if (!res.ok) {
    const err = new Error((data && data.error) || `Lỗi máy chủ (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function login(taiKhoan, matKhau) {
  const data = await request("/api/auth/login", { method: "POST", body: { taiKhoan, matKhau } });
  setSession(data.token, data.nhanVien);
  return data.nhanVien;
}

const hoSo = {
  list: (params) => request("/api/ho-so" + (params ? "?" + new URLSearchParams(params).toString() : "")),
  get: (id) => request(`/api/ho-so/${id}`),
  create: (body) => request("/api/ho-so", { method: "POST", body }),
  chuyenTrangThai: (id, trangThai) => request(`/api/ho-so/${id}/chuyen-trang-thai`, { method: "POST", body: { trangThai } }),
  capSo: (id, body) => request(`/api/ho-so/${id}/cap-so`, { method: "POST", body }),
  finalize: (id, body) => request(`/api/ho-so/${id}/finalize`, { method: "POST", body }),
  fileScan: (id, body) => request(`/api/ho-so/${id}/file-scan`, { method: "POST", body }),
};

const bieuMau = {
  list: () => request("/api/bieu-mau"),
};

const nhanVien = {
  list: (vaiTro) => request("/api/nhan-vien" + (vaiTro ? "?vaiTro=" + encodeURIComponent(vaiTro) : "")),
  create: (body) => request("/api/nhan-vien", { method: "POST", body }),
  khoa: (id) => request(`/api/nhan-vien/${id}/khoa`, { method: "POST" }),
  datLaiMatKhau: (id) => request(`/api/nhan-vien/${id}/dat-lai-mat-khau`, { method: "POST" }),
};

const noiLamViec = {
  list: () => request("/api/noi-lam-viec"),
  create: (body) => request("/api/noi-lam-viec", { method: "POST", body }),
  update: (id, body) => request(`/api/noi-lam-viec/${id}`, { method: "PATCH", body }),
};

const uyThac = {
  list: () => request("/api/uy-thac"),
  create: (body) => request("/api/uy-thac", { method: "POST", body }),
  update: (id, body) => request(`/api/uy-thac/${id}`, { method: "PATCH", body }),
  thuHoi: (id) => request(`/api/uy-thac/${id}/thu-hoi`, { method: "POST" }),
};

const auditLog = {
  list: (params) => request("/api/audit-log" + (params ? "?" + new URLSearchParams(params).toString() : "")),
};

window.VAApi = { login, logout, getToken, getUser, isAuthed, request, hoSo, bieuMau, nhanVien, noiLamViec, uyThac, auditLog };
