package com.company.smarttimechecking.controller;

import com.company.smarttimechecking.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    private static final Map<String, String> HR_GUIDES = Map.of(
        "ERR_DEVICE_MISMATCH", "HR/IT kiểm tra xem nhân viên có đổi điện thoại mới không. Vào mục 'Quản lý Thiết bị', chọn nhân viên và bấm 'Duyệt cấp thiết bị mới' để kích hoạt máy mới.",
        "ERR_INVALID_NETWORK", "1. Nhắc nhân viên kết nối đúng Wi-Fi văn phòng. 2. Nếu nhân viên làm việc tại nhà, kiểm tra xem đã có 'Đơn WFH' được Trưởng nhóm duyệt trong ngày chưa. 3. Nếu công ty mới đổi nhà mạng, IT cần cập nhật IP Public mới.",
        "ERR_QR_EXPIRED", "Mã Dynamic QR tự động xoay 5 giây/lần và bị vô hiệu hóa ngay sau 1 lần quét để chống gian lận. Nhắc nhân viên quét trực tiếp từ màn hình Kiosk.",
        "ERR_INVALID_QR", "Kiểm tra camera quét có bị mờ hoặc có can thiệp payload. Khởi động lại màn hình Kiosk nếu mã hiển thị sai định dạng.",
        "ERR_QUOTA_EXCEEDED", "Quy chế công ty giới hạn: Đi muộn tối đa 2 lần/tháng (tối đa 60 phút/lần), WFH tối đa 4 ngày/tháng. Nếu có trường hợp đặc biệt, HR cần xin ý kiến phê duyệt ngoại lệ từ Giám đốc Khối.",
        "ERR_DEADLINE_EXCEEDED", "Quy chế quy định đơn bổ sung công phải nộp trong 3 ngày làm việc kể từ ngày quên. Nếu có sự cố bất khả kháng, HR có thể xem xét hỗ trợ.",
        "ERR_ATTACHMENT_REQUIRED", "Để phục vụ thanh quyết toán bảo hiểm, đơn nghỉ ốm/thai sản bắt buộc phải có Giấy khám bệnh hoặc Giấy nghỉ việc hưởng BHXH mẫu C65-HD đính kèm.",
        "ERR_DISPUTE_EXPIRED", "Thời hạn khiếu nại công là 48 giờ sau khi kỳ công kết thúc. Bảng công đã bị khóa bất biến để chuyển Kế toán tính lương. Mọi điều chỉnh phát sinh sau này sẽ tự động chuyển hồi tố vào kỳ sau."
    );

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException e) {
        String msg = e.getMessage();
        String code = "BAD_REQUEST";
        if (msg.contains(":")) {
            code = msg.split(":")[0].trim();
            msg = msg.substring(msg.indexOf(":") + 1).trim();
        }
        String hrGuide = HR_GUIDES.getOrDefault(code, "HR liên hệ bộ phận IT để kiểm tra log chi tiết trong bảng system_audit_logs.");

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(code, msg, hrGuide));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("FORBIDDEN", 
                        "Bạn không có quyền thực hiện hành động này. Vui lòng liên hệ Quản lý hoặc HR để được cấp quyền.",
                        "HR vào mục Quản trị Phân quyền (app_role) của nhân viên này để nâng cấp quyền lên MANAGER hoặc HR_ADMIN nếu cần."));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidation(MethodArgumentNotValidException e) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError fieldError : e.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                .success(false)
                .code("VALIDATION_ERROR")
                .message("Dữ liệu gửi lên không đúng định dạng hoặc thiếu trường bắt buộc!")
                .hrGuide("Kiểm tra lại định dạng JSON request và các trường @NotNull, @NotBlank được gửi từ client.")
                .data(errors)
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception e) {
        log.error("Unhandled error: ", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("INTERNAL_SERVER_ERROR", 
                        "Đã xảy ra lỗi hệ thống: " + e.getMessage(),
                        "IT kiểm tra trạng thái kết nối MySQL, Redis, RabbitMQ và kiểm tra log chi tiết trong server log."));
    }
}
