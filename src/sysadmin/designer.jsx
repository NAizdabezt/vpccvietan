/* global React, window */
/* PH05 — Thiết kế luồng nghiệp vụ (canvas kéo-thả, lưu THẬT qua API).
   Mỗi NHÓM biểu mẫu có 1 luồng với nhiều phiên bản (nháp → đang áp dụng → lưu
   trữ, bảng luong_nghiep_vu). Canvas hiển thị 5 bước CỐ ĐỊNH của quy trình
   công chứng (đúng luồng thật ở src/flowA.jsx — không thêm/bớt/nối lại vì trình
   tự do pháp luật quy định); kéo thả để bố trí sơ đồ, bấm vào từng bước để cấu
   hình: mô tả/hướng dẫn, SLA, việc cần làm, và giấy tờ cần nhập (bước Bóc tách).
   TẤT CẢ cấu hình đều dùng thật: flowA đọc luồng ĐANG ÁP DỤNG của nhóm biểu mẫu
   được chọn — giấy tờ thành checklist bước Bóc tách, mô tả/việc/SLA thành bảng
   hướng dẫn từng bước cho nhân viên. */
const { useState: useDz, useEffect: useEffDz, useRef: useRefDz, useMemo: useMemoDz } = React;

// 7 bước CỐ ĐỊNH khớp đúng toàn bộ pipeline thật (đã gộp đúng theo backend —
// "Cấp số & thu phí" là 1 API /cap-so duy nhất, "Số hóa & đẩy CMC" là 1 API
// /finalize duy nhất, KHÔNG tách thêm vì thực tế không có ranh giới quyền/
// trạng thái nào ở giữa). vaiTroMacDinh là vai trò RBAC thật đang gắn cứng
// trong code backend (requireRole ở server/src/routes) — trường
// "vaiTroPhuTrach" trong danhSachBuoc CHỈ để hiển thị rõ hơn trong thiết kế,
// đổi giá trị này KHÔNG đổi quyền truy cập API thật.
const FIXED_STEPS = [
  { id: "khoi-tao", ten: "Khởi tạo phiên", icon: "FolderPlus", vaiTroMacDinh: ["TKNV"] },
  { id: "boc-tach", ten: "Bóc tách giấy tờ", icon: "ScanLine", vaiTroMacDinh: ["TKNV"] },
  { id: "tra-cuu", ten: "Tra cứu ngăn chặn", icon: "ShieldCheck", vaiTroMacDinh: ["TKNV", "CCV"] },
  { id: "soan-thao", ten: "Soạn thảo", icon: "PenLine", vaiTroMacDinh: ["TKNV", "CCV"] },
  { id: "in-chuyen", ten: "In & chuyển", icon: "Printer", vaiTroMacDinh: ["CCV"] },
  { id: "cap-so-thu-phi", ten: "Cấp số & thu phí", icon: "ReceiptText", vaiTroMacDinh: ["THU_NGAN"] },
  { id: "so-hoa-day-cmc", ten: "Số hóa & đẩy CMC", icon: "Cloud", vaiTroMacDinh: ["LUU_TRU"] },
];
const ROLE_OPTS = [
  { key: "TKNV", label: "TKNV" },
  { key: "CCV", label: "CCV" },
  { key: "THU_NGAN", label: "Thu ngân" },
  { key: "LUU_TRU", label: "Lưu trữ" },
  { key: "KE_TOAN", label: "Kế toán" },
];
// 2 bước có điểm thông báo thật đã nối sẵn ở backend (server/src/lib/thong-bao.js
// thongBaoBatBuoc) — tắt tickbox này thì hồ sơ chuyển bước vẫn diễn ra bình
// thường, chỉ không gửi thông báo cho vai trò phụ trách bước đó nữa.
const NOTIFY_STEP_IDS = ["cap-so-thu-phi", "so-hoa-day-cmc"];
const DOC_ICONS = ["CreditCard", "ScrollText", "Car", "FileText", "Home", "Landmark"];
const TRANG_THAI_LABEL = { NHAP: "Bản nháp", DANG_AP_DUNG: "Đang áp dụng", DA_LUU_TRU: "Đã lưu trữ" };
const TRANG_THAI_TONE = { NHAP: "neutral", DANG_AP_DUNG: "success", DA_LUU_TRU: "info" };

