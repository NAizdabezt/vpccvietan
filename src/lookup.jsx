/* global React, window */
/* Tra cứu khách cũ / hồ sơ cũ — Mini-CRM khớp theo metadata (tên, CCCD, SĐT,
   địa chỉ, số CC, thửa/tờ đất, biển số, bên đối ứng…). Dùng ở bước Khởi tạo. */
const { useState: useLk, useMemo: useMemoLk } = React;

/* Bỏ dấu tiếng Việt + đ→d để khớp không phân biệt dấu */
function normalizeVi(s) {
  return String(s || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .toLowerCase().trim();
}

/* Các trường metadata cố định tham gia tìm kiếm, kèm nhãn để hiển thị "khớp ở đâu" */
const SEARCH_FIELDS = [
  { key: "customer", label: "Tên" },
  { key: "cccd", label: "CCCD" },
  { key: "phone", label: "SĐT" },
  { key: "address", label: "Địa chỉ" },
  { key: "type", label: "Loại việc" },
  { key: "id", label: "Số CC" },
  { key: "counterparty", label: "Bên đối ứng" },
  { key: "notary", label: "CCV" },
  { key: "date", label: "Ngày" },
];

/* Trả về [{ record, matches:[label…] }] đã lọc + xếp theo độ liên quan */
function searchPriorRecords(records, query) {
  const q = normalizeVi(query);
  if (q.length < 2) return [];
  return records
    .map((r) => {
      const matches = [];
      SEARCH_FIELDS.forEach((f) => {
        if (normalizeVi(r[f.key]).includes(q)) matches.push(f.label);
      });
      (r.meta || []).forEach((m) => {
        if (normalizeVi(m.v).includes(q) || normalizeVi(m.k).includes(q)) matches.push(m.k);
      });
      // điểm: khớp tên đứng đầu, rồi số lượng trường khớp
      const score = (normalizeVi(r.customer).startsWith(q) ? 100 : 0)
        + (matches.includes("Tên") ? 20 : 0) + matches.length;
      return { record: r, matches: [...new Set(matches)], score };
    })
    .filter((x) => x.matches.length > 0)
    .sort((a, b) => b.score - a.score);
}

function MatchChip({ label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10.5, fontWeight: 600, color: "var(--accent-hover)", background: "var(--accent-muted)", border: "1px solid var(--accent-border)", borderRadius: "var(--radius-full)", padding: "1px 7px" }}>
      {label}
    </span>
  );
}

function RecordCard({ hit, onReuse }) {
  const L = window.LucideReact;
  const { Badge } = window.FSICheckinDesignSystem_019df8;
  const [open, setOpen] = useLk(false);
  const r = hit.record;
  const tone = r.status === "Đã công chứng" ? "success" : r.status === "Hết hiệu lực" ? "neutral" : "info";
  const allMeta = [
    { k: "Số CC", v: r.id, mono: true },
    { k: "CCCD", v: r.cccd, mono: true },
    { k: "Ngày sinh", v: r.dob },
    { k: "SĐT", v: r.phone, mono: true },
    { k: "Địa chỉ", v: r.address },
    { k: "CCV", v: r.notary },
    ...(r.meta || []),
  ];
  return (
    <div style={{ border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", background: "var(--bg-surface)", overflow: "hidden" }}>
      <div onClick={() => setOpen((o) => !o)} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 12px", cursor: "pointer" }}>
        <span style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, display: "grid", placeItems: "center", background: "var(--accent-muted)" }}>
          <L.FileClock size={16} color="var(--accent)" />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.customer}</span>
            <span style={{ flexShrink: 0 }}><Badge tone={tone} dot>{r.status}</Badge></span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {r.type} · {r.date} · <span style={{ fontFamily: "var(--font-mono)" }}>{r.id}</span> · {r.docCount} giấy tờ
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 7 }}>
            <span style={{ fontSize: 10.5, color: "var(--text-tertiary)", fontWeight: 600 }}>Khớp:</span>
            {hit.matches.map((m, i) => <MatchChip key={i} label={m} />)}
          </div>
        </div>
        <L.ChevronDown size={15} color="var(--text-tertiary)" style={{ flexShrink: 0, marginTop: 3, transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
      </div>
      {open && (
        <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "11px 12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px" }}>
            {allMeta.map((m, i) => (
              <div key={i} style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: ".04em", fontWeight: 600 }}>{m.k}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-primary)", fontFamily: m.mono ? "var(--font-mono)" : "var(--font-sans)", wordBreak: "break-word" }}>{m.v}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
            <button type="button" onClick={() => onReuse(r)} style={{
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

/* Panel tra cứu — query do FlowA giữ (đồng bộ với ô Tên khách hàng) */
function ReturningSearch({ query, setQuery, onReuse }) {
  const L = window.LucideReact;
  const D = window.VA_DATA;
  const hits = useMemoLk(() => searchPriorRecords(D.priorRecords, query), [query]);
  const typing = normalizeVi(query).length >= 2;

  return (
    <section style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <header style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 7 }}>
          <L.Users size={16} color="var(--accent)" /> Khách cũ &amp; hồ sơ liên quan
        </h3>
        <p style={{ margin: "3px 0 0", fontSize: 11.5, color: "var(--text-tertiary)", lineHeight: 1.45 }}>
          Tìm theo tên, CCCD, SĐT, địa chỉ, số CC, thửa/tờ đất, biển số, bên đối ứng…
        </p>
      </header>
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12, minHeight: 0 }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <L.Search size={15} color="var(--text-tertiary)" style={{ position: "absolute", left: 12 }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nhập tên hoặc bất kỳ thông tin nào của hồ sơ cũ…"
            style={{ width: "100%", fontFamily: "var(--font-sans)", fontSize: 13.5, color: "var(--text-primary)", background: "var(--bg-inset)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", padding: "9px 12px 9px 34px", outline: "none" }}
            onFocus={(e) => { e.target.style.background = "#fff"; e.target.style.borderColor = "var(--accent)"; }}
            onBlur={(e) => { e.target.style.background = "var(--bg-inset)"; e.target.style.borderColor = "var(--border-default)"; }} />
        </div>

        {!typing ? (
          <div style={{ display: "grid", placeItems: "center", textAlign: "center", padding: "28px 12px", color: "var(--text-tertiary)" }}>
            <L.ScanSearch size={26} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 12.5, lineHeight: 1.5, maxWidth: 240 }}>
              Bắt đầu nhập tên khách hoặc một trường thông tin — hệ thống đối chiếu mọi metadata trong kho hồ sơ cũ.
            </div>
          </div>
        ) : hits.length === 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text-secondary)", padding: "12px 12px", background: "var(--bg-inset)", borderRadius: "var(--radius-md)" }}>
            <L.SearchX size={16} color="var(--text-tertiary)" /> Không tìm thấy hồ sơ cũ khớp “{query.trim()}”. Đây có thể là khách mới.
          </div>
        ) : (
          <>
            <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", fontWeight: 500 }}>{hits.length} hồ sơ cũ khớp</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, overflowY: "auto", minHeight: 0 }}>
              {hits.map((h) => <RecordCard key={h.record.id} hit={h} onReuse={onReuse} />)}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

window.VALookup = { ReturningSearch, searchPriorRecords, normalizeVi };
