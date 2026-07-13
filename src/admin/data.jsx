/* global window */
/* PH04 — Dashboard điều hành (Quản trị viên / Lãnh đạo VPCC) · mock dữ liệu */

const ADMIN_PAL = ["#2563eb", "#16a34a", "#d97706", "#7c3aed", "#0891b2", "#e11d48"];

const ADMIN_DATA = {
  admin: { name: "Đỗ Quang Huy", role: "Lãnh đạo" },
  ranges: [
    { id: "today", label: "Hôm nay" },
    { id: "week", label: "Tuần này" },
    { id: "month", label: "Tháng này" },
    { id: "quarter", label: "Quý này" },
  ],
  types: ["Hợp đồng", "Sao y", "Ủy quyền", "Di chúc", "Chứng thực"],

  // KPI headline theo từng mốc thời gian
  kpis: {
    today:   { hoso: 38,   revenue: 78400000,   ccv: 4, tknv: 5, avgMin: 26, dHoso: 12, dRev: 8 },
    week:    { hoso: 214,  revenue: 486000000,  ccv: 6, tknv: 6, avgMin: 28, dHoso: 9,  dRev: 11 },
    month:   { hoso: 902,  revenue: 2140000000, ccv: 7, tknv: 6, avgMin: 27, dHoso: 15, dRev: 6 },
    quarter: { hoso: 2680, revenue: 6320000000, ccv: 7, tknv: 6, avgMin: 29, dHoso: 4,  dRev: 13 },
  },

  // Cơ cấu dịch vụ (tỷ trọng %)
  serviceMix: [
    { label: "Hợp đồng mua bán", value: 42 },
    { label: "Sao y", value: 24 },
    { label: "Ủy quyền", value: 14 },
    { label: "Chứng thực chữ ký", value: 11 },
    { label: "Di chúc", value: 5 },
    { label: "Khác", value: 4 },
  ],

  // Năng suất Thư ký nghiệp vụ — phân rã theo loại hồ sơ
  tknv: [
    { name: "Trần Thị Mỹ Linh", total: 186, by: [78, 52, 30, 14, 12] },
    { name: "Phạm Thu Hà",      total: 152, by: [60, 48, 24, 10, 10] },
    { name: "Nguyễn Đức Anh",   total: 128, by: [50, 40, 20, 9, 9] },
    { name: "Lê Khánh Vy",      total: 96,  by: [36, 30, 16, 8, 6] },
    { name: "Vũ Hải Nam",       total: 74,  by: [28, 22, 12, 7, 5] },
  ],

  // Năng suất Công chứng viên — duyệt + ký sống/ký số
  ccv: [
    { name: "Nguyễn Quốc Việt", approved: 240, kySong: 150, kySo: 90, by: [110, 70, 40, 12, 8] },
    { name: "Lê Thị Hằng",      approved: 198, kySong: 120, kySo: 78, by: [92, 58, 34, 8, 6] },
    { name: "Trần Minh Đức",    approved: 154, kySong: 88,  kySo: 66, by: [70, 46, 26, 7, 5] },
  ],

  // Doanh thu theo thời gian (triệu đồng) — theo từng mốc
  revenueSeries: {
    today:   [{ l: "8h", v: 6 }, { l: "9h", v: 11 }, { l: "10h", v: 9 }, { l: "11h", v: 14 }, { l: "13h", v: 8 }, { l: "14h", v: 12 }, { l: "15h", v: 10 }, { l: "16h", v: 8 }],
    week:    [{ l: "T2", v: 64 }, { l: "T3", v: 78 }, { l: "T4", v: 72 }, { l: "T5", v: 90 }, { l: "T6", v: 96 }, { l: "T7", v: 58 }, { l: "CN", v: 28 }],
    month:   [{ l: "Tuần 1", v: 460 }, { l: "Tuần 2", v: 540 }, { l: "Tuần 3", v: 510 }, { l: "Tuần 4", v: 630 }],
    quarter: [{ l: "Tháng 1", v: 1980 }, { l: "Tháng 2", v: 2160 }, { l: "Tháng 3", v: 2180 }],
  },

  // Cơ cấu dòng tiền theo hình thức thanh toán (%)
  payments: [
    { label: "Chuyển khoản", value: 58 },
    { label: "Tiền mặt", value: 34 },
    { label: "Công nợ", value: 8 },
  ],

  // Phân quyền ủy thác (Delegation Role)
  delegation: [
    { name: "Nguyễn Quốc Việt", role: "CCV — chủ Token CMC", scope: "Ký số & đồng bộ CMC", token: "CMC-TK-••••A9F2", status: "active" },
    { name: "Lê Thị Hằng",      role: "CCV — chủ Token CMC", scope: "Ký số & đồng bộ CMC", token: "CMC-TK-••••7C31", status: "active" },
    { name: "Trần Thị Mỹ Linh", role: "Quản trị nội bộ",     scope: "Yêu cầu chỉnh sửa (uỷ thác)", token: "Uỷ quyền CCV Việt", status: "delegated" },
    { name: "Phạm Thu Hà",      role: "Thư ký nghiệp vụ",     scope: "Soạn thảo, tiếp nhận", token: "—", status: "standard" },
  ],

  // Nhật ký truy vết (Audit Trail)
  audit: [
    { time: "11/06 · 09:42", actor: "Trần Thị Mỹ Linh", action: "Yêu cầu chỉnh sửa", target: "PGD-2026-0611-021", via: "Token CCV Nguyễn Quốc Việt", result: "synced" },
    { time: "11/06 · 09:15", actor: "Phạm Thu Hà",      action: "Sửa số công chứng", target: "0036-002041-2026", via: "Token CCV Lê Thị Hằng", result: "synced" },
    { time: "11/06 · 08:50", actor: "Nguyễn Quốc Việt", action: "Ký số & đẩy CMC",  target: "PGD-2026-0610-038", via: "Token cá nhân", result: "synced" },
    { time: "10/06 · 17:02", actor: "Trần Thị Mỹ Linh", action: "Xoá bản nháp",      target: "PGD-2026-0610-019", via: "Token CCV Trần Minh Đức", result: "pending" },
    { time: "10/06 · 16:20", actor: "Lê Khánh Vy",      action: "Yêu cầu chỉnh sửa", target: "0036-001990-2026", via: "Token CCV Nguyễn Quốc Việt", result: "rejected" },
  ],
};

window.ADMIN_DATA = ADMIN_DATA;
window.ADMIN_PAL = ADMIN_PAL;