// Mặc định bật/tắt từng khối in ở bước "In & chuyển" — người soạn thảo vẫn
// bật/tắt lại được cho TỪNG phiên ở printflow.jsx, đây chỉ là giá trị khởi tạo
// chung theo nhóm biểu mẫu (đúng nguyên tắc "chung chung → Thiết kế luồng").
const IN_MAC_DINH_KEYS = [
  { key: "anhTraCuu", label: "Ảnh tra cứu ngăn chặn" },
  { key: "giayToTuyThan", label: "Giấy tờ tùy thân" },
  { key: "giayToTaiSan", label: "Giấy tờ tài sản" },
  { key: "anhCcv", label: "Ảnh chụp công chứng viên" },
];
function defaultInMacDinh() {
  const o = {};
  IN_MAC_DINH_KEYS.forEach((k) => { o[k.key] = true; });
  return o;
}

const NODE_W = 188, NODE_H = 92;
function defaultLayout() {
  const layout = {};
  FIXED_STEPS.forEach((s, i) => { layout[s.id] = { x: 26 + i * (NODE_W + 46), y: i % 2 ? 168 : 44 }; });
  return layout;
}
function defaultDanhSachBuoc() {
  return {
    buoc: FIXED_STEPS.map((s) => ({
      id: s.id, ten: s.ten, moTa: "", slaPhut: null, viec: [],
      vaiTroPhuTrach: [...s.vaiTroMacDinh],
      giayTo: s.id === "boc-tach" ? [] : undefined,
      yeuCauAnhTraCuu: s.id === "tra-cuu" ? true : undefined,
      inMacDinh: s.id === "in-chuyen" ? defaultInMacDinh() : undefined,
      thongBao: NOTIFY_STEP_IDS.includes(s.id) ? true : undefined,
    })),
    layout: defaultLayout(),
  };
}
function normDanhSach(danhSachBuoc) {
  const saved = (danhSachBuoc && Array.isArray(danhSachBuoc.buoc)) ? danhSachBuoc.buoc : [];
  const savedLayout = (danhSachBuoc && danhSachBuoc.layout) || {};
  const def = defaultLayout();
  const layout = {};
  FIXED_STEPS.forEach((s) => {
    const p = savedLayout[s.id];
    layout[s.id] = p && typeof p.x === "number" && typeof p.y === "number" ? { x: p.x, y: p.y } : def[s.id];
  });
  return {
    buoc: FIXED_STEPS.map((s) => {
      const found = saved.find((b) => b.id === s.id) || {};
      return {
        id: s.id, ten: s.ten,
        moTa: found.moTa || "",
        slaPhut: typeof found.slaPhut === "number" ? found.slaPhut : null,
        viec: Array.isArray(found.viec) ? found.viec : [],
        vaiTroPhuTrach: Array.isArray(found.vaiTroPhuTrach) && found.vaiTroPhuTrach.length ? found.vaiTroPhuTrach : [...s.vaiTroMacDinh],
        giayTo: s.id === "boc-tach" ? (found.giayTo || []) : undefined,
        yeuCauAnhTraCuu: s.id === "tra-cuu" ? found.yeuCauAnhTraCuu !== false : undefined,
        inMacDinh: s.id === "in-chuyen" ? { ...defaultInMacDinh(), ...(found.inMacDinh || {}) } : undefined,
        thongBao: NOTIFY_STEP_IDS.includes(s.id) ? found.thongBao !== false : undefined,
      };
    }),
    layout,
  };
}

