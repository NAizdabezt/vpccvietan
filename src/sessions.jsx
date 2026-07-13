/* global React, window */
/* ============================================================================
   VPCC Việt An — Luồng tổng quan phiên + Tra cứu hồ sơ hoàn thành
   Mô-đun dùng chung cho mọi phân quyền (trừ Quản trị viên):
   - Công chứng viên / Thư ký nghiệp vụ (index.html)
   - Thu ngân (Thu ngân.html) · Kế toán (Kế toán.html)
   - Lưu trữ viên (Lưu trữ - Số hóa.html)
   Export: window.VASessions = { OverviewScreen, CompletedScreen, SESSION_STATUS }
   ========================================================================== */
const { useState: useSx, useMemo: useMemoSx } = React;

/* ---- Hôm nay (demo cố định) ---- */
const VA_TODAY = "2026-06-14";

/* ---- Bộ trạng thái phiên (đã nghiên cứu lại) ----
   Thứ tự pipeline: nháp → soạn → cấp số&thu phí → chốt số CC → gắn file → hoàn thành
   c = màu nhận diện riêng cho từng trạng thái. */
const SESSION_STATUS = {
  draft:         { label: "Lưu nháp",               short: "Nháp",        icon: "FileText",    c: "#64748b", step: 0 },
  drafting:      { label: "Đang soạn thảo",         short: "Soạn thảo",   icon: "PenLine",     c: "#d97706", step: 1 },
  waitNumberPay: { label: "Chờ cấp số & thu phí",   short: "Cấp số/phí",  icon: "Hash",        c: "#2563eb", step: 2 },
  waitFinalize:  { label: "Chờ chốt số công chứng", short: "Chốt số CC",  icon: "BadgeCheck",  c: "#7c3aed", step: 3 },
  waitAttach:    { label: "Chờ gắn file",           short: "Gắn file",    icon: "Paperclip",   c: "#0891b2", step: 4 },
  done:          { label: "Hoàn thành",             short: "Hoàn thành",  icon: "CircleCheck", c: "#16a34a", step: 5 },
};
const STATUS_ORDER = ["draft", "drafting", "waitNumberPay", "waitFinalize", "waitAttach", "done"];
const CARRYOVER_C = "#dc2626";

/* ---- Dữ liệu phiên (gồm hôm nay + tồn đọng + đã hoàn thành) ----
   date: ISO để tính tồn đọng · createdAt/updatedAt: chuỗi hiển thị
   notary: "" nếu chưa gán CCV (sẽ ghi nhận khi CCV chụp & gắn file) */
const VA_ALL_SESSIONS = [
  /* ----- HÔM NAY 14/06/2026 ----- */
  { id: "PGD-2026-0614-031", customer: "VŨ THỊ KIM ANH",      date: "2026-06-14", createdAt: "14/06/2026 · 08:12", updatedAt: "14/06/2026 · 09:40", status: "drafting",      creator: "Trần Thị Mỹ Linh", lockedBy: "Trần Thị Mỹ Linh", lockedAt: "14/06/2026 · 09:40", secretary: "Trần Thị Mỹ Linh", notary: "", types: ["HĐ Chuyển nhượng QSDĐ"], photos: 0 },
  { id: "PGD-2026-0614-029", customer: "HOÀNG MINH ĐỨC",      date: "2026-06-14", createdAt: "14/06/2026 · 08:25", updatedAt: "14/06/2026 · 08:31", status: "draft",         creator: "Phan Thanh Hải",   secretary: "Phan Thanh Hải",  notary: "", types: ["Văn bản ủy quyền"], photos: 0 },
  { id: "PGD-2026-0614-027", customer: "ĐẶNG THU TRANG",      date: "2026-06-14", createdAt: "14/06/2026 · 08:48", updatedAt: "14/06/2026 · 09:05", status: "waitNumberPay", creator: "Trần Thị Mỹ Linh", secretary: "Trần Thị Mỹ Linh", notary: "CCV Nguyễn Quốc Việt", types: ["HĐ Mua bán xe"], photos: 0 },
  { id: "PGD-2026-0614-024", customer: "BÙI VĂN KHÔI",        date: "2026-06-14", createdAt: "14/06/2026 · 09:02", updatedAt: "14/06/2026 · 09:33", status: "waitFinalize",  creator: "Phan Thanh Hải",   secretary: "Phan Thanh Hải",  notary: "CCV Lê Thị Hằng", types: ["HĐ Tặng cho QSDĐ"], photos: 0, ccNumber: "0036-001965-2026" },
  { id: "PGD-2026-0614-019", customer: "LƯƠNG THẾ VINH",       date: "2026-06-14", createdAt: "14/06/2026 · 09:30", updatedAt: "14/06/2026 · 10:05", status: "waitFinalize",  creator: "Võ Ngọc Hân",      secretary: "Võ Ngọc Hân",     notary: "", types: ["HĐ Chuyển nhượng QSDĐ"], photos: 1, ccNumber: "0036-001974-2026" },
  { id: "PGD-2026-0614-021", customer: "PHẠM THỊ BÍCH HẰNG",  date: "2026-06-14", createdAt: "14/06/2026 · 09:14", updatedAt: "14/06/2026 · 09:52", status: "waitAttach",    creator: "Trần Thị Mỹ Linh", secretary: "Trần Thị Mỹ Linh", notary: "CCV Nguyễn Quốc Việt", types: ["HĐ Chuyển nhượng QSDĐ"], photos: 0, ccNumber: "0036-001972-2026" },
  { id: "PGD-2026-0614-016", customer: "NGÔ GIA BẢO",         date: "2026-06-14", createdAt: "14/06/2026 · 09:20", updatedAt: "14/06/2026 · 09:58", status: "waitAttach",    creator: "Võ Ngọc Hân",      secretary: "Võ Ngọc Hân",     notary: "CCV Lê Thị Hằng", types: ["Văn bản ủy quyền"], photos: 0, ccNumber: "0036-001969-2026" },
  { id: "PGD-2026-0614-011", customer: "ĐỖ MẠNH CƯỜNG",       date: "2026-06-14", createdAt: "14/06/2026 · 08:05", updatedAt: "14/06/2026 · 09:10", status: "done",          creator: "Phan Thanh Hải",   secretary: "Phan Thanh Hải",  notary: "CCV Nguyễn Quốc Việt", types: ["HĐ Mua bán xe"], photos: 2, ccNumber: "0036-001961-2026", completedAt: "14/06/2026 · 09:10" },

  /* ----- TỒN ĐỌNG (chưa hoàn thành từ các hôm trước) ----- */
  { id: "PGD-2026-0613-044", customer: "TRƯƠNG CÔNG ĐỊNH",    date: "2026-06-13", createdAt: "13/06/2026 · 16:05", updatedAt: "13/06/2026 · 16:40", status: "waitAttach",    creator: "Trần Thị Mỹ Linh", secretary: "Trần Thị Mỹ Linh", notary: "CCV Nguyễn Quốc Việt", types: ["HĐ Tặng cho QSDĐ"], photos: 0, ccNumber: "0036-001948-2026" },
  { id: "PGD-2026-0612-038", customer: "LÝ HẢI YẾN",          date: "2026-06-12", createdAt: "12/06/2026 · 14:18", updatedAt: "12/06/2026 · 15:02", status: "waitFinalize",  creator: "Phan Thanh Hải",   secretary: "Phan Thanh Hải",  notary: "CCV Trần Đình Phúc", types: ["Văn bản ủy quyền"], photos: 0, ccNumber: "0036-001955-2026" },
  { id: "PGD-2026-0611-021", customer: "MAI THANH SƠN",       date: "2026-06-11", createdAt: "11/06/2026 · 10:22", updatedAt: "11/06/2026 · 11:15", status: "drafting",      creator: "Phần Thanh Hải",   secretary: "Võ Ngọc Hân",     notary: "", types: ["HĐ Chuyển nhượng QSDĐ"], photos: 0 },
  { id: "PGD-2026-0610-024", customer: "TRẦN QUỐC TOẢN",      date: "2026-06-10", createdAt: "10/06/2026 · 09:35", updatedAt: "10/06/2026 · 10:48", status: "waitNumberPay", creator: "Võ Ngọc Hân",      secretary: "Võ Ngọc Hân",     notary: "CCV Lê Thị Hằng", types: ["HĐ Mua bán xe"], photos: 0 },

  /* ----- ĐÃ HOÀN THÀNH (các hôm trước) — cho tab Tra cứu ----- */
  { id: "PGD-2026-0613-031", customer: "NGUYỄN VĂN THÀNH",    date: "2026-06-13", createdAt: "13/06/2026 · 09:02", updatedAt: "13/06/2026 · 11:20", status: "done", creator: "Trần Thị Mỹ Linh", secretary: "Trần Thị Mỹ Linh", notary: "CCV Nguyễn Quốc Việt", types: ["HĐ Chuyển nhượng QSDĐ", "Văn bản ủy quyền"], photos: 2, ccNumber: "0036-001950-2026", completedAt: "13/06/2026 · 11:20" },
  { id: "PGD-2026-0612-019", customer: "LÊ THỊ HỒNG NHUNG",   date: "2026-06-12", createdAt: "12/06/2026 · 10:11", updatedAt: "12/06/2026 · 11:05", status: "done", creator: "Phan Thanh Hải", secretary: "Phan Thanh Hải", notary: "CCV Lê Thị Hằng", types: ["HĐ Mua bán xe"], photos: 1, ccNumber: "0036-001902-2026", completedAt: "12/06/2026 · 11:05" },
  { id: "PGD-2026-0611-014", customer: "PHẠM MINH KHÔI",      date: "2026-06-11", createdAt: "11/06/2026 · 14:30", updatedAt: "11/06/2026 · 16:12", status: "done", creator: "Trần Thị Mỹ Linh", secretary: "Trần Thị Mỹ Linh", notary: "CCV Trần Đình Phúc", types: ["HĐ Tặng cho QSDĐ"], photos: 2, ccNumber: "0036-001870-2026", completedAt: "11/06/2026 · 16:12" },
  { id: "PGD-2026-0610-009", customer: "VŨ THỊ LAN",          date: "2026-06-10", createdAt: "10/06/2026 · 08:40", updatedAt: "10/06/2026 · 09:55", status: "done", creator: "Võ Ngọc Hân",    secretary: "Võ Ngọc Hân",    notary: "CCV Nguyễn Quốc Việt", types: ["Văn bản ủy quyền"], photos: 1, ccNumber: "0036-001805-2026", completedAt: "10/06/2026 · 09:55" },
  { id: "PGD-2026-0609-022", customer: "HUỲNH GIA HÂN",       date: "2026-06-09", createdAt: "09/06/2026 · 13:18", updatedAt: "09/06/2026 · 15:02", status: "done", creator: "Phan Thanh Hải", secretary: "Phan Thanh Hải", notary: "CCV Lê Thị Hằng", types: ["HĐ Chuyển nhượng QSDĐ"], photos: 2, ccNumber: "0036-001740-2026", completedAt: "09/06/2026 · 15:02" },
  { id: "PGD-2026-0606-031", customer: "ĐINH CÔNG TRÁNG",     date: "2026-06-06", createdAt: "06/06/2026 · 10:05", updatedAt: "06/06/2026 · 11:48", status: "done", creator: "Trần Thị Mỹ Linh", secretary: "Trần Thị Mỹ Linh", notary: "CCV Trần Đình Phúc", types: ["HĐ Thế chấp QSDĐ"], photos: 1, ccNumber: "0036-001688-2026", completedAt: "06/06/2026 · 11:48" },
];

/* ---- Hồ sơ nhân sự (dùng cho menu "Hồ sơ cá nhân" & ký tự định danh) ----
   ident: ký tự định danh in ở cuối văn bản; chỉ CCV/TKNV mới có. */
const VA_PROFILES = {
  "viet.nq": { key: "viet.nq", name: "Nguyễn Quốc Việt", title: "Công chứng viên", role: "ccv", dob: "02/09/1980", cccd: "079080001122", phone: "0903 818 282", email: "viet.nq@vietan.vn", joined: "03/2016", account: "viet.nq", password: "Vietan@2026", defIdent: "NQV", hasIdent: true },
  "linh.tt": { key: "linh.tt", name: "Trần Thị Mỹ Linh", title: "Thư ký nghiệp vụ", role: "tknv", dob: "18/05/1992", cccd: "079192004455", phone: "0938 224 117", email: "linh.tt@vietan.vn", joined: "07/2019", account: "linh.tt", password: "Vietan@2026", defIdent: "LML", hasIdent: true },
  "ha.ptt":  { key: "ha.ptt",  name: "Phạm Thị Thu Hà", title: "Thu ngân", role: "cashier", dob: "11/11/1990", cccd: "079190006677", phone: "0905 332 118", email: "ha.ptt@vietan.vn", joined: "05/2020", account: "ha.ptt", password: "Vietan@2026", hasIdent: false },
  "ke.dv":   { key: "ke.dv",   name: "Đỗ Văn Kế", title: "Kế toán", role: "acct", dob: "24/03/1986", cccd: "079086002233", phone: "0913 558 240", email: "ke.dv@vietan.vn", joined: "09/2018", account: "ke.dv", password: "Vietan@2026", hasIdent: false },
  "tuan.hm": { key: "tuan.hm", name: "Hoàng Minh Tuấn", title: "Lưu trữ viên", role: "arc", dob: "07/12/1994", cccd: "079094008899", phone: "0978 110 552", email: "tuan.hm@vietan.vn", joined: "02/2021", account: "tuan.hm", password: "Vietan@2026", hasIdent: false },
};
/* Danh sách CCV/TKNV để chọn "người soạn" ở bước In & chuyển */
const VA_DRAFTERS = [
  { name: "CCV Nguyễn Quốc Việt", ident: "NQV", role: "ccv" },
  { name: "CCV Lê Thị Hằng", ident: "LTH", role: "ccv" },
  { name: "CCV Trần Đình Phúc", ident: "TDP", role: "ccv" },
  { name: "Trần Thị Mỹ Linh", ident: "LML", role: "tknv" },
  { name: "Phan Thanh Hải", ident: "PTH", role: "tknv" },
  { name: "Võ Ngọc Hân", ident: "VNH", role: "tknv" },
];

