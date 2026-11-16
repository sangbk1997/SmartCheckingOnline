package com.company.smarttimechecking.repository;

import com.company.smarttimechecking.domain.entity.PayrollPeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PayrollPeriodRepository extends JpaRepository<PayrollPeriod, String> {
    Optional<PayrollPeriod> findByPeriodCode(String periodCode);
    Optional<PayrollPeriod> findFirstByStatusOrderByStartDateDesc(String status);
}

