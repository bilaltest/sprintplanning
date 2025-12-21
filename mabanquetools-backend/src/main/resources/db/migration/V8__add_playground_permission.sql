-- Ajout de la permission PLAYGROUND avec accès par défaut pour tous les utilisateurs existants
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at)
SELECT
    -- Génération d'un ID de type CUID simulé
    CONCAT('c', CONV(UNIX_TIMESTAMP(NOW()), 10, 36), LPAD(CONV(FLOOR(RAND() * 2176782335), 10, 36), 6, '0')) AS id,
    u.id AS user_id,
    'PLAYGROUND' AS module,
    'WRITE' AS permission_level, -- On donne les droits d'écriture par défaut comme pour les autres modules
    NOW() AS created_at,
    NOW() AS updated_at
FROM app_user u
WHERE NOT EXISTS (
    SELECT 1 FROM user_permissions up
    WHERE up.user_id = u.id AND up.module = 'PLAYGROUND'
);
