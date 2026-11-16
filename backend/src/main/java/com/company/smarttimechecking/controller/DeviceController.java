package com.company.smarttimechecking.controller;

import com.company.smarttimechecking.domain.entity.RegisteredDevice;
import com.company.smarttimechecking.dto.ApiResponse;
import com.company.smarttimechecking.dto.DeviceEnrollDto;
import com.company.smarttimechecking.security.UserPrincipal;
import com.company.smarttimechecking.service.DeviceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;

    @PostMapping("/enroll")
    public ResponseEntity<ApiResponse<RegisteredDevice>> enrollDevice(
            @AuthenticationPrincipal UserPrincipal user,
            @Valid @RequestBody DeviceEnrollDto dto) {

        RegisteredDevice device = deviceService.enrollDevice(user, dto);
        return ResponseEntity.ok(ApiResponse.ok("Đăng ký thiết bị chấm công thành công", device));
    }

    @GetMapping("/my-devices")
    public ResponseEntity<ApiResponse<List<RegisteredDevice>>> getMyDevices(@AuthenticationPrincipal UserPrincipal user) {
        List<RegisteredDevice> devices = deviceService.getMyDevices(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách thiết bị thành công", devices));
    }

    @GetMapping("/my-device")
    public ResponseEntity<ApiResponse<RegisteredDevice>> getMyActiveDevice(@AuthenticationPrincipal UserPrincipal user) {
        return deviceService.getActiveDevice(user.getId())
                .map(d -> ResponseEntity.ok(ApiResponse.ok("Lấy thiết bị hoạt động thành công", d)))
                .orElse(ResponseEntity.ok(ApiResponse.ok("Chưa có thiết bị nào đang hoạt động", null)));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<ApiResponse<List<RegisteredDevice>>> getAllDevicesAdmin() {
        List<RegisteredDevice> devices = deviceService.getAllDevices();
        return ResponseEntity.ok(ApiResponse.ok("Lấy toàn bộ danh sách thiết bị thành công", devices));
    }

    @PostMapping("/admin/{id}/revoke")
    public ResponseEntity<ApiResponse<RegisteredDevice>> revokeDeviceAdmin(@PathVariable("id") String id) {
        RegisteredDevice revoked = deviceService.revokeDevice(id);
        return ResponseEntity.ok(ApiResponse.ok("Thu hồi thiết bị thành công", revoked));
    }

    @PostMapping("/admin/{id}/activate")
    public ResponseEntity<ApiResponse<RegisteredDevice>> activateDeviceAdmin(@PathVariable("id") String id) {
        RegisteredDevice activated = deviceService.activateDevice(id);
        return ResponseEntity.ok(ApiResponse.ok("Kích hoạt lại thiết bị thành công", activated));
    }
}

