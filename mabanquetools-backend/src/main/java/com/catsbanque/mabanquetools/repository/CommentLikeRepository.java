package com.catsbanque.mabanquetools.repository;

import com.catsbanque.mabanquetools.entity.CommentLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommentLikeRepository extends JpaRepository<CommentLike, String> {

    // Vérifier si un utilisateur a liké un commentaire
    @Query("SELECT l FROM CommentLike l WHERE l.comment.id = :commentId AND l.user.id = :userId")
    Optional<CommentLike> findByCommentIdAndUserId(@Param("commentId") String commentId, @Param("userId") String userId);

    // Compter les likes d'un commentaire
    long countByCommentId(String commentId);

    // Supprimer un like spécifique (toggle)
    void deleteByCommentIdAndUserId(String commentId, String userId);
}
