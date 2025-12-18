package com.catsbanque.mabanquetools.repository;

import com.catsbanque.mabanquetools.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId("test-user-1");
        testUser.setEmail("test@example.com");
        testUser.setPassword("$2a$10$hashedPassword");
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setThemePreference("dark");
        testUser.setWidgetOrder("[]");
    }

    @Test
    void shouldSaveUser() {
        // When
        User saved = userRepository.save(testUser);

        // Then
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getEmail()).isEqualTo("test@example.com");
        assertThat(saved.getFirstName()).isEqualTo("John");
    }

    @Test
    void shouldFindUserByEmail() {
        // Given
        entityManager.persist(testUser);
        entityManager.flush();

        // When
        Optional<User> found = userRepository.findByEmail("test@example.com");

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("test@example.com");
        assertThat(found.get().getFirstName()).isEqualTo("John");
    }

    @Test
    void shouldReturnEmptyWhenEmailNotFound() {
        // When
        Optional<User> found = userRepository.findByEmail("nonexistent@example.com");

        // Then
        assertThat(found).isEmpty();
    }

    @Test
    void shouldCheckIfEmailExists() {
        // Given
        entityManager.persist(testUser);
        entityManager.flush();

        // When
        boolean exists = userRepository.existsByEmail("test@example.com");
        boolean notExists = userRepository.existsByEmail("other@example.com");

        // Then
        assertThat(exists).isTrue();
        assertThat(notExists).isFalse();
    }

    @Test
    void shouldUpdateUser() {
        // Given
        User saved = entityManager.persist(testUser);
        entityManager.flush();

        // When
        saved.setThemePreference("light");
        saved.setWidgetOrder("[\"widget1\", \"widget2\"]");
        User updated = userRepository.save(saved);

        // Then
        assertThat(updated.getThemePreference()).isEqualTo("light");
        assertThat(updated.getWidgetOrder()).contains("widget1");
        assertThat(updated.getUpdatedAt()).isNotNull();
    }

    @Test
    void shouldDeleteUser() {
        // Given
        User saved = entityManager.persist(testUser);
        entityManager.flush();
        String userId = saved.getId();

        // When
        userRepository.deleteById(userId);

        // Then
        Optional<User> found = userRepository.findById(userId);
        assertThat(found).isEmpty();
    }
}
