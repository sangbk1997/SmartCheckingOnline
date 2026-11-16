*** Settings ***
Documentation    Kiểm thử Tự Động Toàn Trình Vòng Đời Nghiệp Vụ Doanh Nghiệp (End-to-End Flow)
Library          Collections
Library          ../../resources/libraries/SmartTimeApiClient.py
Resource         ../../config/env_config.robot
Resource         ../../resources/variables/test_data.robot

*** Variables ***
${DEV_TOKEN}       ${EMPTY}
${LEAD_TOKEN}      ${EMPTY}
${HR_TOKEN}        ${EMPTY}
${E2E_DEVICE}      robot-e2e-device-token-123
${E2E_REQ_ID}      ${EMPTY}
${E2E_DISPUTE_ID}  ${EMPTY}

*** Test Cases ***
TC_E2E_01: Vòng đời nghiệp vụ toàn trình 10 bước vận hành doanh nghiệp
    [Tags]    E2E    FLOW    BUSINESS    CRITICAL
    [Documentation]    Mô phỏng chân thực chu trình làm việc 1 ngày của doanh nghiệp
    
    # 1. Đăng nhập hệ thống đa vai trò (Nhân viên, Lead, HR)
    Log    >>> Bước 1: Xác thực & Cấp phát JWT Tokens
    ${r_dev}=     Login User    ${EMAIL_DEV}
    ${r_lead}=    Login User    ${EMAIL_LEAD}
    ${r_hr}=      Login User    ${EMAIL_HR}
    ${tok_dev}=   Set Variable    ${r_dev['data']['data']['token']}
    ${tok_lead}=  Set Variable    ${r_lead['data']['data']['token']}
    ${tok_hr}=    Set Variable    ${r_hr['data']['data']['token']}
    
    # 2. Đăng ký thiết bị cá nhân (Device Binding 1-1)
    Log    >>> Bước 2: Đăng ký thiết bị cá nhân
    ${res_dev}=   Enroll Device    ${tok_dev}    ${E2E_DEVICE}    Robot E2E Phone    iOS 18
    Should Be Equal As Integers    ${res_dev['status_code']}    200
    
    # 3. Chấm công sáng bằng Dynamic QR tại Kiosk sảnh
    Log    >>> Bước 3: Lấy mã Kiosk QR và Chấm công sáng
    ${kiosk}=     Fetch Kiosk Qr
    ${qr}=        Set Variable    ${kiosk['data']['data']['qrPayload']}
    ${punch}=     Punch Attendance Qr    ${tok_dev}    ${qr}    ${E2E_DEVICE}    IN
    Should Be Equal As Integers    ${punch['status_code']}    200
    Should Be Equal As Strings     ${punch['data']['data']['status']}    VALID
    
    # 4. Nhân viên gửi đơn xin Nghỉ phép năm
    Log    >>> Bước 4: Tạo đơn xin nghỉ phép năm
    ${req}=       Create Request    ${tok_dev}    ANNUAL_LEAVE    ${TEST_LEAVE_DATE}    ${TEST_LEAVE_DATE}    1.0    Robot E2E Leave Flow
    Should Be Equal As Integers    ${req['status_code']}    200
    ${req_id}=    Set Variable    ${req['data']['data']['id']}
    
    # 5. Tech Lead phê duyệt đơn 1-click
    Log    >>> Bước 5: Quản lý phê duyệt đơn nghỉ phép
    ${appr}=      Review Request    ${tok_lead}    ${req_id}    APPROVE    E2E Lead Approved
    Should Be Equal As Integers    ${appr['status_code']}    200
    Should Be Equal As Strings     ${appr['data']['data']['status']}    APPROVED
    
    # 6. Chấm công khẩn cấp buổi chiều (Selfie GPS khi máy hết pin)
    Log    >>> Bước 6: Chấm công khẩn cấp kèm ảnh selfie và GPS
    ${em_punch}=  Punch Emergency Selfie    ${tok_dev}    IN    ${HQ_LATITUDE}    ${HQ_LONGITUDE}    E2E Quên máy tính
    Should Be Equal As Integers    ${em_punch['status_code']}    200
    ${punch_id}=  Set Variable    ${em_punch['data']['data']['id']}
    
    # 7. HR Admin phê duyệt bản ghi chấm công khẩn cấp
    Log    >>> Bước 7: HR Admin duyệt chấm công khẩn cấp
    ${rev_em}=    Review Emergency    ${tok_hr}    ${punch_id}    APPROVE    Xác thực khuôn mặt hợp lệ
    Should Be Equal As Integers    ${rev_em['status_code']}    200
    
    # 8. Nhân viên gửi khiếu nại công kỳ hiện tại
    Log    >>> Bước 8: Nhân viên gửi khiếu nại công trong hạn 48h
    ${disp}=      Submit Dispute    ${tok_dev}    ${CURRENT_PERIOD_ID}    2026-11-13    E2E Khiếu nại thiếu giờ về
    Should Be Equal As Integers    ${disp['status_code']}    200
    ${disp_id}=   Set Variable    ${disp['data']['data']['id']}
    
    # 9. HR Admin duyệt khiếu nại (Ghi nhận công hồi tố)
    Log    >>> Bước 9: HR giải quyết khiếu nại
    ${res_disp}=  Resolve Dispute    ${tok_hr}    ${disp_id}    APPROVE    Duyệt bù 1 công hồi tố
    Should Be Equal As Integers    ${res_disp['status_code']}    200
    Should Be Equal As Strings     ${res_disp['data']['data']['status']}    ACCEPTED
    
    # 10. HR Admin xuất file CSV có UTF-8 BOM và bắn thông báo Google Chat
    Log    >>> Bước 10: Xuất CSV bảng công và gửi thông báo Google Chat
    ${csv}=       Export Timesheet Csv    ${tok_hr}    ${CURRENT_PERIOD_ID}
    Should Be Equal As Integers    ${csv['status_code']}    200
    
    ${chat}=       Test Chat Card    ${tok_hr}
    Should Be Equal As Integers    ${chat['status_code']}    200
    ${chat_json}=  Set Variable    ${chat['data']}
    Should Be True                 ${chat_json['success']}
    Should Be Equal As Strings     ${chat_json['data']['channel']}    GOOGLE_CHAT
    Log    >>> HOÀN TẤT TOÀN BỘ 10 BƯỚC VÒNG ĐỜI NGHIỆP VỤ DOANH NGHIỆP!

