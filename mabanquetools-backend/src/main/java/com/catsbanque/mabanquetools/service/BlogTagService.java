package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.dto.BlogTagDto;
import com.catsbanque.mabanquetools.dto.CreateBlogTagRequest;
import com.catsbanque.mabanquetools.entity.BlogTag;
import com.catsbanque.mabanquetools.exception.BadRequestException;
import com.catsbanque.mabanquetools.exception.ResourceNotFoundException;
import com.catsbanque.mabanquetools.repository.BlogTagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BlogTagService {

    private final BlogTagRepository tagRepository;

    // Palette de couleurs prédéfinies pour les tags
    private static final String[] TAG_COLORS = {
            "#10b981", // Emerald (existant dans l'app)
            "#3b82f6", // Blue
            "#8b5cf6", // Purple
            "#ec4899", // Pink
            "#f59e0b", // Amber (existant dans l'app)
            "#ef4444", // Red
            "#14b8a6", // Teal
            "#06b6d4"  // Cyan
    };

    /**
     * Récupère tous les tags triés alphabétiquement.
     */
    @Transactional(readOnly = true)
    public List<BlogTagDto> getAllTags() {
        log.info("Récupération de tous les tags");
        List<BlogTag> tags = tagRepository.findAllOrderByName();
        return tags.stream()
                .map(BlogTagDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Récupère un tag par son ID.
     */
    @Transactional(readOnly = true)
    public BlogTagDto getTagById(String tagId) {
        log.info("Récupération du tag: {}", tagId);
        BlogTag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("Tag non trouvé: " + tagId));
        return BlogTagDto.fromEntity(tag);
    }

    /**
     * Crée un nouveau tag.
     */
    @Transactional
    public BlogTagDto createTag(CreateBlogTagRequest request) {
        log.info("Création d'un tag: {}", request.getName());

        // Vérifier que le nom n'existe pas déjà (case insensitive)
        if (tagRepository.findByNameIgnoreCase(request.getName()).isPresent()) {
            throw new BadRequestException("Un tag avec ce nom existe déjà: " + request.getName());
        }

        // Générer un slug unique
        String slug = generateUniqueSlug(request.getName());

        // Générer une couleur aléatoire si non fournie
        String color = request.getColor();
        if (color == null || color.isEmpty()) {
            color = generateRandomColor();
        }

        BlogTag tag = BlogTag.builder()
                .name(request.getName())
                .slug(slug)
                .color(color)
                .build();

        BlogTag saved = tagRepository.save(tag);
        log.info("Tag créé avec succès: {} (slug: {})", saved.getId(), saved.getSlug());

        return BlogTagDto.fromEntity(saved);
    }

    /**
     * Supprime un tag.
     * Note: Les relations ManyToMany avec BlogPost seront automatiquement nettoyées.
     */
    @Transactional
    public void deleteTag(String tagId) {
        log.info("Suppression du tag: {}", tagId);

        BlogTag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("Tag non trouvé: " + tagId));

        tagRepository.delete(tag);
        log.info("Tag supprimé avec succès: {}", tagId);
    }

    /**
     * Génère un slug URL-friendly unique à partir d'un nom de tag.
     */
    private String generateUniqueSlug(String name) {
        // Normaliser le texte (retirer les accents)
        String normalized = Normalizer.normalize(name, Normalizer.Form.NFD);
        String withoutAccents = normalized.replaceAll("\\p{M}", "");

        // Convertir en lowercase et remplacer les caractères non alphanumériques par des tirets
        String baseSlug = withoutAccents.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", ""); // Retirer les tirets en début/fin

        // Vérifier l'unicité et ajouter un suffixe numérique si nécessaire
        String slug = baseSlug;
        int counter = 1;
        while (tagRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }

        return slug;
    }

    /**
     * Génère une couleur aléatoire depuis la palette prédéfinie.
     */
    private String generateRandomColor() {
        Random random = new Random();
        return TAG_COLORS[random.nextInt(TAG_COLORS.length)];
    }
}
