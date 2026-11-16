package com.company.smarttimechecking.repository;

import com.company.smarttimechecking.domain.entity.AttendanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRequestRepository extends JpaRepository<AttendanceRequest, String> {
    Optional<AttendanceRequest> findByRequestCode(String requestCode);
    List<AttendanceRequest> findByEmployeeIdOrderByCreatedAtDesc(String employeeId);
    List<AttendanceRequest> findByStatusOrderByCreatedAtDesc(String status);
    List<AttendanceRequest> findByEmployeeIdInAndStatusOrderByCreatedAtDesc(List<String> employeeIds, String status);

    // Tìm đơn WFH hợp lệ trong ngày của nhân viên
    @Query("SELECT r FROM AttendanceRequest r WHERE r.employeeId = :employeeId " +
           "AND r.requestType = 'WFH' AND r.status = 'APPROVED' " +
           "AND :targetDate BETWEEN r.fromDate AND r.toDate")
    List<AttendanceRequest> findApprovedWfhRequests(
            @Param("employeeId") String employeeId, 
            @Param("targetDate") LocalDate targetDate);

    // Đếm số đơn đã dùng trong tháng theo loại để kiểm tra quota
    @Query("SELECT COUNT(r) FROM AttendanceRequest r WHERE r.employeeId = :employeeId " +
           "AND r.requestType = :requestType AND r.status != 'REJECTED' AND r.status != 'CANCELLED' " +
           "AND r.fromDate BETWEEN :startDate AND :endDate")
    long countRequestsInPeriod(
            @Param("employeeId") String employeeId,
            @Param("requestType") String requestType,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}

