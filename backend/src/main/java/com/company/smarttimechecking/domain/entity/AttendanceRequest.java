package com.company.smarttimechecking.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRequest {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "request_code", nullable = false, unique = true, length = 30)
    private String requestCode;

    @Column(name = "employee_id", nullable = false, length = 36)
    private String employeeId;

    @Column(name = "request_type", nullable = false, length = 50)
    private String requestType; 
    // "LATE_IN", "EARLY_OUT", "MISSED_PUNCH", "ANNUAL_LEAVE", "SICK_LEAVE", "MATERNITY", "WFH", "UNPAID_LEAVE"

    @Column(name = "from_date", nullable = false)
    private LocalDate fromDate;

    @Column(name = "to_date", nullable = false)
    private LocalDate toDate;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "leave_units", precision = 3, scale = 1)
    private BigDecimal leaveUnits;

    @Column(name = "is_recurring_wfh", nullable = false)
    @Builder.Default
    private Boolean isRecurringWfh = false;

    @Column(name = "recurring_day_of_week")
    private Integer recurringDayOfWeek;

    @Column(name = "is_urgent", nullable = false)
    @Builder.Default
    private Boolean isUrgent = false;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "eod_report", columnDefinition = "TEXT")
    private String eodReport;

    @Column(name = "attachment_url", columnDefinition = "TEXT")
    private String attachmentUrl;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "PENDING"; // "PENDING", "APPROVED", "REJECTED", "CANCELLED"

    @Column(name = "applied_to_timesheet", nullable = false)
    @Builder.Default
    private Boolean appliedToTimesheet = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

