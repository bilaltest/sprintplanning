package com.catsbanque.mabanquetools.entity;

/**
 * Enumération des niveaux de permission pour un module.
 *
 * Définit les droits d'accès qu'un utilisateur peut avoir sur un module donné.
 */
public enum PermissionLevel {
    /**
     * Aucun accès - Le module est masqué pour l'utilisateur
     */
    NONE,

    /**
     * Lecture seule - L'utilisateur peut consulter les données mais pas les modifier
     * Les boutons de création/modification/suppression sont masqués
     */
    READ,

    /**
     * Lecture + Écriture - L'utilisateur a accès complet
     * Peut consulter, créer, modifier et supprimer les données
     */
    WRITE
}
