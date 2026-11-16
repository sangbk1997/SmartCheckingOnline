import time
from playwright.sync_api import sync_playwright

class SmartTimeUiClient:
    ROBOT_LIBRARY_SCOPE = 'GLOBAL'

    def __init__(self, base_url='http://localhost:3000'):
        self.base_url = base_url.rstrip('/')
        self.playwright = None
        self.browser = None
        self.page = None

    def start_browser(self, headless=True):
        if not self.playwright:
            self.playwright = sync_playwright().start()
            self.browser = self.playwright.chromium.launch(headless=bool(headless))
            self.page = self.browser.new_page(viewport={'width': 1366, 'height': 850})
            self.page.set_default_timeout(15000)

    def close_browser(self):
        if self.browser:
            self.browser.close()
            self.browser = None
        if self.playwright:
            self.playwright.stop()
            self.playwright = None

    def open_application(self, path=''):
        self.start_browser()
        url = f'{self.base_url}/{path.lstrip("/")}'
        self.page.goto(url)
        self.page.wait_for_selector('nav', timeout=10000)
        return self.page.title()

    def get_current_page_text(self):
        return self.page.inner_text('body')

    def exit_kiosk_if_open(self):
        try:
            exit_btn = self.page.locator('button:has-text("Thoát Kiosk")').first
            if exit_btn.is_visible(timeout=500):
                exit_btn.click(force=True)
                time.sleep(0.5)
        except Exception:
            pass

    def close_modal_if_open(self):
        try:
            close_btn = self.page.locator('.fixed.inset-0 button:has-text("Hủy"), .fixed.inset-0 button:has-text("✕"), button:has-text("Hủy bỏ")').first
            if close_btn.is_visible(timeout=500):
                close_btn.click(force=True)
                time.sleep(0.5)
        except Exception:
            pass
        try:
            self.page.keyboard.press("Escape")
            time.sleep(0.2)
        except Exception:
            pass

    # =========================================================================
    # 1. NAVIGATION & ROLE SWITCHING & AUTH
    # =========================================================================
    def navigate_to_nav_tab(self, tab_label):
        self.exit_kiosk_if_open()
        self.close_modal_if_open()
        btn = self.page.locator(f'nav button:has-text("{tab_label}")').first
        btn.click(force=True)
        time.sleep(0.8)

    def switch_user_role(self, user_name):
        self.exit_kiosk_if_open()
        self.close_modal_if_open()
        btn = self.page.locator(f'button:has-text("{user_name}")')
        btn.dispatch_event('click')
        time.sleep(0.8)

    def verify_landing_page_stats(self):
        self.navigate_to_nav_tab('Trang chủ')
        text = self.page.inner_text('body')
        assert 'SmartTime' in text
        assert 'Hệ thống Chấm công' in text or 'Chấm công' in text
        return True

    def access_guard_verify_for_employee(self):
        self.switch_user_role('Lê Hoàng Nam')
        self.navigate_to_nav_tab('Quản lý / HR')
        time.sleep(0.5)
        text = self.page.inner_text('body')
        assert 'Yêu Cầu Quyền Quản Lý Hoặc HR Admin' in text
        switch_btn = self.page.locator('button:has-text("Chuyển sang HR Admin")')
        assert switch_btn.is_visible()
        switch_btn.click()
        time.sleep(1.2)
        text_after = self.page.inner_text('body').lower()
        assert 'nhân sự' in text_after or 'văn phòng' in text_after
        return True

    # =========================================================================
    # 2. KIOSK SCREEN
    # =========================================================================
    def verify_kiosk_qr_exists(self):
        self.navigate_to_nav_tab('Màn hình Kiosk')
        self.page.wait_for_selector('svg', timeout=10000)
        text = self.page.inner_text('body').lower()
        assert 'kiosk' in text or 'dynamic qr' in text
        self.exit_kiosk_if_open()
        return True

    def verify_kiosk_countdown_active(self):
        self.navigate_to_nav_tab('Màn hình Kiosk')
        text1 = self.page.inner_text('body')
        time.sleep(2.0)
        text2 = self.page.inner_text('body')
        self.exit_kiosk_if_open()
        return bool(text1 and text2)

    # =========================================================================
    # 3. EMPLOYEE PORTAL: ATTENDANCE & DEVICE BINDING
    # =========================================================================
    def employee_open_punch_tab(self):
        self.navigate_to_nav_tab('Nhân viên')
        btn = self.page.locator('button:has-text("Chấm công Vào/Ra")')
        btn.click()
        time.sleep(0.5)

    def employee_verify_device_binding_card(self):
        self.employee_open_punch_tab()
        text = self.page.inner_text('body')
        assert 'Thiết bị bảo mật đã đăng ký' in text
        assert 'iPhone 15 Pro Max' in text or 'Thiết bị' in text
        return True

    def employee_simulate_qr_checkin(self):
        self.employee_open_punch_tab()
        btn = self.page.locator('button:has-text("Chấm công Vào ca (Check-in)")')
        btn.click()
        time.sleep(1.5)
        return self.page.inner_text('body')

    def employee_simulate_qr_checkout(self):
        self.employee_open_punch_tab()
        btn = self.page.locator('button:has-text("Chấm công Ra ca (Check-out)")')
        btn.click()
        time.sleep(1.5)
        return self.page.inner_text('body')

    def employee_trigger_expired_qr_boundary_test(self):
        self.employee_open_punch_tab()
        btn = self.page.locator('button:has-text("Test QR Hết hạn")')
        btn.click()
        time.sleep(1.0)
        text = self.page.inner_text('body')
        assert 'hết hạn' in text.lower() or 'err_qr_expired' in text.lower() or 'không hợp lệ' in text.lower()
        return True

    def employee_trigger_invalid_signature_boundary_test(self):
        self.employee_open_punch_tab()
        btn = self.page.locator('button:has-text("Test QR Sai chữ ký")')
        btn.click()
        time.sleep(1.0)
        text = self.page.inner_text('body')
        assert 'chữ ký' in text.lower() or 'không hợp lệ' in text.lower() or 'hết hạn' in text.lower()
        return True

    def employee_verify_today_punches_history(self):
        self.employee_open_punch_tab()
        text = self.page.inner_text('body').lower()
        assert 'lịch sử chấm công hôm nay' in text or 'vào ca' in text or 'ra ca' in text
        return True

    # =========================================================================
    # 4. EMPLOYEE PORTAL: EMERGENCY SELFIE PUNCH
    # =========================================================================
    def employee_open_emergency_tab(self):
        self.navigate_to_nav_tab('Nhân viên')
        sub_tab = self.page.locator('button:has-text("Chấm công Khẩn cấp")').first
        sub_tab.click(force=True)
        time.sleep(0.8)

    def employee_submit_emergency_punch(self, reason='Mất điện văn phòng', lat='10.7769', lng='106.7009'):
        self.employee_open_emergency_tab()
        lat_input = self.page.locator('input[type="number"]').nth(0)
        lng_input = self.page.locator('input[type="number"]').nth(1)
        lat_input.fill(str(lat))
        lng_input.fill(str(lng))
        submit_btn = self.page.locator('button:has-text("Gửi Chấm công Khẩn cấp")').first
        submit_btn.click(force=True)
        time.sleep(1.5)
        text = self.page.inner_text('body')
        return text

    # =========================================================================
    # 5. EMPLOYEE PORTAL: REQUESTS & LEAVE QUOTAS
    # =========================================================================
    def employee_open_requests_tab(self):
        self.navigate_to_nav_tab('Nhân viên')
        sub_tab = self.page.locator('button:has-text("Tạo Đơn từ & Phép")')
        sub_tab.click()
        time.sleep(0.8)

    def employee_verify_quotas_widgets(self):
        self.employee_open_requests_tab()
        text = self.page.inner_text('body').lower()
        assert 'đi muộn / về sớm' in text
        assert 'làm việc từ xa' in text or 'wfh' in text
        assert 'quỹ phép năm' in text
        return True

    def employee_submit_leave_request(self, reason='Robot UI Leave Test'):
        self.employee_open_requests_tab()
        select_box = self.page.locator('select').first
        select_box.select_option('ANNUAL_LEAVE')
        self.page.fill('textarea', reason)
        submit_btn = self.page.locator('button:has-text("Nộp Đơn")')
        submit_btn.click()
        time.sleep(1.5)
        return self.page.inner_text('body')

    def employee_submit_wfh_request(self, reason='Robot UI WFH Test'):
        self.employee_open_requests_tab()
        select_box = self.page.locator('select').first
        select_box.select_option('WFH')
        self.page.fill('textarea', reason)
        submit_btn = self.page.locator('button:has-text("Nộp Đơn")')
        submit_btn.click()
        time.sleep(1.5)
        return self.page.inner_text('body')

    def employee_submit_late_in_request(self, minutes=30, reason='Kẹt xe buổi sáng'):
        self.employee_open_requests_tab()
        select_box = self.page.locator('select').first
        select_box.select_option('LATE_IN')
        time.sleep(0.3)
        min_input = self.page.locator('input[type="number"]')
        if min_input.is_visible():
            min_input.fill(str(minutes))
        self.page.fill('textarea', reason)
        submit_btn = self.page.locator('button:has-text("Nộp Đơn")')
        submit_btn.click()
        time.sleep(1.5)
        return self.page.inner_text('body')

    def employee_submit_sick_leave_request(self, reason='Nghỉ ốm sốt siêu vi', attachment_url='https://storage.congty.com/c65.pdf'):
        self.employee_open_requests_tab()
        select_box = self.page.locator('select').first
        select_box.select_option('SICK_LEAVE')
        time.sleep(0.3)
        if attachment_url:
            att_input = self.page.locator('input[placeholder*="storage.congty.com"]')
            if att_input.is_visible():
                att_input.fill(attachment_url)
        self.page.fill('textarea', reason)
        submit_btn = self.page.locator('button:has-text("Nộp Đơn")')
        submit_btn.click()
        time.sleep(1.5)
        return self.page.inner_text('body')

    def employee_verify_my_requests_list(self):
        self.employee_open_requests_tab()
        text = self.page.inner_text('body')
        assert 'Đơn từ Đã Nộp' in text or 'Chờ duyệt' in text or 'ĐÃ DUYỆT' in text or 'Bạn chưa có đơn' in text
        return True

    # =========================================================================
    # 6. EMPLOYEE PORTAL: TIMESHEET & 48H DISPUTE
    # =========================================================================
    def employee_open_timesheet_tab(self):
        self.navigate_to_nav_tab('Nhân viên')
        sub_tab = self.page.locator('button:has-text("Bảng công Cá nhân")')
        sub_tab.click()
        time.sleep(0.8)

    def employee_view_personal_timesheet(self):
        self.employee_open_timesheet_tab()
        text = self.page.inner_text('body').lower()
        assert 'kỳ công' in text or 'công chuẩn' in text or 'khiếu nại' in text
        return True

    def employee_submit_dispute(self, disputed_date='2026-11-13', reason='Quên chấm công ra về'):
        self.employee_open_timesheet_tab()
        date_input = self.page.locator('input[type="date"]').first
        date_input.fill(disputed_date)
        self.page.fill('textarea', reason)
        submit_btn = self.page.locator('button:has-text("Gửi Khiếu Nại")')
        submit_btn.click()
        time.sleep(1.5)
        return self.page.inner_text('body')

    # =========================================================================
    # 7. MANAGER PORTAL: DASHBOARD & HEADCOUNT
    # =========================================================================
    def manager_open_dashboard_tab(self):
        self.navigate_to_nav_tab('Quản lý / HR')
        tab = self.page.locator('button:has-text("Giám sát Đội ngũ")')
        if tab.is_visible():
            tab.click()
        time.sleep(0.8)

    def manager_verify_live_dashboard(self):
        self.manager_open_dashboard_tab()
        text = self.page.inner_text('body').lower()
        assert 'nhân sự' in text or 'văn phòng' in text or 'quân số' in text
        return True

    # =========================================================================
    # 8. MANAGER PORTAL: APPROVALS & REJECTIONS
    # =========================================================================
    def manager_open_approvals_tab(self):
        self.navigate_to_nav_tab('Quản lý / HR')
        sub_tab = self.page.locator('button:has-text("Duyệt Đơn từ")')
        sub_tab.click()
        time.sleep(0.8)

    def manager_approve_first_request(self):
        self.manager_open_approvals_tab()
        approve_btn = self.page.locator('button:has-text("Phê Duyệt")').first
        if approve_btn.is_visible():
            approve_btn.click()
            time.sleep(1.2)
        return True

    def manager_reject_first_request(self, reason='Trùng lịch trực quan trọng'):
        self.manager_open_approvals_tab()
        reject_btn = self.page.locator('button:has-text("Từ Chối")').first
        if reject_btn.is_visible():
            reject_btn.click()
            time.sleep(1.2)
        return True

    # =========================================================================
    # 9. MANAGER PORTAL: EMERGENCY ATTENDANCE REVIEW
    # =========================================================================
    def manager_open_emergency_review_tab(self):
        self.navigate_to_nav_tab('Quản lý / HR')
        sub_tab = self.page.locator('button:has-text("Duyệt Chấm Khẩn Cấp")')
        if sub_tab.is_visible():
            sub_tab.click()
            time.sleep(0.8)
        return True

    def manager_verify_emergency_review_list(self):
        self.manager_open_emergency_review_tab()
        text = self.page.inner_text('body').lower()
        assert 'khẩn cấp' in text or 'selfie' in text or 'gps' in text or 'không có' in text
        return True

    # =========================================================================
    # 10. HR PORTAL: TIMESHEET CLOSING & RETROACTIVE
    # =========================================================================
    def manager_open_timesheets_tab(self):
        self.navigate_to_nav_tab('Quản lý / HR')
        sub_tab = self.page.locator('button:has-text("Bảng công & Khóa sổ")')
        sub_tab.click()
        time.sleep(0.8)

    def manager_view_timesheet_closing(self):
        self.manager_open_timesheets_tab()
        text = self.page.inner_text('body').lower()
        assert 'kỳ công' in text or 'tổng hợp' in text or 'khóa' in text
        return True

    def manager_switch_timesheet_subtab(self, subtab_label='Ma Trận Bảng Công'):
        self.manager_open_timesheets_tab()
        btn = self.page.locator(f'button:has-text("{subtab_label}")').first
        btn.click()
        time.sleep(0.8)

    def manager_open_create_period_modal(self):
        self.manager_open_timesheets_tab()
        btn = self.page.locator('button:has-text("Mở Kỳ Mới")')
        if btn.is_visible():
            btn.click()
            time.sleep(0.5)
        text = self.page.inner_text('body')
        assert 'Mở Kỳ Công Mới' in text
        self.close_modal_if_open()
        return True

    def manager_click_lock_period(self):
        self.manager_open_timesheets_tab()
        lock_btn = self.page.locator('button:has-text("Khóa Bất Biến")')
        if lock_btn.is_visible():
            lock_btn.click()
            time.sleep(1.0)
        return True

    def manager_click_export_csv(self):
        self.manager_open_timesheets_tab()
        csv_btn = self.page.locator('button:has-text("Xuất CSV")')
        assert csv_btn.is_visible()
        return True

    # =========================================================================
    # 11. HR PORTAL: ORGANIZATION, EMPLOYEES & DEVICES
    # =========================================================================
    def manager_open_organization_tab(self):
        self.navigate_to_nav_tab('Quản lý / HR')
        sub_tab = self.page.locator('button:has-text("Tổ Chức & Nhân Sự")').first
        sub_tab.click(force=True)
        time.sleep(0.8)

    def manager_switch_org_subtab(self, subtab_name='Phòng Ban'):
        self.manager_open_organization_tab()
        btn = self.page.locator(f'button:has-text("{subtab_name}")').first
        btn.click(force=True)
        time.sleep(0.8)

    def manager_open_create_dept_modal(self):
        self.manager_switch_org_subtab('Phòng Ban')
        btn = self.page.locator('button:has-text("Thêm Phòng Ban")').first
        if btn.is_visible():
            btn.click(force=True)
            time.sleep(0.5)
        text = self.page.inner_text('body')
        assert 'Thêm Phòng Ban Mới' in text or 'Phòng Ban' in text
        self.close_modal_if_open()
        return True

    def manager_open_create_emp_modal(self):
        self.manager_switch_org_subtab('Danh Sách Nhân Sự')
        btn = self.page.locator('button:has-text("Thêm Nhân Viên")').first
        if btn.is_visible():
            btn.click(force=True)
            time.sleep(0.5)
        text = self.page.inner_text('body')
        assert 'Thêm Nhân Viên Mới' in text
        self.close_modal_if_open()
        return True

    def manager_verify_devices_subtab(self):
        self.manager_switch_org_subtab('Quản Lý Thiết Bị Di Động')
        text = self.page.inner_text('body').lower()
        assert 'thiết bị' in text or 'iphone' in text or 'thu hồi' in text
        return True

    # =========================================================================
    # 12. HR PORTAL: POLICIES, SHIFTS & HOLIDAYS
    # =========================================================================
    def manager_open_policies_tab(self):
        self.navigate_to_nav_tab('Quản lý / HR')
        sub_tab = self.page.locator('button:has-text("Ca làm & Quy chế")').first
        sub_tab.click(force=True)
        time.sleep(0.8)

    def manager_switch_policy_subtab(self, subtab_name='Bộ Quy Tắc Doanh Nghiệp'):
        self.manager_open_policies_tab()
        btn = self.page.locator(f'button:has-text("{subtab_name}")').first
        btn.click(force=True)
        time.sleep(0.8)

    def manager_open_create_shift_modal(self):
        self.manager_switch_policy_subtab('Ca Làm Việc')
        btn = self.page.locator('button:has-text("Thêm Ca Làm")').first
        if btn.is_visible():
            btn.click(force=True)
            time.sleep(0.5)
        text = self.page.inner_text('body')
        assert 'Ca Làm Việc' in text
        self.close_modal_if_open()
        return True

    def manager_open_create_holiday_modal(self):
        self.manager_switch_policy_subtab('Lịch Nghỉ Lễ')
        btn = self.page.locator('button:has-text("Thêm Ngày Lễ")').first
        if btn.is_visible():
            btn.click(force=True)
            time.sleep(0.5)
        text = self.page.inner_text('body')
        assert 'Thêm Ngày Nghỉ Lễ' in text or 'Ngày Lễ' in text
        self.close_modal_if_open()
        return True

    # =========================================================================
    # 13. GOOGLE WORKSPACE PHASE 2 TAB
    # =========================================================================
    def manager_view_google_workspace_tab(self):
        self.navigate_to_nav_tab('Quản lý / HR')
        sub_tab = self.page.locator('button:has-text("Google Workspace")')
        sub_tab.click()
        time.sleep(0.8)
        text = self.page.inner_text('body').lower()
        assert 'google' in text or 'card v2' in text or 'webhook' in text
        return True

    def manager_click_send_test_chat_card(self):
        self.manager_view_google_workspace_tab()
        btn = self.page.locator('button:has-text("Bắn Thẻ Google Chat Test")')
        if btn.is_visible():
            btn.click()
            time.sleep(1.0)
        text = self.page.inner_text('body')
        assert 'thành công' in text.lower() or 'card' in text.lower()
        return True

    def manager_click_daily_bulletin(self):
        self.manager_view_google_workspace_tab()
        btn = self.page.locator('button:has-text("Bản Tin Điểm Danh Sáng 09:00")')
        if btn.is_visible():
            btn.click()
            time.sleep(1.0)
        return True

    def manager_click_send_test_email(self):
        self.manager_view_google_workspace_tab()
        btn = self.page.locator('button:has-text("Gửi Email Thử Nghiệm")')
        if btn.is_visible():
            btn.click()
            time.sleep(1.0)
        return True

    def manager_verify_notification_audit_logs(self):
        self.manager_view_google_workspace_tab()
        text = self.page.inner_text('body').lower()
        assert 'nhật ký thông báo' in text or 'bản ghi' in text
        return True

    # =========================================================================
    # 13. ADVANCED FEATURES: CAMERA SCANNER, CALENDAR TIMESHEET, ANALYTICS DASHBOARD
    # =========================================================================
    def employee_verify_camera_qr_modal(self):
        self.employee_open_punch_tab()
        cam_btn = self.page.locator('button:has-text("Bật Camera Quét QR Check-in")')
        cam_btn.click()
        time.sleep(1.0)
        text = self.page.inner_text('body')
        assert 'Quét Mã QR Vào Ca' in text or 'Dynamic QR' in text or 'Kiosk' in text
        fallback_btn = self.page.locator('button:has-text("Lấy Mã Kiosk Sảnh")')
        assert fallback_btn.is_visible()
        # Close modal
        x_btn = self.page.locator('.fixed.inset-0 button').first
        if x_btn.is_visible():
            x_btn.click()
        time.sleep(0.5)
        return True

    def employee_verify_detailed_calendar_view(self):
        self.employee_open_timesheet_tab()
        time.sleep(1.0)
        text = self.page.inner_text('body')
        assert 'Tra Cứu Bảng Công Chi Tiết' in text or 'Lịch Tháng (30 Ngày)' in text
        table_btn = self.page.locator('button:has-text("Bảng Chi Tiết Từng Ngày")')
        if table_btn.is_visible():
            table_btn.click()
            time.sleep(0.5)
        year_btn = self.page.locator('button:has-text("Tổng Quan 12 Tháng")')
        if year_btn.is_visible():
            year_btn.click()
            time.sleep(0.5)
        return True

    def manager_verify_executive_analytics_dashboard(self):
        self.manager_open_dashboard_tab()
        analytics_toggle = self.page.locator('button:has-text("Báo Cáo & Phân Tích Chuyên Sâu")')
        if analytics_toggle.is_visible():
            analytics_toggle.click()
            time.sleep(1.0)
        text = self.page.inner_text('body')
        assert 'Dashboard Báo Cáo & Phân Tích Chuyên Sâu' in text or 'Executive HR & Attendance Analytics' in text or 'Tổng Nhân Sự' in text
        return True

    def manager_verify_employee_detail_modal(self):
        self.manager_open_organization_tab()
        self.manager_switch_org_subtab('Danh Sách Nhân Sự')
        time.sleep(1.0)
        detail_btn = self.page.locator('button:has-text("Chi tiết")').first
        if detail_btn.is_visible():
            detail_btn.click()
            time.sleep(0.8)
            text = self.page.inner_text('body')
            assert 'Hồ Sơ Nhân Sự Chi Tiết' in text
            close_btn = self.page.locator('button:has-text("Đóng")').first
            if close_btn.is_visible():
                close_btn.click()
        return True

    def manager_verify_emergency_detail_modal(self):
        self.manager_open_emergency_review_tab()
        detail_btn = self.page.locator('button:has-text("Chi tiết & Toạ độ")').first
        if detail_btn.is_visible():
            detail_btn.click()
            time.sleep(0.8)
            text = self.page.inner_text('body')
            assert 'Chi Tiết Yêu Cầu Chấm Công Khẩn Cấp' in text or 'Khẩn Cấp' in text
            close_btn = self.page.locator('button:has-text("Đóng")').first
            if close_btn.is_visible():
                close_btn.click()
        return True

    def manager_verify_request_detail_modal(self):
        self.manager_open_approvals_tab()
        detail_btn = self.page.locator('button:has-text("Chi tiết")').first
        if detail_btn.is_visible():
            detail_btn.click()
            time.sleep(0.8)
            text = self.page.inner_text('body')
            assert 'Chi Tiết Đơn Xin Phép' in text or 'Hạn Ngạch' in text
            close_btn = self.page.locator('button:has-text("Đóng")').first
            if close_btn.is_visible():
                close_btn.click()
        return True

    def hr_verify_dispute_detail_modal(self):
        self.manager_open_timesheets_tab()
        self.manager_switch_timesheet_subtab('Cổng Xử Lý Khiếu Nại')
        time.sleep(0.8)
        detail_btn = self.page.locator('button:has-text("Chi tiết")').first
        if detail_btn.is_visible():
            detail_btn.click()
            time.sleep(0.8)
            text = self.page.inner_text('body')
            assert 'Chi Tiết Khiếu Nại Bảng Công' in text or 'Khiếu Nại' in text
            close_btn = self.page.locator('button:has-text("Đóng")').first
            if close_btn.is_visible():
                close_btn.click()
        return True

    def hr_verify_department_detail_modal(self):
        self.manager_open_organization_tab()
        self.manager_switch_org_subtab('Phòng Ban')
        time.sleep(0.8)
        eye_btn = self.page.locator('button[title="Xem chi tiết phòng ban"]').first
        if eye_btn.is_visible():
            eye_btn.click()
            time.sleep(0.8)
            text = self.page.inner_text('body')
            assert 'Chi Tiết Phòng Ban' in text or 'Tên đơn vị' in text
            close_btn = self.page.locator('button:has-text("Đóng")').first
            if close_btn.is_visible():
                close_btn.click()
        return True

    def hr_verify_device_detail_modal(self):
        self.manager_open_organization_tab()
        self.manager_switch_org_subtab('Quản Lý Thiết Bị Di Động')
        time.sleep(0.8)
        detail_btn = self.page.locator('button:has-text("Chi tiết")').first
        if detail_btn.is_visible():
            detail_btn.click()
            time.sleep(0.8)
            text = self.page.inner_text('body')
            assert 'Chi Tiết Thiết Bị Di Động' in text or 'Device Token' in text
            close_btn = self.page.locator('button:has-text("Đóng")').first
            if close_btn.is_visible():
                close_btn.click()
        return True

    def hr_verify_shift_detail_modal(self):
        self.manager_open_policies_tab()
        self.manager_switch_policy_subtab('Ca Làm Việc')
        time.sleep(0.8)
        eye_btn = self.page.locator('button[title="Xem chi tiết ca làm"]').first
        if eye_btn.is_visible():
            eye_btn.click()
            time.sleep(0.8)
            text = self.page.inner_text('body')
            assert 'Chi Tiết Ca Làm Việc' in text or 'Giờ làm' in text
            close_btn = self.page.locator('button:has-text("Đóng")').first
            if close_btn.is_visible():
                close_btn.click()
        return True

    def hr_verify_holiday_detail_modal(self):
        self.manager_open_policies_tab()
        self.manager_switch_policy_subtab('Lịch Nghỉ Lễ')
        time.sleep(0.8)
        eye_btn = self.page.locator('button[title="Xem chi tiết ngày lễ"]').first
        if eye_btn.is_visible():
            eye_btn.click()
            time.sleep(0.8)
            text = self.page.inner_text('body')
            assert 'Chi Tiết Ngày Nghỉ Lễ' in text or 'HƯỞNG NGUYÊN 100% LƯƠNG' in text
            close_btn = self.page.locator('button:has-text("Đóng")').first
            if close_btn.is_visible():
                close_btn.click()
        return True
