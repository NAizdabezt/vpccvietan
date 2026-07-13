/* global React, window */
/* PH05 — Thiết kế luồng nghiệp vụ (config-driven, modular)
   TRÁI: Thư viện luồng · GIỮA: Canvas rẽ nhánh + join · PHẢI: Cấu hình bước.
   + Validate khi Publish · Versioning + Rollback. Mỗi luồng độc lập. */
const { useState: useDz, useMemo: useMemoDz } = React;

let SA_UID = 100;
const saUid = (p) => (p || "x") + ++SA_UID;
const SA_DOC_TYPES = ["Hợp đồng", "Sao y", "Ủy quyền", "Di chúc", "Thừa kế", "Văn bản khác"];
const SA_OFFICES = () => ["Tất cả văn phòng", ...(window.SA_DATA.workplaces || []).map((w) => w.name)];

/* ---------- Dialog Tạo luồng mới (có chọn nơi làm việc) ---------- */
function NewFlowDialog({ onClose, onCreate }) {
  const L = window.LucideReact;
  const { Dialog, Button, Input, Select } = window.FSICheckinDesignSystem_019df8;
  const offices = SA_OFFICES();
  const [name, setName] = useDz("");
  const [docType, setDocType] = useDz(SA_DOC_TYPES[0]);
  const [office, setOffice] = useDz(offices[1] || offices[0]);
  return (
    <Dialog open title="Tạo luồng nghiệp vụ mới" width={440} onClose={onClose}
      footer={<>
        <Button variant="ghost" onClick={onClose}>Hủy</Button>
        <Button variant="primary" icon={L.Plus} onClick={() => onCreate({ name, docType, office })}>Tạo luồng</Button>
      </>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Tên luồng</div>
          <Input value={name} placeholder="VD: Hợp đồng tặng cho BĐS" onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Loại nghiệp vụ</div>
          <Select value={docType} onChange={setDocType} options={SA_DOC_TYPES} />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}><L.Building2 size={13} /> Nơi làm việc áp dụng</div>
          <Select value={office} onChange={setOffice} options={offices} />
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 7, padding: "9px 11px", borderRadius: "var(--radius-md)", background: "var(--accent-muted)", border: "1px solid var(--accent-border)", fontSize: 11.5, color: "var(--text-secondary)", lineHeight: 1.45 }}>
          <L.Info size={14} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
          Luồng tạo ra ở dạng nháp với một bước khởi đầu. Kéo chấm nối giữa các bước để dựng sơ đồ, rồi Kích hoạt.
        </div>
      </div>
    </Dialog>
  );
}
const cloneSteps = (steps) => steps.map((s) => ({ ...s, deps: [...(s.deps || [])], lockedDeps: [...(s.lockedDeps || [])], docs: [...(s.docs || [])] }));

/* ---------- Dialog Validate / Publish ---------- */
function ValidateDialog({ flow, onClose, onPublish }) {
  const L = window.LucideReact;
  const { Dialog, Button } = window.FSICheckinDesignSystem_019df8;
  const res = window.SaGraph.validateFlow(flow);
  return (
    <Dialog open title="Kiểm tra & kích hoạt luồng" width={460} onClose={onClose}
      footer={<>
        <Button variant="ghost" onClick={onClose}>Đóng</Button>
        <Button variant="primary" icon={L.CheckCircle2} disabled={!res.ok} onClick={onPublish}>{res.ok ? "Kích hoạt luồng" : "Còn lỗi cần sửa"}</Button>
      </>}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, padding: "10px 12px", borderRadius: "var(--radius-md)", background: res.ok ? "var(--bg-success)" : "var(--bg-danger)", border: "1px solid " + (res.ok ? "var(--border-success)" : "var(--border-danger)") }}>
        {res.ok ? <L.ShieldCheck size={18} color="var(--text-success)" /> : <L.ShieldAlert size={18} color="var(--text-danger)" />}
        <span style={{ fontSize: 13, fontWeight: 600, color: res.ok ? "var(--text-success)" : "var(--text-danger)" }}>
          {res.ok ? "Luồng hợp lệ — sẵn sàng kích hoạt" : "Luồng chưa hợp lệ — vui lòng khắc phục"}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {res.checks.map((c) => (
          <div key={c.id} style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: "9px 10px", borderRadius: "var(--radius-md)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
            {c.ok ? <L.Check size={15} color="var(--text-success)" style={{ marginTop: 1, flexShrink: 0 }} /> : <L.X size={15} color="var(--text-danger)" style={{ marginTop: 1, flexShrink: 0 }} />}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)" }}>{c.label}</div>
              <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginTop: 1 }}>{c.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </Dialog>
  );
}

