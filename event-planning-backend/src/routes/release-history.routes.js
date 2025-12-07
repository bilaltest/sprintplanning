import express from 'express';
import { getReleaseHistory, rollbackReleaseHistory, clearReleaseHistory } from '../controllers/release-history.controller.js';

const router = express.Router();

router.get('/', getReleaseHistory);
router.post('/:id/rollback', rollbackReleaseHistory);
router.delete('/', clearReleaseHistory);

export default router;
