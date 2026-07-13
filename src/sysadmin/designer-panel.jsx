/* global React, window */
/* PH05 — Panel "Cấu hình bước" (vùng PHẢI)
   Phụ thuộc (multi-select, có khóa hệ thống) · kiểu gộp · điều kiện chuyển bước
   · tùy chọn/chạy nền · khóa pháp lý · SLA · tài liệu. */
const { useState: usePn, useEffect: useEffPn, useRef: useRefPn } = React;

const pnIconBtn = { border: "none", background: "transparent", cursor: "pointer", color: "var(--text-tertiary)", width: 28, height: 28, borderRadius: 6, display: "grid", placeItems: "center" };
const pnLabel = { fontSize: 11.5, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 };

/* ---------- Multi-select phụ thuộc ---------- */
function DepMultiSelect({ step, flow, onChange }) {
  const L = window.LucideReact;
  const G = window.SaGraph;
  const [open, setOpen] = usePn(false);
  const ref = useRefPn(null);
  useEffPn(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const deps = step.deps || [];
  const locked = step.lockedDeps || [];
  // loại trừ: chính nó, hậu duệ (chống vòng), bước đang tắt
  const descend = G.descendantsOf(step.id, flow.steps);
  const candidates = flow.steps.filter((s) =>
    s.id !== step.id && !descend.has(s.id) && !(s.optional && !s.enabled));

  const toggle = (id) => {
    if (locked.includes(id)) return;
    const next = deps.includes(id) ? deps.filter((d) => d !== id) : [...deps, id];
    onChange(next);
  };
  const stepName = (id) => (flow.steps.find((s) => s.id === id) || {}).name || id;
  const stepRole = (id) => (flow.steps.find((s) => s.id === id) || {}).role;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, minHeight: 38, padding: 6, borderRadius: "var(--radius-md)", border: "1px solid " + (open ? "var(--accent)" : "var(--border-default)"), background: open ? "#fff" : "var(--bg-inset)", cursor: "pointer" }}
        onClick={() => setOpen((v) => !v)}>
        {deps.length === 0 && <span style={{ fontSize: 12.5, color: "var(--text-tertiary)", padding: "3px 2px" }}>Để trống = chạy song song</span>}
        {deps.map((id) => {
          const r = window.SA_roleOf(stepRole(id));
          const isLk = locked.includes(id);
          return (
            <span key={id} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: "var(--radius-full)", fontSize: 11.5, fontWeight: 600, background: r.color + "16", color: r.color, border: "1px solid " + r.color + "30" }}>
              {isLk && <L.Lock size={10} />}
              {stepName(id)}
              {!isLk && <button type="button" onClick={(e) => { e.stopPropagation(); toggle(id); }} style={{ ...pnIconBtn, width: 15, height: 15, color: r.color }}><L.X size={11} /></button>}
            </span>
          );
        })}
        <span style={{ marginLeft: "auto", alignSelf: "center", color: "var(--text-tertiary)" }}><L.ChevronDown size={15} /></span>
      </div>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 30, background: "#fff", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)", maxHeight: 234, overflowY: "auto", padding: 5 }}>
          {candidates.length === 0 && <div style={{ fontSize: 12, color: "var(--text-tertiary)", padding: 10 }}>Không có bước hợp lệ để phụ thuộc.</div>}
          {candidates.map((s) => {
            const on = deps.includes(s.id);
            const isLk = locked.includes(s.id);
            const r = window.SA_roleOf(s.role);
            const Icon = L[r.icon] || L.Circle;
            return (
              <div key={s.id} onClick={() => toggle(s.id)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 8px", borderRadius: 6, cursor: isLk ? "not-allowed" : "pointer", opacity: isLk ? 0.7 : 1, background: on ? "var(--accent-muted)" : "transparent" }}>
                <span style={{ width: 16, height: 16, borderRadius: 4, border: "1.5px solid " + (on ? "var(--accent)" : "var(--border-strong)"), background: on ? "var(--accent)" : "transparent", display: "grid", placeItems: "center", flexShrink: 0 }}>{on && <L.Check size={11} color="#fff" />}</span>
                <span style={{ width: 22, height: 22, borderRadius: 6, background: r.color + "16", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon size={12} color={r.color} /></span>
                <span style={{ flex: 1, fontSize: 12.5, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                {isLk && <L.Lock size={12} color="var(--text-warning)" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- Segmented AND/OR ---------- */
function JoinToggle({ value, onChange }) {
  const opts = [{ id: "AND", label: "AND · chờ tất cả" }, { id: "OR", label: "OR · chờ bất kỳ" }];
  return (
    <div style={{ display: "flex", gap: 4, padding: 4, background: "var(--bg-inset)", borderRadius: "var(--radius-md)" }}>
      {opts.map((o) => {
        const on = value === o.id;
        return (
          <button key={o.id} type="button" onClick={() => onChange(o.id)}
            style={{ flex: 1, padding: "7px 6px", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 11.5, fontWeight: 700,
              background: on ? "var(--bg-surface)" : "transparent", color: on ? "var(--accent)" : "var(--text-tertiary)",
              boxShadow: on ? "var(--shadow-sm)" : "none" }}>{o.label}</button>
        );
      })}
    </div>
  );
}

/* ---------- Panel cấu hình bước ---------- */
function StepConfigPanel({ flow, step, onPatch, onDelete, onToast }) {
  const L = window.LucideReact;
  const D = window.SA_DATA;
  const G = window.SaGraph;
  const { Input, Select, Switch, Button } = window.FSICheckinDesignSystem_019df8;
  const [docInput, setDocInput] = usePn("");
  const set = (k, v) => onPatch(step.id, { [k]: v });

  const op = window.SA_opOf(step.op);
  const OpIcon = L[op.icon] || L.Circle;
  const r = window.SA_roleOf(step.role);
  const depCount = (step.deps || []).length;
  const disableCheck = G.canDisable(step, flow.steps);

  const addDoc = () => { const t = docInput.trim(); if (!t) return; set("docs", [...(step.docs || []), t]); setDocInput(""); };
  const rmDoc = (i) => set("docs", (step.docs || []).filter((_, j) => j !== i));

  /* Tắt bước tùy chọn: kiểm tra phụ thuộc trước */
  const tryToggleEnabled = (nextOn) => {
    if (nextOn) { set("enabled", true); onToast("Đã bật lại bước", step.name); return; }
    const chk = G.canDisable(step, flow.steps);
    if (!chk.ok) {
      onToast("Không thể tắt — đang có bước phụ thuộc", chk.blockers.map((b) => b.name).join(", "), "danger");
      return;
    }
    set("enabled", false);
    onToast("Đã tắt bước — an toàn, không ảnh hưởng luồng", step.name);
  };

  const toggleOptional = (v) => {
    if (step.locked) return;
    onPatch(step.id, v ? { optional: true } : { optional: false, enabled: true });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
        <span style={{ width: 32, height: 32, borderRadius: 8, background: r.color + "16", display: "grid", placeItems: "center", flexShrink: 0 }}><OpIcon size={17} color={r.color} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Cấu hình bước</div>
          <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{op.label}</div>
        </div>
        {step.locked && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: "var(--radius-full)", fontSize: 10.5, fontWeight: 700, background: "var(--bg-warning)", color: "var(--text-warning)", border: "1px solid var(--border-warning)" }}>
            <L.Lock size={11} /> Khóa pháp lý
          </span>
        )}
      </header>

      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 15 }}>
        <div>
          <div style={pnLabel}>Tên bước</div>
          <Input value={step.name} onChange={(e) => set("name", e.target.value)} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={pnLabel}><L.UserCog size={13} /> Vai trò phụ trách</div>
            <Select value={step.role} onChange={(v) => set("role", v)} options={D.roles.map((x) => ({ value: x.id, label: x.label }))} />
          </div>
          <div>
            <div style={pnLabel}><L.Workflow size={13} /> Loại thao tác</div>
            <Select value={step.op} onChange={(v) => set("op", v)} options={D.ops.map((x) => ({ value: x.id, label: x.label }))} />
          </div>
        </div>

        <div style={{ height: 1, background: "var(--border-subtle)" }} />

        <div>
          <div style={pnLabel}><L.GitBranch size={13} /> Phụ thuộc vào bước</div>
          <DepMultiSelect step={step} flow={flow} onChange={(deps) => set("deps", deps)} />
          {(step.lockedDeps || []).length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6, fontSize: 11, color: "var(--text-warning)" }}>
              <L.Lock size={11} /> Có phụ thuộc do hệ thống khóa sẵn, không thể gỡ.
            </div>
          )}
        </div>

        {depCount >= 2 && (
          <div>
            <div style={pnLabel}><L.GitMerge size={13} /> Kiểu gộp (join)</div>
            <JoinToggle value={step.join || "AND"} onChange={(v) => set("join", v)} />
          </div>
        )}

        <div>
          <div style={pnLabel}><L.Flag size={13} /> Điều kiện chuyển bước</div>
          <Select value={step.gate || ""} onChange={(v) => set("gate", v)} options={D.gates.map((g) => ({ value: g.id, label: g.label }))} />
        </div>

        <div style={{ height: 1, background: "var(--border-subtle)" }} />

        {/* Toggles thuộc tính */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <ToggleRow icon={L.ToggleRight} title="Tùy chọn (bật/tắt bước)" sub={step.locked ? "Bước khóa pháp lý — bắt buộc, không thể đặt tùy chọn" : "Cho phép quản trị viên bật/tắt bước này"}>
            <Switch checked={!!step.optional} onChange={toggleOptional} disabled={step.locked} />
          </ToggleRow>

          {step.optional && (
            <div style={{ padding: "10px 12px", borderRadius: "var(--radius-md)", background: step.enabled ? "var(--bg-success)" : "var(--bg-overlay)", border: "1px solid " + (step.enabled ? "var(--border-success)" : "var(--border-default)") }}>
              <ToggleRow
                icon={step.enabled ? L.CircleCheck : L.CircleSlash}
                title={step.enabled ? "Bước đang BẬT" : "Bước đang TẮT"}
                sub={disableCheck.ok ? "An toàn — không có bước nào phụ thuộc" : "Đang có bước phụ thuộc: " + disableCheck.blockers.map((b) => b.name).join(", ")}
                tone={!step.enabled ? "muted" : disableCheck.ok ? "ok" : "warn"}>
                <Switch checked={!!step.enabled} onChange={tryToggleEnabled} />
              </ToggleRow>
            </div>
          )}

          <ToggleRow icon={L.Activity} title="Chặn luồng (blocking)" sub={step.blocking ? "Luồng dừng chờ bước này hoàn tất" : "Chạy nền — không chặn các bước sau"}>
            <Switch checked={!!step.blocking} onChange={(v) => set("blocking", v)} />
          </ToggleRow>
        </div>

        <div style={{ height: 1, background: "var(--border-subtle)" }} />

        {/* SLA */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "end" }}>
          <div>
            <div style={pnLabel}><L.Timer size={13} /> SLA (phút)</div>
            <Input type="number" value={String(step.sla)} onChange={(e) => set("sla", Math.max(0, Number(e.target.value) || 0))} />
          </div>
          <div style={{ paddingBottom: 9 }}>
            <Switch label="Bắt buộc" checked={!!step.slaRequired} onChange={(v) => set("slaRequired", v)} />
          </div>
        </div>

        {/* Tài liệu */}
        <div>
          <div style={pnLabel}><L.Paperclip size={13} /> Tài liệu & biểu mẫu đính kèm</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
            {(step.docs || []).length === 0 && <span style={{ fontSize: 12, color: "var(--text-disabled)" }}>Chưa có tài liệu.</span>}
            {(step.docs || []).map((d, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: "var(--radius-md)", background: "var(--bg-inset)", fontSize: 12 }}>
                <L.FileText size={12} color="var(--text-tertiary)" /> {d}
                <button type="button" onClick={() => rmDoc(i)} style={{ ...pnIconBtn, width: 16, height: 16 }}><L.X size={12} /></button>
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}><Input placeholder="Thêm tài liệu…" value={docInput} onChange={(e) => setDocInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addDoc(); }} /></div>
            <Button variant="secondary" size="md" icon={L.Plus} onClick={addDoc}>Thêm</Button>
          </div>
        </div>
      </div>

      <footer style={{ padding: "12px 16px", borderTop: "1px solid var(--border-subtle)" }}>
        <Button variant="ghost" fullWidth icon={L.Trash2} disabled={step.locked}
          onClick={() => onDelete(step.id)}
          style={step.locked ? {} : { color: "var(--text-danger)" }}>
          {step.locked ? "Bước khóa — không thể xóa" : "Xóa bước khỏi luồng"}
        </Button>
      </footer>
    </div>
  );
}

function ToggleRow({ icon: Icon, title, sub, tone, children }) {
  const c = tone === "warn" ? "var(--text-warning)" : tone === "ok" ? "var(--text-success)" : tone === "muted" ? "var(--text-tertiary)" : "var(--text-secondary)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Icon size={16} color={c} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)" }}>{title}</div>
        {sub && <div style={{ fontSize: 11, color: c, marginTop: 1, lineHeight: 1.35 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

window.SaPanel = { StepConfigPanel };
