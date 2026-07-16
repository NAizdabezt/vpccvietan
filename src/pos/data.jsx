/* global window */
/* PH02 — Thu ngân & Kế toán · mock dữ liệu */

const POS_DATA = {
  cashier: { name: "Phạm Thị Thu Hà", code: "HA.PTT" },
  accountant: { name: "Đỗ Văn Kế", code: "KE.DV" },
  today: "07/06/2026",
  shift: "Ca sáng",

  // Số công chứng — Smart Hint
  soCC: {
    book: "0036",
    year: "2026",
    next: 1923,
    missing: [1918, 1920], // số bị bỏ trống cần ưu tiên lấp
    lastUsed: 1922,
  },

  // KPI ngày
  stats: [
    { label: "Phiếu đã thu", value: "38", icon: "ReceiptText", tone: "default" },
    { label: "Doanh thu ca", value: "24.860.000₫", icon: "TrendingUp", tone: "success" },
    { label: "Đang chờ thu", value: "6", icon: "Clock", tone: "warning" },
    { label: "Công nợ", value: "3", icon: "AlertTriangle", tone: "danger" },
  ],

  // Người soạn (Thư ký nghiệp vụ) — mã ↔ tên đầy đủ
  creators: {
    "LINH.TT": "Trần Thùy Linh",
    "MINH.NV": "Nguyễn Văn Minh",
    "HOA.LT": "Lê Thị Hoa",
  },

  // Hàng chờ — đổ về từ TKNV theo PHIÊN giao dịch; 1 phiên có thể có NHIỀU hồ sơ
  queue: [
    {
      id: "s1", sid: "PGD-2026-0607-014", khach: "Nguyễn Văn Thành", addr: "142/5 Lê Văn Sỹ, Q.3", creator: "LINH.TT", time: "09:52",
      files: [
        { id: "s1h1", service: "Chuyển nhượng QSDĐ", kind: "contract", soCC: null, fee: 3200000, status: "waiting", debtFile: false, debtMoney: false },
        { id: "s1h2", service: "Văn bản ủy quyền (kèm theo)", kind: "contract", soCC: null, fee: 800000, status: "waiting", debtFile: false, debtMoney: false },
      ],
    },
    {
      id: "s2", sid: "PGD-2026-0607-013", khach: "Lê Thị Hồng Nhung", addr: "27 Nguyễn Thị Minh Khai, Q.1", creator: "MINH.NV", time: "09:40",
      files: [
        { id: "s2h1", service: "Tặng cho QSDĐ", kind: "contract", soCC: null, fee: 2800000, status: "waiting", debtFile: false, debtMoney: false },
      ],
    },
    {
      id: "s3", sid: "PGD-2026-0607-012", khach: "Công ty TNHH Đại Phát", addr: "12 Nguyễn Huệ, Q.1", creator: "MINH.NV", time: "09:18",
      files: [
        { id: "s3h1", service: "HĐ Thế chấp tài sản", kind: "contract", soCC: 1921, fee: 4500000, status: "paid", debtFile: true, debtMoney: false },
        { id: "s3h2", service: "Sao y trích lục hồ sơ", kind: "contract", soCC: 1917, fee: 120000, status: "paid", debtFile: false, debtMoney: false },
        { id: "s3h3", service: "Văn bản thỏa thuận", kind: "contract", soCC: null, fee: 600000, status: "waiting", debtFile: false, debtMoney: false },
      ],
    },
    {
      id: "s4", sid: "PGD-2026-0607-011", khach: "Trần Quốc Bảo", addr: "88 Phan Xích Long, Phú Nhuận", creator: "LINH.TT", time: "09:31",
      files: [
        { id: "s4h1", service: "Văn bản ủy quyền", kind: "contract", soCC: 1922, fee: 800000, status: "paid", debtFile: false, debtMoney: false },
      ],
    },
    {
      id: "s5", sid: "PGD-2026-0607-010", khach: "Vũ Thị Lan", addr: "5 Trần Hưng Đạo, Q.5", creator: "LINH.TT", time: "08:57",
      files: [
        { id: "s5h1", service: "Mua bán xe ô tô", kind: "contract", soCC: 1919, fee: 1200000, status: "waiting", debtFile: false, debtMoney: true },
      ],
    },
    {
      id: "s6", sid: "PGD-2026-0607-009", khach: "Phan Anh Tú", addr: "210 Cách Mạng Tháng 8, Q.10", creator: "HOA.LT", time: "08:45",
      files: [
        { id: "s6h1", service: "Di chúc", kind: "contract", soCC: null, fee: 1500000, status: "waiting", debtFile: false, debtMoney: false },
        { id: "s6h2", service: "Văn bản khai nhận di sản", kind: "contract", soCC: null, fee: 2200000, status: "waiting", debtFile: false, debtMoney: false },
      ],
    },
  ],

  // Dịch vụ nhanh (Fast-track) — Sao y & Chứng thực chữ ký
  saoYPrice: 10000, // đ/bản
  chungThucTypes: ["Sơ yếu lý lịch", "Hợp đồng mua bán", "Giấy ủy quyền", "Đơn từ / tờ khai", "Văn bản thỏa thuận", "Hợp đồng cho thuê", "Giấy tờ khác"],

  // Kế toán — bảng kê biên lai trong ca
  receipts: [
    { id: "r1", no: 1922, khach: "Trần Quốc Bảo", service: "Văn bản ủy quyền", amount: 800000, pay: "cash" },
    { id: "r2", no: 1921, khach: "Công ty TNHH Đại Phát", service: "HĐ Thế chấp tài sản", amount: 4500000, pay: "transfer" },
    { id: "r3", no: 1919, khach: "Vũ Thị Lan", service: "Mua bán xe ô tô", amount: 1200000, pay: "cash" },
    { id: "r4", no: 1917, khach: "Công ty TNHH Đại Phát", service: "Sao y trích lục", amount: 120000, pay: "transfer" },
  ],

  // Kế toán — Auto-grouping (gộp hóa đơn theo Tên + Địa chỉ + MST trùng khớp)
  // Mỗi nhóm = nhiều giao dịch CHƯA xuất hóa đơn của cùng một khách hàng doanh nghiệp.
  groups: [
    {
      id: "g1", name: "Công ty CP Xây dựng Hồng Phát", addr: "45 Điện Biên Phủ, Bình Thạnh", taxcode: "0312998877",
      items: [
        { no: 1924, service: "HĐ Thế chấp tài sản", amount: 4500000, txnDate: "07/06/2026" },
        { no: 1925, service: "Sao y trích lục hồ sơ", amount: 240000, txnDate: "07/06/2026" },
        { no: 1926, service: "Văn bản thỏa thuận", amount: 600000, txnDate: "07/06/2026" },
      ],
    },
    {
      id: "g2", name: "Công ty TNHH Thương mại Tân Tiến", addr: "7 Nguyễn Công Trứ, Q.1", taxcode: "0309112233",
      items: [
        { no: 1915, service: "HĐ Mua bán hàng hóa", amount: 1800000, txnDate: "05/06/2026" },
        { no: 1916, service: "Văn bản ủy quyền", amount: 800000, txnDate: "05/06/2026" },
      ],
    },
  ],

  // Hóa đơn điện tử — chính sách hỗ trợ chậm xuất tối đa 1 ngày làm việc
  // status: pending (chờ xuất) · issued (đã đẩy) · error (lỗi đẩy)
  invoices: [
    { id: "iv1", khach: "Nguyễn Hữu Phước", mst: "", addr: "33 Lý Thường Kiệt, Q.10", txnDate: "05/06/2026", service: "Sao y trích lục hồ sơ", items: 1, amount: 350000, status: "pending" },
    { id: "iv2", khach: "Phan Anh Tú", mst: "", addr: "210 Cách Mạng Tháng 8, Q.10", txnDate: "03/06/2026", service: "Di chúc + Khai nhận di sản", items: 2, amount: 3700000, status: "pending" },
    { id: "iv3", khach: "Vũ Thị Lan", mst: "", addr: "5 Trần Hưng Đạo, Q.5", txnDate: "06/06/2026", service: "Mua bán xe ô tô", items: 1, amount: 1200000, status: "pending" },
    { id: "iv4", khach: "Trần Quốc Bảo", mst: "", addr: "88 Phan Xích Long, Phú Nhuận", txnDate: "07/06/2026", service: "Văn bản ủy quyền", items: 1, amount: 800000, status: "pending" },
    { id: "iv5", khach: "Công ty TNHH Đại Phát", mst: "0312445566", addr: "12 Nguyễn Huệ, Q.1", txnDate: "07/06/2026", service: "Gộp 2 giao dịch (Thế chấp + Sao y)", items: 2, amount: 4620000, status: "issued", issuedDate: "07/06/2026" },
    { id: "iv6", khach: "Lê Thị Hồng Nhung", mst: "", addr: "27 Nguyễn Thị Minh Khai, Q.1", txnDate: "04/06/2026", service: "Tặng cho QSDĐ", items: 1, amount: 2800000, status: "error" },
  ],

  easyInvoice: { provider: "EasyInvoice", connected: true, lastSync: "07/06/2026 · 09:30", pending: 4 },
};

