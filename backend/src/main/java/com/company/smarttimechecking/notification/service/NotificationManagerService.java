package com.company.smarttimechecking.notification.service;

import com.company.smarttimechecking.domain.entity.AttendancePunch;
import com.company.smarttimechecking.domain.entity.AttendanceRequest;
import com.company.smarttimechecking.domain.entity.Employee;
import com.company.smarttimechecking.notification.dto.NotificationConfigDto;
import com.company.smarttimechecking.notification.dto.NotificationLogDto;
import com.company.smarttimechecking.notification.event.GpsMismatchEvent;
import com.company.smarttimechecking.notification.event.RequestCreatedEvent;
import com.company.smarttimechecking.notification.event.RequestReviewedEvent;
import com.company.smarttimechecking.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationManagerService {

    private final GmailNotificationService gmailService;
    private final GoogleChatNotificationService chatService;
    private final EmployeeRepository employeeRepository;

    @Async
    @EventListener
    public void handleRequestCreated(RequestCreatedEvent event) {
        notifyNewRequest(event.request(), event.employee());
    }

    @Async
    @EventListener
    public void handleRequestReviewed(RequestReviewedEvent event) {
        notifyRequestReviewed(event.request(), event.reviewer(), event.action(), event.comment());
    }

    @Async
    @EventListener
    public void handleGpsMismatch(GpsMismatchEvent event) {
        notifyGpsMismatch(event.punch(), event.employee(), event.distanceMeters());
    }

    @Async
    public void notifyNewRequest(AttendanceRequest req, Employee emp) {
        try {
            Employee approver = null;
            if (emp.getDirectManagerId() != null) {
                approver = employeeRepository.findById(emp.getDirectManagerId()).orElse(null);
            }
            if (approver == null) {
                approver = employeeRepository.findByEmail("lead@congty.com").orElse(null);
            }

            log.info("Bắn thông báo đơn mới ({}) tới Quản lý: {}", req.getRequestType(), approver != null ? approver.getEmail() : "N/A");
            gmailService.sendPendingRequestEmail(req, emp, approver);
            chatService.sendPendingRequestCard(req, emp, approver);

        } catch (Exception ex) {
            log.error("Lỗi bắn thông báo đơn mới: ", ex);
        }
    }

    @Async
    public void notifyRequestReviewed(AttendanceRequest req, Employee reviewer, String action, String comment) {
        try {
            Employee emp = employeeRepository.findById(req.getEmployeeId()).orElse(null);
            if (emp != null) {
                gmailService.sendRequestResultEmail(req, emp, action, comment);
            }
        } catch (Exception ex) {
            log.error("Lỗi bắn thông báo kết quả duyệt đơn: ", ex);
        }
    }

    @Async
    public void notifyGpsMismatch(AttendancePunch punch, Employee emp, double distanceMeters) {
        try {
            String hrEmail = "hr@congty.com";
            gmailService.sendGpsFraudAlertEmail(punch, emp, distanceMeters, hrEmail);
            chatService.sendGpsFraudAlertCard(punch, emp, distanceMeters);
        } catch (Exception ex) {
            log.error("Lỗi bắn cảnh báo GPS: ", ex);
        }
    }

    public NotificationLogDto triggerDailyBulletin(Map<String, Object> stats) {
        return chatService.sendDailyAttendanceBulletin(stats);
    }

    public NotificationLogDto sendTestEmail(String toEmail) {
        return gmailService.sendTestEmail(toEmail);
    }

    public NotificationLogDto sendTestGoogleChat() {
        return chatService.sendTestCard();
    }

    public NotificationConfigDto getFullConfig() {
        NotificationConfigDto gmailCfg = gmailService.getConfig();
        NotificationConfigDto chatCfg = chatService.getConfig();

        return NotificationConfigDto.builder()
                .gmailEnabled(gmailCfg.getGmailEnabled())
                .gmailHost(gmailCfg.getGmailHost())
                .gmailPort(gmailCfg.getGmailPort())
                .gmailUsername(gmailCfg.getGmailUsername())
                .gmailAppPassword(gmailCfg.getGmailAppPassword())
                .senderName(gmailCfg.getSenderName())
                .googleChatEnabled(chatCfg.getGoogleChatEnabled())
                .generalWebhookUrl(chatCfg.getGeneralWebhookUrl())
                .alertsWebhookUrl(chatCfg.getAlertsWebhookUrl())
                .build();
    }

    public void updateFullConfig(NotificationConfigDto config) {
        gmailService.updateConfig(config);
        chatService.updateConfig(config);
    }

    public List<NotificationLogDto> getAllRecentLogs() {
        List<NotificationLogDto> combined = new ArrayList<>();
        combined.addAll(gmailService.getRecentLogs());
        combined.addAll(chatService.getRecentLogs());
        combined.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
        return combined;
    }

    public List<Map<String, Object>> getRecentChatCards() {
        return chatService.getRecentCards();
    }
}
