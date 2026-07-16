/* global React, window, localStorage */
/* VPCC Việt An — Mô hình biểu mẫu có trường dữ liệu (field token) + kho biểu mẫu (localStorage).
   Trường dữ liệu được OCR tự động điền và cho phép kéo-thả / sửa trực tiếp. */
const { useState: useTplState, useEffect: useTplEffect } = React;

/* Nhãn hiển thị cho từng khóa trường ngữ nghĩa */
const VA_FIELD_LABELS = {
  hoTen_A: "Họ tên Bên A",
  ngaySinh_A: "Ngày sinh Bên A",
  cccd_A: "CCCD Bên A",
  diaChi_A: "Địa chỉ Bên A",
  hoTen_B: "Họ tên Bên B",
  ngaySinh_B: "Ngày sinh Bên B",
  cccd_B: "CCCD Bên B",
  diaChi_B: "Địa chỉ Bên B",
  thuaDat: "Thửa đất số",
  toBanDo: "Tờ bản đồ số",
  dienTich: "Diện tích",
  diaChiDat: "Địa chỉ thửa đất",
  gia: "Giá / giá trị",
  bienSo: "Biển số xe",
  nhanHieu: "Nhãn hiệu",
  soKhung: "Số khung",
  soMay: "Số máy",
  cccdNgayCap_A: "CCCD Bên A - cấp ngày",
  cccdNgayCap_B: "CCCD Bên B - cấp ngày",
  hoTen_A2: "Họ tên vợ/chồng Bên A",
  ngaySinh_A2: "Ngày sinh vợ/chồng Bên A",
  cccd_A2: "CCCD vợ/chồng Bên A",
  cccdNgayCap_A2: "CCCD vợ/chồng Bên A - cấp ngày",
  soLoai: "Số loại xe",
  mauSon: "Màu sơn",
  soDangKyXe: "Số giấy đăng ký xe",
  noiCapDangKyXe: "Nơi cấp giấy đăng ký xe",
  ngayCapDangKyXe: "Ngày cấp giấy đăng ký xe",
  noiThanhLapDN: "Nơi thành lập doanh nghiệp",
  soCongChungGoc: "Số công chứng gốc",
  ngayCongChungGoc: "Năm công chứng gốc",
  ccvGoc: "Công chứng viên (văn bản gốc)",
  toChucCcGoc: "Tổ chức hành nghề công chứng gốc",
  diaChiToChucGoc: "Địa chỉ tổ chức công chứng gốc",
};

/* Token trường: { f: 'hoTen_A' } -> dựng nhãn từ bảng trên */
function F(key) { return { f: key, label: VA_FIELD_LABELS[key] || key }; }

/* ---- Khối nội dung biểu mẫu theo loại hợp đồng ---- */
function LAND_BLOCKS(name, verb) {
  const V = verb || "CHUYỂN NHƯỢNG";
  return [
    { tag: "dt", parts: [name.toUpperCase()] },
    { tag: "dm", parts: ["Số công chứng: …/2026 — quyển số 03 TP/CC-SCC/HĐGD"] },
    { tag: "dh", parts: ["BÊN " + V + " (BÊN A)"] },
    { tag: "p", parts: ["Ông/Bà: ", F("hoTen_A"), ", sinh ngày ", F("ngaySinh_A"), ", CCCD số ", F("cccd_A"), ", thường trú tại ", F("diaChi_A"), "."] },
    { tag: "dh", parts: ["BÊN NHẬN (BÊN B)"] },
    { tag: "p", parts: ["Ông/Bà: ", F("hoTen_B"), ", sinh ngày ", F("ngaySinh_B"), ", CCCD số ", F("cccd_B"), ", thường trú tại ", F("diaChi_B"), "."] },
    { tag: "dh", parts: ["ĐIỀU 1. ĐỐI TƯỢNG CỦA HỢP ĐỒNG"] },
    { tag: "p", parts: ["Quyền sử dụng thửa đất số ", F("thuaDat"), ", tờ bản đồ số ", F("toBanDo"), ", diện tích ", F("dienTich"), ", tại ", F("diaChiDat"), "."] },
    { tag: "dh", parts: ["ĐIỀU 2. GIÁ TRỊ VÀ PHƯƠNG THỨC THANH TOÁN"] },
    { tag: "p", parts: ["Giá trị giao dịch là ", F("gia"), " đồng. Phương thức thanh toán: ……………………"] },
    { tag: "ds", parts: ["Hai bên đã đọc lại, hiểu rõ và đồng ý toàn bộ nội dung hợp đồng."] },
  ];
}
function VEHICLE_BLOCKS(name) {
  return [
    { tag: "dt", parts: [name.toUpperCase()] },
    { tag: "dm", parts: ["Số công chứng: …/2026 — quyển số 03 TP/CC-SCC/HĐGD"] },
    { tag: "dh", parts: ["BÊN BÁN (BÊN A)"] },
    { tag: "p", parts: ["Ông/Bà: ", F("hoTen_A"), ", CCCD số ", F("cccd_A"), ", thường trú tại ", F("diaChi_A"), "."] },
    { tag: "dh", parts: ["BÊN MUA (BÊN B)"] },
    { tag: "p", parts: ["Ông/Bà: ", F("hoTen_B"), ", CCCD số ", F("cccd_B"), ", thường trú tại ", F("diaChi_B"), "."] },
    { tag: "dh", parts: ["ĐIỀU 1. ĐẶC ĐIỂM XE"] },
    { tag: "p", parts: ["Biển số ", F("bienSo"), ", nhãn hiệu ", F("nhanHieu"), ", số khung ", F("soKhung"), ", số máy ", F("soMay"), "."] },
    { tag: "dh", parts: ["ĐIỀU 2. GIÁ MUA BÁN"] },
    { tag: "p", parts: ["Giá mua bán là ", F("gia"), " đồng."] },
    { tag: "ds", parts: ["Hai bên đã đọc lại, hiểu rõ và đồng ý toàn bộ nội dung hợp đồng."] },
  ];
}
function AUTH_BLOCKS(name) {
  return [
    { tag: "dt", parts: [name.toUpperCase()] },
    { tag: "dm", parts: ["Số công chứng: …/2026 — quyển số 03 TP/CC-SCC/HĐGD"] },
    { tag: "dh", parts: ["BÊN ỦY QUYỀN (BÊN A)"] },
    { tag: "p", parts: ["Ông/Bà: ", F("hoTen_A"), ", sinh ngày ", F("ngaySinh_A"), ", CCCD số ", F("cccd_A"), ", thường trú tại ", F("diaChi_A"), "."] },
    { tag: "dh", parts: ["BÊN ĐƯỢC ỦY QUYỀN (BÊN B)"] },
    { tag: "p", parts: ["Ông/Bà: ", F("hoTen_B"), ", sinh ngày ", F("ngaySinh_B"), ", CCCD số ", F("cccd_B"), ", thường trú tại ", F("diaChi_B"), "."] },
    { tag: "dh", parts: ["ĐIỀU 1. PHẠM VI ỦY QUYỀN"] },
    { tag: "p", parts: ["Bên A ủy quyền cho Bên B thực hiện: ……………………………………………………………"] },
    { tag: "ds", parts: ["Hai bên đã đọc lại, hiểu rõ và đồng ý toàn bộ nội dung văn bản."] },
  ];
}
function GENERIC_BLOCKS(name) {
  return [
    { tag: "dt", parts: [name.toUpperCase()] },
    { tag: "dm", parts: ["Số công chứng: …/2026 — quyển số 03 TP/CC-SCC/HĐGD"] },
    { tag: "dh", parts: ["BÊN A"] },
    { tag: "p", parts: ["Ông/Bà: ", F("hoTen_A"), ", CCCD số ", F("cccd_A"), ", thường trú tại ", F("diaChi_A"), "."] },
    { tag: "dh", parts: ["BÊN B"] },
    { tag: "p", parts: ["Ông/Bà: ", F("hoTen_B"), ", CCCD số ", F("cccd_B"), ", thường trú tại ", F("diaChi_B"), "."] },
    { tag: "dh", parts: ["NỘI DUNG"] },
    { tag: "p", parts: ["……………………………………………………………………………………………………………………"] },
    { tag: "ds", parts: ["Hai bên đã đọc lại, hiểu rõ và đồng ý toàn bộ nội dung văn bản."] },
  ];
}

