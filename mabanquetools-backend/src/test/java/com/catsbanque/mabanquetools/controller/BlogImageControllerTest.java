package com.catsbanque.mabanquetools.controller;

import com.catsbanque.mabanquetools.dto.BlogImageDto;
import com.catsbanque.mabanquetools.service.BlogImageService;
import com.catsbanque.mabanquetools.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit tests for BlogImageController
 */
@ExtendWith(MockitoExtension.class)
class BlogImageControllerTest {

    @Mock
    private BlogImageService blogImageService;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private HttpServletRequest request;

    @InjectMocks
    private BlogImageController blogImageController;

    @BeforeEach
    void setUp() {
        // Mock JWT extraction to return user123 (lenient because not all tests use it)
        lenient().when(jwtUtil.extractUserIdFromRequest(any(HttpServletRequest.class)))
                .thenReturn(Optional.of("user123"));
    }

    @Test
    void uploadImage_shouldReturnCreated_whenValidFile() throws Exception {
        // Arrange
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                "test content".getBytes()
        );

        BlogImageDto expectedDto = BlogImageDto.builder()
                .id("img123")
                .originalFileName("test.jpg")
                .build();

        when(blogImageService.uploadImage(any(), anyString())).thenReturn(expectedDto);

        // Act
        ResponseEntity<BlogImageDto> response = blogImageController.uploadImage(file, request);

        // Assert
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getId()).isEqualTo("img123");
    }

    @Test
    void getAllImages_shouldReturnOk_withListOfImages() {
        // Arrange
        List<BlogImageDto> images = Arrays.asList(
                BlogImageDto.builder()
                        .id("img1")
                        .originalFileName("image1.jpg")
                        .build()
        );

        when(blogImageService.getAllImages()).thenReturn(images);

        // Act
        ResponseEntity<List<BlogImageDto>> response = blogImageController.getAllImages();

        // Assert
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void getImageById_shouldReturnOk_whenImageExists() {
        // Arrange
        BlogImageDto image = BlogImageDto.builder()
                .id("img123")
                .originalFileName("test.jpg")
                .build();

        when(blogImageService.getImageById("img123")).thenReturn(image);

        // Act
        ResponseEntity<BlogImageDto> response = blogImageController.getImageById("img123");

        // Assert
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getId()).isEqualTo("img123");
    }

    @Test
    void deleteImage_shouldReturnNoContent_whenSuccessful() {
        // Arrange
        doNothing().when(blogImageService).deleteImage("img123", "user123");

        // Act
        ResponseEntity<Void> response = blogImageController.deleteImage("img123", request);

        // Assert
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
    }
}
