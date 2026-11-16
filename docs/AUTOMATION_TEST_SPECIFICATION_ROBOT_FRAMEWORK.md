# TÀI LIỆU ĐẶC TẢ KỊCH BẢN KIỂM THỬ TỰ ĐỘNG HOÁ (AUTOMATION TEST SPECIFICATION)
## HỆ THỐNG QUẢN TRỊ CHẤM CÔNG & QUẢN LÝ ĐƠN TỪ THÔNG MINH (SMART TIME CHECKING)
### FRAMEWORK: ROBOT FRAMEWORK (KEYWORD-DRIVEN + API REQUESTS + SELENIUM/BROWSER)

---

## 1. TỔNG QUAN CHIẾN LƯỢC KIỂM THỬ TỰ ĐỘNG (AUTOMATION STRATEGY)

### 1.1 Mục Tiêu & Phạm Vi
- **Tự động hoá 100%** các luồng nghiệp vụ cốt lõi từ API đến UI giả lập hành vi người dùng thực tế (End-to-End).
- Đảm bảo tính toán đúng đắn các quy tắc chính sách doanh nghiệp (Policy Rules, Device Binding 1-1, Dynamic QR HMAC 5s, GPS Haversine, Khóa sổ bất biến SHA-256, Hồi tố kỳ công).
- Cung cấp báo cáo kiểm thử trực quan dạng HTML (`report.html`, `log.html`) với chụp ảnh màn hình tự động khi có lỗi, phục vụ nghiệm thu dự án và tích hợp CI/CD Pipeline.

### 1.2 Kiến Trúc Tách Lớp Robot Framework
```
SmartTimeChecking-AutomationTest/
├── config/                     # Cấu hình môi trường (URLs, credentials, timeouts)
│   └── env_config.robot
├── resources/                  # Keyword-driven & Page Object layers
│   ├── keywords/
│   │   ├── api/               # API reusable keywords (RequestsLibrary)
│   │   │   ├── auth_api.resource
│   │   │   ├── kiosk_api.resource
│   │   │   ├── attendance_api.resource
│   │   │   ├── request_api.resource
│   │   │   ├── timesheet_api.resource
│   │   │   ├── admin_api.resource
│   │   │   └── notification_api.resource
│   │   └── ui/                # UI Page Objects & actions (SeleniumLibrary / Browser)
│   │       ├── common_ui.resource
│   │       ├── kiosk_ui.resource
│   │       ├── employee_ui.resource
│   │       ├── manager_ui.resource
│   │       └── guard_ui.resource
│   └── variables/
│       └── test_data.robot    # Dữ liệu kiểm thử chuẩn (tài khoản, tọa độ, tham số)
├── tests/
│   ├── 01_api/                # Bộ kiểm thử API RESTful
│   │   ├── test_01_auth.robot
│   │   ├── test_02_kiosk_qr.robot
│   │   ├── test_03_attendance.robot
│   │   ├── test_04_requests_quotas.robot
│   │   ├── test_05_timesheet_payroll.robot
│   │   ├── test_06_admin_master.robot
│   │   └── test_07_google_workspace.robot
│   ├── 02_ui/                 # Bộ kiểm thử giao diện & hành vi người dùng (UI E2E)
│   │   ├── test_ui_01_kiosk.robot
│   │   ├── test_ui_02_employee_portal.robot
│   │   ├── test_ui_03_manager_portal.robot
│   │   └── test_ui_04_access_guard.robot
│   └── 03_flow/               # Bộ kiểm thử vòng đời nghiệp vụ toàn trình (End-to-End Flow)
│       └── test_e2e_business_lifecycle.robot
├── reports/                   # Nơi xuất báo cáo log.html, report.html, screenshots
├── run_tests.sh               # Script chạy kiểm thử tự động, lọc tags, xuất báo cáo
└── requirements.txt           # Danh mục thư viện Python cần thiết
```

---

## 2. DANH MỤC TÀI KHOẢN & DỮ LIỆU KIỂM THỬ CHUẨN

| Vai trò | Email đăng nhập | Tên nhân viên | Quyền hạn (AppRole) | Mã NV |
| :--- | :--- | :--- | :--- | :--- |
| **Employee (Kỹ thuật)** | `dev@congty.com` | Lê Hoàng Nam | `EMPLOYEE` | `IT002` |
| **Manager (Tech Lead)** | `tuan.pham@smartcorp.com` | Phạm Minh Tuấn | `MANAGER` | `DEV001` |
| **Manager (Tech Director)** | `lead@congty.com` | Trần Văn Mạnh | `MANAGER` | `IT001` |
| **HR Admin (HR Manager)** | `hr@congty.com` | Nguyễn Thị Thu | `HR_ADMIN` | `HR001` |
| **HR Admin (C&B Specialist)**| `mai.hoang@smartcorp.com` | Hoàng Thị Mai | `HR_ADMIN` | `HR002` |
| **Executive (CEO)** | `ceo@smartcorp.com` | Trần Quốc Bảo | `HR_ADMIN` | `CEO001` |

---

## 3. CHI TIẾT KỊCH BẢN KIỂM THỬ API (RESTFUL API TEST CASES)

### SUITE 1: XÁC THỰC & ĐĂNG NHẬP (AUTH API)

#### `TC_API_AUTH_01`: Đăng nhập thành công với tài khoản nhân sự / quản lý
- **Pre-condition:** Hệ thống backend đang chạy tại `http://localhost:8085`.
- **Method & Endpoint:** `POST /api/v1/auth/login`
- **Request Body:**
  ```json
  { "email": "hr@congty.com" }
  ```
- **Các bước thực hiện:**
  1. Gửi request `POST` đến `/api/v1/auth/login` với body hợp lệ.
  2. Đọc response nhận về từ server.
- **Kết quả mong đợi:**
  - HTTP Status: `200 OK`.
  - Field `success` bằng `true`.
  - Field `data.token` tồn tại chuỗi JWT token không rỗng.
  - Field `data.role` bằng `"HR_ADMIN"`.
  - Field `data.employeeCode` bằng `"HR001"`.

#### `TC_API_AUTH_02`: Đăng nhập thành công với tài khoản nhân viên kỹ thuật
- **Method & Endpoint:** `POST /api/v1/auth/login`
- **Request Body:**
  ```json
  { "email": "dev@congty.com" }
  ```
- **Kết quả mong đợi:**
  - HTTP Status: `200 OK`.
  - Field `data.role` bằng `"EMPLOYEE"`.
  - Field `data.employeeCode` bằng `"IT002"`.

#### `TC_API_AUTH_03`: Đăng nhập thất bại khi email không tồn tại trong hệ thống
- **Method & Endpoint:** `POST /api/v1/auth/login`
- **Request Body:**
  ```json
  { "email": "notfound@congty.com" }
  ```
