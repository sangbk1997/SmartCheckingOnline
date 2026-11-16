package com.company.smarttimechecking.repository;

import com.company.smarttimechecking.domain.entity.AttendancePunch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AttendancePunchRepository extends JpaRepository<AttendancePunch, String> {
    List<AttendancePunch> findByEmployeeIdAndPunchTimeBetweenOrderByPunchTimeAsc(
            String employeeId, LocalDateTime start, LocalDateTime end);

    List<AttendancePunch> findByStatusOrderByPunchTimeDesc(String status);
}

