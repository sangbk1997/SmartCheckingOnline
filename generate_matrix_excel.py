import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

wb = openpyxl.Workbook()

# Setup styles
font_family = "Segoe UI"
header_font = Font(name=font_family, size=11, bold=True, color="FFFFFF")
phase_font = Font(name=font_family, size=11, bold=True, color="1E293B")
data_font = Font(name=font_family, size=10, color="0F172A")
code_font = Font(name="Consolas", size=9.5, color="334155")
bold_data_font = Font(name=font_family, size=10, bold=True, color="0F172A")
qa_font = Font(name=font_family, size=9.5, color="1E293B")

thin_border = Border(
    left=Side(style='thin', color="E2E8F0"),
    right=Side(style='thin', color="E2E8F0"),
    top=Side(style='thin', color="E2E8F0"),
    bottom=Side(style='thin', color="E2E8F0")
)

header_fill_tab1 = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid") # Dark Blue
header_fill_tab2 = PatternFill(start_color="831843", end_color="831843", fill_type="solid") # Deep Burgundy

fill_p1 = PatternFill(start_color="EFF6FF", end_color="EFF6FF", fill_type="solid") # Soft Blue
fill_p2 = PatternFill(start_color="F0FDF4", end_color="F0FDF4", fill_type="solid") # Soft Emerald
fill_p3 = PatternFill(start_color="FAF5FF", end_color="FAF5FF", fill_type="solid") # Soft Purple
fill_p4 = PatternFill(start_color="FFFBEB", end_color="FFFBEB", fill_type="solid") # Soft Amber

# Status fills
fill_pass = PatternFill(start_color="DCFCE7", end_color="DCFCE7", fill_type="solid") # Light green
font_pass = Font(name=font_family, size=9.5, bold=True, color="166534")

fill_edge_ok = PatternFill(start_color="E0E7FF", end_color="E0E7FF", fill_type="solid") # Indigo
font_edge_ok = Font(name=font_family, size=9.5, bold=True, color="3730A3")

fill_roadmap = PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid") # Amber
font_roadmap = Font(name=font_family, size=9.5, bold=True, color="92400E")

# ==========================================
# TAB 1: ALL FEATURES
# ==========================================
ws1 = wb.active
ws1.title = "Features List (Toàn Bộ)"
ws1.views.sheetView[0].showGridLines = True

headers1 = [
    "STT", 
    "Phase / Giai Đoạn", 
    "Mức Độ Ưu Tiên", 
    "Function (Tính Năng)", 
    "Description (Mô Tả Nghiệp Vụ)", 
    "BackEnd API Endpoint", 
    "Hướng Dẫn Test / Verify (QA Steps UI & API)", 
    "Status (Trạng Thái)", 
    "Assignee (Phụ Trách)", 
    "Note (Ghi Chú Kỹ Thuật & Nghiệp Vụ)"
]
ws1.append(headers1)

for col_num, h in enumerate(headers1, 1):
    cell = ws1.cell(row=1, column=col_num)
    cell.font = header_font
    cell.fill = header_fill_tab1
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
ws1.row_dimensions[1].height = 34

