/* global window */
/* VPCC Việt An — mock dữ liệu nghiệp vụ (PH01). Không dùng emoji ở UI desktop. */

const VA_DATA = {
  session: {
    id: "PGD-2026-0607-014",
    luong: "complex", // 'complex' = Hợp đồng phức tạp | 'fast' = Sao y / Chứng thực
    createdAt: "07/06/2026 · 09:12",
    secretary: "Trần Thị Mỹ Linh",
    secretaryCode: "LINH.TT",
    notary: "CCV Nguyễn Quốc Việt",
  },

  // Khách hàng phiên hiện tại (Bên A — chuyển nhượng)
  customer: {
    name: "NGUYỄN VĂN THÀNH",
    dob: "12/04/1979",
    cccd: "079079001234",
    cccdDate: "08/05/2021",
    address: "142/5 Lê Văn Sỹ, P.13, Q.3, TP. Hồ Chí Minh",
    phone: "0903 555 214",
    returning: true, // khách cũ — Mini CRM cảnh báo
    lastVisit: "21/02/2026",
    history: [
      { id: "0036-001892-2026", type: "Ủy quyền", date: "21/02/2026" },
      { id: "0036-000418-2025", type: "Chuyển nhượng QSDĐ", date: "14/08/2025" },
    ],
  },

  // Bên B — nhận chuyển nhượng
  partyB: {
    name: "LÊ THỊ HỒNG NHUNG",
    dob: "30/09/1985",
    cccd: "079185007781",
    address: "27 Nguyễn Thị Minh Khai, P. Bến Nghé, Q.1, TP. HCM",
  },

  // Giấy tờ bóc tách — KHÔNG có OCR thật (chưa tích hợp dịch vụ OCR nào), nên
  // đây chỉ là khung trường dữ liệu để CCV/TKNV tự nhập tay theo giấy tờ đang
  // cầm trên tay, KHÔNG bịa sẵn giá trị như trước (từng tự động điền tên/CCCD/
  // thửa đất giả vào hợp đồng thật nếu người dùng quên sửa lại).
  ocrDocs: [
    {
      id: "cccd_a", name: "CCCD — Bên A", source: "Nhập tay", icon: "CreditCard",
      status: "manual",
      fields: [
        { fkey: "hoTen_A",  label: "Họ tên", value: "" },
        { fkey: "cccd_A",   label: "Số định danh", value: "", mono: true },
        { fkey: "ngaySinh_A", label: "Ngày sinh", value: "" },
        { fkey: "diaChi_A", label: "Nơi thường trú", value: "" },
      ],
    },
    {
      id: "vneid_b", name: "CCCD — Bên B", source: "Nhập tay", icon: "CreditCard",
      status: "manual",
      fields: [
        { fkey: "hoTen_B",  label: "Họ tên", value: "" },
        { fkey: "cccd_B",   label: "Số định danh", value: "", mono: true },
        { fkey: "ngaySinh_B", label: "Ngày sinh", value: "" },
      ],
    },
    {
      id: "sodo", name: "Sổ hồng (GCN QSDĐ)", source: "Nhập tay", icon: "ScrollText",
      status: "manual", qr: true,
      fields: [
        { fkey: "thuaDat",   label: "Thửa đất số", value: "", mono: true },
        { fkey: "toBanDo",   label: "Tờ bản đồ số", value: "", mono: true },
        { fkey: "dienTich",  label: "Diện tích", value: "", mono: true },
        { fkey: "diaChiDat", label: "Địa chỉ", value: "" },
      ],
    },
    {
      id: "cavet", name: "Cà vẹt xe", source: "Nhập tay", icon: "Car",
      status: "manual",
      fields: [
        { fkey: "bienSo",   label: "Biển số", value: "", mono: true },
        { fkey: "nhanHieu", label: "Nhãn hiệu", value: "" },
        { fkey: "soKhung",  label: "Số khung", value: "", mono: true },
      ],
    },
  ],

  // Tra cứu ngăn chặn (nhúng trình duyệt)
  blockChecks: [
    { id: "land", label: "Ngăn chặn QSDĐ — Sở TN&MT", target: "Thửa 248, tờ 12", result: "clear", note: "Không có thông tin ngăn chặn", captured: true },
    { id: "court", label: "CSDL Toà án / Thi hành án", target: "Nguyễn Văn Thành", result: "clear", note: "Không phát sinh", captured: true },
    { id: "vehicle", label: "Đăng kiểm — Biển 51K-882.74", target: "51K-882.74", result: "pending", note: "Đang giải CAPTCHA…", captured: false },
  ],

  // Hàng chờ ảnh số (Photo Queue) — ảnh CCV chụp đẩy về
  photoQueue: [
    { id: "p1", label: "Ảnh ký sống — Bên A", time: "09:48", from: "Camera quầy 02", w: 92, h: 120, hue: 28 },
    { id: "p2", label: "Ảnh ký sống — Bên B", time: "09:49", from: "Camera quầy 02", w: 92, h: 120, hue: 210 },
    { id: "p3", label: "Bản gốc Sổ hồng", time: "09:50", from: "Camera quầy 02", w: 120, h: 90, hue: 140 },
  ],

  // Mẫu hợp đồng
  templates: [
    { id: "t1", name: "HĐ Chuyển nhượng QSDĐ", group: "Bất động sản", active: true },
    { id: "t4", name: "HĐ Tặng cho QSDĐ", group: "Bất động sản" },
    { id: "t5", name: "Giấy ủy quyền", group: "Ủy quyền" },
    { id: "t6", name: "HĐ Ủy quyền toàn quyền nhà đất", group: "Ủy quyền" },
    { id: "t7", name: "Thụ ủy hợp đồng ủy quyền", group: "Ủy quyền" },
    { id: "t8", name: "Giấy ủy quyền thành lập doanh nghiệp", group: "Ủy quyền" },
    { id: "t9", name: "HĐ Mua bán xe máy", group: "Động sản" },
    { id: "t10", name: "HĐ Mua bán xe ô tô", group: "Động sản" },
    { id: "t11", name: "HĐ Ủy quyền xe máy", group: "Ủy quyền xe" },
    { id: "t12", name: "HĐ Ủy quyền xe ô tô", group: "Ủy quyền xe" },
    { id: "t13", name: "HĐ Ủy quyền xe ô tô (1 bên)", group: "Ủy quyền xe" },
  ],

  // Gõ tắt pháp lý (snippets)
  snippets: [
    { key: "/cn", text: "Bên chuyển nhượng cam kết quyền sử dụng đất nêu trên thuộc quyền sở hữu hợp pháp…" },
    { key: "/tt", text: "Hai bên đã đọc lại, hiểu rõ và đồng ý toàn bộ nội dung của hợp đồng này." },
    { key: "/cc", text: "Lời chứng của Công chứng viên: Hôm nay, ngày … tháng … năm …, tại trụ sở…" },
  ],

  // Cấu hình in
  printPresets: {
    complex: [
      { label: "Bản chính giao khách", qty: 2 },
      { label: "Bản lưu kho (watermark)", qty: 1, watermark: true },
      { label: "Bản gửi cơ quan thuế", qty: 1 },
    ],
    fast: [
      { label: "Bản giao khách", qty: 1 },
      { label: "Bản lưu (watermark)", qty: 1, watermark: true },
    ],
  },
};

