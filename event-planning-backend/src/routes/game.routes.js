import express from 'express';
import {
  getAllGames,
  getGameBySlug,
  getLeaderboard,
  submitScore,
  getMyScores,
  initGames
} from '../controllers/game.controller.js';

const router = express.Router();

// GET /api/games - Liste des jeux actifs
router.get('/', getAllGames);

// POST /api/games/init - Initialiser les jeux par défaut
router.post('/init', initGames);

// GET /api/games/:slug - Détails d'un jeu
router.get('/:slug', getGameBySlug);

// GET /api/games/:slug/leaderboard - Top 10 classement
router.get('/:slug/leaderboard', getLeaderboard);

// POST /api/games/:slug/scores - Soumettre un score
router.post('/:slug/scores', submitScore);

// GET /api/games/:slug/my-scores - Mes scores
router.get('/:slug/my-scores', getMyScores);

export default router;