- **Kết quả mong đợi:**
  - HTTP Status: `404 NOT_FOUND` hoặc `400 BAD_REQUEST`.
  - Field `success` bằng `false`.
  - Field `message` chứa thông báo lỗi rõ ràng cho người dùng.

---

### SUITE 2: MÀN HÌNH KIOSK & DYNAMIC QR (KIOSK API)

#### `TC_API_KIOSK_01`: Lấy mã Dynamic QR hiện tại của Kiosk công ty
- **Method & Endpoint:** `GET /api/v1/kiosk/current-qr`
- **Headers:** Không yêu cầu token xác thực (Màn hình Kiosk sảnh công cộng).
- **Các bước thực hiện:**
  1. Gửi request `GET /api/v1/kiosk/current-qr`.
  2. Đọc payload mã QR và thời gian hiệu lực.
- **Kết quả mong đợi:**
  - HTTP Status: `200 OK`.
  - Field `data.qrPayload` chứa chuỗi dạng `KIOSK:V1:HQ_MAIN_01:<timestamp>:<nonce>:<signature>`.
  - Field `data.screenId` bằng `"HQ_MAIN_01"`.
  - Field `data.validitySeconds` bằng `5`.

#### `TC_API_KIOSK_02`: Kiểm tra cơ chế tự làm mới mã QR sau chu kỳ 5 giây
- **Pre-condition:** Gọi `GET /api/v1/kiosk/current-qr` lần 1 để lấy mã `QR_1`.
- **Các bước thực hiện:**
  1. Lưu chuỗi `QR_1`.
  2. Sleep 5.5 giây.
  3. Gọi lại `GET /api/v1/kiosk/current-qr` để lấy mã `QR_2`.
- **Kết quả mong đợi:**
  - `QR_2` khác biệt hoàn toàn so với `QR_1`.
  - Nonce và chữ ký HMAC trong `QR_2` đã được cập nhật mới.

---

### SUITE 3: CHẤM CÔNG, DEVICE BINDING & CHẤM CÔNG KHẨN CẤP (ATTENDANCE API)

#### `TC_API_ATT_01`: Đăng ký thiết bị cá nhân (Device Binding 1-1)
- **Pre-condition:** Đăng nhập bằng `dev@congty.com` lấy `DEV_TOKEN`.
- **Method & Endpoint:** `POST /api/v1/devices/enroll`
- **Headers:** `Authorization: Bearer <DEV_TOKEN>`
- **Request Body:**
  ```json
  {
    "deviceFingerprint": "robot-test-device-uuid-9999",
    "deviceName": "Robot iPhone 15 Pro Max",
    "os": "iOS 18.1"
  }
  ```
- **Kết quả mong đợi:**
  - HTTP Status: `200 OK`.
  - Field `data.status` bằng `"ACTIVE"`.
  - Field `data.deviceFingerprint` bằng `"robot-test-device-uuid-9999"`.

#### `TC_API_ATT_02`: Chấm công hợp lệ bằng quét Dynamic QR và thiết bị đã đăng ký
- **Pre-condition:**
  - Lấy mã QR mới nhất từ `GET /api/v1/kiosk/current-qr`.
  - Thiết bị đã đăng ký có fingerprint `"dev-uuid-002"`.
- **Method & Endpoint:** `POST /api/v1/attendance/punch`
- **Headers:** `Authorization: Bearer <DEV_TOKEN>`
- **Request Body:**
  ```json
  {
    "qrPayload": "<CURRENT_QR_PAYLOAD>",
    "deviceFingerprint": "dev-uuid-002",
    "punchType": "CHECK_IN"
  }
  ```
- **Kết quả mong đợi:**
  - HTTP Status: `200 OK`.
  - Field `success` bằng `true`.
  - Field `data.status` bằng `"VALID"`.
  - Field `data.punchType` bằng `"CHECK_IN"`.

#### `TC_API_ATT_03`: Chấm công thất bại khi dùng thiết bị lạ (Chặn gian lận điểm danh hộ)
- **Method & Endpoint:** `POST /api/v1/attendance/punch`
- **Headers:** `Authorization: Bearer <DEV_TOKEN>`
- **Request Body:**
  ```json
  {
    "qrPayload": "<CURRENT_QR_PAYLOAD>",
    "deviceFingerprint": "unregistered-hacker-phone-1234",
    "punchType": "CHECK_IN"
  }
  ```
- **Kết quả mong đợi:**
  - HTTP Status: `403 FORBIDDEN` hoặc `400 BAD_REQUEST`.
  - Field `success` bằng `false`.
  - Field `code` chứa mã cảnh báo thiết bị chưa đăng ký (`ERR_DEVICE_NOT_ENROLLED`).

#### `TC_API_ATT_04`: Chấm công thất bại với mã QR đã hết hạn (Anti-Replay / Expired QR)
- **Pre-condition:** Giả lập chuỗi QR có timestamp từ 10 phút trước.
- **Method & Endpoint:** `POST /api/v1/attendance/punch`
- **Request Body:**
  ```json
  {
    "qrPayload": "KIOSK:V1:HQ_MAIN_01:1600000000000:expired_nonce:fake_sig",
    "deviceFingerprint": "dev-uuid-002",
    "punchType": "CHECK_IN"
  }
  ```
- **Kết quả mong đợi:**
  - HTTP Status: `400 BAD_REQUEST`.
  - Field `message` hoặc `code` thông báo mã QR đã hết hiệu lực (`ERR_QR_EXPIRED`).

#### `TC_API_ATT_05`: Gửi yêu cầu chấm công khẩn cấp (Emergency Selfie GPS)
- **Pre-condition:** Nhân viên hỏng điện thoại / quên máy, chụp ảnh selfie tại văn phòng.
- **Method & Endpoint:** `POST /api/v1/attendance/punch-emergency`
- **Headers:** `Authorization: Bearer <DEV_TOKEN>`
- **Request Body:**
  ```json
  {
    "punchType": "CHECK_IN",
    "reason": "Điện thoại hết pin, chấm công khẩn cấp bằng thiết bị máy bàn dự phòng",
    "selfieImageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "latitude": 10.7769,
    "longitude": 106.7009
  }
  ```
- **Kết quả mong đợi:**
  - HTTP Status: `200 OK`.
  - Field `data.status` bằng `"PENDING_APPROVAL"`.
  - Field `data.verificationMethod` bằng `"EMERGENCY_SELFIE"`.

#### `TC_API_ATT_06`: Kiểm tra danh sách chấm công trong ngày của nhân viên
- **Method & Endpoint:** `GET /api/v1/attendance/today`
- **Headers:** `Authorization: Bearer <DEV_TOKEN>`
- **Kết quả mong đợi:**
  - HTTP Status: `200 OK`.
  - Mảng `data` chứa các bản ghi chấm công có trạng thái `"VALID"` hoặc `"PENDING_APPROVAL"`.