/* ---- Khối nội dung riêng cho 9 mẫu thật (2025-07 — mẫu hồ sơ công chứng mới
   áp dụng từ 1-7-2025, VPCC Việt An) — bám sát TỪNG DÒNG/ĐOẠN của file .docx
   gốc (đã trích xuất, mỗi đoạn Word riêng biệt giữ nguyên là 1 khối riêng, không
   gộp lại), bỏ phần "LỜI CHỨNG CỦA CÔNG CHỨNG VIÊN" (việc của công chứng viên
   lúc ký, không thuộc bước soạn thảo — cùng quy ước với LAND_BLOCKS/VEHICLE_
   BLOCKS/AUTH_BLOCKS ở trên), trừ mẫu "Thụ ủy" (toàn bộ nội dung vốn dĩ chính là
   phần xác nhận nhân thân — vẫn bỏ đúng đoạn "lời chứng" thủ tục ở cuối). ---- */

function GIAY_UY_QUYEN_BLOCKS(name) {
  return [
    { tag: "qh", parts: ["CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"] },
    { tag: "qh2", parts: ["Độc lập - Tự do - Hạnh phúc"] },
    { tag: "dt", parts: [name.toUpperCase()] },
    { tag: "p", parts: ["Hôm nay, ngày … tháng … năm 2026. Tại Văn phòng Công chứng Việt An, tôi ký tên dưới đây là:"] },
    { tag: "p", parts: ["Ông/Bà: ", F("hoTen_A")] },
    { tag: "p", parts: ["Ngày tháng năm sinh: ", F("ngaySinh_A")] },
    { tag: "p", parts: ["Căn cước công dân số: ", F("cccd_A"), " cấp ngày: ", F("cccdNgayCap_A")] },
    { tag: "p", parts: ["Thường trú: ", F("diaChi_A")] },
    { tag: "p", parts: ["Là ……………………………………"] },
    { tag: "p", parts: ["Bằng giấy này tôi ủy quyền cho:"] },
    { tag: "p", parts: ["Ông/Bà: ", F("hoTen_B")] },
    { tag: "p", parts: ["Ngày tháng năm sinh: ", F("ngaySinh_B")] },
    { tag: "p", parts: ["Căn cước công dân số: ", F("cccd_B"), " cấp ngày: ", F("cccdNgayCap_B")] },
    { tag: "p", parts: ["Thường trú: ", F("diaChi_B")] },
    { tag: "dh", parts: ["VỚI NỘI DUNG SAU"] },
    { tag: "p", parts: ["Ông/Bà được quyền thay mặt và nhân danh tôi liên hệ với các cơ quan có thẩm quyền để tiến hành ………………….. theo quy định của pháp luật hiện hành."] },
    { tag: "p", parts: ["Trong phạm vi ủy quyền, ông/bà được quyền lập, ký tên trên các giấy tờ liên quan, nộp và nhận hồ sơ, thực hiện các quyền, nghĩa vụ pháp luật quy định có liên quan đến các hành vi được ủy quyền nêu trên."] },
    { tag: "p", parts: ["Thời hạn ủy quyền: Cho đến khi hoàn tất công việc ủy quyền nêu trên."] },
    { tag: "p", parts: ["Thù lao ủy quyền: Ủy quyền không có thù lao."] },
    { tag: "ds", parts: ["Tôi xin chịu hoàn toàn trách nhiệm trước pháp luật về mọi hành vi do Ông/Bà nhân danh tôi thực hiện việc ủy quyền trên đây."] },
    { tag: "ds", parts: ["Tôi đã đọc lại, hiểu rõ nội dung giấy ủy quyền cũng như hiểu rõ quyền, nghĩa vụ, lợi ích và hậu quả pháp lý của việc ủy quyền và tự nguyện ký tên dưới đây."] },
    { tag: "p", parts: ["Giấy ủy quyền này được lập 03 bản, Văn phòng Công chứng Việt An lưu 01 bản."] },
  ];
}

