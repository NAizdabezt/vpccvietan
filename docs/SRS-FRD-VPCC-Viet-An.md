# SRS/FRD — Quản lý và Số hóa Quy trình Văn phòng Công chứng Việt An

> Tài liệu đặc tả yêu cầu nghiệp vụ (SRS/FRD), User Stories và Use Case cho giải pháp phần mềm Web-based quản lý quy trình VPCC Việt An. Nguồn: khảo sát thực tế tại văn phòng.

## 1. Bối cảnh, hiện trạng & nhu cầu

Văn phòng Công chứng (VPCC) Việt An hiện vận hành toàn bộ quy trình tiếp nhận, soạn thảo, công chứng, thu phí và lưu trữ hồ sơ chủ yếu theo phương thức thủ công, trên nền hạ tầng CNTT cũ và các công cụ rời rạc.

### Hiện trạng
- **Hạ tầng CNTT lạc hậu**: mạng LAN/Wifi chập chờn; phần lớn máy tính đầu tư trước năm 2012, chạy Word 2009–2011 gây lỗi định dạng; chỉ có 02 máy scan phụ thuộc một cá nhân chuyên trách; thiết bị in phân bổ chênh lệch.
- **Nghiệp vụ thủ công, dễ sai sót**: TKNV nhìn bằng mắt và gõ tay 100% thông tin từ CCCD/Sổ đỏ; tra cứu ngăn chặn và nhập CAPTCHA thủ công; ảnh hiện trường quản lý qua Zalo; theo dõi hồ sơ tồn đọng bằng trí nhớ hoặc giấy tờ vật lý.
- **Dòng tiền & hóa đơn rời rạc**: Thu ngân lăn số, ghi giấy nháp trong giờ cao điểm; Kế toán dò file Excel bằng mắt để gộp hóa đơn trên EasyInvoice.
- **Số hóa & lưu trữ tắc nghẽn**: thao tác scan, cắt nhỏ file >10MB, đặt tên file và chép tay bìa kho đều thủ công; backlog đẩy file lên CMC kéo dài hơn 1 tuần.
- **Rủi ro bảo mật & truy vết**: dùng chung tài khoản cá nhân của CCV để ký số / hiệu chỉnh hồ sơ trên CMC, khó truy vết trách nhiệm (Audit Trail).
- **Thiếu công cụ điều hành**: Ban Lãnh đạo chưa có số liệu KPI và cơ cấu dịch vụ chính xác để đánh giá năng suất và ra quyết định.

### Định hướng giải pháp
- Nền tảng Web-based tập trung, vận hành một cửa, khắc phục triệt để rào cản hạ tầng cũ.
- OCR bóc tách CCCD/VNeID và giấy tờ giao dịch; trình duyệt nhúng tra cứu ngăn chặn ngầm.
- Tiện ích nổi 1 chạm cho CCV: chụp ảnh hiện trường và tự động chuyển luồng.
- POS Thu ngân nhập liệu siêu tốc (Grid-view) + Smart Hint gợi ý/lấp số; theo dõi công nợ.
- Auto-grouping hóa đơn và tích hợp API EasyInvoice (hỗ trợ xuất lùi ngày).
- Async Queue liên thông CMC; tiền xử lý & nén file <10MB; auto-naming; mapping kho vật lý; Smart Export sổ lưu trữ.
- Phân quyền RBAC, cơ chế Phân quyền Ủy thác (Delegation Role) và Audit Trail.
- Dashboard KPI và báo cáo cơ cấu dịch vụ theo thời gian thực.
- Module Công chứng Điện tử (Phase 2): ký số tập trung (USB Token/HSM), tự động trả kết quả qua Email, sẵn sàng Video KYC.

## 2. Quy trình nghiệp vụ

### 2.1. Luồng Hợp đồng / Giao dịch (đầy đủ)

Áp dụng cho các giao dịch dân sự phức tạp (mua bán, chuyển nhượng, thế chấp, ủy quyền, thừa kế…), quản lý theo **Số công chứng**:

1. TKNV khởi tạo phiên, chọn khách hàng và biểu mẫu (nạp dữ liệu khách cũ nếu có).
2. Bóc tách OCR giấy tờ đầu vào (CCCD, sổ hồng, cà vẹt…), kiểm tra và sửa trường sai.
3. Đối chiếu tài liệu và đính kèm ảnh kết quả tra cứu ngăn chặn.
4. Soạn thảo hợp đồng từ dữ liệu đã bóc tách (kéo-thả trường vào biểu mẫu).
5. Cấu hình in (Print Presets, watermark "BẢN LƯU", Creator ID) và In & chuyển sang Thu ngân.
6. Thu ngân thu phí, cấp Số công chứng (Smart Hint), đóng mộc; cập nhật công nợ nếu có.
7. CCV ký sống/ký số xác nhận; ảnh hiện trường đưa vào Hàng chờ ảnh để TKNV ghim sau.
8. Lưu trữ tiếp nhận bản giấy, scan và tiền xử lý (auto-merge VB+HS, nén <10MB, auto-naming), đẩy vào Async Queue liên thông CMC — **chỉ hồ sơ đã cấp số**.
9. Gắn số trên CMC, ký số Tổ chức; Auto-Reconciliation đối soát file đính kèm cuối ngày.
10. Đóng bìa, lưu kho vật lý (mapping vị trí); phiên chuyển trạng thái **Hoàn thành**.

### 2.2. Luồng Fast-track (Sao y / Chứng thực)

Áp dụng cho thủ tục đơn giản, tối ưu tốc độ, quản lý theo **Số chứng thực / Số sao y**:

1. Khách mang bản gốc và bản photo đến thẳng bàn CCV; CCV đối chiếu vật lý và ký sống (**Zero-Touch**, không thao tác phần mềm).
2. Thu ngân thu phí, cấp số (CT/SY) qua Grid-view nhập siêu tốc, đóng mộc chuyên biệt theo loại.
3. Sao y: trả toàn bộ bản chính và bản photo cho khách, **không lưu hồ sơ giấy**. Chứng thực: **giữ lại 01 bản lưu vật lý**.
4. Hệ thống tự tổng hợp sổ báo cáo Fast-track (Smart Export) phục vụ thanh tra của Sở Tư pháp.

### 2.3. Các trạng thái phiên (dùng chung, REQ-055)

```
Lưu nháp → Đang soạn thảo → Chờ cấp số công chứng và phụ phí → Chờ chốt số công chứng → Đợi đẩy file → Hoàn thành
```

- Phiên "Đang soạn thảo" bị khóa; mỗi vị trí chỉ thao tác trên phiên thuộc quyền của mình.
- Nút thao tác hiển thị cạnh phiên theo vai trò và trạng thái.

## 3. Modules

