/* global window */
/* PH05 — Quản trị hệ thống (Admin) · mock dữ liệu
   Phân hệ Quản trị viên: Thiết kế luồng · Tài khoản · Phân quyền · Nhật ký */

/* ---- Vai trò nghiệp vụ trong luồng (mỗi vai trò một màu) ---- */
const SA_ROLES = [
  { id: "tiepnhan", short: "Tiếp nhận", label: "Tiếp nhận một cửa", color: "#e11d48", icon: "ConciergeBell" },
  { id: "tknv",     short: "TKNV",      label: "Thư ký nghiệp vụ",  color: "#2563eb", icon: "PenLine" },
  { id: "ccv",      short: "CCV",       label: "Công chứng viên",   color: "#7c3aed", icon: "FileSignature" },
  { id: "cashier",  short: "Thu ngân",  label: "Thu ngân",          color: "#d97706", icon: "Wallet" },
  { id: "acct",     short: "Kế toán",   label: "Kế toán",           color: "#0891b2", icon: "Calculator" },
  { id: "luutru",   short: "Lưu trữ",   label: "Lưu trữ – số hóa",  color: "#16a34a", icon: "Archive" },
];

/* ---- Loại thao tác (gắn vào bước) ---- */
const SA_OPS = [
  { id: "intake",   label: "Tiếp nhận & định danh", icon: "ScanLine" },
  { id: "draft",    label: "Soạn thảo văn bản",     icon: "FileText" },
  { id: "check",    label: "Tra cứu ngăn chặn",     icon: "ShieldCheck" },
  { id: "fee",      label: "Thu phí & phiếu thu",   icon: "Receipt" },
  { id: "invoice",  label: "Xuất hóa đơn",          icon: "FileSpreadsheet" },
  { id: "sign",     label: "Ký số / ký sống",       icon: "PenTool" },
  { id: "number",   label: "Cấp số công chứng",     icon: "Hash" },
  { id: "digitize", label: "Số hóa & lưu trữ",      icon: "Archive" },
  { id: "review",   label: "Thẩm định nội dung",    icon: "SearchCheck" },
  { id: "photo",    label: "Chụp ảnh xác thực",     icon: "Camera" },
  { id: "notify",   label: "Gửi thông báo / nhắc",  icon: "Bell" },
];

/* ---- Điều kiện chuyển bước (chọn sẵn, KHÔNG gõ tay) ---- */
const SA_GATES = [
  { id: "",          label: "— Không điều kiện —" },
  { id: "identified",label: "Đã định danh VNeID" },
  { id: "checked",   label: "Đã tra cứu ngăn chặn" },
  { id: "paid",      label: "Đã thanh toán đủ" },
  { id: "approved",  label: "CCV đã phê duyệt nội dung" },
  { id: "numbered",  label: "Đã cấp số công chứng" },
  { id: "signed",    label: "Đã ký số" },
];

/* ---- Thư viện luồng (mỗi luồng = đồ thị bước, config-driven) ----
   Mỗi bước:
     deps        — phụ thuộc vào những bước nào (rỗng = bước gốc / chạy song song)
     lockedDeps  — phụ thuộc do HỆ THỐNG khóa sẵn, không cho gỡ (vd Ký ⟵ Cấp số)
     join        — "AND" (chờ tất cả) | "OR" (chờ bất kỳ) khi có nhiều phụ thuộc
     locked      — khóa pháp lý: bắt buộc, không xóa/đổi vị trí/tắt
     optional    — bật/tắt được
     enabled     — đang bật hay không (chỉ áp dụng khi optional)
     blocking    — true = chặn luồng (blocking) | false = chạy nền (non-blocking)
     gate        — điều kiện chuyển bước (id trong SA_GATES)
     sla, slaRequired — SLA phút + bắt buộc                                        */
