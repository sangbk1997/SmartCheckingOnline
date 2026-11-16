package com.company.smarttimechecking.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "timesheet_disputes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimesheetDispute {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "payroll_period_id", nullable = false, length = 36)
    private String payrollPeriodId;

    @Column(name = "employee_id", nullable = false, length = 36)
    private String employeeId;

    @Column(name = "disputed_date", nullable = false)
    private LocalDate disputedDate;

    @Column(name = "dispute_reason", nullable = false, columnDefinition = "TEXT")
    private String disputeReason;

    @Column(name = "attachment_url", columnDefinition = "TEXT")
    private String attachmentUrl;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "PENDING"; // "PENDING", "ACCEPTED", "REJECTED"

    @Column(name = "hr_response", columnDefinition = "TEXT")
    private String hrResponse;

    @Column(name = "resolved_by", length = 36)
    private String resolvedBy;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

