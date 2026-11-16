-- V3__enterprise_full_seed_data.sql: Nạp bộ dữ liệu doanh nghiệp hoàn chỉnh (SmartCorp)
SET FOREIGN_KEY_CHECKS = 0;

-- 1. CẬP NHẬT CƠ CẤU PHÒNG BAN ĐA CẤP (THEO THỨ TỰ CÂY PHÂN CẤP ĐỂ ĐẢM BẢO FOREIGN KEY)
-- 1.1 Ban Tổng Giám Đốc (Root)
INSERT INTO departments (id, code, name, parent_id, manager_id, is_active)
VALUES ('d-bod-000', 'BOD', 'Ban Tổng Giám Đốc (Board of Directors)', NULL, 'e-ceo-001', TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 1.2 Khối cấp 1 trực thuộc BOD
INSERT INTO departments (id, code, name, parent_id, manager_id, is_active)
VALUES 
('d-tech-001', 'TECH_DIV', 'Khối Công nghệ & Kỹ thuật', 'd-bod-000', 'e2222222-2222-2222-2222-222222222222', TRUE),
('d-hr-004', 'HR_DEPT', 'Phòng Hành chính Nhân sự & Đào tạo', 'd-bod-000', 'e1111111-1111-1111-1111-111111111111', TRUE),
('d-sales-005', 'SALES_DEPT', 'Phòng Kinh doanh & Tiếp thị (Sales & Marketing)', 'd-bod-000', 'e-sales-011', TRUE),
('d-fin-006', 'FIN_DEPT', 'Phòng Tài chính Kế toán', 'd-bod-000', 'e-fin-013', TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name), parent_id=VALUES(parent_id);

-- 1.3 Phòng ban cấp 2 trực thuộc Khối Kỹ thuật
INSERT INTO departments (id, code, name, parent_id, manager_id, is_active)
VALUES 
('d-dev-002', 'DEV_DEPT', 'Phòng Phát triển Phần mềm (Software Dev)', 'd-tech-001', 'e-dev-lead-005', TRUE),
('d-infra-003', 'INFRA_DEPT', 'Phòng Hạ tầng Cloud & Bảo mật', 'd-tech-001', 'e-infra-010', TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name), parent_id=VALUES(parent_id);

-- 2. BỔ SUNG ĐỘI NGŨ NHÂN SỰ ĐẦY ĐỦ CÁC CẤP (BAN GIÁM ĐỐC, QUẢN LÝ, NHÂN VIÊN, THỰC TẬP)
INSERT INTO employees (id, keycloak_user_id, employee_code, full_name, email, department_id, direct_manager_id, contract_type, start_date, is_active, app_role)
VALUES 
-- Ban Lãnh đạo & HR
('e-ceo-001', 'kc-ceo-001', 'CEO001', 'Trần Quốc Bảo (Tổng Giám Đốc / CEO)', 'ceo@smartcorp.com', 'd-bod-000', NULL, 'OFFICIAL', '2020-01-01', TRUE, 'HR_ADMIN'),
('e-hr-spec-003', 'kc-hr-003', 'HR002', 'Hoàng Thị Mai (Chuyên viên C&B)', 'mai.hoang@smartcorp.com', 'd-hr-004', 'e1111111-1111-1111-1111-111111111111', 'OFFICIAL', '2022-06-15', TRUE, 'HR_ADMIN'),

-- Khối Kỹ thuật & Dev
('e-dev-lead-005', 'kc-dev-005', 'DEV001', 'Phạm Minh Tuấn (Trưởng nhóm Software)', 'tuan.pham@smartcorp.com', 'd-dev-002', 'e2222222-2222-2222-2222-222222222222', 'OFFICIAL', '2022-01-10', TRUE, 'MANAGER'),
('e-dev-fe-007', 'kc-dev-007', 'DEV003', 'Vũ Đình Khoa (Frontend Developer)', 'khoa.vu@smartcorp.com', 'd-dev-002', 'e-dev-lead-005', 'OFFICIAL', '2023-04-15', TRUE, 'EMPLOYEE'),
('e-dev-qa-008', 'kc-dev-008', 'DEV004', 'Đặng Thùy Linh (QA / Test Lead)', 'linh.dang@smartcorp.com', 'd-dev-002', 'e-dev-lead-005', 'OFFICIAL', '2023-09-01', TRUE, 'EMPLOYEE'),
('e-dev-prob-009', 'kc-dev-009', 'DEV005', 'Đỗ Tuấn Kiệt (Thực tập sinh / Thử việc)', 'kiet.do@smartcorp.com', 'd-dev-002', 'e-dev-lead-005', 'PROBATION', '2026-10-01', TRUE, 'EMPLOYEE'),
('e-infra-010', 'kc-inf-010', 'INF001', 'Bùi Quang Hưng (Trưởng nhóm DevOps & SysAdmin)', 'hung.bui@smartcorp.com', 'd-infra-003', 'e2222222-2222-2222-2222-222222222222', 'OFFICIAL', '2022-03-01', TRUE, 'MANAGER'),

-- Khối Kinh doanh
('e-sales-011', 'kc-sal-011', 'SAL001', 'Ngô Quốc Huy (Trưởng phòng Kinh doanh)', 'huy.ngo@smartcorp.com', 'd-sales-005', 'e-ceo-001', 'OFFICIAL', '2021-11-01', TRUE, 'MANAGER'),
('e-sales-012', 'kc-sal-012', 'SAL002', 'Trần Phương Anh (Account Executive)', 'anh.tran@smartcorp.com', 'd-sales-005', 'e-sales-011', 'OFFICIAL', '2023-02-20', TRUE, 'EMPLOYEE'),

-- Khối Tài chính Kế toán
('e-fin-013', 'kc-fin-013', 'FIN001', 'Nguyễn Thanh Hương (Kế toán Trưởng)', 'huong.nguyen@smartcorp.com', 'd-fin-006', 'e-ceo-001', 'OFFICIAL', '2021-08-01', TRUE, 'MANAGER'),
('e-fin-014', 'kc-fin-014', 'FIN002', 'Lê Thị Ngọc (Kế toán Tiền lương)', 'ngoc.le@smartcorp.com', 'd-fin-006', 'e-fin-013', 'OFFICIAL', '2023-05-10', TRUE, 'EMPLOYEE')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), department_id=VALUES(department_id), direct_manager_id=VALUES(direct_manager_id);

