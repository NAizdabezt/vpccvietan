const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const khachHangRoutes = require("./routes/khach-hang");
const hoSoRoutes = require("./routes/ho-so");
const bieuMauRoutes = require("./routes/bieu-mau");
const hoaDonRoutes = require("./routes/hoa-don");
const nhanVienRoutes = require("./routes/nhan-vien");
const noiLamViecRoutes = require("./routes/noi-lam-viec");
const uyThacRoutes = require("./routes/uy-thac");
const auditLogRoutes = require("./routes/audit-log");
const thongBaoRoutes = require("./routes/thong-bao");
const luongNghiepVuRoutes = require("./routes/luong-nghiep-vu");

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "5mb" }));

app.get("/health", (req, res) => res.json({ ok: true, service: "vpcc-viet-an-server" }));

// Chỉ đọc — xem lại file đã số hóa đã lưu thật (Mốc 6, xem lib/upload.js)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/khach-hang", khachHangRoutes);
app.use("/api/ho-so", hoSoRoutes);
app.use("/api/bieu-mau", bieuMauRoutes);
app.use("/api/hoa-don", hoaDonRoutes);
app.use("/api/nhan-vien", nhanVienRoutes);
app.use("/api/noi-lam-viec", noiLamViecRoutes);
app.use("/api/uy-thac", uyThacRoutes);
app.use("/api/audit-log", auditLogRoutes);
app.use("/api/thong-bao", thongBaoRoutes);
app.use("/api/luong-nghiep-vu", luongNghiepVuRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
});

module.exports = app;
