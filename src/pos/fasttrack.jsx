/* global React, window */
/* Dịch vụ nhanh (Fast-track) — 1 khách, nhiều hồ sơ (Sao y / Chứng thực chữ ký) + hình thức thu */
const { useState: useStateF } = React;

function ModeToggle({ value, onChange }) {
  const opts = [{ id: "saoy", label: "Sao y" }, { id: "chungthuc", label: "Chứng thực chữ ký" }];
  return (
    <div style={{ display: "inline-flex", background: "var(--bg-inset)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: 2 }}>
      {opts.map((o) => {
        const on = value === o.id;
        return (
          <button key={o.id} type="button" onClick={() => onChange(o.id)} style={{
            border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 12.5, fontWeight: on ? 600 : 500,
            padding: "5px 12px", borderRadius: "var(--radius-sm)", whiteSpace: "nowrap",
            background: on ? "var(--accent)" : "transparent", color: on ? "#fff" : "var(--text-secondary)",
          }}>{o.label}</button>
        );
      })}
    </div>
  );
}

function SegPayFast({ value, onChange }) {
  const opts = [{ id: "cash", label: "Tiền mặt", icon: "Banknote" }, { id: "transfer", label: "Chuyển khoản", icon: "ArrowLeftRight" }];
  const L = window.LucideReact;
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {opts.map((o) => {
        const on = value === o.id; const Icon = L[o.icon];
        return (
          <button key={o.id} type="button" onClick={() => onChange(o.id)} style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            padding: "9px", borderRadius: "var(--radius-md)", cursor: "pointer", fontFamily: "var(--font-sans)",
            fontSize: 13, fontWeight: on ? 600 : 500,
            border: "1px solid " + (on ? "var(--accent)" : "var(--border-default)"),
            background: on ? "var(--accent-muted)" : "var(--bg-surface)",
            color: on ? "var(--accent-hover)" : "var(--text-secondary)",
          }}><Icon size={16} /> {o.label}</button>
        );
      })}
    </div>
  );
}

