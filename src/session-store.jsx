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
    types: (row.bieuMaus || []).map((b) => b.ten),
    photos: (row.fileScans || []).length,
    ccNumber: row.soCongChung || row.soChungThuc || row.soSaoY || null,
    fee: Number(row.phiDichVu || 0),
    completedAt: row.trangThai === "HOAN_TAT" ? fmtDT(row.updatedAt) : undefined,
    invoiced: false,
    noHoSo: !!row.noHoSo,
    noTienThu: !!row.noTienThu,
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