function UQ_TOAN_QUYEN_NHA_DAT_BLOCKS(name) {
  return [
    { tag: "qh", parts: ["CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"] },
    { tag: "qh2", parts: ["Độc lập - Tự do - Hạnh phúc"] },
    { tag: "dt", parts: [name.toUpperCase()] },
    { tag: "p", parts: ["Hôm nay ngày ...../...../2026 tại Văn phòng Công chứng Việt An, Thành phố Hồ Chí Minh, chúng tôi gồm có:"] },
    { tag: "dh", parts: ["BÊN ỦY QUYỀN (BÊN A)"] },
    { tag: "p", parts: ["Ông: ", F("hoTen_A")] },
    { tag: "p", parts: ["Ngày tháng năm sinh: ", F("ngaySinh_A")] },
    { tag: "p", parts: ["Căn cước công dân số: ", F("cccd_A"), " cấp ngày: ", F("cccdNgayCap_A")] },
    { tag: "p", parts: ["Và vợ là Bà: ", F("hoTen_A2")] },
    { tag: "p", parts: ["Ngày tháng năm sinh: ", F("ngaySinh_A2")] },
    { tag: "p", parts: ["Căn cước công dân số: ", F("cccd_A2"), " cấp ngày: ", F("cccdNgayCap_A2")] },
    { tag: "p", parts: ["Nơi cư trú: ", F("diaChi_A")] },
    { tag: "p", parts: ["(Đính kèm theo giấy chứng nhận kết hôn)"] },
    { tag: "p", parts: ["Bên A là chủ sở hữu ………………"] },
    { tag: "dh", parts: ["BÊN ĐƯỢC ỦY QUYỀN (BÊN B)"] },
    { tag: "p", parts: ["Ông: ", F("hoTen_B")] },
    { tag: "p", parts: ["Ngày tháng năm sinh: ", F("ngaySinh_B")] },
    { tag: "p", parts: ["Căn cước công dân số: ", F("cccd_B"), " cấp ngày: ", F("cccdNgayCap_B")] },
    { tag: "p", parts: ["Nơi cư trú: ", F("diaChi_B")] },
    { tag: "p", parts: ["Nay hai bên đồng ý việc giao kết hợp đồng ủy quyền với các thỏa thuận sau đây:"] },
    { tag: "dh", parts: ["ĐIỀU 1. PHẠM VI ỦY QUYỀN"] },
    { tag: "p", parts: ["Bên B được quyền thay mặt và nhân danh Bên A liên hệ với cá nhân, tổ chức và các cơ quan có thẩm quyền liên quan để: quản lý, sử dụng, cho thuê, thế chấp, thế chấp bảo đảm nghĩa vụ cho bên thứ ba, xóa thế chấp, đặt cọc, bán/chuyển nhượng, tặng cho, thanh lý, sửa đổi bổ sung hoặc hủy bỏ các hợp đồng: cho thuê, thế chấp, thế chấp bảo đảm nghĩa vụ cho bên thứ ba, đặt cọc, bán/chuyển nhượng, tặng cho (kể cả trước và sau khi cấp đổi giấy chứng nhận) đối với căn nhà và quyền sử dụng đất tọa lạc tại địa chỉ số: ……………, căn cứ theo những quy định của pháp luật hiện hành."] },
    { tag: "p", parts: ["Trong phạm vi ủy quyền, bên B được quyền liên hệ với các cơ quan có thẩm quyền tiến hành các thủ tục về các hành vi đã được ủy quyền, được quyền quyết định mọi vấn đề đã được ủy quyền, được quyền nộp và nhận hồ sơ, được nộp/rút, bổ sung, nhận kết quả hồ sơ, nhận bản chính giấy chứng nhận, nhận tiền, bên B được quyền lập văn bản, ký tên trên các giấy tờ liên quan khác, kê khai và đóng các khoản thuế, phí, lệ phí liên quan đến nội dung ủy quyền và thực hiện các quyền và nghĩa vụ theo quy định của pháp luật."] },
    { tag: "dh", parts: ["ĐIỀU 2. THỜI HẠN ỦY QUYỀN"] },
    { tag: "p", parts: ["Thời hạn ủy quyền là 20 (hai mươi) năm kể từ ngày ký hợp đồng này."] },
    { tag: "p", parts: ["Hoặc khi hợp đồng ủy quyền này chấm dứt theo quy định của pháp luật."] },
    { tag: "dh", parts: ["ĐIỀU 3. THÙ LAO"] },
    { tag: "p", parts: ["Hợp đồng ủy quyền này không có thù lao."] },
    { tag: "dh", parts: ["ĐIỀU 4. NGHĨA VỤ VÀ QUYỀN CỦA BÊN A"] },
    { tag: "p", parts: ["Bên A có các nghĩa vụ sau đây:"] },
    { tag: "li", parts: ["Cung cấp thông tin, tài liệu và phương tiện cần thiết để bên B thực hiện công việc;"] },
    { tag: "li", parts: ["Chịu trách nhiệm về cam kết do bên B thực hiện trong phạm vi ủy quyền;"] },
    { tag: "li", parts: ["Thanh toán chi phí hợp lý mà bên B đã bỏ ra để thực hiện công việc được ủy quyền và trả thù lao cho bên B, nếu có thỏa thuận về việc trả thù lao;"] },
    { tag: "p", parts: ["Bên A có các quyền sau đây:"] },
    { tag: "li", parts: ["Yêu cầu bên B thông báo đầy đủ về việc thực hiện công việc ủy quyền;"] },
    { tag: "li", parts: ["Yêu cầu bên B giao lại tài sản, lợi ích thu được từ việc thực hiện công việc ủy quyền, nếu không có thỏa thuận khác;"] },
    { tag: "li", parts: ["Được bồi thường thiệt hại, nếu bên B vi phạm các nghĩa vụ đã thỏa thuận."] },
    { tag: "dh", parts: ["ĐIỀU 5. NGHĨA VỤ VÀ QUYỀN CỦA BÊN B"] },
    { tag: "p", parts: ["Bên B có các nghĩa vụ sau đây:"] },
    { tag: "li", parts: ["Thực hiện công việc ủy quyền theo ủy quyền và báo cho bên A về việc thực hiện công việc đó;"] },
    { tag: "li", parts: ["Báo cho người thứ ba trong quan hệ thực hiện ủy quyền về thời hạn, phạm vi ủy quyền và việc sửa đổi, bổ sung phạm vi ủy quyền;"] },
    { tag: "li", parts: ["Bảo quản, giữ gìn tài liệu và phương tiện được giao để thực hiện việc ủy quyền;"] },
    { tag: "li", parts: ["Giữ bí mật thông tin mà mình biết được trong khi thực hiện ủy quyền;"] },
    { tag: "li", parts: ["Giao lại cho bên A tài sản đã nhận và những lợi ích thu được trong khi thực hiện ủy quyền theo thỏa thuận hoặc theo quy định của pháp luật;"] },
    { tag: "li", parts: ["Bồi thường thiệt hại do vi phạm các nghĩa vụ đã thỏa thuận trong hợp đồng."] },
    { tag: "p", parts: ["Bên B có các quyền sau đây:"] },
    { tag: "li", parts: ["Yêu cầu bên A cung cấp thông tin, tài liệu và phương tiện cần thiết nhằm thực hiện công việc ủy quyền;"] },
    { tag: "li", parts: ["Hưởng thù lao, được thanh toán chi phí hợp lý mà mình đã bỏ ra để thực hiện công việc ủy quyền (nếu có)."] },
    { tag: "dh", parts: ["ĐIỀU 6. VIỆC NỘP LỆ PHÍ CÔNG CHỨNG"] },
    { tag: "p", parts: ["Lệ phí công chứng Hợp đồng này do bên A chịu trách nhiệm nộp."] },
    { tag: "dh", parts: ["ĐIỀU 7. PHƯƠNG THỨC GIẢI QUYẾT TRANH CHẤP"] },
    { tag: "p", parts: ["Trong quá trình thực hiện hợp đồng ủy quyền mà phát sinh tranh chấp, các bên cùng thương lượng giải quyết trên nguyên tắc tôn trọng quyền lợi của nhau; trong trường hợp không thương lượng được, thì một trong hai bên có quyền khởi kiện để yêu cầu tòa án có thẩm quyền giải quyết theo quy định của pháp luật."] },
    { tag: "dh", parts: ["ĐIỀU 8. CAM ĐOAN CỦA CÁC BÊN"] },
    { tag: "p", parts: ["Bên A và bên B chịu trách nhiệm trước pháp luật về những lời cam đoan sau đây:"] },
    { tag: "li", parts: ["Việc giao kết Hợp đồng này hoàn toàn tự nguyện, không bị lừa dối hoặc ép buộc;"] },
    { tag: "li", parts: ["Thực hiện đúng và đầy đủ tất cả các thỏa thuận đã ghi trong Hợp đồng này."] },
    { tag: "dh", parts: ["ĐIỀU 9. ĐIỀU KHOẢN CUỐI CÙNG"] },
    { tag: "p", parts: ["Hai bên đã nghe Công chứng viên giải thích rõ quyền, nghĩa vụ và lợi ích hợp pháp, ý nghĩa, hậu quả pháp lý của việc tham gia hợp đồng, giao dịch. Hai bên đã hiểu rõ quyền, nghĩa vụ và lợi ích hợp pháp của mình, ý nghĩa và hậu quả pháp lý của việc giao kết Hợp đồng này."] },
    { tag: "p", parts: ["Từng bên đã đọc Hợp đồng, đã hiểu và đồng ý tất cả các điều khoản ghi trong Hợp đồng và ký vào Hợp đồng này trước sự có mặt của công chứng viên."] },
    { tag: "ds", parts: ["Hợp đồng có hiệu lực kể từ ngày được Công chứng viên Văn phòng Công chứng Việt An ký và đóng dấu."] },
  ];
}

function THU_UY_BLOCKS(name) {
  return [
    { tag: "qh", parts: ["CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"] },
    { tag: "qh2", parts: ["Độc lập - Tự do - Hạnh phúc"] },
    { tag: "dt", parts: [name.toUpperCase()] },
    { tag: "p", parts: ["Hợp đồng ủy quyền này được giao kết giữa:"] },
    { tag: "dh", parts: ["BÊN ỦY QUYỀN (BÊN A)"] },
    { tag: "p", parts: ["Ông: ", F("hoTen_A")] },
    { tag: "p", parts: ["Ngày tháng năm sinh: ", F("ngaySinh_A")] },
    { tag: "p", parts: ["Căn cước công dân số: ", F("cccd_A"), " cấp ngày: ", F("cccdNgayCap_A")] },
    { tag: "p", parts: ["Và vợ là Bà: ", F("hoTen_A2")] },
    { tag: "p", parts: ["Ngày tháng năm sinh: ", F("ngaySinh_A2")] },
    { tag: "p", parts: ["Căn cước công dân số: ", F("cccd_A2"), " cấp ngày: ", F("cccdNgayCap_A2")] },
    { tag: "p", parts: ["Nơi cư trú: ", F("diaChi_A")] },
    { tag: "p", parts: ["Theo văn bản công chứng số ", F("soCongChungGoc"), "/", F("ngayCongChungGoc"), "/CCGD do công chứng viên ", F("ccvGoc"), " của ", F("toChucCcGoc"), ", địa chỉ: ", F("diaChiToChucGoc"), " chứng nhận."] },
    { tag: "dh", parts: ["BÊN ĐƯỢC ỦY QUYỀN (BÊN B)"] },
    { tag: "p", parts: ["Ông: ", F("hoTen_B")] },
    { tag: "p", parts: ["Ngày tháng năm sinh: ", F("ngaySinh_B")] },
    { tag: "p", parts: ["Căn cước công dân số: ", F("cccd_B"), " cấp ngày: ", F("cccdNgayCap_B")] },
    { tag: "p", parts: ["Nơi cư trú: ", F("diaChi_B")] },
    { tag: "ds", parts: ["Bên được ủy quyền đã xuất trình bản gốc của văn bản công chứng nêu trên do bên ủy quyền giao; đã tự nguyện giao kết hợp đồng này, chịu trách nhiệm trước pháp luật về tính chính xác, tính hợp pháp của các giấy tờ đã cung cấp liên quan đến việc giao kết hợp đồng này."] },
    { tag: "ds", parts: ["Cam đoan chịu trách nhiệm gửi 01 bản gốc của văn bản công chứng này về tổ chức hành nghề công chứng gốc để lưu hồ sơ."] },
  ];
}

