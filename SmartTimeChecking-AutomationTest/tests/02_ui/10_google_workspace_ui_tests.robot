*** Settings ***
Documentation    Kiểm thử tự động UI Tích hợp Google Workspace Phase 2 (Gmail & Chat)
Library          ../../resources/libraries/SmartTimeUiClient.py
Resource         ../../resources/variables/test_data.robot

Suite Setup      Open Application
Suite Teardown   Close Browser

*** Test Cases ***
TC_UI_GW_01: Kiểm tra tab Cấu hình Tích hợp Google Workspace hiển thị đầy đủ thông số
    [Tags]    UI    GOOGLE_WORKSPACE    CONFIG    P0
    Switch User Role    ${NAME_HR}
    ${ok}=    Manager View Google Workspace Tab
    Should Be True    ${ok}

TC_UI_GW_02: Nhấn nút Bắn Thẻ Thử Nghiệm Google Chat Card v2
    [Tags]    UI    GOOGLE_WORKSPACE    CHAT    P1
    Switch User Role    ${NAME_HR}
    ${ok}=    Manager Click Send Test Chat Card
    Should Be True    ${ok}

TC_UI_GW_03: Nhấn nút Kích hoạt Bản Tin Điểm Danh Sáng 09:00 Tự Động
    [Tags]    UI    GOOGLE_WORKSPACE    BULLETIN    P1
    Switch User Role    ${NAME_HR}
    ${ok}=    Manager Click Daily Bulletin
    Should Be True    ${ok}

TC_UI_GW_04: Nhấn nút Gửi Email Thử Nghiệm qua hệ thống
    [Tags]    UI    GOOGLE_WORKSPACE    EMAIL    P1
    Switch User Role    ${NAME_HR}
    ${ok}=    Manager Click Send Test Email
    Should Be True    ${ok}

TC_UI_GW_05: Kiểm tra bảng Nhật Ký Thông Báo Google Workspace (Audit Logs)
    [Tags]    UI    GOOGLE_WORKSPACE    AUDIT    P1
    Switch User Role    ${NAME_HR}
    ${ok}=    Manager Verify Notification Audit Logs
    Should Be True    ${ok}