---

### SUITE 4: ĐƠN TỪ & HẠN NGẠCH (REQUESTS & QUOTAS API)

#### `TC_API_REQ_01`: Tra cứu hạn ngạch đơn từ còn lại (Quotas)
- **Method & Endpoint:** `GET /api/v1/requests/quotas/remaining`
- **Headers:** `Authorization: Bearer <DEV_TOKEN>`
- **Kết quả mong đợi:**
  - HTTP Status: `200 OK`.
  - Các trường: `lateEarlyRemaining >= 0`, `missedPunchRemaining >= 0`, `annualLeaveRemaining >= 0`, `wfhRemainingMonth >= 0`.

#### `TC_API_REQ_02`: Tạo đơn xin phép Làm việc từ xa (WFH)
- **Method & Endpoint:** `POST /api/v1/requests`
- **Headers:** `Authorization: Bearer <DEV_TOKEN>`
- **Request Body:**
  ```json
  {
    "requestType": "WFH",
    "startDate": "2026-11-20",
    "endDate": "2026-11-20",
    "durationDays": 1.0,
    "reason": "Robot Test: Hỗ trợ triển khai hệ thống từ xa cùng đối tác"
  }
  ```
- **Kết quả mong đợi:**
  - HTTP Status: `200 OK`.
  - Field `data.status` bằng `"PENDING"`.
  - Field `data.requestType` bằng `"WFH"`.
  - Lưu lại `REQUEST_ID` để dùng cho kịch bản phê duyệt.

#### `TC_API_REQ_03`: Tạo đơn xin Nghỉ phép năm (Annual Leave)
- **Method & Endpoint:** `POST /api/v1/requests`
- **Headers:** `Authorization: Bearer <DEV_TOKEN>`
- **Request Body:**
  ```json
  {
    "requestType": "LEAVE",
    "startDate": "2026-11-25",
    "endDate": "2026-11-25",
    "durationDays": 1.0,
    "reason": "Robot Test: Giải quyết việc gia đình"
  }
  ```
- **Kết quả mong đợi:**
  - HTTP Status: `200 OK`.
  - Field `data.status` bằng `"PENDING"`.

#### `TC_API_REQ_04`: Lấy danh sách đơn cá nhân đã gửi
- **Method & Endpoint:** `GET /api/v1/requests/my-requests`
- **Headers:** `Authorization: Bearer <DEV_TOKEN>`
- **Kết quả mong đợi:**
  - HTTP Status: `200 OK`.
  - Mảng `data` chứa các đơn vừa tạo ở trên.

---

### SUITE 5: PHÊ DUYỆT ĐƠN TỪ & KHẨN CẤP (REVIEW & APPROVAL API)

#### `TC_API_APPR_01`: Quản lý lấy danh sách đơn chờ duyệt
- **Pre-condition:** Đăng nhập bằng `lead@congty.com` hoặc `hr@congty.com` lấy `LEAD_TOKEN`.
- **Method & Endpoint:** `GET /api/v1/requests/pending`
- **Headers:** `Authorization: Bearer <LEAD_TOKEN>`
- **Kết quả mong đợi:**
  - HTTP Status: `200 OK`.
  - Danh sách chứa đơn `REQUEST_ID` của `dev@congty.com`.

#### `TC_API_APPR_02`: Quản lý thực hiện Phê duyệt đơn WFH (1-Click Approve)
- **Method & Endpoint:** `POST /api/v1/requests/{REQUEST_ID}/review`
- **Headers:** `Authorization: Bearer <LEAD_TOKEN>`
- **Request Body:**
  ```json
  {
    "action": "APPROVE",
    "comment": "Robot Test: Đồng ý duyệt WFH ngày 20/11"
  }
  ```
- **Kết quả mong đợi:**
  - HTTP Status: `200 OK`.
  - Field `data.status` chuyển thành `"APPROVED"`.

#### `TC_API_APPR_03`: HR lấy danh sách chấm công khẩn cấp chờ duyệt
- **Method & Endpoint:** `GET /api/v1/admin/attendance/emergency-pending`
- **Headers:** `Authorization: Bearer <HR_TOKEN>`
- **Kết quả mong đợi:**
  - HTTP Status: `200 OK`.
  - Danh sách trả về chứa bản ghi chụp ảnh Selfie GPS của nhân viên.

#### `TC_API_APPR_04`: HR duyệt bản ghi chấm công khẩn cấp
- **Method & Endpoint:** `POST /api/v1/admin/attendance/emergency/{PUNCH_ID}/review`
- **Headers:** `Authorization: Bearer <HR_TOKEN>`
- **Request Body:**
  ```json
  {
    "action": "APPROVE",
    "comment": "Robot Test: Đã xác minh khuôn mặt hợp lệ qua camera sảnh"
  }
  ```
- **Kết quả mong đợi:**
  - HTTP Status: `200 OK`.
  - Field `data.status` chuyển thành `"VALID"`.

---

### SUITE 6: BẢNG CÔNG, KHIẾU NẠI & KHÓA SỔ HỒI TỐ (TIMESHEET & PAYROLL API)

#### `TC_API_TS_01`: Lấy danh sách các kỳ tính công
- **Method & Endpoint:** `GET /api/v1/timesheets/periods`
- **Headers:** `Authorization: Bearer <HR_TOKEN>`
- **Kết quả mong đợi:**
  - HTTP Status: `200 OK`.
  - Có các kỳ công như `2026-10` (LOCKED), `2026-11` (OPEN).

#### `TC_API_TS_02`: Nhân viên gửi khiếu nại công trong thời hạn 48 giờ
- **Method & Endpoint:** `POST /api/v1/timesheets/disputes?periodId=period-2026-11&disputedDate=2026-11-13&reason=Quen-cham-cong-buoi-chieu`
- **Headers:** `Authorization: Bearer <DEV_TOKEN>`
- **Kết quả mong đợi:**
  - HTTP Status: `200 OK`.
  - Field `data.status` bằng `"PENDING"`.
  - Field `data.reason` lưu đúng nội dung khiếu nại.
  - Lưu `DISPUTE_ID`.

#### `TC_API_TS_03`: Chặn gửi khiếu nại khi kỳ công đã quá hạn 48 giờ quy định
- **Method & Endpoint:** `POST /api/v1/timesheets/disputes?periodId=period-2026-10&disputedDate=2026-10-15&reason=Khieu-nai-qua-han`
- **Headers:** `Authorization: Bearer <DEV_TOKEN>`
- **Kết quả mong đợi:**
  - HTTP Status: `400 BAD_REQUEST`.
  - Field `code` bằng `"ERR_DISPUTE_EXPIRED"`.
  - Field `message` thông báo đã hết thời hạn khiếu nại 48 giờ.

