/* global window */
/* PH05 — Tiện ích đồ thị luồng (config-driven workflow graph)
   Thuần JS, không phụ thuộc React. Dùng chung cho canvas + panel cấu hình + validate. */

/* Bước "hiện hữu" trong luồng = các bước không bị tắt (optional + !enabled bị loại). */
function activeSteps(steps) {
  return steps.filter((s) => !(s.optional && !s.enabled));
}

/* deps đã lọc bỏ những bước không còn tồn tại */
function cleanDeps(step, steps) {
  const ids = new Set(steps.map((s) => s.id));
  return (step.deps || []).filter((d) => ids.has(d));
}

/* Bản đồ: bước nào phụ thuộc trực tiếp vào stepId (children) */
function dependentsOf(stepId, steps) {
  return steps.filter((s) => (s.deps || []).includes(stepId));
}

/* Toàn bộ hậu duệ (descendants) của stepId — để chặn phụ thuộc vòng. */
function descendantsOf(stepId, steps) {
  const map = {};
  steps.forEach((s) => (s.deps || []).forEach((d) => { (map[d] = map[d] || []).push(s.id); }));
  const out = new Set();
  const stack = [...(map[stepId] || [])];
  while (stack.length) {
    const id = stack.pop();
    if (out.has(id)) continue;
    out.add(id);
    (map[id] || []).forEach((c) => stack.push(c));
  }
  return out;
}

/* Phát hiện chu trình (cycle) trong đồ thị phụ thuộc. Trả về true nếu CÓ vòng. */
function hasCycle(steps) {
  const state = {}; // 0 = chưa thăm, 1 = đang thăm, 2 = xong
  const byId = Object.fromEntries(steps.map((s) => [s.id, s]));
  let found = false;
  function visit(id) {
    if (found) return;
    state[id] = 1;
    const s = byId[id];
    (s ? cleanDeps(s, steps) : []).forEach((d) => {
      if (state[d] === 1) { found = true; return; }
      if (!state[d]) visit(d);
    });
    state[id] = 2;
  }
  steps.forEach((s) => { if (!state[s.id]) visit(s.id); });
  return found;
}

/* Dựng đồ thị hiển thị: chèn NODE GỘP (join) khi một bước có ≥2 phụ thuộc.
   includeDisabled = true → vẫn vẽ bước đang tắt (dạng ghost) trên canvas.
   Trả về { nodes, edges } với node.kind = 'step' | 'join'. */
function buildDisplayGraph(steps, includeDisabled) {
  const nodes = [];
  const edges = [];
  const present = includeDisabled ? steps : activeSteps(steps);
  const presentIds = new Set(present.map((s) => s.id));
  present.forEach((s) => {
    const deps = cleanDeps(s, steps).filter((d) => presentIds.has(d));
    if (deps.length >= 2) {
      const jid = "join__" + s.id;
      nodes.push({ id: jid, kind: "join", mode: s.join || "AND", forStep: s.id });
      deps.forEach((d) => edges.push({ from: d, to: jid }));
      edges.push({ from: jid, to: s.id });
    } else {
      deps.forEach((d) => edges.push({ from: d, to: s.id }));
    }
  });
  present.forEach((s) => nodes.push({ id: s.id, kind: "step", step: s, ghost: !!(s.optional && !s.enabled) }));
  return { nodes, edges };
}

/* Gán cấp (level) theo đường dài nhất từ gốc → bố cục cột trái-phải. */
function assignLevels(nodes, edges) {
  const parents = {}; // node -> [parents]
  nodes.forEach((n) => (parents[n.id] = []));
  edges.forEach((e) => { (parents[e.to] = parents[e.to] || []).push(e.from); });
  const level = {};
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  function lvl(id) {
    if (level[id] != null) return level[id];
    const ps = parents[id] || [];
    if (!ps.length) return (level[id] = 0);
    level[id] = 1; // tạm để chặn đệ quy vô hạn nếu có vòng
    let m = 0;
    ps.forEach((p) => { if (byId[p]) m = Math.max(m, lvl(p) + 1); });
    return (level[id] = m);
  }
  nodes.forEach((n) => lvl(n.id));
  return level;
}

