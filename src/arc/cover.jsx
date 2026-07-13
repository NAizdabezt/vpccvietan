/* global React, window */
/* PH03 — Bìa lưu trữ hồ sơ công chứng (in màu, chọn màu được) + modal in
   - Trường chỉnh sửa được: Bên A, Bên B, Loại hồ sơ, Ngày công chứng
   - Số công chứng KHÓA (không sửa)
   - Chọn màu bìa (gợi ý theo năm, đổi tùy ý)
   Export: window.ARCCover = { ArchiveCover, CoverModal, parseCC, yearColor, autoName, fmtDate } */
const { useState: useCv } = React;

/* Tách "0036-001965-2026" → { book, num, year } */
function parseCC(cc) {
  const p = String(cc || "").split("-");
  return { book: p[0] || "0036", num: p[1] || "——", year: p[2] || "2026" };
}

/* Bảng màu bìa — gợi ý mặc định theo năm */
const COVER_COLORS = [
  { c: "#2563eb", soft: "#dbeafe", name: "Xanh dương" },
  { c: "#16a34a", soft: "#dcfce7", name: "Xanh lá" },
  { c: "#d97706", soft: "#fef3c7", name: "Cam" },
  { c: "#dc2626", soft: "#fee2e2", name: "Đỏ" },
  { c: "#7c3aed", soft: "#ede9fe", name: "Tím" },
  { c: "#0d9488", soft: "#ccfbf1", name: "Xanh ngọc" },
  { c: "#475569", soft: "#e2e8f0", name: "Xám" },
];
const YEAR_DEFAULT = { "2026": 0, "2025": 1, "2024": 2, "2023": 4, "2022": 3 };
function yearColor(y) { return COVER_COLORS[YEAR_DEFAULT[y] != null ? YEAR_DEFAULT[y] : 6]; }

/* Tên file chuẩn của Sở: 0036-[Số CC]-[năm]-[VB|HS] */
function autoName(cc, suffix) {
  return String(cc || "0036-……-2026") + "-" + suffix + ".pdf";
}

/* ISO 2026-06-14 → 14/06/2026 */
function fmtDate(iso) {
  if (!iso) return "";
  if (iso.indexOf("/") >= 0) return iso.split(" ")[0];
  const [y, m, d] = String(iso).split("-");
  if (!y || !m || !d) return iso;
  return d + "/" + m + "/" + y;
}

/* Mã vạch trang trí dựng từ chuỗi số CC */
function Barcode({ text }) {
  const s = String(text || "0036");
  const bars = [];
  for (let i = 0; i < 46; i++) bars.push(((s.charCodeAt(i % s.length) || 3) % 3) + 1);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "stretch", gap: 1, height: 34 }}>
        {bars.map((w, i) => <span key={i} style={{ width: w, background: "#1c1c1a", borderRadius: 0.5 }} />)}
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, marginTop: 4, color: "#52525b", letterSpacing: ".1em" }}>{text}</div>
    </div>
  );
}

function CoverField({ label, value, mono, editable, onChange, placeholder, accent }) {
  const valStyle = { flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 600, color: "#18181b", fontFamily: mono ? "var(--font-mono)" : "inherit", wordBreak: "break-word" };
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "center", padding: "9px 0", borderBottom: "1px dashed #e4e4e7" }}>
      <div style={{ width: 138, flexShrink: 0, fontSize: 10.5, fontWeight: 700, letterSpacing: ".06em", color: "#71717a" }}>{label}</div>
      {editable ? (
        <input value={value} placeholder={placeholder || "—"} onChange={(e) => onChange(e.target.value)}
          style={{ ...valStyle, border: "none", borderBottom: "1px solid transparent", background: "transparent", outline: "none", padding: "1px 2px 2px", borderRadius: 3 }}
          onFocus={(e) => { e.target.style.borderBottomColor = accent || "#94a3b8"; e.target.style.background = "rgba(0,0,0,.02)"; }}
          onBlur={(e) => { e.target.style.borderBottomColor = "transparent"; e.target.style.background = "transparent"; }} />
      ) : (
        <div style={valStyle}>{value || "—"}</div>
      )}
    </div>
  );
}

