/* global React, window */
/* Bước "In & chuyển" — cấu hình in theo TỪNG hợp đồng.
   Mỗi hợp đồng có khối "Hồ sơ đính kèm" riêng; giấy tờ tùy thân có thể
   bật/tắt in ở từng giấy tờ khi số lượng nhiều. */
const { useState: usePf } = React;

const PF_LAYOUT_OPTS = [
  { v: "combine", label: "Ghép", icon: "LayoutGrid" },
  { v: "single", label: "1/trang", icon: "File" },
  { v: "off", label: "Không in", icon: "Ban" },
];

/* cfg mặc định cho 1 hợp đồng */
function defaultContractCfg() {
  return { give: 2, store: 1, layout: {}, docOff: {}, shotsOn: true };
}
function layoutOf(cfg, type) { return cfg.layout[type] || "combine"; }
function sheetsForGroup(cfg, type, imgs) {
  const enabled = imgs.filter((im) => !cfg.docOff[im.id]).length;
  const l = layoutOf(cfg, type);
  return l === "off" ? 0 : l === "single" ? enabled : Math.ceil(enabled / 4);
}

function QtyStepper({ icon, label, value, onChange, badge, disabled }) {
  const L = window.LucideReact;
  const Icon = L[icon];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: disabled ? .6 : 1 }}>
      <Icon size={16} color="var(--text-tertiary)" />
      <span style={{ flex: 1, fontSize: 13 }}>{label}</span>
      {badge && <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-warning)", border: "1px solid var(--border-warning)", borderRadius: 4, padding: "1px 5px", letterSpacing: ".04em" }}>{badge}</span>}
      <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border-default)", borderRadius: 7, overflow: "hidden" }}>
        <button type="button" disabled={disabled} onClick={() => !disabled && onChange(Math.max(0, value - 1))} style={pfQtyBtn}>–</button>
        <span style={{ width: 30, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 13.5, borderLeft: "1px solid var(--border-subtle)", borderRight: "1px solid var(--border-subtle)", padding: "5px 0" }}>{value}</span>
        <button type="button" disabled={disabled} onClick={() => !disabled && onChange(value + 1)} style={pfQtyBtn}>+</button>
      </div>
    </div>
  );
}
const pfQtyBtn = { width: 28, textAlign: "center", border: "none", background: "transparent", cursor: "pointer", fontSize: 16, color: "var(--text-secondary)", fontFamily: "var(--font-sans)" };

/* Bản in THẬT của các hợp đồng đã chọn — WYSIWYG: dùng lại đúng khung
   ".va-quill-page"/".ql-editor" đang hiển thị lúc soạn (src/editor.jsx#DraftPage),
   không dựng lại kiểu khác. Ẩn khi xem thường, chỉ hiện khi in nhờ CSS
   "@media print" trong index.html (khớp id "va-print-contracts"). Mỗi hợp đồng
   1 trang riêng (ngắt trang bằng class "va-print-contract-page"). */
