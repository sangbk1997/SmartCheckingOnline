*** Settings ***
Documentation    Kiểm thử tự động UI HR: Cơ cấu Tổ chức, Nhân sự, Thiết bị, Ca làm & Ngày lễ
Library          ../../resources/libraries/SmartTimeUiClient.py
Resource         ../../resources/variables/test_data.robot

Suite Setup      Open Application
Suite Teardown   Close Browser

*** Test Cases ***
TC_UI_HR_ORG_01: HR xem sơ đồ phân cấp Phòng Ban và mở Modal Thêm Phòng Ban Mới
    [Tags]    UI    HR    DEPARTMENTS    P1
    Switch User Role    ${NAME_HR}
    ${ok}=    Manager Open Create Dept Modal
    Should Be True    ${ok}

TC_UI_HR_ORG_02: HR chuyển sang Danh Sách Nhân Sự và mở Modal Thêm Nhân Viên Mới
    [Tags]    UI    HR    EMPLOYEES    P0
    Switch User Role    ${NAME_HR}
    ${ok}=    Manager Open Create Emp Modal
    Should Be True    ${ok}

TC_UI_HR_ORG_03: HR chuyển sang Quản Lý Thiết Bị Di Động và kiểm tra danh bạ thiết bị
    [Tags]    UI    HR    DEVICES    P1
    Switch User Role    ${NAME_HR}
    ${ok}=    Manager Verify Devices Subtab
    Should Be True    ${ok}

TC_UI_HR_ORG_04: HR xem Modal Hồ Sơ Nhân Sự Chi Tiết và liên kết phần cứng thiết bị
    [Tags]    UI    HR    EMPLOYEES    DETAILS    P1
    Switch User Role    ${NAME_HR}
    ${ok}=    Manager Verify Employee Detail Modal
    Should Be True    ${ok}

TC_UI_HR_ORG_05: HR mở Modal xem Chi tiết Phòng Ban và danh sách thành viên trực thuộc
    [Tags]    UI    HR    DEPARTMENTS    DETAILS    P1
    Switch User Role    ${NAME_HR}
    ${ok}=    Hr Verify Department Detail Modal
    Should Be True    ${ok}

TC_UI_HR_ORG_06: HR mở Modal xem Chi tiết Thiết Bị Di Động và Token phần cứng
    [Tags]    UI    HR    DEVICES    DETAILS    P1
    Switch User Role    ${NAME_HR}
    ${ok}=    Hr Verify Device Detail Modal
    Should Be True    ${ok}

TC_UI_HR_SET_01: HR xem danh mục Bộ Quy Tắc Doanh Nghiệp (Policy Rules)
    [Tags]    UI    HR    POLICIES    P1
    Switch User Role    ${NAME_HR}
    Manager Switch Policy Subtab    Bộ Quy Tắc Doanh Nghiệp
    ${text}=    Get Current Page Text
    Should Contain Any    ${text}    Quy Tắc    Hạn ngạch    Tham số    Ân hạn

TC_UI_HR_SET_02: HR chuyển sang Ca Làm Việc và mở Modal Thêm Ca Làm Mới
    [Tags]    UI    HR    SHIFTS    P1
    Switch User Role    ${NAME_HR}
    ${ok}=    Manager Open Create Shift Modal
    Should Be True    ${ok}

TC_UI_HR_SET_03: HR chuyển sang Lịch Nghỉ Lễ và mở Modal Thêm Ngày Nghỉ Lễ
    [Tags]    UI    HR    HOLIDAYS    P1
    Switch User Role    ${NAME_HR}
    ${ok}=    Manager Open Create Holiday Modal
    Should Be True    ${ok}

TC_UI_HR_SET_04: HR mở Modal xem Chi tiết Ca Làm Việc
    [Tags]    UI    HR    SHIFTS    DETAILS    P1
    Switch User Role    ${NAME_HR}
    ${ok}=    Hr Verify Shift Detail Modal
    Should Be True    ${ok}

TC_UI_HR_SET_05: HR mở Modal xem Chi tiết Ngày Nghỉ Lễ
    [Tags]    UI    HR    HOLIDAYS    DETAILS    P1
    Switch User Role    ${NAME_HR}
    ${ok}=    Hr Verify Holiday Detail Modal
    Should Be True    ${ok}

