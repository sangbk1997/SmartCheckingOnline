-- V1__init_schema.sql: Khởi tạo toàn bộ cấu trúc bảng hệ thống SmartTimeChecking trên MySQL 8.0+

CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    parent_id VARCHAR(36) NULL,
    manager_id VARCHAR(36) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_dept_parent FOREIGN KEY (parent_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(36) PRIMARY KEY,
    keycloak_user_id VARCHAR(64) UNIQUE NOT NULL,
    employee_code VARCHAR(30) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NULL,
    department_id VARCHAR(36) NULL,
    direct_manager_id VARCHAR(36) NULL,
    contract_type VARCHAR(50) NOT NULL DEFAULT 'OFFICIAL',
    start_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    app_role VARCHAR(30) DEFAULT 'EMPLOYEE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_emp_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    CONSTRAINT fk_emp_manager FOREIGN KEY (direct_manager_id) REFERENCES employees(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS registered_devices (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    device_token VARCHAR(255) NOT NULL UNIQUE,
    device_name VARCHAR(100) NULL,
    platform VARCHAR(50) NULL,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_used_at DATETIME NULL,
    CONSTRAINT fk_device_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_device_token (device_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS work_shifts (
    id VARCHAR(36) PRIMARY KEY,
    shift_code VARCHAR(50) NOT NULL UNIQUE,
    shift_name VARCHAR(100) NOT NULL,
    shift_type VARCHAR(30) NOT NULL DEFAULT 'FIXED',
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    lunch_break_start TIME NULL,
    lunch_break_end TIME NULL,
    standard_work_hours DECIMAL(4, 2) DEFAULT 8.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS employee_shift_assignments (
    id VARCHAR(36) PRIMARY KEY,
    shift_id VARCHAR(36) NOT NULL,
    target_type VARCHAR(30) NOT NULL DEFAULT 'DEPARTMENT',
    target_id VARCHAR(36) NOT NULL,
    effective_date DATE NOT NULL,
    expire_date DATE NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assign_shift FOREIGN KEY (shift_id) REFERENCES work_shifts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS holiday_calendars (
    id VARCHAR(36) PRIMARY KEY,
    holiday_year INT NOT NULL,
    holiday_name VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_paid BOOLEAN DEFAULT TRUE,
    compensatory_date DATE NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_holiday_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS policy_rules (
    id VARCHAR(36) PRIMARY KEY,
    rule_category VARCHAR(50) NOT NULL,
    target_type VARCHAR(30) NOT NULL DEFAULT 'CONTRACT_TYPE',
    target_value VARCHAR(100) NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE NULL,
    parameters JSON NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_policy_effective (rule_category, target_value, effective_from, effective_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attendance_punches (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    punch_time DATETIME NOT NULL,
    punch_type VARCHAR(10) NOT NULL,
    verification_method VARCHAR(30) NOT NULL,
    client_ip VARCHAR(50) NOT NULL,
    device_id VARCHAR(36) NULL,
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    is_wfh BOOLEAN DEFAULT FALSE,
    selfie_image_url TEXT NULL,
    status VARCHAR(30) DEFAULT 'VALID',
    rejection_reason TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_punch_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_punch_device FOREIGN KEY (device_id) REFERENCES registered_devices(id) ON DELETE SET NULL,
    INDEX idx_punches_emp_time (employee_id, punch_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attendance_requests (
    id VARCHAR(36) PRIMARY KEY,
    request_code VARCHAR(30) NOT NULL UNIQUE,
    employee_id VARCHAR(36) NOT NULL,
    request_type VARCHAR(50) NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    duration_minutes INT NULL,
    leave_units DECIMAL(3, 1) NULL,
    is_recurring_wfh BOOLEAN DEFAULT FALSE,
    recurring_day_of_week INT NULL,
    is_urgent BOOLEAN DEFAULT FALSE,
    reason TEXT NOT NULL,
    eod_report TEXT NULL,
    attachment_url TEXT NULL,
    status VARCHAR(30) DEFAULT 'PENDING',
    applied_to_timesheet BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_req_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_req_emp_dates (employee_id, from_date, to_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS request_approvals (
    id VARCHAR(36) PRIMARY KEY,
    request_id VARCHAR(36) NOT NULL,
    step_order INT DEFAULT 1,
    approver_id VARCHAR(36) NOT NULL,
    action VARCHAR(30) DEFAULT 'PENDING',
    comment TEXT NULL,
    action_time DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_appr_req FOREIGN KEY (request_id) REFERENCES attendance_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_appr_user FOREIGN KEY (approver_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS employee_leave_balances (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    leave_year INT NOT NULL,
    total_accrued DECIMAL(4, 1) DEFAULT 0.0,
    tenure_bonus DECIMAL(4, 1) DEFAULT 0.0,
    carried_over DECIMAL(4, 1) DEFAULT 0.0,
    used_days DECIMAL(4, 1) DEFAULT 0.0,
    remaining_days DECIMAL(4, 1) DEFAULT 0.0,
    carry_over_expiry_date DATE NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bal_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE KEY uq_emp_leave_year (employee_id, leave_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payroll_periods (
    id VARCHAR(36) PRIMARY KEY,
    period_code VARCHAR(20) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    dispute_deadline DATETIME NOT NULL,
    status VARCHAR(30) DEFAULT 'OPEN',
    locked_by VARCHAR(36) NULL,
    locked_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_period_locker FOREIGN KEY (locked_by) REFERENCES employees(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS monthly_timesheets (
    id VARCHAR(36) PRIMARY KEY,
    payroll_period_id VARCHAR(36) NOT NULL,
    employee_id VARCHAR(36) NOT NULL,
    standard_work_days DECIMAL(4, 2) DEFAULT 0.00,
    actual_work_days DECIMAL(4, 2) DEFAULT 0.00,
    wfh_days DECIMAL(4, 2) DEFAULT 0.00,
    paid_leave_days DECIMAL(4, 2) DEFAULT 0.00,
    unpaid_leave_days DECIMAL(4, 2) DEFAULT 0.00,
    social_insurance_days DECIMAL(4, 2) DEFAULT 0.00,
    holiday_paid_days DECIMAL(4, 2) DEFAULT 0.00,
    late_minutes_total INT DEFAULT 0,
    early_minutes_total INT DEFAULT 0,
    retro_adjustment_days DECIMAL(4, 2) DEFAULT 0.00,
    daily_details JSON NOT NULL,
    is_locked BOOLEAN DEFAULT FALSE,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ts_period FOREIGN KEY (payroll_period_id) REFERENCES payroll_periods(id) ON DELETE CASCADE,
    CONSTRAINT fk_ts_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE KEY uq_period_emp (payroll_period_id, employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payroll_retro_adjustments (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    request_id VARCHAR(36) NULL,
    origin_period_id VARCHAR(36) NOT NULL,
    target_period_id VARCHAR(36) NOT NULL,
    origin_date DATE NOT NULL,
    adjustment_type VARCHAR(50) NOT NULL,
    value DECIMAL(4, 2) NOT NULL,
    reason TEXT NOT NULL,
    applied_to_target_timesheet BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_retro_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_retro_req FOREIGN KEY (request_id) REFERENCES attendance_requests(id) ON DELETE SET NULL,
    CONSTRAINT fk_retro_origin_p FOREIGN KEY (origin_period_id) REFERENCES payroll_periods(id) ON DELETE CASCADE,
    CONSTRAINT fk_retro_target_p FOREIGN KEY (target_period_id) REFERENCES payroll_periods(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS timesheet_disputes (
    id VARCHAR(36) PRIMARY KEY,
    payroll_period_id VARCHAR(36) NOT NULL,
    employee_id VARCHAR(36) NOT NULL,
    disputed_date DATE NOT NULL,
    dispute_reason TEXT NOT NULL,
    attachment_url TEXT NULL,
    status VARCHAR(30) DEFAULT 'PENDING',
    hr_response TEXT NULL,
    resolved_by VARCHAR(36) NULL,
    resolved_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_disp_period FOREIGN KEY (payroll_period_id) REFERENCES payroll_periods(id) ON DELETE CASCADE,
    CONSTRAINT fk_disp_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_disp_resolver FOREIGN KEY (resolved_by) REFERENCES employees(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS system_audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    actor_id VARCHAR(36) NULL,
    action_type VARCHAR(50) NOT NULL,
    target_entity VARCHAR(50) NOT NULL,
    target_id VARCHAR(36) NULL,
    old_value JSON NULL,
    new_value JSON NULL,
    client_ip VARCHAR(50) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

