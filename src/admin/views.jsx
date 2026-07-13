/* global React, window */
/* PH04 — Các màn của Dashboard điều hành */
const { useState: useAdm } = React;

function fmtVnd(v) {
  if (v >= 1e9) return (v / 1e9).toLocaleString("vi-VN", { maximumFractionDigits: 2 }) + " tỷ";
  if (v >= 1e6) return Math.round(v / 1e6).toLocaleString("vi-VN") + " tr";
  return v.toLocaleString("vi-VN");
}

function Card({ title, desc, right, children, span }) {
  return (
    <section style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", gridColumn: span ? `span ${span}` : "auto", minWidth: 0 }}>
      {title && (
        <header style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{title}</h3>
            {desc && <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-tertiary)" }}>{desc}</p>}
          </div>
          {right}
        </header>
      )}
      <div style={{ padding: 16, flex: 1, minWidth: 0 }}>{children}</div>
    </section>
  );
}

function Delta({ v }) {
  const L = window.LucideReact;
  const up = v >= 0;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: 12, fontWeight: 600, color: up ? "var(--text-success)" : "var(--text-danger)" }}>
      {up ? <L.TrendingUp size={13} /> : <L.TrendingDown size={13} />}{up ? "+" : ""}{v}%
    </span>
  );
}

function KpiCard({ icon, label, value, sub, delta }) {
  const L = window.LucideReact;
  const Icon = L[icon];
  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 32, height: 32, borderRadius: 9, background: "var(--accent-muted)", display: "grid", placeItems: "center" }}><Icon size={17} color="var(--accent)" /></span>
        <span style={{ fontSize: 12.5, color: "var(--text-tertiary)", fontWeight: 500 }}>{label}</span>
        {delta !== undefined && <span style={{ marginLeft: "auto" }}><Delta v={delta} /></span>}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 26, fontWeight: 700, fontFamily: "var(--font-mono)", lineHeight: 1 }}>{value}</span>
        {sub && <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{sub}</span>}
      </div>
    </div>
  );
}

function typeLegend() {
  const D = window.ADMIN_DATA, PAL = window.ADMIN_PAL;
  return D.types.map((t, i) => ({ label: t, color: PAL[i] }));
}