#### `TC_API_TS_04`: HR xem ma trận bảng công tổng hợp toàn công ty
- **Method & Endpoint:** `GET /api/v1/timesheets/admin/periods/period-2026-11/matrix`
- **Headers:** `Authorization: Bearer <HR_TOKEN>`
- **Kết quả mong đợi:**
  - HTTP Status: `200 OK`.
  - Mảng `data` chứa bảng công chi tiết từng nhân viên (công chuẩn, đi làm thực tế, số ngày WFH, số phút trễ).

#### `TC_API_TS_05`: HR duyệt khiếu nại và tự động ghi nhận công hồi tố
- **Method & Endpoint:** `POST /api/v1/timesheets/admin/disputes/{DISPUTE_ID}/resolve?action=APPROVE&notes=Cong-bu-1-cong-hop-le`
- **Headers:** `Authorization: Bearer <HR_TOKEN>`
- **Kết quả mong đợi:**
  - HTTP Status: `200 OK`.
  - Field `data.status` bằng `"RESOLVED"`.

#### `TC_API_TS_06`: HR xuất file Excel/CSV bảng công có UTF-8 BOM
- **Method & Endpoint:** `GET /api/v1/timesheets/admin/periods/period-2026-11/export-csv`
- **Headers:** `Authorization: Bearer <HR_TOKEN>`
- **Kết quả mong đợi:**
  - HTTP Status: `200 OK`.
  - Content-Type: `text/csv; charset=UTF-8`.
  - 3 bytes đầu tiên là UTF-8 BOM: `\xEF\xBB\xBF`.
  - Nội dung chứa header tiếng Việt: `STT,Mã Nhân Viên,Họ Và Tên,Công Chuẩn,Đi Làm Thực Tế...`.

---

### SUITE 7: QUẢN TRỊ DỮ LIỆU DANH MỤC & THIẾT BỊ (ADMIN MASTER DATA API)

#### `TC_API_ADM_01`: Lấy danh sách nhân viên toàn công ty
- **Method & Endpoint:** `GET /api/v1/admin/employees`
- **Headers:** `Authorization: Bearer <HR_TOKEN>`
- **Kết quả mong đợi:** HTTP Status `200 OK`, danh sách >= 14 nhân sự.

#### `TC_API_ADM_02`: Lấy danh sách phòng ban
- **Method & Endpoint:** `GET /api/v1/departments`
- **Headers:** `Authorization: Bearer <HR_TOKEN>`
- **Kết quả mong đợi:** HTTP Status `200 OK`, danh sách >= 7 phòng ban.

#### `TC_API_ADM_03`: Lấy danh sách thiết bị và thu hồi thiết bị nghi vấn
- **Method & Endpoint:** `GET /api/v1/devices/admin/all`
- **Action tiếp theo:** `POST /api/v1/devices/admin/{DEVICE_ID}/revoke`
- **Headers:** `Authorization: Bearer <HR_TOKEN>`
- **Kết quả mong đợi:**
  - HTTP Status: `200 OK`.
  - Field `data.status` chuyển thành `"REVOKED"`.

#### `TC_API_ADM_04`: Lấy cấu hình ca làm việc, quy định và ngày lễ
- **Method & Endpoint:**
  - `GET /api/v1/admin/settings/shifts`
  - `GET /api/v1/admin/settings/policies`
  - `GET /api/v1/admin/settings/holidays`
- **Kết quả mong đợi:** HTTP Status `200 OK` cho cả 3 endpoints.

---

### SUITE 8: THÔNG BÁO & GOOGLE WORKSPACE (NOTIFICATION API)

#### `TC_API_NOTIF_01`: Tra cứu cấu hình Google Workspace / Chat Webhook
- **Method & Endpoint:** `GET /api/v1/admin/notifications/config`
- **Headers:** `Authorization: Bearer <HR_TOKEN>`
- **Kết quả mong đợi:**
  - HTTP Status `200 OK`.
  - Field `googleChatWebhookUrl` tồn tại.

#### `TC_API_NOTIF_02`: Bắn thử nghiệm Google Chat Interactive Card v2
- **Method & Endpoint:** `POST /api/v1/admin/notifications/test-chat`
- **Headers:** `Authorization: Bearer <HR_TOKEN>`
- **Kết quả mong đợi:**
  - HTTP Status `200 OK`.
  - Field `data.channel` bằng `"GOOGLE_CHAT"`.
  - Field `data.status` bằng `"SUCCESS"`.

#### `TC_API_NOTIF_03`: Kích hoạt phát bản tin điểm danh sáng 09:00
- **Method & Endpoint:** `POST /api/v1/admin/notifications/daily-bulletin`
- **Headers:** `Authorization: Bearer <HR_TOKEN>`
- **Kết quả mong đợi:**
  - HTTP Status `200 OK`.
  - Field `data.content` chứa các thông số: Số người có mặt, số người WFH, số người đi trễ.

---

## 4. CHI TIẾT KỊCH BẢN KIỂM THỬ GIAO DIỆN & HÀNH VI (UI E2E TEST CASES)

### SUITE UI 1: MÀN HÌNH KIOSK SẢNH CHẤM CÔNG

#### `TC_UI_KIOSK_01`: Màn hình Kiosk hiển thị Dynamic QR và đếm ngược 5s
- **Pre-condition:** Mở trình duyệt đến `http://localhost:3000`.
- **Các bước thực hiện:**
  1. Click vào tab **"Màn hình Kiosk"** trên thanh Navbar.
  2. Chờ 1 giây để phần tử mã QR xuất hiện.
  3. Kiểm tra xem có phần tử canvas hoặc SVG hiển thị mã QR.
  4. Đọc thanh tiến trình đếm ngược hoặc chữ "Tự động đổi sau 5s".
- **Kết quả mong đợi:**
  - Mã QR hiển thị rõ ràng, kích thước tối ưu toàn màn hình.
  - Sau 5 giây, mã QR tự động đổi hình ảnh mới không cần F5 trình duyệt.

---

### SUITE UI 2: CỔNG NHÂN VIÊN (EMPLOYEE PORTAL E2E)

#### `TC_UI_EMP_01`: Nhân viên thực hiện Check-in bằng Dynamic QR
- **Pre-condition:** Đang đăng nhập tài khoản `dev@congty.com`.
- **Các bước thực hiện:**
  1. Click tab **"Cổng Nhân Viên"**.
  2. Mặc định vào tab con **"Chấm công QR & Khẩn cấp"**.
  3. Bấm nút **"Mô phỏng Quét mã Kiosk (Check-in)"**.
  4. Hệ thống hiển thị Modal xác nhận quét thành công.
- **Kết quả mong đợi:**
  - Thông báo Toast hiển thị: *"Điểm danh CHECK_IN thành công"*.
  - Thẻ trạng thái hôm nay cập nhật giờ Check-in hiện tại với huy hiệu xanh lá `"ĐÃ CHECK-IN"`.

