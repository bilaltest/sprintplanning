#!/bin/bash

# Script pour vérifier l'état de l'utilisateur admin

echo "=========================================="
echo "  Diagnostic Utilisateur Admin"
echo "=========================================="
echo ""

# 1. Vérifier que le backend est démarré
echo "1️⃣  Vérification du backend Spring Boot..."
if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "   ❌ Backend Spring Boot non accessible sur http://localhost:3000"
    echo ""
    echo "   Démarrez le backend avec:"
    echo "   cd event-planning-spring-boot/event-planning-api"
    echo "   ./mvnw spring-boot:run"
    echo ""
    exit 1
fi
echo "   ✅ Backend accessible"
echo ""

# 2. Vérifier si l'utilisateur admin existe via l'API
echo "2️⃣  Vérification de l'existence de l'utilisateur admin..."
ADMIN_EXISTS=$(curl -s -X POST http://localhost:3000/api/admin/create-admin-user 2>&1)

if echo "$ADMIN_EXISTS" | grep -q "existe déjà"; then
    echo "   ✅ L'utilisateur admin existe dans la base de données"
    echo ""
elif echo "$ADMIN_EXISTS" | grep -q "créé avec succès"; then
    echo "   ✅ Utilisateur admin créé avec succès"
    echo ""
else
    echo "   ⚠️  Impossible de vérifier/créer l'utilisateur admin"
    echo "   Réponse: $ADMIN_EXISTS"
    echo ""
fi

# 3. Tester la connexion
echo "3️⃣  Test de connexion avec admin/admin123..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin","password":"admin123"}')

if echo "$LOGIN_RESPONSE" | grep -q "Connexion réussie"; then
    echo "   ✅ Connexion réussie"
    echo ""

    # Extraire l'email de la réponse
    EMAIL=$(echo "$LOGIN_RESPONSE" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)
    echo "   📧 Email retourné par l'API: '$EMAIL'"

    if [ "$EMAIL" = "admin" ]; then
        echo "   ✅ L'email est bien 'admin' (sans majuscule)"
    else
        echo "   ⚠️  L'email est '$EMAIL' (attendu: 'admin')"
    fi
    echo ""

    # Afficher la réponse complète
    echo "   📋 Réponse complète de l'API:"
    echo "$LOGIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE"
    echo ""

elif echo "$LOGIN_RESPONSE" | grep -q "Email ou mot de passe incorrect"; then
    echo "   ❌ Email ou mot de passe incorrect"
    echo "   L'utilisateur admin n'existe peut-être pas ou le mot de passe est incorrect"
    echo ""
    echo "   Créez l'utilisateur admin avec:"
    echo "   cd event-planning-spring-boot"
    echo "   ./create-admin.sh"
    echo ""
else
    echo "   ❌ Erreur lors de la connexion"
    echo "   Réponse: $LOGIN_RESPONSE"
    echo ""
fi

# 4. Instructions pour le debug dans le navigateur
echo "=========================================="
echo "  Debug dans le Navigateur"
echo "=========================================="
echo ""
echo "Après vous être connecté dans l'application Angular,"
echo "ouvrez la Console DevTools (F12) et tapez:"
echo ""
echo "  JSON.parse(sessionStorage.getItem('planning_user'))"
echo ""
echo "Vérifiez que le champ 'email' est bien égal à 'admin'"
echo ""
echo "Si l'email est différent, le menu Admin ne s'affichera pas."
echo ""
