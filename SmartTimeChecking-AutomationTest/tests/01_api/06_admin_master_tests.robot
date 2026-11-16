*** Settings ***
Documentation    Kiểm thử API Quản trị Dữ liệu Danh mục, Nhân sự & Thiết bị (Admin API)
Library          ../../resources/libraries/SmartTimeApiClient.py
Resource         ../../resources/variables/test_data.robot

Suite Setup      Setup HR Token

*** Variables ***
${HR_TOKEN}          ${EMPTY}
${NEW_EMP_ID}        ${EMPTY}
${NEW_DEPT_ID}       ${EMPTY}

*** Keywords ***
Setup HR Token
    ${r_hr}=    Login User    ${EMAIL_HR}
    Set Suite Variable    ${HR_TOKEN}    ${r_hr['data']['data']['token']}

*** Test Cases ***
TC_API_ADM_01: Lấy danh sách nhân viên toàn công ty
    [Tags]    API    ADMIN    EMPLOYEES    P1
    ${res}=    Get All Employees    ${HR_TOKEN}
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=    Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    ${count}=   Get Length    ${json['data']}
    Should Be True    ${count} >= 14

TC_API_ADM_02: Tiếp nhận nhân sự mới (Onboarding Employee)
    [Tags]    API    ADMIN    EMPLOYEES    P0
    ${random_num}=    Evaluate    str(__import__('random').randint(1000, 9999))
    ${emp_payload}=   Evaluate    {'employeeCode': 'EMP' + '${random_num}', 'fullName': 'Nguyễn Văn Test', 'email': 'test.' + '${random_num}' + '@smartcorp.com', 'departmentId': 'd-dev-002', 'contractType': 'OFFICIAL', 'appRole': 'EMPLOYEE', 'isActive': True}
    ${res}=           Create Employee    ${HR_TOKEN}    ${emp_payload}
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=          Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    Set Suite Variable    ${NEW_EMP_ID}    ${json['data']['id']}

TC_API_ADM_03: Cập nhật thông tin nhân viên
    [Tags]    API    ADMIN    EMPLOYEES    P1
    ${rand_upd}=          Evaluate    str(__import__('random').randint(1000, 9999))
    ${update_payload}=    Evaluate    {'fullName': 'Nguyễn Văn Test (Updated)', 'email': 'updated.' + '${rand_upd}' + '@smartcorp.com', 'departmentId': 'd-dev-002', 'contractType': 'OFFICIAL', 'appRole': 'EMPLOYEE', 'isActive': True}
    ${res}=               Update Employee    ${HR_TOKEN}    ${NEW_EMP_ID}    ${update_payload}
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=              Set Variable    ${res['data']}
    Should Be True        ${json['success']}
    Should Be Equal As Strings    ${json['data']['fullName']}    Nguyễn Văn Test (Updated)

TC_API_ADM_04: Lấy danh sách phòng ban trong công ty
    [Tags]    API    ADMIN    DEPARTMENTS    P1
    ${res}=    Get All Departments    ${HR_TOKEN}
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=    Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    ${count}=   Get Length    ${json['data']}
    Should Be True    ${count} >= 7

TC_API_ADM_05: Thêm mới phòng ban tổ chức
    [Tags]    API    ADMIN    DEPARTMENTS    P1
    ${dept_rand}=       Evaluate    str(__import__('random').randint(10000, 99999))
    ${dept_code}=       Set Variable    DEPT_${dept_rand}
    ${dept_payload}=    Evaluate    {'code': '${dept_code}', 'name': 'Phòng Thử Nghiệm Tự Động', 'isActive': True}
    ${res}=             Create Department    ${HR_TOKEN}    ${dept_payload}
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=            Set Variable    ${res['data']}
    Should Be True      ${json['success']}
    Should Be Equal As Strings    ${json['data']['code']}    ${dept_code}

