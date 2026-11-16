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

headers1 = ["STT", "Phase / Giai Đoạn", "Mức Độ Ưu Tiên", "Function (Tính Năng)", "Description (Mô Tả Nghiệp Vụ)", "BackEnd API Endpoint", "Status (Trạng Thái)", "Assignee (Phụ Trách)", "Note (Ghi Chú Kỹ Thuật & Nghiệp Vụ)"]
ws1.append(headers1)

for col_num, h in enumerate(headers1, 1):
    cell = ws1.cell(row=1, column=col_num)
    cell.font = header_font
    cell.fill = header_fill_tab1
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
ws1.row_dimensions[1].height = 32

features_data = [
    # Phase 1
    ("Phase 1", "Bắt buộc (Mandatory)", "Xác thực đăng nhập RBAC", "Đăng nhập phân quyền 3 vai trò: Employee, Manager, HR Admin bằng JWT", "POST /api/v1/auth/login", "Hoàn thành (100%)", "Backend & Frontend Team", "Hỗ trợ SecurityContext, mã hóa mật khẩu BCrypt"),
    ("Phase 1", "Bắt buộc (Mandatory)", "User Context Profile", "Trích xuất hồ sơ tài khoản hiện tại từ SecurityContext token", "GET /api/v1/auth/me", "Hoàn thành (100%)", "Backend & Frontend Team", "Hiển thị thông tin trên Header & Cổng cá nhân"),
    ("Phase 1", "Bắt buộc (Mandatory)", "Ràng buộc thiết bị 1-1", "Khóa mỗi tài khoản nhân viên chỉ được chấm trên 1 máy di động", "POST /api/v1/devices/enroll", "Hoàn thành (100%)", "Security & Mobile Team", "Anti-Buddy Punching, bảng registered_devices"),
    ("Phase 1", "Bắt buộc (Mandatory)", "Tra cứu thiết bị của tôi", "Nhân viên kiểm tra trạng thái phần cứng thiết bị đã gắn kết", "GET /api/v1/devices/my-device", "Hoàn thành (100%)", "Frontend Team", "Thẻ Hardware Binding hiển thị tại cổng nhân viên"),
    ("Phase 1", "Bắt buộc (Mandatory)", "Dynamic QR Sảnh Kiosk", "Màn hình Kiosk TV hiển thị mã Dynamic QR xoay vòng 5s kèm đếm ngược", "GET /api/v1/kiosk/current-qr", "Hoàn thành (100%)", "Fullstack Team", "KioskQrService, mã hóa Redis TTL 5 giây"),
    ("Phase 1", "Bắt buộc (Mandatory)", "Ký số bảo mật QR HMAC", "Chữ ký số HMAC-SHA256 bảo vệ tính toàn vẹn của mã QR", "Backend KioskQrService", "Hoàn thành (100%)", "Security Team", "Ngăn chặn sửa đổi timestamp hoặc kiosk_id"),
    ("Phase 1", "Bắt buộc (Mandatory)", "WebSocket Kiosk Realtime", "STOMP WebSocket bắn sự kiện dập thẻ thành công lên TV sảnh tức thì", "/topic/kiosk-events/{screenId}", "Hoàn thành (100%)", "Realtime Team", "Hiển thị avatar, tên & phát âm thanh chào đón"),
    ("Phase 1", "Bắt buộc (Mandatory)", "Xác thực Chấm công 3 lớp", "Dập thẻ Vào ca / Ra ca: IP Subnet + Device Token + Dynamic QR", "POST /api/v1/attendance/punch", "Hoàn thành (100%)", "Core Attendance Team", "Kiểm tra IP subnet 192.168.1.0/24, lưu punches"),
    ("Phase 1", "Bắt buộc (Mandatory)", "Chống Replay Attack", "Chặn đứng việc chụp ảnh mã QR gửi cho người khác quét lại", "AttendanceService & Redis", "Hoàn thành (100%)", "Security Team", "Redis Blacklist lưu hash payload mã QR đã dùng"),
    ("Phase 1", "Bắt buộc (Mandatory)", "Chấm công khẩn cấp 4G", "Chấm công bằng mạng 4G khi mất điện hoặc sự cố mạng kèm ảnh selfie", "POST /api/v1/attendance/punch-emergency", "Hoàn thành (100%)", "Core Attendance Team", "Bối cảnh sự cố, đưa vào hàng đợi chờ duyệt"),
    ("Phase 1", "Bắt buộc (Mandatory)", "GPS Geofencing Haversine", "Đo khoảng cách GPS so với vị trí văn phòng công ty", "POST /api/v1/attendance/punch-emergency", "Hoàn thành (100%)", "Algorithms Team", "Khoảng cách > 100m gắn cờ FLAG_LOCATION_MISMATCH"),
    ("Phase 1", "Bắt buộc (Mandatory)", "Phê duyệt Chấm khẩn cấp", "Quản lý / HR duyệt yêu cầu chấm công khẩn cấp có đối soát GPS", "POST /api/v1/attendance/emergency/{id}/review", "Hoàn thành (100%)", "HR Ops Team", "Ghi nhận công chuẩn sau khi được chấp thuận"),
    ("Phase 1", "Bắt buộc (Mandatory)", "Lịch sử dập thẻ hôm nay", "Tra cứu lịch sử các mốc dập thẻ Vào / Ra ca trong ngày của cá nhân", "GET /api/v1/attendance/today", "Hoàn thành (100%)", "Frontend Team", "Bảng hiển thị kèm mốc giờ và phương thức chấm"),
    ("Phase 1", "Bắt buộc (Mandatory)", "Live Team Presence", "Bảng điều khiển quân số trực tiếp: có mặt, đi muộn, làm online", "GET /api/v1/attendance/live-dashboard", "Hoàn thành (100%)", "Fullstack Team", "Hiển thị tức thì tại Dashboard Quản lý"),
    ("Phase 1", "Bắt buộc (Mandatory)", "Policy Quota Engine", "Thẩm định hạn ngạch đơn từ tự động trước khi cho phép nộp", "GET /api/v1/requests/quotas/remaining", "Hoàn thành (100%)", "Rule Engine Team", "Đi muộn <=2 lần/tháng, WFH <=4 ngày/tháng"),
    ("Phase 1", "Bắt buộc (Mandatory)", "Đơn Đi muộn / Về sớm", "Nộp đơn giải trình đi muộn hoặc về sớm tối đa 60 phút/lần", "POST /api/v1/requests", "Hoàn thành (100%)", "HR Team", "Type LATE_IN / EARLY_OUT, kiểm tra hạn ngạch"),
    ("Phase 1", "Bắt buộc (Mandatory)", "Đơn Làm việc từ xa WFH", "Nộp đơn WFH tối đa 4 ngày/tháng, bắt buộc nộp trước 24 giờ", "POST /api/v1/requests", "Hoàn thành (100%)", "HR Team", "Tự động cảnh báo nếu nộp sát giờ làm việc"),
    ("Phase 1", "Bắt buộc (Mandatory)", "Đơn Nghỉ phép năm", "Nộp đơn nghỉ phép trừ dần vào quỹ phép cá nhân (12 ngày chuẩn)", "POST /api/v1/requests", "Hoàn thành (100%)", "HR Team", "Cập nhật bảng employee_leave_balances"),
    ("Phase 1", "Bắt buộc (Mandatory)", "Đơn Nghỉ ốm mẫu C65-HD", "Nộp đơn nghỉ ốm BHXH bắt buộc đính kèm link chứng từ y tế C65", "POST /api/v1/requests", "Hoàn thành (100%)", "Compliance Team", "Chặn nộp nếu thiếu đính kèm ERR_ATTACHMENT_REQUIRED"),
    ("Phase 1", "Bắt buộc (Mandatory)", "Đơn Bổ sung công quên dập", "Bổ sung công quên dập trong thời hạn quy định 3 ngày làm việc", "POST /api/v1/requests", "Hoàn thành (100%)", "Compliance Team", "Chặn nộp nếu quá hạn ERR_DEADLINE_EXCEEDED"),
    ("Phase 1", "Bắt buộc (Mandatory)", "Hủy đơn xin phép", "Nhân viên hủy đơn từ đã nộp khi đơn còn ở trạng thái PENDING", "DELETE /api/v1/requests/{id}", "Hoàn thành (100%)", "HR Team", "Hoàn trả lại hạn ngạch quota tương ứng"),
    ("Phase 1", "Bắt buộc (Mandatory)", "Duyệt đơn từ 1-Click", "Quản lý / HR phê duyệt hoặc từ chối đơn có lý do phản hồi", "POST /api/v1/requests/{id}/review", "Hoàn thành (100%)", "Manager Team", "Cập nhật trạng thái và thông báo cho nhân viên"),
    ("Phase 1", "Bắt buộc (Mandatory)", "Bảng công cá nhân kỳ", "Nhân viên xem tổng hợp ngày công, giờ làm, số phút đi muộn kỳ lương", "GET /api/v1/timesheets/my-timesheet", "Hoàn thành (100%)", "Payroll Team", "Dữ liệu tổng hợp từ monthly_timesheets"),
    ("Phase 1", "Bắt buộc (Mandatory)", "Cổng Khiếu nại công 48h", "Nhân viên gửi khiếu nại sai lệch ngày công trong thời hạn 48 giờ", "POST /api/v1/timesheets/disputes", "Hoàn thành (100%)", "Payroll Team", "Kèm lý do và thời gian xảy ra sai sót dập thẻ"),
    ("Phase 1", "Bắt buộc (Mandatory)", "Xử lý Khiếu nại & Hồi tố", "HR chấp thuận bù công tự động ghi nhận bút toán hồi tố kỳ sau", "POST /api/v1/timesheets/admin/disputes/{id}/resolve", "Hoàn thành (100%)", "Payroll Team", "Ghi nhận vào payroll_retro_adjustments"),
    ("Phase 1", "Bắt buộc (Mandatory)", "Tổng hợp dữ liệu kỳ công", "Kích hoạt tính toán ngày công thực tế toàn bộ nhân viên công ty", "POST /api/v1/timesheets/admin/periods/{id}/aggregate", "Hoàn thành (100%)", "Payroll Team", "Chạy background engine quét toàn bộ lượt punch"),
    ("Phase 1", "Bắt buộc (Mandatory)", "Khóa sổ bất biến kỳ lương", "Khóa kỳ công sang trạng thái LOCKED, ngăn chặn mọi can thiệp sau 48h", "POST /api/v1/timesheets/admin/periods/{id}/lock", "Hoàn thành (100%)", "Audit & Security Team", "Kỳ công bất biến, chống sửa đổi gian lận lương"),
    ("Phase 1", "Bắt buộc (Mandatory)", "Xuất File CSV Kế toán", "Xuất bảng công chuẩn UTF-8 BOM mở không lỗi font tiếng Việt", "GET /api/v1/timesheets/admin/periods/{id}/export-csv", "Hoàn thành (100%)", "Accounting Integration Team", "Chuẩn hóa định dạng phục vụ phần mềm kế toán"),
    ("Phase 1", "Bắt buộc (Mandatory)", "Sơ đồ tổ chức phòng ban", "Quản lý danh mục phòng ban đa cấp cha - con", "GET, POST /api/v1/departments", "Hoàn thành (100%)", "Admin Team", "Gắn kết trưởng phòng và danh sách nhân sự"),
    ("Phase 1", "Bắt buộc (Mandatory)", "Danh bạ & Quyền RBAC", "Quản trị danh sách nhân viên, cấp vai trò EMPLOYEE/MANAGER/HR", "GET, POST, PUT /api/v1/admin/employees", "Hoàn thành (100%)", "Admin Team", "Cập nhật thông tin phòng ban, hợp đồng lao động"),
    ("Phase 1", "Bắt buộc (Mandatory)", "Quản lý Ca làm việc", "Cấu hình giờ vào/ra ca, khoảng nghỉ trưa, công chuẩn 8.0 giờ", "GET, POST /api/v1/admin/settings/shifts", "Hoàn thành (100%)", "Policy Team", "Hỗ trợ ca cố định Fixed và ca linh hoạt"),
    ("Phase 1", "Bắt buộc (Mandatory)", "Lịch nghỉ lễ hưởng lương", "Cấu hình danh mục ngày nghỉ lễ Tết hưởng 100% lương", "GET, POST /api/v1/admin/settings/holidays", "Hoàn thành (100%)", "Policy Team", "Hệ thống tự động tính ngày lễ không bị tính vắng"),
    ("Phase 1", "Bắt buộc (Mandatory)", "Hiệu chỉnh Policy Rules", "Điều chỉnh tham số JSON của bộ quy tắc không cần restart server", "GET, PUT /api/v1/admin/settings/policies", "Hoàn thành (100%)", "Rule Engine Team", "Linh hoạt thay đổi hạn ngạch và thời gian ân hạn"),

    # Phase 2
    ("Phase 2", "Bắt buộc (Mandatory)", "Bật Camera Quét QR Web", "Quét trực tiếp mã Dynamic QR trên màn hình Kiosk bằng camera web", "CameraQrScannerModal.jsx", "Hoàn thành (100%)", "Frontend & UX Team", "Khung laser xanh, jsQR frame-by-frame, âm thanh beep"),
    ("Phase 2", "Nâng cao (Enterprise)", "1-Click Kiosk Fallback", "Nút bấm tiện ích lấy nhanh mã QR đang xoay vòng từ Kiosk sảnh", "GET /api/v1/kiosk/current-qr", "Hoàn thành (100%)", "QA & Demo Team", "Phục vụ kiểm thử khi môi trường web thiếu webcam"),
    ("Phase 2", "Gợi ý / Tiện ích (Nice to have)", "Tải ảnh QR từ máy", "Tải tệp ảnh chụp QR từ máy tính để giải mã bằng HTML5 Canvas", "CameraQrScannerModal.jsx", "Hoàn thành (100%)", "UX Team", "Giải mã offline tiện dụng"),
    ("Phase 2", "Gợi ý / Tiện ích (Nice to have)", "Đổi Camera & Flash Torch", "Chuyển đổi camera trước/sau và bật đèn flash pin khi quét thiếu sáng", "CameraQrScannerModal.jsx", "Hoàn thành (100%)", "UX Team", "Hỗ trợ trên trình duyệt di động"),
    ("Phase 2", "Bắt buộc (Mandatory)", "Lưới Lịch công 30 Ngày", "Hiển thị ô lịch 30 ngày trực quan theo màu sắc trạng thái từng ngày", "GET /api/v1/timesheets/calendar", "Hoàn thành (100%)", "Frontend & Core Team", "Màu sắc: Bình thường, Đi muộn, WFH, Phép, Nghỉ ốm"),
    ("Phase 2", "Bắt buộc (Mandatory)", "Bảng công chi tiết từng ngày", "Bảng chi tiết ngày, ca làm, giờ vào/ra, tổng giờ, phút đi muộn", "GET /api/v1/timesheets/calendar", "Hoàn thành (100%)", "Frontend & Core Team", "Table View chi tiết cho cả nhân viên và quản lý"),
    ("Phase 2", "Nâng cao (Enterprise)", "Tổng quan Cả năm 12 Tháng", "Thẻ KPI tổng hợp 12 tháng: ngày công chuẩn, ngày làm, tỷ lệ chuyên cần", "GET /api/v1/timesheets/yearly-overview", "Hoàn thành (100%)", "Data & Frontend Team", "Phân tích xu hướng làm việc dài hạn của nhân sự"),
    ("Phase 2", "Nâng cao (Enterprise)", "Chi tiết ngày & Khiếu nại", "Nhấp vào ngày công để xem timeline dập thẻ và khiếu nại 1-click", "DetailedTimesheetView.jsx", "Hoàn thành (100%)", "UX & Fullstack Team", "Tự động điền ngày công vào form khiếu nại 48h"),
    ("Phase 2", "Bắt buộc (Mandatory)", "Xem công đa nhân sự", "Quản lý / HR chọn xem bảng công chi tiết của bất kỳ nhân viên nào", "DetailedTimesheetView.jsx", "Hoàn thành (100%)", "Manager Team", "Dropdown chuyển đổi nhân sự nhanh chóng"),
    ("Phase 2", "Nâng cao (Enterprise)", "Executive Presence Gauge", "Đồng hồ đo tỷ lệ hiện diện trực quan phần trăm quân số có mặt", "GET /api/v1/timesheets/admin/analytics", "Hoàn thành (100%)", "Executive BI Team", "Màu sắc cảnh báo theo ngưỡng chuyên cần"),
    ("Phase 2", "Nâng cao (Enterprise)", "Executive KPI Dashboard", "6 thẻ chỉ số điều hành: Tổng quân số, Đi làm, Đúng giờ, Đi muộn, WFH", "GET /api/v1/timesheets/admin/analytics", "Hoàn thành (100%)", "Executive BI Team", "Báo cáo điều hành chuyên sâu cho Ban Giám Đốc"),
    ("Phase 2", "Nâng cao (Enterprise)", "Chuyên cần theo phòng ban", "Biểu đồ so sánh tỷ lệ đi làm giữa các phòng ban trong công ty", "GET /api/v1/timesheets/admin/analytics", "Hoàn thành (100%)", "Executive BI Team", "Phát hiện phòng ban có tỷ lệ vắng cao"),
    ("Phase 2", "Nâng cao (Enterprise)", "Xu hướng chuyên cần 6 tháng", "Biểu đồ cột trực quan theo dõi tỷ lệ đi làm 6 tháng liên tiếp", "GET /api/v1/timesheets/admin/analytics", "Hoàn thành (100%)", "Executive BI Team", "Phân tích biến động quân số chu kỳ dài hạn"),
    ("Phase 2", "Nâng cao (Enterprise)", "Leaderboard Top 5 Đi muộn", "Bảng xếp hạng 5 nhân sự đi muộn nhiều nhất kèm số phút và phòng ban", "GET /api/v1/timesheets/admin/analytics", "Hoàn thành (100%)", "HR Performance Team", "Hỗ trợ nhắc nhở kỷ luật lao động"),
    ("Phase 2", "Bắt buộc (Mandatory)", "Full CRUD Phòng ban", "Xem chi tiết thành viên, Cập nhật thông tin, Xóa phòng ban", "PUT, DELETE /api/v1/departments/admin/{id}", "Hoàn thành (100%)", "Admin Team", "Kiểm tra ràng buộc phòng ban không còn nhân sự"),
    ("Phase 2", "Bắt buộc (Mandatory)", "Full CRUD Nhân sự", "Xem chi tiết hồ sơ & thiết bị, Cập nhật quyền, Ngừng hoạt động", "GET, DELETE /api/v1/admin/employees/{id}", "Hoàn thành (100%)", "Admin Team", "Vô hiệu hóa tài khoản khi nhân viên nghỉ việc"),
    ("Phase 2", "Bắt buộc (Mandatory)", "Kích hoạt lại Thiết bị", "Kích hoạt lại thiết bị chấm công sau khi đã bị thu hồi quyền", "POST /api/v1/devices/admin/{id}/activate", "Hoàn thành (100%)", "Security Team", "Khôi phục trạng thái ACTIVE cho máy di động"),
    ("Phase 2", "Bắt buộc (Mandatory)", "Full CRUD Ca làm việc", "Xem chi tiết giờ làm & nghỉ trưa, Cập nhật ca, Xóa ca làm", "PUT, DELETE /api/v1/admin/settings/shifts/{id}", "Hoàn thành (100%)", "Policy Team", "Quản lý ca linh hoạt theo nhu cầu vận hành"),
    ("Phase 2", "Bắt buộc (Mandatory)", "Full CRUD Lịch nghỉ lễ", "Xem chi tiết chế độ lương, Cập nhật ngày lễ, Xóa ngày nghỉ lễ", "PUT, DELETE /api/v1/admin/settings/holidays/{id}", "Hoàn thành (100%)", "Policy Team", "Quản trị lịch lễ hàng năm chính xác"),
    ("Phase 2", "Bắt buộc (Mandatory)", "Actionable Email 1-Click", "Email HTML có nút Duyệt / Từ chối mã hóa HMAC Token 24 giờ", "GET /api/v1/actions/quick-approve", "Hoàn thành (100%)", "Integration Team", "Phê duyệt đơn siêu tốc không cần mở website"),
    ("Phase 2", "Bắt buộc (Mandatory)", "Single-Use Approval Token", "Cơ chế bảo mật Token duy nhất, vô hiệu hóa sau 1 lần bấm", "Redis ONE_CLICK_USED:<hash>", "Hoàn thành (100%)", "Security Team", "Ngăn chặn click đúp hoặc click lặp lại"),
    ("Phase 2", "Bắt buộc (Mandatory)", "Google Chat Card v2", "Bắn thẻ tương tác cardsV2 vào Google Chat Space qua Webhook", "POST /api/v1/admin/notifications/test-chat", "Hoàn thành (100%)", "Integration Team", "Tương tác trực tiếp trên app Google Chat điện thoại"),
    ("Phase 2", "Bắt buộc (Mandatory)", "Cảnh báo an ninh GPS Chat", "Tự động gửi cảnh báo đỏ khẩn cấp khi phát hiện gian lận GPS", "GpsMismatchEvent -> GoogleChatService", "Hoàn thành (100%)", "Security & Notif Team", "Gửi vào Space #hr-security-alerts tức thì"),
    ("Phase 2", "Bắt buộc (Mandatory)", "Bản tin điểm danh 09:00", "Tự động phát bản tin quân số đi làm, đi muộn, WFH lúc 09:00 sáng", "POST /api/v1/admin/notifications/daily-bulletin", "Hoàn thành (100%)", "Notification Team", "Gửi vào Space chung #chamcong-thongbao-chung"),
    ("Phase 2", "Nâng cao (Enterprise)", "Simulator Google Chat v2", "Bộ giả lập thẻ Google Chat Card v2 tương tác trực quan trên UI", "ManagerPortal.jsx Tab 7", "Hoàn thành (100%)", "Frontend Team", "Mô phỏng trải nghiệm người dùng trước khi gửi thật"),
    ("Phase 2", "Nâng cao (Enterprise)", "Notification Audit Logs", "Bảng nhật ký kiểm toán toàn bộ thông báo Email và Chat đã phát", "GET /api/v1/admin/notifications/logs", "Hoàn thành (100%)", "Audit Team", "Theo dõi trạng thái SENT, SIMULATED, FAILED"),

    # Phase 3
    ("Phase 3", "Bắt buộc (Mandatory)", "Đăng ký Làm thêm giờ OT", "Nộp đơn đăng ký làm thêm giờ trước ca làm việc", "POST /api/v1/requests/ot", "Kế hoạch (Roadmap)", "Core Team", "Hỗ trợ lý do, dự kiến số giờ và công việc cụ thể"),
    ("Phase 3", "Bắt buộc (Mandatory)", "Tính hệ số lương OT tự động", "Tự động tính hệ số lương OT 150% ngày thường, 200% cuối tuần, 300% lễ", "Policy Engine OT Calculator", "Kế hoạch (Roadmap)", "Rule Engine Team", "Tuân thủ nghiêm ngặt Bộ luật Lao động Việt Nam"),
    ("Phase 3", "Bắt buộc (Mandatory)", "Kiểm soát trần giờ làm thêm", "Chặn nộp đơn OT khi vượt trần 40 giờ/tháng hoặc 200 giờ/năm", "Policy Engine OT Limiter", "Kế hoạch (Roadmap)", "Compliance Team", "Ngăn chặn vi phạm trần thời gian làm thêm luật định"),
    ("Phase 3", "Nâng cao (Enterprise)", "Xếp ca kíp tự động thông minh", "Thuật toán phân ca kíp tự động cho chuỗi bán lẻ, nhà máy trực 24/7", "POST /api/v1/admin/shifts/roster", "Kế hoạch (Roadmap)", "Algorithms Team", "Tự động kiểm tra nghỉ giữa 2 ca tối thiểu 12 tiếng"),
    ("Phase 3", "Gợi ý / Tiện ích (Nice to have)", "Đề xuất Đổi ca làm việc", "Nhân viên gửi yêu cầu đổi ca trực tiếp cho đồng nghiệp phê duyệt", "POST /api/v1/requests/shift-swap", "Gợi ý (Roadmap)", "Frontend & Workflow Team", "Giảm tải thao tác cho quản lý đội ngũ"),
    ("Phase 3", "Bắt buộc (Mandatory)", "AI Nhận diện khuôn mặt FaceID", "Quét sinh trắc học khuôn mặt trực tiếp ngay khi mở camera quét QR", "Biometric Face Recognition Service", "Kế hoạch (Roadmap)", "AI / Computer Vision Team", "Chống gian lận tuyệt đối người cầm máy"),
    ("Phase 3", "Bắt buộc (Mandatory)", "Face Liveness Detection", "Kiểm tra chuyển động mắt/đầu chống dùng ảnh tĩnh chụp lại", "Face Anti-Spoofing Engine", "Kế hoạch (Roadmap)", "AI / Security Team", "Ngăn chặn replay photo từ điện thoại khác"),
    ("Phase 3", "Nâng cao (Enterprise)", "Đóng gói PWA di động", "Cài đặt ứng dụng trực tiếp từ trình duyệt Safari/Chrome lên điện thoại", "Manifest.json & ServiceWorker", "Kế hoạch (Roadmap)", "Mobile Web Team", "Trải nghiệm mượt mà như app native"),
    ("Phase 3", "Gợi ý / Tiện ích (Nice to have)", "App Native iOS / Android", "Ứng dụng di động chuyên biệt xây dựng bằng React Native / Flutter", "Mobile Native App Repository", "Gợi ý (Roadmap)", "Mobile Team", "Tận dụng tối đa phần cứng FaceID / Fingerprint"),
    ("Phase 3", "Gợi ý / Tiện ích (Nice to have)", "Định vị nền ngầm Geofencing", "Tự động gửi push notification nhắc dập thẻ khi bước vào vùng văn phòng", "Background Geolocation Service", "Gợi ý (Roadmap)", "Mobile Team", "Giảm thiểu tối đa tình trạng quên dập thẻ"),
    ("Phase 3", "Nâng cao (Enterprise)", "MFA Xác thực 2 bước", "Xác thực 2 yếu tố Google Authenticator/OTP cho tài khoản Quản lý/HR", "POST /api/v1/auth/mfa/verify", "Kế hoạch (Roadmap)", "Security Team", "Bảo vệ các thao tác nhạy cảm khóa bảng lương"),
    ("Phase 3", "Nâng cao (Enterprise)", "Table Partitioning PostgreSQL", "Phân vùng bảng attendance_punches theo tháng để tăng tốc truy vấn", "PostgreSQL Partition by Range", "Kế hoạch (Roadmap)", "DBA & Infrastructure Team", "Đáp ứng quy mô 5.000 - 10.000 nhân sự"),

    # Phase 4
    ("Phase 4", "Bắt buộc (Mandatory)", "Tính lương tự động Payroll", "Tự động tính lương thực nhận từ dữ liệu bảng công kỳ đã khóa", "POST /api/v1/payroll/generate", "Kế hoạch (Roadmap)", "Payroll Engine Team", "Tính lương cơ bản, phụ cấp, OT, phạt đi muộn"),
    ("Phase 4", "Bắt buộc (Mandatory)", "Tính Thuế TNCN tự động", "Tự động tính thuế TNCN theo biểu lũy tiến từng phần và giảm trừ", "PayrollTaxCalculator Service", "Kế hoạch (Roadmap)", "Accounting Team", "Tự động cập nhật biểu thuế mới nhất của Bộ Tài Chính"),
    ("Phase 4", "Bắt buộc (Mandatory)", "Trừ Bảo hiểm bắt buộc", "Tự động trích trừ các khoản BHXH 8%, BHYT 1.5%, BHTN 1%", "PayrollInsurance Service", "Kế hoạch (Roadmap)", "Compliance Team", "Khớp số liệu nộp bảo hiểm xã hội nhà nước"),
    ("Phase 4", "Bắt buộc (Mandatory)", "Gửi Phiếu lương điện tử e-Payslip", "Tự động xuất và gửi phiếu lương có mật khẩu mã hóa qua Gmail", "POST /api/v1/payroll/send-payslips", "Kế hoạch (Roadmap)", "Notification Team", "Bảo mật thông tin thu nhập của từng nhân viên"),
    ("Phase 4", "Nâng cao (Enterprise)", "Tích hợp MISA AMIS Kế toán", "Webhook đồng bộ tự động bút toán lương sang phần mềm MISA", "POST /api/v1/webhooks/misa", "Kế hoạch (Roadmap)", "Integration Team", "Loại bỏ thao tác nhập liệu thủ công của kế toán"),
    ("Phase 4", "Nâng cao (Enterprise)", "Tích hợp ERP FAST / SAP", "Open API chuẩn hóa kết nối với hệ thống FAST, Bravo, SAP", "POST /api/v1/webhooks/erp", "Kế hoạch (Roadmap)", "Enterprise Solution Team", "Tích hợp cho doanh nghiệp quy mô tập đoàn"),
    ("Phase 4", "Gợi ý / Tiện ích (Nice to have)", "AI Dự báo biến động nhân sự", "Mô hình Machine Learning dự báo tỷ lệ nghỉ việc và nguy cơ quá tải", "AI Predictive Analytics Service", "Gợi ý (Roadmap)", "Data Science Team", "Hỗ trợ ban lãnh đạo chủ động nhân lực"),
    ("Phase 4", "Gợi ý / Tiện ích (Nice to have)", "Khảo sát độ gắn kết eNPS", "Tự động gửi khảo sát vi mô gắn kết nhân sự sau các mốc dập thẻ", "POST /api/v1/surveys/pulse", "Gợi ý (Roadmap)", "HR Culture Team", "Đo lường mức độ hài lòng của nhân viên")
]

