# TÀI LIỆU KỸ THUẬT 01: THIẾT KẾ CƠ SỞ DỮ LIỆU CHI TIẾT (DATA DICTIONARY & SCHEMA)
## Hệ quản trị CSDL: MySQL 8.0+ (Engine: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci)
Thư mục: `docs/technicals/01_DATABASE_DESIGN_SPECIFICATION.md`

---

## 1. NGUYÊN TẮC THIẾT KẾ DỮ LIỆU
1. **Khóa chính (Primary Key):** Sử dụng `VARCHAR(36)` lưu UUID v4 (chuẩn hóa tương thích đa hệ thống, dễ đồng bộ sang Keycloak/Kafka/RabbitMQ mà không lộ số thứ tự tăng dần).
2. **Chuẩn hóa Thời gian (Timezone):** Tất cả các cột `DATETIME` lưu trữ mốc thời gian UTC (`TIMESTAMP WITH TIME ZONE` hoặc `DATETIME` chuẩn UTC). Khi trả về Client qua Spring Boot sẽ serialize theo múi giờ `Asia/Ho_Chi_Minh` (UTC+7).
3. **Tính toàn vẹn & Ràng buộc (Integrity & Constraints):** Khóa ngoại `FOREIGN KEY` với các hành vi `ON DELETE RESTRICT` (dành cho các bảng kế toán/chấm công) hoặc `ON DELETE CASCADE` (dành cho bảng cấu hình phụ thuộc).
4. **Hiệu năng & Khóa dòng (Concurrency & Locking):** Các bảng có tần suất ghi cao (như `attendance_punches`) được tối ưu hóa chỉ số Index theo cặp `(employee_id, punch_time)`. Sử dụng `JSON` type cho các cấu hình biến thiên và ma trận ngày công 31 ngày.

---

## 2. TỪ ĐIỂN DỮ LIỆU CHI TIẾT (DATA DICTIONARY)

### Phân hệ 1: Tổ chức, Nhân sự & Liên kết Danh tính (IAM / Keycloak)

#### Bảng 1: `departments` (Phòng ban / Bộ phận)
Lưu trữ cây phân cấp cơ cấu tổ chức doanh nghiệp.
| Tên cột | Kiểu dữ liệu | Null | Khóa | Mặc định | Ý nghĩa & Quy tắc nghiệp vụ |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | `VARCHAR(36)` | NO | PK | - | Định danh duy nhất (UUID) |
| `code` | `VARCHAR(50)` | NO | UK | - | Mã phòng ban viết tắt (ví dụ: `IT_DEPT`, `HR_DEPT`, `FINANCE`) |
| `name` | `VARCHAR(150)` | NO | - | - | Tên phòng ban đầy đủ (ví dụ: `Khối Công nghệ Thông tin`) |
| `parent_id` | `VARCHAR(36)` | YES | FK | NULL | Trỏ tới `departments(id)` để tạo cây phân cấp tổ chức đa tầng |
| `manager_id` | `VARCHAR(36)` | YES | FK | NULL | Trưởng phòng ban, trỏ tới `employees(id)` |
| `is_active` | `BOOLEAN` | NO | - | `TRUE` | Trạng thái hoạt động |
| `created_at` | `DATETIME` | NO | - | `CURRENT_TIMESTAMP` | Thời điểm tạo |
| `updated_at` | `DATETIME` | NO | - | `CURRENT_TIMESTAMP` | Thời điểm cập nhật cuối |

