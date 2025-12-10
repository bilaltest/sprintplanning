package com.catsbanque.eventplanning.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * Configuration du cache Caffeine pour optimiser les performances
 * Utilisé principalement pour Settings (récupérés fréquemment)
 */
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager("settings");
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(1, TimeUnit.HOURS) // Cache 1h (settings changent rarement)
                .maximumSize(100)                     // Max 100 entrées (1 seule en pratique)
                .recordStats());                      // Activer stats (visible via actuator)

        return cacheManager;
    }
}
