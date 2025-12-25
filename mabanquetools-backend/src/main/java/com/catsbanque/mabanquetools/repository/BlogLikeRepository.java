package com.catsbanque.mabanquetools.repository;

import com.catsbanque.mabanquetools.entity.BlogLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BlogLikeRepository extends JpaRepository<BlogLike, String> {

    // Vérifier si un utilisateur a liké un post
    @Query("SELECT l FROM BlogLike l WHERE l.blogPost.id = :postId AND l.user.id = :userId")
    Optional<BlogLike> findByPostIdAndUserId(@Param("postId") String postId, @Param("userId") String userId);

    // Compter les likes d'un post
    long countByBlogPostId(String postId);

    // Supprimer un like spécifique (toggle)
    void deleteByBlogPostIdAndUserId(String postId, String userId);
}
