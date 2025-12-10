# 🔧 Problèmes Courants et Solutions - Migration Spring Boot

## 📋 Table des Matières
1. [Problème: Erreur 400 création de release](#problème-1-erreur-400-création-de-release)
2. [Problème: customCategories.forEach is not a function](#problème-2-customcategoriesforeach-is-not-a-function)
3. [Problème: User admin manquant](#problème-3-user-admin-manquant)

---

## Problème 1: Erreur 400 création de release

### ❌ Symptôme
```javascript
Error creating release: HttpErrorResponse {
  status: 400,
  statusText: 'OK',
  url: 'http://localhost:3000/api/releases'
}
```

### 🔍 Cause
Le backend Spring Boot attend un `LocalDateTime` pour le champ `releaseDate`, mais Angular envoie une date au format ISO 8601 string (e.g., `"2025-12-09T00:00:00.000Z"`).

### ✅ Solution
Ajouter l'annotation `@JsonFormat` dans `CreateReleaseRequest.java` :

**Fichier**: `/src/main/java/com/catsbanque/eventplanning/dto/CreateReleaseRequest.java`

```java
@NotNull(message = "Release date is required")
@JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
private LocalDateTime releaseDate;
```

**Code complet**:
```java
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReleaseRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Version is required")
    private String version;

    @NotNull(message = "Release date is required")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime releaseDate;

    private String type = "release";

    private String description;
}
```

---

## Problème 2: customCategories.forEach is not a function

### ❌ Symptôme
```javascript
filter-bar.component.ts:82 ERROR TypeError: prefs.customCategories.forEach is not a function
    at category.service.ts:50:32
```

### 🔍 Cause
Le backend Spring Boot renvoie `customCategories` comme string JSON (`"[]"`) au lieu d'un tableau JavaScript. Angular s'attend à recevoir un tableau directement.

### ✅ Solution
Ajouter l'annotation `@JsonRawValue` dans `SettingsDto.java` pour que Jackson renvoie le JSON brut (sans double encodage).

**Fichier**: `/src/main/java/com/catsbanque/eventplanning/dto/SettingsDto.java`

```java
import com.fasterxml.jackson.annotation.JsonRawValue;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SettingsDto {

    private String id;
    private String theme;

    @JsonRawValue  // ⭐ Crucial : renvoie le JSON brut
    private String customCategories;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static SettingsDto fromEntity(Settings settings) {
        return SettingsDto.builder()
                .id(settings.getId())
                .theme(settings.getTheme())
                .customCategories(settings.getCustomCategories())
                .createdAt(settings.getCreatedAt())
                .updatedAt(settings.getUpdatedAt())
                .build();
    }
}
```

**Avant** (❌):
```json
{
  "customCategories": "[]"  // String
}
```

**Après** (✅):
```json
{
  "customCategories": []  // Array
}
```

---

## Problème 3: User admin manquant

### ❌ Symptôme
Impossible de se connecter avec le compte admin par défaut.

### 🔍 Cause
L'utilisateur admin n'est pas créé automatiquement au démarrage de l'application.

### ✅ Solution
Créer un `DataInitializer` qui s'exécute au démarrage avec `CommandLineRunner`.

**Fichier**: `/src/main/java/com/catsbanque/eventplanning/config/DataInitializer.java`

```java
package com.catsbanque.eventplanning.config;

import com.catsbanque.eventplanning.entity.User;
import com.catsbanque.eventplanning.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Initialise les données par défaut au démarrage
 * Crée l'utilisateur admin si il n'existe pas
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createDefaultAdminUser();
    }

    private void createDefaultAdminUser() {
        String adminEmail = "admin@mabanque.fr";

        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User admin = new User();
            admin.setId("admin001");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setFirstName("Admin");
            admin.setLastName("Système");
            admin.setThemePreference("light");
            admin.setWidgetOrder("[]");

            userRepository.save(admin);
            log.info("✅ Utilisateur admin créé : {} / {}", adminEmail, "admin");
        } else {
            log.info("ℹ️  Utilisateur admin existe déjà");
        }
    }
}
```

**Credentials par défaut** :
- **Email** : `admin@mabanque.fr`
- **Password** : `admin`

### ⚠️ Important : Ne pas utiliser data.sql pour les users

**Problème avec `data.sql`** : MySQL ne supporte pas `ON CONFLICT DO NOTHING` (syntaxe PostgreSQL). Utiliser `INSERT IGNORE` ne fonctionne pas bien avec BCrypt car le hash change à chaque exécution.

**Solution préférée** : Utiliser `CommandLineRunner` avec BCrypt dynamique.

---

## 📝 Checklist de Démarrage

Avant de lancer l'application Angular, vérifier que le backend Spring Boot démarre correctement :

```bash
# 1. Lancer Spring Boot
cd event-planning-spring-boot/event-planning-api
./mvnw spring-boot:run

# 2. Vérifier les logs de démarrage
# Attendre le message : "✅ Utilisateur admin créé : admin@mabanque.fr / admin"

# 3. Tester la connexion admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mabanque.fr","password":"admin"}'

# Réponse attendue :
# {
#   "message": "Connexion réussie",
#   "token": "token_admin001_...",
#   "user": {
#     "id": "admin001",
#     "email": "admin@mabanque.fr",
#     "firstName": "Admin",
#     "lastName": "Système",
#     ...
#   }
# }
```

---

## 🔄 Si un problème persiste

### 1. Nettoyer le cache Maven
```bash
cd event-planning-spring-boot/event-planning-api
./mvnw clean
```

### 2. Supprimer l'ancien user admin de la DB
```bash
mysql -u eventplanning -peventplanning123 -h localhost eventplanning \
  -e "DELETE FROM app_user WHERE email='admin@mabanque.fr'"
```

### 3. Rebuild et relancer
```bash
./mvnw spring-boot:run
```

### 4. Vérifier les logs
Les logs doivent afficher :
```
2025-12-09 00:32:56 - ✅ Utilisateur admin créé : admin@mabanque.fr / admin
```

---

## 📞 Support

Si vous rencontrez d'autres problèmes non listés ici :

1. Vérifier les logs Spring Boot (`console output`)
2. Vérifier les logs Angular (`browser console`)
3. Vérifier la base de données MySQL (tables, données)
4. Consulter `/QUICK_START.md` pour le setup complet

---

**Date** : 2025-12-09 00:35
**Version** : 1.0
**Auteur** : Claude (Sonnet 4.5)
**Stack** : Spring Boot 3.4.1 + Java 21 + MySQL 8.4.7
