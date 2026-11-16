package com.company.smarttimechecking.notification.controller;

import com.company.smarttimechecking.dto.ApiResponse;
import com.company.smarttimechecking.notification.dto.NotificationConfigDto;
import com.company.smarttimechecking.notification.dto.NotificationLogDto;
import com.company.smarttimechecking.notification.service.NotificationManagerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/notifications")
@RequiredArgsConstructor
public class NotificationAdminController {

    private final NotificationManagerService notificationService;
    private final com.company.smarttimechecking.controller.AttendanceController attendanceController;

    @GetMapping("/config")
    public ResponseEntity<ApiResponse<NotificationConfigDto>> getConfig() {
        return ResponseEntity.ok(ApiResponse.ok("Lấy cấu hình thông báo thành công", notificationService.getFullConfig()));
    }

    @PostMapping("/config")
    public ResponseEntity<ApiResponse<NotificationConfigDto>> updateConfig(@RequestBody NotificationConfigDto dto) {
        notificationService.updateFullConfig(dto);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật cấu hình Google Workspace thành công", notificationService.getFullConfig()));
    }

    @PostMapping("/test-email")
    public ResponseEntity<ApiResponse<NotificationLogDto>> sendTestEmail(@RequestParam(value = "toEmail", defaultValue = "test@congty.com") String toEmail) {
        NotificationLogDto result = notificationService.sendTestEmail(toEmail);
        return ResponseEntity.ok(ApiResponse.ok("Đã gửi email thử nghiệm thành công", result));
    }

    @PostMapping("/test-chat")
    public ResponseEntity<ApiResponse<NotificationLogDto>> sendTestChat() {
        NotificationLogDto result = notificationService.sendTestGoogleChat();
        return ResponseEntity.ok(ApiResponse.ok("Đã bắn thẻ Google Chat Card v2 thử nghiệm thành công", result));
    }

    @PostMapping("/daily-bulletin")
    public ResponseEntity<ApiResponse<NotificationLogDto>> triggerDailyBulletin() {
        var dashResponse = attendanceController.getLiveDashboard();
        Map<String, Object> stats = dashResponse.getBody() != null ? dashResponse.getBody().getData() : Map.of();
        NotificationLogDto result = notificationService.triggerDailyBulletin(stats);
        return ResponseEntity.ok(ApiResponse.ok("Đã phát bản tin điểm danh sáng 09:00 tới Google Chat thành công", result));
    }

    @GetMapping("/logs")
    public ResponseEntity<ApiResponse<List<NotificationLogDto>>> getLogs() {
        return ResponseEntity.ok(ApiResponse.ok("Lấy nhật ký thông báo thành công", notificationService.getAllRecentLogs()));
    }

    @GetMapping("/recent-chat-cards")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRecentChatCards() {
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách thẻ Google Chat gần đây thành công", notificationService.getRecentChatCards()));
    }
}

