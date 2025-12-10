package com.catsbanque.eventplanning.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Désactivé pour compatibilité Angular
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll() // Endpoints publics
                .requestMatchers("/health").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                .anyRequest().permitAll() // Temporairement tout public pour setup
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt avec coût 10 (identique à Node.js: bcrypt.hash(password, 10))
        return new BCryptPasswordEncoder(10);
    }
}
