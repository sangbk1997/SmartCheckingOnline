package com.company.smarttimechecking.repository;

import com.company.smarttimechecking.domain.entity.RequestApproval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequestApprovalRepository extends JpaRepository<RequestApproval, String> {
    List<RequestApproval> findByApproverIdAndActionOrderByCreatedAtDesc(String approverId, String action);
    List<RequestApproval> findByRequestIdOrderByStepOrderAsc(String requestId);
}

