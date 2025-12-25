package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.dto.BlogPostDto;
import com.catsbanque.mabanquetools.dto.CreateBlogPostRequest;
import com.catsbanque.mabanquetools.dto.UpdateBlogPostRequest;
import com.catsbanque.mabanquetools.entity.*;
import com.catsbanque.mabanquetools.exception.BadRequestException;
import com.catsbanque.mabanquetools.exception.ResourceNotFoundException;
import com.catsbanque.mabanquetools.repository.BlogLikeRepository;
import com.catsbanque.mabanquetools.repository.BlogPostRepository;
import com.catsbanque.mabanquetools.repository.BlogTagRepository;
import com.catsbanque.mabanquetools.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires pour BlogPostService.
 * Pattern: MockitoExtension + @Mock + @InjectMocks.
 */
@ExtendWith(MockitoExtension.class)
class BlogPostServiceTest {

    @Mock
    private BlogPostRepository blogPostRepository;

    @Mock
    private BlogTagRepository blogTagRepository;

    @Mock
    private BlogLikeRepository blogLikeRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BlogPostService blogPostService;

    private User mockAuthor;
    private BlogPost mockPost;
    private BlogTag mockTag;

    @BeforeEach
    void setUp() {
        // Mock author
        mockAuthor = new User();
        mockAuthor.setId("user123");
        mockAuthor.setEmail("author@ca-ts.fr");
        mockAuthor.setFirstName("John");
        mockAuthor.setLastName("Doe");

        // Mock tag
        mockTag = BlogTag.builder()
                .id("tag123")
                .name("Tech")
                .slug("tech")
                .color("#10b981")
                .build();

        // Mock post
        mockPost = BlogPost.builder()
                .id("post123")
                .slug("mon-premier-article")
                .title("Mon premier article")
                .content("<p>Contenu HTML du post</p>")
                .excerpt("Contenu HTML du post")
                .status(BlogPostStatus.DRAFT)
                .author(mockAuthor)
                .viewCount(0)
                .likeCount(0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    // ==================== Tests getAllPublishedPosts ====================

    @Test
    void getAllPublishedPosts_shouldReturnListOfPublishedPosts() {
        // Given
        List<BlogPost> mockPosts = List.of(mockPost);
        when(blogPostRepository.findAllPublished()).thenReturn(mockPosts);

        // When
        List<BlogPostDto> result = blogPostService.getAllPublishedPosts();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Mon premier article");
        verify(blogPostRepository, times(1)).findAllPublished();
    }

    // ==================== Tests getPostBySlugOrId ====================

    @Test
    void getPostBySlugOrId_shouldReturnPostAndIncrementViewCount() {
        // Given
        when(blogPostRepository.findBySlugOrId("mon-premier-article"))
                .thenReturn(Optional.of(mockPost));
        when(blogPostRepository.save(any(BlogPost.class))).thenReturn(mockPost);
        when(blogLikeRepository.findByPostIdAndUserId(anyString(), anyString()))
                .thenReturn(Optional.empty());

        // When
        BlogPostDto result = blogPostService.getPostBySlugOrId("mon-premier-article", "user123");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Mon premier article");
        assertThat(mockPost.getViewCount()).isEqualTo(1); // Incrémenté
        verify(blogPostRepository, times(1)).save(mockPost);
    }

    @Test
    void getPostBySlugOrId_shouldThrowExceptionWhenPostNotFound() {
        // Given
        when(blogPostRepository.findBySlugOrId("invalid-slug"))
                .thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> blogPostService.getPostBySlugOrId("invalid-slug", "user123"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Post non trouvé");
    }

    // ==================== Tests createPost ====================

    @Test
    void createPost_shouldCreatePostWithDraftStatus() {
        // Given
        CreateBlogPostRequest request = CreateBlogPostRequest.builder()
                .title("Nouveau Post")
                .content("<p>Contenu du nouveau post</p>")
                .build();

        when(userRepository.findById("user123")).thenReturn(Optional.of(mockAuthor));
        when(blogPostRepository.existsBySlug(anyString())).thenReturn(false);
        when(blogPostRepository.save(any(BlogPost.class))).thenReturn(mockPost);

        // When
        BlogPostDto result = blogPostService.createPost(request, "user123");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(BlogPostStatus.DRAFT);
        verify(blogPostRepository, times(1)).save(any(BlogPost.class));
    }

    @Test
    void createPost_shouldGenerateUniqueSlugFromTitle() {
        // Given
        CreateBlogPostRequest request = CreateBlogPostRequest.builder()
                .title("Mon Article Génial!")
                .content("<p>Contenu</p>")
                .build();

        when(userRepository.findById("user123")).thenReturn(Optional.of(mockAuthor));
        when(blogPostRepository.existsBySlug("mon-article-genial")).thenReturn(false);
        when(blogPostRepository.save(any(BlogPost.class))).thenAnswer(invocation -> {
            BlogPost saved = invocation.getArgument(0);
            assertThat(saved.getSlug()).isEqualTo("mon-article-genial");
            return saved;
        });

        // When
        blogPostService.createPost(request, "user123");

        // Then
        verify(blogPostRepository, times(1)).save(any(BlogPost.class));
    }

    @Test
    void createPost_shouldGenerateExcerptAutomatically() {
        // Given
        String longContent = "<p>" + "a".repeat(250) + "</p>";
        CreateBlogPostRequest request = CreateBlogPostRequest.builder()
                .title("Test Excerpt")
                .content(longContent)
                .build();

        when(userRepository.findById("user123")).thenReturn(Optional.of(mockAuthor));
        when(blogPostRepository.existsBySlug(anyString())).thenReturn(false);
        when(blogPostRepository.save(any(BlogPost.class))).thenAnswer(invocation -> {
            BlogPost saved = invocation.getArgument(0);
            assertThat(saved.getExcerpt()).hasSize(203); // 200 chars + "..."
            assertThat(saved.getExcerpt()).endsWith("...");
            return saved;
        });

        // When
        blogPostService.createPost(request, "user123");

        // Then
        verify(blogPostRepository, times(1)).save(any(BlogPost.class));
    }

    @Test
    void createPost_shouldThrowExceptionWhenAuthorNotFound() {
        // Given
        CreateBlogPostRequest request = CreateBlogPostRequest.builder()
                .title("Test")
                .content("<p>Content</p>")
                .build();

        when(userRepository.findById("invalid-user")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> blogPostService.createPost(request, "invalid-user"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Utilisateur non trouvé");
    }

    // ==================== Tests updatePost ====================

    @Test
    void updatePost_shouldUpdatePostFields() {
        // Given
        UpdateBlogPostRequest request = UpdateBlogPostRequest.builder()
                .title("Titre Modifié")
                .content("<p>Contenu modifié</p>")
                .build();

        when(blogPostRepository.findById("post123")).thenReturn(Optional.of(mockPost));
        when(blogPostRepository.existsBySlug(anyString())).thenReturn(false);
        when(blogPostRepository.save(any(BlogPost.class))).thenReturn(mockPost);

        // When
        BlogPostDto result = blogPostService.updatePost("post123", request, "user123");

        // Then
        assertThat(result).isNotNull();
        verify(blogPostRepository, times(1)).save(mockPost);
    }

    @Test
    void updatePost_shouldThrowExceptionWhenNotAuthor() {
        // Given
        UpdateBlogPostRequest request = UpdateBlogPostRequest.builder()
                .title("Titre Modifié")
                .build();

        when(blogPostRepository.findById("post123")).thenReturn(Optional.of(mockPost));

        // When & Then
        assertThatThrownBy(() -> blogPostService.updatePost("post123", request, "other-user"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Vous n'êtes pas autorisé");
    }

    // ==================== Tests publishPost ====================

    @Test
    void publishPost_shouldChangeStatusToPublished() {
        // Given
        mockPost.setStatus(BlogPostStatus.DRAFT);
        when(blogPostRepository.findById("post123")).thenReturn(Optional.of(mockPost));
        when(blogPostRepository.save(any(BlogPost.class))).thenReturn(mockPost);

        // When
        BlogPostDto result = blogPostService.publishPost("post123", "user123");

        // Then
        assertThat(result).isNotNull();
        assertThat(mockPost.getStatus()).isEqualTo(BlogPostStatus.PUBLISHED);
        assertThat(mockPost.getPublishedAt()).isNotNull();
        verify(blogPostRepository, times(1)).save(mockPost);
    }

    @Test
    void publishPost_shouldThrowExceptionWhenNotDraft() {
        // Given
        mockPost.setStatus(BlogPostStatus.PUBLISHED);
        when(blogPostRepository.findById("post123")).thenReturn(Optional.of(mockPost));

        // When & Then
        assertThatThrownBy(() -> blogPostService.publishPost("post123", "user123"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Seuls les posts en DRAFT");
    }

    // ==================== Tests deletePost ====================

    @Test
    void deletePost_shouldDeletePostWhenAuthor() {
        // Given
        when(blogPostRepository.findById("post123")).thenReturn(Optional.of(mockPost));

        // When
        blogPostService.deletePost("post123", "user123");

        // Then
        verify(blogPostRepository, times(1)).delete(mockPost);
    }

    @Test
    void deletePost_shouldThrowExceptionWhenNotAuthor() {
        // Given
        when(blogPostRepository.findById("post123")).thenReturn(Optional.of(mockPost));

        // When & Then
        assertThatThrownBy(() -> blogPostService.deletePost("post123", "other-user"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Vous n'êtes pas autorisé");
    }

    // ==================== Tests toggleLike ====================

    @Test
    void toggleLike_shouldAddLikeWhenNotLiked() {
        // Given
        when(blogPostRepository.findById("post123")).thenReturn(Optional.of(mockPost));
        when(userRepository.findById("user123")).thenReturn(Optional.of(mockAuthor));
        when(blogLikeRepository.findByPostIdAndUserId("post123", "user123"))
                .thenReturn(Optional.empty());
        when(blogPostRepository.save(any(BlogPost.class))).thenReturn(mockPost);

        // When
        BlogPostDto result = blogPostService.toggleLike("post123", "user123");

        // Then
        assertThat(result).isNotNull();
        assertThat(mockPost.getLikeCount()).isEqualTo(1);
        verify(blogLikeRepository, times(1)).save(any(BlogLike.class));
    }

    @Test
    void toggleLike_shouldRemoveLikeWhenAlreadyLiked() {
        // Given
        BlogLike existingLike = BlogLike.builder()
                .id("like123")
                .blogPost(mockPost)
                .user(mockAuthor)
                .build();

        mockPost.setLikeCount(1);

        when(blogPostRepository.findById("post123")).thenReturn(Optional.of(mockPost));
        when(userRepository.findById("user123")).thenReturn(Optional.of(mockAuthor));
        when(blogLikeRepository.findByPostIdAndUserId("post123", "user123"))
                .thenReturn(Optional.of(existingLike));
        when(blogPostRepository.save(any(BlogPost.class))).thenReturn(mockPost);

        // When
        BlogPostDto result = blogPostService.toggleLike("post123", "user123");

        // Then
        assertThat(result).isNotNull();
        assertThat(mockPost.getLikeCount()).isEqualTo(0);
        verify(blogLikeRepository, times(1)).delete(existingLike);
    }
}
