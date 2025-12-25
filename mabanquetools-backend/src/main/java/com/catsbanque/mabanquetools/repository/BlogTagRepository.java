package com.catsbanque.mabanquetools.repository;

import com.catsbanque.mabanquetools.entity.BlogTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlogTagRepository extends JpaRepository<BlogTag, String> {

    // Recherche par slug
    Optional<BlogTag> findBySlug(String slug);

    // Recherche par nom (case insensitive)
    @Query("SELECT t FROM BlogTag t WHERE LOWER(t.name) = LOWER(:name)")
    Optional<BlogTag> findByNameIgnoreCase(@Param("name") String name);

    // Tous les tags triés alphabétiquement
    @Query("SELECT t FROM BlogTag t ORDER BY t.name ASC")
    List<BlogTag> findAllOrderByName();

    // Tags populaires (avec le plus de posts)
    @Query("SELECT t FROM BlogTag t ORDER BY SIZE(t.posts) DESC")
    List<BlogTag> findPopularTags();

    // Vérifier existence du slug
    boolean existsBySlug(String slug);
}