const SA_FLOWS = [
  {
    id: "f-hdmb",
    name: "Hợp đồng mua bán BĐS",
    docType: "Hợp đồng",
    office: "Trụ sở chính – Hà Đông",
    status: "active",
    updated: "10/06/2026",
    version: 7,
    steps: [
      { id: "s1", name: "Tiếp nhận & định danh VNeID", role: "tiepnhan", op: "intake",   deps: [],            lockedDeps: [], join: "AND", locked: true,  optional: false, enabled: true,  blocking: true,  gate: "",          sla: 15, slaRequired: true,  docs: ["CCCD/VNeID", "Giấy tờ BĐS"] },
      { id: "s2", name: "Tra cứu ngăn chặn",           role: "tknv",     op: "check",    deps: ["s1"],        lockedDeps: [], join: "AND", locked: true,  optional: false, enabled: true,  blocking: true,  gate: "identified",sla: 20, slaRequired: true,  docs: ["Phiếu tra cứu"] },
      { id: "s3", name: "Soạn thảo hợp đồng",          role: "tknv",     op: "draft",    deps: ["s2"],        lockedDeps: [], join: "AND", locked: true,  optional: false, enabled: true,  blocking: true,  gate: "checked",   sla: 60, slaRequired: true,  docs: ["Mẫu HĐ mua bán"] },
      { id: "s4", name: "Thu phí công chứng",          role: "cashier",  op: "fee",      deps: ["s3"],        lockedDeps: [], join: "AND", locked: true,  optional: false, enabled: true,  blocking: true,  gate: "",          sla: 10, slaRequired: true,  docs: ["Phiếu thu"] },
      { id: "s5", name: "Thẩm định nội dung",          role: "ccv",      op: "review",   deps: ["s3"],        lockedDeps: [], join: "AND", locked: true,  optional: false, enabled: true,  blocking: true,  gate: "",          sla: 30, slaRequired: true,  docs: [] },
      { id: "s6", name: "Cấp số & vào sổ công chứng",  role: "ccv",      op: "number",   deps: ["s4", "s5"],  lockedDeps: [], join: "AND", locked: true,  optional: false, enabled: true,  blocking: true,  gate: "paid",      sla: 10, slaRequired: true,  docs: ["Sổ công chứng"] },
      { id: "s7", name: "Ký số công chứng",            role: "ccv",      op: "sign",     deps: ["s6"],        lockedDeps: ["s6"], join: "AND", locked: true, optional: false, enabled: true, blocking: true, gate: "numbered",  sla: 25, slaRequired: true,  docs: ["Token CCV"] },
      { id: "s8", name: "Chụp ảnh xác thực hồ sơ",     role: "ccv",      op: "photo",    deps: ["s6"],        lockedDeps: [], join: "AND", locked: false, optional: true,  enabled: true,  blocking: false, gate: "",          sla: 5,  slaRequired: false, docs: [] },
      { id: "s9", name: "Số hóa & liên thông CMC",     role: "luutru",   op: "digitize", deps: ["s7"],        lockedDeps: [], join: "AND", locked: true,  optional: false, enabled: true,  blocking: true,  gate: "signed",    sla: 30, slaRequired: true,  docs: ["Bản scan", "Đồng bộ CMC"] },
    ],
  },
  {
    id: "f-saoy",
    name: "Sao y – Chứng thực bản sao",
    docType: "Sao y",
    office: "Tất cả văn phòng",
    status: "active",
    updated: "08/06/2026",
    version: 3,
    steps: [
      { id: "s1", name: "Tiếp nhận bản chính",      role: "tiepnhan", op: "intake",   deps: [],     lockedDeps: [], join: "AND", locked: true,  optional: false, enabled: true, blocking: true,  gate: "",     sla: 5,  slaRequired: true,  docs: ["Bản chính"] },
      { id: "s2", name: "Đối chiếu & soạn bản sao", role: "tknv",     op: "draft",    deps: ["s1"], lockedDeps: [], join: "AND", locked: true,  optional: false, enabled: true, blocking: true,  gate: "",     sla: 15, slaRequired: true,  docs: [] },
      { id: "s3", name: "Thu phí",                  role: "cashier",  op: "fee",      deps: ["s2"], lockedDeps: [], join: "AND", locked: true,  optional: false, enabled: true, blocking: true,  gate: "",     sla: 5,  slaRequired: true,  docs: ["Phiếu thu"] },
      { id: "s4", name: "Ký chứng thực",            role: "ccv",      op: "sign",     deps: ["s3"], lockedDeps: [], join: "AND", locked: true,  optional: false, enabled: true, blocking: true,  gate: "paid", sla: 10, slaRequired: true,  docs: [] },
      { id: "s5", name: "Số hóa & lưu trữ",         role: "luutru",   op: "digitize", deps: ["s4"], lockedDeps: [], join: "AND", locked: false, optional: true,  enabled: true, blocking: false, gate: "",     sla: 15, slaRequired: false, docs: ["Bản scan"] },
    ],
  },
  {
    id: "f-uyquyen",
    name: "Hợp đồng ủy quyền",
    docType: "Ủy quyền",
    office: "Chi nhánh Cầu Giấy",
    status: "draft",
    updated: "06/06/2026",
    version: 2,
    steps: [
      { id: "s1", name: "Tiếp nhận & định danh", role: "tiepnhan", op: "intake", deps: [],     lockedDeps: [], join: "AND", locked: true, optional: false, enabled: true, blocking: true, gate: "",          sla: 15, slaRequired: true, docs: ["CCCD/VNeID"] },
      { id: "s2", name: "Tra cứu ngăn chặn",     role: "tknv",     op: "check", deps: ["s1"], lockedDeps: [], join: "AND", locked: true, optional: false, enabled: true, blocking: true, gate: "identified",sla: 20, slaRequired: true, docs: [] },
      { id: "s3", name: "Soạn thảo ủy quyền",    role: "tknv",     op: "draft", deps: ["s2"], lockedDeps: [], join: "AND", locked: true, optional: false, enabled: true, blocking: true, gate: "checked",   sla: 45, slaRequired: true, docs: ["Mẫu ủy quyền"] },
      { id: "s4", name: "Thu phí",               role: "cashier",  op: "fee",   deps: ["s3"], lockedDeps: [], join: "AND", locked: true, optional: false, enabled: true, blocking: true, gate: "",          sla: 10, slaRequired: true, docs: [] },
      { id: "s5", name: "Ký số",                 role: "ccv",      op: "sign",  deps: ["s4"], lockedDeps: [], join: "AND", locked: true, optional: false, enabled: true, blocking: true, gate: "paid",      sla: 20, slaRequired: true, docs: ["Token CCV"] },
    ],
  },
  {
    id: "f-dichuc",
    name: "Di chúc",
    docType: "Di chúc",
    office: "Trụ sở chính – Hà Đông",
    status: "draft",
    updated: "02/06/2026",
    version: 1,
    steps: [
      { id: "s1", name: "Tiếp nhận & ghi nhận ý chí", role: "tiepnhan", op: "intake", deps: [],            lockedDeps: [], join: "AND", locked: true, optional: false, enabled: true, blocking: true, gate: "",         sla: 20, slaRequired: true, docs: ["CCCD/VNeID"] },
      { id: "s2", name: "Soạn thảo di chúc",          role: "tknv",     op: "draft",  deps: ["s1"],        lockedDeps: [], join: "AND", locked: true, optional: false, enabled: true, blocking: true, gate: "",         sla: 90, slaRequired: true, docs: ["Mẫu di chúc"] },
      { id: "s3", name: "Thẩm định pháp lý",          role: "ccv",      op: "review", deps: ["s2"],        lockedDeps: [], join: "AND", locked: true, optional: false, enabled: true, blocking: true, gate: "",         sla: 40, slaRequired: true, docs: [] },
      { id: "s4", name: "Thu phí",                    role: "cashier",  op: "fee",    deps: ["s2"],        lockedDeps: [], join: "AND", locked: true, optional: false, enabled: true, blocking: true, gate: "",         sla: 10, slaRequired: true, docs: [] },
      { id: "s5", name: "Ký & niêm phong",            role: "ccv",      op: "sign",   deps: ["s3", "s4"],  lockedDeps: [], join: "AND", locked: true, optional: false, enabled: true, blocking: true, gate: "approved", sla: 25, slaRequired: true, docs: [] },
    ],
  },
];

