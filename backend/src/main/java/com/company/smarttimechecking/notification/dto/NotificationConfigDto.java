package com.company.smarttimechecking.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationConfigDto {
    private Boolean gmailEnabled;
    private String gmailHost;
    private Integer gmailPort;
    private String gmailUsername;
    private String gmailAppPassword;
    private String senderName;

    private Boolean googleChatEnabled;
    private String generalWebhookUrl;
    private String alertsWebhookUrl;
}

