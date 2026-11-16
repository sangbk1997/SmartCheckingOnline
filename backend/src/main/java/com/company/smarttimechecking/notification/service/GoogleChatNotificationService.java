package com.company.smarttimechecking.notification.service;

import com.company.smarttimechecking.domain.entity.AttendancePunch;
import com.company.smarttimechecking.domain.entity.AttendanceRequest;
import com.company.smarttimechecking.domain.entity.Employee;
import com.company.smarttimechecking.notification.dto.NotificationConfigDto;
import com.company.smarttimechecking.notification.dto.NotificationLogDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentLinkedDeque;

@Service
@Slf4j
@RequiredArgsConstructor
public class GoogleChatNotificationService {

    private final OneClickApprovalService oneClickApprovalService;
    private final Deque<NotificationLogDto> notificationLogs = new ConcurrentLinkedDeque<>();
    private final Deque<Map<String, Object>> recentCards = new ConcurrentLinkedDeque<>();

    @Value("${smarttime.notification.google-chat.enabled:true}")
    private boolean enabled;

    @Value("${smarttime.notification.google-chat.general-webhook-url:}")
    private String generalWebhookUrl;

    @Value("${smarttime.notification.google-chat.alerts-webhook-url:}")
    private String alertsWebhookUrl;

    public void updateConfig(NotificationConfigDto config) {
        if (config.getGoogleChatEnabled() != null) this.enabled = config.getGoogleChatEnabled();
        if (config.getGeneralWebhookUrl() != null) this.generalWebhookUrl = config.getGeneralWebhookUrl();
        if (config.getAlertsWebhookUrl() != null) this.alertsWebhookUrl = config.getAlertsWebhookUrl();
        log.info("Cập nhật cấu hình Google Chat: general={}, alerts={}", this.generalWebhookUrl, this.alertsWebhookUrl);
    }

    public NotificationConfigDto getConfig() {
        return NotificationConfigDto.builder()
                .googleChatEnabled(this.enabled)
                .generalWebhookUrl(this.generalWebhookUrl)
                .alertsWebhookUrl(this.alertsWebhookUrl)
                .build();
    }

    public List<NotificationLogDto> getRecentLogs() {
        return new ArrayList<>(notificationLogs);
    }

    public List<Map<String, Object>> getRecentCards() {
        return new ArrayList<>(recentCards);
    }

    // 1. Gửi Card v2 Đơn mới cần duyệt
    public void sendPendingRequestCard(AttendanceRequest req, Employee emp, Employee approver) {
        String approveUrl = approver != null ? oneClickApprovalService.generateActionUrl(req.getId(), approver.getId(), "APPROVE") : "#";
        String rejectUrl = approver != null ? oneClickApprovalService.generateActionUrl(req.getId(), approver.getId(), "REJECT") : "#";

        Map<String, Object> card = buildCardV2(
                "ĐƠN CẦN PHÊ DUYỆT: " + req.getRequestType(),
                emp.getFullName() + " (" + emp.getEmployeeCode() + ")",
                "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
                List.of(
                        Map.of("key", "Loại đơn", "val", req.getRequestType()),
                        Map.of("key", "Thời gian", "val", req.getFromDate() + " → " + req.getToDate()),
                        Map.of("key", "Lý do", "val", req.getReason()),
                        Map.of("key", "Người duyệt", "val", approver != null ? approver.getFullName() : "N/A")
                ),
                List.of(
                        Map.of("text", "✅ Phê Duyệt", "url", approveUrl, "color", "#10b981"),
                        Map.of("text", "❌ Từ Chối", "url", rejectUrl, "color", "#ef4444")
                )
        );

        dispatchCard(generalWebhookUrl, card, "REQUEST_PENDING", "#chamcong-thongbao-chung");
    }

