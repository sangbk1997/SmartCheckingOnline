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
public class PunchRequestDto {

    @NotBlank(message = "qrPayload không được để trống")
    private String qrPayload;

    @NotBlank(message = "deviceToken không được để trống")
    private String deviceToken;

    @NotBlank(message = "punchType không được để trống (IN hoặc OUT)")
    private String punchType; // "IN" hoặc "OUT"
}

