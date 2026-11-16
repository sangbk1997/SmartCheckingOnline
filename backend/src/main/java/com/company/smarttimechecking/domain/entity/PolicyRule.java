package com.company.smarttimechecking.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "policy_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PolicyRule {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "rule_category", nullable = false, length = 50)
    private String ruleCategory; // "LATE_EARLY", "MISSED_PUNCH", "WFH", "ANNUAL_LEAVE"

    @Column(name = "target_type", nullable = false, length = 30)
    @Builder.Default
    private String targetType = "CONTRACT_TYPE"; // "ALL", "DEPARTMENT", "CONTRACT_TYPE"

    @Column(name = "target_value", nullable = false, length = 100)
    private String targetValue; // "OFFICIAL", "PROBATION", "IT_DEPT"

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(columnDefinition = "JSON", nullable = false)
    private String parameters;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