/* ---------- Tổng quan ---------- */
function OverviewView({ range }) {
  const D = window.ADMIN_DATA, PAL = window.ADMIN_PAL;
  const C = window.AdminCharts;
  const k = D.kpis[range];
  const mixSeg = D.serviceMix.map((s, i) => ({ ...s, color: PAL[i % PAL.length] }));
  const topTknv = [...D.tknv].slice(0, 5).map((t, i) => ({ label: t.name, value: t.total, color: PAL[0] }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        <KpiCard icon="FileCheck2" label="Hồ sơ xử lý" value={k.hoso.toLocaleString("vi-VN")} delta={k.dHoso} />
        <KpiCard icon="Wallet" label="Doanh thu" value={fmtVnd(k.revenue)} delta={k.dRev} />
        <KpiCard icon="UserCheck" label="CCV hoạt động" value={k.ccv} sub={"· " + k.tknv + " TKNV"} />
        <KpiCard icon="Timer" label="TG xử lý TB" value={k.avgMin} sub="phút/hồ sơ" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
        <Card title="Doanh thu theo thời gian" desc="Triệu đồng · cập nhật real-time">
          <C.LineArea points={D.revenueSeries[range]} color={PAL[0]} unit="triệu đ" />
        </Card>
        <Card title="Cơ cấu dịch vụ" desc="Tỷ trọng loại hồ sơ">
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <C.Donut segments={mixSeg} centerTop="Loại nhiều nhất" centerBig="42%" />
            <C.Legend items={mixSeg.map((s) => ({ label: s.label, color: s.color, value: s.value, suffix: "%" }))} />
          </div>
        </Card>
      </div>
      <Card title="Top Thư ký nghiệp vụ" desc="Số hồ sơ soạn thảo thành công">
        <C.HBars items={topTknv} />
      </Card>
    </div>
  );
}

/* ---------- Năng suất nhân sự ---------- */
function ProductivityView({ person }) {
  const D = window.ADMIN_DATA, PAL = window.ADMIN_PAL;
  const C = window.AdminCharts;
  const leg = typeLegend();
  const filt = (arr) => person && person !== "Tất cả nhân sự" ? arr.filter((x) => x.name === person) : arr;
  const tknv = filt(D.tknv), ccv = filt(D.ccv);
  const segOf = (by) => by.map((v, i) => ({ value: v, color: PAL[i] }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "10px 14px", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-tertiary)" }}>Phân rã theo loại:</span>
        {leg.map((l) => <span key={l.label} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}><span style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />{l.label}</span>)}
      </div>
      <Card title="Năng suất Thư ký nghiệp vụ" desc="Số hồ sơ soạn thảo thành công · phân rã theo loại hồ sơ">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {tknv.map((t) => (
            <div key={t.name} style={{ display: "grid", gridTemplateColumns: "170px 1fr 56px", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</div>
              <C.StackBar segs={segOf(t.by)} height={10} />
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono)", textAlign: "right" }}>{t.total}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Năng suất Công chứng viên" desc="Hồ sơ đã duyệt · ký sống / ký số · phân rã theo loại">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}>
            <thead><tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              {["Công chứng viên", "Đã duyệt", "Ký sống", "Ký số", "Phân rã theo loại"].map((h, i) => (
                <th key={i} style={{ padding: "8px 12px", textAlign: i === 0 || i === 4 ? "left" : "right", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {ccv.map((c, ci) => (
                <tr key={c.name} style={{ borderBottom: ci < ccv.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                  <td style={{ padding: "11px 12px", fontSize: 13, fontWeight: 500 }}>{c.name}</td>
                  <td style={{ padding: "11px 12px", fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 700, textAlign: "right" }}>{c.approved}</td>
                  <td style={{ padding: "11px 12px", fontSize: 13, fontFamily: "var(--font-mono)", textAlign: "right", color: "var(--text-secondary)" }}>{c.kySong}</td>
                  <td style={{ padding: "11px 12px", fontSize: 13, fontFamily: "var(--font-mono)", textAlign: "right", color: "var(--text-secondary)" }}>{c.kySo}</td>
                  <td style={{ padding: "11px 12px", minWidth: 180 }}><C.StackBar segs={segOf(c.by)} height={9} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ---------- Tài chính & Doanh thu ---------- */
function FinanceView({ range }) {
  const D = window.ADMIN_DATA, PAL = window.ADMIN_PAL;
  const C = window.AdminCharts;
  const k = D.kpis[range];
  const payColors = ["#2563eb", "#16a34a", "#d97706"];
  const paySeg = D.payments.map((p, i) => ({ ...p, color: payColors[i] }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        <KpiCard icon="Wallet" label="Doanh thu" value={fmtVnd(k.revenue)} delta={k.dRev} />
        <KpiCard icon="Banknote" label="Đã thực thu" value={fmtVnd(Math.round(k.revenue * 0.92))} sub="92%" />
        <KpiCard icon="Clock" label="Công nợ" value={fmtVnd(Math.round(k.revenue * 0.08))} sub="8%" />
      </div>
      <Card title="Biểu đồ doanh thu" desc="Triệu đồng · theo thời gian thực">
        <C.LineArea points={D.revenueSeries[range]} color={PAL[1]} unit="triệu đ" height={220} />
      </Card>
      <Card title="Cơ cấu dòng tiền" desc="Tỷ trọng theo hình thức thanh toán">
        <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
          <C.Donut segments={paySeg} centerTop="Chủ đạo" centerBig="58%" />
          <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 12 }}>
            <C.Legend items={paySeg.map((p) => ({ label: p.label, color: p.color, value: p.value, suffix: "%" }))} />
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "var(--text-tertiary)", paddingTop: 8, borderTop: "1px dashed var(--border-default)" }}>
              <window.LucideReact.Info size={14} style={{ marginTop: 1, flexShrink: 0 }} /> Theo dõi sức khoẻ tài chính song song với năng suất nhân sự (mục 6.2).
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ---------- Phân quyền & Nhật ký ---------- */
function GovernanceView() {
  const D = window.ADMIN_DATA;
  const L = window.LucideReact;
  const { Badge } = window.FSICheckinDesignSystem_019df8;
  const stTone = { active: "success", delegated: "info", standard: "neutral" };
  const stLabel = { active: "Token CMC", delegated: "Uỷ thác", standard: "Tiêu chuẩn" };
  const resTone = { synced: "success", pending: "warning", rejected: "danger" };
  const resLabel = { synced: "Đã đồng bộ CMC", pending: "Chờ duyệt", rejected: "Từ chối" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card title="Phân quyền uỷ thác (Delegation Role)" desc="Tách bạch quyền thao tác · không dùng chung tài khoản định danh">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {D.delegation.map((r) => (
            <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", flexWrap: "wrap" }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--accent-muted)", display: "grid", placeItems: "center", flexShrink: 0 }}><L.KeyRound size={15} color="var(--accent)" /></div>
              <div style={{ minWidth: 150, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>{r.role} · {r.scope}</div>
              </div>
              <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{r.token}</span>
              <Badge tone={stTone[r.status]} dot>{stLabel[r.status]}</Badge>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Nhật ký truy vết (Audit Trail)" desc="Mọi thao tác sửa/xoá được log đích danh, đồng bộ CMC qua Token CCV uỷ quyền">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
            <thead><tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              {["Thời gian", "Người thực hiện", "Thao tác", "Đối tượng", "Đồng bộ qua", "Kết quả"].map((h, i) => (
                <th key={i} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {D.audit.map((a, ai) => (
                <tr key={ai} style={{ borderBottom: ai < D.audit.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                  <td style={{ padding: "11px 12px", fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>{a.time}</td>
                  <td style={{ padding: "11px 12px", fontSize: 13, fontWeight: 500 }}>{a.actor}</td>
                  <td style={{ padding: "11px 12px", fontSize: 13, color: "var(--text-secondary)" }}>{a.action}</td>
                  <td style={{ padding: "11px 12px", fontSize: 12.5, fontFamily: "var(--font-mono)", color: "var(--accent-hover)" }}>{a.target}</td>
                  <td style={{ padding: "11px 12px", fontSize: 12, color: "var(--text-tertiary)" }}>{a.via}</td>
                  <td style={{ padding: "11px 12px" }}><Badge tone={resTone[a.result]} dot>{resLabel[a.result]}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ---------- Xuất báo cáo ---------- */
function ReportsView({ onExport }) {
  const L = window.LucideReact;
  const { Button } = window.FSICheckinDesignSystem_019df8;
  const reports = [
    { icon: "Users", title: "Báo cáo năng suất nhân sự", desc: "TKNV & CCV theo loại hồ sơ" },
    { icon: "PieChart", title: "Báo cáo cơ cấu dịch vụ", desc: "Tỷ trọng loại hồ sơ, xu hướng" },
    { icon: "Wallet", title: "Báo cáo tài chính & dòng tiền", desc: "Doanh thu, hình thức thanh toán" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "var(--bg-info)", border: "1px solid var(--border-info)", borderRadius: "var(--radius-lg)" }}>
        <L.CalendarClock size={17} color="var(--text-info)" />
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Báo cáo định kỳ tự động gửi email vào <b>08:00 thứ Hai hàng tuần</b> và <b>ngày 1 hàng tháng</b>. Bên dưới để kết xuất đột xuất.</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 14 }}>
        {reports.map((r) => {
          const Icon = L[r.icon];
          return (
            <div key={r.title} style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 36, height: 36, borderRadius: 9, background: "var(--accent-muted)", display: "grid", placeItems: "center" }}><Icon size={18} color="var(--accent)" /></span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{r.title}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>{r.desc}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="secondary" size="sm" icon={L.FileSpreadsheet} fullWidth onClick={() => onExport(r.title, "Excel")}>Excel</Button>
                <Button variant="secondary" size="sm" icon={L.FileText} fullWidth onClick={() => onExport(r.title, "PDF")}>PDF</Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.AdminViews = { OverviewView, ProductivityView, FinanceView, GovernanceView, ReportsView };
