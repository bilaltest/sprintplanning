import express from 'express';
import { register, login, getCurrentUser, updatePreferences, updateWidgetOrder } from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Créer un nouveau compte utilisateur
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Se connecter avec email et mot de passe
 */
router.post('/login', login);

/**
 * GET /api/auth/me
 * Récupérer les informations de l'utilisateur connecté
 */
router.get('/me', getCurrentUser);

/**
 * PUT /api/auth/preferences
 * Mettre à jour les préférences de l'utilisateur
 */
router.put('/preferences', updatePreferences);

/**
 * PUT /api/auth/widget-order
 * Mettre à jour l'ordre des widgets sur la home
 */
router.put('/widget-order', updateWidgetOrder);

export default router;
