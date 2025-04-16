package com.example.leave_management.service.impl;

import com.example.leave_management.model.LeaveRequest;
import com.example.leave_management.model.Notification;
import com.example.leave_management.repository.LeaveRequestRepository;
import com.example.leave_management.repository.NotificationRepository;
import com.example.leave_management.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private final LeaveRequestRepository leaveRequestRepository;

    @Autowired
    public NotificationServiceImpl(NotificationRepository notificationRepository,
                                   LeaveRequestRepository leaveRequestRepository) {
        this.notificationRepository = notificationRepository;
        this.leaveRequestRepository = leaveRequestRepository;
    }

    @Override
    public List<Notification> findAllNotifications() {
        return notificationRepository.findAll();
    }

    @Override
    public Optional<Notification> findNotificationById(String id) {
        return notificationRepository.findById(id);
    }

    @Override
    public List<Notification> findNotificationsByUser(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public List<Notification> findUnreadNotificationsByUser(String userId) {
        return notificationRepository.findByUserIdAndRead(userId, false);
    }

    @Override
    public List<Notification> findReadNotificationsByUser(String userId) {
        return notificationRepository.findByUserIdAndRead(userId, true);
    }

    @Override
    public List<Notification> findNotificationsByReference(String referenceId, String referenceType) {
        return notificationRepository.findByReferenceIdAndReferenceType(referenceId, referenceType);
    }

    @Override
    public Notification saveNotification(Notification notification) {
        notification.setCreatedAt(LocalDateTime.now());
        // Since read is a primitive boolean, it cannot be null. Default to false if not set.
        if (!notification.isRead()) {
            notification.setRead(false);
        }

        return notificationRepository.save(notification);
    }

    @Override
    public Notification updateNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    @Override
    public void deleteNotification(String id) {
        notificationRepository.deleteById(id);
    }

    @Override
    public Notification markAsRead(String notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);

        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            return notificationRepository.save(notification);
        }

        return null;
    }

    @Override
    public List<Notification> markAllAsRead(String userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndRead(userId, false);

        for (Notification notification : notifications) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
        }

        return notificationRepository.saveAll(notifications);
    }

    @Override
    public Notification dismissNotification(String notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);

        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.setDismissed(true);
            notification.setDismissedAt(LocalDateTime.now());
            return notificationRepository.save(notification);
        }

        return null;
    }

    @Override
    public List<Notification> dismissAllNotifications(String userId) {
        List<Notification> notifications = notificationRepository.findByUserId(userId);

        for (Notification notification : notifications) {
            notification.setDismissed(true);
            notification.setDismissedAt(LocalDateTime.now());
        }

        return notificationRepository.saveAll(notifications);
    }

    @Override
    public void cleanupExpiredNotifications() {
        List<Notification> expiredNotifications = notificationRepository.findByExpiresAtBefore(LocalDateTime.now());
        notificationRepository.deleteAll(expiredNotifications);
    }

    @Override
    public long countUnreadNotifications(String userId) {
        return notificationRepository.countByUserIdAndRead(userId, false);
    }

    @Override
    public Notification createLeaveRequestNotification(String userId, String leaveRequestId) {
        Optional<LeaveRequest> leaveRequestOpt = leaveRequestRepository.findById(leaveRequestId);

        if (leaveRequestOpt.isPresent()) {
            LeaveRequest leaveRequest = leaveRequestOpt.get();

            Notification notification = new Notification();
            notification.setUserId(userId);
            notification.setTitle("New Leave Request");
            notification.setMessage("New leave request from " + leaveRequest.getEmployeeId() + " needs your approval");
            notification.setType("LEAVE_REQUEST");
            notification.setRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            notification.setReferenceId(leaveRequestId);
            notification.setReferenceType("LEAVE_REQUEST");
            notification.setAction("APPROVE_REJECT");
            notification.setActionUrl("/leave-requests/" + leaveRequestId);
            notification.setPriority("MEDIUM");
            notification.setExpiresAt(LocalDateTime.now().plusDays(7));

            return saveNotification(notification);
        }

        return null;
    }

    @Override
    public Notification createLeaveApprovalNotification(String userId, String leaveRequestId, boolean approved) {
        Optional<LeaveRequest> leaveRequestOpt = leaveRequestRepository.findById(leaveRequestId);

        if (leaveRequestOpt.isPresent()) {
            LeaveRequest leaveRequest = leaveRequestOpt.get();

            Notification notification = new Notification();
            notification.setUserId(userId);
            notification.setTitle("Leave Request " + (approved ? "Approved" : "Rejected"));
            notification.setMessage("Your leave request from " + leaveRequest.getStartDate() +
                    " to " + leaveRequest.getEndDate() + " has been " +
                    (approved ? "approved" : "rejected"));
            notification.setType("LEAVE_" + (approved ? "APPROVAL" : "REJECTION"));
            notification.setRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            notification.setReferenceId(leaveRequestId);
            notification.setReferenceType("LEAVE_REQUEST");
            notification.setAction("VIEW");
            notification.setActionUrl("/my-leaves/" + leaveRequestId);
            notification.setPriority(approved ? "LOW" : "HIGH");
            notification.setExpiresAt(LocalDateTime.now().plusDays(7));

            return saveNotification(notification);
        }

        return null;
    }

    @Override
    public Notification createSystemNotification(String userId, String title, String message) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType("SYSTEM");
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setPriority("MEDIUM");
        notification.setExpiresAt(LocalDateTime.now().plusDays(7));

        return saveNotification(notification);
    }
}