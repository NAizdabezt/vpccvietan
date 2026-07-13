/* global window */
/* PH03 — Số hóa & Lưu trữ · mock dữ liệu */

const ARC_DATA = {
  staff: { name: "Hoàng Minh Tuấn", code: "TUAN.HM" },
  today: "07/06/2026",

  stats: [
    { label: "Chờ số hóa", value: "14", icon: "ScanLine" },
    { label: "Đã số hóa hôm nay", value: "52", icon: "FileCheck2" },
    { label: "Hộp đang lưu", value: "187", icon: "Boxes" },
    { label: "CMC quá hạn", value: "3", icon: "AlertTriangle", tone: "danger" },
  ],

  // Hàng chờ số hóa — hồ sơ đã công chứng cần scan & lưu
  scanQueue: [
    { id: "s1", soCC: 1922, khach: "Trần Quốc Bảo", service: "Văn bản ủy quyền", pages: 6, sid: "PGD-2026-0607-012", status: "waiting", note: "" },
    { id: "s2", soCC: 1921, khach: "Công ty TNHH Đại Phát", service: "HĐ Thế chấp tài sản", pages: 18, sid: "PGD-2026-0607-011", status: "scanning", note: "Đang scan 12/18" },
    { id: "s3", soCC: 1919, khach: "Vũ Thị Lan", service: "Mua bán xe ô tô", pages: 9, sid: "PGD-2026-0607-010", status: "review", note: "Lệch hướng trang 4" },
    { id: "s4", soCC: 1918, khach: "Lê Hoàng Nam", service: "Chuyển nhượng QSDĐ", pages: 14, sid: "PGD-2026-0606-088", status: "done", note: "Đã đẩy kho số" },
    { id: "s5", soCC: 1917, khach: "Công ty TNHH Đại Phát", service: "Sao y trích lục", pages: 3, sid: "PGD-2026-0606-087", status: "done", note: "Đã đẩy kho số" },
    { id: "s6", soCC: 1916, khach: "Phạm Thị Hoa", service: "Di chúc", pages: 5, sid: "PGD-2026-0606-085", status: "waiting", note: "" },
  ],

  // Kho vật lý — sơ đồ kệ × hộp
  warehouse: {
    shelves: ["A", "B", "C", "D"],
    boxesPerShelf: 8,
    // hộp đặc biệt: trạng thái khác "stored"
    boxState: {
      "A-3": { fill: 0.6, label: "Q.0036 · 2026" },
      "A-7": { state: "full", fill: 1, label: "Q.0035 · 2026" },
      "B-2": { fill: 0.4, label: "Q.0034 · 2025" },
      "C-5": { state: "empty", label: "Trống" },
      "C-6": { state: "empty", label: "Trống" },
      "D-1": { fill: 0.8, label: "Q.0031 · 2025" },
      "D-8": { state: "sealed", label: "Niêm phong 2023" },
    },
  },

  // Hồ sơ trong 1 hộp (khi click)
  boxContents: [
    { soCC: 1901, khach: "Nguyễn Văn Thành", service: "Chuyển nhượng QSDĐ", date: "02/06/2026" },
    { soCC: 1902, khach: "Đặng Thu Trang", service: "Văn bản thừa kế", date: "02/06/2026" },
    { soCC: 1903, khach: "Cty CP Hưng Thịnh", service: "HĐ Thế chấp", date: "03/06/2026" },
    { soCC: 1904, khach: "Lý Gia Huy", service: "Ủy quyền", date: "03/06/2026" },
  ],

  // Cấp số công chứng — hồ sơ phức tạp từ Thu ngân chuyển sang để rà soát & chốt số
  capSo: {
    book: "0036", year: "2026", next: 1923, lastUsed: 1922, missing: [1918, 1920],
    queue: [
      { id: "n1", date: "07/06/2026", hoso: "HS-2026-0612", duongsu: "Nguyễn Văn Thành — Lê Thị Hồng Nhung", loai: "Chuyển nhượng QSDĐ", soCC: null, fee: 3200000, ccv: "Nguyễn Quốc Việt", attached: false, status: "review", sid: "PGD-2026-0607-014" },
      { id: "n2", date: "07/06/2026", hoso: "HS-2026-0611", duongsu: "Công ty TNHH Đại Phát", loai: "HĐ Thế chấp tài sản", soCC: null, fee: 4500000, ccv: "Lê Thị Hằng", attached: false, status: "review", sid: "PGD-2026-0607-011" },
      { id: "n3", date: "07/06/2026", hoso: "HS-2026-0609", duongsu: "Phan Anh Tú", loai: "Di chúc", soCC: 1922, fee: 1500000, ccv: "Nguyễn Quốc Việt", attached: false, status: "numbered", sid: "PGD-2026-0607-009" },
      { id: "n4", date: "06/06/2026", hoso: "HS-2026-0598", duongsu: "Lê Hoàng Nam — Trần Thị Cúc", loai: "Tặng cho QSDĐ", soCC: 1921, fee: 2800000, ccv: "Lê Thị Hằng", attached: false, status: "numbered", sid: "PGD-2026-0606-088" },
      { id: "n5", date: "06/06/2026", hoso: "HS-2026-0595", duongsu: "Vũ Thị Lan", loai: "Mua bán xe ô tô", soCC: 1919, fee: 1200000, ccv: "Nguyễn Quốc Việt", attached: true, status: "approved", sid: "PGD-2026-0606-085" },
      { id: "n6", date: "05/06/2026", hoso: "HS-2026-0571", duongsu: "Trịnh Quốc Cường", loai: "Văn bản ủy quyền", soCC: 1916, fee: 800000, ccv: "Lê Thị Hằng", attached: true, status: "approved", sid: "PGD-2026-0605-061" },
    ],
  },

  // Liên thông CMC — hàng đợi đẩy lưu trữ
  cmc: { connected: true, lastSync: "07/06/2026 · 09:25", system: "CMC DocEye Archive",
    queue: [
      { id: "c1", soCC: 1918, khach: "Lê Hoàng Nam", size: "24,8 MB", pages: 14, deadline: "08/06/2026", daysLeft: 1, status: "queued" },
      { id: "c2", soCC: 1917, khach: "Công ty TNHH Đại Phát", size: "5,2 MB", pages: 3, deadline: "09/06/2026", daysLeft: 2, status: "queued" },
      { id: "c3", soCC: 1888, khach: "Nguyễn Thị Bích", size: "31,1 MB", pages: 22, deadline: "05/06/2026", daysLeft: -2, status: "overdue" },
      { id: "c4", soCC: 1875, khach: "Hồ Văn Sơn", size: "12,0 MB", pages: 8, deadline: "04/06/2026", daysLeft: -3, status: "overdue" },
      { id: "c5", soCC: 1860, khach: "Phan Anh Tú", size: "9,6 MB", pages: 6, deadline: "06/06/2026", daysLeft: -1, status: "error" },
      { id: "c6", soCC: 1920, khach: "Trịnh Quốc Cường", size: "18,3 MB", pages: 11, deadline: "10/06/2026", daysLeft: 3, status: "synced" },
    ],
  },
};

window.ARC_DATA = ARC_DATA;