// Cấu trúc nội dung hợp đồng cho trình soạn thảo.
// kind: 'title' | 'heading' | 'para' | 'locked' | 'signoff'
// Trong text dùng {{field}} để đánh dấu biến auto-mapping.
VA_DATA.docBlocks = [
  { kind: "title", text: "HỢP ĐỒNG CHUYỂN NHƯỢNG QUYỀN SỬ DỤNG ĐẤT", locked: true },
  { kind: "muted", text: "Số công chứng: …/2026 — quyển số 03 TP/CC-SCC/HĐGD" },
  { kind: "heading", text: "BÊN CHUYỂN NHƯỢNG (BÊN A)" },
  { kind: "para", parts: [
    { t: "Ông: " }, { f: "Họ tên Bên A", v: "NGUYỄN VĂN THÀNH" },
    { t: ", sinh ngày " }, { f: "Ngày sinh", v: "12/04/1979" },
    { t: ", CCCD số " }, { f: "CCCD Bên A", v: "079079001234" },
    { t: ", thường trú tại " }, { f: "Địa chỉ Bên A", v: "142/5 Lê Văn Sỹ, P.13, Q.3, TP.HCM" }, { t: "." },
  ] },
  { kind: "heading", text: "BÊN NHẬN CHUYỂN NHƯỢNG (BÊN B)" },
  { kind: "para", parts: [
    { t: "Bà: " }, { f: "Họ tên Bên B", v: "LÊ THỊ HỒNG NHUNG" },
    { t: ", sinh ngày " }, { f: "Ngày sinh B", v: "30/09/1985" },
    { t: ", CCCD số " }, { f: "CCCD Bên B", v: "079185007781" },
    { t: "." },
  ] },
  { kind: "heading", text: "ĐIỀU 1. ĐỐI TƯỢNG CỦA HỢP ĐỒNG" },
  { kind: "para", parts: [
    { t: "Quyền sử dụng thửa đất số " }, { f: "Thửa đất", v: "248" },
    { t: ", tờ bản đồ số " }, { f: "Tờ bản đồ", v: "12" },
    { t: ", diện tích " }, { f: "Diện tích", v: "86,4 m²" },
    { t: ", tại " }, { f: "Địa chỉ thửa", v: "Số 9 đường số 4, P. Tân Quy, Q.7, TP.HCM" }, { t: "." },
  ] },
  { kind: "locked", text: "ĐIỀU 2. Việc chuyển nhượng quyền sử dụng đất được thực hiện theo quy định của Bộ luật Dân sự và Luật Đất đai hiện hành. Các bên có nghĩa vụ thực hiện thủ tục đăng ký biến động theo quy định pháp luật." },
  { kind: "signoff", text: "Hai bên đã đọc lại, hiểu rõ và đồng ý toàn bộ nội dung hợp đồng." },
];

