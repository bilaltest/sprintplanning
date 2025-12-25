package com.catsbanque.mabanquetools.repository;

import com.catsbanque.mabanquetools.entity.BlogImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlogImageRepository extends JpaRepository<BlogImage, String> {

    // Recherche par nom de fichier
    Optional<BlogImage> findByFileName(String fileName);

    // Images uploadées par un utilisateur
    @Query("SELECT i FROM BlogImage i WHERE i.uploadedBy.id = :userId ORDER BY i.createdAt DESC")
    List<BlogImage> findByUploadedById(@Param("userId") String userId);

    // Images récentes (galerie)
    @Query("SELECT i FROM BlogImage i ORDER BY i.createdAt DESC")
    List<BlogImage> findRecentImages();

    // Vérifier existence du nom de fichier
    boolean existsByFileName(String fileName);
}
