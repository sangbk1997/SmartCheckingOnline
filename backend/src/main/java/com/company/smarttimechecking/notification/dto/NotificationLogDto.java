package com.company.smarttimechecking.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationLogDto {
    private String id;
    private LocalDateTime timestamp;
    private String channel; // "GMAIL", "GOOGLE_CHAT"
    private String type;    // "REQUEST_PENDING", "REQUEST_RESULT", "GPS_ALERT", "DAILY_BULLETIN", "PERIOD_LOCKED", "TEST"
    private String title;
    private String recipient;
    private String status;   // "SENT", "SIMULATED", "FAILED"
    private String summary;
    private String actionUrl;
    private Object payloadDetails;
}