/* ---- Tài khoản người dùng ---- */
const SA_ACCOUNTS = [
  { id: "u1", name: "Phan Thanh Tùng",   user: "admin.va",  role: "admin",   dept: "Ban Giám đốc",   place: "Trụ sở chính – Hà Đông", status: "active", last: "11/06 · 09:48", mustChange: false },
  { id: "u2", name: "Đỗ Quang Huy",      user: "huy.dq",    role: "leader",  dept: "Ban Giám đốc",   place: "Trụ sở chính – Hà Đông", status: "active", last: "11/06 · 08:20", mustChange: false },
  { id: "u3", name: "Nguyễn Quốc Việt",  user: "viet.nq",   role: "ccv",     dept: "Phòng nghiệp vụ", place: "Trụ sở chính – Hà Đông", status: "active", last: "11/06 · 09:31", mustChange: false },
  { id: "u4", name: "Lê Thị Hằng",       user: "hang.lt",   role: "ccv",     dept: "Phòng nghiệp vụ", place: "Trụ sở chính – Hà Đông", status: "active", last: "11/06 · 09:05", mustChange: false },
  { id: "u5", name: "Trần Thị Mỹ Linh",  user: "linh.tt",   role: "tknv",    dept: "Phòng nghiệp vụ", place: "Trụ sở chính – Hà Đông", status: "active", last: "11/06 · 09:42", mustChange: false },
  { id: "u6", name: "Phạm Thu Hà",       user: "ha.pt",     role: "tknv",    dept: "Phòng nghiệp vụ", place: "Chi nhánh Cầu Giấy",    status: "active", last: "11/06 · 09:15", mustChange: false },
  { id: "u7", name: "Nguyễn Thị Hoa",    user: "hoa.nt",    role: "cashier", dept: "Phòng tài chính", place: "Trụ sở chính – Hà Đông", status: "active", last: "11/06 · 09:20", mustChange: false },
  { id: "u8", name: "Lê Thị Mai",        user: "mai.lt",    role: "acct",    dept: "Phòng tài chính", place: "Trụ sở chính – Hà Đông", status: "active", last: "10/06 · 17:40", mustChange: false },
  { id: "u9", name: "Hoàng Minh Tuấn",   user: "tuan.hm",   role: "luutru",  dept: "Phòng lưu trữ",   place: "Trụ sở chính – Hà Đông", status: "active", last: "11/06 · 08:55", mustChange: false },
  { id: "u10", name: "Vũ Hải Nam",       user: "nam.vh",    role: "tknv",    dept: "Chi nhánh Cầu Giấy", place: "Chi nhánh Cầu Giấy", status: "locked", last: "28/05 · 16:10", mustChange: false },
];

