*** Settings ***
Documentation    Kiểm thử tự động UI Màn hình Kiosk Sảnh Điểm danh (Kiosk Screen E2E)
Library          ../../resources/libraries/SmartTimeUiClient.py
Resource         ../../resources/variables/test_data.robot

Suite Setup      Open Application
Suite Teardown   Close Browser

*** Test Cases ***
TC_UI_KIOSK_01: Màn hình Kiosk hiển thị mã Dynamic QR và văn phòng sảnh HQ
    [Tags]    UI    KIOSK    P0
    ${ok}=    Verify Kiosk Qr Exists
    Should Be True    ${ok}

TC_UI_KIOSK_02: Màn hình Kiosk đếm ngược chu kỳ 5 giây và đổi mã tự động
    [Tags]    UI    KIOSK    P0
    ${active}=    Verify Kiosk Countdown Active
    Should Be True    ${active}
