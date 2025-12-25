package com.catsbanque.mabanquetools.repository;

import com.catsbanque.mabanquetools.entity.BlogComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlogCommentRepository extends JpaRepository<BlogComment, String> {

    // Commentaires top-level d'un post (sans parent)
    @Query("SELECT c FROM BlogComment c " +
            "LEFT JOIN FETCH c.author " +
            "WHERE c.blogPost.id = :postId AND c.parent IS NULL " +
            "ORDER BY c.createdAt DESC")
    List<BlogComment> findTopLevelCommentsByPostId(@Param("postId") String postId);

    // Tous les commentaires d'un post (avec threads)
    @Query("SELECT c FROM BlogComment c " +
            "LEFT JOIN FETCH c.author " +
            "WHERE c.blogPost.id = :postId " +
            "ORDER BY c.createdAt ASC")
    List<BlogComment> findAllByPostId(@Param("postId") String postId);

    // Réponses d'un commentaire parent
    @Query("SELECT c FROM BlogComment c " +
            "LEFT JOIN FETCH c.author " +
            "WHERE c.parent.id = :parentId " +
            "ORDER BY c.createdAt ASC")
    List<BlogComment> findRepliesByParentId(@Param("parentId") String parentId);

    // Commentaires d'un utilisateur
    @Query("SELECT c FROM BlogComment c WHERE c.author.id = :authorId ORDER BY c.createdAt DESC")
    List<BlogComment> findByAuthorId(@Param("authorId") String authorId);

    // Compter les commentaires d'un post
    long countByBlogPostId(String postId);

    // Compter les réponses d'un commentaire
    long countByParentId(String parentId);
}