/* ---- Nơi làm việc (văn phòng / chi nhánh) — quản lý ở tab riêng ---- */
const SA_WORKPLACES = [
  { id: "w1", name: "Trụ sở chính – Hà Đông", type: "Trụ sở chính", address: "Số 12 Quang Trung, P. Quang Trung, Hà Đông, Hà Nội", phone: "024 3556 7890", status: "active" },
  { id: "w2", name: "Chi nhánh Cầu Giấy",     type: "Chi nhánh",    address: "Số 88 Trần Thái Tông, P. Dịch Vọng, Cầu Giấy, Hà Nội", phone: "024 3768 1234", status: "active" },
];
const SA_WORKPLACE_TYPES = ["Trụ sở chính", "Chi nhánh", "Văn phòng đại diện", "Phòng công chứng"];

/* ---- Vai trò hệ thống (cho bảng tài khoản & ma trận) ---- */
const SA_SYSROLES = [
  { id: "admin",   label: "Quản trị viên" },
  { id: "leader",  label: "Lãnh đạo" },
  { id: "ccv",     label: "Công chứng viên" },
  { id: "tknv",    label: "Thư ký nghiệp vụ" },
  { id: "cashier", label: "Thu ngân" },
  { id: "acct",    label: "Kế toán" },
  { id: "luutru",  label: "Lưu trữ" },
];

/* ---- Ma trận quyền (RBAC): hàng = quyền, cột = vai trò, chia 3 nhóm ----
   Thứ tự cột hiển thị: Lãnh đạo · CCV · TKNV · Thu ngân · Kế toán · Lưu trữ · Admin */
const SA_PERM_COLS = ["leader", "ccv", "tknv", "cashier", "acct", "luutru", "admin"];

