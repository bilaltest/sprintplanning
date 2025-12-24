#!/usr/bin/env python3
"""
Script de conversion SQL → CSV pour les absences Ma Banque Tools
Convertit V5__insert_absences_2026.sql en default-absences.csv
"""

import re
import csv

def parse_sql_file(sql_path):
    """Parse le fichier SQL et extrait les absences"""
    print(f"📖 Lecture du fichier SQL: {sql_path}")

    with open(sql_path, 'r', encoding='utf-8') as f:
        content = f.read()

    absences = []

    # Pattern pour extraire les INSERT INTO absence
    # Format: INSERT INTO absence (id, user_id, start_date, end_date, type)
    #         SELECT 'id', id, 'start', 'end', 'TYPE'
    #         FROM app_user WHERE email = 'email@ca-ts.fr';
    absence_pattern = r"INSERT INTO absence \(id, user_id, start_date, end_date, type\)\s*SELECT '[^']+', id, '([^']+)', '([^']+)', '([^']+)'\s*FROM app_user WHERE email = '([^']+)';"

    for match in re.finditer(absence_pattern, content):
        start_date, end_date, absence_type, email = match.groups()
        absences.append({
            'email': email,
            'startDate': start_date,
            'endDate': end_date,
            'type': absence_type
        })

    print(f"✓ {len(absences)} absences trouvées")
    return absences

def write_csv(absences, csv_path):
    """Écrit les absences dans un fichier CSV"""
    print(f"📝 Écriture du fichier CSV: {csv_path}")

    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)

        # Header
        writer.writerow(['email', 'startDate', 'endDate', 'type'])

        # Data rows
        for absence in absences:
            writer.writerow([
                absence['email'],
                absence['startDate'],
                absence['endDate'],
                absence['type']
            ])

    print(f"✓ CSV généré avec {len(absences)} lignes (+ header)")

if __name__ == '__main__':
    print("=" * 60)
    print("  Conversion SQL → CSV : Absences Ma Banque Tools")
    print("=" * 60)

    # Chemins
    sql_file = 'src/main/resources/db/migration/V5__insert_absences_2026.sql'
    csv_file = 'src/main/resources/data/default-absences.csv'

    # Conversion
    absences = parse_sql_file(sql_file)
    write_csv(absences, csv_file)

    print("=" * 60)
    print(f"✅ Conversion terminée!")
    print(f"   Fichier généré: {csv_file}")
    print(f"   {len(absences)} absences converties")
    print("=" * 60)
