/* global React, window */
/* Kế toán — Đối soát doanh thu & Hóa đơn điện tử */
const { useState: useStateA, useEffect: useEffectA } = React;

function MiniStat({ label, value, tone }) {
  const c = tone === "cash" ? "var(--text-success)" : tone === "transfer" ? "var(--text-info)" : "var(--text-primary)";
  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", padding: "12px 16px" }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 600, color: "var(--text-tertiary)" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)", color: c, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function ReconScreen() {
  const L = window.LucideReact;
  const VS = window.VASessions;
  const { fmtVND } = window.POSFmt;
  const { Table, Badge, Button } = window.FSICheckinDesignSystem_019df8;
  // Bảng kê biên lai — trước đây đọc từ POS_DATA.receipts tĩnh, giờ suy từ hồ
  // sơ thật đã cấp số hôm nay (cùng nguồn với StatStrip/Quầy thu ngân).
  const sessionRows = window.VAStore.useHoSoStore();
  const receipts = VS.receiptRowsToday(sessionRows);
  const cash = receipts.filter((r) => r.pay === "cash").reduce((s, r) => s + r.amount, 0);
  const transfer = receipts.filter((r) => r.pay === "transfer").reduce((s, r) => s + r.amount, 0);
  const todayDMY = VS.VA_TODAY.split("-").reverse().join("/");

  const columns = [
    { key: "no", label: "Số CC", mono: true, width: 90 },
    { key: "khach", label: "Khách hàng", render: (v) => <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{v}</span> },
    { key: "service", label: "Dịch vụ" },
    { key: "pay", label: "Hình thức", width: 140, render: (v) => v === "cash" ? <Badge tone="neutral">Tiền mặt</Badge> : <Badge tone="info">Chuyển khoản</Badge> },
    { key: "amount", label: "Số tiền", align: "right", mono: true, width: 140, render: (v) => <span style={{ color: "var(--text-primary)" }}>{fmtVND(v)}</span> },
  ];

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: 24 }}>
      <div style={{ maxWidth: "var(--content-max)", margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Đối soát doanh thu</h1>
            <p style={{ fontSize: 14, color: "var(--text-tertiary)", margin: "2px 0 0" }}>Bảng kê biên lai · {todayDMY}</p>
          </div>
          <Button variant="secondary" icon={L.Download}>Xuất Excel</Button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
          <MiniStat label="Tổng thu" value={fmtVND(cash + transfer)} />
          <MiniStat label="Tiền mặt" value={fmtVND(cash)} tone="cash" />
          <MiniStat label="Chuyển khoản" value={fmtVND(transfer)} tone="transfer" />
          <MiniStat label="Số biên lai" value={String(receipts.length)} />
        </div>

        {receipts.length === 0 ? (
          <div style={{ display: "grid", placeItems: "center", textAlign: "center", padding: "32px 12px", color: "var(--text-tertiary)", background: "var(--bg-surface)", border: "1px dashed var(--border-default)", borderRadius: "var(--radius-lg)", fontSize: 13 }}>
            Chưa có biên lai nào trong hôm nay.
          </div>
        ) : <Table columns={columns} rows={receipts} />}

        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text-tertiary)" }}>
          <L.Info size={14} /> Kết xuất Excel đã dàn trang theo biểu mẫu quy chuẩn của Sở Tư pháp — chỉ cần chọn bộ lọc thời gian và in.
        </div>
      </div>
    </div>
  );
}

/* Card gộp hóa đơn — chọn giao dịch để gộp thành 1 hóa đơn.
   g.items là các HỒ SƠ thật (đã hoàn thành, chưa xuất hóa đơn) cùng tên khách
   hàng — trước đây "no" là số biên lai giả, giờ dùng thẳng hoSoId thật để gọi
   API gộp xuất hóa đơn (POST /api/hoa-don đã hỗ trợ mảng hoSoIds sẵn). */
