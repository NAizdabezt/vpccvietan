/* REQ-053: CCV kế thừa toàn bộ quyền soạn thảo của TKNV nhưng có cấp quyền cao hơn.
   requireRole("TKNV") do đó cũng phải cho CCV đi qua. QTHT (quản trị hệ thống)
   luôn được coi là có mọi quyền (đúng vai trò quản trị toàn hệ thống). */
function expandRoles(vaiTro) {
  const set = new Set(vaiTro);
  if (set.has("CCV")) set.add("TKNV");
  return set;
}

function requireRole(...allowed) {
  return (req, res, next) => {
    const vaiTro = (req.user && req.user.vaiTro) || [];
    if (vaiTro.includes("QTHT")) return next();
    const mine = expandRoles(vaiTro);
    const ok = allowed.some((r) => mine.has(r));
    if (!ok) return res.status(403).json({ error: "Không đủ quyền cho thao tác này" });
    next();
  };
}

module.exports = { requireRole };
