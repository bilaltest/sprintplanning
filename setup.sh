#!/bin/bash

echo "🚀 Setup Event Planning App"
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Créer le fichier .env pour le backend s'il n'existe pas
if [ ! -f "event-planning-backend/.env" ]; then
    echo -e "${YELLOW}📝 Création du fichier .env pour le backend...${NC}"
    cp event-planning-backend/.env.example event-planning-backend/.env
    echo -e "${GREEN}✅ Fichier .env créé depuis .env.example${NC}"
else
    echo -e "${GREEN}✅ Le fichier .env existe déjà${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Setup terminé !${NC}"
echo ""
echo "Pour démarrer l'application :"
echo "  1. Backend:  cd event-planning-backend && npm install && npm run dev"
echo "  2. Frontend: cd event-planning-app && npm install && npm start"
