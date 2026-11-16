package com.company.smarttimechecking.notification.service;

import com.company.smarttimechecking.domain.entity.AttendanceRequest;
import com.company.smarttimechecking.domain.entity.Employee;
import com.company.smarttimechecking.dto.ApprovalDto;
import com.company.smarttimechecking.repository.EmployeeRepository;
import com.company.smarttimechecking.security.UserPrincipal;
import com.company.smarttimechecking.service.RequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;

@Service
@Slf4j
@RequiredArgsConstructor
public class OneClickApprovalService {

    private final RequestService requestService;
    private final EmployeeRepository employeeRepository;
    private final StringRedisTemplate redisTemplate;

    @Value("${smarttime.notification.one-click-approval.base-url:http://localhost:8085}")
    private String baseUrl;

    @Value("${smarttime.notification.one-click-approval.secret-key:SmartCorpSecureOneClickSecretKey2026MustBeLongEnough!}")
    private String secretKey;

    public String generateActionUrl(String requestId, String approverId, String action) {
        long expiresAt = System.currentTimeMillis() + 86400000L; // 24 giờ
        String rawData = requestId + ":" + approverId + ":" + action + ":" + expiresAt;
        String signature = sign(rawData);

        String token = Base64.getUrlEncoder().withoutPadding()
                .encodeToString((rawData + ":" + signature).getBytes(StandardCharsets.UTF_8));

        String endpoint = "APPROVE".equalsIgnoreCase(action) ? "quick-approve" : "quick-reject";
        return baseUrl + "/api/v1/actions/" + endpoint + "?token=" + token;
    }

    public ApprovalResult processAction(String token, String requestedAction, String comment) {
        try {
            byte[] decoded = Base64.getUrlDecoder().decode(token);
            String payload = new String(decoded, StandardCharsets.UTF_8);
            String[] parts = payload.split(":");

            if (parts.length != 5) {
                return ApprovalResult.failed("ERR_INVALID_TOKEN", "Mã xác thực không đúng định dạng!");
            }

            String requestId = parts[0];
            String approverId = parts[1];
            String action = parts[2];
            long expiresAt = Long.parseLong(parts[3]);
            String signature = parts[4];

            // 1. Kiểm tra chữ ký HMAC
            String rawData = requestId + ":" + approverId + ":" + action + ":" + expiresAt;
            if (!sign(rawData).equals(signature)) {
                return ApprovalResult.failed("ERR_INVALID_SIGNATURE", "Chữ ký xác thực bị sai hoặc đã bị can thiệp!");
            }

            // 2. Kiểm tra hạn sử dụng 24h
            if (System.currentTimeMillis() > expiresAt) {
                return ApprovalResult.failed("ERR_TOKEN_EXPIRED", "Liên kết phê duyệt này đã hết hạn (quá 24 giờ)!");
            }

            // 3. Kiểm tra Single-use qua Redis
            String redisKey = "ONE_CLICK_USED:" + signature;
            Boolean alreadyUsed = redisTemplate.hasKey(redisKey);
            if (Boolean.TRUE.equals(alreadyUsed)) {
                return ApprovalResult.failed("ERR_ALREADY_USED", "Liên kết này đã được sử dụng trước đó!");
            }

            // 4. Tìm approver và thực thi review
            Employee approver = employeeRepository.findById(approverId)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin Quản lý duyệt!"));

            UserPrincipal reviewerPrincipal = UserPrincipal.fromEmployee(approver);
            ApprovalDto dto = new ApprovalDto();
            dto.setAction(action);
            dto.setComment(comment != null ? comment : "Phê duyệt 1 chạm qua Email / Chat");

            AttendanceRequest reviewed = requestService.reviewRequest(reviewerPrincipal, requestId, dto);

            // Đánh dấu token đã sử dụng trong 48 giờ
            redisTemplate.opsForValue().set(redisKey, "USED", Duration.ofHours(48));

            String actionDesc = "APPROVE".equalsIgnoreCase(action) ? "PHÊ DUYỆT" : "TỪ CHỐI";
            return ApprovalResult.success(reviewed, actionDesc, approver.getFullName());

        } catch (Exception ex) {
            log.error("Lỗi xử lý One-Click Action: ", ex);
            return ApprovalResult.failed("EXECUTION_ERROR", ex.getMessage());
        }
    }

    private String sign(String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            hmac.init(secretKeySpec);
            byte[] hash = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi sinh chữ ký HMAC", e);
        }
    }

    public record ApprovalResult(boolean success, String code, String message, AttendanceRequest request, String approverName) {
        public static ApprovalResult success(AttendanceRequest req, String actionDesc, String approverName) {
            return new ApprovalResult(true, "SUCCESS", "Đã " + actionDesc + " đơn thành công!", req, approverName);
        }
        public static ApprovalResult failed(String code, String message) {
            return new ApprovalResult(false, code, message, null, null);
        }
    }
}

