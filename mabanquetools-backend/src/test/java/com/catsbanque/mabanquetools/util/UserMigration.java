package com.catsbanque.mabanquetools.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.io.FileWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

public class UserMigration {

    private static final String OUTPUT_SQL = "insert_users_v2.sql";
    private static final String DEFAULT_PASSWORD = "password";

    static class UserData {
        String email;
        String metier;
        String tribu;
        List<String> squads;

        public UserData(String email, String metier, String tribu, String... squads) {
            this.email = email;
            this.metier = metier;
            this.tribu = tribu;
            this.squads = Arrays.asList(squads);
        }
    }

    public static void main(String[] args) {
        System.out.println("Generating SQL for Users (Correction V2)...");
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);
        String hashedPassword = encoder.encode(DEFAULT_PASSWORD);

        List<UserData> users = new ArrayList<>();

        // Corrected Data Transcription from Image 2
        // Columns: 1 | 2 | 3 | 4 | 5 | Adam | Transverse | Interne (Status)
        // Mapped: 1->Squad 1, 2->Squad 2, 3->Squad 3, 4->Squad 4, 5->Squad 5,
        // Adam->Adam, Transverse->Transverse
        // Interne is IGNORED for squads.

        users.add(new UserData("Olivia.LOUIS@ca-ts.fr", "BA", "Ma Banque", "Transverse"));
        users.add(new UserData("Valerie.PAQUIOT@ca-ts.fr", "BA", "Ma Banque", "Squad 4"));
        users.add(new UserData("Romain.BOURSE@ca-ts.fr", "Back", "Ma Banque", "Transverse"));
        users.add(new UserData("Antoine.LOORIUS@ca-ts.fr", "Back", "Ma Banque", "Squad 3"));
        users.add(new UserData("Brice.CESARIN@ca-ts.fr", "SM", "Ma Banque", "Squad 4", "Adam"));
        users.add(new UserData("Echat.BACAR@ca-ts.fr", "UI", "ChUX", "Squad 4"));
        users.add(new UserData("Eugenie.BOUQUART-ext@ca-ts.fr", "AFN2", "Ma Banque", "Transverse"));
        users.add(new UserData("Dorian.LIAUSSON-ext@ca-ts.fr", "Test", "Ma Banque", "Squad 3"));
        users.add(new UserData("Florian.GOUDEY@ca-ts.fr", "Test", "Ma Banque", "Squad 4"));
        users.add(new UserData("David.SISCAR@ca-ts.fr", "iOS", "ChDF", "Transverse"));
        users.add(new UserData("Abderrahim.ELGOMRI-ext@ca-ts.fr", "Android", "ChDF", "Squad 1"));
        users.add(new UserData("Luc.GIROUX@ca-ts.fr", "PO", "Ma Banque", "Squad 1"));
        users.add(new UserData("Alexis.BRUNET@ca-ts.fr", "Back", "Ma Banque", "Squad 2"));
        users.add(new UserData("Quentin.ALESSANDRA@ca-ts.fr", "BA", "Ma Banque", "Squad 3"));
        users.add(new UserData("Olivier.MAUREL-ext@ca-ts.fr", "UX/UI", "ChUX", "Transverse"));
        users.add(new UserData("Julien.VELY@ca-ts.fr", "Test", "Ma Banque", "Squad 2"));
        users.add(new UserData("Guilhem.BOIRAL@ca-ts.fr", "RM", "Ma Banque", "Transverse"));
        users.add(new UserData("Marie-Christine.LURON@ca-ts.fr", "Fonctio", "Ma Banque", "Transverse"));
        users.add(new UserData("Xavier.TANNEAU@ca-ts.fr", "Test", "Ma Banque", "Transverse"));
        users.add(new UserData("Pierrick.BERNARD@ca-ts.fr", "LP", "Ma Banque", "Transverse"));
        users.add(new UserData("Aymane.ELASRI@ca-ts.fr", "Back", "Ma Banque", "Squad 1", "Squad 5"));
        users.add(new UserData("Kendy.JEAN-MARIE-ext@ca-ts.fr", "Back", "Ma Banque", "Squad 3"));
        users.add(new UserData("Arnaud.MAZENS@ca-ts.fr", "PO", "Ma Banque", "Squad 5"));
        users.add(new UserData("Marjorie.RICO@ca-ts.fr", "PO", "Ma Banque", "Squad 4"));
        users.add(new UserData("Sandie.ROUSSELOT@ca-ts.fr", "BA", "Ma Banque", "Squad 2"));
        users.add(new UserData("amine.elamri-ext@ca-ts.fr", "Back", "Ma Banque", "Adam"));
        users.add(new UserData("Chelma.ELJ-ext@ca-ts.fr", "iOS", "ChDF", "Squad 2"));
        users.add(new UserData("Adeline.AUJOULAT-ext@ca-ts.fr", "UI", "ChUX", "Squad 4"));
        users.add(new UserData("mathieu.cathalifaud@ca-ts.fr", "BA", "Ma Banque", "Squad 1", "Squad 5"));
        users.add(new UserData("Mathis.SCHALLER-ext@ca-ts.fr", "iOS", "ChDF", "Squad 4"));

