package com.company.smarttimechecking.controller;

import com.company.smarttimechecking.domain.entity.Department;
import com.company.smarttimechecking.dto.ApiResponse;
import com.company.smarttimechecking.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentRepository departmentRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Department>>> getAllDepartments() {
        List<Department> list = departmentRepository.findAll();
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách phòng ban thành công", list));
    }

    @PostMapping("/admin")
    public ResponseEntity<ApiResponse<Department>> saveDepartment(@RequestBody Department dept) {
        if (dept.getId() == null || dept.getId().isBlank()) {
            dept.setId(UUID.randomUUID().toString());
        }
        Department saved = departmentRepository.save(dept);
        return ResponseEntity.ok(ApiResponse.ok("Lưu thông tin phòng ban thành công", saved));
    }

    @PutMapping("/admin/{id}")
    public ResponseEntity<ApiResponse<Department>> updateDepartment(@PathVariable("id") String id, @RequestBody Department dept) {
        Department existing = departmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phòng ban với ID: " + id));
        if (dept.getName() != null) existing.setName(dept.getName());
        if (dept.getCode() != null) existing.setCode(dept.getCode());
        if (dept.getManagerId() != null) existing.setManagerId(dept.getManagerId());
        Department saved = departmentRepository.save(existing);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật phòng ban thành công", saved));
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(@PathVariable("id") String id) {
        Department existing = departmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phòng ban với ID: " + id));
        departmentRepository.delete(existing);
        return ResponseEntity.ok(ApiResponse.ok("Xóa phòng ban thành công", null));
    }
}

