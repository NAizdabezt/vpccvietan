/* global React, window */
/* PH — Tab "Biểu mẫu": TKNV/CCV thêm, xóa, đặt tên & chọn loại hợp đồng cho biểu mẫu soạn thảo.
   Mốc 6: nối API thật (server/src/routes/bieu-mau.js) — không còn dùng kho
   localStorage (window.VATemplates) cho màn này (VATemplates vẫn giữ nguyên
   làm nguồn dự phòng ngoại tuyến cho src/flowA.jsx). */
const { useState: useTm, useRef: useTmRef, useEffect: useTmEffect } = React;

// Nhóm biểu mẫu THẬT dùng trong DB (khớp server/prisma/seed.js và
// src/templates-data.jsx#nhomToKind) — khác tên với VA_CONTRACT_TYPES (bảng
// nhóm cũ của kho mock localStorage).
const BIEU_MAU_NHOM = [
  { group: "Đất đai", desc: "Chuyển nhượng / tặng cho / thế chấp QSDĐ" },
  { group: "Động sản", desc: "Mua bán xe, tài sản động sản" },
  { group: "Ủy quyền", desc: "Giấy / hợp đồng ủy quyền" },
  { group: "Ủy quyền xe", desc: "Ủy quyền gắn với 1 xe cụ thể" },
];

function TmField({ label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", fontSize: 11, color: "var(--text-secondary)", background: "var(--bg-inset)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-full)", padding: "2px 8px" }}>
      {label}
    </span>
  );
}

function GroupBadge({ group }) {
  const tones = {
    "Đất đai": { bg: "var(--accent-muted)", fg: "var(--accent-hover)", bd: "var(--accent-border)" },
    "Động sản": { bg: "var(--bg-warning)", fg: "var(--text-warning)", bd: "var(--border-warning)" },
    "Ủy quyền": { bg: "var(--bg-info)", fg: "var(--text-info)", bd: "var(--border-info)" },
    "Ủy quyền xe": { bg: "var(--bg-success)", fg: "var(--text-success)", bd: "var(--border-success)" },
  };
  const t = tones[group] || { bg: "var(--bg-inset)", fg: "var(--text-secondary)", bd: "var(--border-default)" };
  return <span style={{ fontSize: 11, fontWeight: 600, color: t.fg, background: t.bg, border: "1px solid " + t.bd, borderRadius: "var(--radius-full)", padding: "2px 9px" }}>{group}</span>;
}

