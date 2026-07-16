const { WebSocketServer } = require("ws");
const jwt = require("jsonwebtoken");

// Đẩy thông báo real-time qua WebSocket — dùng chung 1 cổng HTTP (nâng cấp qua
// "upgrade") nên không cần cổng/CORS riêng. Xác thực qua query string
// ("?token=...") vì WebSocket trình duyệt không set được header tùy ý.
const byUser = new Map(); // userId -> Set<ws>
const byRole = new Map(); // vaiTro -> Set<ws>

function addTo(map, key, ws) {
  let set = map.get(key);
  if (!set) { set = new Set(); map.set(key, set); }
  set.add(ws);
}
function removeFrom(map, key, ws) {
  const set = map.get(key);
  if (set) set.delete(ws);
}

function init(httpServer) {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  wss.on("connection", (ws, req) => {
    const qs = (req.url.split("?")[1] || "");
    const token = new URLSearchParams(qs).get("token");
    let user;
    try {
      user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      ws.close();
      return;
    }
    addTo(byUser, user.id, ws);
    (user.vaiTro || []).forEach((r) => addTo(byRole, r, ws));

    ws.on("close", () => {
      removeFrom(byUser, user.id, ws);
      (user.vaiTro || []).forEach((r) => removeFrom(byRole, r, ws));
    });
  });
}

function send(set, payload) {
  if (!set) return;
  const data = JSON.stringify(payload);
  set.forEach((ws) => { if (ws.readyState === 1) ws.send(data); });
}
function notifyRole(vaiTro, payload) { send(byRole.get(vaiTro), payload); }
function notifyUser(userId, payload) { send(byUser.get(userId), payload); }

module.exports = { init, notifyRole, notifyUser };
