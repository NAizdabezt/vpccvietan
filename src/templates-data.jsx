/* global React, window, localStorage */
/* VPCC Việt An — Mô hình biểu mẫu có trường dữ liệu (field token) + kho biểu mẫu (localStorage).
   Trường dữ liệu được OCR tự động điền và cho phép kéo-thả / sửa trực tiếp. */
const { useState: useTplState, useEffect: useTplEffect } = React;

/* Nhãn hiển thị cho từng khóa trường ngữ nghĩa */
const VA_FIELD_LABELS = {
  hoTen_A: "Họ tên Bên A",
  ngaySinh_A: "Ngày sinh Bên A",
  cccd_A: "CCCD Bên A",
  diaChi_A: "Địa chỉ Bên A",
  hoTen_B: "Họ tên Bên B",
  ngaySinh_B: "Ngày sinh Bên B",
  cccd_B: "CCCD Bên B",
  diaChi_B: "Địa chỉ Bên B",
  thuaDat: "Thửa đất số",
  toBanDo: "Tờ bản đồ số",
  dienTich: "Diện tích",
  diaChiDat: "Địa chỉ thửa đất",
  gia: "Giá / giá trị",
  bienSo: "Biển số xe",
  nhanHieu: "Nhãn hiệu",
  soKhung: "Số khung",
  soMay: "Số máy",
};

/* Token trường: { f: 'hoTen_A' } -> dựng nhãn từ bảng trên */
function F(key) { return { f: key, label: VA_FIELD_LABELS[key] || key }; }

