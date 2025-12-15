#!/bin/bash

# Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin","password":"admin"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Appeler l'API et sauvegarder
curl -s "http://localhost:3000/api/releases/cmj63lpo299vrnp1y/release-notes" \
  -H "Authorization: Bearer $TOKEN" > /tmp/api-response.json

# Afficher avec jq
echo "=== Full API Response ==="
cat /tmp/api-response.json | jq '.'

echo ""
echo "=== Entries with changes count ==="
cat /tmp/api-response.json | jq '.[] | {id: .id, microservice: .microservice, changesCount: (.changes | length)}'
