/* global React, window */
/* PH05 — Quản lý tài khoản · Phân quyền (ma trận + uỷ thác) · Nhật ký thao tác
   Đã nối API thật cho: Tài khoản (NhanVien), Nơi làm việc (NoiLamViec),
   Ủy thác (UyThac), Nhật ký thao tác (NhatKyThaoTac — chỉ đọc, append-only).
   Ma trận RBAC (PermissionsView phần 1) VẪN CÒN CỤC BỘ có chủ đích: hệ thống
   hiện thực thi phân quyền bằng middleware theo vai trò (server/src/middleware/
   rbac.js — CCV kế thừa quyền TKNV theo đúng REQ-053), không phải bảng quyền
   tuỳ biến động trong DB; ma trận ở đây chỉ mang tính minh họa/tham khảo. */
const { useState: useGv, useEffect: useEffGv } = React;

/* Ánh xạ vai_tro backend (server/prisma/schema.prisma) ↔ id vai trò dùng để
   hiển thị nhãn (D.sysRoles) — hai không gian tên khác nhau, cần dịch qua lại. */
const ROLE_DB_TO_UI = { QTHT: "admin", LANH_DAO: "leader", CCV: "ccv", TKNV: "tknv", THU_NGAN: "cashier", KE_TOAN: "acct", LUU_TRU: "luutru" };
const ROLE_UI_TO_DB = { admin: "QTHT", leader: "LANH_DAO", ccv: "CCV", tknv: "TKNV", cashier: "THU_NGAN", acct: "KE_TOAN", luutru: "LUU_TRU" };

function gvFmtDT(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)} · ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function gvFmtDTFull(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} · ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/* Tải + dịch danh sách Tài khoản / Nơi làm việc sang đúng shape mà
   AccountsView/WorkplacesView đang dùng (giữ nguyên phần trình bày cũ). */
async function fetchWorkplacesAdapted() {
  const rows = await window.VAApi.noiLamViec.list();
  return rows.map((w) => ({ id: w.id, name: w.ten, type: w.loai || "Trụ sở chính", address: w.diaChi || "", phone: w.soDienThoai || "", status: w.trangThai ? "active" : "locked" }));
}
/* Nhãn/nhóm hiển thị cho từng mã loaiThaoTac ghi trong NhatKyThaoTac (server/src/lib/audit.js) */
const AUDIT_ACTION_LABELS = {
  DANG_NHAP: "Đăng nhập", DOI_MAT_KHAU: "Đổi mật khẩu", TAO_HO_SO: "Tạo hồ sơ",
  CHUYEN_TRANG_THAI: "Chuyển trạng thái hồ sơ", CAP_SO: "Cấp số công chứng", DAY_CMC: "Số hóa & đẩy CMC",
  TAO_TAI_KHOAN: "Tạo tài khoản", KHOA_TAI_KHOAN: "Khóa tài khoản", MO_KHOA_TAI_KHOAN: "Mở khóa tài khoản",
  DAT_LAI_MAT_KHAU: "Đặt lại mật khẩu", TAO_NOI_LAM_VIEC: "Tạo nơi làm việc", CAP_NHAT_NOI_LAM_VIEC: "Cập nhật nơi làm việc",
  TAO_UY_THAC: "Tạo ủy thác", SUA_UY_THAC: "Sửa ủy thác", THU_HOI_UY_THAC: "Thu hồi ủy thác",
};
const AUDIT_ACTION_CAT = {
  DANG_NHAP: "auth", DOI_MAT_KHAU: "auth", TAO_HO_SO: "config", CHUYEN_TRANG_THAI: "config",
  CAP_SO: "fee", DAY_CMC: "digitize", TAO_TAI_KHOAN: "config", KHOA_TAI_KHOAN: "config",
  MO_KHOA_TAI_KHOAN: "config", DAT_LAI_MAT_KHAU: "config", TAO_NOI_LAM_VIEC: "config",
  CAP_NHAT_NOI_LAM_VIEC: "config", TAO_UY_THAC: "config", SUA_UY_THAC: "config", THU_HOI_UY_THAC: "config",
};
const AUDIT_RESULT_MAP = { HOAN_TAT: "ok", DA_DONG_BO_CMC: "synced", CHO_DUYET: "pending", TU_CHOI: "rejected" };
const AUDIT_RISK_ACTIONS = new Set(["KHOA_TAI_KHOAN", "THU_HOI_UY_THAC", "DAT_LAI_MAT_KHAU"]);

function auditFromApi(r) {
  const dt = gvFmtDTFull(r.thoiGian);
  const actorName = r.nguoiThucHien ? r.nguoiThucHien.hoTen : "—";
  return {
    time: gvFmtDT(r.thoiGian), dt,
    actor: actorName,
    action: AUDIT_ACTION_LABELS[r.loaiThaoTac] || r.loaiThaoTac,
    cat: AUDIT_ACTION_CAT[r.loaiThaoTac] || "config",
    target: r.doiTuong,
    via: r.tokenSuDung || "—",
    result: AUDIT_RESULT_MAP[r.ketQua] || "ok",
    risk: AUDIT_RISK_ACTIONS.has(r.loaiThaoTac),
    changes: (r.giaTriCu != null || r.giaTriMoi != null) ? [{ field: "Giá trị", old: r.giaTriCu || "—", new: r.giaTriMoi || "—" }] : null,
    reason: null,
    chain: [{ step: "Thực hiện", name: actorName, role: "", time: dt }],
    cmc: r.ketQua === "DA_DONG_BO_CMC" ? { status: "ok", time: dt } : null,
    ip: r.ipThietBi || "—",
    hash: (r.maBam || "").slice(0, 4) + "·" + (r.maBam || "").slice(4, 8),
  };
}

async function fetchAccountsAdapted() {
  const [nvs, places] = await Promise.all([window.VAApi.nhanVien.list(), window.VAApi.noiLamViec.list()]);
  const placeName = {}; places.forEach((p) => { placeName[p.id] = p.ten; });
  return nvs.map((nv) => ({
    id: nv.id, name: nv.hoTen, user: nv.maNhanVien,
    role: ROLE_DB_TO_UI[(nv.vaiTro || [])[0]] || "tknv",
    place: nv.noiLamViecId ? (placeName[nv.noiLamViecId] || "—") : "—",
    dept: nv.noiLamViecId ? (placeName[nv.noiLamViecId] || "—") : "—",
    status: nv.trangThai === "ACTIVE" ? "active" : "locked",
    last: nv.lastLogin ? gvFmtDTFull(nv.lastLogin) : "Chưa đăng nhập",
    mustChange: !nv.lastLogin,
  }));
}

