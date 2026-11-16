package com.company.smarttimechecking.repository;

import com.company.smarttimechecking.domain.entity.RegisteredDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegisteredDeviceRepository extends JpaRepository<RegisteredDevice, String> {
    Optional<RegisteredDevice> findByDeviceToken(String deviceToken);
    List<RegisteredDevice> findByEmployeeIdAndStatusOrderByLastUsedAtDesc(String employeeId, String status);
    List<RegisteredDevice> findByEmployeeId(String employeeId);
    List<RegisteredDevice> findByStatus(String status);
}

