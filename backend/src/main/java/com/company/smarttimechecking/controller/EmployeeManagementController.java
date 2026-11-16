package com.company.smarttimechecking.controller;

import com.company.smarttimechecking.domain.entity.Employee;
import com.company.smarttimechecking.domain.entity.EmployeeLeaveBalance;
import com.company.smarttimechecking.dto.ApiResponse;
import com.company.smarttimechecking.repository.EmployeeLeaveBalanceRepository;
import com.company.smarttimechecking.repository.EmployeeRepository;
import com.company.smarttimechecking.service.KeycloakService;
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
    private final KeycloakService keycloakService;

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
            employee.setKeycloakUserId("kc-usr-" + UUID.randomUUID().toString());
        }
        if (employee.getStartDate() == null) {
            employee.setStartDate(LocalDate.now());
        }
        if (employee.getIsActive() == null) {
            employee.setIsActive(true);
        }

        // Tích hợp đồng bộ Keycloak Identity Provider
        keycloakService.syncUserToKeycloak(employee, null);

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

        return ResponseEntity.ok(ApiResponse.ok("Thêm mới nhân viên và đồng bộ Keycloak thành công", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Employee>> updateEmployee(
            @PathVariable("id") String id, 
            @RequestBody Employee payload) {
        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhân viên với ID: " + id));

        if (payload.getFullName() != null) existing.setFullName(payload.getFullName().trim());
        if (payload.getEmail() != null) existing.setEmail(payload.getEmail().trim());
        if (payload.getEmployeeCode() != null && !payload.getEmployeeCode().isBlank()) {
            existing.setEmployeeCode(payload.getEmployeeCode().trim());
        }
        if (payload.getDepartmentId() != null) existing.setDepartmentId(payload.getDepartmentId());
        if (payload.getDirectManagerId() != null) existing.setDirectManagerId(payload.getDirectManagerId());
        if (payload.getContractType() != null) existing.setContractType(payload.getContractType());
        if (payload.getAppRole() != null) existing.setAppRole(payload.getAppRole());
        if (payload.getIsActive() != null) existing.setIsActive(payload.getIsActive());

        // Đồng bộ cập nhật vai trò, phòng ban và trạng thái lên Keycloak
        keycloakService.updateUserInKeycloak(existing);

        Employee updated = employeeRepository.save(existing);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thông tin nhân viên và đồng bộ Keycloak thành công", updated));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Employee>> getEmployeeById(@PathVariable("id") String id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhân viên với ID: " + id));
        return ResponseEntity.ok(ApiResponse.ok("Lấy chi tiết nhân viên thành công", employee));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEmployee(
            @PathVariable("id") String id,
            @RequestParam(value = "permanent", defaultValue = "false") boolean permanent) {
        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhân viên với ID: " + id));

        if (permanent) {
            leaveBalanceRepository.deleteByEmployeeId(id);
            keycloakService.setUserEnabledStatus(existing.getKeycloakUserId(), false);
            employeeRepository.delete(existing);
            return ResponseEntity.ok(ApiResponse.ok("Đã xóa vĩnh viễn nhân viên khỏi hệ thống", null));
        } else {
            existing.setIsActive(false);
            keycloakService.setUserEnabledStatus(existing.getKeycloakUserId(), false);
            employeeRepository.save(existing);
            return ResponseEntity.ok(ApiResponse.ok("Đã vô hiệu hóa (ngừng hoạt động) nhân viên thành công", null));
        }
    }

    @PostMapping("/{id}/reactivate")
    public ResponseEntity<ApiResponse<Employee>> reactivateEmployee(@PathVariable("id") String id) {
        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhân viên với ID: " + id));
        existing.setIsActive(true);
        keycloakService.setUserEnabledStatus(existing.getKeycloakUserId(), true);
        Employee saved = employeeRepository.save(existing);
        return ResponseEntity.ok(ApiResponse.ok("Đã kích hoạt lại tài khoản nhân viên", saved));
    }
}
