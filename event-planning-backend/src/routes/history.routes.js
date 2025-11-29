import express from 'express';
import { getHistory, rollbackHistory, clearHistory } from '../controllers/history.controller.js';

const router = express.Router();

router.get('/', getHistory);
router.post('/:id/rollback', rollbackHistory);
router.delete('/', clearHistory);

export default router;
