package com.catsbanque.mabanquetools.entity;

public enum BlogPostStatus {
    DRAFT,      // Brouillon (visible uniquement par l'auteur)
    PUBLISHED,  // Publié (visible par tous avec READ permission)
    ARCHIVED    // Archivé (masqué de la liste principale)
}
