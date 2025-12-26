package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.dto.BlogImageDto;
import com.catsbanque.mabanquetools.entity.BlogImage;
import com.catsbanque.mabanquetools.entity.User;
import com.catsbanque.mabanquetools.exception.BadRequestException;
import com.catsbanque.mabanquetools.exception.ResourceNotFoundException;
import com.catsbanque.mabanquetools.repository.BlogImageRepository;
import com.catsbanque.mabanquetools.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.imgscalr.Scalr;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BlogImageService {

    private final BlogImageRepository blogImageRepository;
    private final UserRepository userRepository;

    @Value("${app.blog.thumbnail-size:300}")
    private int thumbnailSize;

    /**
     * Upload une image avec génération de thumbnail.
     */
    @Transactional
    public BlogImageDto uploadImage(MultipartFile file, String userId) throws IOException {
        log.info("Upload image: {} par user {}", file.getOriginalFilename(), userId);

        // 1. Validation
        validateFile(file);

        // 2. Lecture bytes
        byte[] imageBytes = file.getBytes();

        // 3. Extraction dimensions image originale
        BufferedImage originalImage = ImageIO.read(new ByteArrayInputStream(imageBytes));
        if (originalImage == null) {
            throw new BadRequestException("Impossible de lire l'image");
        }

        int width = originalImage.getWidth();
        int height = originalImage.getHeight();

        // 4. Génération thumbnail
        BufferedImage thumbnailImage = Scalr.resize(originalImage,
                Scalr.Method.QUALITY,
                Scalr.Mode.FIT_TO_WIDTH,
                thumbnailSize,
                Scalr.OP_ANTIALIAS);

        int thumbnailWidth = thumbnailImage.getWidth();
        int thumbnailHeight = thumbnailImage.getHeight();

        // 5. Conversion thumbnail en bytes (JPEG pour réduire la taille)
        ByteArrayOutputStream thumbnailBaos = new ByteArrayOutputStream();
        ImageIO.write(thumbnailImage, "jpg", thumbnailBaos);
        byte[] thumbnailBytes = thumbnailBaos.toByteArray();

        // 6. Récupération utilisateur
        User uploader = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        // 7. Sauvegarde en DB
        BlogImage image = BlogImage.builder()
                .originalFileName(file.getOriginalFilename())
                .mimeType(file.getContentType())
                .fileSize(file.getSize())
                .width(width)
                .height(height)
                .imageData(imageBytes)
                .thumbnailData(thumbnailBytes)
                .thumbnailWidth(thumbnailWidth)
                .thumbnailHeight(thumbnailHeight)
                .uploadedBy(uploader)
                .build();

        image = blogImageRepository.save(image);

        log.info("Image uploadée: {} ({}x{}, {} bytes, thumbnail: {}x{})",
                image.getId(), width, height, file.getSize(),
                thumbnailWidth, thumbnailHeight);

        return toDto(image);
    }

    /**
     * Récupère toutes les images (thumbnails uniquement pour performance).
     */
    @Transactional(readOnly = true)
    public List<BlogImageDto> getAllImages() {
        log.info("Récupération de toutes les images (thumbnails only)");
        List<BlogImage> images = blogImageRepository.findAllByOrderByCreatedAtDesc();

        return images.stream()
                .map(this::toDtoWithoutFullImage)
                .collect(Collectors.toList());
    }

    /**
     * Récupère une image complète par son ID (avec imageData).
     */
    @Transactional(readOnly = true)
    public BlogImageDto getImageById(String imageId) {
        log.info("Récupération image complète: {}", imageId);

        BlogImage image = blogImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Image non trouvée: " + imageId));

        return toDto(image);
    }

    /**
     * Supprime une image.
     */
    @Transactional
    public void deleteImage(String imageId, String userId) {
        log.info("Suppression image: {} par user {}", imageId, userId);

        BlogImage image = blogImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Image non trouvée: " + imageId));

        // Vérifier ownership
        if (!image.getUploadedBy().getId().equals(userId)) {
            throw new BadRequestException("Vous n'êtes pas propriétaire de cette image");
        }

        blogImageRepository.delete(image);
        log.info("Image supprimée: {}", imageId);
    }

    /**
     * Valide le fichier uploadé.
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Fichier vide");
        }

        // Vérifier taille (5MB max)
        long maxSize = 5 * 1024 * 1024; // 5MB
        if (file.getSize() > maxSize) {
            throw new BadRequestException(String.format(
                    "Fichier trop volumineux: %.1f MB (max 5MB)",
                    file.getSize() / (1024.0 * 1024.0)));
        }

        // Vérifier type MIME
        String contentType = file.getContentType();
        List<String> allowedTypes = Arrays.asList("image/jpeg", "image/png", "image/webp");
        if (contentType == null || !allowedTypes.contains(contentType)) {
            throw new BadRequestException(
                    "Format non supporté: " + contentType + " (formats acceptés: JPG, PNG, WEBP)");
        }
    }

    /**
     * Convertit BlogImage vers DTO (avec image complète).
     */
    private BlogImageDto toDto(BlogImage image) {
        return BlogImageDto.builder()
                .id(image.getId())
                .originalFileName(image.getOriginalFileName())
                .url(image.getUrl()) // Méthode @Transient qui génère data URL
                .thumbnailUrl(image.getThumbnailUrl()) // Méthode @Transient
                .mimeType(image.getMimeType())
                .fileSize(image.getFileSize())
                .width(image.getWidth())
                .height(image.getHeight())
                .thumbnailWidth(image.getThumbnailWidth())
                .thumbnailHeight(image.getThumbnailHeight())
                .uploadedById(image.getUploadedBy().getId())
                .uploadedByName(image.getUploadedBy().getFirstName() + " " + image.getUploadedBy().getLastName())
                .createdAt(image.getCreatedAt())
                .build();
    }

    /**
     * Convertit BlogImage vers DTO allégé (sans image complète, seulement thumbnail).
     */
    private BlogImageDto toDtoWithoutFullImage(BlogImage image) {
        return BlogImageDto.builder()
                .id(image.getId())
                .originalFileName(image.getOriginalFileName())
                // url (full image) non inclus dans la liste pour performance
                .thumbnailUrl(image.getThumbnailUrl()) // Seulement thumbnail
                .mimeType(image.getMimeType())
                .fileSize(image.getFileSize())
                .width(image.getWidth())
                .height(image.getHeight())
                .thumbnailWidth(image.getThumbnailWidth())
                .thumbnailHeight(image.getThumbnailHeight())
                .uploadedById(image.getUploadedBy().getId())
                .uploadedByName(image.getUploadedBy().getFirstName() + " " + image.getUploadedBy().getLastName())
                .createdAt(image.getCreatedAt())
                .build();
    }
}