TC_E2E_02: Vòng đời quản lý Nhân sự từ Tiếp nhận đến Thu hồi thiết bị (Onboarding to Offboarding)
    [Tags]    E2E    FLOW    HR_MANAGEMENT    EMPLOYEE_LIFECYCLE
    [Documentation]    Quy trình HR tiếp nhận nhân viên mới -> Nhân viên cài đặt thiết bị -> Chấm công -> Bàn giao & Thu hồi máy
    ${r_hr}=      Login User    ${EMAIL_HR}
    ${tok_hr}=    Set Variable    ${r_hr['data']['data']['token']}
    
    # 1. HR Onboarding nhân viên mới
    ${random_num}=    Evaluate    str(__import__('random').randint(10000, 99999))
    ${emp_email}=     Set Variable    onboard_${random_num}@smartcorp.com
    ${emp_payload}=   Evaluate    {'employeeCode': 'E2E' + '${random_num}', 'fullName': 'Nguyễn Văn Onboard', 'email': '${emp_email}', 'departmentId': 'd-dev-002', 'contractType': 'OFFICIAL', 'appRole': 'EMPLOYEE', 'isActive': True}
    ${res_new}=       Create Employee    ${tok_hr}    ${emp_payload}
    Should Be Equal As Integers    ${res_new['status_code']}    200
    ${new_emp_id}=    Set Variable    ${res_new['data']['data']['id']}
    
    # 2. Nhân viên mới đăng nhập
    ${r_new_emp}=     Login User    ${emp_email}
    Should Be Equal As Integers    ${r_new_emp['status_code']}    200
    ${tok_new_emp}=   Set Variable    ${r_new_emp['data']['data']['token']}
    
    # 3. Nhân viên mới đăng ký liên kết thiết bị cá nhân
    ${device_id}=     Set Variable    device-flow-onboard-${random_num}
    ${enroll}=        Enroll Device    ${tok_new_emp}    ${device_id}    Company Laptop Pro    macOS 15
    Should Be Equal As Integers    ${enroll['status_code']}    200
    ${dev_record_id}=    Set Variable    ${enroll['data']['data']['id']}
    
    # 4. Nhân viên mới thực hiện chấm công ngày đầu đi làm
    Sleep             5.5s
    ${kiosk}=         Fetch Kiosk Qr
    ${qr}=            Set Variable    ${kiosk['data']['data']['qrPayload']}
    ${punch}=         Punch Attendance Qr    ${tok_new_emp}    ${qr}    ${device_id}    IN
    Should Be Equal As Integers    ${punch['status_code']}    200
    Should Be Equal As Strings     ${punch['data']['data']['status']}    VALID
    
    # 5. HR Admin cập nhật thông tin nhân viên chuyển phòng ban
    ${upd_payload}=   Evaluate    {'fullName': 'Nguyễn Văn Onboard (Lead)', 'email': '${emp_email}', 'departmentId': 'd-dev-002', 'contractType': 'OFFICIAL', 'appRole': 'EMPLOYEE', 'isActive': True}
    ${upd_res}=       Update Employee    ${tok_hr}    ${new_emp_id}    ${upd_payload}
    Should Be Equal As Integers    ${upd_res['status_code']}    200
    
    # 6. Thu hồi liên kết thiết bị khi nhân viên đổi thiết bị hoặc chuyển giao
    ${rev_res}=       Revoke Device    ${tok_hr}    ${dev_record_id}
    Should Be Equal As Integers    ${rev_res['status_code']}    200
    
    # 7. Kiểm tra: Nhân viên dùng thiết bị cũ chấm công sẽ bị từ chối
    Sleep             5.5s
    ${kiosk2}=        Fetch Kiosk Qr
    ${qr2}=           Set Variable    ${kiosk2['data']['data']['qrPayload']}
    ${punch_block}=   Punch Attendance Qr    ${tok_new_emp}    ${qr2}    ${device_id}    IN
    Should Be Equal As Integers    ${punch_block['status_code']}    400
    Should Be Equal As Strings     ${punch_block['data']['code']}    ERR_DEVICE_MISMATCH

