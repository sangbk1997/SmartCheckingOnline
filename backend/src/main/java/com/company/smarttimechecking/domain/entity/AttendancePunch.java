package com.company.smarttimechecking.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_punches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendancePunch {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "employee_id", nullable = false, length = 36)
    private String employeeId;

    @Column(name = "punch_time", nullable = false)
    private LocalDateTime punchTime;

    @Column(name = "punch_type", nullable = false, length = 10)
    private String punchType; // "IN", "OUT"

    @Column(name = "verification_method", nullable = false, length = 30)
    private String verificationMethod; // "DYNAMIC_QR", "EMERGENCY_SELFIE", "WFH_PORTAL"

    @Column(name = "client_ip", nullable = false, length = 50)
    private String clientIp;

    @Column(name = "device_id", length = 36)
    private String deviceId;

    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "is_wfh", nullable = false)
    @Builder.Default
    private Boolean isWfh = false;

    @Column(name = "selfie_image_url", columnDefinition = "TEXT")
    private String selfieImageUrl;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "VALID"; // "VALID", "PENDING_APPROVAL", "REJECTED"

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

