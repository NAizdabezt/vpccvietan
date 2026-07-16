/* global React, window */
/* Quầy thu ngân — Dịch vụ nhanh (khách vãng lai) + Biên lai đã thu trong ca.
   Việc cấp số & thu phí cho PHIÊN hồ sơ nay thực hiện trực tiếp tại Luồng tổng quan. */
const { useState: useStateQ } = React;

/* Bảng biên lai đã thu trong ca */
function ReceiptsTable({ rows }) {
  const L = window.LucideReact;
  const { fmtVND } = window.POSFmt;
  const th = { padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-tertiary)", whiteSpace: "nowrap" };
  const td = { padding: "11px 14px", fontSize: 13, color: "var(--text-secondary)", whiteSpace: "nowrap", verticalAlign: "middle" };
  return (
    <div style={{ border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "var(--bg-surface)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border-subtle)" }}>
          {["Số CC", "Khách hàng", "Dịch vụ", "Hình thức", "Số tiền", ""].map((c, i) => <th key={i} style={{ ...th, textAlign: i === 4 ? "right" : "left" }}>{c}</th>)}
        </tr></thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={r.id} style={{ borderBottom: ri < rows.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
              <td style={{ ...td, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-primary)" }}>{r.no}</td>
              <td style={{ ...td, color: "var(--text-primary)", fontWeight: 500 }}>{r.khach}</td>
              <td style={td}>{r.service}</td>
              <td style={td}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-secondary)" }}>
                  {r.pay === "cash" ? <L.Banknote size={13} /> : <L.ArrowLeftRight size={13} />}
                  {r.pay === "cash" ? "Tiền mặt" : "Chuyển khoản"}
                </span>
              </td>
              <td style={{ ...td, textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--text-success)" }}>{fmtVND(r.amount)}</td>
              <td style={{ ...td, textAlign: "right" }}><L.Printer size={14} color="var(--text-tertiary)" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PosScreen({ receiptStyle, onGoOverview }) {
  const L = window.LucideReact;
  const D = window.POS_DATA;
  const VS = window.VASessions;
  const { StatStrip } = window.POSShell;
  const { fmtVND } = window.POSFmt;
  const { Button } = window.FSICheckinDesignSystem_019df8;
  const { FastTrackModal } = window;
  const [fastOpen, setFastOpen] = useStateQ(false);

  // Biên lai đã thu trong ca — trước đây đọc từ POS_DATA.receipts tĩnh, giờ suy
  // từ hồ sơ thật đã cấp số hôm nay (window.VAStore, cùng nguồn Luồng tổng quan).
  const rows = window.VAStore.useHoSoStore();
  const receipts = VS.receiptRowsToday(rows);
  const waitingCount = rows.filter((r) => r.status === "waitNumberPay").length;
  const totalReceipts = receipts.reduce((a, r) => a + r.amount, 0);

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 1180, margin: "0 auto" }}>
        <StatStrip />

        {/* Điều hướng: cấp số & thu phí cho phiên nằm ở Luồng tổng quan */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", background: "var(--accent-muted)", border: "1px solid var(--accent-border)", borderRadius: "var(--radius-lg)" }}>
          <L.Info size={18} color="var(--accent)" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
            Cấp số công chứng &amp; thu phí cho <b>phiên hồ sơ</b> được thực hiện trực tiếp tại <b>Luồng tổng quan</b> — trên các phiên ở trạng thái “Chờ cấp số &amp; thu phí”.
            {waitingCount > 0 && <> Hiện có <b style={{ color: "var(--accent-hover)" }}>{waitingCount} phiên</b> đang chờ thu.</>}
          </div>
          {onGoOverview && <Button variant="secondary" size="sm" icon={L.ArrowRight} onClick={onGoOverview}>Mở Luồng tổng quan</Button>}
        </div>

        {/* Dịch vụ nhanh — khách vãng lai, không qua phiên */}
        <section style={{ border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", background: "var(--bg-surface)", padding: 16, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, display: "grid", placeItems: "center", background: "color-mix(in srgb, #d97706 14%, transparent)" }}>
            <L.Zap size={22} color="#d97706" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600 }}>Dịch vụ nhanh — Sao y &amp; Chứng thực</div>
            <div style={{ fontSize: 12.5, color: "var(--text-tertiary)", marginTop: 2 }}>Thu phí khách vãng lai không qua phiên hồ sơ · sao y {fmtVND(D.saoYPrice)}/bản, chứng thực chữ ký</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            <Button variant="secondary" icon={L.FileSpreadsheet}>Xuất sổ Fast-track</Button>
            <Button variant="primary" icon={L.Zap} onClick={() => setFastOpen(true)}>Mở dịch vụ nhanh</Button>
          </div>
        </section>

        {/* Biên lai đã thu trong ca */}
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Biên lai đã thu trong ca</h2>
            <span style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>· {receipts.length} biên lai · {fmtVND(totalReceipts)}</span>
          </div>
          {receipts.length === 0 ? (
            <div style={{ display: "grid", placeItems: "center", textAlign: "center", padding: "32px 12px", color: "var(--text-tertiary)", background: "var(--bg-surface)", border: "1px dashed var(--border-default)", borderRadius: "var(--radius-lg)", fontSize: 13 }}>
              Chưa có biên lai nào được thu trong ca hôm nay.
            </div>
          ) : <ReceiptsTable rows={receipts} />}
        </div>
      </div>

      {fastOpen && <FastTrackModal onClose={() => setFastOpen(false)} />}
    </div>
  );
}

window.PosScreen = PosScreen;
