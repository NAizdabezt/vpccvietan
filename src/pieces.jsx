/* global React, window */
/* Các khối dùng lại cho luồng soạn thảo CCV / TKNV */
const { useState: usePc, useRef: useRefPc } = React;

/* ---- Bước Bóc tách: thanh nguồn (máy scan + tải ảnh) ---- */
function ScanBar({ connected, readOnly, onConnect, onUpload }) {
  const L = window.LucideReact;
  const fileRef = useRefPc(null);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 220 }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, background: connected ? "var(--bg-success)" : "var(--bg-inset)", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <L.Printer size={19} color={connected ? "var(--text-success)" : "var(--text-tertiary)"} />
        </span>
        <div style={{ lineHeight: 1.3 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600 }}>Máy scan Canon DR-C240</div>
          <div style={{ fontSize: 11.5, color: connected ? "var(--text-success)" : "var(--text-tertiary)", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: connected ? "var(--color-success)" : "var(--text-disabled)" }} />
            {connected ? "Đã kết nối · sẵn sàng nạp giấy" : "Chưa kết nối"}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {readOnly ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-tertiary)" }}><L.Eye size={14} /> Chỉ xem</span>
        ) : (<>
          <button type="button" onClick={onConnect} style={srcBtn(connected ? "ghost" : "solid")}>
            <L.ScanLine size={15} /> {connected ? "Quét tài liệu" : "Kết nối máy scan"}
          </button>
          <button type="button" onClick={() => fileRef.current && fileRef.current.click()} style={srcBtn("ghost")}>
            <L.Upload size={15} /> Tải ảnh từ hệ thống
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={() => onUpload && onUpload()} />
        </>)}
      </div>
    </div>
  );
}

