package com.company.smarttimechecking.service;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
@RequiredArgsConstructor
public class KioskQrService {

    private final RedisTemplate<String, String> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${app.attendance.qr-secret-key}")
    private String qrSecretKey;

    @Value("${app.attendance.qr-validity-seconds:8}")
    private int qrValiditySeconds;

    @Getter
    private volatile String currentPayload;

    // Sinh mã định kỳ mỗi 5 giây
    @Scheduled(fixedRate = 5000)
    public void generateAndBroadcastQr() {
        String screenId = "OFFICE_HQ_FLOOR_1";
        long timestamp = Instant.now().getEpochSecond();
        String nonce = UUID.randomUUID().toString();

        String rawData = screenId + "|" + timestamp + "|" + nonce;
        String signature = generateSignature(rawData, qrSecretKey);

        String payload = rawData + "|" + signature;
        this.currentPayload = payload;

        // Lưu nonce vào Redis với TTL 8 giây
        redisTemplate.opsForValue().set("QR:" + nonce, screenId, qrValiditySeconds, TimeUnit.SECONDS);

        // Broadcast qua WebSocket xuống Kiosk TV
        try {
            messagingTemplate.convertAndSend("/topic/kiosk/qr", payload);
        } catch (Exception e) {
            log.trace("WebSocket client not connected yet");
        }
    }

    public boolean verifySignature(String rawData, String signature) {
        String expectedSignature = generateSignature(rawData, qrSecretKey);
        return expectedSignature.equals(signature);
    }

    private String generateSignature(String data, String key) {
        try {
            Mac sha256Hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256Hmac.init(secretKey);
            byte[] signedBytes = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(signedBytes);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Lỗi tạo chữ ký số HMAC-SHA256", e);
        }
    }
}

