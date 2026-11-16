*** Settings ***
Documentation    Kiểm thử tự động UI Xác thực, Đa vai trò RBAC & Access Guard
Library          ../../resources/libraries/SmartTimeUiClient.py
Resource         ../../resources/variables/test_data.robot

Suite Setup      Open Application
Suite Teardown   Close Browser

*** Test Cases ***
TC_UI_AUTH_01: Landing page hiển thị đầy đủ thông tin hệ thống và thông điệp Hero
    [Tags]    UI    AUTH    LANDING    P1
    ${ok}=    Verify Landing Page Stats
    Should Be True    ${ok}

TC_UI_AUTH_02: Chuyển đổi vai trò sang Nhân viên Kỹ thuật (Lê Hoàng Nam)
    [Tags]    UI    AUTH    RBAC    P0
    Switch User Role    ${NAME_DEV}
    Navigate To Nav Tab    Nhân viên
    ${text}=    Get Current Page Text
    Should Contain    ${text}    ${NAME_DEV}
    Should Contain    ${text}    ${CODE_DEV}

TC_UI_AUTH_03: Chuyển đổi vai trò sang Quản lý / Tech Lead (Trần Văn Mạnh)
    [Tags]    UI    AUTH    RBAC    P0
    Switch User Role    ${NAME_LEAD}
    Navigate To Nav Tab    Quản lý / HR
    ${text}=    Get Current Page Text
    Should Contain Any    ${text}    nhân sự    văn phòng    quân số    Giám sát

TC_UI_AUTH_04: Chuyển đổi vai trò sang HR Admin (Nguyễn Thị Thu)
    [Tags]    UI    AUTH    RBAC    P0
    Switch User Role    ${NAME_HR}
    Navigate To Nav Tab    Quản lý / HR
    ${text}=    Get Current Page Text
    Should Contain Any    ${text}    Tổ Chức    Bảng công    Duyệt

TC_UI_AUTH_05: Access Guard bảo vệ màn hình Quản lý khi người dùng là Nhân viên
    [Tags]    UI    SECURITY    GUARD    P0
    ${res}=    Access Guard Verify For Employee
    Should Be True    ${res}

