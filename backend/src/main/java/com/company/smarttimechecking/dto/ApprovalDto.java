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
public class ApprovalDto {

    @NotBlank(message = "action không được để trống (APPROVE hoặc REJECT)")
    private String action; // "APPROVE" hoặc "REJECT"

    private String comment;
}

