package com.company.smarttimechecking.notification.service;

import com.company.smarttimechecking.domain.entity.AttendancePunch;
import com.company.smarttimechecking.domain.entity.AttendanceRequest;
import com.company.smarttimechecking.domain.entity.Employee;
import com.company.smarttimechecking.domain.entity.PayrollPeriod;
import com.company.smarttimechecking.notification.dto.NotificationConfigDto;
import com.company.smarttimechecking.notification.dto.NotificationLogDto;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentLinkedDeque;

@Service
@Slf4j
@RequiredArgsConstructor
public class GmailNotificationService {

    private final OneClickApprovalService oneClickApprovalService;
    private final Deque<NotificationLogDto> notificationLogs = new ConcurrentLinkedDeque<>();

    @Value("${smarttime.notification.gmail.enabled:true}")
    private boolean enabled;

    @Value("${smarttime.notification.gmail.host:smtp.gmail.com}")
    private String smtpHost;

    @Value("${smarttime.notification.gmail.port:587}")
    private int smtpPort;

    @Value("${smarttime.notification.gmail.username:notification@smartcorp.com}")
    private String username;

    @Value("${smarttime.notification.gmail.password:}")
    private String password;

    @Value("${smarttime.notification.gmail.sender-name:SmartCorp HR Portal}")
    private String senderName;

    public void updateConfig(NotificationConfigDto config) {
        if (config.getGmailEnabled() != null) this.enabled = config.getGmailEnabled();
        if (config.getGmailHost() != null) this.smtpHost = config.getGmailHost();
        if (config.getGmailPort() != null) this.smtpPort = config.getGmailPort();
        if (config.getGmailUsername() != null) this.username = config.getGmailUsername();
        if (config.getGmailAppPassword() != null) this.password = config.getGmailAppPassword();
        if (config.getSenderName() != null) this.senderName = config.getSenderName();
        log.info("Cập nhật cấu hình Gmail: user={}, host={}", this.username, this.smtpHost);
    }

    public NotificationConfigDto getConfig() {
        return NotificationConfigDto.builder()
                .gmailEnabled(this.enabled)
                .gmailHost(this.smtpHost)
                .gmailPort(this.smtpPort)
                .gmailUsername(this.username)
                .gmailAppPassword(this.password != null && !this.password.isBlank() ? "********" : "")
                .senderName(this.senderName)
                .build();
    }

    public List<NotificationLogDto> getRecentLogs() {
        return new ArrayList<>(notificationLogs);
    }