    // 2. Gửi Thẻ Cảnh báo Đỏ Gian lận GPS vào Space #hr-security-alerts
    public void sendGpsFraudAlertCard(AttendancePunch punch, Employee emp, double distanceMeters) {
        Map<String, Object> card = buildCardV2(
                "🚨 CẢNH BÁO BẢO MẬT: SAI LỆCH VỊ TRÍ GPS",
                emp.getFullName() + " (" + emp.getEmployeeCode() + ")",
                "https://cdn-icons-png.flaticon.com/512/595/595067.png",
                List.of(
                        Map.of("key", "Thời gian chấm", "val", punch.getPunchTime().toString()),
                        Map.of("key", "Khoảng cách lệch", "val", String.format("%.1f mét (Ngưỡng an toàn 100m)", distanceMeters)),
                        Map.of("key", "Lý do khẩn cấp", "val", punch.getRejectionReason() != null ? punch.getRejectionReason() : "N/A"),
                        Map.of("key", "Trạng thái", "val", "ĐÃ GẮN CỜ FLAG_LOCATION_MISMATCH")
                ),
                List.of(
                        Map.of("text", "🔍 Xem Bảng Điều Khiển HR", "url", "http://localhost:3000", "color", "#4f46e5")
                )
        );

        dispatchCard(alertsWebhookUrl, card, "GPS_ALERT", "#hr-security-alerts");
    }

    // 3. Gửi Bản tin Điểm danh Sáng 09:00
    public NotificationLogDto sendDailyAttendanceBulletin(Map<String, Object> stats) {
        int present = stats.get("presentCount") != null ? (int) stats.get("presentCount") : 0;
        int wfh = stats.get("wfhCount") != null ? (int) stats.get("wfhCount") : 0;
        int late = stats.get("lateCount") != null ? (int) stats.get("lateCount") : 0;
        int absent = stats.get("absentCount") != null ? (int) stats.get("absentCount") : 0;
        int total = stats.get("totalEmployees") != null ? (int) stats.get("totalEmployees") : 0;

        Map<String, Object> card = buildCardV2(
                "☀️ BẢN TIN ĐIỂM DANH SÁNG (09:00)",
                "SmartCorp Daily Presence Overview - " + LocalDate.now(),
                "https://cdn-icons-png.flaticon.com/512/869/869869.png",
                List.of(
                        Map.of("key", "Tổng quân số", "val", total + " nhân sự"),
                        Map.of("key", "Có mặt tại văn phòng", "val", "🏢 " + present + " người"),
                        Map.of("key", "Làm việc từ xa (WFH)", "val", "💻 " + wfh + " người"),
                        Map.of("key", "Đi muộn hôm nay", "val", "⏰ " + late + " người"),
                        Map.of("key", "Chưa có mặt", "val", "❓ " + absent + " người")
                ),
                List.of(
                        Map.of("text", "📊 Mở Live Team Dashboard", "url", "http://localhost:3000", "color", "#4f46e5")
                )
        );

        return dispatchCard(generalWebhookUrl, card, "DAILY_BULLETIN", "#chamcong-thongbao-chung");
    }

    // 4. Bắn thử nghiệm Google Chat Card
    public NotificationLogDto sendTestCard() {
        Map<String, Object> card = buildCardV2(
                "🧪 [TEST] KIỂM TRA TÍCH HỢP GOOGLE CHAT",
                "SmartTimeChecking Bot Connected",
                "https://cdn-icons-png.flaticon.com/512/1006/1006771.png",
                List.of(
                        Map.of("key", "Trạng thái", "val", "KẾT NỐI HOẠT ĐỘNG"),
                        Map.of("key", "Thời gian", "val", LocalDateTime.now().toString()),
                        Map.of("key", "Phiên bản", "val", "v1.0.0 Enterprise Phase 2")
                ),
                List.of(
                        Map.of("text", "✅ Thử Nghiệm Nút Phê Duyệt", "url", "http://localhost:3000", "color", "#10b981")
                )
        );

        return dispatchCard(generalWebhookUrl, card, "TEST", "#chamcong-thongbao-chung");
    }

