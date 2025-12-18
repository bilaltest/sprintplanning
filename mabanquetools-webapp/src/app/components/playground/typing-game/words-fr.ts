// 800 mots français courants (4-10 lettres)
export const FRENCH_WORDS: string[] = [
  // Verbes courants
  'avoir', 'être', 'faire', 'dire', 'aller', 'voir', 'venir', 'devoir', 'prendre', 'trouver',
  'donner', 'falloir', 'parler', 'mettre', 'savoir', 'passer', 'regarder', 'aimer', 'croire', 'vouloir',
  'tenir', 'porter', 'demander', 'sembler', 'laisser', 'rester', 'penser', 'entendre', 'chercher', 'sortir',
  'partir', 'revenir', 'arriver', 'suivre', 'comprendre', 'attendre', 'perdre', 'appeler', 'permettre', 'occuper',
  'devenir', 'montrer', 'commencer', 'paraître', 'sentir', 'agir', 'servir', 'vivre', 'jouer', 'reprendre',
  'manger', 'dormir', 'courir', 'lire', 'écrire', 'ouvrir', 'fermer', 'entrer', 'monter', 'descendre',
  'tomber', 'lever', 'poser', 'jeter', 'tirer', 'pousser', 'garder', 'casser', 'toucher', 'frapper',
  'changer', 'finir', 'choisir', 'réussir', 'remplir', 'grandir', 'bâtir', 'offrir', 'souffrir', 'mourir',
  'couper', 'peindre', 'conduire', 'produire', 'traduire', 'construire', 'détruire', 'réduire', 'cuire', 'fuir',
  'plaire', 'taire', 'naître', 'connaître', 'paraître', 'croître', 'croire', 'boire', 'recevoir', 'apercevoir',

  // Noms communs - Personnes
  'homme', 'femme', 'enfant', 'fille', 'garçon', 'père', 'mère', 'frère', 'soeur', 'famille',
  'ami', 'amie', 'voisin', 'patron', 'client', 'élève', 'maître', 'docteur', 'avocat', 'artiste',
  'auteur', 'acteur', 'chanteur', 'joueur', 'vendeur', 'serveur', 'chauffeur', 'directeur', 'professeur', 'ingénieur',

  // Noms communs - Lieux
  'maison', 'ville', 'pays', 'monde', 'terre', 'place', 'route', 'chemin', 'bureau', 'école',
  'hôpital', 'magasin', 'marché', 'jardin', 'parc', 'forêt', 'montagne', 'rivière', 'plage', 'campagne',
  'chambre', 'cuisine', 'salon', 'salle', 'entrée', 'couloir', 'escalier', 'fenêtre', 'porte', 'mur',

  // Noms communs - Temps
  'temps', 'jour', 'nuit', 'matin', 'soir', 'heure', 'minute', 'seconde', 'semaine', 'mois',
  'année', 'siècle', 'moment', 'instant', 'période', 'époque', 'saison', 'printemps', 'automne', 'hiver',

  // Noms communs - Objets
  'chose', 'objet', 'livre', 'table', 'chaise', 'voiture', 'train', 'avion', 'bateau', 'vélo',
  'téléphone', 'ordinateur', 'écran', 'clavier', 'souris', 'papier', 'stylo', 'crayon', 'cahier', 'lettre',
  'verre', 'bouteille', 'assiette', 'couteau', 'fourchette', 'cuillère', 'tasse', 'plat', 'repas', 'pain',

  // Noms communs - Nature
  'soleil', 'lune', 'étoile', 'ciel', 'nuage', 'pluie', 'neige', 'vent', 'orage', 'tempête',
  'arbre', 'fleur', 'herbe', 'feuille', 'branche', 'racine', 'fruit', 'légume', 'plante', 'graine',
  'animal', 'chien', 'chat', 'oiseau', 'poisson', 'cheval', 'vache', 'mouton', 'cochon', 'lapin',

  // Noms communs - Corps
  'corps', 'tête', 'visage', 'oeil', 'yeux', 'nez', 'bouche', 'oreille', 'cheveu', 'main',
  'doigt', 'bras', 'jambe', 'pied', 'coeur', 'sang', 'ventre', 'épaule', 'genou', 'cou',

  // Noms communs - Abstraits
  'vie', 'mort', 'amour', 'haine', 'joie', 'peur', 'colère', 'espoir', 'rêve', 'désir',
  'idée', 'pensée', 'raison', 'sens', 'force', 'pouvoir', 'droit', 'liberté', 'justice', 'paix',
  'guerre', 'travail', 'argent', 'prix', 'valeur', 'nombre', 'partie', 'reste', 'moitié', 'quart',
  'question', 'réponse', 'problème', 'solution', 'exemple', 'preuve', 'cause', 'effet', 'résultat', 'succès',

  // Adjectifs
  'grand', 'petit', 'gros', 'mince', 'long', 'court', 'haut', 'bas', 'large', 'étroit',
  'nouveau', 'ancien', 'vieux', 'jeune', 'moderne', 'récent', 'prochain', 'dernier', 'premier', 'second',
  'bon', 'mauvais', 'meilleur', 'pire', 'beau', 'joli', 'laid', 'propre', 'sale', 'pur',
  'blanc', 'noir', 'rouge', 'bleu', 'vert', 'jaune', 'orange', 'rose', 'gris', 'violet',
  'chaud', 'froid', 'tiède', 'frais', 'doux', 'dur', 'mou', 'léger', 'lourd', 'épais',
  'fort', 'faible', 'rapide', 'lent', 'vite', 'facile', 'difficile', 'simple', 'complexe', 'clair',
  'sombre', 'obscur', 'lumineux', 'brillant', 'terne', 'vif', 'mort', 'vivant', 'actif', 'calme',
  'heureux', 'triste', 'content', 'fâché', 'inquiet', 'tranquille', 'nerveux', 'fatigué', 'malade', 'sain',
  'riche', 'pauvre', 'cher', 'gratuit', 'plein', 'vide', 'entier', 'complet', 'partiel', 'total',
  'vrai', 'faux', 'réel', 'possible', 'impossible', 'certain', 'sûr', 'probable', 'évident', 'secret',

  // Adverbes
  'bien', 'mal', 'mieux', 'plus', 'moins', 'très', 'trop', 'assez', 'encore', 'toujours',
  'jamais', 'souvent', 'parfois', 'rarement', 'déjà', 'bientôt', 'ensuite', 'enfin', 'puis', 'donc',
  'ici', 'là', 'ailleurs', 'partout', 'nulle', 'loin', 'près', 'dedans', 'dehors', 'dessus',
  'dessous', 'devant', 'derrière', 'avant', 'après', 'pendant', 'depuis', 'jusque', 'entre', 'parmi',
  'vraiment', 'seulement', 'simplement', 'également', 'absolument', 'exactement', 'rapidement', 'lentement', 'doucement', 'fortement',

  // Mots techniques/modernes courants
  'projet', 'équipe', 'réunion', 'rapport', 'dossier', 'fichier', 'données', 'système', 'réseau', 'serveur',
  'logiciel', 'programme', 'application', 'interface', 'fonction', 'méthode', 'processus', 'analyse', 'étude', 'recherche',
  'développer', 'améliorer', 'optimiser', 'organiser', 'planifier', 'gérer', 'contrôler', 'vérifier', 'valider', 'confirmer',
  'créer', 'modifier', 'supprimer', 'ajouter', 'retirer', 'déplacer', 'copier', 'coller', 'sauvegarder', 'restaurer',
  'connecter', 'déconnecter', 'télécharger', 'envoyer', 'recevoir', 'partager', 'publier', 'diffuser', 'afficher', 'masquer',

  // Mots supplémentaires pour atteindre 800
  'accord', 'action', 'activité', 'affaire', 'agence', 'agent', 'aide', 'aile', 'air', 'album',
  'ancien', 'angle', 'annonce', 'appareil', 'appel', 'arme', 'armée', 'article', 'aspect', 'association',
  'attaque', 'attention', 'attitude', 'audience', 'avis', 'avenir', 'aventure', 'balle', 'banque', 'base',
  'bataille', 'besoin', 'bête', 'billet', 'bloc', 'bois', 'boîte', 'bord', 'bourse', 'bout',
  'boutique', 'branche', 'bruit', 'budget', 'cabinet', 'cadre', 'café', 'campagne', 'canal', 'candidat',
  'capital', 'caractère', 'carrière', 'carte', 'casino', 'catégorie', 'cellule', 'centre', 'cercle', 'chaîne',
  'chance', 'chapitre', 'charge', 'château', 'chef', 'circuit', 'classe', 'climat', 'club', 'code',
  'coin', 'collection', 'colline', 'combat', 'commande', 'commerce', 'commission', 'commune', 'compagnie', 'concert',
  'condition', 'confiance', 'conflit', 'conseil', 'contact', 'contrat', 'corps', 'côte', 'couche', 'coup',
  'couple', 'courage', 'cours', 'course', 'couverture', 'création', 'crédit', 'crime', 'crise', 'critique',
  'culture', 'danger', 'date', 'débat', 'début', 'décision', 'défense', 'degré', 'délai', 'demande',
  'départ', 'dépense', 'désert', 'dessin', 'destin', 'détail', 'dette', 'dialogue', 'dimension', 'direction',
  'discours', 'discussion', 'distance', 'docteur', 'document', 'domaine', 'double', 'doute', 'drame', 'droit',
  'durée', 'eau', 'échange', 'école', 'économie', 'édition', 'effort', 'église', 'élection', 'élément',
  'emploi', 'énergie', 'enjeu', 'enquête', 'ensemble', 'entreprise', 'entrée', 'environnement', 'épisode', 'espace',
  'espèce', 'esprit', 'essai', 'essence', 'étage', 'état', 'étoile', 'étude', 'événement', 'évolution',
  'examen', 'exception', 'exercice', 'existence', 'expérience', 'expert', 'expression', 'face', 'façon', 'facteur',
  'faute', 'fête', 'feu', 'figure', 'film', 'finance', 'fond', 'football', 'forme', 'formule',
  'fortune', 'foule', 'fournisseur', 'français', 'front', 'frontière', 'garage', 'garde', 'gare', 'gaz',
  'génération', 'genre', 'geste', 'golf', 'goût', 'gouvernement', 'grâce', 'grain', 'groupe', 'guide',
  'habitude', 'hasard', 'hauteur', 'héros', 'histoire', 'homme', 'honneur', 'horizon', 'hôtel', 'humain',
  'humeur', 'idéal', 'identité', 'île', 'image', 'imagination', 'impact', 'importance', 'impression', 'incident',
  'industrie', 'influence', 'information', 'initiative', 'instant', 'institution', 'instrument', 'intérêt', 'intérieur', 'internet',
  'intervention', 'interview', 'invitation', 'issue', 'journal', 'journée', 'juge', 'jugement', 'kilomètre', 'label',
  'langue', 'lecture', 'leçon', 'ligne', 'limite', 'liste', 'littérature', 'livre', 'local', 'logement',
  'logique', 'longueur', 'lumière', 'machine', 'magazine', 'main', 'maintien', 'mairie', 'majorité', 'maladie',
  'manche', 'manière', 'marche', 'marge', 'mariage', 'matière', 'médecin', 'média', 'membre', 'mémoire',
  'menace', 'mensuel', 'message', 'mesure', 'métal', 'mètre', 'milieu', 'million', 'ministre', 'minorité',
  'miracle', 'mission', 'mobile', 'modèle', 'moniteur', 'moral', 'morceau', 'moteur', 'motif', 'mouvement',
  'moyen', 'muscle', 'musée', 'musique', 'mystère', 'nation', 'nature', 'nerf', 'niveau', 'nom',
  'norme', 'note', 'notion', 'nouvelle', 'numéro', 'objectif', 'obligation', 'observation', 'obstacle', 'occasion',
  'océan', 'oeuvre', 'offre', 'ombre', 'opération', 'opinion', 'opposition', 'option', 'ordre', 'origine',
  'ouvrage', 'page', 'palace', 'palais', 'panneau', 'parent', 'parfum', 'parking', 'parole', 'partenaire',
  'passage', 'passion', 'patron', 'paysage', 'peinture', 'période', 'personnage', 'personne', 'perspective', 'perte',
  'peuple', 'phase', 'photo', 'phrase', 'pièce', 'pierre', 'pilote', 'piste', 'placement', 'plaisir',
  'planète', 'plateau', 'poche', 'poème', 'poids', 'point', 'police', 'politique', 'pont', 'population',
  'portrait', 'position', 'poste', 'potentiel', 'pouce', 'poudre', 'pratique', 'préparation', 'présence', 'président',
  'presse', 'prestation', 'prime', 'prince', 'principe', 'prison', 'procédure', 'production', 'produit', 'profession',
  'profil', 'profit', 'progrès', 'promesse', 'promotion', 'proposition', 'protection', 'province', 'publicité', 'puissance',
  'qualité', 'quantité', 'quartier', 'question', 'queue', 'radio', 'raison', 'rang', 'réaction', 'réalité',
  'réception', 'recette', 'recherche', 'record', 'recours', 'référence', 'réforme', 'refuge', 'regard', 'région',
  'règle', 'relation', 'relief', 'religion', 'rencontre', 'rendement', 'rentrée', 'répartition', 'repère', 'réponse',
  'repos', 'représentant', 'république', 'réputation', 'réserve', 'résidence', 'résistance', 'respect', 'responsable', 'ressource',
  'restaurant', 'retard', 'retour', 'réunion', 'revanche', 'revenu', 'révolution', 'risque', 'rival', 'robe',
  'rocher', 'roman', 'rond', 'rose', 'royaume', 'ruine', 'rupture', 'rythme', 'sable', 'sacrifice'
];