#### Bảng 2: `employees` (Hồ sơ Nhân viên)
Lưu thông tin nhân sự trong app và ánh xạ với tài khoản Keycloak.
| Tên cột | Kiểu dữ liệu | Null | Khóa | Mặc định | Ý nghĩa & Quy tắc nghiệp vụ |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | `VARCHAR(36)` | NO | PK | - | UUID nhân viên nội bộ hệ thống |
| `keycloak_user_id`| `VARCHAR(64)` | NO | UK | - | **Subject ID (`sub`) từ Keycloak JWT**, dùng để liên kết danh tính khi login |
| `employee_code` | `VARCHAR(30)` | NO | UK | - | Mã nhân viên (ví dụ: `EMP00123`) |
| `full_name` | `VARCHAR(150)` | NO | - | - | Họ và tên đầy đủ |
| `email` | `VARCHAR(150)` | NO | UK | - | Email doanh nghiệp |
| `department_id` | `VARCHAR(36)` | YES | FK | NULL | Trỏ tới `departments(id)` |
| `direct_manager_id`| `VARCHAR(36)`| YES | FK | NULL | **Người quản lý trực tiếp** (duyệt đơn đi muộn/WFH/nghỉ phép cấp 1) |
| `contract_type` | `VARCHAR(50)` | NO | - | `'OFFICIAL'`| Loại hợp đồng: `OFFICIAL` (chính thức), `PROBATION` (thử việc), `INTERN` |
| `start_date` | `DATE` | NO | - | - | Ngày bắt đầu làm việc (dùng tính thâm niên cộng ngày phép năm) |
| `app_role` | `VARCHAR(30)` | NO | - | `'EMPLOYEE'`| Phân quyền ứng dụng: `EMPLOYEE`, `MANAGER`, `HR_ADMIN`, `SYS_ADMIN` |
| `is_active` | `BOOLEAN` | NO | - | `TRUE` | `FALSE` khi nhân viên đã nghỉ việc |
| `created_at` | `DATETIME` | NO | - | `CURRENT_TIMESTAMP` | Thời điểm tạo |
| `updated_at` | `DATETIME` | NO | - | `CURRENT_TIMESTAMP` | Thời điểm cập nhật cuối |

#### Bảng 3: `registered_devices` (Thiết bị Chấm công đã Đăng ký)
Quản lý ràng buộc 1 tài khoản - 1 thiết bị chống chấm công hộ.
| Tên cột | Kiểu dữ liệu | Null | Khóa | Mặc định | Ý nghĩa & Quy tắc nghiệp vụ |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | `VARCHAR(36)` | NO | PK | - | UUID thiết bị |
| `employee_id` | `VARCHAR(36)` | NO | FK | - | Trỏ tới `employees(id)` |
| `device_token` | `VARCHAR(255)`| NO | UK | - | Chuỗi băm kết hợp Fingerprint phần cứng + UUID an toàn |
| `device_name` | `VARCHAR(100)`| YES | - | NULL | Tên thiết bị do trình duyệt cung cấp (ví dụ: `iPhone 15 Pro, iOS 17.4`) |
| `platform` | `VARCHAR(50)` | YES | - | NULL | Hệ điều hành: `iOS`, `Android`, `macOS`, `Windows` |
| `status` | `VARCHAR(30)` | NO | - | `'ACTIVE'` | Trạng thái: `ACTIVE`, `REVOKED` (bị hủy), `PENDING_APPROVAL` (chờ HR duyệt đổi) |
| `enrolled_at` | `DATETIME` | NO | - | `CURRENT_TIMESTAMP` | Ngày đăng ký |
| `last_used_at` | `DATETIME` | YES | - | NULL | Thời điểm chấm công gần nhất bằng máy này |

---

### Phân hệ 2: Ca làm việc, Lịch Ngày lễ & Luật động (Rules Engine)