const SA_PERM_GROUPS = [
  {
    id: "A", title: "Nhóm A — Tác nghiệp hồ sơ",
    perms: [
      { id: "intake",   label: "Tiếp nhận hồ sơ" },
      { id: "draft",    label: "Soạn thảo văn bản" },
      { id: "check",    label: "Tra cứu ngăn chặn" },
      { id: "fee",      label: "Thu phí & phiếu thu" },
      { id: "invoice",  label: "Xuất hóa đơn" },
      { id: "number",   label: "Cấp số công chứng" },
      { id: "sign",     label: "Ký số" },
      { id: "digitize", label: "Số hóa & lưu trữ" },
      { id: "cmc",      label: "Đẩy & đồng bộ CMC" },
    ],
  },
  {
    id: "B", title: "Nhóm B — Hiệu chỉnh sau cấp số",
    perms: [
      { id: "edit_req",     label: "Tạo yêu cầu hiệu chỉnh" },
      { id: "edit_simple",  label: "Hiệu chỉnh thông tin đơn giản (không đụng Số CC)" },
      { id: "edit_socc",    label: "Sửa Số CC / Hủy số" },
      { id: "edit_approve", label: "Phê duyệt yêu cầu hiệu chỉnh" },
    ],
  },
  {
    id: "C", title: "Nhóm C — Quản trị & giám sát",
    perms: [
      { id: "report",  label: "Xem báo cáo điều hành" },
      { id: "audit",   label: "Xem nhật ký thao tác (Audit Trail)" },
      { id: "account", label: "Quản lý tài khoản & phân quyền" },
      { id: "token",   label: "Quản lý uỷ thác token" },
      { id: "flow",    label: "Cấu hình luồng nghiệp vụ" },
      { id: "system",  label: "Quản trị hệ thống" },
    ],
  },
];
const SA_PERMS = SA_PERM_GROUPS.flatMap((g) => g.perms);

/* matrix[permId][roleId] = true/false · Admin mặc định tick hết */
function saMx(roles) {
  const m = {}; SA_PERM_COLS.forEach((r) => (m[r] = r === "admin" ? true : roles.includes(r))); return m;
}
const SA_MATRIX = {
  // Nhóm A
  intake:   saMx(["ccv", "tknv", "cashier"]),
  draft:    saMx(["ccv", "tknv"]),
  check:    saMx(["ccv", "tknv"]),
  fee:      saMx(["cashier", "acct"]),
  invoice:  saMx(["cashier", "acct"]),
  number:   saMx(["cashier"]),
  sign:     saMx(["ccv"]),
  digitize: saMx(["luutru"]),
  cmc:      saMx(["ccv", "luutru"]),
  // Nhóm B
  edit_req:     saMx(["tknv", "luutru"]),
  edit_simple:  saMx(["ccv", "luutru"]),
  edit_socc:    saMx(["ccv"]),
  edit_approve: saMx(["ccv"]),
  // Nhóm C
  report:  saMx(["leader", "acct"]),
  audit:   saMx(["leader"]),
  account: saMx([]),
  token:   saMx(["leader"]),
  flow:    saMx([]),
  system:  saMx([]),
};

/* ---- Phân quyền uỷ thác Token CCV ---- */
/* Danh mục phạm vi có thể uỷ thác · "Ký số" bị KHÓA (thẩm quyền ký không uỷ thác được) */
const SA_DELEGATION_SCOPES = [
  { id: "push",      label: "Đẩy file" },
  { id: "cmc",       label: "Đồng bộ CMC" },
  { id: "edit_info", label: "Hiệu chỉnh thông tin" },
  { id: "edit_req",  label: "Tạo yêu cầu hiệu chỉnh" },
  { id: "sign",      label: "Ký số", locked: true },
];
/* Chủ Token CMC (CCV sở hữu token ký số) */
const SA_TOKEN_OWNERS = [
  { id: "t1", name: "Nguyễn Quốc Việt", token: "CMC-TK-••••A9F2", status: "active" },
  { id: "t2", name: "Lê Thị Hằng",      token: "CMC-TK-••••7C31", status: "active" },
];
/* Các uỷ thác đang có */
const SA_DELEGATIONS = [
  { id: "d1", delegatee: "Trần Thị Mỹ Linh", from: "Nguyễn Quốc Việt", scope: ["push", "cmc"],            expiry: "31/12/2026", status: "active" },
  { id: "d2", delegatee: "Hoàng Minh Tuấn",  from: "Lê Thị Hằng",      scope: ["push", "cmc", "edit_info"], expiry: "30/09/2026", status: "active" },
  { id: "d3", delegatee: "Phạm Thu Hà",      from: "Nguyễn Quốc Việt", scope: ["edit_req"],                expiry: "15/05/2026", status: "revoked" },
];

