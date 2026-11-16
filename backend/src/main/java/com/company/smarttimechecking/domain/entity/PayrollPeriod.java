package com.company.smarttimechecking.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payroll_periods")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayrollPeriod {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "period_code", nullable = false, unique = true, length = 20)
    private String periodCode;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "dispute_deadline", nullable = false)
    private LocalDateTime disputeDeadline;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "OPEN"; // "OPEN", "AGGREGATED", "DISPUTE_WINDOW", "LOCKED"

    @Column(name = "locked_by", length = 36)
    private String lockedBy;

    @Column(name = "locked_at")
    private LocalDateTime lockedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

