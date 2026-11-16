package com.company.smarttimechecking.service;

import com.company.smarttimechecking.config.RabbitMQConfig;
import com.company.smarttimechecking.domain.entity.AttendancePunch;
import com.company.smarttimechecking.domain.entity.AttendanceRequest;
import com.company.smarttimechecking.domain.entity.RegisteredDevice;
import com.company.smarttimechecking.dto.PunchRequestDto;
import com.company.smarttimechecking.notification.event.GpsMismatchEvent;
import com.company.smarttimechecking.repository.AttendancePunchRepository;
import com.company.smarttimechecking.repository.AttendanceRequestRepository;
import com.company.smarttimechecking.repository.EmployeeRepository;
import com.company.smarttimechecking.repository.RegisteredDeviceRepository;
import com.company.smarttimechecking.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendancePunchRepository punchRepository;
    private final RegisteredDeviceRepository deviceRepository;
    private final AttendanceRequestRepository requestRepository;
    private final KioskQrService qrService;
    private final RedisTemplate<String, String> redisTemplate;
    private final RabbitTemplate rabbitTemplate;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;
    private final EmployeeRepository employeeRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Value("${app.attendance.office-public-ips}")
    private String officePublicIps;

    @Value("${app.attendance.office-latitude:10.776889}")
    private double officeLatitude;

    @Value("${app.attendance.office-longitude:106.700806}")
    private double officeLongitude;

    @Value("${app.attendance.max-geo-distance-meters:200.0}")
    private double maxGeoDistanceMeters;

    @Value("${app.upload.dir:/tmp/smart-time-checking/uploads}")
    private String uploadDir;

    @Transactional
    public AttendancePunch processStandardPunch(UserPrincipal user, PunchRequestDto dto, String clientIp) {
        // 1. Kiểm tra Thiết bị (Device Binding)
        RegisteredDevice device = deviceRepository.findByDeviceToken(dto.getDeviceToken())
                .orElseThrow(() -> new IllegalArgumentException("ERR_DEVICE_MISMATCH: Thiết bị chưa được liên kết với tài khoản!"));

        if (!device.getEmployeeId().equals(user.getId()) || !"ACTIVE".equalsIgnoreCase(device.getStatus())) {
            throw new IllegalArgumentException("ERR_DEVICE_MISMATCH: Thiết bị không thuộc tài khoản của bạn hoặc đã bị vô hiệu hóa!");
        }

        // Cập nhật thời điểm sử dụng thiết bị
        device.setLastUsedAt(LocalDateTime.now());
        deviceRepository.save(device);

        // 2. Kiểm tra Mạng IP / WFH
        boolean isOfficeIp = isIpInWhitelist(clientIp);
        boolean isWfh = false;

        if (!isOfficeIp) {
            // Kiểm tra xem hôm nay có đơn WFH đã duyệt hay không
            List<AttendanceRequest> approvedWfh = requestRepository.findApprovedWfhRequests(user.getId(), LocalDate.now());
            if (approvedWfh.isEmpty()) {
                throw new IllegalArgumentException("ERR_INVALID_NETWORK: Bạn không kết nối mạng Wi-Fi công ty và không có lịch WFH được duyệt!");
            }
            isWfh = true;
        }

        // 3. Kiểm tra Mã QR (Redis Atomic Validation)
        String[] parts = dto.getQrPayload().split("\\|");
        if (parts.length < 4) {
            throw new IllegalArgumentException("ERR_INVALID_QR: Cấu trúc mã QR không hợp lệ!");
        }

        String screenId = parts[0];
        String timestampStr = parts[1];
        String nonce = parts[2];
        String signature = parts[3];

        String rawData = screenId + "|" + timestampStr + "|" + nonce;
        if (!qrService.verifySignature(rawData, signature)) {
            throw new IllegalArgumentException("ERR_INVALID_QR: Chữ ký số mã QR không hợp lệ!");
        }

        // Lấy và xóa atomic khỏi Redis
        String cachedScreen = redisTemplate.opsForValue().getAndDelete("QR:" + nonce);
        if (cachedScreen == null) {
            throw new IllegalArgumentException("ERR_QR_EXPIRED: Mã QR đã hết hạn hoặc đã được sử dụng. Vui lòng quét lại!");
        }

        // 4. Ghi nhận chấm công thành công
        AttendancePunch punch = AttendancePunch.builder()
                .id(UUID.randomUUID().toString())
                .employeeId(user.getId())
                .punchTime(LocalDateTime.now())
                .punchType(dto.getPunchType().toUpperCase())
                .verificationMethod("DYNAMIC_QR")
                .clientIp(clientIp)
                .deviceId(device.getId())
                .isWfh(isWfh)
                .status("VALID")
                .build();

        AttendancePunch savedPunch = punchRepository.save(punch);

        // 5. Bắn event bất đồng bộ qua RabbitMQ & WebSocket Kiosk TV
        String typeDesc = "IN".equalsIgnoreCase(savedPunch.getPunchType()) ? "Check-in (Vào ca)" : "Check-out (Ra ca)";
        String greetingMessage = "Chào mừng " + user.getFullName() + " đã " + typeDesc + " thành công!";

        try {
            Map<String, Object> kioskNotification = new HashMap<>();
            kioskNotification.put("type", "PUNCH_SUCCESS");
            kioskNotification.put("employeeName", user.getFullName());
            kioskNotification.put("punchType", savedPunch.getPunchType());
            kioskNotification.put("punchTime", savedPunch.getPunchTime().toString());
            kioskNotification.put("message", greetingMessage);
            messagingTemplate.convertAndSend("/topic/kiosk/events", kioskNotification);
        } catch (Exception e) {
            log.trace("WebSocket Kiosk notification: {}", e.getMessage());
        }

        try {
            Map<String, Object> event = new HashMap<>();
            event.put("punchId", savedPunch.getId());
            event.put("employeeId", user.getId());
            event.put("employeeName", user.getFullName());
            event.put("punchType", savedPunch.getPunchType());
            event.put("punchTime", savedPunch.getPunchTime().toString());
            rabbitTemplate.convertAndSend(RabbitMQConfig.ATTENDANCE_EXCHANGE, "attendance.punch.created", event);
        } catch (Exception e) {
            log.warn("Không thể gửi event RabbitMQ: {}", e.getMessage());
        }

        return savedPunch;
    }

    @Transactional
    public AttendancePunch processEmergencyPunch(
            UserPrincipal user, 
            MultipartFile selfieFile, 
            Double latitude, 
            Double longitude, 
            String reason, 
            String clientIp) {

        String savedImageUrl = null;
        if (selfieFile != null && !selfieFile.isEmpty()) {
            try {
                Path uploadPath = Paths.get(uploadDir);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                String filename = "emergency_" + user.getEmployeeCode() + "_" + System.currentTimeMillis() + ".jpg";
                Path filePath = uploadPath.resolve(filename);
                selfieFile.transferTo(filePath.toFile());
                savedImageUrl = "/uploads/" + filename;
            } catch (IOException e) {
                log.error("Lỗi lưu ảnh selfie", e);
            }
        }

        // Tính khoảng cách GPS
        String warningFlag = null;
        if (latitude != null && longitude != null) {
            double distanceMeters = calculateHaversineDistance(latitude, longitude, officeLatitude, officeLongitude);
            if (distanceMeters > maxGeoDistanceMeters) {
                warningFlag = String.format("FLAG_LOCATION_MISMATCH: Khoảng cách lệch %.1f mét so với văn phòng", distanceMeters);
            }
        }

        AttendancePunch punch = AttendancePunch.builder()
                .id(UUID.randomUUID().toString())
                .employeeId(user.getId())
                .punchTime(LocalDateTime.now())
                .punchType("IN")
                .verificationMethod("EMERGENCY_SELFIE")
                .clientIp(clientIp)
                .latitude(latitude != null ? BigDecimal.valueOf(latitude) : null)
                .longitude(longitude != null ? BigDecimal.valueOf(longitude) : null)
                .selfieImageUrl(savedImageUrl)
                .rejectionReason(warningFlag)
                .status("PENDING_APPROVAL")
                .build();

        AttendancePunch saved = punchRepository.save(punch);

        // Bắn sự kiện cảnh báo sai lệch GPS tới Gmail & Google Chat Space #hr-security-alerts
        if (warningFlag != null && latitude != null && longitude != null) {
            double distanceMeters = calculateHaversineDistance(latitude, longitude, officeLatitude, officeLongitude);
            employeeRepository.findById(user.getId()).ifPresent(emp -> {
                eventPublisher.publishEvent(new GpsMismatchEvent(saved, emp, distanceMeters));
            });
        }

        return saved;
    }

    private boolean isIpInWhitelist(String clientIp) {
        if (clientIp == null || clientIp.isBlank()) return false;
        List<String> allowed = Arrays.asList(officePublicIps.split(","));
        for (String ip : allowed) {
            String trimmed = ip.trim();
            if (trimmed.equals(clientIp) || trimmed.equals("0:0:0:0:0:0:0:1") || clientIp.startsWith("127.") || clientIp.startsWith("192.168.")) {
                return true;
            }
        }
        return false;
    }

    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000; // Bán kính trái đất (mét)
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}

