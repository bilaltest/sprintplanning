#!/bin/bash

# Script de compilation pour event-planning-api
# Utilise Java 25 avec Spring Boot 3.5.0-M1

echo "🔧 Configuration de Java 25..."
export JAVA_HOME=$(/usr/libexec/java_home -v 25)
echo "   JAVA_HOME: $JAVA_HOME"
echo "   Version Java: $(java -version 2>&1 | head -1)"
echo ""

echo "📦 Compilation du projet (sans tests)..."
./mvnw clean package -Dmaven.test.skip=true

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Compilation réussie !"
    echo ""
    echo "Pour démarrer le serveur :"
    echo "   ./run.sh"
else
    echo ""
    echo "❌ Échec de la compilation"
    exit 1
fi