/* ---- Cột trái: ảnh đã OCR ---- */
function ScanGallery({ images, activeId, onSelect }) {
  const L = window.LucideReact;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {images.map((im) => {
        const on = im.id === activeId;
        return (
          <button key={im.id} type="button" onClick={() => onSelect(im.id)} style={{
            display: "flex", alignItems: "center", gap: 10, padding: 8, textAlign: "left", cursor: "pointer",
            border: "1px solid " + (on ? "var(--accent)" : "var(--border-default)"), borderRadius: "var(--radius-md)",
            background: on ? "var(--accent-muted)" : "var(--bg-surface)", fontFamily: "var(--font-sans)",
          }}>
            <span style={{ width: 52, height: 64, borderRadius: 6, flexShrink: 0, border: "1px solid var(--border-subtle)", overflow: "hidden", display: "grid", placeItems: "center", background: `linear-gradient(135deg, hsl(${im.hue} 38% 90%), hsl(${im.hue} 32% 76%))` }}>
              <L.FileImage size={20} color={`hsl(${im.hue} 42% 42%)`} />
            </span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{im.label}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}><L.CircleCheck size={11} /> Đã tải lên</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ---- Cột phải: tài liệu OCR, sửa được ---- */
function EditableDoc({ doc, onField, defaultOpen, readOnly }) {
  const L = window.LucideReact;
  const { Badge } = window.FSICheckinDesignSystem_019df8;
  const [open, setOpen] = usePc(defaultOpen || false);
  const Icon = L[doc.icon] || L.File;
  return (
    <div style={{ border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", background: "var(--bg-surface)", overflow: "hidden" }}>
      <div onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", cursor: "pointer" }}>
        <div style={{ width: 30, height: 30, borderRadius: 7, background: "var(--accent-muted)", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Icon size={16} color="var(--accent)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            {doc.name}
            {doc.qr && <span title="Có mã QR" style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, color: "var(--accent)", background: "var(--accent-muted)", borderRadius: 4, padding: "1px 5px" }}><L.QrCode size={10} /> QR</span>}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>{doc.source}</div>
        </div>
        <Badge tone="neutral">Nhập tay</Badge>
        <L.ChevronDown size={15} color="var(--text-tertiary)" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
      </div>
      {open && (
        <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "10px 12px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px 12px" }}>
          {doc.fields.map((f, fi) => (
            <label key={f.label} style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 10.5, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: ".04em", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                {f.warn && <L.AlertTriangle size={10} color="var(--text-warning)" />}{f.label}
              </span>
              <input value={f.value} readOnly={readOnly} onChange={(e) => { if (!readOnly) onField(doc.id, fi, e.target.value); }} style={{
                width: "100%", fontFamily: f.mono ? "var(--font-mono)" : "var(--font-sans)", fontSize: 12.5,
                color: "var(--text-primary)", background: "var(--bg-inset)",
                border: "1px solid " + (f.warn ? "var(--border-warning)" : "var(--border-default)"),
                borderRadius: "var(--radius-md)", padding: "6px 9px", outline: "none",
              }}
              onFocus={(e) => { e.target.style.background = "#fff"; e.target.style.borderColor = "var(--accent)"; }}
              onBlur={(e) => { e.target.style.background = "var(--bg-inset)"; e.target.style.borderColor = f.warn ? "var(--border-warning)" : "var(--border-default)"; }} />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---- Bước Tra cứu: hàng tài liệu + tick đã kiểm tra ---- */
function CheckDocRow({ doc, checked, onToggle, readOnly }) {
  const L = window.LucideReact;
  const Icon = L[doc.icon] || L.File;
  return (
    <div onClick={() => { if (!readOnly) onToggle(); }} style={{
      display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", cursor: readOnly ? "default" : "pointer",
      borderBottom: "1px solid var(--border-subtle)", background: checked ? "var(--bg-success)" : "transparent",
    }}>
      <span style={{
        width: 22, height: 22, borderRadius: 6, flexShrink: 0, display: "grid", placeItems: "center",
        border: "1.5px solid " + (checked ? "var(--color-success)" : "var(--border-strong)"),
        background: checked ? "var(--color-success)" : "transparent",
      }}>{checked && <L.Check size={14} color="#fff" />}</span>
      <span style={{ width: 30, height: 30, borderRadius: 7, background: "var(--accent-muted)", display: "grid", placeItems: "center", flexShrink: 0 }}>
        <Icon size={16} color="var(--accent)" />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
          {doc.name}
          {doc.qr && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, color: "var(--accent)", background: "var(--accent-muted)", borderRadius: 4, padding: "1px 5px" }}><L.QrCode size={10} /> QR</span>}
        </div>
        <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>{doc.fields[0] ? doc.fields[0].label + ": " + doc.fields[0].value : doc.source}</div>
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: checked ? "var(--text-success)" : "var(--text-tertiary)" }}>{checked ? "Đã kiểm tra" : "Chưa kiểm tra"}</span>
    </div>
  );
}

/* ---- Vùng tải ảnh chụp màn hình tra cứu ---- */
function UploadZone({ files, onAdd, onRemove, label, hint, readOnly }) {
  const L = window.LucideReact;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {!readOnly && (
      <button type="button" onClick={onAdd} style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
        padding: "20px 14px", border: "1.5px dashed var(--border-strong)", borderRadius: "var(--radius-lg)",
        background: "var(--bg-surface)", cursor: "pointer", color: "var(--text-secondary)", fontFamily: "var(--font-sans)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "var(--accent-muted)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.background = "var(--bg-surface)"; }}>
        <L.ImagePlus size={22} color="var(--accent)" />
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{label}</span>
        {hint && <span style={{ fontSize: 11.5, color: "var(--text-tertiary)", textAlign: "center" }}>{hint}</span>}
      </button>
      )}
      {files.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {files.map((f) => (
            <div key={f.id} style={{ width: 96, position: "relative" }}>
              <div style={{ width: 96, height: 70, borderRadius: 8, border: "1px solid var(--border-default)", overflow: "hidden", display: "grid", placeItems: "center", background: `linear-gradient(135deg, hsl(${f.hue} 38% 90%), hsl(${f.hue} 30% 76%))` }}>
                <L.FileImage size={20} color={`hsl(${f.hue} 42% 42%)`} />
              </div>
              {!readOnly && <button type="button" onClick={() => onRemove(f.id)} style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: 6, border: "none", background: "rgba(28,28,26,.7)", color: "#fff", display: "grid", placeItems: "center", cursor: "pointer" }}>
                <L.X size={12} />
              </button>}
              <div style={{ fontSize: 10.5, color: "var(--text-tertiary)", marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function srcBtn(kind) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6, borderRadius: "var(--radius-md)",
    padding: "8px 13px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)",
    border: "1px solid var(--border-default)", background: "var(--bg-surface)", color: "var(--text-secondary)",
  };
  if (kind === "solid") return { ...base, background: "var(--accent)", color: "#fff", border: "1px solid var(--accent)" };
  return base;
}

window.VAPieces = { ScanBar, ScanGallery, EditableDoc, CheckDocRow, UploadZone };
