package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.dto.BlogNotificationDto;
import com.catsbanque.mabanquetools.entity.BlogNotification;
import com.catsbanque.mabanquetools.entity.NotificationType;
import com.catsbanque.mabanquetools.entity.User;
import com.catsbanque.mabanquetools.repository.BlogNotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires pour BlogNotificationService
 */
@ExtendWith(MockitoExtension.class)
class BlogNotificationServiceTest {

    @Mock
    private BlogNotificationRepository blogNotificationRepository;

    @InjectMocks
    private BlogNotificationService blogNotificationService;

    private User recipient;
    private User triggeredBy;
    private BlogNotification notification;

    @BeforeEach
    void setUp() {
        recipient = new User();
        recipient.setId("user1");
        recipient.setEmail("recipient@ca-ts.fr");
        recipient.setFirstName("John");
        recipient.setLastName("Doe");

        triggeredBy = new User();
        triggeredBy.setId("user2");
        triggeredBy.setEmail("author@ca-ts.fr");
        triggeredBy.setFirstName("Jane");
        triggeredBy.setLastName("Smith");

        notification = BlogNotification.builder()
                .id("notif1")
                .type(NotificationType.MENTION)
                .recipient(recipient)
                .triggeredBy(triggeredBy)
                .relatedPostId("post1")
                .relatedCommentId("comment1")
                .message("vous a mentionné")
                .isRead(false)
                .build();
    }

