package com.company.smarttimechecking.controller;

import com.company.smarttimechecking.domain.entity.HolidayCalendar;
import com.company.smarttimechecking.domain.entity.PolicyRule;
import com.company.smarttimechecking.domain.entity.WorkShift;
import com.company.smarttimechecking.dto.ApiResponse;
import com.company.smarttimechecking.repository.HolidayCalendarRepository;
import com.company.smarttimechecking.repository.PolicyRuleRepository;
import com.company.smarttimechecking.repository.WorkShiftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/settings")
@RequiredArgsConstructor
public class PolicyAdminController {

    private final PolicyRuleRepository policyRuleRepository;
    private final WorkShiftRepository workShiftRepository;
    private final HolidayCalendarRepository holidayCalendarRepository;

    // 1. Quản lý Quy định & Hạn ngạch (Policy Rules)
    @GetMapping("/policies")
    public ResponseEntity<ApiResponse<List<PolicyRule>>> listPolicies() {
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách quy định thành công", policyRuleRepository.findAll()));
    }

    @PutMapping("/policies/{id}")
    public ResponseEntity<ApiResponse<PolicyRule>> updatePolicy(
            @PathVariable("id") String id, 
            @RequestBody PolicyRule payload) {
        PolicyRule existing = policyRuleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy quy định!"));
        existing.setParameters(payload.getParameters());
        existing.setEffectiveFrom(payload.getEffectiveFrom());
        existing.setEffectiveTo(payload.getEffectiveTo());
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật quy định thành công", policyRuleRepository.save(existing)));
    }

    // 2. Quản lý Ca làm việc (Shifts)
    @GetMapping("/shifts")
    public ResponseEntity<ApiResponse<List<WorkShift>>> listShifts() {
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách ca làm việc thành công", workShiftRepository.findAll()));
    }

    @PostMapping("/shifts")
    public ResponseEntity<ApiResponse<WorkShift>> createShift(@RequestBody WorkShift shift) {
        if (shift.getId() == null || shift.getId().isBlank()) {
            shift.setId(UUID.randomUUID().toString());
        }
        return ResponseEntity.ok(ApiResponse.ok("Lưu ca làm việc thành công", workShiftRepository.save(shift)));
    }

    @PutMapping("/shifts/{id}")
    public ResponseEntity<ApiResponse<WorkShift>> updateShift(@PathVariable("id") String id, @RequestBody WorkShift payload) {
        WorkShift existing = workShiftRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy ca làm việc với ID: " + id));
        if (payload.getShiftName() != null) existing.setShiftName(payload.getShiftName());
        if (payload.getShiftCode() != null) existing.setShiftCode(payload.getShiftCode());
        if (payload.getStartTime() != null) existing.setStartTime(payload.getStartTime());
        if (payload.getEndTime() != null) existing.setEndTime(payload.getEndTime());
        if (payload.getStandardWorkHours() != null) existing.setStandardWorkHours(payload.getStandardWorkHours());
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật ca làm việc thành công", workShiftRepository.save(existing)));
    }

    @DeleteMapping("/shifts/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteShift(@PathVariable("id") String id) {
        WorkShift existing = workShiftRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy ca làm việc với ID: " + id));
        workShiftRepository.delete(existing);
        return ResponseEntity.ok(ApiResponse.ok("Xóa ca làm việc thành công", null));
    }

    // 3. Quản lý Ngày lễ (Holidays)
    @GetMapping("/holidays")
    public ResponseEntity<ApiResponse<List<HolidayCalendar>>> listHolidays() {
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách ngày lễ thành công", holidayCalendarRepository.findAll()));
    }

    @PostMapping("/holidays")
    public ResponseEntity<ApiResponse<HolidayCalendar>> createHoliday(@RequestBody HolidayCalendar holiday) {
        if (holiday.getId() == null || holiday.getId().isBlank()) {
            holiday.setId(UUID.randomUUID().toString());
        }
        if (holiday.getHolidayYear() == null && holiday.getStartDate() != null) {
            holiday.setHolidayYear(holiday.getStartDate().getYear());
        }
        return ResponseEntity.ok(ApiResponse.ok("Lưu ngày lễ thành công", holidayCalendarRepository.save(holiday)));
    }

    @PutMapping("/holidays/{id}")
    public ResponseEntity<ApiResponse<HolidayCalendar>> updateHoliday(@PathVariable("id") String id, @RequestBody HolidayCalendar payload) {
        HolidayCalendar existing = holidayCalendarRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy ngày lễ với ID: " + id));
        if (payload.getHolidayName() != null) existing.setHolidayName(payload.getHolidayName());
        if (payload.getStartDate() != null) existing.setStartDate(payload.getStartDate());
        if (payload.getEndDate() != null) existing.setEndDate(payload.getEndDate());
        if (payload.getHolidayYear() != null) existing.setHolidayYear(payload.getHolidayYear());
        if (payload.getIsPaid() != null) existing.setIsPaid(payload.getIsPaid());
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật ngày lễ thành công", holidayCalendarRepository.save(existing)));
    }

    @DeleteMapping("/holidays/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteHoliday(@PathVariable("id") String id) {
        HolidayCalendar existing = holidayCalendarRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy ngày lễ với ID: " + id));
        holidayCalendarRepository.delete(existing);
        return ResponseEntity.ok(ApiResponse.ok("Xóa ngày lễ thành công", null));
    }
}

