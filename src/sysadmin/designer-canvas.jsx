/* global React, window */
/* PH05 — Canvas sơ đồ luồng có RẼ NHÁNH + NODE GỘP (join)
   - Kéo từ chấm nối bên phải của một bước tới bước khác để TẠO liên kết phụ thuộc.
   - Bấm vào đường nối để XÓA liên kết (trừ phụ thuộc khóa hệ thống).
   - Kéo thân thẻ để sắp xếp vị trí dọc — bước [Khóa] không cho kéo. */
const { useRef: useRefCv, useState: useStateCv } = React;

const NODE_W = 204, NODE_H = 132;

/* ---- Badge thuộc tính bước ---- */
function AttrBadge({ kind }) {
  const L = window.LucideReact;
  const map = {
    locked:   { icon: L.Lock,        label: "Khóa",     bg: "var(--bg-warning)", fg: "var(--text-warning)", bd: "var(--border-warning)" },
    optional: { icon: L.ToggleRight, label: "Tùy chọn", bg: "var(--bg-surface)", fg: "var(--text-tertiary)", bd: "var(--border-default)" },
    bg:       { icon: L.Activity,    label: "Chạy nền", bg: "var(--bg-info)",    fg: "var(--text-info)",    bd: "var(--border-info)" },
  };
  const c = map[kind];
  const Icon = c.icon;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 6px", borderRadius: "var(--radius-full)", fontSize: 10, fontWeight: 700, background: c.bg, color: c.fg, border: "1px solid " + c.bd, whiteSpace: "nowrap" }}>
      <Icon size={10} /> {c.label}
    </span>
  );
}

/* ---- Chip vai trò nhỏ ---- */
function MiniRole({ roleId }) {
  const r = window.SA_roleOf(roleId);
  const L = window.LucideReact;
  const Icon = L[r.icon] || L.Circle;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 7px", borderRadius: "var(--radius-full)", fontSize: 10.5, fontWeight: 600, background: r.color + "16", color: r.color, whiteSpace: "nowrap" }}>
      <Icon size={11} /> {r.short}
    </span>
  );
}

/* ---- Chấm nối ---- */
function Handle({ side, color, onStart, connecting }) {
  const isOut = side === "out";
  return (
    <span
      onMouseDown={isOut ? onStart : undefined}
      title={isOut ? "Kéo để nối tới bước khác" : "Điểm nhận liên kết"}
      style={{
        position: "absolute", top: "50%", [isOut ? "right" : "left"]: -7, transform: "translateY(-50%)",
        width: 14, height: 14, borderRadius: "50%", boxSizing: "border-box",
        background: isOut ? "var(--bg-surface)" : "var(--bg-elevated)",
        border: "2px solid " + (isOut ? color : "var(--border-strong)"),
        cursor: isOut ? "crosshair" : "default", zIndex: 6,
        boxShadow: connecting ? "0 0 0 4px var(--accent-muted)" : "none",
      }} />
  );
}

/* ---- Thẻ bước trên canvas ---- */
function StepNode({ node, p, idx, selected, onSelect, dnd, onStartConnect, connectFrom, connectTarget }) {
  const L = window.LucideReact;
  const s = node.step;
  const r = window.SA_roleOf(s.role);
  const op = window.SA_opOf(s.op);
  const OpIcon = L[op.icon] || L.Circle;
  const ghost = node.ghost;
  const draggable = !s.locked;
  const isOver = dnd.overId === s.id && dnd.dragId && dnd.dragId !== s.id;
  const isTarget = connectTarget === s.id && connectFrom && connectFrom !== s.id;

  return (
    <div
      data-node-id={s.id}
      onClick={(e) => { e.stopPropagation(); onSelect(s.id); }}
      draggable={draggable}
      onDragStart={draggable ? (e) => { if (dnd.connecting) { e.preventDefault(); return; } dnd.start(e, s.id); } : undefined}
      onDragOver={(e) => dnd.over(e, s.id)}
      onDrop={(e) => dnd.drop(e, s.id)}
      onDragEnd={dnd.end}
      style={{
        position: "absolute", left: p.x, top: p.y, width: p.w, height: p.h, boxSizing: "border-box",
        background: ghost ? "var(--bg-elevated)" : "var(--bg-surface)",
        border: "1px solid " + (selected ? "var(--accent)" : isTarget ? "var(--color-success)" : isOver ? "var(--accent-border)" : "var(--border-default)"),
        borderTop: "3px solid " + (ghost ? "var(--border-strong)" : r.color),
        borderRadius: "var(--radius-md)",
        boxShadow: selected ? "0 0 0 3px var(--accent-muted), var(--shadow-md)" : isTarget ? "0 0 0 3px var(--bg-success)" : "var(--shadow-sm)",
        opacity: ghost ? 0.6 : (dnd.dragId === s.id ? 0.4 : 1),
        borderStyle: ghost ? "dashed" : "solid",
        padding: "9px 11px 10px", display: "flex", flexDirection: "column", gap: 6, cursor: "pointer",
        transition: "box-shadow .12s, border-color .12s, opacity .12s", zIndex: selected ? 5 : 2,
      }}>
      <Handle side="in" color={r.color} />
      <Handle side="out" color={r.color} connecting={connectFrom === s.id} onStart={(e) => onStartConnect(e, s.id)} />
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 18, height: 18, flexShrink: 0, borderRadius: "50%", background: "var(--bg-inset)", color: "var(--text-tertiary)", display: "grid", placeItems: "center", fontSize: 9.5, fontWeight: 700, fontFamily: "var(--font-mono)" }}>{idx + 1}</span>
        <span style={{ width: 22, height: 22, flexShrink: 0, borderRadius: 6, background: r.color + "16", display: "grid", placeItems: "center" }}><OpIcon size={13} color={r.color} /></span>
        <span style={{ flex: 1 }} />
        {s.locked
          ? <L.Lock size={13} color="var(--text-warning)" />
          : draggable && <L.GripVertical size={13} color="var(--text-disabled)" style={{ cursor: "grab" }} />}
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.25, color: "var(--text-primary)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{s.name}</div>
      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
        <MiniRole roleId={s.role} />
        <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10.5, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}><L.Timer size={10} /> {s.sla}′</span>
        {s.locked && <AttrBadge kind="locked" />}
        {s.optional && <AttrBadge kind="optional" />}
        {!s.blocking && <AttrBadge kind="bg" />}
      </div>
    </div>
  );
}