| Module | Chức năng chính |
|---|---|
| 1. Quản lý tài khoản & nhân sự | Khởi tạo, cập nhật, khóa/mở tài khoản định danh riêng cho từng nhân sự (TKNV, CCV, Thu ngân, Kế toán, Lưu trữ); gán nơi làm việc/trụ sở. |
| 2. Phân quyền RBAC & Ủy thác | Cấu hình quyền theo vai trò (Xem/Sửa/Xóa/Phê duyệt); Delegation Role tách bạch người thao tác và token ký, ghi log đích danh. |
| 3. Cấu hình luồng nghiệp vụ (Workflow) | Thiết kế trực quan các bước, trạng thái và điều kiện chuyển tiếp của luồng hồ sơ mà không cần can thiệp mã nguồn. |
| 4. Quản lý biểu mẫu (Form) | Kho biểu mẫu hợp đồng chuẩn tập trung; cấu hình trường tự điền (ánh xạ) từ dữ liệu OCR. |
| 5. Quản lý khách hàng & hồ sơ | CSDL khách hàng tập trung; tra cứu hồ sơ cũ đa tiêu chí; tái sử dụng dữ liệu khách cũ. |
| 6. Cấp số & quản lý dải số | Quản lý dải Số CC/CT/SY; Smart Hint gợi ý số khả dụng và số bỏ trống; khóa trùng; quản lý tạm giữ số. |
| 7. Thu phí & công nợ | Ghi nhận thu tiền và hình thức thanh toán; theo dõi [Nợ hồ sơ]/[Nợ tiền thu]; báo cáo đối soát dòng tiền. |
| 8. Hóa đơn điện tử | Auto-grouping gom hóa đơn trùng khớp Tên + Địa chỉ; hỗ trợ xuất lùi ngày; tích hợp API EasyInvoice. |
| 9. Số hóa & tiền xử lý scan | Tách Văn bản/Hồ sơ, cắt viền, nén < 10MB, auto-merge; Auto-naming theo cú pháp `0036-[Số CC]-[năm]-[VB/HS]`. |
| 10. Liên thông CMC (Async Queue) | Hàng đợi bất đồng bộ; chỉ đẩy hồ sơ đã cấp số; tự sinh ghi chú ngoại lệ; ký số Tổ chức (USB Token). |
| 11. Quản lý kho vật lý | Physical-Digital Mapping vị trí kho/kệ; quản lý mượn/trả bản gốc (Log); tự in bìa lưu trữ (màu cấu hình theo năm). |
| 12. Báo cáo & Sổ (Smart Export) | Xuất sổ lưu trữ / sổ Fast-track định dạng chuẩn (TNR size 7), sắp theo dải số tăng dần, không giới hạn kỳ trích xuất. |
| 13. Dashboard KPI | Năng suất TKNV/CCV, cơ cấu dịch vụ, doanh thu theo thời gian thực phục vụ Ban Lãnh đạo. |
| 14. Audit Trail | Nhật ký đăng nhập/đăng xuất và lịch sử thay đổi dữ liệu toàn hệ thống phục vụ truy vết, kiểm toán. |
| 15. Công chứng điện tử (Phase 2) | Ký số tập trung USB Token/HSM (ký hàng loạt); tự động trả kết quả qua Email; sẵn sàng Video KYC. |

## 4. Liên thông nội bộ với CMC / Sở Tư pháp

Phần mềm vận hành như một lớp nội bộ đứng trước hệ thống CMC của Sở Tư pháp, đảm bảo dữ liệu sạch và đúng thứ tự trước khi liên thông:

- **Điều kiện kích hoạt (Trigger Rule)**: chỉ hồ sơ đã được Thu ngân cấp Số công chứng chính thức mới vào Hàng đợi đẩy lên CMC; hồ sơ treo qua ngày chưa có số được giữ lại nội bộ.
- **Đẩy bù & ghi chú ngoại lệ**: với hồ sơ đẩy bù qua ngày hoặc sửa số, hệ thống tự sinh và đẩy trường "Ngày công chứng thực tế là ngày [DD/MM/YYYY]" vào API Ghi chú của CMC.
- **Đối soát file cuối ngày (Auto-Reconciliation)**: so khớp hồ sơ đã cấp số với hồ sơ đã đính kèm file; "ping" đích danh TKNV còn thiếu file.
- **Ký số Tổ chức**: sau khi đủ file đính kèm, hệ thống dùng USB Token tài khoản Tổ chức để ký số hoàn thiện hồ sơ điện tử.

## 5. Đặc tả yêu cầu chức năng (REQ)

### 5.1. Phân hệ Nghiệp vụ (TKNV & CCV)

| ID | Priority | Mô tả | Chi tiết / Tiêu chí chấp nhận | Actor | Dep. |
|---|---|---|---|---|---|
| REQ-001 | Must | Khởi tạo Phiên giao dịch tổng | Tạo phiên làm việc mới bằng cách chọn phân loại luồng dịch vụ (Hợp đồng phức tạp hoặc Sao y/Chứng thực). Hệ thống tự sinh Mã phiên (Session ID) để quản lý chung và xác định hướng đi của dữ liệu xuống các khâu sau. | TKNV, CCV | — |
| REQ-002 | Must | OCR bóc tách Đa tài liệu | Nhận diện, bóc tách dữ liệu từ máy scan chuyên dụng cho CCCD, Sổ đỏ/Sổ hồng, Cà vẹt xe... Sau khi scan giấy tờ thành PDF, hệ thống tự đẩy sang phần mềm OCR nội bộ để bóc tách thành dữ liệu có cấu trúc và đổ về biểu mẫu (Auto-mapping). Ngoài file scan, hệ thống nhận ảnh tải lên (vd ảnh chụp màn hình CCCD trên VNeID khách gửi qua Zalo) để lấy địa chỉ mới nhất sau sáp nhập; chỉ xử lý trên ảnh, không tích hợp API VNeID. | TKNV, CCV | REQ-001 |
| REQ-003 | Must | Soạn thảo Web-based & Mapping dữ liệu thông minh | Rich Text Editor tích hợp: (1) Auto-mapping tự động đổ dữ liệu OCR vào biến trên biểu mẫu; (2) Kéo thả (Drag & Drop) các trường dữ liệu rời rạc; (3) Khóa vùng pháp lý cấm sửa nội dung luật lõi, tích hợp Gõ tắt (Snippets) cho cụm từ pháp lý thông dụng. | TKNV, CCV | REQ-002 |
| REQ-004 | Must | Định danh bản quyền (Creator ID) | Tự động sinh mã nhân viên/ký hiệu viết tắt của TKNV và chèn ngầm (hoặc in nhỏ) ở góc trang hợp đồng để đánh dấu bản quyền người soạn. | TKNV, CCV | REQ-003 |
| REQ-005 | Must | Cấu hình In ấn thông minh (Print Presets) | Setup số lượng bản in mặc định theo từng loại hồ sơ; tự động chèn watermark "BẢN LƯU" to rõ lên đúng 1 bản dành cho lưu kho vật lý. Admin chỉnh sửa được preset. | TKNV, CCV | REQ-003 |
| REQ-006 | Must | Quản lý Khách cũ | Khi TKNV nhập số CCCD hoặc OCR nhận diện số định danh trùng khớp, hệ thống cảnh báo "Khách hàng cũ", cho phép điền nhanh toàn bộ dữ liệu có sẵn và tra cứu lịch sử giao dịch trước đó. | TKNV, CCV | REQ-002 |
| REQ-007 | Must | Quản lý Hàng chờ ảnh (Photo Queue) | Màn hình lưu trữ tạm thời các ảnh chụp hiện trường đẩy về từ bàn CCV; TKNV vào "nhặt" ảnh để ghim nối vào đúng hồ sơ hợp đồng. Cơ chế bất đồng bộ. | TKNV, CCV | REQ-001 |
| REQ-008 | Must | Chụp ảnh hiện trường trực tiếp (CCV) | CCV chủ động chụp ảnh hiện trường ở 2 giao diện: tab "Hàng chờ ảnh số" và tab "Luồng tổng quan" (nút Chụp ảnh cạnh từng phiên). Khi CCV chụp từ một phiên, hệ thống tự ghi nhận tên CCV vào phiên tương ứng; ảnh tự đẩy xuống hàng chờ ảnh để TKNV ghim vào đúng hồ sơ. Nút Chụp ảnh trên Luồng tổng quan chỉ dành cho vai trò CCV. | CCV | REQ-007 |
| REQ-009 | Must | Tự động định tuyến liên thông (Bypass CCV) | Ngay khi TKNV hoàn thiện hồ sơ, dữ liệu số tự động đẩy thẳng về Hàng chờ của Thu ngân. Không bắt buộc CCV click phê duyệt trên máy; luồng thực tế định tuyến bằng bộ hồ sơ giấy cầm tay (luồng liên thông 1 cửa). | Hệ thống | REQ-003 |
| REQ-010 | Must | Hộp thư duyệt yêu cầu hiệu chỉnh (CCV) | Tab hộp thư cho CCV, hiển thị yêu cầu sửa Số CC/Hủy số do Lưu trữ gửi tới hồ sơ chính CCV đó đã ký (định tuyến theo CCV ký; CCV phụ trách nhận dự phòng). Yêu cầu mang nội dung đề xuất (số cũ → số mới / lý do); CCV xem so sánh rồi Thực hiện (áp đúng giá trị đề xuất) hoặc Từ chối kèm lý do. Thay cơ chế ủy quyền cho một tài khoản (CCV Hảo) trong AS-IS. Audit Trail đích danh người gửi và người duyệt. **Đây là ngoại lệ duy nhất CCV quay lại luồng sau khi đã Bypass (REQ-009)**: luồng cấp số thường vẫn Zero-Touch, chỉ thao tác sửa/hủy số sau cấp số mới cần CCV duyệt. | CCV | REQ-038, REQ-052, REQ-053, REQ-054 |
| REQ-011 | Must | Lưu kho số tạm đa ngày (Retention) | Hệ thống tự động đóng băng và lưu trữ an toàn các hồ sơ [Chờ ký], [Chờ bổ sung giấy tờ] sang ngày hôm sau mà không bị xóa reset phiên làm việc. | TKNV, CCV | REQ-001 |