TC_E2E_03: Phát hiện Gian lận Vị trí GPS và Cảnh báo Bảo mật (Fraud Detection & Security Geofencing)
    [Tags]    E2E    FLOW    FRAUD    SECURITY    GEOFENCING
    [Documentation]    Phát hiện nhân viên chấm công khẩn cấp ở vị trí cách xa văn phòng > 5km, hệ thống kích hoạt cờ cảnh báo và HR từ chối duyệt
    ${r_dev}=     Login User    ${EMAIL_DEV}
    ${r_hr}=      Login User    ${EMAIL_HR}
    ${tok_dev}=   Set Variable    ${r_dev['data']['data']['token']}
    ${tok_hr}=    Set Variable    ${r_hr['data']['data']['token']}
    
    # 1. Nhân viên chấm công khẩn cấp với tọa độ lệch xa văn phòng (> 5km)
    ${spoofed_lat}=    Set Variable    10.8500
    ${spoofed_lng}=    Set Variable    106.7500
    ${res_fake}=       Punch Emergency Selfie    ${tok_dev}    IN    ${spoofed_lat}    ${spoofed_lng}    Fake GPS Emergency Attempt
    Should Be Equal As Integers    ${res_fake['status_code']}    200
    ${fake_punch_id}=  Set Variable    ${res_fake['data']['data']['id']}
    ${warning_flag}=   Set Variable    ${res_fake['data']['data']['rejectionReason']}
    Should Contain     ${warning_flag}    FLAG_LOCATION_MISMATCH
    
    # 2. HR lấy danh sách các đơn khẩn cấp chờ duyệt
    ${pending_em}=     Get Pending Emergencies    ${tok_hr}
    Should Be Equal As Integers    ${pending_em['status_code']}    200
    
    # 3. HR phát hiện vi phạm Geofencing và từ chối duyệt đơn
    ${reject_em}=      Review Emergency    ${tok_hr}    ${fake_punch_id}    REJECT    Vi phạm Geofencing: Tọa độ cách văn phòng vượt ngưỡng cho phép
    Should Be Equal As Integers    ${reject_em['status_code']}    200
    Should Be Equal As Strings     ${reject_em['data']['data']['status']}    REJECTED

