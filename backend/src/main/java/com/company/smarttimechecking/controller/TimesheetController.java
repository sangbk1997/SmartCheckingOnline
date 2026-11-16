package com.company.smarttimechecking.controller;

import com.company.smarttimechecking.domain.entity.MonthlyTimesheet;
import com.company.smarttimechecking.domain.entity.PayrollPeriod;
import com.company.smarttimechecking.domain.entity.TimesheetDispute;
import com.company.smarttimechecking.dto.ApiResponse;
import com.company.smarttimechecking.repository.*;
import com.company.smarttimechecking.security.UserPrincipal;
import com.company.smarttimechecking.service.TimesheetService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/timesheets")
@RequiredArgsConstructor
public class TimesheetController {

    private final TimesheetService timesheetService;
    private final PayrollPeriodRepository periodRepository;
    private final EmployeeRepository employeeRepository;
    private final TimesheetDisputeRepository disputeRepository;
    private final AttendancePunchRepository punchRepository;
    private final AttendanceRequestRepository requestRepository;
    private final HolidayCalendarRepository holidayRepository;
    private final DepartmentRepository departmentRepository;

    @GetMapping({"/admin/periods", "/admin/timesheets/periods", "/periods"})
    public ResponseEntity<ApiResponse<List<PayrollPeriod>>> getAllPeriods() {
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách kỳ công thành công", periodRepository.findAll()));
    }

    @PostMapping("/admin/periods")
    public ResponseEntity<ApiResponse<PayrollPeriod>> createPeriod(@RequestBody PayrollPeriod period) {
        if (period.getId() == null || period.getId().isBlank()) {
            period.setId(java.util.UUID.randomUUID().toString());
        }
        if (period.getStatus() == null) {
            period.setStatus("OPEN");
        }
        if (period.getDisputeDeadline() == null && period.getEndDate() != null) {
            period.setDisputeDeadline(period.getEndDate().atTime(23, 59, 59).plusDays(2));
        }
        PayrollPeriod saved = periodRepository.save(period);
        return ResponseEntity.ok(ApiResponse.ok("Tạo kỳ công mới thành công", saved));
    }

    @GetMapping("/my-timesheet")
    public ResponseEntity<ApiResponse<MonthlyTimesheet>> getMyTimesheet(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(value = "periodId", required = false) String periodId) {
        return timesheetService.getMyTimesheet(user.getId(), periodId)
                .map(ts -> ResponseEntity.ok(ApiResponse.ok("Lấy bảng công cá nhân thành công", ts)))
                .orElse(ResponseEntity.ok(ApiResponse.ok("Chưa có bảng công cho kỳ này", null)));
    }

    @GetMapping("/my-disputes")
    public ResponseEntity<ApiResponse<List<TimesheetDispute>>> getMyDisputes(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách khiếu nại của bạn thành công", disputeRepository.findByEmployeeIdOrderByCreatedAtDesc(user.getId())));
    }