#### Bảng 4: `work_shifts` (Danh mục Ca làm việc)
| Tên cột | Kiểu dữ liệu | Null | Khóa | Mặc định | Ý nghĩa & Quy tắc nghiệp vụ |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | `VARCHAR(36)` | NO | PK | - | UUID ca làm việc |
| `shift_code` | `VARCHAR(50)` | NO | UK | - | Mã ca (ví dụ: `OFFICE_DEFAULT`, `SHIFT_MORNING`, `SHIFT_NIGHT`) |
| `shift_name` | `VARCHAR(100)`| NO | - | - | Tên hiển thị (ví dụ: `Ca Hành chính 8h30 - 17h30`) |
| `shift_type` | `VARCHAR(30)` | NO | - | `'FIXED'` | Loại ca: `FIXED` (cố định), `FLEXIBLE` (linh hoạt), `SPLIT` (ca gãy) |
| `start_time` | `TIME` | NO | - | - | Giờ bắt đầu ca (ví dụ: `08:30:00`) |
| `end_time` | `TIME` | NO | - | - | Giờ kết thúc ca (ví dụ: `17:30:00`) |
| `lunch_break_start`| `TIME` | YES | - | NULL | Bắt đầu nghỉ trưa (ví dụ: `12:00:00`) |
| `lunch_break_end` | `TIME` | YES | - | NULL | Kết thúc nghỉ trưa (ví dụ: `13:00:00`) |
| `standard_work_hours`| `DECIMAL(4,2)`| NO | - | `8.00` | Số giờ công chuẩn quy đổi (1.0 công = 8.0 giờ) |
| `is_active` | `BOOLEAN` | NO | - | `TRUE` | Kích hoạt sử dụng |

#### Bảng 5: `employee_shift_assignments` (Gán Ca cho Nhân viên / Phòng ban)
| Tên cột | Kiểu dữ liệu | Null | Khóa | Mặc định | Ý nghĩa & Quy tắc nghiệp vụ |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | `VARCHAR(36)` | NO | PK | - | UUID phân ca |
| `shift_id` | `VARCHAR(36)` | NO | FK | - | Trỏ tới `work_shifts(id)` |
| `target_type` | `VARCHAR(30)` | NO | - | `'DEPARTMENT'` | `DEPARTMENT` (áp dụng cả phòng) hoặc `EMPLOYEE` (ghi đè cá nhân) |
| `target_id` | `VARCHAR(36)` | NO | - | - | ID của phòng ban hoặc nhân viên tương ứng |
| `effective_date` | `DATE` | NO | - | - | Ngày bắt đầu áp dụng ca |
| `expire_date` | `DATE` | YES | - | NULL | Ngày kết thúc áp dụng (NULL = áp dụng vô thời hạn) |

#### Bảng 6: `holiday_calendars` (Lịch Ngày lễ, Tết & Nghỉ bù)
| Tên cột | Kiểu dữ liệu | Null | Khóa | Mặc định | Ý nghĩa & Quy tắc nghiệp vụ |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | `VARCHAR(36)` | NO | PK | - | UUID ngày lễ |
| `holiday_year`| `INT` | NO | - | - | Năm áp dụng (ví dụ: `2026`) |
| `holiday_name`| `VARCHAR(150)`| NO | - | - | Tên ngày nghỉ (ví dụ: `Tết Dương Lịch`, `Giải phóng Miền Nam 30/4`) |
| `start_date` | `DATE` | NO | - | - | Ngày bắt đầu nghỉ |
| `end_date` | `DATE` | NO | - | - | Ngày kết thúc nghỉ |
| `is_paid` | `BOOLEAN` | NO | - | `TRUE` | `TRUE` = Hưởng 100% lương công ty chi trả |
| `compensatory_date`| `DATE` | YES | - | NULL | Ngày làm bù hoặc nghỉ bù nếu trùng vào cuối tuần |

#### Bảng 7: `policy_rules` (Cấu hình Luật & Hạn ngạch có Ngày hiệu lực)
| Tên cột | Kiểu dữ liệu | Null | Khóa | Mặc định | Ý nghĩa & Quy tắc nghiệp vụ |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | `VARCHAR(36)` | NO | PK | - | UUID luật |
| `rule_category`| `VARCHAR(50)`| NO | - | - | Danh mục: `LATE_EARLY`, `MISSED_PUNCH`, `WFH`, `ANNUAL_LEAVE` |
| `target_type` | `VARCHAR(30)` | NO | - | `'CONTRACT_TYPE'`| Phạm vi: `ALL`, `DEPARTMENT`, `CONTRACT_TYPE` |
| `target_value`| `VARCHAR(100)`| NO | - | - | Giá trị mục tiêu: `OFFICIAL`, `PROBATION`, `IT_DEPT` |
| `effective_from`| `DATE` | NO | - | - | **Ngày bắt đầu có hiệu lực của phiên bản luật này** |
| `effective_to` | `DATE` | YES | - | NULL | Ngày hết hiệu lực (NULL = còn hiệu lực hiện tại) |
| `parameters` | `JSON` | NO | - | - | Tham số cấu hình dạng JSON (xem cấu trúc bên dưới) |