function UQ_THANH_LAP_DN_BLOCKS(name) {
  return [
    { tag: "qh", parts: ["CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"] },
    { tag: "qh2", parts: ["Độc lập - Tự do - Hạnh phúc"] },
    { tag: "dt", parts: [name.toUpperCase()] },
    { tag: "p", parts: ["Hôm nay, ngày ..... tháng .... năm 2026. Tôi ký tên dưới đây là:"] },
    { tag: "p", parts: ["Bà: ", F("hoTen_A")] },
    { tag: "p", parts: ["Sinh năm: ", F("ngaySinh_A")] },
    { tag: "p", parts: ["Căn cước công dân số: ", F("cccd_A")] },
    { tag: "p", parts: ["Thường trú: ", F("diaChi_A")] },
    { tag: "p", parts: ["Hiện tôi đang tiến hành thủ tục thành lập doanh nghiệp tại ", F("noiThanhLapDN"), "."] },
    { tag: "p", parts: ["Bằng giấy này tôi ủy quyền cho:"] },
    { tag: "p", parts: ["Ông: ", F("hoTen_B")] },
    { tag: "p", parts: ["Sinh năm: ", F("ngaySinh_B")] },
    { tag: "p", parts: ["Căn cước công dân số: ", F("cccd_B")] },
    { tag: "p", parts: ["Thường trú: ", F("diaChi_B")] },
    { tag: "p", parts: ["Với nội dung sau:"] },
    { tag: "p", parts: ["1. Ông được toàn quyền đại diện tôi liên hệ với cơ quan đăng ký kinh doanh và các cơ quan có thẩm quyền khác liên quan để:"] },
    { tag: "li", parts: ["Nộp và nhận hồ sơ thành lập doanh nghiệp qua mạng internet hoặc trực tiếp, nhận bản chính giấy đăng ký doanh nghiệp qua bưu điện hoặc trực tiếp nhận, đăng bố cáo thành lập doanh nghiệp."] },
    { tag: "li", parts: ["Khắc dấu, nhận giấy đăng ký mẫu dấu và con dấu của doanh nghiệp theo quy định của pháp luật."] },
    { tag: "li", parts: ["Thực hiện thủ tục thông báo mẫu con dấu để đăng tải công khai trên Cổng thông tin quốc gia về đăng ký doanh nghiệp."] },
    { tag: "li", parts: ["Nộp và nhận hồ sơ xin đăng ký thuế, khai thuế ban đầu cho doanh nghiệp, mua hóa đơn cho doanh nghiệp."] },
    { tag: "p", parts: ["2. Trong phạm vi ủy quyền, ông được quyền nhận bản chính giấy đăng ký thuế và các giấy tờ có liên quan đến việc thành lập doanh nghiệp; được quyền nộp và nhận hồ sơ bổ sung (nếu có); được quyền lập, ký tên trên các giấy tờ liên quan, thực hiện các quyền, nghĩa vụ pháp luật quy định có liên quan đến các hành vi được ủy quyền nêu trên."] },
    { tag: "p", parts: ["3. Thời hạn ủy quyền: Cho đến khi hoàn tất công việc ủy quyền."] },
    { tag: "p", parts: ["4. Thù lao ủy quyền: Ủy quyền không có thù lao."] },
    { tag: "ds", parts: ["Tôi xin chịu hoàn toàn trách nhiệm trước pháp luật về mọi hành vi do ông nhân danh tôi thực hiện việc ủy quyền trên đây."] },
    { tag: "ds", parts: ["Tôi đã đọc lại, hiểu rõ nội dung giấy ủy quyền cũng như quyền, nghĩa vụ, lợi ích, hậu quả pháp lý của việc ủy quyền và tự nguyện ký tên dưới đây."] },
    { tag: "p", parts: ["Giấy ủy quyền này được lập 03 bản, Văn phòng Công chứng Việt An lưu 01 bản."] },
  ];
}

function MUA_BAN_XE_MAY_BLOCKS(name) {
  return [
    { tag: "qh", parts: ["CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"] },
    { tag: "qh2", parts: ["Độc lập – Tự do – Hạnh phúc"] },
    { tag: "dt", parts: [name.toUpperCase()] },
    { tag: "p", parts: ["Hôm nay ngày ... tháng ... năm 2026, tại Văn phòng Công chứng Việt An, số 519/5-519/7 Kinh Dương Vương, Phường An Lạc, Thành phố Hồ Chí Minh, chúng tôi gồm có:"] },
    { tag: "dh", parts: ["BÊN BÁN (GỌI TẮT LÀ BÊN A)"] },
    { tag: "p", parts: ["Ông: ", F("hoTen_A")] },
    { tag: "p", parts: ["Năm sinh: ", F("ngaySinh_A")] },
    { tag: "p", parts: ["Căn cước công dân số: ", F("cccd_A")] },
    { tag: "p", parts: ["Thường trú: ", F("diaChi_A")] },
    { tag: "dh", parts: ["BÊN MUA (GỌI TẮT LÀ BÊN B)"] },
    { tag: "p", parts: ["Ông: ", F("hoTen_B")] },
    { tag: "p", parts: ["Năm sinh: ", F("ngaySinh_B")] },
    { tag: "p", parts: ["Căn cước công dân số: ", F("cccd_B")] },
    { tag: "p", parts: ["Thường trú: ", F("diaChi_B")] },
    { tag: "p", parts: ["Hai bên đồng ý thực hiện việc mua bán xe với các thoả thuận sau đây:"] },
    { tag: "p", parts: ["Điều 1: Bên A đồng ý bán cho bên B chiếc xe mang biển số ", F("bienSo"), " theo Giấy đăng ký xe mô tô, xe máy số ", F("soDangKyXe"), " do ", F("noiCapDangKyXe"), " cấp ngày ", F("ngayCapDangKyXe"), ", với đặc điểm xe như sau:"] },
    { tag: "p", parts: ["Tên chủ xe: ", F("hoTen_A")] },
    { tag: "p", parts: ["Địa chỉ: ", F("diaChi_A")] },
    { tag: "p", parts: ["Nhãn hiệu: ", F("nhanHieu")] },
    { tag: "p", parts: ["Số máy: ", F("soMay")] },
    { tag: "p", parts: ["Số khung: ", F("soKhung")] },
    { tag: "p", parts: ["Số loại: ", F("soLoai")] },
    { tag: "p", parts: ["Màu sơn: ", F("mauSon")] },
    { tag: "p", parts: ["Điều 2: Giá mua bán xe nêu tại Điều 1 này là ", F("gia"), " đồng. Việc thanh toán số tiền mua bán xe và giao nhận xe do hai bên tự thực hiện và chịu trách nhiệm trước pháp luật."] },
    { tag: "p", parts: ["Điều 3: Quyền sở hữu đối với xe nêu trên được chuyển cho bên B kể từ thời điểm chiếc xe được chuyển giao cho bên B. Bên B có trách nhiệm thực hiện nghĩa vụ nộp thuế và làm thủ tục đăng ký đối với xe tại cơ quan có thẩm quyền."] },
    { tag: "ds", parts: ["Điều 4: Hai bên đã đọc lại hợp đồng, đã hiểu và đồng ý tất cả các điều khoản ghi trong hợp đồng và ký, điểm chỉ vào hợp đồng này trước mặt của Công chứng viên."] },
  ];
}