### 5.2. Phân hệ Thu ngân & Kế toán

| ID | Priority | Mô tả | Chi tiết / Tiêu chí chấp nhận | Actor | Dep. |
|---|---|---|---|---|---|
| REQ-012 | Must | Giao diện Fast-track (Pop-up Dịch vụ Nhanh) | Màn hình nhập liệu siêu tốc cho khách vãng lai (Sao y/Chứng thực), mở từ nút "Thêm giao dịch Fast-track" trong Giao diện Thu ngân. Bảng tính nhập nhanh [Tên khách] → [Loại giấy] → [Số lượng]. | Thu ngân | — |
| REQ-013 | Must | Smart Hint — Cấp số (Cảnh báo & Lấp số) | Hiển thị số tiếp theo khả dụng và tự động cảnh báo đỏ các số bị thiếu (bỏ trống) để Thu ngân ưu tiên lấp số. Tự động khóa cứng nếu phát sinh trùng lặp. | Thu ngân | REQ-012 |
| REQ-014 | Must | Quản lý Hình thức thanh toán | Combobox/bộ lọc chọn và lưu vết hình thức thanh toán (Tiền mặt / Chuyển khoản) cho từng phiên giao dịch, phục vụ đối soát doanh thu tự động. | Thu ngân | REQ-012 |
| REQ-015 | Must | Kiểm soát Công nợ | 2 checkbox độc lập: [Nợ hồ sơ] và [Nợ tiền thu]. Khi tích chọn, hệ thống tự động bôi đỏ dòng dữ liệu để cảnh báo. | Thu ngân | REQ-012 |
| REQ-016 | Should | Xuất Sổ báo cáo luồng Fast-track | Tự động tổng hợp các giao dịch Sao y/Chứng thực đã cấp số, kết xuất Excel dàn trang theo biểu mẫu Sở Tư pháp. | Thu ngân | REQ-012 |
| REQ-017 | Should | Danh sách luồng đã hoàn thành thu phí | Hiển thị danh sách các phiên/luồng đã hoàn tất thu phí (theo ca/ngày); hỗ trợ tìm kiếm, lọc nhanh. | Thu ngân | REQ-012 |
| REQ-018 | Must | Tự động tính phí & Tùy chỉnh (Editable Fee) | Dựa trên loại Hợp đồng do TKNV đẩy sang hoặc Dịch vụ Fast-track, hệ thống tự động hiển thị số tiền phí gợi ý; Thu ngân gõ đè để tùy chỉnh trước khi chốt. | Thu ngân | REQ-009 |
| REQ-019 | Must | In Phơi / Biên lai tự động | Nút "Xác nhận thu tiền & In phơi" giao tiếp trực tiếp với máy in bill/laser tại quầy để xuất ngay biên lai thu tiền. | Thu ngân | REQ-018 |
| REQ-020 | Must | Bảng kê đối soát Doanh thu | Tự động lập bảng kê biên lai thu tiền, báo cáo tổng hợp doanh thu theo ca/ngày và báo cáo công nợ. | Kế toán | REQ-019 |
| REQ-021 | Must | Auto-grouping (Gộp Hóa đơn) | Rà quét các giao dịch trong ngày trùng khớp tuyệt đối [Tên khách hàng] và [Địa chỉ], tự động gom nhóm thành 1 hóa đơn tổng. | Kế toán | REQ-020 |
| REQ-022 | Must | Xử lý xuất Hóa đơn lùi ngày | Cho phép Kế toán cấu hình chọn ngày xuất hóa đơn lùi lại so với ngày giao dịch thực tế. | Kế toán | REQ-021 |
| REQ-023 | Must | Theo dõi trạng thái phát hành Hóa đơn điện tử | Màn hình theo dõi trạng thái phát hành hóa đơn tổng sang EasyInvoice (Chờ gửi / Đã phát hành / Lỗi) và phát hành lại khi cần. | Kế toán | REQ-021 |

### 5.3. Phân hệ Số hóa & Lưu trữ thông minh