/* ---- Nhật ký thao tác (audit trail) ----
   Chi tiết drawer: dt (thời gian đầy đủ), risk (rủi ro cao), changes (so sánh cũ→mới,
   chỉ thao tác đổi giá trị), reason (lý do, nếu có), chain (chuỗi xử lý),
   cmc ({status,time} | null), ip (IP/thiết bị), hash (mã băm bản ghi). */
const SA_AUDIT = [
  {
    time: "11/06 · 09:48", actor: "Phan Thanh Tùng", action: "Sửa cấu hình luồng", cat: "config",
    target: "Luồng: Hợp đồng mua bán BĐS", via: "Token cá nhân", result: "ok",
    dt: "11/06/2026 · 09:48", risk: false,
    changes: [
      { field: "SLA bước Thẩm định", old: "30 phút", new: "45 phút" },
      { field: "Người duyệt mặc định", old: "Nguyễn Quốc Việt", new: "Lê Thị Hằng" },
    ],
    reason: "Điều chỉnh theo quy trình nội bộ mới Q2/2026.",
    chain: [
      { step: "Thực hiện", name: "Phan Thanh Tùng", role: "Quản trị viên", time: "11/06 09:48" },
    ],
    cmc: null, ip: "10.8.0.11 · Chrome/Win", hash: "7c4e·b108",
  },
  {
    time: "11/06 · 09:42", actor: "Trần Thị Mỹ Linh", action: "Yêu cầu chỉnh sửa", cat: "edit",
    target: "PGD-2026-0611-021", via: "Token CCV Nguyễn Quốc Việt", result: "synced",
    dt: "11/06/2026 · 09:42", risk: false,
    changes: [
      { field: "Địa chỉ bên A", old: "Số 12 Lê Lợi, P. Bến Nghé", new: "Số 12B Lê Lợi, P. Bến Nghé" },
    ],
    reason: "Sai sót chính tả địa chỉ trên hợp đồng.",
    chain: [
      { step: "Yêu cầu", name: "Trần Thị Mỹ Linh", role: "Thư ký nghiệp vụ", time: "11/06 09:30" },
      { step: "Duyệt", name: "Nguyễn Quốc Việt", role: "CCV, chủ token", time: "11/06 09:40" },
      { step: "Thực hiện & đồng bộ", name: "Trần Thị Mỹ Linh", role: "qua Token CCV Nguyễn Quốc Việt (uỷ thác)", time: "11/06 09:42" },
    ],
    cmc: { status: "ok", time: "11/06 09:42" }, ip: "10.8.0.34 · Chrome/Win", hash: "e2b9·44af",
  },
  {
    time: "11/06 · 09:31", actor: "Nguyễn Quốc Việt", action: "Ký số & đẩy CMC", cat: "sign",
    target: "PGD-2026-0611-018", via: "Token cá nhân", result: "synced",
    dt: "11/06/2026 · 09:31", risk: false,
    changes: null, reason: null,
    chain: [
      { step: "Thực hiện & đồng bộ", name: "Nguyễn Quốc Việt", role: "CCV, chủ token", time: "11/06 09:31" },
    ],
    cmc: { status: "ok", time: "11/06 09:31" }, ip: "10.8.0.12 · Chrome/Win", hash: "1d77·9c3a",
  },
  {
    time: "11/06 · 09:20", actor: "Nguyễn Thị Hoa", action: "Lập phiếu thu", cat: "fee",
    target: "PT-2026-0611-044", via: "—", result: "ok",
    dt: "11/06/2026 · 09:20", risk: false,
    changes: null, reason: null,
    chain: [
      { step: "Thực hiện", name: "Nguyễn Thị Hoa", role: "Thu ngân", time: "11/06 09:20" },
    ],
    cmc: null, ip: "10.8.0.51 · Chrome/Win", hash: "8a02·6efb",
  },
  {
    time: "11/06 · 09:15", actor: "Phạm Thu Hà", action: "Sửa số công chứng", cat: "edit",
    target: "0036-002041-2026", via: "Token CCV Lê Thị Hằng", result: "synced",
    dt: "11/06/2026 · 09:15", risk: true,
    changes: [
      { field: "Số công chứng", old: "0036-002040-2026", new: "0036-002041-2026" },
    ],
    reason: "Cấp trùng số do thao tác đồng thời — hiệu chỉnh theo biên bản ngày 11/06.",
    chain: [
      { step: "Yêu cầu", name: "Hoàng Minh Tuấn", role: "Lưu trữ", time: "10/06 16:42" },
      { step: "Duyệt", name: "Lê Thị Hằng", role: "CCV, chủ token", time: "11/06 09:14" },
      { step: "Thực hiện & đồng bộ", name: "Phạm Thu Hà", role: "qua Token CCV Lê Thị Hằng (uỷ thác)", time: "11/06 09:15" },
    ],
    cmc: { status: "ok", time: "11/06 09:15" }, ip: "10.8.0.21 · Chrome/Win", hash: "a1f3·9d2e",
  },
  {
    time: "11/06 · 08:55", actor: "Hoàng Minh Tuấn", action: "Số hóa & lưu trữ", cat: "digitize",
    target: "PGD-2026-0610-051", via: "—", result: "ok",
    dt: "11/06/2026 · 08:55", risk: false,
    changes: null, reason: null,
    chain: [
      { step: "Thực hiện", name: "Hoàng Minh Tuấn", role: "Lưu trữ", time: "11/06 08:55" },
    ],
    cmc: null, ip: "10.8.0.66 · Chrome/Win", hash: "3f5c·d014",
  },
  {
    time: "11/06 · 08:20", actor: "Đỗ Quang Huy", action: "Đăng nhập", cat: "auth",
    target: "Phân hệ Lãnh đạo", via: "—", result: "ok",
    dt: "11/06/2026 · 08:20", risk: false,
    changes: null, reason: null,
    chain: [
      { step: "Thực hiện", name: "Đỗ Quang Huy", role: "Lãnh đạo", time: "11/06 08:20" },
    ],
    cmc: null, ip: "10.8.0.5 · Safari/macOS", hash: "9b18·2a7d",
  },
  {
    time: "10/06 · 17:40", actor: "Lê Thị Mai", action: "Xuất hóa đơn", cat: "invoice",
    target: "HD-2026-001980", via: "—", result: "ok",
    dt: "10/06/2026 · 17:40", risk: false,
    changes: null, reason: null,
    chain: [
      { step: "Thực hiện", name: "Lê Thị Mai", role: "Kế toán", time: "10/06 17:40" },
    ],
    cmc: null, ip: "10.8.0.48 · Chrome/Win", hash: "c6d3·05be",
  },
  {
    time: "10/06 · 17:02", actor: "Trần Thị Mỹ Linh", action: "Huỷ số công chứng", cat: "edit",
    target: "PGD-2026-0610-019", via: "Token CCV Trần Minh Đức", result: "pending",
    dt: "10/06/2026 · 17:02", risk: true,
    changes: [
      { field: "Trạng thái hồ sơ", old: "Đã cấp số", new: "Đề nghị huỷ số" },
    ],
    reason: "Khách hàng rút yêu cầu công chứng — chờ CCV duyệt huỷ.",
    chain: [
      { step: "Yêu cầu", name: "Trần Thị Mỹ Linh", role: "Thư ký nghiệp vụ", time: "10/06 16:50" },
      { step: "Duyệt", name: "Trần Minh Đức", role: "CCV, chủ token", time: "Đang chờ", pending: true },
    ],
    cmc: { status: "pending", time: "—" }, ip: "10.8.0.34 · Chrome/Win", hash: "5e91·b7c2",
  },
  {
    time: "10/06 · 16:20", actor: "Lê Khánh Vy", action: "Sửa số công chứng", cat: "edit",
    target: "0036-001990-2026", via: "Token CCV Nguyễn Quốc Việt", result: "rejected",
    dt: "10/06/2026 · 16:20", risk: true,
    changes: [
      { field: "Số công chứng", old: "0036-001990-2026", new: "0036-001991-2026" },
    ],
    reason: "Đề nghị đổi số không có căn cứ — CCV từ chối.",
    chain: [
      { step: "Yêu cầu", name: "Lê Khánh Vy", role: "Thư ký nghiệp vụ", time: "10/06 16:10" },
      { step: "Từ chối", name: "Nguyễn Quốc Việt", role: "CCV, chủ token", time: "10/06 16:20", rejected: true },
    ],
    cmc: null, ip: "10.8.0.37 · Chrome/Win", hash: "0fa4·8d63",
  },
  {
    time: "10/06 · 15:38", actor: "Phan Thanh Tùng", action: "Khóa tài khoản", cat: "config",
    target: "Tài khoản: nam.vh", via: "Token cá nhân", result: "ok",
    dt: "10/06/2026 · 15:38", risk: true,
    changes: [
      { field: "Trạng thái tài khoản", old: "Hoạt động", new: "Đã khóa" },
    ],
    reason: "Nghỉ việc từ 10/06/2026 — thu hồi quyền truy cập.",
    chain: [
      { step: "Thực hiện", name: "Phan Thanh Tùng", role: "Quản trị viên", time: "10/06 15:38" },
    ],
    cmc: null, ip: "10.8.0.11 · Chrome/Win", hash: "b2e7·1f40",
  },
  {
    time: "10/06 · 14:05", actor: "Phan Thanh Tùng", action: "Cập nhật ma trận quyền", cat: "config",
    target: "Vai trò: Kế toán", via: "Token cá nhân", result: "ok",
    dt: "10/06/2026 · 14:05", risk: true,
    changes: [
      { field: "Quyền “Xuất hóa đơn”", old: "Không", new: "Có" },
      { field: "Quyền “Huỷ phiếu thu”", old: "Có", new: "Không" },
    ],
    reason: "Phân tách nhiệm vụ theo yêu cầu kiểm soát nội bộ.",
    chain: [
      { step: "Thực hiện", name: "Phan Thanh Tùng", role: "Quản trị viên", time: "10/06 14:05" },
    ],
    cmc: null, ip: "10.8.0.11 · Chrome/Win", hash: "4d8a·c2f1",
  },
];
const SA_AUDIT_CATS = [
  { id: "all", label: "Tất cả thao tác" },
  { id: "config", label: "Cấu hình hệ thống" },
  { id: "edit", label: "Sửa / xoá hồ sơ" },
  { id: "sign", label: "Ký số" },
  { id: "fee", label: "Thu phí" },
  { id: "invoice", label: "Hóa đơn" },
  { id: "digitize", label: "Số hóa" },
  { id: "auth", label: "Đăng nhập" },
];

window.SA_DATA = {
  roles: SA_ROLES, ops: SA_OPS, gates: SA_GATES, flows: SA_FLOWS, accounts: SA_ACCOUNTS,
  sysRoles: SA_SYSROLES, perms: SA_PERMS, permGroups: SA_PERM_GROUPS, permCols: SA_PERM_COLS, matrix: SA_MATRIX,
  workplaces: SA_WORKPLACES, workplaceTypes: SA_WORKPLACE_TYPES,
  delegationScopes: SA_DELEGATION_SCOPES, tokenOwners: SA_TOKEN_OWNERS, delegations: SA_DELEGATIONS,
  audit: SA_AUDIT, auditCats: SA_AUDIT_CATS,
  admin: { name: "Phan Thanh Tùng", role: "Quản trị viên" },
};
/* helpers */
window.SA_roleOf = (id) => SA_ROLES.find((r) => r.id === id) || SA_ROLES[0];
window.SA_opOf = (id) => SA_OPS.find((o) => o.id === id) || SA_OPS[0];
window.SA_gateOf = (id) => SA_GATES.find((g) => g.id === id) || SA_GATES[0];
