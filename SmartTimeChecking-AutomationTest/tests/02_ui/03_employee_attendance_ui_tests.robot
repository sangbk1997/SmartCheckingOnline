*** Settings ***
Documentation    Kiểm thử tự động UI Chấm công QR, Device Binding & Kịch bản biên
Library          ../../resources/libraries/SmartTimeUiClient.py
Resource         ../../resources/variables/test_data.robot

Suite Setup      Open Application
Suite Teardown   Close Browser

*** Test Cases ***
TC_UI_EMP_ATT_01: Hiển thị trạng thái liên kết thiết bị cá nhân (1-1 Device Binding)
    [Tags]    UI    EMPLOYEE    DEVICE    P0
    Switch User Role    ${NAME_DEV}
    ${ok}=    Employee Verify Device Binding Card
    Should Be True    ${ok}

TC_UI_EMP_ATT_02: Nhân viên thực hiện Check-in Vào ca hợp lệ bằng Dynamic QR
    [Tags]    UI    EMPLOYEE    PUNCH    P0
    Switch User Role    ${NAME_DEV}
    ${text}=    Employee Simulate Qr Checkin
    Should Contain Any    ${text}    thành công    CHECK_IN    VÀO CA    Chấm công

TC_UI_EMP_ATT_03: Nhân viên thực hiện Check-out Ra ca hợp lệ bằng Dynamic QR
    [Tags]    UI    EMPLOYEE    PUNCH    P0
    Switch User Role    ${NAME_DEV}
    ${text}=    Employee Simulate Qr Checkout
    Should Contain Any    ${text}    thành công    CHECK_OUT    RA CA    Chấm công

TC_UI_EMP_ATT_04: Kiểm tra bảng Lịch sử chấm công trong ngày của nhân viên
    [Tags]    UI    EMPLOYEE    HISTORY    P1
    Switch User Role    ${NAME_DEV}
    ${ok}=    Employee Verify Today Punches History
    Should Be True    ${ok}

TC_UI_EMP_ATT_05: Kịch bản biên: Quét mã QR hết hạn (>5s) hiển thị lỗi ERR_QR_EXPIRED
    [Tags]    UI    EMPLOYEE    BOUNDARY    NEGATIVE    P1
    Switch User Role    ${NAME_DEV}
    ${ok}=    Employee Trigger Expired Qr Boundary Test
    Should Be True    ${ok}

TC_UI_EMP_ATT_06: Kịch bản biên: Quét mã QR sai chữ ký số hiển thị cảnh báo từ chối
    [Tags]    UI    EMPLOYEE    BOUNDARY    SECURITY    P1
    Switch User Role    ${NAME_DEV}
    ${ok}=    Employee Trigger Invalid Signature Boundary Test
    Should Be True    ${ok}

TC_UI_EMP_ATT_07: Bật Camera Quét mã Dynamic QR Check-in với Laser Viewfinder
    [Tags]    UI    EMPLOYEE    CAMERA    QR    P0
    Switch User Role    ${NAME_DEV}
    ${ok}=    Employee Verify Camera Qr Modal
    Should Be True    ${ok}

