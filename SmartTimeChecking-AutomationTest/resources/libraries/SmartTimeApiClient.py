import requests
import json
import time

class SmartTimeApiClient:
    ROBOT_LIBRARY_SCOPE = 'GLOBAL'

    def __init__(self, base_url='http://localhost:8085'):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()

    def set_base_url(self, base_url):
        self.base_url = base_url.rstrip('/')

    def _auth_headers(self, token):
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'
        return headers

    def _parse_response(self, resp):
        try:
            body = resp.json()
        except Exception:
            body = {'raw': resp.text}
        return {'status_code': resp.status_code, 'data': body}

    def login_user(self, email):
        url = f'{self.base_url}/api/v1/auth/login'
        resp = self.session.post(url, json={'email': email}, timeout=10)
        return self._parse_response(resp)

    def fetch_kiosk_qr(self):
        url = f'{self.base_url}/api/v1/kiosk/current-qr'
        resp = self.session.get(url, timeout=10)
        return self._parse_response(resp)

    def enroll_device(self, token, device_token, name='Robot Test Device', platform='macOS'):
        url = f'{self.base_url}/api/v1/devices/enroll'
        payload = {
            'deviceToken': device_token,
            'deviceName': name,
            'platform': platform
        }
        resp = self.session.post(url, json=payload, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def punch_attendance_qr(self, token, qr_payload, device_token, punch_type='IN'):
        url = f'{self.base_url}/api/v1/attendance/punch'
        payload = {
            'qrPayload': qr_payload,
            'deviceToken': device_token,
            'punchType': punch_type
        }
        resp = self.session.post(url, json=payload, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def punch_emergency_selfie(self, token, punch_type='IN', lat=10.7769, lng=106.7009, reason='Quên điện thoại'):
        url = f'{self.base_url}/api/v1/attendance/punch-emergency'
        params = {
            'punchType': punch_type,
            'latitude': float(lat),
            'longitude': float(lng),
            'reason': reason
        }
        headers = {}
        if token:
            headers['Authorization'] = f'Bearer {token}'
        resp = self.session.post(url, params=params, headers=headers, timeout=10)
        return self._parse_response(resp)

    def get_today_attendance(self, token):
        url = f'{self.base_url}/api/v1/attendance/today'
        resp = self.session.get(url, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def get_live_dashboard(self, token):
        url = f'{self.base_url}/api/v1/attendance/live-dashboard'
        resp = self.session.get(url, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def get_remaining_quotas(self, token):
        url = f'{self.base_url}/api/v1/requests/quotas/remaining'
        resp = self.session.get(url, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def create_request(self, token, req_type, start_date, end_date, days=1.0, reason='Test Request', duration_minutes=None, attachment_url=None):
        url = f'{self.base_url}/api/v1/requests'
        payload = {
            'requestType': req_type,
            'fromDate': start_date,
            'toDate': end_date,
            'leaveUnits': float(days),
            'reason': reason
        }
        if duration_minutes is not None:
            payload['durationMinutes'] = int(duration_minutes)
        if attachment_url is not None:
            payload['attachmentUrl'] = attachment_url
        resp = self.session.post(url, json=payload, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def get_my_requests(self, token):
        url = f'{self.base_url}/api/v1/requests/my-requests'
        resp = self.session.get(url, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def get_pending_requests(self, token):
        url = f'{self.base_url}/api/v1/requests/pending'
        resp = self.session.get(url, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def review_request(self, token, req_id, action='APPROVE', comment='Reviewed'):
        url = f'{self.base_url}/api/v1/requests/{req_id}/review'
        payload = {'action': action, 'comment': comment}
        resp = self.session.post(url, json=payload, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def cancel_request(self, token, req_id):
        url = f'{self.base_url}/api/v1/requests/{req_id}'
        resp = self.session.delete(url, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def get_pending_emergencies(self, token):
        url = f'{self.base_url}/api/v1/admin/attendance/emergency-pending'
        resp = self.session.get(url, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def review_emergency(self, token, punch_id, action='APPROVE', comment='Valid'):
        url = f'{self.base_url}/api/v1/admin/attendance/emergency/{punch_id}/review'
        payload = {'action': action, 'comment': comment}
        resp = self.session.post(url, json=payload, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def get_payroll_periods(self, token):
        url = f'{self.base_url}/api/v1/timesheets/periods'
        resp = self.session.get(url, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def submit_dispute(self, token, period_id, disputed_date, reason):
        url = f'{self.base_url}/api/v1/timesheets/disputes'
        params = {'periodId': period_id, 'disputedDate': disputed_date, 'reason': reason}
        headers = {}
        if token:
            headers['Authorization'] = f'Bearer {token}'
        resp = self.session.post(url, params=params, headers=headers, timeout=10)
        return self._parse_response(resp)

    def get_timesheet_matrix(self, token, period_id):
        url = f'{self.base_url}/api/v1/timesheets/admin/periods/{period_id}/matrix'
        resp = self.session.get(url, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def resolve_dispute(self, token, dispute_id, action='APPROVE', notes='Resolved'):
        url = f'{self.base_url}/api/v1/timesheets/admin/disputes/{dispute_id}/resolve'
        params = {'action': action, 'notes': notes}
        headers = {}
        if token:
            headers['Authorization'] = f'Bearer {token}'
        resp = self.session.post(url, params=params, headers=headers, timeout=10)
        return self._parse_response(resp)

    def aggregate_period(self, token, period_id):
        url = f'{self.base_url}/api/v1/timesheets/admin/periods/{period_id}/aggregate'
        resp = self.session.post(url, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def lock_period(self, token, period_id):
        url = f'{self.base_url}/api/v1/timesheets/admin/periods/{period_id}/lock'
        resp = self.session.post(url, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def export_timesheet_csv(self, token, period_id):
        url = f'{self.base_url}/api/v1/timesheets/admin/periods/{period_id}/export-csv'
        resp = self.session.get(url, headers=self._auth_headers(token), timeout=10)
        return {
            'status_code': resp.status_code,
            'headers': dict(resp.headers),
            'content': resp.content,
            'text': resp.text
        }

    def get_all_employees(self, token):
        url = f'{self.base_url}/api/v1/admin/employees'
        resp = self.session.get(url, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def create_employee(self, token, emp_data):
        url = f'{self.base_url}/api/v1/admin/employees'
        resp = self.session.post(url, json=emp_data, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def update_employee(self, token, emp_id, emp_data):
        url = f'{self.base_url}/api/v1/admin/employees/{emp_id}'
        resp = self.session.put(url, json=emp_data, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def get_all_departments(self, token):
        url = f'{self.base_url}/api/v1/departments'
        resp = self.session.get(url, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def create_department(self, token, dept_data):
        url = f'{self.base_url}/api/v1/departments/admin'
        resp = self.session.post(url, json=dept_data, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def get_all_devices(self, token):
        url = f'{self.base_url}/api/v1/devices/admin/all'
        resp = self.session.get(url, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def revoke_device(self, token, device_id):
        url = f'{self.base_url}/api/v1/devices/admin/{device_id}/revoke'
        resp = self.session.post(url, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def get_shifts(self, token):
        url = f'{self.base_url}/api/v1/admin/settings/shifts'
        resp = self.session.get(url, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def get_policies(self, token):
        url = f'{self.base_url}/api/v1/admin/settings/policies'
        resp = self.session.get(url, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def update_policy(self, token, policy_id, policy_data):
        url = f'{self.base_url}/api/v1/admin/settings/policies/{policy_id}'
        resp = self.session.put(url, json=policy_data, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def get_holidays(self, token):
        url = f'{self.base_url}/api/v1/admin/settings/holidays'
        resp = self.session.get(url, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def create_holiday(self, token, holiday_data):
        url = f'{self.base_url}/api/v1/admin/settings/holidays'
        resp = self.session.post(url, json=holiday_data, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def get_notification_config(self, token):
        url = f'{self.base_url}/api/v1/admin/notifications/config'
        resp = self.session.get(url, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def update_notification_config(self, token, config_data):
        url = f'{self.base_url}/api/v1/admin/notifications/config'
        resp = self.session.post(url, json=config_data, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def test_email(self, token, to_email='test@congty.com'):
        url = f'{self.base_url}/api/v1/admin/notifications/test-email'
        params = {'toEmail': to_email}
        resp = self.session.post(url, params=params, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def test_chat_card(self, token):
        url = f'{self.base_url}/api/v1/admin/notifications/test-chat'
        resp = self.session.post(url, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def trigger_daily_bulletin(self, token):
        url = f'{self.base_url}/api/v1/admin/notifications/daily-bulletin'
        resp = self.session.post(url, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def get_recent_chat_cards(self, token):
        url = f'{self.base_url}/api/v1/admin/notifications/recent-chat-cards'
        resp = self.session.get(url, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def get_notification_logs(self, token):
        url = f'{self.base_url}/api/v1/admin/notifications/logs'
        resp = self.session.get(url, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    # =========================================================================
    # ADVANCED API: CALENDAR TIMESHEET, YEARLY, EXECUTIVE ANALYTICS & FULL CRUD
    # =========================================================================
    def get_calendar_timesheet(self, token, year=2026, month=11, employee_id=None):
        url = f'{self.base_url}/api/v1/timesheets/calendar'
        params = {'year': year, 'month': month}
        if employee_id:
            params['employeeId'] = employee_id
        resp = self.session.get(url, params=params, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def get_yearly_overview_timesheet(self, token, year=2026, employee_id=None):
        url = f'{self.base_url}/api/v1/timesheets/yearly-overview'
        params = {'year': year}
        if employee_id:
            params['employeeId'] = employee_id
        resp = self.session.get(url, params=params, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def get_executive_analytics(self, token):
        url = f'{self.base_url}/api/v1/timesheets/admin/analytics'
        resp = self.session.get(url, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def create_shift(self, token, shift_data):
        url = f'{self.base_url}/api/v1/admin/settings/shifts'
        resp = self.session.post(url, json=shift_data, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def update_shift(self, token, shift_id, shift_data):
        url = f'{self.base_url}/api/v1/admin/settings/shifts/{shift_id}'
        resp = self.session.put(url, json=shift_data, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def delete_shift(self, token, shift_id):
        url = f'{self.base_url}/api/v1/admin/settings/shifts/{shift_id}'
        resp = self.session.delete(url, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def update_holiday(self, token, holiday_id, holiday_data):
        url = f'{self.base_url}/api/v1/admin/settings/holidays/{holiday_id}'
        resp = self.session.put(url, json=holiday_data, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def delete_holiday(self, token, holiday_id):
        url = f'{self.base_url}/api/v1/admin/settings/holidays/{holiday_id}'
        resp = self.session.delete(url, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def activate_device(self, token, device_id):
        url = f'{self.base_url}/api/v1/devices/admin/{device_id}/activate'
        resp = self.session.post(url, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def update_department(self, token, dept_id, dept_data):
        url = f'{self.base_url}/api/v1/departments/admin/{dept_id}'
        resp = self.session.put(url, json=dept_data, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def delete_department(self, token, dept_id):
        url = f'{self.base_url}/api/v1/departments/admin/{dept_id}'
        resp = self.session.delete(url, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def get_employee_detail(self, token, employee_id):
        url = f'{self.base_url}/api/v1/admin/employees/{employee_id}'
        resp = self.session.get(url, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)

    def deactivate_employee(self, token, employee_id):
        url = f'{self.base_url}/api/v1/admin/employees/{employee_id}'
        resp = self.session.delete(url, headers=self._auth_headers(token), timeout=10)
        return self._parse_response(resp)