features_data = [
    # Phase 1
    (
        "Phase 1", "Bắt buộc (Mandatory)", "Xác thực đăng nhập RBAC", 
        "Đăng nhập phân quyền 3 vai trò: Employee, Manager, HR Admin bằng JWT", 
        "POST /api/v1/auth/login", 
        "• UI: Truy cập màn hình đăng nhập -> Nhập email nv.a@company.com / Password@123 -> Nhấn 'Đăng nhập' -> Verify chuyển đúng cổng Employee Portal, hiển thị avatar & tên.\n• API: POST /api/v1/auth/login body: {\"email\":\"nv.a@company.com\",\"password\":\"Password@123\"} -> Verify status 200, nhận token JWT và role=EMPLOYEE.",
        "Hoàn thành (100%)", "Backend & Frontend Team", "Hỗ trợ SecurityContext, mã hóa mật khẩu BCrypt"
    ),
    (
        "Phase 1", "Bắt buộc (Mandatory)", "User Context Profile", 
        "Trích xuất hồ sơ tài khoản hiện tại từ SecurityContext token", 
        "GET /api/v1/auth/me", 
        "• UI: Đăng nhập thành công -> Kiểm tra góc trên phải Navbar -> Verify hiển thị Họ tên, Email, Badge vai trò (EMPLOYEE/MANAGER/HR_ADMIN) và Tên phòng ban.\n• API: Gửi GET /api/v1/auth/me với Header 'Authorization: Bearer <token>' -> Verify HTTP 200, JSON trả về đúng profile user đang đăng nhập.",
        "Hoàn thành (100%)", "Backend & Frontend Team", "Hiển thị thông tin trên Header & Cổng cá nhân"
    ),
    (
        "Phase 1", "Bắt buộc (Mandatory)", "Ràng buộc thiết bị 1-1", 
        "Khóa mỗi tài khoản nhân viên chỉ được chấm trên 1 máy di động", 
        "POST /api/v1/devices/enroll", 
        "• UI: Đăng nhập trên máy mới -> Hệ thống tự lấy fingerprint thiết bị và kích hoạt -> Thẻ 'Hardware Binding' chuyển sang màu xanh lá 'ACTIVE'.\n• API: POST /api/v1/devices/enroll với body {\"deviceId\":\"DEV_TEST_01\",\"deviceName\":\"Chrome MacOS\",\"deviceType\":\"WEB\"} -> Verify HTTP 200/201, device status=ACTIVE.",
        "Hoàn thành (100%)", "Security & Mobile Team", "Anti-Buddy Punching, bảng registered_devices"
    ),
    (
        "Phase 1", "Bắt buộc (Mandatory)", "Tra cứu thiết bị của tôi", 
        "Nhân viên kiểm tra trạng thái phần cứng thiết bị đã gắn kết", 
        "GET /api/v1/devices/my-device", 
        "• UI: Tại Employee Portal -> Tìm khối 'Thiết bị của tôi' -> Verify hiển thị Tên máy, ID thiết bị, Ngày liên kết và Huy hiệu 'Đang hoạt động'.\n• API: GET /api/v1/devices/my-device -> Verify HTTP 200, payload chứa deviceId, status=ACTIVE.",
        "Hoàn thành (100%)", "Frontend Team", "Thẻ Hardware Binding hiển thị tại cổng nhân viên"
    ),
    (
        "Phase 1", "Bắt buộc (Mandatory)", "Dynamic QR Sảnh Kiosk", 
        "Màn hình Kiosk TV hiển thị mã Dynamic QR xoay vòng 5s kèm đếm ngược", 
        "GET /api/v1/kiosk/current-qr", 
        "• UI: Truy cập màn hình /kiosk -> Quan sát mã QR xoay vòng 5 giây một lần kèm thanh progress bar đếm ngược -> Verify hình ảnh QR thay đổi liên tục.\n• API: GET /api/v1/kiosk/current-qr -> Verify HTTP 200, nhận qrPayload, timestamp hiện tại, chữ ký số HMAC và validDurationSeconds=5.",
        "Hoàn thành (100%)", "Fullstack Team", "KioskQrService, mã hóa Redis TTL 5 giây"
    ),
    (
        "Phase 1", "Bắt buộc (Mandatory)", "Ký số bảo mật QR HMAC", 
        "Chữ ký số HMAC-SHA256 bảo vệ tính toàn vẹn của mã QR", 
        "Backend KioskQrService", 
        "• API: Lấy chuỗi qrPayload từ /api/v1/kiosk/current-qr -> Phân tích cú pháp chuỗi chứa kioskId, timestamp, nonce và signature -> Dùng thuật toán HMAC-SHA256 đối soát với Secret Key hệ thống -> Verify chữ ký hợp lệ 100%.",
        "Hoàn thành (100%)", "Security Team", "Ngăn chặn sửa đổi timestamp hoặc kiosk_id"
    ),
    (
        "Phase 1", "Bắt buộc (Mandatory)", "WebSocket Kiosk Realtime", 
        "STOMP WebSocket bắn sự kiện dập thẻ thành công lên TV sảnh tức thì", 
        "/topic/kiosk-events/{screenId}", 
        "• UI: Mở 2 tab trình duyệt: Tab 1 mở /kiosk sảnh, Tab 2 mở Employee Portal và bấm dập thẻ -> Verify màn hình Kiosk Tab 1 lập tức hiện popup chào mừng kèm tên, avatar và âm thanh Beep.\n• Automation: Subscribe STOMP topic /topic/kiosk-events/KIOSK_LOBBY_01 -> Gửi punch -> Verify message nhận được tức thì.",
        "Hoàn thành (100%)", "Realtime Team", "Hiển thị avatar, tên & phát âm thanh chào đón"
    ),
    (
        "Phase 1", "Bắt buộc (Mandatory)", "Xác thực Chấm công 3 lớp", 
        "Dập thẻ Vào ca / Ra ca: IP Subnet + Device Token + Dynamic QR", 
        "POST /api/v1/attendance/punch", 
        "• UI: Employee Portal -> Nhấn 'Check-in Vào Ca' -> Quét QR Kiosk -> Verify thông báo thành công màu xanh, bảng dập thẻ hôm nay xuất hiện dòng IN lúc 08:30.\n• API: POST /api/v1/attendance/punch body: {\"punchType\":\"IN\",\"qrPayload\":\"<token>\",\"deviceId\":\"DEV_TEST_01\"} từ IP 192.168.1.50 -> Verify HTTP 200, status=APPROVED.",
        "Hoàn thành (100%)", "Core Attendance Team", "Kiểm tra IP subnet 192.168.1.0/24, lưu punches"
    ),
    (
        "Phase 1", "Bắt buộc (Mandatory)", "Chống Replay Attack", 
        "Chặn đứng việc chụp ảnh mã QR gửi cho người khác quét lại", 
        "AttendanceService & Redis", 
        "• API: Lấy 1 chuỗi qrPayload hợp lệ -> Gửi dập thẻ lần 1 (thành công HTTP 200) -> Gửi dập thẻ lần 2 với cùng chuỗi qrPayload đó -> Verify hệ thống trả về mã lỗi 400 ERR_REPLAY_ATTACK_DETECTED.\n• UI: Dùng ảnh QR cũ để quét -> Verify hiển thị thông báo lỗi 'Mã QR đã được sử dụng'.",
        "Hoàn thành (100%)", "Security Team", "Redis Blacklist lưu hash payload mã QR đã dùng"
    ),
    (
        "Phase 1", "Bắt buộc (Mandatory)", "Chấm công khẩn cấp 4G", 
        "Chấm công bằng mạng 4G khi mất điện hoặc sự cố mạng kèm ảnh selfie", 
        "POST /api/v1/attendance/punch-emergency", 
        "• UI: Employee Portal -> Nhấn 'Chấm khẩn cấp 4G' -> Chọn lý do, chụp ảnh selfie, lấy tọa độ GPS -> Nhấn Gửi -> Verify hiển thị banner vàng 'Đã gửi yêu cầu, chờ Quản lý phê duyệt'.\n• API: POST /api/v1/attendance/punch-emergency body: {\"punchType\":\"IN\",\"reason\":\"Mất điện\",\"latitude\":21.0285,\"longitude\":105.8542} -> Verify HTTP 200, status=PENDING_REVIEW.",
        "Hoàn thành (100%)", "Core Attendance Team", "Bối cảnh sự cố, đưa vào hàng đợi chờ duyệt"
    ),
    (
        "Phase 1", "Bắt buộc (Mandatory)", "GPS Geofencing Haversine", 
        "Đo khoảng cách GPS so với vị trí văn phòng công ty", 
        "POST /api/v1/attendance/punch-emergency", 
        "• API: Gửi POST /api/v1/attendance/punch-emergency với tọa độ lệch văn phòng >100m (vd: 21.0500, 105.8800) -> Verify response trả về cờ cảnh báo FLAG_LOCATION_MISMATCH và khoảng cách thực tế tính bằng công thức Haversine.\n• UI: Tại cổng Quản lý duyệt -> Thấy hiển thị cảnh báo đỏ 'Vị trí lệch >100m'.",
        "Hoàn thành (100%)", "Algorithms Team", "Khoảng cách > 100m gắn cờ FLAG_LOCATION_MISMATCH"
    ),
    (
        "Phase 1", "Bắt buộc (Mandatory)", "Phê duyệt Chấm khẩn cấp", 
        "Quản lý / HR duyệt yêu cầu chấm công khẩn cấp có đối soát GPS", 
        "POST /api/v1/attendance/emergency/{id}/review", 
        "• UI: Đăng nhập Manager -> Tab 'Chấm khẩn cấp chờ duyệt' -> Xem ảnh selfie & khoảng cách GPS -> Nhấn nút 'Duyệt' -> Verify bản ghi chuyển sang 'APPROVED' và đồng bộ vào bảng công nhân viên.\n• API: POST /api/v1/attendance/emergency/{id}/review body: {\"action\":\"APPROVE\",\"note\":\"Đã xác nhận sự cố\"} -> Verify HTTP 200.",
        "Hoàn thành (100%)", "HR Ops Team", "Ghi nhận công chuẩn sau khi được chấp thuận"
    ),
    (
        "Phase 1", "Bắt buộc (Mandatory)", "Lịch sử dập thẻ hôm nay", 
        "Tra cứu lịch sử các mốc dập thẻ Vào / Ra ca trong ngày của cá nhân", 
        "GET /api/v1/attendance/today", 
        "• UI: Employee Portal -> Khối 'Lịch sử chấm công hôm nay' -> Verify bảng liệt kê đủ các mốc IN / OUT trong ngày, hiển thị giờ phút chính xác và phương thức KIOSK_QR/EMERGENCY.\n• API: GET /api/v1/attendance/today -> Verify HTTP 200, danh sách punches có đầy đủ thông tin timestamp, punchType, verificationMethod.",
        "Hoàn thành (100%)", "Frontend Team", "Bảng hiển thị kèm mốc giờ và phương thức chấm"
    ),
    (
        "Phase 1", "Bắt buộc (Mandatory)", "Live Team Presence", 
        "Bảng điều khiển quân số trực tiếp: có mặt, đi muộn, làm online", 
        "GET /api/v1/attendance/live-dashboard", 
        "• UI: Manager Portal -> Widget 'Live Team Presence' -> Verify các chỉ số: Quân số có mặt, Đi muộn, Làm WFH và Vắng mặt nhảy số cập nhật tức thì khi có nhân viên dập thẻ.\n• API: GET /api/v1/attendance/live-dashboard -> Verify HTTP 200, JSON trả về tổng quan quân số và danh sách nhân sự hiện diện.",
        "Hoàn thành (100%)", "Fullstack Team", "Hiển thị tức thì tại Dashboard Quản lý"
    ),
    (
        "Phase 1", "Bắt buộc (Mandatory)", "Policy Quota Engine", 
        "Thẩm định hạn ngạch đơn từ tự động trước khi cho phép nộp", 
        "GET /api/v1/requests/quotas/remaining", 
        "• UI: Employee Portal -> Form tạo đơn mới -> Khối 'Hạn ngạch còn lại' -> Verify hiển thị số lần đi muộn (vd: 2/2), số ngày WFH (vd: 4/4), số ngày phép còn lại (vd: 12 ngày).\n• API: GET /api/v1/requests/quotas/remaining -> Verify HTTP 200, JSON chứa lateInRemaining, wfhRemaining, leaveBalance chính xác theo tháng.",
        "Hoàn thành (100%)", "Rule Engine Team", "Đi muộn <=2 lần/tháng, WFH <=4 ngày/tháng"
    ),
    (
        "Phase 1", "Bắt buộc (Mandatory)", "Đơn Đi muộn / Về sớm", 
        "Nộp đơn giải trình đi muộn hoặc về sớm tối đa 60 phút/lần", 
        "POST /api/v1/requests", 
        "• UI: Employee Portal -> Chọn loại đơn 'Đi muộn/Về sớm' -> Nhập 30 phút, lý do 'Kẹt xe' -> Nhấn 'Gửi đơn' -> Verify đơn xuất hiện ở bảng với trạng thái PENDING.\n• API: POST /api/v1/requests body: {\"type\":\"LATE_IN\",\"minutes\":30,\"reason\":\"Kẹt xe\"} -> Verify HTTP 201, quota đi muộn trong tháng giảm đi 1.",
        "Hoàn thành (100%)", "HR Team", "Type LATE_IN / EARLY_OUT, kiểm tra hạn ngạch"
    ),
    (
        "Phase 1", "Bắt buộc (Mandatory)", "Đơn Làm việc từ xa WFH", 
        "Nộp đơn WFH tối đa 4 ngày/tháng, bắt buộc nộp trước 24 giờ", 
        "POST /api/v1/requests", 
        "• UI: Employee Portal -> Chọn loại đơn 'Làm việc từ xa (WFH)' -> Chọn ngày làm việc cách hiện tại >24 giờ, nhập lý do -> Bấm 'Gửi đơn' -> Verify đơn tạo thành công trạng thái PENDING.\n• API: POST /api/v1/requests body: {\"type\":\"WFH\",\"date\":\"2026-11-20\",\"reason\":\"Họp online\"} -> Verify HTTP 201, quota WFH trừ 1 ngày.",
        "Hoàn thành (100%)", "HR Team", "Tự động cảnh báo nếu nộp sát giờ làm việc"
    ),
    (
        "Phase 1", "Bắt buộc (Mandatory)", "Đơn Nghỉ phép năm", 
        "Nộp đơn nghỉ phép trừ dần vào quỹ phép cá nhân (12 ngày chuẩn)", 
        "POST /api/v1/requests", 
        "• UI: Employee Portal -> Chọn loại 'Nghỉ phép năm' -> Chọn khoảng ngày nghỉ -> Bấm 'Gửi đơn' -> Verify hệ thống tính tổng số ngày phép và hiển thị quỹ phép dự kiến còn lại.\n• API: POST /api/v1/requests body: {\"type\":\"ANNUAL_LEAVE\",\"startDate\":\"2026-11-25\",\"endDate\":\"2026-11-26\",\"reason\":\"Du lịch\"} -> Verify HTTP 201.",
        "Hoàn thành (100%)", "HR Team", "Cập nhật bảng employee_leave_balances"
    ),
    (
        "Phase 1", "Bắt buộc (Mandatory)", "Đơn Nghỉ ốm mẫu C65-HD", 
        "Nộp đơn nghỉ ốm BHXH bắt buộc đính kèm link chứng từ y tế C65", 
        "POST /api/v1/requests", 
        "• UI: Employee Portal -> Chọn loại 'Nghỉ ốm BHXH' -> Nhập link chứng từ C65 vào ô đính kèm -> Bấm Gửi -> Verify đơn tạo thành công trạng thái PENDING.\n• API: POST /api/v1/requests body: {\"type\":\"SICK_LEAVE\",\"attachmentUrl\":\"https://storage.vn/c65_123.pdf\",\"reason\":\"Khám bệnh\"} -> Verify HTTP 201.",
        "Hoàn thành (100%)", "Compliance Team", "Chặn nộp nếu thiếu đính kèm ERR_ATTACHMENT_REQUIRED"
    ),
    (
        "Phase 1", "Bắt buộc (Mandatory)", "Đơn Bổ sung công quên dập", 
        "Bổ sung công quên dập trong thời hạn quy định 3 ngày làm việc", 
        "POST /api/v1/requests", 
        "• UI: Employee Portal -> Chọn 'Bổ sung công quên dập' -> Chọn ngày trong vòng 3 ngày gần nhất, chọn giờ dập thực tế -> Bấm Gửi -> Verify đơn được tạo thành công.\n• API: POST /api/v1/requests body: {\"type\":\"PUNCH_ADJUSTMENT\",\"date\":\"<trong_3_ngay>\",\"adjustedTime\":\"08:30:00\",\"reason\":\"Quên thẻ\"} -> Verify HTTP 201.",
        "Hoàn thành (100%)", "Compliance Team", "Chặn nộp nếu quá hạn ERR_DEADLINE_EXCEEDED"
    ),
    (
        "Phase 1", "Bắt buộc (Mandatory)", "Hủy đơn xin phép", 
        "Nhân viên hủy đơn từ đã nộp khi đơn còn ở trạng thái PENDING", 
        "DELETE /api/v1/requests/{id}", 
        "• UI: Employee Portal -> Danh sách đơn -> Tìm đơn đang PENDING -> Nhấn nút 'Hủy đơn' màu đỏ -> Xác nhận popup -> Verify đơn chuyển sang trạng thái CANCELLED, hạn ngạch được hoàn lại.\n• API: DELETE /api/v1/requests/{id} -> Verify HTTP 200, status=CANCELLED, quota hoàn lại ngay.",
        "Hoàn thành (100%)", "HR Team", "Hoàn trả lại hạn ngạch quota tương ứng"
    ),
    (
        "Phase 1", "Bắt buộc (Mandatory)", "Duyệt đơn từ 1-Click", 
        "Quản lý / HR phê duyệt hoặc từ chối đơn có lý do phản hồi", 
        "POST /api/v1/requests/{id}/review", 
        "• UI: Manager Portal -> Tab 'Phê duyệt đơn từ' -> Nhấn nút 'Duyệt' màu xanh hoặc 'Từ chối' màu đỏ kèm lý do -> Verify đơn cập nhật trạng thái ngay trên UI và biến mất khỏi tab chờ duyệt.\n• API: POST /api/v1/requests/{id}/review body: {\"action\":\"APPROVE\"} -> Verify HTTP 200, request status=APPROVED.",
        "Hoàn thành (100%)", "Manager Team", "Cập nhật trạng thái và thông báo cho nhân viên"
    ),
    (
        "Phase 1", "Bắt buộc (Mandatory)", "Bảng công cá nhân kỳ", 
        "Nhân viên xem tổng hợp ngày công, giờ làm, số phút đi muộn kỳ lương", 
        "GET /api/v1/timesheets/my-timesheet", 
        "• UI: Employee Portal -> Thẻ 'Bảng công tháng hiện tại' -> Verify hiển thị chuẩn xác: Tổng ngày công thực tế, Tổng giờ làm, Số phút đi muộn và trạng thái kỳ (OPEN/LOCKED).\n• API: GET /api/v1/timesheets/my-timesheet -> Verify HTTP 200, trả về workedDays, totalHours, lateMinutes, status.",
        "Hoàn thành (100%)", "Payroll Team", "Dữ liệu tổng hợp từ monthly_timesheets"
    ),
    (
        "Phase 1", "Bắt buộc (Mandatory)", "Cổng Khiếu nại công 48h", 
        "Nhân viên gửi khiếu nại sai lệch ngày công trong thời hạn 48 giờ", 
        "POST /api/v1/timesheets/disputes", 
        "• UI: Employee Portal -> Nhấn 'Khiếu nại ngày công' -> Chọn ngày sai lệch, nhập lý do và link minh chứng -> Bấm Gửi -> Verify bảng khiếu nại ghi nhận trạng thái OPEN.\n• API: POST /api/v1/timesheets/disputes body: {\"timesheetDate\":\"2026-11-10\",\"reason\":\"Máy sảnh không nhận camera\",\"evidenceUrl\":\"...\"} -> Verify HTTP 201.",
        "Hoàn thành (100%)", "Payroll Team", "Kèm lý do và thời gian xảy ra sai sót dập thẻ"
    ),
    (
        "Phase 1", "Bắt buộc (Mandatory)", "Xử lý Khiếu nại & Hồi tố", 
        "HR chấp thuận bù công tự động ghi nhận bút toán hồi tố kỳ sau", 
        "POST /api/v1/timesheets/admin/disputes/{id}/resolve", 
        "• UI: HR Portal -> Quản lý khiếu nại -> Bấm 'Chấp thuận' -> Verify hệ thống tạo bản ghi hồi tố công kỳ sau và đánh dấu khiếu nại RESOLVED.\n• API: POST /api/v1/timesheets/admin/disputes/{id}/resolve body: {\"action\":\"RESOLVE\",\"retroDays\":1.0,\"note\":\"Bù công kỹ thuật\"} -> Verify HTTP 200.",
        "Hoàn thành (100%)", "Payroll Team", "Ghi nhận vào payroll_retro_adjustments"
    ),
    (
        "Phase 1", "Bắt buộc (Mandatory)", "Tổng hợp dữ liệu kỳ công", 
        "Kích hoạt tính toán ngày công thực tế toàn bộ nhân viên công ty", 
        "POST /api/v1/timesheets/admin/periods/{id}/aggregate", 
        "• UI: HR Portal -> Tab 'Quản lý Kỳ công' -> Nhấn 'Tổng hợp công tự động' -> Verify thanh tiến trình chạy và thông báo tổng hợp thành công toàn bộ nhân viên trong kỳ.\n• API: POST /api/v1/timesheets/admin/periods/{id}/aggregate -> Verify HTTP 200, engine tính toán lại toàn bộ punches của nhân viên.",
        "Hoàn thành (100%)", "Payroll Team", "Chạy background engine quét toàn bộ lượt punch"
    ),
    (
        "Phase 1", "Bắt buộc (Mandatory)", "Khóa sổ bất biến kỳ lương", 
        "Khóa kỳ công sang trạng thái LOCKED, ngăn chặn mọi can thiệp sau 48h", 
        "POST /api/v1/timesheets/admin/periods/{id}/lock", 
        "• UI: HR Portal -> Nhấn 'Khóa sổ kỳ công' -> Hộp thoại cảnh báo bảo mật hiện ra -> Nhấn Xác nhận -> Verify huy hiệu kỳ chuyển sang màu tím 'LOCKED', các nút chỉnh sửa bị ẩn.\n• API: POST /api/v1/timesheets/admin/periods/{id}/lock -> Verify HTTP 200, status=LOCKED, mã băm SHA-256 được lưu trữ.",
        "Hoàn thành (100%)", "Audit & Security Team", "Kỳ công bất biến, chống sửa đổi gian lận lương"
    ),
    (
        "Phase 1", "Bắt buộc (Mandatory)", "Xuất File CSV Kế toán", 
        "Xuất bảng công chuẩn UTF-8 BOM mở không lỗi font tiếng Việt", 
        "GET /api/v1/timesheets/admin/periods/{id}/export-csv", 
        "• UI: HR Portal -> Nhấn 'Xuất File CSV' -> Trình duyệt tải file timesheet.csv -> Mở trực tiếp bằng Microsoft Excel -> Verify tên nhân viên tiếng Việt có dấu hiển thị chuẩn xác không lỗi font.\n• API: GET /api/v1/timesheets/admin/periods/{id}/export-csv -> Verify HTTP 200, bytes đầu tiên chứa UTF-8 BOM 0xEF 0xBB 0xBF.",
        "Hoàn thành (100%)", "Accounting Integration Team", "Chuẩn hóa định dạng phục vụ phần mềm kế toán"
    ),
    (
        "Phase 1", "Bắt buộc (Mandatory)", "Sơ đồ tổ chức phòng ban", 
        "Quản lý danh mục phòng ban đa cấp cha - con", 
        "GET, POST /api/v1/departments", 
        "• UI: Cổng Quản trị -> Tab 'Cơ cấu phòng ban' -> Xem cây tổ chức -> Nhấn 'Thêm phòng ban mới' -> Nhập mã, tên và trưởng phòng -> Lưu -> Verify phòng ban mới hiển thị đúng vị trí.\n• API: GET /api/v1/departments (HTTP 200) và POST /api/v1/departments body: {\"code\":\"TECH_AI\",\"name\":\"Phòng AI Lab\"} -> Verify HTTP 201.",
        "Hoàn thành (100%)", "Admin Team", "Gắn kết trưởng phòng và danh sách nhân sự"
    ),
    (
        "Phase 1", "Bắt buộc (Mandatory)", "Danh bạ & Quyền RBAC", 
        "Quản trị danh sách nhân viên, cấp vai trò EMPLOYEE/MANAGER/HR", 
        "GET, POST, PUT /api/v1/admin/employees", 
        "• UI: Cổng Quản trị -> Tab 'Nhân sự & RBAC' -> Bấm 'Thêm nhân viên' -> Nhập Email, Tên, chọn Role (EMPLOYEE/MANAGER/HR_ADMIN) -> Lưu -> Verify nhân sự xuất hiện trong danh bạ.\n• API: POST /api/v1/admin/employees body: {\"email\":\"test.emp@company.com\",\"fullName\":\"Nguyễn Văn Test\",\"role\":\"EMPLOYEE\"} -> Verify HTTP 201.",
        "Hoàn thành (100%)", "Admin Team", "Cập nhật thông tin phòng ban, hợp đồng lao động"
    ),
    (
        "Phase 1", "Bắt buộc (Mandatory)", "Quản lý Ca làm việc", 
        "Cấu hình giờ vào/ra ca, khoảng nghỉ trưa, công chuẩn 8.0 giờ", 
        "GET, POST /api/v1/admin/settings/shifts", 
        "• UI: Cổng Quản trị -> Tab 'Ca làm việc' -> Xem danh mục ca -> Bấm 'Thêm ca' -> Nhập Giờ vào 08:30, Giờ ra 17:30, Nghỉ trưa 1.0h -> Lưu -> Verify ca mới lưu vào bảng.\n• API: POST /api/v1/admin/settings/shifts body: {\"shiftName\":\"Ca Hành Chính\",\"startTime\":\"08:30:00\",\"endTime\":\"17:30:00\",\"breakHours\":1.0} -> Verify HTTP 201.",
        "Hoàn thành (100%)", "Policy Team", "Hỗ trợ ca cố định Fixed và ca linh hoạt"
    ),
    (
        "Phase 1", "Bắt buộc (Mandatory)", "Lịch nghỉ lễ hưởng lương", 
        "Cấu hình danh mục ngày nghỉ lễ Tết hưởng 100% lương", 
        "GET, POST /api/v1/admin/settings/holidays", 
        "• UI: Cổng Quản trị -> Tab 'Lịch nghỉ lễ' -> Bấm 'Thêm ngày lễ' -> Nhập tên lễ, chọn từ ngày - đến ngày, tick chọn 'Có hưởng lương' -> Lưu -> Verify ngày lễ hiển thị trên lịch.\n• API: POST /api/v1/admin/settings/holidays body: {\"holidayName\":\"Quốc Khánh\",\"startDate\":\"2026-09-02\",\"endDate\":\"2026-09-02\",\"paid\":true} -> Verify HTTP 201.",
        "Hoàn thành (100%)", "Policy Team", "Hệ thống tự động tính ngày lễ không bị tính vắng"
    ),
    (
        "Phase 1", "Bắt buộc (Mandatory)", "Hiệu chỉnh Policy Rules", 
        "Điều chỉnh tham số JSON của bộ quy tắc không cần restart server", 
        "GET, PUT /api/v1/admin/settings/policies", 
        "• UI: Cổng Quản trị -> Tab 'Cấu hình tham số' -> Sửa số lần đi muộn cho phép từ 2 lên 3 -> Bấm Lưu -> Thử nộp đơn đi muộn lần 3 -> Verify đơn được chấp nhận mà không cần khởi động lại server.\n• API: PUT /api/v1/admin/settings/policies body: {\"policyKey\":\"MAX_LATE_PER_MONTH\",\"policyValue\":\"3\"} -> Verify HTTP 200.",
        "Hoàn thành (100%)", "Rule Engine Team", "Linh hoạt thay đổi hạn ngạch và thời gian ân hạn"
    ),

    # Phase 2
    (
        "Phase 2", "Bắt buộc (Mandatory)", "Bật Camera Quét QR Web", 
        "Quét trực tiếp mã Dynamic QR trên màn hình Kiosk bằng camera web", 
        "CameraQrScannerModal.jsx", 
        "• UI: Employee Portal -> Nhấn nút 'Quét Camera QR' -> Cấp quyền Webcam trình duyệt -> Quan sát khung laser quét xanh -> Đưa webcam hướng về phía mã QR Kiosk -> Verify tự động nhận diện, phát tiếng Beep và hiển thị toast dập thẻ thành công.",
        "Hoàn thành (100%)", "Frontend & UX Team", "Khung laser xanh, jsQR frame-by-frame, âm thanh beep"
    ),
    (
        "Phase 2", "Nâng cao (Enterprise)", "1-Click Kiosk Fallback", 
        "Nút bấm tiện ích lấy nhanh mã QR đang xoay vòng từ Kiosk sảnh", 
        "GET /api/v1/kiosk/current-qr", 
        "• UI: Trong Modal Quét QR -> Nhấn nút tím '1-Click Lấy mã Kiosk sảnh' -> Verify hệ thống tự động tải mã QR đang xoay vòng từ sảnh Kiosk và thực hiện dập thẻ ngay tức thì mà không cần camera vật lý.\n• API: GET /api/v1/kiosk/current-qr -> Lấy chuỗi qrPayload gửi vào endpoint punch.",
        "Hoàn thành (100%)", "QA & Demo Team", "Phục vụ kiểm thử khi môi trường web thiếu webcam"
    ),
    (
        "Phase 2", "Gợi ý / Tiện ích (Nice to have)", "Tải ảnh QR từ máy", 
        "Tải tệp ảnh chụp QR từ máy tính để giải mã bằng HTML5 Canvas", 
        "CameraQrScannerModal.jsx", 
        "• UI: Trong Modal Quét QR -> Nhấn 'Tải ảnh QR từ máy' -> Chọn 1 tệp ảnh chứa mã QR Kiosk -> Verify Canvas giải mã thành công chuỗi QR và gửi lệnh dập thẻ tự động.",
        "Hoàn thành (100%)", "UX Team", "Giải mã offline tiện dụng"
    ),
    (
        "Phase 2", "Gợi ý / Tiện ích (Nice to have)", "Đổi Camera & Flash Torch", 
        "Chuyển đổi camera trước/sau và bật đèn flash pin khi quét thiếu sáng", 
        "CameraQrScannerModal.jsx", 
        "• UI: Mở camera quét trên điện thoại di động -> Bấm nút 'Đổi Camera' -> Verify chuyển đổi mượt mà giữa camera trước và camera sau -> Bấm nút 'Đèn pin Flash' -> Verify đèn trợ sáng bật/tắt.",
        "Hoàn thành (100%)", "UX Team", "Hỗ trợ trên trình duyệt di động"
    ),
    (
        "Phase 2", "Bắt buộc (Mandatory)", "Lưới Lịch công 30 Ngày", 
        "Hiển thị ô lịch 30 ngày trực quan theo màu sắc trạng thái từng ngày", 
        "GET /api/v1/timesheets/calendar", 
        "• UI: Employee Portal hoặc Manager Portal -> Nhấn 'Xem Bảng Công Chi Tiết' -> Verify lưới lịch 30 ô vuông hiển thị đầy đủ các ngày trong tháng với màu sắc trực quan (Xanh: Bình thường, Cam: Đi muộn, Tím: Phép, Lơ: WFH).\n• API: GET /api/v1/timesheets/calendar?month=11&year=2026 -> Verify HTTP 200, danh sách 30 ngày công.",
        "Hoàn thành (100%)", "Frontend & Core Team", "Màu sắc: Bình thường, Đi muộn, WFH, Phép, Nghỉ ốm"
    ),
    (
        "Phase 2", "Bắt buộc (Mandatory)", "Bảng công chi tiết từng ngày", 
        "Bảng chi tiết ngày, ca làm, giờ vào/ra, tổng giờ, phút đi muộn", 
        "GET /api/v1/timesheets/calendar", 
        "• UI: Trong modal Bảng công chi tiết -> Cuộn xuống bảng danh sách ngày công -> Verify bảng có đầy đủ các cột: Ngày, Thứ, Ca làm việc, Giờ Vào, Giờ Ra, Tổng giờ làm, Số phút đi muộn, Trạng thái.\n• API: GET /api/v1/timesheets/calendar -> Verify dữ liệu checkIn, checkOut, lateMinutes, totalHours chính xác.",
        "Hoàn thành (100%)", "Frontend & Core Team", "Table View chi tiết cho cả nhân viên và quản lý"
    ),
    (
        "Phase 2", "Nâng cao (Enterprise)", "Tổng quan Cả năm 12 Tháng", 
        "Thẻ KPI tổng hợp 12 tháng: ngày công chuẩn, ngày làm, tỷ lệ chuyên cần", 
        "GET /api/v1/timesheets/yearly-overview", 
        "• UI: Trong modal Bảng công chi tiết -> Xem 4 thẻ KPI đầu trang: Tổng công chuẩn năm, Ngày làm việc thực tế, Tỷ lệ chuyên cần trung bình %, Tổng số lần đi muộn trong năm.\n• API: GET /api/v1/timesheets/yearly-overview?year=2026 -> Verify HTTP 200, JSON trả về đầy đủ các chỉ số thống kê 12 tháng.",
        "Hoàn thành (100%)", "Data & Frontend Team", "Phân tích xu hướng làm việc dài hạn của nhân sự"
    ),
    (
        "Phase 2", "Nâng cao (Enterprise)", "Chi tiết ngày & Khiếu nại", 
        "Nhấp vào ngày công để xem timeline dập thẻ và khiếu nại 1-click", 
        "DetailedTimesheetView.jsx", 
        "• UI: Trong bảng công chi tiết -> Nhấp chuột vào một ngày bất kỳ bị ghi nhận Đi muộn -> Verify timeline dập thẻ chi tiết mở ra kèm nút 'Khiếu nại ngày này' -> Nhấn nút -> Verify ngày tự động điền vào form khiếu nại.",
        "Hoàn thành (100%)", "UX & Fullstack Team", "Tự động điền ngày công vào form khiếu nại 48h"
    ),
    (
        "Phase 2", "Bắt buộc (Mandatory)", "Xem công đa nhân sự", 
        "Quản lý / HR chọn xem bảng công chi tiết của bất kỳ nhân viên nào", 
        "DetailedTimesheetView.jsx", 
        "• UI: Manager/HR Portal -> Mở modal Bảng công chi tiết -> Nhấp vào dropdown 'Chọn nhân sự' -> Chọn nhân viên khác (vd: Trần Thị B) -> Verify dữ liệu lịch và bảng công tự động làm mới sang thông tin của Trần Thị B.\n• API: GET /api/v1/timesheets/calendar?employeeId=2 -> Verify HTTP 200.",
        "Hoàn thành (100%)", "Manager Team", "Dropdown chuyển đổi nhân sự nhanh chóng"
    ),
    (
        "Phase 2", "Nâng cao (Enterprise)", "Executive Presence Gauge", 
        "Đồng hồ đo tỷ lệ hiện diện trực quan phần trăm quân số có mặt", 
        "GET /api/v1/timesheets/admin/analytics", 
        "• UI: Cổng Quản lý -> Tab 'Executive Analytics Dashboard' -> Quan sát đồng hồ Gauge bán nguyệt đo tỷ lệ hiện diện quân số hôm nay (vd: 88%) -> Verify màu sắc chuyển đổi xanh/vàng/đỏ theo tỷ lệ chuyên cần.\n• API: GET /api/v1/timesheets/admin/analytics -> Verify HTTP 200, trường presenceRate.",
        "Hoàn thành (100%)", "Executive BI Team", "Màu sắc cảnh báo theo ngưỡng chuyên cần"
    ),
    (
        "Phase 2", "Nâng cao (Enterprise)", "Executive KPI Dashboard", 
        "6 thẻ chỉ số điều hành: Tổng quân số, Đi làm, Đúng giờ, Đi muộn, WFH", 
        "GET /api/v1/timesheets/admin/analytics", 
        "• UI: Tab Executive Analytics -> Verify 6 thẻ số liệu: Tổng quân số, Đang có mặt, Đi làm đúng giờ, Số ca đi muộn, Đang làm WFH, Nghỉ phép hôm nay -> Verify số liệu khớp với thực tế điểm danh.\n• API: GET /api/v1/timesheets/admin/analytics -> Verify HTTP 200, các trường tổng hợp chuẩn xác.",
        "Hoàn thành (100%)", "Executive BI Team", "Báo cáo điều hành chuyên sâu cho Ban Giám Đốc"
    ),
    (
        "Phase 2", "Nâng cao (Enterprise)", "Chuyên cần theo phòng ban", 
        "Biểu đồ so sánh tỷ lệ đi làm giữa các phòng ban trong công ty", 
        "GET /api/v1/timesheets/admin/analytics", 
        "• UI: Tab Executive Analytics -> Quan sát biểu đồ thanh ngang so sánh chuyên cần giữa các phòng ban: Kỹ thuật, Kinh doanh, Marketing, Nhân sự -> Verify thanh tỷ lệ % và xếp hạng.\n• API: GET /api/v1/timesheets/admin/analytics -> Mảng departmentStats trả về tỷ lệ của từng phòng ban.",
        "Hoàn thành (100%)", "Executive BI Team", "Phát hiện phòng ban có tỷ lệ vắng cao"
    ),
    (
        "Phase 2", "Nâng cao (Enterprise)", "Xu hướng chuyên cần 6 tháng", 
        "Biểu đồ cột trực quan theo dõi tỷ lệ đi làm 6 tháng liên tiếp", 
        "GET /api/v1/timesheets/admin/analytics", 
        "• UI: Tab Executive Analytics -> Quan sát biểu đồ cột xu hướng 6 tháng -> Verify hiển thị đầy đủ tỷ lệ chuyên cần từ tháng T6 đến tháng T11 kèm giá trị % trên từng cột.\n• API: GET /api/v1/timesheets/admin/analytics -> Mảng monthlyTrends gồm dữ liệu 6 tháng liên tiếp.",
        "Hoàn thành (100%)", "Executive BI Team", "Phân tích biến động quân số chu kỳ dài hạn"
    ),
    (
        "Phase 2", "Nâng cao (Enterprise)", "Leaderboard Top 5 Đi muộn", 
        "Bảng xếp hạng 5 nhân sự đi muộn nhiều nhất kèm số phút và phòng ban", 
        "GET /api/v1/timesheets/admin/analytics", 
        "• UI: Tab Executive Analytics -> Bảng 'Top 5 Nhân sự Đi muộn nhiều nhất' -> Verify hiển thị danh sách từ hạng 1 đến 5 gồm: Họ tên, Phòng ban, Số lần đi muộn, Tổng số phút muộn.\n• API: GET /api/v1/timesheets/admin/analytics -> Mảng topLateEmployees được sắp xếp theo số phút giảm dần.",
        "Hoàn thành (100%)", "HR Performance Team", "Hỗ trợ nhắc nhở kỷ luật lao động"
    ),
    (
        "Phase 2", "Bắt buộc (Mandatory)", "Full CRUD Phòng ban", 
        "Xem chi tiết thành viên, Cập nhật thông tin, Xóa phòng ban", 
        "PUT, DELETE /api/v1/departments/admin/{id}", 
        "• UI: Cổng Quản lý -> Tab Cấu hình Phòng ban -> Bấm nút 'Sửa' trên phòng ban mẫu -> Đổi tên phòng ban -> Lưu -> Verify danh sách cập nhật tên mới -> Bấm nút 'Xóa' phòng ban trống -> Verify phòng ban bị xóa.\n• API: PUT /api/v1/departments/admin/{id} (HTTP 200); DELETE /api/v1/departments/admin/{id} (HTTP 204).",
        "Hoàn thành (100%)", "Admin Team", "Kiểm tra ràng buộc phòng ban không còn nhân sự"
    ),
    (
        "Phase 2", "Bắt buộc (Mandatory)", "Full CRUD Nhân sự", 
        "Xem chi tiết hồ sơ & thiết bị, Cập nhật quyền, Ngừng hoạt động", 
        "GET, DELETE /api/v1/admin/employees/{id}", 
        "• UI: Tab Quản lý Nhân sự -> Bấm 'Sửa' nhân sự -> Đổi vai trò hoặc phòng ban -> Lưu -> Bấm nút 'Khóa tài khoản' (Deactivate) -> Verify trạng thái chuyển sang INACTIVE.\n• API: GET /api/v1/admin/employees/{id} (HTTP 200) và DELETE /api/v1/admin/employees/{id} (HTTP 200, tài khoản bị vô hiệu hóa).",
        "Hoàn thành (100%)", "Admin Team", "Vô hiệu hóa tài khoản khi nhân viên nghỉ việc"
    ),
    (
        "Phase 2", "Bắt buộc (Mandatory)", "Kích hoạt lại Thiết bị", 
        "Kích hoạt lại thiết bị chấm công sau khi đã bị thu hồi quyền", 
        "POST /api/v1/devices/admin/{id}/activate", 
        "• UI: Tab Quản lý Thiết bị -> Tìm thiết bị đang ở trạng thái REVOKED -> Nhấn nút 'Kích hoạt lại' màu xanh -> Verify trạng thái thiết bị chuyển về ACTIVE.\n• API: POST /api/v1/devices/admin/{id}/activate -> Verify HTTP 200, thiết bị được khôi phục quyền chấm công.",
        "Hoàn thành (100%)", "Security Team", "Khôi phục trạng thái ACTIVE cho máy di động"
    ),
    (
        "Phase 2", "Bắt buộc (Mandatory)", "Full CRUD Ca làm việc", 
        "Xem chi tiết giờ làm & nghỉ trưa, Cập nhật ca, Xóa ca làm", 
        "PUT, DELETE /api/v1/admin/settings/shifts/{id}", 
        "• UI: Tab Cấu hình Ca làm -> Bấm 'Sửa' ca -> Đổi giờ ra ca từ 17:30 thành 18:00 -> Lưu -> Tạo ca làm mới thử nghiệm -> Bấm 'Xóa' ca thử nghiệm -> Verify ca bị xóa khỏi danh sách.\n• API: PUT /api/v1/admin/settings/shifts/{id} (HTTP 200); DELETE /api/v1/admin/settings/shifts/{id} (HTTP 204).",
        "Hoàn thành (100%)", "Policy Team", "Quản lý ca linh hoạt theo nhu cầu vận hành"
    ),
    (
        "Phase 2", "Bắt buộc (Mandatory)", "Full CRUD Lịch nghỉ lễ", 
        "Xem chi tiết chế độ lương, Cập nhật ngày lễ, Xóa ngày nghỉ lễ", 
        "PUT, DELETE /api/v1/admin/settings/holidays/{id}", 
        "• UI: Tab Cấu hình Ngày lễ -> Bấm 'Sửa' ngày lễ -> Cập nhật tên hoặc thời gian -> Lưu -> Tạo ngày lễ test -> Bấm 'Xóa' -> Verify ngày lễ test bị xóa khỏi lịch.\n• API: PUT /api/v1/admin/settings/holidays/{id} (HTTP 200); DELETE /api/v1/admin/settings/holidays/{id} (HTTP 204).",
        "Hoàn thành (100%)", "Policy Team", "Quản trị lịch lễ hàng năm chính xác"
    ),
    (
        "Phase 2", "Bắt buộc (Mandatory)", "Actionable Email 1-Click", 
        "Email HTML có nút Duyệt / Từ chối mã hóa HMAC Token 24 giờ", 
        "GET /api/v1/actions/quick-approve", 
        "• UI: Tab Google Workspace Integration -> Nhấn 'Gửi Email mô phỏng phê duyệt' -> Mở email HTML -> Nhấn nút 'Approve' màu xanh trong email -> Verify mở trình duyệt trả về thông báo 'Phê duyệt đơn thành công'.\n• API: GET /api/v1/actions/quick-approve?token=<valid_token>&action=APPROVE -> Verify HTTP 200.",
        "Hoàn thành (100%)", "Integration Team", "Phê duyệt đơn siêu tốc không cần mở website"
    ),
    (
        "Phase 2", "Bắt buộc (Mandatory)", "Single-Use Approval Token", 
        "Cơ chế bảo mật Token duy nhất, vô hiệu hóa sau 1 lần bấm", 
        "Redis ONE_CLICK_USED:<hash>", 
        "• API: Lấy token phê duyệt email hợp lệ -> Gọi GET /api/v1/actions/quick-approve lần 1 (thành công) -> Gọi lại lần 2 bằng đúng link đó -> Verify hệ thống trả về thông báo lỗi 'Mã phê duyệt đã được sử dụng trước đó'.",
        "Hoàn thành (100%)", "Security Team", "Ngăn chặn click đúp hoặc click lặp lại"
    ),
    (
        "Phase 2", "Bắt buộc (Mandatory)", "Google Chat Card v2", 
        "Bắn thẻ tương tác cardsV2 vào Google Chat Space qua Webhook", 
        "POST /api/v1/admin/notifications/test-chat", 
        "• UI: Tab Google Workspace -> Bấm nút 'Bắn thử thông báo Google Chat' -> Verify widget Simulator hiển thị chuẩn xác thẻ Chat cardsV2 với tiêu đề, avatar, thông tin đơn và nút bấm tương tác.\n• API: POST /api/v1/admin/notifications/test-chat body: {\"spaceName\":\"hr-alerts\"} -> Verify HTTP 200, webhook payload được xử lý.",
        "Hoàn thành (100%)", "Integration Team", "Tương tác trực tiếp trên app Google Chat điện thoại"
    ),
    (
        "Phase 2", "Bắt buộc (Mandatory)", "Cảnh báo an ninh GPS Chat", 
        "Tự động gửi cảnh báo đỏ khẩn cấp khi phát hiện gian lận GPS", 
        "GpsMismatchEvent -> GoogleChatService", 
        "• API/Flow: Thực hiện chấm công khẩn cấp với GPS lệch >100m -> Verify hệ thống tự động bắn cảnh báo đỏ vào Space Google Chat #hr-security-alerts với tọa độ và bản đồ vệ tinh.\n• UI: Kiểm tra tab Audit Logs -> Thấy sự kiện cảnh báo an ninh GPS trạng thái SENT.",
        "Hoàn thành (100%)", "Security & Notif Team", "Gửi vào Space #hr-security-alerts tức thì"
    ),
    (
        "Phase 2", "Bắt buộc (Mandatory)", "Bản tin điểm danh 09:00", 
        "Tự động phát bản tin quân số đi làm, đi muộn, WFH lúc 09:00 sáng", 
        "POST /api/v1/admin/notifications/daily-bulletin", 
        "• UI: Tab Google Workspace -> Bấm nút 'Phát bản tin điểm danh 09:00' -> Verify khung chat mô phỏng hiển thị bản tin tổng kết quân số có mặt, đi muộn, WFH của toàn công ty.\n• API: POST /api/v1/admin/notifications/daily-bulletin -> Verify HTTP 200, dispatch bản tin đến Chat Space chung.",
        "Hoàn thành (100%)", "Notification Team", "Gửi vào Space chung #chamcong-thongbao-chung"
    ),
    (
        "Phase 2", "Nâng cao (Enterprise)", "Simulator Google Chat v2", 
        "Bộ giả lập thẻ Google Chat Card v2 tương tác trực quan trên UI", 
        "ManagerPortal.jsx Tab 7", 
        "• UI: Manager Portal -> Mở Tab 7 'Google Chat & Email Integration' -> Thử nghiệm các nút gửi tương tác -> Verify render chính xác các thẻ cardsV2, các icon, status badge và các nút phản hồi phê duyệt.",
        "Hoàn thành (100%)", "Frontend Team", "Mô phỏng trải nghiệm người dùng trước khi gửi thật"
    ),
    (
        "Phase 2", "Nâng cao (Enterprise)", "Notification Audit Logs", 
        "Bảng nhật ký kiểm toán toàn bộ thông báo Email và Chat đã phát", 
        "GET /api/v1/admin/notifications/logs", 
        "• UI: Manager Portal -> Mở tab 'Nhật ký thông báo' -> Verify bảng kiểm toán ghi nhận đầy đủ các thông báo: Kênh phát (GMAIL/GOOGLE_CHAT), Người nhận, Tiêu đề, Thời gian gửi và Trạng thái SENT.\n• API: GET /api/v1/admin/notifications/logs -> Verify HTTP 200, danh sách log chi tiết.",
        "Hoàn thành (100%)", "Audit Team", "Theo dõi trạng thái SENT, SIMULATED, FAILED"
    ),

    # Phase 3
    (
        "Phase 3", "Bắt buộc (Mandatory)", "Đăng ký Làm thêm giờ OT", 
        "Nộp đơn đăng ký làm thêm giờ trước ca làm việc", 
        "POST /api/v1/requests/ot", 
        "• QA Verify Guide: Khi triển khai -> Mở cổng nhân viên -> Chọn loại 'Đăng ký làm thêm giờ OT' -> Nhập số giờ dự kiến (vd: 2.0h), chọn công việc và lý do -> Nộp đơn -> Verify đơn chuyển sang Quản lý duyệt -> Quản lý duyệt -> Ghi nhận giờ OT vào bảng công.",
        "Kế hoạch (Roadmap)", "Core Team", "Hỗ trợ lý do, dự kiến số giờ và công việc cụ thể"
    ),
    (
        "Phase 3", "Bắt buộc (Mandatory)", "Tính hệ số lương OT tự động", 
        "Tự động tính hệ số lương OT 150% ngày thường, 200% cuối tuần, 300% lễ", 
        "Policy Engine OT Calculator", 
        "• QA Verify Guide: Tạo dữ liệu kiểm thử giờ OT: (1) OT ngày thường -> Verify hệ số 1.5; (2) OT ngày thứ Bảy/CN -> Verify hệ số 2.0; (3) OT ngày lễ Tết -> Verify hệ số 3.0 -> Tổng hợp công và đối soát tiền lương theo luật lao động.",
        "Kế hoạch (Roadmap)", "Rule Engine Team", "Tuân thủ nghiêm ngặt Bộ luật Lao động Việt Nam"
    ),
    (
        "Phase 3", "Bắt buộc (Mandatory)", "Kiểm soát trần giờ làm thêm", 
        "Chặn nộp đơn OT khi vượt trần 40 giờ/tháng hoặc 200 giờ/năm", 
        "Policy Engine OT Limiter", 
        "• QA Verify Guide: Nộp đơn OT khi tổng giờ OT trong tháng đạt 39 giờ -> Nộp thêm 2 giờ -> Verify hệ thống chặn nộp và trả về mã lỗi ERR_OT_MONTHLY_LIMIT_EXCEEDED (vượt trần 40h/tháng).",
        "Kế hoạch (Roadmap)", "Compliance Team", "Ngăn chặn vi phạm trần thời gian làm thêm luật định"
    ),
    (
        "Phase 3", "Nâng cao (Enterprise)", "Xếp ca kíp tự động thông minh", 
        "Thuật toán phân ca kíp tự động cho chuỗi bán lẻ, nhà máy trực 24/7", 
        "POST /api/v1/admin/shifts/roster", 
        "• QA Verify Guide: Thiết lập danh sách nhân sự và nhu cầu trực 3 ca (Sáng, Chiều, Đêm) -> Bấm 'Tự động xếp ca' -> Verify thuật toán phân bổ đồng đều, không nhân sự nào bị xếp 2 ca liên tiếp thiếu 12 tiếng nghỉ.",
        "Kế hoạch (Roadmap)", "Algorithms Team", "Tự động kiểm tra nghỉ giữa 2 ca tối thiểu 12 tiếng"
    ),
    (
        "Phase 3", "Gợi ý / Tiện ích (Nice to have)", "Đề xuất Đổi ca làm việc", 
        "Nhân viên gửi yêu cầu đổi ca trực tiếp cho đồng nghiệp phê duyệt", 
        "POST /api/v1/requests/shift-swap", 
        "• QA Verify Guide: Nhân viên A chọn ca ngày mai muốn đổi với Nhân viên B -> Gửi yêu cầu đổi ca -> Nhân viên B nhận thông báo và bấm Đồng ý -> Chuyển Quản lý duyệt lần cuối -> Ca làm việc 2 bên hoán đổi trên lịch.",
        "Gợi ý (Roadmap)", "Frontend & Workflow Team", "Giảm tải thao tác cho quản lý đội ngũ"
    ),
    (
        "Phase 3", "Bắt buộc (Mandatory)", "AI Nhận diện khuôn mặt FaceID", 
        "Quét sinh trắc học khuôn mặt trực tiếp ngay khi mở camera quét QR", 
        "Biometric Face Recognition Service", 
        "• QA Verify Guide: Đăng ký khuôn mặt mẫu vào hồ sơ -> Khi mở Camera QR, AI đồng thời phân tích khuôn mặt trước camera -> Nếu độ tương đồng cosine < 0.85 so với ảnh gốc -> Chặn chấm công, báo sai người.",
        "Kế hoạch (Roadmap)", "AI / Computer Vision Team", "Chống gian lận tuyệt đối người cầm máy"
    ),
    (
        "Phase 3", "Bắt buộc (Mandatory)", "Face Liveness Detection", 
        "Kiểm tra chuyển động mắt/đầu chống dùng ảnh tĩnh chụp lại", 
        "Face Anti-Spoofing Engine", 
        "• QA Verify Guide: Dùng ảnh chụp chân dung in trên giấy hoặc màn hình iPad đưa trước camera -> Verify thuật toán Liveness phát hiện ảnh tĩnh không có nháy mắt/chuyển động 3D -> Chặn ERR_SPOOF_ATTACK_DETECTED.",
        "Kế hoạch (Roadmap)", "AI / Security Team", "Ngăn chặn replay photo từ điện thoại khác"
    ),
    (
        "Phase 3", "Nâng cao (Enterprise)", "Đóng gói PWA di động", 
        "Cài đặt ứng dụng trực tiếp từ trình duyệt Safari/Chrome lên điện thoại", 
        "Manifest.json & ServiceWorker", 
        "• QA Verify Guide: Mở website trên Safari iOS / Chrome Android -> Bấm 'Thêm vào Màn hình chính' -> Mở app từ icon ngoài màn hình -> Verify app mở ở chế độ toàn màn hình không có thanh URL, hoạt động mượt mà.",
        "Kế hoạch (Roadmap)", "Mobile Web Team", "Trải nghiệm mượt mà như app native"
    ),
    (
        "Phase 3", "Gợi ý / Tiện ích (Nice to have)", "App Native iOS / Android", 
        "Ứng dụng di động chuyên biệt xây dựng bằng React Native / Flutter", 
        "Mobile Native App Repository", 
        "• QA Verify Guide: Cài đặt tệp .ipa (iOS) và .apk (Android) -> Đăng nhập -> Verify tương tác phần cứng: TouchID/FaceID mở app, quét QR siêu tốc và nhận thông báo đẩy Firebase Cloud Messaging.",
        "Gợi ý (Roadmap)", "Mobile Team", "Tận dụng tối đa phần cứng FaceID / Fingerprint"
    ),
    (
        "Phase 3", "Gợi ý / Tiện ích (Nice to have)", "Định vị nền ngầm Geofencing", 
        "Tự động gửi push notification nhắc dập thẻ khi bước vào vùng văn phòng", 
        "Background Geolocation Service", 
        "• QA Verify Guide: Cài app trên điện thoại, bật quyền vị trí Always -> Di chuyển vào bán kính 100m của văn phòng công ty -> Verify điện thoại nhận push notification 'Bạn đã đến văn phòng, bấm để dập thẻ ngay!'.",
        "Gợi ý (Roadmap)", "Mobile Team", "Giảm thiểu tối đa tình trạng quên dập thẻ"
    ),
    (
        "Phase 3", "Nâng cao (Enterprise)", "MFA Xác thực 2 bước", 
        "Xác thực 2 yếu tố Google Authenticator/OTP cho tài khoản Quản lý/HR", 
        "POST /api/v1/auth/mfa/verify", 
        "• QA Verify Guide: Tài khoản Quản lý đăng nhập đúng mật khẩu -> Hệ thống yêu cầu mã OTP 6 số -> Mở Google Authenticator nhập mã OTP -> Verify đăng nhập thành công; nếu nhập sai mã -> Báo lỗi 401 MFA_INVALID.",
        "Kế hoạch (Roadmap)", "Security Team", "Bảo vệ các thao tác nhạy cảm khóa bảng lương"
    ),
    (
        "Phase 3", "Nâng cao (Enterprise)", "Table Partitioning PostgreSQL", 
        "Phân vùng bảng attendance_punches theo tháng để tăng tốc truy vấn", 
        "PostgreSQL Partition by Range", 
        "• QA Verify Guide: Chạy lệnh EXPLAIN ANALYZE trên query chấm công của tháng 11/2026 -> Verify Postgres chỉ quét phân vùng attendance_punches_2026_11 (Partition Pruning), tốc độ truy vấn < 10ms trên 1 triệu dòng.",
        "Kế hoạch (Roadmap)", "DBA & Infrastructure Team", "Đáp ứng quy mô 5.000 - 10.000 nhân sự"
    ),

    # Phase 4
    (
        "Phase 4", "Bắt buộc (Mandatory)", "Tính lương tự động Payroll", 
        "Tự động tính lương thực nhận từ dữ liệu bảng công kỳ đã khóa", 
        "POST /api/v1/payroll/generate", 
        "• QA Verify Guide: Sau khi HR khóa kỳ công tháng -> Bấm 'Tính lương tự động' -> Verify hệ thống tính: Lương Net = Lương cơ bản * (Công thực tế / Công chuẩn) + Tiền OT - Tiền phạt đi muộn - Các khoản bảo hiểm.",
        "Kế hoạch (Roadmap)", "Payroll Engine Team", "Tính lương cơ bản, phụ cấp, OT, phạt đi muộn"
    ),
    (
        "Phase 4", "Bắt buộc (Mandatory)", "Tính Thuế TNCN tự động", 
        "Tự động tính thuế TNCN theo biểu lũy tiến từng phần và giảm trừ", 
        "PayrollTaxCalculator Service", 
        "• QA Verify Guide: Tạo dữ liệu lương thử nghiệm 20 triệu/tháng có 1 người phụ thuộc -> Verify mức giảm trừ gia cảnh bản thân (11tr) + người phụ thuộc (4.4tr) -> Thu nhập tính thuế 4.6tr -> Áp biểu thuế bậc 1 (5%) = 230.000đ.",
        "Kế hoạch (Roadmap)", "Accounting Team", "Tự động cập nhật biểu thuế mới nhất của Bộ Tài Chính"
    ),
    (
        "Phase 4", "Bắt buộc (Mandatory)", "Trừ Bảo hiểm bắt buộc", 
        "Tự động trích trừ các khoản BHXH 8%, BHYT 1.5%, BHTN 1%", 
        "PayrollInsurance Service", 
        "• QA Verify Guide: Đối soát mức đóng bảo hiểm trên phiếu lương nhân viên: BHXH = 8% lương đóng bảo hiểm, BHYT = 1.5%, BHTN = 1% -> Verify tổng trích trừ 10.5% khớp chính xác với báo cáo nộp BHXH cơ quan nhà nước.",
        "Kế hoạch (Roadmap)", "Compliance Team", "Khớp số liệu nộp bảo hiểm xã hội nhà nước"
    ),
    (
        "Phase 4", "Bắt buộc (Mandatory)", "Gửi Phiếu lương điện tử e-Payslip", 
        "Tự động xuất và gửi phiếu lương có mật khẩu mã hóa qua Gmail", 
        "POST /api/v1/payroll/send-payslips", 
        "• QA Verify Guide: Sau khi chốt lương -> HR bấm 'Phát hành Phiếu lương điện tử' -> Nhân viên nhận email đính kèm tệp PDF phiếu lương -> Mở PDF yêu cầu nhập mật khẩu (mặc định 6 số cuối CCCD) -> Verify mở đúng chi tiết thu nhập.",
        "Kế hoạch (Roadmap)", "Notification Team", "Bảo mật thông tin thu nhập của từng nhân viên"
    ),
    (
        "Phase 4", "Nâng cao (Enterprise)", "Tích hợp MISA AMIS Kế toán", 
        "Webhook đồng bộ tự động bút toán lương sang phần mềm MISA", 
        "POST /api/v1/webhooks/misa", 
        "• QA Verify Guide: Kích hoạt Webhook MISA -> Chốt lương kỳ -> Kiểm tra trên hệ thống MISA AMIS: Verify tự động sinh chứng từ hạch toán chi phí lương Nợ TK 642 / Có TK 334 đầy đủ chi tiết theo phòng ban.",
        "Kế hoạch (Roadmap)", "Integration Team", "Loại bỏ thao tác nhập liệu thủ công của kế toán"
    ),
    (
        "Phase 4", "Nâng cao (Enterprise)", "Tích hợp ERP FAST / SAP", 
        "Open API chuẩn hóa kết nối với hệ thống FAST, Bravo, SAP", 
        "POST /api/v1/webhooks/erp", 
        "• QA Verify Guide: Gọi Open API trích xuất dữ liệu công và lương theo định dạng JSON chuẩn của SAP/FAST -> Verify phản hồi trong < 2 giây, cấu trúc dữ liệu mapping chính xác mã nhân viên và mã chi phí SAP.",
        "Kế hoạch (Roadmap)", "Enterprise Solution Team", "Tích hợp cho doanh nghiệp quy mô tập đoàn"
    ),
    (
        "Phase 4", "Gợi ý / Tiện ích (Nice to have)", "AI Dự báo biến động nhân sự", 
        "Mô hình Machine Learning dự báo tỷ lệ nghỉ việc và nguy cơ quá tải", 
        "AI Predictive Analytics Service", 
        "• QA Verify Guide: Cung cấp dữ liệu điểm danh, số giờ làm thêm và lịch sử nghỉ phép 12 tháng -> Chạy mô hình dự báo AI -> Verify hiển thị danh sách nhân sự có nguy cơ burnout (quá tải) hoặc có xu hướng rời bỏ tổ chức.",
        "Gợi ý (Roadmap)", "Data Science Team", "Hỗ trợ ban lãnh đạo chủ động nhân lực"
    ),
    (
        "Phase 4", "Gợi ý / Tiện ích (Nice to have)", "Khảo sát độ gắn kết eNPS", 
        "Tự động gửi khảo sát vi mô gắn kết nhân sự sau các mốc dập thẻ", 
        "POST /api/v1/surveys/pulse", 
        "• QA Verify Guide: Nhân viên dập thẻ Ra ca vào chiều thứ Sáu -> Màn hình hiển thị khảo sát 1 câu: 'Hôm nay mức độ hài lòng với công việc của bạn là mấy điểm (1-10)?' -> Bấm điểm -> Verify hệ thống ghi nhận ẩn danh vào báo cáo eNPS.",
        "Gợi ý (Roadmap)", "HR Culture Team", "Đo lường mức độ hài lòng của nhân viên"
    )
]

