import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to transform release data (parse JSON fields)
const transformRelease = (release) => {
  if (!release) return release;

  return {
    ...release,
    squads: release.squads?.map(squad => ({
      ...squad,
      actions: squad.actions?.map(action => ({
        ...action,
        flipping: action.flipping ? {
          ...action.flipping,
          targetClients: JSON.parse(action.flipping.targetClients),
          targetOS: JSON.parse(action.flipping.targetOS),
          targetVersions: JSON.parse(action.flipping.targetVersions)
        } : null
      })) || []
    })) || []
  };
};

// Get all releases
export const getReleases = async (req, res) => {
  try {
    const now = new Date();

    // Récupérer toutes les releases à venir
    const upcomingReleases = await prisma.release.findMany({
      where: {
        releaseDate: {
          gte: now
        }
      },
      include: {
        squads: {
          include: {
            features: true,
            actions: {
              include: {
                flipping: true
              },
              orderBy: {
                order: 'asc'
              }
            }
          },
          orderBy: {
            squadNumber: 'asc'
          }
        }
      },
      orderBy: {
        releaseDate: 'desc'
      }
    });

    // Récupérer les 20 dernières releases passées
    const pastReleases = await prisma.release.findMany({
      where: {
        releaseDate: {
          lt: now
        }
      },
      include: {
        squads: {
          include: {
            features: true,
            actions: {
              include: {
                flipping: true
              },
              orderBy: {
                order: 'asc'
              }
            }
          },
          orderBy: {
            squadNumber: 'asc'
          }
        }
      },
      orderBy: {
        releaseDate: 'desc'
      },
      take: 20  // Limiter aux 20 dernières releases passées
    });

    // Combiner les releases
    const allReleases = [...upcomingReleases, ...pastReleases];

    const transformedReleases = allReleases.map(transformRelease);
    res.json(transformedReleases);
  } catch (error) {
    console.error('Error fetching releases:', error);
    res.status(500).json({ error: 'Failed to fetch releases' });
  }
};

// Get a single release by ID or version
export const getRelease = async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find by version first, then by ID
    let release = await prisma.release.findFirst({
      where: { version: id },
      include: {
        squads: {
          include: {
            features: true,
            actions: {
              include: {
                flipping: true
              },
              orderBy: {
                order: 'asc'
              }
            }
          },
          orderBy: {
            squadNumber: 'asc'
          }
        }
      }
    });

    // If not found by version, try by ID
    if (!release) {
      release = await prisma.release.findUnique({
        where: { id },
        include: {
          squads: {
            include: {
              features: true,
              actions: {
                include: {
                  flipping: true
                },
                orderBy: {
                  order: 'asc'
                }
              }
            },
            orderBy: {
              squadNumber: 'asc'
            }
          }
        }
      });
    }

    if (!release) {
      return res.status(404).json({ error: 'Release not found' });
    }

    const transformedRelease = transformRelease(release);
    res.json(transformedRelease);
  } catch (error) {
    console.error('Error fetching release:', error);
    res.status(500).json({ error: 'Failed to fetch release' });
  }
};

// Create a new release
export const createRelease = async (req, res) => {
  try {
    const { name, version, releaseDate, type, description } = req.body;

    const release = await prisma.release.create({
      data: {
        name,
        version,
        releaseDate: new Date(releaseDate),
        type: type || 'release',
        description,
        status: 'draft',
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
      },
      include: {
        squads: {
          include: {
            features: true,
            actions: true
          },
          orderBy: {
            squadNumber: 'asc'
          }
        }
      }
    });

    // Enregistrer dans l'historique
    const user = req.user; // Récupéré par le middleware d'auth
    await prisma.releaseHistory.create({
      data: {
        action: 'create',
        releaseId: release.id,
        releaseData: JSON.stringify({
          id: release.id,
          name: release.name,
          version: release.version,
          releaseDate: release.releaseDate.toISOString(),
          type: release.type,
          description: release.description,
          status: release.status
        }),
        userId: user?.id,
        userDisplayName: user ? `${user.firstName} ${user.lastName.charAt(0)}.` : null
      }
    });

    res.status(201).json(release);
  } catch (error) {
    console.error('Error creating release:', error);
    res.status(500).json({ error: 'Failed to create release' });
  }
};

