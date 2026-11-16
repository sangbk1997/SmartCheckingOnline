# TÀI LIỆU KỸ THUẬT 02: THIẾT KẾ TOÀN BỘ API ENDPOINTS & FLOW NGHIỆP VỤ
## Chuẩn thiết kế: RESTful API (JSON) + WebSocket STOMP + OAuth2 Keycloak JWT
Thư mục: `docs/technicals/02_API_SPECIFICATION_AND_FLOWS.md`

---

## 1. TIÊU CHUẨN THIẾT KẾ API
* **Base URL:** `https://api.chamcong.congty.com/api/v1`
* **Xác thực:** Header `Authorization: Bearer <Keycloak_Access_Token>`
* **Mã định dạng trả về chuẩn (Standard Response Envelope):**
  ```json
  {
    "success": true,
    "code": "SUCCESS",
    "message": "Thao tác thành công",
    "data": {},
    "timestamp": "2026-05-15T08:30:00Z"
  }
  ```
* **Mã lỗi chuẩn khi có sự cố:**
  ```json
  {
    "success": false,
    "code": "ERR_INVALID_NETWORK",
    "message": "Vui lòng kết nối vào mạng Wi-Fi công ty để thực hiện chấm công.",
    "errors": [],
    "timestamp": "2026-05-15T08:30:00Z"
  }
  ```

---

## 2. DANH MỤC API ENDPOINTS CHI TIẾT THEO MODULE

### Module A: Xác thực & Khóa Thiết bị (Auth & Device Binding)

| Method | Endpoint | Quyền (Role) | Mô tả nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `GET` | `/auth/me` | All Authenticated | Lấy profile nhân viên, phòng ban, thông tin sếp trực tiếp và vai trò trong app |
| `POST`| `/devices/enroll` | All Authenticated | Đăng ký thiết bị chấm công lần đầu (gửi Fingerprint + Device Name) |
| `GET` | `/devices/my-device` | All Authenticated | Kiểm tra trạng thái thiết bị của nhân viên hiện tại (`ACTIVE`, `REVOKED`) |
| `POST`| `/devices/request-change` | All Authenticated | Gửi yêu cầu đổi thiết bị mới cho HR duyệt (khi mua máy mới) |
| `GET` | `/admin/devices/pending` | `HR_ADMIN` | Danh sách yêu cầu đổi/cấp thiết bị đang chờ duyệt |
| `POST`| `/admin/devices/{id}/approve` | `HR_ADMIN` | Duyệt kích hoạt thiết bị mới, hủy thiết bị cũ |

---

### Module B: Ghi nhận Chấm công (Attendance & Kiosk)

| Method | Endpoint | Quyền (Role) | Mô tả nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `WS` | `/ws/kiosk/qr` | Kiosk Client | WebSocket định kỳ nhận payload Dynamic QR code (5 giây/lần) |
| `POST`| `/attendance/punch` | All Authenticated | **Chấm công chính:** Gửi mã QR quét được + `deviceToken` + kiểm tra IP |
| `POST`| `/attendance/punch-emergency` | All Authenticated | **Chấm công dự phòng:** Multipart/form-data upload ảnh selfie, GPS, lý do |
| `GET` | `/attendance/today` | All Authenticated | Lấy lịch sử các lần chấm công trong ngày của bản thân |
| `GET` | `/attendance/history` | All Authenticated | Lấy lịch sử chấm công theo khoảng ngày (from_date, to_date) |
| `GET` | `/admin/attendance/emergency-pending` | `MANAGER`, `HR_ADMIN` | Danh sách các ca chấm công selfie khẩn cấp cần phê duyệt |
| `POST`| `/admin/attendance/emergency/{id}/review` | `MANAGER`, `HR_ADMIN` | Duyệt / Từ chối ca chấm công khẩn cấp |

#### Chi tiết Payload: `POST /api/v1/attendance/punch`
```json
// Request Body
{
  "qrPayload": "OFFICE_HQ_FLOOR_2|1731514800|a1b2c3d4-e5f6-7890-abcd-ef1234567890|SIGNATURE_HASH",
  "deviceToken": "FP_abc123_SECURE_UUID_xyz789",
  "punchType": "IN" // "IN" hoặc "OUT"
}

// Response Body (200 OK)
{
  "success": true,
  "code": "PUNCH_SUCCESS",
  "message": "Chấm công vào ca thành công lúc 08:28:15",
  "data": {
    "punchId": "c8d4e5f6-...",
    "punchTime": "2026-05-15T08:28:15Z",
    "punchType": "IN",
    "method": "DYNAMIC_QR",
    "employeeName": "Nguyễn Văn A"
  }
}
```

