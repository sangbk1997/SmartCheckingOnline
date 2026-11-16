package com.company.smarttimechecking.service;

import com.company.smarttimechecking.domain.entity.*;
import com.company.smarttimechecking.dto.ApprovalDto;
import com.company.smarttimechecking.dto.AttendanceRequestDetailDto;
import com.company.smarttimechecking.dto.CreateRequestDto;
import com.company.smarttimechecking.dto.QuotaStatusDto;
import com.company.smarttimechecking.notification.event.RequestCreatedEvent;
import com.company.smarttimechecking.notification.event.RequestReviewedEvent;
import com.company.smarttimechecking.repository.*;
import com.company.smarttimechecking.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RequestService {

    private final AttendanceRequestRepository requestRepository;
    private final RequestApprovalRepository approvalRepository;
    private final EmployeeLeaveBalanceRepository leaveBalanceRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final ApplicationEventPublisher eventPublisher;

    public QuotaStatusDto getRemainingQuotas(String employeeId) {
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());

        long lateUsed = requestRepository.countRequestsInPeriod(employeeId, "LATE_IN", startOfMonth, endOfMonth)
                      + requestRepository.countRequestsInPeriod(employeeId, "EARLY_OUT", startOfMonth, endOfMonth);
        long missedUsed = requestRepository.countRequestsInPeriod(employeeId, "MISSED_PUNCH", startOfMonth, endOfMonth);
        long wfhUsed = requestRepository.countRequestsInPeriod(employeeId, "WFH", startOfMonth, endOfMonth);

        BigDecimal leaveRemaining = leaveBalanceRepository.findByEmployeeIdAndLeaveYear(employeeId, now.getYear())
                .map(EmployeeLeaveBalance::getRemainingDays)
                .orElse(BigDecimal.ZERO);

        return QuotaStatusDto.builder()
                .lateEarlyUsedMonth((int) lateUsed)
                .lateEarlyMaxMonth(2)
                .lateEarlyRemaining(Math.max(0, 2 - (int) lateUsed))
                .missedPunchUsedMonth((int) missedUsed)
                .missedPunchMaxMonth(3)
                .missedPunchRemaining(Math.max(0, 3 - (int) missedUsed))
                .wfhUsedMonth(wfhUsed)
                .wfhMaxMonth(4)
                .wfhRemaining(Math.max(0, 4 - wfhUsed))
                .annualLeaveRemaining(leaveRemaining)
                .build();
    }

    @Transactional
    public AttendanceRequest createRequest(UserPrincipal user, CreateRequestDto dto) {
        String reqType = dto.getRequestType().toUpperCase();
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());

        // 1. Kiểm tra hạn ngạch cho từng loại đơn
        if ("LATE_IN".equals(reqType) || "EARLY_OUT".equals(reqType)) {
            if (dto.getDurationMinutes() != null && dto.getDurationMinutes() > 60) {
                throw new IllegalArgumentException("ERR_QUOTA_EXCEEDED: Thời lượng đi muộn/về sớm tối đa là 60 phút/lần!");
            }
            long used = requestRepository.countRequestsInPeriod(user.getId(), "LATE_IN", startOfMonth, endOfMonth)
                      + requestRepository.countRequestsInPeriod(user.getId(), "EARLY_OUT", startOfMonth, endOfMonth);
            if (used >= 2) {
                throw new IllegalArgumentException("ERR_QUOTA_EXCEEDED: Bạn đã hết lượt đi muộn/về sớm trong tháng này (tối đa 2 lần/tháng)!");
            }
        } else if ("MISSED_PUNCH".equals(reqType)) {
            long daysDiff = ChronoUnit.DAYS.between(dto.getFromDate(), now);
            if (daysDiff > 3) {
                throw new IllegalArgumentException("ERR_DEADLINE_EXCEEDED: Đơn bổ sung chấm công chỉ được nộp trong vòng 3 ngày kể từ ngày quên!");
            }
            long used = requestRepository.countRequestsInPeriod(user.getId(), "MISSED_PUNCH", startOfMonth, endOfMonth);
            if (used >= 3) {
                throw new IllegalArgumentException("ERR_QUOTA_EXCEEDED: Bạn đã hết lượt bổ sung công trong tháng này (tối đa 3 lần/tháng)!");
            }
        } else if ("WFH".equals(reqType)) {
            long used = requestRepository.countRequestsInPeriod(user.getId(), "WFH", startOfMonth, endOfMonth);
            if (used >= 4) {
                throw new IllegalArgumentException("ERR_QUOTA_EXCEEDED: Bạn đã hết quota làm việc từ xa (WFH) trong tháng này (tối đa 4 ngày)!");
            }
        } else if ("SICK_LEAVE".equals(reqType)) {
            if (dto.getAttachmentUrl() == null || dto.getAttachmentUrl().isBlank()) {
                throw new IllegalArgumentException("ERR_ATTACHMENT_REQUIRED: Nghỉ ốm bắt buộc phải đính kèm chứng từ y tế / giấy khám bệnh!");
            }
        }

        boolean isUrgent = dto.getFromDate().isEqual(now) && "WFH".equals(reqType);

        String requestCode = "REQ-" + System.currentTimeMillis();
        AttendanceRequest request = AttendanceRequest.builder()
                .id(UUID.randomUUID().toString())
                .requestCode(requestCode)
                .employeeId(user.getId())
                .requestType(reqType)
                .fromDate(dto.getFromDate())
                .toDate(dto.getToDate())
                .durationMinutes(dto.getDurationMinutes())
                .leaveUnits(dto.getLeaveUnits() != null ? dto.getLeaveUnits() : BigDecimal.ONE)
                .isRecurringWfh(Boolean.TRUE.equals(dto.getIsRecurringWfh()))
                .recurringDayOfWeek(dto.getRecurringDayOfWeek())
                .isUrgent(isUrgent)
                .reason(dto.getReason())
                .attachmentUrl(dto.getAttachmentUrl())
                .status("PENDING")
                .build();

        AttendanceRequest saved = requestRepository.save(request);

        // Tạo bản ghi phê duyệt bước 1 gửi cho sếp trực tiếp
        String approverId = user.getDirectManagerId();
        if (approverId != null) {
            RequestApproval approval = RequestApproval.builder()
                    .id(UUID.randomUUID().toString())
                    .requestId(saved.getId())
                    .stepOrder(1)
                    .approverId(approverId)
                    .action("PENDING")
                    .build();
            approvalRepository.save(approval);
        }

        // Bắn sự kiện gửi email Actionable Card & Google Chat Card
        employeeRepository.findById(user.getId()).ifPresent(emp -> {
            eventPublisher.publishEvent(new RequestCreatedEvent(saved, emp));
        });

        return saved;
    }

    @Transactional
    public AttendanceRequest reviewRequest(UserPrincipal reviewer, String requestId, ApprovalDto dto) {
        if (reviewer == null || (!"HR_ADMIN".equalsIgnoreCase(reviewer.getRole()) && !"MANAGER".equalsIgnoreCase(reviewer.getRole()))) {
            throw new IllegalArgumentException("Chỉ Quản lý hoặc Ban Nhân sự (HR) mới có quyền xét duyệt đơn từ!");
        }

        AttendanceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn với ID: " + requestId));

        if (!"PENDING".equals(request.getStatus())) {
            throw new IllegalArgumentException("Đơn này đã được xử lý trước đó!");
        }

        String action = dto.getAction().toUpperCase();
        if ("APPROVE".equals(action)) {
            request.setStatus("APPROVED");

            // Nếu là đơn nghỉ phép năm, trừ vào quỹ phép
            if ("ANNUAL_LEAVE".equals(request.getRequestType())) {
                leaveBalanceRepository.findByEmployeeIdAndLeaveYear(request.getEmployeeId(), request.getFromDate().getYear())
                        .ifPresent(balance -> {
                            balance.setUsedDays(balance.getUsedDays().add(request.getLeaveUnits()));
                            balance.setRemainingDays(balance.getRemainingDays().subtract(request.getLeaveUnits()));
                            leaveBalanceRepository.save(balance);
                        });
            }
        } else {
            request.setStatus("REJECTED");
        }

        // Cập nhật bản ghi phê duyệt
        List<RequestApproval> approvals = approvalRepository.findByRequestIdOrderByStepOrderAsc(requestId);
        for (RequestApproval appr : approvals) {
            if (appr.getApproverId().equals(reviewer.getId()) || "HR_ADMIN".equals(reviewer.getRole())) {
                appr.setAction(action);
                appr.setComment(dto.getComment());
                appr.setActionTime(LocalDateTime.now());
                approvalRepository.save(appr);
                break;
            }
        }

        AttendanceRequest saved = requestRepository.save(request);

        // Bắn sự kiện gửi email thông báo kết quả cho nhân viên
        Employee reviewerEmp = employeeRepository.findById(reviewer.getId()).orElse(null);
        eventPublisher.publishEvent(new RequestReviewedEvent(saved, reviewerEmp, action, dto.getComment()));

        return saved;
    }

    @Transactional
    public void cancelRequest(UserPrincipal user, String requestId) {
        AttendanceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn với ID: " + requestId));

        if (!request.getEmployeeId().equals(user.getId())) {
            throw new IllegalArgumentException("Bạn chỉ có thể hủy đơn do chính bạn tạo!");
        }

        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new IllegalArgumentException("Không thể hủy đơn đã được phê duyệt hoặc từ chối!");
        }

        approvalRepository.findByRequestIdOrderByStepOrderAsc(requestId)
                .forEach(approvalRepository::delete);
        requestRepository.delete(request);
    }

    public List<AttendanceRequest> getMyRequests(String employeeId) {
        return requestRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId);
    }

    public List<AttendanceRequestDetailDto> getPendingRequestsForReviewer(UserPrincipal reviewer) {
        List<AttendanceRequest> requests;
        if ("ROLE_HR_ADMIN".equalsIgnoreCase(reviewer.getRole()) || "HR_ADMIN".equalsIgnoreCase(reviewer.getRole())) {
            requests = requestRepository.findByStatusOrderByCreatedAtDesc("PENDING");
        } else {
            List<Employee> subordinates = employeeRepository.findByDirectManagerId(reviewer.getId());
            List<String> subIds = new ArrayList<>();
            for (Employee e : subordinates) {
                subIds.add(e.getId());
            }
            if (reviewer.getDepartmentId() != null) {
                List<Employee> deptEmps = employeeRepository.findByDepartmentId(reviewer.getDepartmentId());
                for (Employee e : deptEmps) {
                    if (!subIds.contains(e.getId())) {
                        subIds.add(e.getId());
                    }
                }
            }
            subIds.add(reviewer.getId());
            requests = requestRepository.findByEmployeeIdInAndStatusOrderByCreatedAtDesc(subIds, "PENDING");
        }

        return requests.stream().map(r -> {
            Employee emp = employeeRepository.findById(r.getEmployeeId()).orElse(null);
            String deptName = "";
            if (emp != null && emp.getDepartmentId() != null) {
                deptName = departmentRepository.findById(emp.getDepartmentId())
                        .map(Department::getName).orElse("");
            }
            return AttendanceRequestDetailDto.builder()
                    .id(r.getId())
                    .requestCode(r.getRequestCode())
                    .employeeId(r.getEmployeeId())
                    .employeeCode(emp != null ? emp.getEmployeeCode() : "")
                    .employeeName(emp != null ? emp.getFullName() : "N/A")
                    .departmentName(deptName)
                    .requestType(r.getRequestType())
                    .fromDate(r.getFromDate())
                    .toDate(r.getToDate())
                    .durationMinutes(r.getDurationMinutes())
                    .leaveUnits(r.getLeaveUnits())
                    .isRecurringWfh(r.getIsRecurringWfh())
                    .isUrgent(r.getIsUrgent())
                    .reason(r.getReason())
                    .eodReport(r.getEodReport())
                    .attachmentUrl(r.getAttachmentUrl())
                    .status(r.getStatus())
                    .createdAt(r.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
    }
}

