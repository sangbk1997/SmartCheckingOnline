package com.company.smarttimechecking.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_leave_balances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeLeaveBalance {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "employee_id", nullable = false, length = 36)
    private String employeeId;

    @Column(name = "leave_year", nullable = false)
    private Integer leaveYear;

    @Column(name = "total_accrued", precision = 4, scale = 1)
    @Builder.Default
    private BigDecimal totalAccrued = BigDecimal.ZERO;

    @Column(name = "tenure_bonus", precision = 4, scale = 1)
    @Builder.Default
    private BigDecimal tenureBonus = BigDecimal.ZERO;

    @Column(name = "carried_over", precision = 4, scale = 1)
    @Builder.Default
    private BigDecimal carriedOver = BigDecimal.ZERO;

    @Column(name = "used_days", precision = 4, scale = 1)
    @Builder.Default
    private BigDecimal usedDays = BigDecimal.ZERO;

    @Column(name = "remaining_days", precision = 4, scale = 1)
    @Builder.Default
    private BigDecimal remainingDays = BigDecimal.ZERO;

    @Column(name = "carry_over_expiry_date", nullable = false)
    private LocalDate carryOverExpiryDate;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