window.VA_DATA = VA_DATA;

/* ---- Hàng chờ ảnh: ảnh CCV chụp cùng khách để đính kèm hồ sơ ---- */
VA_DATA.capturedPhotos = [
  { id: "ph1", time: "11/06/2026 · 09:12", ccv: "CCV Nguyễn Quốc Việt", customer: "Phạm Thị Bích Hằng", hue: 210 },
  { id: "ph2", time: "11/06/2026 · 08:41", ccv: "CCV Nguyễn Quốc Việt", customer: "Đỗ Mạnh Cường", hue: 28 },
  { id: "ph3", time: "10/06/2026 · 16:18", ccv: "CCV Lê Thị Hằng", customer: "", hue: 150 },
  { id: "ph4", time: "10/06/2026 · 15:02", ccv: "CCV Lê Thị Hằng", customer: "Lý Hải Yến", hue: 280 },
];

/* ---- Luồng tổng quan & trạng thái phiên đã chuyển sang src/sessions.jsx
   (dùng chung cho mọi phân quyền). ---- */

/* ---- Ảnh đã scan & OCR (cột trái bước Bóc tách) ----
   cat: 'id'   = giấy tờ tùy thân / nhân thân (CCCD, hộ khẩu, hôn nhân…)
        'asset' = giấy tờ tài sản & hợp đồng (sổ hồng, cà vẹt…) */
VA_DATA.scanImages = [
  { id: "s1",  label: "CCCD — Bên A (mặt trước)",          doc: "cccd_a",  type: "CCCD",                  cat: "id",    hue: 28 },
  { id: "s2",  label: "CCCD — Bên A (mặt sau)",           doc: "cccd_a",  type: "CCCD",                  cat: "id",    hue: 28 },
  { id: "s3",  label: "CCCD — Bên B (mặt trước)",         doc: "vneid_b", type: "CCCD",                  cat: "id",    hue: 210 },
  { id: "s3b", label: "CCCD — Bên B (mặt sau)",           doc: "vneid_b", type: "CCCD",                  cat: "id",    hue: 210 },
  { id: "s6",  label: "Sổ hộ khẩu — trang chủ hộ",        doc: "hk",      type: "Sổ hộ khẩu",            cat: "id",    hue: 268 },
  { id: "s7",  label: "Sổ hộ khẩu — trang nhân khẩu",     doc: "hk",      type: "Sổ hộ khẩu",            cat: "id",    hue: 268 },
  { id: "s8",  label: "Giấy xác nhận tình trạng hôn nhân", doc: "hn",      type: "Giấy tờ hôn nhân",      cat: "id",    hue: 330 },
  { id: "s4",  label: "Sổ hồng (trang 1–2)",              doc: "sodo",    type: "Sổ hồng / GCN",         cat: "asset", hue: 140 },
  { id: "s4b", label: "Sổ hồng (trang biến động)",        doc: "sodo",    type: "Sổ hồng / GCN",         cat: "asset", hue: 140 },
  { id: "s5",  label: "Cà vẹt xe",                        doc: "cavet",   type: "Cà vẹt xe",             cat: "asset", hue: 45 },
];

/* "Khách cũ / hồ sơ cũ" trước đây là mảng dữ liệu bịa (priorRecords) — đã bỏ,
   xem src/lookup.jsx (ReturningSearch giờ gọi thật GET /api/khach-hang). */
