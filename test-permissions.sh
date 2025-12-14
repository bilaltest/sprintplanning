#!/bin/bash

# Script de test automatique du système de permissions
# Nécessite que le backend Spring Boot soit démarré sur localhost:3000

set -e

API_URL="http://localhost:3000/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================"
echo "Test du Système de Permissions"
echo "======================================"
echo ""

# Fonction pour afficher un résultat de test
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC} - $2"
    else
        echo -e "${RED}✗ FAIL${NC} - $2"
    fi
}

# Test 1 : Login admin et vérification des permissions
echo -e "${YELLOW}Test 1 : Login admin${NC}"
ADMIN_RESPONSE=$(curl -s -X POST ${API_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin","password":"admin"}')

ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | jq -r '.token')
ADMIN_PERMS=$(echo $ADMIN_RESPONSE | jq -r '.user.permissions')

if [ "$ADMIN_TOKEN" != "null" ] && [ ! -z "$ADMIN_TOKEN" ]; then
    test_result 0 "Admin login successful"
    echo "   Token: ${ADMIN_TOKEN:0:20}..."
else
    test_result 1 "Admin login failed"
    echo "   Response: $ADMIN_RESPONSE"
    exit 1
fi

# Vérifier les permissions de l'admin
CALENDAR_PERM=$(echo $ADMIN_PERMS | jq -r '.CALENDAR')
RELEASES_PERM=$(echo $ADMIN_PERMS | jq -r '.RELEASES')
ADMIN_PERM=$(echo $ADMIN_PERMS | jq -r '.ADMIN')

if [ "$CALENDAR_PERM" = "WRITE" ] && [ "$RELEASES_PERM" = "WRITE" ] && [ "$ADMIN_PERM" = "WRITE" ]; then
    test_result 0 "Admin has WRITE on all modules"
    echo "   CALENDAR: $CALENDAR_PERM, RELEASES: $RELEASES_PERM, ADMIN: $ADMIN_PERM"
else
    test_result 1 "Admin permissions incorrect"
    echo "   Expected: WRITE/WRITE/WRITE, Got: $CALENDAR_PERM/$RELEASES_PERM/$ADMIN_PERM"
fi

echo ""

# Test 2 : Créer un utilisateur de test
echo -e "${YELLOW}Test 2 : Création d'un utilisateur de test${NC}"
TIMESTAMP=$(date +%s)
TEST_EMAIL="test.user${TIMESTAMP}@ca-ts.fr"
REGISTER_RESPONSE=$(curl -s -X POST ${API_URL}/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"password123\",\"firstName\":\"Test\",\"lastName\":\"User\"}")

REGISTER_STATUS=$(echo $REGISTER_RESPONSE | jq -r '.message')
if [[ "$REGISTER_STATUS" == *"succès"* ]] || [[ "$REGISTER_STATUS" == *"success"* ]]; then
    test_result 0 "Test user created: $TEST_EMAIL"
else
    test_result 1 "Test user creation failed"
    echo "   Response: $REGISTER_RESPONSE"
fi

# Login avec le test user
TEST_LOGIN=$(curl -s -X POST ${API_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"password123\"}")

TEST_TOKEN=$(echo $TEST_LOGIN | jq -r '.token')
TEST_USER_ID=$(echo $TEST_LOGIN | jq -r '.user.id')

if [ "$TEST_TOKEN" != "null" ]; then
    test_result 0 "Test user login successful"
    echo "   User ID: $TEST_USER_ID"
else
    test_result 1 "Test user login failed"
    exit 1
fi

echo ""

# Test 3 : Vérifier les permissions par défaut (doivent être NONE)
echo -e "${YELLOW}Test 3 : Permissions par défaut${NC}"
TEST_PERMS=$(echo $TEST_LOGIN | jq -r '.user.permissions')
DEFAULT_CALENDAR=$(echo $TEST_PERMS | jq -r '.CALENDAR // "NONE"')
DEFAULT_RELEASES=$(echo $TEST_PERMS | jq -r '.RELEASES // "NONE"')
DEFAULT_ADMIN=$(echo $TEST_PERMS | jq -r '.ADMIN // "NONE"')

echo "   Permissions: CALENDAR=$DEFAULT_CALENDAR, RELEASES=$DEFAULT_RELEASES, ADMIN=$DEFAULT_ADMIN"

# Test 4 : Modifier les permissions (CALENDAR=NONE, RELEASES=WRITE, ADMIN=NONE)
echo ""
echo -e "${YELLOW}Test 4 : Modification des permissions${NC}"
UPDATE_PERMS=$(curl -s -X PUT ${API_URL}/admin/permissions/${TEST_USER_ID} \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": {
      "CALENDAR": "NONE",
      "RELEASES": "WRITE",
      "ADMIN": "NONE"
    }
  }')

UPDATED_CALENDAR=$(echo $UPDATE_PERMS | jq -r '.permissions.CALENDAR')
UPDATED_RELEASES=$(echo $UPDATE_PERMS | jq -r '.permissions.RELEASES')
UPDATED_ADMIN=$(echo $UPDATE_PERMS | jq -r '.permissions.ADMIN')

if [ "$UPDATED_CALENDAR" = "NONE" ] && [ "$UPDATED_RELEASES" = "WRITE" ] && [ "$UPDATED_ADMIN" = "NONE" ]; then
    test_result 0 "Permissions updated successfully"
    echo "   New permissions: CALENDAR=$UPDATED_CALENDAR, RELEASES=$UPDATED_RELEASES, ADMIN=$UPDATED_ADMIN"
else
    test_result 1 "Permission update failed"
    echo "   Response: $UPDATE_PERMS"
fi

echo ""

# Test 5 : Re-login pour obtenir le nouveau JWT avec permissions
echo -e "${YELLOW}Test 5 : Re-login avec nouvelles permissions${NC}"
TEST_LOGIN2=$(curl -s -X POST ${API_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"password123\"}")

TEST_TOKEN2=$(echo $TEST_LOGIN2 | jq -r '.token')
NEW_PERMS=$(echo $TEST_LOGIN2 | jq -r '.user.permissions')
NEW_CALENDAR=$(echo $NEW_PERMS | jq -r '.CALENDAR')
NEW_RELEASES=$(echo $NEW_PERMS | jq -r '.RELEASES')
NEW_ADMIN=$(echo $NEW_PERMS | jq -r '.ADMIN')

if [ "$NEW_CALENDAR" = "NONE" ] && [ "$NEW_RELEASES" = "WRITE" ] && [ "$NEW_ADMIN" = "NONE" ]; then
    test_result 0 "JWT contains new permissions"
    echo "   Permissions in JWT: CALENDAR=$NEW_CALENDAR, RELEASES=$NEW_RELEASES, ADMIN=$NEW_ADMIN"
else
    test_result 1 "JWT does not reflect new permissions"
    echo "   Expected: NONE/WRITE/NONE, Got: $NEW_CALENDAR/$NEW_RELEASES/$NEW_ADMIN"
fi

echo ""

# Test 6 : Tester l'accès aux endpoints avec NONE sur CALENDAR
echo -e "${YELLOW}Test 6 : Accès aux endpoints${NC}"

# Test 6a : GET /api/events avec CALENDAR=NONE → Devrait échouer (403)
EVENTS_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET ${API_URL}/events \
  -H "Authorization: Bearer ${TEST_TOKEN2}")
EVENTS_HTTP_CODE=$(echo "$EVENTS_RESPONSE" | grep "HTTP_CODE" | cut -d':' -f2)

if [ "$EVENTS_HTTP_CODE" = "403" ]; then
    test_result 0 "Access to /api/events denied (CALENDAR=NONE)"
else
    test_result 1 "Access to /api/events should be denied but got HTTP $EVENTS_HTTP_CODE"
fi

# Test 6b : GET /api/releases avec RELEASES=WRITE → Devrait réussir (200)
RELEASES_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET ${API_URL}/releases \
  -H "Authorization: Bearer ${TEST_TOKEN2}")
