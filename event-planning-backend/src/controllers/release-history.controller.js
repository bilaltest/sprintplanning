import prisma from '../config/database.js';

// Archivage automatique : supprimer les entrées d'historique au-delà de 30
const archiveReleaseHistory = async () => {
  try {
    const historyCount = await prisma.releaseHistory.count();

    // Si on dépasse 30, supprimer les plus anciennes
    if (historyCount > 30) {
      const entriesToDelete = await prisma.releaseHistory.findMany({
        orderBy: {
          timestamp: 'asc'
        },
        take: historyCount - 30,
        select: {
          id: true
        }
      });

      const idsToDelete = entriesToDelete.map(e => e.id);

      await prisma.releaseHistory.deleteMany({
        where: {
          id: {
            in: idsToDelete
          }
        }
      });

      console.log(`Archived ${idsToDelete.length} old release history entries`);
    }
  } catch (error) {
    console.error('Error archiving release history:', error);
  }
};

// GET /api/release-history - Récupérer l'historique des releases (30 derniers)
export const getReleaseHistory = async (req, res, next) => {
  try {
    // Archivage automatique
    await archiveReleaseHistory();

    const history = await prisma.releaseHistory.findMany({
      orderBy: { timestamp: 'desc' },
      take: 30
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
