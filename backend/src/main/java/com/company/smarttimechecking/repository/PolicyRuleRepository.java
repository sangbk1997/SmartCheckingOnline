package com.company.smarttimechecking.repository;

import com.company.smarttimechecking.domain.entity.PolicyRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface PolicyRuleRepository extends JpaRepository<PolicyRule, String> {

    @Query("SELECT p FROM PolicyRule p WHERE p.ruleCategory = :category " +
           "AND p.targetValue = :targetValue " +
           "AND p.effectiveFrom <= :checkDate " +
           "AND (p.effectiveTo IS NULL OR p.effectiveTo >= :checkDate) " +
           "ORDER BY p.effectiveFrom DESC LIMIT 1")
    Optional<PolicyRule> findEffectiveRule(
            @Param("category") String category,
            @Param("targetValue") String targetValue,
            @Param("checkDate") LocalDate checkDate);
}

