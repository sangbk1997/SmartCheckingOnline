*** Settings ***
Documentation    Kiểm thử API Thông báo Email & Google Chat Interactive Card v2 (Notification API)
Library          Collections
Library          ../../resources/libraries/SmartTimeApiClient.py
Resource         ../../resources/variables/test_data.robot

Suite Setup      Setup HR Token

*** Variables ***
${HR_TOKEN}      ${EMPTY}

*** Keywords ***
Setup HR Token
    ${r_hr}=    Login User    ${EMAIL_HR}
    Set Suite Variable    ${HR_TOKEN}    ${r_hr['data']['data']['token']}

*** Test Cases ***
TC_API_NOTIF_01: Lấy cấu hình thông báo Google Workspace
    [Tags]    API    NOTIFICATION    WORKSPACE    P1
    ${res}=    Get Notification Config    ${HR_TOKEN}
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=    Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    Dictionary Should Contain Key    ${json['data']}    generalWebhookUrl
    Dictionary Should Contain Key    ${json['data']}    googleChatEnabled

TC_API_NOTIF_02: Cập nhật URL Webhook Google Chat
    [Tags]    API    NOTIFICATION    WORKSPACE    P1
    ${config_res}=    Get Notification Config    ${HR_TOKEN}
    ${config_data}=   Set Variable    ${config_res['data']['data']}
    ${update_res}=    Update Notification Config    ${HR_TOKEN}    ${config_data}
    Should Be Equal As Integers    ${update_res['status_code']}    200
    Should Be True    ${update_res['data']['success']}

TC_API_NOTIF_03: Gửi thẻ thử nghiệm Google Chat Card v2
    [Tags]    API    NOTIFICATION    CARD_V2    P1
    ${res}=    Test Chat Card    ${HR_TOKEN}
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=    Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    Should Be Equal As Strings    ${json['data']['channel']}    GOOGLE_CHAT

TC_API_NOTIF_04: Kích hoạt phát bản tin điểm danh sáng 09:00
    [Tags]    API    NOTIFICATION    BULLETIN    P1
    ${res}=    Trigger Daily Bulletin    ${HR_TOKEN}
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=    Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    Should Contain    ${json['data']['summary']}    BẢN TIN ĐIỂM DANH SÁNG

TC_API_NOTIF_05: Gửi email thử nghiệm qua Google Workspace / SMTP
    [Tags]    API    NOTIFICATION    EMAIL    P1
    ${res}=    Test Email    ${HR_TOKEN}    lead@congty.com
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=    Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    Should Be Equal As Strings    ${json['data']['channel']}    GMAIL

TC_API_NOTIF_06: Lấy danh sách thẻ Google Chat tương tác gần đây
    [Tags]    API    NOTIFICATION    CARD_V2    P1
    ${res}=    Get Recent Chat Cards    ${HR_TOKEN}
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=    Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    Should Not Be Empty    ${json['data']}

TC_API_NOTIF_07: Tra cứu nhật ký thông báo đa kênh (Notification Audit Logs)
    [Tags]    API    NOTIFICATION    AUDIT    P1
    ${res}=    Get Notification Logs    ${HR_TOKEN}
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=    Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    Should Not Be Empty    ${json['data']}
