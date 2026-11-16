package com.company.smarttimechecking.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "registered_devices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisteredDevice {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "employee_id", nullable = false, length = 36)
    private String employeeId;

    @Column(name = "device_token", nullable = false, unique = true)
    private String deviceToken;

    @Column(name = "device_name", length = 100)
    private String deviceName;

    @Column(length = 50)
    private String platform;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "ACTIVE"; // "ACTIVE", "REVOKED", "PENDING_APPROVAL"

    @CreationTimestamp
    @Column(name = "enrolled_at", updatable = false)
    private LocalDateTime enrolledAt;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;
}