        users.add(new UserData("laetitia.chataignere@ca-ts.fr", "UX/UI", "ChUX", "Transverse"));
        users.add(new UserData("Boris.DENIS@ca-ts.fr", "Back", "Ma Banque", "Squad 5"));
        users.add(new UserData("Damien.FERRY@ca-ts.fr", "Back", "Ma Banque", "Squad 4"));
        users.add(new UserData("steve.campos-ext@ca-ts.fr", "Android", "ChDF", "Squad 4"));
        users.add(new UserData("Jerome.PEREZ-ext@ca-ts.fr", "Test", "Ma Banque", "Squad 1"));
        users.add(new UserData("Jerome.DEZEUZE@ca-ts.fr", "SM", "Ma Banque", "Squad 2", "Squad 3"));
        users.add(new UserData("nicolas.favre-ext@ca-ts.fr", "Test", "Ma Banque", "Squad 1"));
        users.add(new UserData("kilian.cousein@ca-ts.fr", "Back", "Ma Banque", "Squad 2", "Squad 3"));
        users.add(new UserData("mathieu.meunier-ext@ca-ts.fr", "Android", "ChDF", "Squad 2"));
        users.add(new UserData("jean-michel.gomez-ext@ca-ts.fr", "Test", "Ma Banque", "Squad 3"));
        users.add(new UserData("mickael.calatraba-ext@ca-ts.fr", "Android", "ChDF", "Squad 5"));
        users.add(new UserData("marion.manen@ca-ts.fr", "Test", "Ma Banque", "Squad 5"));
        users.add(new UserData("Lucas.LEROUX@ca-ts.fr", "Front", "ChDF", "Adam"));
        users.add(new UserData("cecile.grabit-ext@ca-ts.fr", "BA", "Ma Banque", "Squad 5"));
        users.add(new UserData("tancrede.tibau-ext@ca-ts.fr", "iOS", "ChDF", "Squad 5"));
        users.add(new UserData("zakaria.afkir-ext@ca-ts.fr", "Back", "Ma Banque", "Squad 1"));
        users.add(new UserData("romain.boisselle-ext@ca-ts.fr", "Android", "ChDF", "Transverse"));
        users.add(new UserData("jessica.eyamo-ext@ca-ts.fr", "UX/UI", "ChUX", "Squad 2", "Squad 3"));
        users.add(new UserData("simon.lauron@ca-ts.fr", "Android", "ChDF", "Squad 3"));
        users.add(new UserData("Christian.LAPENNA@ca-ts.fr", "Suivi de", "Ma Banque", "Transverse"));
        users.add(new UserData("audrey.sobgou-ext@ca-ts.fr", "iOS", "ChDF", "Squad 4"));
        users.add(new UserData("Louis.ALARY@ca-ts.fr", "Android", "ChDF", "Squad 3"));
        users.add(new UserData("David.GAUTIER@ca-ts.fr", "PO", "Ma Banque", "Squad 3"));
        users.add(new UserData("Belhassen.LIMAM-ext@ca-ts.fr", "iOS", "ChDF", "Squad 3"));
        users.add(new UserData("anne.grondin-ext@ca-ts.fr", "Test", "Ma Banque", "Squad 2"));
        users.add(new UserData("amaury.bocognano@ca-ts.fr", "PO", "Ma Banque", "Squad 2"));
        users.add(new UserData("Bilal.DJEBBARI@ca-ts.fr", "Back", "Ma Banque", "Squad 4"));
        users.add(new UserData("Adrian.CIFFRE-ext@ca-ts.fr", "UX/UI", "ChUX", "Squad 1", "Squad 5"));
        users.add(new UserData("Ines.BENHDIA-ext@ca-ts.fr", "Test", "Ma Banque", "Squad 4"));
        users.add(new UserData("Stephane.BUNOD-ext@ca-ts.fr", "Suivi de", "Ma Banque", "Squad 5"));
        users.add(new UserData("Oussama.BELLEL-ext@ca-ts.fr", "Back", "Ma Banque", "Squad 4"));
        users.add(new UserData("jean-loup.picolo-ext@ca-ts.fr", "BA", "Ma Banque", "Adam"));
        users.add(new UserData("Olivier.ADIN@ca-ts.fr", "iOS", "ChDF", "Squad 1"));
        users.add(new UserData("Clara.rebejac-ext@ca-ts.fr", "Test", "Ma Banque", "Squad 4"));
        users.add(new UserData("Tarik.SADKHI@ca-ts.fr", "Front", "ChDF", "Squad 5"));
        users.add(new UserData("Laura.NEGRE-ext@ca-ts.fr", "UX/UI", "ChUX", "Squad 3", "Squad 5"));
        users.add(new UserData("Thomas.SERRE-ext@ca-ts.fr", "SM", "Ma Banque", "Squad 1", "Squad 5"));
        users.add(new UserData("Mickael.HAMOUMA-ext@ca-ts.fr", "Back", "Ma Banque", "Squad 1"));
        users.add(new UserData("Olivier.BUSIERE-ext@ca-ts.fr", "RM", "Ma Banque", "Transverse"));
        users.add(new UserData("Dalila.AMRAOUI@ca-ts.fr", "AFN2", "Ma Banque", "Transverse"));
        users.add(new UserData("Mikael.aubriot-ext@ca-ts.fr", "BA", "Ma Banque", "Squad 3"));
        users.add(new UserData("Mohammed.FATAH-ext@ca-ts.fr", "Test", "Ma Banque", "Squad 4"));
        users.add(new UserData("Katarzyna.SZEWCZAK@ca-ts.fr", "AFN2", "Ma Banque", "Transverse"));
        users.add(new UserData("Meryem.DRISSI-ext@ca-ts.fr", "Test", "Ma Banque", "Squad 4"));