for idx, f in enumerate(features_data, 1):
    row_num = idx + 1
    phase, priority, func, desc, endpoint, status, assignee, note = f
    row_values = [idx, phase, priority, func, desc, endpoint, status, assignee, note]
    ws1.append(row_values)
    
    # Styling row
    ws1.row_dimensions[row_num].height = 24
    
    # Phase background
    p_fill = fill_p1 if "Phase 1" in phase else fill_p2 if "Phase 2" in phase else fill_p3 if "Phase 3" in phase else fill_p4
    
    for c_idx in range(1, len(row_values) + 1):
        cell = ws1.cell(row=row_num, column=c_idx)
        cell.font = data_font
        cell.border = thin_border
        
        # Center specific columns
        if c_idx in [1, 2, 3, 7, 8]:
            cell.alignment = Alignment(horizontal="center", vertical="center")
        else:
            cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
            
        if c_idx == 4: # Function bold
            cell.font = bold_data_font
        elif c_idx == 6: # Code endpoint font
            cell.font = code_font
            
        # Status styling
        if c_idx == 7:
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

headers2 = ["STT", "Phân Hệ / Nhóm Nghiệp Vụ", "Loại Kịch Bản (Scenario Type)", "Function (Tính Năng)", "Mô Tả Kịch Bản Biên / Lỗi (Edge Case Description)", "BackEnd API Endpoint", "Status Xử Lý & Automation", "Assignee (Phụ Trách)", "Ghi Chú Kỹ Thuật (Exception Code & Cơ Chế Phòng Chống)"]
ws2.append(headers2)

