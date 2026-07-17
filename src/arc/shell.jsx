/* global React, window */
/* PH03 shell — Sidebar (Số hóa / Kho vật lý / CMC) + Topbar */

const ARC_SESSION_NAV = [
  { id: "overview", label: "Luồng tổng quan", icon: "LayoutList" },
  { id: "completed", label: "Hồ sơ hoàn thành", icon: "FolderCheck" },
];
const ARC_NAV = [
  { id: "scan", label: "Số hóa & đẩy CMC", icon: "ScanLine", badge: 3 },
  { id: "cmc", label: "Liên thông CMC", icon: "Cloud", badge: 2 },
  { id: "warehouse", label: "Kho vật lý", icon: "Warehouse" },
];
const ARC_TITLES = { overview: "Luồng tổng quan", completed: "Hồ sơ hoàn thành", scan: "Số hóa & đẩy CMC", cmc: "Liên thông CMC", warehouse: "Kho vật lý" };

function ArcSidebar({ active, onNav }) {
  const L = window.LucideReact;
  const Shell = window.VAUi.SidebarShell;
  return (
    <Shell>
    <aside style={{ width: "var(--sidebar-width)", flexShrink: 0, background: "var(--bg-sidebar)", borderRight: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column" }}>
      <div style={{ height: "var(--topbar-height)", display: "flex", alignItems: "center", gap: 10, padding: "0 16px", borderBottom: "1px solid var(--border-subtle)" }}>
        <img src="assets/logo-fsi.png" alt="FSI" style={{ height: 26, width: "auto" }} />
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Công chứng số</div>
          <div style={{ fontSize: 10.5, color: "var(--text-tertiary)" }}>VPCC Việt An</div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: 8, display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--text-disabled)", padding: "8px 12px 6px" }}>Phên hồ sơ</div>
        {ARC_SESSION_NAV.map((item) => {
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
              <Icon size={16} /><span style={{ flex: 1 }}>{item.label}</span>
            </a>
          );
        })}
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--text-disabled)", padding: "12px 12px 6px" }}>Lưu trữ &amp; Số hóa</div>
        {ARC_NAV.map((item) => {
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
              <Icon size={16} /><span style={{ flex: 1 }}>{item.label}</span>
              {item.badge ? <span style={{ minWidth: 18, height: 18, padding: "0 5px", borderRadius: 9, fontSize: 11, fontWeight: 600, display: "grid", placeItems: "center", background: item.id === "cmc" ? "var(--color-danger)" : item.id === "capso" ? "var(--accent)" : "var(--color-warning)", color: "#fff" }}>{item.badge}</span> : null}
            </a>
          );
        })}
      </nav>
      <div style={{ padding: 12, borderTop: "1px solid var(--border-subtle)", fontSize: 11, color: "var(--text-disabled)" }}>Phiên bản demo · PH03</div>
    </aside>
    </Shell>
  );
}

function ArcTopbar({ active, onLogout, nv }) {
  const { ProfileButton, VA_PROFILES, profileForNv } = window.VASessions;
  const D = window.ARC_DATA;
  const profile = profileForNv(nv) || VA_PROFILES["tuan.hm"];
  const vp = window.VAUi.useViewport();
  return (
    <header style={{ height: "var(--topbar-height)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: window.VAUi.topbarPad(vp), borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-base)" }}>
      <div style={{ fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {vp !== "mobile" && <>
          <span style={{ color: "var(--text-tertiary)" }}>VPCC Việt An</span>
          <span style={{ color: "var(--text-tertiary)", margin: "0 6px" }}>/</span>
        </>}
        <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{ARC_TITLES[active]}</span>
        {vp !== "mobile" && <span style={{ color: "var(--text-tertiary)", marginLeft: 12, fontSize: 12.5 }}>{D.today}</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {vp !== "mobile" && <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: "var(--radius-full)", background: "var(--accent-muted)", color: "var(--accent-hover)" }}>
          Lưu trữ / Scan
        </span>}
        <window.VASessions.NotificationBell />
        <ProfileButton profile={profile} onLogout={onLogout} />
      </div>
    </header>
  );
}

function ArcStatStrip() {
  const { StatCard } = window.FSICheckinDesignSystem_019df8;
  const L = window.LucideReact;
  const D = window.ARC_DATA;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
      {D.stats.map((s) => <StatCard key={s.label} label={s.label} value={s.value} icon={L[s.icon]} danger={s.tone === "danger"} />)}
    </div>
  );
}

window.ARCShell = { ArcSidebar, ArcTopbar, ArcStatStrip };
