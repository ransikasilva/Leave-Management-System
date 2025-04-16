package com.example.leave_management.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;

    private String userId;

    private String title;

    private String message;

    private String type;

    private boolean read;

    private LocalDateTime createdAt;

    private LocalDateTime readAt;

    private String referenceId;

    private String referenceType;

    private String action;

    private String actionUrl;

    private String icon;

    private String priority;

    private LocalDateTime expiresAt;

    private boolean dismissed;

    private LocalDateTime dismissedAt;
}