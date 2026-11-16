package com.company.smarttimechecking.repository;

import com.company.smarttimechecking.domain.entity.MonthlyTimesheet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MonthlyTimesheetRepository extends JpaRepository<MonthlyTimesheet, String> {
    Optional<MonthlyTimesheet> findByPayrollPeriodIdAndEmployeeId(String payrollPeriodId, String employeeId);
    List<MonthlyTimesheet> findByPayrollPeriodId(String payrollPeriodId);
}

