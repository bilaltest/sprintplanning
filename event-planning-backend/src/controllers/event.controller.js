import prisma from '../config/database.js';
import { validationResult } from 'express-validator';
import { extractUserIdFromToken, getUserDisplayName } from '../utils/auth.js';

// GET /api/events - Récupérer tous les événements
export const getAllEvents = async (req, res, next) => {
  try {
    const { category, dateFrom, dateTo, search } = req.query;

    let where = {};

    // Filtrer par catégorie
    if (category) {
      where.category = category;
    }

    // Filtrer par date
    if (dateFrom && dateTo) {
      where.date = {
        gte: dateFrom,
        lte: dateTo
      };
    } else if (dateFrom) {
      where.date = { gte: dateFrom };
    } else if (dateTo) {
      where.date = { lte: dateTo };
    }

    // Recherche texte
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { date: 'asc' }
    });

    res.json(events);
  } catch (error) {
    next(error);
  }
};

// GET /api/events/:id - Récupérer un événement par ID
export const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id }
    });

    if (!event) {
      return res.status(404).json({ error: { message: 'Event not found', status: 404 } });
    }

    res.json(event);
  } catch (error) {
    next(error);
  }
};

// POST /api/events - Créer un nouvel événement
export const createEvent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, date, startTime, endTime, color, icon, category, description } = req.body;

    const event = await prisma.event.create({
      data: {
        title,
        date,
        startTime,
        endTime,
        color,
        icon,
        category,
        description
      }
    });

    // Récupérer l'utilisateur pour l'historique
    const userId = extractUserIdFromToken(req);
    let userDisplayName = null;

    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        userDisplayName = getUserDisplayName(user);
      }
    }

    // Enregistrer dans l'historique
    await prisma.history.create({
      data: {
        action: 'create',
        eventId: event.id,
        eventData: JSON.stringify(event),
        previousData: null,
        userId,
        userDisplayName
      }
    });

    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

// PUT /api/events/:id - Mettre à jour un événement
export const updateEvent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, date, startTime, endTime, color, icon, category, description } = req.body;

    // Récupérer l'ancien état pour l'historique
    const oldEvent = await prisma.event.findUnique({ where: { id } });

    if (!oldEvent) {
      return res.status(404).json({ error: { message: 'Event not found', status: 404 } });
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        title,
        date,
        startTime,
        endTime,
        color,
        icon,
        category,
        description
      }
    });

    // Récupérer l'utilisateur pour l'historique
    const userId = extractUserIdFromToken(req);
    let userDisplayName = null;

    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        userDisplayName = getUserDisplayName(user);
      }
    }

    // Enregistrer dans l'historique
    await prisma.history.create({
      data: {
        action: 'update',
        eventId: event.id,
        eventData: JSON.stringify(event),
        previousData: JSON.stringify(oldEvent),
        userId,
        userDisplayName
      }
    });

    res.json(event);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/events/:id - Supprimer un événement
export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({ where: { id } });

    if (!event) {
      return res.status(404).json({ error: { message: 'Event not found', status: 404 } });
    }

    await prisma.event.delete({ where: { id } });

    // Récupérer l'utilisateur pour l'historique
    const userId = extractUserIdFromToken(req);
    let userDisplayName = null;

    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        userDisplayName = getUserDisplayName(user);
      }
    }

    // Enregistrer dans l'historique
    await prisma.history.create({
      data: {
        action: 'delete',
        eventId: id,
        eventData: 'null',
        previousData: JSON.stringify(event),
        userId,
        userDisplayName
      }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// DELETE /api/events - Supprimer tous les événements
export const deleteAllEvents = async (req, res, next) => {
  try {
    await prisma.event.deleteMany();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// POST /api/events/bulk - Créer plusieurs événements (pour import)
export const bulkCreateEvents = async (req, res, next) => {
  try {
    const { events } = req.body;

    if (!Array.isArray(events)) {
      return res.status(400).json({ error: { message: 'Events must be an array', status: 400 } });
    }

    const createdEvents = await prisma.event.createMany({
      data: events,
      skipDuplicates: true
    });

    res.status(201).json({ count: createdEvents.count });
  } catch (error) {
    next(error);
  }
};