-- Cập nhật lại department_id chuẩn cho 3 nhân viên demo chính từ V2
UPDATE employees SET department_id = 'd-dev-002' WHERE id = 'e3333333-3333-3333-3333-333333333333';
UPDATE employees SET department_id = 'd-tech-001' WHERE id = 'e2222222-2222-2222-2222-222222222222';
UPDATE employees SET department_id = 'd-hr-004' WHERE id = 'e1111111-1111-1111-1111-111111111111';

-- 3. ĐĂNG KÝ THIẾT BỊ BẢO MẬT (DEVICE BINDING) CHO CÁC NHÂN SỰ
INSERT INTO registered_devices (id, employee_id, device_token, device_name, platform, status)
VALUES 
('dev-lead-002', 'e2222222-2222-2222-2222-222222222222', 'FP_DEVICE_TOKEN_LEAD_MACBOOK_PRO', 'MacBook Pro 16 M3 Max', 'macOS', 'ACTIVE'),
('dev-hr-001', 'e1111111-1111-1111-1111-111111111111', 'FP_DEVICE_TOKEN_HR_DELL_XPS', 'Dell XPS 13 Plus', 'Windows', 'ACTIVE'),
('dev-fe-007', 'e-dev-fe-007', 'FP_DEVICE_TOKEN_FE_KHOA_S24', 'Samsung Galaxy S24 Ultra', 'Android', 'ACTIVE'),
('dev-qa-008', 'e-dev-qa-008', 'FP_DEVICE_TOKEN_QA_LINH_IP14', 'iPhone 14 Pro', 'iOS', 'ACTIVE')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 4. BỔ SUNG CÁC CA LÀM VIỆC ĐẶC THÙ
INSERT INTO work_shifts (id, shift_code, shift_name, shift_type, start_time, end_time, lunch_break_start, lunch_break_end, standard_work_hours, is_active)
VALUES 
('s-flex-002', 'TECH_FLEXIBLE', 'Ca Linh hoạt IT (08:00 - 09:30 đến 17:30 - 19:00)', 'FLEXIBLE', '08:30:00', '17:30:00', '12:00:00', '13:00:00', 8.00, TRUE),
('s-night-003', 'INFRA_NIGHT', 'Ca Trực Đêm An ninh mạng (20:00 - 04:00)', 'FIXED', '20:00:00', '04:00:00', NULL, NULL, 8.00, TRUE)
ON DUPLICATE KEY UPDATE shift_name=VALUES(shift_name);

-- 5. QUỸ PHÉP NĂM 2026 CHO TOÀN BỘ NHÂN VIÊN
INSERT INTO employee_leave_balances (id, employee_id, leave_year, total_accrued, tenure_bonus, carried_over, used_days, remaining_days, carry_over_expiry_date)
VALUES 
('bal-fe-007', 'e-dev-fe-007', 2026, 12.0, 1.0, 0.0, 1.5, 11.5, '2026-03-31'),
('bal-qa-008', 'e-dev-qa-008', 2026, 12.0, 1.0, 1.0, 2.0, 12.0, '2026-03-31'),
('bal-lead-002', 'e2222222-2222-2222-2222-222222222222', 2026, 12.0, 2.0, 3.0, 1.0, 16.0, '2026-03-31'),
('bal-hr-001', 'e1111111-1111-1111-1111-111111111111', 2026, 12.0, 2.0, 2.0, 2.0, 14.0, '2026-03-31')
ON DUPLICATE KEY UPDATE remaining_days=VALUES(remaining_days);

