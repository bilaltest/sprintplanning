#!/bin/bash

# Test du fix du commentaire dans les release notes
# Ce script teste que le commentaire est bien préservé lors des mises à jour

echo "=== Test du fix du commentaire dans les release notes ==="
echo ""

# Récupérer un token admin
echo "1. Login admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin","password":"admin"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
echo "   Token: ${TOKEN:0:20}..."
echo ""

# Récupérer la première release
echo "2. Récupération de la première release..."
RELEASE=$(curl -s http://localhost:3000/api/releases -H "Authorization: Bearer $TOKEN" | jq -r '.[0]')
RELEASE_ID=$(echo $RELEASE | jq -r '.id')
RELEASE_NAME=$(echo $RELEASE | jq -r '.name')
echo "   Release: $RELEASE_NAME (ID: $RELEASE_ID)"
echo ""

# Récupérer les entrées de release note
echo "3. Récupération des entrées de release note..."
ENTRIES=$(curl -s http://localhost:3000/api/releases/$RELEASE_ID/release-notes -H "Authorization: Bearer $TOKEN")
ENTRY_COUNT=$(echo $ENTRIES | jq '. | length')
echo "   Nombre d'entrées: $ENTRY_COUNT"

if [ "$ENTRY_COUNT" = "0" ]; then
  echo "   ❌ Aucune entrée trouvée. Créer au moins une entrée via l'interface."
  exit 1
fi

# Prendre la première entrée
ENTRY=$(echo $ENTRIES | jq '.[0]')
ENTRY_ID=$(echo $ENTRY | jq -r '.id')
MICROSERVICE=$(echo $ENTRY | jq -r '.microservice')
SQUAD=$(echo $ENTRY | jq -r '.squad')
PART_EN_MEP=$(echo $ENTRY | jq -r '.partEnMep')
INITIAL_COMMENT=$(echo $ENTRY | jq -r '.comment // ""')

echo "   Première entrée: $MICROSERVICE (Squad: $SQUAD)"
echo "   Commentaire initial: '$INITIAL_COMMENT'"
echo ""

# Test 1: Mise à jour du commentaire directement
echo "4. Test 1: Mise à jour du commentaire..."
NEW_COMMENT="Test de mise à jour du commentaire - $(date +%s)"
UPDATE_RESPONSE=$(curl -s -X PUT \
  http://localhost:3000/api/releases/$RELEASE_ID/release-notes/$ENTRY_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"microservice\": \"$MICROSERVICE\",
    \"squad\": \"$SQUAD\",
    \"partEnMep\": $PART_EN_MEP,
    \"comment\": \"$NEW_COMMENT\",
    \"changes\": []
  }")

UPDATED_COMMENT=$(echo $UPDATE_RESPONSE | jq -r '.comment')
echo "   Commentaire après mise à jour: '$UPDATED_COMMENT'"

if [ "$UPDATED_COMMENT" = "$NEW_COMMENT" ]; then
  echo "   ✅ Test 1 réussi: Le commentaire a été mis à jour correctement"
else
  echo "   ❌ Test 1 échoué: Le commentaire n'a pas été mis à jour"
  echo "   Attendu: '$NEW_COMMENT'"
  echo "   Reçu: '$UPDATED_COMMENT'"
  exit 1
fi
echo ""

# Test 2: Toggle partEnMep et vérifier que le commentaire est préservé
echo "5. Test 2: Toggle partEnMep (préservation du commentaire)..."
NEW_PART_EN_MEP=$([ "$PART_EN_MEP" = "true" ] && echo "false" || echo "true")
TOGGLE_RESPONSE=$(curl -s -X PUT \
  http://localhost:3000/api/releases/$RELEASE_ID/release-notes/$ENTRY_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"microservice\": \"$MICROSERVICE\",
    \"squad\": \"$SQUAD\",
    \"partEnMep\": $NEW_PART_EN_MEP,
    \"comment\": \"$NEW_COMMENT\",
    \"changes\": []
  }")

COMMENT_AFTER_TOGGLE=$(echo $TOGGLE_RESPONSE | jq -r '.comment')
echo "   Commentaire après toggle partEnMep: '$COMMENT_AFTER_TOGGLE'"

if [ "$COMMENT_AFTER_TOGGLE" = "$NEW_COMMENT" ]; then
  echo "   ✅ Test 2 réussi: Le commentaire a été préservé après toggle partEnMep"
else
  echo "   ❌ Test 2 échoué: Le commentaire a été perdu après toggle partEnMep"
  echo "   Attendu: '$NEW_COMMENT'"
  echo "   Reçu: '$COMMENT_AFTER_TOGGLE'"
  exit 1
fi
echo ""

# Test 3: Mise à jour des changes et vérifier que le commentaire est préservé
echo "6. Test 3: Mise à jour des changes (préservation du commentaire)..."
CHANGES_RESPONSE=$(curl -s -X PUT \
  http://localhost:3000/api/releases/$RELEASE_ID/release-notes/$ENTRY_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"microservice\": \"$MICROSERVICE\",
    \"squad\": \"$SQUAD\",
    \"partEnMep\": $NEW_PART_EN_MEP,
    \"comment\": \"$NEW_COMMENT\",
    \"changes\": [{\"jiraId\": \"TEST-123\", \"description\": \"Test change\"}]
  }")

COMMENT_AFTER_CHANGES=$(echo $CHANGES_RESPONSE | jq -r '.comment')
echo "   Commentaire après mise à jour des changes: '$COMMENT_AFTER_CHANGES'"

if [ "$COMMENT_AFTER_CHANGES" = "$NEW_COMMENT" ]; then
  echo "   ✅ Test 3 réussi: Le commentaire a été préservé après mise à jour des changes"
else
  echo "   ❌ Test 3 échoué: Le commentaire a été perdu après mise à jour des changes"
  echo "   Attendu: '$NEW_COMMENT'"
  echo "   Reçu: '$COMMENT_AFTER_CHANGES'"
  exit 1
fi
echo ""

# Restaurer l'état initial
echo "7. Restauration de l'état initial..."
curl -s -X PUT \
  http://localhost:3000/api/releases/$RELEASE_ID/release-notes/$ENTRY_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"microservice\": \"$MICROSERVICE\",
    \"squad\": \"$SQUAD\",
    \"partEnMep\": $PART_EN_MEP,
    \"comment\": \"$INITIAL_COMMENT\",
    \"changes\": []
  }" > /dev/null

echo "   État restauré"
echo ""

echo "=== ✅ Tous les tests sont passés avec succès ! ==="