    private Map<String, Object> buildCardV2(String title, String subtitle, String iconUrl,
                                           List<Map<String, String>> fields,
                                           List<Map<String, String>> buttons) {
        Map<String, Object> card = new LinkedHashMap<>();
        card.put("cardId", "card-" + System.currentTimeMillis());

        Map<String, Object> header = new LinkedHashMap<>();
        header.put("title", title);
        header.put("subtitle", subtitle);
        header.put("imageUrl", iconUrl);
        header.put("imageType", "CIRCLE");

        List<Map<String, Object>> widgets = new ArrayList<>();

        StringBuilder textBody = new StringBuilder();
        for (Map<String, String> f : fields) {
            textBody.append("<b>").append(f.get("key")).append(":</b> ").append(f.get("val")).append("<br>");
        }
        widgets.add(Map.of("textParagraph", Map.of("text", textBody.toString())));

        if (buttons != null && !buttons.isEmpty()) {
            List<Map<String, Object>> btnList = new ArrayList<>();
            for (Map<String, String> b : buttons) {
                btnList.add(Map.of(
                        "text", b.get("text"),
                        "onClick", Map.of("openLink", Map.of("url", b.get("url")))
                ));
            }
            widgets.add(Map.of("buttonList", Map.of("buttons", btnList)));
        }

        Map<String, Object> cardContent = new LinkedHashMap<>();
        cardContent.put("header", header);
        cardContent.put("sections", List.of(Map.of("widgets", widgets)));

        card.put("card", cardContent);
        return card;
    }

    private NotificationLogDto dispatchCard(String targetWebhook, Map<String, Object> cardData, String type, String spaceName) {
        String title = "Google Chat Card";
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> cardObj = (Map<String, Object>) cardData.get("card");
            if (cardObj != null && cardObj.get("header") instanceof Map<?, ?> headerMap) {
                Object t = headerMap.get("title");
                if (t != null) title = t.toString();
            }
        } catch (Exception ignored) {}

        NotificationLogDto logDto = NotificationLogDto.builder()
                .id(UUID.randomUUID().toString())
                .timestamp(LocalDateTime.now())
                .channel("GOOGLE_CHAT")
                .type(type)
                .title(title)
                .recipient(spaceName)
                .summary(title)
                .payloadDetails(cardData)
                .build();

        // Lưu vào bộ nhớ recent cards để Frontend simulator hiển thị
        recentCards.addFirst(cardData);
        while (recentCards.size() > 20) {
            recentCards.removeLast();
        }

        if (!enabled) {
            logDto.setStatus("DISABLED");
            recordLog(logDto);
            return logDto;
        }

        if (targetWebhook != null && targetWebhook.startsWith("http")) {
            try {
                Map<String, Object> payload = Map.of("cardsV2", List.of(cardData));
                String jsonStr = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(payload);

                URL url = new URL(targetWebhook);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
                conn.setDoOutput(true);
                conn.setConnectTimeout(5000);
                conn.setReadTimeout(5000);

                try (OutputStream os = conn.getOutputStream()) {
                    os.write(jsonStr.getBytes(StandardCharsets.UTF_8));
                }

                int code = conn.getResponseCode();
                if (code >= 200 && code < 300) {
                    logDto.setStatus("SENT");
                    log.info("Đã gửi Google Chat Card v2 thành công tới webhook: {}", targetWebhook);
                } else {
                    logDto.setStatus("SIMULATED");
                    log.warn("Google Chat Webhook trả về code: {}, chuyển sang SIMULATED", code);
                }
            } catch (Exception ex) {
                log.warn("Không kết nối được Google Chat Webhook ({}), chuyển sang SIMULATED", ex.getMessage());
                logDto.setStatus("SIMULATED");
            }
        } else {
            logDto.setStatus("SIMULATED");
            log.info("[SIMULATED GOOGLE CHAT CARD] Type: {}, Title: {}", type, title);
        }

        recordLog(logDto);
        return logDto;
    }

    private void recordLog(NotificationLogDto logDto) {
        notificationLogs.addFirst(logDto);
        while (notificationLogs.size() > 50) {
            notificationLogs.removeLast();
        }
    }
}