/* Phân tích ngày DD/MM/YYYY → Date */
function parseVNDate(s) { const m = String(s || "").match(/(\d{2})\/(\d{2})\/(\d{4})/); return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null; }
/* Số ngày trễ so với hôm nay (chính sách hỗ trợ chậm 1 ngày) */
function daysLate(txnDate) {
  const a = parseVNDate(txnDate), b = parseVNDate(POS_DATA.today);
  if (!a || !b) return 0;
  return Math.max(0, Math.round((b - a) / 86400000));
}
function isOverdue(inv) { return inv.status !== "issued" && daysLate(inv.txnDate) > 1; }

function fmtVND(n) { return (n || 0).toLocaleString("vi-VN") + "₫"; }
// book/year truyền tay để hiện đúng dữ liệu Smart Hint thật (theo loại hồ sơ +
// năm thật từ server) — không truyền thì lùi về giá trị mock cho tương thích ngược.
function fullSoCC(n, book, year) { return (book || POS_DATA.soCC.book) + "/" + String(n).padStart(6, "0") + "/" + (year || POS_DATA.soCC.year); }
function creatorName(code) { return POS_DATA.creators[code] || code; }

// Tổng hợp trạng thái 1 phiên từ các hồ sơ con
function sessionMeta(s) {
  const total = s.files.reduce((a, f) => a + (f.fee || 0), 0);
  // Phí thu thực tế: hồ sơ đã thu & không ghi nợ tiền thu
  const actual = s.files.reduce((a, f) => a + (f.status === "paid" && !f.debtMoney ? (f.fee || 0) : 0), 0);
  const anyDebt = s.files.some((f) => f.debtFile || f.debtMoney);
  const allPaid = s.files.every((f) => f.status === "paid");
  const anyPaid = s.files.some((f) => f.status === "paid");
  const status = anyDebt ? "debt" : allPaid ? "paid" : anyPaid ? "partial" : "waiting";
  return { total, actual, anyDebt, allPaid, status, count: s.files.length };
}

window.POS_DATA = POS_DATA;
window.POSFmt = { fmtVND, fullSoCC, creatorName, sessionMeta, parseVNDate, daysLate, isOverdue };