/* ---- Ký tự định danh: lưu localStorage để dùng xuyên suốt ---- */
function getIdent(profile) {
  if (!profile) return "";
  try { const v = window.localStorage.getItem("va_ident::" + profile.account); if (v != null) return v; } catch (e) {}
  return profile.defIdent || "";
}
function setIdent(profile, val) {
  try { window.localStorage.setItem("va_ident::" + profile.account, val); } catch (e) {}
}
function identForName(name) {
  const d = VA_DRAFTERS.find((x) => x.name === name);
  return d ? d.ident : (name || "").split(" ").map((w) => w[0]).slice(-3).join("").toUpperCase();
}

/* ---- Khóa phiên: store localStorage (ghi nhận ai đang mở để chỉnh sửa) ---- */
function readLocks() {
  try { return JSON.parse(window.localStorage.getItem("va_session_locks") || "{}"); } catch (e) { return {}; }
}
function writeLocks(obj) { try { window.localStorage.setItem("va_session_locks", JSON.stringify(obj)); } catch (e) {} }
/* 1 tài khoản chỉ được khóa 1 phiên: mở phiên mới tự động nhả khóa cũ của người đó. */
function lockSession(id, who) {
  const l = readLocks();
  Object.keys(l).forEach((k) => { if (l[k] && l[k].who === who && k !== id) delete l[k]; });
  l[id] = { who, at: vaNow() };
  writeLocks(l);
}
function unlockSession(id) { const l = readLocks(); delete l[id]; writeLocks(l); }

/* ============================================================================
   Hộp thư YÊU CẦU HIỆU CHỈNH (store localStorage dùng chung)
   - Lưu trữ gửi yêu cầu sửa Số CC / hủy số / in & ký lại trên hồ sơ đã hoàn thành.
   - Định tuyến về CCV đã KÝ hồ sơ đó (trường notary). Mọi quyết định ghi Audit Trail.
   ========================================================================== */
const CORR_KEY = "va_correction_requests";
const CORR_LABEL = { B: "Sửa Số CC", C: "Hủy số (lưu vết)", D: "In & ký số lại" };
/* CCV vắng mặt / đã nghỉ — yêu cầu của họ chuyển cho CCV phụ trách thấy thêm */
const CCV_ABSENT = ["CCV Trần Đình Phúc"];
function readCorrReqs() {
  try { return JSON.parse(window.localStorage.getItem(CORR_KEY) || "null") || null; } catch (e) { return null; }
}
function writeCorrReqs(arr) { try { window.localStorage.setItem(CORR_KEY, JSON.stringify(arr)); } catch (e) {} }
/* Seed demo lần đầu — 3 yêu cầu chờ duyệt định tuyến tới CCV Nguyễn Quốc Việt + 1 của CCV vắng mặt */
const CORR_SEED = [
  { id: "YC-2026-0614-07", sessionId: "PGD-2026-0613-031", customer: "NGUYỄN VĂN THÀNH", type: "B", ccNumber: "0036-001950-2026", proposalCC: "0036-001990-2026", notary: "CCV Nguyễn Quốc Việt", by: "Hoàng Minh Tuấn", reason: "Khách báo sai năm sinh trên hợp đồng đã ký, cần cấp số thay thế sau khi soạn lại bản đúng.", at: "14/06/2026 · 08:40", status: "pending" },
  { id: "YC-2026-0614-09", sessionId: "PGD-2026-0610-009", customer: "VŨ THỊ LAN", type: "C", ccNumber: "0036-001805-2026", notary: "CCV Nguyễn Quốc Việt", by: "Hoàng Minh Tuấn", reason: "Hồ sơ trùng số do thao tác cấp số hai lần; đề nghị hủy số này để giữ liền mạch dải.", at: "14/06/2026 · 09:05", status: "pending" },
  { id: "YC-2026-0613-22", sessionId: "PGD-2026-0606-031", customer: "ĐINH CÔNG TRÁNG", type: "D", ccNumber: "0036-001688-2026", proposalDetail: "Bản scan trang 2 bị mờ phần chữ ký bên B; chữ ký số báo lỗi sai định dạng khi mở.", notary: "CCV Trần Đình Phúc", by: "Hoàng Minh Tuấn", reason: "Bản scan mờ, chữ ký số lỗi định dạng — cần in lại và ký số lại toàn bộ.", at: "13/06/2026 · 16:20", status: "pending" },
];
function getCorrReqs() {
  let arr = readCorrReqs();
  if (arr == null) { arr = CORR_SEED.map((r) => ({ ...r, audit: [{ at: r.at, by: r.by, action: "Gửi yêu cầu " + (CORR_LABEL[r.type] || "hiệu chỉnh") + " cho CCV", detail: r.reason }] })); writeCorrReqs(arr); }
  return arr;
}
function submitCorrReq(req) {
  const arr = getCorrReqs();
  arr.unshift(req);
  writeCorrReqs(arr);
  return arr;
}
function updateCorrReq(id, patch) {
  const arr = getCorrReqs().map((r) => r.id === id ? { ...r, ...patch } : r);
  writeCorrReqs(arr);
  return arr;
}
/* Yêu cầu một CCV được phép thấy: hồ sơ mình ký + (nếu phụ trách) của CCV vắng mặt */
function corrReqsForCcv(ccvName, isCoverage) {
  return getCorrReqs().filter((r) => r.status === "pending" && (r.notary === ccvName || (isCoverage && CCV_ABSENT.includes(r.notary))));
}
/* Dựng kết quả hiệu chỉnh (patch + audit + toast) — dùng chung cho Lưu trữ & CCV duyệt */
function buildCorrectionResult(base, p, who, todayDMY) {
  const now = vaNow();
  const patch = {};
  let audit = null, toast = null;
  if (p.arcRequest) {
    patch.pendingRequest = { type: p.option, reason: p.reason, by: who, at: now };
    audit = { at: now, by: who, action: "Gửi yêu cầu " + ({ B: "sửa Số công chứng", C: "hủy số", D: "in & ký số lại" }[p.option] || "hiệu chỉnh") + " cho CCV", detail: p.reason };
    toast = { tone: "info", title: "Đã gửi yêu cầu cho CCV", message: base.id + " — phiếu yêu cầu đã chuyển Công chứng viên xử lý." };
  } else if (p.option === "A") {
    patch.customer = p.customer || base.customer;
    patch.types = p.typesText.split(",").map((x) => x.trim()).filter(Boolean);
    if (p.fee != null) patch.fee = p.fee;
    if (p.payMethod) patch.payMethod = p.payMethod;
    audit = { at: now, by: who, action: "Hiệu chỉnh thông tin (tên khách / biểu mẫu / số tiền / phương thức)", detail: p.reason };
    toast = { tone: "success", title: "Đã lưu hiệu chỉnh", message: base.id + " — cập nhật thông tin an toàn, không ảnh hưởng Số công chứng." };
  } else if (p.option === "B") {
    patch.oldCcNumber = base.oldCcNumber || base.ccNumber;
    patch.ccNumber = p.newCC;
    patch.ccState = "replaced";
    patch.actualNote = "Ngày công chứng thực tế là ngày " + todayDMY + " — hệ thống đã Re-sync CMC.";
    audit = { at: now, by: who, action: "Sửa Số công chứng → " + p.newCC + " (số cũ " + (base.oldCcNumber || base.ccNumber) + " [Đã hủy – thay thế])", detail: p.reason };
    toast = { tone: "success", title: "Đã sửa Số công chứng", message: base.id + " — số mới " + p.newCC + ", đã sinh ghi chú & Re-sync." };
  } else if (p.option === "C") {
    patch.ccState = "cancelled";
    audit = { at: now, by: who, action: "Hủy số " + base.ccNumber + " (lưu vết — giữ trong dải)", detail: p.reason };
    toast = { tone: "success", title: "Đã hủy số (lưu vết)", message: base.id + " — số " + base.ccNumber + " giữ trong dải, trạng thái [Đã hủy]." };
  } else if (p.option === "D") {
    patch.reprint = true;
    audit = { at: now, by: who, action: "Đánh dấu in & ký số lại — đẩy về pipeline số hóa", detail: p.reason };
    toast = { tone: "success", title: "Đã đẩy về pipeline số hóa", message: base.id + " — gắn cờ in lại → scan → ký số lại." };
  }
  return { patch, audit, toast };
}

/* ---- Phí theo loại biểu mẫu (để dựng phiếu thu từ phiên) ---- */
const VA_FEE_BY_TYPE = {
  "HĐ Chuyển nhượng QSDĐ": 3200000,
  "HĐ Tặng cho QSDĐ": 2800000,
  "HĐ Thế chấp QSDĐ": 4500000,
  "HĐ Mua bán xe": 1200000,
  "Văn bản ủy quyền": 800000,
};
function feeOfType(t) { return VA_FEE_BY_TYPE[t] || 1000000; }
/* Chuyển 1 phiên (overview) → cấu trúc "row" mà phiếu thu POS sử dụng */
function sessionToReceiptRow(s) {
  return {
    id: s.id, sid: s.id, khach: s.customer, addr: s.address || "Văn phòng công chứng Việt An",
    creator: s.secretary || s.creator,
    files: s.types.map((t, i) => ({
      id: s.id + "-h" + i, service: t, kind: "contract",
      soCC: null, fee: feeOfType(t), status: "waiting", debtFile: false, debtMoney: false,
    })),
  };
}