/* ---- Node gộp (join) ---- */
function JoinNode({ node, p, onSelect }) {
  const L = window.LucideReact;
  const isAnd = node.mode === "AND";
  return (
    <div
      data-node-id={node.id}
      onClick={(e) => { e.stopPropagation(); onSelect(node.forStep); }}
      title={isAnd ? "Gộp AND — chờ tất cả nhánh" : "Gộp OR — chờ bất kỳ nhánh"}
      style={{
        position: "absolute", left: p.x, top: p.y, width: p.w, height: p.h, boxSizing: "border-box",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", zIndex: 3,
        background: "var(--bg-elevated)", border: "1.5px dashed var(--border-strong)", borderRadius: "var(--radius-full)",
        color: "var(--text-secondary)", fontSize: 11.5, fontWeight: 700,
      }}>
      <L.GitMerge size={14} color="var(--text-secondary)" />
      Gộp · {node.mode}
    </div>
  );
}

/* ---- Connectors (SVG bezier + mũi tên + xóa) ---- */
function Connectors({ flow, edges, pos, width, height, temp, onRemove }) {
  const [hover, setHover] = useStateCv(null);
  const curve = (a, b) => {
    if (!a || !b) return "";
    const x1 = a.x + a.w, y1 = a.y + a.h / 2;
    const x2 = b.x, y2 = b.y + b.h / 2;
    const dx = Math.max(36, (x2 - x1) * 0.5);
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  };
  // liên kết phụ thuộc tương ứng với 1 cạnh (để xóa)
  const depOf = (e) => {
    if (String(e.from).startsWith("join__")) return null; // cạnh join→bước: không xóa trực tiếp
    const stepId = String(e.to).startsWith("join__") ? String(e.to).replace("join__", "") : e.to;
    const st = flow.steps.find((s) => s.id === stepId);
    if (!st) return null;
    if ((st.lockedDeps || []).includes(e.from)) return { stepId, dep: e.from, locked: true };
    return { stepId, dep: e.from, locked: false };
  };

  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1, overflow: "visible" }}>
      <defs>
        <marker id="sa-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 1 L 9 5 L 0 9 z" fill="var(--border-strong)" />
        </marker>
        <marker id="sa-arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 1 L 9 5 L 0 9 z" fill="var(--color-danger)" />
        </marker>
      </defs>
      {edges.map((e, i) => {
        const d = curve(pos[e.from], pos[e.to]);
        const meta = depOf(e);
        const removable = meta && !meta.locked;
        const isHover = hover === i && removable;
        return (
          <g key={i}>
            <path d={d} fill="none" stroke={isHover ? "var(--color-danger)" : (meta && meta.locked ? "var(--border-default)" : "var(--border-strong)")} strokeWidth="1.6" strokeDasharray={meta && meta.locked ? "5 4" : "none"} markerEnd={isHover ? "url(#sa-arrow-red)" : "url(#sa-arrow)"} />
            {removable && (
              <path d={d} fill="none" stroke="transparent" strokeWidth="14" style={{ pointerEvents: "stroke", cursor: "pointer" }}
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover((h) => h === i ? null : h)}
                onClick={(ev) => { ev.stopPropagation(); onRemove(meta.stepId, meta.dep); }}>
                <title>Bấm để xóa liên kết</title>
              </path>
            )}
          </g>
        );
      })}
      {temp && (
        <path d={`M ${temp.x1} ${temp.y1} C ${temp.x1 + 40} ${temp.y1}, ${temp.x2 - 40} ${temp.y2}, ${temp.x2} ${temp.y2}`}
          fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#sa-arrow)" />
      )}
    </svg>
  );
}