function AddForm({ onAdd, onCancel, busy }) {
  const L = window.LucideReact;
  const { Button, Input } = window.FSICheckinDesignSystem_019df8;
  const [name, setName] = useTm("");
  const [group, setGroup] = useTm(BIEU_MAU_NHOM[0].group);
  const [phi, setPhi] = useTm("");
  const [file, setFile] = useTm(null);
  const [dragOver, setDragOver] = useTm(false);
  const [parsedHtml, setParsedHtml] = useTm(null);
  const [parsing, setParsing] = useTm(false);
  const [parseErr, setParseErr] = useTm("");
  const fileRef = useTmRef(null);

  // .docx (Word mới) đọc được nội dung THẬT qua mammoth (server); các định dạng
  // khác (.doc cũ/.pdf/.rtf/.odt) chưa có thư viện đọc — chỉ lưu tên tham chiếu.
  const pick = async (f) => {
    if (!f) return;
    const nm = f.name.replace(/\.(docx?|pdf|rtf|odt)$/i, "");
    setFile({ name: f.name, size: f.size });
    if (!name.trim()) setName(nm);
    setParsedHtml(null);
    setParseErr("");
    if (!/\.docx$/i.test(f.name)) {
      setParseErr("Chỉ đọc được nội dung thật từ file .docx (Word mới) — định dạng này chỉ lưu tên file để tham chiếu.");
      return;
    }
    setParsing(true);
    try {
      const form = new FormData();
      form.append("file", f);
      const { html } = await window.VAApi.bieuMau.parseDocx(form);
      setParsedHtml(html);
    } catch (e) {
      setParseErr(e.message || "Không đọc được nội dung file Word");
    } finally {
      setParsing(false);
    }
  };

  return (
    <div style={{ border: "1px solid var(--accent-border)", background: "var(--accent-muted)", borderRadius: "var(--radius-lg)", padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <L.FilePlus size={16} color="var(--accent)" />
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--accent-hover)" }}>Tạo biểu mẫu mới</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr) minmax(0,.8fr)", gap: 14, alignItems: "end" }}>
        <Input label="Tên biểu mẫu" value={name} onChange={(e) => setName(e.target.value)} placeholder="vd: HĐ Thế chấp QSDĐ" />
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Loại hợp đồng</label>
          <select value={group} onChange={(e) => setGroup(e.target.value)} style={{ width: "100%", height: 40, border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", background: "var(--bg-surface)", fontSize: 13.5, color: "var(--text-primary)", padding: "0 10px", fontFamily: "var(--font-sans)" }}>
            {BIEU_MAU_NHOM.map((t) => <option key={t.group} value={t.group}>{t.group}</option>)}
          </select>
        </div>
        <Input label="Phí mặc định (đ)" type="number" value={phi} onChange={(e) => setPhi(e.target.value)} placeholder="vd: 800000" />
      </div>
      {/* Tải biểu mẫu từ máy tính — .docx đọc được nội dung THẬT (mammoth); các
          định dạng khác chỉ lưu tên file để tham chiếu, chưa đọc được nội dung. */}
      <div>
        <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Tệp biểu mẫu (Word/PDF) <span style={{ fontWeight: 500, color: "var(--text-tertiary)" }}>· tùy chọn</span></label>
        {file ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", background: "var(--bg-surface)" }}>
            <span style={{ width: 30, height: 30, flexShrink: 0, borderRadius: 7, display: "grid", placeItems: "center", background: "var(--bg-inset)", color: "var(--accent)" }}><L.FileText size={16} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
              <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>{(file.size / 1024).toFixed(0)} KB</div>
            </div>
            <button type="button" onClick={() => { setFile(null); setParsedHtml(null); setParseErr(""); if (fileRef.current) fileRef.current.value = ""; }} title="Bỏ tệp" style={{ width: 28, height: 28, display: "grid", placeItems: "center", border: "1px solid var(--border-default)", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", cursor: "pointer", color: "var(--text-tertiary)" }}><L.X size={15} /></button>
          </div>
        ) : (
          <div onClick={() => fileRef.current && fileRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); if (!dragOver) setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); pick(e.dataTransfer.files && e.dataTransfer.files[0]); }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "16px 14px", border: "1.5px dashed " + (dragOver ? "var(--accent)" : "var(--border-strong)"), borderRadius: "var(--radius-md)", background: dragOver ? "var(--accent-muted)" : "var(--bg-surface)", cursor: "pointer", color: "var(--text-tertiary)" }}>
            <L.UploadCloud size={18} color={dragOver ? "var(--accent)" : "var(--text-tertiary)"} />
            <span style={{ fontSize: 12.5 }}>Kéo-thả tệp vào đây, hoặc <span style={{ color: "var(--accent)", fontWeight: 600 }}>chọn từ máy tính</span> · .docx đọc được nội dung thật, các định dạng khác chỉ lưu tên</span>
          </div>
        )}
        <input ref={fileRef} type="file" accept=".doc,.docx,.pdf,.rtf,.odt" style={{ display: "none" }} onChange={(e) => pick(e.target.files && e.target.files[0])} />
        {parsing && <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: "var(--text-tertiary)" }}><L.Loader size={13} /> Đang đọc nội dung file Word…</div>}
        {parsedHtml && <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: "var(--text-success)" }}><L.CheckCircle2 size={13} /> Đã đọc nội dung thật từ file — sẽ dùng làm nội dung khởi tạo (vào "Cập nhật nội dung" sau khi tạo để đánh dấu trường dữ liệu).</div>}
        {parseErr && <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: "var(--text-warning)" }}><L.AlertTriangle size={13} /> {parseErr}</div>}
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "var(--text-tertiary)" }}>
        <L.Info size={13} style={{ marginTop: 1, flexShrink: 0 }} />
        <span>{(BIEU_MAU_NHOM.find((t) => t.group === group) || {}).desc} — {parsedHtml ? "biểu mẫu mới dùng nội dung đã đọc từ file Word." : "biểu mẫu mới dùng nội dung soạn thảo chung theo loại này."}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Button variant="ghost" onClick={onCancel} disabled={busy}>Hủy</Button>
        <Button variant="primary" icon={L.Check} disabled={!name.trim() || busy || parsing} onClick={() => onAdd(name, group, file ? file.name : null, phi, parsedHtml)}>{busy ? "Đang tạo…" : "Tạo biểu mẫu"}</Button>
      </div>
    </div>
  );
}

