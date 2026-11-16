# TÀI LIỆU 01: ĐẶC TẢ PHÂN HỆ GHI NHẬN CHẤM CÔNG & CHỐNG GIAN LẬN
## Phân hệ 1 (Section 6.1 & Emergency Fallback)

---

## 1. MỤC TIÊU NGHIỆP VỤ
* Đảm bảo nhân viên chỉ có thể chấm công vào/ra khi thực tế đang có mặt tại văn phòng.
* Chống hoàn toàn các thủ thuật: Chấm công hộ, Fake GPS, gửi ảnh chụp màn hình qua mạng xã hội, mượn máy người khác.
* Cung cấp giải pháp dự phòng minh bạch khi văn phòng mất điện hoặc sự cố mạng.

---

## 2. CÁC PHƯƠNG THỨC CHẤM CÔNG

### Phương thức 1: Chấm công Chuẩn bằng Dynamic QR Code (Primary Flow)

#### A. Màn hình Kiosk tại Văn phòng (Laptop / Tablet)
* **Thiết bị:** Laptop hoặc Tablet đặt tại quầy lễ tân / cửa ra vào.
* **Cơ chế hoạt động:**
  1. Trình duyệt mở web ở chế độ Kiosk Mode (`--kiosk`), kết nối WebSocket tới Backend Spring Boot (`/ws/kiosk-qr`).
  2. Định kỳ mỗi **5 giây**, Backend sinh một mã OTP ngắn hạn có cấu trúc:
     ```json
     {
       "screenId": "OFFICE_HQ_FLOOR_2",
       "timestamp": 1731514800,
       "nonce": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
       "signature": "HMAC_SHA256(screenId + timestamp + nonce, SECRET_KEY)"
     }
     ```
  3. Backend lưu `nonce` vào Redis với `TTL = 8 giây` (cho độ trễ mạng 3 giây).
  4. Màn hình tự động render lại mã QR bằng thư viện `qrcode.js`.

#### B. Thao tác của Nhân viên
1. Nhân viên kết nối điện thoại vào **Wi-Fi văn phòng**.
2. Mở trình duyệt web công ty, bấm nút **[Chấm công Vào/Ra]**.
3. Trình duyệt yêu cầu cấp quyền Camera và mở luồng quét trực tiếp (sử dụng thư viện `html5-qrcode`). **Không hỗ trợ nút upload ảnh từ bộ nhớ**.
4. Quét mã trên màn hình Laptop Kiosk $\rightarrow$ Gửi payload kèm `deviceId` lên API `/api/v1/attendance/check-in`.

#### C. Quy trình Xác thực tại Backend (Spring Boot)
1. **Kiểm tra JWT & Tài khoản:** Xác thực danh tính nhân viên.
2. **Kiểm tra Thiết bị (Device Binding):**
   * Đối chiếu `deviceId` gửi lên với `registered_device_id` của nhân viên trong CSDL.
   * Nếu không khớp $\rightarrow$ Trả về mã lỗi `ERR_DEVICE_NOT_REGISTERED` (Chặn hành vi đăng nhập trên máy đồng nghiệp).
3. **Kiểm tra Địa chỉ IP:**
   * Lấy IP nguồn qua `request.getHeader("X-Forwarded-For")` (được lọc qua Nginx đáng tin cậy).
   * Kiểm tra IP có nằm trong dải CIDR/Public IP của văn phòng hay không.
4. **Kiểm tra Mã QR (Redis Atomic Validation):**
   * Kiểm tra tính toàn vẹn chữ ký `signature`.
   * Thực hiện lệnh Redis: `redisTemplate.opsForValue().getAndDelete("QR:" + nonce)`.
   * Nếu mã trả về rỗng (đã bị quét bởi người khác trước đó hoặc quá hạn 8s) $\rightarrow$ Trả về `ERR_QR_EXPIRED`.
5. **Ghi nhận thành công:**
   * Tạo bản ghi mới trong bảng `attendance_punches`.
   * Gửi thông báo WebSocket ngược lại màn hình Kiosk hiển thị: *"Chào mừng [Tên nhân viên] đã chấm công thành công vào lúc HH:mm:ss"*.

---

### Phương thức 2: Chấm công Dự phòng Khẩn cấp (Emergency Fallback)

