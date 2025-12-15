#!/bin/bash

echo "=== Test Release Notes API ==="
echo ""

# 1. Login pour obtenir un token
echo "1. Login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin","password":"admin"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Erreur: impossible de récupérer le token"
  exit 1
fi

echo "✅ Token obtenu"
echo ""

# 2. Récupérer la liste des releases
echo "2. Récupération des releases..."
RELEASES=$(curl -s http://localhost:3000/api/releases \
  -H "Authorization: Bearer $TOKEN")

# Extraire le premier ID de release (en supposant qu'il y en a au moins une)
RELEASE_ID=$(echo $RELEASES | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$RELEASE_ID" ]; then
  echo "❌ Erreur: aucune release trouvée"
  exit 1
fi

echo "✅ Release ID: $RELEASE_ID"
echo ""

# 3. Récupérer les entrées de release notes
echo "3. Récupération des release notes..."
ENTRIES=$(curl -s http://localhost:3000/api/releases/$RELEASE_ID/release-notes \
  -H "Authorization: Bearer $TOKEN")

echo "📝 Entrées récupérées:"
echo "$ENTRIES" | jq '.[0:2] | .[] | {id, microservice, changes}'
echo ""

# 4. Compter les changes pour chaque entrée
echo "4. Analyse des changes..."
ENTRY_COUNT=$(echo "$ENTRIES" | jq 'length')
echo "   Nombre total d'entrées: $ENTRY_COUNT"

for i in $(seq 0 $((ENTRY_COUNT-1))); do
  ENTRY=$(echo "$ENTRIES" | jq ".[$i]")
  MS_NAME=$(echo "$ENTRY" | jq -r '.microservice')
  CHANGES_COUNT=$(echo "$ENTRY" | jq '.changes | length')

  if [ "$CHANGES_COUNT" -gt 0 ]; then
    echo "   ✅ $MS_NAME: $CHANGES_COUNT change(s)"
    echo "$ENTRY" | jq '.changes'
  fi
done

echo ""
echo "=== Test terminé ==="