    @Test
    void getUserNotifications_shouldReturnAllNotifications() {
        when(blogNotificationRepository.findByRecipientId("user1"))
                .thenReturn(Arrays.asList(notification));

        List<BlogNotificationDto> result = blogNotificationService.getUserNotifications("user1");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getType()).isEqualTo("MENTION");
        assertThat(result.get(0).getMessage()).isEqualTo("vous a mentionné");
        assertThat(result.get(0).getTriggeredByName()).isEqualTo("Jane Smith");
        verify(blogNotificationRepository).findByRecipientId("user1");
    }

    @Test
    void getUserNotifications_shouldReturnEmptyListWhenNoNotifications() {
        when(blogNotificationRepository.findByRecipientId("user1"))
                .thenReturn(List.of());

        List<BlogNotificationDto> result = blogNotificationService.getUserNotifications("user1");

        assertThat(result).isEmpty();
    }

    @Test
    void getUnreadNotifications_shouldReturnOnlyUnread() {
        when(blogNotificationRepository.findUnreadByRecipientId("user1"))
                .thenReturn(Arrays.asList(notification));

        List<BlogNotificationDto> result = blogNotificationService.getUnreadNotifications("user1");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getIsRead()).isFalse();
        verify(blogNotificationRepository).findUnreadByRecipientId("user1");
    }

    @Test
    void getUnreadCount_shouldReturnCorrectCount() {
        when(blogNotificationRepository.countByRecipientIdAndIsReadFalse("user1"))
                .thenReturn(3L);

        long count = blogNotificationService.getUnreadCount("user1");

        assertThat(count).isEqualTo(3L);
    }

    @Test
    void getUnreadCount_shouldReturnZeroWhenNoUnreadNotifications() {
        when(blogNotificationRepository.countByRecipientIdAndIsReadFalse("user1"))
                .thenReturn(0L);

        long count = blogNotificationService.getUnreadCount("user1");

        assertThat(count).isZero();
    }

    @Test
    void markAsRead_shouldUpdateNotification() {
        when(blogNotificationRepository.findById("notif1"))
                .thenReturn(Optional.of(notification));
        when(blogNotificationRepository.save(any(BlogNotification.class)))
                .thenReturn(notification);

        blogNotificationService.markAsRead("notif1", "user1");

        assertThat(notification.getIsRead()).isTrue();
        verify(blogNotificationRepository).save(notification);
    }

    @Test
    void markAsRead_withWrongUser_shouldThrowException() {
        when(blogNotificationRepository.findById("notif1"))
                .thenReturn(Optional.of(notification));

        assertThatThrownBy(() -> blogNotificationService.markAsRead("notif1", "wrongUser"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Accès refusé");
    }

    @Test
    void markAsRead_withNonExistentNotification_shouldThrowException() {
        when(blogNotificationRepository.findById("notif999"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> blogNotificationService.markAsRead("notif999", "user1"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Notification non trouvée");
    }

    @Test
    void markAllAsRead_shouldUpdateMultipleNotifications() {
        BlogNotification notif2 = BlogNotification.builder()
                .id("notif2")
                .type(NotificationType.NEW_COMMENT)
                .recipient(recipient)
                .triggeredBy(triggeredBy)
                .relatedPostId("post2")
                .message("a commenté votre article")
                .isRead(false)
                .build();

        when(blogNotificationRepository.findUnreadByRecipientId("user1"))
                .thenReturn(Arrays.asList(notification, notif2));

        blogNotificationService.markAllAsRead("user1");

        assertThat(notification.getIsRead()).isTrue();
        assertThat(notif2.getIsRead()).isTrue();
        verify(blogNotificationRepository).saveAll(anyList());
    }

    @Test
    void markAllAsRead_withNoUnreadNotifications_shouldNotCallSave() {
        when(blogNotificationRepository.findUnreadByRecipientId("user1"))
                .thenReturn(List.of());

        blogNotificationService.markAllAsRead("user1");

        verify(blogNotificationRepository).saveAll(List.of());
    }

    @Test
    void createMentionNotification_shouldSaveNotification() {
        when(blogNotificationRepository.save(any(BlogNotification.class)))
                .thenReturn(notification);

        blogNotificationService.createMentionNotification(
                recipient, triggeredBy, "post1", "comment1", "Custom message"
        );

        verify(blogNotificationRepository).save(any(BlogNotification.class));
    }

    @Test
    void createMentionNotification_withNullCustomMessage_shouldUseDefaultMessage() {
        when(blogNotificationRepository.save(any(BlogNotification.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        blogNotificationService.createMentionNotification(
                recipient, triggeredBy, "post1", "comment1", null
        );

        verify(blogNotificationRepository).save(argThat(notif ->
                notif.getMessage().equals("vous a mentionné")
        ));
    }

    @Test
    void createCommentNotification_shouldSaveNotification() {
        when(blogNotificationRepository.save(any(BlogNotification.class)))
                .thenReturn(notification);

        blogNotificationService.createCommentNotification(
                recipient, triggeredBy, "post1", "comment1"
        );

        verify(blogNotificationRepository).save(argThat(notif ->
                notif.getType() == NotificationType.NEW_COMMENT &&
                notif.getMessage().equals("a commenté votre article")
        ));
    }

    @Test
    void createReplyNotification_shouldSaveNotification() {
        when(blogNotificationRepository.save(any(BlogNotification.class)))
                .thenReturn(notification);

        blogNotificationService.createReplyNotification(
                recipient, triggeredBy, "post1", "comment1"
        );

        verify(blogNotificationRepository).save(argThat(notif ->
                notif.getType() == NotificationType.COMMENT_REPLY &&
                notif.getMessage().equals("a répondu à votre commentaire")
        ));
    }

    @Test
    void createPostLikeNotification_shouldSaveNotification() {
        when(blogNotificationRepository.save(any(BlogNotification.class)))
                .thenReturn(notification);

        blogNotificationService.createPostLikeNotification(
                recipient, triggeredBy, "post1"
        );

        verify(blogNotificationRepository).save(argThat(notif ->
                notif.getType() == NotificationType.POST_LIKE &&
                notif.getMessage().equals("a aimé votre article") &&
                notif.getRelatedCommentId() == null
        ));
    }

    @Test
    void createCommentLikeNotification_shouldSaveNotification() {
        when(blogNotificationRepository.save(any(BlogNotification.class)))
                .thenReturn(notification);

        blogNotificationService.createCommentLikeNotification(
                recipient, triggeredBy, "post1", "comment1"
        );

        verify(blogNotificationRepository).save(argThat(notif ->
                notif.getType() == NotificationType.COMMENT_LIKE &&
                notif.getMessage().equals("a aimé votre commentaire")
        ));
    }

    @Test
    void createNewPostNotification_shouldSaveNotification() {
        when(blogNotificationRepository.save(any(BlogNotification.class)))
                .thenReturn(notification);

        blogNotificationService.createNewPostNotification(
                recipient, triggeredBy, "post1"
        );

        verify(blogNotificationRepository).save(argThat(notif ->
                notif.getType() == NotificationType.NEW_POST &&
                notif.getMessage().equals("a publié un nouvel article")
        ));
    }
}
