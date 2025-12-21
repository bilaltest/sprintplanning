-- Update Users Script (Converted from INSERTs)
-- Refresh squads data
TRUNCATE TABLE user_squads;

UPDATE app_user SET email = 'Olivia.LOUIS@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Olivia', last_name = 'Louis', metier = 'BA', tribu = 'Ma Banque', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81e7nm80haj';
-- Reset permissions for cmjeny81e7nm80haj
DELETE FROM user_permissions WHERE user_id = 'cmjeny81e7nm80haj';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491074dn1ol9jlv', 'cmjeny81e7nm80haj', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107hvcgvi8rna', 'cmjeny81e7nm80haj', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491074kr5kq0v9d', 'cmjeny81e7nm80haj', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81e7nm80haj', 'Transverse');
UPDATE app_user SET email = 'Valerie.PAQUIOT@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Valerie', last_name = 'Paquiot', metier = 'BA', tribu = 'Ma Banque', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81e2tzudv06';
-- Reset permissions for cmjeny81e2tzudv06
DELETE FROM user_permissions WHERE user_id = 'cmjeny81e2tzudv06';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107zd4m61nonm', 'cmjeny81e2tzudv06', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491072yty6mujdy', 'cmjeny81e2tzudv06', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107zff0iciisv', 'cmjeny81e2tzudv06', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81e2tzudv06', 'Squad 4');
UPDATE app_user SET email = 'Romain.BOURSE@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Romain', last_name = 'Bourse', metier = 'Back', tribu = 'Ma Banque', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81fzlhc9d0s';
-- Reset permissions for cmjeny81fzlhc9d0s
DELETE FROM user_permissions WHERE user_id = 'cmjeny81fzlhc9d0s';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107pej3a7t0j0', 'cmjeny81fzlhc9d0s', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107vdi1741wmr', 'cmjeny81fzlhc9d0s', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107qmv90xad1o', 'cmjeny81fzlhc9d0s', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81fzlhc9d0s', 'Transverse');
UPDATE app_user SET email = 'Antoine.LOORIUS@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Antoine', last_name = 'Loorius', metier = 'Back', tribu = 'Ma Banque', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81f3do23wq1';
-- Reset permissions for cmjeny81f3do23wq1
DELETE FROM user_permissions WHERE user_id = 'cmjeny81f3do23wq1';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491072sjewq1c0o', 'cmjeny81f3do23wq1', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107e1u66p0c44', 'cmjeny81f3do23wq1', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c176632554910793lrugi3zm', 'cmjeny81f3do23wq1', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81f3do23wq1', 'Squad 3');
UPDATE app_user SET email = 'Brice.CESARIN@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Brice', last_name = 'Cesarin', metier = 'SM', tribu = 'Ma Banque', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81fsatobm5b';
-- Reset permissions for cmjeny81fsatobm5b
DELETE FROM user_permissions WHERE user_id = 'cmjeny81fsatobm5b';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107xsdle84h5a', 'cmjeny81fsatobm5b', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107w4fqydfvgc', 'cmjeny81fsatobm5b', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107xln9q0j850', 'cmjeny81fsatobm5b', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81fsatobm5b', 'Squad 4');
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81fsatobm5b', 'Adam');
UPDATE app_user SET email = 'Echat.BACAR@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Echat', last_name = 'Bacar', metier = 'UI', tribu = 'ChUX', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81fr6o1w4pr';
-- Reset permissions for cmjeny81fr6o1w4pr
DELETE FROM user_permissions WHERE user_id = 'cmjeny81fr6o1w4pr';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107u56kfdtc9d', 'cmjeny81fr6o1w4pr', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107fumj59m84s', 'cmjeny81fr6o1w4pr', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107vtt857q4iz', 'cmjeny81fr6o1w4pr', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81fr6o1w4pr', 'Squad 4');
UPDATE app_user SET email = 'Dorian.LIAUSSON-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Dorian', last_name = 'Liausson', metier = 'Test', tribu = 'Ma Banque', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81fx2x1cyrk';
-- Reset permissions for cmjeny81fx2x1cyrk
DELETE FROM user_permissions WHERE user_id = 'cmjeny81fx2x1cyrk';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107g4v9o0m6ib', 'cmjeny81fx2x1cyrk', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107055s4c91vi', 'cmjeny81fx2x1cyrk', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107f9g5hzppz5', 'cmjeny81fx2x1cyrk', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81fx2x1cyrk', 'Squad 3');
UPDATE app_user SET email = 'Florian.GOUDEY@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Florian', last_name = 'Goudey', metier = 'Test', tribu = 'Ma Banque', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81ft4x6zbns';
-- Reset permissions for cmjeny81ft4x6zbns
DELETE FROM user_permissions WHERE user_id = 'cmjeny81ft4x6zbns';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107yz37jqks77', 'cmjeny81ft4x6zbns', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107jul0jih1hf', 'cmjeny81ft4x6zbns', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491074nju9w4p13', 'cmjeny81ft4x6zbns', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81ft4x6zbns', 'Squad 4');
UPDATE app_user SET email = 'David.SISCAR@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'David', last_name = 'Siscar', metier = 'iOS', tribu = 'ChDF', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81ffe2ndiep';
-- Reset permissions for cmjeny81ffe2ndiep
DELETE FROM user_permissions WHERE user_id = 'cmjeny81ffe2ndiep';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107ler2hrs8rd', 'cmjeny81ffe2ndiep', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107c0yhopp8hw', 'cmjeny81ffe2ndiep', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107mexyxcbxzf', 'cmjeny81ffe2ndiep', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81ffe2ndiep', 'Transverse');
UPDATE app_user SET email = 'Abderrahim.ELGOMRI-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Abderrahim', last_name = 'Elgomri', metier = 'Android', tribu = 'ChDF', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81f45pa1h3a';
-- Reset permissions for cmjeny81f45pa1h3a
DELETE FROM user_permissions WHERE user_id = 'cmjeny81f45pa1h3a';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107n5pm0spuxn', 'cmjeny81f45pa1h3a', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107531ri10xrl', 'cmjeny81f45pa1h3a', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491071aw1t3wvqv', 'cmjeny81f45pa1h3a', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81f45pa1h3a', 'Squad 1');
UPDATE app_user SET email = 'Luc.GIROUX@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Luc', last_name = 'Giroux', metier = 'PO', tribu = 'Ma Banque', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81fh6hg4a0p';
-- Reset permissions for cmjeny81fh6hg4a0p
DELETE FROM user_permissions WHERE user_id = 'cmjeny81fh6hg4a0p';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107mqawwjqfjz', 'cmjeny81fh6hg4a0p', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c176632554910747f6qbv9rr', 'cmjeny81fh6hg4a0p', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107tb891zm7ib', 'cmjeny81fh6hg4a0p', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81fh6hg4a0p', 'Squad 1');
UPDATE app_user SET email = 'Alexis.BRUNET@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Alexis', last_name = 'Brunet', metier = 'Back', tribu = 'Ma Banque', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81fpxl2nsey';
-- Reset permissions for cmjeny81fpxl2nsey
DELETE FROM user_permissions WHERE user_id = 'cmjeny81fpxl2nsey';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491079f77tf9wob', 'cmjeny81fpxl2nsey', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107fmgkzoh52c', 'cmjeny81fpxl2nsey', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107sbasntuqax', 'cmjeny81fpxl2nsey', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81fpxl2nsey', 'Squad 2');
UPDATE app_user SET email = 'Quentin.ALESSANDRA@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Quentin', last_name = 'Alessandra', metier = 'BA', tribu = 'Ma Banque', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81fevk6ic9y';
-- Reset permissions for cmjeny81fevk6ic9y
DELETE FROM user_permissions WHERE user_id = 'cmjeny81fevk6ic9y';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491075xyc8j2ekt', 'cmjeny81fevk6ic9y', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c176632554910760cjv6q4d4', 'cmjeny81fevk6ic9y', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107cpya1hm7xn', 'cmjeny81fevk6ic9y', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81fevk6ic9y', 'Squad 3');
UPDATE app_user SET email = 'Olivier.MAUREL-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Olivier', last_name = 'Maurel', metier = 'UX/UI', tribu = 'ChUX', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81frp4yn7z3';
-- Reset permissions for cmjeny81frp4yn7z3
DELETE FROM user_permissions WHERE user_id = 'cmjeny81frp4yn7z3';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107uwr2fzi480', 'cmjeny81frp4yn7z3', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107d6whtgkrmg', 'cmjeny81frp4yn7z3', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107m8r09yhmtn', 'cmjeny81frp4yn7z3', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81frp4yn7z3', 'Transverse');
UPDATE app_user SET email = 'Julien.VELY@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Julien', last_name = 'Vely', metier = 'Test', tribu = 'Ma Banque', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81fh9ck2tdu';
-- Reset permissions for cmjeny81fh9ck2tdu
DELETE FROM user_permissions WHERE user_id = 'cmjeny81fh9ck2tdu';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107lu6ailqyy1', 'cmjeny81fh9ck2tdu', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107g298efr3jc', 'cmjeny81fh9ck2tdu', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491072c9zgz4qom', 'cmjeny81fh9ck2tdu', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81fh9ck2tdu', 'Squad 2');
UPDATE app_user SET email = 'Guilhem.BOIRAL@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Guilhem', last_name = 'Boiral', metier = 'RM', tribu = 'Ma Banque', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81f1pji93j1';
-- Reset permissions for cmjeny81f1pji93j1
DELETE FROM user_permissions WHERE user_id = 'cmjeny81f1pji93j1';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107tylsuh9yp2', 'cmjeny81f1pji93j1', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491073xrs4i8ivp', 'cmjeny81f1pji93j1', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549107p12h4c2hl6', 'cmjeny81f1pji93j1', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81f1pji93j1', 'Transverse');
UPDATE app_user SET email = 'Marie-Christine.LURON@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Marie-christine', last_name = 'Luron', metier = 'Fonctionnement', tribu = 'Ma Banque', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81fzpgx3reb';
-- Reset permissions for cmjeny81fzpgx3reb
DELETE FROM user_permissions WHERE user_id = 'cmjeny81fzpgx3reb';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108jqjo7x5m10', 'cmjeny81fzpgx3reb', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c176632554910849l3x3jlan', 'cmjeny81fzpgx3reb', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108jn7u7uyat1', 'cmjeny81fzpgx3reb', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81fzpgx3reb', 'Transverse');
UPDATE app_user SET email = 'Xavier.TANNEAU@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Xavier', last_name = 'Tanneau', metier = 'Test', tribu = 'Ma Banque', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81fvxtd4tj9';
-- Reset permissions for cmjeny81fvxtd4tj9
DELETE FROM user_permissions WHERE user_id = 'cmjeny81fvxtd4tj9';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108p2z0ujetbe', 'cmjeny81fvxtd4tj9', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108do833an65a', 'cmjeny81fvxtd4tj9', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108z4ufjpu1pr', 'cmjeny81fvxtd4tj9', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81fvxtd4tj9', 'Transverse');
UPDATE app_user SET email = 'Pierrick.BERNARD@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Pierrick', last_name = 'Bernard', metier = 'LP', tribu = 'Ma Banque', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81fi6lfuzbh';
-- Reset permissions for cmjeny81fi6lfuzbh
DELETE FROM user_permissions WHERE user_id = 'cmjeny81fi6lfuzbh';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108yw6olykl2p', 'cmjeny81fi6lfuzbh', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108a35w0sylwe', 'cmjeny81fi6lfuzbh', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491081jf0kmovot', 'cmjeny81fi6lfuzbh', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81fi6lfuzbh', 'Transverse');
UPDATE app_user SET email = 'Aymane.ELASRI@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Aymane', last_name = 'Elasri', metier = 'Back', tribu = 'Ma Banque', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81gy1n4xf70';
-- Reset permissions for cmjeny81gy1n4xf70
DELETE FROM user_permissions WHERE user_id = 'cmjeny81gy1n4xf70';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108hqii5ljy2y', 'cmjeny81gy1n4xf70', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491088xw3pn1423', 'cmjeny81gy1n4xf70', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491086wdf5oui2k', 'cmjeny81gy1n4xf70', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81gy1n4xf70', 'Squad 1');
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81gy1n4xf70', 'Squad 5');
UPDATE app_user SET email = 'Kendy.JEAN-MARIE-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Kendy', last_name = 'Jean-marie', metier = 'Back', tribu = 'Ma Banque', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81gb7st9e9e';
-- Reset permissions for cmjeny81gb7st9e9e
DELETE FROM user_permissions WHERE user_id = 'cmjeny81gb7st9e9e';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108ytrbiiqqfg', 'cmjeny81gb7st9e9e', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491087sljukzb06', 'cmjeny81gb7st9e9e', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491081lpdx2n02r', 'cmjeny81gb7st9e9e', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81gb7st9e9e', 'Squad 3');
UPDATE app_user SET email = 'Arnaud.MAZENS@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Arnaud', last_name = 'Mazens', metier = 'PO', tribu = 'Ma Banque', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81gt7vdjsu4';
-- Reset permissions for cmjeny81gt7vdjsu4
DELETE FROM user_permissions WHERE user_id = 'cmjeny81gt7vdjsu4';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108b7013326n0', 'cmjeny81gt7vdjsu4', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108r5c9qmhjrl', 'cmjeny81gt7vdjsu4', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108idb5b23q5a', 'cmjeny81gt7vdjsu4', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81gt7vdjsu4', 'Squad 5');
UPDATE app_user SET email = 'Marjorie.RICO@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Marjorie', last_name = 'Rico', metier = 'PO', tribu = 'Ma Banque', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81gbxlzw5l6';
-- Reset permissions for cmjeny81gbxlzw5l6
DELETE FROM user_permissions WHERE user_id = 'cmjeny81gbxlzw5l6';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108zrbk7u3dnc', 'cmjeny81gbxlzw5l6', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491086dg59vmlx6', 'cmjeny81gbxlzw5l6', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108a7imv1fzgn', 'cmjeny81gbxlzw5l6', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81gbxlzw5l6', 'Squad 4');
UPDATE app_user SET email = 'Sandie.ROUSSELOT@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Sandie', last_name = 'Rousselot', metier = 'BA', tribu = 'Ma Banque', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81gho2owr36';
-- Reset permissions for cmjeny81gho2owr36
DELETE FROM user_permissions WHERE user_id = 'cmjeny81gho2owr36';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108hu06hdv6tr', 'cmjeny81gho2owr36', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108h52hxwl398', 'cmjeny81gho2owr36', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108npz7i6d59y', 'cmjeny81gho2owr36', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81gho2owr36', 'Squad 2');
UPDATE app_user SET email = 'amine.elamri-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Amine', last_name = 'Elamri', metier = 'Back', tribu = 'Ma Banque', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81genadkzgg';
-- Reset permissions for cmjeny81genadkzgg
DELETE FROM user_permissions WHERE user_id = 'cmjeny81genadkzgg';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108ziz05xamqy', 'cmjeny81genadkzgg', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108kpv2chglv1', 'cmjeny81genadkzgg', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108waob4jz9x8', 'cmjeny81genadkzgg', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81genadkzgg', 'Adam');
UPDATE app_user SET email = 'Chelma.ELJ-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Chelma', last_name = 'Elj', metier = 'iOS', tribu = 'ChDF', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81gkrobwvs1';
-- Reset permissions for cmjeny81gkrobwvs1
DELETE FROM user_permissions WHERE user_id = 'cmjeny81gkrobwvs1';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491088uav66md4j', 'cmjeny81gkrobwvs1', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491084eqb3i3wvb', 'cmjeny81gkrobwvs1', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108wxa8flrnuh', 'cmjeny81gkrobwvs1', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81gkrobwvs1', 'Squad 2');
UPDATE app_user SET email = 'Adeline.AUJOULAT-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Adeline', last_name = 'Aujoulat', metier = 'UI', tribu = 'ChUX', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81gyid15m8l';
-- Reset permissions for cmjeny81gyid15m8l
DELETE FROM user_permissions WHERE user_id = 'cmjeny81gyid15m8l';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108pbsfq71v8x', 'cmjeny81gyid15m8l', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c176632554910821pd02w9eq', 'cmjeny81gyid15m8l', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108un9qbx7cgb', 'cmjeny81gyid15m8l', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81gyid15m8l', 'Squad 4');
UPDATE app_user SET email = 'mathieu.cathalifaud@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Mathieu', last_name = 'Cathalifaud', metier = 'BA', tribu = 'Ma Banque', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81g2g9vpibz';
-- Reset permissions for cmjeny81g2g9vpibz
DELETE FROM user_permissions WHERE user_id = 'cmjeny81g2g9vpibz';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108orkubxnreu', 'cmjeny81g2g9vpibz', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108obqn8rr8ro', 'cmjeny81g2g9vpibz', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491085w6p664x3s', 'cmjeny81g2g9vpibz', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81g2g9vpibz', 'Squad 1');
UPDATE app_user SET email = 'Mathis.SCHALLER-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Mathis', last_name = 'Schaller', metier = 'iOS', tribu = 'ChDF', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81g4v2j524s';
-- Reset permissions for cmjeny81g4v2j524s
DELETE FROM user_permissions WHERE user_id = 'cmjeny81g4v2j524s';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491085u0n57vpnt', 'cmjeny81g4v2j524s', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108c4wmad3u4k', 'cmjeny81g4v2j524s', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108ia7ounzh6v', 'cmjeny81g4v2j524s', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81g4v2j524s', 'Squad 4');
UPDATE app_user SET email = 'laetitia.chataignere@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Laetitia', last_name = 'Chataignere', metier = 'UX/UI', tribu = 'ChUX', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81g3q3d1dow';
-- Reset permissions for cmjeny81g3q3d1dow
DELETE FROM user_permissions WHERE user_id = 'cmjeny81g3q3d1dow';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108008woperhr', 'cmjeny81g3q3d1dow', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491086i3zx49rz8', 'cmjeny81g3q3d1dow', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c176632554910801ytokab7z', 'cmjeny81g3q3d1dow', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81g3q3d1dow', 'Transverse');
UPDATE app_user SET email = 'Boris.DENIS@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Boris', last_name = 'Denis', metier = 'Back', tribu = 'Ma Banque', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81g1ce5vp7k';
-- Reset permissions for cmjeny81g1ce5vp7k
DELETE FROM user_permissions WHERE user_id = 'cmjeny81g1ce5vp7k';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108n3vc5lpgt6', 'cmjeny81g1ce5vp7k', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108ii73d20wbz', 'cmjeny81g1ce5vp7k', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108uode6k81wx', 'cmjeny81g1ce5vp7k', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81g1ce5vp7k', 'Squad 5');
UPDATE app_user SET email = 'Damien.FERRY@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Damien', last_name = 'Ferry', metier = 'Back', tribu = 'Ma Banque', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81gzg9wzf0s';
-- Reset permissions for cmjeny81gzg9wzf0s
DELETE FROM user_permissions WHERE user_id = 'cmjeny81gzg9wzf0s';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108afkwevlqa4', 'cmjeny81gzg9wzf0s', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108t20tpzw2cc', 'cmjeny81gzg9wzf0s', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108ma1s5ej09q', 'cmjeny81gzg9wzf0s', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81gzg9wzf0s', 'Squad 4');
UPDATE app_user SET email = 'steve.campos-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Steve', last_name = 'Campos', metier = 'Android', tribu = 'ChDF', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81gxrky03s5';
-- Reset permissions for cmjeny81gxrky03s5
DELETE FROM user_permissions WHERE user_id = 'cmjeny81gxrky03s5';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c176632554910874o1zwedc2', 'cmjeny81gxrky03s5', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108jslwjbcm5e', 'cmjeny81gxrky03s5', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108o626bfu51p', 'cmjeny81gxrky03s5', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81gxrky03s5', 'Squad 4');
UPDATE app_user SET email = 'Jerome.PEREZ-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Jerome', last_name = 'Perez', metier = 'Test', tribu = 'Ma Banque', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81gnomr0s5y';
-- Reset permissions for cmjeny81gnomr0s5y
DELETE FROM user_permissions WHERE user_id = 'cmjeny81gnomr0s5y';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108jyoizoq95m', 'cmjeny81gnomr0s5y', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108prx0qpba0x', 'cmjeny81gnomr0s5y', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108943mtyuk0l', 'cmjeny81gnomr0s5y', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81gnomr0s5y', 'Squad 1');
UPDATE app_user SET email = 'Jerome.DEZEUZE@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Jerome', last_name = 'Dezeuze', metier = 'SM', tribu = 'Ma Banque', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81gs0q8fq5a';
-- Reset permissions for cmjeny81gs0q8fq5a
DELETE FROM user_permissions WHERE user_id = 'cmjeny81gs0q8fq5a';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108w6hzzyxird', 'cmjeny81gs0q8fq5a', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108a75g0tecl2', 'cmjeny81gs0q8fq5a', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108ebgewtv5ni', 'cmjeny81gs0q8fq5a', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81gs0q8fq5a', 'Squad 2');
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81gs0q8fq5a', 'Squad 3');
UPDATE app_user SET email = 'nicolas.favre-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Nicolas', last_name = 'Favre', metier = 'Test', tribu = 'Ma Banque', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81g3wnc77a5';
-- Reset permissions for cmjeny81g3wnc77a5
DELETE FROM user_permissions WHERE user_id = 'cmjeny81g3wnc77a5';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108x7y3ecarb7', 'cmjeny81g3wnc77a5', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491088mdod9p2vx', 'cmjeny81g3wnc77a5', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108mtcs3mzvul', 'cmjeny81g3wnc77a5', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81g3wnc77a5', 'Squad 1');
UPDATE app_user SET email = 'kilian.cousein@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Kilian', last_name = 'Cousein', metier = 'Back', tribu = 'Ma Banque', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81gcay0iwd7';
-- Reset permissions for cmjeny81gcay0iwd7
DELETE FROM user_permissions WHERE user_id = 'cmjeny81gcay0iwd7';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108ny6ss04kl1', 'cmjeny81gcay0iwd7', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108vamflqk8qi', 'cmjeny81gcay0iwd7', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491084xvjwwdq1u', 'cmjeny81gcay0iwd7', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81gcay0iwd7', 'Squad 2');
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81gcay0iwd7', 'Squad 3');
UPDATE app_user SET email = 'mathieu.meunier-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Mathieu', last_name = 'Meunier', metier = 'Android', tribu = 'ChDF', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81gkwn5p44c';
-- Reset permissions for cmjeny81gkwn5p44c
DELETE FROM user_permissions WHERE user_id = 'cmjeny81gkwn5p44c';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c176632554910801crs0i2xt', 'cmjeny81gkwn5p44c', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108nrriunwxt3', 'cmjeny81gkwn5p44c', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108l5x7fqb5qf', 'cmjeny81gkwn5p44c', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81gkwn5p44c', 'Squad 2');
UPDATE app_user SET email = 'jean-michel.gomez-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Jean-michel', last_name = 'Gomez', metier = 'Test', tribu = 'Ma Banque', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81hx213h0f9';
-- Reset permissions for cmjeny81hx213h0f9
DELETE FROM user_permissions WHERE user_id = 'cmjeny81hx213h0f9';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108dv467huwf4', 'cmjeny81hx213h0f9', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108snpqlybcxk', 'cmjeny81hx213h0f9', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491082p1lv26h8u', 'cmjeny81hx213h0f9', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81hx213h0f9', 'Squad 3');
UPDATE app_user SET email = 'mickael.calatraba-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Mickael', last_name = 'Calatraba', metier = 'Android', tribu = 'ChDF', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81hco7d2pks';
-- Reset permissions for cmjeny81hco7d2pks
DELETE FROM user_permissions WHERE user_id = 'cmjeny81hco7d2pks';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108hbxgtq6wsl', 'cmjeny81hco7d2pks', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491087cd5xpxiz4', 'cmjeny81hco7d2pks', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491087wr9lsbe6e', 'cmjeny81hco7d2pks', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81hco7d2pks', 'Squad 5');
UPDATE app_user SET email = 'marion.manen@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Marion', last_name = 'Manen', metier = 'Test', tribu = 'Ma Banque', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81hvqxrz6pk';
-- Reset permissions for cmjeny81hvqxrz6pk
DELETE FROM user_permissions WHERE user_id = 'cmjeny81hvqxrz6pk';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108r2ls7o0jhd', 'cmjeny81hvqxrz6pk', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491084mlykng7l9', 'cmjeny81hvqxrz6pk', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108bbbi9lvp8v', 'cmjeny81hvqxrz6pk', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81hvqxrz6pk', 'Squad 5');
UPDATE app_user SET email = 'Lucas.LEROUX@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Lucas', last_name = 'Leroux', metier = 'Front', tribu = 'ChDF', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81hx0tfaqdo';
-- Reset permissions for cmjeny81hx0tfaqdo
DELETE FROM user_permissions WHERE user_id = 'cmjeny81hx0tfaqdo';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108ke1su64ghg', 'cmjeny81hx0tfaqdo', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108d9l775q77j', 'cmjeny81hx0tfaqdo', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108kfsl9s7k54', 'cmjeny81hx0tfaqdo', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81hx0tfaqdo', 'Adam');
UPDATE app_user SET email = 'cecile.grabit-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Cecile', last_name = 'Grabit', metier = 'BA', tribu = 'Ma Banque', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81hubwi9bwu';
-- Reset permissions for cmjeny81hubwi9bwu
DELETE FROM user_permissions WHERE user_id = 'cmjeny81hubwi9bwu';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108x5meltjyv0', 'cmjeny81hubwi9bwu', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108zvg0m8aj3a', 'cmjeny81hubwi9bwu', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108aiihsw6t33', 'cmjeny81hubwi9bwu', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81hubwi9bwu', 'Squad 5');
UPDATE app_user SET email = 'tancrede.tibau-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Tancrede', last_name = 'Tibau', metier = 'iOS', tribu = 'ChDF', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81hgig8iuw4';
-- Reset permissions for cmjeny81hgig8iuw4
DELETE FROM user_permissions WHERE user_id = 'cmjeny81hgig8iuw4';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108z5bexuarla', 'cmjeny81hgig8iuw4', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108ti56x8dg8l', 'cmjeny81hgig8iuw4', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108ejm0c11rzo', 'cmjeny81hgig8iuw4', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81hgig8iuw4', 'Squad 5');
UPDATE app_user SET email = 'zakaria.afkir-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Zakaria', last_name = 'Afkir', metier = 'Back', tribu = 'Ma Banque', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81h5uipegtd';
-- Reset permissions for cmjeny81h5uipegtd
DELETE FROM user_permissions WHERE user_id = 'cmjeny81h5uipegtd';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108thu10goz0z', 'cmjeny81h5uipegtd', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108bk135hn28s', 'cmjeny81h5uipegtd', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108ihno4px8wj', 'cmjeny81h5uipegtd', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81h5uipegtd', 'Squad 1');
UPDATE app_user SET email = 'romain.boisselle-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Romain', last_name = 'Boisselle', metier = 'Android', tribu = 'ChDF', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81h7ytrinlo';
-- Reset permissions for cmjeny81h7ytrinlo
DELETE FROM user_permissions WHERE user_id = 'cmjeny81h7ytrinlo';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108mqzpnvwkyy', 'cmjeny81h7ytrinlo', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491081b4hnddlil', 'cmjeny81h7ytrinlo', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108p3nd8nkx1i', 'cmjeny81h7ytrinlo', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81h7ytrinlo', 'Transverse');
UPDATE app_user SET email = 'jessica.eyamo-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Jessica', last_name = 'Eyamo', metier = 'UX/UI', tribu = 'ChUX', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81h20cgvs3n';
-- Reset permissions for cmjeny81h20cgvs3n
DELETE FROM user_permissions WHERE user_id = 'cmjeny81h20cgvs3n';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108rkdr2bds2y', 'cmjeny81h20cgvs3n', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108yrlx3ydtih', 'cmjeny81h20cgvs3n', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108prbypnamlp', 'cmjeny81h20cgvs3n', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81h20cgvs3n', 'Squad 2');
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81h20cgvs3n', 'Squad 3');
UPDATE app_user SET email = 'simon.lauron@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Simon', last_name = 'Lauron', metier = 'Android', tribu = 'ChDF', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81ha12zhsvf';
-- Reset permissions for cmjeny81ha12zhsvf
DELETE FROM user_permissions WHERE user_id = 'cmjeny81ha12zhsvf';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108l9damccw5i', 'cmjeny81ha12zhsvf', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108pfbbqwl01b', 'cmjeny81ha12zhsvf', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108m96uiz1yps', 'cmjeny81ha12zhsvf', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81ha12zhsvf', 'Squad 3');
UPDATE app_user SET email = 'Christian.LAPENNA@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Christian', last_name = 'Lapenna', metier = 'Suivi des 15F', tribu = 'Ma Banque', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81h6q46njxi';
-- Reset permissions for cmjeny81h6q46njxi
DELETE FROM user_permissions WHERE user_id = 'cmjeny81h6q46njxi';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108nncxrav5x8', 'cmjeny81h6q46njxi', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108poqikxyggu', 'cmjeny81h6q46njxi', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108pgqqgis5nm', 'cmjeny81h6q46njxi', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81h6q46njxi', 'Transverse');
UPDATE app_user SET email = 'audrey.sobgou-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Audrey', last_name = 'Sobgou', metier = 'iOS', tribu = 'ChDF', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81hebilnvch';
-- Reset permissions for cmjeny81hebilnvch
DELETE FROM user_permissions WHERE user_id = 'cmjeny81hebilnvch';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491089gmkqnzsro', 'cmjeny81hebilnvch', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108fw5scjlasf', 'cmjeny81hebilnvch', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108p6olxvp55i', 'cmjeny81hebilnvch', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81hebilnvch', 'Squad 4');
UPDATE app_user SET email = 'Louis.ALARY@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Louis', last_name = 'Alary', metier = 'Android', tribu = 'ChDF', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81hpn7g9nav';
-- Reset permissions for cmjeny81hpn7g9nav
DELETE FROM user_permissions WHERE user_id = 'cmjeny81hpn7g9nav';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108rcofypkl1y', 'cmjeny81hpn7g9nav', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108zm92bvmhhq', 'cmjeny81hpn7g9nav', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491083kfzckhsnp', 'cmjeny81hpn7g9nav', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81hpn7g9nav', 'Squad 3');
UPDATE app_user SET email = 'David.GAUTIER@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'David', last_name = 'Gautier', metier = 'PO', tribu = 'Ma Banque', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81h5syjypn9';
-- Reset permissions for cmjeny81h5syjypn9
DELETE FROM user_permissions WHERE user_id = 'cmjeny81h5syjypn9';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108xgeyksdva5', 'cmjeny81h5syjypn9', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108fx378fbjcm', 'cmjeny81h5syjypn9', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108kkl9m0gm6v', 'cmjeny81h5syjypn9', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81h5syjypn9', 'Squad 3');
UPDATE app_user SET email = 'Belhassen.LIMAM-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Belhassen', last_name = 'Limam', metier = 'iOS', tribu = 'ChDF', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81hu9gi3ps6';
-- Reset permissions for cmjeny81hu9gi3ps6
DELETE FROM user_permissions WHERE user_id = 'cmjeny81hu9gi3ps6';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c176632554910864ve3ld72p', 'cmjeny81hu9gi3ps6', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108glxyskzsd9', 'cmjeny81hu9gi3ps6', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491080lacsu9yxq', 'cmjeny81hu9gi3ps6', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81hu9gi3ps6', 'Squad 3');
UPDATE app_user SET email = 'anne.grondin-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Anne', last_name = 'Grondin', metier = 'Test', tribu = 'Ma Banque', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81hg4iqx977';
-- Reset permissions for cmjeny81hg4iqx977
DELETE FROM user_permissions WHERE user_id = 'cmjeny81hg4iqx977';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491084lnrf7dioj', 'cmjeny81hg4iqx977', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491083tgcqvgajl', 'cmjeny81hg4iqx977', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491083njhy64grl', 'cmjeny81hg4iqx977', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81hg4iqx977', 'Squad 2');
UPDATE app_user SET email = 'amaury.bocognano@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Amaury', last_name = 'Bocognano', metier = 'PO', tribu = 'Ma Banque', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81hmg8lm3d4';
-- Reset permissions for cmjeny81hmg8lm3d4
DELETE FROM user_permissions WHERE user_id = 'cmjeny81hmg8lm3d4';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491081ttksfyz09', 'cmjeny81hmg8lm3d4', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491082utnczzfdw', 'cmjeny81hmg8lm3d4', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491084wfead5ga4', 'cmjeny81hmg8lm3d4', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81hmg8lm3d4', 'Squad 2');
UPDATE app_user SET email = 'Bilal.DJEBBARI@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Bilal', last_name = 'Djebbari', metier = 'Back', tribu = 'Ma Banque', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81h26m7m4jj';
-- Reset permissions for cmjeny81h26m7m4jj
DELETE FROM user_permissions WHERE user_id = 'cmjeny81h26m7m4jj';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491088rh9glnfcu', 'cmjeny81h26m7m4jj', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491082762vku4ay', 'cmjeny81h26m7m4jj', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491084udnjajlmo', 'cmjeny81h26m7m4jj', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81h26m7m4jj', 'Squad 4');
UPDATE app_user SET email = 'Adrian.CIFFRE-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Adrian', last_name = 'Ciffre', metier = 'UX/UI', tribu = 'ChUX', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81h5qr2bjql';
-- Reset permissions for cmjeny81h5qr2bjql
DELETE FROM user_permissions WHERE user_id = 'cmjeny81h5qr2bjql';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491086iaban0oed', 'cmjeny81h5qr2bjql', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491087g49jmfnre', 'cmjeny81h5qr2bjql', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108vsu5n1o2v1', 'cmjeny81h5qr2bjql', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81h5qr2bjql', 'Squad 1');
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81h5qr2bjql', 'Squad 5');
UPDATE app_user SET email = 'Ines.BENHDIA-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Ines', last_name = 'Benhdia', metier = 'Test', tribu = 'Ma Banque', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81hik1hyyo9';
-- Reset permissions for cmjeny81hik1hyyo9
DELETE FROM user_permissions WHERE user_id = 'cmjeny81hik1hyyo9';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108gkvdtolxyb', 'cmjeny81hik1hyyo9', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c176632554910824j7yv5lq8', 'cmjeny81hik1hyyo9', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108u0nu5xrefo', 'cmjeny81hik1hyyo9', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81hik1hyyo9', 'Squad 4');
UPDATE app_user SET email = 'Stephane.BUNOD-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Stephane', last_name = 'Bunod', metier = 'Suivi des 15C', tribu = 'Ma Banque', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81hzrp9qvm0';
-- Reset permissions for cmjeny81hzrp9qvm0
DELETE FROM user_permissions WHERE user_id = 'cmjeny81hzrp9qvm0';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108szqze8pg9g', 'cmjeny81hzrp9qvm0', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108w4zb29ui94', 'cmjeny81hzrp9qvm0', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108u4926i6v5k', 'cmjeny81hzrp9qvm0', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81hzrp9qvm0', 'Squad 5');
UPDATE app_user SET email = 'Oussama.BELLEL-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Oussama', last_name = 'Bellel', metier = 'Back', tribu = 'Ma Banque', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81hcw3dvgem';
-- Reset permissions for cmjeny81hcw3dvgem
DELETE FROM user_permissions WHERE user_id = 'cmjeny81hcw3dvgem';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c176632554910826y7i35ly6', 'cmjeny81hcw3dvgem', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c176632554910855sgx8ctb1', 'cmjeny81hcw3dvgem', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491089cmagw6gnv', 'cmjeny81hcw3dvgem', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81hcw3dvgem', 'Squad 4');
UPDATE app_user SET email = 'jean-loup.picolo-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Jean-loup', last_name = 'Picolo', metier = 'BA', tribu = 'Ma Banque', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81hzp10tkdo';
-- Reset permissions for cmjeny81hzp10tkdo
DELETE FROM user_permissions WHERE user_id = 'cmjeny81hzp10tkdo';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108bamsnsuw8l', 'cmjeny81hzp10tkdo', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108ivsyg0y0rj', 'cmjeny81hzp10tkdo', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108srayhpxr1a', 'cmjeny81hzp10tkdo', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81hzp10tkdo', 'Adam');
UPDATE app_user SET email = 'Olivier.ADIN@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Olivier', last_name = 'Adin', metier = 'iOS', tribu = 'ChDF', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81hqscaspj5';
-- Reset permissions for cmjeny81hqscaspj5
DELETE FROM user_permissions WHERE user_id = 'cmjeny81hqscaspj5';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108w4s2t3i4i6', 'cmjeny81hqscaspj5', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491084yo62o4hds', 'cmjeny81hqscaspj5', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108rqk21qonrg', 'cmjeny81hqscaspj5', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81hqscaspj5', 'Squad 1');
UPDATE app_user SET email = 'Clara.rebejac-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Clara', last_name = 'Rebejac', metier = 'Test', tribu = 'Ma Banque', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81hn447ita2';
-- Reset permissions for cmjeny81hn447ita2
DELETE FROM user_permissions WHERE user_id = 'cmjeny81hn447ita2';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c176632554910843m5q4zsjj', 'cmjeny81hn447ita2', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108w09jgmynid', 'cmjeny81hn447ita2', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491082n9jw0omzn', 'cmjeny81hn447ita2', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81hn447ita2', 'Squad 4');
UPDATE app_user SET email = 'Tarik.SADKHI@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Tarik', last_name = 'Sadkhi', metier = 'Front', tribu = 'ChDF', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81i83q1hkft';
-- Reset permissions for cmjeny81i83q1hkft
DELETE FROM user_permissions WHERE user_id = 'cmjeny81i83q1hkft';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491080ub8biytc1', 'cmjeny81i83q1hkft', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108841hwitmun', 'cmjeny81i83q1hkft', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108erqikhfceo', 'cmjeny81i83q1hkft', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81i83q1hkft', 'Squad 5');
UPDATE app_user SET email = 'Laura.NEGRE-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Laura', last_name = 'Negre', metier = 'UX/UI', tribu = 'ChUX', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81ioefjttfz';
-- Reset permissions for cmjeny81ioefjttfz
DELETE FROM user_permissions WHERE user_id = 'cmjeny81ioefjttfz';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108orsjphw51o', 'cmjeny81ioefjttfz', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108le4ocv4s9u', 'cmjeny81ioefjttfz', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108fcniqna65e', 'cmjeny81ioefjttfz', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81ioefjttfz', 'Squad 4');
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81ioefjttfz', 'Adam');
UPDATE app_user SET email = 'Thomas.SERRE-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Thomas', last_name = 'Serre', metier = 'SM', tribu = 'Ma Banque', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81iaj55ophd';
-- Reset permissions for cmjeny81iaj55ophd
DELETE FROM user_permissions WHERE user_id = 'cmjeny81iaj55ophd';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108mgcekmqfok', 'cmjeny81iaj55ophd', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108gcq14f4n3t', 'cmjeny81iaj55ophd', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108x8o77jmliu', 'cmjeny81iaj55ophd', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81iaj55ophd', 'Squad 1');
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81iaj55ophd', 'Squad 5');
UPDATE app_user SET email = 'Mickael.HAMOUMA-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Mickael', last_name = 'Hamouma', metier = 'Back', tribu = 'Ma Banque', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81i41fee6zg';
-- Reset permissions for cmjeny81i41fee6zg
DELETE FROM user_permissions WHERE user_id = 'cmjeny81i41fee6zg';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108tbou41pkma', 'cmjeny81i41fee6zg', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108q7tewl3hp1', 'cmjeny81i41fee6zg', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c176632554910887g47ai5f1', 'cmjeny81i41fee6zg', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81i41fee6zg', 'Squad 1');
UPDATE app_user SET email = 'Olivier.BUSIERE-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Olivier', last_name = 'Busiere', metier = 'RM', tribu = 'Ma Banque', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81ijt355ye1';
-- Reset permissions for cmjeny81ijt355ye1
DELETE FROM user_permissions WHERE user_id = 'cmjeny81ijt355ye1';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108lqvpcfo3vh', 'cmjeny81ijt355ye1', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108g6kno4yu1p', 'cmjeny81ijt355ye1', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108zdvl9vpws5', 'cmjeny81ijt355ye1', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81ijt355ye1', 'Transverse');
UPDATE app_user SET email = 'Dalila.AMRAOUI@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Dalila', last_name = 'Amraoui', metier = 'AFN2', tribu = 'Ma Banque', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81ijhvaq128';
-- Reset permissions for cmjeny81ijhvaq128
DELETE FROM user_permissions WHERE user_id = 'cmjeny81ijhvaq128';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108rb7n7wgrx8', 'cmjeny81ijhvaq128', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108noi1ahxd87', 'cmjeny81ijhvaq128', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491086bnn8hgvwu', 'cmjeny81ijhvaq128', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81ijhvaq128', 'Transverse');
UPDATE app_user SET email = 'Mikael.aubriot-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Mikael', last_name = 'Aubriot', metier = 'BA', tribu = 'Ma Banque', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81iozc6s2ks';
-- Reset permissions for cmjeny81iozc6s2ks
DELETE FROM user_permissions WHERE user_id = 'cmjeny81iozc6s2ks';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108nvb0lbykp0', 'cmjeny81iozc6s2ks', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108sly3fvlozz', 'cmjeny81iozc6s2ks', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108xc4x2xavsd', 'cmjeny81iozc6s2ks', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81iozc6s2ks', 'Squad 4');
UPDATE app_user SET email = 'Mohammed.FATAH-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Mohammed', last_name = 'Fatah', metier = 'Test', tribu = 'Ma Banque', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81i643kjh35';
-- Reset permissions for cmjeny81i643kjh35
DELETE FROM user_permissions WHERE user_id = 'cmjeny81i643kjh35';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108jnsiray9rg', 'cmjeny81i643kjh35', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108t4urbfvzyg', 'cmjeny81i643kjh35', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108l72jjw3gvh', 'cmjeny81i643kjh35', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81i643kjh35', 'Squad 5');
UPDATE app_user SET email = 'Katarzyna.SZEWCZAK@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Katarzyna', last_name = 'Szewczak', metier = 'AFN2', tribu = 'Ma Banque', is_interne = true, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81ivjzezpbc';
-- Reset permissions for cmjeny81ivjzezpbc
DELETE FROM user_permissions WHERE user_id = 'cmjeny81ivjzezpbc';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108x0xp3lw6sl', 'cmjeny81ivjzezpbc', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108ejn6lvynoh', 'cmjeny81ivjzezpbc', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108ev3u4a3ie8', 'cmjeny81ivjzezpbc', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81ivjzezpbc', 'Transverse');
UPDATE app_user SET email = 'Meryem.DRISSI-ext@ca-ts.fr', password = '$2a$10$81nZtPhGPHM/0jNwkvhkIO0P6w3lykqX9ejLuS5rVH6OOWNIXMTBy', first_name = 'Meryem', last_name = 'Drissi', metier = 'Test', tribu = 'Ma Banque', is_interne = false, theme_preference = 'light', widget_order = '[]', updated_at = NOW() WHERE id = 'cmjeny81ih12q5grm';
-- Reset permissions for cmjeny81ih12q5grm
DELETE FROM user_permissions WHERE user_id = 'cmjeny81ih12q5grm';
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108utorglb9xg', 'cmjeny81ih12q5grm', 'ABSENCE', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c1766325549108221h9dmjc4', 'cmjeny81ih12q5grm', 'CALENDAR', 'WRITE', NOW(),  NOW());
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at) VALUES ('c17663255491087rtfmw2izp', 'cmjeny81ih12q5grm', 'RELEASES', 'WRITE', NOW(),  NOW());
INSERT INTO user_squads (user_id, squad) VALUES ('cmjeny81ih12q5grm', 'Squad 5');