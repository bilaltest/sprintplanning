import prisma from '../config/database.js';

// GET /api/settings - Récupérer les paramètres
export const getSettings = async (req, res, next) => {
  try {
    let settings = await prisma.settings.findFirst();

    // Si pas de paramètres, créer les valeurs par défaut
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          theme: 'light',
          customCategories: '[]'
        }
      });
    }

    // Parser customCategories de String vers Array
    const settingsWithParsedData = {
      ...settings,
      customCategories: JSON.parse(settings.customCategories || '[]')
    };

    res.json(settingsWithParsedData);
  } catch (error) {
    next(error);
  }
};

// PUT /api/settings - Mettre à jour les paramètres
export const updateSettings = async (req, res, next) => {
  try {
    const { theme, customCategories } = req.body;

    // Convertir customCategories en String JSON
    const customCategoriesString = JSON.stringify(customCategories || []);

    let settings = await prisma.settings.findFirst();

    if (!settings) {
      // Créer si n'existe pas
      settings = await prisma.settings.create({
        data: {
          theme,
          customCategories: customCategoriesString
        }
      });
    } else {
      // Mettre à jour
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: {
          theme,
          customCategories: customCategoriesString
        }
      });
    }

    // Retourner avec customCategories parsé
    const settingsWithParsedData = {
      ...settings,
      customCategories: JSON.parse(settings.customCategories)
    };

    res.json(settingsWithParsedData);
  } catch (error) {
    next(error);
  }
};
