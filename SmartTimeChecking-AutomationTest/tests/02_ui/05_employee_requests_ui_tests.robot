*** Settings ***
Documentation    Kiểm thử tự động UI Quotas Hạn ngạch & Tạo Đơn từ (Leave, WFH, Late-in)
Library          ../../resources/libraries/SmartTimeUiClient.py
Resource         ../../resources/variables/test_data.robot

Suite Setup      Open Application
Suite Teardown   Close Browser

*** Test Cases ***
TC_UI_EMP_REQ_01: Hiển thị 4 thẻ hạn ngạch: Đi muộn, WFH, Phép năm, Quên chấm công
    [Tags]    UI    EMPLOYEE    QUOTAS    P0
    Switch User Role    ${NAME_DEV}
    ${ok}=    Employee Verify Quotas Widgets
    Should Be True    ${ok}

TC_UI_EMP_REQ_02: Nộp đơn xin Nghỉ phép năm (Annual Leave) thành công
    [Tags]    UI    EMPLOYEE    LEAVE    P0
    Switch User Role    ${NAME_DEV}
    ${text}=    Employee Submit Leave Request    Robot UI Xin Nghỉ Phép Năm
    Should Contain Any    ${text}    thành công    Nộp Đơn    Đơn từ

TC_UI_EMP_REQ_03: Nộp đơn xin Làm việc từ xa (WFH) thành công
    [Tags]    UI    EMPLOYEE    WFH    P0
    Switch User Role    ${NAME_DEV}
    ${text}=    Employee Submit Wfh Request    Robot UI Dang Ky WFH
    Should Contain Any    ${text}    thành công    Nộp Đơn    Đơn từ

TC_UI_EMP_REQ_04: Nộp đơn xin Đi muộn (Late In) trong hạn mức 30 phút
    [Tags]    UI    EMPLOYEE    LATE_IN    P1
    Switch User Role    ${NAME_DEV}
    ${text}=    Employee Submit Late In Request    30    Kẹt xe giao lộ
    Should Contain Any    ${text}    thành công    Nộp Đơn    Đơn từ

TC_UI_EMP_REQ_05: Nộp đơn xin Nghỉ ốm (Sick Leave) có kèm chứng từ C65-HD
    [Tags]    UI    EMPLOYEE    SICK_LEAVE    P1
    Switch User Role    ${NAME_DEV}
    ${text}=    Employee Submit Sick Leave Request    Nghỉ ốm điều trị    https://storage.congty.com/giay-kham-c65.pdf
    Should Contain Any    ${text}    thành công    Nộp Đơn    Đơn từ

TC_UI_EMP_REQ_06: Kiểm tra bảng Đơn từ đã nộp hiển thị danh sách và huy hiệu trạng thái
    [Tags]    UI    EMPLOYEE    REQUESTS    P1
    Switch User Role    ${NAME_DEV}
    ${ok}=    Employee Verify My Requests List
    Should Be True    ${ok}