| ID | Priority | Mô tả | Chi tiết / Tiêu chí chấp nhận | Actor | Dep. |
|---|---|---|---|---|---|
| REQ-024 | Must | Chốt số công chứng & Đẩy CMC (pop-up) | Sau khi Thu ngân thu phí xong, các phiên hồ sơ tự động đẩy sang tab này và tách thành từng hồ sơ riêng (mỗi hồ sơ một số công chứng). Lưu trữ kiểm tra lại số công chứng và tên CCV, nhấn "Đẩy" để đẩy dữ liệu lên CMC. | Lưu trữ | REQ-019 |
| REQ-025 | Must | Hàng đợi bất đồng bộ (Async Queue) | Chỉ những hồ sơ đã được Thu ngân cấp số chính thức và được Lưu trữ chốt số công chứng mới được đưa vào hàng đợi đẩy lên CMC. | Hệ thống | REQ-024 |
| REQ-026 | Must | Tự động Ghi chú pháp lý ngoại lệ | Tự động sinh trường "Ngày công chứng thực tế là ngày..." và đẩy thẳng vào API Ghi chú của CMC cho hồ sơ bị thiếu/đẩy bù qua ngày. | Hệ thống | REQ-025 |
| REQ-027 | Must | Đồng bộ lại dữ liệu (Re-sync) sửa số | Khi có ngoại lệ sửa đổi sai sót Số công chứng, hệ thống tự động đồng bộ lại metadata và điều chỉnh logic sắp xếp chuẩn trên CMC. | Hệ thống | REQ-025 |
| REQ-028 | Must | Tự động chuẩn hóa & Nén PDF | Nhận diện, cắt viền, ép độ phân giải tối đa 200 dpi và nén dung lượng tự động đảm bảo mỗi file dưới 10MB. | Lưu trữ, Scan | — |
| REQ-029 | Must | Tự động phân tách File (Auto-Split) | Tự động tách file tổng thành 2 phần: "Văn bản" (Bản hợp đồng chính) và "Hồ sơ" (Giấy tờ tùy thân đính kèm). | Scan, Lưu trữ | REQ-028 |
| REQ-030 | Must | Auto-Naming Convention | Tự động đặt tên file theo cú pháp chuẩn của Sở: `0036-[Số công chứng]-[năm]-[Loại tài liệu]` (đuôi VB cho Hợp đồng, HS cho giấy tờ). | Lưu trữ | REQ-029 |
| REQ-031 | Must | Ghép nối tự động (Auto-Merging) | Tự động nhận diện file Hợp đồng lưu trữ (VB) từ máy scan cuối ngày, ghép nối thành bộ hồ sơ hoàn chỉnh với các file TKNV đã đẩy lên trước đó. | Lưu trữ | REQ-030 |
| REQ-032 | Must | Tự động in Bìa lưu trữ | Trích xuất siêu dữ liệu (Tên, Loại HĐ, Số CC) để đẩy lệnh in thẳng lên phôi bìa cứng; cấu hình màu sắc bìa theo năm. Hỗ trợ in hàng loạt. | Lưu trữ | REQ-030 |
| REQ-033 | Must | Cảnh báo quá hạn Thanh tra (6 tháng) | Tự động rà quét các hồ sơ đẩy bù bị thiếu chưa hoàn tất; cảnh báo đỏ nếu hồ sơ sắp chạm ngưỡng 6 tháng chưa liên thông. | Lưu trữ, LĐ | REQ-025 |
| REQ-034 | Must | Quản lý ngoại lệ luồng Fast-track | Tự động chặn luồng đẩy file lên CMC. Với Chứng thực: ghi nhận dữ liệu để định vị đóng tập lưu kho vật lý; với Sao y: chỉ lưu vết trên hệ thống báo cáo, bỏ qua hoàn toàn lưu kho vật lý. | Hệ thống | REQ-025 |
| REQ-035 | Must | Sơ đồ số hóa (Physical-Digital Mapping) | Cây thư mục mô phỏng kho thực tế ([Phòng kho] → [Dãy/Kệ] → [Tầng] → [Hộp/Cặp]) liên kết tọa độ với dữ liệu phần mềm. | Lưu trữ | REQ-032 |
| REQ-036 | Must | Xuất Sổ lưu trữ thông minh | Tự động dàn trang Excel/PDF (Font Times New Roman, Size 7); xếp chuẩn logic tăng dần tuyệt đối theo số công chứng, không giới hạn chu kỳ 1 tháng, ghi nhận ngày công chứng thực tế dựa trên trường Ghi Chú. | Lưu trữ | REQ-030 |
| REQ-037 | Must | Tìm kiếm & Trích lục không gian | Gõ tên khách/số công chứng, phần mềm chỉ định chính xác vị trí hồ sơ giấy đang nằm ở phòng, kệ, hộp nào. | Lưu trữ | REQ-035 |
| REQ-038 | Must | Hiệu chỉnh & Hủy số hồ sơ sau cấp số | 3 nhánh: (A) sửa thông tin không đụng Số CC — Lưu trữ tự làm, không nhảy ngày; (B) sửa Số CC — qua CCV duyệt, tự kích hoạt ghi chú (REQ-046) + Re-sync (REQ-027), số cũ [Đã hủy – thay thế]; (C) đánh dấu in & ký số lại (đẩy về REQ-028…031). **Chặn xóa cứng hồ sơ đã cấp số**, chỉ cho Hủy số (lưu vết) — số bị hủy giữ tại chỗ trong sổ với trạng thái [Đã hủy–thay thế], không tái sử dụng và không xóa cứng. Gated bằng RBAC (REQ-053), ghi Audit Trail (REQ-054). | Lưu trữ, CCV | REQ-052, REQ-056 |

### 5.4. Phân hệ Dashboard điều hành

| ID | Priority | Mô tả | Chi tiết / Tiêu chí chấp nhận | Actor | Dep. |
|---|---|---|---|---|---|
| REQ-039 | Must | Dashboard real-time & Bộ lọc động | Biểu đồ và số liệu theo thời gian thực; lọc động theo CCV/TKNV, loại hồ sơ và khoảng thời gian (ngày/tuần/tháng/quý). | LĐ VPCC | — |
| REQ-040 | Must | Báo cáo cơ cấu dịch vụ | Thống kê tỷ trọng các loại hồ sơ (vd 60% Hợp đồng, 30% Sao y, 10% Chứng thực). | LĐ VPCC | REQ-039 |
| REQ-041 | Must | Thống kê năng suất TKNV | Báo cáo real-time số lượng hồ sơ mỗi TKNV đã soạn thảo thành công, phân rã theo từng loại hồ sơ. | LĐ VPCC | REQ-003 |
| REQ-042 | Must | Thống kê năng suất CCV | Báo cáo số lượng hồ sơ mỗi CCV đã duyệt và ký sống/ký số, tỷ lệ xử lý theo từng loại hồ sơ. | LĐ VPCC | REQ-039 |
| REQ-043 | Must | Biểu đồ thống kê Doanh thu & Dòng tiền | Doanh thu tổng theo thời gian thực (ngày/tháng/năm); tỷ trọng dòng tiền theo hình thức thanh toán (Tiền mặt/Chuyển khoản/Công nợ). | LĐ VPCC | REQ-014 |
| REQ-044 | Should | Xuất báo cáo định kỳ & đột xuất | Kết xuất báo cáo năng suất, cơ cấu dịch vụ ra Excel/PDF theo định kỳ hoặc đột xuất. | LĐ VPCC | REQ-039 |

### 5.5. Phân hệ Tích hợp ngoại vi

