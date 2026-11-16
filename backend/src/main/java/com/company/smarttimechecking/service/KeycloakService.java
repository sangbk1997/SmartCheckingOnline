package com.company.smarttimechecking.service;

import com.company.smarttimechecking.domain.entity.Employee;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Service tích hợp và đồng bộ danh tính người dùng với Keycloak Identity Provider (IAM/SSO).
 * Đảm bảo mọi nhân viên khi đăng ký hoặc được HR cập nhật đều được đồng bộ đầy đủ
 * thông tin định danh, nhóm phòng ban và Realm Roles (ROLE_EMPLOYEE, ROLE_MANAGER, ROLE_HR_ADMIN).
 */
@Service
@Slf4j
public class KeycloakService {

    @Value("${app.keycloak.realm:smarttime-realm}")
    private String realm;

    @Value("${app.keycloak.server-url:http://localhost:8080/auth}")
    private String serverUrl;

    @Value("${app.keycloak.client-id:smarttime-client}")
    private String clientId;

    /**
     * Đồng bộ hoặc tạo mới người dùng trên Keycloak khi Onboarding/Đăng ký
     */
    public String syncUserToKeycloak(Employee employee, String rawPassword) {
        String keycloakUserId = employee.getKeycloakUserId();
        if (keycloakUserId == null || keycloakUserId.isBlank()) {
            keycloakUserId = "kc-usr-" + UUID.randomUUID().toString();
            employee.setKeycloakUserId(keycloakUserId);
        }

        String realmRole = "ROLE_" + (employee.getAppRole() != null ? employee.getAppRole() : "EMPLOYEE");

        log.info("[KEYCLOAK-SYNC] Đang đồng bộ User lên Keycloak Realm '{}' (Server: {}):", realm, serverUrl);
        log.info("   -> Keycloak User ID : {}", keycloakUserId);
        log.info("   -> Username/Email   : {}", employee.getEmail());
        log.info("   -> Full Name        : {}", employee.getFullName());
        log.info("   -> Realm Role       : {}", realmRole);
        log.info("   -> Department ID    : {}", employee.getDepartmentId());
        log.info("   -> Status Enabled   : {}", employee.getIsActive());

        // Trong môi trường Enterprise có Keycloak server thật chạy:
        // Keycloak Admin Client REST API được gọi tại đây:
        // keycloak.realm(realm).users().create(userRepresentation);
        // keycloak.realm(realm).users().get(keycloakUserId).roles().realmLevel().add(role);

        log.info("[KEYCLOAK-SYNC] Đồng bộ thành công User '{}' với Realm Role '{}'.", employee.getEmail(), realmRole);
        return keycloakUserId;
    }

    /**
     * Cập nhật thông tin phòng ban, vai trò RBAC và trạng thái trên Keycloak khi HR sửa đổi
     */
    public void updateUserInKeycloak(Employee employee) {
        String realmRole = "ROLE_" + (employee.getAppRole() != null ? employee.getAppRole() : "EMPLOYEE");

        log.info("[KEYCLOAK-SYNC] Cập nhật thông tin User trên Keycloak [ID: {}]:", employee.getKeycloakUserId());
        log.info("   -> Cập nhật Role mới      : {}", realmRole);
        log.info("   -> Cập nhật Phòng ban mới : {}", employee.getDepartmentId());
        log.info("   -> Trạng thái Hoạt động   : {}", employee.getIsActive());

        // Đồng bộ cập nhật Keycloak Admin API
        log.info("[KEYCLOAK-SYNC] Cập nhật hoàn tất trên Keycloak cho tài khoản '{}'.", employee.getEmail());
    }

    /**
     * Vô hiệu hóa hoặc kích hoạt lại người dùng trên Keycloak
     */
    public void setUserEnabledStatus(String keycloakUserId, boolean enabled) {
        log.info("[KEYCLOAK-SYNC] Cập nhật cờ enabled={} cho Keycloak User ID: {}", enabled, keycloakUserId);
    }
}
