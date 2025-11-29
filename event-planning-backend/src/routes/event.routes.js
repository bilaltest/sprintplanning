import express from 'express';
import { body } from 'express-validator';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  deleteAllEvents,
  bulkCreateEvents
} from '../controllers/event.controller.js';

const router = express.Router();

// Validation rules
const eventValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 30 }).withMessage('Title max 30 characters'),
  body('date').notEmpty().withMessage('Date is required').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be YYYY-MM-DD'),
  body('category').notEmpty().withMessage('Category is required'),
  body('color').notEmpty().withMessage('Color is required'),
  body('icon').notEmpty().withMessage('Icon is required')
];

router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/', eventValidation, createEvent);
router.put('/:id', eventValidation, updateEvent);
router.delete('/:id', deleteEvent);
router.delete('/', deleteAllEvents);
router.post('/bulk', bulkCreateEvents);

export default router;