| ID | Priority | Mô tả | Chi tiết / Tiêu chí chấp nhận | Actor | Dep. |
|---|---|---|---|---|---|
| REQ-045 | Must | API Liên thông dữ liệu lõi với CMC | Kết nối kết xuất hai chiều, tự động truyền tải metadata và tệp tin đính kèm chuẩn hóa lên hệ thống Sở Tư pháp. Vận hành ngầm theo Async Queue (REQ-025). | Hệ thống, Admin | REQ-025 |
| REQ-046 | Must | Tự động gửi Ghi chú ngoại lệ lên CMC | Giao tiếp API trường Ghi chú của CMC để tự động đẩy "Ngày công chứng thực tế là ngày [DD/MM/YYYY]" cho hồ sơ lọt khe hoặc hiệu chỉnh số. | Hệ thống | REQ-026 |
| REQ-047 | Must | Tích hợp Hóa đơn điện tử EasyInvoice | Connector kỹ thuật tới cổng EasyInvoice: nhận danh sách hồ sơ đã Auto-grouping, phát hành hóa đơn đỏ tự động, trả về trạng thái/lỗi cho Kế toán (REQ-023). | Hệ thống, KT | REQ-021 |
| REQ-048 | Must | API kết nối Hệ thống OCR nội bộ | Cấu hình endpoint/khóa kết nối, đẩy file PDF/ảnh sang OCR theo hàng đợi, nhận JSON có cấu trúc, xử lý lỗi/timeout. Dùng OCR nội bộ, không phụ thuộc API VNeID. | Hệ thống, Admin | REQ-002 |

### 5.6. Phân hệ Quản trị

| ID | Priority | Mô tả | Chi tiết / Tiêu chí chấp nhận | Actor | Dep. |
|---|---|---|---|---|---|
| REQ-049 | Should | Thiết kế luồng hồ sơ & quy trình làm việc | Quản trị viên trực quan thiết kế, chỉnh sửa, thêm/xóa các luồng xử lý hồ sơ (workflow); cấu hình bước, trạng thái, điều kiện chuyển tiếp không cần can thiệp mã nguồn. | Admin | — |
| REQ-050 | Must | Quản lý Tài khoản nhân sự | Admin khởi tạo, cập nhật, cấp phát hoặc khóa/mở khóa tài khoản định danh riêng cho từng nhân sự. | Admin | — |
| REQ-051 | Must | Quản lý nơi làm việc (Văn phòng/Trụ sở) | Quản lý danh mục các nơi làm việc; khi khởi tạo tài khoản, Admin chọn nơi làm việc gán cho tài khoản. | Admin | REQ-050 |
| REQ-052 | Must | Cơ chế Phân quyền Ủy thác (Delegation Role) | Tài khoản quản trị nội bộ riêng có chức năng "Yêu cầu chỉnh sửa". Mọi thao tác sửa/xóa log đích danh, sau đó dùng Token/API của CCV được ủy quyền để đồng bộ lên CMC. | Admin | REQ-050 |
| REQ-053 | Must | Ma trận phân quyền dựa trên vai trò (RBAC) | Cấu hình chi tiết quyền hạn (Xem, Sửa, Xóa, Phê duyệt) theo nhóm người dùng. **CCV kế thừa toàn bộ quyền soạn thảo của TKNV nhưng có cấp quyền cao hơn.** | Admin | REQ-050 |
| REQ-054 | Must | Ghi nhật ký thao tác (Audit Trail) | Tự động ghi vết lịch sử đăng nhập/đăng xuất, lịch sử thay đổi dữ liệu (ai sửa, sửa lúc nào, nội dung gì) của toàn bộ tài khoản. | Admin, HT | REQ-050 |

### 5.7. Phân hệ Dùng chung

| ID | Priority | Mô tả | Chi tiết / Tiêu chí chấp nhận | Actor | Dep. |
|---|---|---|---|---|---|
| REQ-055 | Must | Luồng tổng quan — Theo dõi luồng phiên hồ sơ | Màn hình theo dõi luồng xử lý hồ sơ real-time, dùng chung mọi vị trí. (1) Phạm vi: phiên tồn đọng ngày trước + phiên trong ngày, kèm tên CCV/TKNV và tiến độ; (2) 6 trạng thái (xem mục 2.3); (3) Phân quyền theo trạng thái/vị trí; (4) Nút thao tác theo vai trò và trạng thái. | Toàn bộ | REQ-009 |
| REQ-056 | Must | Hồ sơ hoàn thành — Tra cứu | Theo dõi, tra cứu toàn bộ hồ sơ đã hoàn thành. Tìm kiếm/lọc theo thời gian, loại hồ sơ, CCV/TKNV. **Chỉ xem/tra cứu, không chỉnh sửa.** | Toàn bộ | REQ-055 |
| REQ-057 | Must | Đăng nhập & Xác thực hệ thống | Xác thực tài khoản định danh riêng biệt của từng cán bộ; tự động khóa tài khoản tạm thời nếu nhập sai mật khẩu quá số lần quy định. | Toàn bộ | — |
| REQ-058 | Must | Tự quản lý tài khoản & Đổi mật khẩu | Giao diện cá nhân tự cập nhật thông tin cơ bản, đổi mật khẩu, cấu hình bảo mật. | Toàn bộ | REQ-057 |

### 5.8. Module Công chứng Điện tử — Phase 2 (Tính năng chờ)

Thiết kế sẵn kiến trúc nhưng sẽ kích hoạt khi khung pháp lý Công chứng điện tử có hiệu lực:

| ID | Priority | Mô tả | Chi tiết / Tiêu chí chấp nhận | Actor | Dep. |
|---|---|---|---|---|---|
| REQ-059 | Could | Nền tảng Web-based soạn thảo cộng tác | Toàn bộ nhân viên soạn thảo trên một file duy nhất lưu tập trung (tương tự Google Docs). Không cần cài đặt phần mềm. | TKNV, CCV | — |
| REQ-060 | Could | Tích hợp API chữ ký số (Token/HSM) | Cổng kết nối API tương thích VNPT, Viettel. CCV ký số hàng loạt (Batch Sign) hoặc từng hồ sơ. Tổ chức ký qua HSM và gắn Timestamp. | CCV, Lưu trữ | REQ-034 |
| REQ-061 | Could | Tự động trả kết quả qua Email | Trích [Email khách hàng], tự động đóng gói văn bản đã ký số và gửi email sau khi hoàn tất. | TKNV, Lưu trữ | REQ-035 |
| REQ-062 | Could | Video KYC | Nâng cấp camera cố định tại bàn CCV thành luồng live-streaming, sẵn sàng cho quy định Công chứng điện tử trực tuyến. | CCV | REQ-035 |

## 6. Yêu cầu phi chức năng (NFR)