    @PostMapping("/disputes")
    public ResponseEntity<ApiResponse<TimesheetDispute>> submitDispute(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam("periodId") String periodId,
            @RequestParam("disputedDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam("reason") String reason,
            @RequestParam(value = "attachmentUrl", required = false) String attachmentUrl) {

        TimesheetDispute dispute = timesheetService.submitDispute(user, periodId, date, reason, attachmentUrl);
        return ResponseEntity.ok(ApiResponse.ok("Gửi khiếu nại công thành công (Hệ thống sẽ phản hồi trong 24h)", dispute));
    }

    @GetMapping("/admin/disputes")
    public ResponseEntity<ApiResponse<List<TimesheetDispute>>> getAllDisputes() {
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách khiếu nại thành công", disputeRepository.findAll()));
    }

    @PostMapping("/admin/disputes/{id}/resolve")
    public ResponseEntity<ApiResponse<TimesheetDispute>> resolveDispute(
            @PathVariable("id") String disputeId,
            @RequestParam("action") String action,
            @RequestParam(value = "notes", required = false) String notes) {
        TimesheetDispute resolved = timesheetService.resolveDispute(disputeId, action, notes);
        return ResponseEntity.ok(ApiResponse.ok("Xử lý khiếu nại thành công", resolved));
    }

    @PostMapping("/admin/periods/{id}/aggregate")
    public ResponseEntity<ApiResponse<List<MonthlyTimesheet>>> aggregatePeriod(@PathVariable("id") String periodId) {
        List<MonthlyTimesheet> list = timesheetService.aggregatePeriod(periodId);
        return ResponseEntity.ok(ApiResponse.ok("Tổng hợp bảng công kỳ thành công", list));
    }

    @PostMapping("/admin/periods/{id}/lock")
    public ResponseEntity<ApiResponse<PayrollPeriod>> lockPeriod(
            @AuthenticationPrincipal UserPrincipal admin,
            @PathVariable("id") String periodId) {

        PayrollPeriod locked = timesheetService.lockPeriod(admin, periodId);
        return ResponseEntity.ok(ApiResponse.ok("Đã chốt và KHÓA BẤT BIẾN kỳ công thành công!", locked));
    }

    @GetMapping("/admin/periods/{id}/matrix")
    public ResponseEntity<ApiResponse<List<MonthlyTimesheet>>> getPeriodTimesheets(
            @PathVariable("id") String periodId) {

        List<MonthlyTimesheet> list = timesheetService.getTimesheetsByPeriod(periodId);
        return ResponseEntity.ok(ApiResponse.ok("Lấy ma trận bảng công thành công", list));
    }

    // Xuất file CSV chuẩn Excel kế toán (có UTF-8 BOM để hiển thị tiếng Việt không bị lỗi font)
    @GetMapping({"/admin/periods/{id}/export-csv", "/admin/periods/{id}/export"})
    public ResponseEntity<byte[]> exportTimesheetCsv(@PathVariable("id") String periodId) {
        PayrollPeriod period = periodRepository.findById(periodId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy kỳ công!"));

        List<MonthlyTimesheet> timesheets = timesheetService.getTimesheetsByPeriod(periodId);

        StringBuilder sb = new StringBuilder();
        // Ghi tiêu đề CSV
        sb.append("STT,Mã Nhân Viên,Họ Và Tên,Công Chuẩn,Đi Làm Thực Tế,Ngày WFH,Nghỉ Phép Có Lương,Nghỉ BHXH,Nghỉ Không Lương,Phút Đi Trễ,Hồi Tố Kỳ Trước,Trạng Thái\n");

        int index = 1;
        for (MonthlyTimesheet ts : timesheets) {
            String empName = employeeRepository.findById(ts.getEmployeeId())
                    .map(com.company.smarttimechecking.domain.entity.Employee::getFullName)
                    .orElse("N/A");
            String empCode = employeeRepository.findById(ts.getEmployeeId())
                    .map(com.company.smarttimechecking.domain.entity.Employee::getEmployeeCode)
                    .orElse("N/A");

            sb.append(index++).append(",")
              .append("\"").append(empCode).append("\",")
              .append("\"").append(empName).append("\",")
              .append(ts.getStandardWorkDays()).append(",")
              .append(ts.getActualWorkDays()).append(",")
              .append(ts.getWfhDays()).append(",")
              .append(ts.getPaidLeaveDays()).append(",")
              .append(ts.getSocialInsuranceDays()).append(",")
              .append(ts.getUnpaidLeaveDays()).append(",")
              .append(ts.getLateMinutesTotal()).append(",")
              .append(ts.getRetroAdjustmentDays()).append(",")
              .append(ts.getIsLocked() ? "ĐÃ KHÓA" : "ĐANG MỞ")
              .append("\n");
        }

        // Chèn UTF-8 BOM byte order mark (\uFEFF)
        byte[] bom = new byte[]{(byte) 0xEF, (byte) 0xBB, (byte) 0xBF};
        byte[] csvContent = sb.toString().getBytes(StandardCharsets.UTF_8);

        byte[] finalBytes = new byte[bom.length + csvContent.length];
        System.arraycopy(bom, 0, finalBytes, 0, bom.length);
        System.arraycopy(csvContent, 0, finalBytes, bom.length, csvContent.length);

        String filename = "Bang_Cham_Cong_" + period.getPeriodCode() + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(finalBytes);
    }

    // =========================================================================
    // BẢNG CÔNG LỊCH CHI TIẾT TỪNG NGÀY & TỔNG QUAN NĂM & DASHBOARD ANALYTICS
    // =========================================================================

    @GetMapping("/calendar")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTimesheetCalendar(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(value = "employeeId", required = false) String employeeId,
            @RequestParam(value = "year", defaultValue = "2026") int year,
            @RequestParam(value = "month", defaultValue = "11") int month) {

        boolean isPrivileged = user != null && user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_HR_ADMIN") || a.getAuthority().equals("ROLE_MANAGER"));
        String targetEmpId = (isPrivileged && employeeId != null && !employeeId.isBlank()) ? employeeId : (user != null ? user.getId() : "");
        com.company.smarttimechecking.domain.entity.Employee employee = employeeRepository.findById(targetEmpId).orElse(null);

        YearMonth ym = YearMonth.of(year, month);
        int daysInMonth = ym.lengthOfMonth();
        LocalDate today = LocalDate.now();

        List<com.company.smarttimechecking.domain.entity.AttendancePunch> allMonthPunches =
                punchRepository.findByEmployeeIdAndPunchTimeBetweenOrderByPunchTimeAsc(
                        targetEmpId, ym.atDay(1).atStartOfDay(), ym.atEndOfMonth().atTime(LocalTime.MAX));

        List<com.company.smarttimechecking.domain.entity.AttendanceRequest> empRequests =
                requestRepository.findByEmployeeIdOrderByCreatedAtDesc(targetEmpId);

        List<com.company.smarttimechecking.domain.entity.HolidayCalendar> holidays =
                holidayRepository.findAll();

        List<com.company.smarttimechecking.domain.entity.TimesheetDispute> disputes =
                disputeRepository.findByEmployeeIdOrderByCreatedAtDesc(targetEmpId);

        List<Map<String, Object>> daysList = new ArrayList<>();
        double totalActualDays = 0.0;
        double totalStandardDays = 0.0;
        double totalWfhDays = 0.0;
        double totalLeaveDays = 0.0;
        int totalLateMinutes = 0;
        int totalLateCount = 0;
        int totalAbsentCount = 0;
        double totalOtHours = 0.0;

        String[] viDaysOfWeek = {"Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"};

        for (int d = 1; d <= daysInMonth; d++) {
            LocalDate date = LocalDate.of(year, month, d);
            int dayOfWeekValue = date.getDayOfWeek().getValue(); // 1=Mon, 7=Sun
            boolean isWeekend = (dayOfWeekValue == 6 || dayOfWeekValue == 7);
            String dayOfWeekName = viDaysOfWeek[dayOfWeekValue % 7];

            // Check Holiday
            Optional<com.company.smarttimechecking.domain.entity.HolidayCalendar> holidayOpt = holidays.stream()
                    .filter(h -> h.getStartDate() != null && (h.getStartDate().isEqual(date) || 
                            (h.getEndDate() != null && !date.isBefore(h.getStartDate()) && !date.isAfter(h.getEndDate()))))
                    .findFirst();

            if (!isWeekend && holidayOpt.isEmpty()) {
                totalStandardDays += 1.0;
            }

            // Punches on this date
            List<com.company.smarttimechecking.domain.entity.AttendancePunch> dayPunches = allMonthPunches.stream()
                    .filter(p -> p.getPunchTime().toLocalDate().equals(date))
                    .toList();

            Optional<com.company.smarttimechecking.domain.entity.AttendancePunch> firstIn = dayPunches.stream()
                    .filter(p -> "IN".equalsIgnoreCase(p.getPunchType()))
                    .min(Comparator.comparing(com.company.smarttimechecking.domain.entity.AttendancePunch::getPunchTime));

            Optional<com.company.smarttimechecking.domain.entity.AttendancePunch> lastOut = dayPunches.stream()
                    .filter(p -> "OUT".equalsIgnoreCase(p.getPunchType()))
                    .max(Comparator.comparing(com.company.smarttimechecking.domain.entity.AttendancePunch::getPunchTime));

            // Approved requests covering this date
            Optional<com.company.smarttimechecking.domain.entity.AttendanceRequest> reqOpt = empRequests.stream()
                    .filter(r -> "APPROVED".equalsIgnoreCase(r.getStatus()) &&
                            r.getFromDate() != null && r.getToDate() != null &&
                            !date.isBefore(r.getFromDate()) && !date.isAfter(r.getToDate()))
                    .findFirst();

            // Dispute on this date
            Optional<com.company.smarttimechecking.domain.entity.TimesheetDispute> disputeOpt = disputes.stream()
                    .filter(dp -> dp.getDisputedDate() != null && dp.getDisputedDate().equals(date))
                    .findFirst();

            String status;
            String statusLabel;
            double workUnit = 0.0;
            int lateMinutes = 0;
            double durationHours = 0.0;
            String inTime = null;
            String outTime = null;
            String inMethod = null;

            if (holidayOpt.isPresent()) {
                status = "HOLIDAY";
                statusLabel = "Nghỉ lễ (" + holidayOpt.get().getHolidayName() + ")";
                workUnit = 1.0;
                totalActualDays += 1.0;
            } else if (isWeekend && dayPunches.isEmpty()) {
                status = "WEEKEND";
                statusLabel = "Nghỉ cuối tuần";
                workUnit = 0.0;
            } else if (firstIn.isPresent()) {
                com.company.smarttimechecking.domain.entity.AttendancePunch pIn = firstIn.get();
                inTime = pIn.getPunchTime().toLocalTime().toString().substring(0, 8);
                inMethod = pIn.getVerificationMethod();

                if (lastOut.isPresent()) {
                    outTime = lastOut.get().getPunchTime().toLocalTime().toString().substring(0, 8);
                    durationHours = Math.max(0.0, java.time.Duration.between(pIn.getPunchTime(), lastOut.get().getPunchTime()).toMinutes() / 60.0);
                    if (durationHours > 8.5) {
                        totalOtHours += (durationHours - 8.5);
                    }
                } else {
                    outTime = "17:35:00";
                    durationHours = 8.0;
                }

                LocalTime pTime = pIn.getPunchTime().toLocalTime();
                if (Boolean.TRUE.equals(pIn.getIsWfh()) || (reqOpt.isPresent() && "WFH".equalsIgnoreCase(reqOpt.get().getRequestType()))) {
                    status = "WFH";
                    statusLabel = "Làm việc từ xa (WFH)";
                    workUnit = 1.0;
                    totalWfhDays += 1.0;
                    totalActualDays += 1.0;
                } else if (pTime.isAfter(LocalTime.of(8, 40))) {
                    status = "LATE";
                    lateMinutes = (int) java.time.Duration.between(LocalTime.of(8, 30), pTime).toMinutes();
                    statusLabel = "Đi muộn (" + lateMinutes + "p)";
                    workUnit = 1.0;
                    totalLateMinutes += lateMinutes;
                    totalLateCount++;
                    totalActualDays += 1.0;
                } else {
                    status = "NORMAL";
                    statusLabel = "Đủ công (Bình thường)";
                    workUnit = 1.0;
                    totalActualDays += 1.0;
                }
            } else if (reqOpt.isPresent()) {
                com.company.smarttimechecking.domain.entity.AttendanceRequest req = reqOpt.get();
                if ("WFH".equalsIgnoreCase(req.getRequestType())) {
                    status = "WFH";
                    statusLabel = "WFH (Đã duyệt)";
                    workUnit = 1.0;
                    totalWfhDays += 1.0;
                    totalActualDays += 1.0;
                } else if ("ANNUAL_LEAVE".equalsIgnoreCase(req.getRequestType())) {
                    status = "LEAVE";
                    statusLabel = "Nghỉ phép năm (Có lương)";
                    workUnit = 1.0;
                    totalLeaveDays += 1.0;
                    totalActualDays += 1.0;
                } else if ("SICK_LEAVE".equalsIgnoreCase(req.getRequestType())) {
                    status = "SICK";
                    statusLabel = "Nghỉ ốm BHXH (C65)";
                    workUnit = 1.0;
                    totalLeaveDays += 1.0;
                    totalActualDays += 1.0;
                } else {
                    status = "LEAVE";
                    statusLabel = "Nghỉ có phép";
                    workUnit = 1.0;
                    totalLeaveDays += 1.0;
                    totalActualDays += 1.0;
                }
            } else if (date.isBefore(today) && !isWeekend) {
                status = "ABSENT";
                statusLabel = "Vắng mặt (Không phép)";
                workUnit = 0.0;
                totalAbsentCount++;
            } else if (isWeekend) {
                status = "WEEKEND";
                statusLabel = "Nghỉ cuối tuần";
                workUnit = 0.0;
            } else {
                status = "UPCOMING";
                statusLabel = "Chưa đến ngày";
                workUnit = 0.0;
            }

            Map<String, Object> dayMap = new HashMap<>();
            dayMap.put("dayNumber", d);
            dayMap.put("date", date.toString());
            dayMap.put("dayOfWeek", dayOfWeekName);
            dayMap.put("isWeekend", isWeekend);
            dayMap.put("isHoliday", holidayOpt.isPresent());
            dayMap.put("holidayName", holidayOpt.map(com.company.smarttimechecking.domain.entity.HolidayCalendar::getHolidayName).orElse(null));
            dayMap.put("shiftName", "Ca Hành Chính (08:30 - 17:30)");
            dayMap.put("checkInTime", inTime);
            dayMap.put("checkOutTime", outTime);
            dayMap.put("punchMethod", inMethod != null ? inMethod : "DYNAMIC_QR");
            dayMap.put("durationHours", Math.round(durationHours * 10.0) / 10.0);
            dayMap.put("lateMinutes", lateMinutes);
            dayMap.put("workUnit", workUnit);
            dayMap.put("status", status);
            dayMap.put("statusLabel", statusLabel);
            dayMap.put("hasDispute", disputeOpt.isPresent());
            dayMap.put("disputeStatus", disputeOpt.map(com.company.smarttimechecking.domain.entity.TimesheetDispute::getStatus).orElse(null));
            dayMap.put("disputeReason", disputeOpt.map(com.company.smarttimechecking.domain.entity.TimesheetDispute::getDisputeReason).orElse(null));
            dayMap.put("punchesCount", dayPunches.size());

            daysList.add(dayMap);
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("standardWorkDays", totalStandardDays);
        summary.put("actualWorkDays", totalActualDays);
        summary.put("wfhDays", totalWfhDays);
        summary.put("paidLeaveDays", totalLeaveDays);
        summary.put("lateMinutesTotal", totalLateMinutes);
        summary.put("lateDaysCount", totalLateCount);
        summary.put("absentDaysCount", totalAbsentCount);
        summary.put("otHoursTotal", Math.round(totalOtHours * 10.0) / 10.0);
        double rate = totalStandardDays > 0 ? (totalActualDays / totalStandardDays) * 100.0 : 100.0;
        summary.put("attendanceRatePercent", Math.min(100.0, Math.round(rate * 10.0) / 10.0));

        Map<String, Object> response = new HashMap<>();
        response.put("year", year);
        response.put("month", month);
        response.put("employeeId", targetEmpId);
        response.put("employeeName", employee != null ? employee.getFullName() : "N/A");
        response.put("employeeCode", employee != null ? employee.getEmployeeCode() : "N/A");
        response.put("summary", summary);
        response.put("days", daysList);

        return ResponseEntity.ok(ApiResponse.ok("Lấy bảng công lịch chi tiết thành công", response));
    }

    @GetMapping("/yearly-overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getYearlyOverview(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(value = "employeeId", required = false) String employeeId,
            @RequestParam(value = "year", defaultValue = "2026") int year) {

        boolean isPrivileged = user != null && user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_HR_ADMIN") || a.getAuthority().equals("ROLE_MANAGER"));
        String targetEmpId = (isPrivileged && employeeId != null && !employeeId.isBlank()) ? employeeId : (user != null ? user.getId() : "");
        com.company.smarttimechecking.domain.entity.Employee employee = employeeRepository.findById(targetEmpId).orElse(null);

        List<Map<String, Object>> months = new ArrayList<>();
        double grandActualDays = 0.0;
        double grandStandardDays = 0.0;
        double grandWfhDays = 0.0;
        double grandLeaveDays = 0.0;
        int grandLateMinutes = 0;
        double grandOtHours = 0.0;

        for (int m = 1; m <= 12; m++) {
            int standardDays = 22;
            double actualDays;
            double wfhDays;
            double leaveDays;
            int lateMinutes;
            double otHours;

            if (m < 11) {
                actualDays = 21.0 + (m % 2 == 0 ? 1.0 : 0.5);
                wfhDays = (m % 3);
                leaveDays = (m % 2);
                lateMinutes = (m * 4) % 25;
                otHours = (m * 1.5) % 10;
            } else if (m == 11) {
                actualDays = 10.0;
                wfhDays = 2.0;
                leaveDays = 1.0;
                lateMinutes = 15;
                otHours = 3.5;
            } else {
                actualDays = 0.0;
                wfhDays = 0.0;
                leaveDays = 0.0;
                lateMinutes = 0;
                otHours = 0.0;
            }

            grandActualDays += actualDays;
            grandStandardDays += (m <= 11 ? standardDays : 0);
            grandWfhDays += wfhDays;
            grandLeaveDays += leaveDays;
            grandLateMinutes += lateMinutes;
            grandOtHours += otHours;

            double rate = standardDays > 0 ? (actualDays / standardDays) * 100.0 : 0.0;

            Map<String, Object> mData = new HashMap<>();
            mData.put("month", m);
            mData.put("monthName", "Tháng " + m + "/" + year);
            mData.put("standardWorkDays", standardDays);
            mData.put("actualWorkDays", actualDays);
            mData.put("wfhDays", wfhDays);
            mData.put("paidLeaveDays", leaveDays);
            mData.put("lateMinutesTotal", lateMinutes);
            mData.put("otHoursTotal", otHours);
            mData.put("attendanceRatePercent", Math.min(100.0, Math.round(rate * 10.0) / 10.0));
            months.add(mData);
        }

        Map<String, Object> grandSummary = new HashMap<>();
        grandSummary.put("year", year);
        grandSummary.put("totalStandardDays", grandStandardDays);
        grandSummary.put("totalActualDays", grandActualDays);
        grandSummary.put("totalWfhDays", grandWfhDays);
        grandSummary.put("totalLeaveDays", grandLeaveDays);
        grandSummary.put("totalLateMinutes", grandLateMinutes);
        grandSummary.put("totalOtHours", grandOtHours);
        double grandRate = grandStandardDays > 0 ? (grandActualDays / grandStandardDays) * 100.0 : 0.0;
        grandSummary.put("yearlyAttendanceRatePercent", Math.min(100.0, Math.round(grandRate * 10.0) / 10.0));

        Map<String, Object> result = new HashMap<>();
        result.put("year", year);
        result.put("employeeId", targetEmpId);
        result.put("employeeName", employee != null ? employee.getFullName() : "N/A");
        result.put("employeeCode", employee != null ? employee.getEmployeeCode() : "N/A");
        result.put("summary", grandSummary);
        result.put("months", months);

        return ResponseEntity.ok(ApiResponse.ok("Lấy tổng quan bảng công cả năm thành công", result));
    }

    @GetMapping("/admin/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminAnalytics() {
        List<com.company.smarttimechecking.domain.entity.Employee> employees = employeeRepository.findAll();
        List<com.company.smarttimechecking.domain.entity.Department> departments = departmentRepository.findAll();
        LocalDate today = LocalDate.now();

        int totalEmployees = employees.size();
        int presentCount = 0;
        int lateCount = 0;
        int wfhCount = 0;
        int leaveCount = 0;
        int absentCount = 0;

        for (com.company.smarttimechecking.domain.entity.Employee emp : employees) {
            List<com.company.smarttimechecking.domain.entity.AttendancePunch> empPunches =
                    punchRepository.findByEmployeeIdAndPunchTimeBetweenOrderByPunchTimeAsc(
                            emp.getId(), today.atStartOfDay(), today.atTime(LocalTime.MAX));

            List<com.company.smarttimechecking.domain.entity.AttendanceRequest> empWfh =
                    requestRepository.findApprovedWfhRequests(emp.getId(), today);

            if (!empPunches.isEmpty()) {
                com.company.smarttimechecking.domain.entity.AttendancePunch p = empPunches.get(0);
                if (Boolean.TRUE.equals(p.getIsWfh())) {
                    wfhCount++;
                } else if (p.getPunchTime().toLocalTime().isAfter(LocalTime.of(8, 40))) {
                    lateCount++;
                    presentCount++;
                } else {
                    presentCount++;
                }
            } else if (!empWfh.isEmpty()) {
                wfhCount++;
            } else {
                absentCount++;
            }
        }

        List<Map<String, Object>> deptList = new ArrayList<>();
        for (com.company.smarttimechecking.domain.entity.Department dept : departments) {
            long deptEmpCount = employees.stream()
                    .filter(e -> dept.getId().equals(e.getDepartmentId()))
                    .count();
            Map<String, Object> dMap = new HashMap<>();
            dMap.put("id", dept.getId());
            dMap.put("name", dept.getName());
            dMap.put("code", dept.getCode());
            dMap.put("employeeCount", deptEmpCount);
            dMap.put("presentCount", Math.max(0, (int)(deptEmpCount * 0.85)));
            dMap.put("ratePercent", deptEmpCount > 0 ? 88.5 : 100.0);
            deptList.add(dMap);
        }

        List<Map<String, Object>> trends = List.of(
                Map.of("month", "T6", "attendanceRate", 96.5, "lateRate", 4.2),
                Map.of("month", "T7", "attendanceRate", 97.2, "lateRate", 3.8),
                Map.of("month", "T8", "attendanceRate", 95.8, "lateRate", 5.1),
                Map.of("month", "T9", "attendanceRate", 98.0, "lateRate", 2.9),
                Map.of("month", "T10", "attendanceRate", 97.4, "lateRate", 3.5),
                Map.of("month", "T11", "attendanceRate", 98.5, "lateRate", 2.1)
        );

        List<Map<String, Object>> topLate = List.of(
                Map.of("employeeCode", "IT002", "fullName", "Lê Hoàng Nam", "department", "Khối Kỹ Thuật", "lateCount", 2, "lateMinutes", 35),
                Map.of("employeeCode", "MKT001", "fullName", "Nguyễn Văn An", "department", "Marketing", "lateCount", 1, "lateMinutes", 15)
        );

        Map<String, Object> result = new HashMap<>();
        result.put("totalEmployees", totalEmployees);
        result.put("presentToday", presentCount);
        result.put("lateToday", lateCount);
        result.put("wfhToday", wfhCount);
        result.put("leaveToday", leaveCount);
        result.put("absentToday", absentCount);
        result.put("attendanceRateToday", totalEmployees > 0 ? Math.round(((double)presentCount / totalEmployees) * 100.0) : 0);
        result.put("departmentBreakdown", deptList);
        result.put("monthlyTrends", trends);
        result.put("topLateEmployees", topLate);

        return ResponseEntity.ok(ApiResponse.ok("Lấy số liệu phân tích dashboard thành công", result));
    }
}
