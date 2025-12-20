-- Migration V5: Insert Absences from Excel/Screenshot for Jan-Feb 2026

-- Helper to insert absence safely if user exists
-- Note: IDs are manually generated random strings to satisfy the Cuid format (25 chars)

-- 1. Romain B (Romain.BOURSE@ca-ts.fr) - Absence 02/02 - 06/02
INSERT INTO absence (id, user_id, start_date, end_date, type)
SELECT 'clrx1234567890abcdef00001', id, '2026-02-02', '2026-02-06', 'ABSENCE'
FROM app_user WHERE email = 'Romain.BOURSE@ca-ts.fr';

-- 2. Antoine L (Antoine.LOORIUS@ca-ts.fr) - Formation 19/01
INSERT INTO absence (id, user_id, start_date, end_date, type)
SELECT 'clrx1234567890abcdef00002', id, '2026-01-19', '2026-01-19', 'FORMATION'
FROM app_user WHERE email = 'Antoine.LOORIUS@ca-ts.fr';

-- 3. Abderrahim E (Abderrahim.ELGOMRI-ext@ca-ts.fr) - Absence 05/01-09/01, 12/01-16/01
INSERT INTO absence (id, user_id, start_date, end_date, type)
SELECT 'clrx1234567890abcdef00003', id, '2026-01-05', '2026-01-09', 'ABSENCE'
FROM app_user WHERE email = 'Abderrahim.ELGOMRI-ext@ca-ts.fr';

INSERT INTO absence (id, user_id, start_date, end_date, type)
SELECT 'clrx1234567890abcdef00004', id, '2026-01-12', '2026-01-16', 'ABSENCE'
FROM app_user WHERE email = 'Abderrahim.ELGOMRI-ext@ca-ts.fr';

-- 4. Pierrick B (Pierrick.BERNARD@ca-ts.fr) - Absence 05/01-09/01
INSERT INTO absence (id, user_id, start_date, end_date, type)
SELECT 'clrx1234567890abcdef00005', id, '2026-01-05', '2026-01-09', 'ABSENCE'
FROM app_user WHERE email = 'Pierrick.BERNARD@ca-ts.fr';

-- 5. Mathis S (Mathis.SCHALLER-ext@ca-ts.fr) - Absence 05/01-09/01, 12/01-16/01
INSERT INTO absence (id, user_id, start_date, end_date, type)
SELECT 'clrx1234567890abcdef00006', id, '2026-01-05', '2026-01-09', 'ABSENCE'
FROM app_user WHERE email = 'Mathis.SCHALLER-ext@ca-ts.fr';

INSERT INTO absence (id, user_id, start_date, end_date, type)
SELECT 'clrx1234567890abcdef00007', id, '2026-01-12', '2026-01-16', 'ABSENCE'
FROM app_user WHERE email = 'Mathis.SCHALLER-ext@ca-ts.fr';

-- 6. Mickael C (mickael.calatraba-ext@ca-ts.fr) - Absence 19/01-20/01
INSERT INTO absence (id, user_id, start_date, end_date, type)
SELECT 'clrx1234567890abcdef00008', id, '2026-01-19', '2026-01-20', 'ABSENCE'
FROM app_user WHERE email = 'mickael.calatraba-ext@ca-ts.fr';

-- 7. Marion M (marion.manen@ca-ts.fr) - Continuous Absences
INSERT INTO absence (id, user_id, start_date, end_date, type)
SELECT 'clrx1234567890abcdef00009', id, '2026-01-05', '2026-01-09', 'ABSENCE'
FROM app_user WHERE email = 'marion.manen@ca-ts.fr';

INSERT INTO absence (id, user_id, start_date, end_date, type)
SELECT 'clrx1234567890abcdef00010', id, '2026-01-12', '2026-01-16', 'ABSENCE'
FROM app_user WHERE email = 'marion.manen@ca-ts.fr';

INSERT INTO absence (id, user_id, start_date, end_date, type)
SELECT 'clrx1234567890abcdef00011', id, '2026-01-19', '2026-01-23', 'ABSENCE'
FROM app_user WHERE email = 'marion.manen@ca-ts.fr';

INSERT INTO absence (id, user_id, start_date, end_date, type)
SELECT 'clrx1234567890abcdef00012', id, '2026-01-26', '2026-01-30', 'ABSENCE'
FROM app_user WHERE email = 'marion.manen@ca-ts.fr';

INSERT INTO absence (id, user_id, start_date, end_date, type)
SELECT 'clrx1234567890abcdef00013', id, '2026-02-02', '2026-02-06', 'ABSENCE'
FROM app_user WHERE email = 'marion.manen@ca-ts.fr';

-- 8. Lucas L (Lucas.LEROY@ca-ts.fr) - Absence 12/01-16/01, 19/01-21/01
INSERT INTO absence (id, user_id, start_date, end_date, type)
SELECT 'clrx1234567890abcdef00014', id, '2026-01-12', '2026-01-16', 'ABSENCE'
FROM app_user WHERE email = 'Lucas.LEROY@ca-ts.fr';

INSERT INTO absence (id, user_id, start_date, end_date, type)
SELECT 'clrx1234567890abcdef00015', id, '2026-01-19', '2026-01-21', 'ABSENCE'
FROM app_user WHERE email = 'Lucas.LEROY@ca-ts.fr';

