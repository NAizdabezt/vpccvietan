/* global React, window */
/* PH03 — Kho vật lý: sơ đồ kệ × hộp + drawer hộp + in bìa */
const { useState: useStateW } = React;

const BOX_STYLE = {
  stored:   { bg: "var(--accent-muted)", bd: "var(--accent-border)", fg: "var(--accent-hover)", icon: "Box" },
  full:     { bg: "var(--bg-warning)", bd: "var(--border-warning)", fg: "var(--text-warning)", icon: "PackageCheck" },
  empty:    { bg: "var(--bg-surface)", bd: "var(--border-default)", fg: "var(--text-disabled)", icon: "Square" },
  sealed:   { bg: "var(--bg-danger)", bd: "var(--border-danger)", fg: "var(--text-danger)", icon: "Lock" },
};

function Legend() {
  const items = [["stored", "Đang lưu"], ["full", "Đầy"], ["empty", "Trống"], ["sealed", "Niêm phong"]];
  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {items.map(([k, label]) => {
        const s = BOX_STYLE[k];
        return (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
            <span style={{ width: 13, height: 13, borderRadius: 3, background: s.bg, border: "1px solid " + s.bd }} />{label}
          </div>
        );
      })}
    </div>
  );
}

function WarehouseMap({ onPick }) {
  const L = window.LucideReact;
  const D = window.ARC_DATA;
  const { shelves, boxesPerShelf, boxState } = D.warehouse;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {shelves.map((sh) => (
        <div key={sh} style={{ border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", background: "var(--bg-surface)", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-elevated)" }}>
            <L.Library size={15} color="var(--text-secondary)" />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Kệ {sh}</span>
            <span style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>· {boxesPerShelf} hộp</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 10, padding: 14 }}>
            {[...Array(boxesPerShelf)].map((_, i) => {
              const id = sh + "-" + (i + 1);
              const meta = boxState[id] || {};
              const state = meta.state || "stored";
              const s = BOX_STYLE[state];
              const Icon = L[s.icon];
              const interactive = state !== "empty";
              return (
                <button key={id} type="button" disabled={!interactive} onClick={() => interactive && onPick({ id, ...meta, state })} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
                  aspectRatio: "1 / 1", borderRadius: "var(--radius-md)", cursor: interactive ? "pointer" : "default",
                  background: s.bg, border: "1px solid " + s.bd, color: s.fg, fontFamily: "var(--font-sans)", padding: 6,
                  transition: "transform var(--dur-fast)", position: "relative",
                }}
                onMouseEnter={(e) => { if (interactive) e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
                >
                  <Icon size={20} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600 }}>{id}</span>
                  {state === "stored" && meta.fill != null && (
                    <span style={{ position: "absolute", bottom: 0, left: 0, height: 3, width: (meta.fill * 100) + "%", background: "var(--accent)", borderRadius: "0 2px 0 0" }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function BoxDrawer({ box, onClose }) {
  const L = window.LucideReact;
  const D = window.ARC_DATA;
  const { Button, Badge } = window.FSICheckinDesignSystem_019df8;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(28,28,26,.32)" }} />
      <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 460, maxWidth: "92%", background: "var(--bg-surface)", boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column", animation: "vaSlideIn .2s var(--ease-standard)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: "1px solid var(--border-default)" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-muted)", display: "grid", placeItems: "center" }}><L.Box size={17} color="var(--accent)" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, fontFamily: "var(--font-mono)" }}>Hộp {box.id}</div>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{box.label}</div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 30, height: 30, border: "none", background: "transparent", borderRadius: 7, cursor: "pointer", display: "grid", placeItems: "center", color: "var(--text-tertiary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-overlay)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}><L.X size={18} /></button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 18, minHeight: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)" }}>Hồ sơ trong hộp</span>
            <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>· {D.boxContents.length} hồ sơ</span>
          </div>
          <div style={{ border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
            {D.boxContents.map((it, i) => (
              <div key={it.soCC} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderTop: i ? "1px solid var(--border-subtle)" : "none" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-tertiary)", width: 42 }}>{it.soCC}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{it.khach}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>{it.service} · {it.date}</div>
                </div>
                <Badge tone="neutral">Trong kho</Badge>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border-default)", padding: "14px 18px", display: "flex", gap: 10 }}>
          <Button variant="secondary" icon={L.Printer} fullWidth>In nhãn hộp</Button>
          <Button variant="primary" icon={L.Check} fullWidth onClick={onClose}>Đóng</Button>
        </div>
      </div>
    </div>
  );
}

function WarehouseScreen() {
  const L = window.LucideReact;
  const { Button } = window.FSICheckinDesignSystem_019df8;
  const [box, setBox] = useStateW(null);
  return (
    <div style={{ height: "100%", overflowY: "auto", padding: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Sơ đồ kho vật lý</h1>
            <p style={{ fontSize: 13.5, color: "var(--text-tertiary)", margin: "2px 0 0" }}>Định vị hộp lưu theo kệ · click hộp để xem hồ sơ bên trong</p>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, maxWidth: 300, background: "var(--bg-inset)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", padding: "8px 12px" }}>
            <L.Search size={15} color="var(--text-tertiary)" />
            <input placeholder="Tra vị trí theo số CC…" style={{ border: "none", background: "transparent", outline: "none", fontSize: 13.5, flex: 1, fontFamily: "var(--font-sans)", color: "var(--text-primary)" }} />
          </div>
          <Button variant="secondary" icon={L.QrCode}>In nhãn QR</Button>
        </div>
        <Legend />
        <WarehouseMap onPick={setBox} />
      </div>
      {box && <BoxDrawer box={box} onClose={() => setBox(null)} />}
    </div>
  );
}

window.ARCWarehouse = { WarehouseScreen };
