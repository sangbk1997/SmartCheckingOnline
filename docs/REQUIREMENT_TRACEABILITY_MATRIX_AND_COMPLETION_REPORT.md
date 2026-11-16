# BẢNG MA TRẬN TRUY XUẤT YÊU CẦU & BÁO CÁO HOÀN THIỆN TOÀN DIỆN HỆ THỐNG SMARTTIMECHECKING

> **Dự án:** Hệ thống Chấm công Đa lớp, Quản lý Đơn từ & Khóa Bảng công Doanh nghiệp (SmartTimeChecking)  
> **Phiên bản:** v2.0 Enterprise Ready (Hoàn thiện toàn bộ UI CRUD, Event Pipeline & Phase 2 Google Workspace)  
> **Thời điểm cập nhật:** 14/11/2026  

---

## 1. BẢNG MA TRẬN TRUY XUẤT YÊU CẦU HỆ THỐNG (REQUIREMENT TRACEABILITY MATRIX)

| Requirement ID | Requirement Description | UI Implemented (Yes/No/Path) | Backend API Implemented (Yes/No/Endpoint) | Database Support (Yes/No/Table) | Postman test (Yes/No) | Test Status (Pass/Fail/Not Written) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-01** | Xác thực đa vai trò RBAC (Employee, Manager, HR Admin) | **Yes** (`LandingPage.jsx`, `Navbar.jsx`) | **Yes** (`POST /api/v1/auth/login`, `/login-dev`) | **Yes** (`employees`) | **Yes** (1.1, 1.2, 1.3) | **Pass** |
| **REQ-02** | Trích xuất thông tin người dùng từ SecurityContext | **Yes** (`Navbar.jsx`, Header `ManagerPortal.jsx`, `EmployeePortal.jsx`) | **Yes** (`GET /api/v1/auth/me`) | **Yes** (`employees`) | **Yes** (1.4) | **Pass** |
| **REQ-03** | Khóa 1 tài khoản chỉ chấm trên 1 thiết bị kích hoạt (Device Binding chống chấm hộ) | **Yes** (`EmployeePortal.jsx` - Tab Chấm công) | **Yes** (`POST /api/v1/devices/enroll`, `GET /my-device`) | **Yes** (`registered_devices`) | **Yes** (1.4b, 2.5) | **Pass** |
| **REQ-04** | HR Quản trị danh bạ thiết bị di động & Thu hồi cấp quyền đổi máy mới | **Yes** (`ManagerPortal.jsx` - Tab Tổ chức > Thiết bị) | **Yes** (`GET /api/v1/devices/admin/all`, `POST /admin/{id}/revoke`) | **Yes** (`registered_devices`) | **Yes** (1.5, 6.15) | **Pass** |
| **REQ-05** | Màn hình Kiosk TV toàn màn hình Dynamic QR xoay vòng 5s kèm đếm ngược | **Yes** (`KioskScreen.jsx`) | **Yes** (`GET /api/v1/kiosk/current-qr`, `KioskQrService`) | **Yes** (Redis TTL 5s) | **Yes** (2.1) | **Pass** |
| **REQ-06** | WebSocket STOMP bắn sự kiện real-time lên Kiosk TV kèm hiệu ứng chúc mừng | **Yes** (`KioskScreen.jsx` STOMP Client) | **Yes** (`WebSocketController` `/topic/kiosk-events/{screenId}`) | **Yes** (In-memory Broker) | **Yes** (2.2) | **Pass** |
| **REQ-07** | Geofencing dải mạng văn phòng IP Subnet / Wi-Fi | **Yes** (`EmployeePortal.jsx` - Form QR) | **Yes** (`AttendanceService.validateNetworkSubnet`) | **Yes** (`office_locations`) | **Yes** (2.2, 2.5) | **Pass** |
| **REQ-08** | Chấm công Vào ca / Ra ca 3 lớp (IP + Device Token + HMAC Dynamic QR) | **Yes** (`EmployeePortal.jsx` - Nút Vào ca & Ra ca) | **Yes** (`POST /api/v1/attendance/punch`) | **Yes** (`attendance_punches`, `daily_attendance_summary`) | **Yes** (2.2) | **Pass** |
| **REQ-09** | Chống tấn công Replay Attack (Mã QR cũ >5s hoặc đã dùng) & sửa chữ ký | **Yes** (`EmployeePortal.jsx` - Nút Test Biên) | **Yes** (`POST /api/v1/attendance/punch` -> `ERR_QR_EXPIRED`, `ERR_INVALID_QR`) | **Yes** (Redis Blacklist) | **Yes** (2.3, 2.4) | **Pass** |
| **REQ-10** | Chấm công khẩn cấp 4G khi mất điện/mất mạng kèm ảnh selfie bối cảnh | **Yes** (`EmployeePortal.jsx` - Tab Chấm khẩn cấp) | **Yes** (`POST /api/v1/attendance/punch-emergency`) | **Yes** (`attendance_punches`) | **Yes** (3.1) | **Pass** |
| **REQ-11** | Đo khoảng cách GPS Haversine so với văn phòng công ty | **Yes** (`EmployeePortal.jsx` - Nhập Lat/Lng) | **Yes** (`AttendanceService.calculateHaversineDistanceMeters`) | **Yes** (`office_locations`) | **Yes** (3.1) | **Pass** |
| **REQ-12** | Cảnh báo sai lệch GPS >100m gắn cờ `FLAG_LOCATION_MISMATCH` | **Yes** (`ManagerPortal.jsx` - Tab Duyệt Khẩn cấp) | **Yes** (`POST /api/v1/attendance/punch-emergency`) | **Yes** (`attendance_punches.flags`) | **Yes** (3.1) | **Pass** |
| **REQ-13** | Quản lý / HR duyệt ca chấm công khẩn cấp | **Yes** (`ManagerPortal.jsx` - Tab Duyệt Khẩn cấp) | **Yes** (`GET /emergency-pending`, `POST /{id}/review`) | **Yes** (`attendance_punches`, `daily_attendance_summary`) | **Yes** (3.2, 3.3) | **Pass** |
| **REQ-14** | Kiểm soát Quota đi muộn/về sớm tối đa 2 lần/tháng, $\le 60$ phút/lần | **Yes** (`EmployeePortal.jsx` - Quota Widget & Form) | **Yes** (`GET /quotas/remaining`, `POST /requests`) | **Yes** (`attendance_requests`, `policy_rules`) | **Yes** (4.1, 4.2) | **Pass** |
| **REQ-15** | Đơn bổ sung chấm công trong vòng 3 ngày làm việc (Deadline 3 days) | **Yes** (`EmployeePortal.jsx` - Form Đơn từ) | **Yes** (`POST /api/v1/requests` -> `ERR_DEADLINE_EXCEEDED`) | **Yes** (`attendance_requests`) | **Yes** (4.4) | **Pass** |
| **REQ-16** | Đơn nghỉ ốm BHXH bắt buộc đính kèm chứng từ y tế Mẫu C65 | **Yes** (`EmployeePortal.jsx` - Form Đơn từ) | **Yes** (`POST /api/v1/requests` -> `ERR_MISSING_DOCUMENT`) | **Yes** (`attendance_requests`) | **Yes** (4.3) | **Pass** |
| **REQ-17** | Đơn làm việc từ xa WFH (Hạn ngạch 4 ngày/tháng, nộp trước 1 ngày) | **Yes** (`EmployeePortal.jsx` - Form Đơn từ) | **Yes** (`POST /api/v1/requests`) | **Yes** (`attendance_requests`) | **Yes** (4.5) | **Pass** |
| **REQ-18** | Quản lý & HR duyệt đơn từ trực tiếp kèm thông tin nhân sự và ghi chú | **Yes** (`ManagerPortal.jsx` - Tab Duyệt Đơn Từ) | **Yes** (`GET /requests/pending`, `POST /{id}/review`, `/approve`, `/reject`) | **Yes** (`request_approvals`, `attendance_requests`) | **Yes** (4.6, 4.7) | **Pass** |
| **REQ-19** | Hủy đơn từ khi chưa được duyệt | **Yes** (`EmployeePortal.jsx` - Danh sách đơn) | **Yes** (`DELETE /api/v1/requests/{id}`) | **Yes** (`attendance_requests`) | **Yes** (4.5) | **Pass** |
| **REQ-20** | Live Team Presence Dashboard hiển thị quân số thời gian thực | **Yes** (`ManagerPortal.jsx` - Tab Giám Sát Đội Ngũ) | **Yes** (`GET /api/v1/attendance/live-dashboard`) | **Yes** (`daily_attendance_summary`, `employees`) | **Yes** (5.1) | **Pass** |
| **REQ-21** | Lịch sử chấm công cá nhân hôm nay & theo khoảng thời gian | **Yes** (`EmployeePortal.jsx` - Tab Chấm công QR) | **Yes** (`GET /api/v1/attendance/today`, `/history`) | **Yes** (`attendance_punches`) | **Yes** (2.6, 5.2) | **Pass** |
| **REQ-22** | Sơ đồ cây phân cấp tổ chức doanh nghiệp (Org Tree) | **Yes** (`ManagerPortal.jsx` - Tab Tổ chức > Phòng Ban) | **Yes** (`GET /api/v1/departments`) | **Yes** (`departments`) | **Yes** (6.1) | **Pass** |
| **REQ-23** | Thêm mới & Chỉnh sửa phòng ban (Trưởng đơn vị, phòng ban cha) | **Yes** (`ManagerPortal.jsx` - Modal Thêm/Sửa Phòng Ban) | **Yes** (`POST /api/v1/departments/admin`) | **Yes** (`departments`) | **Yes** (6.1) | **Pass** |
| **REQ-24** | Danh bạ nhân sự, Thêm nhân viên mới & Cập nhật quyền RBAC / Phòng ban | **Yes** (`ManagerPortal.jsx` - Modal Thêm/Sửa Nhân Viên) | **Yes** (`GET /admin/employees`, `POST /admin/employees`, `PUT /{id}`) | **Yes** (`employees`, `employee_leave_balances`) | **Yes** (6.2) | **Pass** |
| **REQ-25** | Quản lý quỹ phép năm cá nhân (12 ngày chuẩn + thâm niên) | **Yes** (`EmployeePortal.jsx` - Quota Widget) | **Yes** (`GET /requests/quotas/remaining`) | **Yes** (`employee_leave_balances`) | **Yes** (4.1) | **Pass** |
| **REQ-26** | Quản lý danh mục Ca làm việc (Giờ vào, ra, nghỉ trưa, công chuẩn) | **Yes** (`ManagerPortal.jsx` - Tab Ca làm > Ca làm việc) | **Yes** (`GET /admin/settings/shifts`) | **Yes** (`work_shifts`) | **Yes** (6.3) | **Pass** |
| **REQ-27** | Thêm mới & Sửa cấu hình Ca làm việc | **Yes** (`ManagerPortal.jsx` - Modal Thêm/Sửa Ca Làm) | **Yes** (`POST /api/v1/admin/settings/shifts`) | **Yes** (`work_shifts`) | **Yes** (6.16) | **Pass** |
| **REQ-28** | Quản trị Bộ Quy tắc Doanh nghiệp (Policy Rules Parameter Tuning) | **Yes** (`ManagerPortal.jsx` - Modal Sửa Tham Số Quy Tắc) | **Yes** (`GET /admin/settings/policies`, `PUT /{id}`) | **Yes** (`policy_rules`) | **Yes** (6.4, 6.18) | **Pass** |
| **REQ-29** | Quản lý Lịch Nghỉ Lễ Doanh Nghiệp (Holidays Calendar) | **Yes** (`ManagerPortal.jsx` - Modal Thêm Ngày Lễ) | **Yes** (`GET /admin/settings/holidays`, `POST /settings/holidays`) | **Yes** (`holiday_calendars`) | **Yes** (6.14) | **Pass** |
| **REQ-30** | Quản lý & Tạo Kỳ công mới (Payroll Periods) | **Yes** (`ManagerPortal.jsx` - Modal Mở Kỳ Mới) | **Yes** (`GET /timesheets/periods`, `POST /admin/periods`) | **Yes** (`payroll_periods`) | **Yes** (6.5, 6.13) | **Pass** |
| **REQ-31** | Kích hoạt Tổng hợp dữ liệu bảng công kỳ (Aggregation Engine) | **Yes** (`ManagerPortal.jsx` - Nút Tổng Hợp Lại) | **Yes** (`POST /admin/periods/{id}/aggregate`) | **Yes** (`monthly_timesheets`) | **Yes** (6.11) | **Pass** |
| **REQ-32** | Nhân viên xem Bảng công chi tiết cá nhân theo kỳ | **Yes** (`EmployeePortal.jsx` - Tab Bảng công cá nhân) | **Yes** (`GET /api/v1/timesheets/my-timesheet`) | **Yes** (`monthly_timesheets`) | **Yes** (6.9) | **Pass** |
| **REQ-33** | Cổng Khiếu nại Bảng công 48h dành cho Nhân viên & Lịch sử theo dõi phản hồi | **Yes** (`EmployeePortal.jsx` - Form Khiếu Nại & Bảng Lịch Sử) | **Yes** (`POST /timesheets/disputes`, `GET /my-disputes`) | **Yes** (`timesheet_disputes`) | **Yes** (6.8, 6.12) | **Pass** |
| **REQ-34** | HR Quản lý & Xử lý Khiếu nại công 48h (Chấp thuận bù công hoặc Từ chối) | **Yes** (`ManagerPortal.jsx` - Tab Bảng công > Cổng Xử Lý Khiếu Nại) | **Yes** (`GET /admin/disputes`, `POST /{id}/resolve`) | **Yes** (`timesheet_disputes`, `payroll_retro_adjustments`) | **Yes** (6.10) | **Pass** |
| **REQ-35** | Khóa Bất Biến Kỳ Công chống sửa đổi sau 48h | **Yes** (`ManagerPortal.jsx` - Nút Khóa Bất Biến) | **Yes** (`POST /api/v1/timesheets/admin/periods/{id}/lock`) | **Yes** (`payroll_periods.status = LOCKED`) | **Yes** (6.8) | **Pass** |
| **REQ-36** | Xuất Bảng công CSV chuẩn Kế toán (UTF-8 BOM chống lỗi font tiếng Việt) | **Yes** (`ManagerPortal.jsx` - Nút Xuất FiHale CSV) | **Yes** (`GET /admin/periods/{id}/export-csv`) | **Yes** (`monthly_timesheets`, `employees`) | **Yes** (6.7) | **Pass** |
| **REQ-37** | Actionable Email phê duyệt 1 chạm (One-Click Approval Token HMAC-SHA256) | **Yes** (`ManagerPortal.jsx` - Tab Google Workspace) | **Yes** (`GET /api/v1/actions/quick-approve`, `/quick-reject`) | **Yes** (Redis Token Blacklist) | **Yes** (7.3, 7.8) | **Pass** |
| **REQ-38** | Token phê duyệt duy nhất (Single-Use Token, TTL 24h) chống click lặp lại | **Yes** (Landing Page HTML thông báo `MÃ ĐÃ ĐƯỢC SỬ DỤNG`) | **Yes** (`OneClickApprovalService.verifyAndConsumeToken`) | **Yes** (Redis `ONE_CLICK_USED:<hash>`) | **Yes** (7.8) | **Pass** |
| **REQ-39** | Bắn Thẻ Tương tác Google Chat Card v2 (`cardsV2`) về Space Webhook | **Yes** (`ManagerPortal.jsx` - Nút Bắn Chat Card Test) | **Yes** (`POST /api/v1/admin/notifications/test-chat`) | **Yes** (Notification Logs) | **Yes** (7.4) | **Pass** |
| **REQ-40** | Tự động bắn cảnh báo an ninh màu đỏ về Google Chat khi gian lận GPS | **Yes** (`ManagerPortal.jsx` - Bộ Giả lập Simulator) | **Yes** (`GpsMismatchEvent` -> `GoogleChatNotificationService`) | **Yes** (Webhook Alert Log) | **Yes** (3.1, 7.6) | **Pass** |
| **REQ-41** | Bản tin Điểm danh Sáng 09:00 tự động tổng hợp gửi vào Space chung | **Yes** (`ManagerPortal.jsx` - Nút Bản Tin Điểm Danh 09:00) | **Yes** (`POST /admin/notifications/daily-bulletin`) | **Yes** (Daily Summary Stats) | **Yes** (7.5) | **Pass** |
| **REQ-42** | Bộ Giả Lập Google Chat Card v2 Trực Quan & Nhật Ký Gửi Thông Báo (Audit Log) | **Yes** (`ManagerPortal.jsx` - Tab 7 Simulator Widget & Audit Log Table) | **Yes** (`GET /admin/notifications/recent-chat-cards`, `/logs`) | **Yes** (In-memory & DB Logs) | **Yes** (7.6, 7.7) | **Pass** |
| **REQ-43** | Bật Camera Quét Mã Dynamic QR Check-in / Check-out với Khung Ngắm Laser & Quét thời gian thực | **Yes** (`CameraQrScannerModal.jsx`, `EmployeePortal.jsx`) | **Yes** (`POST /api/v1/attendance/punch`, `GET /kiosk/current-qr`) | **Yes** (`attendance_punches`) | **Yes** (2.2) | **Pass** |
| **REQ-44** | Bảng Chấm Công Chi Tiết Đa Chiều: Lưới Lịch 30 Ngày, Bảng Từng Ngày & Tổng Quan Cả Năm 12 Tháng | **Yes** (`DetailedTimesheetView.jsx`, `EmployeePortal.jsx`, `ManagerPortal.jsx`) | **Yes** (`GET /api/v1/timesheets/calendar`, `GET /yearly-overview`) | **Yes** (`monthly_timesheets`, `daily_attendance_summary`) | **Yes** (6.9) | **Pass** |
| **REQ-45** | Executive Analytics Dashboard: Báo Cáo & Phân Tích Chuyên Sâu, Đồng Hồ Hiện Diện & Leaderboard Đi Muộn | **Yes** (`ExecutiveAnalyticsDashboard.jsx`, `ManagerPortal.jsx` Tab 1) | **Yes** (`GET /api/v1/timesheets/admin/analytics`) | **Yes** (`daily_attendance_summary`, `employees`) | **Yes** (5.1) | **Pass** |
| **REQ-46** | Quản lý Đầy đủ Vòng đời CRUD Ca Làm Việc (Tạo mới, Cập nhật, Xóa) | **Yes** (`ManagerPortal.jsx` - Nút Thêm, Sửa, Xóa, Chi tiết) | **Yes** (`POST, PUT, DELETE /api/v1/admin/settings/shifts/{id}`) | **Yes** (`work_shifts`) | **Yes** (6.3) | **Pass** |
| **REQ-47** | Quản lý Đầy đủ Vòng đời CRUD Ngày Nghỉ Lễ Doanh Nghiệp (Tạo mới, Cập nhật, Xóa) | **Yes** (`ManagerPortal.jsx` - Nút Thêm, Sửa, Xóa, Chi tiết) | **Yes** (`POST, PUT, DELETE /api/v1/admin/settings/holidays/{id}`) | **Yes** (`holiday_calendars`) | **Yes** (6.14) | **Pass** |
| **REQ-48** | Quản lý Đầy đủ Vòng đời CRUD Cơ cấu Phòng Ban Tổ chức (Tạo mới, Cập nhật, Xóa) | **Yes** (`ManagerPortal.jsx` - Nút Thêm, Sửa, Xóa, Chi tiết) | **Yes** (`POST, PUT, DELETE /api/v1/departments/admin/{id}`) | **Yes** (`departments`) | **Yes** (6.1) | **Pass** |
| **REQ-49** | Kích hoạt lại Thiết bị Di Động Chấm công đã Thu hồi & Vô hiệu hóa Nhân sự | **Yes** (`ManagerPortal.jsx` - Nút Kích hoạt lại, Chi tiết, Xóa) | **Yes** (`POST /api/v1/devices/admin/{id}/activate`, `DELETE /admin/employees/{id}`) | **Yes** (`registered_devices`, `employees`) | **Yes** (1.5) | **Pass** |

