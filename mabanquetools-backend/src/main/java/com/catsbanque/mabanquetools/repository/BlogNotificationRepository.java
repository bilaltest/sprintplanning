package com.catsbanque.mabanquetools.repository;

import com.catsbanque.mabanquetools.entity.BlogNotification;
import com.catsbanque.mabanquetools.entity.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlogNotificationRepository extends JpaRepository<BlogNotification, String> {

    // Notifications d'un utilisateur (triées par date décroissante)
    @Query("SELECT n FROM BlogNotification n " +
            "LEFT JOIN FETCH n.triggeredBy " +
            "WHERE n.recipient.id = :userId " +
            "ORDER BY n.createdAt DESC")
    List<BlogNotification> findByRecipientId(@Param("userId") String userId);

    // Notifications non lues d'un utilisateur
    @Query("SELECT n FROM BlogNotification n " +
            "LEFT JOIN FETCH n.triggeredBy " +
            "WHERE n.recipient.id = :userId AND n.isRead = false " +
            "ORDER BY n.createdAt DESC")
    List<BlogNotification> findUnreadByRecipientId(@Param("userId") String userId);

    // Compter notifications non lues
    long countByRecipientIdAndIsReadFalse(String userId);

    // Notifications par type
    @Query("SELECT n FROM BlogNotification n WHERE n.recipient.id = :userId AND n.type = :type ORDER BY n.createdAt DESC")
    List<BlogNotification> findByRecipientIdAndType(@Param("userId") String userId, @Param("type") NotificationType type);
}
