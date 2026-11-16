package com.company.smarttimechecking.controller;

import com.company.smarttimechecking.domain.entity.Employee;
import com.company.smarttimechecking.domain.entity.EmployeeLeaveBalance;
import com.company.smarttimechecking.dto.ApiResponse;
import com.company.smarttimechecking.repository.EmployeeLeaveBalanceRepository;
import com.company.smarttimechecking.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/employees")
@RequiredArgsConstructor
public class EmployeeManagementController {

    private final EmployeeRepository employeeRepository;
    private final EmployeeLeaveBalanceRepository leaveBalanceRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Employee>>> listAllEmployees() {
        List<Employee> list = employeeRepository.findAll();
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách nhân viên thành công", list));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Employee>> createEmployee(@RequestBody Employee employee) {
        if (employee.getId() == null || employee.getId().isBlank()) {
            employee.setId(UUID.randomUUID().toString());
        }
        if (employee.getKeycloakUserId() == null || employee.getKeycloakUserId().isBlank()) {
            employee.setKeycloakUserId("kc-" + employee.getEmployeeCode().toLowerCase());
        }
        if (employee.getStartDate() == null) {
            employee.setStartDate(LocalDate.now());
        }

        Employee saved = employeeRepository.save(employee);

        // Khởi tạo quỹ phép năm hiện tại nếu chưa có
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

        return ResponseEntity.ok(ApiResponse.ok("Thêm mới nhân viên thành công", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Employee>> updateEmployee(
            @PathVariable("id") String id, 
            @RequestBody Employee payload) {
        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhân viên với ID: " + id));

        existing.setFullName(payload.getFullName());
        existing.setEmail(payload.getEmail());
        existing.setDepartmentId(payload.getDepartmentId());
        existing.setDirectManagerId(payload.getDirectManagerId());
        existing.setContractType(payload.getContractType());
        existing.setAppRole(payload.getAppRole());
        existing.setIsActive(payload.getIsActive());

        Employee updated = employeeRepository.save(existing);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thông tin nhân viên thành công", updated));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Employee>> getEmployeeById(@PathVariable("id") String id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhân viên với ID: " + id));
        return ResponseEntity.ok(ApiResponse.ok("Lấy chi tiết nhân viên thành công", employee));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEmployee(@PathVariable("id") String id) {
        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhân viên với ID: " + id));
        existing.setIsActive(false);
        employeeRepository.save(existing);
        return ResponseEntity.ok(ApiResponse.ok("Đã vô hiệu hóa (ngừng hoạt động) nhân viên thành công", null));
    }
}

