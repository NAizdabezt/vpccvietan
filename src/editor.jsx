/* global React, window, document */
/* Trình soạn thảo hợp đồng — OCR tự động điền vào ô dữ liệu, cho sửa & kéo-thả qua lại */
const { useState: useEd, useRef: useRefEd, useEffect: useEffEd } = React;

function EditorToolbar() {
  const L = window.LucideReact;
  const groups = [["Undo2", "Redo2"], ["Bold", "Italic", "Underline"], ["List", "ListOrdered"], ["AlignLeft", "AlignCenter", "AlignJustify"]];
  const Btn = ({ icon }) => {
    const Icon = L[icon];
    return (
      <button type="button" style={{ width: 28, height: 28, display: "grid", placeItems: "center", border: "none", background: "transparent", borderRadius: 6, color: "var(--text-secondary)", cursor: "pointer" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-overlay)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
        <Icon size={15} />
      </button>
    );
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", flexWrap: "wrap" }}>
      <select style={{ height: 28, border: "1px solid var(--border-default)", borderRadius: 6, background: "var(--bg-surface)", fontSize: 12.5, color: "var(--text-secondary)", padding: "0 6px", fontFamily: "var(--font-sans)" }}>
        <option>Times New Roman · 13pt</option>
      </select>
      {groups.map((g, i) => (
        <React.Fragment key={i}>
          <span style={{ width: 1, height: 18, background: "var(--border-subtle)", margin: "0 2px" }} />
          {g.map((ic) => <Btn key={ic} icon={ic} />)}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ====== Ô dữ liệu (field cell): sửa trực tiếp · kéo-thả vào · kéo-thả qua lại ====== */
function FieldCell({ fkey, label, cell, mono, readOnly, onEdit, onClear, onCellDrop, dragStartCell }) {
  const L = window.LucideReact;
  const value = cell ? cell.value : "";
  const origin = cell ? cell.origin : null;
  const filled = !!value;
  const [editing, setEditing] = useEd(false);
  const [draft, setDraft] = useEd("");
  const [over, setOver] = useEd(false);
  const inputRef = useRefEd(null);

  useEffEd(() => { if (editing && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); } }, [editing]);

  const begin = () => { if (readOnly) return; setDraft(value); setEditing(true); };
  const commit = () => { setEditing(false); onEdit(draft); };

  const dropProps = readOnly ? {} : {
    onDragOver: (e) => { e.preventDefault(); if (!over) setOver(true); },
    onDragLeave: () => setOver(false),
    onDrop: (e) => { e.preventDefault(); setOver(false); onCellDrop(e); },
  };

  if (editing) {
    return (
      <input ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } if (e.key === "Escape") setEditing(false); }}
        style={{ font: "inherit", fontFamily: mono ? "var(--font-mono)" : "inherit", minWidth: 44, width: Math.max(6, (draft.length || label.length)) + "ch", padding: "0 5px", border: "1.5px solid var(--accent)", borderRadius: 4, background: "#fff", outline: "none", verticalAlign: "baseline" }} />
    );
  }

  const base = { display: "inline", borderRadius: 4, padding: "1px 5px", whiteSpace: "pre-wrap", verticalAlign: "baseline", transition: "background .1s, box-shadow .1s" };

  if (!filled) {
    return (
      <span {...dropProps} onClick={begin} title="Bấm để nhập — hoặc kéo-thả dữ liệu OCR vào đây"
        style={{ ...base, color: "var(--text-tertiary)", fontStyle: "italic", cursor: readOnly ? "default" : "text",
          background: over ? "var(--accent-muted)" : "transparent",
          boxShadow: "inset 0 0 0 1px " + (over ? "var(--accent)" : "var(--border-strong)") }}>
        ‹{label}›
      </span>
    );
  }

  const tone = origin === "auto"
    ? { bg: "var(--bg-success)", fg: "var(--text-primary)", bd: "var(--border-success)" }
    : { bg: "var(--accent-muted)", fg: "var(--accent-hover)", bd: "var(--accent-border)" };

  return (
    <span {...dropProps}
      draggable={!readOnly}
      onDragStart={(e) => { if (readOnly) return; e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("va/cell", JSON.stringify({ key: fkey })); e.dataTransfer.setData("text/plain", value); dragStartCell && dragStartCell(); }}
      style={{ ...base, fontFamily: mono ? "var(--font-mono)" : "inherit", fontWeight: 600,
        color: tone.fg, background: over ? "var(--accent-muted)" : tone.bg,
        boxShadow: "inset 0 0 0 1px " + (over ? "var(--accent)" : tone.bd),
        cursor: readOnly ? "default" : "grab" }}
      title={readOnly ? value : label + " — kéo để chuyển sang ô khác, bấm để sửa"}>
      <span onClick={begin} style={{ cursor: readOnly ? "default" : "text" }}>{value}</span>
      {!readOnly && (
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={onClear} title="Xóa giá trị"
          style={{ border: "none", background: "transparent", cursor: "pointer", padding: "0 0 0 4px", lineHeight: 0, color: "inherit", opacity: .5, verticalAlign: "middle" }}>
          <L.X size={11} />
        </button>
      )}
    </span>
  );
}

const BLOCK_STYLE = {
  dt: { textAlign: "center", fontWeight: 700, textTransform: "uppercase", margin: "0 0 4px" },
  dm: { textAlign: "center", fontStyle: "italic", color: "#7a7a72", margin: "0 0 18px" },
  dh: { fontWeight: 700, margin: "18px 0 4px" },
  p: { margin: "0 0 8px" },
  ds: { fontStyle: "italic", margin: "18px 0 0", color: "#5b5b54" },
};

function DraftPage({ tpl, active, compact, readOnly, drafter, tabVals, onEditCell, onClearCell, onDropCell }) {
  const M = window.VATemplateModel;
  const blocks = M.blocksFor(tpl);
  const ident = (drafter && drafter.ident) || "";

  const renderParts = (parts) => parts.map((p, i) => {
    if (typeof p === "string") return <React.Fragment key={i}>{p}</React.Fragment>;
    const cell = tabVals[p.f];
    return (
      <FieldCell key={i} fkey={p.f} label={p.label} cell={cell} mono={cell && cell.mono} readOnly={readOnly}
        onEdit={(v) => onEditCell(p.f, v)} onClear={() => onClearCell(p.f)}
        onCellDrop={(e) => onDropCell(p.f, e)} />
    );
  });

  return (
    <div style={{ display: active ? "block" : "none", flex: 1, overflowY: "auto", background: "var(--bg-overlay)", padding: compact ? 14 : 22, minHeight: 0 }}>
      <div className="va-a4" style={{
        maxWidth: 660, margin: "0 auto", background: "#fff", border: "1px solid var(--border-subtle)",
        boxShadow: "var(--shadow-sm)", padding: compact ? "30px 34px" : "44px 50px",
        fontFamily: "'Times New Roman', Times, serif", color: "var(--text-primary)", minHeight: 600,
        fontSize: 14.5, lineHeight: 2,
      }}>
        {blocks.map((b, bi) => {
          const st = BLOCK_STYLE[b.tag] || BLOCK_STYLE.p;
          if (b.tag === "dt") return <h2 key={bi} style={{ ...st, fontSize: compact ? 16 : 18, lineHeight: 1.3 }}>{renderParts(b.parts)}</h2>;
          return <p key={bi} style={st}>{renderParts(b.parts)}</p>;
        })}
        <div title="Ký tự định danh người soạn" style={{ marginTop: 26, paddingTop: 10, borderTop: "1px solid #e7e7e3", display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: 6, fontSize: 11.5, color: "#9a9a93" }}>
          <span>Người soạn:</span>
          <span style={{ fontWeight: 700, letterSpacing: ".12em", color: "#5b5b54" }}>{ident || "—"}</span>
        </div>
      </div>
    </div>
  );
}

/* Cột trái: trường OCR — kéo-thả hoặc bấm để điền vào ô khớp */
function FieldRail({ ocrDocs, onInsertField, activeKeys }) {
  const L = window.LucideReact;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 11.5, color: "var(--text-tertiary)", lineHeight: 1.4 }}>
        <L.MousePointerClick size={13} style={{ marginTop: 1, flexShrink: 0 }} /> Kéo-thả vào ô bất kỳ, hoặc bấm để điền vào ô khớp.
      </div>
      {ocrDocs.map((doc) => {
        const Icon = L[doc.icon] || L.File;
        return (
          <div key={doc.id} style={{ border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--bg-surface)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 10px", background: "var(--bg-elevated)", borderBottom: "1px solid var(--border-subtle)" }}>
              <Icon size={13} color="var(--accent)" />
              <span style={{ fontSize: 12, fontWeight: 600 }}>{doc.name}</span>
            </div>
            <div style={{ padding: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {doc.fields.map((f, fi) => {
                const used = f.fkey && activeKeys.includes(f.fkey);
                return (
                  <button key={fi} type="button" draggable
                    onDragStart={(e) => { e.dataTransfer.effectAllowed = "copy"; e.dataTransfer.setData("text/plain", f.value); e.dataTransfer.setData("va/ocr", JSON.stringify({ fkey: f.fkey, value: f.value, mono: !!f.mono })); }}
                    onClick={() => onInsertField(f)}
                    title={f.label + ": " + f.value + (used ? " · bấm để điền vào ô tương ứng" : " · kéo-thả vào ô bất kỳ")}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 5, maxWidth: "100%", cursor: "grab",
                      border: "1px solid " + (used ? "var(--accent-border)" : "var(--border-default)"),
                      borderRadius: "var(--radius-full)", padding: "4px 9px",
                      background: used ? "var(--accent-muted)" : "var(--bg-surface)", fontFamily: "var(--font-sans)", fontSize: 11.5,
                      color: used ? "var(--accent-hover)" : "var(--text-secondary)",
                    }}>
                    <L.GripVertical size={11} style={{ opacity: .5 }} />
                    <span style={{ fontWeight: 600 }}>{f.label}:</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 110, fontFamily: f.mono ? "var(--font-mono)" : "inherit" }}>{f.value}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DraftWorkspace({ tabs, ocrDocs, compact, onAddTemplate, addOptions, readOnly, drafter }) {
  const L = window.LucideReact;
  const M = window.VATemplateModel;
  const { Button } = window.FSICheckinDesignSystem_019df8;
  const [active, setActive] = useEd(tabs[0] ? tabs[0].id : null);
  const [menu, setMenu] = useEd(false);
  const [vals, setVals] = useEd({}); // { [tabId]: { [fkey]: {value, origin, mono} } }

  const autoMap = M.buildAutoMap(ocrDocs);
  const autoSig = JSON.stringify(autoMap);
  const tabsSig = tabs.map((t) => t.id).join(",");

  // Tự động điền: chỉ điền ô đang trống hoặc ô do auto điền trước đó (không đè giá trị người dùng đã sửa)
  useEffEd(() => {
    setVals((prev) => {
      const next = { ...prev };
      tabs.forEach((tab) => {
        const keys = M.fieldKeysOf(tab);
        const cur = { ...(next[tab.id] || {}) };
        keys.forEach((k) => {
          const am = autoMap[k];
          if (am && (!cur[k] || cur[k].origin === "auto")) cur[k] = { value: am.value, mono: am.mono, origin: "auto" };
        });
        next[tab.id] = cur;
      });
      return next;
    });
  }, [autoSig, tabsSig]);

  React.useEffect(() => { if (!tabs.find((t) => t.id === active) && tabs[0]) setActive(tabs[0].id); }, [tabsSig]);

  const setVal = (tabId, fkey, value, origin, mono) => setVals((prev) => {
    const t = { ...(prev[tabId] || {}) };
    if (value) t[fkey] = { value, origin: origin || "manual", mono: mono != null ? mono : (t[fkey] && t[fkey].mono) };
    else delete t[fkey];
    return { ...prev, [tabId]: t };
  });

  const swapCells = (tabId, srcKey, dstKey) => setVals((prev) => {
    const t = { ...(prev[tabId] || {}) };
    const a = t[srcKey], b = t[dstKey];
    if (a) t[dstKey] = { ...a, origin: "manual" }; else delete t[dstKey];
    if (b) t[srcKey] = { ...b, origin: "manual" }; else delete t[srcKey];
    return { ...prev, [tabId]: t };
  });

  const onEditCell = (fkey, v) => setVal(active, fkey, v.trim(), "manual");
  const onClearCell = (fkey) => setVal(active, fkey, "");
  const onDropCell = (dstKey, e) => {
    const cellRaw = e.dataTransfer.getData("va/cell");
    if (cellRaw) { try { const { key } = JSON.parse(cellRaw); if (key && key !== dstKey) swapCells(active, key, dstKey); } catch (err) { /* */ } return; }
    const ocrRaw = e.dataTransfer.getData("va/ocr");
    if (ocrRaw) { try { const o = JSON.parse(ocrRaw); setVal(active, dstKey, o.value, "manual", o.mono); return; } catch (err) { /* */ } }
    const txt = e.dataTransfer.getData("text/plain");
    if (txt) setVal(active, dstKey, txt, "manual");
  };

  const activeTab = tabs.find((t) => t.id === active) || tabs[0];
  const activeKeys = activeTab ? M.fieldKeysOf(activeTab) : [];
  const tabVals = vals[active] || {};

  const insertField = (f) => {
    if (readOnly || !activeTab) return;
    if (f.fkey && activeKeys.includes(f.fkey)) { setVal(active, f.fkey, f.value, "manual", f.mono); return; }
    const emptyKey = activeKeys.find((k) => !(tabVals[k] && tabVals[k].value));
    if (emptyKey) setVal(active, emptyKey, f.value, "manual", f.mono);
  };

  const reapplyAuto = () => {
    if (readOnly || !activeTab) return;
    setVals((prev) => {
      const cur = { ...(prev[active] || {}) };
      activeKeys.forEach((k) => { if (autoMap[k]) cur[k] = { value: autoMap[k].value, mono: autoMap[k].mono, origin: "auto" }; });
      return { ...prev, [active]: cur };
    });
  };

  const totalFields = activeKeys.length;
  const filledCount = activeKeys.filter((k) => tabVals[k] && tabVals[k].value).length;
  const autoCount = activeKeys.filter((k) => tabVals[k] && tabVals[k].origin === "auto" && tabVals[k].value).length;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16, alignItems: "stretch", minHeight: 0 }}>
      <div style={{ overflowY: "auto", minHeight: 0, paddingRight: 2 }}>
        <FieldRail ocrDocs={ocrDocs} onInsertField={insertField} activeKeys={activeKeys} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", minHeight: 0, background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        {/* Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "6px 8px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-base)", position: "relative", flexWrap: "wrap" }}>
          {tabs.map((t) => {
            const on = t.id === active;
            return (
              <button key={t.id} type="button" onClick={() => setActive(t.id)} style={{
                display: "flex", alignItems: "center", gap: 7, padding: "7px 12px", border: "none", cursor: "pointer",
                borderRadius: "var(--radius-md) var(--radius-md) 0 0", fontFamily: "var(--font-sans)", fontSize: 12.5,
                fontWeight: on ? 600 : 500, color: on ? "var(--accent)" : "var(--text-tertiary)",
                background: on ? "var(--accent-muted)" : "transparent",
                borderBottom: on ? "2px solid var(--accent)" : "2px solid transparent",
              }}>
                <L.FileText size={14} /> {t.name}
              </button>
            );
          })}
          <div style={{ position: "relative", marginLeft: 4 }}>
            {!readOnly && <button type="button" onClick={() => setMenu(!menu)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 10px", border: "1px dashed var(--border-strong)", borderRadius: "var(--radius-md)", background: "transparent", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
              <L.Plus size={14} /> Thêm biểu mẫu
            </button>}
            {menu && addOptions.length > 0 && (
              <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 20, minWidth: 220, background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)", padding: 4 }}>
                {addOptions.map((o) => (
                  <button key={o.id} type="button" onClick={() => { onAddTemplate(o.id); setMenu(false); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px", border: "none", background: "transparent", cursor: "pointer", borderRadius: 6, textAlign: "left", fontFamily: "var(--font-sans)", fontSize: 12.5, color: "var(--text-primary)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-overlay)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <L.FilePlus size={14} color="var(--accent)" /><span style={{ flex: 1 }}>{o.name}</span><span style={{ fontSize: 10.5, color: "var(--text-tertiary)" }}>{o.group}</span>
                  </button>
                ))}
              </div>
            )}
            {menu && addOptions.length === 0 && (
              <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 20, minWidth: 200, background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)", padding: "10px 12px", fontSize: 12, color: "var(--text-tertiary)" }}>
                Đã thêm tất cả biểu mẫu.
              </div>
            )}
          </div>
        </div>
        <EditorToolbar />
        {/* Thanh trạng thái tự động điền */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", background: autoCount ? "var(--bg-success)" : "var(--bg-elevated)", borderBottom: "1px solid var(--border-subtle)", fontSize: 12.5 }}>
          {autoCount ? <L.Sparkles size={15} color="var(--text-success)" /> : <L.Info size={15} color="var(--text-tertiary)" />}
          <span style={{ color: autoCount ? "var(--text-success)" : "var(--text-secondary)", fontWeight: 500 }}>
            {autoCount > 0
              ? "OCR đã tự động điền " + autoCount + " trường — kiểm tra & sửa nếu cần."
              : "Chưa có dữ liệu OCR để tự điền — nhập tay hoặc kéo-thả từ cột trái."}
          </span>
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11.5, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>{filledCount}/{totalFields} ô</span>
            {!readOnly && <button type="button" onClick={reapplyAuto} style={{ display: "inline-flex", alignItems: "center", gap: 5, border: "1px solid var(--border-default)", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", padding: "4px 9px", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 11.5, fontWeight: 600, color: "var(--text-secondary)" }}>
              <L.RefreshCw size={12} /> Điền lại từ OCR
            </button>}
          </span>
        </div>
        {tabs.map((t) => (
          <DraftPage key={t.id} tpl={t} active={t.id === active} compact={compact} readOnly={readOnly} drafter={drafter}
            tabVals={vals[t.id] || {}} onEditCell={onEditCell} onClearCell={onClearCell} onDropCell={onDropCell} />
        ))}
      </div>
    </div>
  );
}

window.VAEditor = { DraftWorkspace, EditorToolbar };
