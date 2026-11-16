package com.company.smarttimechecking.repository;

import com.company.smarttimechecking.domain.entity.TimesheetDispute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimesheetDisputeRepository extends JpaRepository<TimesheetDispute, String> {
    List<TimesheetDispute> findByPayrollPeriodId(String payrollPeriodId);
    List<TimesheetDispute> findByEmployeeIdOrderByCreatedAtDesc(String employeeId);
}