/* Xem trước nội dung THẬT của biểu mẫu (blocksFor() cho biểu mẫu chuẩn, hoặc
   noiDung.html đã lưu cho biểu mẫu tùy chỉnh) — chỉ đọc, tái dùng luôn khung
   trang + CSS ".va-quill-page"/".ql-editor" đã có sẵn cho trình soạn thảo thật. */
function TemplatePreviewModal({ tpl, onClose }) {
  const L = window.LucideReact;
  const M = window.VATemplateModel;
  const html = M.htmlOf(tpl);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(28,28,26,.46)" }} />
      <div style={{ position: "relative", width: 720, maxWidth: "100%", maxHeight: "92%", background: "var(--bg-surface)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: "1px solid var(--border-default)", flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-muted)", display: "grid", placeItems: "center" }}><L.Eye size={17} color="var(--accent)" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600 }}>Xem trước biểu mẫu</div>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{tpl.name}</div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 30, height: 30, border: "none", background: "transparent", borderRadius: 7, cursor: "pointer", display: "grid", placeItems: "center", color: "var(--text-tertiary)" }}><L.X size={18} /></button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", minHeight: 0, background: "var(--bg-overlay)", padding: 22 }}>
          <div className="va-quill-page">
            <div className="ql-editor" style={{ padding: "44px 50px" }} dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* Soạn nội dung THẬT cho biểu mẫu tùy chỉnh — tái dùng RichTextEditor (Quill +
   blot "va-field") đã xây cho trình soạn hồ sơ (src/editor.jsx). Đánh dấu
   trường dữ liệu thủ công: bôi đen 1 đoạn rồi gắn nhãn, hoặc để trống con trỏ
   để chèn 1 ô trống mới — cả 2 cách đều lưu origin "empty" vì đây là biểu mẫu
   (chờ auto-fill khi vào phiên thật), không phải nội dung phiên đang soạn dở. */
