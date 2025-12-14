-- Script de migration pour initialiser les permissions par défaut pour tous les utilisateurs existants
-- À exécuter manuellement une fois pour migrer les utilisateurs existants

-- Permissions par défaut (WRITE pour tous les modules)
-- CALENDAR: WRITE
-- RELEASES: WRITE
-- ADMIN: WRITE

-- Ajouter les permissions CALENDAR pour tous les utilisateurs qui n'en ont pas
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at)
SELECT
    CONCAT('c', CONV(UNIX_TIMESTAMP(NOW()), 10, 36), LPAD(CONV(FLOOR(RAND() * 2176782335), 10, 36), 6, '0')) AS id,
    u.id AS user_id,
    'CALENDAR' AS module,
    'WRITE' AS permission_level,
    NOW() AS created_at,
    NOW() AS updated_at
FROM app_user u
WHERE NOT EXISTS (
    SELECT 1 FROM user_permissions up
    WHERE up.user_id = u.id AND up.module = 'CALENDAR'
);

-- Ajouter les permissions RELEASES pour tous les utilisateurs qui n'en ont pas
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at)
SELECT
    CONCAT('c', CONV(UNIX_TIMESTAMP(NOW()), 10, 36), LPAD(CONV(FLOOR(RAND() * 2176782335), 10, 36), 6, '0')) AS id,
    u.id AS user_id,
    'RELEASES' AS module,
    'WRITE' AS permission_level,
    NOW() AS created_at,
    NOW() AS updated_at
FROM app_user u
WHERE NOT EXISTS (
    SELECT 1 FROM user_permissions up
    WHERE up.user_id = u.id AND up.module = 'RELEASES'
);

-- Ajouter les permissions ADMIN WRITE pour tous les utilisateurs qui n'en ont pas
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at)
SELECT
    CONCAT('c', CONV(UNIX_TIMESTAMP(NOW()), 10, 36), LPAD(CONV(FLOOR(RAND() * 2176782335), 10, 36), 6, '0')) AS id,
    u.id AS user_id,
    'ADMIN' AS module,
    'WRITE' AS permission_level,
    NOW() AS created_at,
    NOW() AS updated_at
FROM app_user u
WHERE NOT EXISTS (
    SELECT 1 FROM user_permissions up
    WHERE up.user_id = u.id AND up.module = 'ADMIN'
);

-- Afficher le résultat
SELECT
    u.email,
    u.first_name,
    u.last_name,
    up.module,
    up.permission_level
FROM app_user u
LEFT JOIN user_permissions up ON u.id = up.user_id
ORDER BY u.email, up.module;