for idx, f in enumerate(features_data, 1):
    row_num = idx + 1
    phase, priority, func, desc, endpoint, qa_guide, status, assignee, note = f
    row_values = [idx, phase, priority, func, desc, endpoint, qa_guide, status, assignee, note]
    ws1.append(row_values)
    
    # Calculate row height dynamically based on qa_guide length
    line_count = qa_guide.count('\n') + 1
    ws1.row_dimensions[row_num].height = max(26, line_count * 18 + 8)
    
    # Phase background
    p_fill = fill_p1 if "Phase 1" in phase else fill_p2 if "Phase 2" in phase else fill_p3 if "Phase 3" in phase else fill_p4
    
    for c_idx in range(1, len(row_values) + 1):
        cell = ws1.cell(row=row_num, column=c_idx)
        cell.font = data_font
        cell.border = thin_border
        
        # Center specific columns
        if c_idx in [1, 2, 3, 8, 9]:
            cell.alignment = Alignment(horizontal="center", vertical="center")
        else:
            cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
            
        if c_idx == 4: # Function bold
            cell.font = bold_data_font
        elif c_idx == 6: # Code endpoint font
            cell.font = code_font
        elif c_idx == 7: # QA Guide font
            cell.font = qa_font
            
        # Status styling
        if c_idx == 8:
            if "Hoàn thành" in status:
                cell.fill = fill_pass
                cell.font = font_pass
            else:
                cell.fill = fill_roadmap
                cell.font = font_roadmap