RELEASES_HTTP_CODE=$(echo "$RELEASES_RESPONSE" | grep "HTTP_CODE" | cut -d':' -f2)

if [ "$RELEASES_HTTP_CODE" = "200" ]; then
    test_result 0 "Access to /api/releases allowed (RELEASES=WRITE)"
else
    test_result 1 "Access to /api/releases failed with HTTP $RELEASES_HTTP_CODE"
fi

# Test 6c : GET /api/admin/users avec ADMIN=NONE → Devrait échouer (403)
ADMIN_USERS_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET ${API_URL}/admin/users \
  -H "Authorization: Bearer ${TEST_TOKEN2}")
ADMIN_HTTP_CODE=$(echo "$ADMIN_USERS_RESPONSE" | grep "HTTP_CODE" | cut -d':' -f2)

if [ "$ADMIN_HTTP_CODE" = "403" ]; then
    test_result 0 "Access to /api/admin/users denied (ADMIN=NONE)"
else
    test_result 1 "Access to /api/admin/users should be denied but got HTTP $ADMIN_HTTP_CODE"
fi

echo ""

# Test 7 : Tester READ vs WRITE
echo -e "${YELLOW}Test 7 : Test READ permission${NC}"

# Modifier pour RELEASES=READ
UPDATE_READ=$(curl -s -X PUT ${API_URL}/admin/permissions/${TEST_USER_ID} \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": {
      "CALENDAR": "NONE",
      "RELEASES": "READ",
      "ADMIN": "NONE"
    }
  }')

# Re-login
TEST_LOGIN3=$(curl -s -X POST ${API_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"password123\"}")
TEST_TOKEN3=$(echo $TEST_LOGIN3 | jq -r '.token')

# Test GET (devrait réussir avec READ)
READ_GET=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET ${API_URL}/releases \
  -H "Authorization: Bearer ${TEST_TOKEN3}")
READ_GET_CODE=$(echo "$READ_GET" | grep "HTTP_CODE" | cut -d':' -f2)

if [ "$READ_GET_CODE" = "200" ]; then
    test_result 0 "GET /api/releases allowed with READ permission"
else
    test_result 1 "GET /api/releases failed with READ permission (HTTP $READ_GET_CODE)"
fi

# Test POST (devrait échouer avec READ uniquement)
READ_POST=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST ${API_URL}/releases \
  -H "Authorization: Bearer ${TEST_TOKEN3}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Release",
    "releaseDate": "2025-12-31",
    "status": "draft",
    "type": "release"
  }')
READ_POST_CODE=$(echo "$READ_POST" | grep "HTTP_CODE" | cut -d':' -f2)

if [ "$READ_POST_CODE" = "403" ]; then
    test_result 0 "POST /api/releases denied with READ permission"
else
    test_result 1 "POST /api/releases should be denied with READ but got HTTP $READ_POST_CODE"
fi

echo ""
echo "======================================"
echo -e "${GREEN}Tests terminés !${NC}"
echo "======================================"
echo ""
echo "Note : Pour tester l'UI Angular :"
echo "  1. Connectez-vous avec: $TEST_EMAIL / password123"
echo "  2. Vérifiez que le menu 'Calendrier' n'apparaît PAS dans la sidebar"
echo "  3. Vérifiez que le menu 'Prépa MEP' apparaît"
echo "  4. Tentez d'accéder à http://localhost:4200/calendar → Devrait rediriger vers /home"
echo ""
