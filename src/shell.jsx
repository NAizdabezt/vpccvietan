/* global React, window */
/* Khung ứng dụng VPCC Việt An: Sidebar + Topbar + SessionBar */

const VA_NAV = [
  { group: "Phiên hồ sơ", items: [
    { id: "overview", label: "Luồng tổng quan", icon: "LayoutList" },
    { id: "compose", label: "Soạn thảo hồ sơ", icon: "PenLine" },
    { id: "completed", label: "Hồ sơ hoàn thành", icon: "FolderCheck" },
    { id: "requests", label: "Yêu cầu hiệu chỉnh", icon: "FileClock", ccvOnly: true, badgeKey: "requests" },
    { id: "photos", label: "Hàng chờ ảnh", icon: "Images" },
  ] },
  { group: "Thiết lập", items: [
    { id: "templates", label: "Biểu mẫu soạn thảo", icon: "FileStack" },
  ] },
];

function Sidebar({ active, onNav, role, badges }) {
  const L = window.LucideReact;
  const b = badges || {};
  const Shell = window.VAUi.SidebarShell; // màn hẹp: thu thành nút menu + drawer
  return (
    <Shell>
    <aside style={{
      width: "var(--sidebar-width)", flexShrink: 0, background: "var(--bg-sidebar)",
      borderRight: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column",
    }}>
      <div style={{
        height: "var(--topbar-height)", display: "flex", alignItems: "center", gap: 10,
        padding: "0 16px", borderBottom: "1px solid var(--border-subtle)",
      }}>
        <img src="assets/logo-fsi.png" alt="FSI" style={{ height: 26, width: "auto" }} />
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Công chứng số</div>
          <div style={{ fontSize: 10.5, color: "var(--text-tertiary)" }}>VPCC Việt An</div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: 8, display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
        {VA_NAV.map((grp) => {
          const items = grp.items.filter((it) => !it.ccvOnly || role === "ccv");
          if (items.length === 0) return null;
          return (
            <div key={grp.group} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text-disabled)", padding: "8px 12px 4px" }}>{grp.group}</div>
              {items.map((item) => {
                const Icon = L[item.icon];
                const on = active === item.id;
                const badge = item.badgeKey ? b[item.badgeKey] : item.badge;
                // href="#" để iOS Safari coi đây là link thật — <a> không href
                // bị iOS "nuốt" cú chạm trong một số điều kiện (menu không bấm được).
                return (
                  <a key={item.id} href="#" onClick={(e) => { e.preventDefault(); onNav && onNav(item.id); }} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
                    borderRadius: "var(--radius-md)", fontSize: 14, cursor: "pointer",
                    fontWeight: on ? 500 : 400,
                    color: on ? "var(--accent)" : "var(--text-tertiary)",
                    background: on ? "var(--accent-muted)" : "transparent",
                  }}
                  onMouseEnter={(e) => { if (!on) { e.currentTarget.style.background = "var(--bg-overlay)"; e.currentTarget.style.color = "var(--text-secondary)"; } }}
                  onMouseLeave={(e) => { if (!on) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-tertiary)"; } }}
                  >
                    <Icon size={16} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {badge ? (
                      <span style={{
                        minWidth: 18, height: 18, padding: "0 5px", borderRadius: 9, fontSize: 11,
                        fontWeight: 600, display: "grid", placeItems: "center",
                        background: "var(--color-danger)", color: "#fff",
                      }}>{badge}</span>
                    ) : null}
                  </a>
                );
              })}
            </div>
          );
        })}
      </nav>
      <div style={{ padding: 12, borderTop: "1px solid var(--border-subtle)", fontSize: 11, color: "var(--text-disabled)" }}>
        Phiên bản demo · PH01
      </div>
    </aside>
    </Shell>
  );
}

function RolePill({ role, onChange }) {
  const opts = [{ id: "tknv", label: "Thư ký nghiệp vụ" }, { id: "ccv", label: "Công chứng viên" }];
  return (
    <div style={{
      display: "flex", background: "var(--bg-inset)", borderRadius: "var(--radius-full)", padding: 3,
    }}>
      {opts.map((o) => {
        const on = role === o.id;
        return (
          <button key={o.id} type="button" onClick={() => onChange(o.id)} style={{
            border: "none", cursor: "pointer", borderRadius: "var(--radius-full)",
            padding: "5px 12px", fontSize: 12.5, fontWeight: on ? 600 : 500,
            fontFamily: "var(--font-sans)",
            background: on ? "var(--bg-surface)" : "transparent",
            color: on ? "var(--text-primary)" : "var(--text-tertiary)",
            boxShadow: on ? "var(--shadow-xs)" : "none",
          }}>{o.label}</button>
        );
      })}
    </div>
  );
}

function Topbar({ title, role, onRole, onLogout, nv }) {
  const { ProfileButton, VA_PROFILES, profileForNv } = window.VASessions;
  const vp = window.VAUi.useViewport();
  // Ưu tiên đúng nhân viên đang đăng nhập thật; chỉ rơi về mock nếu vì lý do gì
  // đó chưa có nv (không nên xảy ra vì trang đã chặn !authed từ trước).
  const profile = profileForNv(nv) || (role === "ccv" ? VA_PROFILES["viet.nq"] : VA_PROFILES["linh.tt"]);
  return (
    <header style={{
      height: "var(--topbar-height)", flexShrink: 0, display: "flex", alignItems: "center",
      justifyContent: "space-between", padding: window.VAUi.topbarPad(vp), borderBottom: "1px solid var(--border-subtle)",
      background: "var(--bg-base)",
    }}>
      <div style={{ fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {vp !== "mobile" && <>
          <span style={{ color: "var(--text-tertiary)" }}>VPCC Việt An</span>
          <span style={{ color: "var(--text-tertiary)", margin: "0 6px" }}>/</span>
        </>}
        <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{title || "Màn hình soạn thảo"}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <window.VASessions.NotificationBell />
        <ProfileButton profile={profile} onLogout={onLogout} />
      </div>
    </header>
  );
}

/* Dải Phiên giao dịch tổng — sợi dây xuyên suốt các khâu */
function SessionBar({ session }) {
  const L = window.LucideReact;
  const s = session || {};
  const Chip = ({ icon, label, value, mono }) => {
    const Icon = L[icon];
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon size={15} color="var(--text-tertiary)" />
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text-tertiary)", fontWeight: 600 }}>{label}</div>
          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", fontFamily: mono ? "var(--font-mono)" : "inherit" }}>{value}</div>
        </div>
      </div>
    );
  };
  const Sep = () => <span style={{ width: 1, height: 26, background: "var(--border-subtle)" }} />;
  const types = (s.types && s.types.join(", ")) || "Phiên mới";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px 18px", padding: "10px 20px", background: "var(--bg-surface)", borderBottom: "1px solid var(--border-default)", flexWrap: "wrap" }}>
      <Chip icon="Hash" label="Mã phiên" value={s.id || "—"} mono />
      <Sep />
      <Chip icon="User" label="Khách hàng" value={s.customer || "Chưa nhập"} />
      <Sep />
      <Chip icon="FileSignature" label="Biểu mẫu" value={types} />
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: "var(--radius-full)", background: "var(--bg-warning)", color: "var(--text-warning)", border: "1px solid var(--border-warning)" }}>
          <L.Clock size={12} /> Đang soạn thảo
        </span>
      </div>
    </div>
  );
}

window.VAShell = { Sidebar, Topbar, SessionBar };
