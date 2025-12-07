import express from 'express';
import { getAllUsers, deleteUser, getStats, exportDatabase, importDatabase } from '../controllers/admin.controller.js';

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

/**
 * GET /api/admin/export
 * Exporter la base de données en JSON
 */
router.get('/export', exportDatabase);

/**
 * POST /api/admin/import
 * Importer une base de données depuis un fichier JSON
 */
router.post('/import', importDatabase);

export default router;