/* ---- Sửa 1 giấy tờ (tên + icon + danh sách trường cần nhập) ---- */
function DocEditor({ doc, onChange, onDelete }) {
  const L = window.LucideReact;
  const { Input, Select } = window.FSICheckinDesignSystem_019df8;
  const setField = (fi, patch) => onChange({ ...doc, truong: doc.truong.map((f, i) => i === fi ? { ...f, ...patch } : f) });
  // fkey chỉ sinh 1 LẦN lúc tạo trường, không đổi lại theo nhãn sau đó — đổi
  // fkey sau khi đã có hồ sơ thật dùng placeholder này sẽ làm mồ côi dữ liệu.
  const addField = () => onChange({ ...doc, truong: [...(doc.truong || []), { fkey: "truong_" + Math.random().toString(36).slice(2, 8), label: "Trường mới" }] });
  const delField = (fi) => onChange({ ...doc, truong: doc.truong.filter((_, i) => i !== fi) });

  return (
    <div style={{ border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", background: "var(--bg-elevated)", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 120 }}>
          <Select value={doc.icon || "FileText"} onChange={(v) => onChange({ ...doc, icon: v })} options={DOC_ICONS} />
        </div>
        <div style={{ flex: 1 }}>
          <Input value={doc.ten} placeholder="Tên giấy tờ (VD: CCCD — Bên A)" onChange={(e) => onChange({ ...doc, ten: e.target.value })} />
        </div>
        <button type="button" onClick={onDelete} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-danger)", display: "grid", placeItems: "center", width: 30, height: 30, borderRadius: "var(--radius-md)" }}>
          <L.Trash2 size={15} />
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {(doc.truong || []).map((f, fi) => (
          <div key={fi} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <Input value={f.label} placeholder="Nhãn trường (VD: Họ tên)" onChange={(e) => setField(fi, { label: e.target.value })} />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>
              <input type="checkbox" checked={!!f.mono} onChange={(e) => setField(fi, { mono: e.target.checked })} /> Số/mã
            </label>
            <button type="button" onClick={() => delField(fi)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-tertiary)", display: "grid", placeItems: "center", width: 26, height: 26 }}>
              <L.X size={13} />
            </button>
          </div>
        ))}
        <button type="button" onClick={addField} style={{ display: "inline-flex", alignItems: "center", gap: 5, alignSelf: "flex-start", border: "1px dashed var(--border-default)", background: "transparent", color: "var(--text-secondary)", borderRadius: "var(--radius-md)", padding: "5px 10px", fontSize: 11.5, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
          <L.Plus size={12} /> Thêm trường
        </button>
      </div>
    </div>
  );
}

/* ---- 1 node bước trên canvas (kéo thả được khi editable) ---- */
function StepNode({ step, meta, pos, selected, editable, onSelect, onMove }) {
  const L = window.LucideReact;
  const Icon = L[meta.icon] || L.Circle;
  const drag = useRefDz(null);

  const onPointerDown = (e) => {
    onSelect();
    if (!editable) return;
    e.preventDefault();
    // capture để kéo mượt kể cả khi chuột ra ngoài node; vài môi trường
    // (pointer giả lập/cảm ứng) không có pointer active — bỏ qua, vẫn kéo được.
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    onMove({ x: Math.max(0, Math.round(e.clientX - drag.current.dx)), y: Math.max(0, Math.round(e.clientY - drag.current.dy)) });
  };
  const onPointerUp = () => { drag.current = null; };

  const nGiayTo = (step.giayTo || []).length;
  const nViec = (step.viec || []).length;
  return (
    <div onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} style={{
      position: "absolute", left: pos.x, top: pos.y, width: NODE_W, minHeight: NODE_H,
      background: selected ? "var(--accent-muted)" : "var(--bg-elevated)",
      border: "1.5px solid " + (selected ? "var(--accent)" : "var(--border-default)"),
      borderRadius: "var(--radius-lg)", boxShadow: selected ? "0 4px 14px rgba(37,99,235,.18)" : "0 1px 4px rgba(0,0,0,.06)",
      padding: "10px 12px", cursor: editable ? "grab" : "pointer", userSelect: "none", touchAction: "none",
      display: "flex", flexDirection: "column", gap: 6,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 26, height: 26, borderRadius: 8, background: selected ? "var(--accent)" : "var(--bg-inset)", color: selected ? "#fff" : "var(--text-secondary)", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Icon size={14} />
        </span>
        <div style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.25 }}>{step.ten}</div>
      </div>
      <div style={{ fontSize: 10.5, color: "var(--text-tertiary)" }}>Vai trò: {(step.vaiTroPhuTrach || meta.vaiTroMacDinh).join(" · ")}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {typeof step.slaPhut === "number" && step.slaPhut > 0 && (
          <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-warning)", border: "1px solid var(--border-warning)", borderRadius: "var(--radius-full)", padding: "1px 7px" }}>SLA {step.slaPhut}′</span>
        )}
        {step.id === "boc-tach" && (
          <span style={{ fontSize: 10, fontWeight: 600, color: nGiayTo ? "var(--text-info)" : "var(--text-tertiary)", border: "1px solid " + (nGiayTo ? "var(--border-info)" : "var(--border-default)"), borderRadius: "var(--radius-full)", padding: "1px 7px" }}>{nGiayTo ? nGiayTo + " giấy tờ" : "GT mặc định"}</span>
        )}
        {nViec > 0 && (
          <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-success)", border: "1px solid var(--border-success)", borderRadius: "var(--radius-full)", padding: "1px 7px" }}>{nViec} việc</span>
        )}
        {NOTIFY_STEP_IDS.includes(step.id) && (
          <span style={{ fontSize: 10, fontWeight: 600, color: step.thongBao !== false ? "var(--text-info)" : "var(--text-tertiary)", border: "1px solid " + (step.thongBao !== false ? "var(--border-info)" : "var(--border-default)"), borderRadius: "var(--radius-full)", padding: "1px 7px" }}>{step.thongBao !== false ? "Có thông báo" : "Tắt thông báo"}</span>
        )}
      </div>
    </div>
  );
}