# ==========================================
# TAB 2: EDGE CASES & FAILED SCENARIOS
# ==========================================
ws2 = wb.create_sheet(title="Edge Cases & Failed Scenarios")
ws2.views.sheetView[0].showGridLines = True

headers2 = [
    "STT", 
    "Phân Hệ / Nhóm Nghiệp Vụ", 
    "Loại Kịch Bản (Scenario Type)", 
    "Function (Tính Năng)", 
    "Mô Tả Kịch Bản Biên / Lỗi (Edge Case Description)", 
    "BackEnd API Endpoint", 
    "Hướng Dẫn Test / Negative Verify (QA Steps UI & API)", 
    "Status Xử Lý & Automation", 
    "Assignee (Phụ Trách)", 
    "Ghi Chú Kỹ Thuật (Exception Code & Cơ Chế Phòng Chống)"
]
ws2.append(headers2)

for col_num, h in enumerate(headers2, 1):
    cell = ws2.cell(row=1, column=col_num)
    cell.font = header_font
    cell.fill = header_fill_tab2
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
ws2.row_dimensions[1].height = 34

edge_cases_data = [
    (
        "Xác thực & Bảo mật", "Ngoại lệ đăng nhập (Negative)", "Đăng nhập tài khoản", 
        "Đăng nhập với email không tồn tại trong hệ thống", 
        "POST /api/v1/auth/login", 
        "• UI: Màn hình Login -> Nhập email non_exist@company.com / pass 123456 -> Bấm Đăng nhập -> Verify thông báo lỗi đỏ 'Tài khoản không tồn tại hoặc sai mật khẩu'.\n• API: POST /api/v1/auth/login body: {\"email\":\"fake@company.com\",\"password\":\"123456\"} -> Verify HTTP 401 Unauthorized.",
        "Đã xử lý & Automated", "Security Team", "Trả về 401 Unauthorized, thông báo email không đúng"
    ),
    (
        "Xác thực & Bảo mật", "Ngoại lệ đăng nhập (Negative)", "Đăng nhập tài khoản", 
        "Đăng nhập với email đúng nhưng mật khẩu không khớp", 
        "POST /api/v1/auth/login", 
        "• UI: Nhập email nv.a@company.com / sai mật khẩu 'WrongPass@999' -> Bấm Đăng nhập -> Verify thông báo lỗi đăng nhập, không cho phép vào hệ thống.\n• API: POST /api/v1/auth/login body: {\"email\":\"nv.a@company.com\",\"password\":\"WrongPass\"} -> Verify HTTP 401 Unauthorized.",
        "Đã xử lý & Automated", "Security Team", "Trả về 401 Unauthorized, bảo vệ chống brute-force"
    ),
    (
        "Xác thực & Bảo mật", "Bảo mật Token (Security Attack)", "Xác thực JWT", 
        "Gửi request với JWT Token bị giả mạo chữ ký số hoặc đã hết hạn", 
        "JwtAuthFilter / Tất cả API", 
        "• API: Gửi request bất kỳ (vd: GET /api/v1/auth/me) với Header 'Authorization: Bearer fake_invalid_jwt_token_xyz' -> Verify HTTP 401/403 Forbidden, filter chặn ngay ở cổng gateway không cho vào controller.",
        "Đã xử lý & Automated", "Security Team", "JwtTokenProvider chặn đứng ở filter tầng Gateway (401/403)"
    ),
    (
        "Xác thực & Bảo mật", "Phân quyền RBAC (Access Control)", "Bảo vệ đường dẫn Admin", 
        "Tài khoản nhân viên thường gọi API cấu hình quản trị hệ thống", 
        "GET /api/v1/admin/settings/policies", 
        "• API: Đăng nhập lấy Token của Employee (role EMPLOYEE) -> Dùng token này gọi API Quản trị GET /api/v1/admin/settings/policies -> Verify HTTP 403 Forbidden, Spring Security RBAC chặn đứng truy cập trái quyền.",
        "Đã xử lý & Automated", "Security Team", "Spring Security chặn 403 Forbidden theo vai trò"
    ),
    (
        "Xác thực & Bảo mật", "Phân quyền RBAC (Access Control)", "Bảo vệ đường dẫn Duyệt đơn", 
        "Nhân viên thường cố tình gọi API phê duyệt đơn từ của đồng nghiệp", 
        "POST /api/v1/requests/{id}/review", 
        "• API: Lấy token của Employee -> Gọi POST /api/v1/requests/{id}/review body: {\"action\":\"APPROVE\"} -> Verify HTTP 403 Forbidden, hệ thống chỉ cho phép tài khoản có vai trò MANAGER hoặc HR_ADMIN thực hiện.",
        "Đã xử lý & Automated", "Security Team", "Chặn 403 Forbidden, chỉ MANAGER hoặc HR_ADMIN được gọi"
    ),
    
    (
        "Thiết Bị Chấm Công", "Gian lận phần cứng (Anti-Fraud)", "Ràng buộc thiết bị 1-1", 
        "Chấm công trên điện thoại lạ chưa đăng ký kích hoạt", 
        "POST /api/v1/attendance/punch", 
        "• API: Gọi POST /api/v1/attendance/punch với deviceId không khớp với thiết bị đã đăng ký của nhân viên (vd: deviceId='UNKNOWN_PHONE_999') -> Verify HTTP 400 và mã lỗi ERR_DEVICE_MISMATCH, chặn hoàn toàn việc chấm công hộ.",
        "Đã xử lý & Automated", "Device Binding Team", "Trả về ERR_DEVICE_MISMATCH, chặn đứng chấm công hộ"
    ),
    (
        "Thiết Bị Chấm Công", "Gian lận phần cứng (Anti-Fraud)", "Thiết bị bị thu hồi", 
        "Chấm công trên thiết bị di động đã bị HR thu hồi quyền", 
        "POST /api/v1/attendance/punch", 
        "• UI/API: HR vào Quản lý Thiết bị bấm Thu hồi (Revoke) máy của nhân viên -> Nhân viên thực hiện dập thẻ từ máy này -> Verify thông báo lỗi 'Thiết bị đã bị thu hồi quyền, vui lòng liên hệ HR' (mã ERR_DEVICE_REVOKED).",
        "Đã xử lý & Automated", "Device Binding Team", "Trả về ERR_DEVICE_REVOKED, bắt buộc liên hệ HR kích hoạt lại"
    ),
    (
        "Thiết Bị Chấm Công", "Ràng buộc dữ liệu (Constraint)", "Đăng ký thiết bị", 
        "Nhân viên tự đăng ký thiết bị mới khi thiết bị cũ chưa được thu hồi", 
        "POST /api/v1/devices/enroll", 
        "• API: Nhân viên A đã có thiết bị ACTIVE -> Gửi tiếp request POST /api/v1/devices/enroll để đăng ký thêm máy thứ 2 -> Verify hệ thống từ chối với mã lỗi ERR_DEVICE_ALREADY_REGISTERED (nguyên tắc 1 tài khoản chỉ gắn 1 máy).",
        "Đã xử lý & Automated", "Device Binding Team", "Chặn ERR_DEVICE_ALREADY_REGISTERED, 1 tài khoản chỉ có 1 máy"
    ),
    
    (
        "Kiosk Dynamic QR", "Kịch bản biên quá hạn (Boundary)", "Dynamic QR 5 giây", 
        "Nhân viên quét mã Dynamic QR đã quá thời hạn hiệu lực 5 giây", 
        "POST /api/v1/attendance/punch", 
        "• UI/API: Lấy chuỗi mã QR Kiosk -> Chờ quá 6 giây (quá thời hạn TTL 5s) mới bấm dập thẻ -> Verify hệ thống trả về mã lỗi ERR_QR_EXPIRED và yêu cầu quét lại mã mới trên màn hình sảnh.",
        "Đã xử lý & Automated", "Kiosk Core Team", "Redis TTL kiểm tra timestamp quá 5s -> Trả về ERR_QR_EXPIRED"
    ),
    (
        "Kiosk Dynamic QR", "Tấn công giả mạo (Tampering Attack)", "Chữ ký số HMAC", 
        "Kẻ xấu cố tình can thiệp sửa đổi timestamp hoặc chuỗi chữ ký số", 
        "POST /api/v1/attendance/punch", 
        "• API: Lấy chuỗi qrPayload -> Cố tình sửa đổi 1 ký tự trong timestamp hoặc sửa chuỗi signature -> Gửi POST /api/v1/attendance/punch -> Verify hệ thống phát hiện sai lệch chữ ký số và trả về ERR_INVALID_QR_SIGNATURE.",
        "Đã xử lý & Automated", "Security Team", "HmacSHA256 kiểm tra chữ ký sai lệch -> Trả về ERR_INVALID_QR_SIGNATURE"
    ),
    (
        "Kiosk Dynamic QR", "Tấn công Replay (Replay Attack)", "Dynamic QR Blacklist", 
        "Chụp ảnh màn hình mã QR gửi qua Zalo cho đồng nghiệp quét lại", 
        "POST /api/v1/attendance/punch", 
        "• API/Flow: Chụp mã QR hợp lệ -> Nhân viên A dập thẻ thành công -> Trong vòng 5 giây, gửi mã này cho Nhân viên B dập thẻ -> Verify hệ thống kiểm tra Redis Blacklist và chặn đứng với lỗi ERR_REPLAY_ATTACK_DETECTED.",
        "Đã xử lý & Automated", "Security Team", "Redis Blacklist lưu hash payload đã dập -> Chặn ERR_REPLAY_ATTACK_DETECTED"
    ),
    (
        "Kiosk Dynamic QR", "Ranh giới mạng (Geofencing)", "Dải mạng nội bộ IP", 
        "Chấm công thường nhưng kết nối ngoài dải IP Wi-Fi văn phòng", 
        "POST /api/v1/attendance/punch", 
        "• API: Gửi POST /api/v1/attendance/punch từ IP ngoài công ty (vd: Header X-Forwarded-For: 113.160.22.45 không thuộc subnet 192.168.1.0/24) -> Verify hệ thống từ chối dập thẻ với mã lỗi ERR_IP_SUBNET_MISMATCH.",
        "Đã xử lý & Automated", "Network Team", "Kiểm tra subnet 192.168.1.0/24 -> Chặn ERR_IP_SUBNET_MISMATCH"
    ),
    
    (
        "Chấm Khẩn Cấp GPS", "Gian lận vị trí GPS (Fraud)", "Chấm công khẩn cấp", 
        "Nhân viên gửi tọa độ GPS cách văn phòng vượt ngưỡng an toàn (>100m)", 
        "POST /api/v1/attendance/punch-emergency", 
        "• API: Gửi POST /api/v1/attendance/punch-emergency với tọa độ cách công ty 500m -> Verify status trả về PENDING_REVIEW kèm cờ cảnh báo an ninh FLAG_LOCATION_MISMATCH.\n• UI: Cổng Quản lý hiển thị cảnh báo đỏ và khoảng cách lệch.",
        "Đã xử lý & Automated", "Algorithms Team", "Haversine Distance > 100m -> Gắn cờ cảnh báo FLAG_LOCATION_MISMATCH"
    ),
    (
        "Chấm Khẩn Cấp GPS", "Gian lận nghiêm trọng (Fraud Alert)", "Chấm công khẩn cấp", 
        "Nhân viên gửi tọa độ cách xa văn phòng > 5.000m (5km)", 
        "POST /api/v1/attendance/punch-emergency", 
        "• API/Flow: Gửi punch-emergency với tọa độ ở tỉnh khác cách >5km -> Verify hệ thống tự động phát event khẩn cấp bắn thẻ cảnh báo gian lận màu đỏ vào Space Google Chat #hr-security-alerts để HR xử lý kỷ luật.",
        "Đã xử lý & Automated", "Security & Notif Team", "Gắn cờ gian lận nghiêm trọng & tự động bắn cảnh báo đỏ vào Google Chat"
    ),
    (
        "Chấm Khẩn Cấp GPS", "Thiếu dữ liệu (Validation Error)", "Chấm công khẩn cấp", 
        "Nhân viên tắt định vị GPS hoặc thiết bị không thu được tọa độ", 
        "POST /api/v1/attendance/punch-emergency", 
        "• UI: Tắt GPS điện thoại -> Nhấn Gửi chấm khẩn cấp -> Verify thông báo yêu cầu bật định vị.\n• API: Gửi POST /api/v1/attendance/punch-emergency với latitude/longitude null -> Verify HTTP 400 ERR_MISSING_GPS_COORDINATES.",
        "Đã xử lý & Automated", "Frontend & Core Team", "Kiểm tra latitude/longitude null -> Báo lỗi ERR_MISSING_GPS_COORDINATES"
    ),
    
    (
        "Hạn Ngạch & Đơn Từ", "Vượt hạn ngạch số lần (Quota)", "Đơn Đi muộn", 
        "Nhân viên nộp đơn xin đi muộn lần thứ 3 trong tháng (> 2 lần/tháng)", 
        "POST /api/v1/requests", 
        "• UI/API: Nhân viên đã nộp 2 đơn đi muộn trong tháng -> Nộp tiếp đơn đi muộn lần 3 -> Verify form hiển thị thông báo lỗi 'Bạn đã sử dụng hết hạn ngạch đi muộn tháng này (tối đa 2 lần)' (mã lỗi ERR_QUOTA_EXCEEDED).",
        "Đã xử lý & Automated", "Rule Engine Team", "Policy Engine kiểm tra quota tháng -> Chặn ERR_QUOTA_EXCEEDED"
    ),
    (
        "Hạn Ngạch & Đơn Từ", "Vượt thời lượng tối đa (Boundary)", "Đơn Đi muộn", 
        "Nhân viên nộp đơn xin đi muộn 90 phút (> trần quy chế 60 phút)", 
        "POST /api/v1/requests", 
        "• UI/API: Nộp đơn đi muộn với số phút là 90 phút -> Verify hệ thống chặn nộp với thông báo lỗi 'Thời lượng đi muộn tối đa chỉ cho phép 60 phút/lần theo quy chế' (mã lỗi ERR_DURATION_EXCEEDED).",
        "Đã xử lý & Automated", "Rule Engine Team", "Thời lượng vượt trần -> Chặn ERR_DURATION_EXCEEDED (tối đa 60p)"
    ),
    (
        "Hạn Ngạch & Đơn Từ", "Vượt hạn ngạch ngày (Quota)", "Đơn WFH Làm từ xa", 
        "Nhân viên nộp đơn xin WFH ngày thứ 5 trong tháng (> 4 ngày/tháng)", 
        "POST /api/v1/requests", 
        "• UI/API: Nhân viên đã sử dụng hết 4 ngày WFH trong tháng -> Nộp đơn xin WFH ngày thứ 5 -> Verify hệ thống chặn nộp với mã lỗi ERR_WFH_QUOTA_EXCEEDED (hạn ngạch tối đa 4 ngày WFH/tháng).",
        "Đã xử lý & Automated", "Rule Engine Team", "Hạn ngạch WFH tối đa 4 ngày -> Chặn ERR_WFH_QUOTA_EXCEEDED"
    ),
    (
        "Hạn Ngạch & Đơn Từ", "Vi phạm thời gian báo trước (Rule)", "Đơn WFH Làm từ xa", 
        "Nhân viên nộp đơn WFH sát giờ bắt đầu ca làm việc (chưa đủ 24 tiếng)", 
        "POST /api/v1/requests", 
        "• UI/API: Nộp đơn xin WFH cho chính ngày hôm nay (chưa đủ 24 tiếng báo trước) -> Verify hệ thống từ chối tiếp nhận với mã lỗi ERR_WFH_ADVANCE_NOTICE_REQUIRED (yêu cầu báo trước tối thiểu 24 giờ).",
        "Đã xử lý & Automated", "Rule Engine Team", "Quy chế yêu cầu báo trước 1 ngày -> Báo ERR_WFH_ADVANCE_NOTICE_REQUIRED"
    ),
    (
        "Hạn Ngạch & Đơn Từ", "Quá hạn nộp đơn (Deadline)", "Đơn Bổ sung công", 
        "Nhân viên nộp đơn bổ sung công cho ngày cách đây 4 ngày làm việc", 
        "POST /api/v1/requests", 
        "• UI/API: Nộp đơn bổ sung công cho ngày cách hiện tại 4 ngày làm việc (> 3 ngày) -> Verify hệ thống chặn nộp với mã lỗi ERR_DEADLINE_EXCEEDED (quy định nộp trong vòng 3 ngày làm việc kể từ ngày quên dập).",
        "Đã xử lý & Automated", "Rule Engine Team", "Vượt hạn chót 3 ngày làm việc -> Chặn ERR_DEADLINE_EXCEEDED"
    ),
    (
        "Hạn Ngạch & Đơn Từ", "Thiếu chứng từ y tế (Compliance)", "Đơn Nghỉ ốm BHXH", 
        "Nhân viên nộp đơn nghỉ ốm nhưng không đính kèm tệp Mẫu C65-HD", 
        "POST /api/v1/requests", 
        "• UI/API: Chọn loại 'Nghỉ ốm BHXH' nhưng để trống trường link chứng từ attachmentUrl -> Bấm nộp -> Verify hệ thống báo lỗi đỏ 'Bắt buộc đính kèm giấy chứng nhận nghỉ việc hưởng BHXH C65-HD' (mã ERR_ATTACHMENT_REQUIRED).",
        "Đã xử lý & Automated", "Compliance Team", "Bắt buộc mẫu C65 theo luật BHXH -> Chặn ERR_ATTACHMENT_REQUIRED"
    ),
    (
        "Hạn Ngạch & Đơn Từ", "Hết quỹ phép năm (Exhaustion)", "Đơn Nghỉ phép năm", 
        "Nhân viên nộp đơn nghỉ phép khi số ngày phép tồn bằng 0 hoặc âm", 
        "POST /api/v1/requests", 
        "• UI/API: Chọn nhân viên có số ngày phép tồn = 0 -> Nộp đơn xin nghỉ 2 ngày phép năm -> Verify hệ thống từ chối tiếp nhận với mã lỗi ERR_INSUFFICIENT_LEAVE_BALANCE (không đủ quỹ ngày phép khả dụng).",
        "Đã xử lý & Automated", "HR Leave Team", "Kiểm tra leave_balance -> Báo lỗi ERR_INSUFFICIENT_LEAVE_BALANCE"
    ),
    (
        "Hạn Ngạch & Đơn Từ", "Sai quy trình xử lý (Invalid State)", "Hủy đơn xin phép", 
        "Nhân viên cố tình bấm hủy đơn đã được Quản lý phê duyệt APPROVED", 
        "DELETE /api/v1/requests/{id}", 
        "• UI/API: Gửi lệnh DELETE /api/v1/requests/{id} đối với đơn đã ở trạng thái APPROVED -> Verify hệ thống trả về HTTP 400 ERR_CANNOT_CANCEL_APPROVED_REQUEST (chỉ cho phép hủy đơn khi còn ở trạng thái PENDING).",
        "Đã xử lý & Automated", "HR Team", "Chỉ hủy khi PENDING -> Báo lỗi ERR_CANNOT_CANCEL_APPROVED_REQUEST"
    ),
    (
        "Hạn Ngạch & Đơn Từ", "Thiếu lý do từ chối (Validation)", "Duyệt đơn từ", 
        "Quản lý bấm Từ chối đơn nhưng để trống phần ý kiến phản hồi", 
        "POST /api/v1/requests/{id}/review", 
        "• UI/API: Quản lý chọn Từ chối đơn nhưng không nhập lý do -> Bấm Gửi -> Verify hệ thống chặn lại với thông báo 'Bắt buộc nhập lý do khi từ chối đơn' (mã lỗi ERR_COMMENT_REQUIRED).",
        "Đã xử lý & Automated", "Manager Team", "Bắt buộc giải thích lý do khi từ chối -> Báo lỗi ERR_COMMENT_REQUIRED"
    ),
    
    (
        "Bảng Công & Kỳ Lương", "Quá hạn khiếu nại (Boundary)", "Cổng Khiếu nại 48h", 
        "Nhân viên gửi khiếu nại công khi kỳ công đã mở quá hạn 48 giờ", 
        "POST /api/v1/timesheets/disputes", 
        "• UI/API: Gửi khiếu nại công khi kỳ công đã phát hành quá 48 giờ -> Verify hệ thống từ chối tiếp nhận với mã lỗi ERR_DISPUTE_EXPIRED (cổng khiếu nại đóng sau 48h kể từ khi công bố bảng công dự thảo).",
        "Đã xử lý & Automated", "Payroll Team", "Hết thời hạn 48h rà soát -> Chặn ERR_DISPUTE_EXPIRED"
    ),
    (
        "Bảng Công & Kỳ Lương", "Vi phạm tính bất biến (Immutability)", "Khóa sổ kỳ công", 
        "Cố tình bấm Tổng hợp lại dữ liệu cho kỳ công đã bị khóa LOCKED", 
        "POST /api/v1/timesheets/admin/periods/{id}/aggregate", 
        "• UI/API: Kỳ công đã ở trạng thái LOCKED -> Gọi API POST /api/v1/timesheets/admin/periods/{id}/aggregate -> Verify hệ thống chặn đứng với mã lỗi ERR_PERIOD_LOCKED (dữ liệu kỳ đã khóa bất biến, không thể ghi đè).",
        "Đã xử lý & Automated", "Security & Audit Team", "Kỳ công bất biến SHA-256 -> Chặn đứng ERR_PERIOD_LOCKED"
    ),
    (
        "Bảng Công & Kỳ Lương", "Vi phạm tính bất biến (Immutability)", "Khóa sổ kỳ công", 
        "Cố tình chèn thêm lượt chấm công dập thẻ vào kỳ đã khóa LOCKED", 
        "POST /api/v1/attendance/punch", 
        "• API: Gửi request dập thẻ với timestamp thuộc về một tháng đã bị khóa sổ LOCKED -> Verify hệ thống từ chối ghi nhận với mã lỗi ERR_IMMUTABLE_RECORD để bảo vệ tính toàn vẹn dữ liệu kế toán.",
        "Đã xử lý & Automated", "Security & Audit Team", "Dữ liệu kỳ đã chốt không thể sửa đổi -> Chặn ERR_IMMUTABLE_RECORD"
    ),
    (
        "Bảng Công & Kỳ Lương", "Lỗi font chữ tiếng Việt (Compatibility)", "Xuất File CSV Lương", 
        "Mở file CSV trên Microsoft Excel bị lỗi font tiếng Việt (Mojibake)", 
        "GET /api/v1/timesheets/admin/periods/{id}/export-csv", 
        "• UI/QA Test: Tải file timesheet.csv -> Mở trực tiếp bằng Microsoft Excel trên Windows/Mac -> Verify các cột Họ tên nhân viên và Phòng ban hiển thị tiếng Việt có dấu chuẩn 100%, không bị vỡ font ký tự.",
        "Đã xử lý & Automated", "Accounting Team", "Chèn Byte Order Mark UTF-8 BOM (0xEF, 0xBB, 0xBF) ở đầu stream"
    ),
    
    (
        "Google Workspace", "Click lặp lại token (Replay Attack)", "Actionable Email", 
        "Quản lý click nút Phê duyệt trên email lần thứ 2 sau khi đã duyệt", 
        "GET /api/v1/actions/quick-approve", 
        "• UI/API: Mở link phê duyệt từ email lần 1 (thành công) -> Click lại link đó lần 2 -> Verify trình duyệt hiển thị màn hình thông báo đỏ 'Mã phê duyệt đã được sử dụng trước đó. Không thể thực hiện lại thao tác!'.",
        "Đã xử lý & Automated", "Integration Team", "Redis ONE_CLICK_USED vô hiệu hóa token -> Báo MÃ ĐÃ ĐƯỢC SỬ DỤNG"
    ),
    (
        "Google Workspace", "Token email quá hạn (Expiration)", "Actionable Email", 
        "Quản lý mở email bấm duyệt khi link phê duyệt đã quá thời hạn 24 giờ", 
        "GET /api/v1/actions/quick-approve", 
        "• API: Tạo token với timestamp cũ >24 giờ trước -> Gọi link phê duyệt -> Verify hệ thống trả về thông báo 'Mã phê duyệt đã hết hạn hiệu lực (24 giờ). Vui lòng đăng nhập hệ thống để xử lý'.",
        "Đã xử lý & Automated", "Security Team", "Token HMAC hết hạn TTL 24h -> Báo MÃ ĐÃ HẾT HẠN"
    ),
    (
        "Google Workspace", "Lỗi kết nối Webhook (Resilience)", "Google Chat Notification", 
        "Webhook Google Chat bị sai URL, space bị xóa hoặc mạng gián đoạn", 
        "GoogleChatNotificationService", 
        "• API/Flow: Cấu hình URL Webhook giả lập trả về lỗi 500 hoặc 404 -> Gửi thông báo -> Verify ứng dụng bắt ngoại lệ an toàn (catch exception), ghi nhận log FAILED vào Notification Audit Logs, không làm sập flow chính của user.",
        "Đã xử lý & Automated", "Resilience Team", "Catch Exception, log FAILED vào Notification Audit Logs, không crash app"
    ),
    
    (
        "Quản Trị Danh Mục", "Trùng lặp dữ liệu (Constraint)", "Quản lý Phòng ban", 
        "Tạo phòng ban mới với mã code đã tồn tại trong cơ sở dữ liệu", 
        "POST /api/v1/departments/admin", 
        "• UI/API: Tạo phòng ban mới với mã code 'TECH' (đã tồn tại) -> Verify hệ thống báo lỗi HTTP 400 ERR_DUPLICATE_DEPARTMENT_CODE và thông báo 'Mã phòng ban đã tồn tại'.",
        "Đã xử lý & Automated", "Admin Team", "Bắt lỗi Unique Constraint -> Báo lỗi ERR_DUPLICATE_DEPARTMENT_CODE"
    ),
    (
        "Quản Trị Danh Mục", "Ràng buộc toàn vẹn (Integrity)", "Quản lý Phòng ban", 
        "Xóa phòng ban khi trong phòng vẫn còn nhân viên đang làm việc", 
        "DELETE /api/v1/departments/admin/{id}", 
        "• UI/API: Bấm xóa Phòng Kỹ thuật (đang có 10 nhân viên) -> Verify hệ thống từ chối xóa và hiển thị cảnh báo 'Không thể xóa phòng ban đang có nhân viên trực thuộc. Vui lòng luân chuyển nhân sự trước!'.",
        "Đã xử lý & Automated", "Admin Team", "Kiểm tra Foreign Key -> Báo lỗi phòng ban còn nhân sự không thể xóa"
    ),
    (
        "Quản Trị Danh Mục", "Logic giờ giấc ca làm (Validation)", "Quản lý Ca làm việc", 
        "Cấu hình ca làm có giờ kết thúc trước giờ bắt đầu (không ca đêm)", 
        "POST /api/v1/admin/settings/shifts", 
        "• UI/API: Nhập ca làm Giờ bắt đầu 17:30, Giờ kết thúc 08:30 (không cấu hình cờ ca đêm) -> Bấm Lưu -> Verify hệ thống báo lỗi validation 'Giờ kết thúc ca phải sau giờ bắt đầu' (mã ERR_INVALID_SHIFT_HOURS).",
        "Đã xử lý & Automated", "Policy Team", "Kiểm tra endTime > startTime -> Báo lỗi ERR_INVALID_SHIFT_HOURS"
    ),
    (
        "Quản Trị Danh Mục", "Logic thời gian ngày lễ (Validation)", "Lịch Nghỉ Lễ", 
        "Cấu hình ngày nghỉ lễ có ngày kết thúc trước ngày bắt đầu", 
        "POST /api/v1/admin/settings/holidays", 
        "• UI/API: Chọn ngày kết thúc nghỉ lễ nhỏ hơn ngày bắt đầu -> Bấm Lưu -> Verify hệ thống báo lỗi 'Ngày kết thúc nghỉ lễ không thể trước ngày bắt đầu' (mã ERR_INVALID_HOLIDAY_DATES).",
        "Đã xử lý & Automated", "Policy Team", "Kiểm tra endDate >= startDate -> Báo lỗi ERR_INVALID_HOLIDAY_DATES"
    ),
    (
        "Quản Trị Danh Mục", "Trùng lặp mã nhân sự (Constraint)", "Quản lý Nhân viên", 
        "Thêm nhân viên mới với mã nhân viên hoặc email đã tồn tại", 
        "POST /api/v1/admin/employees", 
        "• UI/API: Thêm nhân viên với email trùng lặp nv.a@company.com -> Bấm Lưu -> Verify hệ thống báo lỗi HTTP 400 ERR_DUPLICATE_EMPLOYEE 'Email nhân viên đã tồn tại trong hệ thống'.",
        "Đã xử lý & Automated", "Admin Team", "Bắt lỗi trùng mã/email -> Báo lỗi ERR_DUPLICATE_EMPLOYEE"
    ),
    
    (
        "Giao Diện & Thiết Bị", "Từ chối quyền Camera (Browser Perm)", "Camera QR Scanner", 
        "Người dùng bấm Block từ chối cấp quyền truy cập Camera trình duyệt", 
        "CameraQrScannerModal.jsx", 
        "• UI: Mở modal Quét QR -> Nhấn nút 'Block' trên popup hỏi quyền của trình duyệt -> Verify modal hiển thị hướng dẫn người dùng mở lại quyền camera và hiển thị nút fallback 'Lấy mã Kiosk 1-Click' để không bị tắc nghẽn trải nghiệm.",
        "Đã xử lý & Automated", "Frontend UX Team", "Hiển thị hướng dẫn mở quyền camera + nút fallback Lấy mã Kiosk 1-Click"
    ),
    (
        "Giao Diện & Thiết Bị", "Ảnh không hợp lệ (Format Error)", "Tải ảnh QR từ máy", 
        "Người dùng tải tệp ảnh không chứa mã QR hoặc ảnh chụp mờ nét", 
        "CameraQrScannerModal.jsx", 
        "• UI: Trong modal Quét QR -> Bấm Tải ảnh từ máy -> Chọn 1 tệp ảnh phong cảnh không có mã QR -> Verify hệ thống hiển thị thông báo lỗi 'Không tìm thấy mã QR hợp lệ trong ảnh, vui lòng thử lại'.",
        "Đã xử lý & Automated", "Frontend UX Team", "Báo lỗi Không tìm thấy mã QR hợp lệ trong ảnh, yêu cầu chọn ảnh khác"
    )
]

