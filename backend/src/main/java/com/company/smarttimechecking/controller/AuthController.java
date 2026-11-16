package com.company.smarttimechecking.controller;

import com.company.smarttimechecking.domain.entity.Department;
import com.company.smarttimechecking.domain.entity.Employee;
import com.company.smarttimechecking.domain.entity.EmployeeLeaveBalance;
import com.company.smarttimechecking.dto.ApiResponse;
import com.company.smarttimechecking.dto.AuthRequest;
import com.company.smarttimechecking.dto.AuthResponse;
import com.company.smarttimechecking.dto.RegisterRequest;
import com.company.smarttimechecking.repository.DepartmentRepository;
import com.company.smarttimechecking.repository.EmployeeLeaveBalanceRepository;
import com.company.smarttimechecking.repository.EmployeeRepository;
import com.company.smarttimechecking.security.JwtTokenProvider;
import com.company.smarttimechecking.security.UserPrincipal;
import com.company.smarttimechecking.service.KeycloakService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final EmployeeRepository employeeRepository;
    private final EmployeeLeaveBalanceRepository leaveBalanceRepository;
    private final DepartmentRepository departmentRepository;
    private final JwtTokenProvider tokenProvider;
    private final KeycloakService keycloakService;

    @PostMapping({"/login", "/login-dev"})
    public ResponseEntity<ApiResponse<AuthResponse>> loginDev(@RequestBody AuthRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim() : "dev@congty.com";

        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhân viên với email: " + email));

        if (employee.getIsActive() != null && !employee.getIsActive()) {
            throw new IllegalStateException("Tài khoản này đã bị ngừng hoạt động. Vui lòng liên hệ HR.");
        }

        // Nếu tài khoản có mật khẩu hash và request có gửi mật khẩu, kiểm tra mật khẩu
        if (employee.getPasswordHash() != null && !employee.getPasswordHash().isBlank()
                && request.getPassword() != null && !request.getPassword().isBlank()) {
            boolean matches;
            try {
                matches = BCrypt.checkpw(request.getPassword(), employee.getPasswordHash());
            } catch (Exception e) {
                matches = request.getPassword().equals(employee.getPasswordHash());
            }
            if (!matches) {
                throw new IllegalArgumentException("Mật khẩu không chính xác.");
            }
        }

        UserPrincipal principal = UserPrincipal.fromEmployee(employee);
        String token = tokenProvider.generateToken(principal);

        AuthResponse response = AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .employeeId(employee.getId())
                .employeeCode(employee.getEmployeeCode())
                .fullName(employee.getFullName())
                .email(employee.getEmail())
                .role(employee.getAppRole())
                .build();

        return ResponseEntity.ok(ApiResponse.ok("Đăng nhập thành công", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody RegisterRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email không được để trống.");
        }
        String email = request.getEmail().trim().toLowerCase();
        if (!email.contains("@")) {
            throw new IllegalArgumentException("Email không đúng định dạng.");
        }

        if (employeeRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email '" + email + "' đã tồn tại trong hệ thống. Vui lòng đăng nhập hoặc sử dụng email khác.");
        }

        if (request.getFullName() == null || request.getFullName().trim().isBlank()) {
            throw new IllegalArgumentException("Họ và tên không được để trống.");
        }

        // Tạo mã nhân viên tự động nếu không truyền
        String code = request.getEmployeeCode() != null && !request.getEmployeeCode().isBlank()
                ? request.getEmployeeCode().trim().toUpperCase()
                : "EMP" + (System.currentTimeMillis() % 1000000);

        if (employeeRepository.findByEmployeeCode(code).isPresent()) {
            code = "EMP" + (System.currentTimeMillis() % 1000000) + (int)(Math.random() * 90 + 10);
        }

        // Gán department
        String deptId = request.getDepartmentId();
        if (deptId == null || deptId.isBlank()) {
            List<Department> depts = departmentRepository.findAll();
            if (!depts.isEmpty()) {
                deptId = depts.get(0).getId();
            }
        }

        String role = request.getRole() != null && !request.getRole().isBlank()
                ? request.getRole().trim().toUpperCase()
                : "EMPLOYEE";
        if (!role.equals("EMPLOYEE") && !role.equals("MANAGER") && !role.equals("HR_ADMIN")) {
            role = "EMPLOYEE";
        }

        String passwordHash = null;
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            passwordHash = BCrypt.hashpw(request.getPassword(), BCrypt.gensalt());
        }

        String keycloakUserId = "kc-usr-" + UUID.randomUUID().toString();

        Employee employee = Employee.builder()
                .id(UUID.randomUUID().toString())
                .keycloakUserId(keycloakUserId)
                .employeeCode(code)
                .fullName(request.getFullName().trim())
                .email(email)
                .passwordHash(passwordHash)
                .departmentId(deptId)
                .contractType("OFFICIAL")
                .startDate(LocalDate.now())
                .isActive(true)
                .appRole(role)
                .build();

        // Đồng bộ danh tính và vai trò lên Keycloak Identity Provider
        keycloakService.syncUserToKeycloak(employee, request.getPassword());

        Employee saved = employeeRepository.save(employee);

        // Khởi tạo quỹ phép năm 12 ngày
        int currentYear = LocalDate.now().getYear();
        if (leaveBalanceRepository.findByEmployeeIdAndLeaveYear(saved.getId(), currentYear).isEmpty()) {
            EmployeeLeaveBalance balance = EmployeeLeaveBalance.builder()
                    .id(UUID.randomUUID().toString())
                    .employeeId(saved.getId())
                    .leaveYear(currentYear)
                    .totalAccrued(BigDecimal.valueOf(12.0))
                    .tenureBonus(BigDecimal.ZERO)
                    .carriedOver(BigDecimal.ZERO)
                    .usedDays(BigDecimal.ZERO)
                    .remainingDays(BigDecimal.valueOf(12.0))
                    .carryOverExpiryDate(LocalDate.of(currentYear, 3, 31))
                    .build();
            leaveBalanceRepository.save(balance);
        }

        UserPrincipal principal = UserPrincipal.fromEmployee(saved);
        String token = tokenProvider.generateToken(principal);

        AuthResponse response = AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .employeeId(saved.getId())
                .employeeCode(saved.getEmployeeCode())
                .fullName(saved.getFullName())
                .email(saved.getEmail())
                .role(saved.getAppRole())
                .build();

        return ResponseEntity.ok(ApiResponse.ok("Đăng ký tài khoản thành công", response));
    }

    /**
     * API công khai trả về danh sách toàn bộ User/Nhân viên thực tế từ hệ thống quản lý.
     * UI sử dụng API này để render dropdown chuyển nhanh vai trò, loại bỏ hoàn toàn dữ liệu fix cứng.
     */
    @GetMapping("/active-users")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getActiveUsers() {
        Map<String, String> deptMap = departmentRepository.findAll().stream()
                .collect(Collectors.toMap(Department::getId, Department::getName, (a, b) -> a));

        List<Map<String, Object>> list = employeeRepository.findAll().stream()
                .filter(e -> e.getIsActive() == null || e.getIsActive())
                .map(e -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", e.getId());
                    map.put("employeeId", e.getId());
                    map.put("employeeCode", e.getEmployeeCode());
                    map.put("fullName", e.getFullName());
                    map.put("email", e.getEmail());
                    map.put("role", e.getAppRole());
                    map.put("departmentId", e.getDepartmentId());
                    map.put("departmentName", deptMap.getOrDefault(e.getDepartmentId(), "Khối Công nghệ Thông tin"));
                    map.put("keycloakUserId", e.getKeycloakUserId());
                    map.put("title", e.getAppRole().equals("HR_ADMIN") ? "HR Manager (Trưởng phòng NS)" :
                            e.getAppRole().equals("MANAGER") ? "Tech Lead / Quản lý" : "Software Engineer / Nhân viên");
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách người dùng thực tế thành công", list));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserPrincipal>> getCurrentUser(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(ApiResponse.ok("Lấy thông tin người dùng thành công", user));
    }
}