function MUA_BAN_XE_OTO_BLOCKS(name) {
  return [
    { tag: "qh", parts: ["CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"] },
    { tag: "qh2", parts: ["Độc lập – Tự do – Hạnh phúc"] },
    { tag: "dt", parts: [name.toUpperCase()] },
    { tag: "p", parts: ["Ngày .../.../2026, tại Văn phòng Công chứng Việt An, Thành phố Hồ Chí Minh, chúng tôi gồm có:"] },
    { tag: "dh", parts: ["BÊN BÁN (BÊN A)"] },
    { tag: "p", parts: ["Ông: ", F("hoTen_A")] },
    { tag: "p", parts: ["Ngày tháng năm sinh: ", F("ngaySinh_A")] },
    { tag: "p", parts: ["Căn cước công dân số: ", F("cccd_A"), " cấp ngày: ", F("cccdNgayCap_A")] },
    { tag: "p", parts: ["Và vợ là Bà: ", F("hoTen_A2")] },
    { tag: "p", parts: ["Ngày tháng năm sinh: ", F("ngaySinh_A2")] },
    { tag: "p", parts: ["Căn cước công dân số: ", F("cccd_A2"), " cấp ngày: ", F("cccdNgayCap_A2")] },
    { tag: "p", parts: ["Nơi cư trú: ", F("diaChi_A")] },
    { tag: "p", parts: ["(Đính kèm theo giấy chứng nhận kết hôn)"] },
    { tag: "dh", parts: ["BÊN MUA (BÊN B)"] },
    { tag: "p", parts: ["Ông: ", F("hoTen_B")] },
    { tag: "p", parts: ["Ngày tháng năm sinh: ", F("ngaySinh_B")] },
    { tag: "p", parts: ["Căn cước công dân số: ", F("cccd_B"), " cấp ngày: ", F("cccdNgayCap_B")] },
    { tag: "p", parts: ["Nơi cư trú: ", F("diaChi_B")] },
    { tag: "p", parts: ["Hai bên đồng ý thực hiện việc mua bán xe với các thỏa thuận sau đây:"] },
    { tag: "dh", parts: ["ĐIỀU 1. XE MUA BÁN"] },
    { tag: "p", parts: ["Bên A đồng ý bán, Bên B đồng ý mua chiếc xe mang biển số ", F("bienSo"), " được mô tả dưới đây."] },
    { tag: "p", parts: ["1. Đặc điểm xe — Nhãn hiệu: ", F("nhanHieu"), " — Loại xe: ", F("soLoai"), " — Số máy: ", F("soMay"), " — Số khung: ", F("soKhung"), " — Màu sơn: ", F("mauSon"), "."] },
    { tag: "p", parts: ["2. Giấy chứng nhận đăng ký xe ô tô số ", F("soDangKyXe"), " do ", F("noiCapDangKyXe"), " cấp ngày ", F("ngayCapDangKyXe"), "."] },
    { tag: "dh", parts: ["ĐIỀU 2. GIÁ MUA BÁN VÀ PHƯƠNG THỨC THANH TOÁN"] },
    { tag: "p", parts: ["Giá mua bán tài sản nêu tại Điều 1 là ", F("gia"), " đồng."] },
    { tag: "p", parts: ["Phương thức thanh toán: Tiền mặt (chuyển khoản)."] },
    { tag: "p", parts: ["Việc thanh toán số tiền nêu trên do hai bên tự thực hiện và chịu trách nhiệm trước pháp luật, ngoài sự chứng nhận của Công chứng viên."] },
    { tag: "dh", parts: ["ĐIỀU 3. THỜI HẠN, ĐỊA ĐIỂM VÀ PHƯƠNG THỨC GIAO XE"] },
    { tag: "p", parts: ["Ngay sau khi các bên ký kết hợp đồng này."] },
    { tag: "dh", parts: ["ĐIỀU 4. QUYỀN SỞ HỮU ĐỐI VỚI XE"] },
    { tag: "p", parts: ["Quyền sở hữu đối với xe nêu trên được chuyển cho Bên B, kể từ thời điểm thực hiện xong thủ tục đăng ký quyền sở hữu xe;"] },
    { tag: "p", parts: ["Bên B có trách nhiệm thực hiện thủ tục đăng ký quyền sở hữu đối với xe tại cơ quan có thẩm quyền."] },
    { tag: "dh", parts: ["ĐIỀU 5. VIỆC NỘP THUẾ VÀ LỆ PHÍ CÔNG CHỨNG"] },
    { tag: "p", parts: ["Thuế và lệ phí liên quan đến việc mua bán xe theo Hợp đồng này do hai bên chịu trách nhiệm nộp theo quy định."] },
    { tag: "dh", parts: ["ĐIỀU 6. PHƯƠNG THỨC GIẢI QUYẾT TRANH CHẤP"] },
    { tag: "p", parts: ["Trong quá trình thực hiện Hợp đồng mà phát sinh tranh chấp, các bên cùng nhau thương lượng giải quyết trên nguyên tắc tôn trọng quyền lợi của nhau; trong trường hợp không giải quyết được, thì một trong hai bên có quyền khởi kiện để yêu cầu tòa án có thẩm quyền giải quyết theo quy định của pháp luật."] },
    { tag: "dh", parts: ["ĐIỀU 7. CAM ĐOAN CỦA CÁC BÊN"] },
    { tag: "p", parts: ["Bên A và bên B chịu trách nhiệm trước pháp luật về những lời cam đoan sau đây:"] },
    { tag: "p", parts: ["Bên A cam đoan:"] },
    { tag: "li", parts: ["Những thông tin về nhân thân, về xe mua bán ghi trong Hợp đồng này là đúng sự thật;"] },
    { tag: "li", parts: ["Xe mua bán không có tranh chấp, không bị cơ quan nhà nước có thẩm quyền xử lý theo quy định của pháp luật;"] },
    { tag: "li", parts: ["Việc giao kết hợp đồng này hoàn toàn tự nguyện, không bị lừa dối hoặc ép buộc;"] },
    { tag: "li", parts: ["Thực hiện đúng và đầy đủ tất cả các thỏa thuận đã ghi trong Hợp đồng này."] },
    { tag: "p", parts: ["Bên B cam đoan:"] },
    { tag: "li", parts: ["Những thông tin về nhân thân ghi trong Hợp đồng này là đúng sự thật;"] },
    { tag: "li", parts: ["Đã xem xét kỹ, biết rõ về xe mua bán và các giấy tờ chứng minh quyền sở hữu;"] },
    { tag: "li", parts: ["Việc giao kết Hợp đồng này hoàn toàn tự nguyện, không bị lừa dối hoặc ép buộc;"] },
    { tag: "li", parts: ["Thực hiện đúng và đầy đủ tất cả các thỏa thuận đã ghi trong Hợp đồng này."] },
    { tag: "dh", parts: ["ĐIỀU 8. ĐIỀU KHOẢN CUỐI CÙNG"] },
    { tag: "p", parts: ["Hai bên công nhận đã hiểu rõ quyền, nghĩa vụ và lợi ích hợp pháp của mình, ý nghĩa và hậu quả pháp lý của việc giao kết Hợp đồng này."] },
    { tag: "p", parts: ["Từng bên đã đọc Hợp đồng, đã hiểu và đồng ý tất cả các điều khoản ghi trong Hợp đồng và ký vào Hợp đồng này trước sự có mặt của công chứng viên."] },
    { tag: "ds", parts: ["Hợp đồng này có hiệu lực kể từ thời điểm công chứng viên Văn phòng Công chứng Việt An, Thành phố Hồ Chí Minh chứng nhận."] },
  ];
}

function UQ_XE_MAY_BLOCKS(name) {
  return [
    { tag: "qh", parts: ["CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"] },
    { tag: "qh2", parts: ["Độc lập - Tự do - Hạnh phúc"] },
    { tag: "dt", parts: [name.toUpperCase()] },
    { tag: "p", parts: ["Hôm nay ngày ...../...../2026 tại Văn phòng Công chứng Việt An, Thành phố Hồ Chí Minh, chúng tôi gồm có:"] },
    { tag: "dh", parts: ["BÊN ỦY QUYỀN (BÊN A)"] },
    { tag: "p", parts: ["Ông: ", F("hoTen_A")] },
    { tag: "p", parts: ["Ngày tháng năm sinh: ", F("ngaySinh_A")] },
    { tag: "p", parts: ["Căn cước công dân số: ", F("cccd_A"), " cấp ngày: ", F("cccdNgayCap_A")] },
    { tag: "p", parts: ["Và vợ là Bà: ", F("hoTen_A2")] },
    { tag: "p", parts: ["Ngày tháng năm sinh: ", F("ngaySinh_A2")] },
    { tag: "p", parts: ["Căn cước công dân số: ", F("cccd_A2"), " cấp ngày: ", F("cccdNgayCap_A2")] },
    { tag: "p", parts: ["Nơi cư trú: ", F("diaChi_A")] },
    { tag: "p", parts: ["(Đính kèm theo giấy chứng nhận kết hôn)"] },
    { tag: "p", parts: ["Bên A là chủ sở hữu chiếc xe mang biển số ", F("bienSo"), " (nhãn hiệu ", F("nhanHieu"), ", số loại ", F("soLoai"), ", màu sơn ", F("mauSon"), ", số máy ", F("soMay"), ", số khung ", F("soKhung"), ") theo Giấy chứng nhận đăng ký xe mô tô, xe gắn máy số ", F("soDangKyXe"), " do ", F("noiCapDangKyXe"), " cấp ngày ", F("ngayCapDangKyXe"), "."] },
    { tag: "dh", parts: ["BÊN ĐƯỢC ỦY QUYỀN (BÊN B)"] },
    { tag: "p", parts: ["Ông: ", F("hoTen_B")] },
    { tag: "p", parts: ["Ngày tháng năm sinh: ", F("ngaySinh_B")] },
    { tag: "p", parts: ["Căn cước công dân số: ", F("cccd_B"), " cấp ngày: ", F("cccdNgayCap_B")] },
    { tag: "p", parts: ["Nơi cư trú: ", F("diaChi_B")] },
    { tag: "p", parts: ["Bằng hợp đồng này, Bên A đồng ý ủy quyền cho Bên B với những nội dung sau đây:"] },
    { tag: "dh", parts: ["NỘI DUNG ỦY QUYỀN"] },
    { tag: "p", parts: ["1. Bên B được quyền thay mặt và nhân danh bên A quản lý, sử dụng, rút hồ sơ gốc chuyển vùng đăng ký quyền sở hữu, làm thủ tục thu hồi giấy chứng nhận đăng ký xe, biển số xe, nộp lại biển số xe và giấy chứng nhận đăng ký xe (nếu có); đăng ký bảo hiểm và nhận tiền bảo hiểm (nếu có), cho thuê, bán, tặng cho, thanh lý, sửa đổi bổ sung, hủy bỏ hợp đồng cho thuê, bán, tặng cho; giải quyết các vấn đề: bồi thường, vi phạm hành chính trong lĩnh vực giao thông, nhận lại xe (nếu có) đối với chiếc xe mang biển số nêu trên, căn cứ theo quy định của pháp luật."] },
    { tag: "p", parts: ["2. Trong phạm vi ủy quyền, bên B được quyền liên hệ với các cơ quan có thẩm quyền tiến hành các thủ tục về các hành vi đã được ủy quyền, được quyền quyết định mọi vấn đề, được quyền nộp và nhận hồ sơ, được quyền lập văn bản, ký tên trên các giấy tờ liên quan và thực hiện các quyền và nghĩa vụ theo quy định của pháp luật."] },
    { tag: "p", parts: ["Thù lao ủy quyền: Không."] },
    { tag: "p", parts: ["Thời hạn ủy quyền: 20 (hai mươi) năm kể từ ngày ký hợp đồng này hoặc hợp đồng hết hiệu lực theo quy định."] },
    { tag: "p", parts: ["3. Bên B được quyền ủy quyền lại cho bên thứ ba (kể cả hủy ủy quyền) với phạm vi ủy quyền nêu trên."] },
    { tag: "p", parts: ["Bên A xin chịu hoàn toàn trách nhiệm trước pháp luật về mọi cam kết do bên B nhân danh bên A thực hiện trong phạm vi ủy quyền trên đây."] },
    { tag: "p", parts: ["Bên B cam kết thực hiện đúng nội dung bên A đã ủy quyền cho bên B."] },
    { tag: "ds", parts: ["Các bên đã đọc lại hợp đồng này, đồng thời đã nghe Công chứng viên giải thích về nội dung, hậu quả pháp lý của việc ủy quyền và đã hiểu rõ, tự nguyện ký vào hợp đồng này."] },
  ];
}