/* ---- Canvas chính ---- */
function FlowCanvas({ flow, selId, onSelect, onReorder, onConnect, onRemoveLink }) {
  const G = window.SaGraph;
  const L = window.LucideReact;
  const innerRef = useRefCv(null);
  const [zoom, setZoom] = useStateCv(1);
  const dragRef = useRefCv(null);
  const [dragId, setDragId] = useStateCv(null);
  const [overId, setOverId] = useStateCv(null);
  const [connect, setConnect] = useStateCv(null); // {fromId, x1, y1, x2, y2, target}
  const connectRef = useRefCv(null);
  const suppressClick = useRefCv(false);

  const { nodes, edges, pos, width, height } = G.layout(flow.steps, { nodeW: NODE_W, nodeH: NODE_H, includeDisabled: true });

  const dnd = {
    dragId, overId, connecting: !!connect,
    start: (e, id) => { dragRef.current = id; setDragId(id); e.dataTransfer.effectAllowed = "move"; e.stopPropagation(); },
    over: (e, id) => { e.preventDefault(); if (dragRef.current && id !== overId) setOverId(id); },
    drop: (e, id) => { e.preventDefault(); const from = dragRef.current; if (from && from !== id) onReorder(from, id); setDragId(null); setOverId(null); dragRef.current = null; },
    end: () => { setDragId(null); setOverId(null); dragRef.current = null; },
  };

  const ptToCanvas = (e) => {
    const r = innerRef.current.getBoundingClientRect();
    return { x: (e.clientX - r.left) / zoom, y: (e.clientY - r.top) / zoom };
  };

  const startConnect = (e, fromId) => {
    e.preventDefault(); e.stopPropagation();
    const sp = pos[fromId];
    const base = { fromId, x1: sp.x + sp.w, y1: sp.y + sp.h / 2 };
    const q = ptToCanvas(e);
    const c = { ...base, x2: q.x, y2: q.y, target: null };
    connectRef.current = c; setConnect(c);
    const move = (ev) => {
      const p = ptToCanvas(ev);
      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      const nodeEl = el && el.closest("[data-node-id]");
      const tid = nodeEl ? nodeEl.getAttribute("data-node-id") : null;
      const valid = tid && tid !== connectRef.current.fromId && !tid.startsWith("join__");
      const nc = { ...connectRef.current, x2: p.x, y2: p.y, target: valid ? tid : null };
      connectRef.current = nc; setConnect(nc);
    };
    const up = (ev) => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      const cur = connectRef.current;
      if (cur && cur.target) onConnect(cur.fromId, cur.target);
      suppressClick.current = true; setTimeout(() => { suppressClick.current = false; }, 30);
      connectRef.current = null; setConnect(null);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const z = (d) => setZoom((v) => Math.min(1.4, Math.max(0.5, +(v + d).toFixed(2))));

  return (
    <div style={{ position: "relative", height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ position: "absolute", top: 12, right: 14, zIndex: 20, display: "flex", alignItems: "center", gap: 6, background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: 4, boxShadow: "var(--shadow-sm)" }}>
        <button type="button" onClick={() => z(-0.1)} title="Thu nhỏ" style={cvBtn}><L.Minus size={15} /></button>
        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", width: 38, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
        <button type="button" onClick={() => z(0.1)} title="Phóng to" style={cvBtn}><L.Plus size={15} /></button>
        <span style={{ width: 1, height: 18, background: "var(--border-default)" }} />
        <button type="button" onClick={() => setZoom(1)} title="Khít màn hình" style={cvBtn}><L.Maximize2 size={15} /></button>
      </div>

      <div style={{ position: "absolute", top: 12, left: 14, zIndex: 20, display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-sm)", fontSize: 11, color: "var(--text-tertiary)" }}>
        <L.MousePointer2 size={12} /> Kéo từ chấm phải để nối · bấm đường nối để xóa
      </div>

      <div onClick={() => { if (suppressClick.current) return; onSelect(null); }}
        style={{ flex: 1, minHeight: 0, overflow: "auto",
          backgroundImage: "radial-gradient(var(--border-subtle) 1.1px, transparent 1.1px)",
          backgroundSize: "20px 20px", backgroundColor: "var(--bg-base)" }}>
        <div style={{ width: width * zoom, height: height * zoom }}>
          <div ref={innerRef} style={{ position: "relative", width, height, transform: `scale(${zoom})`, transformOrigin: "top left" }}>
            <Connectors flow={flow} edges={edges} pos={pos} width={width} height={height} temp={connect} onRemove={onRemoveLink} />
            {nodes.map((n) =>
              n.kind === "join"
                ? <JoinNode key={n.id} node={n} p={pos[n.id]} onSelect={onSelect} />
                : <StepNode key={n.id} node={n} p={pos[n.id]} idx={flow.steps.findIndex((x) => x.id === n.id)} selected={selId === n.id} onSelect={onSelect} dnd={dnd}
                    onStartConnect={startConnect} connectFrom={connect && connect.fromId} connectTarget={connect && connect.target} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
const cvBtn = { border: "none", background: "transparent", cursor: "pointer", color: "var(--text-secondary)", width: 26, height: 26, borderRadius: 6, display: "grid", placeItems: "center" };

window.SaCanvas = { FlowCanvas };
