/* global window, React */
/* Nguồn dữ liệu Hồ sơ DÙNG CHUNG cho mọi màn hình (Luồng tổng quan, Thu ngân,
   Lưu trữ...) — thay thế 3 bản sao độc lập trước đây (VA_ALL_SESSIONS tĩnh
   trong sessions.jsx, POS_DATA.queue, _arcRows trong arc/pipeline.jsx) vốn
   không đồng bộ với nhau. Tất cả giờ đọc/ghi qua đây, gọi API thật (server/).
   Export: window.VAStore = { useHoSoStore, patchLocal, refresh, fromApi, ... } */
const { useState: useSS, useEffect: useEffSS } = React;

const STATUS_DB_TO_UI = {
  NHAP_LIEU: "draft",
  CHO_CCV: "drafting",
  CHO_THU_NGAN: "waitNumberPay",
  DANG_LIEN_THONG: "waitAttach",
  HOAN_TAT: "done",
  CHO_BO_SUNG: "drafting",
  LOI: "waitAttach",
};
const STATUS_UI_TO_DB = {
  draft: "NHAP_LIEU",
  drafting: "CHO_CCV",
  waitNumberPay: "CHO_THU_NGAN",
  waitAttach: "DANG_LIEN_THONG",
  done: "HOAN_TAT",
};

function fmtDT(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} · ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function isoDate(iso) { return iso ? iso.slice(0, 10) : ""; }

// Chuyển 1 bản ghi HoSo từ API sang đúng shape mà OverviewScreen/arc/pipeline
// đang dùng (id hiển thị = maPhien; hoSoId = UUID thật dùng khi gọi API).
function fromApi(row) {
  return {
    id: row.maPhien,
    hoSoId: row.id,
    customer: row.khachHang ? row.khachHang.hoTen : "",
    date: isoDate(row.ngayTao),
    createdAt: fmtDT(row.ngayTao),
    updatedAt: fmtDT(row.updatedAt),
    status: STATUS_DB_TO_UI[row.trangThai] || "draft",
    dbStatus: row.trangThai,
    creator: row.tknv ? row.tknv.hoTen : "",
    secretary: row.tknv ? row.tknv.hoTen : "",
    notary: row.ccv ? "CCV " + row.ccv.hoTen : "",
    ccvId: row.ccvId || null,
    // Dùng để suy tiền tố Số CC/CT/SY thật khi hiện Smart Hint ở màn Thu ngân
    // (0036=HOP_DONG, CT=CHUNG_THUC, SY=SAO_Y — khớp đúng /cap-so ở server).
    loaiHoSo: row.loaiHoSo,
    types: (row.bieuMaus || []).map((b) => b.ten),
    // Phí thật theo TỪNG biểu mẫu (BieuMau.phiMacDinh) — dùng để phiếu thu Thu
    // ngân hiện đúng giá thật thay vì bảng giá cứng đoán theo tên loại HĐ.
    bieuMaus: (row.bieuMaus || []).map((b) => ({ id: b.id, ten: b.ten, phi: Number(b.phiMacDinh || 0) })),
    photos: (row.fileScans || []).length,
    // Mảng file thật (giấy tờ đính kèm/ảnh tra cứu/ảnh CCV/file đã số hóa
    // VB-HS) — trước đây chỉ có số đếm ở "photos", làm "Xem" không preview
    // được gì thật. Giữ nguyên field ngày ISO gốc để so sánh/sắp xếp nếu cần.
    fileScans: (row.fileScans || []).map((f) => ({
      id: f.id, loaiFile: f.loaiFile, tenFile: f.tenFile, duongDan: f.duongDan,
      dinhDang: f.dinhDang, createdAt: f.createdAt,
    })),
    ccNumber: row.soCongChung || row.soChungThuc || row.soSaoY || null,
    fee: Number(row.phiDichVu || 0),
    completedAt: row.trangThai === "HOAN_TAT" ? fmtDT(row.updatedAt) : undefined,
    // Trước đây luôn hardcode false — màn Kế toán do đó không bao giờ thấy
    // đúng hồ sơ nào đã thật sự xuất hóa đơn (HoSo.hoaDonId có thật ở server).
    invoiced: !!row.hoaDonId,
    noHoSo: !!row.noHoSo,
    noTienThu: !!row.noTienThu,
    // Số tiền đã thực thu ở lần cấp số — cần để tính "còn nợ bao nhiêu" (fee - soTienThucThu)
    // vì trước đây cờ noTienThu được ghi mà không nơi nào tính/hiện số tiền còn thiếu.
    soTienThucThu: row.soTienThucThu != null ? Number(row.soTienThucThu) : null,
    // Hình thức thu THẬT lúc cấp số (cash/transfer) — khác "payMethod" bên dưới,
    // vốn đã dùng cho luồng hiệu chỉnh mock riêng (chuỗi tiếng Việt hiển thị).
    hinhThucThu: row.hinhThucThanhToan === "CHUYEN_KHOAN" ? "transfer" : row.hinhThucThanhToan === "TIEN_MAT" ? "cash" : null,
    // Khóa soạn thảo THẬT từ server (thay cho khóa giả localStorage trước đây).
    lockedBy: row.dangSoanBoi ? row.dangSoanBoi.hoTen : null,
    lockedById: row.dangSoanBoiId || null,
    lockedAt: row.dangSoanTu ? fmtDT(row.dangSoanTu) : null,
  };
}

let _rows = null;
let _loading = false;
const _subs = new Set();
function notify() { _subs.forEach((fn) => fn()); }

async function ensureLoaded() {
  if (_rows || _loading) return;
  _loading = true;
  try {
    const data = await window.VAApi.hoSo.list();
    _rows = data.map(fromApi);
  } catch (e) {
    console.error("Không tải được danh sách hồ sơ:", e);
    _rows = [];
  } finally {
    _loading = false;
    notify();
  }
}

async function refresh() {
  _loading = false;
  _rows = null;
  await ensureLoaded();
}

// Cập nhật lạc quan (optimistic) trong bộ nhớ — dùng ngay sau khi 1 thao tác gọi
// API thành công, để MỌI màn hình đang mở cùng thấy thay đổi ngay lập tức.
function patchLocal(hoSoId, patch) {
  if (!_rows) return;
  _rows = _rows.map((r) => (r.hoSoId === hoSoId ? { ...r, ...patch } : r));
  notify();
}

function useHoSoStore() {
  const [, force] = useSS(0);
  useEffSS(() => {
    const fn = () => force((x) => x + 1);
    _subs.add(fn);
    ensureLoaded();
    return () => _subs.delete(fn);
  }, []);
  return _rows || [];
}

window.VAStore = { useHoSoStore, patchLocal, refresh, fromApi, STATUS_DB_TO_UI, STATUS_UI_TO_DB };