for col_num, h in enumerate(headers2, 1):
    cell = ws2.cell(row=1, column=col_num)
    cell.font = header_font
    cell.fill = header_fill_tab2
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
ws2.row_dimensions[1].height = 32

edge_cases_data = [
    ("Xác thực & Bảo mật", "Ngoại lệ đăng nhập (Negative)", "Đăng nhập tài khoản", "Đăng nhập với email không tồn tại trong hệ thống", "POST /api/v1/auth/login", "Đã xử lý & Automated", "Security Team", "Trả về 401 Unauthorized, thông báo email không đúng"),
    ("Xác thực & Bảo mật", "Ngoại lệ đăng nhập (Negative)", "Đăng nhập tài khoản", "Đăng nhập với email đúng nhưng mật khẩu không khớp", "POST /api/v1/auth/login", "Đã xử lý & Automated", "Security Team", "Trả về 401 Unauthorized, bảo vệ chống brute-force"),
    ("Xác thực & Bảo mật", "Bảo mật Token (Security Attack)", "Xác thực JWT", "Gửi request với JWT Token bị giả mạo chữ ký số hoặc đã hết hạn", "JwtAuthFilter / Tất cả API", "Đã xử lý & Automated", "Security Team", "JwtTokenProvider chặn đứng ở filter tầng Gateway (401/403)"),
    ("Xác thực & Bảo mật", "Phân quyền RBAC (Access Control)", "Bảo vệ đường dẫn Admin", "Tài khoản nhân viên thường gọi API cấu hình quản trị hệ thống", "GET /api/v1/admin/settings/policies", "Đã xử lý & Automated", "Security Team", "Spring Security chặn 403 Forbidden theo vai trò"),
    ("Xác thực & Bảo mật", "Phân quyền RBAC (Access Control)", "Bảo vệ đường dẫn Duyệt đơn", "Nhân viên thường cố tình gọi API phê duyệt đơn từ của đồng nghiệp", "POST /api/v1/requests/{id}/review", "Đã xử lý & Automated", "Security Team", "Chặn 403 Forbidden, chỉ MANAGER hoặc HR_ADMIN được gọi"),
    
    ("Thiết Bị Chấm Công", "Gian lận phần cứng (Anti-Fraud)", "Ràng buộc thiết bị 1-1", "Chấm công trên điện thoại lạ chưa đăng ký kích hoạt", "POST /api/v1/attendance/punch", "Đã xử lý & Automated", "Device Binding Team", "Trả về ERR_DEVICE_MISMATCH, chặn đứng chấm công hộ"),
    ("Thiết Bị Chấm Công", "Gian lận phần cứng (Anti-Fraud)", "Thiết bị bị thu hồi", "Chấm công trên thiết bị di động đã bị HR thu hồi quyền", "POST /api/v1/attendance/punch", "Đã xử lý & Automated", "Device Binding Team", "Trả về ERR_DEVICE_REVOKED, bắt buộc liên hệ HR kích hoạt lại"),
    ("Thiết Bị Chấm Công", "Ràng buộc dữ liệu (Constraint)", "Đăng ký thiết bị", "Nhân viên tự đăng ký thiết bị mới khi thiết bị cũ chưa được thu hồi", "POST /api/v1/devices/enroll", "Đã xử lý & Automated", "Device Binding Team", "Chặn ERR_DEVICE_ALREADY_REGISTERED, 1 tài khoản chỉ có 1 máy"),
    
    ("Kiosk Dynamic QR", "Kịch bản biên quá hạn (Boundary)", "Dynamic QR 5 giây", "Nhân viên quét mã Dynamic QR đã quá thời hạn hiệu lực 5 giây", "POST /api/v1/attendance/punch", "Đã xử lý & Automated", "Kiosk Core Team", "Redis TTL kiểm tra timestamp quá 5s -> Trả về ERR_QR_EXPIRED"),
    ("Kiosk Dynamic QR", "Tấn công giả mạo (Tampering Attack)", "Chữ ký số HMAC", "Kẻ xấu cố tình can thiệp sửa đổi timestamp hoặc chuỗi chữ ký số", "POST /api/v1/attendance/punch", "Đã xử lý & Automated", "Security Team", "HmacSHA256 kiểm tra chữ ký sai lệch -> Trả về ERR_INVALID_QR_SIGNATURE"),
    ("Kiosk Dynamic QR", "Tấn công Replay (Replay Attack)", "Dynamic QR Blacklist", "Chụp ảnh màn hình mã QR gửi qua Zalo cho đồng nghiệp quét lại", "POST /api/v1/attendance/punch", "Đã xử lý & Automated", "Security Team", "Redis Blacklist lưu hash payload đã dập -> Chặn ERR_REPLAY_ATTACK_DETECTED"),
    ("Kiosk Dynamic QR", "Ranh giới mạng (Geofencing)", "Dải mạng nội bộ IP", "Chấm công thường nhưng kết nối ngoài dải IP Wi-Fi văn phòng", "POST /api/v1/attendance/punch", "Đã xử lý & Automated", "Network Team", "Kiểm tra subnet 192.168.1.0/24 -> Chặn ERR_IP_SUBNET_MISMATCH"),
    
    ("Chấm Khẩn Cấp GPS", "Gian lận vị trí GPS (Fraud)", "Chấm công khẩn cấp", "Nhân viên gửi tọa độ GPS cách văn phòng vượt ngưỡng an toàn (>100m)", "POST /api/v1/attendance/punch-emergency", "Đã xử lý & Automated", "Algorithms Team", "Haversine Distance > 100m -> Gắn cờ cảnh báo FLAG_LOCATION_MISMATCH"),
    ("Chấm Khẩn Cấp GPS", "Gian lận nghiêm trọng (Fraud Alert)", "Chấm công khẩn cấp", "Nhân viên gửi tọa độ cách xa văn phòng > 5.000m (5km)", "POST /api/v1/attendance/punch-emergency", "Đã xử lý & Automated", "Security & Notif Team", "Gắn cờ gian lận nghiêm trọng & tự động bắn cảnh báo đỏ vào Google Chat"),
    ("Chấm Khẩn Cấp GPS", "Thiếu dữ liệu (Validation Error)", "Chấm công khẩn cấp", "Nhân viên tắt định vị GPS hoặc thiết bị không thu được tọa độ", "POST /api/v1/attendance/punch-emergency", "Đã xử lý & Automated", "Frontend & Core Team", "Kiểm tra latitude/longitude null -> Báo lỗi ERR_MISSING_GPS_COORDINATES"),
    
    ("Hạn Ngạch & Đơn Từ", "Vượt hạn ngạch số lần (Quota)", "Đơn Đi muộn", "Nhân viên nộp đơn xin đi muộn lần thứ 3 trong tháng (> 2 lần/tháng)", "POST /api/v1/requests", "Đã xử lý & Automated", "Rule Engine Team", "Policy Engine kiểm tra quota tháng -> Chặn ERR_QUOTA_EXCEEDED"),
    ("Hạn Ngạch & Đơn Từ", "Vượt thời lượng tối đa (Boundary)", "Đơn Đi muộn", "Nhân viên nộp đơn xin đi muộn 90 phút (> trần quy chế 60 phút)", "POST /api/v1/requests", "Đã xử lý & Automated", "Rule Engine Team", "Thời lượng vượt trần -> Chặn ERR_DURATION_EXCEEDED (tối đa 60p)"),
    ("Hạn Ngạch & Đơn Từ", "Vượt hạn ngạch ngày (Quota)", "Đơn WFH Làm từ xa", "Nhân viên nộp đơn xin WFH ngày thứ 5 trong tháng (> 4 ngày/tháng)", "POST /api/v1/requests", "Đã xử lý & Automated", "Rule Engine Team", "Hạn ngạch WFH tối đa 4 ngày -> Chặn ERR_WFH_QUOTA_EXCEEDED"),
    ("Hạn Ngạch & Đơn Từ", "Vi phạm thời gian báo trước (Rule)", "Đơn WFH Làm từ xa", "Nhân viên nộp đơn WFH sát giờ bắt đầu ca làm việc (chưa đủ 24 tiếng)", "POST /api/v1/requests", "Đã xử lý & Automated", "Rule Engine Team", "Quy chế yêu cầu báo trước 1 ngày -> Báo ERR_WFH_ADVANCE_NOTICE_REQUIRED"),
    ("Hạn Ngạch & Đơn Từ", "Quá hạn nộp đơn (Deadline)", "Đơn Bổ sung công", "Nhân viên nộp đơn bổ sung công cho ngày cách đây 4 ngày làm việc", "POST /api/v1/requests", "Đã xử lý & Automated", "Rule Engine Team", "Vượt hạn chót 3 ngày làm việc -> Chặn ERR_DEADLINE_EXCEEDED"),
    ("Hạn Ngạch & Đơn Từ", "Thiếu chứng từ y tế (Compliance)", "Đơn Nghỉ ốm BHXH", "Nhân viên nộp đơn nghỉ ốm nhưng không đính kèm tệp Mẫu C65-HD", "POST /api/v1/requests", "Đã xử lý & Automated", "Compliance Team", "Bắt buộc mẫu C65 theo luật BHXH -> Chặn ERR_ATTACHMENT_REQUIRED"),
    ("Hạn Ngạch & Đơn Từ", "Hết quỹ phép năm (Exhaustion)", "Đơn Nghỉ phép năm", "Nhân viên nộp đơn nghỉ phép khi số ngày phép tồn bằng 0 hoặc âm", "POST /api/v1/requests", "Đã xử lý & Automated", "HR Leave Team", "Kiểm tra leave_balance -> Báo lỗi ERR_INSUFFICIENT_LEAVE_BALANCE"),
    ("Hạn Ngạch & Đơn Từ", "Sai quy trình xử lý (Invalid State)", "Hủy đơn xin phép", "Nhân viên cố tình bấm hủy đơn đã được Quản lý phê duyệt APPROVED", "DELETE /api/v1/requests/{id}", "Đã xử lý & Automated", "HR Team", "Chỉ hủy khi PENDING -> Báo lỗi ERR_CANNOT_CANCEL_APPROVED_REQUEST"),
    ("Hạn Ngạch & Đơn Từ", "Thiếu lý do từ chối (Validation)", "Duyệt đơn từ", "Quản lý bấm Từ chối đơn nhưng để trống phần ý kiến phản hồi", "POST /api/v1/requests/{id}/review", "Đã xử lý & Automated", "Manager Team", "Bắt buộc giải thích lý do khi từ chối -> Báo lỗi ERR_COMMENT_REQUIRED"),
    
    ("Bảng Công & Kỳ Lương", "Quá hạn khiếu nại (Boundary)", "Cổng Khiếu nại 48h", "Nhân viên gửi khiếu nại công khi kỳ công đã mở quá hạn 48 giờ", "POST /api/v1/timesheets/disputes", "Đã xử lý & Automated", "Payroll Team", "Hết thời hạn 48h rà soát -> Chặn ERR_DISPUTE_EXPIRED"),
    ("Bảng Công & Kỳ Lương", "Vi phạm tính bất biến (Immutability)", "Khóa sổ kỳ công", "Cố tình bấm Tổng hợp lại dữ liệu cho kỳ công đã bị khóa LOCKED", "POST /api/v1/timesheets/admin/periods/{id}/aggregate", "Đã xử lý & Automated", "Security & Audit Team", "Kỳ công bất biến SHA-256 -> Chặn đứng ERR_PERIOD_LOCKED"),
    ("Bảng Công & Kỳ Lương", "Vi phạm tính bất biến (Immutability)", "Khóa sổ kỳ công", "Cố tình chèn thêm lượt chấm công dập thẻ vào kỳ đã khóa LOCKED", "POST /api/v1/attendance/punch", "Đã xử lý & Automated", "Security & Audit Team", "Dữ liệu kỳ đã chốt không thể sửa đổi -> Chặn ERR_IMMUTABLE_RECORD"),
    ("Bảng Công & Kỳ Lương", "Lỗi font chữ tiếng Việt (Compatibility)", "Xuất File CSV Lương", "Mở file CSV trên Microsoft Excel bị lỗi font tiếng Việt (Mojibake)", "GET /api/v1/timesheets/admin/periods/{id}/export-csv", "Đã xử lý & Automated", "Accounting Team", "Chèn Byte Order Mark UTF-8 BOM (0xEF, 0xBB, 0xBF) ở đầu stream"),
    
    ("Google Workspace", "Click lặp lại token (Replay Attack)", "Actionable Email", "Quản lý click nút Phê duyệt trên email lần thứ 2 sau khi đã duyệt", "GET /api/v1/actions/quick-approve", "Đã xử lý & Automated", "Integration Team", "Redis ONE_CLICK_USED vô hiệu hóa token -> Báo MÃ ĐÃ ĐƯỢC SỬ DỤNG"),
    ("Google Workspace", "Token email quá hạn (Expiration)", "Actionable Email", "Quản lý mở email bấm duyệt khi link phê duyệt đã quá thời hạn 24 giờ", "GET /api/v1/actions/quick-approve", "Đã xử lý & Automated", "Security Team", "Token HMAC hết hạn TTL 24h -> Báo MÃ ĐÃ HẾT HẠN"),
    ("Google Workspace", "Lỗi kết nối Webhook (Resilience)", "Google Chat Notification", "Webhook Google Chat bị sai URL, space bị xóa hoặc mạng gián đoạn", "GoogleChatNotificationService", "Đã xử lý & Automated", "Resilience Team", "Catch Exception, log FAILED vào Notification Audit Logs, không crash app"),
    
    ("Quản Trị Danh Mục", "Trùng lặp dữ liệu (Constraint)", "Quản lý Phòng ban", "Tạo phòng ban mới với mã code đã tồn tại trong cơ sở dữ liệu", "POST /api/v1/departments/admin", "Đã xử lý & Automated", "Admin Team", "Bắt lỗi Unique Constraint -> Báo lỗi ERR_DUPLICATE_DEPARTMENT_CODE"),
    ("Quản Trị Danh Mục", "Ràng buộc toàn vẹn (Integrity)", "Quản lý Phòng ban", "Xóa phòng ban khi trong phòng vẫn còn nhân viên đang làm việc", "DELETE /api/v1/departments/admin/{id}", "Đã xử lý & Automated", "Admin Team", "Kiểm tra Foreign Key -> Báo lỗi phòng ban còn nhân sự không thể xóa"),
    ("Quản Trị Danh Mục", "Logic giờ giấc ca làm (Validation)", "Quản lý Ca làm việc", "Cấu hình ca làm có giờ kết thúc trước giờ bắt đầu (không ca đêm)", "POST /api/v1/admin/settings/shifts", "Đã xử lý & Automated", "Policy Team", "Kiểm tra endTime > startTime -> Báo lỗi ERR_INVALID_SHIFT_HOURS"),
    ("Quản Trị Danh Mục", "Logic thời gian ngày lễ (Validation)", "Lịch Nghỉ Lễ", "Cấu hình ngày nghỉ lễ có ngày kết thúc trước ngày bắt đầu", "POST /api/v1/admin/settings/holidays", "Đã xử lý & Automated", "Policy Team", "Kiểm tra endDate >= startDate -> Báo lỗi ERR_INVALID_HOLIDAY_DATES"),
    ("Quản Trị Danh Mục", "Trùng lặp mã nhân sự (Constraint)", "Quản lý Nhân viên", "Thêm nhân viên mới với mã nhân viên hoặc email đã tồn tại", "POST /api/v1/admin/employees", "Đã xử lý & Automated", "Admin Team", "Bắt lỗi trùng mã/email -> Báo lỗi ERR_DUPLICATE_EMPLOYEE"),
    
    ("Giao Diện & Thiết Bị", "Từ chối quyền Camera (Browser Perm)", "Camera QR Scanner", "Người dùng bấm Block từ chối cấp quyền truy cập Camera trình duyệt", "CameraQrScannerModal.jsx", "Đã xử lý & Automated", "Frontend UX Team", "Hiển thị hướng dẫn mở quyền camera + nút fallback Lấy mã Kiosk 1-Click"),
    ("Giao Diện & Thiết Bị", "Ảnh không hợp lệ (Format Error)", "Tải ảnh QR từ máy", "Người dùng tải tệp ảnh không chứa mã QR hoặc ảnh chụp mờ nét", "CameraQrScannerModal.jsx", "Đã xử lý & Automated", "Frontend UX Team", "Báo lỗi Không tìm thấy mã QR hợp lệ trong ảnh, yêu cầu chọn ảnh khác")
]