#### `TC_UI_EMP_02`: Nhân viên tạo đơn Nghỉ phép và kiểm tra giảm hạn ngạch
- **Các bước thực hiện:**
  1. Trong Cổng Nhân Viên, chuyển sang tab con **"Đơn từ & Hạn ngạch"**.
  2. Xem thanh tiến trình Hạn ngạch phép năm ban đầu (ví dụ: Còn 12 ngày).
  3. Chọn loại đơn: **"Nghỉ phép năm (Paid Leave)"**.
  4. Nhập ngày bắt đầu: `2026-11-28`, ngày kết thúc: `2026-11-28`.
  5. Nhập lý do: *"Robot UI Test: Nghỉ phép cá nhân"*.
  6. Bấm nút **"Gửi Đơn Phê Duyệt"**.
- **Kết quả mong đợi:**
  - Thông báo thành công: *"Tạo đơn thành công"*.
  - Bảng "Lịch sử đơn từ của bạn" hiển thị dòng đơn mới với trạng thái màu vàng `"CHỜ DUYỆT"`.

#### `TC_UI_EMP_03`: Nhân viên xem Bảng công tháng và gửi Khiếu nại sai lệch
- **Các bước thực hiện:**
  1. Chuyển sang tab con **"Bảng công & Khiếu nại"**.
  2. Chọn kỳ công: `"Tháng 11/2026"`.
  3. Bảng công chi tiết hiển thị tổng công chuẩn và công thực tế.
  4. Bấm nút **"Gửi Khiếu Nại Công"**.
  5. Chọn ngày có vấn đề: `2026-11-13`.
  6. Nhập lý do: *"Robot UI Test: Máy quét chưa nhận diện giờ về"*.
  7. Bấm **"Gửi Khiếu Nại"**.
- **Kết quả mong đợi:**
  - Modal đóng lại, xuất hiện thông báo: *"Gửi khiếu nại công thành công (Hệ thống sẽ phản hồi trong 24h)"*.
  - Dòng khiếu nại mới xuất hiện trong bảng danh sách khiếu nại cá nhân.

---

### SUITE UI 3: CỔNG QUẢN LÝ / HR (MANAGER PORTAL E2E)

#### `TC_UI_MGR_01`: Quản lý xem Dashboard điểm danh thời gian thực (Live Dashboard)
- **Pre-condition:** Đổi tài khoản sang `hr@congty.com` (Nguyễn Thị Thu) trên Navbar.
- **Các bước thực hiện:**
  1. Click tab **"Quản lý / HR"**.
  2. Mặc định mở tab **"Dashboard Hôm Nay"**.
- **Kết quả mong đợi:**
  - 4 thẻ thống kê hiển thị số liệu thực tế:
    - *Tổng nhân sự*, *Có mặt tại VP*, *Làm việc từ xa (WFH)*, *Đi trễ*.
  - Bảng danh sách nhân viên hiển thị trạng thái từng người cùng giờ Check-in/Check-out chính xác.

#### `TC_UI_MGR_02`: Quản lý thực hiện Duyệt đơn từ 1-Click
- **Các bước thực hiện:**
  1. Chuyển sang tab **"Duyệt Đơn Từ"**.
  2. Tìm đơn của nhân viên `Lê Hoàng Nam`.
  3. Nhập ghi chú duyệt: *"Robot UI Approval: Đồng ý"*.
  4. Bấm nút màu xanh **"Phê Duyệt"**.
- **Kết quả mong đợi:**
  - Đơn được chuyển trạng thái sang `"ĐÃ DUYỆT"` và biến mất khỏi danh sách chờ xử lý.

#### `TC_UI_MGR_03`: HR xem Bảng công tổng hợp, Xuất file CSV và Khóa sổ
- **Các bước thực hiện:**
  1. Chuyển sang tab **"Bảng Công & Khóa Sổ"**.
  2. Chọn kỳ công: `"Kỳ công 2026-11"`.
  3. Bấm nút **"Tổng hợp lại công"** -> Đợi dữ liệu cập nhật.
  4. Bấm nút **"Xuất Excel (CSV)"** -> Trình duyệt kích hoạt tải file `Bang_Cham_Cong_2026-11.csv`.
- **Kết quả mong đợi:**
  - Ma trận hiển thị đầy đủ các cột công chuẩn, thực tế, WFH, phép, trễ, hồi tố.
  - File tải về có mã hóa tiếng Việt UTF-8 chuẩn xác.

#### `TC_UI_MGR_04`: Thử nghiệm tương tác Google Chat Card v2 trên UI
- **Các bước thực hiện:**
  1. Chuyển sang tab **"Tích Hợp Google Chat"**.
  2. Bấm nút **"Gửi Thẻ Card v2 Thử Nghiệm"**.
  3. Bấm nút **"Phát Bản Tin Sáng 09:00"**.
- **Kết quả mong đợi:**
  - Thẻ mô phỏng giao diện Google Chat Card v2 xuất hiện trực quan trên màn hình.
  - Nhật ký Sync Log ghi nhận trạng thái `"SUCCESS"`.

---

### SUITE UI 4: BẢO VỆ PHÂN QUYỀN (ACCESS GUARD & ROLE SWITCHER)

#### `TC_UI_SEC_01`: Nhân viên bấm vào tab Quản lý và nhận màn hình Access Guard
- **Pre-condition:** Đang ở tài khoản `dev@congty.com` (Software Engineer).
- **Các bước thực hiện:**
  1. Bấm vào tab **"Quản lý / HR"** trên Navbar.
- **Kết quả mong đợi:**
  - Màn hình không bị crash hay trắng trang.
  - Xuất hiện Card bảo vệ: **"Yêu cầu quyền Quản lý hoặc HR Admin"**.
  - Hiển thị 2 nút bấm chuyển nhanh:
    - *"Chuyển sang Trưởng nhóm kỹ thuật (lead@congty.com)"*
    - *"Chuyển sang HR Admin (hr@congty.com)"*
  2. Bấm vào nút *"Chuyển sang HR Admin"*.
  - Giao diện ngay lập tức mở toàn bộ các tính năng Quản lý mà không cần gõ mật khẩu.

---

## 5. KỊCH BẢN KIỂM THỬ VÒNG ĐỜI NGHIỆP VỤ TOÀN TRÌNH (END-TO-END BUSINESS LIFECYCLE)