TC_E2E_04: Khóa sổ Kỳ Bảng lương và Tự động Hồi tố Công (Payroll Closing & Retroactive Adjustment)
    [Tags]    E2E    FLOW    PAYROLL    CLOSING    RETROACTIVE
    [Documentation]    HR khóa sổ kỳ công hiện tại, xử lý khiếu nại phát sinh sau khóa sổ và kiểm tra hồi tố công vào kỳ kế tiếp
    ${r_hr}=      Login User    ${EMAIL_HR}
    ${r_dev}=     Login User    ${EMAIL_DEV}
    ${tok_hr}=    Set Variable    ${r_hr['data']['data']['token']}
    ${tok_dev}=   Set Variable    ${r_dev['data']['data']['token']}
    
    # 1. HR thực hiện khóa sổ kỳ công hiện tại
    ${lock}=      Lock Period    ${tok_hr}    ${CURRENT_PERIOD_ID}
    Should Be Equal As Integers    ${lock['status_code']}    200
    Should Be Equal As Strings     ${lock['data']['data']['status']}    LOCKED
    
    # 2. Cơ chế bảo vệ bất biến: Không thể tổng hợp lại kỳ công đã khóa sổ
    ${agg_blocked}=    Aggregate Period    ${tok_hr}    ${CURRENT_PERIOD_ID}
    Should Be Equal As Integers    ${agg_blocked['status_code']}    400
    Should Contain    ${agg_blocked['data']['message']}    bị khóa bất biến
    
    # 3. Nhân viên gửi khiếu nại công ngày trong kỳ
    ${disp}=      Submit Dispute    ${tok_dev}    ${CURRENT_PERIOD_ID}    2026-11-12    Khiếu nại bổ sung công làm ngoài giờ tháng trước
    Should Be Equal As Integers    ${disp['status_code']}    200
    ${disp_id}=   Set Variable    ${disp['data']['data']['id']}
    
    # 4. HR duyệt khiếu nại -> Backend tự động tạo bút toán hồi tố vào kỳ mở kế tiếp
    ${res_disp}=  Resolve Dispute    ${tok_hr}    ${disp_id}    APPROVE    Duyệt hồi tố +1.0 ngày công vào kỳ kế tiếp
    Should Be Equal As Integers    ${res_disp['status_code']}    200
    Should Be Equal As Strings     ${res_disp['data']['data']['status']}    ACCEPTED
    
    # 5. HR xuất báo cáo CSV có UTF-8 BOM để gửi Kế toán
    ${csv}=       Export Timesheet Csv    ${tok_hr}    ${CURRENT_PERIOD_ID}
    Should Be Equal As Integers    ${csv['status_code']}    200
    ${content}=   Set Variable    ${csv['content']}
    ${bom}=       Evaluate        bytes([0xEF, 0xBB, 0xBF])
    ${starts_with_bom}=    Evaluate    $content.startswith($bom)
    Should Be True    ${starts_with_bom}

TC_E2E_05: Quy trình Duyệt Đơn Đa Kênh qua Google Workspace (Gmail Actionable & Chat Card v2)
    [Tags]    E2E    FLOW    GOOGLE_WORKSPACE    ACTIONABLE_EMAIL    CHAT_CARD
    [Documentation]    Nhân viên gửi đơn -> Hệ thống tự động bắn email & thẻ Google Chat Card v2 -> Quản lý duyệt và cập nhật nhật ký audit
    ${r_dev}=     Login User    ${EMAIL_DEV}
    ${r_lead}=    Login User    ${EMAIL_LEAD}
    ${tok_dev}=   Set Variable    ${r_dev['data']['data']['token']}
    ${tok_lead}=  Set Variable    ${r_lead['data']['data']['token']}
    
    # 1. Nhân viên nộp đơn xin Nghỉ phép năm (ANNUAL_LEAVE)
    ${req}=       Create Request    ${tok_dev}    ANNUAL_LEAVE    2026-11-26    2026-11-26    1.0    E2E Google Workspace Flow Request
    Should Be Equal As Integers    ${req['status_code']}    200
    ${req_id}=    Set Variable    ${req['data']['data']['id']}
    
    # 2. Bắn thẻ thử nghiệm Google Chat Card v2 vào Space chung
    ${chat}=      Test Chat Card    ${tok_lead}
    Should Be Equal As Integers    ${chat['status_code']}    200
    Should Be True                 ${chat['data']['success']}
    
    # 3. Quản lý xem danh sách thẻ Google Chat tương tác gần đây
    ${cards}=     Get Recent Chat Cards    ${tok_lead}
    Should Be Equal As Integers    ${cards['status_code']}    200
    Should Be True                 ${cards['data']['success']}
    
    # 4. Quản lý duyệt đơn trên hệ thống
    ${appr}=      Review Request    ${tok_lead}    ${req_id}    APPROVE    Duyệt qua Google Workspace Pipeline
    Should Be Equal As Integers    ${appr['status_code']}    200
    Should Be Equal As Strings     ${appr['data']['data']['status']}    APPROVED
    
    # 5. Tra cứu nhật ký thông báo Google Workspace (Notification Audit Logs)
    ${logs}=      Get Notification Logs    ${tok_lead}
    Should Be Equal As Integers    ${logs['status_code']}    200
    Should Be True                 ${logs['data']['success']}
    Should Not Be Empty            ${logs['data']['data']}

