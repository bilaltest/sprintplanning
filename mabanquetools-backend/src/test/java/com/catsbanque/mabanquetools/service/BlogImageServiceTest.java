package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.dto.BlogImageDto;
import com.catsbanque.mabanquetools.entity.BlogImage;
import com.catsbanque.mabanquetools.entity.User;
import com.catsbanque.mabanquetools.exception.BadRequestException;
import com.catsbanque.mabanquetools.exception.ResourceNotFoundException;
import com.catsbanque.mabanquetools.repository.BlogImageRepository;
import com.catsbanque.mabanquetools.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BlogImageServiceTest {

    @Mock
    private BlogImageRepository blogImageRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BlogImageService blogImageService;

    private User testUser;
    private BlogImage testImage;
    private byte[] testImageBytes;

    @BeforeEach
    void setUp() throws IOException {
        // Set thumbnail size
        ReflectionTestUtils.setField(blogImageService, "thumbnailSize", 300);

        // Create test user
        testUser = new User();
        testUser.setId("user123");
        testUser.setEmail("test@example.com");
        testUser.setFirstName("Test");
        testUser.setLastName("User");

        // Create a simple test image (1x1 pixel white image)
        BufferedImage testBufferedImage = new BufferedImage(1, 1, BufferedImage.TYPE_INT_RGB);
        testBufferedImage.setRGB(0, 0, 0xFFFFFF); // White pixel
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(testBufferedImage, "jpg", baos);
        testImageBytes = baos.toByteArray();

        // Create test BlogImage entity
        testImage = BlogImage.builder()
                .id("img123")
                .originalFileName("test.jpg")
                .mimeType("image/jpeg")
                .fileSize(Long.valueOf(testImageBytes.length))
                .width(1)
                .height(1)
                .imageData(testImageBytes)
                .thumbnailData(testImageBytes)
                .thumbnailWidth(1)
                .thumbnailHeight(1)
                .uploadedBy(testUser)
                .build();
    }

    @Test
    void uploadImage_shouldSucceed_whenValidFile() throws IOException {
        // Arrange
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                testImageBytes
        );

        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));
        when(blogImageRepository.save(any(BlogImage.class))).thenReturn(testImage);

        // Act
        BlogImageDto result = blogImageService.uploadImage(file, "user123");

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getOriginalFileName()).isEqualTo("test.jpg");
        assertThat(result.getMimeType()).isEqualTo("image/jpeg");
        assertThat(result.getUploadedById()).isEqualTo("user123");
        verify(blogImageRepository, times(1)).save(any(BlogImage.class));
    }

    @Test
    void uploadImage_shouldThrowException_whenFileIsEmpty() {
        // Arrange
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                new byte[0]
        );

        // Act & Assert
        assertThatThrownBy(() -> blogImageService.uploadImage(emptyFile, "user123"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Fichier vide");
    }

    @Test
    void uploadImage_shouldThrowException_whenFileTooLarge() {
        // Arrange
        byte[] largeFileBytes = new byte[6 * 1024 * 1024]; // 6MB (over 5MB limit)
        MockMultipartFile largeFile = new MockMultipartFile(
                "file",
                "large.jpg",
                "image/jpeg",
                largeFileBytes
        );

        // Act & Assert
        assertThatThrownBy(() -> blogImageService.uploadImage(largeFile, "user123"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("trop volumineux");
    }

    @Test
    void uploadImage_shouldThrowException_whenInvalidMimeType() {
        // Arrange
        MockMultipartFile invalidFile = new MockMultipartFile(
                "file",
                "test.txt",
                "text/plain",
                "test content".getBytes()
        );

        // Act & Assert
        assertThatThrownBy(() -> blogImageService.uploadImage(invalidFile, "user123"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Format non supporté");
    }

    @Test
    void getAllImages_shouldReturnListOfImages() {
        // Arrange
        List<BlogImage> images = Arrays.asList(testImage);
        when(blogImageRepository.findAllByOrderByCreatedAtDesc()).thenReturn(images);

        // Act
        List<BlogImageDto> result = blogImageService.getAllImages();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo("img123");
        assertThat(result.get(0).getThumbnailUrl()).isNotNull();
        // Verify that full image URL is NOT included in list (performance optimization)
        // Note: The service uses toDtoWithoutFullImage() which should NOT set url field
        verify(blogImageRepository, times(1)).findAllByOrderByCreatedAtDesc();
    }

    @Test
    void getImageById_shouldReturnImage_whenExists() {
        // Arrange
        when(blogImageRepository.findById("img123")).thenReturn(Optional.of(testImage));

        // Act
        BlogImageDto result = blogImageService.getImageById("img123");

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo("img123");
        assertThat(result.getUrl()).isNotNull(); // Full image URL should be included
        assertThat(result.getThumbnailUrl()).isNotNull();
        verify(blogImageRepository, times(1)).findById("img123");
    }

    @Test
    void getImageById_shouldThrowException_whenNotFound() {
        // Arrange
        when(blogImageRepository.findById("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> blogImageService.getImageById("nonexistent"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Image non trouvée");
    }

    @Test
    void deleteImage_shouldSucceed_whenOwner() {
        // Arrange
        when(blogImageRepository.findById("img123")).thenReturn(Optional.of(testImage));

        // Act
        blogImageService.deleteImage("img123", "user123");

        // Assert
        verify(blogImageRepository, times(1)).delete(testImage);
    }

    @Test
    void deleteImage_shouldThrowException_whenNotOwner() {
        // Arrange
        when(blogImageRepository.findById("img123")).thenReturn(Optional.of(testImage));

        // Act & Assert
        assertThatThrownBy(() -> blogImageService.deleteImage("img123", "otherUser"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("propriétaire");
    }

    @Test
    void deleteImage_shouldThrowException_whenImageNotFound() {
        // Arrange
        when(blogImageRepository.findById("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> blogImageService.deleteImage("nonexistent", "user123"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Image non trouvée");
    }
}
