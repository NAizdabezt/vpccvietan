/* global React, window */
/* PH05 — Khung Quản trị hệ thống: Sidebar + Topbar */

const SA_NAV = [
  { id: "designer", label: "Thiết kế luồng", icon: "Workflow" },
  { id: "accounts", label: "Quản lý tài khoản", icon: "Users" },
  { id: "workplaces", label: "Quản lý nơi làm việc", icon: "Building2" },
  { id: "permissions", label: "Phân quyền", icon: "ShieldCheck" },
  { id: "audit", label: "Nhật ký thao tác", icon: "ScrollText" },
];
const SA_TITLES = {
  designer: "Thiết kế luồng nghiệp vụ",
  accounts: "Quản lý tài khoản",
  workplaces: "Quản lý nơi làm việc",
  permissions: "Phân quyền & uỷ thác",
  audit: "Nhật ký thao tác",
};

function SaSidebar({ active, onNav }) {
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
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--text-disabled)", padding: "8px 12px 6px" }}>Quản trị hệ thống</div>
        {SA_NAV.map((item) => {
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
      <div style={{ padding: 12, borderTop: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: "var(--text-tertiary)" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--color-success)" }} />
          Liên thông CMC · trực tuyến
        </div>
        <div style={{ fontSize: 11, color: "var(--text-disabled)", marginTop: 6 }}>Phiên bản demo · PH05</div>
      </div>
    </aside>
  );
}

function SaTopbar({ active, onLogout, nv }) {
  const { ProfileButton, profileForNv } = window.VASessions;
  const D = window.SA_DATA;
  const profile = profileForNv(nv) || D.admin;
  return (
    <header style={{ height: "var(--topbar-height)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-base)" }}>
      <div style={{ fontSize: 14 }}>
        <span style={{ color: "var(--text-tertiary)" }}>VPCC Việt An</span>
        <span style={{ color: "var(--text-tertiary)", margin: "0 6px" }}>/</span>
        <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{SA_TITLES[active]}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: "var(--radius-full)", background: "var(--accent-muted)", color: "var(--accent-hover)" }}>Quản trị viên</span>
        <window.VASessions.NotificationBell />
        <ProfileButton profile={profile} onLogout={onLogout} />
      </div>
    </header>
  );
}

window.SaShell = { SaSidebar, SaTopbar, SA_NAV, SA_TITLES };
