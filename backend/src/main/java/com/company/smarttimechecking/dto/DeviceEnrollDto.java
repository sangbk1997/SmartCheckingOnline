package com.company.smarttimechecking.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceEnrollDto {

    @NotBlank(message = "deviceToken không được để trống")
    private String deviceToken;

    private String deviceName;
    private String platform;
}