function SaCard({ title, desc, right, children, pad = 16 }) {
  return (
    <section style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", minWidth: 0 }}>
      {title && (
        <header style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{title}</h3>
            {desc && <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-tertiary)" }}>{desc}</p>}
          </div>
          {right}
        </header>
      )}
      <div style={{ padding: pad, minWidth: 0 }}>{children}</div>
    </section>
  );
}
const gvIconBtn = { border: "none", background: "transparent", cursor: "pointer", color: "var(--text-tertiary)", width: 30, height: 30, borderRadius: 6, display: "grid", placeItems: "center" };
const roleLabel = (id) => (window.SA_DATA.sysRoles.find((r) => r.id === id) || {}).label || id;
const DEFAULT_PWD = "123456";

/* Bỏ dấu tiếng Việt → ascii thường */
function gvSlug(s) {
  return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().replace(/[^a-z]/g, "");
}
/* Gợi ý tên đăng nhập: "Nguyễn Quốc Cường" → "cuong.nq"; trùng thì thêm số "cuong.nq1" */
function suggestUsername(fullName, taken) {
  const words = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "";
  const given = gvSlug(words[words.length - 1]);
  if (!given) return "";
  const initials = words.slice(0, -1).map((w) => gvSlug(w)[0] || "").join("");
  const base = initials ? given + "." + initials : given;
  const set = new Set((taken || []).map((u) => u.toLowerCase()));
  if (!set.has(base)) return base;
  let n = 1; while (set.has(base + n)) n++;
  return base + n;
}

