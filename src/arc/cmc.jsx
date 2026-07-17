/* global React, window */
/* PH03 — Liên thông CMC: giám sát tình trạng đẩy CMC (đã tự đẩy kèm file ngay khi
   hoàn tất bước Số hóa — xem src/arc/pipeline.jsx). Màn này KHÔNG phải nơi đẩy thủ công
   lần đầu — chỉ dùng để theo dõi & thử lại khi lần đẩy tự động bị lỗi (mạng, CMC quá tải…).
   Export: window.ARCCmc = { CMCScreen } */
const { useState: useCmc } = React;

function ccFull(soCC) { return "0036-" + String(soCC).padStart(6, "0") + "-2026"; }

const CMC_STATUS = {
  queued:  { label: "Chờ đẩy",       tone: "info",    icon: "Clock" },
  pushing: { label: "Đang đẩy…",     tone: "info",    icon: "Loader" },
  synced:  { label: "Đã đẩy CMC",    tone: "success", icon: "CheckCircle2" },
  error:   { label: "Lỗi đẩy",       tone: "danger",  icon: "AlertCircle" },
  overdue: { label: "Quá hạn nộp",   tone: "warning", icon: "AlertTriangle" },
};

function CMCScreen() {
  const L = window.LucideReact;
  const { Button, StatCard, Toast, Badge } = window.FSICheckinDesignSystem_019df8;
  const D = window.ARC_DATA;
  const [rows, setRows] = useCmc(() => D.cmc.queue.map((r) => ({ ...r, file: ccFull(r.soCC) + "-VB.pdf" })));
  const [toast, setToast] = useCmc(null);
  const [busy, setBusy] = useCmc(false);

  const pendingIds = rows.filter((r) => ["queued", "error", "overdue"].includes(r.status)).map((r) => r.id);

  const push = (ids, msg) => {
    setBusy(true);
    setRows((rs) => rs.map((r) => ids.includes(r.id) ? { ...r, status: "pushing" } : r));
    setTimeout(() => {
      setRows((rs) => rs.map((r) => ids.includes(r.id) ? { ...r, status: "synced", daysLeft: Math.max(r.daysLeft, 0) } : r));
      setBusy(false);
      setToast({ tone: "success", title: "Đã đẩy lên CMC", message: msg });
      setTimeout(() => setToast(null), 3600);
    }, 1200);
  };

  const counts = {
    synced: rows.filter((r) => r.status === "synced").length,
    queued: rows.filter((r) => r.status === "queued").length,
    error: rows.filter((r) => r.status === "error").length,
    overdue: rows.filter((r) => r.status === "overdue").length,
  };

  const th = { padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-tertiary)", whiteSpace: "nowrap" };
  const td = { padding: "12px 14px", fontSize: 13, color: "var(--text-secondary)", verticalAlign: "middle" };

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: 20 }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Liên thông CMC</h1>
          <p style={{ fontSize: 13.5, color: "var(--text-tertiary)", margin: "2px 0 0" }}>Theo dõi tình trạng đẩy tự động (kèm file <b style={{ fontFamily: "var(--font-mono)" }}>VB</b>) lên CMC DocEye Archive ngay sau khi số hóa · thử lại nếu lỗi · theo dõi hạn nộp lưu</p>
        </div>

        {/* Trạng thái kết nối */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--bg-success)", border: "1px solid var(--border-success)", borderRadius: "var(--radius-lg)" }}>
          <span style={{ width: 36, height: 36, borderRadius: 9, background: "var(--bg-surface)", border: "1px solid var(--border-success)", display: "grid", placeItems: "center", flexShrink: 0 }}><L.Cloud size={18} color="var(--text-success)" /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-success)" }}>Đã kết nối {D.cmc.system}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Đồng bộ gần nhất {D.cmc.lastSync} · giao thức nộp lưu điện tử</div>
          </div>
          <Button variant="primary" size="sm" icon={busy ? L.Loader : L.RefreshCw} disabled={busy || pendingIds.length === 0}
            onClick={() => push(pendingIds, pendingIds.length + " file VB đã đẩy lên CMC.")}>
            {busy ? "Đang đẩy…" : "Thử lại tất cả (" + pendingIds.length + ")"}
          </Button>
        </div>

        {/* Số liệu */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
          <StatCard label="Đã đẩy CMC" value={String(counts.synced)} icon={L.CheckCircle2} />
          <StatCard label="Đang xử lý / chờ thử lại" value={String(counts.queued)} icon={L.Clock} />
          <StatCard label="Lỗi đẩy" value={String(counts.error)} icon={L.AlertCircle} danger={counts.error > 0} />
          <StatCard label="Quá hạn nộp lưu" value={String(counts.overdue)} icon={L.AlertTriangle} danger={counts.overdue > 0} />
        </div>

        {/* Bảng theo dõi */}
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Theo dõi đẩy CMC</h2>
            <span style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>· {rows.length} file · tự đẩy kèm dữ liệu ngay sau bước Số hóa</span>
          </div>
          <div style={{ border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "var(--bg-surface)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border-subtle)" }}>
                {["Số CC", "Khách hàng", "File VB", "Dung lượng", "Hạn nộp lưu", "Trạng thái", ""].map((h, i) => <th key={i} style={th}>{h}</th>)}
              </tr></thead>
              <tbody>
                {rows.map((r, ri) => {
                  const m = CMC_STATUS[r.status];
                  const Icon = L[m.icon];
                  const late = r.status === "overdue" || (r.status === "error" && r.daysLeft < 0);
                  const canPush = ["queued", "error", "overdue"].includes(r.status);
                  return (
                    <tr key={r.id} style={{ borderBottom: ri < rows.length - 1 ? "1px solid var(--border-subtle)" : "none", borderLeft: late ? "3px solid var(--color-warning)" : "3px solid transparent", background: late ? "var(--bg-warning)" : "transparent" }}>
                      <td style={{ ...td, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent-hover)" }}>{ccFull(r.soCC)}</td>
                      <td style={td}><span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{r.khach}</span></td>
                      <td style={{ ...td, fontFamily: "var(--font-mono)", fontSize: 11.5 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><L.FileText size={13} color="var(--text-tertiary)" /> {r.file}</span>
                      </td>
                      <td style={{ ...td, fontFamily: "var(--font-mono)", fontSize: 12.5 }}>{r.size}</td>
                      <td style={td}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12.5 }}>{r.deadline}</span>
                          {r.status !== "synced" && (
                            <span style={{ fontSize: 10.5, fontWeight: 700, color: r.daysLeft < 0 ? "var(--text-danger)" : r.daysLeft <= 1 ? "var(--text-warning)" : "var(--text-tertiary)" }}>
                              {r.daysLeft < 0 ? "Trễ " + Math.abs(r.daysLeft) + " ngày" : r.daysLeft === 0 ? "Hạn hôm nay" : "Còn " + r.daysLeft + " ngày"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={td}>
                        <Badge tone={m.tone} dot={r.status !== "pushing"}>
                          {r.status === "pushing"
                            ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><L.Loader size={11} style={{ animation: "vaSpin 1s linear infinite" }} /> {m.label}</span>
                            : m.label}
                        </Badge>
                      </td>
                      <td style={{ ...td, textAlign: "right", whiteSpace: "nowrap" }}>
                        {r.status === "synced"
                          ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--text-tertiary)" }}><L.Check size={13} /> Hoàn tất</span>
                          : <Button variant={r.status === "error" ? "secondary" : "primary"} size="sm" icon={L.RefreshCw} disabled={busy || !canPush}
                              onClick={() => push([r.id], ccFull(r.soCC) + "-VB.pdf đã đẩy lên CMC.")}>
                              Thử lại
                            </Button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {toast && (
        <div style={{ position: "fixed", right: 24, bottom: 24, zIndex: 80, animation: "vaPop .18s var(--ease-standard)" }}>
          <Toast tone={toast.tone} title={toast.title} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
}

window.ARCCmc = { CMCScreen };