| ID | Nhóm | Tiêu chí | Ngưỡng đo lường |
|---|---|---|---|
| NFR-001 | Hiệu năng | Thời gian tải trang | ≤ 2 giây trên đường truyền ≥ 10 Mbps |
| NFR-002 | Hiệu năng | OCR bóc tách VNeID | ≤ 3 giây với ảnh ≥ 720p |
| NFR-003 | Hiệu năng | Chụp ảnh hiện trường & chuyển luồng (CCV) | ≤ 2 giây |
| NFR-004 | Hiệu năng | Async Queue liên thông CMC | ≤ 30 giây/hồ sơ. Retry tự động tối đa 3 lần khi lỗi |
| NFR-005 | Độ sẵn sàng | Uptime hệ thống | ≥ 99.5% trong giờ làm việc (08:00–18:00, T2–T7) |
| NFR-006 | Bảo mật | Xác thực người dùng | 2FA bắt buộc với tài khoản CCV và QTHT |
| NFR-007 | Bảo mật | Audit Trail | Mọi thao tác Tạo/Sửa/Xóa phải ghi log: user, timestamp, nội dung. **Log không thể xóa/sửa** |
| NFR-008 | Bảo mật | Phân quyền truy cập | Mỗi vai trò chỉ truy cập module được phân quyền. Cross-module access bị chặn tuyệt đối |
| NFR-009 | Bảo mật | Mã hóa dữ liệu | At rest & in transit: AES-256 / TLS 1.2+ |
| NFR-010 | Khả năng sử dụng | Giao diện | Chrome/Edge/Firefox mới nhất, không cần plugin, tối ưu ≥ 1366×768 |
| NFR-011 | Khả năng mở rộng | Đồng thời người dùng | ≥ 30 user đồng thời không suy giảm hiệu năng |
| NFR-012 | Khả năng mở rộng | Lưu trữ dữ liệu | Scale-out không giới hạn |
| NFR-013 | Backup & Recovery | Sao lưu dữ liệu | Tự động mỗi 24h. RTO ≤ 4h. RPO ≤ 24h |
| NFR-014 | Tuân thủ pháp lý | Chuẩn file CMC | ≤ 10MB, ≤ 200 dpi, tên `0036-[SCC]-[năm]-[VB/HS]` |

## 7. User Stories

### 7.1. Phân hệ Nghiệp vụ — TKNV & CCV

| ID | Tiêu đề | User Story | Acceptance Criteria | Priority | SP |
|---|---|---|---|---|---|
| US-001 | OCR VNeID tự động | Là TKNV, tôi muốn chụp màn hình VNeID của khách hàng bằng điện thoại để hệ thống tự điền thông tin vào form soạn thảo. | Given TKNV upload ảnh VNeID/CCCD When hệ thống xử lý OCR Then các trường Họ tên/Số CCCD/Ngày sinh/Địa chỉ điền tự động ≤3s, độ chính xác ≥95% And TKNV chỉnh sửa được trường sai trước khi lưu | Must | 5 |
| US-002 | Chọn mẫu hợp đồng & merge dữ liệu | Là TKNV, tôi muốn chọn mẫu hợp đồng để hệ thống tự merge dữ liệu khách hàng vào. | Given TKNV đã OCR VNeID When chọn loại mẫu Then dữ liệu OCR điền vào trường chuẩn And chỉ cần nhập trường riêng And hiển thị preview trước khi in | Must | 5 |
| US-003 | In ấn thông minh (Print Presets) | Là TKNV, tôi muốn hệ thống tự động thiết lập số bản in và đánh dấu bản lưu theo loại hồ sơ. | Given chọn loại hồ sơ When bấm [In] Then đặt số bản in theo preset And chèn watermark 'BẢN LƯU' And gắn mã TKNV góc văn bản And Admin đổi được preset | Must | 3 |
| US-004 | Chụp ảnh hiện trường trực tiếp (CCV) | Là CCV, tôi muốn chụp ảnh hiện trường ngay trên giao diện bằng nút cạnh từng phiên. | Given CCV mở danh sách phiên chờ When bấm [Chụp ảnh] cạnh phiên Then camera chụp ảnh hiện trường And ảnh tự đính vào đúng phiên And gán tên CCV phụ trách And hoàn tất ≤2s | Must | 5 |
| US-005 | Quản lý hồ sơ tồn đọng đa ngày | Là TKNV, tôi muốn hồ sơ chờ bổ sung/chờ ký được giữ nguyên qua đêm. | Given hồ sơ [Chờ ký]/[Chờ bổ sung] cuối ngày When sang ngày mới Then dữ liệu (metadata, OCR, ảnh) còn nguyên And TKNV/CCV mở lại tiếp tục And hiển thị số ngày chờ | Must | 3 |

### 7.2. Phân hệ Thu ngân & Kế toán

| ID | Tiêu đề | User Story | Acceptance Criteria | Priority | SP |
|---|---|---|---|---|---|
| US-006 | Thu tiền & cấp số tự động từ luồng CCV | Là Thu ngân, tôi muốn thông tin hồ sơ từ CCV tự động hiện trên màn hình để chỉ cần xác nhận số tiền và cấp số. | Given CCV đã chuyển luồng When mở hàng đợi Then hiển thị Tên khách/Loại hồ sơ/Phí dự tính And nhập tiền thực thu, bấm [Cấp số] And Số CC tiếp theo gán tự động And không cho cấp số trùng | Must | 5 |
| US-007 | Nhập nhanh Fast-track (Grid-view) | Là Thu ngân, tôi muốn màn hình bảng tính nhập nhanh Sao y/Chứng thực liên tiếp. | Given chọn Fast-track When nhập [Tên]→[Loại]→[SL]→Enter Then con trỏ nhảy hàng tiếp And hiển thị Số CT/SY tiếp theo And phí tự tính And nhập liên tục 20 dòng không cần chuột | Must | 8 |
| US-008 | Smart Hint lấp số lọt khe | Là Thu ngân, tôi muốn hệ thống báo các số CC bị bỏ trống để lấp đúng thứ tự. | Given có số CC bị bỏ trống When mở màn hình cấp số Then hiển thị danh sách số thiếu (vàng) And chọn cấp bù đề xuất số nhỏ nhất còn trống And số biến mất khỏi cảnh báo sau khi cấp bù | Must | 3 |
| US-009 | Auto-grouping hóa đơn EasyInvoice | Là Kế toán, tôi muốn hệ thống tự gom giao dịch cùng tên+địa chỉ thành 1 hóa đơn tổng. | Given mở màn hình xuất hóa đơn When hệ thống phân tích dữ liệu ngày Then bản ghi trùng Tên+Địa chỉ tự gom nhóm And KT review/xác nhận And chọn lùi ngày xuất And API EasyInvoice tự phát hành | Must | 8 |
| US-010 | Kiểm soát và theo dõi công nợ | Là Thu ngân, tôi muốn đánh dấu hồ sơ nợ tiền/nợ giấy tờ để theo dõi. | Given hồ sơ khách quen nợ When tích [Nợ tiền thu]/[Nợ hồ sơ] Then hàng bôi đỏ And vẫn đẩy CMC/trả kết quả bình thường And filter công nợ theo ngày/khách And bỏ tích khi thanh toán xong | Must | 3 |

### 7.3. Phân hệ Số hóa & Lưu trữ

