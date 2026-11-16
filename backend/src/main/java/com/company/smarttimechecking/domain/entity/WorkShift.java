package com.company.smarttimechecking.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "work_shifts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkShift {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "shift_code", nullable = false, unique = true, length = 50)
    private String shiftCode;

    @Column(name = "shift_name", nullable = false, length = 150)
    private String shiftName;

    @Column(name = "shift_type", nullable = false, length = 30)
    @Builder.Default
    private String shiftType = "FIXED"; // "FIXED", "FLEXIBLE", "SPLIT"

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "lunch_break_start")
    private LocalTime lunchBreakStart;

    @Column(name = "lunch_break_end")
    private LocalTime lunchBreakEnd;

    @Column(name = "standard_work_hours", nullable = false, precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal standardWorkHours = BigDecimal.valueOf(8.00);

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

