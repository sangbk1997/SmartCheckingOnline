package com.company.smarttimechecking.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "monthly_timesheets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyTimesheet {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "payroll_period_id", nullable = false, length = 36)
    private String payrollPeriodId;

    @Column(name = "employee_id", nullable = false, length = 36)
    private String employeeId;

    @Column(name = "standard_work_days", precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal standardWorkDays = BigDecimal.ZERO;

    @Column(name = "actual_work_days", precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal actualWorkDays = BigDecimal.ZERO;

    @Column(name = "wfh_days", precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal wfhDays = BigDecimal.ZERO;

    @Column(name = "paid_leave_days", precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal paidLeaveDays = BigDecimal.ZERO;

    @Column(name = "unpaid_leave_days", precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal unpaidLeaveDays = BigDecimal.ZERO;

    @Column(name = "social_insurance_days", precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal socialInsuranceDays = BigDecimal.ZERO;

    @Column(name = "holiday_paid_days", precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal holidayPaidDays = BigDecimal.ZERO;

    @Column(name = "late_minutes_total")
    @Builder.Default
    private Integer lateMinutesTotal = 0;

    @Column(name = "early_minutes_total")
    @Builder.Default
    private Integer earlyMinutesTotal = 0;

    @Column(name = "retro_adjustment_days", precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal retroAdjustmentDays = BigDecimal.ZERO;

    @Column(name = "daily_details", columnDefinition = "JSON", nullable = false)
    private String dailyDetails; // Ví dụ: {"1":"X", "2":"W", ...}

    @Column(name = "is_locked", nullable = false)
    @Builder.Default
    private Boolean isLocked = false;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

