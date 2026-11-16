package com.company.smarttimechecking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRequestDetailDto {
    private String id;
    private String requestCode;
    private String employeeId;
    private String employeeCode;
    private String employeeName;
    private String departmentName;
    private String requestType;
    private LocalDate fromDate;
    private LocalDate toDate;
    private Integer durationMinutes;
    private BigDecimal leaveUnits;
    private Boolean isRecurringWfh;
    private Boolean isUrgent;
    private String reason;
    private String eodReport;
    private String attachmentUrl;
    private String status;
    private LocalDateTime createdAt;
}