/* ===================== Quản lý tài khoản ===================== */
function AccountsView({ onToast, accounts, setAccounts, workplaces, onRefresh }) {
  const L = window.LucideReact;
  const D = window.SA_DATA;
  const { Avatar, Badge, Button, Select, Input, Dialog } = window.FSICheckinDesignSystem_019df8;
  const accts = accounts;
  const [q, setQ] = useGv("");
  const [roleF, setRoleF] = useGv("all");
  const [addOpen, setAddOpen] = useGv(false);
  const [detail, setDetail] = useGv(null);
  const [nf, setNf] = useGv({ name: "", user: "", role: "tknv", place: (workplaces[0] || {}).name || "" });
  const [userEdited, setUserEdited] = useGv(false);

  const placeOpts = workplaces.filter((w) => w.status !== "locked").map((w) => w.name);
  const roleOpts = [{ value: "all", label: "Tất cả vai trò" }, ...D.sysRoles.map((r) => ({ value: r.id, label: r.label }))];
  const list = accts.filter((a) =>
    (roleF === "all" || a.role === roleF) &&
    (!q || a.name.toLowerCase().includes(q.toLowerCase()) || a.user.toLowerCase().includes(q.toLowerCase())));

  // Nhập tên → gợi ý tên đăng nhập (trừ khi người dùng đã tự sửa)
  const onName = (name) => {
    setNf((f) => ({ ...f, name, user: userEdited ? f.user : suggestUsername(name, accts.map((a) => a.user)) }));
  };
  const onUser = (user) => { setUserEdited(true); setNf((f) => ({ ...f, user: user.replace(/\s/g, "").toLowerCase() })); };

  const openAdd = () => {
    setUserEdited(false);
    setNf({ name: "", user: "", role: "tknv", place: (workplaces[0] || {}).name || "" });
    setAddOpen(true);
  };
  const addAcct = async () => {
    if (!nf.name.trim() || !nf.user.trim()) return;
    const place = workplaces.find((w) => w.name === nf.place);
    try {
      const created = await window.VAApi.nhanVien.create({
        hoTen: nf.name.trim(), maNhanVien: nf.user.trim(), email: nf.user.trim() + "@vietan.vn",
        vaiTro: [ROLE_UI_TO_DB[nf.role] || "TKNV"], noiLamViecId: place ? place.id : null,
      });
      onToast("Đã tạo tài khoản", nf.name + " · " + nf.user + " · mật khẩu mặc định " + created.matKhauMacDinh);
      setAddOpen(false);
      if (onRefresh) await onRefresh();
    } catch (e) {
      onToast("Tạo tài khoản thất bại", e.message, "danger");
    }
  };
  const toggleLock = async (id) => {
    const a = accts.find((x) => x.id === id);
    try {
      await window.VAApi.nhanVien.khoa(id);
      onToast(a.status === "locked" ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản", a.name);
      if (onRefresh) await onRefresh();
    } catch (e) {
      onToast("Thao tác thất bại", e.message, "danger");
    }
  };
  const resetPwd = async (id) => {
    const a = accts.find((x) => x.id === id);
    try {
      const res = await window.VAApi.nhanVien.datLaiMatKhau(id);
      onToast("Đã đặt lại mật khẩu", a.name + " · mật khẩu mặc định " + res.matKhauMacDinh + " · buộc đổi khi đăng nhập");
      setDetail((d) => d && d.id === id ? { ...d, mustChange: true } : d);
      if (onRefresh) await onRefresh();
    } catch (e) {
      onToast("Đặt lại mật khẩu thất bại", e.message, "danger");
    }
  };

  const active = accts.filter((a) => a.status === "active").length;
  const th = { padding: "9px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-tertiary)", whiteSpace: "nowrap" };
  const td = { padding: "11px 14px", fontSize: 13, verticalAlign: "middle" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* thanh công cụ */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220, maxWidth: 340 }}>
          <Input placeholder="Tìm theo tên hoặc tên đăng nhập…" value={q} onChange={(e) => setQ(e.target.value)}
            trailing={<L.Search size={15} />} />
        </div>
        <div style={{ minWidth: 180 }}><Select value={roleF} onChange={setRoleF} options={roleOpts} /></div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>{active}/{accts.length} đang hoạt động</span>
          <Button variant="primary" size="md" icon={L.UserPlus} onClick={openAdd}>Thêm tài khoản</Button>
        </div>
      </div>

      <SaCard pad={0}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead><tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <th style={th}>Người dùng</th><th style={th}>Vị trí làm việc</th><th style={th}>Nơi làm việc</th>
              <th style={th}>Trạng thái</th><th style={th}>Đăng nhập gần nhất</th><th style={{ ...th, textAlign: "right" }}>Thao tác</th>
            </tr></thead>
            <tbody>
              {list.map((a, i) => (
                <tr key={a.id} onClick={() => setDetail(a)} style={{ borderBottom: i < list.length - 1 ? "1px solid var(--border-subtle)" : "none", opacity: a.status === "locked" ? 0.62 : 1, cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-overlay)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <td style={td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={a.name} size={30} />
                      <div style={{ lineHeight: 1.2 }}>
                        <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                          {a.name}
                          {a.mustChange && <span title="Chưa đổi mật khẩu mặc định" style={{ display: "inline-flex" }}><L.KeyRound size={12} color="var(--text-warning)" /></span>}
                        </div>
                        <div style={{ fontSize: 11.5, fontFamily: "var(--font-mono)", color: "var(--text-tertiary)" }}>{a.user}</div>
                      </div>
                    </div>
                  </td>
                  <td style={td}>{roleLabel(a.role)}</td>
                  <td style={{ ...td, color: "var(--text-secondary)" }}>{a.place || a.dept}</td>
                  <td style={td}><Badge tone={a.status === "active" ? "success" : "neutral"} dot>{a.status === "active" ? "Hoạt động" : "Đã khóa"}</Badge></td>
                  <td style={{ ...td, fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-tertiary)" }}>{a.last}</td>
                  <td style={{ ...td, textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "inline-flex", gap: 2 }}>
                      <button type="button" title="Xem thông tin" style={gvIconBtn} onClick={() => setDetail(a)}><L.Eye size={15} /></button>
                      <button type="button" title={a.status === "locked" ? "Mở khóa" : "Khóa"} style={{ ...gvIconBtn, color: a.status === "locked" ? "var(--text-success)" : "var(--text-danger)" }} onClick={() => toggleLock(a.id)}>
                        {a.status === "locked" ? <L.LockOpen size={15} /> : <L.Lock size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>Không có tài khoản phù hợp.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </SaCard>

      {/* Dialog thêm tài khoản */}
      <Dialog open={addOpen} title="Thêm tài khoản" onClose={() => setAddOpen(false)}
        footer={
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Hủy</Button>
            <Button variant="primary" icon={L.Check} onClick={addAcct} disabled={!nf.name.trim() || !nf.user.trim()}>Tạo tài khoản</Button>
          </div>
        }>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 360 }}>
          <Input label="Họ và tên" placeholder="VD: Nguyễn Quốc Cường" value={nf.name} onChange={(e) => onName(e.target.value)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Select label="Vị trí làm việc" value={nf.role} onChange={(v) => setNf((f) => ({ ...f, role: v }))} options={D.sysRoles.map((r) => ({ value: r.id, label: r.label }))} />
            <Select label="Nơi làm việc" value={nf.place} onChange={(v) => setNf((f) => ({ ...f, place: v }))} options={placeOpts} />
          </div>
          <div>
            <Input label="Tên đăng nhập (tự gợi ý)" placeholder="tự sinh từ họ tên" value={nf.user} onChange={(e) => onUser(e.target.value)}
              trailing={userEdited ? <button type="button" title="Dùng gợi ý tự động" onClick={() => { setUserEdited(false); setNf((f) => ({ ...f, user: suggestUsername(f.name, accts.map((a) => a.user)) })); }} style={{ ...gvIconBtn, width: 24, height: 24 }}><L.RefreshCw size={13} /></button> : <L.Sparkles size={14} color="var(--accent)" />} />
            <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginTop: 5, display: "flex", alignItems: "center", gap: 5 }}>
              <L.Info size={12} /> Quy tắc: tên + chữ cái đầu họ &amp; đệm (vd <b style={{ fontFamily: "var(--font-mono)" }}>cuong.nq</b>) · trùng sẽ tự thêm số.
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 13px", borderRadius: "var(--radius-md)", background: "var(--bg-info)", border: "1px solid var(--border-info)" }}>
            <L.KeyRound size={15} color="var(--text-info)" style={{ marginTop: 1, flexShrink: 0 }} />
            <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Mật khẩu mặc định: <b style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{DEFAULT_PWD}</b>. Người dùng <b>bắt buộc đổi mật khẩu</b> ở lần đăng nhập đầu tiên.
            </div>
          </div>
        </div>
      </Dialog>

      {detail && <AccountDetailModal account={detail} onClose={() => setDetail(null)} onToggleLock={toggleLock} onResetPwd={resetPwd} />}
    </div>
  );
}

/* ===================== Modal chi tiết tài khoản ===================== */
function AccountDetailModal({ account, onClose, onToggleLock, onResetPwd }) {
  const L = window.LucideReact;
  const a = account;
  const { Avatar, Badge, Button } = window.FSICheckinDesignSystem_019df8;
  const Field = ({ icon, label, value, mono, children }) => {
    const Icon = icon ? L[icon] : null;
    return (
      <div style={{ display: "flex", gap: 12, padding: "11px 0", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ width: 150, flexShrink: 0, display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "var(--text-tertiary)" }}>{Icon && <Icon size={14} />}{label}</div>
        <div style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 500, fontFamily: mono ? "var(--font-mono)" : "inherit", wordBreak: "break-word" }}>{children || value || "—"}</div>
      </div>
    );
  };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(28,28,26,.46)" }} />
      <div style={{ position: "relative", width: 540, maxWidth: "100%", maxHeight: "92%", background: "var(--bg-surface)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "16px 18px", borderBottom: "1px solid var(--border-default)" }}>
          <Avatar name={a.name} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{a.name}</div>
            <div style={{ fontSize: 12.5, fontFamily: "var(--font-mono)", color: "var(--text-tertiary)" }}>{a.user}</div>
          </div>
          <Badge tone={a.status === "active" ? "success" : "neutral"} dot>{a.status === "active" ? "Hoạt động" : "Đã khóa"}</Badge>
          <button type="button" onClick={onClose} style={{ width: 30, height: 30, border: "none", background: "transparent", borderRadius: 7, cursor: "pointer", display: "grid", placeItems: "center", color: "var(--text-tertiary)" }}><L.X size={18} /></button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "6px 18px 14px" }}>
          <Field icon="BadgeCheck" label="Vị trí làm việc" value={roleLabel(a.role)} />
          <Field icon="Building2" label="Nơi làm việc" value={a.place || a.dept} />
          {a.dept && a.dept !== (a.place || a.dept) && <Field icon="Network" label="Phòng ban" value={a.dept} />}
          <Field icon="Clock" label="Đăng nhập gần nhất" value={a.last} mono />
          <Field icon="KeyRound" label="Mật khẩu">
            {a.mustChange
              ? <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "var(--text-warning)", background: "var(--bg-warning)", border: "1px solid var(--border-warning)", borderRadius: "var(--radius-full)", padding: "3px 10px" }}><L.AlertTriangle size={12} /> Mật khẩu mặc định · chưa đổi</span>
              : <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--text-success)" }}><L.ShieldCheck size={13} /> Đã đổi mật khẩu</span>}
          </Field>
        </div>

        <div style={{ borderTop: "1px solid var(--border-default)", padding: "14px 18px", display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="secondary" icon={L.RotateCcw} onClick={() => onResetPwd(a.id)}>Đặt lại mật khẩu</Button>
          <Button variant={a.status === "locked" ? "primary" : "secondary"} icon={a.status === "locked" ? L.LockOpen : L.Lock} onClick={() => { onToggleLock(a.id); onClose(); }}>{a.status === "locked" ? "Mở khóa" : "Khóa tài khoản"}</Button>
        </div>
      </div>
    </div>
  );
}