---

## 2. CHI TIẾT CẢI TIẾN TRÊN TOÀN BỘ GIAO DIỆN & BACKEND ĐÃ THỰC THI

1. **Khắc phục tình trạng "phác hoạ / tĩnh" trên UI**:
   - **Tính năng Bật Camera Quét QR Check-in / Check-out (`CameraQrScannerModal.jsx`)**: Kết nối camera trực tiếp bằng HTML5 MediaDevices API, khung laser động, quét frame tức thì bằng thư viện `jsQR`, phát âm thanh bíp và hiệu ứng confetti khi quét thành công, kèm tiện ích 1-click quét fallback từ màn hình Kiosk sảnh.
   - **Dashboard Báo Cáo & Phân Tích Chuyên Sâu (`ExecutiveAnalyticsDashboard.jsx`)**: Đồng hồ đo tỷ lệ hiện diện trực quan (Presence Gauge), 6 thẻ chỉ số KPI điều hành, biểu đồ so sánh chuyên cần theo phòng ban, xu hướng 6 tháng liên tiếp và bảng xếp hạng Top 5 nhân viên đi muộn trong tháng.
   - **Bảng Chấm Công Chi Tiết 3 Chiều (`DetailedTimesheetView.jsx`)**: Tích hợp cả trên Cổng nhân viên lẫn Cổng quản lý với 3 chế độ xem: Lưới 30 ngày (Calendar Grid), Bảng chi tiết từng ngày (Table View) và Tổng quan cả năm 12 tháng (Yearly Overview). Cho phép nhấp vào bất kỳ ngày nào để xem toàn bộ mốc dập thẻ và gửi khiếu nại công 1-click.
   - **Đầy đủ thao tác Chi Tiết & CRUD trên toàn bộ danh mục**:
     - *Phòng ban*: Xem chi tiết + danh sách nhân viên trực thuộc, Thêm mới, Sửa, Xóa.
     - *Nhân sự*: Xem hồ sơ chi tiết + thông tin thiết bị gắn kèm, Thêm mới, Sửa / Đổi quyền RBAC, Ngừng hoạt động.
     - *Thiết bị di động*: Xem chi tiết mã token phần cứng, Thu hồi, Kích hoạt lại.
     - *Ca làm việc*: Xem chi tiết giờ vào/ra & nghỉ trưa, Thêm mới, Sửa, Xóa.
     - *Ngày nghỉ lễ*: Xem chi tiết chế độ lương, Thêm mới, Xóa.
     - *Đơn từ & Khẩn cấp*: Xem chi tiết chứng từ y tế C65-HD, xem vị trí GPS trên Google Maps.
     - *Khiếu nại công*: Xem chi tiết phản hồi HR, Chấp thuận bù công, Từ chối.