function MergeGroupCard({ g, onMerge }) {
  const L = window.LucideReact;
  const { fmtVND } = window.POSFmt;
  const { Button } = window.FSICheckinDesignSystem_019df8;
  const [sel, setSel] = useStateA(() => g.items.map((it) => it.hoSoId));
  const [merged, setMerged] = useStateA(false);
  const [busy, setBusy] = useStateA(false);
  const toggle = (id) => setSel((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const chosen = g.items.filter((it) => sel.includes(it.hoSoId));
  const sub = chosen.reduce((s, it) => s + it.amount, 0);

  const doMerge = async () => {
    setBusy(true);
    const ok = await onMerge(chosen.map((it) => it.hoSoId));
    setBusy(false);
    if (ok) setMerged(true);
  };

  return (
    <div style={{ border: "1px solid var(--border-default)", background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
      {/* Header khách hàng */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", background: "var(--bg-elevated)", borderBottom: "1px solid var(--border-subtle)" }}>
        <span style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, display: "grid", placeItems: "center", background: "var(--accent-muted)" }}><L.Building2 size={18} color="var(--accent)" /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{g.name}</div>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: "var(--accent-hover)", background: "var(--accent-muted)", border: "1px solid var(--accent-border)", borderRadius: "var(--radius-full)", padding: "3px 10px" }}>
          <L.Combine size={12} /> {g.items.length} giao dịch có thể gộp
        </span>
      </div>

      {/* Danh sách giao dịch — chọn để gộp */}
      <div>
        {g.items.map((it, i) => {
          const on = sel.includes(it.hoSoId);
          return (
            <label key={it.hoSoId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderTop: i ? "1px solid var(--border-subtle)" : "none", cursor: merged ? "default" : "pointer", background: on ? "transparent" : "var(--bg-overlay)" }}>
              <input type="checkbox" checked={on} disabled={merged || busy} onChange={() => toggle(it.hoSoId)} style={{ width: 16, height: 16, accentColor: "var(--accent)", cursor: merged ? "default" : "pointer" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-tertiary)", width: 110 }}>{it.maPhien}</span>
              <span style={{ flex: 1, fontSize: 13, color: on ? "var(--text-primary)" : "var(--text-tertiary)" }}>{it.service}</span>
              <span style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>{it.txnDate}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500, color: on ? "var(--text-primary)" : "var(--text-tertiary)", width: 96, textAlign: "right" }}>{fmtVND(it.amount)}</span>
            </label>
          );
        })}
      </div>

      {/* Footer gộp */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderTop: "1px solid var(--border-default)", background: "var(--bg-elevated)" }}>
        {merged ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "var(--text-success)" }}>
            <L.CheckCircle2 size={16} /> Đã gộp {chosen.length} giao dịch thành 1 hóa đơn · {fmtVND(sub)}
          </span>
        ) : (
          <>
            <span style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>Đã chọn <b style={{ color: "var(--text-primary)" }}>{chosen.length}</b>/{g.items.length} · gộp thành 1 hóa đơn</span>
            <span style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--text-tertiary)" }}>Tổng hóa đơn gộp</span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 17 }}>{fmtVND(sub)}</span>
            <Button variant="primary" size="sm" icon={busy ? L.Loader : L.Combine} disabled={chosen.length < 2 || busy} onClick={doMerge}>{busy ? "Đang xuất…" : "Gộp & xuất 1 hóa đơn"}</Button>
          </>
        )}
      </div>
    </div>
  );
}

