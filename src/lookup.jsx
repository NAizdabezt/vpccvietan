/* global React, window */
/* Tra cứu khách cũ — trước đây toàn bộ màn này khớp theo một mảng dữ liệu bịa
   (VA_DATA.priorRecords), chưa từng gọi API thật dù route GET /api/khach-hang
   đã tồn tại sẵn. Giờ gọi thật, kèm lịch sử hồ sơ THẬT của khách (server trả
   sẵn qua include hoSos) để CCV/TKNV biết khách từng công chứng việc gì. */
const { useState: useLk, useEffect: useEffLk, useRef: useRefLk } = React;

const LOAI_HO_SO_LABEL = { HOP_DONG: "Hợp đồng", CHUNG_THUC: "Chứng thực", SAO_Y: "Sao y" };
const TRANG_THAI_LABEL = {
  NHAP_LIEU: "Lưu nháp", CHO_CCV: "Đang soạn thảo", CHO_THU_NGAN: "Chờ cấp số & thu phí",
  DA_CAP_SO: "Đã cấp số", DANG_LIEN_THONG: "Chờ số hóa & đẩy CMC", HOAN_TAT: "Đã công chứng",
  LOI: "Lỗi liên thông CMC", CHO_BO_SUNG: "Chờ bổ sung giấy tờ",
};
function fmtDateVN(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function RecordCard({ customer, onReuse }) {
  const L = window.LucideReact;
  const { Badge } = window.FSICheckinDesignSystem_019df8;
  const [open, setOpen] = useLk(false);
  const hoSos = customer.hoSos || [];
  const info = [
    { k: "CCCD", v: customer.soCccd, mono: true },
    { k: "Ngày sinh", v: customer.ngaySinh ? fmtDateVN(customer.ngaySinh) : null },
    { k: "SĐT", v: customer.soDienThoai, mono: true },
    { k: "Địa chỉ", v: customer.diaChiLienLac || customer.diaChiThuongTru },
  ].filter((m) => m.v);

  return (
    <div style={{ border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", background: "var(--bg-surface)", overflow: "hidden" }}>
      <div onClick={() => setOpen((o) => !o)} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 12px", cursor: "pointer" }}>
        <span style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, display: "grid", placeItems: "center", background: "var(--accent-muted)" }}>
          <L.FileClock size={16} color="var(--accent)" />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{customer.hoTen}</span>
            {hoSos.length > 0 && <span style={{ flexShrink: 0 }}><Badge tone="info" dot>{hoSos.length} hồ sơ</Badge></span>}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {customer.soCccd ? <span style={{ fontFamily: "var(--font-mono)" }}>{customer.soCccd}</span> : "Chưa có CCCD"}
            {customer.soDienThoai ? " · " + customer.soDienThoai : ""}
          </div>
        </div>
        <L.ChevronDown size={15} color="var(--text-tertiary)" style={{ flexShrink: 0, marginTop: 3, transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
      </div>
      {open && (
        <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "11px 12px" }}>
          {info.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px", marginBottom: hoSos.length ? 12 : 0 }}>
              {info.map((m, i) => (
                <div key={i} style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: ".04em", fontWeight: 600 }}>{m.k}</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-primary)", fontFamily: m.mono ? "var(--font-mono)" : "var(--font-sans)", wordBreak: "break-word" }}>{m.v}</div>
                </div>
              ))}
            </div>
          )}
          {hoSos.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 10.5, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: ".04em", fontWeight: 600 }}>Hồ sơ đã công chứng</div>
              {hoSos.map((h) => {
                const soCC = h.soCongChung || h.soChungThuc || h.soSaoY;
                const loai = (h.bieuMaus || []).map((b) => b.ten).join(", ") || LOAI_HO_SO_LABEL[h.loaiHoSo] || h.loaiHoSo;
                return (
                  <div key={h.id} style={{ fontSize: 12, padding: "7px 9px", background: "var(--bg-overlay)", borderRadius: "var(--radius-md)" }}>
                    <div style={{ color: "var(--text-primary)", fontWeight: 500 }}>{loai}</div>
                    <div style={{ color: "var(--text-tertiary)", fontSize: 11, marginTop: 1 }}>
                      {fmtDateVN(h.ngayTao)} · {h.ccv ? h.ccv.hoTen : "Chưa gán CCV"} · {TRANG_THAI_LABEL[h.trangThai] || h.trangThai}
                      {soCC && <> · <span style={{ fontFamily: "var(--font-mono)" }}>{soCC}</span></>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
            <button type="button" onClick={() => onReuse(customer)} style={{
              display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: "var(--radius-md)",
              border: "1px solid var(--accent)", background: "var(--accent)", color: "#fff", fontFamily: "var(--font-sans)",
              fontSize: 12.5, fontWeight: 600, cursor: "pointer",
            }}>
              <L.CopyPlus size={14} /> Dùng lại thông tin
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* Panel tra cứu — query do FlowA giữ (đồng bộ với ô Tên khách hàng); debounce
   300ms trước khi gọi API để không gọi trên mỗi phím gõ. */
function ReturningSearch({ query, setQuery, onReuse }) {
  const L = window.LucideReact;
  const [results, setResults] = useLk([]);
  const [loading, setLoading] = useLk(false);
  const [err, setErr] = useLk("");
  const reqSeq = useRefLk(0);
  const typing = query.trim().length >= 2;

  useEffLk(() => {
    if (!typing) { setResults([]); setErr(""); return; }
    const mySeq = ++reqSeq.current;
    setLoading(true);
    const t = setTimeout(() => {
      window.VAApi.khachHang.list(query.trim())
        .then((rows) => { if (reqSeq.current === mySeq) { setResults(rows); setErr(""); } })
        .catch((e) => { if (reqSeq.current === mySeq) setErr(e.message || "Không tra cứu được"); })
        .finally(() => { if (reqSeq.current === mySeq) setLoading(false); });
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <section style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <header style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 7 }}>
          <L.Users size={16} color="var(--accent)" /> Khách cũ &amp; hồ sơ liên quan
        </h3>
        <p style={{ margin: "3px 0 0", fontSize: 11.5, color: "var(--text-tertiary)", lineHeight: 1.45 }}>
          Tìm theo tên, CCCD hoặc số điện thoại trong kho khách hàng đã lưu.
        </p>
      </header>
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12, minHeight: 0 }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <L.Search size={15} color="var(--text-tertiary)" style={{ position: "absolute", left: 12 }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nhập tên, CCCD hoặc SĐT khách hàng…"
            style={{ width: "100%", fontFamily: "var(--font-sans)", fontSize: 13.5, color: "var(--text-primary)", background: "var(--bg-inset)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", padding: "9px 12px 9px 34px", outline: "none" }}
            onFocus={(e) => { e.target.style.background = "#fff"; e.target.style.borderColor = "var(--accent)"; }}
            onBlur={(e) => { e.target.style.background = "var(--bg-inset)"; e.target.style.borderColor = "var(--border-default)"; }} />
        </div>

        {!typing ? (
          <div style={{ display: "grid", placeItems: "center", textAlign: "center", padding: "28px 12px", color: "var(--text-tertiary)" }}>
            <L.ScanSearch size={26} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 12.5, lineHeight: 1.5, maxWidth: 240 }}>
              Bắt đầu nhập tên, CCCD hoặc SĐT khách — hệ thống tra trong kho khách hàng đã lưu.
            </div>
          </div>
        ) : loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text-tertiary)", padding: "12px" }}>
            <L.Loader size={15} /> Đang tra cứu…
          </div>
        ) : err ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text-danger)", padding: "12px", background: "var(--bg-danger)", borderRadius: "var(--radius-md)" }}>
            <L.AlertTriangle size={16} /> {err}
          </div>
        ) : results.length === 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text-secondary)", padding: "12px 12px", background: "var(--bg-inset)", borderRadius: "var(--radius-md)" }}>
            <L.SearchX size={16} color="var(--text-tertiary)" /> Không tìm thấy khách khớp “{query.trim()}”. Đây có thể là khách mới.
          </div>
        ) : (
          <>
            <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", fontWeight: 500 }}>{results.length} khách khớp</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, overflowY: "auto", minHeight: 0 }}>
              {results.map((c) => <RecordCard key={c.id} customer={c} onReuse={onReuse} />)}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

window.VALookup = { ReturningSearch };