/* Một hồ sơ (dòng dịch vụ) của khách */
function FastRow({ index, row, onChange, onDelete, canDelete }) {
  const L = window.LucideReact;
  const D = window.POS_DATA;
  const { fmtVND } = window.POSFmt;
  const cellInput = { border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "8px 10px", fontSize: 13, background: "var(--bg-surface)", outline: "none", fontFamily: "var(--font-sans)", width: "100%", color: "var(--text-primary)" };
  const monoInput = { ...cellInput, fontFamily: "var(--font-mono)" };
  const lbl = { fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-tertiary)", marginBottom: 5, display: "block" };
  const total = row.mode === "saoy" ? (row.qty || 0) * D.saoYPrice : (row.ctAmount || 0);

  return (
    <div style={{ border: "1px solid var(--border-default)", background: "var(--bg-elevated)", borderRadius: "var(--radius-lg)", padding: 14, marginBottom: 10 }}>
      {/* Hàng 1: số thứ tự hồ sơ + chế độ + xóa */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: "var(--accent-muted)", color: "var(--accent-hover)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{index + 1}</div>
        <ModeToggle value={row.mode} onChange={(m) => onChange({ mode: m })} />
        {canDelete && (
          <button type="button" onClick={onDelete} style={{ marginLeft: "auto", border: "none", background: "transparent", cursor: "pointer", color: "var(--text-tertiary)", display: "grid", placeItems: "center", width: 30, height: 30, borderRadius: "var(--radius-md)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-overlay)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}><L.Trash2 size={15} /></button>
        )}
      </div>

      {/* Hàng 2: tuỳ chế độ */}
      {row.mode === "saoy" ? (
        <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 1fr", gap: 12, alignItems: "end" }}>
          <div>
            <label style={lbl}>Số lượng</label>
            <input type="number" min={1} value={row.qty} onChange={(e) => onChange({ qty: parseInt(e.target.value || 0, 10) })} style={{ ...monoInput, textAlign: "center" }} />
          </div>
          <div>
            <label style={lbl}>Số sao y</label>
            <input value={row.soSaoY} placeholder="VD: 245/SY" onChange={(e) => onChange({ soSaoY: e.target.value })} style={monoInput} />
          </div>
          <div>
            <label style={lbl}>Thành tiền · 10.000₫/bản</label>
            <div style={{ ...monoInput, fontWeight: 700, background: "var(--bg-inset)", color: "var(--text-primary)", textAlign: "right" }}>{fmtVND(total)}</div>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 12, alignItems: "end" }}>
          <div>
            <label style={lbl}>Loại hợp đồng / giấy tờ</label>
            <div style={{ position: "relative" }}>
              <select value={row.ctType} onChange={(e) => onChange({ ctType: e.target.value })} style={{ ...cellInput, appearance: "none", paddingRight: 28, cursor: "pointer" }}>
                {D.chungThucTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <L.ChevronDown size={14} color="var(--text-tertiary)" style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
          </div>
          <div>
            <label style={lbl}>Số công chứng</label>
            <input value={row.soCC} placeholder="VD: 188/CT" onChange={(e) => onChange({ soCC: e.target.value })} style={monoInput} />
          </div>
          <div>
            <label style={lbl}>Số tiền</label>
            <div style={{ position: "relative" }}>
              <input type="text" value={(row.ctAmount || 0).toLocaleString("vi-VN")} onChange={(e) => onChange({ ctAmount: parseInt(e.target.value.replace(/\D/g, "") || 0, 10) })} style={{ ...monoInput, fontWeight: 600, paddingRight: 24 }} />
              <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", fontSize: 13 }}>₫</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FastTrackModal({ onClose }) {
  const L = window.LucideReact;
  const D = window.POS_DATA;
  const { fmtVND } = window.POSFmt;
  const { Button } = window.FSICheckinDesignSystem_019df8;
  const blank = () => ({ id: Date.now() + Math.random(), mode: "saoy", qty: 1, soSaoY: "", ctType: D.chungThucTypes[0], ctAmount: 50000, soCC: "" });
  const [name, setName] = useStateF("");
  const [pay, setPay] = useStateF("cash");
  const [rows, setRows] = useStateF([
    { id: 1, mode: "saoy", qty: 8, soSaoY: "", ctType: D.chungThucTypes[0], ctAmount: 50000, soCC: "" },
    { id: 2, mode: "chungthuc", qty: 1, soSaoY: "", ctType: "Sơ yếu lý lịch", ctAmount: 50000, soCC: "" },
  ]);

  const lineTotal = (r) => r.mode === "saoy" ? (r.qty || 0) * D.saoYPrice : (r.ctAmount || 0);
  const total = rows.reduce((s, r) => s + lineTotal(r), 0);

  const setRow = (id, patch) => setRows(rows.map((r) => r.id === id ? { ...r, ...patch } : r));
  const addRow = () => setRows([...rows, blank()]);
  const delRow = (id) => setRows(rows.filter((r) => r.id !== id));

  const cellInput = { border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "9px 11px", fontSize: 13.5, background: "var(--bg-surface)", outline: "none", fontFamily: "var(--font-sans)", width: "100%", color: "var(--text-primary)" };
  const lbl = { fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-tertiary)", marginBottom: 6, display: "block" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(28,28,26,.42)" }} />
      <div style={{ position: "relative", width: 720, maxWidth: "100%", maxHeight: "90%", background: "var(--bg-surface)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column", overflow: "hidden", animation: "vaPop .18s var(--ease-standard)" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: "1px solid var(--border-default)" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-muted)", display: "grid", placeItems: "center" }}><L.Zap size={17} color="var(--accent)" /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600 }}>Dịch vụ nhanh — Sao y / Chứng thực chữ ký</div>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Nhập siêu tốc cho khách vãng lai · không qua khâu soạn thảo</div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 30, height: 30, border: "none", background: "transparent", borderRadius: 7, cursor: "pointer", display: "grid", placeItems: "center", color: "var(--text-tertiary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-overlay)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}><L.X size={18} /></button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", minHeight: 0 }}>
          {/* Tên khách */}
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Tên khách hàng</label>
            <input value={name} placeholder="Họ tên khách vãng lai" onChange={(e) => setName(e.target.value)} style={cellInput} />
          </div>

          {/* Hồ sơ của khách */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <L.Files size={14} color="var(--text-secondary)" />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Hồ sơ của khách</span>
            <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>· {rows.length} hồ sơ</span>
          </div>
          {rows.map((r, i) => <FastRow key={r.id} index={i} row={r} onChange={(p) => setRow(r.id, p)} onDelete={() => delRow(r.id)} canDelete={rows.length > 1} />)}
          <button type="button" onClick={addRow} style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 2, border: "1px dashed var(--border-default)", background: "transparent", color: "var(--text-secondary)", borderRadius: "var(--radius-md)", padding: "8px 13px", fontSize: 12.5, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
            <L.Plus size={14} /> Thêm hồ sơ
          </button>

          {/* Hình thức thu */}
          <div style={{ marginTop: 18 }}>
            <label style={lbl}>Hình thức thu</label>
            <SegPayFast value={pay} onChange={setPay} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid var(--border-default)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>{rows.length} hồ sơ · {pay === "cash" ? "Tiền mặt" : "Chuyển khoản"}</div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>Tổng thu</span>
            <span style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-mono)" }}>{fmtVND(total)}</span>
          </div>
          <Button variant="ghost" onClick={onClose}>Đóng</Button>
          <Button variant="primary" icon={L.Printer} onClick={onClose}>Cấp số & In phơi</Button>
        </div>
      </div>
    </div>
  );
}

window.FastTrackModal = FastTrackModal;