### `TC_E2E_01`: Vòng đời trọn vẹn của một kỳ chấm công và vận hành
Kịch bản này mô phỏng chân thực chu trình làm việc 1 ngày của công ty:
1. **Bước 1 (Đăng ký thiết bị):** Nhân viên kỹ thuật đăng ký thiết bị mới vào hệ thống qua API.
2. **Bước 2 (Chấm công sáng):** Nhân viên đến văn phòng, quét mã Dynamic QR tại Kiosk -> Kiểm tra trạng thái chuyển thành Có Mặt (`PRESENT`).
3. **Bước 3 (Gửi đơn WFH chiều):** Do có lịch họp khách hàng ngoại tỉnh, nhân viên làm đơn WFH buổi chiều -> Gửi duyệt.
4. **Bước 4 (Sếp duyệt đơn):** Tech Lead đăng nhập vào Cổng Quản lý, kiểm tra lý do và bấm Duyệt đơn 1-click.
5. **Bước 5 (Chấm công khẩn cấp chiều):** Khi ra ngoài điện thoại hết pin, nhân viên mượn máy tính bàn gửi chấm công khẩn cấp kèm ảnh selfie và tọa độ GPS văn phòng.
6. **Bước 6 (HR duyệt khẩn cấp):** HR Admin xem ảnh và tọa độ trên bản đồ, bấm duyệt bản ghi chấm công khẩn cấp.
7. **Bước 7 (HR chốt công & Nhân viên khiếu nại):** HR thực hiện tính toán ma trận công -> Nhân viên thấy thiếu 0.5 công do sự cố mạng, gửi khiếu nại đính kèm chứng từ trong hạn 48h.
8. **Bước 8 (Duyệt khiếu nại & Hồi tố):** HR chấp thuận khiếu nại, hệ thống ghi nhận hồi tố +0.5 công bù vào kỳ lương kế tiếp.
9. **Bước 9 (Khóa sổ bất biến & Xuất CSV):** HR thực hiện khóa sổ kỳ công (Ghi nhận mã băm bảo mật) và xuất file CSV gửi kế toán.
10. **Bước 10 (Google Workspace Notify):** Hệ thống tự động bắn thẻ Google Chat Card v2 thông báo toàn thể nhân viên kỳ công đã được khóa sổ thành công.

---

## 6. MA TRẬN ĐỘ PHỦ 64 KỊCH BẢN KIỂM THỬ DOANH NGHIỆP (ENTERPRISE AUTOMATION TRACEABILITY MATRIX)