/* Bìa lưu trữ — bản in màu A4 thu nhỏ */
function ArchiveCover({ row, idForPrint, color, editable, fields, onField }) {
  const L = window.LucideReact;
  const cc = parseCC(row.ccNumber);
  const yc = color || yearColor(cc.year);
  const f = fields || {
    customer: row.customer || "",
    partyB: row.partyB || "",
    types: (row.types || []).join(", "),
    date: fmtDate(row.completedAt || row.updatedAt || row.date),
  };
  const set = onField || (() => {});
  const ink = { WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" };
  return (
    <div id={idForPrint} style={{ width: 470, background: "#fff", color: "#18181b", borderRadius: 6, overflow: "hidden", fontFamily: "var(--font-sans)", border: "1px solid #e4e4e7", boxShadow: "var(--shadow-lg)", ...ink }}>
      {/* Dải màu */}
      <div style={{ background: yc.c, color: "#fff", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", ...ink }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: ".16em", fontWeight: 600, opacity: 0.9 }}>VĂN PHÒNG CÔNG CHỨNG VIỆT AN</div>
          <div style={{ fontSize: 19, fontWeight: 800, marginTop: 3, letterSpacing: ".01em" }}>BÌA LƯU TRỮ HỒ SƠ</div>
        </div>
        <div style={{ textAlign: "right", lineHeight: 1 }}>
          <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "var(--font-mono)" }}>{cc.year}</div>
          <div style={{ fontSize: 11, opacity: 0.9, marginTop: 4 }}>Quyển {cc.book}</div>
        </div>
      </div>

      {/* Số công chứng (khóa) */}
      <div style={{ padding: "18px 24px", background: yc.soft, borderBottom: "2.5px solid " + yc.c, ...ink }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 10.5, letterSpacing: ".12em", fontWeight: 700, color: yc.c }}>SỐ CÔNG CHỨNG</div>
          {editable && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 9, fontWeight: 700, letterSpacing: ".04em", color: yc.c, background: "#fff", border: "1px solid " + yc.c, borderRadius: 999, padding: "1px 7px 1px 5px", lineHeight: 1.4 }}><L.Lock size={9} /> KHÓA</span>}
        </div>
        <div style={{ fontSize: 34, fontWeight: 800, fontFamily: "var(--font-mono)", color: "#18181b", letterSpacing: "-.01em", marginTop: 2 }}>{row.ccNumber || "—"}</div>
      </div>

      {/* Trường dữ liệu */}
      <div style={{ padding: "8px 24px 6px" }}>
        <CoverField label="BÊN A" value={f.customer} editable={editable} onChange={(v) => set("customer", v)} accent={yc.c} />
        <CoverField label="BÊN B" value={f.partyB} editable={editable} onChange={(v) => set("partyB", v)} accent={yc.c} placeholder="Nhập bên B (nếu có)" />
        <CoverField label="LOẠI HỒ SƠ" value={f.types} editable={editable} onChange={(v) => set("types", v)} accent={yc.c} />
        <CoverField label="NGÀY CÔNG CHỨNG" value={f.date} mono editable={editable} onChange={(v) => set("date", v)} accent={yc.c} />
      </div>

      {/* Mã vạch */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, padding: "14px 24px 20px" }}>
        <Barcode text={row.ccNumber} />
        <div style={{ flex: 1 }} />
        <div style={{ textAlign: "right", fontSize: 10.5, color: "#a1a1aa", fontWeight: 600, letterSpacing: ".04em", paddingBottom: 2 }}>VPCC VIỆT AN · LƯU TRỮ</div>
      </div>
    </div>
  );
}

