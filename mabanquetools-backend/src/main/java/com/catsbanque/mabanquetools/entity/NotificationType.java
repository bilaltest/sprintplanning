package com.catsbanque.mabanquetools.entity;

public enum NotificationType {
    NEW_POST,        // Nouvel article publié
    NEW_COMMENT,     // Nouveau commentaire sur mon article
    COMMENT_REPLY,   // Réponse à mon commentaire
    POST_LIKE,       // Like sur mon article
    COMMENT_LIKE,    // Like sur mon commentaire
    MENTION          // Mention @user dans un article ou commentaire
}
