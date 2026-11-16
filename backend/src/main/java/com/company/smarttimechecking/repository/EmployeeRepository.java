package com.company.smarttimechecking.repository;

import com.company.smarttimechecking.domain.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, String> {
    Optional<Employee> findByEmail(String email);
    Optional<Employee> findByEmployeeCode(String employeeCode);
    Optional<Employee> findByKeycloakUserId(String keycloakUserId);
    List<Employee> findByDirectManagerId(String directManagerId);
    List<Employee> findByDepartmentId(String departmentId);
}

