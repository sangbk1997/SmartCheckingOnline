package com.company.smarttimechecking.notification.controller;

import com.company.smarttimechecking.notification.service.OneClickApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/actions")
@RequiredArgsConstructor
public class OneClickApprovalController {

    private final OneClickApprovalService approvalService;

    @GetMapping(value = "/quick-approve", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> quickApprove(@RequestParam("token") String token) {
        OneClickApprovalService.ApprovalResult result = approvalService.processAction(token, "APPROVE", "Phê duyệt 1 chạm qua Email");
        return renderHtmlResult(result, true);
    }

    @GetMapping(value = "/quick-reject", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> quickReject(
            @RequestParam("token") String token,
            @RequestParam(value = "comment", defaultValue = "Từ chối nhanh qua Email") String comment) {
        OneClickApprovalService.ApprovalResult result = approvalService.processAction(token, "REJECT", comment);
        return renderHtmlResult(result, false);
    }

    private ResponseEntity<String> renderHtmlResult(OneClickApprovalService.ApprovalResult result, boolean isApprove) {
        String themeColor = result.success() ? (isApprove ? "#10b981" : "#ef4444") : "#f59e0b";
        String icon = result.success() ? (isApprove ? "✅" : "❌") : "⚠️";
        String title = result.success() ? (isApprove ? "PHÊ DUYỆT ĐƠN THÀNH CÔNG!" : "ĐÃ TỪ CHỐI ĐƠN!") : "KHÔNG THỂ THỰC HIỆN";

        String detailsHtml = "";
        if (result.success() && result.request() != null) {
            detailsHtml = """
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: left; font-size: 14px;">
                  <div><strong>Mã đơn:</strong> %s</div>
                  <div><strong>Loại đơn:</strong> %s</div>
                  <div><strong>Thời gian:</strong> %s đến %s</div>
                  <div><strong>Người duyệt:</strong> %s</div>
                  <div><strong>Trạng thái:</strong> <span style="color: %s; font-weight: bold;">%s</span></div>
                </div>
                """.formatted(
                    result.request().getRequestCode(),
                    result.request().getRequestType(),
                    result.request().getFromDate(),
                    result.request().getToDate(),
                    result.approverName(),
                    themeColor,
                    result.request().getStatus()
            );
        }

        String html = """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>%s - SmartCorp HR Portal</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 16px; }
                .box { background: #ffffff; max-width: 480px; width: 100%%; border-radius: 20px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); padding: 32px 24px; text-align: center; border: 1px solid #e2e8f0; }
                .icon { font-size: 48px; margin-bottom: 12px; }
                .title { font-size: 20px; font-weight: 800; color: %s; margin-bottom: 8px; }
                .desc { font-size: 14px; color: #475569; line-height: 1.5; }
                .btn { display: inline-block; margin-top: 16px; background: #4f46e5; color: #fff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 10px 20px; border-radius: 10px; }
              </style>
            </head>
            <body>
              <div class="box">
                <div class="icon">%s</div>
                <div class="title">%s</div>
                <div class="desc">%s</div>
                %s
                <a href="http://localhost:3000" class="btn">Mở Cổng Quản Lý Nhân Sự</a>
              </div>
            </body>
            </html>
            """.formatted(title, themeColor, icon, title, result.message(), detailsHtml);

        return ResponseEntity.ok(html);
    }
}