    // 1. Gửi email thông báo đơn mới cần sếp duyệt (Actionable Email có 2 nút bấm)
    public void sendPendingRequestEmail(AttendanceRequest req, Employee emp, Employee approver) {
        if (approver == null || approver.getEmail() == null) return;

        String approveUrl = oneClickApprovalService.generateActionUrl(req.getId(), approver.getId(), "APPROVE");
        String rejectUrl = oneClickApprovalService.generateActionUrl(req.getId(), approver.getId(), "REJECT");

        String subject = "[SmartCorp HR] Yêu cầu phê duyệt đơn: " + req.getRequestType() + " - " + emp.getFullName();
        String html = """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; margin: 0; padding: 24px; }
                .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
                .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 24px; color: #ffffff; }
                .body { padding: 24px; }
                .btn { display: inline-block; padding: 12px 24px; border-radius: 10px; font-weight: bold; text-decoration: none; font-size: 14px; margin-right: 12px; }
                .btn-approve { background: #10b981; color: #ffffff; }
                .btn-reject { background: #ef4444; color: #ffffff; }
                .footer { padding: 16px 24px; background: #f1f5f9; font-size: 12px; color: #64748b; text-align: center; }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="header">
                  <h2 style="margin: 0; font-size: 20px;">Thông Báo Đơn Từ Cần Phê Duyệt</h2>
                  <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 13px;">Hệ thống Chấm công & Quản trị Nhân sự SmartCorp</p>
                </div>
                <div class="body">
                  <p>Kính gửi <strong>%s</strong>,</p>
                  <p>Nhân viên cấp dưới của bạn vừa nộp một đơn từ trên hệ thống:</p>
                  <table style="width: 100%%; margin: 16px 0; border-collapse: collapse; font-size: 14px;">
                    <tr><td style="padding: 8px 0; color: #64748b;">Nhân viên:</td><td><strong>%s</strong> (%s)</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Loại đơn:</td><td><strong style="color: #4f46e5;">%s</strong></td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Thời gian:</td><td>%s đến %s</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Lý do:</td><td><i>"%s"</i></td></tr>
                  </table>
                  <div style="margin-top: 24px; text-align: center;">
                    <a href="%s" class="btn btn-approve">✅ Phê Duyệt Nhanh (1 Chạm)</a>
                    <a href="%s" class="btn btn-reject">❌ Từ Chối</a>
                  </div>
                  <p style="font-size: 12px; color: #94a3b8; margin-top: 20px; text-align: center;">*Liên kết phê duyệt 1 chạm có hiệu lực trong 24 giờ và chỉ sử dụng 01 lần duy nhất.</p>
                </div>
                <div class="footer">
                  SmartCorp Enterprise HR Automation • Cổng thông tin nhân sự nội bộ
                </div>
              </div>
            </body>
            </html>
            """.formatted(approver.getFullName(), emp.getFullName(), emp.getEmployeeCode(),
                req.getRequestType(), req.getFromDate(), req.getToDate(), req.getReason(),
                approveUrl, rejectUrl);

        dispatchEmail(approver.getEmail(), subject, html, "REQUEST_PENDING", approveUrl);
    }

    // 2. Gửi email thông báo kết quả phê duyệt cho nhân viên
    public void sendRequestResultEmail(AttendanceRequest req, Employee emp, String action, String comment) {
        if (emp == null || emp.getEmail() == null) return;

        boolean isApproved = "APPROVE".equalsIgnoreCase(action);
        String subject = "[SmartCorp HR] Kết quả duyệt đơn: " + req.getRequestType() + " - " + (isApproved ? "ĐÃ DUYỆT" : "TỪ CHỐI");
        String html = """
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background: #f8fafc;">
              <div style="max-width: 550px; margin: 0 auto; background: #fff; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0;">
                <h3 style="color: %s; margin-top: 0;">%s ĐƠN: %s</h3>
                <p>Chào <strong>%s</strong>,</p>
                <p>Đơn <strong>%s</strong> (từ ngày %s đến %s) của bạn đã được Quản lý xử lý:</p>
                <div style="background: #f1f5f9; padding: 12px; border-radius: 8px; margin: 12px 0;">
                  <strong>Trạng thái:</strong> %s<br>
                  <strong>Ý kiến người duyệt:</strong> <i>"%s"</i>
                </div>
                <p style="font-size: 12px; color: #64748b;">Dữ liệu đã tự động được đồng bộ vào bảng công tháng của bạn.</p>
              </div>
            </body>
            </html>
            """.formatted(isApproved ? "#10b981" : "#ef4444",
                isApproved ? "✅ ĐÃ PHÊ DUYỆT" : "❌ TỪ CHỐI",
                req.getRequestType(), emp.getFullName(), req.getRequestType(),
                req.getFromDate(), req.getToDate(),
                isApproved ? "CHẤP THUẬN" : "TỪ CHỐI",
                comment != null ? comment : "Đã xử lý");

        dispatchEmail(emp.getEmail(), subject, html, "REQUEST_RESULT", null);
    }