// Update a release
export const updateRelease = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, version, releaseDate, type, description, status } = req.body;

    // Récupérer l'ancienne version pour l'historique
    const oldRelease = await prisma.release.findUnique({
      where: { id }
    });

    const release = await prisma.release.update({
      where: { id },
      data: {
        name,
        version,
        releaseDate: releaseDate ? new Date(releaseDate) : undefined,
        type,
        description,
        status
      },
      include: {
        squads: {
          include: {
            features: true,
            actions: {
              include: {
                flipping: true
              }
            }
          },
          orderBy: {
            squadNumber: 'asc'
          }
        }
      }
    });

    // Enregistrer dans l'historique
    const user = req.user;
    await prisma.releaseHistory.create({
      data: {
        action: 'update',
        releaseId: release.id,
        releaseData: JSON.stringify({
          id: release.id,
          name: release.name,
          version: release.version,
          releaseDate: release.releaseDate.toISOString(),
          type: release.type,
          description: release.description,
          status: release.status
        }),
        previousData: JSON.stringify({
          id: oldRelease.id,
          name: oldRelease.name,
          version: oldRelease.version,
          releaseDate: oldRelease.releaseDate.toISOString(),
          type: oldRelease.type,
          description: oldRelease.description,
          status: oldRelease.status
        }),
        userId: user?.id,
        userDisplayName: user ? `${user.firstName} ${user.lastName.charAt(0)}.` : null
      }
    });

    res.json(release);
  } catch (error) {
    console.error('Error updating release:', error);
    res.status(500).json({ error: 'Failed to update release' });
  }
};

// Delete a release
export const deleteRelease = async (req, res) => {
  try {
    const { id } = req.params;

    // Récupérer la release avant suppression pour l'historique
    const release = await prisma.release.findUnique({
      where: { id }
    });

    if (!release) {
      return res.status(404).json({ error: 'Release not found' });
    }

    // Enregistrer dans l'historique avant la suppression
    const user = req.user;
    await prisma.releaseHistory.create({
      data: {
        action: 'delete',
        releaseId: release.id,
        releaseData: 'null',
        previousData: JSON.stringify({
          id: release.id,
          name: release.name,
          version: release.version,
          releaseDate: release.releaseDate.toISOString(),
          type: release.type,
          description: release.description,
          status: release.status
        }),
        userId: user?.id,
        userDisplayName: user ? `${user.firstName} ${user.lastName.charAt(0)}.` : null
      }
    });

    await prisma.release.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting release:', error);
    res.status(500).json({ error: 'Failed to delete release' });
  }
};

// Add a feature to a squad
export const addFeature = async (req, res) => {
  try {
    const { squadId } = req.params;
    const { title, description } = req.body;

    const feature = await prisma.feature.create({
      data: {
        squadId,
        title,
        description
      }
    });

    res.status(201).json(feature);
  } catch (error) {
    console.error('Error adding feature:', error);
    res.status(500).json({ error: 'Failed to add feature' });
  }
};

// Update a feature
export const updateFeature = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const feature = await prisma.feature.update({
      where: { id },
      data: { title, description }
    });

    res.json(feature);
  } catch (error) {
    console.error('Error updating feature:', error);
    res.status(500).json({ error: 'Failed to update feature' });
  }
};

// Delete a feature
export const deleteFeature = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.feature.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting feature:', error);
    res.status(500).json({ error: 'Failed to delete feature' });
  }
};

