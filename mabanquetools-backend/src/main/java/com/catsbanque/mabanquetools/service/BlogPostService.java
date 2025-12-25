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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BlogPostService {

    private final BlogPostRepository blogPostRepository;
    private final BlogTagRepository blogTagRepository;
    private final BlogLikeRepository blogLikeRepository;
    private final UserRepository userRepository;

    /**
     * Récupère tous les posts publiés.
     */
    @Transactional(readOnly = true)
    public List<BlogPostDto> getAllPublishedPosts() {
        log.info("Récupération de tous les posts publiés");
        List<BlogPost> posts = blogPostRepository.findAllPublished();
        return posts.stream()
                .map(BlogPostDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Récupère un post par son slug ou ID.
     * Incrémente le viewCount automatiquement.
     */
    @Transactional
    public BlogPostDto getPostBySlugOrId(String identifier, String currentUserId) {
        log.info("Récupération du post: {}", identifier);

        BlogPost post = blogPostRepository.findBySlugOrId(identifier)
                .orElseThrow(() -> new ResourceNotFoundException("Post non trouvé: " + identifier));

        // Incrémenter le viewCount
        post.setViewCount(post.getViewCount() + 1);
        blogPostRepository.save(post);

        BlogPostDto dto = BlogPostDto.fromEntity(post);

        // Enrichir avec le flag "isLikedByCurrentUser"
        if (currentUserId != null) {
            boolean isLiked = blogLikeRepository.findByPostIdAndUserId(post.getId(), currentUserId).isPresent();
            dto.setIsLikedByCurrentUser(isLiked);
        }

        return dto;
    }

    /**
     * Crée un nouveau post (status: DRAFT par défaut).
     */
    @Transactional
    public BlogPostDto createPost(CreateBlogPostRequest request, String authorId) {
        log.info("Création d'un post par l'utilisateur: {}", authorId);

        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé: " + authorId));

        // Générer un slug unique
        String slug = generateUniqueSlug(request.getTitle());

        // Générer l'excerpt automatiquement
        String excerpt = generateExcerpt(request.getContent());

        // Créer le post
        BlogPost post = BlogPost.builder()
                .slug(slug)
                .title(request.getTitle())
                .content(request.getContent())
                .excerpt(excerpt)
                .coverImage(request.getCoverImage())
                .status(BlogPostStatus.DRAFT)
                .author(author)
                .viewCount(0)
                .likeCount(0)
                .build();

        // Attacher les tags
        if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
            Set<BlogTag> tags = new HashSet<>(blogTagRepository.findAllById(request.getTagIds()));
            post.setTags(tags);
        }

        BlogPost saved = blogPostRepository.save(post);
        log.info("Post créé avec succès: {} (slug: {})", saved.getId(), saved.getSlug());

        return BlogPostDto.fromEntity(saved);
    }

    /**
     * Met à jour un post existant.
     * Seul l'auteur ou un admin peut modifier.
     */
    @Transactional
    public BlogPostDto updatePost(String postId, UpdateBlogPostRequest request, String currentUserId) {
        log.info("Mise à jour du post: {} par utilisateur: {}", postId, currentUserId);

        BlogPost post = blogPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post non trouvé: " + postId));

        // Vérifier que l'utilisateur courant est l'auteur
        if (!post.getAuthor().getId().equals(currentUserId)) {
            throw new BadRequestException("Vous n'êtes pas autorisé à modifier ce post");
        }

        // Mettre à jour les champs modifiables
        if (request.getTitle() != null) {
            post.setTitle(request.getTitle());
            // Régénérer le slug si le titre change
            String newSlug = generateUniqueSlug(request.getTitle());
            post.setSlug(newSlug);
        }

        if (request.getContent() != null) {
            post.setContent(request.getContent());
            // Régénérer l'excerpt
            post.setExcerpt(generateExcerpt(request.getContent()));
        }

        if (request.getCoverImage() != null) {
            post.setCoverImage(request.getCoverImage());
        }

        // Mettre à jour les tags
        if (request.getTagIds() != null) {
            Set<BlogTag> tags = new HashSet<>(blogTagRepository.findAllById(request.getTagIds()));
            post.setTags(tags);
        }

        BlogPost updated = blogPostRepository.save(post);
        log.info("Post mis à jour avec succès: {}", updated.getId());

        return BlogPostDto.fromEntity(updated);
    }

    /**
     * Publie un post (change status DRAFT → PUBLISHED).
     */
    @Transactional
    public BlogPostDto publishPost(String postId, String currentUserId) {
        log.info("Publication du post: {} par utilisateur: {}", postId, currentUserId);

        BlogPost post = blogPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post non trouvé: " + postId));

        // Vérifier que l'utilisateur courant est l'auteur
        if (!post.getAuthor().getId().equals(currentUserId)) {
            throw new BadRequestException("Vous n'êtes pas autorisé à publier ce post");
        }

        // Vérifier que le post est en DRAFT
        if (post.getStatus() != BlogPostStatus.DRAFT) {
            throw new BadRequestException("Seuls les posts en DRAFT peuvent être publiés");
        }

        post.setStatus(BlogPostStatus.PUBLISHED);
        post.setPublishedAt(LocalDateTime.now());

        BlogPost published = blogPostRepository.save(post);
        log.info("Post publié avec succès: {}", published.getId());

        // TODO: Créer des notifications pour les abonnés (v2.0)

        return BlogPostDto.fromEntity(published);
    }

    /**
     * Supprime un post.
     * Seul l'auteur ou un admin peut supprimer.
     */
    @Transactional
    public void deletePost(String postId, String currentUserId) {
        log.info("Suppression du post: {} par utilisateur: {}", postId, currentUserId);

        BlogPost post = blogPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post non trouvé: " + postId));

        // Vérifier que l'utilisateur courant est l'auteur
        if (!post.getAuthor().getId().equals(currentUserId)) {
            throw new BadRequestException("Vous n'êtes pas autorisé à supprimer ce post");
        }

        blogPostRepository.delete(post);
        log.info("Post supprimé avec succès: {}", postId);
    }

    /**
     * Toggle like sur un post (ajoute ou retire un like).
     */
    @Transactional
    public BlogPostDto toggleLike(String postId, String currentUserId) {
        log.info("Toggle like sur post: {} par utilisateur: {}", postId, currentUserId);

        BlogPost post = blogPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post non trouvé: " + postId));

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé: " + currentUserId));

        // Vérifier si l'utilisateur a déjà liké
        var existingLike = blogLikeRepository.findByPostIdAndUserId(postId, currentUserId);

        if (existingLike.isPresent()) {
            // Retirer le like
            blogLikeRepository.delete(existingLike.get());
            post.setLikeCount(post.getLikeCount() - 1);
            log.info("Like retiré du post: {}", postId);
        } else {
            // Ajouter un like
            BlogLike like = BlogLike.builder()
                    .blogPost(post)
                    .user(user)
                    .build();
            blogLikeRepository.save(like);
            post.setLikeCount(post.getLikeCount() + 1);
            log.info("Like ajouté au post: {}", postId);

            // TODO: Créer une notification pour l'auteur (v2.0)
        }

        BlogPost updated = blogPostRepository.save(post);
        BlogPostDto dto = BlogPostDto.fromEntity(updated);

        // Enrichir avec le flag "isLikedByCurrentUser"
        boolean isLiked = existingLike.isEmpty();
        dto.setIsLikedByCurrentUser(isLiked);

        return dto;
    }

    /**
     * Génère un slug URL-friendly unique à partir d'un titre.
     */
    private String generateUniqueSlug(String title) {
        // Normaliser le texte (retirer les accents)
        String normalized = Normalizer.normalize(title, Normalizer.Form.NFD);
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
        while (blogPostRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }

        return slug;
    }

    /**
     * Génère un excerpt (résumé) à partir du contenu HTML.
     * Extrait les 200 premiers caractères de texte brut.
     */
    private String generateExcerpt(String htmlContent) {
        if (htmlContent == null || htmlContent.isEmpty()) {
            return "";
        }

        // Retirer les balises HTML
        String plainText = htmlContent.replaceAll("<[^>]*>", "");

        // Retirer les espaces multiples et trim
        plainText = plainText.replaceAll("\\s+", " ").trim();

        // Limiter à 200 caractères
        if (plainText.length() > 200) {
            return plainText.substring(0, 200) + "...";
        }

        return plainText;
    }
}