/* Bố cục: trả về vị trí {x,y,w,h} cho từng node + kích thước canvas. */
function layout(steps, opts) {
  const o = Object.assign({ nodeW: 204, nodeH: 132, joinW: 128, joinH: 52, colGap: 80, rowGap: 30, padX: 32, padY: 32, includeDisabled: false }, opts || {});
  const { nodes, edges } = buildDisplayGraph(steps, o.includeDisabled);
  const level = assignLevels(nodes, edges);
  // gom theo cấp
  const cols = {};
  nodes.forEach((n) => { (cols[level[n.id]] = cols[level[n.id]] || []).push(n); });
  const maxLevel = Math.max(0, ...nodes.map((n) => level[n.id]));

  // thứ tự dọc trong cột: ưu tiên theo barycenter của cha; fallback theo thứ tự bước gốc
  const stepOrder = Object.fromEntries(steps.map((s, i) => [s.id, i]));
  const parents = {};
  edges.forEach((e) => { (parents[e.to] = parents[e.to] || []).push(e.from); });
  const orderKey = (n) => {
    const ps = parents[n.id] || [];
    if (n.kind === "join") return stepOrder[n.forStep] ?? 0;
    if (!ps.length) return stepOrder[n.id] ?? 0;
    const avg = ps.reduce((a, p) => a + (stepOrder[p.replace("join__", "")] ?? 0), 0) / ps.length;
    return avg + (stepOrder[n.id] ?? 0) * 0.001;
  };

  // chiều cao mỗi cột
  const colHeight = (arr) => arr.reduce((a, n) => a + (n.kind === "join" ? o.joinH : o.nodeH) + o.rowGap, -o.rowGap);
  let maxColH = 0;
  Object.values(cols).forEach((arr) => { maxColH = Math.max(maxColH, colHeight(arr)); });

  const pos = {};
  for (let lv = 0; lv <= maxLevel; lv++) {
    const arr = (cols[lv] || []).slice().sort((a, b) => orderKey(a) - orderKey(b));
    const ch = colHeight(arr);
    let y = o.padY + (maxColH - ch) / 2;
    const x = o.padX + lv * (o.nodeW + o.colGap);
    arr.forEach((n) => {
      const isJoin = n.kind === "join";
      const w = isJoin ? o.joinW : o.nodeW;
      const h = isJoin ? o.joinH : o.nodeH;
      pos[n.id] = { x: x + (o.nodeW - w) / 2, y, w, h, level: lv };
      y += h + o.rowGap;
    });
  }
  const width = o.padX * 2 + (maxLevel + 1) * o.nodeW + maxLevel * o.colGap;
  const height = o.padY * 2 + maxColH;
  return { nodes, edges, pos, width, height, level };
}

/* Validate toàn luồng trước khi Publish. Trả về danh sách kiểm tra. */
function validateFlow(flow) {
  const steps = flow.steps;
  const present = activeSteps(steps);
  const checks = [];

  // 1) đủ các bước khóa pháp lý (mọi bước locked phải đang bật)
  const lockedOff = steps.filter((s) => s.locked && s.optional && !s.enabled);
  checks.push({
    id: "locked",
    label: "Đủ các bước khóa pháp lý",
    ok: lockedOff.length === 0,
    detail: lockedOff.length ? "Đang tắt: " + lockedOff.map((s) => s.name).join(", ") : "Mọi bước [Khóa] đều đang bật",
  });

  // 2) không có phụ thuộc vòng
  const cyc = hasCycle(present);
  checks.push({ id: "cycle", label: "Không có phụ thuộc vòng", ok: !cyc, detail: cyc ? "Phát hiện chu trình phụ thuộc" : "Đồ thị phụ thuộc hợp lệ" });

  // 3) mọi bước đã gán vai trò
  const noRole = present.filter((s) => !s.role);
  checks.push({ id: "role", label: "Mọi bước đã gán vai trò", ok: noRole.length === 0, detail: noRole.length ? noRole.length + " bước thiếu vai trò" : present.length + " bước đã gán vai trò" });

  // 4) phụ thuộc trỏ tới bước đang tồn tại
  const presentIds = new Set(present.map((s) => s.id));
  const dangling = present.filter((s) => (s.deps || []).some((d) => !presentIds.has(d) && steps.find((x) => x.id === d)));
  checks.push({
    id: "dangling",
    label: "Phụ thuộc không trỏ tới bước đã tắt",
    ok: dangling.length === 0,
    detail: dangling.length ? dangling.length + " bước phụ thuộc vào bước đang tắt" : "Tất cả phụ thuộc đều hợp lệ",
  });

  // 5) có ít nhất một bước gốc (không phụ thuộc)
  const roots = present.filter((s) => cleanDeps(s, present).length === 0);
  checks.push({ id: "root", label: "Có bước khởi đầu", ok: roots.length >= 1, detail: roots.length ? roots.length + " bước khởi đầu" : "Không có bước gốc" });

  return { checks, ok: checks.every((c) => c.ok) };
}

/* Kiểm tra an toàn khi TẮT một bước optional: ai đang phụ thuộc vào nó? */
function canDisable(step, steps) {
  const deps = dependentsOf(step.id, steps).filter((s) => !(s.optional && !s.enabled));
  return { ok: deps.length === 0, blockers: deps };
}

/* Tổng SLA theo đường găng (critical path) của các bước đang bật + blocking. */
function totalSla(steps) {
  const present = activeSteps(steps);
  const byId = Object.fromEntries(present.map((s) => [s.id, s]));
  const memo = {};
  function pathSla(id) {
    if (memo[id] != null) return memo[id];
    const s = byId[id];
    if (!s) return 0;
    const deps = cleanDeps(s, present);
    const base = s.blocking ? s.sla : 0;
    let m = 0;
    deps.forEach((d) => { m = Math.max(m, pathSla(d)); });
    return (memo[id] = m + base);
  }
  let max = 0;
  present.forEach((s) => { max = Math.max(max, pathSla(s.id)); });
  return max;
}

window.SaGraph = {
  activeSteps, cleanDeps, dependentsOf, descendantsOf, hasCycle,
  buildDisplayGraph, assignLevels, layout, validateFlow, canDisable, totalSla,
};
