package com.company.smarttimechecking.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "request_approvals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequestApproval {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "request_id", nullable = false, length = 36)
    private String requestId;

    @Column(name = "step_order", nullable = false)
    @Builder.Default
    private Integer stepOrder = 1;

    @Column(name = "approver_id", nullable = false, length = 36)
    private String approverId;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String action = "PENDING"; // "PENDING", "APPROVED", "REJECTED"

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "action_time")
    private LocalDateTime actionTime;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

