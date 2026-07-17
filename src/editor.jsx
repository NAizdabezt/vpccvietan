/* global React, window, document */
/* Trình soạn thảo hợp đồng — nhúng Quill (rich-text thật, soạn thảo tự do như
   Word) + OCR tự động điền vào ô dữ liệu (span "va-field", kéo-thả được).
   Bản mẫu (blocksFor/blocksToHtml — src/templates-data.jsx) chỉ sinh HTML KHỞI
   TẠO 1 lần khi mở tab; sau đó nội dung sống trong Quill, không đọc lại mẫu nữa. */
const { useState: useEd, useRef: useRefEd, useEffect: useEffEd } = React;

/* Đăng ký định dạng "va-field" với Quill (1 lần, trước khi tạo instance nào) —
   BẮT BUỘC, vì Quill chỉ giữ lại wrapper <span> khi parse HTML nếu nó khớp một
   Blot đã đăng ký; span tùy ý không đăng ký sẽ bị Quill bóc bỏ, chỉ còn lại chữ. */
(function registerFieldBlot() {
  if (window.__vaFieldBlotRegistered || !window.Quill) return;
  const Inline = window.Quill.import("blots/inline");
  class FieldBlot extends Inline {
    static create(value) {
      const node = super.create();
      if (value && value.fkey) node.setAttribute("data-fkey", value.fkey);
      node.setAttribute("data-origin", (value && value.origin) || "empty");
      // data-label: chỉ cần cho trường TỰ ĐẶT khi soạn nội dung biểu mẫu (chưa có
      // trong VA_FIELD_LABELS) — trường chuẩn đã có nhãn tra theo fkey, không cần lưu thêm.
      if (value && value.label) node.setAttribute("data-label", value.label);
      return node;
    }
    static formats(node) {
      const f = { fkey: node.getAttribute("data-fkey"), origin: node.getAttribute("data-origin") };
      const label = node.getAttribute("data-label");
      if (label) f.label = label;
      return f;
    }
  }
  FieldBlot.blotName = "vafield";
  FieldBlot.tagName = "span";
  FieldBlot.className = "va-field";
  window.Quill.register(FieldBlot, true);
  window.__vaFieldBlotRegistered = true;
})();