/* ---- Khối nội dung biểu mẫu theo loại hợp đồng ---- */
function LAND_BLOCKS(name, verb) {
  const V = verb || "CHUYỂN NHƯỢNG";
  return [
    { tag: "dt", parts: [name.toUpperCase()] },
    { tag: "dm", parts: ["Số công chứng: …/2026 — quyển số 03 TP/CC-SCC/HĐGD"] },
    { tag: "dh", parts: ["BÊN " + V + " (BÊN A)"] },
    { tag: "p", parts: ["Ông/Bà: ", F("hoTen_A"), ", sinh ngày ", F("ngaySinh_A"), ", CCCD số ", F("cccd_A"), ", thường trú tại ", F("diaChi_A"), "."] },
    { tag: "dh", parts: ["BÊN NHẬN (BÊN B)"] },
    { tag: "p", parts: ["Ông/Bà: ", F("hoTen_B"), ", sinh ngày ", F("ngaySinh_B"), ", CCCD số ", F("cccd_B"), ", thường trú tại ", F("diaChi_B"), "."] },
    { tag: "dh", parts: ["ĐIỀU 1. ĐỐI TƯỢNG CỦA HỢP ĐỒNG"] },
    { tag: "p", parts: ["Quyền sử dụng thửa đất số ", F("thuaDat"), ", tờ bản đồ số ", F("toBanDo"), ", diện tích ", F("dienTich"), ", tại ", F("diaChiDat"), "."] },
    { tag: "dh", parts: ["ĐIỀU 2. GIÁ TRỊ VÀ PHƯƠNG THỨC THANH TOÁN"] },
    { tag: "p", parts: ["Giá trị giao dịch là ", F("gia"), " đồng. Phương thức thanh toán: ……………………"] },
    { tag: "ds", parts: ["Hai bên đã đọc lại, hiểu rõ và đồng ý toàn bộ nội dung hợp đồng."] },
  ];
}
function VEHICLE_BLOCKS(name) {
  return [
    { tag: "dt", parts: [name.toUpperCase()] },
    { tag: "dm", parts: ["Số công chứng: …/2026 — quyển số 03 TP/CC-SCC/HĐGD"] },
    { tag: "dh", parts: ["BÊN BÁN (BÊN A)"] },
    { tag: "p", parts: ["Ông/Bà: ", F("hoTen_A"), ", CCCD số ", F("cccd_A"), ", thường trú tại ", F("diaChi_A"), "."] },
    { tag: "dh", parts: ["BÊN MUA (BÊN B)"] },
    { tag: "p", parts: ["Ông/Bà: ", F("hoTen_B"), ", CCCD số ", F("cccd_B"), ", thường trú tại ", F("diaChi_B"), "."] },
    { tag: "dh", parts: ["ĐIỀU 1. ĐẶC ĐIỂM XE"] },
    { tag: "p", parts: ["Biển số ", F("bienSo"), ", nhãn hiệu ", F("nhanHieu"), ", số khung ", F("soKhung"), ", số máy ", F("soMay"), "."] },
    { tag: "dh", parts: ["ĐIỀU 2. GIÁ MUA BÁN"] },
    { tag: "p", parts: ["Giá mua bán là ", F("gia"), " đồng."] },
    { tag: "ds", parts: ["Hai bên đã đọc lại, hiểu rõ và đồng ý toàn bộ nội dung hợp đồng."] },
  ];
}
function AUTH_BLOCKS(name) {
  return [
    { tag: "dt", parts: [name.toUpperCase()] },
    { tag: "dm", parts: ["Số công chứng: …/2026 — quyển số 03 TP/CC-SCC/HĐGD"] },
    { tag: "dh", parts: ["BÊN ỦY QUYỀN (BÊN A)"] },
    { tag: "p", parts: ["Ông/Bà: ", F("hoTen_A"), ", sinh ngày ", F("ngaySinh_A"), ", CCCD số ", F("cccd_A"), ", thường trú tại ", F("diaChi_A"), "."] },
    { tag: "dh", parts: ["BÊN ĐƯỢC ỦY QUYỀN (BÊN B)"] },
    { tag: "p", parts: ["Ông/Bà: ", F("hoTen_B"), ", sinh ngày ", F("ngaySinh_B"), ", CCCD số ", F("cccd_B"), ", thường trú tại ", F("diaChi_B"), "."] },
    { tag: "dh", parts: ["ĐIỀU 1. PHẠM VI ỦY QUYỀN"] },
    { tag: "p", parts: ["Bên A ủy quyền cho Bên B thực hiện: ……………………………………………………………"] },
    { tag: "ds", parts: ["Hai bên đã đọc lại, hiểu rõ và đồng ý toàn bộ nội dung văn bản."] },
  ];
}
function GENERIC_BLOCKS(name) {
  return [
    { tag: "dt", parts: [name.toUpperCase()] },
    { tag: "dm", parts: ["Số công chứng: …/2026 — quyển số 03 TP/CC-SCC/HĐGD"] },
    { tag: "dh", parts: ["BÊN A"] },
    { tag: "p", parts: ["Ông/Bà: ", F("hoTen_A"), ", CCCD số ", F("cccd_A"), ", thường trú tại ", F("diaChi_A"), "."] },
    { tag: "dh", parts: ["BÊN B"] },
    { tag: "p", parts: ["Ông/Bà: ", F("hoTen_B"), ", CCCD số ", F("cccd_B"), ", thường trú tại ", F("diaChi_B"), "."] },
    { tag: "dh", parts: ["NỘI DUNG"] },
    { tag: "p", parts: ["……………………………………………………………………………………………………………………"] },
    { tag: "ds", parts: ["Hai bên đã đọc lại, hiểu rõ và đồng ý toàn bộ nội dung văn bản."] },
  ];
}

/* Loại hợp đồng -> bộ khối nội dung */
const VA_CONTRACT_TYPES = [
  { group: "Bất động sản", kind: "land",    desc: "Chuyển nhượng / tặng cho QSDĐ, nhà ở" },
  { group: "Động sản",     kind: "vehicle", desc: "Mua bán xe, tài sản động sản" },
  { group: "Ủy quyền",     kind: "auth",    desc: "Giấy / hợp đồng ủy quyền" },
  { group: "Khác",         kind: "generic", desc: "Văn bản công chứng khác" },
];

function kindOf(tpl) {
  if (tpl.kind) return tpl.kind;
  const byTid = { t1: "land", t2: "vehicle", t3: "auth", t4: "land" };
  if (tpl.tid && byTid[tpl.tid]) return byTid[tpl.tid];
  const byGroup = { "Bất động sản": "land", "Động sản": "vehicle", "Ủy quyền": "auth" };
  return byGroup[tpl.group] || "generic";
}

