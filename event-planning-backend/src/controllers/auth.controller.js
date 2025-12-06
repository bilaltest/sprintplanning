import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Extrait le prénom et nom depuis une adresse email @ca-ts.fr
 * Format attendu: prenom.nom@ca-ts.fr ou prenom.nom-ext@ca-ts.fr
 * Cas spécial: "admin" → Admin System
 */
function extractNameFromEmail(email) {
  // Cas spécial pour admin
  if (email.toLowerCase() === 'admin') {
    return {
      firstName: 'Admin',
      lastName: 'System'
    };
  }

  // Extraire la partie avant @
  const localPart = email.split('@')[0];

  // Retirer le suffixe "-ext" si présent
  const namePart = localPart.replace(/-ext$/, '');

  // Séparer prénom et nom
  const parts = namePart.split('.');

  if (parts.length >= 2) {
    const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
    const lastName = parts.slice(1).join(' ').toUpperCase();

    return { firstName, lastName };
  }

  // Fallback si le format n'est pas standard
  return {
    firstName: parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase(),
    lastName: ''
  };
}

/**
 * Valide le format de l'email (@ca-ts.fr uniquement, sauf pour "admin")
 */
function validateEmail(email) {
  // Cas spécial : "admin" sans @ca-ts.fr est accepté
  if (email.toLowerCase() === 'admin') {
    return true;
  }

  // Pour les autres : format strict prenom.nom@ca-ts.fr
  const emailRegex = /^[a-z]+\.[a-z]+(-ext)?@ca-ts\.fr$/i;
  return emailRegex.test(email);
}

/**
 * Valide le mot de passe (minimum 8 caractères alphanumériques avec au moins un chiffre et une lettre)
 */
function validatePassword(password) {
  if (password.length < 8) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(password);

  if (!isAlphanumeric) {
    return { valid: false, message: 'Le mot de passe doit être alphanumérique (lettres et chiffres uniquement)' };
  }

  if (!hasLetter || !hasNumber) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins une lettre et un chiffre' };
  }

  return { valid: true };
}

/**
 * POST /api/auth/register
 * Enregistre un nouvel utilisateur
 */
export async function register(req, res) {
  try {
    const { email, password } = req.body;

    // Validation de l'email
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        error: 'L\'adresse email doit être au format prenom.nom@ca-ts.fr ou prenom.nom-ext@ca-ts.fr'
      });
    }

    // Validation du mot de passe
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Un compte existe déjà avec cette adresse email' });
    }

    // Extraire prénom et nom depuis l'email
    const { firstName, lastName } = extractNameFromEmail(email);

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName
      }
    });

    // Ne pas retourner le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'Compte créé avec succès',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ error: 'Erreur lors de la création du compte' });
  }
}

/**
 * POST /api/auth/login
 * Authentifie un utilisateur
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Générer un token simple (pour l'environnement de dev bancaire fermé)
    const token = `token_${user.id}_${Date.now()}`;

    // Ne pas retourner le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Connexion réussie',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
}

/**
 * Extrait l'userId depuis le token d'authentification
 */
function extractUserIdFromToken(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  const tokenParts = token.split('_');
  if (tokenParts.length !== 3 || tokenParts[0] !== 'token') {
    return null;
  }

  return tokenParts[1];
}

/**
 * GET /api/auth/me
 * Récupère les informations de l'utilisateur connecté
 */
export async function getCurrentUser(req, res) {
  try {
    const userId = extractUserIdFromToken(req);

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Ne pas retourner le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

/**
 * PUT /api/auth/preferences
 * Met à jour les préférences de l'utilisateur (thème, etc.)
 */
export async function updatePreferences(req, res) {
  try {
    const userId = extractUserIdFromToken(req);

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { themePreference } = req.body;

    // Validation
    if (themePreference && !['light', 'dark'].includes(themePreference)) {
      return res.status(400).json({ error: 'Le thème doit être "light" ou "dark"' });
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        themePreference: themePreference || undefined
      }
    });

    // Ne pas retourner le mot de passe
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json({
      message: 'Préférences mises à jour',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour des préférences:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