function UQ_XE_OTO_1BEN_BLOCKS(name) {
  return [
    { tag: "qh", parts: ["CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"] },
    { tag: "qh2", parts: ["Độc lập - Tự do - Hạnh phúc"] },
    { tag: "dt", parts: [name.toUpperCase()] },
    { tag: "p", parts: ["Hôm nay, ngày … tháng …. năm 2026. Chúng tôi gồm:"] },
    { tag: "dh", parts: ["BÊN ỦY QUYỀN (BÊN A)"] },
    { tag: "p", parts: ["Ông: ", F("hoTen_A")] },
    { tag: "p", parts: ["Ngày tháng năm sinh: ", F("ngaySinh_A")] },
    { tag: "p", parts: ["Căn cước công dân số: ", F("cccd_A"), " cấp ngày: ", F("cccdNgayCap_A")] },
    { tag: "p", parts: ["Và vợ là Bà: ", F("hoTen_A2")] },
    { tag: "p", parts: ["Ngày tháng năm sinh: ", F("ngaySinh_A2")] },
    { tag: "p", parts: ["Căn cước công dân số: ", F("cccd_A2"), " cấp ngày: ", F("cccdNgayCap_A2")] },
    { tag: "p", parts: ["Nơi cư trú: ", F("diaChi_A")] },
    { tag: "p", parts: ["Bên A là chủ sở hữu chiếc xe nhãn hiệu ", F("nhanHieu"), ", mang biển số ", F("bienSo"), " (số máy ", F("soMay"), ", số khung ", F("soKhung"), ", số loại ", F("soLoai"), ", màu sơn ", F("mauSon"), ") theo Giấy chứng nhận đăng ký xe ô tô số ", F("soDangKyXe"), " do ", F("noiCapDangKyXe"), " cấp ngày ", F("ngayCapDangKyXe"), "."] },
    { tag: "dh", parts: ["BÊN ĐƯỢC ỦY QUYỀN (BÊN B)"] },
    { tag: "p", parts: ["Ông: ", F("hoTen_B")] },
    { tag: "p", parts: ["Ngày tháng năm sinh: ", F("ngaySinh_B")] },
    { tag: "p", parts: ["Căn cước công dân số: ", F("cccd_B"), " cấp ngày: ", F("cccdNgayCap_B")] },
    { tag: "p", parts: ["Nơi cư trú: ", F("diaChi_B")] },
    { tag: "p", parts: ["Do bên được ủy quyền không thể có mặt tại Văn phòng Công chứng Việt An, thành phố Hồ Chí Minh, do đó bên được ủy quyền có trách nhiệm liên hệ tổ chức hành nghề công chứng nơi họ cư trú để hoàn tất thủ tục công chứng hợp đồng ủy quyền. Sau khi hoàn tất thủ tục công chứng, bên được ủy quyền có trách nhiệm gửi cho bên ủy quyền 01 (một) bản chính của văn bản công chứng."] },
    { tag: "p", parts: ["Bằng hợp đồng này, Bên A đồng ý ủy quyền cho Bên B với những nội dung sau đây:"] },
    { tag: "dh", parts: ["NỘI DUNG ỦY QUYỀN"] },
    { tag: "p", parts: ["Bên B được quyền thay mặt và nhân danh bên A quản lý, sử dụng; rút hồ sơ gốc chuyển về tỉnh đăng ký quyền sở hữu, làm thủ tục thu hồi giấy chứng nhận đăng ký xe, biển số xe, nộp lại biển số xe và giấy chứng nhận đăng ký xe (nếu có); đăng ký bảo hiểm và nhận tiền bảo hiểm (nếu có), cho thuê, bán, tặng cho; thanh lý, sửa đổi bổ sung, hủy bỏ các hợp đồng: cho thuê, bán, tặng cho; xin cấp lại giấy đăng ký xe (nếu mất); đăng ký thay đổi hoặc bổ sung nội dung trên giấy đăng ký xe (màu, biển số…) và được nhận lại bản chính Giấy đăng ký xe; giải quyết các vấn đề: bồi thường, vi phạm hành chính trong lĩnh vực giao thông, nộp phạt, nhận lại xe (nếu có) đối với chiếc xe nêu trên, căn cứ theo quy định của pháp luật."] },
    { tag: "li", parts: ["Bên B được quyền ủy quyền lại cho bên thứ ba (kể cả hủy bỏ/chấm dứt hợp đồng ủy quyền lại cho bên thứ ba) nhưng nội dung ủy quyền, thời hạn ủy quyền không được ngoài phạm vi ủy quyền mà bên A đã ủy quyền cho bên B."] },
    { tag: "p", parts: ["2. Trong phạm vi ủy quyền, bên B được quyền liên hệ với các cơ quan có thẩm quyền tiến hành các thủ tục về các hành vi đã được ủy quyền, được quyền quyết định mọi vấn đề, được quyền nộp và nhận hồ sơ; được quyền đóng các khoản phí, lệ phí liên quan đến công việc ủy quyền; được quyền giao, nhận tiền phát sinh từ những nội dung ủy quyền nêu trên (nếu có); được quyền lập văn bản, ký tên trên các giấy tờ liên quan và thực hiện các quyền và nghĩa vụ theo quy định của pháp luật."] },
    { tag: "p", parts: ["Thù lao ủy quyền: Không."] },
    { tag: "p", parts: ["Thời hạn ủy quyền: 20 (hai mươi) năm kể từ ngày ký hợp đồng này hoặc đến khi hợp đồng ủy quyền này chấm dứt theo quy định."] },
    { tag: "p", parts: ["Bên A xin chịu hoàn toàn trách nhiệm trước pháp luật về mọi cam kết do bên B nhân danh bên A thực hiện trong phạm vi ủy quyền trên đây."] },
    { tag: "p", parts: ["Bên B cam kết thực hiện đúng nội dung bên A đã ủy quyền cho bên B. Trong trường hợp bên B đưa chiếc xe nêu trên tham gia giao thông thì bên B cam kết: phải đủ điều kiện tham gia giao thông và bồi thường toàn bộ thiệt hại gây ra (nếu có)."] },
    { tag: "p", parts: ["Các bên đã đọc lại hợp đồng này, đồng thời đã nghe Công chứng viên giải thích về nội dung, hậu quả pháp lý của việc ủy quyền và đã hiểu rõ, tự nguyện ký vào hợp đồng này."] },
    { tag: "ds", parts: ["Hợp đồng lập thành 06 bản, Văn phòng Công chứng lưu 01 bản."] },
  ];
}

