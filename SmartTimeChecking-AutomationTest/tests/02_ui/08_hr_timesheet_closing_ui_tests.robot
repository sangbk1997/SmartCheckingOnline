*** Settings ***
Documentation    Kiểm thử tự động UI HR: Ma trận Bảng công, Mở kỳ mới, Khóa sổ Bất biến & CSV
Library          ../../resources/libraries/SmartTimeUiClient.py
Resource         ../../resources/variables/test_data.robot

Suite Setup      Open Application
Suite Teardown   Close Browser

*** Test Cases ***
TC_UI_HR_TS_01: HR xem Ma trận Bảng công Tổng hợp toàn bộ nhân viên công ty
    [Tags]    UI    HR    TIMESHEET    P0
    Switch User Role    ${NAME_HR}
    ${ok}=    Manager View Timesheet Closing
    Should Be True    ${ok}

TC_UI_HR_TS_02: HR mở Modal Mở Kỳ Công Mới (+ Mở Kỳ Mới)
    [Tags]    UI    HR    PERIODS    P1
    Switch User Role    ${NAME_HR}
    ${ok}=    Manager Open Create Period Modal
    Should Be True    ${ok}

TC_UI_HR_TS_03: Nút Xuất File CSV Lương chuẩn UTF-8 BOM hiển thị sẵn sàng
    [Tags]    UI    HR    CSV    P1
    Switch User Role    ${NAME_HR}
    ${ok}=    Manager Click Export Csv
    Should Be True    ${ok}

TC_UI_HR_TS_04: HR chuyển sang sub-tab Cổng Xử Lý Khiếu Nại 48h
    [Tags]    UI    HR    DISPUTES    P0
    Switch User Role    ${NAME_HR}
    Manager Switch Timesheet Subtab    Cổng Xử Lý Khiếu Nại
    ${text}=    Get Current Page Text
    Should Contain Any    ${text}    Khiếu Nại    Xử Lý    Chấp thuận    Bác bỏ    Không có

TC_UI_HR_TS_05: HR mở Modal xem Chi tiết Khiếu nại công 48h
    [Tags]    UI    HR    DISPUTES    DETAILS    P1
    Switch User Role    ${NAME_HR}
    ${ok}=    Hr Verify Dispute Detail Modal
    Should Be True    ${ok}

