*** Settings ***
Documentation    Kiểm thử tự động UI Bảng công Cá nhân & Cổng Khiếu nại 48h (Timesheet & Dispute)
Library          ../../resources/libraries/SmartTimeUiClient.py
Resource         ../../resources/variables/test_data.robot

Suite Setup      Open Application
Suite Teardown   Close Browser

*** Test Cases ***
TC_UI_EMP_TS_01: Nhân viên xem Bảng công cá nhân và các chỉ số KPI ngày công
    [Tags]    UI    EMPLOYEE    TIMESHEET    P0
    Switch User Role    ${NAME_DEV}
    ${ok}=    Employee View Personal Timesheet
    Should Be True    ${ok}

TC_UI_EMP_TS_02: Gửi khiếu nại công trong hạn 48 giờ lên Phòng Nhân sự
    [Tags]    UI    EMPLOYEE    DISPUTE    P0
    Switch User Role    ${NAME_DEV}
    ${text}=    Employee Submit Dispute    2026-11-13    Robot UI Khiếu nại thiếu giờ về
    Should Contain Any    ${text}    Khiếu Nại    thành công    Bảng Công

TC_UI_EMP_TS_03: Khám phá Bảng công chi tiết đa chiều (Lưới 30 Ngày, Bảng chi tiết, Cả năm 12 Tháng)
    [Tags]    UI    EMPLOYEE    TIMESHEET    CALENDAR    P0
    Switch User Role    ${NAME_DEV}
    ${ok}=    Employee Verify Detailed Calendar View
    Should Be True    ${ok}

