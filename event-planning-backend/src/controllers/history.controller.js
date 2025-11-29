import prisma from '../config/database.js';

// GET /api/history - Récupérer l'historique (20 derniers)
export const getHistory = async (req, res, next) => {
  try {
    const history = await prisma.history.findMany({
      orderBy: { timestamp: 'desc' },
      take: 20
    });

    // Parser les JSON strings
    const parsedHistory = history.map(entry => ({
      ...entry,
      eventData: entry.eventData ? JSON.parse(entry.eventData) : null,
      previousData: entry.previousData ? JSON.parse(entry.previousData) : null
    }));

    res.json(parsedHistory);
  } catch (error) {
    next(error);
  }
};

// POST /api/history/:id/rollback - Annuler une modification
export const rollbackHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const historyEntry = await prisma.history.findUnique({
      where: { id }
    });

    if (!historyEntry) {
      return res.status(404).json({ error: { message: 'History entry not found', status: 404 } });
    }

    // Parser les données JSON
    const eventData = historyEntry.eventData ? JSON.parse(historyEntry.eventData) : null;
    const previousData = historyEntry.previousData ? JSON.parse(historyEntry.previousData) : null;

    // Logique de rollback selon l'action
    if (historyEntry.action === 'create' && historyEntry.eventId) {
      // Supprimer l'événement créé
      await prisma.event.delete({
        where: { id: historyEntry.eventId }
      });
    } else if (historyEntry.action === 'update' && previousData) {
      // Restaurer l'ancienne version
      await prisma.event.update({
        where: { id: historyEntry.eventId },
        data: previousData
      });
    } else if (historyEntry.action === 'delete' && previousData) {
      // Re-créer l'événement supprimé
      await prisma.event.create({
        data: previousData
      });
    }

    // Supprimer l'entrée d'historique après rollback réussi
    await prisma.history.delete({
      where: { id }
    });

    res.json({ message: 'Rollback successful' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/history - Vider l'historique
export const clearHistory = async (req, res, next) => {
  try {
    await prisma.history.deleteMany();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
