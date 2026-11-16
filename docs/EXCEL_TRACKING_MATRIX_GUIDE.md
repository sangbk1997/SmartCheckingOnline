# HƯỚNG DẪN & TỔNG HỢP MA TRẬN TÍNH NĂNG VÀ KỊCH BẢN BIÊN (EXCEL PROJECT TRACKING)

> **Tệp Excel gốc:** [`SmartTimeChecking_Feature_and_EdgeCase_Matrix.xlsx`](file:///Users/sang/Projects/App/SmartTimeChecking/SmartTimeChecking_Feature_and_EdgeCase_Matrix.xlsx)  
> **Định dạng:** Microsoft Excel Workbook (.xlsx) gồm 2 Tab chuyên biệt có định dạng màu sắc trực quan (Color-coded), tự động co giãn cột và phân loại Phase/Priority.

---

## 1. CẤU TRÚC TỆP EXCEL

Tệp Excel được thiết kế tối ưu cho công tác theo dõi tiến độ, kiểm thử phần mềm, nghiệm thu sản phẩm và lập kế hoạch bàn giao theo đúng chuẩn quản trị dự án phần mềm chuyên nghiệp:

### Tab 1: `Features List (Toàn Bộ)`
Bao gồm **78 tính năng** được chia theo 4 giai đoạn (Phases) và phân loại theo mức độ ưu tiên:
- **Phase 1: Nền Tảng Chấm Công Đa Lớp & Kiosk Sảnh (Core MVP - 32 Tính năng - 100% Hoàn thành)**:
  - *Mức độ ưu tiên:* **Bắt buộc (Mandatory)**
  - *Phạm vi:* Xác thực RBAC, Device Binding 1-1, Kiosk Dynamic QR 5s, Chống Replay, Chấm khẩn cấp GPS Haversine, Duyệt đơn từ, Policy Quota Engine, Khóa kỳ lương SHA-256, Bù công hồi tố, Xuất CSV UTF-8 BOM, Sơ đồ tổ chức đa tầng.
- **Phase 2: Mở Rộng Trải Nghiệm Đa Chiều, Executive Analytics & Google Workspace (26 Tính năng - 100% Hoàn thành)**:
  - *Mức độ ưu tiên:* **Bắt buộc (Mandatory)**, **Nâng cao (Enterprise)**, **Gợi ý / Tiện ích (Nice to have)**
  - *Phạm vi:* Bật Camera Quét Dynamic QR trực tiếp trên Web với khung laser & jsQR; 1-Click Kiosk Fallback; Bảng công Lưới 30 ngày (Calendar Grid), Bảng từng ngày (Table View), Tổng quan cả năm 12 tháng; Executive Analytics Dashboard (Presence Gauge, 6 thẻ KPI, phân bổ phòng ban, xu hướng 6 tháng, Leaderboard Top 5 đi muộn); Full CRUD Phòng ban, Nhân sự, Thiết bị, Ca làm, Ngày lễ; Actionable Email One-Click Approval 24h; Google Chat Card v2; Bản tin 09:00 tự động.
- **Phase 3: AI Sinh Trắc Học, Quản Lý Ca Kíp Thông Minh & Làm Thêm Giờ OT (12 Tính năng - Kế hoạch Roadmap)**:
  - *Mức độ ưu tiên:* **Bắt buộc (Mandatory)** & **Gợi ý / Tiện ích (Nice to have)**
  - *Phạm vi:* Đăng ký & Phê duyệt OT trước ca; Tự động tính hệ số lương OT 150%, 200%, 300%; Kiểm soát trần 40h/tháng, 200h/năm; Xếp ca kíp tự động; Đề xuất đổi ca làm; AI Nhận diện khuôn mặt FaceID; Face Liveness Detection chống giả mạo; PWA di động & App Native; Xác thực 2 bước MFA; Phân vùng PostgreSQL Table Partitioning.
- **Phase 4: Tự Động Hóa Tính Lương & Tích Hợp Hệ Sinh Thái ERP Kế Toán (8 Tính năng - Kế hoạch Roadmap)**:
  - *Mức độ ưu tiên:* **Bắt buộc (Mandatory)**, **Nâng cao (Enterprise)**, **Gợi ý / Tiện ích (Nice to have)**
  - *Phạm vi:* Động cơ tính lương tự động Automated Payroll Engine từ bảng công đã khóa; Tính thuế TNCN lũy tiến từng phần; Trừ bảo hiểm bắt buộc BHXH 8%, BHYT 1.5%, BHTN 1%; Tự động gửi e-Payslip qua Gmail; Webhook đồng bộ MISA AMIS Kế toán; Open API tích hợp ERP FAST / SAP; AI Dự báo biến động nhân sự; Khảo sát eNPS.

---

### Tab 2: `Edge Cases & Failed Scenarios`
Bao gồm **38 kịch bản biên, lỗi, tấn công, gian lận và ngoại lệ** được kiểm soát chặt chẽ:
- **Xác thực & Bảo mật (5 test cases):** Email không tồn tại (401), Sai mật khẩu (401), Token giả mạo/hết hạn (401/403), Nhân viên thường gọi API quản trị hoặc duyệt đơn (403 Forbidden).
- **Thiết Bị Chấm Công (3 test cases):** Chấm công máy lạ chưa binding (ERR_DEVICE_MISMATCH), Chấm công máy bị thu hồi (ERR_DEVICE_REVOKED), Đăng ký đè máy cũ (ERR_DEVICE_ALREADY_REGISTERED).
- **Kiosk Dynamic QR (4 test cases):** Quét QR quá hạn 5s (ERR_QR_EXPIRED), Giả mạo chữ ký HMAC (ERR_INVALID_QR_SIGNATURE), Chụp ảnh quét lại Replay Attack (ERR_REPLAY_ATTACK_DETECTED), Chấm ngoài dải mạng Wi-Fi (ERR_IP_SUBNET_MISMATCH).
- **Chấm Khẩn Cấp GPS (3 test cases):** Tọa độ GPS lệch >100m (FLAG_LOCATION_MISMATCH), Tọa độ GPS lệch >5km (Bắn cảnh báo đỏ Google Chat), Tắt định vị GPS (ERR_MISSING_GPS_COORDINATES).
- **Hạn Ngạch & Đơn Từ (9 test cases):** Đi muộn lần 3 (>2 lần/tháng), Đi muộn >60 phút, WFH ngày thứ 5 (>4 ngày/tháng), WFH báo sát giờ (<24h), Bổ sung công quá 3 ngày làm việc (ERR_DEADLINE_EXCEEDED), Nghỉ ốm thiếu mẫu C65-HD (ERR_ATTACHMENT_REQUIRED), Hết phép năm, Hủy đơn đã duyệt (ERR_CANNOT_CANCEL_APPROVED_REQUEST), Quản lý từ chối đơn thiếu lý do.
- **Bảng Công & Kỳ Lương (4 test cases):** Khiếu nại quá hạn 48 giờ (ERR_DISPUTE_EXPIRED), Cố tình tổng hợp lại kỳ đã khóa LOCKED (ERR_PERIOD_LOCKED), Sửa đổi dập thẻ kỳ đã khóa (ERR_IMMUTABLE_RECORD), Mở file CSV bị lỗi font tiếng Việt (Đã xử lý bằng UTF-8 BOM).
- **Google Workspace (3 test cases):** Click nút duyệt email lần 2 (MÃ ĐÃ ĐƯỢC SỬ DỤNG), Click link duyệt quá 24 giờ (MÃ ĐÃ HẾT HẠN), Webhook Google Chat mất mạng hoặc sai URL (Ghi log FAILED, không crash app).
- **Quản Trị Master Data (5 test cases):** Trùng mã phòng ban (ERR_DUPLICATE_DEPARTMENT_CODE), Xóa phòng ban còn nhân viên, Giờ kết thúc ca trước giờ bắt đầu, Ngày kết thúc lễ trước ngày bắt đầu, Trùng mã nhân viên/email.
- **Giao Diện & Thiết Bị (2 test cases):** Từ chối cấp quyền camera trình duyệt, Tải ảnh không chứa mã QR hoặc ảnh mờ.

---

## 2. BẢNG THỐNG KÊ TỔNG HỢP

| Chỉ Số Đánh Giá | Tab 1: Features List | Tab 2: Edge Cases | Tổng Hợp Hệ Thống |
| :--- | :---: | :---: | :---: |
| **Tổng số dòng dữ liệu** | 78 Tính năng | 38 Kịch bản biên | **116 Nghiệp vụ** |
| **Đã hoàn thành & Automated (Phase 1 & 2)** | 58 Tính năng (100%) | 38 Kịch bản (100%) | **96 Nghiệp vụ (100% Pass)** |
| **Kế hoạch mở rộng (Phase 3 & 4)** | 20 Tính năng | 0 (Đang thiết kế) | **20 Tính năng Roadmap** |
| **Độ phủ kiểm thử Robot Framework** | 58 API + 53 UI | 38 Edge tests | **119 Test Cases Passed** |

---

## 3. LIÊN KẾT TRUY CẬP TỆP TIN

Bạn có thể mở trực tiếp tệp Excel bằng Microsoft Excel, Apple Numbers, LibreOffice Calc hoặc Google Sheets tại:
- **Tệp Excel gốc:** [SmartTimeChecking_Feature_and_EdgeCase_Matrix.xlsx](file:///Users/sang/Projects/App/SmartTimeChecking/SmartTimeChecking_Feature_and_EdgeCase_Matrix.xlsx)
- **Tệp Excel trong thư mục tài liệu:** [docs/SmartTimeChecking_Feature_and_EdgeCase_Matrix.xlsx](file:///Users/sang/Projects/App/SmartTimeChecking/docs/SmartTimeChecking_Feature_and_EdgeCase_Matrix.xlsx)
