package com.company.smarttimechecking.service;

import com.company.smarttimechecking.domain.entity.RegisteredDevice;
import com.company.smarttimechecking.dto.DeviceEnrollDto;
import com.company.smarttimechecking.repository.RegisteredDeviceRepository;
import com.company.smarttimechecking.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeviceService {

    private final RegisteredDeviceRepository deviceRepository;

    @Transactional
    public RegisteredDevice enrollDevice(UserPrincipal user, DeviceEnrollDto dto) {
        // Kiểm tra xem token này đã bị máy khác dùng chưa
        Optional<RegisteredDevice> existingToken = deviceRepository.findByDeviceToken(dto.getDeviceToken());
        if (existingToken.isPresent()) {
            RegisteredDevice dev = existingToken.get();
            if (!dev.getEmployeeId().equals(user.getId())) {
                throw new IllegalArgumentException("ERR_TOKEN_ALREADY_USED: Thiết bị này đã được liên kết với một tài khoản nhân viên khác!");
            }
            dev.setStatus("ACTIVE");
            dev.setLastUsedAt(LocalDateTime.now());
            return deviceRepository.save(dev);
        }

        // Hủy các thiết bị cũ nếu đã có máy ACTIVE (quy tắc 1 tài khoản - 1 thiết bị)
        List<RegisteredDevice> activeDevices = deviceRepository.findByEmployeeId(user.getId());
        for (RegisteredDevice d : activeDevices) {
            d.setStatus("REVOKED");
            deviceRepository.save(d);
        }

        RegisteredDevice newDevice = RegisteredDevice.builder()
                .id(UUID.randomUUID().toString())
                .employeeId(user.getId())
                .deviceToken(dto.getDeviceToken())
                .deviceName(dto.getDeviceName() != null ? dto.getDeviceName() : "Unknown Device")
                .platform(dto.getPlatform() != null ? dto.getPlatform() : "Web")
                .status("ACTIVE")
                .lastUsedAt(LocalDateTime.now())
                .build();

        return deviceRepository.save(newDevice);
    }

    public List<RegisteredDevice> getMyDevices(String employeeId) {
        return deviceRepository.findByEmployeeId(employeeId);
    }

    public Optional<RegisteredDevice> getActiveDevice(String employeeId) {
        return deviceRepository.findByEmployeeIdAndStatus(employeeId, "ACTIVE");
    }

    public List<RegisteredDevice> getAllDevices() {
        return deviceRepository.findAll();
    }

    @Transactional
    public RegisteredDevice revokeDevice(String deviceId) {
        RegisteredDevice device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thiết bị với ID: " + deviceId));
        device.setStatus("REVOKED");
        return deviceRepository.save(device);
    }

    @Transactional
    public RegisteredDevice activateDevice(String deviceId) {
        RegisteredDevice device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thiết bị với ID: " + deviceId));
        device.setStatus("ACTIVE");
        return deviceRepository.save(device);
    }
}

