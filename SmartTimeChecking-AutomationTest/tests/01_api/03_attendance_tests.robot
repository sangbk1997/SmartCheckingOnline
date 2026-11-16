*** Settings ***
Documentation    Kiểm thử API Chấm công, Device Binding 1-1, Ra ca & GPS Geofencing (Attendance API)
Library          ../../resources/libraries/SmartTimeApiClient.py
Resource         ../../resources/variables/test_data.robot

Suite Setup      Setup Dev Token

*** Variables ***
${DEV_TOKEN}     ${EMPTY}

*** Keywords ***
Setup Dev Token
    ${res}=      Login User    ${EMAIL_DEV}
    ${token}=    Set Variable    ${res['data']['data']['token']}
    Set Suite Variable    ${DEV_TOKEN}    ${token}

*** Test Cases ***
TC_API_ATT_01: Đăng ký thiết bị cá nhân (1-1 Binding)
    [Tags]    API    ATTENDANCE    DEVICE    P0
    ${res}=    Enroll Device    ${DEV_TOKEN}    ${TEST_DEVICE_TOKEN}    Robot Mac M3    macOS
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=    Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    Should Be Equal As Strings    ${json['data']['status']}    ACTIVE

TC_API_ATT_02: Chấm công Vào ca (Check-in) hợp lệ bằng Dynamic QR
    [Tags]    API    ATTENDANCE    PUNCH    P0
    Sleep             5.5s
    ${kiosk_res}=     Fetch Kiosk Qr
    ${qr_payload}=    Set Variable    ${kiosk_res['data']['data']['qrPayload']}
    ${res}=           Punch Attendance Qr    ${DEV_TOKEN}    ${qr_payload}    ${TEST_DEVICE_TOKEN}    IN
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=    Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    Should Be Equal As Strings    ${json['data']['status']}    VALID
    Should Be Equal As Strings    ${json['data']['punchType']}    IN

TC_API_ATT_03: Chấm công Ra ca (Check-out) hợp lệ bằng Dynamic QR
    [Tags]    API    ATTENDANCE    PUNCH    P0
    Sleep             5.5s
    ${kiosk_res}=     Fetch Kiosk Qr
    ${qr_payload}=    Set Variable    ${kiosk_res['data']['data']['qrPayload']}
    ${res}=           Punch Attendance Qr    ${DEV_TOKEN}    ${qr_payload}    ${TEST_DEVICE_TOKEN}    OUT
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=    Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    Should Be Equal As Strings    ${json['data']['status']}    VALID
    Should Be Equal As Strings    ${json['data']['punchType']}    OUT

TC_API_ATT_04: Chặn chấm công khi dùng thiết bị lạ (Chống gian lận điểm danh hộ)
    [Tags]    API    ATTENDANCE    SECURITY    P0
    ${kiosk_res}=     Fetch Kiosk Qr
    ${qr_payload}=    Set Variable    ${kiosk_res['data']['data']['qrPayload']}
    ${res}=           Punch Attendance Qr    ${DEV_TOKEN}    ${qr_payload}    ${UNREGISTERED_DEVICE_TOKEN}    IN
    Should Be True    ${res['status_code']} in [400, 403]
    ${json}=          Set Variable    ${res['data']}
    Should Not Be True    ${json.get('success', False)}

TC_API_ATT_05: Chặn chấm công với mã QR đã hết hạn (Anti-Replay)
    [Tags]    API    ATTENDANCE    SECURITY    P1
    ${expired_qr}=    Set Variable    KIOSK:V1:OFFICE_HQ_FLOOR_1:1600000000000:expired_nonce:fake_signature
    ${res}=           Punch Attendance Qr    ${DEV_TOKEN}    ${expired_qr}    ${TEST_DEVICE_TOKEN}    IN
    Should Be True    ${res['status_code']} in [400, 403, 500]
    ${json}=          Set Variable    ${res['data']}
    Should Not Be True    ${json.get('success', False)}

TC_API_ATT_06: Chấm công khẩn cấp tại văn phòng (GPS hợp lệ < 100m)
    [Tags]    API    ATTENDANCE    EMERGENCY    P0
    ${res}=    Punch Emergency Selfie    ${DEV_TOKEN}    IN    10.7769    106.7009    Quên điện thoại tại bàn
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=    Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    Should Be Equal As Strings    ${json['data']['status']}    PENDING_APPROVAL
    Should Be Equal As Strings    ${json['data']['verificationMethod']}    EMERGENCY_SELFIE

TC_API_ATT_07: Chấm công khẩn cấp ngoài phạm vi (GPS lệch > 100m) -> Đánh cờ cảnh báo
    [Tags]    API    ATTENDANCE    EMERGENCY    GEOFENCING    P0
    # Tọa độ cách xa trụ sở > 5km
    ${res}=    Punch Emergency Selfie    ${DEV_TOKEN}    IN    10.8231    106.6297    Quên máy tính ở nhà
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=    Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    Should Be Equal As Strings    ${json['data']['status']}    PENDING_APPROVAL
    # Backend phải ghi nhận cờ FLAG_LOCATION_MISMATCH
    Should Contain    ${json['data']['rejectionReason']}    FLAG_LOCATION_MISMATCH

TC_API_ATT_08: Tra cứu lịch sử chấm công trong ngày của nhân viên
    [Tags]    API    ATTENDANCE    P1
    ${res}=    Get Today Attendance    ${DEV_TOKEN}
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=    Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    Should Not Be Empty    ${json['data']}
