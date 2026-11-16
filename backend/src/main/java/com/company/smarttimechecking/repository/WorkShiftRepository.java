package com.company.smarttimechecking.repository;

import com.company.smarttimechecking.domain.entity.WorkShift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WorkShiftRepository extends JpaRepository<WorkShift, String> {
    Optional<WorkShift> findByShiftCode(String shiftCode);
}

