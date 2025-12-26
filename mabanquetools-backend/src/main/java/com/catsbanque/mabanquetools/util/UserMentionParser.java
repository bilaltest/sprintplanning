package com.catsbanque.mabanquetools.util;

import com.catsbanque.mabanquetools.entity.User;
import com.catsbanque.mabanquetools.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Utilitaire pour parser les mentions @user dans les commentaires et articles
 * Pattern: @[username] où username = partie avant @ de l'email
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class UserMentionParser {

    private final UserRepository userRepository;

    // Pattern: @[anything without spaces]
    // Examples: @bilal.djebbari, @john.doe, @admin
    private static final Pattern MENTION_PATTERN = Pattern.compile("@([a-zA-Z0-9._-]+)");

    /**
     * Extrait toutes les mentions @user valides d'un texte
     * @param content Contenu avec potentielles mentions
     * @return Liste d'utilisateurs mentionnés (dédupliquée)
     */
    public List<User> extractMentions(String content) {
        if (content == null || content.isEmpty()) {
            return List.of();
        }

        List<String> usernames = extractUsernames(content);

        if (usernames.isEmpty()) {
            return List.of();
        }

        // Chercher les users en base (par email prefix)
        List<User> mentionedUsers = new ArrayList<>();
        for (String username : usernames) {
            // Try exact email match first
            userRepository.findByEmail(username).ifPresent(mentionedUsers::add);

            // If not found, try with common domain patterns
            if (mentionedUsers.stream().noneMatch(u -> u.getEmail().startsWith(username))) {
                // Try with @ca-ts.fr domain
                userRepository.findByEmail(username + "@ca-ts.fr")
                        .ifPresent(user -> {
                            if (!mentionedUsers.contains(user)) {
                                mentionedUsers.add(user);
                            }
                        });
            }
        }

        log.info("Extracted {} valid mentions from content (out of {} usernames found)",
                mentionedUsers.size(), usernames.size());
        return mentionedUsers;
    }

    /**
     * Extrait les usernames bruts des mentions (sans validation DB)
     * @param content Contenu avec mentions
     * @return Liste de usernames (dédupliquée, ordre d'apparition)
     */
    public List<String> extractUsernames(String content) {
        if (content == null || content.isEmpty()) {
            return List.of();
        }

        List<String> usernames = new ArrayList<>();
        Matcher matcher = MENTION_PATTERN.matcher(content);

        while (matcher.find()) {
            String username = matcher.group(1); // Groupe 1 = sans le @
            if (!usernames.contains(username)) {
                usernames.add(username);
            }
        }

        return usernames;
    }

    /**
     * Remplace les mentions par des liens HTML (pour affichage frontend)
     * @param content Contenu avec mentions
     * @return HTML avec mentions en <span class="mention">
     */
    public String highlightMentions(String content) {
        if (content == null || content.isEmpty()) {
            return content;
        }

        return MENTION_PATTERN.matcher(content).replaceAll(
            "<span class=\"mention\">@$1</span>"
        );
    }
}