---

### Module C: Quản lý Đơn từ & Phê duyệt (Requests & Approvals)

| Method | Endpoint | Quyền (Role) | Mô tả nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `GET` | `/requests/quotas/remaining` | All Authenticated | Lấy số lượt đi muộn còn lại, số ngày WFH còn lại trong tháng của cá nhân |
| `POST`| `/requests` | All Authenticated | Tạo đơn mới (Đi muộn/sớm, Bổ sung công, WFH, Phép năm, Nghỉ BHXH...) |
| `GET` | `/requests/my-requests` | All Authenticated | Danh sách đơn cá nhân đã gửi (lọc theo trạng thái, loại đơn) |
| `DELETE`| `/requests/{id}` | All Authenticated | Hủy đơn đang ở trạng thái `PENDING` |
| `GET` | `/requests/pending-approvals` | `MANAGER`, `HR_ADMIN` | Danh sách đơn của cấp dưới đang chờ mình phê duyệt |
| `POST`| `/requests/{id}/approve` | `MANAGER`, `HR_ADMIN` | Phê duyệt đơn (tự động cập nhật công hoặc chuyển HR bước 2) |
| `POST`| `/requests/{id}/reject` | `MANAGER`, `HR_ADMIN` | Từ chối đơn (bắt buộc truyền `reason`) |
| `POST`| `/requests/{id}/eod-report` | All Authenticated | Nộp báo cáo tóm tắt công việc cuối ngày cho ngày WFH |

#### Chi tiết Payload: `POST /api/v1/requests` (Tạo Đơn Đi muộn)
```json
// Request Body
{
  "requestType": "LATE_IN",
  "fromDate": "2026-05-18",
  "toDate": "2026-05-18",
  "durationMinutes": 45,
  "reason": "Xe bị hỏng giữa đường, vào muộn 45 phút"
}
```

---

### Module D: Giám sát Trực tiếp & Lịch nhóm (Live Monitoring & Calendar)

| Method | Endpoint | Quyền (Role) | Mô tả nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `GET` | `/team/live-dashboard` | `MANAGER`, `HR_ADMIN` | Trạng thái thời gian thực hôm nay của team: Ai có mặt, WFH, Nghỉ phép, Đi muộn |
| `GET` | `/team/calendar` | `MANAGER`, `HR_ADMIN` | Lịch trình vắng mặt/WFH dạng ma trận tuần/tháng của toàn bộ thành viên trong đội |

---

### Module E: Cấu hình Luật, Ca làm việc & Phòng ban (Admin & HR)

| Method | Endpoint | Quyền (Role) | Mô tả nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `GET/POST` | `/admin/departments` | `HR_ADMIN` | Quản lý cây phòng ban đa cấp, bổ nhiệm trưởng phòng |
| `GET/POST` | `/admin/employees` | `HR_ADMIN` | Quản lý hồ sơ nhân viên, loại hợp đồng, sếp trực tiếp |
| `GET/POST` | `/admin/shifts` | `HR_ADMIN` | Quản lý danh mục ca làm việc (cố định, linh hoạt, ca gãy) |
| `POST` | `/admin/shifts/assign` | `HR_ADMIN` | Gán ca làm việc cho phòng ban hoặc nhân viên cụ thể |
| `GET/POST` | `/admin/holidays` | `HR_ADMIN` | Quản lý danh mục ngày nghỉ lễ, ngày nghỉ bù hằng năm |
| `GET/POST` | `/admin/policies` | `HR_ADMIN` | Cấu hình quy tắc hạn ngạch có ngày hiệu lực (`effective_from`) |

---

### Module F: Bảng công, Khiếu nại 48h & Chốt kỳ lương (Timesheet & Closing)

| Method | Endpoint | Quyền (Role) | Mô tả nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `GET` | `/timesheets/my-timesheet` | All Authenticated | Xem bảng công chi tiết cá nhân theo tháng (kèm trạng thái mở/khóa) |
| `POST`| `/timesheets/disputes` | All Authenticated | Gửi khiếu nại công trong khung 48h sau khi hết kỳ công |
| `GET` | `/admin/timesheets/periods` | `HR_ADMIN` | Quản lý danh sách các kỳ công tháng (Open, Aggregated, Locked) |
| `POST`| `/admin/timesheets/periods/{id}/aggregate` | `HR_ADMIN` | Kích hoạt tính toán/tổng hợp lại bảng công tháng |
| `GET` | `/admin/timesheets/periods/{id}/disputes` | `HR_ADMIN` | Danh sách khiếu nại của nhân viên cần xử lý |
| `POST`| `/admin/timesheets/disputes/{id}/resolve`| `HR_ADMIN` | Xử lý khiếu nại: Chấp nhận sửa công hoặc Bác bỏ |
| `POST`| `/admin/timesheets/periods/{id}/lock` | `HR_ADMIN` | **Khóa bất biến kỳ công** (Chuyển bảng công sang `LOCKED`) |
| `GET` | `/admin/timesheets/periods/{id}/export` | `HR_ADMIN` | Xuất file Excel bảng công chuẩn gửi phòng Kế toán tính lương |

