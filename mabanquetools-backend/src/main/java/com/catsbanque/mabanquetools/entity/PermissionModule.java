package com.catsbanque.mabanquetools.entity;

/**
 * Enumération des modules de l'application pour la gestion des permissions.
 *
 * Chaque module représente une fonctionnalité majeure de l'application
 * pour laquelle des permissions peuvent être définies.
 */
public enum PermissionModule {
    /**
     * Module Calendrier - Timeline trimestrielle des événements
     * Inclut également Settings (héritage des droits)
     */
    CALENDAR,

    /**
     * Module Préparation des MEP - Gestion des releases et squads
     * Inclut également l'historique des releases (héritage des droits)
     */
    RELEASES,

    /**
     * Module Administration - Gestion des utilisateurs et permissions
     * Accès aux statistiques, export/import de la base de données
     */
    ADMIN,

    /**
     * Module Absences - Gestion des congés et absences
     * Visualisation timeline et demande de congés
     */
    ABSENCE,

    /**
     * Module Playground - Jeux et expérimentations
     */
    PLAYGROUND,

    /**
     * Module Blog - Blog interne de la DSI
     * Publication d'articles, commentaires, gestion des contenus
     */
    BLOG
}