/* ---- Canvas: node + đường nối theo trình tự thật ---- */
function FlowCanvas({ draft, selStepId, editable, onSelect, onMove }) {
  const layout = draft.layout;
  const size = useMemoDz(() => {
    let w = 0, h = 0;
    FIXED_STEPS.forEach((s) => { const p = layout[s.id]; w = Math.max(w, p.x + NODE_W); h = Math.max(h, p.y + NODE_H); });
    return { w: w + 40, h: h + 40 };
  }, [layout]);

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: "auto", background: "var(--bg-inset)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
      <div style={{
        position: "relative", width: size.w, height: Math.max(size.h, 320), minWidth: "100%",
        backgroundImage: "radial-gradient(var(--border-subtle) 1px, transparent 1px)", backgroundSize: "22px 22px",
      }}>
        <svg width={size.w} height={Math.max(size.h, 320)} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <defs>
            <marker id="dz-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0.5 L7.5,4 L0,7.5 z" fill="var(--text-tertiary)" />
            </marker>
          </defs>
          {FIXED_STEPS.slice(0, -1).map((s, i) => {
            const a = layout[s.id], b = layout[FIXED_STEPS[i + 1].id];
            const x1 = a.x + NODE_W, y1 = a.y + NODE_H / 2, x2 = b.x, y2 = b.y + NODE_H / 2;
            const mx = (x1 + x2) / 2;
            return <path key={s.id} d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2 - 3} ${y2}`} fill="none" stroke="var(--text-tertiary)" strokeWidth="1.6" markerEnd="url(#dz-arrow)" opacity=".75" />;
          })}
        </svg>
        {FIXED_STEPS.map((meta) => {
          const step = draft.buoc.find((b) => b.id === meta.id);
          return (
            <StepNode key={meta.id} step={step} meta={meta} pos={layout[meta.id]}
              selected={selStepId === meta.id} editable={editable}
              onSelect={() => onSelect(meta.id)} onMove={(p) => onMove(meta.id, p)} />
          );
        })}
      </div>
    </div>
  );
}

/* ---- Panel cấu hình bước đang chọn ---- */
function StepConfigPanel({ step, meta, editable, onChange }) {
  const L = window.LucideReact;
  const { Input } = window.FSICheckinDesignSystem_019df8;
  const isDocStep = step.id === "boc-tach";
  const isTraCuuStep = step.id === "tra-cuu";
  const isInChuyenStep = step.id === "in-chuyen";
  const isNotifyStep = NOTIFY_STEP_IDS.includes(step.id);

  const toggleRole = (key) => {
    const cur = step.vaiTroPhuTrach || [];
    const next = cur.includes(key) ? cur.filter((r) => r !== key) : [...cur, key];
    onChange({ ...step, vaiTroPhuTrach: next });
  };

  const setViec = (vi, ten) => onChange({ ...step, viec: step.viec.map((v, i) => i === vi ? { ...v, ten } : v) });
  const addViec = () => onChange({ ...step, viec: [...(step.viec || []), { id: "viec_" + Math.random().toString(36).slice(2, 8), ten: "" }] });
  const delViec = (vi) => onChange({ ...step, viec: step.viec.filter((_, i) => i !== vi) });
  // id ổn định cho mỗi giấy tờ — src/flowA.jsx dùng làm key + dedup khi phiên
  // gộp nhiều nhóm biểu mẫu, không được đổi lại sau này.
  const addDoc = () => onChange({ ...step, giayTo: [...(step.giayTo || []), { id: "doc_" + Math.random().toString(36).slice(2, 9), ten: "Giấy tờ mới", icon: "FileText", truong: [] }] });
  const setDoc = (di, patch) => onChange({ ...step, giayTo: step.giayTo.map((d, i) => i === di ? patch : d) });
  const delDoc = (di) => onChange({ ...step, giayTo: step.giayTo.filter((_, i) => i !== di) });

  const secTitle = (t) => (
    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-tertiary)" }}>{t}</div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 0, overflowY: "auto", paddingRight: 2 }}>
      <div>
        <div style={{ fontSize: 14.5, fontWeight: 700 }}>{step.ten}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {secTitle("Vai trò phụ trách")}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px" }}>
          {ROLE_OPTS.map((r) => (
            <label key={r.key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, cursor: editable ? "pointer" : "default" }}>
              <input type="checkbox" disabled={!editable} checked={(step.vaiTroPhuTrach || []).includes(r.key)} onChange={() => toggleRole(r.key)} />
              {r.label}
            </label>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
          Chỉ để hiển thị rõ hơn trong màn thiết kế — KHÔNG đổi quyền truy cập API thật (vẫn cố định theo code backend).
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {secTitle("Mô tả / hướng dẫn cho nhân viên")}
        <textarea value={step.moTa} disabled={!editable} placeholder="Hiển thị ngay trong màn soạn thảo khi nhân viên vào bước này…"
          onChange={(e) => onChange({ ...step, moTa: e.target.value })}
          style={{ width: "100%", minHeight: 62, resize: "vertical", fontFamily: "var(--font-sans)", fontSize: 12.5, color: "var(--text-primary)", background: editable ? "var(--bg-inset)" : "var(--bg-overlay)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "8px 10px", outline: "none" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {secTitle("SLA — thời gian xử lý mục tiêu (phút)")}
        <input type="number" min="0" step="5" disabled={!editable} value={step.slaPhut == null ? "" : step.slaPhut}
          placeholder="Bỏ trống = không đặt SLA"
          onChange={(e) => onChange({ ...step, slaPhut: e.target.value === "" ? null : Math.max(0, Number(e.target.value) || 0) })}
          style={{ width: 180, fontFamily: "var(--font-sans)", fontSize: 12.5, color: "var(--text-primary)", background: editable ? "var(--bg-inset)" : "var(--bg-overlay)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "8px 10px", outline: "none" }} />
      </div>

      {isNotifyStep && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {secTitle("Thông báo")}
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: editable ? "pointer" : "default" }}>
            <input type="checkbox" disabled={!editable} checked={step.thongBao !== false}
              onChange={(e) => onChange({ ...step, thongBao: e.target.checked })} />
            Hiện thông báo cho {(step.vaiTroPhuTrach || meta.vaiTroMacDinh).join(", ")} khi hồ sơ tới bước này
          </label>
          <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>Tắt nếu nhóm biểu mẫu này không cần báo — hồ sơ vẫn chuyển bước bình thường, chỉ không gửi thông báo.</div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {secTitle("Việc cần làm ở bước này")}
        {(step.viec || []).length === 0 && (
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontStyle: "italic" }}>Chưa có — thêm các đầu việc để nhân viên đối chiếu khi làm bước này.</div>
        )}
        {(step.viec || []).map((v, vi) => (
          <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <L.CheckSquare size={14} color="var(--text-tertiary)" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              {editable
                ? <Input value={v.ten} placeholder="VD: Đối chiếu bản gốc với bản sao" onChange={(e) => setViec(vi, e.target.value)} />
                : <div style={{ fontSize: 12.5 }}>{v.ten || "(trống)"}</div>}
            </div>
            {editable && (
              <button type="button" onClick={() => delViec(vi)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-tertiary)", display: "grid", placeItems: "center", width: 26, height: 26 }}>
                <L.X size={13} />
              </button>
            )}
          </div>
        ))}
        {editable && (
          <button type="button" onClick={addViec} style={{ display: "inline-flex", alignItems: "center", gap: 5, alignSelf: "flex-start", border: "1px dashed var(--border-default)", background: "transparent", color: "var(--text-secondary)", borderRadius: "var(--radius-md)", padding: "5px 10px", fontSize: 11.5, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
            <L.Plus size={12} /> Thêm việc
          </button>
        )}
      </div>

      {isTraCuuStep && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {secTitle("Bắt buộc ảnh tra cứu")}
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: editable ? "pointer" : "default" }}>
            <input type="checkbox" disabled={!editable} checked={step.yeuCauAnhTraCuu !== false}
              onChange={(e) => onChange({ ...step, yeuCauAnhTraCuu: e.target.checked })} />
            Yêu cầu ảnh chụp màn hình tra cứu trước khi qua bước tiếp theo
          </label>
          <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>Tắt nếu nhóm biểu mẫu này không cần tra cứu ngăn chặn (vd giấy ủy quyền đơn giản).</div>
        </div>
      )}

      {isInChuyenStep && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {secTitle("Mặc định các khối in kèm (có thể bật/tắt lại theo từng phiên)")}
          {IN_MAC_DINH_KEYS.map((k) => (
            <label key={k.key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: editable ? "pointer" : "default" }}>
              <input type="checkbox" disabled={!editable} checked={(step.inMacDinh || {})[k.key] !== false}
                onChange={(e) => onChange({ ...step, inMacDinh: { ...(step.inMacDinh || {}), [k.key]: e.target.checked } })} />
              {k.label}
            </label>
          ))}
        </div>
      )}

      {isDocStep && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {secTitle("Giấy tờ cần nhập ở bước này")}
          {(step.giayTo || []).length === 0 && (
            <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontStyle: "italic" }}>Chưa cấu hình — hồ sơ thuộc nhóm này sẽ dùng bộ giấy tờ mặc định (CCCD 2 bên).</div>
          )}
          {(step.giayTo || []).map((d, di) => editable
            ? <DocEditor key={d.id || di} doc={d} onChange={(p) => setDoc(di, p)} onDelete={() => delDoc(di)} />
            : (
              <div key={d.id || di} style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "8px 11px", fontSize: 12.5 }}>
                <b>{d.ten}</b> — {(d.truong || []).map((f) => f.label).join(", ") || "(chưa có trường)"}
              </div>
            ))}
          {editable && (
            <button type="button" onClick={addDoc} style={{ display: "inline-flex", alignItems: "center", gap: 6, alignSelf: "flex-start", border: "1px dashed var(--border-default)", background: "transparent", color: "var(--text-secondary)", borderRadius: "var(--radius-md)", padding: "7px 12px", fontSize: 12.5, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
              <L.Plus size={13} /> Thêm giấy tờ
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function NewFlowDialog({ suggestTen, onClose, onCreate }) {
  const L = window.LucideReact;
  const { Dialog, Button, Input } = window.FSICheckinDesignSystem_019df8;
  const [ten, setTen] = useDz("");
  return (
    <Dialog open title="Tạo luồng mới" width={440} onClose={onClose}
      footer={<>
        <Button variant="ghost" onClick={onClose}>Hủy</Button>
        <Button variant="primary" icon={L.Plus} disabled={!ten.trim()} onClick={() => onCreate(ten.trim())}>Tạo luồng</Button>
      </>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Tên luồng (phải khớp nhóm biểu mẫu để áp vào hồ sơ)</div>
          <Input value={ten} placeholder="VD: Đất đai, Động sản, Ủy quyền xe…" onChange={(e) => setTen(e.target.value)} />
        </div>
        {suggestTen.length > 0 && (
          <div>
            <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginBottom: 6 }}>Nhóm biểu mẫu chưa có luồng — bấm để chọn:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {suggestTen.map((n) => (
                <button key={n} type="button" onClick={() => setTen(n)} style={{
                  border: "1px solid " + (ten === n ? "var(--accent)" : "var(--border-default)"), background: ten === n ? "var(--accent-muted)" : "var(--bg-surface)",
                  color: ten === n ? "var(--accent-hover)" : "var(--text-secondary)", borderRadius: "var(--radius-full)", padding: "4px 11px", fontSize: 12, cursor: "pointer", fontFamily: "var(--font-sans)",
                }}>{n}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}

function FlowDesigner({ onToast }) {
  const L = window.LucideReact;
  const { Button, Badge } = window.FSICheckinDesignSystem_019df8;
  const [flows, setFlows] = useDz(null); // null = đang tải
  const [nhomList, setNhomList] = useDz([]);
  const [selTen, setSelTen] = useDz(null);
  const [selId, setSelId] = useDz(null);
  const [selStepId, setSelStepId] = useDz("khoi-tao");
  const [draft, setDraft] = useDz(null); // { buoc, layout } — bản chỉnh sửa cục bộ
  const [saving, setSaving] = useDz(false);
  const [showNew, setShowNew] = useDz(false);
  // Gọi TRƯỚC early-return "Đang tải…" bên dưới — hook phải chạy ở mọi lần render.
  const vp = window.VAUi.useViewport();
  const narrow = vp !== "desktop"; // màn hẹp: danh sách luồng lên trên, canvas + panel xếp dọc

  const load = () => window.VAApi.luongNghiepVu.list().then(setFlows).catch(() => setFlows([]));
  useEffDz(() => {
    load();
    window.VAApi.bieuMau.list().then((rows) => {
      setNhomList([...new Set(rows.map((r) => r.nhom).filter(Boolean))]);
    }).catch(() => {});
  }, []);

  const groups = React.useMemo(() => {
    if (!flows) return [];
    const byTen = {};
    flows.forEach((f) => { (byTen[f.ten] ||= []).push(f); });
    return Object.keys(byTen).sort().map((ten) => ({
      ten, versions: byTen[ten].sort((a, b) => b.phienBan - a.phienBan),
    }));
  }, [flows]);

  // Chọn mặc định: giữ lựa chọn hiện tại nếu còn tồn tại; không thì chọn nhóm đầu tiên.
  useEffDz(() => {
    if (!flows || !flows.length) return;
    if (selTen && groups.find((g) => g.ten === selTen)) return;
    const g = groups[0];
    if (g) { setSelTen(g.ten); setSelId((g.versions.find((v) => v.trangThai === "DANG_AP_DUNG") || g.versions[0]).id); }
  }, [flows]);

  const group = groups.find((g) => g.ten === selTen);
  const version = group && group.versions.find((v) => v.id === selId);
  const editable = version && version.trangThai === "NHAP";

  useEffDz(() => {
    setDraft(version ? normDanhSach(version.danhSachBuoc) : null);
  }, [selId]);

  const selectVersion = (ten, id) => { setSelTen(ten); setSelId(id); };
  const patchStep = (stepId, patch) => setDraft((d) => ({ ...d, buoc: d.buoc.map((s) => s.id === stepId ? patch : s) }));
  const moveStep = (stepId, pos) => setDraft((d) => ({ ...d, layout: { ...d.layout, [stepId]: pos } }));

  const luu = async () => {
    setSaving(true);
    try {
      const updated = await window.VAApi.luongNghiepVu.update(version.id, { danhSachBuoc: draft });
      setFlows((fs) => fs.map((f) => f.id === updated.id ? updated : f));
      onToast("Đã lưu nháp", group.ten + " · v" + version.phienBan);
    } catch (e) {
      onToast("Lưu thất bại", e.message || "Không rõ nguyên nhân", "danger");
    } finally {
      setSaving(false);
    }
  };

  const nhanBan = async () => {
    setSaving(true);
    try {
      const created = await window.VAApi.luongNghiepVu.nhanBan(version.id);
      setFlows((fs) => [created, ...fs]);
      selectVersion(created.ten, created.id);
      onToast("Đã tạo bản nháp mới", created.ten + " · v" + created.phienBan);
    } catch (e) {
      onToast("Nhân bản thất bại", e.message || "Không rõ nguyên nhân", "danger");
    } finally {
      setSaving(false);
    }
  };

  const kichHoat = async () => {
    setSaving(true);
    try {
      // lưu nháp lần cuối trước khi kích hoạt, đảm bảo bản kích hoạt khớp đúng đang sửa
      await window.VAApi.luongNghiepVu.update(version.id, { danhSachBuoc: draft });
      const updated = await window.VAApi.luongNghiepVu.kichHoat(version.id);
      await load();
      setSelId(updated.id);
      onToast("Đã kích hoạt luồng", group.ten + " · v" + updated.phienBan);
    } catch (e) {
      onToast("Kích hoạt thất bại", e.message || "Không rõ nguyên nhân", "danger");
    } finally {
      setSaving(false);
    }
  };

  const xoa = async () => {
    setSaving(true);
    try {
      await window.VAApi.luongNghiepVu.remove(version.id);
      const rest = flows.filter((f) => f.id !== version.id);
      setFlows(rest);
      setSelId(null); setSelTen(null);
      onToast("Đã xóa bản nháp", group.ten);
    } catch (e) {
      onToast("Xóa thất bại", e.message || "Không rõ nguyên nhân", "danger");
    } finally {
      setSaving(false);
    }
  };

  const taoLuong = async (ten) => {
    setShowNew(false);
    try {
      const created = await window.VAApi.luongNghiepVu.create({ ten, danhSachBuoc: defaultDanhSachBuoc() });
      setFlows((fs) => [created, ...(fs || [])]);
      selectVersion(created.ten, created.id);
      onToast("Đã tạo luồng mới", ten);
    } catch (e) {
      onToast("Tạo luồng thất bại", e.message || "Không rõ nguyên nhân", "danger");
    }
  };

  if (flows === null) {
    return <div style={{ padding: 24, fontSize: 13, color: "var(--text-tertiary)" }}>Đang tải…</div>;
  }

  const selMeta = FIXED_STEPS.find((s) => s.id === selStepId);
  const selStep = draft && draft.buoc.find((b) => b.id === selStepId);

  return (
    <div style={{ height: "100%", minHeight: 0, overflow: "auto" }}>
      <div style={narrow
        ? { display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }
        : { display: "grid", gridTemplateColumns: "232px minmax(0,1fr)", gap: 14, height: "100%", minHeight: 0, minWidth: 900 }}>
        {/* TRÁI — danh sách luồng theo nhóm biểu mẫu */}
        <aside style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", minHeight: 0, maxHeight: narrow ? 240 : undefined, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "13px 14px", borderBottom: "1px solid var(--border-subtle)" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>Luồng nghiệp vụ</div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{groups.length} luồng · theo nhóm biểu mẫu</div>
            </div>
            <Button variant="primary" size="sm" icon={L.Plus} onClick={() => setShowNew(true)}>Mới</Button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 8, display: "flex", flexDirection: "column", gap: 10 }}>
            {groups.map((g) => {
              return (
                <div key={g.ten}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", padding: "4px 6px" }}>{g.ten}</div>
                  {g.versions.map((v) => {
                    const on = v.id === selId;
                    return (
                      <div key={v.id} onClick={() => selectVersion(g.ten, v.id)} style={{
                        padding: "8px 10px", borderRadius: "var(--radius-md)", cursor: "pointer", marginBottom: 3,
                        border: "1px solid " + (on ? "var(--accent-border)" : "var(--border-subtle)"),
                        background: on ? "var(--accent-muted)" : "transparent",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: on ? "var(--accent-hover)" : "var(--text-primary)" }}>v{v.phienBan}</span>
                          <Badge tone={TRANG_THAI_TONE[v.trangThai]} dot>{TRANG_THAI_LABEL[v.trangThai]}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {groups.length === 0 && (
              <div style={{ padding: 16, textAlign: "center", fontSize: 12.5, color: "var(--text-tertiary)" }}>Chưa có luồng nào — bấm "Mới" để tạo.</div>
            )}
          </div>
          <div style={{ padding: "10px 12px", borderTop: "1px solid var(--border-subtle)", fontSize: 10.5, color: "var(--text-disabled)", display: "flex", alignItems: "flex-start", gap: 6 }}>
            <L.Info size={12} style={{ marginTop: 1, flexShrink: 0 }} /> Trình tự 7 bước &amp; quyền truy cập API thật cố định theo quy trình công chứng; kéo thả để bố trí sơ đồ, bấm vào bước để cấu hình nội dung.
          </div>
        </aside>

        {/* PHẢI — canvas + panel cấu hình bước */}
        <section style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
          {!version ? (
            <div style={{ flex: 1, display: "grid", placeItems: "center", color: "var(--text-tertiary)", fontSize: 13 }}>Chọn 1 luồng bên trái, hoặc tạo luồng mới.</div>
          ) : (
            <>
              <header style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 16.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                    {group.ten} <span style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 500 }}>· v{version.phienBan}</span>
                    <Badge tone={TRANG_THAI_TONE[version.trangThai]} dot>{TRANG_THAI_LABEL[version.trangThai]}</Badge>
                  </div>
                  {!editable && (
                    <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
                      <L.Lock size={11} /> {version.trangThai === "DANG_AP_DUNG" ? "Đang áp dụng — chỉ xem." : "Đã lưu trữ — chỉ xem."} Bấm "Nhân bản để sửa" để tạo nháp mới.
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {editable ? (
                    <>
                      <Button variant="ghost" size="sm" icon={L.Trash2} disabled={saving} onClick={xoa}>Xóa nháp</Button>
                      <Button variant="secondary" size="sm" icon={L.Save} disabled={saving} onClick={luu}>Lưu nháp</Button>
                      <Button variant="primary" size="sm" icon={L.Rocket} disabled={saving} onClick={kichHoat}>Kích hoạt</Button>
                    </>
                  ) : (
                    <Button variant="secondary" size="sm" icon={L.Copy} disabled={saving} onClick={nhanBan}>Nhân bản để sửa</Button>
                  )}
                </div>
              </header>
              <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: narrow ? "1fr" : "minmax(0,1fr) 340px", gap: 12, padding: 12 }}>
                {draft && (
                  <div style={{ minHeight: narrow ? 300 : 0, display: "flex" }}>
                    <FlowCanvas draft={draft} selStepId={selStepId} editable={editable}
                      onSelect={setSelStepId} onMove={moveStep} />
                  </div>
                )}
                <div style={narrow
                  ? { borderTop: "1px solid var(--border-subtle)", paddingTop: 12, minHeight: 0, display: "flex", flexDirection: "column" }
                  : { borderLeft: "1px solid var(--border-subtle)", paddingLeft: 12, minHeight: 0, display: "flex", flexDirection: "column" }}>
                  {selStep
                    ? <StepConfigPanel step={selStep} meta={selMeta} editable={editable} onChange={(p) => patchStep(selStep.id, p)} />
                    : <div style={{ flex: 1, display: "grid", placeItems: "center", color: "var(--text-tertiary)", fontSize: 12.5 }}>Bấm vào 1 bước trên sơ đồ để cấu hình.</div>}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
      {showNew && <NewFlowDialog suggestTen={nhomList.filter((n) => !groups.find((g) => g.ten === n))} onClose={() => setShowNew(false)} onCreate={taoLuong} />}
    </div>
  );
}

window.SaDesigner = { FlowDesigner };
