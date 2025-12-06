import express from 'express';
import { getAllUsers, deleteUser, getStats } from '../controllers/admin.controller.js';

const router = express.Router();

/**
 * GET /api/admin/users
 * Récupérer tous les utilisateurs
 */
router.get('/users', getAllUsers);

/**
 * DELETE /api/admin/users/:id
 * Supprimer un utilisateur
 */
router.delete('/users/:id', deleteUser);

/**
 * GET /api/admin/stats
 * Récupérer les statistiques générales
 */
router.get('/stats', getStats);

export default router;
