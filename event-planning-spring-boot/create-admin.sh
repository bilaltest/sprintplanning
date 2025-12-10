#!/bin/bash

# Script pour créer l'utilisateur admin via l'API Spring Boot
# Usage: ./create-admin.sh

echo "=========================================="
echo "  Création de l'utilisateur Admin"
echo "=========================================="
echo ""

# Vérifier que le backend est démarré
echo "⏳ Vérification que le backend Spring Boot est démarré..."
if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "❌ ERREUR: Le backend Spring Boot ne répond pas sur http://localhost:3000"
    echo ""
    echo "Veuillez démarrer le backend avec:"
    echo "  cd event-planning-spring-boot/event-planning-api"
    echo "  ./mvnw spring-boot:run"
    echo ""
    exit 1
fi

echo "✅ Backend Spring Boot détecté"
echo ""

# Créer l'utilisateur admin
echo "⏳ Création de l'utilisateur admin..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/admin/create-admin-user)

if echo "$RESPONSE" | grep -q "créé avec succès"; then
    echo "✅ Utilisateur admin créé avec succès !"
    echo ""
    echo "=========================================="
    echo "  Informations de connexion"
    echo "=========================================="
    echo "Email:    admin"
    echo "Password: admin123"
    echo "=========================================="
    echo ""
    echo "Vous pouvez maintenant vous connecter à l'application Angular avec ces identifiants."
    echo "Le menu 'Admin' apparaîtra dans la sidebar après connexion."
    echo ""
elif echo "$RESPONSE" | grep -q "existe déjà"; then
    echo "ℹ️  L'utilisateur admin existe déjà dans la base de données"
    echo ""
    echo "=========================================="
    echo "  Informations de connexion"
    echo "=========================================="
    echo "Email:    admin"
    echo "Password: admin123"
    echo "=========================================="
    echo ""
else
    echo "❌ ERREUR lors de la création de l'utilisateur admin"
    echo "Réponse du serveur:"
    echo "$RESPONSE"
    echo ""
    exit 1
fi