* **Điều kiện kích hoạt:** Khi công ty bị cúp điện, rớt mạng Wi-Fi, hoặc màn hình Kiosk bị treo.
* **Quy trình thực hiện:**
  1. Nhân viên mở web trên 4G/5G, chọn mục **"Chấm công khẩn cấp (Sự cố văn phòng)"**.
  2. Hệ thống bật Camera trước:
     * Yêu cầu chụp ảnh Selfie trực tiếp có bối cảnh văn phòng.
     * Chặn hoàn toàn tính năng chọn file ảnh có sẵn.
  3. Thu thập dữ liệu ngữ cảnh:
     * Tọa độ GPS từ trình duyệt (`navigator.geolocation.getCurrentPosition`).
     * Chỉ số sai số GPS (`coords.accuracy`).
     * Tên thiết bị, thời gian từ máy chủ.
     * Nhân viên chọn lý do: *Mất điện văn phòng*, *Mất kết nối mạng*, *Màn hình QR hỏng*, *Khác*.
  4. Backend xử lý:
     * Tự động đóng dấu chìm (Watermark) vào ảnh: `[Mã NV] - [Tên NV] - [Thời gian Server] - [Toạ độ GPS]`.
     * Tải ảnh lên Object Storage (S3/MinIO).
     * Ghi nhận chấm công với trạng thái `STATUS = PENDING_APPROVAL`.
     * Tính toán khoảng cách giữa GPS thực tế và vị trí văn phòng. Nếu > 200m, gắn nhãn cảnh báo đỏ `FLAG_LOCATION_MISMATCH`.
  5. Quản lý / HR nhận thông báo trên Dashboard:
     * Xem ảnh selfie + vị trí trên Google Map + Lý do.
     * Bấm **[Duyệt]** $\rightarrow$ Dữ liệu chuyển thành công hợp lệ.
     * Bấm **[Từ chối]** $\rightarrow$ Nhân viên nhận thông báo và bị tính vắng/chờ giải trình.

---

### Phương thức 3: Chấm công khi Làm việc Từ xa (WFH Punching)

* **Điều kiện áp dụng:** Chỉ có hiệu lực khi nhân viên có đơn xin WFH ngày hôm đó đã được Quản lý duyệt (`wfh_requests.status = 'APPROVED'`).
* **Quy trình:**
  1. Nhân viên chấm công từ mạng nhà / quán cafe (IP ngoài).
  2. Backend kiểm tra:
     * Không khớp IP văn phòng $\rightarrow$ Kiểm tra tiếp bảng `wfh_requests` trong ngày.
     * Tìm thấy đơn WFH hợp lệ $\rightarrow$ Cho phép chấm công thành công.
     * Đánh dấu bản ghi: `is_wfh = true`.
  3. Nếu không có đơn WFH được duyệt trước đó $\rightarrow$ Chặn ngay lập tức: *"Bạn không có lịch làm việc từ xa hợp lệ cho ngày hôm nay"*.

---

## 3. CƠ CHẾ KHÓA THIẾT BỊ (DEVICE BINDING SPECIFICATION)

1. **Khởi tạo Thiết bị lần đầu (Enrollment):**
   * Lần đầu nhân viên đăng nhập trên điện thoại cá nhân, hệ thống sinh ra một `Device Token` kết hợp giữa Fingerprint phần cứng + UUID bảo mật lưu trong `IndexedDB`.
   * Gửi yêu cầu: *"Đăng ký thiết bị này làm máy chấm công chính thức"*.
   * HR hoặc Quản lý bấm xác nhận trong danh sách thiết bị.
2. **Quy tắc 1-1 (1 Tài khoản - 1 Thiết bị):**
   * Một nhân viên chỉ có 1 thiết bị kích hoạt tại một thời điểm.
   * Một thiết bị không được phép dùng để chấm công cho 2 tài khoản nhân viên khác nhau.
3. **Quy trình Đổi thiết bị (Change Device Request):**
   * Khi nhân viên đổi điện thoại mới, nhân viên gửi đơn "Yêu cầu đổi thiết bị chấm công" kèm lý do (mua máy mới, máy hỏng).
   * Sau khi HR phê duyệt, thiết bị cũ bị hủy kích hoạt (`status = REVOKED`) và thiết bị mới được kích hoạt.

---

## 4. BẢNG MÃ LỖI & THÔNG ĐIỆP GIAO DIỆN (ERROR HANDLING)

| Mã lỗi | Nguyên nhân | Thông báo người dùng |
| :--- | :--- | :--- |
| `ERR_INVALID_NETWORK` | Không thuộc IP văn phòng & không có đơn WFH | *"Vui lòng kết nối vào mạng Wi-Fi công ty để thực hiện chấm công."* |
| `ERR_QR_EXPIRED` | Quét mã cũ hoặc quá thời gian 8 giây | *"Mã QR đã hết hạn. Vui lòng hướng camera vào màn hình để quét lại."* |
| `ERR_DEVICE_MISMATCH` | Đăng nhập trên máy người khác | *"Thiết bị này chưa được liên kết với tài khoản của bạn. Vui lòng sử dụng máy đã đăng ký."* |
| `ERR_CAMERA_DENIED` | Người dùng chặn quyền camera | *"Hệ thống cần quyền truy cập Camera để quét mã chấm công."* |
| `ERR_ALREADY_PUNCHED` | Chấm công 2 lần liên tiếp dưới 2 phút | *"Bạn vừa mới chấm công lúc [HH:mm]. Vui lòng không thao tác liên tục."* |