/* ===================== Phân quyền: ma trận + uỷ thác ===================== */
const scopeLabel = (id) => (window.SA_DATA.delegationScopes.find((s) => s.id === id) || {}).label || id;

function PermissionsView({ onToast }) {
  const L = window.LucideReact;
  const D = window.SA_DATA;
  const { Badge, Button } = window.FSICheckinDesignSystem_019df8;
  const cols = D.permCols;

  const [mx, setMx] = useGv(() => {
    const m = {}; D.perms.forEach((p) => { m[p.id] = { ...D.matrix[p.id] }; }); return m;
  });
  const [dirty, setDirty] = useGv(false);
  const [dels, setDels] = useGv([]);
  const [ccvList, setCcvList] = useGv([]);
  const [staffList, setStaffList] = useGv([]);
  const [modal, setModal] = useGv(null); // null | {mode:'create'} | {mode:'edit', id}

  const loadDelegations = async () => { setDels(await window.VAApi.uyThac.list()); };
  useEffGv(() => {
    loadDelegations();
    window.VAApi.nhanVien.list("CCV").then(setCcvList).catch(() => setCcvList([]));
    window.VAApi.nhanVien.list().then((all) => setStaffList(all.filter((n) => !n.vaiTro.includes("CCV") && n.trangThai === "ACTIVE"))).catch(() => setStaffList([]));
  }, []);

  const toggle = (pid, rid) => {
    if (rid === "admin") return; // Admin luôn toàn quyền
    setMx((m) => ({ ...m, [pid]: { ...m[pid], [rid]: !m[pid][rid] } }));
    setDirty(true);
  };

  const saveDelegation = async (data) => {
    try {
      if (modal && modal.mode === "edit") {
        await window.VAApi.uyThac.update(modal.id, { phamVi: data.scope, thoiHan: data.expiry });
        onToast("Đã cập nhật phạm vi uỷ thác", data.delegateeName);
      } else {
        await window.VAApi.uyThac.create({ nguoiDuocUyThacId: data.delegatee, ccvChuTokenId: data.from, phamVi: data.scope, thoiHan: data.expiry });
        onToast("Đã tạo uỷ thác mới", data.delegateeName + " · uỷ thác từ " + data.fromName);
      }
      setModal(null);
      await loadDelegations();
    } catch (e) {
      onToast("Thao tác thất bại", e.message, "danger");
    }
  };
  const revoke = async (id) => {
    const d = dels.find((x) => x.id === id);
    try {
      await window.VAApi.uyThac.thuHoi(id);
      onToast("Đã thu hồi uỷ thác", d.nguoiDuocUyThac.hoTen + " · cắt quyền tức thì, giữ lịch sử Audit Trail", "danger");
      await loadDelegations();
    } catch (e) {
      onToast("Thu hồi thất bại", e.message, "danger");
    }
  };

  const colTh = { padding: "10px 8px", fontSize: 11, fontWeight: 700, textAlign: "center", color: "var(--text-tertiary)", whiteSpace: "nowrap", verticalAlign: "bottom" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* ---------- PHẦN 1: MA TRẬN PHÂN QUYỀN ---------- */}
      <SaCard title="Ma trận phân quyền (RBAC)" desc="Tick để cấp quyền cho từng vai trò · Quản trị viên mặc định toàn quyền" pad={0}
        right={<span style={{ fontSize: 11.5, color: "var(--text-tertiary)", display: "inline-flex", alignItems: "center", gap: 5 }}><L.MousePointerClick size={13} /> Bấm ô để thay đổi</span>}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                <th style={{ ...colTh, textAlign: "left", position: "sticky", left: 0, background: "var(--bg-surface)", minWidth: 300, zIndex: 2 }}>Quyền hạn</th>
                {cols.map((r) => (
                  <th key={r} style={colTh}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      {r === "admin" && <L.ShieldCheck size={13} color="var(--accent)" />}
                      <span style={{ color: r === "admin" ? "var(--accent)" : "var(--text-secondary)" }}>{roleLabel(r)}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {D.permGroups.map((g) => (
                <React.Fragment key={g.id}>
                  <tr>
                    <td colSpan={cols.length + 1} style={{ padding: "9px 14px", background: "var(--bg-inset)", borderBottom: "1px solid var(--border-subtle)", position: "sticky", left: 0 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-secondary)" }}>{g.title}</span>
                    </td>
                  </tr>
                  {g.perms.map((p) => (
                    <tr key={p.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "9px 14px", fontSize: 13, fontWeight: 500, position: "sticky", left: 0, background: "var(--bg-surface)", zIndex: 1 }}>{p.label}</td>
                      {cols.map((r) => {
                        const on = !!mx[p.id][r];
                        const isAdmin = r === "admin";
                        return (
                          <td key={r} style={{ textAlign: "center", padding: "5px 0", background: isAdmin ? "var(--accent-muted)" : "transparent" }}>
                            <button type="button" onClick={() => toggle(p.id, r)} title={isAdmin ? "Quản trị viên luôn toàn quyền" : on ? "Bỏ quyền" : "Cấp quyền"}
                              style={{
                                width: 26, height: 26, borderRadius: 7, cursor: isAdmin ? "not-allowed" : "pointer", display: "inline-grid", placeItems: "center",
                                border: "1px solid " + (on ? (isAdmin ? "var(--accent)" : "var(--accent)") : "var(--border-default)"),
                                background: on ? "var(--accent)" : "var(--bg-surface)", color: "#fff", opacity: isAdmin ? 0.85 : 1, transition: "all .1s",
                              }}>
                              {on && <L.Check size={15} />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 16px", borderTop: "1px solid var(--border-subtle)" }}>
          <span style={{ fontSize: 12, color: dirty ? "var(--text-warning)" : "var(--text-tertiary)", display: "inline-flex", alignItems: "center", gap: 6 }}>
            {dirty ? <><L.AlertTriangle size={13} /> Có thay đổi chưa lưu</> : <><L.Check size={13} /> Đã đồng bộ</>}
          </span>
          <Button variant="primary" size="sm" icon={L.Save} disabled={!dirty} onClick={() => { setDirty(false); onToast("Đã lưu ma trận quyền", "Áp dụng cho toàn hệ thống"); }}>Lưu thay đổi</Button>
        </div>
      </SaCard>

      {/* ---------- PHẦN 2: PHÂN QUYỀN UỶ THÁC ---------- */}
      <SaCard title="Phân quyền uỷ thác (Token CCV)" desc="Tách bạch quyền thao tác — không dùng chung tài khoản định danh"
        right={<Button variant="primary" size="sm" icon={L.Plus} onClick={() => setModal({ mode: "create" })}>Tạo uỷ thác</Button>}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Chủ Token */}
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-tertiary)", marginBottom: 9 }}>Chủ Token CMC</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
              {ccvList.map((o) => (
                <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", background: "var(--bg-surface)" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: "var(--accent-muted)", display: "grid", placeItems: "center", flexShrink: 0 }}><L.KeyRound size={18} color="var(--accent)" /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{o.hoTen}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>CCV — chủ Token CMC · ký số &amp; đồng bộ</div>
                  </div>
                  <Badge tone="success" dot>Hoạt động</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Uỷ thác */}
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-tertiary)", marginBottom: 9 }}>Uỷ thác đang cấp</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 10 }}>
              {dels.map((d) => {
                const revoked = d.trangThai === "DA_THU_HOI";
                return (
                  <div key={d.id} style={{ padding: 14, border: "1px solid " + (revoked ? "var(--border-default)" : "var(--border-default)"), borderRadius: "var(--radius-md)", background: revoked ? "var(--bg-inset)" : "var(--bg-surface)", opacity: revoked ? 0.72 : 1 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: revoked ? "var(--bg-overlay)" : "var(--bg-success)", display: "grid", placeItems: "center", flexShrink: 0 }}><L.UserCheck size={17} color={revoked ? "var(--text-tertiary)" : "var(--text-success)"} /></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{d.nguoiDuocUyThac.hoTen}</div>
                        <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>Uỷ thác từ CCV {d.ccvChuToken.hoTen}</div>
                      </div>
                      <Badge tone={revoked ? "danger" : "success"} dot>{revoked ? "Đã thu hồi" : "Còn hiệu lực"}</Badge>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 6 }}>Phạm vi</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {d.phamVi.map((s) => (
                          <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: "var(--radius-full)", fontSize: 11.5, fontWeight: 500, background: "var(--bg-info)", color: "var(--text-info)", border: "1px solid var(--border-info)" }}>
                            <L.Check size={11} /> {scopeLabel(s)}
                          </span>
                        ))}
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: "var(--radius-full)", fontSize: 11.5, fontWeight: 500, background: "var(--bg-inset)", color: "var(--text-disabled)", border: "1px dashed var(--border-default)" }}>
                          <L.Lock size={10} /> Không gồm: Ký số
                        </span>
                      </div>
                    </div>

                    <div style={{ marginTop: 11, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
                      <L.CalendarClock size={13} color="var(--text-tertiary)" /> Thời hạn: <b style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{new Date(d.thoiHan).toLocaleDateString("vi-VN")}</b>
                    </div>

                    {!revoked && (
                      <div style={{ marginTop: 13, display: "flex", gap: 8, borderTop: "1px solid var(--border-subtle)", paddingTop: 12 }}>
                        <Button variant="secondary" size="sm" icon={L.SlidersHorizontal} onClick={() => setModal({ mode: "edit", id: d.id })}>Sửa phạm vi</Button>
                        <Button variant="ghost" size="sm" icon={L.Ban} onClick={() => revoke(d.id)} style={{ color: "var(--text-danger)" }}>Thu hồi uỷ thác</Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 11.5, color: "var(--text-tertiary)", lineHeight: 1.5 }}>
            <L.Info size={14} style={{ flexShrink: 0, marginTop: 1 }} /> Chỉ Admin hoặc Lãnh đạo mới cấp/sửa/thu hồi uỷ thác. Thu hồi cắt quyền tức thì nhưng giữ nguyên lịch sử trong Audit Trail. Thẩm quyền <b>Ký số không uỷ thác được</b>.
          </div>
        </div>
      </SaCard>

      {modal && <DelegationModal mode={modal.mode} data={modal.mode === "edit" ? dels.find((d) => d.id === modal.id) : null} ccvOpts={ccvList} staffOpts={staffList} onClose={() => setModal(null)} onSave={saveDelegation} />}
    </div>
  );
}

/* ===================== Modal tạo / sửa uỷ thác ===================== */
function DelegationModal({ mode, data, ccvOpts, staffOpts, onClose, onSave }) {
  const L = window.LucideReact;
  const D = window.SA_DATA;
  const { Dialog, Button, Select } = window.FSICheckinDesignSystem_019df8;
  const isEdit = mode === "edit";
  const staffSelectOpts = (staffOpts || []).map((a) => ({ value: a.id, label: a.hoTen }));
  const ccvSelectOpts = (ccvOpts || []).map((a) => ({ value: a.id, label: a.hoTen }));

  const [delegatee, setDelegatee] = useGv(data ? data.nguoiDuocUyThacId : ((staffOpts || [])[0] || {}).id || "");
  const [from, setFrom] = useGv(data ? data.ccvChuTokenId : ((ccvOpts || [])[0] || {}).id || "");
  const [scope, setScope] = useGv(data ? [...data.phamVi] : ["push", "cmc"]);
  const [expiry, setExpiry] = useGv(data ? String(data.thoiHan).slice(0, 10) : "");

  const toggleScope = (id) => setScope((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const valid = delegatee && from && scope.length > 0 && expiry;
  const nameOf = (opts, id) => (opts.find((o) => o.id === id) || {}).hoTen || "";

  return (
    <Dialog open title={isEdit ? "Sửa phạm vi uỷ thác" : "Tạo uỷ thác mới"} width={460} onClose={onClose}
      footer={
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={onClose}>Hủy</Button>
          <Button variant="primary" icon={isEdit ? L.Check : L.Plus} disabled={!valid}
            onClick={() => onSave({ delegatee, from, scope, expiry, delegateeName: nameOf(staffOpts || [], delegatee), fromName: nameOf(ccvOpts || [], from) })}>{isEdit ? "Lưu thay đổi" : "Tạo uỷ thác"}</Button>
        </div>
      }>
      <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        <Select label="Người được uỷ thác" value={delegatee} onChange={setDelegatee} options={staffSelectOpts} disabled={isEdit} />
        <Select label="Uỷ thác từ CCV (chủ token)" value={from} onChange={setFrom} options={ccvSelectOpts} disabled={isEdit} />

        <div>
          <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 7 }}>Phạm vi uỷ thác</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {D.delegationScopes.map((s) => {
              const on = scope.includes(s.id);
              const locked = s.locked;
              return (
                <div key={s.id} onClick={() => !locked && toggleScope(s.id)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: "var(--radius-md)", cursor: locked ? "not-allowed" : "pointer",
                    border: "1px solid " + (locked ? "var(--border-default)" : on ? "var(--accent)" : "var(--border-default)"),
                    background: locked ? "var(--bg-inset)" : on ? "var(--accent-muted)" : "var(--bg-surface)" }}>
                  <span style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, display: "grid", placeItems: "center",
                    border: "1.5px solid " + (locked ? "var(--border-strong)" : on ? "var(--accent)" : "var(--border-strong)"),
                    background: on && !locked ? "var(--accent)" : "transparent" }}>
                    {locked ? <L.Lock size={11} color="var(--text-disabled)" /> : on && <L.Check size={12} color="#fff" />}
                  </span>
                  <span style={{ flex: 1, fontSize: 13, color: locked ? "var(--text-disabled)" : "var(--text-primary)" }}>{s.label}</span>
                  {locked && <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Không uỷ thác được</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 7 }}>Thời hạn (bắt buộc)</div>
          <div style={{ position: "relative" }}>
            <input type="date" value={expiry} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setExpiry(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", fontSize: 14, fontFamily: "var(--font-sans)", borderRadius: "var(--radius-md)", border: "1px solid " + (expiry ? "var(--border-default)" : "var(--border-strong)"), background: "var(--bg-surface)", color: "var(--text-primary)" }} />
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginTop: 5, display: "flex", alignItems: "center", gap: 5 }}>
            <L.Info size={12} /> Không cho phép uỷ thác vô thời hạn.
          </div>
        </div>
      </div>
    </Dialog>
  );
}

/* ===================== Nhật ký thao tác ===================== */
function AuditView() {
  const L = window.LucideReact;
  const D = window.SA_DATA;
  const { Badge, Select, Input, Button } = window.FSICheckinDesignSystem_019df8;
  const [cat, setCat] = useGv("all");
  const [actor, setActor] = useGv("all");
  const [q, setQ] = useGv("");
  const [sel, setSel] = useGv(null);
  const [rows, setRows] = useGv([]);

  useEffGv(() => { window.VAApi.auditLog.list().then((data) => setRows(data.map(auditFromApi))).catch(() => setRows([])); }, []);

  const actors = ["all", ...Array.from(new Set(rows.map((a) => a.actor)))];
  const actorOpts = actors.map((a) => ({ value: a, label: a === "all" ? "Tất cả người dùng" : a }));
  const list = rows.filter((a) =>
    (cat === "all" || a.cat === cat) &&
    (actor === "all" || a.actor === actor) &&
    (!q || a.target.toLowerCase().includes(q.toLowerCase())));

  const resTone = { ok: "neutral", synced: "success", pending: "warning", rejected: "danger" };
  const resLabel = { ok: "Hoàn tất", synced: "Đã đồng bộ CMC", pending: "Chờ duyệt", rejected: "Từ chối" };
  const th = { padding: "9px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-tertiary)", whiteSpace: "nowrap" };
  const td = { padding: "11px 14px", fontSize: 13, verticalAlign: "middle" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ minWidth: 190 }}><Select value={actor} onChange={setActor} options={actorOpts} /></div>
        <div style={{ minWidth: 190 }}><Select value={cat} onChange={setCat} options={D.auditCats.map((c) => ({ value: c.id, label: c.label }))} /></div>
        <div style={{ flex: 1, minWidth: 200, maxWidth: 300 }}>
          <Input placeholder="Tìm theo mã hồ sơ / đối tượng…" value={q} onChange={(e) => setQ(e.target.value)} trailing={<L.Search size={15} />} />
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Button variant="secondary" size="md" icon={L.FileDown}>Xuất Excel</Button>
        </div>
      </div>

      <SaCard pad={0}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
            <thead><tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              {["Thời gian", "Người thực hiện", "Thao tác", "Đối tượng", "Đồng bộ qua", "Kết quả"].map((h, i) => <th key={i} style={th}>{h}</th>)}
            </tr></thead>
            <tbody>
              {list.map((a, i) => (
                <tr key={i} onClick={() => setSel(a)} style={{ borderBottom: i < list.length - 1 ? "1px solid var(--border-subtle)" : "none", cursor: "pointer", transition: "background .12s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-overlay)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ ...td, fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>{a.time}</td>
                  <td style={{ ...td, fontWeight: 500 }}>{a.actor}</td>
                  <td style={td}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}>
                      {a.risk && <L.TriangleAlert size={13} color="var(--text-warning)" />}{a.action}
                    </span>
                  </td>
                  <td style={{ ...td, fontSize: 12.5, fontFamily: "var(--font-mono)", color: "var(--accent-hover)" }}>{a.target}</td>
                  <td style={{ ...td, fontSize: 12, color: "var(--text-tertiary)" }}>{a.via}</td>
                  <td style={td}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <Badge tone={resTone[a.result]} dot>{resLabel[a.result]}</Badge>
                      <L.ChevronRight size={15} color="var(--text-tertiary)" style={{ flexShrink: 0 }} />
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>Không có bản ghi phù hợp.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </SaCard>
      <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: 6 }}>
        <L.Info size={13} /> Mọi thao tác sửa/xoá được log đích danh và đồng bộ CMC qua Token CCV uỷ quyền — phục vụ truy vết & thanh tra.
      </div>
      <AuditDetailDrawer record={sel} onClose={() => setSel(null)} />
    </div>
  );
}

/* ===================== Drawer chi tiết thao tác ===================== */
function AuditDetailDrawer({ record, onClose }) {
  const L = window.LucideReact;
  const { Badge } = window.FSICheckinDesignSystem_019df8;
  const [mounted, setMounted] = useGv(false);
  const [show, setShow] = useGv(false);

  React.useEffect(() => {
    if (record) {
      setMounted(true);
      const r = requestAnimationFrame(() => setShow(true));
      return () => cancelAnimationFrame(r);
    } else {
      setShow(false);
      const t = setTimeout(() => setMounted(false), 280);
      return () => clearTimeout(t);
    }
  }, [record]);

  React.useEffect(() => {
    if (!record) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [record, onClose]);

  if (!mounted) return null;
  const r = record || {};

  const SectionLabel = ({ children }) => (
    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text-tertiary)", marginBottom: 12 }}>{children}</div>
  );
  const Section = ({ children }) => (
    <div style={{ padding: "20px 24px", borderTop: "1px solid var(--border-subtle)" }}>{children}</div>
  );

  const stepTone = (c) => c.rejected ? "var(--text-danger)" : c.pending ? "var(--text-tertiary)" : c.step.startsWith("Thực hiện") ? "var(--text-success)" : "var(--accent)";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, pointerEvents: show ? "auto" : "none" }}>
      {/* overlay */}
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,.45)", backdropFilter: "blur(1.5px)", opacity: show ? 1 : 0, transition: "opacity .26s ease" }} />
      {/* panel */}
      <aside style={{ position: "absolute", top: 0, right: 0, height: "100%", width: "min(480px, 94vw)", background: "var(--bg-surface)", boxShadow: "-12px 0 40px rgba(15,23,42,.18)", display: "flex", flexDirection: "column", transform: show ? "translateX(0)" : "translateX(100%)", transition: "transform .28s cubic-bezier(.22,.61,.36,1)" }}>
        {/* header */}
        <div style={{ padding: "20px 24px 18px", borderBottom: "1px solid var(--border-default)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, color: "var(--text-tertiary)", marginBottom: 7 }}>Chi tiết thao tác</div>
              <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                <Badge tone={r.risk ? "warning" : "neutral"} dot>{r.action}</Badge>
                {r.risk && <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-warning)", display: "inline-flex", alignItems: "center", gap: 4 }}><L.TriangleAlert size={13} /> Rủi ro cao</span>}
              </div>
            </div>
            <button type="button" onClick={onClose} title="Đóng" style={{ width: 32, height: 32, flexShrink: 0, borderRadius: 8, border: "1px solid var(--border-default)", background: "var(--bg-surface)", color: "var(--text-secondary)", display: "grid", placeItems: "center", cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-overlay)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}><L.X size={17} /></button>
          </div>
          <div style={{ marginTop: 13, display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--text-primary)" }}>{r.target}</span>
            <span style={{ color: "var(--border-strong)" }}>·</span>
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-tertiary)" }}>{r.dt}</span>
          </div>
        </div>

        {/* body */}
        <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
          {/* NỘI DUNG THAY ĐỔI */}
          {r.changes && r.changes.length > 0 && (
            <Section>
              <SectionLabel>Nội dung thay đổi</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {r.changes.map((c, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 6 }}>{c.field}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, color: "var(--text-tertiary)", textDecoration: "line-through", fontFamily: "var(--font-mono)" }}>{c.old}</span>
                      <L.ArrowRight size={14} color="var(--text-tertiary)" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-success)", fontFamily: "var(--font-mono)" }}>{c.new}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* LÝ DO */}
          {r.reason && (
            <Section>
              <SectionLabel>Lý do</SectionLabel>
              <div style={{ display: "flex", gap: 10, padding: "12px 14px", borderRadius: "var(--radius-lg)", background: "var(--bg-inset)", border: "1px solid var(--border-subtle)" }}>
                <L.MessageSquareText size={15} color="var(--text-tertiary)" style={{ flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55 }}>{r.reason}</div>
              </div>
            </Section>
          )}

          {/* CHUỖI XỬ LÝ */}
          {r.chain && r.chain.length > 0 && (
            <Section>
              <SectionLabel>Chuỗi xử lý</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {r.chain.map((c, i) => {
                  const last = i === r.chain.length - 1;
                  const tone = stepTone(c);
                  return (
                    <div key={i} style={{ display: "flex", gap: 13 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                        <span style={{ width: 13, height: 13, borderRadius: "50%", background: c.pending ? "var(--bg-surface)" : tone, border: c.pending ? "2px solid var(--border-strong)" : "2px solid " + tone, marginTop: 3 }} />
                        {!last && <span style={{ width: 2, flex: 1, minHeight: 26, background: "var(--border-default)", marginTop: 2 }} />}
                      </div>
                      <div style={{ paddingBottom: last ? 0 : 16, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: tone }}>{c.step}</div>
                        <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 2 }}>{c.name} <span style={{ color: "var(--text-tertiary)" }}>· {c.role}</span></div>
                        <div style={{ fontSize: 11.5, fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", marginTop: 2 }}>{c.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* ĐỊNH DANH & ĐỒNG BỘ */}
          <Section>
            <SectionLabel>Định danh & đồng bộ</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--border-subtle)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
              <div style={{ background: "var(--bg-surface)", padding: "12px 14px" }}>
                <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginBottom: 6 }}>Đồng bộ CMC</div>
                {r.cmc ? (
                  r.cmc.status === "ok" ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
                      <L.CircleCheck size={14} color="var(--text-success)" />
                      <span style={{ fontWeight: 600, color: "var(--text-success)" }}>Thành công</span>
                      <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", fontSize: 11.5 }}>· {r.cmc.time}</span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
                      <L.Clock size={14} color="var(--text-warning)" />
                      <span style={{ fontWeight: 600, color: "var(--text-warning)" }}>Chờ đồng bộ</span>
                    </div>
                  )
                ) : (
                  <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--text-tertiary)" }}>—</div>
                )}
              </div>
              <div style={{ background: "var(--bg-surface)", padding: "12px 14px" }}>
                <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginBottom: 6 }}>IP / thiết bị</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <L.Monitor size={14} color="var(--text-tertiary)" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{r.ip}</span>
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* footer */}
        <div style={{ flexShrink: 0, padding: "13px 24px", borderTop: "1px solid var(--border-default)", background: "var(--bg-inset)", display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: "var(--text-tertiary)" }}>
          <L.Lock size={13} style={{ flexShrink: 0 }} />
          <span>Bản ghi nhật ký không thể chỉnh sửa · mã băm <b style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--text-secondary)" }}>{r.hash}</b></span>
        </div>
      </aside>
    </div>
  );
}

/* ===================== Quản lý nơi làm việc ===================== */
function WorkplacesView({ onToast, workplaces, setWorkplaces, accounts, onRefresh }) {
  const L = window.LucideReact;
  const D = window.SA_DATA;
  const { Badge, Button, Select, Input, Dialog } = window.FSICheckinDesignSystem_019df8;
  const [q, setQ] = useGv("");
  const [open, setOpen] = useGv(false);
  const [edit, setEdit] = useGv(null);
  const [wf, setWf] = useGv({ name: "", type: D.workplaceTypes[1], address: "", phone: "" });

  const staffOf = (name) => accounts.filter((a) => (a.place || a.dept) === name).length;
  const list = workplaces.filter((w) => !q || w.name.toLowerCase().includes(q.toLowerCase()) || (w.address || "").toLowerCase().includes(q.toLowerCase()));

  const openAdd = () => { setEdit(null); setWf({ name: "", type: D.workplaceTypes[1], address: "", phone: "" }); setOpen(true); };
  const openEdit = (w) => { setEdit(w.id); setWf({ name: w.name, type: w.type, address: w.address || "", phone: w.phone || "" }); setOpen(true); };
  const save = async () => {
    if (!wf.name.trim()) return;
    try {
      if (edit) {
        await window.VAApi.noiLamViec.update(edit, { ten: wf.name.trim(), loai: wf.type, diaChi: wf.address, soDienThoai: wf.phone });
        onToast("Đã cập nhật nơi làm việc", wf.name);
      } else {
        await window.VAApi.noiLamViec.create({ ten: wf.name.trim(), loai: wf.type, diaChi: wf.address, soDienThoai: wf.phone });
        onToast("Đã thêm nơi làm việc", wf.name);
      }
      setOpen(false);
      if (onRefresh) await onRefresh();
    } catch (e) {
      onToast("Lưu thất bại", e.message, "danger");
    }
  };
  const toggle = async (id) => {
    const w = workplaces.find((x) => x.id === id);
    try {
      await window.VAApi.noiLamViec.update(id, { trangThai: w.status === "locked" });
      onToast(w.status === "locked" ? "Đã kích hoạt nơi làm việc" : "Đã ngừng nơi làm việc", w.name);
      if (onRefresh) await onRefresh();
    } catch (e) {
      onToast("Thao tác thất bại", e.message, "danger");
    }
  };

  const typeTone = { "Trụ sở chính": "accent", "Chi nhánh": "info" };
  const th = { padding: "9px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-tertiary)", whiteSpace: "nowrap" };
  const td = { padding: "11px 14px", fontSize: 13, verticalAlign: "middle" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220, maxWidth: 360 }}>
          <Input placeholder="Tìm theo tên hoặc địa chỉ…" value={q} onChange={(e) => setQ(e.target.value)} trailing={<L.Search size={15} />} />
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>{workplaces.length} nơi làm việc</span>
          <Button variant="primary" size="md" icon={L.Plus} onClick={openAdd}>Thêm nơi làm việc</Button>
        </div>
      </div>

      <SaCard pad={0}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
            <thead><tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <th style={th}>Nơi làm việc</th><th style={th}>Loại</th><th style={th}>Địa chỉ</th>
              <th style={{ ...th, textAlign: "center" }}>Nhân sự</th><th style={th}>Trạng thái</th><th style={{ ...th, textAlign: "right" }}>Thao tác</th>
            </tr></thead>
            <tbody>
              {list.map((w, i) => (
                <tr key={w.id} style={{ borderBottom: i < list.length - 1 ? "1px solid var(--border-subtle)" : "none", opacity: w.status === "locked" ? 0.6 : 1 }}>
                  <td style={td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "grid", placeItems: "center", background: "var(--accent-muted)" }}><L.Building2 size={16} color="var(--accent)" /></span>
                      <span style={{ fontWeight: 600 }}>{w.name}</span>
                    </div>
                  </td>
                  <td style={td}><Badge tone={typeTone[w.type] || "neutral"}>{w.type}</Badge></td>
                  <td style={{ ...td, color: "var(--text-secondary)", fontSize: 12.5, maxWidth: 280 }}>{w.address || "—"}</td>
                  <td style={{ ...td, textAlign: "center", fontFamily: "var(--font-mono)" }}>{staffOf(w.name)}</td>
                  <td style={td}><Badge tone={w.status === "locked" ? "neutral" : "success"} dot>{w.status === "locked" ? "Ngừng" : "Hoạt động"}</Badge></td>
                  <td style={{ ...td, textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 2 }}>
                      <button type="button" title="Chỉnh sửa" style={gvIconBtn} onClick={() => openEdit(w)}><L.Pencil size={15} /></button>
                      <button type="button" title={w.status === "locked" ? "Kích hoạt" : "Ngừng hoạt động"} style={{ ...gvIconBtn, color: w.status === "locked" ? "var(--text-success)" : "var(--text-danger)" }} onClick={() => toggle(w.id)}>
                        {w.status === "locked" ? <L.Power size={15} /> : <L.PowerOff size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>Chưa có nơi làm việc nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </SaCard>

      <Dialog open={open} title={edit ? "Chỉnh sửa nơi làm việc" : "Thêm nơi làm việc"} onClose={() => setOpen(false)}
        footer={
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Button variant="ghost" onClick={() => setOpen(false)}>Hủy</Button>
            <Button variant="primary" icon={L.Check} onClick={save} disabled={!wf.name.trim()}>{edit ? "Lưu" : "Thêm"}</Button>
          </div>
        }>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 360 }}>
          <Input label="Tên nơi làm việc" placeholder="VD: Chi nhánh Thanh Xuân" value={wf.name} onChange={(e) => setWf({ ...wf, name: e.target.value })} />
          <Select label="Loại" value={wf.type} onChange={(v) => setWf({ ...wf, type: v })} options={D.workplaceTypes} />
          <Input label="Địa chỉ" placeholder="Số nhà, đường, phường/xã, quận/huyện" value={wf.address} onChange={(e) => setWf({ ...wf, address: e.target.value })} />
          <Input label="Số điện thoại" placeholder="VD: 024 1234 5678" value={wf.phone} onChange={(e) => setWf({ ...wf, phone: e.target.value })} />
        </div>
      </Dialog>
    </div>
  );
}

window.SaGovernance = { AccountsView, PermissionsView, AuditView, WorkplacesView, fetchAccountsAdapted, fetchWorkplacesAdapted };
