#!/bin/bash

# Script de lancement pour event-planning-api
# Démarre le serveur Spring Boot sur le port 3000

echo "🚀 Démarrage du serveur Spring Boot..."
echo "   Port: 3000"
echo "   Context: /api"
echo ""
echo "Endpoints disponibles :"
echo "   - http://localhost:3000/api/admin/users"
echo "   - http://localhost:3000/api/admin/export"
echo "   - http://localhost:3000/api/admin/import"
echo "   - http://localhost:3000/actuator/health"
echo ""

java -jar target/event-planning-api-0.0.1-SNAPSHOT.jar
