package com.catsbanque.mabanquetools.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true) // Active @PreAuthorize
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @org.springframework.beans.factory.annotation.Value("${app.security.session-policy:STATELESS}")
    private String sessionPolicy;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Utiliser la configuration
                                                                                   // personnalisée
                .csrf(csrf -> csrf.disable()) // Désactivé pour compatibilité Angular
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.valueOf(sessionPolicy)) // Configurable (STATELESS
                                                                                             // en prod, IF_REQUIRED en
                                                                                             // test)
                )
                .authorizeHttpRequests(auth -> auth
                        // Endpoints publics (authentification)
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/health").permitAll()
                        .requestMatchers("/actuator/health").permitAll()
                        .requestMatchers("/h2-console/**").permitAll() // H2 Console
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll() // OpenAPI
                                                                                                              // /
                                                                                                              // Swagger

                        // Tous les autres endpoints nécessitent une authentification
                        .anyRequest().authenticated())
                .headers(headers -> headers.frameOptions(frame -> frame.disable())) // Autoriser les frames pour H2
                                                                                    // Console
                // Ajouter le filtre JWT avant UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        // Autoriser localhost:4200 (Angular dev) et 8080/8081 (http-server PWA demo)
        configuration.setAllowedOrigins(
                java.util.List.of("http://localhost:4200", "http://localhost:8080", "http://localhost:8081"));
        configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(java.util.List.of("Authorization", "Cache-Control", "Content-Type"));
        configuration.setAllowCredentials(true);

        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt avec coût 10 (identique à Node.js: bcrypt.hash(password, 10))
        return new BCryptPasswordEncoder(10);
    }
}
