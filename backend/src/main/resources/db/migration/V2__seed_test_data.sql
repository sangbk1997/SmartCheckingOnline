-- V2__seed_test_data.sql: Dữ liệu mẫu để phục vụ chạy thử nghiệm và kiểm thử Postman

-- 1. Phòng ban
INSERT INTO departments (id, code, name, parent_id, manager_id, is_active)
VALUES 
('d1111111-1111-1111-1111-111111111111', 'TECH_DIV', 'Khối Công nghệ Thông tin', NULL, NULL, TRUE),
('d2222222-2222-2222-2222-222222222222', 'HR_DEPT', 'Phòng Hành chính Nhân sự', NULL, NULL, TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Nhân viên mẫu (HR, Manager, Employee)
INSERT INTO employees (id, keycloak_user_id, employee_code, full_name, email, department_id, direct_manager_id, contract_type, start_date, is_active, app_role)
VALUES 
('e1111111-1111-1111-1111-111111111111', 'kc-hr-admin-01', 'HR001', 'Nguyễn Thị Thu (HR Admin)', 'hr@congty.com', 'd2222222-2222-2222-2222-222222222222', NULL, 'OFFICIAL', '2023-01-01', TRUE, 'HR_ADMIN'),
('e2222222-2222-2222-2222-222222222222', 'kc-lead-it-02', 'IT001', 'Trần Văn Mạnh (Tech Lead)', 'lead@congty.com', 'd1111111-1111-1111-1111-111111111111', NULL, 'OFFICIAL', '2023-06-01', TRUE, 'MANAGER'),
('e3333333-3333-3333-3333-333333333333', 'kc-dev-03', 'IT002', 'Lê Hoàng Nam (Software Engineer)', 'dev@congty.com', 'd1111111-1111-1111-1111-111111111111', 'e2222222-2222-2222-2222-222222222222', 'OFFICIAL', '2024-02-15', TRUE, 'EMPLOYEE')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- Cập nhật manager_id cho phòng ban
UPDATE departments SET manager_id = 'e1111111-1111-1111-1111-111111111111' WHERE id = 'd2222222-2222-2222-2222-222222222222';
UPDATE departments SET manager_id = 'e2222222-2222-2222-2222-222222222222' WHERE id = 'd1111111-1111-1111-1111-111111111111';

-- 3. Thiết bị đã đăng ký cho Developer (Device Binding)
INSERT INTO registered_devices (id, employee_id, device_token, device_name, platform, status)
VALUES 
('dev11111-1111-1111-1111-111111111111', 'e3333333-3333-3333-3333-333333333333', 'FP_DEVICE_TOKEN_DEV_IPHONE_15_PRO', 'iPhone 15 Pro Max', 'iOS', 'ACTIVE')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 4. Ca làm việc chuẩn
INSERT INTO work_shifts (id, shift_code, shift_name, shift_type, start_time, end_time, lunch_break_start, lunch_break_end, standard_work_hours, is_active)
VALUES 
('s1111111-1111-1111-1111-111111111111', 'OFFICE_DEFAULT', 'Ca Hành chính (08:30 - 17:30)', 'FIXED', '08:30:00', '17:30:00', '12:00:00', '13:00:00', 8.00, TRUE)
ON DUPLICATE KEY UPDATE shift_name=VALUES(shift_name);

-- 5. Lịch ngày lễ năm 2026
INSERT INTO holiday_calendars (id, holiday_year, holiday_name, start_date, end_date, is_paid)
VALUES 
('h1111111-1111-1111-1111-111111111111', 2026, 'Giải phóng Miền Nam & Quốc tế Lao động', '2026-04-30', '2026-05-01', TRUE),
('h2222222-2222-2222-2222-222222222222', 2026, 'Quốc khánh 2/9', '2026-09-02', '2026-09-03', TRUE)
ON DUPLICATE KEY UPDATE holiday_name=VALUES(holiday_name);

-- 6. Cấu hình Luật động có ngày hiệu lực (Policy Rules)
INSERT INTO policy_rules (id, rule_category, target_type, target_value, effective_from, effective_to, parameters)
VALUES 
('p1111111-1111-1111-1111-111111111111', 'LATE_EARLY', 'CONTRACT_TYPE', 'OFFICIAL', '2026-01-01', NULL, '{"max_times_per_month": 2, "max_minutes_per_time": 60, "grace_period_minutes": 10}'),
('p2222222-2222-2222-2222-222222222222', 'MISSED_PUNCH', 'CONTRACT_TYPE', 'OFFICIAL', '2026-01-01', NULL, '{"max_times_per_month": 3, "submission_deadline_days": 3}'),
('p3333333-3333-3333-3333-333333333333', 'WFH', 'CONTRACT_TYPE', 'OFFICIAL', '2026-01-01', NULL, '{"is_allowed": true, "max_days_per_month": 4, "max_days_per_week": 1, "min_advance_days": 1, "allow_urgent": true}')
ON DUPLICATE KEY UPDATE parameters=VALUES(parameters);

-- 7. Quỹ phép năm 2026 của Developer
INSERT INTO employee_leave_balances (id, employee_id, leave_year, total_accrued, tenure_bonus, carried_over, used_days, remaining_days, carry_over_expiry_date)
VALUES 
('bal11111-1111-1111-1111-111111111111', 'e3333333-3333-3333-3333-333333333333', 2026, 12.0, 1.0, 2.0, 3.0, 12.0, '2026-03-31')
ON DUPLICATE KEY UPDATE remaining_days=VALUES(remaining_days);