-- 6. MẪU ĐƠN TỪ ĐANG CHỜ DUYỆT ĐỂ TEST FLOW NGHIỆP VỤ QUẢN LÝ / HR
INSERT INTO attendance_requests (id, request_code, employee_id, request_type, from_date, to_date, duration_minutes, leave_units, is_recurring_wfh, is_urgent, reason, attachment_url, status)
VALUES 
('req-seed-001', 'REQ-202611-001', 'e-dev-fe-007', 'WFH', '2026-11-18', '2026-11-18', NULL, 1.0, FALSE, FALSE, 'Làm việc từ xa để tập trung release bản vá Frontend', NULL, 'PENDING'),
('req-seed-002', 'REQ-202611-002', 'e-dev-qa-008', 'SICK_LEAVE', '2026-11-16', '2026-11-17', NULL, 2.0, FALSE, FALSE, 'Sốt virus, bác sĩ chỉ định nghỉ theo dõi', 'https://storage.smartcorp.com/medical/c65_dang_thuy_linh.pdf', 'PENDING'),
('req-seed-003', 'REQ-202611-003', 'e3333333-3333-3333-3333-333333333333', 'EARLY_OUT', '2026-11-14', '2026-11-14', 30, NULL, FALSE, FALSE, 'Xin về sớm 30 phút đưa người nhà đi khám bệnh', NULL, 'PENDING')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Tạo bản ghi phê duyệt bước 1 cho sếp trực tiếp
INSERT INTO request_approvals (id, request_id, step_order, approver_id, action)
VALUES 
('appr-seed-001', 'req-seed-001', 1, 'e-dev-lead-005', 'PENDING'),
('appr-seed-002', 'req-seed-002', 1, 'e1111111-1111-1111-1111-111111111111', 'PENDING'),
('appr-seed-003', 'req-seed-003', 1, 'e2222222-2222-2222-2222-222222222222', 'PENDING')
ON DUPLICATE KEY UPDATE action=VALUES(action);

-- 7. KỲ CÔNG THÁNG 11/2026 VÀ THÁNG 10/2026 ĐÃ KHÓA (ĐỂ TEST BẢNG CÔNG & HỒI TỐ)
INSERT INTO payroll_periods (id, period_code, start_date, end_date, dispute_deadline, status, locked_by, locked_at)
VALUES 
('period-2026-10', '2026-10', '2026-10-01', '2026-10-31', '2026-11-02 23:59:59', 'LOCKED', 'e1111111-1111-1111-1111-111111111111', '2026-11-03 10:00:00'),
('period-2026-11', '2026-11', '2026-11-01', '2026-11-30', '2026-12-02 23:59:59', 'OPEN', NULL, NULL)
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Dữ liệu bảng công mẫu tháng 10 đã chốt (22 công chuẩn)
INSERT INTO monthly_timesheets (id, payroll_period_id, employee_id, standard_work_days, actual_work_days, wfh_days, paid_leave_days, unpaid_leave_days, social_insurance_days, holiday_paid_days, late_minutes_total, early_minutes_total, retro_adjustment_days, daily_details, is_locked)
VALUES 
('ts-nam-2026-10', 'period-2026-10', 'e3333333-3333-3333-3333-333333333333', 22.0, 19.0, 2.0, 1.0, 0.0, 0.0, 0.0, 15, 0, 0.0, '{"1":"X","2":"X","3":"X","4":"X","5":"W","6":"X","7":"X","8":"X","9":"X","10":"X","11":"P","12":"X","13":"X","14":"X","15":"X","16":"W","17":"X","18":"X","19":"X","20":"X","21":"X","22":"X"}', TRUE),
('ts-lead-2026-10', 'period-2026-10', 'e2222222-2222-2222-2222-222222222222', 22.0, 21.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0, 0, 0.0, '{"1":"X","2":"X","3":"X","4":"X","5":"X","6":"X","7":"X","8":"X","9":"X","10":"X","11":"X","12":"X","13":"X","14":"X","15":"X","16":"X","17":"X","18":"X","19":"X","20":"X","21":"W","22":"X"}', TRUE)
ON DUPLICATE KEY UPDATE standard_work_days=VALUES(standard_work_days);

SET FOREIGN_KEY_CHECKS = 1;
