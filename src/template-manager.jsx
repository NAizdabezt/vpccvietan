/* global React, window */
/* PH — Tab "Biểu mẫu": TKNV/CCV thêm, xóa, đặt tên & chọn loại hợp đồng cho biểu mẫu soạn thảo */
const { useState: useTm, useRef: useTmRef } = React;

function TmField({ k }) {
  const labels = window.VATemplateModel.VA_FIELD_LABELS;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", fontSize: 11, color: "var(--text-secondary)", background: "var(--bg-inset)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-full)", padding: "2px 8px" }}>
      {labels[k] || k}
    </span>
  );
}

function GroupBadge({ group }) {
  const tones = {
    "Bất động sản": { bg: "var(--accent-muted)", fg: "var(--accent-hover)", bd: "var(--accent-border)" },
    "Động sản": { bg: "var(--bg-warning)", fg: "var(--text-warning)", bd: "var(--border-warning)" },
    "Ủy quyền": { bg: "var(--bg-info)", fg: "var(--text-info)", bd: "var(--border-info)" },
    "Khác": { bg: "var(--bg-inset)", fg: "var(--text-secondary)", bd: "var(--border-default)" },
  };
  const t = tones[group] || tones["Khác"];
  return <span style={{ fontSize: 11, fontWeight: 600, color: t.fg, background: t.bg, border: "1px solid " + t.bd, borderRadius: "var(--radius-full)", padding: "2px 9px" }}>{group}</span>;
}

function AddForm({ onAdd, onCancel }) {
  const L = window.LucideReact;
  const { Button, Input } = window.FSICheckinDesignSystem_019df8;
  const TYPES = window.VATemplateModel.VA_CONTRACT_TYPES;
  const [name, setName] = useTm("");
  const [group, setGroup] = useTm(TYPES[0].group);
  const [file, setFile] = useTm(null);
  const [dragOver, setDragOver] = useTm(false);
  const fileRef = useTmRef(null);

  const pick = (f) => {
    if (!f) return;
    const nm = f.name.replace(/\.(docx?|pdf|rtf|odt)$/i, "");
    setFile({ name: f.name, size: f.size });
    if (!name.trim()) setName(nm);
  };

  return (
    <div style={{ border: "1px solid var(--accent-border)", background: "var(--accent-muted)", borderRadius: "var(--radius-lg)", padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <L.FilePlus size={16} color="var(--accent)" />
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--accent-hover)" }}>Tạo biểu mẫu mới</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: 14, alignItems: "end" }}>
        <Input label="Tên biểu mẫu" value={name} onChange={(e) => setName(e.target.value)} placeholder="vd: HĐ Thế chấp QSDĐ" autoFocus />
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Loại hợp đồng</label>
          <select value={group} onChange={(e) => setGroup(e.target.value)} style={{ width: "100%", height: 40, border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", background: "var(--bg-surface)", fontSize: 13.5, color: "var(--text-primary)", padding: "0 10px", fontFamily: "var(--font-sans)" }}>
            {TYPES.map((t) => <option key={t.group} value={t.group}>{t.group}</option>)}
          </select>
        </div>
      </div>
      {/* Tải biểu mẫu từ máy tính (tùy chọn) */}
      <div>
        <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Tệp biểu mẫu (Word/PDF) <span style={{ fontWeight: 500, color: "var(--text-tertiary)" }}>· tùy chọn</span></label>
        {file ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", background: "var(--bg-surface)" }}>
            <span style={{ width: 30, height: 30, flexShrink: 0, borderRadius: 7, display: "grid", placeItems: "center", background: "var(--bg-inset)", color: "var(--accent)" }}><L.FileText size={16} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
              <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>{(file.size / 1024).toFixed(0)} KB · đã tải lên</div>
            </div>
            <button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }} title="Bỏ tệp" style={{ width: 28, height: 28, display: "grid", placeItems: "center", border: "1px solid var(--border-default)", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", cursor: "pointer", color: "var(--text-tertiary)" }}><L.X size={15} /></button>
          </div>
        ) : (
          <div onClick={() => fileRef.current && fileRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); if (!dragOver) setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); pick(e.dataTransfer.files && e.dataTransfer.files[0]); }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "16px 14px", border: "1.5px dashed " + (dragOver ? "var(--accent)" : "var(--border-strong)"), borderRadius: "var(--radius-md)", background: dragOver ? "var(--accent-muted)" : "var(--bg-surface)", cursor: "pointer", color: "var(--text-tertiary)" }}>
            <L.UploadCloud size={18} color={dragOver ? "var(--accent)" : "var(--text-tertiary)"} />
            <span style={{ fontSize: 12.5 }}>Kéo-thả tệp vào đây, hoặc <span style={{ color: "var(--accent)", fontWeight: 600 }}>chọn từ máy tính</span> · .docx, .pdf</span>
          </div>
        )}
        <input ref={fileRef} type="file" accept=".doc,.docx,.pdf,.rtf,.odt" style={{ display: "none" }} onChange={(e) => pick(e.target.files && e.target.files[0])} />
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "var(--text-tertiary)" }}>
        <L.Info size={13} style={{ marginTop: 1, flexShrink: 0 }} />
        <span>{(TYPES.find((t) => t.group === group) || {}).desc} — hệ thống dùng bố cục & các ô dữ liệu của loại này. Tải tệp Word/PDF nếu muốn lưu kèm bản gốc của văn phòng.</span>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Button variant="ghost" onClick={onCancel}>Hủy</Button>
        <Button variant="primary" icon={L.Check} disabled={!name.trim()} onClick={() => onAdd(name, group, file ? file.name : null)}>Tạo biểu mẫu</Button>
      </div>
    </div>
  );
}