/* ====== Nhúng 1 instance Quill quanh 1 <div> — mount 1 lần/tab, giữ nguyên khi đổi tab ====== */
function RichTextEditor({ html, readOnly, compact, onReady, onChange }) {
  const mountRef = useRefEd(null);
  const quillRef = useRefEd(null);

  useEffEd(() => {
    const quill = new window.Quill(mountRef.current, {
      theme: "snow",
      readOnly: !!readOnly,
      modules: {
        toolbar: [
          [{ header: [false, 2, 3] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ align: [] }],
          ["clean"],
        ],
        history: { delay: 500, maxStack: 200, userOnly: true },
      },
    });
    quill.root.innerHTML = html;
    quill.root.style.padding = compact ? "30px 34px" : "44px 50px";
    quillRef.current = quill;

    // Đánh dấu 1 ô "va-field" thành đã sửa tay ngay khi người dùng gõ vào trong nó —
    // từ lúc đó ô không còn bị "Điền lại từ OCR" ghi đè nữa (giống mail-merge thật).
    const markManualAtSelection = () => {
      const sel = quill.getSelection();
      if (!sel) return;
      const [leaf] = quill.getLeaf(sel.index);
      const node = leaf && leaf.domNode;
      if (!node) return;
      const el = node.nodeType === 1 ? node.closest(".va-field") : node.parentElement && node.parentElement.closest(".va-field");
      if (el && el.dataset.origin !== "manual") el.dataset.origin = "manual";
    };
    const onTextChange = (delta, oldDelta, source) => {
      if (source === "user") markManualAtSelection();
      onChange && onChange();
    };
    quill.on("text-change", onTextChange);

    if (onReady) onReady(quill);
    return () => { quill.off("text-change", onTextChange); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffEd(() => { if (quillRef.current) quillRef.current.enable(!readOnly); }, [readOnly]);

  return <div ref={mountRef} />;
}

/* Cột trái: trường OCR — kéo-thả hoặc bấm để điền vào ô khớp */
function FieldRail({ ocrDocs, onInsertField, activeKeys }) {
  const L = window.LucideReact;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 11.5, color: "var(--text-tertiary)", lineHeight: 1.4 }}>
        <L.MousePointerClick size={13} style={{ marginTop: 1, flexShrink: 0 }} /> Kéo-thả vào ô trống hoặc bất kỳ vị trí nào trong văn bản, hoặc bấm để điền vào ô khớp.
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
                    title={f.label + ": " + f.value + (used ? " · bấm để điền vào ô tương ứng" : " · kéo-thả vào văn bản")}
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

function DraftPage({ tpl, active, compact, readOnly, drafter, initialHtml, onReady, onChange }) {
  const M = window.VATemplateModel;
  const htmlRef = useRefEd(null);
  // Ưu tiên nội dung đã soạn LƯU CHO HỒ SƠ NÀY (initialHtml, từ HoSo.noiDungDaSoan)
  // — khác tầng với M.htmlOf(tpl) (nội dung MẪU dùng chung, không gắn hồ sơ cụ thể).
  if (htmlRef.current === null) htmlRef.current = initialHtml || M.htmlOf(tpl);
  const ident = (drafter && drafter.ident) || "";

  return (
    <div style={{ display: active ? "block" : "none", flex: 1, overflowY: "auto", background: "var(--bg-overlay)", padding: compact ? 14 : 22, minHeight: 0 }}>
      <div className="va-quill-page">
        <RichTextEditor html={htmlRef.current} readOnly={readOnly} compact={compact}
          onReady={(quill) => onReady(tpl.id, quill)} onChange={() => onChange(tpl.id)} />
        <div title="Ký tự định danh người soạn" style={{ padding: (compact ? "10px 34px 22px" : "10px 50px 26px"), borderTop: "1px solid #e7e7e3", display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: 6, fontSize: 11.5, color: "#9a9a93" }}>
          <span>Người soạn:</span>
          <span style={{ fontWeight: 700, letterSpacing: ".12em", color: "#5b5b54" }}>{ident || "—"}</span>
        </div>
      </div>
    </div>
  );
}

/* Điền các ô "va-field" còn trống (data-origin="empty") khớp với autoMap — không
   bao giờ đè ô người dùng đã gõ tay (data-origin="manual"). */
function fillEmptyFields(quill, autoMap) {
  if (!quill) return;
  const spans = quill.root.querySelectorAll('.va-field[data-origin="empty"], .va-field[data-origin="auto"]');
  spans.forEach((el) => {
    const fkey = el.getAttribute("data-fkey");
    const am = autoMap[fkey];
    if (am && el.textContent !== am.value) {
      el.textContent = am.value;
      el.dataset.origin = "auto";
    }
  });
}

function DraftWorkspace({ tabs, ocrDocs, compact, onAddTemplate, addOptions, readOnly, drafter, savedHtml, onContentChange }) {
  const L = window.LucideReact;
  const M = window.VATemplateModel;
  const [active, setActive] = useEd(tabs[0] ? tabs[0].id : null);
  const [menu, setMenu] = useEd(false);
  const [tick, setTick] = useEd(0);
  const quillRefs = useRefEd({});

  const autoMap = M.buildAutoMap(ocrDocs);
  const autoSig = JSON.stringify(autoMap);
  const tabsSig = tabs.map((t) => t.id).join(",");

  React.useEffect(() => { if (!tabs.find((t) => t.id === active) && tabs[0]) setActive(tabs[0].id); }, [tabsSig]);

  // OCR cập nhật (hoặc có tab mới) -> điền lại các ô còn trống ở MỌI tab đã mount
  useEffEd(() => {
    Object.values(quillRefs.current).forEach((q) => fillEmptyFields(q, autoMap));
    setTick((t) => t + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSig, tabsSig]);

  const onTabReady = (tabId, quill) => {
    quillRefs.current[tabId] = quill;
    fillEmptyFields(quill, autoMap);
    setTick((t) => t + 1);
    if (onContentChange) onContentChange(tabId, quill.root.innerHTML);
  };
  // Đẩy nội dung mới nhất lên FlowA mỗi khi Quill đổi — chỉ giữ trong state ở
  // FlowA (rẻ), KHÔNG gọi API ở đây; việc lưu backend chỉ chạy ở các mốc rõ ràng
  // ("Lưu nháp", trước khi in) để tránh gọi API mỗi lần gõ phím.
  const onTabChange = (tabId) => {
    setTick((t) => t + 1);
    const q = quillRefs.current[tabId];
    if (onContentChange && q) onContentChange(tabId, q.root.innerHTML);
  };

  const activeQuill = quillRefs.current[active];

  // Kéo-thả / bấm từ cột trái vào đúng vị trí trong Quill của tab đang mở
  const insertValueAtDrop = (quill, value, clientX, clientY) => {
    const targetEl = document.elementFromPoint(clientX, clientY);
    const fieldEl = targetEl && targetEl.closest && targetEl.closest(".va-field");
    if (fieldEl && fieldEl.dataset.origin !== "manual") {
      fieldEl.textContent = value;
      fieldEl.dataset.origin = "manual";
      onTabChange();
      return;
    }
    let range = null;
    if (document.caretRangeFromPoint) range = document.caretRangeFromPoint(clientX, clientY);
    else if (document.caretPositionFromPoint) {
      const pos = document.caretPositionFromPoint(clientX, clientY);
      if (pos) { range = document.createRange(); range.setStart(pos.offsetNode, pos.offset); }
    }
    if (range && quill.root.contains(range.startContainer)) {
      range.collapse(true);
      range.insertNode(document.createTextNode(value));
    }
    onTabChange();
  };

  React.useEffect(() => {
    const quill = activeQuill;
    if (!quill || readOnly) return undefined;
    const root = quill.root;
    const onDragOver = (e) => e.preventDefault();
    const onDrop = (e) => {
      e.preventDefault();
      const ocrRaw = e.dataTransfer.getData("va/ocr");
      let payload = null;
      try { payload = ocrRaw ? JSON.parse(ocrRaw) : null; } catch (err) { /* ignore */ }
      const value = payload ? payload.value : e.dataTransfer.getData("text/plain");
      if (value) insertValueAtDrop(quill, value, e.clientX, e.clientY);
    };
    root.addEventListener("dragover", onDragOver);
    root.addEventListener("drop", onDrop);
    return () => { root.removeEventListener("dragover", onDragOver); root.removeEventListener("drop", onDrop); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuill, readOnly]);

  const activeKeys = activeQuill
    ? Array.from(activeQuill.root.querySelectorAll(".va-field")).map((el) => el.getAttribute("data-fkey"))
    : [];

  const insertField = (f) => {
    if (readOnly || !activeQuill) return;
    const root = activeQuill.root;
    const exact = f.fkey && root.querySelector(`.va-field[data-fkey="${f.fkey}"]`);
    const target = (exact && exact.dataset.origin !== "manual") ? exact : root.querySelector('.va-field[data-origin="empty"]');
    if (target) { target.textContent = f.value; target.dataset.origin = "manual"; onTabChange(); }
  };

  const reapplyAuto = () => { if (!readOnly && activeQuill) { fillEmptyFields(activeQuill, autoMap); onTabChange(); } };

  let totalFields = 0, filledCount = 0, autoCount = 0;
  if (activeQuill) {
    activeQuill.root.querySelectorAll(".va-field").forEach((el) => {
      totalFields++;
      if (el.dataset.origin !== "empty") filledCount++;
      if (el.dataset.origin === "auto") autoCount++;
    });
  }

  const vpEd = window.VAUi.useViewport();
  const narrowEd = vpEd !== "desktop"; // màn hẹp: dải trường chèn nằm ngang phía trên editor
  return (
    <div style={narrowEd
      ? { display: "grid", gridTemplateRows: "170px minmax(0,1fr)", gap: 12, alignItems: "stretch", minHeight: 0 }
      : { display: "grid", gridTemplateColumns: "260px 1fr", gap: 16, alignItems: "stretch", minHeight: 0 }}>
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
            initialHtml={savedHtml && savedHtml[t.id]} onReady={onTabReady} onChange={onTabChange} />
        ))}
      </div>
    </div>
  );
}

window.VAEditor = { DraftWorkspace, RichTextEditor };
