import prisma from '../config/database.js';
import { extractUserIdFromToken } from '../utils/auth.js';

// GET /api/games - Récupérer tous les jeux actifs
export const getAllGames = async (req, res, next) => {
  try {
    const games = await prisma.game.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' }
    });

    res.json(games);
  } catch (error) {
    next(error);
  }
};

// GET /api/games/:slug - Récupérer un jeu par slug
export const getGameBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const game = await prisma.game.findUnique({
      where: { slug }
    });

    if (!game) {
      return res.status(404).json({ error: { message: 'Game not found', status: 404 } });
    }

    res.json(game);
  } catch (error) {
    next(error);
  }
};

// GET /api/games/:slug/leaderboard - Récupérer le classement Top 10
export const getLeaderboard = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Récupérer le jeu
    const game = await prisma.game.findUnique({
      where: { slug }
    });

    if (!game) {
      return res.status(404).json({ error: { message: 'Game not found', status: 404 } });
    }

    // Récupérer le meilleur score de chaque utilisateur (Top 10)
    const scores = await prisma.$queryRaw`
      SELECT
        gs.id,
        gs.gameId,
        gs.userId,
        gs.visitorName,
        gs.score,
        gs.wpm,
        gs.accuracy,
        gs.createdAt,
        u.firstName,
        u.lastName,
        u.email
      FROM GameScore gs
      LEFT JOIN User u ON gs.userId = u.id
      WHERE gs.gameId = ${game.id}
      AND gs.score = (
        SELECT MAX(gs2.score)
        FROM GameScore gs2
        WHERE gs2.gameId = gs.gameId
        AND (
          (gs2.userId IS NOT NULL AND gs2.userId = gs.userId)
          OR (gs2.userId IS NULL AND gs2.visitorName = gs.visitorName)
        )
      )
      ORDER BY gs.score DESC
      LIMIT 10
    `;

    // Formater les résultats avec le rang
    const leaderboard = scores.map((score, index) => ({
      id: score.id,
      rank: index + 1,
      score: score.score,
      wpm: score.wpm,
      accuracy: score.accuracy,
      createdAt: score.createdAt,
      userId: score.userId,
      user: score.userId ? {
        firstName: score.firstName,
        lastName: score.lastName,
        email: score.email
      } : null,
      visitorName: score.visitorName
    }));

    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
};

// POST /api/games/:slug/scores - Soumettre un score
export const submitScore = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { score, wpm, accuracy, metadata } = req.body;

    // Valider le score
    if (typeof score !== 'number' || score < 0) {
      return res.status(400).json({ error: { message: 'Invalid score', status: 400 } });
    }

    // Récupérer le jeu
    const game = await prisma.game.findUnique({
      where: { slug }
    });

    if (!game) {
      return res.status(404).json({ error: { message: 'Game not found', status: 404 } });
    }

    // Récupérer l'utilisateur connecté
    const userId = extractUserIdFromToken(req);

    if (!userId) {
      return res.status(401).json({ error: { message: 'Authentication required', status: 401 } });
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(401).json({ error: { message: 'User not found', status: 401 } });
    }

    // Créer le score
    const gameScore = await prisma.gameScore.create({
      data: {
        gameId: game.id,
        userId,
        score,
        wpm: wpm || null,
        accuracy: accuracy || null,
        metadata: metadata ? JSON.stringify(metadata) : null
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    });

    // Calculer le rang du joueur (meilleur score personnel parmi le top 10)
    const userBestScore = await prisma.gameScore.findFirst({
      where: {
        gameId: game.id,
        userId
      },
      orderBy: { score: 'desc' }
    });

    // Compter combien de joueurs ont un meilleur score
    const betterScoresCount = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT COALESCE(userId, visitorName)) as count
      FROM GameScore
      WHERE gameId = ${game.id}
      AND score > ${userBestScore?.score || 0}
    `;

    const rank = Number(betterScoresCount[0]?.count || 0) + 1;

    res.status(201).json({
      ...gameScore,
      rank,
      isNewPersonalBest: score === userBestScore?.score
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/games/:slug/my-scores - Récupérer mes scores
export const getMyScores = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const userId = extractUserIdFromToken(req);

    if (!userId) {
      return res.status(401).json({ error: { message: 'Authentication required', status: 401 } });
    }

    const game = await prisma.game.findUnique({
      where: { slug }
    });

    if (!game) {
      return res.status(404).json({ error: { message: 'Game not found', status: 404 } });
    }

    const scores = await prisma.gameScore.findMany({
      where: {
        gameId: game.id,
        userId
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Récupérer le meilleur score
    const bestScore = await prisma.gameScore.findFirst({
      where: {
        gameId: game.id,
        userId
      },
      orderBy: { score: 'desc' }
    });

    res.json({
      scores,
      bestScore: bestScore?.score || 0,
      gamesPlayed: scores.length
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/games/init - Initialiser les jeux par défaut (admin)
export const initGames = async (req, res, next) => {
  try {
    const games = [
      {
        slug: 'typing-fr',
        name: 'Typing Challenge FR',
        description: 'Tapez un maximum de mots en français en 60 secondes !',
        icon: 'keyboard'
      },
      {
        slug: 'typing-en',
        name: 'Typing Challenge EN',
        description: 'Type as many English words as you can in 60 seconds!',
        icon: 'keyboard'
      },
      {
        slug: 'memory-game',
        name: 'Memory Game',
        description: 'Trouvez toutes les paires de cartes le plus vite possible !',
        icon: 'psychology'
      },
      {
        slug: 'math-rush',
        name: 'Math Rush',
        description: 'Résolvez un maximum de calculs en 60 secondes !',
        icon: 'calculate'
      },
      {
        slug: 'flappy-dsi',
        name: 'Flappy DSI',
        description: 'Évitez les obstacles de la DSI et battez vos collègues !',
        icon: 'flight'
      }
    ];

    for (const game of games) {
      await prisma.game.upsert({
        where: { slug: game.slug },
        update: game,
        create: game
      });
    }

    const allGames = await prisma.game.findMany();
    res.json(allGames);
  } catch (error) {
    next(error);
  }
};