/* ---------- Dialog Lịch sử phiên bản ---------- */
function VersionDialog({ flow, onClose, onRollback }) {
  const L = window.LucideReact;
  const { Dialog, Button, Badge } = window.FSICheckinDesignSystem_019df8;
  const hist = flow.history || [];
  return (
    <Dialog open title="Lịch sử phiên bản luồng" width={480} onClose={onClose} footer={<Button variant="ghost" onClick={onClose}>Đóng</Button>}>
      <div style={{ fontSize: 12.5, color: "var(--text-tertiary)", marginBottom: 12 }}>Mỗi lần kích hoạt sẽ lưu một phiên bản. Có thể quay lại bản trước khi cần.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {hist.slice().reverse().map((h, i) => {
          const current = i === 0;
          return (
            <div key={h.v + "-" + h.time} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: "var(--radius-md)", background: current ? "var(--accent-muted)" : "var(--bg-elevated)", border: "1px solid " + (current ? "var(--accent-border)" : "var(--border-subtle)") }}>
              <span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 8, background: "var(--bg-surface)", border: "1px solid var(--border-default)", display: "grid", placeItems: "center", fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>v{h.v}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{h.note}</span>
                  {current && <Badge tone="info">Hiện hành</Badge>}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                  <L.Clock size={11} /> {h.time} · {h.steps.length} bước
                </div>
              </div>
              {!current && <Button variant="secondary" size="sm" icon={L.RotateCcw} onClick={() => onRollback(h)}>Khôi phục</Button>}
            </div>
          );
        })}
      </div>
    </Dialog>
  );
}

