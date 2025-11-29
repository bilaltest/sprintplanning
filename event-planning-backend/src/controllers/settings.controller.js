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
          language: 'fr',
          weekStart: 'monday',
          customColors: '[]'
        }
      });
    }

    // Parser customColors de String vers Array
    const settingsWithParsedColors = {
      ...settings,
      customColors: JSON.parse(settings.customColors)
    };

    res.json(settingsWithParsedColors);
  } catch (error) {
    next(error);
  }
};

// PUT /api/settings - Mettre à jour les paramètres
export const updateSettings = async (req, res, next) => {
  try {
    const { theme, language, weekStart, customColors } = req.body;

    // Convertir customColors en String JSON
    const customColorsString = JSON.stringify(customColors || []);

    let settings = await prisma.settings.findFirst();

    if (!settings) {
      // Créer si n'existe pas
      settings = await prisma.settings.create({
        data: {
          theme,
          language,
          weekStart,
          customColors: customColorsString
        }
      });
    } else {
      // Mettre à jour
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: {
          theme,
          language,
          weekStart,
          customColors: customColorsString
        }
      });
    }

    // Retourner avec customColors parsé
    const settingsWithParsedColors = {
      ...settings,
      customColors: JSON.parse(settings.customColors)
    };

    res.json(settingsWithParsedColors);
  } catch (error) {
    next(error);
  }
};