// Add an action to a squad
export const addAction = async (req, res) => {
  try {
    const { squadId } = req.params;
    const { phase, type, title, description, order, flipping } = req.body;

    const actionData = {
      squadId,
      phase,
      type,
      title,
      description,
      order: order || 0,
      status: 'pending'
    };

    // Si c'est une action de feature flipping ou memory flipping, créer aussi l'entrée flipping
    if ((type === 'feature_flipping' || type === 'memory_flipping') && flipping) {
      actionData.flipping = {
        create: {
          flippingType: flipping.flippingType,
          ruleName: flipping.ruleName,
          theme: flipping.theme,
          ruleAction: flipping.ruleAction,
          ruleState: flipping.ruleState,
          targetClients: JSON.stringify(flipping.targetClients || []),
          targetCaisses: flipping.targetCaisses || null,
          targetOS: JSON.stringify(flipping.targetOS || []),
          targetVersions: JSON.stringify(flipping.targetVersions || [])
        }
      };
    }

    const action = await prisma.action.create({
      data: actionData,
      include: {
        flipping: true
      }
    });

    res.status(201).json(action);
  } catch (error) {
    console.error('Error adding action:', error);
    res.status(500).json({ error: 'Failed to add action' });
  }
};

// Update an action
export const updateAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { phase, type, title, description, status, order, flipping } = req.body;

    // Mise à jour de l'action
    const actionData = {
      phase,
      type,
      title,
      description,
      status,
      order
    };

    const action = await prisma.action.update({
      where: { id },
      data: actionData,
      include: {
        flipping: true
      }
    });

    // Mise à jour du feature/memory flipping si présent
    if ((type === 'feature_flipping' || type === 'memory_flipping') && flipping) {
      if (action.flipping) {
        await prisma.featureFlipping.update({
          where: { actionId: id },
          data: {
            flippingType: flipping.flippingType,
            ruleName: flipping.ruleName,
            theme: flipping.theme,
            ruleAction: flipping.ruleAction,
            ruleState: flipping.ruleState,
            targetClients: JSON.stringify(flipping.targetClients || []),
            targetCaisses: flipping.targetCaisses || null,
            targetOS: JSON.stringify(flipping.targetOS || []),
            targetVersions: JSON.stringify(flipping.targetVersions || [])
          }
        });
      } else {
        await prisma.featureFlipping.create({
          data: {
            actionId: id,
            flippingType: flipping.flippingType,
            ruleName: flipping.ruleName,
            theme: flipping.theme,
            ruleAction: flipping.ruleAction,
            ruleState: flipping.ruleState,
            targetClients: JSON.stringify(flipping.targetClients || []),
            targetCaisses: flipping.targetCaisses || null,
            targetOS: JSON.stringify(flipping.targetOS || []),
            targetVersions: JSON.stringify(flipping.targetVersions || [])
          }
        });
      }
    }

    // Récupérer l'action mise à jour avec le flipping
    const updatedAction = await prisma.action.findUnique({
      where: { id },
      include: {
        flipping: true
      }
    });

    res.json(updatedAction);
  } catch (error) {
    console.error('Error updating action:', error);
    res.status(500).json({ error: 'Failed to update action' });
  }
};

// Delete an action
export const deleteAction = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.action.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting action:', error);
    res.status(500).json({ error: 'Failed to delete action' });
  }
};

// Update squad
export const updateSquad = async (req, res) => {
  try {
    const { squadId } = req.params;
    const { tontonMep, isCompleted, featuresEmptyConfirmed, preMepEmptyConfirmed, postMepEmptyConfirmed } = req.body;

    const data = {};
    if (tontonMep !== undefined) data.tontonMep = tontonMep;
    if (isCompleted !== undefined) data.isCompleted = isCompleted;
    if (featuresEmptyConfirmed !== undefined) data.featuresEmptyConfirmed = featuresEmptyConfirmed;
    if (preMepEmptyConfirmed !== undefined) data.preMepEmptyConfirmed = preMepEmptyConfirmed;
    if (postMepEmptyConfirmed !== undefined) data.postMepEmptyConfirmed = postMepEmptyConfirmed;

    const squad = await prisma.squad.update({
      where: { id: squadId },
      data
    });

    res.json(squad);
  } catch (error) {
    console.error('Error updating squad:', error);
    res.status(500).json({ error: 'Failed to update squad' });
  }
};
