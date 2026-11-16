package com.company.smarttimechecking.repository;

import com.company.smarttimechecking.domain.entity.PayrollRetroAdjustment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PayrollRetroAdjustmentRepository extends JpaRepository<PayrollRetroAdjustment, String> {
    List<PayrollRetroAdjustment> findByTargetPeriodIdAndAppliedToTargetTimesheetFalse(String targetPeriodId);
    List<PayrollRetroAdjustment> findByEmployeeIdOrderByCreatedAtDesc(String employeeId);
}

