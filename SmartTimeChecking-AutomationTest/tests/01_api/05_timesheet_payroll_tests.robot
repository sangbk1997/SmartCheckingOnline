*** Settings ***
Documentation    Kiểm thử API Bảng công, Khiếu nại sai lệch, Khóa sổ bất biến & Hồi tố (Timesheet & Payroll API)
Library          Collections
Library          ../../resources/libraries/SmartTimeApiClient.py
Resource         ../../resources/variables/test_data.robot

Suite Setup      Setup Tokens

*** Variables ***
${DEV_TOKEN}     ${EMPTY}
${HR_TOKEN}      ${EMPTY}
${DISPUTE_ID}    ${EMPTY}

*** Keywords ***
Setup Tokens
    ${r_dev}=    Login User    ${EMAIL_DEV}
    ${r_hr}=     Login User    ${EMAIL_HR}
    Set Suite Variable    ${DEV_TOKEN}    ${r_dev['data']['data']['token']}
    Set Suite Variable    ${HR_TOKEN}     ${r_hr['data']['data']['token']}

*** Test Cases ***
TC_API_TS_01: Lấy danh sách các kỳ tính công
    [Tags]    API    TIMESHEET    PERIODS    P0
    ${res}=    Get Payroll Periods    ${HR_TOKEN}
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=    Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    Should Not Be Empty    ${json['data']}

TC_API_TS_02: Nhân viên gửi khiếu nại công trong hạn 48 giờ
    [Tags]    API    TIMESHEET    DISPUTE    P0
    ${res}=    Submit Dispute    ${DEV_TOKEN}    ${CURRENT_PERIOD_ID}    2026-11-13    Robot Quên chấm công về
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=    Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    Should Be Equal As Strings    ${json['data']['status']}    PENDING
    Set Suite Variable    ${DISPUTE_ID}    ${json['data']['id']}

TC_API_TS_03: Chặn gửi khiếu nại công khi kỳ công đã quá hạn 48 giờ
    [Tags]    API    TIMESHEET    DISPUTE    SECURITY    P1
    ${res}=    Submit Dispute    ${DEV_TOKEN}    ${EXPIRED_PERIOD_ID}    2026-10-15    Khiếu nại quá hạn
    Should Be True    ${res['status_code']} in [400, 500]
    ${json}=    Set Variable    ${res['data']}
    Should Not Be True    ${json.get('success', False)}
    Should Be Equal As Strings    ${json['code']}    ERR_DISPUTE_EXPIRED

TC_API_TS_04: HR xem ma trận bảng công tổng hợp của kỳ
    [Tags]    API    TIMESHEET    MATRIX    P0
    ${res}=        Get Timesheet Matrix    ${HR_TOKEN}    ${CURRENT_PERIOD_ID}
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=       Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    Should Not Be Empty    ${json['data']}

TC_API_TS_05: HR duyệt khiếu nại công và tự động ghi nhận công hồi tố
    [Tags]    API    TIMESHEET    DISPUTE    P0
    ${res}=    Resolve Dispute    ${HR_TOKEN}    ${DISPUTE_ID}    APPROVE    Duyệt bù 1 công
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=    Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    Should Be Equal As Strings    ${json['data']['status']}    ACCEPTED

TC_API_TS_06: HR xuất báo cáo bảng công định dạng CSV có UTF-8 BOM
    [Tags]    API    TIMESHEET    EXPORT    P1
    ${res}=    Export Timesheet Csv    ${HR_TOKEN}    ${CURRENT_PERIOD_ID}
    Should Be Equal As Integers    ${res['status_code']}    200
    ${content}=    Set Variable    ${res['content']}
    Should Start With    ${res['headers']['Content-Type']}    text/csv
    # Verify UTF-8 BOM (EF BB BF)
    ${first_3_bytes}=    Evaluate    list($content[:3])
    Should Be Equal As Integers    ${first_3_bytes[0]}    239
    Should Be Equal As Integers    ${first_3_bytes[1]}    187
    Should Be Equal As Integers    ${first_3_bytes[2]}    191

TC_API_TS_07: HR thực hiện Khóa sổ bất biến kỳ công (Lock Payroll Period)
    [Tags]    API    TIMESHEET    LOCK    P0
    ${res}=    Lock Period    ${HR_TOKEN}    ${CURRENT_PERIOD_ID}
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=    Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    Should Be Equal As Strings    ${json['data']['status']}    LOCKED

TC_API_TS_08: Truy vấn ma trận Bảng công Lịch 30 Ngày chi tiết (Calendar Matrix API)
    [Tags]    API    TIMESHEET    CALENDAR    P0
    ${res}=    Get Calendar Timesheet    ${HR_TOKEN}    year=2026    month=11
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=    Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    Should Not Be Empty    ${json['data']['days']}
    ${first_day}=    Set Variable    ${json['data']['days'][0]}
    Dictionary Should Contain Key    ${first_day}    date
    Dictionary Should Contain Key    ${first_day}    status
    Dictionary Should Contain Key    ${first_day}    workUnit

TC_API_TS_09: Truy vấn Báo cáo Bảng công Cả năm 12 Tháng (Yearly Overview API)
    [Tags]    API    TIMESHEET    YEARLY    P0
    ${res}=    Get Yearly Overview Timesheet    ${HR_TOKEN}    year=2026
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=    Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    ${months_len}=    Get Length    ${json['data']['months']}
    Should Be Equal As Integers    ${months_len}    12

TC_API_TS_10: Truy vấn Báo cáo & Chỉ số Điều hành Quản lý / HR (Executive Analytics API)
    [Tags]    API    TIMESHEET    ANALYTICS    P0
    ${res}=    Get Executive Analytics    ${HR_TOKEN}
    Should Be Equal As Integers    ${res['status_code']}    200
    ${json}=    Set Variable    ${res['data']}
    Should Be True    ${json['success']}
    Dictionary Should Contain Key    ${json['data']}    totalEmployees
    Dictionary Should Contain Key    ${json['data']}    attendanceRateToday
    Dictionary Should Contain Key    ${json['data']}    departmentBreakdown
    Dictionary Should Contain Key    ${json['data']}    topLateEmployees
