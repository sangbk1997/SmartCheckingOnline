*** Settings ***
Documentation    Kiểm thử tự động UI Chấm công Khẩn cấp (Emergency Selfie & GPS)
Library          ../../resources/libraries/SmartTimeUiClient.py
Resource         ../../config/env_config.robot
Resource         ../../resources/variables/test_data.robot

Suite Setup      Open Application
Suite Teardown   Close Browser

*** Test Cases ***
TC_UI_EMP_EMG_01: Mở tab Chấm công Khẩn cấp và hiển thị hướng dẫn cùng form toạ độ
    [Tags]    UI    EMPLOYEE    EMERGENCY    P0
    Switch User Role    ${NAME_DEV}
    Employee Open Emergency Tab
    ${text}=    Get Current Page Text
    Should Contain Any    ${text}    Khẩn cấp    GPS    Vĩ độ    Mất điện

TC_UI_EMP_EMG_02: Gửi yêu cầu Chấm công Khẩn cấp kèm toạ độ và chờ Quản lý duyệt
    [Tags]    UI    EMPLOYEE    EMERGENCY    P0
    Switch User Role    ${NAME_DEV}
    ${text}=    Employee Submit Emergency Punch    Mất điện văn phòng thử nghiệm UI    ${HQ_LATITUDE}    ${HQ_LONGITUDE}
    Should Contain Any    ${text}    Khẩn cấp    Quản lý    duyệt    thành công