    // 3. Gửi email cảnh báo đỏ gian lận GPS
    public void sendGpsFraudAlertEmail(AttendancePunch punch, Employee emp, double distanceMeters, String hrEmail) {
        String subject = "🚨 [CẢNH BÁO BẢO MẬT] Chấm công khẩn cấp sai lệch GPS > 100m - " + emp.getFullName();
        String html = """
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background: #fef2f2;">
              <div style="max-width: 550px; margin: 0 auto; background: #fff; padding: 24px; border-radius: 12px; border: 2px solid #ef4444;">
                <h3 style="color: #b91c1c; margin-top: 0;">🚨 PHÁT HIỆN SAI LỆCH VỊ TRÍ CHẤM CÔNG GPS</h3>
                <p>Kính gửi Phòng Nhân sự & Ban Giám Đốc,</p>
                <p>Hệ thống phát hiện một yêu cầu chấm công khẩn cấp có tọa độ cách xa tòa nhà văn phòng:</p>
                <ul>
                  <li><strong>Nhân viên:</strong> %s (%s)</li>
                  <li><strong>Thời gian:</strong> %s</li>
                  <li><strong>Khoảng cách so với văn phòng:</strong> <strong style="color: #b91c1c;">%.1f mét</strong> (Vượt ngưỡng 100m)</li>
                  <li><strong>Lý do gửi lên:</strong> %s</li>
                </ul>
                <p style="color: #b91c1c; font-weight: bold;">Yêu cầu HR rà soát kỹ trước khi phê duyệt bù công.</p>
              </div>
            </body>
            </html>
            """.formatted(emp.getFullName(), emp.getEmployeeCode(), punch.getPunchTime(),
                distanceMeters, punch.getRejectionReason());

        dispatchEmail(hrEmail, subject, html, "GPS_ALERT", null);
    }

    // 4. Gửi email thử nghiệm
    public NotificationLogDto sendTestEmail(String toEmail) {
        String subject = "🧪 [TEST] Kiểm tra tích hợp Gmail SmartTimeChecking";
        String html = """
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2 style="color: #4f46e5;">Thử Nghiệm Kết Nối Gmail Thành Công!</h2>
              <p>Hệ thống SmartTimeChecking đã kết nối thành công với máy chủ gửi thư Gmail.</p>
              <p>Thời gian gửi: <strong>%s</strong></p>
            </div>
            """.formatted(LocalDateTime.now());

        return dispatchEmail(toEmail, subject, html, "TEST", null);
    }

    private NotificationLogDto dispatchEmail(String toEmail, String subject, String htmlContent, String type, String actionUrl) {
        NotificationLogDto logDto = NotificationLogDto.builder()
                .id(UUID.randomUUID().toString())
                .timestamp(LocalDateTime.now())
                .channel("GMAIL")
                .type(type)
                .title(subject)
                .recipient(toEmail)
                .actionUrl(actionUrl)
                .summary(subject)
                .build();

        if (!enabled) {
            logDto.setStatus("DISABLED");
            recordLog(logDto);
            return logDto;
        }

        // Nếu có password (App Password), thực hiện gửi SMTP thật
        if (password != null && !password.isBlank()) {
            try {
                JavaMailSenderImpl sender = new JavaMailSenderImpl();
                sender.setHost(smtpHost);
                sender.setPort(smtpPort);
                sender.setUsername(username);
                sender.setPassword(password);

                Properties props = sender.getJavaMailProperties();
                props.put("mail.transport.protocol", "smtp");
                props.put("mail.smtp.auth", "true");
                props.put("mail.smtp.starttls.enable", "true");
                props.put("mail.debug", "false");

                MimeMessage message = sender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(username, senderName);
                helper.setTo(toEmail);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);

                sender.send(message);
                logDto.setStatus("SENT");
                log.info("Đã gửi email thật thành công tới: {}", toEmail);
            } catch (Exception ex) {
                log.warn("Không gửi được email qua SMTP ({}), chuyển sang chế độ SIMULATED: {}", ex.getMessage(), toEmail);
                logDto.setStatus("SIMULATED");
            }
        } else {
            // Chế độ mô phỏng kiểm thử (lưu lại vào log để xem trước trên UI)
            logDto.setStatus("SIMULATED");
            log.info("[MOCK EMAIL] Gửi tới: {}, Tiêu đề: {}", toEmail, subject);
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

