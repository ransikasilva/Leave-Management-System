package com.example.leave_management.service;

import com.example.leave_management.model.Notification;
import java.util.List;
import java.util.Optional;

public interface NotificationService {
    List<Notification> findAllNotifications();

    Optional<Notification> findNotificationById(String id);

    List<Notification> findNotificationsByUser(String userId);

    List<Notification> findUnreadNotificationsByUser(String userId);

    List<Notification> findReadNotificationsByUser(String userId);

    List<Notification> findNotificationsByReference(String referenceId, String referenceType);

    Notification saveNotification(Notification notification);

    Notification updateNotification(Notification notification);

    void deleteNotification(String id);

    Notification markAsRead(String notificationId);

    List<Notification> markAllAsRead(String userId);

    Notification dismissNotification(String notificationId);

    List<Notification> dismissAllNotifications(String userId);

    void cleanupExpiredNotifications();

    long countUnreadNotifications(String userId);

    Notification createLeaveRequestNotification(String userId, String leaveRequestId);

    Notification createLeaveApprovalNotification(String userId, String leaveRequestId, boolean approved);

    Notification createSystemNotification(String userId, String title, String message);
}