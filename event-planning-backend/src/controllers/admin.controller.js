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

/**
 * GET /api/admin/export
 * Exporte toute la base de données en JSON
 */
export async function exportDatabase(req, res) {
  try {
    // Exporter toutes les tables
    const [
      users,
      events,
      releases,
      history,
      releaseHistory,
      settings
    ] = await Promise.all([
      prisma.user.findMany({
        include: {
          histories: true,
          releaseHistories: true
        }
      }),
      prisma.event.findMany(),
      prisma.release.findMany({
        include: {
          squads: {
            include: {
              features: true,
              actions: {
                include: {
                  flipping: true
                }
              }
            }
          }
        }
      }),
      prisma.history.findMany(),
      prisma.releaseHistory.findMany(),
      prisma.settings.findMany()
    ]);

    // Créer l'export avec métadonnées
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        totalRecords: {
          users: users.length,
          events: events.length,
          releases: releases.length,
          history: history.length,
          releaseHistory: releaseHistory.length,
          settings: settings.length
        }
      },
      data: {
        users,
        events,
        releases,
        history,
        releaseHistory,
        settings
      }
    };

    // Envoyer le fichier JSON
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="ma-banque-tools-backup-${new Date().toISOString().split('T')[0]}.json"`);
    res.json(exportData);

  } catch (error) {
    console.error('Erreur lors de l\'export de la base de données:', error);
    res.status(500).json({ error: 'Erreur lors de l\'export de la base de données' });
  }
}

/**
 * POST /api/admin/import
 * Importe une base de données depuis un fichier JSON
 * ATTENTION: Écrase toutes les données existantes
 */
export async function importDatabase(req, res) {
  try {
    const { data, metadata } = req.body;

    if (!data || !metadata) {
      return res.status(400).json({ error: 'Format de données invalide' });
    }

    // Vérifier la version
    if (metadata.version !== '1.0') {
      return res.status(400).json({ error: 'Version du fichier non supportée' });
    }

    // Transaction pour garantir l'atomicité
    await prisma.$transaction(async (tx) => {
      // 1. Supprimer toutes les données existantes (dans l'ordre pour respecter les contraintes)
      await tx.history.deleteMany();
      await tx.releaseHistory.deleteMany();
      await tx.featureFlipping.deleteMany();
      await tx.action.deleteMany();
      await tx.feature.deleteMany();
      await tx.squad.deleteMany();
      await tx.release.deleteMany();
      await tx.event.deleteMany();
      await tx.settings.deleteMany();
      await tx.user.deleteMany();

      // 2. Importer les nouvelles données (dans l'ordre pour respecter les contraintes)

      // Users (sans les relations pour éviter les conflits)
      if (data.users && data.users.length > 0) {
        for (const user of data.users) {
          const { histories, releaseHistories, ...userData } = user;
          await tx.user.create({ data: userData });
        }
      }

      // Settings
      if (data.settings && data.settings.length > 0) {
        for (const setting of data.settings) {
          await tx.settings.create({ data: setting });
        }
      }

      // Events
      if (data.events && data.events.length > 0) {
        for (const event of data.events) {
          await tx.event.create({ data: event });
        }
      }

      // Releases avec toutes les relations imbriquées
      if (data.releases && data.releases.length > 0) {
        for (const release of data.releases) {
          const { squads, ...releaseData } = release;

          await tx.release.create({
            data: {
              ...releaseData,
              squads: squads ? {
                create: squads.map(squad => {
                  const { id, releaseId, features, actions, ...squadData } = squad;
                  return {
                    id,
                    ...squadData,
                    features: features ? {
                      create: features.map(feature => {
                        const { squadId, ...featureData } = feature;
                        return featureData;
                      })
                    } : undefined,
                    actions: actions ? {
                      create: actions.map(action => {
                        const { squadId, flipping, ...actionData } = action;
                        return {
                          ...actionData,
                          flipping: flipping ? {
                            create: (() => {
                              const { actionId, ...flippingData } = flipping;
                              return flippingData;
                            })()
                          } : undefined
                        };
                      })
                    } : undefined
                  };
                })
              } : undefined
            }
          });
        }
      }

      // History
      if (data.history && data.history.length > 0) {
        for (const historyEntry of data.history) {
          await tx.history.create({ data: historyEntry });
        }
      }

      // Release History
      if (data.releaseHistory && data.releaseHistory.length > 0) {
        for (const releaseHistoryEntry of data.releaseHistory) {
          await tx.releaseHistory.create({ data: releaseHistoryEntry });
        }
      }
    });

    res.json({
      message: 'Base de données importée avec succès',
      importedRecords: metadata.totalRecords
    });

  } catch (error) {
    console.error('Erreur lors de l\'import de la base de données:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'import de la base de données',
      details: error.message
    });
  }
}
