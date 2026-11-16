*** Settings ***
Documentation    Dữ liệu kiểm thử chuẩn hoá cho các kịch bản kiểm thử

*** Variables ***
# Thông tin tài khoản người dùng
${EMAIL_DEV}             dev@congty.com
${NAME_DEV}              Lê Hoàng Nam
${ROLE_DEV}              EMPLOYEE
${CODE_DEV}              IT002

${EMAIL_LEAD}            lead@congty.com
${NAME_LEAD}             Trần Văn Mạnh
${ROLE_LEAD}             MANAGER
${CODE_LEAD}             IT001

${EMAIL_HR}              hr@congty.com
${NAME_HR}               Nguyễn Thị Thu
${ROLE_HR}               HR_ADMIN
${CODE_HR}               HR001

# Thiết bị kiểm thử chuẩn
${INITIAL_DEVICE_TOKEN}        FP_DEVICE_TOKEN_DEV_IPHONE_15_PRO
${TEST_DEVICE_TOKEN}           robot-rf-device-token-999
${UNREGISTERED_DEVICE_TOKEN}   unregistered-attacker-device-403

# Kỳ công & Dữ liệu ngày tháng
${CURRENT_PERIOD_ID}           period-2026-11
${EXPIRED_PERIOD_ID}           period-2026-10
${TEST_WFH_DATE}               2026-11-20
${TEST_LEAVE_DATE}             2026-11-28
${KIOSK_SCREEN_ID}             OFFICE_HQ_FLOOR_1