| ID | Tiêu đề | User Story | Acceptance Criteria | Priority | SP |
|---|---|---|---|---|---|
| US-011 | Tiền xử lý file scan tự động | Là Lưu trữ, tôi muốn hệ thống tự chia file scan thành VB/HS và nén ≤10MB. | Given ra lệnh scan When scan xong Then tách [VB]/[HS] And nén ≤10MB And đặt tên chuẩn `0036-[SCC]-[năm]-[VB/HS]` And 2 file sẵn sàng đẩy CMC | Must | 8 |
| US-012 | Async Queue CMC không chặn luồng | Là Lưu trữ, tôi muốn hệ thống tự đẩy file CMC bất đồng bộ. | Given hồ sơ có Số CC + file VB/HS đầy đủ When xác nhận hoàn tất Then vào Async Queue chạy ngầm And không block giao diện And hiển thị trạng thái [Đang đợi]/[Thành công]/[Lỗi–Retry] And lỗi sau 3 lần retry → cảnh báo QTHT | Must | 5 |
| US-013 | Ping TKNV thiếu file cuối ngày | Là Lưu trữ, tôi muốn hệ thống tự nhắc TKNV chưa đẩy file. | Given đến 16:30 When chạy đối soát tự động Then hồ sơ có Số CC nhưng thiếu VB → thông báo đỏ lên màn hình TKNV phụ trách And Lưu trữ nhận báo cáo tổng hợp | Must | 3 |
| US-014 | Tìm vị trí hồ sơ trong kho vật lý | Là Lưu trữ, tôi muốn tìm hồ sơ giấy theo tên khách/số CC và hệ thống chỉ vị trí kho. | Given hồ sơ đã gán tọa độ kho When nhập tên khách/số CC Then hiển thị Phòng kho - Dãy/Kệ - Tầng - Hộp số | Must | 5 |
| US-015 | Xuất Sổ lưu trữ chuẩn Sở Tư pháp | Là Lưu trữ, tôi muốn xuất Sổ theo thứ tự Số CC đúng định dạng Sở bằng 1 thao tác. | Given chọn bộ lọc thời gian When bấm [Xuất Sổ] Then sinh Excel dàn trang (TNR, size 7) And sắp Số CC tăng dần tuyệt đối And hồ sơ sửa ngày hiển thị đúng ngày thực tế And chỉ cần mở file và in | Must | 5 |
| US-016 | Phân quyền ủy thác hiệu chỉnh (Delegation) | Là QTHT, tôi muốn có tài khoản riêng để sửa hồ sơ mà log tên tôi, không mượn tài khoản CCV nữa. | Given QTHT đăng nhập tài khoản Admin nội bộ When sửa/xóa hồ sơ Then log ghi tên QTHT, timestamp, nội dung And dùng API Token CCV được ủy quyền để đồng bộ CMC And log không ai xóa/sửa được And CCV không cần chia sẻ mật khẩu | Must | 5 |
| US-019 | Hiệu chỉnh & Hủy số hồ sơ sau cấp số (có kiểm soát) | Là Lưu trữ, tôi muốn gửi yêu cầu sửa Số CC/hủy số cho đúng CCV đã ký, đảm bảo truy vết và không xóa cứng. | Given hồ sơ đã cấp Số CC When mở chi tiết, chọn 'Hiệu chỉnh' Then sửa thông tin không đụng Số CC áp ngay (không nhảy ngày) And sửa Số CC/hủy số tạo 'Yêu cầu' gửi hộp thư CCV đã ký And khi CCV duyệt: số cũ [Đã hủy–thay thế] (giữ vết) And tự sinh ghi chú + Re-sync CMC And ghi Audit Trail đích danh | Must | 5 |
| US-020 | Hộp thư duyệt yêu cầu hiệu chỉnh (CCV) | Là CCV, tôi muốn duyệt/từ chối yêu cầu sửa Số CC/hủy số với hồ sơ tôi đã ký. | Given có yêu cầu gửi tới hồ sơ tôi ký When mở hộp thư duyệt Then thấy diff 'số cũ→mới đề xuất', người gửi, lý do And 'Thực hiện' (áp giá trị đề xuất) hoặc 'Từ chối' kèm lý do And nếu vắng mặt → định tuyến CCV phụ trách (dự phòng) And ghi Audit Trail đích danh người gửi/duyệt | Must | 3 |

### 7.4. Phân hệ Quản trị & Dashboard

| ID | Tiêu đề | User Story | Acceptance Criteria | Priority | SP |
|---|---|---|---|---|---|
| US-017 | Dashboard KPI nhân sự real-time | Là Ban Lãnh đạo, tôi muốn xem số hồ sơ từng TKNV/CCV xử lý theo ngày/tháng. | Given đăng nhập Dashboard When mở KPI Then biểu đồ cột số hồ sơ từng TKNV/ngày And biểu đồ đường xu hướng tuần And tự làm mới mỗi 5 phút And lọc theo nhân viên/tháng/loại hồ sơ | Must | 5 |
| US-018 | Thống kê cơ cấu dịch vụ | Là Ban Lãnh đạo, tôi muốn biết tỷ lệ % từng loại hồ sơ để lên kế hoạch nhân sự. | Given mở Cơ cấu dịch vụ When chọn bộ lọc thời gian Then biểu đồ tròn tỷ lệ từng loại And so sánh cùng kỳ năm trước And xuất PDF | Must | 3 |

## 8. Đặc tả Use Case

### UC-001: Tiếp nhận và soạn thảo Hồ sơ Hợp đồng/Giao dịch
- **Actor chính**: TKNV
- **Tiền điều kiện**: TKNV đã đăng nhập. Khách hàng có mặt tại quầy với giấy tờ gốc.
- **Hậu điều kiện**: Hồ sơ ở [Chờ CCV] với dữ liệu OCR đầy đủ, bản in watermark BẢN LƯU.
- **Luồng chính**: (1) Tạo hồ sơ mới → chọn mẫu hợp đồng (2) form soạn thảo hiện (3) chụp VNeID/CCCD → upload (4) OCR tự điền form (5) TKNV kiểm tra/bổ sung (6) Xem trước & In → Print Preset áp dụng → in, khách ký+lăn tay (7) Chuyển sang CCV → vào [Chờ CCV]
- **Luồng thay thế**: 3a. khách cũ → gợi ý điền tự động; 7a. cần bổ sung giấy tờ → [Lưu tạm–Chờ bổ sung], giữ đa ngày
- **Ngoại lệ**: 4e. OCR fail/độ tin cậy <80% → nhập tay, gợi ý theo khách cũ

### UC-002: Thẩm định và Ký sống (CCV)
- **Actor chính**: CCV
- **Tiền điều kiện**: Hồ sơ [Chờ CCV]. Khách mang hồ sơ giấy đến bàn CCV.
- **Hậu điều kiện**: Hồ sơ [Chờ Thu ngân]. Ảnh hiện trường tự đính kèm vào phiên.
- **Luồng chính**: (1) mở giao diện, chọn phiên chờ (2) rà soát nội dung dự thảo (3) thẩm định nhân thân (khuôn mặt/tên/địa chỉ/vân tay vs CCCD gốc) (4) hợp lệ → ký sống (5) bấm [Chụp ảnh] cạnh phiên → camera chụp hiện trường (6) ảnh tự đính + gán tên CCV (7) định tuyến [Chờ Thu ngân] (Bypass CCV)
- **Luồng thay thế**: 5a. in ảnh đính kèm ngay, đóng giáp lai lúc rảnh (không block); 7a. Fast-track: CCV ký trực tiếp bản giấy (Zero-Touch), chuyển thẳng Thu ngân
- **Ngoại lệ**: 2e. sai sót → [Trả về TKNV] kèm ghi chú, hồ sơ về [Cần chỉnh sửa]; 3e. nhân thân không khớp → không ký, ở lại [Chờ CCV] kèm lý do từ chối

