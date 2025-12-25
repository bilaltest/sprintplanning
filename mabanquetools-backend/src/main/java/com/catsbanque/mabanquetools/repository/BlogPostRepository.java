package com.catsbanque.mabanquetools.repository;

import com.catsbanque.mabanquetools.entity.BlogPost;
import com.catsbanque.mabanquetools.entity.BlogPostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BlogPostRepository extends JpaRepository<BlogPost, String> {

    // Recherche par slug (pour URLs SEO-friendly)
    Optional<BlogPost> findBySlug(String slug);

    // Recherche par slug OU id (pattern existant dans le codebase pour releases)
    @Query("SELECT p FROM BlogPost p WHERE p.slug = :identifier OR p.id = :identifier")
    Optional<BlogPost> findBySlugOrId(@Param("identifier") String identifier);

    // Liste des posts publiés (avec eager fetch pour éviter N+1)
    @Query("SELECT DISTINCT p FROM BlogPost p " +
            "LEFT JOIN FETCH p.author " +
            "LEFT JOIN FETCH p.tags " +
            "WHERE p.status = 'PUBLISHED' " +
            "ORDER BY p.publishedAt DESC")
    List<BlogPost> findAllPublished();

    // Liste paginée des posts publiés
    @Query("SELECT p FROM BlogPost p WHERE p.status = 'PUBLISHED' ORDER BY p.publishedAt DESC")
    Page<BlogPost> findAllPublished(Pageable pageable);

    // Recherche full-text (MySQL FULLTEXT INDEX requis)
    @Query(value = "SELECT * FROM blog_post WHERE " +
            "MATCH(title, content) AGAINST (:query IN NATURAL LANGUAGE MODE) " +
            "AND status = 'PUBLISHED' " +
            "ORDER BY published_at DESC",
            nativeQuery = true)
    List<BlogPost> fullTextSearch(@Param("query") String query);

    // Recherche simple (LIKE) pour fallback si pas de FULLTEXT INDEX
    @Query("SELECT p FROM BlogPost p WHERE p.status = 'PUBLISHED' AND " +
            "(LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.content) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "ORDER BY p.publishedAt DESC")
    List<BlogPost> searchPublishedPosts(@Param("search") String search);

    // Recherche par tags
    @Query("SELECT DISTINCT p FROM BlogPost p " +
            "LEFT JOIN FETCH p.tags t " +
            "WHERE t.id IN :tagIds AND p.status = 'PUBLISHED' " +
            "ORDER BY p.publishedAt DESC")
    List<BlogPost> findByTagsIn(@Param("tagIds") List<String> tagIds);

    // Posts par auteur (tous statuts)
    @Query("SELECT p FROM BlogPost p WHERE p.author.id = :authorId ORDER BY p.createdAt DESC")
    List<BlogPost> findByAuthorId(@Param("authorId") String authorId);

    // Posts par auteur et statut
    @Query("SELECT p FROM BlogPost p WHERE p.author.id = :authorId AND p.status = :status ORDER BY p.createdAt DESC")
    List<BlogPost> findByAuthorIdAndStatus(@Param("authorId") String authorId, @Param("status") BlogPostStatus status);

    // Posts récents (pour newsletter)
    @Query("SELECT p FROM BlogPost p WHERE p.status = 'PUBLISHED' AND p.publishedAt >= :since ORDER BY p.publishedAt DESC")
    List<BlogPost> findRecentPublished(@Param("since") LocalDateTime since);

    // Posts populaires (tri par vues)
    @Query("SELECT p FROM BlogPost p WHERE p.status = 'PUBLISHED' ORDER BY p.viewCount DESC, p.publishedAt DESC")
    Page<BlogPost> findPopularPosts(Pageable pageable);

    // Posts les plus aimés
    @Query("SELECT p FROM BlogPost p WHERE p.status = 'PUBLISHED' ORDER BY p.likeCount DESC, p.publishedAt DESC")
    Page<BlogPost> findMostLikedPosts(Pageable pageable);

    // Compter posts par statut
    long countByStatus(BlogPostStatus status);

    // Vérifier existence du slug (pour génération unique)
    boolean existsBySlug(String slug);
}