---

## 3. CƠ CHẾ FLOW NGHIỆP VỤ (SEQUENCE FLOW DIAGRAMS)

### Flow 1: Chu kỳ Sinh & Đồng bộ Dynamic QR Code qua WebSocket

```mermaid
sequenceDiagram
    autonumber
    participant Kiosk as Màn hình Kiosk (Laptop/TV)
    participant WS as WebSocket Service (Java)
    participant Redis as Redis Cache
    
    Kiosk->>WS: Kết nối STOMP WebSocket: /ws/kiosk/qr
    Note over WS: Định kỳ mỗi 5 giây (@Scheduled)
    loop Mỗi 5 giây
        WS->>WS: Tạo nonce (UUID), timestamp, screenId
        WS->>WS: Ký HMAC-SHA256(screenId + timestamp + nonce, SECRET)
        WS->>Redis: SETEX "QR:" + nonce, TTL = 8s, value = screenId
        WS-->>Kiosk: Gửi payload JSON qua WebSocket
        Kiosk->>Kiosk: Render lại mã QR mới trên màn hình
    end
```

---

### Flow 2: Chấm công Chuẩn (Multi-Factor Verification: Dynamic QR + IP + Device)

```mermaid
sequenceDiagram
    autonumber
    actor Emp as Nhân viên (Mobile Web)
    participant Nginx as API Gateway / Nginx
    participant App as Backend Punch Controller
    participant Redis as Redis Cache
    participant DB as MySQL DB
    participant MQ as RabbitMQ
    participant Kiosk as Màn hình Kiosk TV

    Emp->>Nginx: Quét QR & POST /api/v1/attendance/punch (kèm JWT, deviceToken, qrPayload)
    Nginx->>App: Forward request (kèm Header X-Forwarded-For)
    
    App->>App: 1. Kiểm tra JWT & lấy User ID
    App->>DB: 2. Kiểm tra Device Binding (deviceToken khớp với CSDL?)
    alt Thiết bị không khớp
        App-->>Emp: 403 Forbidden: ERR_DEVICE_MISMATCH
    end
    
    App->>App: 3. Kiểm tra Client IP có thuộc dải IP văn phòng?
    alt Không thuộc IP văn phòng
        App->>DB: Kiểm tra xem hôm nay có Đơn WFH được duyệt không?
        alt Không có đơn WFH
            App-->>Emp: 403 Forbidden: ERR_INVALID_NETWORK
        end
    end
    
    App->>Redis: 4. Redis GETDEL "QR:" + nonce
    alt Mã QR không tồn tại hoặc đã hết hạn
        App-->>Emp: 400 Bad Request: ERR_QR_EXPIRED
    end

    App->>DB: 5. Ghi nhận chấm công vào bảng attendance_punches (status=VALID)
    App->>MQ: 6. Publish Event: AttendancePunchedEvent
    
    par Xử lý bất đồng bộ qua RabbitMQ
        MQ--)Kiosk: Cập nhật WebSocket màn hình TV: "Chào [Tên NV]"
        MQ--)App: Ghi audit log & cập nhật Redis Live Presence Dashboard
    end

    App-->>Emp: 200 OK: Chấm công thành công!
```

---

### Flow 3: Chấm công Khẩn cấp (Emergency Fallback khi mất điện/mất mạng)