/* ---- Tiện ích ---- */
function vaNormalize(s) {
  return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim();
}
function daysOverdue(isoDate) {
  const a = new Date(isoDate + "T00:00:00");
  const b = new Date(VA_TODAY + "T00:00:00");
  return Math.round((b - a) / 86400000);
}
function vaNow() {
  const d = new Date(); const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} · ${p(d.getHours())}:${p(d.getMinutes())}`;
}
const CCV_ME = "CCV Nguyễn Quốc Việt";

/* ---- Viên trạng thái màu riêng ---- */
function StatusPill({ status, size }) {
  const L = window.LucideReact;
  const m = SESSION_STATUS[status]; if (!m) return null;
  const Icon = L[m.icon];
  const sm = size === "sm";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
      fontSize: sm ? 11.5 : 12.5, fontWeight: 600, lineHeight: 1,
      padding: sm ? "4px 9px" : "5px 11px", borderRadius: "var(--radius-full)",
      color: m.c, background: `color-mix(in srgb, ${m.c} 12%, transparent)`,
      border: `1px solid color-mix(in srgb, ${m.c} 26%, transparent)`,
    }}>
      <Icon size={sm ? 12 : 13} /> {m.label}
    </span>
  );
}

/* ---- Ảnh placeholder (đính kèm hồ sơ) ---- */
function MiniPhoto({ hue, size }) {
  const L = window.LucideReact;
  const px = typeof size === "number" ? size : 80;
  return (
    <div style={{ width: size || 64, height: size || 80, borderRadius: 8, flexShrink: 0, overflow: "hidden", background: `linear-gradient(135deg, hsl(${hue} 32% 82%), hsl(${hue} 28% 62%))`, display: "grid", placeItems: "center", border: "1px solid var(--border-subtle)" }}>
      <L.User size={px / 2.6} color={`hsl(${hue} 40% 36%)`} />
    </div>
  );
}

/* ============================================================================
   Modal: Kế toán xuất hóa đơn điện tử cho phiên (sau khi đã thu phí).
   Mở từ Luồng tổng quan trên phiên Chờ chốt số / Đợi đẩy file / Hoàn thành.
   ========================================================================== */
function InvoiceModal({ session, onClose, onConfirm }) {
  const L = window.LucideReact;
  const { Button } = window.FSICheckinDesignSystem_019df8;
  const amount = session.types.reduce((a, t) => a + feeOfType(t), 0);
  const fmt = (n) => (n || 0).toLocaleString("vi-VN") + "₫";
  const todayStr = (() => { const [y, m, d] = VA_TODAY.split("-"); return d + "/" + m + "/" + y; })();
  const [isCompany, setIsCompany] = useSx(false);
  const [mst, setMst] = useSx("");
  const [issueDate, setIssueDate] = useSx(todayStr);
  const late = session.status === "done" && daysOverdue(session.date) > 1;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(28,28,26,.46)" }} />
      <div style={{ position: "relative", width: 560, maxWidth: "100%", maxHeight: "92%", background: "var(--bg-surface)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: "1px solid var(--border-default)" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-muted)", display: "grid", placeItems: "center" }}><L.FileSpreadsheet size={17} color="var(--accent)" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600 }}>Xuất hóa đơn điện tử</div>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>{session.id} · {session.customer}</div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 30, height: 30, border: "none", background: "transparent", borderRadius: 7, cursor: "pointer", display: "grid", placeItems: "center", color: "var(--text-tertiary)" }}><L.X size={18} /></button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          {late && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 600, color: "#b91c1c", padding: "9px 12px", borderRadius: "var(--radius-md)", background: "color-mix(in srgb, #dc2626 8%, transparent)", border: "1px solid color-mix(in srgb, #dc2626 26%, transparent)" }}>
              <L.AlertTriangle size={15} /> Quá hạn {daysOverdue(session.date)} ngày — chính sách hỗ trợ chậm tối đa 1 ngày. Cần xuất ngay.
            </div>
          )}
          {/* Dịch vụ */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-tertiary)", marginBottom: 8 }}>Nội dung hóa đơn</div>
            <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
              {session.types.map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 13px", borderTop: i ? "1px solid var(--border-subtle)" : "none", fontSize: 13 }}>
                  <span style={{ color: "var(--text-secondary)" }}>{t}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--text-primary)" }}>{fmt(feeOfType(t))}</span>
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 13px", borderTop: "1px solid var(--border-default)", background: "var(--bg-elevated)" }}>
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>Tổng tiền hóa đơn</span>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 16, color: "var(--accent-hover)" }}>{fmt(amount)}</span>
              </div>
            </div>
          </div>

          {/* Thông tin xuất */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Ngày xuất hóa đơn</label>
              <input value={issueDate} onChange={(e) => setIssueDate(e.target.value)}
                style={{ width: "100%", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "8px 11px", fontFamily: "var(--font-mono)", fontSize: 13, background: "var(--bg-inset)", color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }} />
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>{issueDate !== todayStr ? "Xuất lùi ngày" : "Hôm nay"} · GD {todayStr}</div>
            </div>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Mã số thuế (nếu có)</label>
              <input value={mst} onChange={(e) => setMst(e.target.value)} placeholder="Khách lẻ — bỏ trống"
                style={{ width: "100%", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "8px 11px", fontFamily: "var(--font-mono)", fontSize: 13, background: "var(--bg-inset)", color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }} />
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>Có MST sẽ gợi ý gộp hóa đơn doanh nghiệp</div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border-default)", padding: "14px 18px", display: "flex", gap: 10 }}>
          <Button variant="secondary" onClick={onClose}>Để sau</Button>
          <Button variant="primary" icon={L.Send} fullWidth onClick={() => onConfirm({ amount, mst, issueDate })}>Xuất &amp; đẩy EasyInvoice</Button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   Modal: Thu ngân cấp số công chứng & thu phí cho phiên (dùng phiếu thu POS).
   Mở từ Luồng tổng quan trên phiên "Chờ cấp số & thu phí".
   ========================================================================== */
function ChargeModal({ session, onClose, onConfirm }) {
  const L = window.LucideReact;
  const POSR = window.POSReceipt;
  const row = sessionToReceiptRow(session);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(28,28,26,.46)" }} />
      <div style={{ position: "relative", width: 620, maxWidth: "100%", maxHeight: "92%", background: "var(--bg-surface)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: "1px solid var(--border-default)", flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-muted)", display: "grid", placeItems: "center" }}><L.ReceiptText size={17} color="var(--accent)" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600 }}>Cấp số công chứng &amp; thu phí</div>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>{session.id} · {session.customer}</div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 30, height: 30, border: "none", background: "transparent", borderRadius: 7, cursor: "pointer", display: "grid", placeItems: "center", color: "var(--text-tertiary)" }}><L.X size={18} /></button>
        </div>
        {POSR
          ? <POSR.ReceiptForm key={row.id} row={row} onClose={onClose} onConfirm={onConfirm} />
          : <div style={{ padding: 24, fontSize: 13, color: "var(--text-tertiary)" }}>Không tải được phiếu thu.</div>}
      </div>
    </div>
  );
}

/* ============================================================================
   Modal: CCV chụp ảnh tại quầy — gắn vào hồ sơ & tự gán tên CCV phụ trách.
   Dùng cho phiên đang "Chờ cấp số & thu phí" / "Chờ chốt số công chứng".
   ========================================================================== */
function CaptureModal({ session, ccvName, onClose, onConfirm }) {
  const L = window.LucideReact;
  const { Button } = window.FSICheckinDesignSystem_019df8;
  const [shots, setShots] = useSx([]);
  const snap = () => setShots((a) => [...a, Math.floor(Math.random() * 360)]);
  const reassigns = session.notary && session.notary !== ccvName;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 80 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(28,28,26,.46)" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, maxWidth: "94%", background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-xl)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", borderBottom: "1px solid var(--border-default)" }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", background: "var(--accent-muted)" }}><L.Camera size={16} color="var(--accent)" /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600 }}>Chụp ảnh tại quầy &amp; gắn vào hồ sơ</div>
            <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>{session.id} · {session.customer}</div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 30, height: 30, border: "none", background: "transparent", borderRadius: 7, cursor: "pointer", display: "grid", placeItems: "center", color: "var(--text-tertiary)" }}><L.X size={18} /></button>
        </div>
        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ position: "relative", borderRadius: "var(--radius-md)", overflow: "hidden", aspectRatio: "16 / 9", background: "linear-gradient(135deg, #2a2d34, #14161b)", display: "grid", placeItems: "center" }}>
            <div style={{ textAlign: "center", color: "rgba(255,255,255,.7)" }}>
              <L.Video size={28} style={{ marginBottom: 6 }} />
              <div style={{ fontSize: 12.5 }}>Khung hình camera trực tiếp</div>
            </div>
            <span style={{ position: "absolute", top: 10, left: 10, display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "#fff", background: "rgba(22,163,74,.92)", borderRadius: "var(--radius-full)", padding: "3px 9px" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} /> Camera đã kết nối
            </span>
          </div>
          {shots.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {shots.map((h, i) => <MiniPhoto key={i} hue={h} size={60} />)}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: reassigns ? "var(--text-warning)" : "var(--text-secondary)", padding: "9px 12px", borderRadius: "var(--radius-md)", background: reassigns ? "var(--bg-warning)" : "var(--accent-muted)", border: "1px solid " + (reassigns ? "var(--border-warning)" : "var(--accent-border)") }}>
            <L.UserCheck size={15} />
            <span>{reassigns
              ? <>CCV phụ trách sẽ được <b>cập nhật</b> từ “{session.notary.replace(/^CCV /, "")}” thành <b>{ccvName.replace(/^CCV /, "")}</b>.</>
              : <>Hệ thống tự gán CCV phụ trách: <b>{ccvName.replace(/^CCV /, "")}</b> vào hồ sơ.</>}</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="secondary" icon={L.Camera} onClick={snap}>{shots.length > 0 ? "Chụp thêm" : "Chụp ảnh"}</Button>
            <Button variant="primary" icon={L.Paperclip} fullWidth disabled={shots.length === 0} onClick={() => onConfirm(shots.length)}>Gắn {shots.length > 0 ? shots.length + " ảnh " : ""}vào hồ sơ</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   Modal: Số hóa & gắn file vào hồ sơ (Lưu trữ viên) — bước gần cuối.
   Hồ sơ đã có số CC + CCV; chỉ còn quét bản giấy đính kèm để hoàn tất.
   ========================================================================== */
function ScanAttachModal({ session, onClose, onConfirm }) {
  const L = window.LucideReact;
  const { Button } = window.FSICheckinDesignSystem_019df8;
  const [pages, setPages] = useSx(0);
  const scan = () => setPages((p) => p + 1);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 80 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(28,28,26,.46)" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 580, maxWidth: "94%", background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-xl)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", borderBottom: "1px solid var(--border-default)" }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", background: "var(--accent-muted)" }}><L.ScanLine size={16} color="var(--accent)" /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600 }}>Số hóa &amp; gắn file vào hồ sơ</div>
            <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>{session.id} · {session.customer}</div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 30, height: 30, border: "none", background: "transparent", borderRadius: 7, cursor: "pointer", display: "grid", placeItems: "center", color: "var(--text-tertiary)" }}><L.X size={18} /></button>
        </div>
        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px", padding: "12px 14px", background: "var(--bg-overlay)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", fontSize: 12.5 }}>
            <div><span style={{ color: "var(--text-tertiary)" }}>Số công chứng: </span><b style={{ fontFamily: "var(--font-mono)", color: "var(--accent-hover)" }}>{session.ccNumber || "—"}</b></div>
            <div><span style={{ color: "var(--text-tertiary)" }}>Công chứng viên: </span><b>{(session.notary || "—").replace(/^CCV /, "")}</b></div>
          </div>
          <div style={{ borderRadius: "var(--radius-md)", border: "1.5px dashed var(--border-default)", background: "var(--bg-overlay)", padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 64, height: 80, borderRadius: 8, flexShrink: 0, display: "grid", placeItems: "center", background: pages > 0 ? "linear-gradient(135deg, hsl(150 30% 84%), hsl(150 26% 64%))" : "var(--bg-inset)", color: pages > 0 ? "hsl(150 40% 34%)" : "var(--text-tertiary)" }}>
              {pages > 0 ? <L.FileCheck2 size={26} /> : <L.FileScan size={26} />}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{pages > 0 ? pages + " trang đã số hóa" : "Đặt bản giấy lên máy scan"}</div>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2 }}>Quét bản hợp đồng/giấy tờ đã ký để đính kèm vào hồ sơ điện tử.</div>
            </div>
            <Button variant="secondary" size="sm" icon={L.ScanLine} onClick={scan}>{pages > 0 ? "Quét thêm" : "Quét tài liệu"}</Button>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="secondary" onClick={onClose}>Hủy</Button>
            <Button variant="primary" icon={L.Paperclip} fullWidth disabled={pages === 0} onClick={() => onConfirm(pages)}>Gắn vào hồ sơ &amp; hoàn thành</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   Modal: Chi tiết phiên (xem nhanh / dùng cho Thu ngân, Lưu trữ, Tra cứu)
   ========================================================================== */
/* ============================================================================
   Modal: Hiệu chỉnh hồ sơ — sửa thông tin / sửa Số CC / hủy số / in & ký lại.
   Nhánh an toàn (A) Lưu trữ tự làm · Nhánh B/C/D cần CCV (Lưu trữ chỉ gửi yêu cầu).
   ========================================================================== */
function CorrectionModal({ session, role, initialOption, proposal, onReject, onClose, onConfirm }) {
  const L = window.LucideReact;
  const { Button } = window.FSICheckinDesignSystem_019df8;
  const s = session;
  const isCCV = role === "ccv";
  const reviewMode = !!proposal && isCCV;
  const AMBER = "#b45309";
  const AMBER_BTN = "#d97706";
  const warnBoxStyle = { display: "flex", gap: 9, fontSize: 12.5, lineHeight: 1.5, color: AMBER, padding: "11px 13px", borderRadius: "var(--radius-md)", background: "color-mix(in srgb, #d97706 10%, transparent)", border: "1px solid color-mix(in srgb, #d97706 30%, transparent)" };
  const OPTIONS = [
    { key: "A", title: "Sửa thông tin đơn giản", icon: "PencilLine",
      desc: "Mở khóa các trường an toàn (tên khách, loại biểu mẫu). Khóa cứng ô Số công chứng. Không nhảy ngày, không sinh ghi chú.", ccvOnly: false },
    { key: "B", title: "Sửa Số công chứng", icon: "Replace",
      desc: "Cấp số thay thế — CMC nhảy ngày, hệ thống tự sinh ghi chú & Re-sync. Số cũ chuyển [Đã hủy – thay thế].", ccvOnly: true },
    { key: "C", title: "Hủy số (lưu vết)", icon: "Ban",
      desc: "Số giữ nguyên trong dải, đổi trạng thái [Đã hủy] — không biến mất, tránh thiếu số khi đối soát.", ccvOnly: true },
    { key: "D", title: "Đánh dấu in & ký số lại", icon: "Stamp",
      desc: "Lỗi phức tạp — gắn cờ và đẩy hồ sơ về pipeline số hóa (in lại → scan → ký số lại).", ccvOnly: true },
  ];
  const [sel, setSel] = useSx(proposal ? proposal.type : (initialOption || "A"));
  const [reason, setReason] = useSx(proposal ? (proposal.reason || "") : "");
  const [customer, setCustomer] = useSx(s.customer);
  const [typesText, setTypesText] = useSx(s.types.join(", "));
  const VA_PAY_METHODS = ["Tiền mặt", "Chuyển khoản", "Quẹt thẻ (POS)"];
  const defaultFee = (s.types || []).reduce((sum, t) => sum + feeOfType(t), 0);
  const [feeText, setFeeText] = useSx(String(s.fee != null ? s.fee : defaultFee));
  const [payMethod, setPayMethod] = useSx(s.payMethod || "Chuyển khoản");
  const [newCC, setNewCC] = useSx(proposal && proposal.proposalCC ? proposal.proposalCC : "");
  const [proposalDetail, setProposalDetail] = useSx(proposal && proposal.proposalDetail ? proposal.proposalDetail : "");
  const fmtVnd = (n) => (Number(String(n).replace(/[^\d]/g, "")) || 0).toLocaleString("vi-VN") + " đ";
  const opt = OPTIONS.find((o) => o.key === sel) || OPTIONS[0];
  const arcRequest = !isCCV && opt.ccvOnly;
  const amber = opt.ccvOnly;
  const canConfirm = reviewMode
    ? true
    : reason.trim().length > 0
      && (sel !== "B" || newCC.trim().length > 0)
      && (sel !== "D" || !arcRequest || proposalDetail.trim().length > 0);
  const submit = () => { if (canConfirm) onConfirm({ option: sel, reason: reason.trim(), customer: customer.trim(), typesText, fee: Number(String(feeText).replace(/[^\d]/g, "")) || 0, payMethod, newCC: newCC.trim(), proposalDetail: proposalDetail.trim(), arcRequest }); };
  const inputStyle = { width: "100%", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "8px 11px", fontFamily: "var(--font-sans)", fontSize: 13, background: "var(--bg-inset)", color: "var(--text-primary)", outline: "none", boxSizing: "border-box" };
  const FromTo = ({ from, to }) => (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 14, flexWrap: "wrap", padding: "13px 15px", borderRadius: "var(--radius-md)", background: "var(--bg-overlay)", border: "1px solid var(--border-subtle)" }}>
      <div>
        <div style={{ fontSize: 10.5, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 700 }}>Số hiện tại</div>
        <div style={{ fontSize: 17, fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", textDecoration: "line-through", marginTop: 3 }}>{from || "—"}</div>
      </div>
      <L.ArrowRight size={20} color="var(--text-tertiary)" style={{ marginBottom: 3 }} />
      <div>
        <div style={{ fontSize: 10.5, color: "var(--accent)", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 700 }}>Số mới đề xuất</div>
        <div style={{ fontSize: 17, fontFamily: "var(--font-mono)", color: "var(--accent-hover)", fontWeight: 700, marginTop: 3 }}>{to || "—"}</div>
      </div>
    </div>
  );
  const senderBlock = proposal && (
    <div style={{ display: "flex", gap: 10, padding: "10px 13px", borderRadius: "var(--radius-md)", background: "var(--bg-overlay)", border: "1px solid var(--border-subtle)" }}>
      <L.MessageSquareText size={15} color="var(--text-tertiary)" style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12.5, color: "var(--text-primary)", lineHeight: 1.5 }}>“{proposal.reason}”</div>
        <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginTop: 3 }}>Người gửi: <b style={{ color: "var(--text-secondary)" }}>{proposal.by}</b> · Lưu trữ viên · {proposal.at}</div>
      </div>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(28,28,26,.5)" }} />
      <div style={{ position: "relative", width: 600, maxWidth: "100%", maxHeight: "92%", background: "var(--bg-surface)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: "1px solid var(--border-default)" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-muted)", display: "grid", placeItems: "center" }}><L.FileCog size={17} color="var(--accent)" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600 }}>Hiệu chỉnh hồ sơ</div>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>{s.id} · {s.customer}</div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 30, height: 30, border: "none", background: "transparent", borderRadius: 7, cursor: "pointer", display: "grid", placeItems: "center", color: "var(--text-tertiary)" }}><L.X size={18} /></button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
          {reviewMode ? (
            <React.Fragment>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", borderRadius: "var(--radius-md)", background: "color-mix(in srgb, #d97706 10%, transparent)", border: "1px solid color-mix(in srgb, #d97706 30%, transparent)" }}>
                <L.Inbox size={16} color={AMBER} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: AMBER }}>Duyệt yêu cầu: {opt.title}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-secondary)", marginTop: 1 }}>Bạn chỉ xác nhận nội dung đề xuất dưới đây — không cần tự nhập giá trị.</div>
                </div>
              </div>
              {senderBlock}
              {sel === "B" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <FromTo from={s.ccNumber} to={newCC} />
                  <div style={warnBoxStyle}><L.AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} /><span>Khi xác nhận: <b>CMC nhảy ngày</b> → sinh ghi chú “Ngày công chứng thực tế là ngày…” &amp; <b>Re-sync</b>. Số cũ <b>{s.ccNumber}</b> chuyển <b>[Đã hủy – thay thế bằng số {newCC}]</b>, không xóa khỏi dải.</span></div>
                </div>
              )}
              {sel === "C" && (
                <div style={warnBoxStyle}><L.Ban size={16} style={{ flexShrink: 0, marginTop: 1 }} /><span>Xác nhận hủy số <b style={{ fontFamily: "var(--font-mono)" }}>{s.ccNumber}</b> → trạng thái <b>[Đã hủy]</b>, giữ nguyên trong dải để tránh thiếu số khi đối soát.</span></div>
              )}
              {sel === "D" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 5 }}>Chỗ sai trên nội dung hồ sơ (Lưu trữ mô tả)</div>
                    <div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5, padding: "10px 12px", borderRadius: "var(--radius-md)", background: "var(--bg-inset)", border: "1px solid var(--border-default)" }}>{proposalDetail || "—"}</div>
                  </div>
                  <div style={warnBoxStyle}><L.Stamp size={16} style={{ flexShrink: 0, marginTop: 1 }} /><span>Khi xác nhận: gắn cờ lỗi và <b>đẩy về pipeline số hóa</b> (in lại → scan → ký số lại). Số công chứng giữ nguyên.</span></div>
                </div>
              )}
            </React.Fragment>
          ) : (
          <React.Fragment>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-tertiary)" }}>Loại hiệu chỉnh</div>
            {OPTIONS.map((o) => {
              const on = sel === o.key;
              const Icon = L[o.icon];
              const c = o.ccvOnly ? AMBER : "var(--accent)";
              const lockForArc = !isCCV && o.ccvOnly;
              return (
                <button key={o.key} type="button" onClick={() => setSel(o.key)} style={{
                  display: "flex", alignItems: "flex-start", gap: 11, textAlign: "left", padding: "11px 13px", cursor: "pointer",
                  borderRadius: "var(--radius-md)", border: "1.5px solid " + (on ? c : "var(--border-default)"),
                  background: on ? (o.ccvOnly ? "color-mix(in srgb, #d97706 9%, transparent)" : "var(--accent-muted)") : "var(--bg-surface)",
                }}>
                  <span style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "grid", placeItems: "center", background: on ? c : "var(--bg-inset)", color: on ? "#fff" : "var(--text-tertiary)" }}><Icon size={16} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap" }}>{o.title}</span>
                      {o.ccvOnly
                        ? <span style={{ fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap", color: AMBER, background: "color-mix(in srgb, #d97706 14%, transparent)", border: "1px solid color-mix(in srgb, #d97706 30%, transparent)", borderRadius: "var(--radius-full)", padding: "2px 8px" }}>Cần CCV</span>
                        : <span style={{ fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap", color: "var(--accent)", background: "var(--accent-muted)", border: "1px solid var(--accent-border)", borderRadius: "var(--radius-full)", padding: "2px 8px" }}>Lưu trữ tự làm</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 3, lineHeight: 1.45 }}>{o.desc}</div>
                    {lockForArc && on && <div style={{ fontSize: 11.5, color: AMBER, marginTop: 5, display: "flex", alignItems: "center", gap: 5 }}><L.Send size={12} /> Bạn sẽ tạo phiếu yêu cầu gửi Công chứng viên thực hiện.</div>}
                  </div>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 4, border: "2px solid " + (on ? c : "var(--border-strong)"), display: "grid", placeItems: "center" }}>{on && <span style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />}</span>
                </button>
              );
            })}
          </div>

          {sel === "A" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "14px 16px", background: "var(--bg-overlay)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Tên khách hàng</label>
                <input value={customer} onChange={(e) => setCustomer(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Loại biểu mẫu <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>(phân tách bằng dấu phẩy)</span></label>
                <input value={typesText} onChange={(e) => setTypesText(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Số tiền (phí công chứng)</label>
                  <input value={feeText} onChange={(e) => setFeeText(e.target.value)} inputMode="numeric" style={{ ...inputStyle, fontFamily: "var(--font-mono)" }} />
                  <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>{fmtVnd(feeText)}</div>
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Phương thức thanh toán</label>
                  <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                    {VA_PAY_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-tertiary)", display: "block", marginBottom: 5 }}>Số công chứng</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 11px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", background: "var(--bg-inset)", color: "var(--text-tertiary)" }}>
                  <L.Lock size={14} /> <span style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{s.ccNumber || "—"}</span>
                  <span style={{ marginLeft: "auto", fontSize: 11 }}>Khóa cứng — không sửa ở nhánh này</span>
                </div>
              </div>
            </div>
          )}
          {sel === "B" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={warnBoxStyle}>
                <L.AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>Thao tác làm <b>CMC nhảy ngày</b> → hệ thống tự sinh ghi chú “Ngày công chứng thực tế là ngày…” và đồng bộ lại (<b>Re-sync</b>). Số cũ <b>{s.ccNumber}</b> chuyển trạng thái <b>[Đã hủy – thay thế bằng số …]</b>. Số cũ <u>không</u> bị xóa khỏi dải.</span>
              </div>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>{arcRequest ? "Số công chứng mới (đề xuất)" : "Số công chứng thay thế"} <span style={{ color: "#dc2626" }}>*</span></label>
                <input value={newCC} onChange={(e) => setNewCC(e.target.value)} placeholder="VD: 0036-001990-2026" style={{ ...inputStyle, fontFamily: "var(--font-mono)" }} />
                {arcRequest && <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>CCV sẽ xem đề xuất này dưới dạng so sánh “từ → đến” và xác nhận áp dụng.</div>}
              </div>
            </div>
          )}
          {sel === "C" && (
            <div style={warnBoxStyle}><L.Ban size={16} style={{ flexShrink: 0, marginTop: 1 }} /><span>Số <b>{s.ccNumber}</b> sẽ đổi trạng thái <b>[Đã hủy]</b> nhưng <b>giữ nguyên trong dải</b> — không biến mất để tránh thiếu số khi đối soát.</span></div>
          )}
          {sel === "D" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={warnBoxStyle}><L.Stamp size={16} style={{ flexShrink: 0, marginTop: 1 }} /><span>Hồ sơ được gắn cờ lỗi và <b>đẩy về pipeline số hóa</b>: in lại → scan → <b>ký số lại</b>. Số công chứng giữ nguyên.</span></div>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Mô tả chỗ sai trên nội dung hồ sơ {arcRequest && <span style={{ color: "#dc2626" }}>*</span>}</label>
                <textarea value={proposalDetail} onChange={(e) => setProposalDetail(e.target.value)} rows={2} placeholder="VD: Sai số CMND trang 2, thiếu chữ ký bên B…" style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Lý do hiệu chỉnh <span style={{ color: "#dc2626" }}>*</span></label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Bắt buộc — mô tả lý do hiệu chỉnh để lưu vào Audit Trail…"
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
          </div>
          </React.Fragment>
          )}

          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "var(--text-tertiary)", padding: "10px 12px", background: "var(--bg-overlay)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <L.ShieldCheck size={14} style={{ flexShrink: 0, marginTop: 1 }} /> Mọi thao tác được ghi <b style={{ color: "var(--text-secondary)" }}>Audit Trail</b> đích danh theo tài khoản đang đăng nhập.
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border-default)", padding: "13px 18px", display: "flex", gap: 10, alignItems: "center" }}>
          {reviewMode ? (
            <React.Fragment>
              <Button variant="secondary" icon={L.XCircle} onClick={() => onReject && onReject()}>Từ chối</Button>
              <div style={{ flex: 1 }} />
              <button type="button" onClick={submit} style={{
                display: "inline-flex", alignItems: "center", gap: 8, height: 40, padding: "0 20px", borderRadius: "var(--radius-md)", border: "none",
                cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, color: "#fff", background: AMBER_BTN,
              }}>
                {sel === "B" ? <><L.Replace size={16} /> Thực hiện sửa theo đề xuất</> : sel === "C" ? <><L.Ban size={16} /> Thực hiện hủy số</> : <><L.Stamp size={16} /> Đẩy về pipeline số hóa</>}
              </button>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Button variant="secondary" onClick={onClose}>Hủy bỏ</Button>
              <div style={{ flex: 1 }} />
              <button type="button" disabled={!canConfirm} onClick={submit} style={{
                display: "inline-flex", alignItems: "center", gap: 8, height: 40, padding: "0 20px", borderRadius: "var(--radius-md)", border: "none",
                cursor: canConfirm ? "pointer" : "not-allowed", opacity: canConfirm ? 1 : .5, fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, color: "#fff",
                background: (arcRequest || amber) ? AMBER_BTN : "var(--accent)",
              }}>
                {arcRequest ? <><L.Send size={16} /> Gửi yêu cầu cho CCV</> : sel === "A" ? <><L.Save size={16} /> Lưu hiệu chỉnh</> : <><L.Check size={16} /> Xác nhận thực hiện</>}
              </button>
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
}

function SessionDetailModal({ session, onClose, role, correctable, currentUser, onCorrected, incomingRequest, onReject }) {
  const L = window.LucideReact;
  const { Button } = window.FSICheckinDesignSystem_019df8;
  const s = session;
  const over = s.status !== "done" && daysOverdue(s.date) > 0;
  const [corr, setCorr] = useSx(null);
  const AMBER_SOLID = "#d97706";
  const amberBox = { display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 500, color: "#b45309", padding: "9px 12px", borderRadius: "var(--radius-md)", background: "color-mix(in srgb, #d97706 11%, transparent)", border: "1px solid color-mix(in srgb, #d97706 30%, transparent)" };
  const infoBox = { display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 500, color: "var(--accent-hover)", padding: "9px 12px", borderRadius: "var(--radius-md)", background: "var(--accent-muted)", border: "1px solid var(--accent-border)" };
  const ccBadge = { fontSize: 11, fontWeight: 700, color: "#b45309", background: "color-mix(in srgb, #d97706 14%, transparent)", border: "1px solid color-mix(in srgb, #d97706 30%, transparent)", borderRadius: "var(--radius-full)", padding: "2px 9px" };
  const reqLabel = (t) => ({ A: "Hiệu chỉnh thông tin", B: "Sửa Số công chứng", C: "Hủy số", D: "In & ký số lại" }[t] || "hiệu chỉnh");
  const Field = ({ label, value, mono }) => (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 13, color: "var(--text-primary)", fontFamily: mono ? "var(--font-mono)" : "inherit", wordBreak: "break-word", marginTop: 2 }}>{value || "—"}</div>
    </div>
  );
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 80 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(28,28,26,.46)" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 620, maxWidth: "95%", maxHeight: "90%", background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: "1px solid var(--border-default)" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-tertiary)" }}>{s.id}</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 1 }}>{s.customer}</div>
          </div>
          <StatusPill status={s.status} />
          <button type="button" onClick={onClose} style={{ width: 30, height: 30, border: "none", background: "transparent", borderRadius: 7, cursor: "pointer", display: "grid", placeItems: "center", color: "var(--text-tertiary)" }}><L.X size={18} /></button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: 18, display: "flex", flexDirection: "column", gap: 18 }}>
          {incomingRequest && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 14px", borderRadius: "var(--radius-md)", background: "color-mix(in srgb, #d97706 11%, transparent)", border: "1px solid color-mix(in srgb, #d97706 32%, transparent)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <L.Inbox size={15} color="#b45309" />
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "#b45309" }}>Yêu cầu hiệu chỉnh từ Lưu trữ</span>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "#b45309", background: "color-mix(in srgb, #d97706 16%, transparent)", border: "1px solid color-mix(in srgb, #d97706 32%, transparent)", borderRadius: "var(--radius-full)", padding: "2px 9px" }}>{reqLabel(incomingRequest.type)}</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5 }}>“{incomingRequest.reason}”</div>
              <div style={{ fontSize: 11.5, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{incomingRequest.by} · {incomingRequest.at}</div>
            </div>
          )}
          {over && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 600, color: CARRYOVER_C, padding: "8px 12px", borderRadius: "var(--radius-md)", background: `color-mix(in srgb, ${CARRYOVER_C} 9%, transparent)`, border: `1px solid color-mix(in srgb, ${CARRYOVER_C} 24%, transparent)` }}>
              <L.AlertTriangle size={15} /> Tồn đọng {daysOverdue(s.date)} ngày — khởi tạo {s.createdAt}, chưa hoàn thành.
            </div>
          )}

          {s.pendingRequest && (
            <div style={amberBox}>
              <L.Clock size={15} style={{ flexShrink: 0 }} /> <span>Đang chờ Công chứng viên xử lý yêu cầu <b>{reqLabel(s.pendingRequest.type)}</b> — gửi bởi {s.pendingRequest.by} · {s.pendingRequest.at}.</span>
            </div>
          )}
          {s.ccState === "replaced" && (
            <div style={amberBox}>
              <L.Replace size={15} style={{ flexShrink: 0 }} /> <span>Số cũ <b style={{ fontFamily: "var(--font-mono)" }}>{s.oldCcNumber}</b> đã chuyển <b>[Đã hủy – thay thế bằng số {s.ccNumber}]</b>. Số cũ vẫn giữ trong dải.</span>
            </div>
          )}
          {s.ccState === "cancelled" && (
            <div style={amberBox}>
              <L.Ban size={15} style={{ flexShrink: 0 }} /> <span>Số <b style={{ fontFamily: "var(--font-mono)" }}>{s.ccNumber}</b> đã <b>[Đã hủy]</b> (lưu vết) — vẫn giữ nguyên trong dải, không biến mất.</span>
            </div>
          )}
          {s.actualNote && (
            <div style={infoBox}>
              <L.RefreshCw size={15} style={{ flexShrink: 0 }} /> <span>{s.actualNote}</span>
            </div>
          )}
          {s.reprint && (
            <div style={amberBox}>
              <L.Stamp size={15} style={{ flexShrink: 0 }} /> <span>Hồ sơ đã gắn cờ <b>in &amp; ký số lại</b> và đẩy về pipeline số hóa (in lại → scan → ký số lại).</span>
            </div>
          )}

          {/* Pipeline tiến trình */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-tertiary)", marginBottom: 10 }}>Tiến trình phiên</div>
            <div style={{ display: "flex", alignItems: "flex-start" }}>
              {STATUS_ORDER.map((k, i) => {
                const m = SESSION_STATUS[k];
                const cur = SESSION_STATUS[s.status].step;
                const reached = m.step <= cur;
                const isCur = m.step === cur;
                const Icon = L[m.icon];
                return (
                  <React.Fragment key={k}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 64 }}>
                      <span style={{ width: 30, height: 30, borderRadius: "50%", display: "grid", placeItems: "center", flexShrink: 0,
                        background: reached ? m.c : "var(--bg-inset)", color: reached ? "#fff" : "var(--text-tertiary)",
                        boxShadow: isCur ? `0 0 0 4px color-mix(in srgb, ${m.c} 22%, transparent)` : "none" }}>
                        {reached && !isCur ? <L.Check size={15} /> : <Icon size={14} />}
                      </span>
                      <span style={{ fontSize: 10, textAlign: "center", lineHeight: 1.25, color: isCur ? m.c : reached ? "var(--text-secondary)" : "var(--text-tertiary)", fontWeight: isCur ? 700 : 500 }}>{m.short}</span>
                    </div>
                    {i < STATUS_ORDER.length - 1 && <span style={{ flex: 1, height: 2, marginTop: 14, borderRadius: 1, background: SESSION_STATUS[STATUS_ORDER[i + 1]].step <= cur ? m.c : "var(--border-subtle)" }} />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Thông tin */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 16px", padding: "14px 16px", background: "var(--bg-overlay)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <Field label="Biểu mẫu" value={s.types.join(", ")} />
            <Field label="Người tạo phiên" value={s.creator} />
            <Field label="Công chứng viên" value={s.notary || "Chưa gán"} />
            <Field label="Thư ký nghiệp vụ" value={s.secretary} />
            {s.fee != null && <Field label="Số tiền (phí công chứng)" value={Number(s.fee).toLocaleString("vi-VN") + " đ"} mono />}
            {s.payMethod && <Field label="Phương thức thanh toán" value={s.payMethod} />}
            {s.ccNumber && (
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 600 }}>Số công chứng</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 2 }}>
                  <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: s.ccState === "cancelled" ? "var(--text-tertiary)" : "var(--text-primary)", textDecoration: s.ccState ? "line-through" : "none" }}>{s.oldCcNumber || s.ccNumber}</span>
                  {s.ccState === "replaced" && <><span style={ccBadge}>Đã hủy – thay bằng</span><span style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--accent-hover)", fontWeight: 600 }}>{s.ccNumber}</span></>}
                  {s.ccState === "cancelled" && <span style={ccBadge}>Đã hủy</span>}
                </div>
              </div>
            )}
            <Field label="Thời gian khởi tạo" value={s.createdAt} mono />
            <Field label={s.status === "done" ? "Hoàn thành lúc" : "Cập nhật gần nhất"} value={s.completedAt || s.updatedAt} mono />
          </div>

          {s.lockedBy && s.status !== "done" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text-warning)", padding: "8px 12px", borderRadius: "var(--radius-md)", background: "var(--bg-warning)", border: "1px solid var(--border-warning)" }}>
              <L.Lock size={14} /> Phiên đang được mở để chỉnh sửa bởi <b>{s.lockedBy}</b>{s.lockedAt ? " · " + s.lockedAt : ""}.
            </div>
          )}

          {/* Ảnh đính kèm */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <L.Images size={15} color="var(--text-tertiary)" />
              <span style={{ fontSize: 13, fontWeight: 600 }}>File số hóa đính kèm</span>
              <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>· {s.photos || 0} trang</span>
            </div>
            {s.photos > 0
              ? <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{Array.from({ length: s.photos }).map((_, i) => <MiniPhoto key={i} hue={(i * 70 + 150) % 360} size={88} />)}</div>
              : <div style={{ fontSize: 12.5, color: "var(--text-tertiary)", fontStyle: "italic", padding: "12px 0" }}>Chưa có file số hóa nào được gắn vào hồ sơ.</div>}
          </div>

          {/* Nhật ký hiệu chỉnh (Audit Trail) */}
          {s.audit && s.audit.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <L.History size={15} color="var(--text-tertiary)" />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Nhật ký hiệu chỉnh</span>
                <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>· {s.audit.length} thao tác</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {s.audit.map((a, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "9px 12px", background: "var(--bg-overlay)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
                    <L.UserCheck size={15} color="var(--text-tertiary)" style={{ marginTop: 1, flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)" }}>{a.action}</div>
                      {a.detail && <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 1 }}>“{a.detail}”</div>}
                      <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", marginTop: 2 }}>{a.by} · {a.at}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Thanh hành động — Hiệu chỉnh & Hủy số hồ sơ (theo vai trò đăng nhập) */}
        {correctable && (
          <div style={{ borderTop: "1px solid var(--border-default)", padding: "13px 18px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", background: "var(--bg-elevated)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--text-tertiary)", marginRight: "auto" }}>
              <L.ShieldCheck size={14} /> {role === "ccv" ? "Công chứng viên" : "Lưu trữ viên"} · {(currentUser || "").replace(/^CCV /, "")}
            </span>
            <Button variant="secondary" icon={L.PencilLine} onClick={() => setCorr("A")}>Hiệu chỉnh thông tin</Button>
            <button type="button" onClick={() => setCorr(incomingRequest ? incomingRequest.type : "B")} style={{
              display: "inline-flex", alignItems: "center", gap: 7, height: 38, padding: "0 16px", borderRadius: "var(--radius-md)",
              border: "1px solid " + ((role === "ccv" && incomingRequest) ? AMBER_SOLID : "color-mix(in srgb, #d97706 38%, transparent)"),
              background: (role === "ccv" && incomingRequest) ? AMBER_SOLID : "color-mix(in srgb, #d97706 13%, transparent)",
              color: (role === "ccv" && incomingRequest) ? "#fff" : "#b45309", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 13.5, fontWeight: 600,
            }}>
              {role === "ccv" ? <><L.Replace size={15} /> Thực hiện sửa Số CC / Hủy số</> : <><L.Send size={15} /> Gửi yêu cầu sửa Số CC / Hủy số</>}
            </button>
          </div>
        )}
      </div>
      {corr && <CorrectionModal session={s} role={role} initialOption={corr} proposal={(incomingRequest && corr === incomingRequest.type) ? incomingRequest : null} onReject={() => { setCorr(null); onReject && onReject(); }} onClose={() => setCorr(null)} onConfirm={(p) => { setCorr(null); onCorrected && onCorrected(p); }} />}
    </div>
  );
}

/* ---- Thẻ tóm tắt số liệu ---- */
function SummaryCard({ icon, label, value, c }) {
  const L = window.LucideReact;
  const Icon = L[icon];
  const col = c || "var(--accent)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)" }}>
      <span style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, display: "grid", placeItems: "center", background: `color-mix(in srgb, ${col} 12%, transparent)` }}><Icon size={18} color={col} /></span>
      <div style={{ lineHeight: 1.2, minWidth: 0 }}>
        <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)" }}>{value}</div>
        <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
      </div>
    </div>
  );
}

/* ---- Một hàng phiên ---- */
function SessionRow({ s, last, currentUser, canAttach, onAttach, canCapture, onCapture, canCharge, onCharge, canInvoice, onInvoice, onOpen, onView }) {
  const L = window.LucideReact;
  const { Button, Avatar } = window.FSICheckinDesignSystem_019df8;
  const over = s.status !== "done" && daysOverdue(s.date) > 0;
  const lockedByMe = s.lockedBy && s.lockedBy === currentUser;
  const lockedByOther = s.lockedBy && !lockedByMe;
  const editable = ["draft", "drafting", "waitNumberPay"].includes(s.status); // các bước còn cho chỉnh sửa
  const td = { padding: "12px 14px", fontSize: 13, color: "var(--text-secondary)", verticalAlign: "middle" };

  // Cột thao tác
  let actionEl;
  if (onOpen) {
    if (editable && lockedByOther) {
      actionEl = <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-disabled)" }}><L.Lock size={13} /> Đang bị khóa</span>;
    } else if (s.status === "waitFinalize" || s.status === "waitAttach" || s.status === "done") {
      actionEl = <Button variant="secondary" size="sm" icon={L.Eye} onClick={() => onView(s)}>Xem</Button>;
    } else if (s.status === "waitNumberPay") {
      actionEl = <Button variant="secondary" size="sm" icon={L.Pencil} onClick={() => onOpen(s)}>Mở &amp; sửa</Button>;
    } else {
      actionEl = <Button variant="secondary" size="sm" icon={L.ArrowRight} onClick={() => onOpen(s)}>{s.status === "drafting" ? "Tiếp tục" : "Mở phiên"}</Button>;
    }
  } else {
    actionEl = <Button variant="secondary" size="sm" icon={L.Eye} onClick={() => onView(s)}>Xem</Button>;
  }

  return (
    <tr style={{ borderBottom: last ? "none" : "1px solid var(--border-subtle)", background: over ? `color-mix(in srgb, ${CARRYOVER_C} 3.5%, transparent)` : "transparent" }}>
      <td style={{ ...td, position: "relative", whiteSpace: "nowrap" }}>
        {over && <span style={{ position: "absolute", left: 0, top: 6, bottom: 6, width: 3, borderRadius: 2, background: CARRYOVER_C }} />}
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--text-primary)" }}>{s.id}</span>
          <span style={{ fontSize: 10.5, color: "var(--text-tertiary)" }}>Tạo bởi {s.creator}</span>
          {over && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 700, color: CARRYOVER_C }}><L.AlertTriangle size={11} /> Tồn {daysOverdue(s.date)} ngày</span>}
        </div>
      </td>
      <td style={td}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Avatar name={s.customer} size={26} />
          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{s.customer}</span>
        </div>
      </td>
      <td style={{ ...td, fontSize: 12.5 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {s.types.map((t, i) => <span key={i} style={{ fontSize: 11.5, padding: "2px 8px", borderRadius: "var(--radius-full)", background: "var(--bg-inset)", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{t}</span>)}
        </div>
      </td>
      <td style={td}>
        {s.notary
          ? <div style={{ display: "flex", alignItems: "center", gap: 7 }}><Avatar name={s.notary} size={22} tone="accent" /><span style={{ fontSize: 12.5, color: "var(--text-primary)" }}>{s.notary.replace(/^CCV /, "")}</span></div>
          : <span style={{ fontSize: 12, color: "var(--text-tertiary)", fontStyle: "italic" }}>Chưa gán</span>}
      </td>
      <td style={{ ...td, whiteSpace: "nowrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-start" }}>
          <StatusPill status={s.status} size="sm" />
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--text-tertiary)", paddingLeft: 2 }}>
            {s.photos > 0 && <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><L.Paperclip size={11} /> {s.photos} file</span>}
            {s.lockedBy && s.status !== "done" && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "var(--text-warning)" }}><L.Lock size={11} /> {lockedByMe ? "bạn đang mở" : "đang mở: " + (s.lockedBy || "").split(" ").slice(-2).join(" ")}</span>
            )}
          </div>
        </div>
      </td>
      <td style={{ ...td, textAlign: "right", whiteSpace: "nowrap" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
          {canInvoice && ["waitFinalize", "waitAttach", "done"].includes(s.status) && (
            s.invoiced
              ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: "#16a34a", background: "color-mix(in srgb, #16a34a 12%, transparent)", border: "1px solid color-mix(in srgb, #16a34a 26%, transparent)", borderRadius: "var(--radius-full)", padding: "4px 10px" }}><L.CheckCircle2 size={12} /> Đã xuất HĐ</span>
              : (s.status === "done" && daysOverdue(s.date) > 1
                  ? <Button variant="primary" size="sm" icon={L.AlertTriangle} onClick={() => onInvoice(s)}>Xuất HĐ (chậm)</Button>
                  : <Button variant="secondary" size="sm" icon={L.FileSpreadsheet} onClick={() => onInvoice(s)}>Xuất hóa đơn</Button>)
          )}
          {canCharge && s.status === "waitNumberPay" && (
            <Button variant="primary" size="sm" icon={L.ReceiptText} onClick={() => onCharge(s)}>Cấp số &amp; thu phí</Button>
          )}
          {canCapture && (s.status === "waitNumberPay" || s.status === "waitFinalize") && (
            <button type="button" title="Chụp ảnh & gắn vào hồ sơ" onClick={() => onCapture(s)} style={{
              display: "inline-flex", alignItems: "center", gap: 6, height: 32, padding: "0 11px", borderRadius: "var(--radius-md)",
              border: "1px solid var(--accent-border)", background: "var(--accent-muted)", color: "var(--accent-hover)",
              cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 12.5, fontWeight: 600, flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent-muted)"; e.currentTarget.style.color = "var(--accent-hover)"; }}>
              <L.Camera size={14} /> Chụp ảnh
            </button>
          )}
          {canAttach && s.status === "waitAttach" && (
            <Button variant="primary" size="sm" icon={L.ScanLine} onClick={() => onAttach(s)}>Số hóa &amp; gắn file</Button>
          )}
          {actionEl}
        </div>
      </td>
    </tr>
  );
}

/* ---- Bảng phiên có tiêu đề mục ---- */
function SessionTable({ title, icon, accent, items, ...rowProps }) {
  const L = window.LucideReact;
  const Icon = L[icon];
  const th = { padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-tertiary)", whiteSpace: "nowrap" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon size={16} color={accent || "var(--text-secondary)"} />
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: accent || "var(--text-primary)" }}>{title}</h2>
        <span style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>· {items.length} phiên</span>
      </div>
      <div style={{ border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "var(--bg-surface)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border-subtle)" }}>
            {["Mã phiên", "Khách hàng", "Biểu mẫu", "CCV phụ trách", "Trạng thái", ""].map((h, i) => <th key={i} style={th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {items.map((s, i) => <SessionRow key={s.id} s={s} last={i === items.length - 1} {...rowProps} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================================
   LUỒNG TỔNG QUAN
   props: role, currentUser, canCreate, canAttach, onNew, onOpen
   - onOpen có → mở phiên trong luồng soạn thảo (CCV/TKNV)
   - onOpen không có → mở modal xem nhanh (Thu ngân / Lưu trữ)
   - canAttach → vai trò Lưu trữ: được số hóa & gắn file ở bước "Chờ gắn file"
   ========================================================================== */
function OverviewScreen({ role, currentUser, canCreate, canAttach, canCapture, canCharge, canInvoice, onNew, onOpen }) {
  const L = window.LucideReact;
  const { Button, Toast } = window.FSICheckinDesignSystem_019df8;
  const [base, setBase] = useSx(() => VA_ALL_SESSIONS.map((s) => ({ ...s, invoiced: s.invoiced != null ? s.invoiced : (s.status === "done" && s.date < VA_TODAY) })));
  const [q, setQ] = useSx("");
  const [filter, setFilter] = useSx("all");
  const [capTarget, setCapTarget] = useSx(null);
  const [photoTarget, setPhotoTarget] = useSx(null);
  const [chargeTarget, setChargeTarget] = useSx(null);
  const [invoiceTarget, setInvoiceTarget] = useSx(null);
  const [viewer, setViewer] = useSx(null);
  const [toast, setToast] = useSx(null);

  // Phủ khóa phiên ghi nhận từ localStorage (ai đang mở để chỉnh sửa).
  // Đảm bảo 1 tài khoản chỉ giữ 1 khóa: nếu người đó có khóa "live", bỏ mọi khóa seed của họ.
  const liveLocks = readLocks();
  const liveLockers = new Set(Object.values(liveLocks).map((v) => v.who));
  const sessions = base.map((s) => {
    if (liveLocks[s.id]) return { ...s, lockedBy: liveLocks[s.id].who, lockedAt: liveLocks[s.id].at };
    if (s.lockedBy && liveLockers.has(s.lockedBy)) return { ...s, lockedBy: "", lockedAt: "" };
    return s;
  });

  // Phiên thuộc luồng tổng quan: hôm nay (mọi trạng thái) + tồn đọng (hôm trước, chưa hoàn thành)
  const inFlow = sessions.filter((s) => s.date === VA_TODAY || s.status !== "done");

  const matchQ = (s) => {
    const k = vaNormalize(q); if (k.length < 1) return true;
    return [s.id, s.customer, s.notary, s.secretary, s.types.join(" ")].some((f) => vaNormalize(f).includes(k));
  };
  const matchF = (s) => filter === "all" ? true : filter === "carry" ? (s.status !== "done" && daysOverdue(s.date) > 0) : s.status === filter;
  const visible = inFlow.filter((s) => matchQ(s) && matchF(s));

  const carry = visible.filter((s) => s.status !== "done" && daysOverdue(s.date) > 0)
    .sort((a, b) => daysOverdue(b.date) - daysOverdue(a.date));
  const today = visible.filter((s) => s.date === VA_TODAY)
    .sort((a, b) => SESSION_STATUS[a.status].step - SESSION_STATUS[b.status].step);

  // Số liệu tóm tắt (trên toàn luồng, không phụ thuộc bộ lọc)
  const carryCount = inFlow.filter((s) => s.status !== "done" && daysOverdue(s.date) > 0).length;
  const attachCount = inFlow.filter((s) => s.status === "waitAttach").length;
  const processingCount = inFlow.filter((s) => ["drafting", "waitNumberPay", "waitFinalize"].includes(s.status)).length;
  const doneToday = inFlow.filter((s) => s.status === "done" && s.date === VA_TODAY).length;

  const counts = {}; STATUS_ORDER.forEach((k) => { counts[k] = inFlow.filter((s) => s.status === k).length; });

  const doAttach = (pages) => {
    const id = capTarget.id;
    setBase((arr) => arr.map((s) => s.id === id ? {
      ...s,
      photos: (s.photos || 0) + pages,
      status: "done",
      completedAt: vaNow(),
      updatedAt: vaNow(),
    } : s));
    setToast({ title: "Đã số hóa & gắn file", message: capTarget.id + " · " + pages + " trang đã đính kèm — phiên chuyển sang Hoàn thành." });
    setCapTarget(null);
    setTimeout(() => setToast(null), 3600);
  };

  // CCV chụp ảnh tại quầy → gắn ảnh + tự gán CCV phụ trách
  const doCapture = (count) => {
    const id = photoTarget.id;
    setBase((arr) => arr.map((s) => s.id === id ? {
      ...s, photos: (s.photos || 0) + count, notary: currentUser, updatedAt: vaNow(),
    } : s));
    setToast({ title: "Đã gắn ảnh vào hồ sơ", message: photoTarget.id + " · " + count + " ảnh — CCV phụ trách: " + currentUser.replace(/^CCV /, "") + "." });
    setPhotoTarget(null);
    setTimeout(() => setToast(null), 3600);
  };

  // Thu ngân cấp số & thu phí → phiên sang "Chờ chốt số công chứng"
  const doCharge = (res) => {
    const id = chargeTarget.id;
    setBase((arr) => arr.map((s) => s.id === id ? {
      ...s, status: "waitFinalize", ccNumber: res && res.soCC ? res.soCC : s.ccNumber, updatedAt: vaNow(),
    } : s));
    setToast({ title: "Đã cấp số & thu phí", message: chargeTarget.id + (res && res.soCC ? " · số CC " + res.soCC : "") + " — phiên chuyển sang Chờ chốt số công chứng." });
    setChargeTarget(null);
    setTimeout(() => setToast(null), 3600);
  };

  // Kế toán xuất hóa đơn điện tử cho phiên
  const doInvoice = (res) => {
    const id = invoiceTarget.id;
    setBase((arr) => arr.map((s) => s.id === id ? { ...s, invoiced: true, updatedAt: vaNow() } : s));
    setToast({ title: "Đã xuất hóa đơn điện tử", message: invoiceTarget.id + " · " + (res && res.amount ? res.amount.toLocaleString("vi-VN") + "₫" : "") + " — đã đẩy EasyInvoice" + (res && res.issueDate ? " (ngày xuất " + res.issueDate + ")" : "") + "." });
    setInvoiceTarget(null);
    setTimeout(() => setToast(null), 3600);
  };

  const FilterChip = ({ value, label, color, count }) => {
    const on = filter === value;
    return (
      <button type="button" onClick={() => setFilter(value)} style={{
        display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: "var(--radius-full)",
        border: "1px solid " + (on ? (color || "var(--accent)") : "var(--border-default)"), cursor: "pointer",
        fontFamily: "var(--font-sans)", fontSize: 12.5, fontWeight: on ? 600 : 500,
        background: on ? `color-mix(in srgb, ${color || "var(--accent)"} 14%, transparent)` : "var(--bg-surface)",
        color: on ? (color || "var(--accent)") : "var(--text-secondary)", whiteSpace: "nowrap",
      }}>
        {color && <span style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />}
        {label}{count != null && <span style={{ opacity: .7, fontFamily: "var(--font-mono)" }}>{count}</span>}
      </button>
    );
  };

  const rowProps = { currentUser, canAttach, onAttach: setCapTarget, canCapture, onCapture: setPhotoTarget, canCharge, onCharge: setChargeTarget, canInvoice, onInvoice: setInvoiceTarget, onOpen: onOpen ? onOpen : null, onView: setViewer };

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: 24 }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 19, fontWeight: 700, margin: 0 }}>Luồng tổng quan</h1>
            <p style={{ fontSize: 13.5, color: "var(--text-tertiary)", margin: "3px 0 0" }}>Phiên hôm nay &amp; các phiên tồn đọng chưa hoàn thành · {inFlow.length} phiên đang xử lý</p>
          </div>
          {canCreate && <Button variant="primary" size="lg" icon={L.FolderPlus} onClick={onNew}>Khởi tạo phiên</Button>}
        </div>

        {/* Số liệu */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <SummaryCard icon="AlertTriangle" label="Tồn đọng từ hôm trước" value={carryCount} c={CARRYOVER_C} />
          <SummaryCard icon="Loader" label="Đang xử lý" value={processingCount} c="#d97706" />
          <SummaryCard icon="Paperclip" label="Chờ gắn file" value={attachCount} c="#0891b2" />
          <SummaryCard icon="CircleCheck" label="Hoàn thành hôm nay" value={doneToday} c="#16a34a" />
        </div>

        {/* Bộ lọc */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 14, background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)" }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <L.Search size={15} color="var(--text-tertiary)" style={{ position: "absolute", left: 12 }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo mã phiên, khách hàng, công chứng viên, biểu mẫu…"
              style={{ width: "100%", fontFamily: "var(--font-sans)", fontSize: 13.5, color: "var(--text-primary)", background: "var(--bg-inset)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", padding: "9px 12px 9px 34px", outline: "none" }}
              onFocus={(e) => { e.target.style.background = "#fff"; e.target.style.borderColor = "var(--accent)"; }}
              onBlur={(e) => { e.target.style.background = "var(--bg-inset)"; e.target.style.borderColor = "var(--border-default)"; }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: "var(--text-tertiary)", marginRight: 2 }}><L.Filter size={13} /> Lọc:</span>
            <FilterChip value="all" label="Tất cả" count={inFlow.length} />
            <FilterChip value="carry" label="Tồn đọng" color={CARRYOVER_C} count={carryCount} />
            <span style={{ width: 1, height: 18, background: "var(--border-default)", margin: "0 2px" }} />
            {STATUS_ORDER.map((k) => <FilterChip key={k} value={k} label={SESSION_STATUS[k].short} color={SESSION_STATUS[k].c} count={counts[k]} />)}
          </div>
        </div>

        {/* Danh sách */}
        {carry.length === 0 && today.length === 0 ? (
          <div style={{ display: "grid", placeItems: "center", textAlign: "center", padding: "48px 12px", color: "var(--text-tertiary)", background: "var(--bg-surface)", border: "1px dashed var(--border-default)", borderRadius: "var(--radius-lg)" }}>
            <L.SearchX size={28} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 13.5 }}>Không có phiên nào khớp bộ lọc hiện tại.</div>
          </div>
        ) : (
          <>
            {carry.length > 0 && <SessionTable title="Tồn đọng — chưa hoàn thành từ hôm trước" icon="AlertTriangle" accent={CARRYOVER_C} items={carry} {...rowProps} />}
            {today.length > 0 && <SessionTable title="Hôm nay · 14/06/2026" icon="CalendarDays" items={today} {...rowProps} />}
          </>
        )}
      </div>

      {capTarget && <ScanAttachModal session={capTarget} onClose={() => setCapTarget(null)} onConfirm={doAttach} />}
      {photoTarget && <CaptureModal session={photoTarget} ccvName={currentUser} onClose={() => setPhotoTarget(null)} onConfirm={doCapture} />}
      {chargeTarget && <ChargeModal session={chargeTarget} onClose={() => setChargeTarget(null)} onConfirm={doCharge} />}
      {invoiceTarget && <InvoiceModal session={invoiceTarget} onClose={() => setInvoiceTarget(null)} onConfirm={doInvoice} />}
      {viewer && <SessionDetailModal session={viewer} onClose={() => setViewer(null)} />}
      {toast && (
        <div style={{ position: "fixed", right: 24, bottom: 24, zIndex: 90 }}>
          <Toast tone="success" title={toast.title} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   TRA CỨU HỒ SƠ HOÀN THÀNH
   ========================================================================== */
function CompletedScreen({ role, currentUser: currentUserProp }) {
  const L = window.LucideReact;
  const [q, setQ] = useSx("");
  const [fType, setFType] = useSx("all");
  const [viewer, setViewer] = useSx(null);
  const [overrides, setOverrides] = useSx({});
  const [toast, setToast] = useSx(null);
  const ROLE_NAMES = { arc: "Hoàng Minh Tuấn", ccv: "CCV Nguyễn Quốc Việt", tknv: "Trần Thị Mỹ Linh", cashier: "Phạm Thị Thu Hà", acct: "Đỗ Văn Kế" };
  const currentUser = currentUserProp || ROLE_NAMES[role] || "Người dùng";
  const correctable = role === "arc" || role === "ccv";
  const todayDMY = (() => { const [y, m, d] = VA_TODAY.split("-"); return d + "/" + m + "/" + y; })();

  const baseAll = useMemoSx(() => VA_ALL_SESSIONS.filter((s) => s.status === "done")
    .sort((a, b) => (a.completedAt < b.completedAt ? 1 : -1)), []);
  const all = baseAll.map((s) => overrides[s.id] ? { ...s, ...overrides[s.id] } : s);

  const applyCorrection = (p) => {
    const base = viewer; if (!base) return;
    const cur = overrides[base.id] || {};
    const { patch, audit, toast: tToast } = buildCorrectionResult(base, p, currentUser, todayDMY);
    if (p.arcRequest) {
      submitCorrReq({
        id: "YC-" + base.id.replace("PGD-", "") + "-" + Math.floor(Math.random() * 90 + 10),
        sessionId: base.id, customer: base.customer, type: p.option, ccNumber: base.ccNumber,
        notary: base.notary, by: currentUser, reason: p.reason, proposalCC: p.option === "B" ? p.newCC : undefined, proposalDetail: p.option === "D" ? p.proposalDetail : undefined, at: vaNow(), status: "pending",
        audit: [{ at: vaNow(), by: currentUser, action: "Gửi yêu cầu " + (CORR_LABEL[p.option] || "hiệu chỉnh") + " cho CCV", detail: p.reason }],
      });
    }
    const auditArr = (cur.audit || []).slice();
    if (audit) auditArr.push(audit);
    const merged = { ...cur, ...patch, audit: auditArr };
    setOverrides((prev) => ({ ...prev, [base.id]: merged }));
    setViewer({ ...base, ...merged });
    setToast(tToast);
    setTimeout(() => setToast(null), 4200);
  };

  const types = useMemoSx(() => { const set = new Set(); baseAll.forEach((s) => s.types.forEach((t) => set.add(t))); return [...set]; }, [baseAll]);

  const matchQ = (s) => {
    const k = vaNormalize(q); if (k.length < 1) return true;
    return [s.id, s.customer, s.notary, s.secretary, s.ccNumber, s.types.join(" "), s.completedAt].some((f) => vaNormalize(f).includes(k));
  };
  const visible = all.filter((s) => matchQ(s) && (fType === "all" || s.types.includes(fType)));

  const th = { padding: "11px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-tertiary)", whiteSpace: "nowrap" };
  const td = { padding: "12px 14px", fontSize: 13, color: "var(--text-secondary)", verticalAlign: "middle" };
  const { Button, Avatar, Toast } = window.FSICheckinDesignSystem_019df8;

  const TypeChip = ({ value, label }) => {
    const on = fType === value;
    return (
      <button type="button" onClick={() => setFType(value)} style={{
        padding: "6px 12px", borderRadius: "var(--radius-full)", cursor: "pointer", fontFamily: "var(--font-sans)",
        fontSize: 12.5, fontWeight: on ? 600 : 500, whiteSpace: "nowrap",
        border: "1px solid " + (on ? "var(--accent)" : "var(--border-default)"),
        background: on ? "var(--accent-muted)" : "var(--bg-surface)", color: on ? "var(--accent)" : "var(--text-secondary)",
      }}>{label}</button>
    );
  };

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: 24 }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <h1 style={{ fontSize: 19, fontWeight: 700, margin: 0 }}>Tra cứu hồ sơ hoàn thành</h1>
          <p style={{ fontSize: 13.5, color: "var(--text-tertiary)", margin: "3px 0 0" }}>Các phiên đã hoàn thành — tìm theo mã phiên, khách hàng, số công chứng, công chứng viên… · {all.length} hồ sơ</p>
        </div>

        {/* Bộ lọc */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 14, background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)" }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <L.Search size={15} color="var(--text-tertiary)" style={{ position: "absolute", left: 12 }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nhập mã phiên, tên khách hàng, số công chứng, CCV, biểu mẫu…"
              style={{ width: "100%", fontFamily: "var(--font-sans)", fontSize: 13.5, color: "var(--text-primary)", background: "var(--bg-inset)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", padding: "9px 12px 9px 34px", outline: "none" }}
              onFocus={(e) => { e.target.style.background = "#fff"; e.target.style.borderColor = "var(--accent)"; }}
              onBlur={(e) => { e.target.style.background = "var(--bg-inset)"; e.target.style.borderColor = "var(--border-default)"; }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: "var(--text-tertiary)", marginRight: 2 }}><L.Filter size={13} /> Loại việc:</span>
            <TypeChip value="all" label="Tất cả" />
            {types.map((t) => <TypeChip key={t} value={t} label={t} />)}
          </div>
        </div>

        {/* Bảng kết quả */}
        {visible.length === 0 ? (
          <div style={{ display: "grid", placeItems: "center", textAlign: "center", padding: "48px 12px", color: "var(--text-tertiary)", background: "var(--bg-surface)", border: "1px dashed var(--border-default)", borderRadius: "var(--radius-lg)" }}>
            <L.SearchX size={28} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 13.5 }}>Không tìm thấy hồ sơ hoàn thành khớp “{q.trim()}”.</div>
          </div>
        ) : (
          <div style={{ border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "var(--bg-surface)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border-subtle)" }}>
                {["Mã phiên", "Khách hàng", "Biểu mẫu", "Số công chứng", "CCV", "Hoàn thành", ""].map((h, i) => <th key={i} style={th}>{h}</th>)}
              </tr></thead>
              <tbody>
                {visible.map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: i === visible.length - 1 ? "none" : "1px solid var(--border-subtle)" }}>
                    <td style={{ ...td, fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--text-primary)", whiteSpace: "nowrap" }}>{s.id}</td>
                    <td style={td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <Avatar name={s.customer} size={26} />
                        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{s.customer}</span>
                      </div>
                    </td>
                    <td style={{ ...td, fontSize: 12.5 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {s.types.map((t, j) => <span key={j} style={{ fontSize: 11.5, padding: "2px 8px", borderRadius: "var(--radius-full)", background: "var(--bg-inset)", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{t}</span>)}
                      </div>
                    </td>
                    <td style={{ ...td, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent-hover)", whiteSpace: "nowrap" }}>{s.ccNumber}</td>
                    <td style={{ ...td, fontSize: 12.5, whiteSpace: "nowrap" }}>{(s.notary || "").replace(/^CCV /, "")}</td>
                    <td style={{ ...td, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>{s.completedAt}</td>
                    <td style={{ ...td, textAlign: "right", whiteSpace: "nowrap" }}>
                      <Button variant="secondary" size="sm" icon={L.Eye} onClick={() => setViewer(s)}>Xem hồ sơ</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {viewer && <SessionDetailModal session={viewer} onClose={() => setViewer(null)} role={role} correctable={correctable} currentUser={currentUser} onCorrected={applyCorrection} />}
      {toast && (
        <div style={{ position: "fixed", right: 24, bottom: 24, zIndex: 95 }}>
          <Toast tone={toast.tone || "success"} title={toast.title} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   HỒ SƠ CÁ NHÂN — nút tên ở góc phải topbar (menu + modal)
   profile: object từ VA_PROFILES · onLogout
   ========================================================================== */
function ProfileModal({ profile, onClose }) {
  const L = window.LucideReact;
  const { Avatar, Button } = window.FSICheckinDesignSystem_019df8;
  const [ident, setIdentState] = useSx(() => getIdent(profile));
  const [showPw, setShowPw] = useSx(false);
  const [saved, setSaved] = useSx(false);

  const save = () => { setIdent(profile, ident.toUpperCase()); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const Row = ({ label, value, mono }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
      <span style={{ fontSize: 10.5, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 13.5, color: "var(--text-primary)", fontFamily: mono ? "var(--font-mono)" : "inherit", wordBreak: "break-word" }}>{value}</span>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 90 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(28,28,26,.46)" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, maxWidth: "95%", maxHeight: "92%", background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 20px", borderBottom: "1px solid var(--border-default)", background: "var(--bg-elevated)" }}>
          <Avatar name={profile.name} size={48} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{profile.name}</div>
            <div style={{ fontSize: 13, color: "var(--accent-hover)", fontWeight: 500 }}>{profile.title}</div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 30, height: 30, border: "none", background: "transparent", borderRadius: 7, cursor: "pointer", display: "grid", placeItems: "center", color: "var(--text-tertiary)" }}><L.X size={18} /></button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Thông tin cá nhân */}
          <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-tertiary)" }}><L.IdCard size={14} /> Thông tin cá nhân</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 16px", padding: "14px 16px", background: "var(--bg-overlay)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <Row label="Họ và tên" value={profile.name} />
              <Row label="Chức vụ" value={profile.title} />
              <Row label="Ngày sinh" value={profile.dob} mono />
              <Row label="Số CCCD" value={profile.cccd} mono />
              <Row label="Điện thoại" value={profile.phone} mono />
              <Row label="Email" value={profile.email} />
              <Row label="Ngày vào làm" value={profile.joined} mono />
            </div>
          </section>

          {/* Thông tin đăng nhập */}
          <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-tertiary)" }}><L.KeyRound size={14} /> Thông tin đăng nhập</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 16px", padding: "14px 16px", background: "var(--bg-overlay)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", alignItems: "center" }}>
              <Row label="Tài khoản" value={profile.account} mono />
              <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                <span style={{ fontSize: 10.5, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 600 }}>Mật khẩu</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13.5, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{showPw ? profile.password : "••••••••••"}</span>
                  <button type="button" onClick={() => setShowPw((v) => !v)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-tertiary)", display: "grid", placeItems: "center", padding: 0 }}>{showPw ? <L.EyeOff size={15} /> : <L.Eye size={15} />}</button>
                </div>
              </div>
            </div>
          </section>

          {/* Ký tự định danh — chỉ CCV/TKNV */}
          {profile.hasIdent && (
            <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-tertiary)" }}><L.Fingerprint size={14} /> Ký tự định danh người soạn</div>
              <div style={{ padding: "14px 16px", background: "var(--accent-muted)", borderRadius: "var(--radius-md)", border: "1px solid var(--accent-border)", display: "flex", flexDirection: "column", gap: 12 }}>
                <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  Ký tự này sẽ <b>tự động in ở cuối mỗi văn bản</b> bạn soạn, dùng để định danh người soạn khi tra cứu hồ sơ vật lý.
                </p>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-secondary)" }}>Ký tự định danh</label>
                    <input value={ident} onChange={(e) => setIdentState(e.target.value.slice(0, 8).toUpperCase())} maxLength={8} placeholder="VD: NQV"
                      style={{ width: 140, fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, letterSpacing: ".08em", textAlign: "center", color: "var(--accent-hover)", background: "#fff", border: "1px solid var(--accent-border)", borderRadius: "var(--radius-md)", padding: "8px 10px", outline: "none" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginBottom: 5 }}>Xem trước cuối văn bản</div>
                    <div style={{ fontSize: 12, fontFamily: "'Times New Roman', serif", fontStyle: "italic", color: "var(--text-secondary)", padding: "8px 12px", background: "#fff", border: "1px dashed var(--border-strong)", borderRadius: "var(--radius-md)" }}>
                      … Người soạn: <b style={{ fontStyle: "normal" }}>{ident || "—"}</b>
                    </div>
                  </div>
                  <Button variant="primary" icon={saved ? L.Check : L.Save} onClick={save}>{saved ? "Đã lưu" : "Lưu định danh"}</Button>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   Modal: Từ chối yêu cầu hiệu chỉnh (CCV nhập lý do trả về Lưu trữ)
   ========================================================================== */
function RejectRequestModal({ req, currentUser, onClose, onConfirm }) {
  const L = window.LucideReact;
  const { Button } = window.FSICheckinDesignSystem_019df8;
  const [reason, setReason] = useSx("");
  const can = reason.trim().length > 0;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 95, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(28,28,26,.5)" }} />
      <div style={{ position: "relative", width: 480, maxWidth: "100%", background: "var(--bg-surface)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: "1px solid var(--border-default)" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "color-mix(in srgb, #dc2626 12%, transparent)", display: "grid", placeItems: "center" }}><L.XCircle size={17} color="#dc2626" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600 }}>Từ chối yêu cầu</div>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>{req.sessionId} · {req.customer}</div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 30, height: 30, border: "none", background: "transparent", borderRadius: 7, cursor: "pointer", display: "grid", placeItems: "center", color: "var(--text-tertiary)" }}><L.X size={18} /></button>
        </div>
        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>Yêu cầu <b>{CORR_LABEL[req.type] || "hiệu chỉnh"}</b> sẽ được trả lại cho <b>{req.by}</b> (Lưu trữ) kèm lý do từ chối. Không có thao tác xóa nào được thực hiện.</div>
          <div>
            <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Lý do từ chối <span style={{ color: "#dc2626" }}>*</span></label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Bắt buộc — nêu rõ lý do để Lưu trữ điều chỉnh và gửi lại…"
              style={{ width: "100%", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "8px 11px", fontFamily: "var(--font-sans)", fontSize: 13, background: "var(--bg-inset)", color: "var(--text-primary)", outline: "none", boxSizing: "border-box", resize: "vertical", lineHeight: 1.5 }} />
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "var(--text-tertiary)" }}>
            <L.ShieldCheck size={14} style={{ flexShrink: 0, marginTop: 1 }} /> Quyết định từ chối được ghi Audit Trail đích danh cả người gửi lẫn người duyệt.
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="secondary" onClick={onClose}>Hủy bỏ</Button>
            <div style={{ flex: 1 }} />
            <button type="button" disabled={!can} onClick={() => can && onConfirm(reason.trim())} style={{
              display: "inline-flex", alignItems: "center", gap: 8, height: 40, padding: "0 18px", borderRadius: "var(--radius-md)", border: "none",
              cursor: can ? "pointer" : "not-allowed", opacity: can ? 1 : .5, fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, color: "#fff", background: "#dc2626",
            }}><L.XCircle size={16} /> Từ chối &amp; trả về Lưu trữ</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   Màn CCV: HỘP THƯ YÊU CẦU HIỆU CHỈNH
   Định tuyến theo CCV đã ký · tái dùng pop-up chi tiết ở chế độ CCV · ghi Audit Trail.
   ========================================================================== */
function RequestsScreen({ currentUser, isCoverage }) {
  const L = window.LucideReact;
  const { Button, Toast } = window.FSICheckinDesignSystem_019df8;
  const me = currentUser || CCV_ME;
  const [tick, setTick] = useSx(0);
  const [overrides, setOverrides] = useSx({});
  const [viewer, setViewer] = useSx(null);
  const [activeReq, setActiveReq] = useSx(null);
  const [rejectReq, setRejectReq] = useSx(null);
  const [toast, setToast] = useSx(null);
  const todayDMY = (() => { const [y, m, d] = VA_TODAY.split("-"); return d + "/" + m + "/" + y; })();

  const reqs = useMemoSx(() => corrReqsForCcv(me, isCoverage), [me, isCoverage, tick]);
  const flash = (t) => { setToast(t); setTimeout(() => setToast(null), 4200); };

  const sessionFor = (req) => {
    const base = VA_ALL_SESSIONS.find((x) => x.id === req.sessionId) || { id: req.sessionId, customer: req.customer, types: [], status: "done", ccNumber: req.ccNumber, notary: req.notary, creator: "—", secretary: "—" };
    return overrides[req.sessionId] ? { ...base, ...overrides[req.sessionId] } : base;
  };
  const openReq = (req) => { setActiveReq(req); setViewer(sessionFor(req)); };

  const onCorrected = (p) => {
    if (!viewer || !activeReq) return;
    const base = viewer;
    const cur = overrides[base.id] || {};
    const { patch, audit, toast: tToast } = buildCorrectionResult(base, { ...p, arcRequest: false }, me, todayDMY);
    const auditArr = (cur.audit || []).slice(); if (audit) auditArr.push(audit);
    setOverrides((prev) => ({ ...prev, [base.id]: { ...cur, ...patch, audit: auditArr } }));
    updateCorrReq(activeReq.id, {
      status: "approved", decidedBy: me, decidedAt: vaNow(),
      audit: [...(activeReq.audit || []), { at: vaNow(), by: me, action: "Duyệt & thực hiện " + (CORR_LABEL[activeReq.type] || "hiệu chỉnh"), detail: p.reason }],
    });
    setViewer(null); setActiveReq(null); setTick((t) => t + 1);
    flash(tToast);
  };

  const doReject = (reason) => {
    const r = rejectReq;
    updateCorrReq(r.id, {
      status: "rejected", decidedBy: me, decidedAt: vaNow(), rejectReason: reason,
      audit: [...(r.audit || []), { at: vaNow(), by: me, action: "Từ chối yêu cầu " + (CORR_LABEL[r.type] || "hiệu chỉnh") + " — trả về Lưu trữ", detail: reason }],
    });
    setRejectReq(null); setTick((t) => t + 1);
    flash({ tone: "info", title: "Đã từ chối & trả về Lưu trữ", message: r.sessionId + " — yêu cầu đã trả lại " + r.by + " kèm lý do." });
  };

  const typeStyle = { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 700, color: "#b45309", background: "color-mix(in srgb, #d97706 13%, transparent)", border: "1px solid color-mix(in srgb, #d97706 30%, transparent)", borderRadius: "var(--radius-full)", padding: "3px 10px" };
  const typeIcon = { B: "Replace", C: "Ban", D: "Stamp" };

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: 24 }}>
      <div style={{ maxWidth: 920, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <h1 style={{ fontSize: 19, fontWeight: 700, margin: 0 }}>Yêu cầu hiệu chỉnh</h1>
          <p style={{ fontSize: 13.5, color: "var(--text-tertiary)", margin: "3px 0 0" }}>Các yêu cầu sửa Số CC / Hủy số gửi tới hồ sơ bạn đã ký.</p>
        </div>

        {isCoverage && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--accent-hover)", padding: "9px 13px", borderRadius: "var(--radius-md)", background: "var(--accent-muted)", border: "1px solid var(--accent-border)" }}>
            <L.UserCheck size={15} style={{ flexShrink: 0 }} /> <span>Bạn đang ở vai trò <b>CCV phụ trách</b> — hiển thị thêm yêu cầu của CCV vắng mặt: {CCV_ABSENT.map((x) => x.replace(/^CCV /, "")).join(", ")}.</span>
          </div>
        )}

        {reqs.length === 0 ? (
          <div style={{ display: "grid", placeItems: "center", textAlign: "center", padding: "56px 12px", color: "var(--text-tertiary)", background: "var(--bg-surface)", border: "1px dashed var(--border-default)", borderRadius: "var(--radius-lg)" }}>
            <L.Inbox size={30} style={{ marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}>Không có yêu cầu nào chờ duyệt</div>
            <div style={{ fontSize: 12.5, marginTop: 3 }}>Khi Lưu trữ gửi yêu cầu sửa Số CC / Hủy số tới hồ sơ bạn đã ký, chúng sẽ hiện ở đây.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {reqs.map((r) => {
              const TIcon = L[typeIcon[r.type] || "FileCog"];
              const cover = !CCV_ABSENT.includes(me) && CCV_ABSENT.includes(r.notary);
              return (
                <div key={r.id} style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderLeft: "3px solid #d97706", borderRadius: "var(--radius-lg)", padding: "15px 17px", display: "flex", flexDirection: "column", gap: 12, boxShadow: "var(--shadow-xs)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--text-tertiary)" }}>{r.sessionId}</span>
                        <span style={{ fontSize: 14.5, fontWeight: 700 }}>{r.customer}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap", marginTop: 7 }}>
                        <span style={typeStyle}><TIcon size={13} /> {CORR_LABEL[r.type] || "Hiệu chỉnh"}</span>
                        <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>Số CC: <b style={{ fontFamily: "var(--font-mono)" }}>{r.ccNumber || "—"}</b></span>
                        {cover && <span style={{ fontSize: 11, fontWeight: 600, color: "var(--accent-hover)", background: "var(--accent-muted)", border: "1px solid var(--accent-border)", borderRadius: "var(--radius-full)", padding: "2px 9px" }}>Phụ trách hộ · {r.notary.replace(/^CCV /, "")}</span>}
                      </div>
                    </div>
                    <span style={{ fontSize: 11.5, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>{r.at}</span>
                  </div>
                  {r.type === "B" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 13, flexWrap: "wrap", padding: "10px 13px", borderRadius: "var(--radius-md)", background: "var(--bg-overlay)", border: "1px solid var(--border-subtle)" }}>
                      <div>
                        <div style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 700 }}>Hiện tại</div>
                        <div style={{ fontSize: 14.5, fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", textDecoration: "line-through", marginTop: 2 }}>{r.ccNumber || "—"}</div>
                      </div>
                      <L.ArrowRight size={18} color="var(--text-tertiary)" />
                      <div>
                        <div style={{ fontSize: 10, color: "var(--accent)", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 700 }}>Đề xuất</div>
                        <div style={{ fontSize: 14.5, fontFamily: "var(--font-mono)", color: "var(--accent-hover)", fontWeight: 700, marginTop: 2 }}>{r.proposalCC || "—"}</div>
                      </div>
                    </div>
                  )}
                  {r.type === "D" && r.proposalDetail && (
                    <div style={{ display: "flex", gap: 8, fontSize: 12.5, color: "var(--text-secondary)", padding: "9px 12px", borderRadius: "var(--radius-md)", background: "var(--bg-overlay)", border: "1px solid var(--border-subtle)" }}>
                      <L.AlertCircle size={15} color={"#b45309"} style={{ flexShrink: 0, marginTop: 1 }} /> <span><b style={{ color: "var(--text-primary)" }}>Chỗ sai:</b> {r.proposalDetail}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 10, padding: "10px 12px", background: "var(--bg-overlay)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                    <L.MessageSquareText size={15} color="var(--text-tertiary)" style={{ flexShrink: 0, marginTop: 1 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, color: "var(--text-primary)", lineHeight: 1.5 }}>“{r.reason}”</div>
                      <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginTop: 3 }}>Người gửi: <b style={{ color: "var(--text-secondary)" }}>{r.by}</b> · Lưu trữ viên</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ flex: 1 }} />
                    <Button variant="secondary" icon={L.XCircle} onClick={() => setRejectReq(r)}>Từ chối</Button>
                    <Button variant="primary" icon={L.FileCog} onClick={() => openReq(r)}>Xem &amp; xử lý</Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {viewer && <SessionDetailModal session={viewer} onClose={() => { setViewer(null); setActiveReq(null); }} role="ccv" correctable={true} currentUser={me} onCorrected={onCorrected} incomingRequest={activeReq} onReject={() => { const r = activeReq; setViewer(null); setActiveReq(null); setRejectReq(r); }} />}
      {rejectReq && <RejectRequestModal req={rejectReq} currentUser={me} onClose={() => setRejectReq(null)} onConfirm={doReject} />}
      {toast && (
        <div style={{ position: "fixed", right: 24, bottom: 24, zIndex: 95 }}>
          <Toast tone={toast.tone || "success"} title={toast.title} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
}

function ProfileButton({ profile, onLogout }) {
  const L = window.LucideReact;
  const { Avatar } = window.FSICheckinDesignSystem_019df8;
  const [open, setOpen] = useSx(false);
  const [modal, setModal] = useSx(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  if (!profile) return null;
  const Item = ({ icon, label, onClick, danger }) => {
    const Icon = L[icon];
    return (
      <button type="button" onClick={onClick} style={{
        display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", border: "none", background: "transparent",
        cursor: "pointer", borderRadius: "var(--radius-md)", textAlign: "left", fontFamily: "var(--font-sans)", fontSize: 13,
        color: danger ? "var(--text-danger)" : "var(--text-primary)",
      }}
        onMouseEnter={(e) => (e.currentTarget.style.background = danger ? "var(--bg-danger)" : "var(--bg-overlay)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
        <Icon size={16} /> {label}
      </button>
    );
  };
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div onClick={() => setOpen((v) => !v)} title="Hồ sơ cá nhân" style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px", borderRadius: "var(--radius-md)", cursor: "pointer" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-overlay)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
        <Avatar name={profile.name} size={26} />
        <div style={{ lineHeight: 1.15, whiteSpace: "nowrap" }}>
          <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text-primary)" }}>{profile.name}</div>
          <div style={{ fontSize: 10.5, color: "var(--text-tertiary)" }}>{profile.title}</div>
        </div>
        <L.ChevronDown size={14} color="var(--text-tertiary)" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
      </div>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 60, minWidth: 220, background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)", padding: 5 }}>
          <div style={{ padding: "8px 12px 9px", borderBottom: "1px solid var(--border-subtle)", marginBottom: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{profile.name}</div>
            <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>{profile.email}</div>
          </div>
          <Item icon="UserCog" label="Xem hồ sơ cá nhân" onClick={() => { setOpen(false); setModal(true); }} />
          <Item icon="LogOut" label="Đăng xuất" danger onClick={() => { setOpen(false); onLogout && onLogout(); }} />
        </div>
      )}
      {modal && <ProfileModal profile={profile} onClose={() => setModal(false)} />}
    </div>
  );
}

window.VASessions = { OverviewScreen, CompletedScreen, RequestsScreen, SESSION_STATUS, ProfileButton, VA_PROFILES, VA_DRAFTERS, getIdent, identForName, lockSession, unlockSession, VA_ALL_SESSIONS, feeOfType, daysOverdue, vaNow, VA_TODAY, corrReqsForCcv, getCorrReqs, CCV_ABSENT };
