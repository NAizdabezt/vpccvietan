# VPCC Việt An

Prototype giao diện (UI) cho hệ thống quản lý Văn phòng Công chứng Việt An — trình bày các màn hình nghiệp vụ chính: tiếp nhận & soạn thảo hồ sơ, thu ngân/POS, kế toán, lưu trữ - số hóa, và quản trị hệ thống.

**🔗 Demo trực tiếp:** [naizdabezt.github.io/vpccvietan](https://naizdabezt.github.io/vpccvietan/)

## Các màn hình

| Trang | Mô tả |
|---|---|
| [`Đăng nhập.html`](Đăng%20nhập.html) | Cổng đăng nhập, chọn vai trò |
| [`index.html`](index.html) | Soạn thảo hồ sơ công chứng (PH01) — tổng quan, soạn thảo, hàng chờ ảnh, yêu cầu hiệu chỉnh |
| [`Thu ngân.html`](Thu%20ngân.html) | Thu ngân / POS — thu phí, in biên lai |
| [`Kế toán.html`](Kế%20toán.html) | Kế toán — đối soát, báo cáo thu chi |
| [`Lưu trữ - Số hóa.html`](Lưu%20trữ%20-%20Số%20hóa.html) | Lưu trữ hồ sơ & số hóa tài liệu |
| [`Quản trị - Dashboard.html`](Quản%20trị%20-%20Dashboard.html) | Dashboard quản trị, số liệu tổng quan |
| [`Quản trị hệ thống.html`](Quản%20trị%20hệ%20thống.html) | Quản trị hệ thống — phân quyền, thiết kế luồng nghiệp vụ |

## Công nghệ

Đây là dự án **HTML tĩnh, không cần build**:

- [React 18](https://react.dev/) + [Babel Standalone](https://babeljs.io/docs/babel-standalone) load trực tiếp qua CDN, biên dịch JSX ngay trong trình duyệt
- [Lucide Icons](https://lucide.dev/) cho icon
- Design system riêng (`_ds/`) — token màu sắc, font, spacing dùng chung
- Toàn bộ logic màn hình nằm trong `src/*.jsx`, không có bước bundler/npm

## Chạy thử trên máy

Không cần cài đặt gì — chỉ cần mở trực tiếp file `.html` bằng trình duyệt, hoặc dùng một static server đơn giản:

```bash
npx serve .
```

rồi truy cập `http://localhost:3000`.

## Cấu trúc thư mục

```
├── index.html, *.html       # Các màn hình (mỗi file là 1 entry point)
├── src/                     # Component & logic theo từng module (pos/, arc/, admin/, sysadmin/)
├── assets/                  # Logo, shim cho lucide-react
├── _ds/                     # Design system (CSS tokens, bundle)
├── screenshots/             # Ảnh chụp màn hình quá trình phát triển
└── uploads/                 # Tài liệu tham khảo (khảo sát, ảnh đính kèm)
```

## Deploy

Trang được deploy qua **GitHub Pages** từ nhánh `main`, thư mục gốc. Có file `.nojekyll` để GitHub không dùng Jekyll xử lý (Jekyll mặc định bỏ qua các thư mục bắt đầu bằng `_`, sẽ làm hỏng `_ds/`).

Mỗi lần push lên `main`, GitHub Pages tự động build lại sau ~30-60 giây.
