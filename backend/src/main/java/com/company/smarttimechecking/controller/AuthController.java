package com.company.smarttimechecking.controller;

import com.company.smarttimechecking.domain.entity.Employee;
import com.company.smarttimechecking.dto.ApiResponse;
import com.company.smarttimechecking.dto.AuthRequest;
import com.company.smarttimechecking.dto.AuthResponse;
import com.company.smarttimechecking.repository.EmployeeRepository;
import com.company.smarttimechecking.security.JwtTokenProvider;
import com.company.smarttimechecking.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final EmployeeRepository employeeRepository;
    private final JwtTokenProvider tokenProvider;

    // API Đăng nhập giả lập (Dev/Postman): Nhập email nhân viên để lấy JWT token
    @PostMapping({"/login", "/login-dev"})
    public ResponseEntity<ApiResponse<AuthResponse>> loginDev(@RequestBody AuthRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim() : "dev@congty.com";

        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhân viên với email: " + email));

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

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserPrincipal>> getCurrentUser(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(ApiResponse.ok("Lấy thông tin người dùng thành công", user));
    }
}