```mermaid
sequenceDiagram
    autonumber
    actor Emp as Nhân viên (4G)
    participant App as Backend Punch Controller
    participant S3 as Storage (S3 / MinIO)
    participant DB as MySQL DB
    participant MQ as RabbitMQ
    actor Lead as Quản lý trực tiếp

    Emp->>App: POST /api/v1/attendance/punch-emergency (Selfie image, GPS, reason="Mất điện")
    App->>App: Tính khoảng cách GPS với toạ độ toà nhà văn phòng
    alt Khoảng cách > 200 mét
        App->>App: Đánh dấu cờ cảnh báo FLAG_LOCATION_MISMATCH
    end
    
    App->>S3: Upload ảnh Selfie đóng dấu chìm (Watermark)
    App->>DB: Lưu vào attendance_punches với STATUS = PENDING_APPROVAL
    App->>MQ: Bắn event thông báo: EmergencyPunchSubmittedEvent
    MQ--)Lead: Bắn Push Notification / Email cho Quản lý
    App-->>Emp: 200 OK: Đã gửi yêu cầu chấm công khẩn cấp, chờ sếp duyệt

    Lead->>App: GET /api/v1/admin/attendance/emergency-pending
    Lead->>Lead: Xem ảnh selfie + vị trí bản đồ + lý do
    Lead->>App: POST /api/v1/admin/attendance/emergency/{id}/review (action="APPROVE")
    App->>DB: Cập nhật STATUS = VALID, hạch toán vào bảng công
    App-->>Emp: Thông báo: Yêu cầu chấm công khẩn cấp đã được duyệt
```

---

### Flow 4: Kiểm soát Hạn ngạch (Quota) khi Tạo đơn & Phê duyệt Đa cấp

```mermaid
sequenceDiagram
    autonumber
    actor Emp as Nhân viên
    participant App as Backend Request Controller
    participant DB as MySQL DB
    actor Lead as Quản lý trực tiếp
    actor HR as HR Admin

    Emp->>App: Mở form tạo đơn (GET /api/v1/requests/quotas/remaining)
    App->>DB: Đếm số đơn đã dùng trong tháng & so sánh bảng policy_rules
    App-->>Emp: Trả về: Còn 1 lượt đi muộn, 2 ngày WFH
    
    Emp->>App: POST /api/v1/requests (Tạo đơn Nghỉ ốm hưởng BHXH kèm file C65)
    App->>App: Validate: Bắt buộc có file đính kèm với đơn ốm
    App->>DB: Lưu attendance_requests (status='PENDING', step=1)
    
    App-->>Lead: Gửi thông báo: Có đơn mới cần duyệt
    Lead->>App: POST /api/v1/requests/{id}/approve (Duyệt bước 1)
    
    Note over App: Đơn ốm BHXH là loại đặc biệt cần HR duyệt chứng từ
    App->>DB: Cập nhật step=2, gửi tiếp cho HR
    App-->>HR: Gửi thông báo: Cần HR kiểm tra chứng từ y tế
    
    HR->>App: Kiểm tra file C65 & POST /api/v1/requests/{id}/approve (Duyệt cuối)
    App->>DB: Cập nhật status='APPROVED', đánh dấu mã BHXH vào bảng công
    App-->>Emp: Thông báo: Đơn của bạn đã được phê duyệt thành công
```

---

### Flow 5: Quy trình Khóa Kỳ công & Cơ chế Điều chỉnh Hồi tố kỳ sau (Retroactive)

```mermaid
sequenceDiagram
    autonumber
    actor HR as HR Admin
    participant App as Timesheet Engine (Java)
    participant DB as MySQL DB
    actor Lead as Quản lý trực tiếp
    actor Emp as Nhân viên

    Note over App: Hết ngày cuối tháng (00:00 ngày 1 tháng mới)
    App->>DB: 1. Background Job tổng hợp bảng công tháng trước (STATUS = AGGREGATED)
    App->>DB: 2. Mở cổng Khiếu nại 48 giờ (dispute_deadline = Now + 48h)
    
    Emp->>App: Xem bảng công & gửi khiếu nại (nếu có)
    HR->>App: Xử lý hết khiếu nại tồn đọng
    HR->>App: 3. Bấm [CHỐT & KHÓA KỲ CÔNG] Tháng 05 (POST /admin/timesheets/periods/{id}/lock)
    App->>DB: Đặt kỳ công Tháng 05: STATUS = 'LOCKED' (Dữ liệu thành READ-ONLY)

    Note over Lead,App: Ngày 05/06: Quản lý mới bấm duyệt đơn bổ sung công ngày 28/05 cho NV A
    Lead->>App: POST /api/v1/requests/{id}/approve
    App->>DB: Kiểm tra ngày 28/05 thuộc Kỳ công Tháng 05 đã bị LOCKED!
    
    Note over App: Cơ chế Hồi tố kích hoạt: KHÔNG sửa bảng công Tháng 05
    App->>DB: Tự động ghi vào payroll_retro_adjustments:
    Note over App,DB: +1.0 công của ngày 28/05 bù vào Kỳ Tháng 06
    
    Note over HR,App: Khi tổng hợp bảng công Tháng 06:
    App->>DB: Cột "Điều chỉnh kỳ trước" của NV A tự động hiển thị: +1.0 công
```

