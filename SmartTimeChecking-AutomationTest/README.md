# SMART TIME CHECKING - AUTOMATION TEST REPOSITORY
## HỆ THỐNG KIỂM THỬ TỰ ĐỘNG HOÁ TOÀN DIỆN VỚI ROBOT FRAMEWORK
*(API RESTful • UI End-to-End • Business Lifecycle Flow • Security & Policy Rules)*

---

## 1. GIỚI THIỆU
Repository này là kho mã nguồn kiểm thử tự động độc lập dành riêng cho dự án **SmartTimeChecking**. Hệ thống áp dụng **Robot Framework** kết hợp thư viện khách hàng Python chuyên biệt (`SmartTimeApiClient` và `SmartTimeUiClient` bằng Playwright Headless Chromium) để mô phỏng 100% hành vi của người dùng thật từ nhân viên, trưởng nhóm, đến nhân sự cấp cao (HR Admin/CEO).

---

## 2. CẤU TRÚC REPOSITORY

```
SmartTimeChecking-AutomationTest/
├── config/
│   └── env_config.robot             # URL môi trường, timeout, tọa độ GPS văn phòng
├── resources/
│   ├── libraries/
│   │   ├── SmartTimeApiClient.py    # Thư viện API client HTTP chuẩn hoá
│   │   └── SmartTimeUiClient.py     # Thư viện UI client Playwright Headless
│   └── variables/
│       └── test_data.robot          # Dữ liệu tài khoản, token máy, ID kỳ công
├── tests/
│   ├── 01_api/                      # 7 Bộ kiểm thử API RESTful (30 Test Cases)
│   │   ├── 01_auth_tests.robot
│   │   ├── 02_kiosk_qr_tests.robot
│   │   ├── 03_attendance_tests.robot
│   │   ├── 04_requests_quotas_tests.robot
│   │   ├── 05_timesheet_payroll_tests.robot
│   │   ├── 06_admin_master_tests.robot
│   │   └── 07_google_workspace_tests.robot
│   ├── 02_ui/                       # 4 Bộ kiểm thử Giao diện & Hành vi UI
│   │   ├── 01_kiosk_ui_tests.robot
│   │   ├── 02_employee_e2e_tests.robot
│   │   ├── 03_manager_e2e_tests.robot
│   │   └── 04_security_guard_tests.robot
│   └── 03_flow/                     # Vòng đời nghiệp vụ toàn trình 10 bước
│       └── test_e2e_business_lifecycle.robot
├── reports/                         # Chứa output.xml, log.html, report.html
├── run_tests.sh                     # Script chạy nhanh các bộ kiểm thử
├── requirements.txt                 # Danh mục thư viện Python
└── README.md                        # Hướng dẫn chi tiết
```

---

## 3. HƯỚNG DẪN THỰC THI KIỂM THỬ

### 3.1 Điều kiện tiên quyết
- Backend Spring Boot đang chạy tại: `http://localhost:8085`
- Frontend Vite đang chạy tại: `http://localhost:3000`

### 3.2 Các lệnh thực thi nhanh qua Script Runner

```bash
# 1. Chạy toàn bộ các kịch bản kiểm thử (API + UI + E2E Flow)
./run_tests.sh all

# 2. Chỉ chạy bộ kiểm thử API RESTful
./run_tests.sh api

# 3. Chỉ chạy bộ kiểm thử Giao diện người dùng UI
./run_tests.sh ui

# 4. Chỉ chạy kịch bản Vòng đời toàn trình (Business Lifecycle)
./run_tests.sh flow

# 5. Chạy nhanh các test case quan trọng nhất (Smoke Tests)
./run_tests.sh smoke
```

---

## 4. XEM BÁO CÁO KẾT QUẢ
Sau khi chạy xong, kết quả được xuất tự động dạng trực quan tại thư mục `reports/`:
- **Báo cáo tổng hợp:** `reports/report.html` (Mở trực tiếp trên trình duyệt để xem biểu đồ Pass/Fail, thời gian thực thi, thống kê tags).
- **Nhật ký chi tiết:** `reports/log.html` (Xem từng bước request/response payload, mã lỗi, so sánh giá trị).

