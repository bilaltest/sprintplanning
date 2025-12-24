package com.catsbanque.mabanquetools.util;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Parser CSV léger pour charger les utilisateurs depuis un fichier CSV.
 * Gère les guillemets et virgules dans les champs (RFC 4180).
 *
 * Format CSV attendu (8 colonnes):
 * email,passwordHash,firstName,lastName,metier,tribu,isInterne,teams
 *
 * Exemple:
 * john.doe@ca-ts.fr,$2a$10$...,John,Doe,Back,Ma Banque,true,Squad 1
 * jane.doe@ca-ts.fr,$2a$10$...,Jane,Doe,BA,Ma Banque,true,"Squad 1,ADAM"
 */
@Slf4j
public class CsvUserParser {

    /**
     * DTO représentant une ligne du CSV utilisateur
     */
    @Data
    @AllArgsConstructor
    public static class UserCsvRow {
        private String email;
        private String passwordHash;
        private String firstName;
        private String lastName;
        private String metier;
        private String tribu;
        private boolean isInterne;
        private List<String> teamNames;
    }

    /**
     * Parse un fichier CSV depuis le classpath et retourne la liste des
     * utilisateurs
     *
     * @param resourcePath Chemin relatif depuis src/main/resources (ex:
     *                     "data/default-users.csv")
     * @return Liste des utilisateurs parsés (liste vide en cas d'erreur)
     */
    public static List<UserCsvRow> parseUsersFromCsv(String resourcePath) {
        List<UserCsvRow> users = new ArrayList<>();

        try (InputStream is = CsvUserParser.class
                .getClassLoader()
                .getResourceAsStream(resourcePath);
                BufferedReader reader = new BufferedReader(
                        new InputStreamReader(is, StandardCharsets.UTF_8))) {

            if (is == null) {
                log.error("CSV file not found in classpath: {}", resourcePath);
                return users;
            }

            // Skip header line
            String headerLine = reader.readLine();
            if (headerLine == null) {
                log.warn("CSV file is empty: {}", resourcePath);
                return users;
            }

            String line;
            int lineNumber = 1;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                if (line.trim().isEmpty()) {
                    continue; // Skip empty lines
                }

                try {
                    UserCsvRow user = parseCsvLine(line, lineNumber);
                    users.add(user);
                } catch (Exception e) {
                    log.error("Failed to parse line {}: {}", lineNumber, e.getMessage());
                }
            }

            log.info("Parsed {} users from CSV: {}", users.size(), resourcePath);

        } catch (Exception e) {
            log.error("Failed to read CSV file: {}", resourcePath, e);
        }

        return users;
    }

    /**
     * Parse une ligne CSV et retourne un UserCsvRow
     *
     * @param line       Ligne CSV brute
     * @param lineNumber Numéro de ligne (pour les logs d'erreur)
     * @return UserCsvRow parsé
     * @throws IllegalArgumentException Si le format est invalide
     */
    private static UserCsvRow parseCsvLine(String line, int lineNumber) {
        // Parse CSV with proper quote handling
        List<String> fields = parseCsvFields(line);

        if (fields.size() != 8) {
            throw new IllegalArgumentException(
                    "Expected 8 fields but got " + fields.size() + " on line " + lineNumber);
        }

        String email = fields.get(0).trim().toLowerCase();
        String passwordHash = fields.get(1).trim();
        String firstName = fields.get(2).trim();
        String lastName = fields.get(3).trim();
        String metier = fields.get(4).trim();
        String tribu = fields.get(5).trim();
        boolean isInterne = Boolean.parseBoolean(fields.get(6).trim());

        // Parse team names (comma-separated)
        String teamsStr = fields.get(7).trim();
        List<String> teamNames = Arrays.stream(teamsStr.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());

        return new UserCsvRow(
                email, passwordHash, firstName, lastName,
                metier, tribu, isInterne, teamNames);
    }

    /**
     * Parse les champs d'une ligne CSV en gérant les guillemets (RFC 4180)
     *
     * Exemples:
     * - "field1,field2,field3" → ["field1", "field2", "field3"]
     * - "field1,"value with, comma",field3" → ["field1", "value with, comma",
     * "field3"]
     *
     * @param line Ligne CSV brute
     * @return Liste des champs extraits
     */
    private static List<String> parseCsvFields(String line) {
        List<String> fields = new ArrayList<>();
        StringBuilder currentField = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);

            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                fields.add(currentField.toString());
                currentField = new StringBuilder();
            } else {
                currentField.append(c);
            }
        }

        // Add last field
        fields.add(currentField.toString());

        return fields;
    }
}