### 6.1 Tổng Hợp Kết Quả Thực Thi (Execution Summary)
- **Tổng số test cases:** 64
- **Đạt chuẩn (Passed):** 64 (100%)
- **Thất bại (Failed):** 0 (0%)
- **Tốc độ thực thi trung bình:** ~50s cho toàn bộ 64 testcases (bao gồm Playwright UI Headless và 5.5s Dynamic QR rotation cycles)
- **Báo cáo trực quan:** [report.html](file:///Users/sang/Projects/App/SmartTimeChecking/SmartTimeChecking-AutomationTest/reports/report.html), [log.html](file:///Users/sang/Projects/App/SmartTimeChecking/SmartTimeChecking-AutomationTest/reports/log.html)

### 6.2 Chi Tiết Ma Trận Kiểm Thử Theo Phân Hệ

| Mã Kịch Bản | Tên Kịch Bản Kiểm Thử | Phân Loại | Mức Độ | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: |
| **01. API - Xác Thực & Phân Quyền (Auth & RBAC)** | | | | |
| `TC_API_AUTH_01` | Đăng nhập thành công với tài khoản HR Admin | API | P0 | **PASS** |
| `TC_API_AUTH_02` | Đăng nhập thành công với tài khoản Nhân viên Kỹ thuật | API | P0 | **PASS** |
| `TC_API_AUTH_03` | Đăng nhập thành công với tài khoản Trưởng nhóm (Manager) | API | P0 | **PASS** |
| `TC_API_AUTH_04` | Đăng nhập thất bại khi email không tồn tại trong hệ thống | API | P1 | **PASS** |
| `TC_API_AUTH_05` | Chặn truy cập khi Token bị giả mạo hoặc hết hạn (Tampered JWT) | API | P0 | **PASS** |
| `TC_API_AUTH_06` | Nhân viên thường không có quyền truy cập API quản trị nhân sự (403 Forbidden) | API | P0 | **PASS** |
| **02. API - Kiosk Dynamic QR & Chữ Ký Số HMAC** | | | | |
| `TC_API_KIOSK_01`| Lấy mã Dynamic QR hiện tại của Kiosk màn hình sảnh | API | P0 | **PASS** |
| `TC_API_KIOSK_02`| Tự động đổi mã QR sau chu kỳ 5 giây | API | P0 | **PASS** |
| `TC_API_KIOSK_03`| Chống tấn công Replay - Không thể quét lại mã QR đã sử dụng (Redis Atomic) | API | P0 | **PASS** |
| `TC_API_KIOSK_04`| Chặn mã QR bị sửa đổi chữ ký số HMAC | API | P0 | **PASS** |
| **03. API - Chấm Công & Device Binding 1-1 & GPS Geofencing** | | | | |
| `TC_API_ATT_01`  | Đăng ký thiết bị cá nhân (1-1 Device Binding) | API | P0 | **PASS** |
| `TC_API_ATT_02`  | Chấm công Vào ca (Check-in) hợp lệ bằng Dynamic QR | API | P0 | **PASS** |
| `TC_API_ATT_03`  | Chấm công Ra ca (Check-out) hợp lệ bằng Dynamic QR | API | P0 | **PASS** |
| `TC_API_ATT_04`  | Chặn chấm công khi dùng thiết bị lạ (Chống gian lận điểm danh hộ) | API | P0 | **PASS** |
| `TC_API_ATT_05`  | Chặn chấm công khi mã QR đã hết hạn (> 5s) | API | P0 | **PASS** |
| `TC_API_ATT_06`  | Chấm công khẩn cấp (Emergency Selfie + GPS) khi mất điện/hết pin | API | P0 | **PASS** |
| `TC_API_ATT_07`  | Chấm công khẩn cấp vi phạm Geofencing (> 100m) gắn cờ `FLAG_LOCATION_MISMATCH` | API | P0 | **PASS** |
| `TC_API_ATT_08`  | Tra cứu lịch sử chấm công trong ngày của nhân viên | API | P1 | **PASS** |
| **04. API - Quản Lý Đơn Từ & Quy Chế Hạn Ngạch (Requests & Quotas)** | | | | |
| `TC_API_REQ_01`  | Kiểm tra hạn ngạch đơn từ còn lại của nhân viên | API | P0 | **PASS** |
| `TC_API_REQ_02`  | Tạo đơn xin phép Nghỉ phép năm (Annual Leave) | API | P0 | **PASS** |
| `TC_API_REQ_03`  | Quản lý xem danh sách đơn chờ duyệt | API | P0 | **PASS** |
| `TC_API_REQ_04`  | Quản lý phê duyệt đơn nghỉ phép (1-Click Approve) | API | P0 | **PASS** |
| `TC_API_REQ_05`  | Quản lý từ chối đơn có lý do giải thích rõ ràng (Reject with reason) | API | P0 | **PASS** |
| `TC_API_REQ_06`  | Nhân viên chủ động Hủy đơn khi đang chờ duyệt (Cancel Request) | API | P1 | **PASS** |
| `TC_API_REQ_07`  | Chặn đơn Đi muộn (LATE_IN) vượt quá 60 phút theo quy chế | API | P1 | **PASS** |
| `TC_API_REQ_08`  | Chặn đơn Nghỉ ốm (SICK_LEAVE) khi thiếu giấy C65-HD (Attachment Required) | API | P1 | **PASS** |
| `TC_API_REQ_09`  | Nộp đơn Nghỉ ốm thành công khi đính kèm đầy đủ giấy chứng nhận C65 | API | P0 | **PASS** |
| `TC_API_REQ_10`  | Tra cứu danh sách đơn cá nhân đã gửi | API | P1 | **PASS** |
| **05. API - Bảng Công, Khiếu Nại & Khóa Sổ Bất Biến (Timesheet & Payroll)** | | | | |
| `TC_API_TS_01`   | Lấy danh sách kỳ tính công doanh nghiệp | API | P0 | **PASS** |
| `TC_API_TS_02`   | Nhân viên gửi khiếu nại công trong thời hạn 48 giờ sau khóa sổ | API | P0 | **PASS** |
| `TC_API_TS_03`   | Chặn gửi khiếu nại công khi kỳ công đã quá hạn 48 giờ (`ERR_DISPUTE_EXPIRED`) | API | P1 | **PASS** |
| `TC_API_TS_04`   | HR xem ma trận bảng công tổng hợp của kỳ | API | P0 | **PASS** |
| `TC_API_TS_05`   | HR giải quyết khiếu nại (Chấp thuận bù công hồi tố) | API | P0 | **PASS** |
| `TC_API_TS_06`   | Xuất file CSV bảng công kỳ có mã hóa UTF-8 BOM chuẩn Excel | API | P0 | **PASS** |
| `TC_API_TS_07`   | Khóa sổ kỳ công bất biến và ngăn chặn tổng hợp lại | API | P0 | **PASS** |
| **06. API - Quản Trị Hệ Thống & Cấu Hình Master (Admin & Settings)** | | | | |
| `TC_API_ADM_01`  | Lấy danh sách nhân viên toàn công ty | API | P1 | **PASS** |
| `TC_API_ADM_02`  | Tiếp nhận nhân sự mới (Onboarding Employee với 12 ngày phép) | API | P0 | **PASS** |
| `TC_API_ADM_03`  | Cập nhật thông tin nhân viên | API | P1 | **PASS** |
| `TC_API_ADM_04`  | Lấy danh sách phòng ban trong công ty | API | P1 | **PASS** |
| `TC_API_ADM_05`  | Thêm mới phòng ban tổ chức | API | P1 | **PASS** |
| `TC_API_ADM_06`  | Quản trị thiết bị chấm công & Thu hồi thiết bị nghi vấn (Revoke Device) | API | P1 | **PASS** |
| `TC_API_ADM_07`  | Lấy danh sách ca làm việc, quy định hạn ngạch và ngày lễ | API | P1 | **PASS** |
| `TC_API_ADM_08`  | Thêm ngày nghỉ lễ vào lịch doanh nghiệp (Holiday Calendar) | API | P1 | **PASS** |
| **07. API - Tích Hợp Google Workspace Phase 2 (Email & Chat Notification)** | | | | |
| `TC_API_NOTIF_01`| Lấy thông tin cấu hình Google Workspace hiện tại | API | P1 | **PASS** |
| `TC_API_NOTIF_02`| Cập nhật URL Webhook Google Chat | API | P1 | **PASS** |
| `TC_API_NOTIF_03`| Gửi thẻ thử nghiệm Google Chat Card v2 | API | P1 | **PASS** |
| `TC_API_NOTIF_04`| Kích hoạt phát bản tin điểm danh sáng 09:00 | API | P1 | **PASS** |
| `TC_API_NOTIF_05`| Gửi email thử nghiệm qua Google Workspace / SMTP | API | P1 | **PASS** |
| `TC_API_NOTIF_06`| Lấy danh sách thẻ Google Chat tương tác gần đây | API | P1 | **PASS** |
| `TC_API_NOTIF_07`| Tra cứu nhật ký thông báo đa kênh (Notification Audit Logs) | API | P1 | **PASS** |
| **08. UI E2E - Giao Diện & Hành Vi Người Dùng Đa Vai Trò (UI Automation - 42 Tests)** | | | | |
| `TC_UI_KIOSK_01` | Màn hình Kiosk hiển thị mã Dynamic QR và văn phòng sảnh | UI | P0 | **PASS** |
| `TC_UI_KIOSK_02` | Màn hình Kiosk đếm ngược chu kỳ 5 giây và đổi mã tự động | UI | P0 | **PASS** |
| `TC_UI_AUTH_01`  | Landing page hiển thị đầy đủ thông tin hệ thống và thống kê | UI | P0 | **PASS** |
| `TC_UI_AUTH_02`  | Chuyển đổi vai trò sang Nhân viên Kỹ thuật (Lê Hoàng Nam) | UI | P0 | **PASS** |
| `TC_UI_AUTH_03`  | Chuyển đổi vai trò sang Quản lý / Tech Lead (Trần Văn Mạnh) | UI | P0 | **PASS** |
| `TC_UI_AUTH_04`  | Chuyển đổi vai trò sang HR Admin (Nguyễn Thị Thu) | UI | P0 | **PASS** |
| `TC_UI_AUTH_05`  | Access Guard bảo vệ màn hình Quản lý khi người dùng là Nhân viên | UI | P0 | **PASS** |
| `TC_UI_EMP_ATT_01` | Hiển thị trạng thái liên kết thiết bị cá nhân (1-1 Binding Card) | UI | P0 | **PASS** |
| `TC_UI_EMP_ATT_02` | Nhân viên thực hiện Check-in Vào ca hợp lệ bằng Dynamic QR | UI | P0 | **PASS** |
| `TC_UI_EMP_ATT_03` | Nhân viên thực hiện Check-out Ra ca hợp lệ bằng Dynamic QR | UI | P0 | **PASS** |
| `TC_UI_EMP_ATT_04` | Kiểm tra bảng Lịch sử chấm công trong ngày của nhân viên | UI | P1 | **PASS** |
| `TC_UI_EMP_ATT_05` | Xử lý ngoại lệ khi mã QR bị hết hạn (ERR_QR_EXPIRED) | UI | P1 | **PASS** |
| `TC_UI_EMP_ATT_06` | Xử lý ngoại lệ khi chữ ký số Dynamic QR không hợp lệ | UI | P1 | **PASS** |
| `TC_UI_EMP_EMG_01` | Mở tab Chấm công Khẩn cấp và hiển thị hướng dẫn chụp selfie & GPS | UI | P1 | **PASS** |
| `TC_UI_EMP_EMG_02` | Gửi yêu cầu Chấm công Khẩn cấp kèm toạ độ và chờ phê duyệt | UI | P0 | **PASS** |
| `TC_UI_EMP_REQ_01` | Hiển thị 4 thẻ chỉ số hạn ngạch ngày phép và đơn từ | UI | P0 | **PASS** |
| `TC_UI_EMP_REQ_02` | Nhân viên nộp đơn xin Nghỉ Phép Năm (Annual Leave) | UI | P0 | **PASS** |
| `TC_UI_EMP_REQ_03` | Nhân viên nộp đơn xin Làm Việc Từ Xa (WFH) | UI | P0 | **PASS** |
| `TC_UI_EMP_REQ_04` | Nhân viên nộp đơn xin Đi Muộn hợp lệ (30 phút) | UI | P0 | **PASS** |
| `TC_UI_EMP_REQ_05` | Nhân viên nộp đơn xin Nghỉ Ốm kèm chứng từ y tế C65-HD | UI | P0 | **PASS** |
| `TC_UI_EMP_REQ_06` | Kiểm tra bảng Danh sách đơn từ cá nhân đã gửi | UI | P1 | **PASS** |
| `TC_UI_EMP_TS_01`  | Nhân viên xem tổng quan bảng công và các thẻ chỉ số KPI | UI | P1 | **PASS** |
| `TC_UI_EMP_TS_02`  | Nhân viên mở form Khiếu nại công trong thời hạn 48h | UI | P0 | **PASS** |
| `TC_UI_EMP_TS_03`  | Kiểm tra bảng Lịch sử khiếu nại công của nhân viên | UI | P1 | **PASS** |
| `TC_UI_MGR_DASH_01`| Quản lý xem Dashboard hiện diện nhân sự thời gian thực | UI | P0 | **PASS** |
| `TC_UI_MGR_APP_01` | Quản lý xem danh sách đơn chờ duyệt và các thẻ thống kê | UI | P0 | **PASS** |
| `TC_UI_MGR_APP_02` | Quản lý thao tác 1-Click Phê duyệt đơn | UI | P0 | **PASS** |
| `TC_UI_MGR_APP_03` | Quản lý từ chối đơn kèm lý do giải thích | UI | P0 | **PASS** |
| `TC_UI_MGR_EMG_01` | Quản lý xem danh sách yêu cầu Chấm công Khẩn cấp cần xét duyệt | UI | P1 | **PASS** |
| `TC_UI_HR_TS_01`   | HR xem ma trận bảng công tổng hợp toàn công ty | UI | P0 | **PASS** |
| `TC_UI_HR_TS_02`   | HR mở Modal Mở Kỳ Công Mới và kiểm tra các trường dữ liệu | UI | P0 | **PASS** |
| `TC_UI_HR_TS_03`   | HR kiểm tra nút Xuất CSV Bảng Công chuẩn UTF-8 BOM | UI | P0 | **PASS** |
| `TC_UI_HR_TS_04`   | HR xem và giải quyết Khiếu nại công trong kỳ | UI | P0 | **PASS** |
| `TC_UI_HR_ORG_01`  | HR xem sơ đồ phân cấp Phòng Ban và mở Modal Thêm Phòng Ban | UI | P1 | **PASS** |
| `TC_UI_HR_ORG_02`  | HR chuyển sang Danh Sách Nhân Sự và mở Modal Thêm Nhân Viên | UI | P1 | **PASS** |
| `TC_UI_HR_ORG_03`  | HR chuyển sang Quản Lý Thiết Bị Di Động và kiểm tra thao tác Thu Hồi | UI | P1 | **PASS** |
| `TC_UI_HR_SET_01`  | HR xem danh mục Bộ Quy Tắc Doanh Nghiệp (Policy Rules) | UI | P1 | **PASS** |
| `TC_UI_HR_SET_02`  | HR chuyển sang Ca Làm Việc và mở Modal Thêm Ca Làm | UI | P1 | **PASS** |
| `TC_UI_HR_SET_03`  | HR chuyển sang Lịch Nghỉ Lễ và mở Modal Thêm Ngày Lễ | UI | P1 | **PASS** |
| `TC_UI_GW_01`      | Kiểm tra tab Cấu hình Tích hợp Google Workspace hiển thị đầy đủ | UI | P1 | **PASS** |
| `TC_UI_GW_02`      | Nhấn nút Bắn Thẻ Thử Nghiệm Google Chat Card v2 | UI | P1 | **PASS** |
| `TC_UI_GW_03`      | Nhấn nút Kích hoạt Bản Tin Điểm Danh Sáng 09:00 Tự Động | UI | P1 | **PASS** |
| `TC_UI_GW_04`      | Nhấn nút Gửi Email Thử Nghiệm qua hệ thống | UI | P1 | **PASS** |
| `TC_UI_GW_05`      | Kiểm tra bảng Nhật Ký Thông Báo Google Workspace (Audit Logs) | UI | P1 | **PASS** |
| **09. Flow E2E - Toàn Trình Vòng Đời Nghiệp Vụ Doanh Nghiệp (Enterprise Lifecycle - 6 Flows)** | | | | |
| `TC_E2E_01`      | Vòng đời nghiệp vụ toàn trình 10 bước vận hành doanh nghiệp 1 ngày | Flow | CRITICAL | **PASS** |
| `TC_E2E_02`      | Vòng đời quản lý Nhân sự: Onboarding -> Cấp thiết bị -> Chấm công -> Điều chuyển -> Thu hồi thiết bị | Flow | CRITICAL | **PASS** |
| `TC_E2E_03`      | Phát hiện Gian lận Vị trí GPS (>5km) & Cảnh báo Bảo mật tới Google Chat | Flow | CRITICAL | **PASS** |
| `TC_E2E_04`      | Khóa sổ Kỳ Bảng lương Bất Biến & Tự động Hồi tố Công Kỳ Kế Tiếp | Flow | CRITICAL | **PASS** |
| `TC_E2E_05`      | Quy trình Duyệt Đơn Đa Kênh qua Google Workspace (Gmail Actionable & Chat Card v2) | Flow | CRITICAL | **PASS** |
| `TC_E2E_06`      | Kiểm soát Ràng buộc Quy chế Hạn ngạch và Ngăn chặn Lạm dụng (Policy Quotas & Boundary Rules) | Flow | CRITICAL | **PASS** |

---
*Báo cáo kiểm thử tự động toàn diện được khởi tạo từ Robot Framework và lưu trữ tại `SmartTimeChecking-AutomationTest/reports/`.*