TC_E2E_06: Kiểm soát Ràng buộc Quy chế Hạn ngạch và Ngăn chặn Lạm dụng (Policy Quotas & Boundary Rules)
    [Tags]    E2E    FLOW    QUOTAS    POLICY    BOUNDARY
    [Documentation]    Kiểm tra hệ thống thực thi nghiêm ngặt các quy định: Đi muộn tối đa 60p, Nghỉ ốm bắt buộc giấy C65
    ${r_dev}=     Login User    ${EMAIL_DEV}
    ${tok_dev}=   Set Variable    ${r_dev['data']['data']['token']}
    
    # 1. Nhân viên kiểm tra hạn ngạch còn lại
    ${q_res}=     Get Remaining Quotas    ${tok_dev}
    Should Be Equal As Integers    ${q_res['status_code']}    200
    Should Be True                 ${q_res['data']['success']}
    
    # 2. Thử nộp đơn Đi muộn 90 phút (> 60 phút tối đa) -> Bắt buộc bị từ chối
    ${late_fail}=    Create Request    ${tok_dev}    LATE_IN    2026-11-18    2026-11-18    0.0    Kẹt xe quá nặng    duration_minutes=90
    Should Be True                 ${late_fail['status_code']} in [400, 500]
    Should Not Be True             ${late_fail['data'].get('success', False)}
    Should Contain                 ${late_fail['data']['code']}    ERR_QUOTA_EXCEEDED
    
    # 3. Thử nộp đơn Nghỉ ốm nhưng KHÔNG đính kèm giấy C65 -> Bắt buộc bị từ chối
    ${sick_fail}=    Create Request    ${tok_dev}    SICK_LEAVE    2026-11-19    2026-11-19    1.0    Bị sốt xuất huyết    attachment_url=${NONE}
    Should Be True                 ${sick_fail['status_code']} in [400, 500]
    Should Not Be True             ${sick_fail['data'].get('success', False)}
    Should Contain                 ${sick_fail['data']['code']}    ERR_ATTACHMENT_REQUIRED
    
    # 4. Nộp đơn Nghỉ ốm kèm đầy đủ chứng từ C65 -> Thành công
    ${sick_ok}=    Create Request    ${tok_dev}    SICK_LEAVE    2026-11-19    2026-11-19    1.0    Bị sốt xuất huyết kèm giấy C65    attachment_url=https://storage.congty.com/c65_valid.pdf
    Should Be Equal As Integers    ${sick_ok['status_code']}    200
    Should Be True                 ${sick_ok['data']['success']}
    Should Be Equal As Strings     ${sick_ok['data']['data']['status']}    PENDING

