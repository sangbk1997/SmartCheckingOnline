*** Settings ***
Documentation    Kiểm thử API Xác thực, Phân quyền Đa tầng & Bảo mật Token (Auth API)
Library          ../../resources/libraries/SmartTimeApiClient.py
Resource         ../../resources/variables/test_data.robot

*** Test Cases ***
TC_API_AUTH_01: Đăng nhập thành công với tài khoản HR Admin
    [Tags]    API    AUTH    SMOKE    P0
    ${res}=    Login User    ${EMAIL_HR}
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=    Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    Should Be Equal As Strings    ${json['code']}    SUCCESS
    Should Be Equal As Strings    ${json['data']['role']}    ${ROLE_HR}
    Should Be Equal As Strings    ${json['data']['employeeCode']}    ${CODE_HR}
    Should Not Be Empty           ${json['data']['token']}

TC_API_AUTH_02: Đăng nhập thành công với tài khoản Nhân viên Kỹ thuật
    [Tags]    API    AUTH    SMOKE    P0
    ${res}=    Login User    ${EMAIL_DEV}
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=    Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    Should Be Equal As Strings    ${json['data']['role']}    ${ROLE_DEV}
    Should Be Equal As Strings    ${json['data']['employeeCode']}    ${CODE_DEV}
    Should Not Be Empty           ${json['data']['token']}

TC_API_AUTH_03: Đăng nhập thành công với tài khoản Trưởng nhóm (Manager)
    [Tags]    API    AUTH    SMOKE    P0
    ${res}=    Login User    ${EMAIL_LEAD}
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=    Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    Should Be Equal As Strings    ${json['data']['role']}    ${ROLE_LEAD}
    Should Be Equal As Strings    ${json['data']['employeeCode']}    ${CODE_LEAD}

TC_API_AUTH_04: Đăng nhập thất bại khi email không tồn tại trong hệ thống
    [Tags]    API    AUTH    NEGATIVE    P1
    ${res}=    Login User    notfound.user@smartcorp.com
    Should Be True    ${res['status_code']} in [400, 404, 500]
    ${json}=    Set Variable    ${res['data']}
    Should Not Be True    ${json.get('success', False)}

TC_API_AUTH_05: Chặn truy cập khi Token bị giả mạo hoặc hết hạn
    [Tags]    API    AUTH    SECURITY    P0
    ${tampered_token}=    Set Variable    eyJhbGciOiJIUzM4NCJ9.tampered_payload.fake_signature
    ${res}=    Get All Employees    ${tampered_token}
    Should Be True    ${res['status_code']} in [401, 403]
    ${json}=    Set Variable    ${res['data']}
    Should Not Be True    ${json.get('success', False)}

TC_API_AUTH_06: Nhân viên thường không có quyền truy cập API quản trị nhân sự
    [Tags]    API    AUTH    SECURITY    RBAC    P0
    ${dev_login}=    Login User    ${EMAIL_DEV}
    ${dev_token}=    Set Variable    ${dev_login['data']['data']['token']}
    # Nhân viên thường gọi API quản trị nhân sự -> Phải bị từ chối 403 Forbidden
    ${res}=    Get All Employees    ${dev_token}
    Should Be True    ${res['status_code']} in [401, 403]