function blocksFor(tpl) {
  const k = kindOf(tpl);
  if (k === "land") return LAND_BLOCKS(tpl.name, tpl.tid === "t4" || /tặng cho/i.test(tpl.name) ? "TẶNG CHO" : "CHUYỂN NHƯỢNG");
  if (k === "vehicle") return VEHICLE_BLOCKS(tpl.name);
  if (k === "auth") return AUTH_BLOCKS(tpl.name);
  return GENERIC_BLOCKS(tpl.name);
}

/* Khóa trường nào có trong biểu mẫu (để biết auto-fill đã dùng gì) */
function fieldKeysOf(tpl) {
  const keys = [];
  blocksFor(tpl).forEach((b) => b.parts.forEach((p) => { if (p && p.f) keys.push(p.f); }));
  return keys;
}

/* Bản đồ tự động: gom giá trị OCR theo khóa ngữ nghĩa */
function buildAutoMap(ocrDocs) {
  const map = {};
  (ocrDocs || []).forEach((d) => (d.fields || []).forEach((f) => { if (f.fkey && f.value) map[f.fkey] = { value: f.value, mono: f.mono, from: d.name }; }));
  return map;
}

/* ============ Kho biểu mẫu (localStorage) ============ */
const TPL_STORE_KEY = "va_templates_v1";
const TPL_SEED = [
  { id: "t1", name: "HĐ Chuyển nhượng QSDĐ", group: "Bất động sản", kind: "land",    builtin: true },
  { id: "t2", name: "HĐ Mua bán xe",         group: "Động sản",     kind: "vehicle", builtin: true },
  { id: "t3", name: "Văn bản ủy quyền",      group: "Ủy quyền",     kind: "auth",    builtin: true },
  { id: "t4", name: "HĐ Tặng cho QSDĐ",      group: "Bất động sản", kind: "land",    builtin: true },
];

const tplListeners = new Set();
function loadTpls() {
  try {
    const raw = localStorage.getItem(TPL_STORE_KEY);
    if (raw) { const arr = JSON.parse(raw); if (Array.isArray(arr) && arr.length) return arr; }
  } catch (e) { /* ignore */ }
  return TPL_SEED.map((t) => ({ ...t }));
}
let _tpls = loadTpls();
function saveTpls() {
  try { localStorage.setItem(TPL_STORE_KEY, JSON.stringify(_tpls)); } catch (e) { /* ignore */ }
  tplListeners.forEach((fn) => fn(_tpls));
}

const VATemplates = {
  list() { return _tpls.slice(); },
  add({ name, group, by, fileName }) {
    const t = VA_CONTRACT_TYPES.find((x) => x.group === group) || VA_CONTRACT_TYPES[3];
    const id = "tpl-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const item = { id, name: name.trim() || "Biểu mẫu mới", group: t.group, kind: t.kind, builtin: false, by: by || "—", fileName: fileName || null, createdAt: new Date().toLocaleDateString("vi-VN") };
    _tpls = [..._tpls, item]; saveTpls(); return item;
  },
  rename(id, name) { _tpls = _tpls.map((t) => t.id === id ? { ...t, name: name.trim() || t.name } : t); saveTpls(); },
  setGroup(id, group) {
    const t = VA_CONTRACT_TYPES.find((x) => x.group === group) || VA_CONTRACT_TYPES[3];
    _tpls = _tpls.map((x) => x.id === id ? { ...x, group: t.group, kind: t.kind } : x); saveTpls();
  },
  remove(id) { _tpls = _tpls.filter((t) => t.id !== id); saveTpls(); },
  resetSeed() { _tpls = TPL_SEED.map((t) => ({ ...t })); saveTpls(); },
  subscribe(fn) { tplListeners.add(fn); return () => tplListeners.delete(fn); },
};

/* Hook React cho danh sách biểu mẫu sống */
function useTemplates() {
  const [list, setList] = useTplState(VATemplates.list());
  useTplEffect(() => VATemplates.subscribe((l) => setList(l.slice())), []);
  return list;
}

window.VATemplates = VATemplates;
window.VATemplateModel = {
  VA_FIELD_LABELS, VA_CONTRACT_TYPES, blocksFor, fieldKeysOf, buildAutoMap, kindOf, useTemplates,
};
