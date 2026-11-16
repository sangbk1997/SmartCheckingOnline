package com.company.smarttimechecking.security;

import com.company.smarttimechecking.domain.entity.Employee;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPrincipal implements UserDetails {

    private String id;
    private String employeeCode;
    private String email;
    private String fullName;
    private String departmentId;
    private String directManagerId;
    private String role; // "EMPLOYEE", "MANAGER", "HR_ADMIN"

    public static UserPrincipal fromEmployee(Employee employee) {
        return UserPrincipal.builder()
                .id(employee.getId())
                .employeeCode(employee.getEmployeeCode())
                .email(employee.getEmail())
                .fullName(employee.getFullName())
                .departmentId(employee.getDepartmentId())
                .directManagerId(employee.getDirectManagerId())
                .role(employee.getAppRole())
                .build();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getPassword() {
        return "";
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}