function UQ_XE_OTO_BLOCKS(name) {
  return [
    { tag: "qh", parts: ["CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"] },
    { tag: "qh2", parts: ["Độc lập - Tự do - Hạnh phúc"] },
    { tag: "dt", parts: [name.toUpperCase()] },
    { tag: "p", parts: ["Hôm nay, ngày … tháng …. năm 2026. Chúng tôi gồm:"] },
    { tag: "dh", parts: ["BÊN ỦY QUYỀN (BÊN A)"] },
    { tag: "p", parts: ["Ông: ", F("hoTen_A")] },
    { tag: "p", parts: ["Ngày tháng năm sinh: ", F("ngaySinh_A")] },
    { tag: "p", parts: ["Căn cước công dân số: ", F("cccd_A"), " cấp ngày: ", F("cccdNgayCap_A")] },
    { tag: "p", parts: ["Và vợ là Bà: ", F("hoTen_A2")] },
    { tag: "p", parts: ["Ngày tháng năm sinh: ", F("ngaySinh_A2")] },
    { tag: "p", parts: ["Căn cước công dân số: ", F("cccd_A2"), " cấp ngày: ", F("cccdNgayCap_A2")] },
    { tag: "p", parts: ["Nơi cư trú: ", F("diaChi_A")] },
    { tag: "p", parts: ["Bên A là chủ sở hữu chiếc xe nhãn hiệu ", F("nhanHieu"), ", mang biển số ", F("bienSo"), " (số máy ", F("soMay"), ", số khung ", F("soKhung"), ", số loại ", F("soLoai"), ", màu sơn ", F("mauSon"), ") theo Giấy chứng nhận đăng ký xe ô tô số ", F("soDangKyXe"), " do ", F("noiCapDangKyXe"), " cấp ngày ", F("ngayCapDangKyXe"), "."] },
    { tag: "dh", parts: ["BÊN ĐƯỢC ỦY QUYỀN (BÊN B)"] },
    { tag: "p", parts: ["Ông: ", F("hoTen_B")] },
    { tag: "p", parts: ["Ngày tháng năm sinh: ", F("ngaySinh_B")] },
    { tag: "p", parts: ["Căn cước công dân số: ", F("cccd_B"), " cấp ngày: ", F("cccdNgayCap_B")] },
    { tag: "p", parts: ["Nơi cư trú: ", F("diaChi_B")] },
    { tag: "p", parts: ["Bằng hợp đồng này, Bên A đồng ý ủy quyền cho Bên B với những nội dung sau đây:"] },
    { tag: "dh", parts: ["NỘI DUNG ỦY QUYỀN"] },
    { tag: "p", parts: ["1. Bên B được quyền thay mặt và nhân danh bên A quản lý, sử dụng; rút hồ sơ gốc chuyển về tỉnh đăng ký quyền sở hữu, làm thủ tục thu hồi giấy chứng nhận đăng ký xe, biển số xe, nộp lại biển số xe và giấy chứng nhận đăng ký xe (nếu có); đăng ký bảo hiểm và nhận tiền bảo hiểm (nếu có), cho thuê, bán, tặng cho; thanh lý, sửa đổi bổ sung, hủy bỏ các hợp đồng: cho thuê, bán, tặng cho; xin cấp lại giấy đăng ký xe (nếu mất); đăng ký thay đổi hoặc bổ sung nội dung trên giấy đăng ký xe (màu, biển số…) và được nhận lại bản chính Giấy đăng ký xe; giải quyết các vấn đề: bồi thường, vi phạm hành chính trong lĩnh vực giao thông, nộp phạt, nhận lại xe (nếu có) đối với chiếc xe nêu trên, căn cứ theo quy định của pháp luật."] },
    { tag: "li", parts: ["Bên B được quyền ủy quyền lại cho bên thứ ba (kể cả hủy bỏ/chấm dứt hợp đồng ủy quyền lại cho bên thứ ba) nhưng nội dung ủy quyền, thời hạn ủy quyền không được ngoài phạm vi ủy quyền mà bên A đã ủy quyền cho bên B."] },
    { tag: "p", parts: ["2. Trong phạm vi ủy quyền, bên B được quyền liên hệ với các cơ quan có thẩm quyền tiến hành các thủ tục về các hành vi đã được ủy quyền, được quyền quyết định mọi vấn đề, được quyền nộp và nhận hồ sơ; được quyền đóng các khoản phí, lệ phí liên quan đến công việc ủy quyền; được quyền giao, nhận tiền phát sinh từ những nội dung ủy quyền nêu trên (nếu có); được quyền lập văn bản, ký tên trên các giấy tờ liên quan và thực hiện các quyền và nghĩa vụ theo quy định của pháp luật."] },
    { tag: "p", parts: ["Thù lao ủy quyền: Không."] },
    { tag: "p", parts: ["Thời hạn ủy quyền: 20 (hai mươi) năm kể từ ngày ký hợp đồng này hoặc đến khi hợp đồng ủy quyền này chấm dứt theo quy định."] },
    { tag: "p", parts: ["Bên A xin chịu hoàn toàn trách nhiệm trước pháp luật về mọi cam kết do bên B nhân danh bên A thực hiện trong phạm vi ủy quyền trên đây."] },
    { tag: "p", parts: ["Bên B cam kết thực hiện đúng nội dung bên A đã ủy quyền cho bên B. Trong trường hợp bên B đưa chiếc xe nêu trên tham gia giao thông thì bên B cam kết: phải đủ điều kiện tham gia giao thông và bồi thường toàn bộ thiệt hại gây ra (nếu có)."] },
    { tag: "ds", parts: ["Các bên đã đọc lại hợp đồng này, đồng thời đã nghe Công chứng viên giải thích về nội dung, hậu quả pháp lý của việc ủy quyền và đã hiểu rõ, tự nguyện ký vào hợp đồng này."] },
  ];
}

const SPECIFIC_BLOCKS = {
  "Giấy ủy quyền": GIAY_UY_QUYEN_BLOCKS,
  "HĐ Ủy quyền toàn quyền nhà đất": UQ_TOAN_QUYEN_NHA_DAT_BLOCKS,
  "Thụ ủy hợp đồng ủy quyền": THU_UY_BLOCKS,
  "Giấy ủy quyền thành lập doanh nghiệp": UQ_THANH_LAP_DN_BLOCKS,
  "HĐ Mua bán xe máy": MUA_BAN_XE_MAY_BLOCKS,
  "HĐ Mua bán xe ô tô": MUA_BAN_XE_OTO_BLOCKS,
  "HĐ Ủy quyền xe máy": UQ_XE_MAY_BLOCKS,
  "HĐ Ủy quyền xe ô tô": UQ_XE_OTO_BLOCKS,
  "HĐ Ủy quyền xe ô tô (1 bên)": UQ_XE_OTO_1BEN_BLOCKS,
};

/* Loại hợp đồng -> bộ khối nội dung */
const VA_CONTRACT_TYPES = [
  { group: "Bất động sản", kind: "land",    desc: "Chuyển nhượng / tặng cho QSDĐ, nhà ở" },
  { group: "Động sản",     kind: "vehicle", desc: "Mua bán xe, tài sản động sản" },
  { group: "Ủy quyền",     kind: "auth",    desc: "Giấy / hợp đồng ủy quyền" },
  { group: "Khác",         kind: "generic", desc: "Văn bản công chứng khác" },
];

function kindOf(tpl) {
  if (tpl.kind) return tpl.kind;
  const byTid = { t1: "land", t2: "vehicle", t3: "auth", t4: "land" };
  if (tpl.tid && byTid[tpl.tid]) return byTid[tpl.tid];
  // Gộp cả nhóm mock (VA_CONTRACT_TYPES.group) lẫn nhóm THẬT (BieuMau.nhom) —
  // 2 bộ tên khác nhau nhưng cùng ánh xạ về 1 bộ "kind" mà blocksFor() dùng.
  const byGroup = { "Bất động sản": "land", "Động sản": "vehicle", "Ủy quyền": "auth", "Đất đai": "land", "Ủy quyền xe": "auth" };
  return byGroup[tpl.group] || "generic";
}

// Ánh xạ nhóm biểu mẫu THẬT (BieuMau.nhom trong DB, vd "Đất đai") sang cùng bộ
// "kind" mà blocksFor() dùng — nhóm DB đặt tên khác nhóm mock (VA_CONTRACT_TYPES.group).
function nhomToKind(nhom) {
  const byNhom = { "Đất đai": "land", "Động sản": "vehicle", "Ủy quyền": "auth", "Ủy quyền xe": "auth" };
  return byNhom[nhom] || "generic";
}

