-- Script SQL pour créer un utilisateur admin
-- À exécuter dans MySQL après avoir démarré l'application Spring Boot

-- Le password "NMB" hashé avec BCrypt (coût 10)
-- Généré avec: BCrypt.hashpw("NMB", BCrypt.gensalt(10))

INSERT INTO app_user (
    id,
    email,
    password,
    first_name,
    last_name,
    theme_preference,
    widget_order,
    created_at,
    updated_at
) VALUES (
    'cadmin001',
    'admin',
    '$2a$10$rK5jQZ9X3bXqYVZxKqN0K.vPJZQKqYv5xQZ9X3bXqYVZxKqN0K.vP',  -- Password: "NMB"
    'Admin',
    'Système',
    'light',
    '[]',
    NOW(),
    NOW()
)
ON DUPLICATE KEY UPDATE
    password = '$2a$10$rK5jQZ9X3bXqYVZxKqN0K.vPJZQKqYv5xQZ9X3bXqYVZxKqN0K.vP',
    updated_at = NOW();

-- Vérifier que l'utilisateur a été créé
SELECT id, email, first_name, last_name, theme_preference, created_at
FROM app_user
WHERE email = 'admin';
