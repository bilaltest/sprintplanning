package com.catsbanque.mabanquetools.repository;

import com.catsbanque.mabanquetools.entity.Settings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SettingsRepository extends JpaRepository<Settings, String> {
    // Settings is typically a singleton entity
    // No custom queries needed - will use findAll() or findById()
}
