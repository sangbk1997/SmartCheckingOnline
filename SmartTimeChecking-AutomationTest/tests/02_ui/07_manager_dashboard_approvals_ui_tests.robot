*** Settings ***
Documentation    Kiểm thử tự động UI Cổng Quản Lý: Live Dashboard & Phê duyệt Đơn từ
Library          ../../resources/libraries/SmartTimeUiClient.py
Resource         ../../resources/variables/test_data.robot

Suite Setup      Open Application
Suite Teardown   Close Browser

*** Test Cases ***
TC_UI_MGR_01: Quản lý xem Dashboard điểm danh quân số thời gian thực (Live Dashboard)
    [Tags]    UI    MANAGER    DASHBOARD    P0
    Switch User Role    ${NAME_LEAD}
    ${ok}=    Manager Verify Live Dashboard
    Should Be True    ${ok}

TC_UI_MGR_02: Quản lý xem danh sách đơn từ chờ duyệt và thao tác Phê Duyệt 1-Click
    [Tags]    UI    MANAGER    APPROVAL    P0
    Switch User Role    ${NAME_LEAD}
    ${ok}=    Manager Approve First Request
    Should Be True    ${ok}

TC_UI_MGR_03: Quản lý thao tác Từ Chối đơn từ có lý do giải thích
    [Tags]    UI    MANAGER    REJECT    P1
    Switch User Role    ${NAME_LEAD}
    ${ok}=    Manager Reject First Request    Lý do: Cần có mặt trực dự án
    Should Be True    ${ok}

TC_UI_MGR_04: Quản lý kiểm tra danh sách chấm công khẩn cấp chờ duyệt
    [Tags]    UI    MANAGER    EMERGENCY    P1
    Switch User Role    ${NAME_LEAD}
    ${ok}=    Manager Verify Emergency Review List
    Should Be True    ${ok}

TC_UI_MGR_05: Chuyển đổi và theo dõi Báo cáo & Phân tích Điều hành (Executive Analytics Dashboard)
    [Tags]    UI    MANAGER    DASHBOARD    ANALYTICS    P0
    Switch User Role    ${NAME_LEAD}
    ${ok}=    Manager Verify Executive Analytics Dashboard
    Should Be True    ${ok}

TC_UI_MGR_06: Quản lý mở Modal xem Chi tiết Yêu cầu Chấm công Khẩn cấp
    [Tags]    UI    MANAGER    EMERGENCY    DETAILS    P1
    Switch User Role    ${NAME_LEAD}
    ${ok}=    Manager Verify Emergency Detail Modal
    Should Be True    ${ok}

TC_UI_MGR_07: Quản lý mở Modal xem Chi tiết Đơn từ và chứng từ
    [Tags]    UI    MANAGER    APPROVAL    DETAILS    P1
    Switch User Role    ${NAME_LEAD}
    ${ok}=    Manager Verify Request Detail Modal
    Should Be True    ${ok}

