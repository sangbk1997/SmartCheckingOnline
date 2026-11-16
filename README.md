# SmartTimeChecking - Hệ thống Chấm công & Quản lý Đơn từ Nội bộ

Hệ thống chấm công online đa nền tảng (Web / PWA) ứng dụng mô hình xác thực đa lớp (Dynamic QR Code, Network Public IP Whitelist, Device Binding) và cơ chế chống gian lận cho doanh nghiệp.

---

## 🌐 ĐỊA CHỈ TRUY CẬP ỨNG DỤNG (LIVE LOCAL)

* **Giao diện Website (ReactJS + TailwindCSS):** **`http://localhost:3000`**
  * **Trang chủ / Landing Page:** Giới thiệu tổng quan hệ thống, thống kê trực tiếp.
  * **Màn hình Kiosk Dynamic QR (Toàn màn hình):** Tự động đổi mã QR mỗi 5 giây, đếm ngược tròn, hiệu ứng pháo hoa Confetti và thông điệp chào mừng khi nhân viên check-in/out thành công.
  * **Không gian Nhân viên (Mobile & Desktop):** Chấm công QR, Chấm công khẩn cấp bằng ảnh Selfie kèm GPS, Quản lý Quota (Đi muộn X/2, WFH Y/4, Phép năm Z ngày), tạo đơn từ.
  * **Không gian Quản lý / HR:** Live Team Dashboard (theo dõi ai có mặt, ai WFH, ai đi muộn), Duyệt đơn từ, Duyệt chấm công khẩn cấp có cảnh báo khoảng cách GPS lệch.
  * **Chuyển nhanh vai trò (Role Switcher):** Chuyển đổi giữa Developer (`dev@congty.com`), Tech Lead (`lead@congty.com`), HR Admin (`hr@congty.com`).
* **Backend REST API & WebSocket (Spring Boot 3 + Java 21):** **`http://localhost:8085`**

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY HẠ TẦNG & ỨNG DỤNG

### 1. Khởi chạy Hạ tầng Docker (Local Infrastructure)
Hệ thống cung cấp file `docker-compose.yml` định nghĩa đầy đủ MySQL 8.0, Redis 7, RabbitMQ 3.13 và Keycloak 24:
```bash
docker compose up -d
```

### 2. Khởi chạy Backend Java
```bash
cd backend
mvn clean package -DskipTests
java -jar target/smart-time-checking-backend-1.0.0.jar
```

### 3. Khởi chạy Frontend ReactJS
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 BỘ KIỂM THỬ POSTMAN COLLECTION (TESTCASES & BIÊN)

File Postman Collection toàn diện sẵn sàng để kiểm thử:
📁 **[`SmartTimeChecking_API_Collection.postman_collection.json`](./SmartTimeChecking_API_Collection.postman_collection.json)**

### Danh mục 16 Kịch bản Kiểm thử Tự động:
1. **01. Authentication & RBAC:** Đăng nhập lấy JWT và phân quyền cho Developer, Tech Lead, HR Admin.
2. **02. Dynamic QR & Multi-Factor Punch:**
   * **[SUCCESS]** Chấm công Vào ca chuẩn (Đúng IP, Đúng Thiết bị, QR hợp lệ).
   * **[FAILED - BIÊN]** Quét lại mã QR vừa dùng $\rightarrow$ Bị chặn ngay với `ERR_QR_EXPIRED` (Chống Replay Attack).
   * **[FAILED - BẢO MẬT]** Sửa đổi chữ ký số HMAC $\rightarrow$ Bị chặn ngay với `ERR_INVALID_QR`.
   * **[FAILED - GIAN LẬN]** Chấm công bằng thiết bị chưa đăng ký $\rightarrow$ Bị chặn với `ERR_DEVICE_MISMATCH`.
3. **03. Emergency Fallback & GPS Fraud Detection:**
   * **[SUCCESS / WARNING]** Chấm công khẩn cấp Selfie với toạ độ xa văn phòng $\rightarrow$ Tự động tính khoảng cách Haversine và gắn nhãn đỏ `FLAG_LOCATION_MISMATCH`.
   * **[REVIEW]** Quản lý xem bằng chứng và duyệt ca chấm công khẩn cấp.
4. **04. Request Engine & Quota Edge Cases:**
   * **[SUCCESS]** Kiểm tra Quota còn lại theo thời gian thực.
   * **[FAILED - BIÊN]** Chặn nộp đơn đi muộn > 60 phút $\rightarrow$ `ERR_QUOTA_EXCEEDED` (kèm thông điệp thân thiện & `hrGuide`).
   * **[FAILED - BIÊN]** Chặn đơn nghỉ ốm thiếu chứng từ y tế C65 $\rightarrow$ `ERR_ATTACHMENT_REQUIRED`.
   * **[FAILED - BIÊN]** Chặn đơn bổ sung công quá 3 ngày làm việc $\rightarrow$ `ERR_DEADLINE_EXCEEDED`.
   * **[SUCCESS]** Tạo đơn WFH và Quản lý phê duyệt thành công.
5. **05. Live Dashboard & Timesheet:** Theo dõi trạng thái hiện diện thời gian thực của cả công ty.

---

## 📚 TÀI LIỆU ĐẶC TẢ DỰ ÁN

Toàn bộ tài liệu phân tích nghiệp vụ, kiến trúc kỹ thuật và thiết kế cơ sở dữ liệu đã được lưu trữ trong thư mục [`docs/`](./docs/):

### I. Tài liệu Nghiệp vụ & Kiến trúc Hệ thống
1. **[00. Tổng quan Kiến trúc & Giải pháp Kỹ thuật](./docs/00_OVERVIEW_ARCHITECTURE.md)**
2. **[01. Phân hệ Ghi nhận Chấm công & Chống gian lận](./docs/01_MODULE_ATTENDANCE_CHECKIN.md)**
3. **[02. Phân hệ Quản lý Đơn từ, Nghỉ phép & WFH](./docs/02_MODULE_REQUESTS_LEAVE_WFH.md)**
4. **[03. Phân hệ Cấu hình Luật, Ca làm việc & Hạn ngạch](./docs/03_MODULE_POLICY_RULE_ENGINE.md)**
5. **[04. Phân hệ Tổng hợp, Chốt công & Hồi tố kỳ sau](./docs/04_MODULE_TIMESHEET_PAYROLL_CLOSING.md)**
6. **[05. Thiết kế Cơ sở Dữ liệu Chi tiết (Database Schema)](./docs/05_DATABASE_SCHEMA_DESIGN.md)**
7. **[06. Đánh giá Stack Công nghệ & Tích hợp CI/CD Doanh nghiệp](./docs/06_TECHNICAL_STACK_EVALUATION.md)**

### II. Tài liệu Thiết kế Kỹ thuật Chi tiết (`docs/technicals/`)
1. **[01. Thiết kế Cơ sở Dữ liệu Chi tiết (Data Dictionary & Schema)](./docs/technicals/01_DATABASE_DESIGN_SPECIFICATION.md)**
2. **[02. Thiết kế Toàn bộ API Endpoints & Cơ chế Flow Nghiệp vụ](./docs/technicals/02_API_SPECIFICATION_AND_FLOWS.md)**
3. **[03. Kế hoạch Triển khai theo Giai đoạn (Roadmap & Phasing)](./docs/technicals/03_IMPLEMENTATION_ROADMAP_AND_PHASING.md)**
