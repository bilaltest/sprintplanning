package com.catsbanque.mabanquetools.util;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Parser CSV léger pour charger les absences depuis un fichier CSV.
 *
 * Format CSV attendu (4 colonnes):
 * email,startDate,endDate,type
 *
 * Exemple:
 * Romain.BOURSE@ca-ts.fr,2026-02-02,2026-02-06,ABSENCE
 * Antoine.LOORIUS@ca-ts.fr,2026-01-19,2026-01-19,FORMATION
 */
@Slf4j
public class CsvAbsenceParser {

    /**
     * DTO représentant une ligne du CSV absence
     */
    @Data
    @AllArgsConstructor
    public static class AbsenceCsvRow {
        private String email;
        private LocalDate startDate;
        private LocalDate endDate;
        private String type;
    }

    /**
     * Parse un fichier CSV depuis le classpath et retourne la liste des absences
     *
     * @param resourcePath Chemin relatif depuis src/main/resources (ex: "data/default-absences.csv")
     * @return Liste des absences parsées (liste vide en cas d'erreur)
     */
    public static List<AbsenceCsvRow> parseAbsencesFromCsv(String resourcePath) {
        List<AbsenceCsvRow> absences = new ArrayList<>();

        try (InputStream is = CsvAbsenceParser.class
                .getClassLoader()
                .getResourceAsStream(resourcePath);
             BufferedReader reader = new BufferedReader(
                 new InputStreamReader(is, StandardCharsets.UTF_8))) {

            if (is == null) {
                log.error("CSV file not found in classpath: {}", resourcePath);
                return absences;
            }

            // Skip header line
            String headerLine = reader.readLine();
            if (headerLine == null) {
                log.warn("CSV file is empty: {}", resourcePath);
                return absences;
            }

            String line;
            int lineNumber = 1;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                if (line.trim().isEmpty()) {
                    continue;  // Skip empty lines
                }

                try {
                    AbsenceCsvRow absence = parseCsvLine(line, lineNumber);
                    absences.add(absence);
                } catch (Exception e) {
                    log.error("Failed to parse line {}: {}", lineNumber, e.getMessage());
                }
            }

            log.info("Parsed {} absences from CSV: {}", absences.size(), resourcePath);

        } catch (Exception e) {
            log.error("Failed to read CSV file: {}", resourcePath, e);
        }

        return absences;
    }

    /**
     * Parse une ligne CSV et retourne un AbsenceCsvRow
     *
     * @param line Ligne CSV brute
     * @param lineNumber Numéro de ligne (pour les logs d'erreur)
     * @return AbsenceCsvRow parsé
     * @throws IllegalArgumentException Si le format est invalide
     */
    private static AbsenceCsvRow parseCsvLine(String line, int lineNumber) {
        String[] fields = line.split(",");

        if (fields.length != 4) {
            throw new IllegalArgumentException(
                "Expected 4 fields but got " + fields.length + " on line " + lineNumber);
        }

        String email = fields[0].trim();
        LocalDate startDate = LocalDate.parse(fields[1].trim());
        LocalDate endDate = LocalDate.parse(fields[2].trim());
        String type = fields[3].trim();

        return new AbsenceCsvRow(email, startDate, endDate, type);
    }
}
