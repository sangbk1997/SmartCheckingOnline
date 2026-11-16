package com.company.smarttimechecking.controller;

import com.company.smarttimechecking.domain.entity.AttendanceRequest;
import com.company.smarttimechecking.dto.ApiResponse;
import com.company.smarttimechecking.dto.ApprovalDto;
import com.company.smarttimechecking.dto.AttendanceRequestDetailDto;
import com.company.smarttimechecking.dto.CreateRequestDto;
import com.company.smarttimechecking.dto.QuotaStatusDto;
import com.company.smarttimechecking.security.UserPrincipal;
import com.company.smarttimechecking.service.RequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/requests")
@RequiredArgsConstructor
public class RequestController {

    private final RequestService requestService;

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<AttendanceRequestDetailDto>>> getPendingRequests(
            @AuthenticationPrincipal UserPrincipal reviewer) {
        List<AttendanceRequestDetailDto> requests = requestService.getPendingRequestsForReviewer(reviewer);
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách đơn chờ duyệt thành công", requests));
    }

    @GetMapping("/quotas/remaining")
    public ResponseEntity<ApiResponse<QuotaStatusDto>> getQuotas(@AuthenticationPrincipal UserPrincipal user) {
        QuotaStatusDto quotas = requestService.getRemainingQuotas(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Lấy thông tin hạn ngạch thành công", quotas));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AttendanceRequest>> createRequest(
            @AuthenticationPrincipal UserPrincipal user,
            @Valid @RequestBody CreateRequestDto dto) {

        AttendanceRequest request = requestService.createRequest(user, dto);
        return ResponseEntity.ok(ApiResponse.ok("Tạo đơn thành công", request));
    }

    @GetMapping("/my-requests")
    public ResponseEntity<ApiResponse<List<AttendanceRequest>>> getMyRequests(@AuthenticationPrincipal UserPrincipal user) {
        List<AttendanceRequest> requests = requestService.getMyRequests(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách đơn của bạn thành công", requests));
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<ApiResponse<AttendanceRequest>> reviewRequest(
            @AuthenticationPrincipal UserPrincipal reviewer,
            @PathVariable("id") String requestId,
            @Valid @RequestBody ApprovalDto dto) {

        AttendanceRequest request = requestService.reviewRequest(reviewer, requestId, dto);
        String actionDesc = "APPROVE".equalsIgnoreCase(dto.getAction()) ? "Phê duyệt" : "Từ chối";
        return ResponseEntity.ok(ApiResponse.ok(actionDesc + " đơn thành công", request));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<AttendanceRequest>> approveRequest(
            @AuthenticationPrincipal UserPrincipal reviewer,
            @PathVariable("id") String requestId,
            @RequestParam(value = "comment", defaultValue = "Phê duyệt thành công") String comment) {

        ApprovalDto dto = new ApprovalDto();
        dto.setAction("APPROVE");
        dto.setComment(comment);
        AttendanceRequest request = requestService.reviewRequest(reviewer, requestId, dto);
        return ResponseEntity.ok(ApiResponse.ok("Phê duyệt đơn thành công", request));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<AttendanceRequest>> rejectRequest(
            @AuthenticationPrincipal UserPrincipal reviewer,
            @PathVariable("id") String requestId,
            @RequestParam(value = "comment", defaultValue = "Từ chối đơn") String comment) {

        ApprovalDto dto = new ApprovalDto();
        dto.setAction("REJECT");
        dto.setComment(comment);
        AttendanceRequest request = requestService.reviewRequest(reviewer, requestId, dto);
        return ResponseEntity.ok(ApiResponse.ok("Từ chối đơn thành công", request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> cancelRequest(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable("id") String requestId) {

        requestService.cancelRequest(user, requestId);
        return ResponseEntity.ok(ApiResponse.ok("Hủy đơn thành công", null));
    }
}

