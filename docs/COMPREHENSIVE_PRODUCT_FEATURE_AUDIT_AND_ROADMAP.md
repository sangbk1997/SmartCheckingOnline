# BÁO CÁO TOÀN DIỆN VỀ TÍNH NĂNG, LOGIC NGHIỆP VỤ, HIỆN TRẠNG TRIỂN KHAI & LỘ TRÌNH NÂNG CẤP HỆ THỐNG SMARTTIMECHECKING

> **Dự án:** Hệ thống Quản trị Chấm công Đa lớp, Quản lý Đơn từ & Khóa Bảng công Doanh nghiệp (**SmartTimeChecking**)  
> **Phiên bản:** v2.1 Enterprise Ready (Bao gồm Camera QR, Bảng công Đa chiều, Executive Analytics Dashboard, Full CRUD Master Data & Phase 2 Google Workspace)  
> **Thời điểm lập báo cáo:** 14/11/2026  
> **Tài liệu tham chiếu:** [Requirement Traceability Matrix](file:///Users/sang/Projects/App/SmartTimeChecking/docs/REQUIREMENT_TRACEABILITY_MATRIX_AND_COMPLETION_REPORT.md) | [Automation Test Specification](file:///Users/sang/Projects/App/SmartTimeChecking/docs/AUTOMATION_TEST_SPECIFICATION_ROBOT_FRAMEWORK.md)

---

## MỤC LỤC
1. [Tổng Quan Sản Phẩm & Kiến Trúc Hệ Thống](#1-tổng-quan-sản-phẩm--kiến-trúc-hệ-thống)
2. [Chi Tiết 8 Phân Hệ Nghiệp Vụ: Logic & Tình Trạng Triển Khai Thực Tế](#2-chi-tiết-8-phân-hệ-nghiệp-vụ-logic--tình-trạng-triển-khai-thực-tế)
   - [Phân hệ 1: Xác Thực Đa Vai Trò RBAC & Ràng Buộc Thiết Bị (Device Binding)](#phân-hệ-1-xác-thực-đa-vai-trò-rbac--ràng-buộc-thiết-bị-device-binding)
   - [Phân hệ 2: Màn Hình Sảnh Kiosk & Mã Dynamic QR Chống Gian Lận](#phân-hệ-2-màn-hình-sảnh-kiosk--mã-dynamic-qr-chống-gian-lận)
   - [Phân hệ 3: Điểm Danh Cá Nhân (Camera QR & Chấm Khẩn Cấp GPS Geofencing)](#phân-hệ-3-điểm-danh-cá-nhân-camera-qr--chấm-khẩn-cấp-gps-geofencing)
   - [Phân hệ 4: Quản Lý Đơn Từ & Bộ Quy Tắc Hạn Ngạch (Policy Engine)](#phân-hệ-4-quản-lý-đơn-từ--bộ-quy-tắc-hạn-ngạch-policy-engine)
   - [Phân hệ 5: Bảng Chấm Công Đa Chiều, Khóa Kỳ Lương & Cổng Khiếu Nại 48h](#phân-hệ-5-bảng-chấm-công-đa-chiều-khóa-kỳ-lương--cổng-khiếu-nại-48h)
   - [Phân hệ 6: Trung Tâm Giám Sát Quân Số & Dashboard Báo Cáo Điều Hành](#phân-hệ-6-trung-tâm-giám-sát-quân-số--dashboard-báo-cáo-điều-hành)
   - [Phân hệ 7: Quản Trị Cơ Cấu Tổ Chức & Dữ Liệu Danh Mục (Full CRUD)](#phân-hệ-7-quản-trị-cơ-cấu-tổ-chức--dữ-liệu-danh-mục-full-crud)
   - [Phân hệ 8: Tích Hợp Toàn Diện Google Workspace (Gmail & Google Chat)](#phân-hệ-8-tích-hợp-toàn-diện-google-workspace-gmail--google-chat)
3. [Hệ Thống Kiểm Thử Tự Động Hoá (Robot Framework Suite - 119 Tests)](#3-hệ-thống-kiểm-thử-tự-động-hoá-robot-framework-suite---119-tests)
4. [Đánh Giá Khoảng Trống (Gap Analysis), Hạn Chế & Điểm Cần Cải Thiện](#4-đánh-giá-khoảng-trống-gap-analysis-hạn-chế--điểm-cần-cải-thiện)
5. [Đề Xuất Tính Năng Mới & Kế Hoạch Lộ Trình Phát Triển (Product Roadmap)](#5-đề-xuất-tính-năng-mới--kế-hoạch-lộ-trình-phát-triển-product-roadmap)

---

## 1. TỔNG QUAN SẢN PHẨM & KIẾN TRÚC HỆ THỐNG

### 1.1 Mục Tiêu Sản Phẩm
**SmartTimeChecking** là nền tảng quản trị chấm công và phê duyệt nhân sự thông minh thế hệ mới, giải quyết triệt để 4 vấn nạn cố hữu của các hệ thống chấm công truyền thống:
1. **Gian lận chấm công hộ (Buddy Punching):** Giải quyết bằng cơ chế **Khóa 1 tài khoản - 1 thiết bị phần cứng (Hardware Device Binding)** kết hợp **Mã Dynamic QR xoay vòng 5 giây** có ký số HMAC-SHA256 trên màn hình TV Kiosk.
2. **Sai sót dữ liệu khi mất mạng / mất điện:** Hỗ trợ cơ chế **Chấm công Khẩn cấp 4G** tính toán khoảng cách GPS Geofencing (thuật toán Haversine), phát hiện và cảnh báo vị trí gian lận vượt bán kính văn phòng.
3. **Quy trình đơn từ rườm rà, lạm dụng hạn ngạch:** Tự động hóa kiểm soát Quota (WFH, Đi muộn, Nghỉ phép năm, Nghỉ ốm BHXH mẫu C65-HD) bằng **Policy Rule Engine**.
4. **Tranh chấp ngày công cuối tháng & trễ bảng lương:** Thiết lập quy trình 4 bước bất biến: Tổng hợp tự động $\rightarrow$ Mở cổng khiếu nại công 48h $\rightarrow$ HR xử lý bù công hồi tố $\rightarrow$ Khóa sổ bất biến kỳ công SHA-256 và xuất file kế toán UTF-8 BOM.

```mermaid
flowchart TB
    subgraph ClientLayers["LỚP CLIENT & THIẾT BỊ ĐẦU CUỐI"]
        KioskApp["Kiosk TV Display\n(Dynamic QR 5s + WebSocket)"]
        EmployeeApp["Employee Portal\n(Camera QR + Form 48h + GPS)"]
        ManagerApp["Manager & HR Portal\n(Executive Dashboard + Full CRUD)"]
        WorkspaceApp["Google Workspace\n(Gmail Actionable + Chat Space)"]
    end

    subgraph GatewaySecurity["BẢO MẬT & ĐIỀU PHỐI"]
        AuthFilter["JWT Authentication & RBAC Guard"]
        RateLimiter["Redis Dynamic QR & Token Blacklist"]
        StompBroker["WebSocket STOMP Message Broker"]
    end

    subgraph CoreServices["LỚP DỊCH VỤ CỐT LÕI (SPRING BOOT 3.2)"]
        AttendanceSvc["Attendance Service\n(3-Layer Verification)"]
        PolicyEngine["Policy & Quota Rule Engine\n(Leave, WFH, Sick C65)"]
        TimesheetSvc["Timesheet & Payroll Engine\n(Calendar, Retroactive & Locking)"]
        MasterDataSvc["Organization & Policy Admin\n(Departments, Shifts, Holidays)"]
        NotifSvc["Google Workspace Integration\n(CardsV2 & HMAC One-Click)"]
    end

    subgraph DataStorage["LỚP LƯU TRỮ DỮ LIỆU"]
        PostgresDB[(PostgreSQL 15 Enterprise DB)]
        RedisCache[(Redis Cache & Ephemeral Token Storage)]
    end

    ClientLayers --> GatewaySecurity
    GatewaySecurity --> CoreServices
    CoreServices --> DataStorage
```

---

## 2. CHI TIẾT 8 PHÂN HỆ NGHIỆP VỤ: LOGIC & TÌNH TRẠNG TRIỂN KHAI THỰC TẾ

### Phân hệ 1: Xác Thực Đa Vai Trò RBAC & Ràng Buộc Thiết Bị (Device Binding)
- **Logic Nghiệp Vụ:**
  - Hệ thống hỗ trợ 3 vai trò phân quyền chặt chẽ: `EMPLOYEE` (Nhân viên), `MANAGER` (Trưởng nhóm / Trưởng đơn vị), `HR_ADMIN` (Quản trị viên Nhân sự).
  - Cơ chế **Device Binding 1-1**: Mỗi tài khoản chỉ được phép kích hoạt và chấm công trên 1 thiết bị di động duy nhất tại một thời điểm (`registered_devices`). Thiết bị được định danh bằng mã băm phần cứng ngẫu nhiên kết hợp nền tảng OS.
  - Khi một thiết bị bị HR thu hồi (`REVOKED`), nhân viên sẽ không thể dùng thiết bị đó để chấm công (mã lỗi `ERR_DEVICE_MISMATCH`). HR có quyền kích hoạt lại thiết bị (`POST /api/v1/devices/admin/{id}/activate`) hoặc nhân viên đăng ký thiết bị mới sau khi được phê duyệt.
- **Tình Trạng Triển Khai:**
  - **Backend API:** `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `POST /api/v1/devices/enroll`, `GET /my-device`, `GET /devices/admin/all`, `POST /admin/{id}/revoke`, `POST /admin/{id}/activate` (100% Hoàn thành).
  - **Giao Diện UI:** Giao diện chọn vai trò nhanh tại Header, cảnh báo bảo vệ `AccessGuard`, thẻ trạng thái thiết bị đã xác thực trên Cổng nhân viên, bảng quản trị thiết bị di động có nút *Thu hồi máy cũ* và *Kích hoạt lại* trên Cổng quản lý.
  - **Kiểm Thử Tự Động:** 6 test cases API (`01_auth_tests.robot`) + 5 test cases UI (`02_auth_roles_guard_ui_tests.robot`) đều PASS 100%.

---

### Phân hệ 2: Màn Hình Sảnh Kiosk & Mã Dynamic QR Chống Gian Lận
- **Logic Nghiệp Vụ:**
  - Màn hình Kiosk TV đặt tại quầy sảnh văn phòng tự động hiển thị mã Dynamic QR lớn kèm đồng hồ đếm ngược chu kỳ 5 giây.
  - Mã QR được ký số bằng thuật toán **HMAC-SHA256** với cấu trúc mã hóa: `KIOSK_ID|OFFICE_ID|TIMESTAMP|NONCE|SIGNATURE`.
  - **Chống Replay Attack:** Khi một mã QR được quét thành công, Redis sẽ lập tức đưa mã băm của payload vào Blacklist với TTL 10 giây. Bất kỳ ai chụp ảnh gửi cho đồng nghiệp quét lại hoặc quét lại sau 5 giây đều bị từ chối (`ERR_QR_EXPIRED` hoặc `ERR_INVALID_QR`).
  - **WebSocket STOMP Real-time:** Khi có lượt chấm công thành công, Kiosk lập tức nhận sự kiện qua kênh `/topic/kiosk-events/{screenId}`, hiển thị avatar, họ tên và âm thanh chào đón nhân viên mà không cần tải lại trang.
- **Tình Trạng Triển Khai:**
  - **Backend API:** `GET /api/v1/kiosk/current-qr`, `KioskQrService`, `WebSocketConfig`, `WebSocketController` (100% Hoàn thành).
  - **Giao Diện UI:** [`KioskScreen.jsx`](file:///Users/sang/Projects/App/SmartTimeChecking/frontend/src/components/KioskScreen.jsx) với giao diện Dark Mode cao cấp, hiển thị đồng hồ thời gian thực, chu kỳ 5s dạng Circular Countdown, thẻ nhân viên vừa điểm danh dạng nổi bật (Toast/Banner).
  - **Kiểm Thử Tự Động:** 4 test cases API (`02_kiosk_qr_tests.robot`) + 2 test cases UI (`01_kiosk_ui_tests.robot`) đều PASS 100%.

---

### Phân hệ 3: Điểm Danh Cá Nhân (Camera QR & Chấm Khẩn Cấp GPS Geofencing)
- **Logic Nghiệp Vụ:**
  - **Bật Camera Quét Trực Tiếp Trên Web:** Nhân viên nhấn *"Bật Camera Quét QR Check-in/Check-out"*, trình duyệt kích hoạt camera qua `navigator.mediaDevices.getUserMedia`. Khung ngắm laser động phân tích từng khung hình bằng `jsQR`. Khi quét đúng mã dynamic QR trên Kiosk, hệ thống gửi request dập thẻ, phát âm thanh bíp (`AudioContext`) và nổ hiệu ứng confetti. Kèm nút *"Lấy Mã Kiosk Sảnh (1-Click)"* để kiểm thử khi chạy trên thiết bị không có webcam.
  - **Xác Thực 3 Lớp Chấm Công Thường:** Lớp 1: IP Subnet nội bộ văn phòng (`192.168.1.0/24`); Lớp 2: Device Token gắn kết 1-1; Lớp 3: Dynamic QR HMAC-SHA256 còn hiệu lực trong 5s.
  - **Chấm Công Khẩn Cấp (Emergency Punching):** Cho phép nhân viên dùng 4G chấm công khi văn phòng mất điện hoặc sự cố mạng. Hệ thống tính khoảng cách GPS bằng công thức **Haversine Distance**:
    $$\Delta\sigma = 2\arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos\phi_1\cos\phi_2\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$
    $$d = R \cdot \Delta\sigma$$
    Nếu khoảng cách $> 100\text{ m}$, hệ thống tự động gắn cờ cảnh báo gian lận `FLAG_LOCATION_MISMATCH` và đưa vào hàng đợi chờ Quản lý/HR phê duyệt thủ công.
- **Tình Trạng Triển Khai:**
  - **Backend API:** `POST /api/v1/attendance/punch`, `POST /api/v1/attendance/punch-emergency`, `GET /attendance/today`, `GET /emergency-pending`, `POST /{id}/review` (100% Hoàn thành).
  - **Giao Diện UI:** [`CameraQrScannerModal.jsx`](file:///Users/sang/Projects/App/SmartTimeChecking/frontend/src/components/CameraQrScannerModal.jsx), tab *Chấm công QR* và tab *Chấm khẩn cấp* trên [`EmployeePortal.jsx`](file:///Users/sang/Projects/App/SmartTimeChecking/frontend/src/components/EmployeePortal.jsx); Tab *Duyệt Khẩn Cấp* kèm Modal chi tiết tọa độ và link Google Maps trên [`ManagerPortal.jsx`](file:///Users/sang/Projects/App/SmartTimeChecking/frontend/src/components/ManagerPortal.jsx).
  - **Kiểm Thử Tự Động:** 7 test cases API (`03_attendance_tests.robot`) + 8 test cases UI (`03_employee_attendance_ui_tests.robot`, `04_employee_emergency_ui_tests.robot`) đều PASS 100%.

---

### Phân hệ 4: Quản Lý Đơn Từ & Bộ Quy Tắc Hạn Ngạch (Policy Engine)
- **Logic Nghiệp Vụ:**
  - Bộ quy tắc Policy Engine thẩm định đơn từ tự động trước khi ghi nhận vào hệ thống:
    1. **Đơn Đi muộn / Về sớm (`LATE_IN`, `EARLY_OUT`):** Hạn ngạch tối đa 2 lần/tháng, thời lượng mỗi lần không vượt quá 60 phút. Vượt quá sẽ bị chặn với mã `ERR_QUOTA_EXCEEDED`.
    2. **Đơn Làm việc từ xa (`WFH`):** Hạn ngạch tối đa 4 ngày/tháng, bắt buộc nộp trước thời điểm bắt đầu tối thiểu 24 giờ.
    3. **Đơn Bổ sung chấm công (`MISSING_PUNCH`):** Bắt buộc nộp trong vòng 3 ngày làm việc kể từ ngày quên chấm công (Deadline 3 days). Quá 3 ngày bị từ chối với mã `ERR_DEADLINE_EXCEEDED`.
    4. **Đơn Nghỉ ốm BHXH (`SICK_LEAVE`):** Bắt buộc phải có tệp chứng từ y tế Mẫu C65-HD (theo quy định BHXH Việt Nam). Nếu thiếu đường dẫn chứng từ, hệ thống chặn với mã `ERR_ATTACHMENT_REQUIRED`.
    5. **Đơn Nghỉ phép năm (`ANNUAL_LEAVE`):** Tự động trừ quỹ phép năm (`employee_leave_balances`). Tiêu chuẩn 12 ngày/năm + 1 ngày cho mỗi 5 năm thâm niên.
  - Quản lý / HR duyệt đơn từ trực tiếp kèm ghi chú phản hồi; nhân viên có quyền hủy đơn khi đơn còn ở trạng thái `PENDING`.
- **Tình Trạng Triển Khai:**
  - **Backend API:** `POST /api/v1/requests`, `GET /requests/my-requests`, `GET /requests/quotas/remaining`, `GET /requests/pending`, `POST /requests/{id}/review`, `DELETE /requests/{id}` (100% Hoàn thành).
  - **Giao Diện UI:** Các Widget hiển thị hạn ngạch trực quan (Quota Gauge/Cards), form nộp đơn theo từng loại đơn, bảng đơn từ cá nhân trên Cổng nhân viên; Tab *Duyệt Đơn từ* với Modal chi tiết kèm nhãn C65-HD trên Cổng quản lý.
  - **Kiểm Thử Tự Động:** 7 test cases API (`04_requests_quotas_tests.robot`) + 8 test cases UI (`05_employee_requests_ui_tests.robot`, `07_manager_dashboard_approvals_ui_tests.robot`) đều PASS 100%.

---

### Phân hệ 5: Bảng Chấm Công Đa Chiều, Khóa Kỳ Lương & Cổng Khiếu Nại 48h
- **Logic Nghiệp Vụ:**
  - **3 Chế Độ Xem Bảng Công Linh Hoạt:**
    1. *Lưới Lịch 30 Ngày (Calendar Grid):* Hiển thị màu sắc theo trạng thái ngày: `NORMAL` (Xanh ngọc), `LATE` (Cam), `WFH` (Tím), `LEAVE` (Xanh lá), `SICK` (Đỏ hồng), `HOLIDAY` (Hồng đậm), `WEEKEND` (Xám).
    2. *Bảng Chi Tiết Từng Ngày (Table View):* Chi tiết giờ vào ca, giờ ra ca, thời lượng làm việc, số phút đi muộn, trạng thái khiếu nại.
    3. *Tổng Quan Cả Năm 12 Tháng (Yearly Overview):* Thẻ tổng hợp 12 tháng thể hiện ngày công chuẩn, ngày công thực tế và tỷ lệ chuyên cần.
  - **Modal Chi Tiết Ngày & Gửi Khiếu Nại 1-Click:** Nhấp vào bất kỳ ngày nào để xem toàn bộ lịch sử dập thẻ và có nút *"Gửi khiếu nại ngày công này"* tự động chuyển sang form khiếu nại 48h.
  - **Quy Trình Khóa Kỳ Lương 4 Bước Bất Biến:**
    1. *Bước 1 - Tổng hợp công:* HR bấm *"Tổng Hợp Lại"*, hệ thống tính toán ngày công thực tế, số phút đi muộn và ngày WFH của toàn bộ nhân sự.
    2. *Bước 2 - Mở Cổng Khiếu Nại 48h:* Nhân viên được cấp thời hạn 48 giờ để rà soát bảng công và gửi phản hồi.
    3. *Bước 3 - Xử lý bù công hồi tố (Retroactive Adjustment):* HR phê duyệt khiếu nại hợp lệ, backend tự động tạo bản ghi hồi tố `payroll_retro_adjustments` để cộng bù 1 ngày công vào kỳ mở kế tiếp.
    4. *Bước 4 - Khóa sổ bất biến kỳ công (Lock Period):* Chuyển trạng thái kỳ sang `LOCKED`. Mọi hành động tổng hợp lại hay can thiệp dữ liệu công đều bị chặn đứng.
  - **Xuất File Kế Toán CSV Chuẩn:** Hỗ trợ mã hóa **UTF-8 with BOM (`0xEF, 0xBB, 0xBF`)** giúp mở file trực tiếp trên Microsoft Excel tiếng Việt không bị lỗi font.
- **Tình Trạng Triển Khai:**
  - **Backend API:** `GET /api/v1/timesheets/calendar`, `GET /api/v1/timesheets/yearly-overview`, `GET /my-timesheet`, `POST /disputes`, `GET /admin/disputes`, `POST /admin/disputes/{id}/resolve`, `POST /admin/periods/{id}/aggregate`, `POST /admin/periods/{id}/lock`, `GET /admin/periods/{id}/export-csv` (100% Hoàn thành).
  - **Giao Diện UI:** [`DetailedTimesheetView.jsx`](file:///Users/sang/Projects/App/SmartTimeChecking/frontend/src/components/DetailedTimesheetView.jsx) tích hợp tại cả 2 cổng; Tab *Quản lý Bảng công* với Ma trận công, Cổng xử lý khiếu nại, Modal mở kỳ mới và Modal chi tiết khiếu nại trên Cổng quản lý.
  - **Kiểm Thử Tự Động:** 10 test cases API (`05_timesheet_payroll_tests.robot`) + 7 test cases UI (`06_employee_timesheet_ui_tests.robot`, `08_hr_timesheet_closing_ui_tests.robot`) đều PASS 100%.

---

### Phân hệ 6: Trung Tâm Giám Sát Quân Số & Dashboard Báo Cáo Điều Hành
- **Logic Nghiệp Vụ:**
  - **Giám Sát Trực Tiếp (Live Presence Dashboard):** Thống kê số lượng nhân viên có mặt tại trụ sở theo thời gian thực, số nhân sự đi muộn, số nhân sự làm online WFH và danh sách điểm danh gần nhất.
  - **Báo Cáo & Phân Tích Chuyên Sâu (Executive Analytics Dashboard):**
    - 6 thẻ KPI chiến lược: Tổng nhân sự, Tỷ lệ đi làm hôm nay (%), Đúng giờ, Đi muộn, Nghỉ phép/WFH, Tổng số ca hoàn tất.
    - Đồng hồ hiện diện trực quan (Presence Gauge) với màu sắc cảnh báo theo % quân số.
    - Biểu đồ phân bổ tỷ lệ chuyên cần theo từng phòng ban (Phần mềm, Kinh doanh, Nhân sự...).
    - Biểu đồ xu hướng tỷ lệ chuyên cần liên tục 6 tháng gần nhất.
    - Bảng xếp hạng Leaderboard Top 5 nhân sự đi muộn nhiều nhất trong tháng.
    - Giám sát tuân thủ hạn ngạch và hàng đợi các tác vụ khẩn cấp cần HR xử lý.
- **Tình Trạng Triển Khai:**
  - **Backend API:** `GET /api/v1/attendance/live-dashboard`, `GET /api/v1/timesheets/admin/analytics` (100% Hoàn thành).
  - **Giao Diện UI:** [`ExecutiveAnalyticsDashboard.jsx`](file:///Users/sang/Projects/App/SmartTimeChecking/frontend/src/components/ExecutiveAnalyticsDashboard.jsx) tích hợp nút chuyển đổi chế độ xem mượt mà tại Tab 1 trên Cổng quản lý.
  - **Kiểm Thử Tự Động:** Đã bao phủ trong `07_manager_dashboard_approvals_ui_tests.robot` và các luồng E2E (`test_e2e_business_lifecycle.robot`).

---

### Phân hệ 7: Quản Trị Cơ Cấu Tổ Chức & Dữ Liệu Danh Mục (Full CRUD)
- **Logic Nghiệp Vụ:**
  - Cung cấp khả năng quản lý toàn diện vòng đời (Tạo mới, Đọc danh sách, Cập nhật, Xóa và Xem chi tiết) cho tất cả các thực thể danh mục doanh nghiệp:
    1. **Phòng ban (`departments`):** Phân cấp đa tầng cha - con, gắn Trưởng phòng, xem danh sách thành viên trực thuộc, Thêm, Sửa, Xóa.
    2. **Nhân sự (`employees`):** Quản lý hồ sơ, cấp quyền vai trò RBAC, loại hợp đồng, thiết bị gắn kèm, Thêm, Sửa quyền, Ngừng hoạt động (Deactivate).
    3. **Thiết bị di động (`registered_devices`):** Quản lý mã phần cứng token, Thu hồi khi mất máy hoặc đổi máy, Kích hoạt lại thiết bị.
    4. **Ca làm việc (`work_shifts`):** Ca cố định/linh hoạt, giờ vào/ra ca, khoảng nghỉ trưa, số giờ công chuẩn (8.0h), Thêm, Sửa, Xóa ca.
    5. **Lịch nghỉ lễ (`holiday_calendars`):** Danh mục ngày lễ trong năm hưởng nguyên 100% lương, Thêm, Xóa ngày lễ.
    6. **Bộ quy tắc doanh nghiệp (`policy_rules`):** Hiệu chỉnh tham số JSON động của Policy Engine mà không cần khởi động lại server.
- **Tình Trạng Triển Khai:**
  - **Backend API:** `GET, POST, PUT, DELETE` trên các đường dẫn `/api/v1/departments/admin/**`, `/api/v1/admin/employees/**`, `/api/v1/devices/admin/**`, `/api/v1/admin/settings/shifts/**`, `/api/v1/admin/settings/holidays/**`, `/api/v1/admin/settings/policies/**` (100% Hoàn thành).
  - **Giao Diện UI:** Các bảng danh mục chuyên nghiệp kèm 8 Modal chi tiết và các nút thao tác nhanh trên Cổng quản lý.
  - **Kiểm Thử Tự Động:** 13 test cases API (`06_admin_master_tests.robot`) + 11 test cases UI (`09_hr_organization_settings_ui_tests.robot`) đều PASS 100%.

---

### Phân hệ 8: Tích Hợp Toàn Diện Google Workspace (Gmail & Google Chat)
- **Logic Nghiệp Vụ:**
  - **Phê Duyệt 1 Chạm Qua Email (One-Click Approval Token):** Khi nhân viên nộp đơn, hệ thống gửi email HTML với 2 nút *"Phê Duyệt Nhanh"* và *"Từ Chối"*. Link chứa token mã hóa HMAC-SHA256 có thời hạn 24 giờ.
  - **Cơ Chế Single-Use Token:** Token chỉ được bấm duy nhất 1 lần. Khi bấm, Redis lưu key `ONE_CLICK_USED:<hash>` để vô hiệu hóa token ngay lập tức, ngăn chặn click đúp hoặc click lại.
  - **Google Chat Card v2 (`cardsV2`):** Bắn thẻ tương tác trực tiếp vào Google Chat Space qua Webhook. Thẻ có nút hành động tương tác ngay trên điện thoại hoặc máy tính.
  - **Cảnh Báo An Ninh Tự Động:** Khi phát hiện gian lận GPS ($>100\text{ m}$), sự kiện `GpsMismatchEvent` tự động kích hoạt thông báo đỏ khẩn cấp gửi vào Space `#hr-security-alerts`.
  - **Bản Tin Điểm Danh Sáng 09:00:** Tự động tổng hợp số lượng đi làm, đi muộn, WFH gửi vào Space `#chamcong-thongbao-chung`.
- **Tình Trạng Triển Khai:**
  - **Backend API:** `GET /api/v1/actions/quick-approve`, `/quick-reject`, `POST /admin/notifications/test-email`, `POST /admin/notifications/test-chat`, `POST /admin/notifications/daily-bulletin`, `GET /admin/notifications/logs` (100% Hoàn thành).
  - **Giao Diện UI:** Tab 7 *Google Workspace* trên Cổng quản lý kèm Bộ giả lập Google Chat Card v2 tương tác trực quan và Bảng nhật ký thông báo đa kênh.
  - **Kiểm Thử Tự Động:** 7 test cases API (`07_google_workspace_tests.robot`) + 5 test cases UI (`10_google_workspace_ui_tests.robot`) đều PASS 100%.

---

## 3. HỆ THỐNG KIỂM THỬ TỰ ĐỘNG HOÁ (ROBOT FRAMEWORK SUITE - 119 TESTS)

Dự án sở hữu kho lưu trữ kiểm thử độc lập [`SmartTimeChecking-AutomationTest`](file:///Users/sang/Projects/App/SmartTimeChecking/SmartTimeChecking-AutomationTest), chạy tự động hoàn toàn qua script `./run_tests.sh all`.

### Bảng Thống Kê Kết Quả Thực Thi Thực Tế:
| Nhóm Kiểm Thử | Số Lượng Suite | Số Test Cases | Đạt (Passed) | Thất Bại (Failed) | Tỷ Lệ Đạt |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **01_api/ (Kiểm thử API RESTful)** | 7 Suites | 58 | 58 | 0 | **100%** |
| **02_ui/ (Kiểm thử Giao diện Người dùng UI)** | 10 Suites | 53 | 53 | 0 | **100%** |
| **03_flow/ (Kiểm thử Nghiệp vụ Vòng đời E2E)** | 1 Suite | 8 | 8 | 0 | **100%** |
| **TỔNG CỘNG** | **18 Suites** | **119** | **119** | **0** | **100%** |

- **Báo cáo HTML tổng hợp:** [`report.html`](file:///Users/sang/Projects/App/SmartTimeChecking/SmartTimeChecking-AutomationTest/reports/report.html)
- **Nhật ký chi tiết từng bước:** [`log.html`](file:///Users/sang/Projects/App/SmartTimeChecking/SmartTimeChecking-AutomationTest/reports/log.html)

---

## 4. ĐÁNH GIÁ KHOẢNG TRỐNG (GAP ANALYSIS), HẠN CHẾ & ĐIỂM CẦN CẢI THIỆN

Qua quá trình rà soát toàn diện mã nguồn và vận hành thực tế, dưới đây là các hạn chế kỹ thuật và nghiệp vụ cần được tối ưu trong giai đoạn tiếp theo:

### 4.1 Về Hiệu Năng & Khả Năng Mở Rộng (Performance & Scalability)
1. **Phân Vùng Dữ Liệu Chấm Công (Table Partitioning):**
   - *Hiện trạng:* Bảng `attendance_punches` đang lưu trữ tuyến tính trong một bảng duy nhất.
   - *Hạn chế:* Với doanh nghiệp quy mô 1.000 - 5.000 nhân sự chấm công 2 - 4 lần/ngày, sau 1 - 2 năm bảng này sẽ vượt ngưỡng hàng chục triệu bản ghi, gây suy giảm tốc độ truy vấn lịch sử.
   - *Điểm cần cải thiện:* Cấu hình PostgreSQL Table Partitioning theo tháng (`PARTITION BY RANGE (punch_time)`).
2. **Cơ Chế Caching Nâng Cao Cho Bảng Công Lịch:**
   - *Hiện trạng:* Endpoint `/api/v1/timesheets/calendar` tính toán động từ các bản ghi dập thẻ và đơn từ mỗi khi người dùng truy vấn.
   - *Hạn chế:* Tải lặp lại nhiều lần trong tháng có thể làm tăng tải CPU của Database.
   - *Điểm cần cải thiện:* Áp dụng Redis Caching cho các ngày công trong quá khứ (vì ngày đã qua không còn thay đổi dữ liệu trừ khi có đơn khiếu nại).

### 4.2 Về Bảo Mật & Xác Thực Nâng Cao (Security & Fraud Prevention)
1. **Nhận Diện Khuôn Mặt Chống Giả Mạo (Face Liveness Detection):**
   - *Hiện trạng:* Chấm công khẩn cấp hiện tại mới lưu ảnh selfie bối cảnh và tọa độ GPS, việc kiểm tra tính hợp lệ phụ thuộc vào người quản lý xem ảnh.
   - *Hạn chế:* Nhân viên có thể chụp lại ảnh in sẵn hoặc ảnh trên màn hình điện thoại khác (Photo replay).
   - *Điểm cần cải thiện:* Tích hợp Face AI Engine (On-device hoặc qua AI Service) kiểm tra chuyển động nháy mắt/quay đầu (Liveness Detection) trước khi cho phép gửi đơn khẩn cấp.
2. **Xác Thực Đa Yếu Tố (MFA / TOTP) Cho Tài Khoản Quản Lý:**
   - *Hiện trạng:* Tài khoản Quản lý và HR Admin hiện đăng nhập bằng Email/Password hoặc Token JWT.
   - *Điểm cần cải thiện:* Cần bổ sung xác thực 2 bước (Google Authenticator / OTP) khi thao tác các hành vi nhạy cảm như *Khóa sổ bảng lương* hoặc *Thu hồi thiết bị*.

### 4.3 Về Trải Nghiệm Ứng Dụng Di Động (Mobile Experience)
1. **PWA (Progressive Web App) & Ứng Dụng Di Động Native:**
   - *Hiện trạng:* Hệ thống đang vận hành hoàn hảo trên nền tảng Web Responsive (Safari, Chrome trên điện thoại có thể bật camera quét QR mượt mà).
   - *Hạn chế:* Chưa hỗ trợ chạy nền ngầm (Background Geofencing) để tự động nhắc nhở nhân viên chấm công khi vừa bước vào vùng Wi-Fi văn phòng.
   - *Điểm cần cải thiện:* Đóng gói PWA hoặc phát triển ứng dụng di động React Native/Flutter để tận dụng tối đa cảm biến sinh trắc học vân tay/FaceID trên điện thoại.

---

## 5. ĐỀ XUẤT TÍNH NĂNG MỚI & KẾ HOẠCH LỘ TRÌNH PHÁT TRIỂN (PRODUCT ROADMAP)

Dưới đây là kế hoạch phân kỳ phát triển (Roadmap) nhằm đưa SmartTimeChecking trở thành nền tảng quản trị nhân sự toàn diện hàng đầu:

```mermaid
flowchart LR
    Phase1["PHASE 1 (ĐÃ XONG)\nCore Attendance\nDynamic QR 5s\nPolicy Quotas\nLocking SHA-256"]
    Phase2["PHASE 2 (ĐÃ XONG)\nGoogle Workspace\nGmail 1-Click\nChat Cards v2\nExecutive Dashboard\nFull CRUD Master Data"]
    Phase3["PHASE 3 (KẾ HOẠCH)\nAI Face Biometrics\nPWA Mobile App\nPhân ca kíp thông minh\nQuản lý OT 150%-300%"]
    Phase4["PHASE 4 (TƯƠNG LAI)\nPayroll Tính lương tự động\nĐồng bộ MISA / SAP\nAI Dự báo biến động nhân sự"]

    Phase1 --> Phase2
    Phase2 --> Phase3
    Phase3 --> Phase4
```

### Chi Tiết Kế Hoạch Phase 3: Nâng Tầm Thông Minh & Tự Động Hóa Vận Hành
1. **Quản Lý Làm Thêm Giờ (Overtime - OT) Tự Động:**
   - Hỗ trợ đơn đăng ký OT trước ca làm việc.
   - Tự động phân loại hệ số công lương theo Bộ luật Lao động Việt Nam:
     - Ngày làm việc thường: $150\%$
     - Ngày nghỉ hàng tuần (Thứ Bảy, Chủ Nhật): $200\%$
     - Ngày nghỉ lễ, Tết hưởng nguyên lương: $300\%$
   - Kiểm soát trần giờ làm thêm (không quá 40 giờ/tháng và 200 giờ/năm).
2. **Xếp Ca Kíp Tự Động Thông Minh (Shift Roster Scheduling):**
   - Hỗ trợ doanh nghiệp sản xuất, bán lẻ hoặc trực 24/7 với mô hình xoay ca (Ca Sáng, Ca Chiều, Ca Đêm).
   - Tự động cảnh báo vi phạm quy định nghỉ giữa 2 ca liên tiếp (tối thiểu 12 tiếng).
   - Cho phép nhân viên đổi ca làm việc (Shift Swap) trực tiếp với đồng nghiệp và gửi Quản lý phê duyệt.
3. **Sinh Trắc Học AI Nhận Diện Khuôn Mặt Trên Camera Web/App:**
   - Tích hợp Face AI Engine quét khuôn mặt trực tiếp ngay khi mở Camera Quét QR, đảm bảo người cầm điện thoại chính là chủ sở hữu tài khoản (Chống gian lận tuyệt đối).

### Chi Tiết Kế Hoạch Phase 4: Tích Hợp Hệ Sinh Thái Nhân Sự & Kế Toán Toàn Diện
1. **Module Tính Lương Tự Động (Automated Payroll Engine):**
   - Đọc dữ liệu từ bảng công kỳ đã khóa (`LOCKED`), tự động áp dụng biểu thuế thu nhập cá nhân (TNCN lũy tiến từng phần), trừ các khoản đóng bảo hiểm bắt buộc (BHXH 8%, BHYT 1.5%, BHTN 1%).
   - Tự động xuất phiếu lương điện tử (Payslip) gửi bảo mật tới từng nhân viên qua Gmail.
2. **Cổng Kết Nối Open API & Webhook Với Hệ Thống Kế Toán ERP:**
   - Webhook đẩy dữ liệu công lương tự động sang các phần mềm kế toán phổ biến tại Việt Nam và quốc tế (MISA AMIS, FAST, Bravo, SAP, Oracle NetSuite).

---

## TỔNG KẾT

Hệ thống **SmartTimeChecking** hiện tại đã đạt trạng thái **sẵn sàng triển khai thực tế (Production-Ready)** với đầy đủ các nghiệp vụ từ chấm công đa lớp, quản trị cơ cấu tổ chức, duyệt đơn từ thông minh, kiểm soát bảng công bất biến đến tích hợp đa kênh Google Workspace. Việc bổ sung bộ kiểm thử 119 kịch bản tự động hoá là bảo chứng vững chắc cho độ tin cậy và tính ổn định của toàn bộ giải pháp.