TC_API_ADM_06: Quản trị thiết bị chấm công & Thu hồi thiết bị nghi vấn
    [Tags]    API    ADMIN    DEVICES    P1
    ${res}=    Get All Devices    ${HR_TOKEN}
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=    Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    ${first_device_id}=    Set Variable    ${json['data'][0]['id']}
    # Thu hồi thiết bị
    ${rev_res}=    Revoke Device    ${HR_TOKEN}    ${first_device_id}
    Should Be Equal As Integers    ${rev_res['status_code']}    200
    ${rev_json}=   Set Variable    ${rev_res['data']}
    Should Be True    ${rev_json['success']}
    Should Be Equal As Strings    ${rev_json['data']['status']}    REVOKED

TC_API_ADM_07: Lấy danh sách ca làm việc, quy định hạn ngạch và ngày lễ
    [Tags]    API    ADMIN    SETTINGS    P1
    ${res_shifts}=      Get Shifts       ${HR_TOKEN}
    Should Be Equal As Integers    ${res_shifts['status_code']}    200
    ${res_policies}=    Get Policies     ${HR_TOKEN}
    Should Be Equal As Integers    ${res_policies['status_code']}    200
    ${res_holidays}=    Get Holidays     ${HR_TOKEN}
    Should Be Equal As Integers    ${res_holidays['status_code']}    200

TC_API_ADM_08: Thêm ngày nghỉ lễ vào lịch doanh nghiệp (Holiday Calendar)
    [Tags]    API    ADMIN    HOLIDAYS    P1
    ${holiday_payload}=    Evaluate    {'holidayYear': 2026, 'holidayName': 'Lễ Giáng Sinh (Company Day Off)', 'startDate': '2026-12-25', 'endDate': '2026-12-25', 'isPaid': True}
    ${res}=                Create Holiday    ${HR_TOKEN}    ${holiday_payload}
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=               Set Variable    ${res['data']}
    Should Be True         ${json['success']}
    Should Be Equal As Strings    ${json['data']['holidayName']}    Lễ Giáng Sinh (Company Day Off)

TC_API_ADM_09: Quản lý vòng đời Ca làm việc đầy đủ CRUD (Tạo mới -> Cập nhật -> Xóa)
    [Tags]    API    ADMIN    SHIFTS    P0
    ${shift_code}=    Evaluate    'SHIFT_CRUD_' + str(__import__('random').randint(1000, 9999))
    ${payload}=       Evaluate    {'shiftCode': '${shift_code}', 'shiftName': 'Ca Test CRUD', 'shiftType': 'FIXED', 'startTime': '08:00:00', 'endTime': '17:00:00', 'standardWorkHours': 8.0, 'isActive': True}
    ${create_res}=    Create Shift    ${HR_TOKEN}    ${payload}
    Should Be Equal As Integers    ${create_res['status_code']}    200
    ${shift_id}=      Set Variable    ${create_res['data']['data']['id']}
    # Update shift
    ${payload_up}=    Evaluate    {'shiftCode': '${shift_code}', 'shiftName': 'Ca Test CRUD Da Cap Nhat', 'shiftType': 'FIXED', 'startTime': '08:00:00', 'endTime': '17:00:00', 'standardWorkHours': 8.0, 'isActive': True}
    ${up_res}=        Update Shift    ${HR_TOKEN}    ${shift_id}    ${payload_up}
    Should Be Equal As Integers    ${up_res['status_code']}    200
    Should Be Equal As Strings    ${up_res['data']['data']['shiftName']}    Ca Test CRUD Da Cap Nhat
    # Delete shift
    ${del_res}=       Delete Shift    ${HR_TOKEN}    ${shift_id}
    Should Be Equal As Integers    ${del_res['status_code']}    200
    Should Be True    ${del_res['data']['success']}

