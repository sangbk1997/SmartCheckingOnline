package com.company.smarttimechecking.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payroll_retro_adjustments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayrollRetroAdjustment {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "employee_id", nullable = false, length = 36)
    private String employeeId;

    @Column(name = "request_id", length = 36)
    private String requestId;

    @Column(name = "origin_period_id", nullable = false, length = 36)
    private String originPeriodId;

    @Column(name = "target_period_id", nullable = false, length = 36)
    private String targetPeriodId;

    @Column(name = "origin_date", nullable = false)
    private LocalDate originDate;

    @Column(name = "adjustment_type", nullable = false, length = 50)
    private String adjustmentType; // "ADD_WORK_DAY", "DEDUCT_WORK_DAY", "ADD_LEAVE"

    @Column(nullable = false, precision = 4, scale = 2)
    private BigDecimal value;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "applied_to_target_timesheet", nullable = false)
    @Builder.Default
    private Boolean appliedToTargetTimesheet = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

