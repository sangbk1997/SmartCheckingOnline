package com.company.smarttimechecking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuotaStatusDto {
    private int lateEarlyUsedMonth;
    private int lateEarlyMaxMonth;
    private int lateEarlyRemaining;

    private int missedPunchUsedMonth;
    private int missedPunchMaxMonth;
    private int missedPunchRemaining;

    private long wfhUsedMonth;
    private int wfhMaxMonth;
    private long wfhRemaining;

    private BigDecimal annualLeaveRemaining;
}