        try (FileWriter fw = new FileWriter(OUTPUT_SQL, StandardCharsets.UTF_8)) {
            StringBuilder sql = new StringBuilder();
            sql.append("-- Bulk User Insert Generated from Image Transcription (V2)\n");

            for (UserData user : users) {
                String[] names = parseEmail(user.email);
                String firstName = names[0];
                String lastName = names[1];
                String userId = generateCuid();

                // Insert User (Ignore Internal status in columns, just status quo)
                String insertUser = String.format(
                        "INSERT INTO app_user (id, email, password, first_name, last_name, metier, tribu, theme_preference, widget_order, created_at, updated_at) "
                                +
                                "VALUES ('%s', '%s', '%s', '%s', '%s', '%s', '%s', 'light', '[]', NOW(), NOW());\n",
                        escape(userId), escape(user.email), escape(hashedPassword), escape(firstName), escape(lastName),
                        escape(user.metier), escape(user.tribu));
                sql.append(insertUser);

                // Insert Squads
                for (String squad : user.squads) {
                    String insertSquad = String.format(
                            "INSERT INTO user_squads (user_id, squad) VALUES ('%s', '%s');\n",
                            escape(userId), escape(squad));
                    sql.append(insertSquad);
                }
            }

            fw.write(sql.toString());
            System.out.println("Successfully generated SQL for " + users.size() + " users in " + OUTPUT_SQL);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static String[] parseEmail(String email) {
        String firstName = "Unknown";
        String lastName = "Unknown";
        try {
            String[] parts = email.split("@")[0].split("\\.");
            if (parts.length >= 1)
                firstName = capitalize(parts[0]);
            if (parts.length >= 2) {
                String ln = parts[1];
                if (ln.endsWith("-ext"))
                    ln = ln.substring(0, ln.length() - 4);
                lastName = capitalize(ln);
            }
        } catch (Exception e) {
        }
        return new String[] { firstName, lastName };
    }

    private static String capitalize(String s) {
        if (s == null || s.isEmpty())
            return "";
        return s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase();
    }

    private static String escape(String s) {
        if (s == null)
            return "";
        return s.replace("'", "''");
    }

    private static final String ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";
    private static final Random random = new SecureRandom();

    private static String generateCuid() {
        long timestamp = System.currentTimeMillis();
        StringBuilder cuid = new StringBuilder("c");
        cuid.append(Long.toString(timestamp, 36));
        for (int i = 0; i < 8; i++) {
            cuid.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
        }
        return cuid.toString();
    }
}
