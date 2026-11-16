package com.company.smarttimechecking.controller;

import com.company.smarttimechecking.domain.entity.AttendancePunch;
import com.company.smarttimechecking.dto.ApiResponse;
import com.company.smarttimechecking.dto.PunchRequestDto;
import com.company.smarttimechecking.repository.AttendancePunchRepository;
import com.company.smarttimechecking.security.UserPrincipal;
import com.company.smarttimechecking.service.AttendanceService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final AttendancePunchRepository punchRepository;
    private final com.company.smarttimechecking.repository.EmployeeRepository employeeRepository;
    private final com.company.smarttimechecking.repository.AttendanceRequestRepository requestRepository;
    private final com.company.smarttimechecking.repository.DepartmentRepository departmentRepository;

    @GetMapping("/live-dashboard")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getLiveDashboard() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

        List<com.company.smarttimechecking.domain.entity.Employee> employees = employeeRepository.findAll();
        List<AttendancePunch> todayPunches = punchRepository.findAll().stream()
                .filter(p -> p.getPunchTime().isAfter(startOfDay) && p.getPunchTime().isBefore(endOfDay) && "VALID".equalsIgnoreCase(p.getStatus()))
                .toList();

        List<java.util.Map<String, Object>> employeeStatuses = new java.util.ArrayList<>();
        int presentCount = 0;
        int wfhCount = 0;
        int onLeaveCount = 0;
        int lateCount = 0;
        int absentCount = 0;

        for (com.company.smarttimechecking.domain.entity.Employee emp : employees) {
            java.util.Map<String, Object> item = new java.util.HashMap<>();
            item.put("employeeId", emp.getId());
            item.put("employeeCode", emp.getEmployeeCode());
            item.put("fullName", emp.getFullName());
            item.put("email", emp.getEmail());
            item.put("role", emp.getAppRole());

            String deptName = "Chưa phân ban";
            if (emp.getDepartmentId() != null) {
                deptName = departmentRepository.findById(emp.getDepartmentId())
                        .map(com.company.smarttimechecking.domain.entity.Department::getName)
                        .orElse("Khối Kỹ thuật");
            }
            item.put("departmentName", deptName);

            // Kiểm tra punch hôm nay
            Optional<AttendancePunch> firstIn = todayPunches.stream()
                    .filter(p -> p.getEmployeeId().equals(emp.getId()) && "IN".equalsIgnoreCase(p.getPunchType()))
                    .min(java.util.Comparator.comparing(AttendancePunch::getPunchTime));

            List<com.company.smarttimechecking.domain.entity.AttendanceRequest> wfh = requestRepository.findApprovedWfhRequests(emp.getId(), today);
            
            if (firstIn.isPresent()) {
                AttendancePunch p = firstIn.get();
                item.put("checkInTime", p.getPunchTime().toLocalTime().toString().substring(0, 8));
                if (Boolean.TRUE.equals(p.getIsWfh())) {
                    item.put("status", "WFH");
                    item.put("statusDesc", "Làm việc từ xa (WFH)");
                    wfhCount++;
                } else if (p.getPunchTime().toLocalTime().isAfter(LocalTime.of(8, 40))) {
                    item.put("status", "LATE");
                    item.put("statusDesc", "Đi muộn");
                    lateCount++;
                    presentCount++;
                } else {
                    item.put("status", "PRESENT");
                    item.put("statusDesc", "Có mặt tại văn phòng");
                    presentCount++;
                }
            } else if (!wfh.isEmpty()) {
                item.put("status", "WFH");
                item.put("statusDesc", "Làm việc từ xa (WFH - Chưa check-in)");
                item.put("checkInTime", null);
                wfhCount++;
            } else {
                item.put("status", "ABSENT");
                item.put("statusDesc", "Chưa có mặt");
                item.put("checkInTime", null);
                absentCount++;
            }

            employeeStatuses.add(item);
        }

        java.util.Map<String, Object> summary = new java.util.HashMap<>();
        summary.put("totalEmployees", employees.size());
        summary.put("presentCount", presentCount);
        summary.put("wfhCount", wfhCount);
        summary.put("lateCount", lateCount);
        summary.put("absentCount", absentCount);
        summary.put("employeeList", employeeStatuses);

        return ResponseEntity.ok(ApiResponse.ok("Lấy trạng thái nhân sự trực tiếp thành công", summary));
    }

    @PostMapping("/punch")
    public ResponseEntity<ApiResponse<AttendancePunch>> punch(
            @AuthenticationPrincipal UserPrincipal user,
            @Valid @RequestBody PunchRequestDto dto,
            HttpServletRequest request) {

        String clientIp = extractClientIp(request);
        AttendancePunch punch = attendanceService.processStandardPunch(user, dto, clientIp);

        String typeDesc = "IN".equalsIgnoreCase(punch.getPunchType()) ? "Vào ca" : "Ra ca";
        return ResponseEntity.ok(ApiResponse.ok("Chấm công " + typeDesc + " thành công!", punch));
    }

    @PostMapping("/punch-emergency")
    public ResponseEntity<ApiResponse<AttendancePunch>> punchEmergency(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(value = "selfieFile", required = false) MultipartFile selfieFile,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestParam("reason") String reason,
            HttpServletRequest request) {

        String clientIp = extractClientIp(request);
        AttendancePunch punch = attendanceService.processEmergencyPunch(user, selfieFile, latitude, longitude, reason, clientIp);

        return ResponseEntity.ok(ApiResponse.ok("Đã gửi yêu cầu chấm công khẩn cấp (Chờ Quản lý/HR phê duyệt)", punch));
    }

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<List<AttendancePunch>>> getTodayPunches(@AuthenticationPrincipal UserPrincipal user) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        List<AttendancePunch> punches = punchRepository.findByEmployeeIdAndPunchTimeBetweenOrderByPunchTimeAsc(
                user.getId(), startOfDay, endOfDay);

        return ResponseEntity.ok(ApiResponse.ok("Lấy lịch sử chấm công hôm nay thành công", punches));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<AttendancePunch>>> getPunchHistory(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        LocalDate start = startDate != null ? startDate : LocalDate.now().minusDays(30);
        LocalDate end = endDate != null ? endDate : LocalDate.now();

        List<AttendancePunch> punches = punchRepository.findByEmployeeIdAndPunchTimeBetweenOrderByPunchTimeAsc(
                user.getId(), start.atStartOfDay(), end.atTime(LocalTime.MAX));

        return ResponseEntity.ok(ApiResponse.ok("Lấy lịch sử chấm công thành công", punches));
    }

    private String extractClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

