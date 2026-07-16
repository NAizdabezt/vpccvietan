// Express 4 không tự bắt lỗi reject trong route handler async — lỗi rơi thành
// unhandled rejection và làm sập cả tiến trình Node. Bọc handler bằng hàm này
// để lỗi được chuyển cho middleware xử lý lỗi chung trong app.js.
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { asyncHandler };
