import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/admin/users
 * Récupère la liste de tous les utilisateurs (sans les mots de passe)
 */
export async function getAllUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        themePreference: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            histories: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ users });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

/**
 * DELETE /api/admin/users/:id
 * Supprime un utilisateur
 * - Les historiques liés auront userId = null et userDisplayName restera
 * - Le userDisplayName sera remplacé par "Deleted User"
 */
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Mettre à jour les entrées d'historique pour remplacer le nom par "Deleted User"
    await prisma.history.updateMany({
      where: { userId: id },
      data: {
        userDisplayName: 'Deleted User'
      }
    });

    // Supprimer l'utilisateur (userId sera automatiquement mis à null grâce à onDelete: SetNull)
    await prisma.user.delete({
      where: { id }
    });

    res.json({
      message: 'Utilisateur supprimé avec succès',
      deletedUser: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

/**
 * GET /api/admin/stats
 * Récupère des statistiques générales
 */
export async function getStats(req, res) {
  try {
    const [
      totalUsers,
      totalEvents,
      totalReleases,
      totalHistoryEntries
    ] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.release.count(),
      prisma.history.count()
    ]);

    res.json({
      stats: {
        totalUsers,
        totalEvents,
        totalReleases,
        totalHistoryEntries
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
