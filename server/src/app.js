const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const hoSoRoutes = require("./routes/ho-so");
const bieuMauRoutes = require("./routes/bieu-mau");
const nhanVienRoutes = require("./routes/nhan-vien");
const noiLamViecRoutes = require("./routes/noi-lam-viec");
const uyThacRoutes = require("./routes/uy-thac");
const auditLogRoutes = require("./routes/audit-log");

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "5mb" }));

app.get("/health", (req, res) => res.json({ ok: true, service: "vpcc-viet-an-server" }));

app.use("/api/auth", authRoutes);
app.use("/api/ho-so", hoSoRoutes);
app.use("/api/bieu-mau", bieuMauRoutes);
app.use("/api/nhan-vien", nhanVienRoutes);
app.use("/api/noi-lam-viec", noiLamViecRoutes);
app.use("/api/uy-thac", uyThacRoutes);
app.use("/api/audit-log", auditLogRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
});

module.exports = app;