// ISO datetime (từ server) → "DD/MM/YYYY", đúng định dạng POSFmt.parseVNDate cần.
function fmtVNDateISO(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function InvoiceScreen() {
  const L = window.LucideReact;
  const { fmtVND, daysLate, isOverdue } = window.POSFmt;
  const { Button } = window.FSICheckinDesignSystem_019df8;
  const [filter, setFilter] = useStateA("all");
  const [invoices, setInvoices] = useStateA([]);
  const [busyId, setBusyId] = useStateA(null);

  // Trước đây toàn bộ màn này đọc từ POS_DATA.invoices/groups/easyInvoice tĩnh
  // (kể cả "pending"/"error" là bịa) — giờ "chờ xuất" suy từ hồ sơ THẬT đã
  // hoàn thành & chưa có hoaDonId, "đã đẩy" là HoaDon thật (GET /api/hoa-don).
  const sessionRows = window.VAStore.useHoSoStore();
  const doneUnbilled = sessionRows.filter((s) => s.status === "done" && !s.invoiced);

  const loadInvoices = () => window.VAApi.hoaDon.list().then(setInvoices).catch(() => {});
  useEffectA(() => { loadInvoices(); }, []);

  const pendingItems = doneUnbilled.map((s) => ({
    id: s.hoSoId, hoSoId: s.hoSoId, khach: s.customer || "Khách lẻ", mst: null, addr: null,
    txnDate: s.completedAt || s.date, service: s.types.join(", ") || "—", items: 1,
    amount: s.fee || 0, status: "pending",
  }));
  const issuedItems = invoices.map((inv) => ({
    id: inv.id, khach: inv.tenKhach, mst: inv.maSoThue, addr: inv.diaChi,
    txnDate: fmtVNDateISO(inv.ngayGiaoDich), issuedDate: fmtVNDateISO(inv.ngayXuat),
    service: (inv.hoSos || []).map((h) => h.maPhien).join(", ") || "—",
    items: (inv.hoSos || []).length, amount: Number(inv.tongTien || 0),
    status: inv.trangThai === "DA_PHAT_HANH" ? "issued" : inv.trangThai === "LOI" ? "error" : "pending",
  }));
  const allItems = [...pendingItems, ...issuedItems];

  const todayDMY = window.VASessions.VA_TODAY.split("-").reverse().join("/");
  const overdue = allItems.filter(isOverdue);
  const pending = allItems.filter((i) => i.status === "pending");
  const issuedToday = allItems.filter((i) => i.status === "issued" && i.issuedDate === todayDMY);
  const errored = allItems.filter((i) => i.status === "error");

  const matchF = (i) => filter === "all" ? true : filter === "overdue" ? isOverdue(i) : i.status === filter;
  const visible = allItems.filter(matchF);

  // Gộp hóa đơn — nhóm các hồ sơ chưa xuất theo cùng tên khách hàng thật (≥2
  // giao dịch); trước đây "Tên + Địa chỉ + MST" là dữ liệu bịa hoàn toàn.
  const groupMap = {};
  doneUnbilled.forEach((s) => {
    if (!s.customer) return;
    if (!groupMap[s.customer]) groupMap[s.customer] = [];
    groupMap[s.customer].push({ hoSoId: s.hoSoId, maPhien: s.id, service: s.types.join(", ") || "—", amount: s.fee || 0, txnDate: s.completedAt || s.date });
  });
  const groups = Object.keys(groupMap).filter((name) => groupMap[name].length >= 2).map((name) => ({ id: name, name, items: groupMap[name] }));

  const issueOne = async (s) => {
    setBusyId(s.hoSoId);
    try {
      await window.VAApi.hoaDon.create({ hoSoIds: [s.hoSoId] });
      window.VAStore.patchLocal(s.hoSoId, { invoiced: true });
      await loadInvoices();
    } catch (e) {}
    setBusyId(null);
  };
  const issueGroup = async (hoSoIds) => {
    try {
      await window.VAApi.hoaDon.create({ hoSoIds });
      hoSoIds.forEach((id) => window.VAStore.patchLocal(id, { invoiced: true }));
      await loadInvoices();
      return true;
    } catch (e) {
      return false;
    }
  };

  const Stat = ({ icon, label, value, c, active, onClick }) => {
    const Icon = L[icon]; const col = c || "var(--accent)";
    return (
      <button type="button" onClick={onClick} style={{
        textAlign: "left", display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", cursor: "pointer",
        background: "var(--bg-surface)", borderRadius: "var(--radius-lg)",
        border: "1px solid " + (active ? col : "var(--border-default)"),
        boxShadow: active ? `0 0 0 3px color-mix(in srgb, ${col} 16%, transparent)` : "none",
      }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, display: "grid", placeItems: "center", background: `color-mix(in srgb, ${col} 12%, transparent)` }}><Icon size={18} color={col} /></span>
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)" }}>{value}</div>
          <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>{label}</div>
        </div>
      </button>
    );
  };

  const statusBadge = (i) => {
    if (isOverdue(i)) return <span style={pillStyle("#dc2626")}><L.AlertTriangle size={12} /> Quá hạn {daysLate(i.txnDate)} ngày</span>;
    if (i.status === "issued") return <span style={pillStyle("#16a34a")}><L.CheckCircle2 size={12} /> Đã đẩy</span>;
    if (i.status === "error") return <span style={pillStyle("#dc2626")}><L.XCircle size={12} /> Lỗi đẩy</span>;
    return <span style={pillStyle("#d97706")}><L.Clock size={12} /> Chờ xuất</span>;
  };
  function pillStyle(c) {
    return { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap", color: c, background: `color-mix(in srgb, ${c} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${c} 26%, transparent)`, borderRadius: "var(--radius-full)", padding: "3px 9px" };
  }

  const th = { padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-tertiary)", whiteSpace: "nowrap" };
  const td = { padding: "11px 14px", fontSize: 13, color: "var(--text-secondary)", verticalAlign: "middle" };

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: 24 }}>
      <div style={{ maxWidth: "var(--content-max)", margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Hóa đơn điện tử</h1>
            <p style={{ fontSize: 14, color: "var(--text-tertiary)", margin: "2px 0 0" }}>Gộp hóa đơn · lùi ngày · ghi nhận nội bộ (chưa liên thông API điện tử thật)</p>
          </div>
          <Button variant="secondary" size="sm" icon={L.RefreshCw} onClick={loadInvoices}>Làm mới</Button>
        </div>

        {/* Cảnh báo hóa đơn quá hạn — chính sách hỗ trợ chậm 1 ngày */}
        {overdue.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 16px", background: "color-mix(in srgb, #dc2626 8%, transparent)", border: "1px solid color-mix(in srgb, #dc2626 28%, transparent)", borderRadius: "var(--radius-lg)" }}>
            <span style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, display: "grid", placeItems: "center", background: "color-mix(in srgb, #dc2626 14%, transparent)" }}><L.AlertTriangle size={18} color="#dc2626" /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#b91c1c" }}>{overdue.length} hóa đơn quá hạn xuất</div>
              <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 1 }}>Chính sách chỉ hỗ trợ chậm tối đa <b>1 ngày làm việc</b> so với ngày giao dịch. Cần xuất &amp; đẩy ngay để tránh sai lệch kỳ kế toán.</div>
            </div>
            <Button variant="primary" size="sm" icon={L.Filter} onClick={() => setFilter("overdue")}>Xem {overdue.length} hóa đơn</Button>
          </div>
        )}

        {/* Thống kê — bấm để lọc */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
          <Stat icon="Clock" label="Chờ xuất" value={pending.length} c="#d97706" active={filter === "pending"} onClick={() => setFilter(filter === "pending" ? "all" : "pending")} />
          <Stat icon="AlertTriangle" label="Quá hạn (chậm > 1 ngày)" value={overdue.length} c="#dc2626" active={filter === "overdue"} onClick={() => setFilter(filter === "overdue" ? "all" : "overdue")} />
          <Stat icon="CheckCircle2" label="Đã đẩy hôm nay" value={issuedToday.length} c="#16a34a" active={filter === "issued"} onClick={() => setFilter(filter === "issued" ? "all" : "issued")} />
          <Stat icon="XCircle" label="Lỗi đẩy" value={errored.length} c="#dc2626" active={filter === "error"} onClick={() => setFilter(filter === "error" ? "all" : "error")} />
        </div>

        {/* Gộp hóa đơn — cùng khách hàng nhiều giao dịch chưa xuất */}
        {groups.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <L.Combine size={16} color="var(--accent)" />
              <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Gộp hóa đơn</h2>
              <span style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>· tự gom giao dịch chưa xuất cùng tên khách hàng · {groups.length} nhóm</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {groups.map((g) => <MergeGroupCard key={g.id} g={g} onMerge={issueGroup} />)}
            </div>
          </div>
        )}

        {/* Danh sách hóa đơn */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Danh sách hóa đơn</h2>
            <span style={{ fontSize: 12.5, color: "var(--text-tertiary)", flex: 1 }}>· {visible.length} hóa đơn{filter !== "all" ? " (đang lọc)" : ""}</span>
            {filter !== "all" && <button type="button" onClick={() => setFilter("all")} style={{ border: "none", background: "transparent", color: "var(--accent)", cursor: "pointer", fontSize: 12.5, fontFamily: "var(--font-sans)", display: "inline-flex", alignItems: "center", gap: 4 }}><L.X size={13} /> Bỏ lọc</button>}
          </div>
          <div style={{ border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "var(--bg-surface)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border-subtle)" }}>
                {["Khách hàng", "Ngày giao dịch", "Dịch vụ", "Số tiền", "Trạng thái", ""].map((h, i) => <th key={i} style={{ ...th, textAlign: i === 3 ? "right" : "left" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {visible.map((inv, i) => {
                  const od = isOverdue(inv);
                  return (
                    <tr key={inv.id} style={{ borderBottom: i < visible.length - 1 ? "1px solid var(--border-subtle)" : "none", borderLeft: od ? "3px solid #dc2626" : "3px solid transparent", background: od ? "color-mix(in srgb, #dc2626 4%, transparent)" : "transparent" }}>
                      <td style={td}>
                        <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>{inv.khach}</div>
                        <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>{inv.mst ? "MST " + inv.mst : inv.addr}</div>
                      </td>
                      <td style={{ ...td, fontFamily: "var(--font-mono)", fontSize: 12.5, whiteSpace: "nowrap" }}>
                        {inv.txnDate}
                        {inv.status === "issued" && inv.issuedDate && inv.issuedDate !== inv.txnDate && <span style={{ display: "block", fontSize: 10.5, color: "var(--text-info)" }}>xuất lùi: {inv.issuedDate}</span>}
                      </td>
                      <td style={{ ...td, fontSize: 12.5 }}>{inv.service}{inv.items > 1 && <span style={{ marginLeft: 6, fontSize: 11, color: "var(--text-tertiary)" }}>({inv.items} GD)</span>}</td>
                      <td style={{ ...td, textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--text-primary)" }}>{fmtVND(inv.amount)}</td>
                      <td style={td}>{statusBadge(inv)}</td>
                      <td style={{ ...td, textAlign: "right", whiteSpace: "nowrap" }}>
                        {inv.status === "issued"
                          ? <Button variant="ghost" size="sm" icon={L.Eye}>Xem</Button>
                          : inv.status === "error"
                            ? <Button variant="secondary" size="sm" icon={L.RotateCcw}>Đẩy lại</Button>
                            : <Button variant={od ? "primary" : "secondary"} size="sm" icon={busyId === inv.hoSoId ? L.Loader : L.Send} disabled={busyId === inv.hoSoId} onClick={() => issueOne(inv)}>{busyId === inv.hoSoId ? "Đang xuất…" : od ? "Xuất gấp" : "Xuất & đẩy"}</Button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text-tertiary)", marginTop: 8 }}>
            <L.CalendarClock size={14} /> Hóa đơn quá hạn vẫn cho phép xuất lùi ngày (trong giới hạn cho phép) — ngày xuất sẽ được ghi nhận tách biệt với ngày giao dịch.
          </div>
        </div>
      </div>
    </div>
  );
}

window.POSAccounting = { ReconScreen, InvoiceScreen };