TC_E2E_07: Vòng đời Bảng công Đa chiều và Tương tác Khiếu nại 48h (Calendar Timesheet & 48h Dispute Lifecycle)
    [Tags]    E2E    FLOW    TIMESHEET    CALENDAR    DISPUTE
    [Documentation]    Nhân viên tra cứu lịch 30 ngày, gửi khiếu nại công 48h, HR phê duyệt bù công và xác nhận ma trận cập nhật
    ${r_dev}=     Login User    ${EMAIL_DEV}
    ${r_hr}=      Login User    ${EMAIL_HR}
    ${tok_dev}=   Set Variable    ${r_dev['data']['data']['token']}
    ${tok_hr}=    Set Variable    ${r_hr['data']['data']['token']}
    
    # 1. Nhân viên tra cứu Bảng công ma trận 30 ngày
    ${cal_dev}=   Get Calendar Timesheet    ${tok_dev}    year=2026    month=11
    Should Be Equal As Integers    ${cal_dev['status_code']}    200
    Should Be True                 ${cal_dev['data']['success']}
    Should Not Be Empty            ${cal_dev['data']['data']['days']}
    
    # 2. Nhân viên gửi khiếu nại công ngày 2026-11-13
    ${disp_res}=    Submit Dispute    ${tok_dev}    ${CURRENT_PERIOD_ID}    2026-11-13    E2E Quên chấm công về buổi chiều
    Should Be Equal As Integers    ${disp_res['status_code']}    200
    Should Be True                 ${disp_res['data']['success']}
    ${disp_id}=     Set Variable     ${disp_res['data']['data']['id']}
    
    # 3. HR Admin xử lý và Chấp thuận khiếu nại
    ${res_disp}=    Resolve Dispute   ${tok_hr}    ${disp_id}    APPROVE    HR đã đối chiếu dữ liệu camera và bù công
    Should Be Equal As Integers    ${res_disp['status_code']}    200
    Should Be Equal As Strings     ${res_disp['data']['data']['status']}    ACCEPTED
    
    # 4. Nhân viên xem lại Bảng công và xác thực cập nhật
    ${cal_after}=    Get Calendar Timesheet    ${tok_dev}    year=2026    month=11
    Should Be Equal As Integers    ${cal_after['status_code']}    200
    Should Be True                 ${cal_after['data']['success']}

TC_E2E_08: Quy trình Quản trị Điều hành Doanh nghiệp Toàn diện (Executive Analytics & Organization Governance)
    [Tags]    E2E    FLOW    ANALYTICS    GOVERNANCE    MASTER_DATA
    [Documentation]    HR Admin theo dõi Dashboard điều hành, phân tích quân số phòng ban, và cấu hình danh mục tổ chức
    ${r_hr}=        Login User    ${EMAIL_HR}
    ${tok_hr}=      Set Variable    ${r_hr['data']['data']['token']}
    
    # 1. HR truy vấn Executive Analytics Dashboard
    ${analytics}=    Get Executive Analytics    ${tok_hr}
    Should Be Equal As Integers    ${analytics['status_code']}    200
    Should Be True                 ${analytics['data']['success']}
    Should Be True                 ${analytics['data']['data']['totalEmployees']} > 0
    Should Not Be Empty            ${analytics['data']['data']['departmentBreakdown']}
    
    # 2. HR tạo Phòng ban mới và cập nhật
    ${dept_rand}=   Evaluate    str(__import__('random').randint(10000, 99999))
    ${d_payload}=   Evaluate    {'code': 'D_E2E_${dept_rand}', 'name': 'Ban Nghiên Cứu Phát Triển E2E', 'isActive': True}
    ${d_res}=       Create Department    ${tok_hr}    ${d_payload}
    Should Be Equal As Integers    ${d_res['status_code']}    200
    ${dept_id}=     Set Variable    ${d_res['data']['data']['id']}
    
    # 3. HR tạo Ca làm việc mới
    ${shift_rand}=  Evaluate    str(__import__('random').randint(1000, 9999))
    ${s_payload}=   Evaluate    {'shiftCode': 'CA_E2E_${shift_rand}', 'shiftName': 'Ca Nghiên Cứu E2E', 'shiftType': 'FIXED', 'startTime': '08:30:00', 'endTime': '17:30:00', 'standardWorkHours': 8.0, 'isActive': True}
    ${s_res}=       Create Shift    ${tok_hr}    ${s_payload}
    Should Be Equal As Integers    ${s_res['status_code']}    200
    ${shift_id}=    Set Variable    ${s_res['data']['data']['id']}
    
    # 4. HR kích hoạt lại Thiết bị di động
    ${devices}=     Get All Devices    ${tok_hr}
    ${dev_id}=      Set Variable    ${devices['data']['data'][0]['id']}
    ${act_res}=     Activate Device    ${tok_hr}    ${dev_id}
    Should Be Equal As Integers    ${act_res['status_code']}    200
    
    # 5. Dọn dẹp dữ liệu thử nghiệm (Clean up)
    ${del_s}=      Delete Shift    ${tok_hr}    ${shift_id}
    Should Be Equal As Integers    ${del_s['status_code']}    200
    ${del_d}=      Delete Department    ${tok_hr}    ${dept_id}
    Should Be Equal As Integers    ${del_d['status_code']}    200

