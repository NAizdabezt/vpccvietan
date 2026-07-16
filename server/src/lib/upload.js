const multer = require("multer");

// NFR-014: file scan thật ≤ 10MB. Dùng memoryStorage — tên file & đường dẫn
// thật do route handler quyết định (cần tra hoSo.soCongChung trước khi đặt tên
// theo đúng quy ước "0036-[SốCC]-[năm]-[VB/HS]", không tin tên client gửi lên
// để tránh path traversal).
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_FILE_SIZE } });

// Bọc lại upload.single để trả lỗi tiếng Việt đúng format {error: "..."} như
// phần còn lại của API, thay vì để lỗi multer rơi xuống error handler chung.
function single(fieldName) {
  const mw = upload.single(fieldName);
  return (req, res, next) => {
    mw(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: `File vượt quá dung lượng cho phép (tối đa ${MAX_FILE_SIZE / (1024 * 1024)}MB)` });
        }
        return res.status(400).json({ error: err.message || "Lỗi tải file lên" });
      }
      next();
    });
  };
}

module.exports = { single, MAX_FILE_SIZE };
