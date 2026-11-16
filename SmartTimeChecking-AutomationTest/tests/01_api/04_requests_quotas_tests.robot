*** Settings ***
Documentation    Kiểm thử API Đơn từ, Hạn ngạch Quotas, Phê duyệt & Hủy đơn (Requests API)
Library          Collections
Library          ../../resources/libraries/SmartTimeApiClient.py
Resource         ../../resources/variables/test_data.robot

Suite Setup      Setup Tokens

*** Variables ***
${DEV_TOKEN}        ${EMPTY}
${LEAD_TOKEN}       ${EMPTY}
${HR_TOKEN}         ${EMPTY}
${REQ_ID}           ${EMPTY}
${CANCEL_REQ_ID}    ${EMPTY}

*** Keywords ***
Setup Tokens
    ${r_dev}=     Login User    ${EMAIL_DEV}
    ${r_lead}=    Login User    ${EMAIL_LEAD}
    ${r_hr}=      Login User    ${EMAIL_HR}
    Set Suite Variable    ${DEV_TOKEN}     ${r_dev['data']['data']['token']}
    Set Suite Variable    ${LEAD_TOKEN}    ${r_lead['data']['data']['token']}
    Set Suite Variable    ${HR_TOKEN}      ${r_hr['data']['data']['token']}

*** Test Cases ***
TC_API_REQ_01: Kiểm tra hạn ngạch đơn từ còn lại của nhân viên
    [Tags]    API    REQUESTS    QUOTAS    P0
    ${res}=    Get Remaining Quotas    ${DEV_TOKEN}
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=    Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    Dictionary Should Contain Key    ${json['data']}    lateEarlyRemaining
    Dictionary Should Contain Key    ${json['data']}    missedPunchRemaining

TC_API_REQ_02: Tạo đơn xin phép Nghỉ phép năm (Annual Leave)
    [Tags]    API    REQUESTS    LEAVE    P0
    ${res}=    Create Request    ${DEV_TOKEN}    ANNUAL_LEAVE    ${TEST_LEAVE_DATE}    ${TEST_LEAVE_DATE}    1.0    Robot Annual Leave Test
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=    Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    Should Be Equal As Strings    ${json['data']['status']}    PENDING
    Should Be Equal As Strings    ${json['data']['requestType']}    ANNUAL_LEAVE
    Set Suite Variable    ${REQ_ID}    ${json['data']['id']}

TC_API_REQ_03: Quản lý xem danh sách đơn chờ duyệt
    [Tags]    API    REQUESTS    APPROVAL    P0
    ${res}=    Get Pending Requests    ${LEAD_TOKEN}
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=    Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    Should Not Be Empty    ${json['data']}

TC_API_REQ_04: Quản lý phê duyệt đơn nghỉ phép (1-Click Approve)
    [Tags]    API    REQUESTS    APPROVAL    P0
    ${res}=    Review Request    ${LEAD_TOKEN}    ${REQ_ID}    APPROVE    Robot Approved
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=    Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    Should Be Equal As Strings    ${json['data']['status']}    APPROVED

TC_API_REQ_05: Quản lý từ chối đơn có lý do giải thích rõ ràng (Reject)
    [Tags]    API    REQUESTS    APPROVAL    P0
    # Tạo đơn mới để test từ chối
    ${new_req}=    Create Request    ${DEV_TOKEN}    ANNUAL_LEAVE    2026-11-29    2026-11-29    1.0    Xin nghi dot xuat
    ${reject_id}=  Set Variable    ${new_req['data']['data']['id']}
    ${res}=        Review Request    ${LEAD_TOKEN}    ${reject_id}    REJECT    Lý do: Trùng lịch release hệ thống quan trọng
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=       Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    Should Be Equal As Strings    ${json['data']['status']}    REJECTED

TC_API_REQ_06: Nhân viên chủ động Hủy đơn khi đang chờ duyệt (Cancel Request)
    [Tags]    API    REQUESTS    CANCEL    P1
    # Tạo đơn mới
    ${create}=     Create Request    ${DEV_TOKEN}    ANNUAL_LEAVE    2026-11-30    2026-11-30    1.0    Ke hoach thay doi
    ${cancel_id}=  Set Variable    ${create['data']['data']['id']}
    # Hủy đơn
    ${cancel_res}=    Cancel Request    ${DEV_TOKEN}    ${cancel_id}
    Should Be Equal As Integers    ${cancel_res['status_code']}    200
    Should Be True    ${cancel_res['data']['success']}

TC_API_REQ_07: Chặn đơn Đi muộn (LATE_IN) vượt quá 60 phút theo quy chế
    [Tags]    API    REQUESTS    POLICY    P1
    # Nộp đơn đi muộn 90 phút (> 60 phút quy định)
    ${res}=    Create Request    ${DEV_TOKEN}    LATE_IN    2026-11-15    2026-11-15    0.0    Kẹt xe nặng    duration_minutes=90
    Should Be True    ${res['status_code']} in [400, 500]
    Should Not Be True    ${res['data'].get('success', False)}

TC_API_REQ_08: Chặn đơn Nghỉ ốm (SICK_LEAVE) khi thiếu chứng từ y tế C65
    [Tags]    API    REQUESTS    POLICY    P1
    ${res}=    Create Request    ${DEV_TOKEN}    SICK_LEAVE    2026-11-16    2026-11-16    1.0    Bị sốt xuất huyết
    Should Be True    ${res['status_code']} in [400, 500]
    Should Not Be True    ${res['data'].get('success', False)}

TC_API_REQ_09: Tạo đơn Nghỉ ốm (SICK_LEAVE) thành công khi có đính kèm chứng từ C65
    [Tags]    API    REQUESTS    POLICY    P1
    ${res}=    Create Request    ${DEV_TOKEN}    SICK_LEAVE    2026-11-16    2026-11-16    1.0    Bị sốt xuất huyết    attachment_url=https://storage.congty.com/giay-c65-bv-cho-ray.pdf
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=    Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    Should Be Equal As Strings    ${json['data']['status']}    PENDING

TC_API_REQ_10: Tra cứu danh sách đơn cá nhân đã gửi
    [Tags]    API    REQUESTS    P1
    ${res}=    Get My Requests    ${DEV_TOKEN}
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=    Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    Should Not Be Empty    ${json['data']}