function TemplateCard({ tpl, onRename, onDelete, onSetGroup }) {
  const L = window.LucideReact;
  const { Input } = window.FSICheckinDesignSystem_019df8;
  const M = window.VATemplateModel;
  const [editing, setEditing] = useTm(false);
  const [name, setName] = useTm(tpl.name);
  const [confirming, setConfirming] = useTm(false);
  const keys = M.fieldKeysOf(tpl);

  return (
    <div style={{ border: "1px solid var(--border-default)", background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{ width: 38, height: 38, flexShrink: 0, borderRadius: "var(--radius-md)", display: "grid", placeItems: "center", background: "var(--bg-inset)", color: "var(--accent)" }}>
          <L.FileText size={18} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editing ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ flex: 1 }}><Input value={name} onChange={(e) => setName(e.target.value)} autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") { onRename(tpl.id, name); setEditing(false); } if (e.key === "Escape") { setName(tpl.name); setEditing(false); } }} /></div>
              <button type="button" onClick={() => { onRename(tpl.id, name); setEditing(false); }} title="Lưu tên" style={iconBtn("var(--text-success)")}><L.Check size={16} /></button>
              <button type="button" onClick={() => { setName(tpl.name); setEditing(false); }} title="Hủy" style={iconBtn("var(--text-tertiary)")}><L.X size={16} /></button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tpl.name}</h3>
              {tpl.builtin
                ? <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--text-tertiary)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-full)", padding: "1px 7px" }}>Mặc định</span>
                : <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--text-success)", border: "1px solid var(--border-success)", borderRadius: "var(--radius-full)", padding: "1px 7px" }}>Tùy chỉnh</span>}
            </div>
          )}
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <GroupBadge group={tpl.group} />
            <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{keys.length} ô dữ liệu{tpl.by && !tpl.builtin ? " · tạo bởi " + tpl.by : ""}</span>
          </div>
        </div>
        {!editing && (
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            <button type="button" onClick={() => setEditing(true)} title="Đổi tên" style={iconBtn("var(--text-secondary)")}><L.Pencil size={15} /></button>
            <button type="button" onClick={() => setConfirming(true)} title="Xóa biểu mẫu" style={iconBtn("var(--text-danger, #d92d20)")}><L.Trash2 size={15} /></button>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {keys.slice(0, 8).map((k, i) => <TmField key={i} k={k} />)}
      </div>

      {tpl.fileName && (
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "var(--text-secondary)", padding: "7px 10px", background: "var(--bg-inset)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
          <L.Paperclip size={13} color="var(--text-tertiary)" style={{ flexShrink: 0 }} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Bản gốc: {tpl.fileName}</span>
        </div>
      )}

      {confirming && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--bg-danger, rgba(217,45,32,.06))", border: "1px solid var(--border-danger, #f1aca5)", borderRadius: "var(--radius-md)" }}>
          <L.AlertTriangle size={15} color="var(--text-danger, #d92d20)" style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 12.5, color: "var(--text-secondary)" }}>Xóa biểu mẫu “{tpl.name}”?</span>
          <button type="button" onClick={() => setConfirming(false)} style={{ ...textBtn(), color: "var(--text-tertiary)" }}>Hủy</button>
          <button type="button" onClick={() => onDelete(tpl.id)} style={{ ...textBtn(), color: "var(--text-danger, #d92d20)", fontWeight: 600 }}>Xóa</button>
        </div>
      )}
    </div>
  );
}

function iconBtn(color) {
  return { width: 30, height: 30, display: "grid", placeItems: "center", border: "1px solid var(--border-default)", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", cursor: "pointer", color };
}
function textBtn() {
  return { border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 12.5 };
}

function TemplateManager({ currentUser }) {
  const L = window.LucideReact;
  const { Button } = window.FSICheckinDesignSystem_019df8;
  const M = window.VATemplateModel;
  const VT = window.VATemplates;
  const templates = M.useTemplates();
  const [adding, setAdding] = useTm(false);
  const TYPES = M.VA_CONTRACT_TYPES;

  const add = (name, group, fileName) => { window.VATemplates.add({ name, group, by: currentUser, fileName }); setAdding(false); };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 32px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Biểu mẫu soạn thảo</h1>
            <p style={{ fontSize: 13.5, color: "var(--text-tertiary)", margin: "4px 0 0" }}>
              Quản lý kho biểu mẫu hợp đồng — thêm, đổi tên, chọn loại và xóa. Biểu mẫu dùng lại được khi khởi tạo phiên soạn thảo.
            </p>
          </div>
          {!adding && <Button variant="primary" icon={L.Plus} onClick={() => setAdding(true)}>Thêm biểu mẫu</Button>}
        </div>

        {adding && <AddForm onAdd={add} onCancel={() => setAdding(false)} />}

        {TYPES.map((ty) => {
          const list = templates.filter((t) => t.group === ty.group);
          if (!list.length) return null;
          return (
            <div key={ty.group} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-tertiary)", margin: 0 }}>{ty.group}</h2>
                <span style={{ height: 1, flex: 1, background: "var(--border-subtle)" }} />
                <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{list.length} biểu mẫu</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {list.map((t) => (
                  <TemplateCard key={t.id} tpl={t} onRename={VT.rename} onDelete={VT.remove} onSetGroup={VT.setGroup} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.VATemplateManager = TemplateManager;
