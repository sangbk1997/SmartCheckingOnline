package com.company.smarttimechecking.repository;

import com.company.smarttimechecking.domain.entity.EmployeeLeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeLeaveBalanceRepository extends JpaRepository<EmployeeLeaveBalance, String> {
    Optional<EmployeeLeaveBalance> findByEmployeeIdAndLeaveYear(String employeeId, Integer leaveYear);
    void deleteByEmployeeId(String employeeId);
}
