# HƯỚNG DẪN & TỔNG HỢP MA TRẬN TÍNH NĂNG VÀ KỊCH BẢN BIÊN (EXCEL PROJECT TRACKING)

> **Tệp Excel gốc:** [`SmartTimeChecking_Feature_and_EdgeCase_Matrix.xlsx`](file:///Users/sang/Projects/App/SmartTimeChecking/SmartTimeChecking_Feature_and_EdgeCase_Matrix.xlsx)  
> **Tệp trong docs:** [`docs/SmartTimeChecking_Feature_and_EdgeCase_Matrix.xlsx`](file:///Users/sang/Projects/App/SmartTimeChecking/docs/SmartTimeChecking_Feature_and_EdgeCase_Matrix.xlsx)  
> **Định dạng:** Microsoft Excel Workbook (.xlsx) gồm 2 Tab chuyên biệt có định dạng màu sắc trực quan (Color-coded), tự động co giãn dòng/cột và bổ sung chi tiết **Cột hướng dẫn QA/Tester kiểm thử từng bước (UI & API)**.

---

## 1. CẤU TRÚC 10 CỘT TRONG TỆP EXCEL

Mỗi sheet trong file Excel hiện tại được trang bị đầy đủ **10 cột thông tin** chi tiết:

| STT Cột | Tên Cột (Header) | Mô Tả Ý Nghĩa & Vai Trò |
| :---: | :--- | :--- |
| **1** | **STT** | Số thứ tự tăng dần theo từng danh mục. |
| **2** | **Phase / Phân Hệ** | Giai đoạn triển khai (Phase 1, 2, 3, 4) hoặc Phân hệ nghiệp vụ. |
| **3** | **Mức Độ Ưu Tiên / Loại Kịch Bản** | Phân loại Bắt buộc (Mandatory), Nâng cao (Enterprise), Tiện ích (Nice to have), hoặc Loại kịch bản biên (Negative, Fraud, Boundary...). |
| **4** | **Function (Tính Năng)** | Tên chức năng nghiệp vụ cụ thể. |
| **5** | **Description / Mô Tả Kịch Bản** | Mô tả chi tiết logic vận hành hoặc kịch bản ngoại lệ / lỗi. |
| **6** | **BackEnd API Endpoint** | Đường dẫn API backend tương ứng (kèm HTTP Method POST/GET/PUT/DELETE) hoặc tên service/component UI. |
| **7** | **Hướng Dẫn Test / Verify (QA Steps UI & API)** | **[CỘT MỚI BỔ SUNG]** Hướng dẫn step-by-step cho QA/Tester: các thao tác bấm chuột trên UI/Frontend, trường dữ liệu nhập, và cách gửi payload qua API Backend cùng các giá trị kỳ vọng (Status code 200/201/400/401/403/409, mã lỗi error code, toast thông báo). |
| **8** | **Status (Trạng Thái)** | Tình trạng triển khai: *Hoàn thành (100%)*, *Đã xử lý & Automated*, hoặc *Kế hoạch (Roadmap)*. |
| **9** | **Assignee (Phụ Trách)** | Đội ngũ kỹ thuật chịu trách nhiệm (Frontend, Backend, Security, AI, DevOps...). |
| **10** | **Note (Ghi Chú Kỹ Thuật)** | Cơ chế thuật toán, mã exception code, cấu hình bảo mật hoặc ràng buộc database. |

---

## 2. NỘI DUNG 2 TAB CHI TIẾT

### Tab 1: `Features List (Toàn Bộ)` (78 Tính năng)
Bao gồm toàn bộ tính năng của hệ thống qua 4 giai đoạn, mỗi tính năng đều có hướng dẫn kiểm thử chi tiết:
- **Phase 1: Nền Tảng Chấm Công Đa Lớp & Kiosk Sảnh (Core MVP - 32 Tính năng - 100% Hoàn thành)**:
  - *Ví dụ hướng dẫn QA cho Đăng nhập RBAC:* Mở màn hình Login $\rightarrow$ Nhập `nv.a@company.com` / `Password@123` $\rightarrow$ Nhấn Đăng nhập $\rightarrow$ Verify chuyển cổng Employee Portal, hiển thị avatar & tên. API: `POST /api/v1/auth/login` body `{"email":"...","password":"..."}` $\rightarrow$ Verify HTTP 200, JWT token và `role: EMPLOYEE`.
  - *Ví dụ hướng dẫn QA cho Dynamic QR Kiosk:* Mở `/kiosk` $\rightarrow$ Quan sát mã QR xoay vòng 5s kèm thanh progress bar. API: `GET /api/v1/kiosk/current-qr` $\rightarrow$ Verify HTTP 200, `validDurationSeconds: 5`.
  - *Ví dụ hướng dẫn QA cho Chấm công 3 lớp:* Nhấn 'Check-in Vào Ca' $\rightarrow$ Quét QR Kiosk $\rightarrow$ Verify toast thành công màu xanh, bảng dập thẻ xuất hiện dòng IN lúc 08:30.
- **Phase 2: Mở Rộng Trải Nghiệm Đa Chiều, Executive Analytics & Google Workspace (26 Tính năng - 100% Hoàn thành)**:
  - *Ví dụ Camera QR Web:* Bấm nút 'Quét Camera QR' $\rightarrow$ Cấp quyền Webcam $\rightarrow$ Khung laser xanh quét qua lại $\rightarrow$ Hướng webcam vào QR Kiosk $\rightarrow$ Phát tiếng Beep, dập thẻ thành công.
  - *Ví dụ Lưới Lịch công 30 ngày:* Bấm 'Xem Bảng Công Chi Tiết' $\rightarrow$ Verify lưới 30 ô vuông hiển thị màu sắc trực quan (Xanh: Bình thường, Cam: Đi muộn, Tím: Phép, Lơ: WFH).
  - *Ví dụ Executive BI Dashboard:* Xem Presence Gauge bán nguyệt, 6 thẻ số liệu vĩ mô, biểu đồ cột 6 tháng và Leaderboard Top 5 đi muộn.
  - *Ví dụ Google Workspace One-Click:* Bấm gửi email phê duyệt mô phỏng $\rightarrow$ Nhấp 'Approve' trong email $\rightarrow$ Mở trang thông báo 'Phê duyệt thành công' không cần login.
- **Phase 3: AI Sinh Trắc Học, Quản Lý Ca Kíp & Làm Thêm Giờ OT (12 Tính năng - Roadmap)**:
  - Hướng dẫn thiết lập ca kíp, nộp đơn OT, kiểm tra trần 40h/tháng, liveness detection và xác thực 2 bước MFA.
- **Phase 4: Tự Động Hóa Tính Lương & Tích Hợp ERP Kế Toán (8 Tính năng - Roadmap)**:
  - Hướng dẫn kiểm thử động cơ tính lương tự động, trích trừ BHXH 10.5%, tính thuế TNCN lũy tiến, xuất e-Payslip mã hóa mật khẩu và Webhook đồng bộ MISA AMIS.

---

### Tab 2: `Edge Cases & Failed Scenarios` (38 Kịch bản biên & lỗi)
Bao gồm 38 kịch bản tiêu cực (Negative Testing), gian lận và lỗi ranh giới (Boundary Testing):
- **Xác thực & Bảo mật (5 kịch bản):** Email không tồn tại, Sai mật khẩu, JWT giả mạo/hết hạn, Nhân viên cố gọi API Admin/Duyệt đơn (403 Forbidden).
- **Thiết Bị Chấm Công (3 kịch bản):** Điện thoại lạ chưa binding (`ERR_DEVICE_MISMATCH`), Thiết bị bị thu hồi (`ERR_DEVICE_REVOKED`), Đăng ký đè máy cũ (`ERR_DEVICE_ALREADY_REGISTERED`).
- **Kiosk Dynamic QR (4 kịch bản):** Quét QR quá hạn 5s (`ERR_QR_EXPIRED`), Giả mạo chữ ký HMAC (`ERR_INVALID_QR_SIGNATURE`), Chụp ảnh quét lại Replay Attack (`ERR_REPLAY_ATTACK_DETECTED`), Chấm ngoài Wi-Fi (`ERR_IP_SUBNET_MISMATCH`).
- **Chấm Khẩn Cấp GPS (3 kịch bản):** GPS lệch >100m (`FLAG_LOCATION_MISMATCH`), GPS lệch >5km (Cảnh báo đỏ Google Chat), Tắt GPS (`ERR_MISSING_GPS_COORDINATES`).
- **Hạn Ngạch & Đơn Từ (9 kịch bản):** Đi muộn lần 3 (>2 lần/tháng), Đi muộn >60p, WFH ngày thứ 5 (>4 ngày/tháng), WFH báo sát giờ (<24h), Bổ sung công quá 3 ngày (`ERR_DEADLINE_EXCEEDED`), Nghỉ ốm thiếu mẫu C65 (`ERR_ATTACHMENT_REQUIRED`), Hết phép năm, Hủy đơn đã duyệt (`ERR_CANNOT_CANCEL_APPROVED_REQUEST`), Từ chối đơn thiếu lý do.
- **Bảng Công & Kỳ Lương (4 kịch bản):** Khiếu nại quá hạn 48h (`ERR_DISPUTE_EXPIRED`), Tổng hợp lại kỳ đã khóa (`ERR_PERIOD_LOCKED`), Thêm punch vào kỳ đã khóa (`ERR_IMMUTABLE_RECORD`), Lỗi font tiếng Việt CSV (Đã chèn UTF-8 BOM).
- **Google Workspace (3 kịch bản):** Click nút duyệt email lần 2 (Mã đã sử dụng), Link duyệt quá 24h (Mã hết hạn), Webhook Google Chat lỗi (Log FAILED, không crash app).
- **Quản Trị Master Data (5 kịch bản):** Trùng mã phòng ban, Xóa phòng ban còn nhân viên, Giờ kết thúc ca trước giờ bắt đầu, Ngày kết thúc lễ trước ngày bắt đầu, Trùng mã/email nhân viên.
- **Giao Diện & Thiết Bị (2 kịch bản):** Từ chối cấp quyền camera (Hiển thị hướng dẫn + nút fallback lấy mã Kiosk), Tải ảnh không chứa mã QR (Báo lỗi ảnh không hợp lệ).

---

## 3. BẢNG THỐNG KÊ TỔNG HỢP

| Chỉ Số Đánh Giá | Tab 1: Features List | Tab 2: Edge Cases | Toàn Bộ Hệ Thống |
| :--- | :---: | :---: | :---: |
| **Tổng số dòng dữ liệu** | 78 Tính năng | 38 Kịch bản biên | **116 Nghiệp vụ** |
| **Số cột dữ liệu chuẩn hóa** | 10 Cột | 10 Cột | **10 Cột tiêu chuẩn** |
| **Độ phủ hướng dẫn kiểm thử QA** | 78/78 Tính năng (100%) | 38/38 Kịch bản (100%) | **116/116 Có hướng dẫn UI & API** |
| **Đã hoàn thành (Phase 1 & 2)** | 58 Tính năng (100%) | 38 Kịch bản (100%) | **96 Nghiệp vụ hoàn thành** |
| **Kế hoạch mở rộng (Phase 3 & 4)** | 20 Tính năng | 0 (Đang thiết kế) | **20 Tính năng Roadmap** |
| **Bộ kiểm thử tự động Robot Framework** | 58 API + 53 UI | 38 Edge Cases | **119/119 Tests Passed (100%)** |

---

## 4. HƯỚNG DẪN DÀNH CHO QA/TESTER KHI SỬ DỤNG BẢNG NÀY

1. **Kiểm thử thủ công (Manual Testing):**
   - Đọc cột **"Hướng Dẫn Test / Verify (QA Steps UI & API)"** (Cột 7) để thực hiện các bước thao tác trên giao diện.
   - Quan sát phản hồi trên UI: các thông báo Toast màu xanh lá (thành công) hoặc banner màu đỏ/vàng (cảnh báo lỗi), huy hiệu trạng thái (Badge).
2. **Kiểm thử tự động & API (Automation & Postman Testing):**
   - Sử dụng các thông tin Endpoint (Cột 6) và hướng dẫn payload trong Cột 7 để gửi request trên Postman hoặc cập nhật kịch bản Robot Framework.
   - Đối chiếu mã lỗi trả về trong Cột 10 (Ghi chú kỹ thuật) với response body thực tế (ví dụ: `ERR_QUOTA_EXCEEDED`, `ERR_REPLAY_ATTACK_DETECTED`...).
3. **Cập nhật tiến độ dự án:**
   - Khi chuyển sang Phase 3 và Phase 4, QA Lead có thể cập nhật trạng thái từ *Kế hoạch (Roadmap)* sang *Đang thực hiện* hoặc *Hoàn thành* và gán Assignee tương ứng.