/* ---------- Empty state panel phải ---------- */
function PanelEmpty({ flow }) {
  const L = window.LucideReact;
  const res = window.SaGraph.validateFlow(flow);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, textAlign: "center", color: "var(--text-tertiary)", gap: 10 }}>
        <span style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--bg-inset)", display: "grid", placeItems: "center" }}><L.MousePointerClick size={24} color="var(--text-disabled)" /></span>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-secondary)" }}>Chọn một bước để cấu hình</div>
        <div style={{ fontSize: 12, maxWidth: 220, lineHeight: 1.5 }}>Bấm vào thẻ bước trên sơ đồ để chỉnh vai trò, phụ thuộc, điều kiện chuyển bước & SLA.</div>
      </div>
      <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-tertiary)" }}>Trạng thái luồng</div>
        {res.checks.map((c) => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-secondary)" }}>
            {c.ok ? <L.CircleCheck size={14} color="var(--text-success)" /> : <L.CircleAlert size={14} color="var(--text-danger)" />}
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Trình thiết kế luồng ---------- */
function FlowDesigner({ onToast }) {
  const L = window.LucideReact;
  const D = window.SA_DATA;
  const G = window.SaGraph;
  const { Button, Badge, Select } = window.FSICheckinDesignSystem_019df8;
  const { FlowCanvas } = window.SaCanvas;
  const { StepConfigPanel } = window.SaPanel;

  const [flows, setFlows] = useDz(() => D.flows.map((f) => {
    const steps = cloneSteps(f.steps);
    return { ...f, steps, history: [{ v: f.version || 1, time: f.updated, note: "Phiên bản hiện hành", steps: cloneSteps(steps) }] };
  }));
  const [selId, setSelId] = useDz(flows[0].id);
  const [selStep, setSelStep] = useDz(null);
  const [dialog, setDialog] = useDz(null); // 'validate' | 'version'

  const flow = flows.find((f) => f.id === selId) || flows[0];
  const step = flow.steps.find((s) => s.id === selStep) || null;
  const totalSla = useMemoDz(() => G.totalSla(flow.steps), [flow]);

  const patchFlow = (patch) => setFlows((fs) => fs.map((f) => f.id === selId ? { ...f, ...patch, updated: "Hôm nay" } : f));
  const setSteps = (steps) => patchFlow({ steps });

  /* ---- thao tác bước ---- */
  const patchStep = (id, patch) => setSteps(flow.steps.map((s) => s.id === id ? { ...s, ...patch } : s));

  const reorder = (fromId, toId) => {
    const from = flow.steps.findIndex((s) => s.id === fromId);
    const to = flow.steps.findIndex((s) => s.id === toId);
    if (from < 0 || to < 0 || from === to) return;
    const next = [...flow.steps];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    setSteps(next);
  };

  const addStep = () => {
    const ns = { id: saUid("s"), name: "Bước mới", role: "tknv", op: "draft", deps: [], lockedDeps: [], join: "AND", locked: false, optional: false, enabled: true, blocking: true, gate: "", sla: 15, slaRequired: false, docs: [] };
    setSteps([...flow.steps, ns]);
    setSelStep(ns.id);
    onToast("Đã thêm bước rời", "Kéo chấm nối để gắn vào luồng");
  };

  /* nối 2 bước (kéo-thả trên canvas): to phụ thuộc vào from */
  const connectSteps = (fromId, toId) => {
    const target = flow.steps.find((s) => s.id === toId);
    if (!target || fromId === toId) return;
    if ((target.deps || []).includes(fromId)) { onToast("Hai bước đã được nối", "", "warning"); return; }
    if (G.descendantsOf(toId, flow.steps).has(fromId)) { onToast("Không thể nối — sẽ tạo phụ thuộc vòng", "", "danger"); return; }
    patchStep(toId, { deps: [...(target.deps || []), fromId] });
    const from = flow.steps.find((s) => s.id === fromId);
    onToast("Đã nối liên kết", (from ? from.name : "") + " → " + target.name);
  };

  /* xóa liên kết trên canvas */
  const removeLink = (stepId, dep) => {
    const st = flow.steps.find((s) => s.id === stepId);
    if (!st || (st.lockedDeps || []).includes(dep)) return;
    patchStep(stepId, { deps: (st.deps || []).filter((d) => d !== dep) });
    onToast("Đã xóa liên kết", "");
  };

  const delStep = (id) => {
    const s = flow.steps.find((x) => x.id === id);
    if (!s || s.locked) return;
    const next = flow.steps.filter((x) => x.id !== id).map((x) => ({ ...x, deps: (x.deps || []).filter((d) => d !== id), lockedDeps: (x.lockedDeps || []).filter((d) => d !== id) }));
    setSteps(next);
    setSelStep(null);
    onToast("Đã xóa bước", s.name);
  };

  /* ---- quản lý luồng ---- */
  const createFlow = ({ name, docType, office }) => {
    const nf = { id: saUid("f"), name: name || "Luồng mới", docType: docType || "Văn bản khác", office: office || "Trụ sở chính – Hà Đông", status: "draft", updated: "Hôm nay", version: 1,
      steps: [{ id: saUid("s"), name: "Tiếp nhận & định danh", role: "tiepnhan", op: "intake", deps: [], lockedDeps: [], join: "AND", locked: false, optional: false, enabled: true, blocking: true, gate: "", sla: 15, slaRequired: true, docs: [] }] };
    nf.history = [{ v: 1, time: "Hôm nay", note: "Khởi tạo luồng", steps: cloneSteps(nf.steps) }];
    setFlows((fs) => [nf, ...fs]); setSelId(nf.id); setSelStep(null); setDialog(null);
    onToast("Đã tạo luồng mới", nf.name + " · " + nf.office);
  };

  const cloneFlow = (f) => {
    const nf = { ...f, id: saUid("f"), name: f.name + " (bản sao)", status: "draft", updated: "Hôm nay", version: 1, steps: cloneSteps(f.steps) };
    nf.history = [{ v: 1, time: "Hôm nay", note: "Nhân bản từ: " + f.name, steps: cloneSteps(nf.steps) }];
    setFlows((fs) => [nf, ...fs]); setSelId(nf.id); setSelStep(null);
    onToast("Đã nhân bản luồng", nf.name);
  };

  const publish = () => {
    const v = (flow.version || 1) + 1;
    setFlows((fs) => fs.map((f) => f.id === selId
      ? { ...f, status: "active", version: v, updated: "Hôm nay", history: [...(f.history || []), { v, time: "Hôm nay", note: "Kích hoạt luồng", steps: cloneSteps(f.steps) }] }
      : f));
    setDialog(null);
    onToast("Đã kích hoạt luồng · v" + v, flow.name);
  };

  const unpublish = () => { patchFlow({ status: "draft" }); onToast("Đã chuyển sang nháp", flow.name); };

  const rollback = (h) => {
    setFlows((fs) => fs.map((f) => f.id === selId
      ? { ...f, steps: cloneSteps(h.steps), version: h.v, updated: "Hôm nay", history: [...(f.history || []), { v: h.v, time: "Hôm nay", note: "Khôi phục v" + h.v, steps: cloneSteps(h.steps) }] }
      : f));
    setDialog(null); setSelStep(null);
    onToast("Đã khôi phục phiên bản v" + h.v, flow.name);
  };

  return (
    <div style={{ height: "100%", minHeight: 0, overflow: "auto" }}>
    <div style={{ display: "grid", gridTemplateColumns: "236px minmax(0,1fr) 332px", gap: 14, height: "100%", minHeight: 0, minWidth: 940 }}>
      {/* ===== TRÁI — Thư viện luồng ===== */}
      <aside style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", minHeight: 0, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "13px 14px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>Thư viện luồng</div>
            <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{flows.length} nghiệp vụ độc lập</div>
          </div>
          <Button variant="primary" size="sm" icon={L.Plus} onClick={() => setDialog("newflow")}>Mới</Button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
          {flows.map((f) => {
            const on = f.id === selId;
            return (
              <div key={f.id} onClick={() => { setSelId(f.id); setSelStep(null); }} style={{
                padding: "10px 11px", borderRadius: "var(--radius-md)", cursor: "pointer",
                border: "1px solid " + (on ? "var(--accent-border)" : "var(--border-subtle)"),
                background: on ? "var(--accent-muted)" : "var(--bg-surface)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: on ? "var(--accent-hover)" : "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                  <span style={{ width: 7, height: 7, flexShrink: 0, borderRadius: "50%", background: f.status === "active" ? "var(--color-success)" : "var(--border-strong)" }} title={f.status === "active" ? "Đang áp dụng" : "Bản nháp"} />
                </div>
                <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 3, display: "flex", alignItems: "center", gap: 6 }}>
                  <L.Tag size={11} /> {f.docType} · {f.steps.length} bước
                </div>
                <div style={{ fontSize: 10.5, color: "var(--text-disabled)", marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
                  <L.GitCommitVertical size={11} /> v{f.version} · {f.office}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ padding: "10px 12px", borderTop: "1px solid var(--border-subtle)", fontSize: 10.5, color: "var(--text-disabled)", display: "flex", alignItems: "center", gap: 6 }}>
          <L.Info size={12} /> Sửa luồng này không ảnh hưởng luồng khác.
        </div>
      </aside>

      {/* ===== GIỮA — Canvas ===== */}
      <section style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", minHeight: 0, minWidth: 0, overflow: "hidden" }}>
        <header style={{ padding: "13px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <input value={flow.name} onChange={(e) => patchFlow({ name: e.target.value })}
                style={{ width: "100%", border: "1px solid transparent", borderRadius: 6, padding: "2px 6px", margin: "-2px -6px 0", fontSize: 17, fontWeight: 700, fontFamily: "var(--font-sans)", color: "var(--text-primary)", background: "transparent" }}
                onFocus={(e) => { e.target.style.background = "var(--bg-inset)"; e.target.style.borderColor = "var(--border-default)"; }}
                onBlur={(e) => { e.target.style.background = "transparent"; e.target.style.borderColor = "transparent"; }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                <div style={{ width: 158 }}><Select value={flow.docType} onChange={(v) => patchFlow({ docType: v })} options={SA_DOC_TYPES} /></div>
                <div style={{ width: 210 }}><Select value={flow.office} onChange={(v) => patchFlow({ office: v })} options={SA_OFFICES()} /></div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--text-tertiary)" }}><L.Timer size={12} /> Đường găng {totalSla}′</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--text-tertiary)" }}><L.GitCommitVertical size={12} /> v{flow.version}</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <Badge tone={flow.status === "active" ? "success" : "neutral"} dot>{flow.status === "active" ? "Đang áp dụng" : "Bản nháp"}</Badge>
              <Button variant="ghost" size="sm" icon={L.History} onClick={() => setDialog("version")}>Phiên bản</Button>
              <Button variant="secondary" size="sm" icon={L.Copy} onClick={() => cloneFlow(flow)}>Nhân bản</Button>
              <Button variant="secondary" size="sm" icon={L.Plus} onClick={addStep}>Thêm bước</Button>
              {flow.status === "active"
                ? <Button variant="secondary" size="sm" icon={L.PauseCircle} onClick={unpublish}>Chuyển nháp</Button>
                : <Button variant="primary" size="sm" icon={L.Rocket} onClick={() => setDialog("validate")}>Kích hoạt</Button>}
            </div>
          </div>
        </header>
        <div style={{ flex: 1, minHeight: 0 }}>
          <FlowCanvas flow={flow} selId={selStep} onSelect={setSelStep} onReorder={reorder} onConnect={connectSteps} onRemoveLink={removeLink} />
        </div>
      </section>

      {/* ===== PHẢI — Cấu hình bước ===== */}
      <aside style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", minHeight: 0, minWidth: 0, overflow: "hidden" }}>
        {step
          ? <StepConfigPanel flow={flow} step={step} onPatch={patchStep} onDelete={delStep} onToast={onToast} />
          : <PanelEmpty flow={flow} />}
      </aside>

      {dialog === "validate" && <ValidateDialog flow={flow} onClose={() => setDialog(null)} onPublish={publish} />}
      {dialog === "version" && <VersionDialog flow={flow} onClose={() => setDialog(null)} onRollback={rollback} />}
      {dialog === "newflow" && <NewFlowDialog onClose={() => setDialog(null)} onCreate={createFlow} />}
    </div>
    </div>
  );
}

window.SaDesigner = { FlowDesigner };