/* Modal xem trước + chọn màu + chỉnh sửa + in bìa */
function CoverModal({ row, onClose }) {
  const L = window.LucideReact;
  const { Button } = window.FSICheckinDesignSystem_019df8;
  const cc = parseCC(row.ccNumber);
  const [color, setColor] = useCv(yearColor(cc.year));
  const [f, setF] = useCv({
    customer: row.customer || "",
    partyB: row.partyB || "",
    types: (row.types || []).join(", "),
    date: fmtDate(row.completedAt || row.updatedAt || row.date),
  });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const defaultIdx = YEAR_DEFAULT[cc.year] != null ? YEAR_DEFAULT[cc.year] : 6;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(28,28,26,.5)" }} />
      <div style={{ position: "relative", width: 880, maxWidth: "100%", maxHeight: "94%", background: "var(--bg-surface)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column", overflow: "hidden" }} className="va-cover-shell">
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: "1px solid var(--border-default)", flexShrink: 0 }} className="va-cover-head">
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-muted)", display: "grid", placeItems: "center" }}><L.BookCopy size={17} color="var(--accent)" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600 }}>Bìa lưu trữ hồ sơ</div>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Chọn màu &amp; chỉnh sửa các trường · số công chứng khóa cố định</div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 30, height: 30, border: "none", background: "transparent", borderRadius: 7, cursor: "pointer", display: "grid", placeItems: "center", color: "var(--text-tertiary)" }}><L.X size={18} /></button>
        </div>

        <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }} className="va-cover-body">
          {/* Panel điều khiển */}
          <div style={{ width: 300, flexShrink: 0, borderRight: "1px solid var(--border-default)", padding: 18, overflowY: "auto", display: "flex", flexDirection: "column", gap: 18 }} className="va-cover-controls">
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-tertiary)", marginBottom: 10 }}>Màu bìa (in màu phân biệt năm)</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {COVER_COLORS.map((c, i) => {
                  const on = c.c === color.c;
                  return (
                    <button key={c.c} type="button" title={c.name} onClick={() => setColor(c)} style={{
                      position: "relative", aspectRatio: "1/1", borderRadius: "var(--radius-md)", cursor: "pointer",
                      background: c.c, border: on ? "2px solid var(--text-primary)" : "2px solid transparent",
                      boxShadow: on ? "0 0 0 2px var(--bg-surface) inset" : "none", outline: on ? "1px solid var(--border-default)" : "none",
                    }}>
                      {on && <L.Check size={15} color="#fff" style={{ position: "absolute", inset: 0, margin: "auto" }} />}
                      {i === defaultIdx && <span style={{ position: "absolute", top: -6, right: -6, width: 14, height: 14, borderRadius: "50%", background: "var(--bg-surface)", border: "1px solid var(--border-default)", display: "grid", placeItems: "center" }}><L.Star size={8} color="var(--text-warning)" fill="var(--text-warning)" /></span>}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--text-tertiary)", marginTop: 10 }}>
                <L.Star size={11} color="var(--text-warning)" fill="var(--text-warning)" /> Màu gợi ý cho năm {cc.year}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", borderRadius: "var(--radius-md)", background: "var(--bg-info)", border: "1px solid var(--border-info)" }}>
              <L.Pencil size={14} color="var(--text-info)" style={{ marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.45 }}>Nhấp trực tiếp vào <b>Bên A · Bên B · Loại hồ sơ · Ngày công chứng</b> trên bìa để chỉnh sửa. Số công chứng không sửa được.</span>
            </div>
          </div>

          {/* Xem trước bìa */}
          <div style={{ flex: 1, minWidth: 0, overflowY: "auto", padding: 24, background: "var(--bg-overlay)", display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
            <ArchiveCover row={row} idForPrint="va-print-cover" color={color} editable fields={f} onField={set} />
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border-default)", padding: "14px 18px", display: "flex", justifyContent: "flex-end", gap: 10, flexShrink: 0 }} className="va-cover-foot">
          <Button variant="secondary" icon={L.X} onClick={onClose}>Đóng</Button>
          <Button variant="primary" icon={L.Printer} onClick={() => window.print()}>In bìa lưu trữ (màu)</Button>
        </div>
      </div>
    </div>
  );
}

window.ARCCover = { ArchiveCover, CoverModal, parseCC, yearColor, autoName, fmtDate };
