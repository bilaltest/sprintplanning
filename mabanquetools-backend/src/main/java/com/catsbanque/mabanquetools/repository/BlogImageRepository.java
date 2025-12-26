package com.catsbanque.mabanquetools.repository;

import com.catsbanque.mabanquetools.entity.BlogImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlogImageRepository extends JpaRepository<BlogImage, String> {

    // Toutes les images triées par date (galerie)
    @Query("SELECT i FROM BlogImage i ORDER BY i.createdAt DESC")
    List<BlogImage> findAllByOrderByCreatedAtDesc();
}
