# Note sur Java 25 et Spring Boot 3.5

## Problème actuel

Java 25 (version 25.0.1 sortie en octobre 2025) n'est **pas encore supporté** par les outils de build Maven actuels :
- `maven-compiler-plugin` versions 3.13.0 et 3.14.0 échouent avec l'erreur :
  ```
  Fatal error compiling: java.lang.ExceptionInInitializerError: com.sun.tools.javac.code.TypeTag :: UNKNOWN
  ```

## Pourquoi ?

Java 25 introduit probablement des changements internes dans le compilateur `javac` qui cassent la compatibilité avec les anciennes versions des plugins Maven.

## Solutions

### Solution 1 : Attendre (RECOMMANDÉ pour production)
- Attendre `maven-compiler-plugin` 3.15.0 ou supérieur avec support Java 25
- OU attendre Spring Boot 3.5.0 GA (actuellement en M1 - Milestone 1)
- Java 25 est très récent, les outils ont besoin de temps pour s'adapter

### Solution 2 : Downgrade vers Java 21 LTS (RECOMMANDÉ actuellement)
Java 21 est la dernière version LTS (Long Term Support) et est **pleinement supportée** par :
- Spring Boot 3.4.1 (stable)
- Spring Boot 3.5.0-M1 (milestone)
- Tous les plugins Maven actuels

**Pour revenir à Java 21** :
```bash
# Dans pom.xml, changer :
<java.version>21</java.version>

# Et dans build.sh :
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
```

### Solution 3 : Utiliser Java 23 ou 24
Java 23 et 24 sont plus stables que Java 25 et ont un meilleur support tooling.

## État actuel du projet

- ✅ Code compatible Java 25 (pas de features spécifiques Java 25 utilisées)
- ✅ Spring Boot 3.5.0-M1 configuré
- ❌ Maven compiler plugin incompatible avec Java 25
- ✅ Toutes les corrections d'import/export de BDD appliquées

## Recommandation

**Utiliser Java 21** jusqu'à ce que :
1. Maven compiler plugin 3.15+ soit disponible avec support Java 25
2. Spring Boot 3.5.0 sorte en version stable (GA)
3. L'écosystème Java 25 soit plus mature

Java 21 LTS sera supporté jusqu'en septembre 2031, c'est un choix solide pour la production.