for idx, e in enumerate(edge_cases_data, 1):
    row_num = idx + 1
    category, sc_type, func, desc, endpoint, qa_guide, status, assignee, note = e
    row_values = [idx, category, sc_type, func, desc, endpoint, qa_guide, status, assignee, note]
    ws2.append(row_values)
    
    line_count = qa_guide.count('\n') + 1
    ws2.row_dimensions[row_num].height = max(26, line_count * 18 + 8)
    
    for c_idx in range(1, len(row_values) + 1):
        cell = ws2.cell(row=row_num, column=c_idx)
        cell.font = data_font
        cell.border = thin_border
        
        if c_idx in [1, 2, 3, 8, 9]:
            cell.alignment = Alignment(horizontal="center", vertical="center")
        else:
            cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
            
        if c_idx == 4:
            cell.font = bold_data_font
        elif c_idx == 6:
            cell.font = code_font
        elif c_idx == 7:
            cell.font = qa_font
            
        if c_idx == 8:
            cell.fill = fill_edge_ok
            cell.font = font_edge_ok


# Auto-fit Column Widths for both sheets
for ws in [ws1, ws2]:
    for col in ws.columns:
        col_letter = get_column_letter(col[0].column)
        c_idx = col[0].column
        if c_idx == 1:
            ws.column_dimensions[col_letter].width = 7
        elif c_idx in [2, 3]:
            ws.column_dimensions[col_letter].width = 24
        elif c_idx == 4:
            ws.column_dimensions[col_letter].width = 30
        elif c_idx == 5:
            ws.column_dimensions[col_letter].width = 44
        elif c_idx == 6:
            ws.column_dimensions[col_letter].width = 36
        elif c_idx == 7:
            ws.column_dimensions[col_letter].width = 54 # QA Guide width
        elif c_idx == 8:
            ws.column_dimensions[col_letter].width = 24
        elif c_idx == 9:
            ws.column_dimensions[col_letter].width = 24
        elif c_idx == 10:
            ws.column_dimensions[col_letter].width = 48

# Save output
file_path_docs = "/Users/sang/Projects/App/SmartTimeChecking/docs/SmartTimeChecking_Feature_and_EdgeCase_Matrix.xlsx"
file_path_root = "/Users/sang/Projects/App/SmartTimeChecking/SmartTimeChecking_Feature_and_EdgeCase_Matrix.xlsx"
wb.save(file_path_docs)
wb.save(file_path_root)
print("SUCCESS: Excel workbook updated with QA Verification Guide columns saved to:")
print(f" - {file_path_docs}")
print(f" - {file_path_root}")
