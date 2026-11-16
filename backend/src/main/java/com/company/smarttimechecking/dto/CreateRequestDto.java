package com.company.smarttimechecking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRequestDto {

    @NotBlank(message = "requestType không được để trống")
    private String requestType; // "LATE_IN", "EARLY_OUT", "MISSED_PUNCH", "ANNUAL_LEAVE", "SICK_LEAVE", "WFH"

    @NotNull(message = "fromDate không được để trống")
    private LocalDate fromDate;

    @NotNull(message = "toDate không được để trống")
    private LocalDate toDate;

    private Integer durationMinutes;
    private BigDecimal leaveUnits;
    private Boolean isRecurringWfh;
    private Integer recurringDayOfWeek;

    @NotBlank(message = "reason không được để trống")
    private String reason;

    private String attachmentUrl;
}

