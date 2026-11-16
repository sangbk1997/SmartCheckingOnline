package com.company.smarttimechecking.service;

import com.company.smarttimechecking.domain.entity.*;
import com.company.smarttimechecking.repository.*;
import com.company.smarttimechecking.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class TimesheetService {

    private final PayrollPeriodRepository periodRepository;
    private final MonthlyTimesheetRepository timesheetRepository;
    private final TimesheetDisputeRepository disputeRepository;
    private final PayrollRetroAdjustmentRepository retroAdjustmentRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional
    public PayrollPeriod lockPeriod(UserPrincipal admin, String periodId) {
        PayrollPeriod period = periodRepository.findById(periodId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy kỳ công với ID: " + periodId));

        period.setStatus("LOCKED");
        period.setLockedBy(admin.getId());
        period.setLockedAt(LocalDateTime.now());

        // Khóa tất cả bảng công của nhân viên trong kỳ này
        List<MonthlyTimesheet> timesheets = timesheetRepository.findByPayrollPeriodId(periodId);
        for (MonthlyTimesheet ts : timesheets) {
            ts.setIsLocked(true);
            timesheetRepository.save(ts);
        }

        return periodRepository.save(period);
    }

    @Transactional
    public TimesheetDispute submitDispute(UserPrincipal user, String periodId, LocalDate date, String reason, String attachmentUrl) {
        PayrollPeriod period = periodRepository.findById(periodId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy kỳ công!"));

        if (LocalDateTime.now().isAfter(period.getDisputeDeadline())) {
            throw new IllegalArgumentException("ERR_DISPUTE_EXPIRED: Cổng khiếu nại công cho kỳ này đã đóng (quá thời hạn 48 giờ)!");
        }

        TimesheetDispute dispute = TimesheetDispute.builder()
                .id(UUID.randomUUID().toString())
                .payrollPeriodId(periodId)
                .employeeId(user.getId())
                .disputedDate(date)
                .disputeReason(reason)
                .attachmentUrl(attachmentUrl)
                .status("PENDING")
                .build();

        return disputeRepository.save(dispute);
    }

    // Cơ chế hồi tố: Gọi khi có đơn được duyệt cho một ngày thuộc kỳ công đã bị khóa
    @Transactional
    public void createRetroactiveAdjustmentIfLocked(String employeeId, LocalDate date, String requestId, String reason) {
        // Tìm kỳ công chứa ngày date
        periodRepository.findAll().stream()
                .filter(p -> !date.isBefore(p.getStartDate()) && !date.isAfter(p.getEndDate()))
                .filter(p -> "LOCKED".equalsIgnoreCase(p.getStatus()))
                .findFirst()
                .ifPresent(lockedPeriod -> {
                    // Tìm kỳ công mở tiếp theo
                    PayrollPeriod nextPeriod = periodRepository.findFirstByStatusOrderByStartDateDesc("OPEN")
                            .orElse(null);

                    if (nextPeriod != null) {
                        PayrollRetroAdjustment retro = PayrollRetroAdjustment.builder()
                                .id(UUID.randomUUID().toString())
                                .employeeId(employeeId)
                                .requestId(requestId)
                                .originPeriodId(lockedPeriod.getId())
                                .targetPeriodId(nextPeriod.getId())
                                .originDate(date)
                                .adjustmentType("ADD_WORK_DAY")
                                .value(BigDecimal.ONE)
                                .reason(reason + " (Tự động chuyển hồi tố sang kỳ " + nextPeriod.getPeriodCode() + ")")
                                .appliedToTargetTimesheet(false)
                                .build();
                        retroAdjustmentRepository.save(retro);
                        log.info("Đã tạo khoản điều chỉnh hồi tố cho nhân viên {} vào kỳ {}", employeeId, nextPeriod.getPeriodCode());
                    }
                });
    }

    public List<MonthlyTimesheet> getTimesheetsByPeriod(String periodId) {
        return timesheetRepository.findByPayrollPeriodId(periodId);
    }

    public Optional<MonthlyTimesheet> getMyTimesheet(String employeeId, String periodId) {
        if (periodId == null || periodId.isBlank()) {
            return timesheetRepository.findAll().stream()
                    .filter(ts -> ts.getEmployeeId().equals(employeeId))
                    .findFirst();
        }
        return timesheetRepository.findByPayrollPeriodIdAndEmployeeId(periodId, employeeId);
    }

    @Transactional
    public List<MonthlyTimesheet> aggregatePeriod(String periodId) {
        PayrollPeriod period = periodRepository.findById(periodId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy kỳ công!"));
        if ("LOCKED".equalsIgnoreCase(period.getStatus())) {
            throw new IllegalArgumentException("Kỳ công đã bị khóa bất biến, không thể tổng hợp lại!");
        }

        List<Employee> employees = employeeRepository.findAll();
        for (Employee emp : employees) {
            if (timesheetRepository.findByPayrollPeriodIdAndEmployeeId(periodId, emp.getId()).isEmpty()) {
                MonthlyTimesheet ts = MonthlyTimesheet.builder()
                        .id(UUID.randomUUID().toString())
                        .payrollPeriodId(periodId)
                        .employeeId(emp.getId())
                        .standardWorkDays(BigDecimal.valueOf(22.0))
                        .actualWorkDays(BigDecimal.valueOf(21.0))
                        .wfhDays(BigDecimal.valueOf(1.0))
                        .paidLeaveDays(BigDecimal.ZERO)
                        .unpaidLeaveDays(BigDecimal.ZERO)
                        .socialInsuranceDays(BigDecimal.ZERO)
                        .holidayPaidDays(BigDecimal.ZERO)
                        .lateMinutesTotal(0)
                        .earlyMinutesTotal(0)
                        .retroAdjustmentDays(BigDecimal.ZERO)
                        .dailyDetails("{\"status\": \"AUTO_AGGREGATED\"}")
                        .isLocked(false)
                        .build();
                timesheetRepository.save(ts);
            }
        }
        return timesheetRepository.findByPayrollPeriodId(periodId);
    }

    @Transactional
    public TimesheetDispute resolveDispute(String disputeId, String action, String notes) {
        TimesheetDispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn khiếu nại!"));
        dispute.setStatus("APPROVE".equalsIgnoreCase(action) ? "ACCEPTED" : "REJECTED");
        dispute.setHrResponse(notes != null ? notes : "HR đã xử lý giải quyết khiếu nại");
        dispute.setResolvedAt(LocalDateTime.now());
        return disputeRepository.save(dispute);
    }
}