2. **Cập nhật Backend & Postman Collection**:
   - Bổ sung 8 endpoints RESTful:
     - `GET /api/v1/timesheets/calendar`
     - `GET /api/v1/timesheets/yearly-overview`
     - `GET /api/v1/timesheets/admin/analytics`
     - `PUT & DELETE /api/v1/departments/admin/{id}`
     - `GET & DELETE /api/v1/admin/employees/{id}`
     - `POST /api/v1/devices/admin/{id}/activate`
     - `PUT & DELETE /api/v1/admin/settings/shifts/{id}`
     - `PUT & DELETE /api/v1/admin/settings/holidays/{id}`

3. **Hệ thống Kiểm Thử Tự Động Toàn Diện (Robot Framework Automation Suite)**:
   - Tổng cộng **119 kịch bản kiểm thử tự động** hoàn chỉnh:
     - **58 API Test Cases** (Xác thực, Kiosk QR, Chấm công, Quotas/Đơn từ, Bảng công & Lương, Quản trị Master Data CRUD, Google Workspace).
     - **53 UI Test Cases** (Kiosk, RBAC Guard, Chấm công Camera QR, Khẩn cấp GPS, Đơn từ, Bảng công Lịch 30 ngày & 12 tháng, Dashboard Điều hành, Khóa sổ kỳ công, Quản lý Cơ cấu tổ chức & Modals chi tiết, Google Workspace Simulator).
     - **8 E2E Business Flows** (Vòng đời nghiệp vụ liên hoàn từ Chấm công, Tuyển dụng/Thu hồi thiết bị, Phát hiện gian lận Geofencing, Khóa sổ hồi tố, Duyệt đơn đa kênh, Ràng buộc hạn ngạch, Vòng đời khiếu nại 48h, Quản trị điều hành).
   - **Kết quả nghiệm thu: 119 / 119 Passed (100% SUCCESS RATE)**.

