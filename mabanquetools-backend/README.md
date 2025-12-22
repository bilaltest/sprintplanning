# Ma Banque Tools API

![Java](https://img.shields.io/badge/Java-24-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3+-green)
![MySQL](https://img.shields.io/badge/MySQL-8+-blue)

Backend de l'application **Ma Banque Tools**, outil interne de gestion des événements, des absences et des processus d'équipe.

## 📚 Documentation

- **[Architecture & Règles Fonctionnelles](ARCHITECTURE.md)** : Vue d'ensemble du modèle de données, des règles métier et des fonctionnalités.
- **API Documentation (Swagger)** : Accessible via `http://localhost:3000/api/swagger-ui.html` une fois l'application lancée.

## 🚀 Démarrage Rapide

### Prérequis
- Java 24
- Maven 3.9+
- MySQL 8.0+

### Configuration
1.  Cloner le dépôt.
2.  Configurer la base de données dans `src/main/resources/application.properties` (ou via variables d'environnement).
3.  Créer la base de données : `CREATE DATABASE mabanquetools;`

### Lancement
#### Production (MySQL)
```bash
# Compiler et lancer les tests
mvn clean install

# Démarrer l'application
mvn spring-boot:run
```

#### Développement (Sans BDD / H2)
Si vous n'avez pas de base de données MySQL locale, vous pouvez utiliser le profil `dev` qui utilise une base de données en mémoire (H2).
Attention : les données sont perdues à l'arrêt de l'application.

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```
- **Console H2** : `http://localhost:3000/api/h2-console`
- **JDBC URL** : `jdbc:h2:mem:mabanquetools`
- **User** : `sa` (pas de mot de passe)

L'application sera accessible sur `http://localhost:3000/api`.

## 🛠️ Stack Technique
*   **Framework** : Spring Boot 3
*   **Sécurité** : Spring Security + JWT
*   **Base de données** : MySQL + JPA (Hibernate)
*   **Documentation** : SpringDoc (OpenAPI)

## 👤 Compte Admin par défaut
Si la base est vide, un compte admin est créé au démarrage :
*   **Email** : `admin`
*   **Mot de passe** : `admin123`