function TemplateContentEditor({ tpl, onClose, onSaved }) {
  const L = window.LucideReact;
  const { Button } = window.FSICheckinDesignSystem_019df8;
  const M = window.VATemplateModel;
  const RTE = window.VAEditor.RichTextEditor;
  const htmlRef = useTmRef(M.htmlOf(tpl));
  const quillRef = useTmRef(null);
  const importRef = useTmRef(null);
  const [fieldKey, setFieldKey] = useTm("");
  const [customLabel, setCustomLabel] = useTm("");
  const [saving, setSaving] = useTm(false);
  const [importing, setImporting] = useTm(false);
  const [err, setErr] = useTm("");
  const labels = M.VA_FIELD_LABELS;

  const slugify = (label) => {
    const base = label.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    return "custom_" + (base || "truong") + "_" + Math.random().toString(36).slice(2, 6);
  };

  // Đọc lại nội dung THẬT từ 1 file .docx khác (mammoth) — THAY THẾ toàn bộ nội
  // dung đang soạn nên phải xác nhận trước; sau khi thay, phải đánh dấu lại trường.
  const importDocx = async (f) => {
    if (!f) return;
    if (!/\.docx$/i.test(f.name)) { setErr("Chỉ đọc được nội dung từ file .docx (Word mới)"); return; }
    const quill = quillRef.current;
    if (quill && quill.getText().trim().length > 0
      && !window.confirm("Nội dung hiện tại trong khung soạn sẽ bị THAY THẾ bằng nội dung đọc từ file Word (mọi trường đã đánh dấu sẽ mất). Tiếp tục?")) {
      return;
    }
    setImporting(true); setErr("");
    try {
      const form = new FormData();
      form.append("file", f);
      const { html } = await window.VAApi.bieuMau.parseDocx(form);
      quill.setText("");
      quill.clipboard.dangerouslyPasteHTML(0, html);
    } catch (e) {
      setErr(e.message || "Không đọc được nội dung file Word");
    } finally {
      setImporting(false);
      if (importRef.current) importRef.current.value = "";
    }
  };

  const markField = () => {
    setErr("");
    const quill = quillRef.current;
    if (!quill) return;
    if (!fieldKey) { setErr("Chọn 1 trường dữ liệu trước khi đánh dấu"); return; }
    let key = fieldKey, label;
    if (fieldKey === "__custom__") {
      if (!customLabel.trim()) { setErr("Nhập tên trường mới trước khi đánh dấu"); return; }
      label = customLabel.trim();
      key = slugify(label);
    }
    const sel = quill.getSelection(true);
    if (!sel) { setErr("Đặt con trỏ (hoặc bôi đen 1 đoạn) vào vị trí cần đánh dấu trong nội dung trước"); return; }
    const value = { fkey: key, origin: "empty", label };
    if (sel.length > 0) {
      quill.formatText(sel.index, sel.length, "vafield", value);
      quill.setSelection(sel.index + sel.length);
    } else {
      const text = `‹${label || labels[key] || key}›`;
      quill.insertText(sel.index, text, { vafield: value });
      quill.setSelection(sel.index + text.length);
    }
    setFieldKey(""); setCustomLabel("");
  };

  const save = async () => {
    setSaving(true); setErr("");
    try {
      const html = quillRef.current.root.innerHTML;
      await window.VAApi.bieuMau.update(tpl.id, { noiDung: { html } });
      onSaved();
      onClose();
    } catch (e) {
      setErr(e.message || "Không lưu được nội dung");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(28,28,26,.46)" }} />
      <div style={{ position: "relative", width: 780, maxWidth: "100%", maxHeight: "94%", background: "var(--bg-surface)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: "1px solid var(--border-default)", flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-muted)", display: "grid", placeItems: "center" }}><L.FileEdit size={17} color="var(--accent)" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600 }}>Cập nhật nội dung biểu mẫu</div>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{tpl.name}</div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 30, height: 30, border: "none", background: "transparent", borderRadius: 7, cursor: "pointer", display: "grid", placeItems: "center", color: "var(--text-tertiary)" }}><L.X size={18} /></button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderBottom: "1px solid var(--border-subtle)", flexShrink: 0, flexWrap: "wrap" }}>
          <input ref={importRef} type="file" accept=".docx" style={{ display: "none" }} onChange={(e) => importDocx(e.target.files && e.target.files[0])} />
          <Button variant="secondary" size="sm" icon={importing ? L.Loader : L.UploadCloud} disabled={importing} onClick={() => importRef.current && importRef.current.click()}>
            {importing ? "Đang đọc…" : "Tải nội dung từ file Word (.docx)"}
          </Button>
          <span style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>Đọc nội dung thật từ file — thay thế toàn bộ nội dung đang soạn.</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", flexShrink: 0, flexWrap: "wrap" }}>
          <L.Tag size={14} color="var(--text-secondary)" />
          <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>Đánh dấu trường dữ liệu:</span>
          <select value={fieldKey} onChange={(e) => setFieldKey(e.target.value)} style={{ height: 32, border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", background: "var(--bg-surface)", fontSize: 12.5, padding: "0 8px", fontFamily: "var(--font-sans)" }}>
            <option value="">— Chọn trường —</option>
            {Object.entries(labels).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            <option value="__custom__">+ Trường mới…</option>
          </select>
          {fieldKey === "__custom__" && (
            <input value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} placeholder="Tên trường mới, vd: Số hợp đồng gốc"
              style={{ height: 32, border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "0 10px", fontSize: 12.5, background: "var(--bg-surface)", fontFamily: "var(--font-sans)", width: 200 }} />
          )}
          <Button variant="secondary" size="sm" icon={L.Tag} onClick={markField}>Đánh dấu</Button>
          <span style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginLeft: "auto" }}>Bôi đen 1 đoạn để gắn nhãn vào đó, hoặc để trống con trỏ để chèn 1 ô mới.</span>
        </div>

        {err && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text-danger, #d92d20)", background: "var(--bg-danger, rgba(217,45,32,.06))", borderBottom: "1px solid var(--border-danger, #f1aca5)", padding: "8px 18px", flexShrink: 0 }}>
            <L.AlertCircle size={14} /> {err}
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", minHeight: 0, background: "var(--bg-overlay)", padding: 22 }}>
          <div className="va-quill-page">
            <RTE html={htmlRef.current} readOnly={false} compact={false} onReady={(q) => { quillRef.current = q; }} />
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border-default)", padding: "14px 18px", display: "flex", gap: 10, flexShrink: 0 }}>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Hủy</Button>
          <Button variant="primary" icon={saving ? L.Loader : L.Check} fullWidth disabled={saving} onClick={save}>{saving ? "Đang lưu…" : "Lưu nội dung"}</Button>
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ tpl, onRename, onDelete, onPreview, onEditContent }) {
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
              <input value={name} onChange={(e) => setName(e.target.value)} autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") { onRename(tpl.id, name); setEditing(false); } if (e.key === "Escape") { setName(tpl.name); setEditing(false); } }}
                style={{ flex: 1, border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "7px 10px", fontFamily: "var(--font-sans)", fontSize: 13.5, background: "var(--bg-inset)", color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }} />
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
            {tpl.phiMacDinh != null && <span style={{ fontSize: 12, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>{Number(tpl.phiMacDinh).toLocaleString("vi-VN")}đ</span>}
            <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{keys.length} ô dữ liệu</span>
          </div>
        </div>
        {!editing && (
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            <button type="button" onClick={() => onPreview(tpl)} title="Xem trước" style={iconBtn("var(--text-secondary)")}><L.Eye size={15} /></button>
            {!tpl.builtin && (
              <>
                <button type="button" onClick={() => onEditContent(tpl)} title="Cập nhật nội dung" style={iconBtn("var(--text-secondary)")}><L.FileEdit size={15} /></button>
                <button type="button" onClick={() => setEditing(true)} title="Đổi tên" style={iconBtn("var(--text-secondary)")}><L.Pencil size={15} /></button>
                <button type="button" onClick={() => setConfirming(true)} title="Xóa biểu mẫu" style={iconBtn("var(--text-danger, #d92d20)")}><L.Trash2 size={15} /></button>
              </>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {keys.slice(0, 8).map((k, i) => <TmField key={i} label={k.label} />)}
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
          <span style={{ flex: 1, fontSize: 12.5, color: "var(--text-secondary)" }}>Xóa biểu mẫu "{tpl.name}"?</span>
          <button type="button" onClick={() => setConfirming(false)} style={{ ...textBtn(), color: "var(--text-tertiary)" }}>Hủy</button>
          <button type="button" onClick={() => { setConfirming(false); onDelete(tpl.id); }} style={{ ...textBtn(), color: "var(--text-danger, #d92d20)", fontWeight: 600 }}>Xóa</button>
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

function TemplateManager() {
  const L = window.LucideReact;
  const { Button } = window.FSICheckinDesignSystem_019df8;
  const [templates, setTemplates] = useTm([]);
  const [loading, setLoading] = useTm(true);
  const [error, setError] = useTm("");
  const [adding, setAdding] = useTm(false);
  const [busy, setBusy] = useTm(false);
  const [previewing, setPreviewing] = useTm(null);
  const [editingContent, setEditingContent] = useTm(null);

  const load = () => {
    window.VAApi.bieuMau.list()
      .then((rows) => setTemplates(rows.map((r) => ({ id: r.id, name: r.ten, group: r.nhom || "Ủy quyền", phiMacDinh: r.phiMacDinh, builtin: r.builtin, fileName: r.tenFile, noiDung: r.noiDung }))))
      .catch((e) => setError(e.message || "Không tải được danh sách biểu mẫu"))
      .finally(() => setLoading(false));
  };
  useTmEffect(() => { load(); }, []);

  const add = async (name, group, fileName, phi, parsedHtml) => {
    setBusy(true);
    setError("");
    try {
      await window.VAApi.bieuMau.create({ ten: name, nhom: group, phiMacDinh: phi ? Number(phi) : null, tenFile: fileName || null, noiDung: parsedHtml ? { html: parsedHtml } : undefined });
      setAdding(false);
      load();
    } catch (e) {
      setError(e.message || "Không tạo được biểu mẫu");
    } finally {
      setBusy(false);
    }
  };
  const rename = async (id, name) => {
    setError("");
    try { await window.VAApi.bieuMau.update(id, { ten: name }); load(); }
    catch (e) { setError(e.message || "Không đổi được tên biểu mẫu"); }
  };
  const remove = async (id) => {
    setError("");
    try { await window.VAApi.bieuMau.remove(id); load(); }
    catch (e) { setError(e.message || "Không xóa được biểu mẫu"); }
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 32px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Biểu mẫu soạn thảo</h1>
            <p style={{ fontSize: 13.5, color: "var(--text-tertiary)", margin: "4px 0 0" }}>
              Quản lý kho biểu mẫu hợp đồng — thêm, đổi tên, xóa. Biểu mẫu chuẩn (mặc định) không sửa/xóa được tại đây.
            </p>
          </div>
          {!adding && <Button variant="primary" icon={L.Plus} onClick={() => setAdding(true)}>Thêm biểu mẫu</Button>}
        </div>

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text-danger, #d92d20)", background: "var(--bg-danger, rgba(217,45,32,.06))", border: "1px solid var(--border-danger, #f1aca5)", borderRadius: "var(--radius-md)", padding: "9px 12px" }}>
            <L.AlertCircle size={15} /> {error}
            <button type="button" onClick={() => setError("")} style={{ marginLeft: "auto", border: "none", background: "transparent", cursor: "pointer", color: "inherit" }}><L.X size={14} /></button>
          </div>
        )}

        {adding && <AddForm onAdd={add} onCancel={() => setAdding(false)} busy={busy} />}

        {loading ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>Đang tải…</div>
        ) : (
          BIEU_MAU_NHOM.map((ty) => {
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
                    <TemplateCard key={t.id} tpl={t} onRename={rename} onDelete={remove} onPreview={setPreviewing} onEditContent={setEditingContent} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {previewing && <TemplatePreviewModal tpl={previewing} onClose={() => setPreviewing(null)} />}
      {editingContent && <TemplateContentEditor tpl={editingContent} onClose={() => setEditingContent(null)} onSaved={load} />}
    </div>
  );
}

window.VATemplateManager = TemplateManager;
