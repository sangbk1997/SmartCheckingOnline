*** Settings ***
Documentation    Kiểm thử API Kiosk Dynamic QR, Chữ ký số HMAC & Chống Replay (Kiosk API)
Library          ../../resources/libraries/SmartTimeApiClient.py
Resource         ../../resources/variables/test_data.robot

*** Test Cases ***
TC_API_KIOSK_01: Lấy mã Dynamic QR hiện tại của Kiosk
    [Tags]    API    KIOSK    P0
    ${res}=    Fetch Kiosk Qr
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=    Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    Should Be Equal As Strings    ${json['data']['screenId']}    ${KIOSK_SCREEN_ID}
    Should Be True                ${json['data']['validitySeconds']} > 0
    Should Start With             ${json['data']['qrPayload']}    ${KIOSK_SCREEN_ID}|

TC_API_KIOSK_02: Tự động đổi mã QR sau chu kỳ 5 giây
    [Tags]    API    KIOSK    P0
    ${res1}=    Fetch Kiosk Qr
    ${qr1}=     Set Variable    ${res1['data']['data']['qrPayload']}
    Sleep       5.5s
    ${res2}=    Fetch Kiosk Qr
    ${qr2}=     Set Variable    ${res2['data']['data']['qrPayload']}
    Should Not Be Equal As Strings    ${qr1}    ${qr2}

TC_API_KIOSK_03: Chống tấn công Replay - Không thể quét lại mã QR đã sử dụng
    [Tags]    API    KIOSK    SECURITY    P0
    ${dev_login}=    Login User    ${EMAIL_DEV}
    ${dev_token}=    Set Variable    ${dev_login['data']['data']['token']}
    ${kiosk_res}=    Fetch Kiosk Qr
    ${qr_payload}=   Set Variable    ${kiosk_res['data']['data']['qrPayload']}
    # Quét lần 1 thành công
    ${punch1}=       Punch Attendance Qr    ${dev_token}    ${qr_payload}    ${TEST_DEVICE_TOKEN}    IN
    # Quét lại lần 2 bằng chính chuỗi QR đó -> Bắt buộc bị từ chối do Redis atomic getAndDelete
    ${punch2}=       Punch Attendance Qr    ${dev_token}    ${qr_payload}    ${TEST_DEVICE_TOKEN}    IN
    Should Be True   ${punch2['status_code']} in [400, 403, 500]
    Should Not Be True    ${punch2['data'].get('success', False)}

TC_API_KIOSK_04: Chặn mã QR bị sửa đổi chữ ký số HMAC
    [Tags]    API    KIOSK    SECURITY    P0
    ${dev_login}=    Login User    ${EMAIL_DEV}
    ${dev_token}=    Set Variable    ${dev_login['data']['data']['token']}
    ${fake_qr}=      Set Variable    ${KIOSK_SCREEN_ID}|1794629314|fake_nonce_123|fake_signature_999
    ${punch}=        Punch Attendance Qr    ${dev_token}    ${fake_qr}    ${TEST_DEVICE_TOKEN}    IN
    Should Be True   ${punch['status_code']} in [400, 403, 500]
    Should Not Be True    ${punch['data'].get('success', False)}
