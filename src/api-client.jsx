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
  const isFormData = typeof FormData !== "undefined" && o.body instanceof FormData;
  // FormData (upload file thật) không được JSON.stringify — và KHÔNG tự set
  // Content-Type, để trình duyệt tự thêm multipart boundary.
  const headers = Object.assign(isFormData ? {} : { "Content-Type": "application/json" }, o.headers || {});
  const token = getToken();
  if (token) headers.Authorization = "Bearer " + token;

  const res = await fetch(API_BASE + path, {
    method: o.method || "GET",
    headers,
    body: o.body == null ? undefined : isFormData ? o.body : JSON.stringify(o.body),
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
  return { nhanVien: data.nhanVien, mustChangePassword: !!data.mustChangePassword };
}

function doiMatKhau(matKhauCu, matKhauMoi) {
  return request("/api/auth/doi-mat-khau", { method: "POST", body: { matKhauCu, matKhauMoi } });
}

const hoSo = {
  list: (params) => request("/api/ho-so" + (params ? "?" + new URLSearchParams(params).toString() : "")),
  get: (id) => request(`/api/ho-so/${id}`),
  create: (body) => request("/api/ho-so", { method: "POST", body }),
  chuyenTrangThai: (id, trangThai) => request(`/api/ho-so/${id}/chuyen-trang-thai`, { method: "POST", body: { trangThai } }),
  capSo: (id, body) => request(`/api/ho-so/${id}/cap-so`, { method: "POST", body }),
  finalize: (id, body) => request(`/api/ho-so/${id}/finalize`, { method: "POST", body }),
  fileScan: (id, body) => request(`/api/ho-so/${id}/file-scan`, { method: "POST", body }),
  saveNoiDung: (id, noiDung) => request(`/api/ho-so/${id}/noi-dung`, { method: "PATCH", body: { noiDung } }),
  khoaSoanThao: (id, force) => request(`/api/ho-so/${id}/khoa-soan-thao`, { method: "POST", body: { force: !!force } }),
  moKhoaSoanThao: (id) => request(`/api/ho-so/${id}/mo-khoa-soan-thao`, { method: "POST" }),
  tatToanNo: (id) => request(`/api/ho-so/${id}/tat-toan-no`, { method: "POST" }),
  soCcHint: () => request("/api/ho-so/so-cc-hint"),
  fastTrack: (body) => request("/api/ho-so/fast-track", { method: "POST", body }),
};

const bieuMau = {
  list: () => request("/api/bieu-mau"),
  create: (body) => request("/api/bieu-mau", { method: "POST", body }),
  update: (id, body) => request(`/api/bieu-mau/${id}`, { method: "PATCH", body }),
  remove: (id) => request(`/api/bieu-mau/${id}`, { method: "DELETE" }),
  parseDocx: (formData) => request("/api/bieu-mau/parse-docx", { method: "POST", body: formData }),
};

const hoaDon = {
  list: () => request("/api/hoa-don"),
  create: (body) => request("/api/hoa-don", { method: "POST", body }),
};

const khachHang = {
  list: (q) => request("/api/khach-hang" + (q ? "?q=" + encodeURIComponent(q) : "")),
  create: (body) => request("/api/khach-hang", { method: "POST", body }),
};

const nhanVien = {
  list: (vaiTro) => request("/api/nhan-vien" + (vaiTro ? "?vaiTro=" + encodeURIComponent(vaiTro) : "")),
  create: (body) => request("/api/nhan-vien", { method: "POST", body }),
  khoa: (id) => request(`/api/nhan-vien/${id}/khoa`, { method: "POST" }),
  datLaiMatKhau: (id) => request(`/api/nhan-vien/${id}/dat-lai-mat-khau`, { method: "POST" }),
  updateMe: (body) => request("/api/nhan-vien/me", { method: "PATCH", body }),
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

const thongBao = {
  list: () => request("/api/thong-bao"),
  markRead: () => request("/api/thong-bao/danh-dau-da-doc", { method: "POST" }),
};

// Thiết kế luồng (Quản trị hệ thống) — chỉ cấu hình mô tả bước + danh sách
// giấy tờ cần nhập theo nhóm biểu mẫu, KHÔNG phải trạng thái/RBAC thật.
const luongNghiepVu = {
  list: () => request("/api/luong-nghiep-vu"),
  create: (body) => request("/api/luong-nghiep-vu", { method: "POST", body }),
  update: (id, body) => request(`/api/luong-nghiep-vu/${id}`, { method: "PATCH", body }),
  nhanBan: (id) => request(`/api/luong-nghiep-vu/${id}/nhan-ban`, { method: "POST" }),
  kichHoat: (id) => request(`/api/luong-nghiep-vu/${id}/kich-hoat`, { method: "POST" }),
  remove: (id) => request(`/api/luong-nghiep-vu/${id}`, { method: "DELETE" }),
};

// Đẩy thông báo real-time qua WebSocket (server/src/lib/ws-hub.js) — tự kết
// nối lại nếu rớt (backoff cố định, đủ dùng cho công cụ nội bộ 1 văn phòng).
// Trả về hàm hủy đăng ký (đóng socket, dừng tự kết nối lại).
function connectRealtime(onMessage) {
  let ws = null;
  let stopped = false;
  let retryTimer = null;

  const wsBase = API_BASE.replace(/^http/, "ws");
  const connect = () => {
    if (stopped) return;
    const token = getToken();
    if (!token) return;
    ws = new WebSocket(wsBase + "/ws?token=" + encodeURIComponent(token));
    ws.onmessage = (e) => {
      try { onMessage(JSON.parse(e.data)); } catch (err) {}
    };
    ws.onclose = () => { if (!stopped) retryTimer = setTimeout(connect, 3000); };
    ws.onerror = () => { ws.close(); };
  };
  connect();

  return () => {
    stopped = true;
    if (retryTimer) clearTimeout(retryTimer);
    if (ws) ws.close();
  };
}

window.VAApi = { login, logout, doiMatKhau, getToken, getUser, isAuthed, request, hoSo, bieuMau, hoaDon, khachHang, nhanVien, noiLamViec, uyThac, auditLog, thongBao, luongNghiepVu, connectRealtime };