// 9 mẫu thật (2025-07) có nội dung riêng, tra theo đúng tên biểu mẫu — ưu tiên
// trước khi rơi về bộ khối chung theo "kind" (dùng cho mẫu Đất đai / mẫu tùy chỉnh khác).
function blocksFor(tpl) {
  if (SPECIFIC_BLOCKS[tpl.name]) return SPECIFIC_BLOCKS[tpl.name](tpl.name);
  const k = kindOf(tpl);
  if (k === "land") return LAND_BLOCKS(tpl.name, tpl.tid === "t4" || /tặng cho/i.test(tpl.name) ? "TẶNG CHO" : "CHUYỂN NHƯỢNG");
  if (k === "vehicle") return VEHICLE_BLOCKS(tpl.name);
  if (k === "auth") return AUTH_BLOCKS(tpl.name);
  return GENERIC_BLOCKS(tpl.name);
}

/* Nội dung THẬT của biểu mẫu để nạp vào Quill: biểu mẫu tùy chỉnh đã soạn nội
   dung riêng (BieuMau.noiDung.html, do màn "Biểu mẫu soạn thảo" lưu) thì dùng
   ngay nội dung đó; chưa soạn (hoặc biểu mẫu chuẩn) thì rơi về bộ khối chung
   blocksFor() như cũ. */
function htmlOf(tpl) {
  if (tpl.noiDung && typeof tpl.noiDung === "object" && tpl.noiDung.html) return tpl.noiDung.html;
  return blocksToHtml(blocksFor(tpl));
}

/* Quét trực tiếp trên HTML thật (không phải trên blocksFor()) để phản ánh đúng
   cả trường dữ liệu do người dùng tự đánh dấu thủ công trong nội dung tùy chỉnh. */
function fieldKeysOfHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return Array.from(div.querySelectorAll(".va-field"))
    .map((el) => {
      const fkey = el.getAttribute("data-fkey");
      if (!fkey) return null;
      return { fkey, label: el.getAttribute("data-label") || VA_FIELD_LABELS[fkey] || fkey };
    })
    .filter(Boolean);
}

/* Khóa trường nào có trong biểu mẫu (để biết auto-fill đã dùng gì) */
function fieldKeysOf(tpl) {
  return fieldKeysOfHtml(htmlOf(tpl));
}

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* Sinh HTML khởi tạo nạp vào Quill từ mảng block — chạy 1 lần khi mở tab, sau
   đó người dùng soạn thảo tự do (Quill không đọc lại blocksFor nữa). Token
   F(key) -> span "va-field" giữ được khi gõ đè lên (giống ô form trong Word). */
const BLOCK_TAG = {
  qh: { el: "p", style: "text-align:center;font-weight:700;margin:0" },
  qh2: { el: "p", style: "text-align:center;font-weight:600;margin:0 0 14px;text-decoration:underline" },
  dt: { el: "h2", style: "text-align:center;font-weight:700;text-transform:uppercase;margin:0 0 4px" },
  dm: { el: "p", style: "text-align:center;font-style:italic;color:#7a7a72;margin:0 0 18px" },
  dh: { el: "p", style: "font-weight:700;margin:18px 0 4px" },
  p: { el: "p", style: "margin:0 0 8px" },
  li: { el: "p", style: "margin:0 0 8px 24px" },
  ds: { el: "p", style: "font-style:italic;color:#5b5b54;margin:18px 0 0" },
};
function blocksToHtml(blocks) {
  return blocks.map((b) => {
    const spec = BLOCK_TAG[b.tag] || BLOCK_TAG.p;
    const inner = b.parts.map((p) => {
      if (typeof p === "string") return escapeHtml(p);
      const label = escapeHtml(p.label || p.f);
      return `<span class="va-field" data-fkey="${p.f}" data-origin="empty">‹${label}›</span>`;
    }).join("");
    return `<${spec.el} style="${spec.style}">${inner}</${spec.el}>`;
  }).join("");
}

/* Bản đồ tự động: gom giá trị OCR theo khóa ngữ nghĩa */
function buildAutoMap(ocrDocs) {
  const map = {};
  (ocrDocs || []).forEach((d) => (d.fields || []).forEach((f) => { if (f.fkey && f.value) map[f.fkey] = { value: f.value, mono: f.mono, from: d.name }; }));
  return map;
}

/* ============ Kho biểu mẫu (localStorage) ============ */
const TPL_STORE_KEY = "va_templates_v1";
const TPL_SEED = [
  { id: "t1",  name: "HĐ Chuyển nhượng QSDĐ",              group: "Bất động sản", kind: "land",    builtin: true },
  { id: "t4",  name: "HĐ Tặng cho QSDĐ",                   group: "Bất động sản", kind: "land",    builtin: true },
  { id: "t5",  name: "Giấy ủy quyền",                       group: "Ủy quyền",    kind: "auth",    builtin: true },
  { id: "t6",  name: "HĐ Ủy quyền toàn quyền nhà đất",      group: "Ủy quyền",    kind: "auth",    builtin: true },
  { id: "t7",  name: "Thụ ủy hợp đồng ủy quyền",            group: "Ủy quyền",    kind: "auth",    builtin: true },
  { id: "t8",  name: "Giấy ủy quyền thành lập doanh nghiệp", group: "Ủy quyền",    kind: "auth",    builtin: true },
  { id: "t9",  name: "HĐ Mua bán xe máy",                   group: "Động sản",    kind: "vehicle", builtin: true },
  { id: "t10", name: "HĐ Mua bán xe ô tô",                  group: "Động sản",    kind: "vehicle", builtin: true },
  { id: "t11", name: "HĐ Ủy quyền xe máy",                  group: "Ủy quyền xe", kind: "auth",    builtin: true },
  { id: "t12", name: "HĐ Ủy quyền xe ô tô",                 group: "Ủy quyền xe", kind: "auth",    builtin: true },
  { id: "t13", name: "HĐ Ủy quyền xe ô tô (1 bên)",         group: "Ủy quyền xe", kind: "auth",    builtin: true },
];

const tplListeners = new Set();
function loadTpls() {
  try {
    const raw = localStorage.getItem(TPL_STORE_KEY);
    if (raw) { const arr = JSON.parse(raw); if (Array.isArray(arr) && arr.length) return arr; }
  } catch (e) { /* ignore */ }
  return TPL_SEED.map((t) => ({ ...t }));
}
let _tpls = loadTpls();
function saveTpls() {
  try { localStorage.setItem(TPL_STORE_KEY, JSON.stringify(_tpls)); } catch (e) { /* ignore */ }
  tplListeners.forEach((fn) => fn(_tpls));
}

const VATemplates = {
  list() { return _tpls.slice(); },
  add({ name, group, by, fileName }) {
    const t = VA_CONTRACT_TYPES.find((x) => x.group === group) || VA_CONTRACT_TYPES[3];
    const id = "tpl-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const item = { id, name: name.trim() || "Biểu mẫu mới", group: t.group, kind: t.kind, builtin: false, by: by || "—", fileName: fileName || null, createdAt: new Date().toLocaleDateString("vi-VN") };
    _tpls = [..._tpls, item]; saveTpls(); return item;
  },
  rename(id, name) { _tpls = _tpls.map((t) => t.id === id ? { ...t, name: name.trim() || t.name } : t); saveTpls(); },
  setGroup(id, group) {
    const t = VA_CONTRACT_TYPES.find((x) => x.group === group) || VA_CONTRACT_TYPES[3];
    _tpls = _tpls.map((x) => x.id === id ? { ...x, group: t.group, kind: t.kind } : x); saveTpls();
  },
  remove(id) { _tpls = _tpls.filter((t) => t.id !== id); saveTpls(); },
  resetSeed() { _tpls = TPL_SEED.map((t) => ({ ...t })); saveTpls(); },
  subscribe(fn) { tplListeners.add(fn); return () => tplListeners.delete(fn); },
};

/* Hook React cho danh sách biểu mẫu sống */
function useTemplates() {
  const [list, setList] = useTplState(VATemplates.list());
  useTplEffect(() => VATemplates.subscribe((l) => setList(l.slice())), []);
  return list;
}

window.VATemplates = VATemplates;
window.VATemplateModel = {
  VA_FIELD_LABELS, VA_CONTRACT_TYPES, blocksFor, blocksToHtml, htmlOf, fieldKeysOf, fieldKeysOfHtml, buildAutoMap, kindOf, nhomToKind, useTemplates,
};
