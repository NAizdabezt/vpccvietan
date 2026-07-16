/* global React, window */
/* PH02 shell — Sidebar riêng cho Thu ngân / Kế toán + Topbar + StatStrip */

const POS_NAV = {
  cashier: [
    { group: "Phiên hồ sơ", items: [
      { id: "overview", label: "Luồng tổng quan", icon: "LayoutList" },
      { id: "completed", label: "Hồ sơ hoàn thành", icon: "FolderCheck" },
    ] },
    { group: "Thu ngân", items: [{ id: "pos", label: "Quầy thu ngân", icon: "ReceiptText" }] },
  ],
  acct: [
    { group: "Phiên hồ sơ", items: [
      { id: "overview", label: "Luồng tổng quan", icon: "LayoutList" },
      { id: "completed", label: "Hồ sơ hoàn thành", icon: "FolderCheck" },
    ] },
    { group: "Kế toán", items: [
      { id: "recon", label: "Đối soát doanh thu", icon: "Scale" },
      { id: "invoice", label: "Hóa đơn điện tử", icon: "FileSpreadsheet" },
    ] },
  ],
};
const POS_TITLES = { overview: "Luồng tổng quan", completed: "Hồ sơ hoàn thành", pos: "Quầy thu ngân", recon: "Đối soát doanh thu", invoice: "Hóa đơn điện tử" };

function PosSidebar({ active, onNav, role }) {
  const L = window.LucideReact;
  const nav = POS_NAV[role] || POS_NAV.cashier;
  return (
    <aside style={{ width: "var(--sidebar-width)", flexShrink: 0, background: "var(--bg-sidebar)", borderRight: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column" }}>
      <div style={{ height: "var(--topbar-height)", display: "flex", alignItems: "center", gap: 10, padding: "0 16px", borderBottom: "1px solid var(--border-subtle)" }}>
        <img src="assets/logo-fsi.png" alt="FSI" style={{ height: 26, width: "auto" }} />
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Công chứng số</div>
          <div style={{ fontSize: 10.5, color: "var(--text-tertiary)" }}>VPCC Việt An</div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: 8, display: "flex", flexDirection: "column", gap: 4 }}>
        {nav.map((grp) => (
          <div key={grp.group} style={{ marginTop: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--text-disabled)", padding: "4px 12px 6px" }}>{grp.group}</div>
            {grp.items.map((item) => {
              const Icon = L[item.icon]; const on = active === item.id;
              return (
                <a key={item.id} onClick={() => onNav(item.id)} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: "var(--radius-md)",
                  fontSize: 14, cursor: "pointer", fontWeight: on ? 500 : 400,
                  color: on ? "var(--accent)" : "var(--text-tertiary)", background: on ? "var(--accent-muted)" : "transparent",
                }}
                onMouseEnter={(e) => { if (!on) { e.currentTarget.style.background = "var(--bg-overlay)"; e.currentTarget.style.color = "var(--text-secondary)"; } }}
                onMouseLeave={(e) => { if (!on) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-tertiary)"; } }}
                >
                  <Icon size={16} /><span>{item.label}</span>
                </a>
              );
            })}
          </div>
        ))}
      </nav>
      <div style={{ padding: 12, borderTop: "1px solid var(--border-subtle)", fontSize: 11, color: "var(--text-disabled)" }}>Phiên bản demo · PH02</div>
    </aside>
  );
}

function PosTopbar({ active, role, onLogout, nv }) {
  const { ProfileButton, VA_PROFILES, profileForNv, VA_TODAY } = window.VASessions;
  const profile = profileForNv(nv) || (role === "acct" ? VA_PROFILES["ke.dv"] : VA_PROFILES["ha.ptt"]);
  const roleLabel = role === "acct" ? "Kế toán" : "Thu ngân";
  const todayDMY = VA_TODAY.split("-").reverse().join("/");
  return (
    <header style={{ height: "var(--topbar-height)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-base)" }}>
      <div style={{ fontSize: 14 }}>
        <span style={{ color: "var(--text-tertiary)" }}>VPCC Việt An</span>
        <span style={{ color: "var(--text-tertiary)", margin: "0 6px" }}>/</span>
        <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{POS_TITLES[active]}</span>
        <span style={{ color: "var(--text-tertiary)", marginLeft: 12, fontSize: 12.5 }}>{todayDMY}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, padding: "4px 11px", borderRadius: "var(--radius-full)", background: "var(--accent-muted)", color: "var(--accent-hover)" }}>
          {roleLabel}
        </span>
        <window.VASessions.NotificationBell />
        <ProfileButton profile={profile} onLogout={onLogout} />
      </div>
    </header>
  );
}

// KPI ngày — trước đây đọc từ POS_DATA.stats tĩnh, giờ tính thẳng từ dữ liệu
// hồ sơ thật (window.VAStore, cùng nguồn với Luồng tổng quan) nên luôn khớp.
function StatStrip() {
  const { StatCard } = window.FSICheckinDesignSystem_019df8;
  const L = window.LucideReact;
  const VS = window.VASessions;
  const rows = window.VAStore.useHoSoStore();

  const chargedToday = VS.receiptRowsToday(rows);
  const revenueToday = chargedToday.reduce((sum, r) => sum + (r.amount || 0), 0);
  const waitingCount = rows.filter((r) => r.status === "waitNumberPay").length;
  const debtCount = rows.filter((r) => r.noTienThu || r.noHoSo).length;

  const stats = [
    { label: "Phiếu đã thu", value: String(chargedToday.length), icon: "ReceiptText", tone: "default" },
    { label: "Doanh thu ca", value: revenueToday.toLocaleString("vi-VN") + "₫", icon: "TrendingUp", tone: "success" },
    { label: "Đang chờ thu", value: String(waitingCount), icon: "Clock", tone: "warning" },
    { label: "Công nợ", value: String(debtCount), icon: "AlertTriangle", tone: debtCount > 0 ? "danger" : "default" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
      {stats.map((s) => (
        <StatCard key={s.label} label={s.label} value={s.value} icon={L[s.icon]} danger={s.tone === "danger"} />
      ))}
    </div>
  );
}

window.POSShell = { PosSidebar, PosTopbar, StatStrip };