### UC-003: Thu tiền và Cấp số Công chứng (Thu ngân)
- **Actor chính**: Thu ngân
- **Tiền điều kiện**: Hồ sơ [Chờ Thu ngân]. Khách đến quầy Thu ngân.
- **Hậu điều kiện**: Hồ sơ [Đã cấp số] với Số CC chính thức. Vào Async Queue chờ liên thông CMC.
- **Luồng chính**: (1) mở hàng đợi, hồ sơ từ CCV tự hiện (2) kiểm tra tên khách/loại hồ sơ/phí dự tính (3) thu tiền (4) xác nhận tiền thực thu, bấm [Cấp số & Hoàn tất] (5) Smart Hint hiện Số CC tiếp theo (6) kiểm tra trùng lặp, cấp số (7) chuyển [Đã cấp số] (8) tự vào Async Queue
- **Luồng thay thế**: 4a. chưa đủ tiền → tích [Nợ tiền thu], vẫn cấp số/đẩy CMC; 4b. thiếu giấy tờ phụ → tích [Nợ hồ sơ]; 1b. Fast-track → Grid-view nhập nhanh, tự nhảy Số SY/CT
- **Ngoại lệ**: 6e. Số CC trùng → cảnh báo đỏ, từ chối cấp số; 5e. có số bỏ trống trong dải → cảnh báo vàng, đề xuất lấp số

### UC-004: Scan, số hóa và đẩy file lên CMC (Lưu trữ)
- **Actor chính**: Lưu trữ
- **Tiền điều kiện**: Hồ sơ đã có Số CC. Bộ hồ sơ giấy đã chuyển về phòng Lưu trữ.
- **Hậu điều kiện**: File VB/HS đẩy CMC thành công [Liên thông thành công]. Hồ sơ giấy vào kho vật lý, bìa đã in.
- **Luồng chính**: (1) kiểm tra bút lục/phụ lục (2) ra lệnh scan từ phần mềm (3) máy scan ép chuẩn PDF ≤200dpi (4) tự tách [VB]/[HS] (5) nén ≤10MB (6) đặt tên `0036-[SCC]-[năm]-[VB/HS]` (7) preview, xác nhận (8) vào Async Queue, đẩy CMC (9) in phiếu bìa → đóng kho, nhập tọa độ kệ
- **Luồng thay thế**: 1a. thiếu bút lục/phụ lục → trả TKNV kèm ghi chú; 8a. Chứng thực (CT) → không scan, chỉ ghi metadata, đóng tập lưu kho vật lý; 9a. tài liệu khổ lớn → tạo Placeholder, nhập tọa độ kệ; 10a. phát hiện sai sót sau cấp số → 'Hiệu chỉnh thông tin' (không đụng Số CC, áp ngay) hoặc 'Gửi yêu cầu' sửa Số CC/Hủy số → hộp thư CCV đã ký (REQ-010) → CCV Thực hiện/Từ chối → nếu sửa: ghi chú 'Ngày công chứng thực tế', số cũ [Đã hủy–thay thế], Re-sync CMC
- **Ngoại lệ**: 5e. không nén được ≤10MB → tự chia phần `-part1`, `-part2`; 8e. CMC lỗi → retry 3 lần tự động → vẫn lỗi → cảnh báo QTHT, [Lỗi liên thông]; 10e. CCV vắng mặt khi có yêu cầu hiệu chỉnh → tự định tuyến CCV phụ trách (Delegation, REQ-053), vẫn ghi Audit Trail đích danh người duyệt thực tế

### UC-005: Xuất Sổ lưu trữ chuẩn Sở Tư pháp (Lưu trữ)
- **Actor chính**: Lưu trữ
- **Tiền điều kiện**: Dữ liệu đã số hóa và đẩy CMC thành công.
- **Hậu điều kiện**: File Excel dàn trang chuẩn, sắp Số CC tăng dần, sẵn sàng in/nộp Sở.
- **Luồng chính**: (1) vào Smart Export (2) chọn bộ lọc thời gian (3) chọn loại sổ (CC/CT/SY) (4) truy vấn, sắp Số CC tăng dần (5) áp đúng ngày thực tế cho hồ sơ có ghi chú ngoại lệ (6) sinh Excel (TNR, size 7, căn lề in) (7) download, kiểm tra, in
- **Luồng thay thế**: 2a. xuất theo quý/năm không giới hạn; 7a. sai sót nhỏ → sửa trực tiếp Excel trước khi in
- **Ngoại lệ**: 4e. số CC thiếu trong dải → highlight đỏ, cảnh báo trước khi in; 6e. dữ liệu >1000 dòng → chia nhiều file theo tháng

### UC-006: Xem Dashboard KPI và Cơ cấu dịch vụ (Ban Lãnh đạo)
- **Actor chính**: Ban Lãnh đạo VPCC
- **Tiền điều kiện**: Đã đăng nhập. Dữ liệu ngày/tháng hiện tại đã cập nhật.
- **Hậu điều kiện**: Cái nhìn toàn diện hiệu suất nhân sự và cơ cấu dịch vụ.
- **Luồng chính**: (1) truy cập Dashboard (2) tổng quan: tổng hồ sơ/doanh thu/tồn đọng (3) tab [KPI Nhân sự] (4) biểu đồ cột/tròn theo TKNV/CCV (5) tab [Cơ cấu dịch vụ] (6) biểu đồ tỷ trọng loại hồ sơ (7) lọc tháng/quý so sánh xu hướng (8) xuất PDF
- **Luồng thay thế**: 4a. drill-down 1 TKNV cụ thể
- **Ngoại lệ**: 2e. dữ liệu chưa cập nhật (server lag) → hiện timestamp cập nhật cuối, nút [Làm mới thủ công]

### UC-007: Hiệu chỉnh & Hủy số hồ sơ sau cấp số
- **Actor chính**: Lưu trữ (khởi tạo); CCV (duyệt & thực hiện)
- **Mô tả**: Sửa sai sót trên hồ sơ đã cấp số mà không xóa cứng, bảo toàn dải số liên tục.
- **Tiền điều kiện**: Hồ sơ đã hoàn thành, đã cấp số và đẩy CMC.
- **Luồng chính**: (1) Lưu trữ mở pop-up chi tiết, chọn "Hiệu chỉnh" (2) lỗi đơn giản (không đụng Số CC) → tự sửa, lưu, ghi Audit Trail, kết thúc (3) lỗi cần CCV (sửa Số CC/hủy số/in&ký lại) → nhập đề xuất+lý do, gửi yêu cầu (4) yêu cầu vào hộp thư CCV đã ký (5) CCV xem diff cũ→mới, bấm "Thực hiện" (6) hệ thống sửa số, sinh ghi chú "Ngày CC thực tế…", Re-sync CMC, số cũ [Đã hủy–thay thế] (7) Audit Trail ghi đích danh người gửi+người duyệt+token
- **Ngoại lệ**: CCV "Từ chối" → trả về Lưu trữ kèm lý do, hồ sơ giữ nguyên
- **Hậu điều kiện**: Hồ sơ hiệu chỉnh hợp lệ, lưu vết đầy đủ; dải số không lọt khe
- **REQ liên quan**: REQ-009, REQ-010, REQ-050, REQ-051, REQ-052; ghi chú & re-sync (REQ-025, REQ-026, REQ-044)
