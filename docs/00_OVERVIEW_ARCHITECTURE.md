# TÀI LIỆU 00: TỔNG QUAN KIẾN TRÚC & GIẢI PHÁP HỆ THỐNG
## Hệ thống Chấm công Online & Quản lý Đơn từ Nội bộ (Smart Attendance & Leave Management)

---

## 1. MỤC TIÊU HỆ THỐNG
1. **Xác thực vị trí thực tế & Chống gian lận:** Đảm bảo nhân viên có mặt tại văn phòng bằng phương thức xác thực đa lớp (Dynamic QR Code + Wi-Fi Public IP + Device Binding), loại bỏ triệt để hành vi chấm công hộ, giả lập vị trí.
2. **Linh hoạt & Dự phòng:** Cung cấp cơ chế chấm công dự phòng (Selfie khẩn cấp) khi mất điện/mất mạng và cơ chế chấm công linh hoạt cho nhân viên làm việc từ xa (WFH) khi có đơn được duyệt.
3. **Quản lý Đơn từ & Hạn ngạch (Quota) chặt chẽ:** Tự động kiểm soát các loại đơn (đi muộn/về sớm, quên chấm công, nghỉ phép, nghỉ BHXH, WFH) theo từng loại hợp đồng và phòng ban.
4. **Độ tin cậy & Tính toàn vẹn dữ liệu lương:** Dữ liệu chấm công đi thẳng vào bảng lương; quy trình chốt công 4 bước, khóa dữ liệu bất biến và xử lý hồi tố kỳ sau (không sửa ngược kỳ đã khóa).

---

## 2. KIẾN TRÚC HỆ THỐNG TỔNG THỂ (SYSTEM ARCHITECTURE)

```mermaid
flowchart TB
    subgraph Office["Tại Văn phòng"]
        Kiosk["Laptop / Kiosk Display\n(Web Dynamic QR)"]
        Wifi["Wi-Fi / Router Công ty\n(Public IP Whitelist)"]
    end

    subgraph Client["Thiết bị Nhân viên"]
        EmpMobile["Điện thoại cá nhân\n(PWA / Web Mobile)"]
        EmpLaptop["Laptop cá nhân\n(Web Browser)"]
    end

    subgraph Gateway["API Gateway & Reverse Proxy"]
        Nginx["Nginx / Cloudflare\n(SSL, Rate Limit, Header Guard)"]
    end

    subgraph Backend["Backend Application (Java Spring Boot 3)"]
        WS["WebSocket Service\n(Dynamic QR Pusher)"]
        AuthSvc["Auth & Security\n(Spring Security + JWT)"]
        PunchSvc["Attendance Engine\n(IP / Device / OTP Verification)"]
        RequestSvc["Request & Approval Engine\n(Workflow, Quota Validation)"]
        PolicySvc["Policy & Rule Engine\n(Shifts, Versioned Rules)"]
        TimesheetSvc["Timesheet & Payroll Engine\n(Daily Aggregate, Locking, Retroactive)"]
    end

    subgraph Storage["Data & Caching Layer"]
        Redis[("Redis In-Memory\n- Dynamic QR OTP (TTL 5-10s)\n- Rate Limits, Sessions")]
        Postgres[("PostgreSQL 16+\n- Master Relational DB\n- Timesheet, Policies, Requests")]
        S3[("Object Storage (S3 / MinIO)\n- Selfie & Medical Attachments")]
    end

    Kiosk <-->|WebSocket STOMP| WS
    EmpMobile -.->|Kết nối qua Wi-Fi| Wifi
    EmpMobile -->|HTTPS REST API| Nginx
    EmpLaptop -->|HTTPS REST API| Nginx
    Wifi -->|Gửi kèm Public IP| Nginx

    Nginx --> Backend
    Backend --> Redis
    Backend --> Postgres
    Backend --> S3
```

---

## 3. CÔNG NGHỆ ÁP DỤNG (TECH STACK)