*Cấu trúc JSON trong cột `parameters`:*
```json
{
  "max_times_per_month": 2,
  "max_minutes_per_time": 60,
  "grace_period_minutes": 10,
  "submission_deadline_days": 3,
  "min_advance_days": 1,
  "allow_urgent": true
}
```

---

### Phân hệ 3: Dữ liệu Chấm công & Quản lý Đơn từ (Transactions & Workflows)

#### Bảng 8: `attendance_punches` (Log Ghi nhận Chấm công Vào/Ra)
| Tên cột | Kiểu dữ liệu | Null | Khóa | Mặc định | Ý nghĩa & Quy tắc nghiệp vụ |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | `VARCHAR(36)` | NO | PK | - | UUID bản ghi chấm công |
| `employee_id` | `VARCHAR(36)` | NO | FK | - | Trỏ tới `employees(id)` |
| `punch_time` | `DATETIME` | NO | - | - | Thời gian chấm công thực tế (UTC) |
| `punch_type` | `VARCHAR(10)` | NO | - | - | Loại: `IN` (Chấm vào ca), `OUT` (Chấm ra ca) |
| `verification_method`| `VARCHAR(30)`| NO | - | - | Phương thức: `DYNAMIC_QR`, `EMERGENCY_SELFIE`, `WFH_PORTAL` |
| `client_ip` | `VARCHAR(50)` | NO | - | - | Địa chỉ IP Public của thiết bị gửi request |
| `device_id` | `VARCHAR(36)` | YES | FK | NULL | Trỏ tới `registered_devices(id)` |
| `latitude` | `DECIMAL(10,8)`| YES | - | NULL | Vĩ độ GPS tại thời điểm chấm công |
| `longitude` | `DECIMAL(11,8)`| YES | - | NULL | Kinh độ GPS tại thời điểm chấm công |
| `is_wfh` | `BOOLEAN` | NO | - | `FALSE` | Đánh dấu chấm công từ xa |
| `selfie_image_url`| `TEXT` | YES | - | NULL | Link ảnh S3/MinIO chụp selfie (khi dùng Emergency Fallback) |
| `status` | `VARCHAR(30)` | NO | - | `'VALID'` | Trạng thái: `VALID`, `PENDING_APPROVAL`, `REJECTED` |
| `created_at` | `DATETIME` | NO | - | `CURRENT_TIMESTAMP` | Thời điểm ghi nhận vào DB |

