package com.catsbanque.eventplanning.repository;

import com.catsbanque.eventplanning.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    /**
     * Find user by email (unique)
     * Used for authentication
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if email already exists
     * Used for registration validation
     */
    boolean existsByEmail(String email);

    /**
     * Find all users ordered by creation date descending
     * Used for admin panel
     */
    List<User> findAllByOrderByCreatedAtDesc();

}