| Thành phần | Công nghệ lựa chọn | Lý do lựa chọn |
| :--- | :--- | :--- |
| **Backend Framework** | **Java 21 LTS + Spring Boot 3.3+** | Chuẩn doanh nghiệp, bảo mật cao, hỗ trợ transaction toàn vẹn cho bảng lương. |
| **Bảo mật & Phân quyền** | **Spring Security 6 + JJWT / Nimbus** | Phân quyền RBAC đa cấp (Employee, Team Lead, Dept Head, HR, Admin). |
| **Giao tiếp Real-time** | **Spring WebSocket + STOMP** | Đồng bộ mã Dynamic QR xuống màn hình hiển thị mỗi 5–7 giây. |
| **In-Memory Cache** | **Redis 7.x** | Quản lý mã OTP quét QR (TTL ngắn), kiểm tra atomic `GETDEL` chống Replay Attack. |
| **Cơ sở dữ liệu chính** | **PostgreSQL 16+** | Hỗ trợ JSONB cho cấu hình luật linh hoạt, transaction an toàn (ACID), hiệu năng cao. |
| **Lưu trữ tệp tin** | **Amazon S3 / MinIO** | Lưu trữ ảnh chụp selfie dự phòng, giấy khám ốm đau BHXH mẫu C65-HD. |
| **Frontend Web/PWA** | **Next.js 14 / React + TailwindCSS** | Giao diện Responsive cho cả Desktop (HR) và Mobile (Nhân viên), hỗ trợ PWA offline-first shell. |
| **Thư viện Web Camera/QR** | **html5-qrcode / @zxing/library** | Quét trực tiếp từ luồng Camera trình duyệt, chặn hành vi chọn file ảnh tải lên. |
| **Định danh thiết bị** | **FingerprintJS Pro / Native Web Crypto Token** | Kết hợp Hardware Fingerprint + UUID lưu an toàn tại IndexedDB để chống đổi máy. |

---

## 4. CHIẾN LƯỢC BẢO MẬT & XÁC THỰC ĐA LỚP (MULTI-FACTOR CHECK-IN)

```mermaid
flowchart TD
    Start([Nhân viên bấm Chấm công]) --> CheckLogin{Đã xác thực JWT?}
    CheckLogin -- Không --> Deny[Từ chối: Chưa đăng nhập]
    CheckLogin -- Có --> CheckDev{Khớp Device ID đã đăng ký?}
    
    CheckDev -- Không --> DenyDev[Từ chối: Thiết bị lạ chưa được duyệt]
    CheckDev -- Có --> CheckWFH{Hôm nay có đơn WFH\nđược duyệt không?}
    
    CheckWFH -- Có (WFH) --> AllowExternal[Cho phép chấm công ngoài mạng]
    AllowExternal --> VerifyWFH[Xác nhận chấm công WFH thành công\nGắn cờ IS_WFH = TRUE]
    
    CheckWFH -- Không (Tại VP) --> CheckNet{IP Public thuộc dải IP văn phòng?}
    CheckNet -- Không --> DenyNet[Từ chối: Bạn không kết nối Wi-Fi văn phòng]
    CheckNet -- Có --> ScanQR[Mở Camera quét Dynamic QR]
    
    ScanQR --> CheckQR{Mã QR còn hiệu lực\ntrên Redis & đúng VP?}
    CheckQR -- Không --> DenyQR[Từ chối: Mã QR đã hết hạn / không hợp lệ]
    CheckQR -- Có --> DelQR[Redis GETDEL: Hủy mã vừa quét]
    
    DelQR --> Success([Chấm công thành công\nGhi nhận vào Timesheet])
```

---

## 5. BỘ TÀI LIỆU ĐẶC TẢ CHI TIẾT ĐÍNH KÈM
Hệ thống được bóc tách thành các tài liệu chi tiết chuyên sâu:
* **[Tài liệu 01: Phân hệ Ghi nhận Chấm công & Chống gian lận](file:///Users/sang/.gemini/antigravity/brain/e77846b6-07ff-4ad4-b626-aa4ca40da8e8/01_MODULE_ATTENDANCE_CHECKIN.md)**
* **[Tài liệu 02: Phân hệ Quản lý Đơn từ, Nghỉ phép & WFH](file:///Users/sang/.gemini/antigravity/brain/e77846b6-07ff-4ad4-b626-aa4ca40da8e8/02_MODULE_REQUESTS_LEAVE_WFH.md)**
* **[Tài liệu 03: Phân hệ Cấu hình Luật, Ca làm việc & Hạn ngạch](file:///Users/sang/.gemini/antigravity/brain/e77846b6-07ff-4ad4-b626-aa4ca40da8e8/03_MODULE_POLICY_RULE_ENGINE.md)**
* **[Tài liệu 04: Phân hệ Tổng hợp, Chốt công, Khiếu nại & Hồi tố](file:///Users/sang/.gemini/antigravity/brain/e77846b6-07ff-4ad4-b626-aa4ca40da8e8/04_MODULE_TIMESHEET_PAYROLL_CLOSING.md)**
* **[Tài liệu 05: Thiết kế Cơ sở Dữ liệu Chi tiết (Database Schema)](file:///Users/sang/.gemini/antigravity/brain/e77846b6-07ff-4ad4-b626-aa4ca40da8e8/05_DATABASE_SCHEMA_DESIGN.md)**