#### Bảng 9: `attendance_requests` (Yêu cầu / Đơn từ của Nhân viên)
| Tên cột | Kiểu dữ liệu | Null | Khóa | Mặc định | Ý nghĩa & Quy tắc nghiệp vụ |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | `VARCHAR(36)` | NO | PK | - | UUID đơn từ |
| `request_code` | `VARCHAR(30)` | NO | UK | - | Mã đơn sinh tự động (ví dụ: `REQ-202605-00123`) |
| `employee_id` | `VARCHAR(36)` | NO | FK | - | Người tạo đơn |
| `request_type` | `VARCHAR(50)` | NO | - | - | `LATE_IN`, `EARLY_OUT`, `MISSED_PUNCH`, `ANNUAL_LEAVE`, `SICK_LEAVE`, `MATERNITY`, `WFH`, `UNPAID_LEAVE` |
| `from_date` | `DATE` | NO | - | - | Ngày bắt đầu |
| `to_date` | `DATE` | NO | - | - | Ngày kết thúc |
| `duration_minutes`| `INT` | YES | - | NULL | Số phút (cho đơn đi muộn / về sớm) |
| `leave_units` | `DECIMAL(3,1)`| YES | - | NULL | Quy đổi ngày: `1.0` (nguyên ngày), `0.5` (nửa ngày) |
| `is_recurring_wfh`| `BOOLEAN`| NO | - | `FALSE` | Đăng ký WFH cố định (ví dụ Thứ 6 hàng tuần) |
| `recurring_day_of_week`| `INT`| YES | - | NULL | `1` (Chủ nhật) đến `7` (Thứ 7) nếu là WFH cố định |
| `is_urgent` | `BOOLEAN` | NO | - | `FALSE` | Đơn gấp (gắn cờ cảnh báo nếu nộp trễ hạn) |
| `reason` | `TEXT` | NO | - | - | Lý do bắt buộc |
| `eod_report` | `TEXT` | YES | - | NULL | Báo cáo công việc cuối ngày WFH |
| `attachment_url`| `TEXT` | YES | - | NULL | Đường dẫn file y tế mẫu C65-HD, giấy viện... |
| `status` | `VARCHAR(30)` | NO | - | `'PENDING'` | Trạng thái: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED` |
| `applied_to_timesheet`| `BOOLEAN`| NO | - | `FALSE` | Đã hạch toán vào bảng công chưa |
| `created_at` | `DATETIME` | NO | - | `CURRENT_TIMESTAMP` | Thời điểm nộp đơn |

#### Bảng 10: `request_approvals` (Lịch sử Phê duyệt Đa cấp)
Lưu dấu vết duyệt đơn qua từng bước (Manager $\rightarrow$ HR).
| Tên cột | Kiểu dữ liệu | Null | Khóa | Mặc định | Ý nghĩa & Quy tắc nghiệp vụ |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | `VARCHAR(36)` | NO | PK | - | UUID bước duyệt |
| `request_id` | `VARCHAR(36)` | NO | FK | - | Trỏ tới `attendance_requests(id)` |
| `step_order` | `INT` | NO | - | `1` | Thứ tự bước: `1` = Quản lý trực tiếp, `2` = HR Admin |
| `approver_id` | `VARCHAR(36)` | NO | FK | - | Người có thẩm quyền duyệt tại bước này |
| `action` | `VARCHAR(30)` | NO | - | `'PENDING'` | `PENDING`, `APPROVED`, `REJECTED`, `DELEGATED` (ủy quyền) |
| `comment` | `TEXT` | YES | - | NULL | Nhận xét hoặc lý do từ chối bắt buộc |
| `action_time` | `DATETIME` | YES | - | NULL | Thời điểm bấm duyệt |

---

### Phân hệ 4: Quỹ phép, Bảng công, Hồi tố & Khiếu nại (Timesheet & Payroll)

#### Bảng 11: `employee_leave_balances` (Quỹ Phép năm của Nhân viên)
| Tên cột | Kiểu dữ liệu | Null | Khóa | Mặc định | Ý nghĩa & Quy tắc nghiệp vụ |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | `VARCHAR(36)` | NO | PK | - | UUID số dư phép |
| `employee_id` | `VARCHAR(36)` | NO | FK | - | Trỏ tới `employees(id)` |
| `leave_year` | `INT` | NO | - | - | Năm theo dõi (ví dụ: `2026`) |
| `total_accrued`| `DECIMAL(4,1)`| NO | - | `0.0` | Số phép chuẩn được hưởng trong năm (cộng dồn hàng tháng) |
| `tenure_bonus` | `DECIMAL(4,1)`| NO | - | `0.0` | Số ngày phép thâm niên cộng thêm (+1 ngày mỗi 2 năm) |
| `carried_over` | `DECIMAL(4,1)`| NO | - | `0.0` | Số phép từ năm trước chuyển sang |
| `used_days` | `DECIMAL(4,1)`| NO | - | `0.0` | Số ngày phép đã sử dụng trong năm |
| `remaining_days`| `DECIMAL(4,1)`| NO | - | `0.0` | Số phép còn lại khả dụng |
| `carry_over_expiry_date`| `DATE`| NO | - | - | Hạn chót sử dụng phép tồn (mặc định: `31/03/YYYY`) |

#### Bảng 12: `payroll_periods` (Quản lý Kỳ công Hằng tháng)
| Tên cột | Kiểu dữ liệu | Null | Khóa | Mặc định | Ý nghĩa & Quy tắc nghiệp vụ |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | `VARCHAR(36)` | NO | PK | - | UUID kỳ công |
| `period_code` | `VARCHAR(20)` | NO | UK | - | Mã kỳ công (ví dụ: `2026-05`) |
| `start_date` | `DATE` | NO | - | - | Ngày đầu kỳ (ví dụ: `2026-05-01`) |
| `end_date` | `DATE` | NO | - | - | Ngày cuối kỳ (ví dụ: `2026-05-31`) |
| `dispute_deadline`| `DATETIME` | NO | - | - | **Hạn chót nhân viên khiếu nại công (mở trong 48 giờ)** |
| `status` | `VARCHAR(30)` | NO | - | `'OPEN'` | Trạng thái: `OPEN`, `AGGREGATED`, `DISPUTE_WINDOW`, `LOCKED` |
| `locked_by` | `VARCHAR(36)` | YES | FK | NULL | HR Admin đã bấm khóa kỳ công |
| `locked_at` | `DATETIME` | YES | - | NULL | Thời điểm khóa bất biến |

#### Bảng 13: `monthly_timesheets` (Bảng công Tổng hợp Tháng)
| Tên cột | Kiểu dữ liệu | Null | Khóa | Mặc định | Ý nghĩa & Quy tắc nghiệp vụ |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | `VARCHAR(36)` | NO | PK | - | UUID bảng công nhân viên |
| `payroll_period_id`| `VARCHAR(36)`| NO | FK | - | Trỏ tới `payroll_periods(id)` |
| `employee_id` | `VARCHAR(36)` | NO | FK | - | Trỏ tới `employees(id)` |
| `standard_work_days`| `DECIMAL(4,2)`| NO | - | `0.00` | Số ngày công chuẩn của tháng (ví dụ: 22.0) |
| `actual_work_days`| `DECIMAL(4,2)`| NO | - | `0.00` | Ngày đi làm thực tế tại văn phòng |
| `wfh_days` | `DECIMAL(4,2)`| NO | - | `0.00` | Số ngày WFH hợp lệ (vẫn hưởng 100% lương) |
| `paid_leave_days`| `DECIMAL(4,2)`| NO | - | `0.00` | Nghỉ phép năm, hiếu hỉ (công ty trả lương) |
| `unpaid_leave_days`| `DECIMAL(4,2)`| NO | - | `0.00` | Nghỉ việc riêng không hưởng lương |
| `social_insurance_days`| `DECIMAL(4,2)`| NO | - | `0.00` | **Nghỉ ốm đau dài ngày, thai sản (BHXH chi trả)** |
| `holiday_paid_days`| `DECIMAL(4,2)`| NO | - | `0.00` | Nghỉ lễ tết hưởng nguyên lương |
| `late_minutes_total`| `INT` | NO | - | `0` | Tổng số phút đi trễ (không có đơn hợp lệ) |
| `early_minutes_total`| `INT` | NO | - | `0` | Tổng số phút về sớm (không có đơn hợp lệ) |
| `retro_adjustment_days`| `DECIMAL(4,2)`| NO| - | `0.00` | **Công điều chỉnh hồi tố từ kỳ trước chuyển sang (+/-)** |
| `daily_details` | `JSON` | NO | - | - | Chi tiết ký hiệu từng ngày: `{"1":"X", "2":"X/2", "3":"W", ...}` |
| `is_locked` | `BOOLEAN` | NO | - | `FALSE` | Trạng thái khóa bất biến |

#### Bảng 14: `payroll_retro_adjustments` (Điều chỉnh Hồi tố Kỳ sau)
Lưu các đơn được duyệt muộn sau khi kỳ công gốc đã bị khóa.
| Tên cột | Kiểu dữ liệu | Null | Khóa | Mặc định | Ý nghĩa & Quy tắc nghiệp vụ |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | `VARCHAR(36)` | NO | PK | - | UUID hồi tố |
| `employee_id` | `VARCHAR(36)` | NO | FK | - | Nhân viên được điều chỉnh |
| `request_id` | `VARCHAR(36)` | YES | FK | NULL | Trỏ tới đơn phát sinh duyệt muộn |
| `origin_period_id`| `VARCHAR(36)`| NO | FK | - | Kỳ công gốc bị ảnh hưởng (đã bị LOCKED) |
| `target_period_id`| `VARCHAR(36)`| NO | FK | - | Kỳ công mới được nhận khoản bù công |
| `origin_date` | `DATE` | NO | - | - | Ngày phát sinh sự cố trong quá khứ |
| `adjustment_type`| `VARCHAR(50)`| NO | - | - | `ADD_WORK_DAY` (+công), `DEDUCT_WORK_DAY` (-công), `ADD_LEAVE` |
| `value` | `DECIMAL(4,2)`| NO | - | - | Giá trị điều chỉnh (ví dụ: `+1.00`, `-0.50`) |
| `reason` | `TEXT` | NO | - | - | Lý do giải trình |
| `applied_to_target_timesheet`| `BOOLEAN`| NO| - | `FALSE` | Đã cộng vào bảng công kỳ sau chưa |

#### Bảng 15: `timesheet_disputes` (Khiếu nại Công trong 48h)
| Tên cột | Kiểu dữ liệu | Null | Khóa | Mặc định | Ý nghĩa & Quy tắc nghiệp vụ |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | `VARCHAR(36)` | NO | PK | - | UUID khiếu nại |
| `payroll_period_id`| `VARCHAR(36)`| NO | FK | - | Thuộc kỳ công nào |
| `employee_id` | `VARCHAR(36)` | NO | FK | - | Nhân viên khiếu nại |
| `disputed_date` | `DATE` | NO | - | - | Ngày trên bảng công bị nhân viên khiếu nại sai |
| `dispute_reason`| `TEXT` | NO | - | - | Nội dung khiếu nại của nhân viên |
| `attachment_url`| `TEXT` | YES | - | NULL | Link ảnh chứng minh |
| `status` | `VARCHAR(30)` | NO | - | `'PENDING'` | `PENDING`, `ACCEPTED` (HR chấp nhận sửa), `REJECTED` |
| `hr_response` | `TEXT` | YES | - | NULL | Phản hồi của HR |
| `resolved_by` | `VARCHAR(36)` | YES | FK | NULL | HR Admin xử lý |

#### Bảng 16: `system_audit_logs` (Nhật ký Kiểm toán Toàn hệ thống)
| Tên cột | Kiểu dữ liệu | Null | Khóa | Mặc định | Ý nghĩa & Quy tắc nghiệp vụ |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | `VARCHAR(36)` | NO | PK | - | UUID bản ghi log |
| `actor_id` | `VARCHAR(36)` | YES | - | NULL | ID người thực hiện hành động (hoặc 'SYSTEM') |
| `action_type` | `VARCHAR(50)` | NO | - | - | `PUNCH_ATTENDANCE`, `APPROVE_REQUEST`, `LOCK_TIMESHEET`, `MANUAL_EDIT` |
| `target_entity`| `VARCHAR(50)`| NO | - | - | Tên bảng bị tác động (ví dụ: `monthly_timesheets`) |
| `target_id` | `VARCHAR(36)` | YES | - | NULL | ID bản ghi bị tác động |
| `old_value` | `JSON` | YES | - | NULL | Dữ liệu trước khi sửa |
| `new_value` | `JSON` | YES | - | NULL | Dữ liệu sau khi sửa |
| `client_ip` | `VARCHAR(50)` | YES | - | NULL | IP thực hiện |
| `created_at` | `DATETIME` | NO | - | `CURRENT_TIMESTAMP` | Thời điểm ghi log |