-- 9. Aymane E (Aymane.ELASRI@ca-ts.fr) - Absence 05/01-09/01
INSERT INTO absence (id, user_id, start_date, end_date, type)
SELECT 'clrx1234567890abcdef00016', id, '2026-01-05', '2026-01-09', 'ABSENCE'
FROM app_user WHERE email = 'Aymane.ELASRI@ca-ts.fr';

-- 10. Tancrède T (tancrede.tibau-ext@ca-ts.fr) - Absences
INSERT INTO absence (id, user_id, start_date, end_date, type)
SELECT 'clrx1234567890abcdef00017', id, '2026-01-19', '2026-01-23', 'ABSENCE'
FROM app_user WHERE email = 'tancrede.tibau-ext@ca-ts.fr';

INSERT INTO absence (id, user_id, start_date, end_date, type)
SELECT 'clrx1234567890abcdef00018', id, '2026-01-26', '2026-01-30', 'ABSENCE'
FROM app_user WHERE email = 'tancrede.tibau-ext@ca-ts.fr';

INSERT INTO absence (id, user_id, start_date, end_date, type)
SELECT 'clrx1234567890abcdef00019', id, '2026-02-02', '2026-02-06', 'ABSENCE'
FROM app_user WHERE email = 'tancrede.tibau-ext@ca-ts.fr';

-- 11. Audrey S (audrey.sobgou-ext@ca-ts.fr) - Absence 05/01-09/01
INSERT INTO absence (id, user_id, start_date, end_date, type)
SELECT 'clrx1234567890abcdef00020', id, '2026-01-05', '2026-01-09', 'ABSENCE'
FROM app_user WHERE email = 'audrey.sobgou-ext@ca-ts.fr';

-- 12. Jean-Loup P (jean-loup.parolo-ext@ca-ts.fr) - Absence 05/01-09/01, 12/01
INSERT INTO absence (id, user_id, start_date, end_date, type)
SELECT 'clrx1234567890abcdef00021', id, '2026-01-05', '2026-01-09', 'ABSENCE'
FROM app_user WHERE email = 'jean-loup.parolo-ext@ca-ts.fr';

INSERT INTO absence (id, user_id, start_date, end_date, type)
SELECT 'clrx1234567890abcdef00022', id, '2026-01-12', '2026-01-12', 'ABSENCE'
FROM app_user WHERE email = 'jean-loup.parolo-ext@ca-ts.fr';

-- 13. Tarik S (Tarik.SADKHI@ca-ts.fr) - Formation 05/01-09/01
INSERT INTO absence (id, user_id, start_date, end_date, type)
SELECT 'clrx1234567890abcdef00023', id, '2026-01-05', '2026-01-09', 'FORMATION'
FROM app_user WHERE email = 'Tarik.SADKHI@ca-ts.fr';

-- 14. Laura N (Laura.NEGRE-ext@ca-ts.fr) - Absences
INSERT INTO absence (id, user_id, start_date, end_date, type)
SELECT 'clrx1234567890abcdef00024', id, '2026-01-16', '2026-01-16', 'ABSENCE'
FROM app_user WHERE email = 'Laura.NEGRE-ext@ca-ts.fr';

INSERT INTO absence (id, user_id, start_date, end_date, type)
SELECT 'clrx1234567890abcdef00025', id, '2026-01-19', '2026-01-23', 'ABSENCE'
FROM app_user WHERE email = 'Laura.NEGRE-ext@ca-ts.fr';

INSERT INTO absence (id, user_id, start_date, end_date, type)
SELECT 'clrx1234567890abcdef00026', id, '2026-01-26', '2026-01-30', 'ABSENCE'
FROM app_user WHERE email = 'Laura.NEGRE-ext@ca-ts.fr';

INSERT INTO absence (id, user_id, start_date, end_date, type)
SELECT 'clrx1234567890abcdef00027', id, '2026-02-02', '2026-02-06', 'ABSENCE'
FROM app_user WHERE email = 'Laura.NEGRE-ext@ca-ts.fr';

-- 15. Mohammed F (Mohammed.FATAH-ext@ca-ts.fr) - Absence 05/01-09/01, 12/01-16/01
INSERT INTO absence (id, user_id, start_date, end_date, type)
SELECT 'clrx1234567890abcdef00028', id, '2026-01-05', '2026-01-09', 'ABSENCE'
FROM app_user WHERE email = 'Mohammed.FATAH-ext@ca-ts.fr';

INSERT INTO absence (id, user_id, start_date, end_date, type)
SELECT 'clrx1234567890abcdef00029', id, '2026-01-12', '2026-01-16', 'ABSENCE'
FROM app_user WHERE email = 'Mohammed.FATAH-ext@ca-ts.fr';

-- 16. Olivier B (Olivier.BUSIERE-ext@ca-ts.fr) - Absence 08/01
INSERT INTO absence (id, user_id, start_date, end_date, type)
SELECT 'clrx1234567890abcdef00030', id, '2026-01-08', '2026-01-08', 'ABSENCE'
FROM app_user WHERE email = 'Olivier.BUSIERE-ext@ca-ts.fr';

