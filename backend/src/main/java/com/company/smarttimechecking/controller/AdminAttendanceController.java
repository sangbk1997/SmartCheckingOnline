package com.company.smarttimechecking.controller;

import com.company.smarttimechecking.domain.entity.AttendancePunch;
import com.company.smarttimechecking.dto.ApiResponse;
import com.company.smarttimechecking.dto.ApprovalDto;
import com.company.smarttimechecking.repository.AttendancePunchRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/attendance")
@RequiredArgsConstructor
public class AdminAttendanceController {

    private final AttendancePunchRepository punchRepository;

    @GetMapping("/emergency-pending")
    public ResponseEntity<ApiResponse<List<AttendancePunch>>> getPendingEmergencies() {
        List<AttendancePunch> list = punchRepository.findByStatusOrderByPunchTimeDesc("PENDING_APPROVAL");
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách chấm công khẩn cấp chờ duyệt", list));
    }

    @PostMapping("/emergency/{id}/review")
    public ResponseEntity<ApiResponse<AttendancePunch>> reviewEmergency(
            @PathVariable("id") String punchId,
            @Valid @RequestBody ApprovalDto dto) {

        AttendancePunch punch = punchRepository.findById(punchId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bản ghi chấm công!"));

        if ("APPROVE".equalsIgnoreCase(dto.getAction())) {
            punch.setStatus("VALID");
        } else {
            punch.setStatus("REJECTED");
            punch.setRejectionReason(dto.getComment());
        }

        AttendancePunch saved = punchRepository.save(punch);
        return ResponseEntity.ok(ApiResponse.ok("Xử lý yêu cầu chấm công khẩn cấp thành công", saved));
    }
}

