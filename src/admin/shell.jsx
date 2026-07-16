/* global React, window */
/* PH04 — Khung Dashboard điều hành: Sidebar + Topbar + Bộ lọc động */

const ADMIN_NAV = [
  { id: "overview", label: "Tổng quan", icon: "LayoutDashboard" },
  { id: "productivity", label: "Năng suất nhân sự", icon: "Users" },
  { id: "finance", label: "Tài chính & Doanh thu", icon: "Wallet" },
  { id: "reports", label: "Xuất báo cáo", icon: "FileDown" },
];
const ADMIN_TITLES = { overview: "Tổng quan điều hành", productivity: "Năng suất nhân sự", finance: "Tài chính & Doanh thu", reports: "Xuất báo cáo" };

function AdminSidebar({ active, onNav }) {
  const L = window.LucideReact;
  return (
    <aside style={{ width: "var(--sidebar-width)", flexShrink: 0, background: "var(--bg-sidebar)", borderRight: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column" }}>
      <div style={{ height: "var(--topbar-height)", display: "flex", alignItems: "center", gap: 10, padding: "0 16px", borderBottom: "1px solid var(--border-subtle)" }}>
        <img src="assets/logo-fsi.png" alt="FSI" style={{ height: 26, width: "auto" }} />
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Công chứng số</div>
          <div style={{ fontSize: 10.5, color: "var(--text-tertiary)" }}>VPCC Việt An</div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: 8, display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--text-disabled)", padding: "8px 12px 6px" }}>Phân hệ Lãnh đạo</div>
        {ADMIN_NAV.map((item) => {
          const Icon = L[item.icon]; const on = active === item.id;
          return (
            <a key={item.id} onClick={() => onNav(item.id)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: "var(--radius-md)",
              fontSize: 14, cursor: "pointer", fontWeight: on ? 500 : 400,
              color: on ? "var(--accent)" : "var(--text-tertiary)", background: on ? "var(--accent-muted)" : "transparent",
            }}
            onMouseEnter={(e) => { if (!on) { e.currentTarget.style.background = "var(--bg-overlay)"; e.currentTarget.style.color = "var(--text-secondary)"; } }}
            onMouseLeave={(e) => { if (!on) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-tertiary)"; } }}>
              <Icon size={16} /><span style={{ flex: 1 }}>{item.label}</span>
            </a>
          );
        })}
      </nav>
      <div style={{ padding: 12, borderTop: "1px solid var(--border-subtle)", fontSize: 11, color: "var(--text-disabled)" }}>Phiên bản demo · PH04</div>
    </aside>
  );
}

function AdminTopbar({ active, onLogout, nv }) {
  const { ProfileButton, profileForNv } = window.VASessions;
  const D = window.ADMIN_DATA;
  const profile = profileForNv(nv) || D.admin;
  return (
    <header style={{ height: "var(--topbar-height)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-base)" }}>
      <div style={{ fontSize: 14 }}>
        <span style={{ color: "var(--text-tertiary)" }}>VPCC Việt An</span>
        <span style={{ color: "var(--text-tertiary)", margin: "0 6px" }}>/</span>
        <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{ADMIN_TITLES[active]}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: "var(--radius-full)", background: "var(--accent-muted)", color: "var(--accent-hover)" }}>Lãnh đạo</span>
        <window.VASessions.NotificationBell />
        <ProfileButton profile={profile} onLogout={onLogout} />
      </div>
    </header>
  );
}

/* Bộ lọc động: thời gian + nhân sự + loại hồ sơ + xuất */
function FilterBar({ range, onRange, person, onPerson, type, onType, onExport, persons }) {
  const L = window.LucideReact;
  const { Select } = window.FSICheckinDesignSystem_019df8;
  const D = window.ADMIN_DATA;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", background: "var(--bg-surface)", borderBottom: "1px solid var(--border-default)", flexWrap: "wrap" }}>
      <div style={{ display: "flex", background: "var(--bg-inset)", borderRadius: "var(--radius-full)", padding: 3 }}>
        {D.ranges.map((r) => {
          const on = range === r.id;
          return (
            <button key={r.id} type="button" onClick={() => onRange(r.id)} style={{
              border: "none", cursor: "pointer", borderRadius: "var(--radius-full)", padding: "5px 13px", fontSize: 12.5,
              fontWeight: on ? 600 : 500, fontFamily: "var(--font-sans)",
              background: on ? "var(--bg-surface)" : "transparent", color: on ? "var(--text-primary)" : "var(--text-tertiary)",
              boxShadow: on ? "var(--shadow-xs)" : "none",
            }}>{r.label}</button>
          );
        })}
      </div>
      <div style={{ width: 1, height: 24, background: "var(--border-subtle)" }} />
      <div style={{ minWidth: 180 }}>
        <Select value={person} onChange={onPerson} options={persons} />
      </div>
      <div style={{ minWidth: 160 }}>
        <Select value={type} onChange={onType} options={["Tất cả loại hồ sơ", ...D.types]} />
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-tertiary)" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--color-success)" }} /> Real-time</span>
      </div>
    </div>
  );
}

window.AdminShell = { AdminSidebar, AdminTopbar, FilterBar, ADMIN_TITLES };