for idx, e in enumerate(edge_cases_data, 1):
    row_num = idx + 1
    category, sc_type, func, desc, endpoint, status, assignee, note = e
    row_values = [idx, category, sc_type, func, desc, endpoint, status, assignee, note]
    ws2.append(row_values)
    
    ws2.row_dimensions[row_num].height = 24
    
    for c_idx in range(1, len(row_values) + 1):
        cell = ws2.cell(row=row_num, column=c_idx)
        cell.font = data_font
        cell.border = thin_border
        
        if c_idx in [1, 2, 3, 7, 8]:
            cell.alignment = Alignment(horizontal="center", vertical="center")
        else:
            cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
            
        if c_idx == 4:
            cell.font = bold_data_font
        elif c_idx == 6:
            cell.font = code_font
            
        if c_idx == 7:
            cell.fill = fill_edge_ok
            cell.font = font_edge_ok


# Auto-fit Column Widths for both sheets
for ws in [ws1, ws2]:
    for col in ws.columns:
        max_len = 0
        col_letter = get_column_letter(col[0].column)
        for cell in col:
            val_str = str(cell.value or '')
            if len(val_str) > max_len:
                max_len = len(val_str)
        # Apply optimal width
        if col[0].column == 1:
            ws.column_dimensions[col_letter].width = 8
        elif col[0].column in [2, 3]:
            ws.column_dimensions[col_letter].width = 24
        elif col[0].column == 4:
            ws.column_dimensions[col_letter].width = 30
        elif col[0].column == 5:
            ws.column_dimensions[col_letter].width = 46
        elif col[0].column == 6:
            ws.column_dimensions[col_letter].width = 38
        elif col[0].column == 7:
            ws.column_dimensions[col_letter].width = 22
        elif col[0].column == 8:
            ws.column_dimensions[col_letter].width = 24
        elif col[0].column == 9:
            ws.column_dimensions[col_letter].width = 48

# Save output
file_path_docs = "/Users/sang/Projects/App/SmartTimeChecking/docs/SmartTimeChecking_Feature_and_EdgeCase_Matrix.xlsx"
file_path_root = "/Users/sang/Projects/App/SmartTimeChecking/SmartTimeChecking_Feature_and_EdgeCase_Matrix.xlsx"
wb.save(file_path_docs)
wb.save(file_path_root)
print("SUCCESS: Excel workbook saved to:")
print(f" - {file_path_docs}")
print(f" - {file_path_root}")
