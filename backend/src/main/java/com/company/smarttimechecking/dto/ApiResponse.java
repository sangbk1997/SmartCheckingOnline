package com.company.smarttimechecking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String code;
    private String message;
    private String hrGuide; // Hướng dẫn chi tiết cho HR / IT Admin để khắc phục sự cố
    private T data;
    @Builder.Default
    private Instant timestamp = Instant.now();

    public static <T> ApiResponse<T> ok(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .code("SUCCESS")
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> ok(T data) {
        return ok("Thao tác thành công", data);
    }

    public static <T> ApiResponse<T> error(String code, String message, String hrGuide) {
        return ApiResponse.<T>builder()
                .success(false)
                .code(code)
                .message(message)
                .hrGuide(hrGuide)
                .data(null)
                .build();
    }

    public static <T> ApiResponse<T> error(String code, String message) {
        return error(code, message, null);
    }
}
