const express = require("express");
const { prisma } = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// Danh sách đầy đủ CRUD (thêm/sửa/xóa biểu mẫu) thuộc Mốc 6 — hiện tại chỉ cần
// GET để các màn khác (soạn thảo, Thu ngân) chọn loại hợp đồng cho hồ sơ.
router.get("/", async (req, res) => {
  const rows = await prisma.bieuMau.findMany({ orderBy: { ten: "asc" } });
  res.json(rows);
});

module.exports = router;
