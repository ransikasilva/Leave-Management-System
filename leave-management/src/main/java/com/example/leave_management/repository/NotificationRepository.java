package com.example.leave_management.repository;

import com.example.leave_management.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserId(String userId);

    List<Notification> findByUserIdAndRead(String userId, boolean read);

    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Notification> findByReferenceIdAndReferenceType(String referenceId, String referenceType);

    List<Notification> findByCreatedAtBefore(LocalDateTime dateTime);

    List<Notification> findByExpiresAtBefore(LocalDateTime dateTime);

    long countByUserIdAndRead(String userId, boolean read);

    void deleteByUserIdAndDismissed(String userId, boolean dismissed);
}