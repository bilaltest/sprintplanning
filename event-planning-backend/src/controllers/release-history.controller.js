import prisma from '../config/database.js';

// GET /api/release-history - Récupérer l'historique des releases (20 derniers)
export const getReleaseHistory = async (req, res, next) => {
  try {
    const history = await prisma.releaseHistory.findMany({
      orderBy: { timestamp: 'desc' },
      take: 20
    });

    // Parser les JSON strings
    const parsedHistory = history.map(entry => ({
      ...entry,
      releaseData: entry.releaseData ? JSON.parse(entry.releaseData) : null,
      previousData: entry.previousData ? JSON.parse(entry.previousData) : null
    }));

    res.json(parsedHistory);
  } catch (error) {
    next(error);
  }
};

// POST /api/release-history/:id/rollback - Annuler une modification
export const rollbackReleaseHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const historyEntry = await prisma.releaseHistory.findUnique({
      where: { id }
    });

    if (!historyEntry) {
      return res.status(404).json({ error: { message: 'History entry not found', status: 404 } });
    }

    // Parser les données JSON
    const releaseData = historyEntry.releaseData ? JSON.parse(historyEntry.releaseData) : null;
    const previousData = historyEntry.previousData ? JSON.parse(historyEntry.previousData) : null;

    // Logique de rollback selon l'action
    if (historyEntry.action === 'create' && historyEntry.releaseId) {
      // Supprimer la release créée
      await prisma.release.delete({
        where: { id: historyEntry.releaseId }
      });
    } else if (historyEntry.action === 'update' && previousData) {
      // Restaurer l'ancienne version
      const { squads, ...releaseUpdateData } = previousData;

      await prisma.release.update({
        where: { id: historyEntry.releaseId },
        data: {
          ...releaseUpdateData,
          releaseDate: new Date(releaseUpdateData.releaseDate)
        }
      });
    } else if (historyEntry.action === 'delete' && previousData) {
      // Re-créer la release supprimée
      const { squads, ...releaseCreateData } = previousData;

      await prisma.release.create({
        data: {
          ...releaseCreateData,
          id: historyEntry.releaseId,
          releaseDate: new Date(releaseCreateData.releaseDate),
          squads: {
            create: [
              { squadNumber: 1 },
              { squadNumber: 2 },
              { squadNumber: 3 },
              { squadNumber: 4 },
              { squadNumber: 5 },
              { squadNumber: 6 }
            ]
          }
        }
      });
    }

    // Supprimer l'entrée d'historique après rollback réussi
    await prisma.releaseHistory.delete({
      where: { id }
    });

    res.json({ message: 'Rollback successful' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/release-history - Vider l'historique
export const clearReleaseHistory = async (req, res, next) => {
  try {
    await prisma.releaseHistory.deleteMany();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
