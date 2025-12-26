package com.catsbanque.mabanquetools.util;

import com.catsbanque.mabanquetools.entity.User;
import com.catsbanque.mabanquetools.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

/**
 * Tests unitaires pour UserMentionParser
 */
@ExtendWith(MockitoExtension.class)
class UserMentionParserTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserMentionParser userMentionParser;

    private User user1;
    private User user2;

    @BeforeEach
    void setUp() {
        user1 = new User();
        user1.setId("user1");
        user1.setEmail("bilal.djebbari@ca-ts.fr");
        user1.setFirstName("Bilal");
        user1.setLastName("Djebbari");

        user2 = new User();
        user2.setId("user2");
        user2.setEmail("john.doe@ca-ts.fr");
        user2.setFirstName("John");
        user2.setLastName("Doe");
    }

    @Test
    void extractUsernames_shouldFindSingleMention() {
        String content = "Hello @bilal.djebbari, comment ça va ?";

        List<String> usernames = userMentionParser.extractUsernames(content);

        assertThat(usernames).hasSize(1);
        assertThat(usernames).contains("bilal.djebbari");
    }

    @Test
    void extractUsernames_shouldFindMultipleMentions() {
        String content = "CC @bilal.djebbari et @john.doe pour info";

        List<String> usernames = userMentionParser.extractUsernames(content);

        assertThat(usernames).hasSize(2);
        assertThat(usernames).containsExactlyInAnyOrder("bilal.djebbari", "john.doe");
    }

    @Test
    void extractUsernames_shouldDeduplicateMentions() {
        String content = "@bilal.djebbari merci @bilal.djebbari pour votre aide";

        List<String> usernames = userMentionParser.extractUsernames(content);

        assertThat(usernames).hasSize(1);
        assertThat(usernames).contains("bilal.djebbari");
    }

    @Test
    void extractUsernames_shouldReturnEmptyListWhenNoMentions() {
        String content = "Pas de mentions ici";

        List<String> usernames = userMentionParser.extractUsernames(content);

        assertThat(usernames).isEmpty();
    }

    @Test
    void extractUsernames_shouldHandleNullContent() {
        List<String> usernames = userMentionParser.extractUsernames(null);

        assertThat(usernames).isEmpty();
    }

    @Test
    void extractUsernames_shouldHandleEmptyContent() {
        List<String> usernames = userMentionParser.extractUsernames("");

        assertThat(usernames).isEmpty();
    }

    @Test
    void extractUsernames_shouldHandleMentionsWithHyphensAndUnderscores() {
        String content = "@jean-paul_dupont et @marie_claire";

        List<String> usernames = userMentionParser.extractUsernames(content);

        assertThat(usernames).hasSize(2);
        assertThat(usernames).containsExactlyInAnyOrder("jean-paul_dupont", "marie_claire");
    }

    @Test
    void extractMentions_shouldReturnValidUsers() {
        String content = "Hello @bilal.djebbari et @john.doe";

        // Mock les appels exacts qui seront faits
        when(userRepository.findByEmail("bilal.djebbari")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("bilal.djebbari@ca-ts.fr"))
                .thenReturn(Optional.of(user1));
        when(userRepository.findByEmail("john.doe")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("john.doe@ca-ts.fr"))
                .thenReturn(Optional.of(user2));

        List<User> users = userMentionParser.extractMentions(content);

        assertThat(users).hasSize(2);
        assertThat(users).extracting("email")
                .containsExactlyInAnyOrder("bilal.djebbari@ca-ts.fr", "john.doe@ca-ts.fr");
    }

    @Test
    void extractMentions_shouldIgnoreInvalidUsernames() {
        String content = "Hello @bilal.djebbari et @unknown.user";

        // Mock tous les appels qui seront faits
        when(userRepository.findByEmail("bilal.djebbari")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("bilal.djebbari@ca-ts.fr"))
                .thenReturn(Optional.of(user1));
        when(userRepository.findByEmail("unknown.user"))
                .thenReturn(Optional.empty());
        when(userRepository.findByEmail("unknown.user@ca-ts.fr"))
                .thenReturn(Optional.empty());

        List<User> users = userMentionParser.extractMentions(content);

        assertThat(users).hasSize(1);
        assertThat(users.get(0).getEmail()).isEqualTo("bilal.djebbari@ca-ts.fr");
    }

    @Test
    void extractMentions_shouldReturnEmptyListWhenNoValidUsers() {
        String content = "@unknown1 et @unknown2";

        when(userRepository.findByEmail("unknown1")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("unknown1@ca-ts.fr")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("unknown2")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("unknown2@ca-ts.fr")).thenReturn(Optional.empty());

        List<User> users = userMentionParser.extractMentions(content);

        assertThat(users).isEmpty();
    }

    @Test
    void highlightMentions_shouldWrapInSpan() {
        String content = "Hello @bilal.djebbari";

        String highlighted = userMentionParser.highlightMentions(content);

        assertThat(highlighted).isEqualTo("Hello <span class=\"mention\">@bilal.djebbari</span>");
    }

    @Test
    void highlightMentions_shouldWrapMultipleMentions() {
        String content = "@bilal.djebbari et @john.doe";

        String highlighted = userMentionParser.highlightMentions(content);

        assertThat(highlighted).isEqualTo("<span class=\"mention\">@bilal.djebbari</span> et <span class=\"mention\">@john.doe</span>");
    }

    @Test
    void highlightMentions_shouldHandleNullContent() {
        String highlighted = userMentionParser.highlightMentions(null);

        assertThat(highlighted).isNull();
    }

    @Test
    void highlightMentions_shouldHandleEmptyContent() {
        String highlighted = userMentionParser.highlightMentions("");

        assertThat(highlighted).isEmpty();
    }
}
