package com.company.smarttimechecking.controller;

import com.company.smarttimechecking.dto.ApiResponse;
import com.company.smarttimechecking.service.KioskQrService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/kiosk")
@RequiredArgsConstructor
public class KioskController {

    private final KioskQrService qrService;

    @GetMapping("/current-qr")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentQr() {
        String payload = qrService.getCurrentPayload();
        if (payload == null) {
            qrService.generateAndBroadcastQr();
            payload = qrService.getCurrentPayload();
        }

        return ResponseEntity.ok(ApiResponse.ok("Lấy mã QR Kiosk hiện tại thành công", Map.of(
                "qrPayload", payload,
                "screenId", "OFFICE_HQ_FLOOR_1",
                "validitySeconds", 8
        )));
    }
}

