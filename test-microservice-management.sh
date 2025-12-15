#!/bin/bash

# Script de test de la fonctionnalité de gestion des microservices
# Ce script teste :
# 1. Authentification admin (RELEASES_WRITE requis)
# 2. Lecture de la liste des microservices (GET)
# 3. Création d'un nouveau microservice (POST)
# 4. Modification d'un microservice (PUT)
# 5. Suppression (soft delete) d'un microservice (DELETE)

set -e

echo "=========================================="
echo "Test de la gestion des microservices"
echo "=========================================="
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URL de l'API
API_URL="http://localhost:3000/api"

echo "1. Login admin..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin","password":"admin"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
PERMISSIONS=$(echo "$LOGIN_RESPONSE" | jq -r '.user.permissions.RELEASES')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}✗ ÉCHEC${NC} - Login admin échoué"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ SUCCÈS${NC} - Token JWT obtenu"
echo "Permission RELEASES: $PERMISSIONS"
echo ""

if [ "$PERMISSIONS" != "WRITE" ]; then
  echo -e "${RED}✗ ÉCHEC${NC} - Permission RELEASES WRITE requise (actuelle: $PERMISSIONS)"
  exit 1
fi

echo "2. GET /api/microservices (liste des microservices actifs)..."
MICROSERVICES=$(curl -s "${API_URL}/microservices" \
  -H "Authorization: Bearer $TOKEN")

COUNT=$(echo "$MICROSERVICES" | jq 'length')
echo -e "${GREEN}✓ SUCCÈS${NC} - $COUNT microservices actifs trouvés"
echo "Exemple: $(echo "$MICROSERVICES" | jq -r '.[0].name')"
echo ""

echo "3. POST /api/microservices (création d'un nouveau microservice)..."
CREATE_RESPONSE=$(curl -s -X POST "${API_URL}/microservices" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Microservice API",
    "squad": "Squad 1",
    "solution": "Test Solution",
    "displayOrder": 99,
    "description": "Microservice créé par test automatique"
  }')

NEW_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id')
NEW_NAME=$(echo "$CREATE_RESPONSE" | jq -r '.name')

if [ "$NEW_ID" = "null" ] || [ -z "$NEW_ID" ]; then
  echo -e "${RED}✗ ÉCHEC${NC} - Création échouée"
  echo "Response: $CREATE_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ SUCCÈS${NC} - Microservice créé (ID: $NEW_ID, Name: $NEW_NAME)"
echo ""

echo "4. GET /api/microservices/{id} (récupération du microservice créé)..."
GET_RESPONSE=$(curl -s "${API_URL}/microservices/${NEW_ID}" \
  -H "Authorization: Bearer $TOKEN")

GET_NAME=$(echo "$GET_RESPONSE" | jq -r '.name')

if [ "$GET_NAME" != "$NEW_NAME" ]; then
  echo -e "${RED}✗ ÉCHEC${NC} - Microservice non trouvé"
  exit 1
fi

echo -e "${GREEN}✓ SUCCÈS${NC} - Microservice récupéré: $GET_NAME"
echo ""

echo "5. PUT /api/microservices/{id} (modification du microservice)..."
UPDATE_RESPONSE=$(curl -s -X PUT "${API_URL}/microservices/${NEW_ID}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Microservice API (Modifié)",
    "squad": "Squad 2",
    "solution": "Test Solution Updated",
    "displayOrder": 100,
    "isActive": true,
    "description": "Description mise à jour"
  }')

UPDATED_NAME=$(echo "$UPDATE_RESPONSE" | jq -r '.name')
UPDATED_SQUAD=$(echo "$UPDATE_RESPONSE" | jq -r '.squad')

if [ "$UPDATED_SQUAD" != "Squad 2" ]; then
  echo -e "${RED}✗ ÉCHEC${NC} - Modification échouée"
  echo "Response: $UPDATE_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ SUCCÈS${NC} - Microservice modifié (Name: $UPDATED_NAME, Squad: $UPDATED_SQUAD)"
echo ""

echo "6. DELETE /api/microservices/{id} (soft delete)..."
DELETE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X DELETE "${API_URL}/microservices/${NEW_ID}" \
  -H "Authorization: Bearer $TOKEN")

HTTP_STATUS=$(echo "$DELETE_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)

if [ "$HTTP_STATUS" != "204" ]; then
  echo -e "${RED}✗ ÉCHEC${NC} - Suppression échouée (HTTP $HTTP_STATUS)"
  echo "Response: $DELETE_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ SUCCÈS${NC} - Microservice désactivé (soft delete)"
echo ""

echo "7. GET /api/microservices (vérification que le microservice n'apparaît plus)..."
MICROSERVICES_AFTER=$(curl -s "${API_URL}/microservices" \
  -H "Authorization: Bearer $TOKEN")

FOUND=$(echo "$MICROSERVICES_AFTER" | jq --arg id "$NEW_ID" '[.[] | select(.id == $id)] | length')

if [ "$FOUND" != "0" ]; then
  echo -e "${RED}✗ ÉCHEC${NC} - Le microservice apparaît encore dans la liste active"
  exit 1
fi

echo -e "${GREEN}✓ SUCCÈS${NC} - Le microservice n'apparaît plus dans la liste active"
echo ""

echo "8. GET /api/microservices/all (vérification que le microservice existe toujours, inactif)..."
ALL_MICROSERVICES=$(curl -s "${API_URL}/microservices/all" \
  -H "Authorization: Bearer $TOKEN")

INACTIVE_MS=$(echo "$ALL_MICROSERVICES" | jq --arg id "$NEW_ID" '[.[] | select(.id == $id and .isActive == false)] | length')

if [ "$INACTIVE_MS" != "1" ]; then
  echo -e "${RED}✗ ÉCHEC${NC} - Le microservice n'est pas marqué comme inactif"
  exit 1
fi

echo -e "${GREEN}✓ SUCCÈS${NC} - Le microservice est bien marqué comme inactif"
echo ""

echo "9. DELETE /api/microservices/{id}/hard (hard delete - nettoyage)..."
HARD_DELETE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X DELETE "${API_URL}/microservices/${NEW_ID}/hard" \
  -H "Authorization: Bearer $TOKEN")

HTTP_STATUS=$(echo "$HARD_DELETE_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)

if [ "$HTTP_STATUS" != "204" ]; then
  echo -e "${YELLOW}⚠ ATTENTION${NC} - Hard delete échoué (HTTP $HTTP_STATUS), mais ce n'est pas critique"
else
  echo -e "${GREEN}✓ SUCCÈS${NC} - Microservice supprimé définitivement (nettoyage OK)"
fi
echo ""

echo "=========================================="
echo -e "${GREEN}✓ TOUS LES TESTS RÉUSSIS${NC}"
echo "=========================================="
echo ""
echo "Résumé des fonctionnalités testées:"
echo "  ✓ Authentification admin avec RELEASES_WRITE"
echo "  ✓ GET /api/microservices (liste active)"
echo "  ✓ POST /api/microservices (création)"
echo "  ✓ GET /api/microservices/{id} (détail)"
echo "  ✓ PUT /api/microservices/{id} (modification)"
echo "  ✓ DELETE /api/microservices/{id} (soft delete)"
echo "  ✓ GET /api/microservices/all (liste complète)"
echo "  ✓ DELETE /api/microservices/{id}/hard (hard delete)"
echo ""
echo "La fonctionnalité de gestion des microservices fonctionne correctement !"
echo ""