function ContractPrintView({ picked, draftHtml, drafter }) {
  const M = window.VATemplateModel;
  const ident = (drafter && drafter.ident) || "";
  return (
    <div id="va-print-contracts" style={{ display: "none" }}>
      {picked.map((c) => (
        <div key={c.id} className="va-print-contract-page va-quill-page" style={{ margin: "0 auto" }}>
          <div className="ql-editor" style={{ padding: "44px 50px" }}
            dangerouslySetInnerHTML={{ __html: (draftHtml && draftHtml[c.id]) || M.htmlOf(c) }} />
          <div style={{ padding: "10px 50px 26px", borderTop: "1px solid #e7e7e3", display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: 6, fontSize: 11.5, color: "#9a9a93" }}>
            <span>Người soạn:</span>
            <span style={{ fontWeight: 700, letterSpacing: ".12em", color: "#5b5b54" }}>{ident || "—"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* Một nhóm giấy tờ (theo loại) trong 1 hợp đồng — bật/tắt in ở từng giấy tờ */
function DocGroupRow({ type, imgs, cfg, disabled, onLayout, onToggleDoc }) {
  const L = window.LucideReact;
  const [open, setOpen] = usePf(false);
  const layout = layoutOf(cfg, type);
  const off = layout === "off";
  const enabled = imgs.filter((im) => !cfg.docOff[im.id]).length;
  const sheets = sheetsForGroup(cfg, type, imgs);
  const hue = imgs[0] ? imgs[0].hue : 210;
  const partial = enabled > 0 && enabled < imgs.length;

  return (
    <div style={{ border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", background: "var(--bg-surface)", overflow: "hidden", opacity: off ? .72 : 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", flexWrap: "wrap" }}>
        <span style={{ width: 30, height: 30, borderRadius: 7, flexShrink: 0, display: "grid", placeItems: "center", background: `linear-gradient(135deg, hsl(${hue} 38% 90%), hsl(${hue} 30% 78%))` }}>
          <L.Files size={15} color={`hsl(${hue} 42% 42%)`} />
        </span>
        <button type="button" onClick={() => setOpen((o) => !o)} style={{ flex: 1, minWidth: 120, display: "flex", alignItems: "center", gap: 8, border: "none", background: "transparent", textAlign: "left", cursor: "pointer", fontFamily: "var(--font-sans)", padding: 0 }}>
          <span style={{ minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{type}</span>
            <span style={{ display: "block", fontSize: 11.5, color: off ? "var(--text-tertiary)" : partial ? "var(--text-warning)" : "var(--text-tertiary)" }}>
              {off ? imgs.length + " giấy tờ · không in" : "In " + enabled + "/" + imgs.length + " giấy tờ · " + sheets + " khổ A4"}
            </span>
          </span>
          <L.ChevronDown size={14} color="var(--text-tertiary)" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
        </button>
        <div style={{ display: "flex", border: "1px solid var(--border-default)", borderRadius: 7, overflow: "hidden" }}>
          {PF_LAYOUT_OPTS.map((o, i) => {
            const on = layout === o.v;
            const Ico = L[o.icon];
            return (
              <button key={o.v} type="button" disabled={disabled} onClick={() => !disabled && onLayout(type, o.v)}
                style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 9px", border: "none", borderLeft: i ? "1px solid var(--border-subtle)" : "none", cursor: disabled ? "default" : "pointer", fontFamily: "var(--font-sans)", fontSize: 11.5, fontWeight: on ? 600 : 500, whiteSpace: "nowrap", color: on ? "var(--accent)" : "var(--text-tertiary)", background: on ? "var(--accent-muted)" : "transparent" }}>
                <Ico size={12} /> {o.label}
              </button>
            );
          })}
        </div>
      </div>
      {open && (
        <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "8px 11px 10px", display: "flex", flexDirection: "column", gap: 4, background: "var(--bg-elevated)" }}>
          {imgs.map((im) => {
            const docOn = !off && !cfg.docOff[im.id];
            return (
              <button key={im.id} type="button" disabled={disabled || off} onClick={() => onToggleDoc(im.id)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px", border: "none", borderRadius: "var(--radius-md)", background: "transparent", textAlign: "left", cursor: disabled || off ? "default" : "pointer", fontFamily: "var(--font-sans)", opacity: off ? .55 : 1 }}>
                <span style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, display: "grid", placeItems: "center", border: "1.5px solid " + (docOn ? "var(--accent)" : "var(--border-strong)"), background: docOn ? "var(--accent)" : "transparent" }}>
                  {docOn && <L.Check size={12} color="#fff" />}
                </span>
                <L.FileImage size={15} color={`hsl(${im.hue} 42% 48%)`} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 12.5, color: docOn ? "var(--text-primary)" : "var(--text-tertiary)", textDecoration: docOn ? "none" : "line-through" }}>{im.label}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: docOn ? "var(--text-success)" : "var(--text-tertiary)" }}>{docOn ? "In" : "Không in"}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* Khối "Hồ sơ đính kèm" cho 1 hợp đồng */
function AttachBlock({ cfg, groups, shots, disabled, update }) {
  const L = window.LucideReact;
  const idGroups = groups.filter((g) => g.cat === "id");
  const assetGroups = groups.filter((g) => g.cat !== "id");
  const onLayout = (type, v) => update((c) => ({ ...c, layout: { ...c.layout, [type]: v } }));
  const onToggleDoc = (imgId) => update((c) => ({ ...c, docOff: { ...c.docOff, [imgId]: !c.docOff[imgId] } }));

  const Section = ({ icon, title, list }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-tertiary)" }}>
        <L.Dot size={1} />{title}
      </div>
      {list.map((g) => (
        <DocGroupRow key={g.type} type={g.type} imgs={g.imgs} cfg={cfg} disabled={disabled} onLayout={onLayout} onToggleDoc={onToggleDoc} />
      ))}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)" }}>
        <L.Paperclip size={14} color="var(--accent)" /> Hồ sơ đính kèm in cùng hợp đồng này
      </div>
      {idGroups.length > 0 && <Section title="Giấy tờ tùy thân" list={idGroups} />}
      {assetGroups.length > 0 && <Section title="Giấy tờ tài sản &amp; hợp đồng" list={assetGroups} />}

      {/* Tra cứu ngăn chặn */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", background: cfg.shotsOn ? "var(--bg-surface)" : "var(--bg-elevated)" }}>
        <L.ShieldCheck size={16} color={cfg.shotsOn ? "var(--accent)" : "var(--text-tertiary)"} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Ảnh tra cứu ngăn chặn</div>
          <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>{shots.length} ảnh · in riêng từng trang</div>
        </div>
        <span style={{ fontSize: 11.5, fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", marginRight: 2 }}>{cfg.shotsOn ? shots.length + " khổ" : "—"}</span>
        <span onClick={() => { if (!disabled) update((c) => ({ ...c, shotsOn: !c.shotsOn })); }} style={{ width: 36, height: 20, borderRadius: 10, background: cfg.shotsOn ? "var(--accent)" : "var(--border-strong)", position: "relative", flexShrink: 0, cursor: disabled ? "default" : "pointer" }}>
          <span style={{ position: "absolute", top: 2, left: cfg.shotsOn ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left .15s" }} />
        </span>
      </div>
    </div>
  );
}

/* Thẻ cấu hình của 1 hợp đồng */
function ContractCard({ contract, idx, cfg, groups, shots, disabled, update, defaultOpen }) {
  const L = window.LucideReact;
  const [open, setOpen] = usePf(defaultOpen);
  const attachSheets = groups.reduce((s, g) => s + sheetsForGroup(cfg, g.type, g.imgs), 0) + (cfg.shotsOn ? shots.length : 0);

  return (
    <section style={{ border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "var(--bg-surface)" }}>
      <button type="button" onClick={() => setOpen((o) => !o)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: "var(--bg-elevated)", border: "none", borderBottom: open ? "1px solid var(--border-subtle)" : "none", cursor: "pointer", fontFamily: "var(--font-sans)", textAlign: "left" }}>
        <span style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, display: "grid", placeItems: "center", background: "var(--accent-muted)", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>{idx + 1}</span>
        <L.FileText size={15} color="var(--accent)" />
        <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600 }}>{contract.name}</span>
        <span style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>{cfg.give + cfg.store} bản · {attachSheets} khổ kèm</span>
        <L.ChevronDown size={16} color="var(--text-tertiary)" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
      </button>
      {open && (
        <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <QtyStepper icon="UserRound" label="Bản chính giao khách" value={cfg.give} disabled={disabled} onChange={(v) => update((c) => ({ ...c, give: v }))} />
            <QtyStepper icon="Archive" label="Bản lưu kho" badge="BẢN LƯU" value={cfg.store} disabled={disabled} onChange={(v) => update((c) => ({ ...c, store: v }))} />
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 11.5, color: "var(--text-success)", padding: "7px 10px", background: "var(--bg-success)", border: "1px solid var(--border-success)", borderRadius: "var(--radius-md)" }}>
              <L.Stamp size={14} color="var(--text-success)" style={{ flexShrink: 0, marginTop: 1 }} /> <span>{cfg.store} bản lưu kho tự đóng dấu chìm “BẢN LƯU”.</span>
            </div>
          </div>
          <div style={{ borderTop: "1px dashed var(--border-default)" }} />
          <AttachBlock cfg={cfg} groups={groups} shots={shots} disabled={disabled} update={update} />
        </div>
      )}
    </section>
  );
}

function PrintStep({ picked, scanImages, shots, cfgs, setCfgs, ro, onPrint, saving, drafter, setDrafterByName, drafterOptions, meName, draftHtml, onPrintNow }) {
  const L = window.LucideReact;
  const { Button } = window.FSICheckinDesignSystem_019df8;

  // gom ảnh scan theo loại (giữ thứ tự + cat)
  const groups = React.useMemo(() => {
    const m = {};
    scanImages.forEach((im) => { (m[im.type] = m[im.type] || { type: im.type, cat: im.cat, imgs: [] }).imgs.push(im); });
    return Object.values(m);
  }, [scanImages]);

  const cfgFor = (id) => cfgs[id] || defaultContractCfg();
  const updateCfg = (id, fn) => setCfgs((all) => ({ ...all, [id]: fn(all[id] || defaultContractCfg()) }));

  // tổng kết toàn phiên
  let totalGive = 0, totalStore = 0, totalAttach = 0;
  picked.forEach((c) => {
    const cfg = cfgFor(c.id);
    totalGive += cfg.give; totalStore += cfg.store;
    totalAttach += groups.reduce((s, g) => s + sheetsForGroup(cfg, g.type, g.imgs), 0) + (cfg.shotsOn ? shots.length : 0);
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 16, alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Người soạn & ký tự định danh in cuối văn bản */}
        <section style={{ border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", background: "var(--bg-surface)", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600 }}>
            <L.PenLine size={15} color="var(--accent)" /> Người soạn hồ sơ
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1, minWidth: 220 }}>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-secondary)" }}>Chọn CCV / TKNV định danh người soạn</label>
              <select value={drafter.name} disabled={ro} onChange={(e) => setDrafterByName(e.target.value)}
                style={{ width: "100%", height: 38, border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", background: ro ? "var(--bg-inset)" : "#fff", fontSize: 13.5, color: "var(--text-primary)", padding: "0 10px", fontFamily: "var(--font-sans)", cursor: ro ? "default" : "pointer" }}>
                {drafterOptions.map((o) => <option key={o.name} value={o.name}>{o.name}{o.name === meName ? " (bạn)" : ""} · {o.role === "ccv" ? "CCV" : "TKNV"}</option>)}
              </select>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginBottom: 5 }}>Ký tự in cuối văn bản</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, letterSpacing: ".1em", color: "var(--accent-hover)", background: "var(--accent-muted)", border: "1px solid var(--accent-border)", borderRadius: "var(--radius-md)", padding: "6px 16px" }}>{drafter.ident || "—"}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, color: "var(--text-tertiary)" }}>
            <L.Info size={13} /> Mặc định là người đang trong phiên. Ký tự này in ở cuối mọi văn bản để định danh khi tra hồ sơ vật lý.
          </div>
        </section>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text-secondary)" }}>
          <L.Layers size={15} color="var(--accent)" />
          {picked.length > 1
            ? <span><b>{picked.length} hợp đồng</b> trong phiên — mỗi hợp đồng cấu hình số bản &amp; hồ sơ đính kèm riêng.</span>
            : <span>Cấu hình số bản in &amp; hồ sơ đính kèm cho hợp đồng.</span>}
        </div>
        {picked.map((c, i) => (
          <ContractCard key={c.id} contract={c} idx={i} cfg={cfgFor(c.id)} groups={groups} shots={shots} disabled={ro}
            update={(fn) => updateCfg(c.id, fn)} defaultOpen={i === 0} />
        ))}
      </div>

      <section style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", position: "sticky", top: 0 }}>
        <header style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Tổng kết lệnh in</h3>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-tertiary)" }}>Toàn phiên · {picked.length} hợp đồng</p>
        </header>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          {picked.map((c, i) => {
            const cfg = cfgFor(c.id);
            const at = groups.reduce((s, g) => s + sheetsForGroup(cfg, g.type, g.imgs), 0) + (cfg.shotsOn ? shots.length : 0);
            return (
              <div key={c.id} style={{ display: "flex", alignItems: "baseline", gap: 8, fontSize: 12.5 }}>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-tertiary)" }}>{i + 1}.</span>
                <span style={{ flex: 1, color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>{cfg.give + cfg.store} bản · {at} khổ</span>
              </div>
            );
          })}
          <div style={{ borderTop: "1px dashed var(--border-default)", margin: "2px 0" }} />
          <Sum label="Bản giao khách" v={totalGive} />
          <Sum label="Bản lưu kho (watermark)" v={totalStore} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5 }}>
            <span style={{ color: "var(--text-tertiary)" }}>Định danh người soạn</span>
            <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--accent-hover)" }}>{drafter.ident || "—"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 11px", background: "var(--accent-muted)", borderRadius: "var(--radius-md)", marginTop: 2 }}>
            <span style={{ fontWeight: 600, color: "var(--accent-hover)", display: "inline-flex", alignItems: "center", gap: 6 }}><L.FileStack size={14} /> Khổ A4 hồ sơ đính kèm</span>
            <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--accent-hover)" }}>{totalAttach} khổ</span>
          </div>
          {/* Xem/in hợp đồng thật (WYSIWYG) — tách riêng khỏi việc chuyển Thu ngân,
              nên vẫn dùng được cả khi xem lại hồ sơ cũ (ro=true). */}
          <Button variant="secondary" icon={L.Printer} fullWidth onClick={onPrintNow}>Xem &amp; in hợp đồng</Button>
          {ro
            ? <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text-tertiary)", padding: "10px 12px", background: "var(--bg-overlay)", borderRadius: "var(--radius-md)" }}><L.Eye size={15} /> Chế độ chỉ xem — phiên đang chờ chốt số công chứng.</div>
            : <Button variant="primary" icon={L.Send} fullWidth disabled={saving} onClick={onPrint}>{saving ? "Đang xử lý…" : "Chuyển Thu ngân"}</Button>}
        </div>
      </section>
      <ContractPrintView picked={picked} draftHtml={draftHtml} drafter={drafter} />
    </div>
  );
}

function Sum({ label, v }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
      <span style={{ color: "var(--text-tertiary)" }}>{label}</span>
      <span style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>{v} bản</span>
    </div>
  );
}

window.VAPrintStep = PrintStep;
window.VAPrintDefaults = defaultContractCfg;