TC_API_ADM_10: Quản lý vòng đời Ngày nghỉ lễ đầy đủ CRUD (Tạo mới -> Cập nhật -> Xóa)
    [Tags]    API    ADMIN    HOLIDAYS    P0
    ${h_payload}=     Evaluate    {'holidayYear': 2026, 'holidayName': 'Lễ Robot Fest', 'startDate': '2026-11-20', 'endDate': '2026-11-20', 'isPaid': True}
    ${c_res}=         Create Holiday    ${HR_TOKEN}    ${h_payload}
    Should Be Equal As Integers    ${c_res['status_code']}    200
    ${hol_id}=        Set Variable    ${c_res['data']['data']['id']}
    # Update holiday
    ${h_up}=          Evaluate    {'holidayYear': 2026, 'holidayName': 'Lễ Robot Fest Nâng Cấp', 'startDate': '2026-11-20', 'endDate': '2026-11-20', 'isPaid': True}
    ${u_res}=         Update Holiday    ${HR_TOKEN}    ${hol_id}    ${h_up}
    Should Be Equal As Integers    ${u_res['status_code']}    200
    Should Be Equal As Strings    ${u_res['data']['data']['holidayName']}    Lễ Robot Fest Nâng Cấp
    # Delete holiday
    ${d_res}=         Delete Holiday    ${HR_TOKEN}    ${hol_id}
    Should Be Equal As Integers    ${d_res['status_code']}    200
    Should Be True    ${d_res['data']['success']}

TC_API_ADM_11: Kích hoạt lại thiết bị di động chấm công sau khi đã thu hồi (Reactivate Device)
    [Tags]    API    ADMIN    DEVICES    P0
    ${devices_res}=   Get All Devices    ${HR_TOKEN}
    ${device_id}=     Set Variable    ${devices_res['data']['data'][0]['id']}
    # Kích hoạt lại thiết bị
    ${act_res}=       Activate Device    ${HR_TOKEN}    ${device_id}
    Should Be Equal As Integers    ${act_res['status_code']}    200
    Should Be True    ${act_res['data']['success']}
    Should Be Equal As Strings    ${act_res['data']['data']['status']}    ACTIVE

TC_API_ADM_12: Cập nhật và Xóa phòng ban tổ chức (Update & Delete Department)
    [Tags]    API    ADMIN    DEPARTMENTS    P0
    ${dept_rand}=     Evaluate    str(__import__('random').randint(10000, 99999))
    ${dept_code}=     Set Variable    DEPT_CRUD_${dept_rand}
    ${dept_payload}=  Evaluate    {'code': '${dept_code}', 'name': 'Phòng Test CRUD', 'isActive': True}
    ${create_res}=    Create Department    ${HR_TOKEN}    ${dept_payload}
    ${dept_id}=       Set Variable    ${create_res['data']['data']['id']}
    # Update department
    ${up_payload}=    Evaluate    {'code': '${dept_code}', 'name': 'Phòng Test CRUD Đã Sửa', 'isActive': True}
    ${up_res}=        Update Department    ${HR_TOKEN}    ${dept_id}    ${up_payload}
    Should Be Equal As Integers    ${up_res['status_code']}    200
    Should Be Equal As Strings    ${up_res['data']['data']['name']}    Phòng Test CRUD Đã Sửa
    # Delete department
    ${del_res}=       Delete Department    ${HR_TOKEN}    ${dept_id}
    Should Be Equal As Integers    ${del_res['status_code']}    200
    Should Be True    ${del_res['data']['success']}

TC_API_ADM_13: Tra cứu hồ sơ nhân viên chi tiết qua API
    [Tags]    API    ADMIN    EMPLOYEES    P0
    ${emp_res}=       Get Employee Detail    ${HR_TOKEN}    e1111111-1111-1111-1111-111111111111
    Should Be Equal As Integers    ${emp_res['status_code']}    200
    Should Be True    ${emp_res['data']['success']}
    Should Be Equal As Strings    ${emp_res['data']['data']['employeeCode']}    HR001
