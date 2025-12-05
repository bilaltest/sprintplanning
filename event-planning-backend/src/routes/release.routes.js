import express from 'express';
import {
  getReleases,
  getRelease,
  createRelease,
  updateRelease,
  deleteRelease,
  addFeature,
  updateFeature,
  deleteFeature,
  addAction,
  updateAction,
  deleteAction,
  updateSquad
} from '../controllers/release.controller.js';

const router = express.Router();

// Release routes
router.get('/', getReleases);
router.get('/:id', getRelease);
router.post('/', createRelease);
router.put('/:id', updateRelease);
router.delete('/:id', deleteRelease);

// Feature routes
router.post('/squads/:squadId/features', addFeature);
router.put('/features/:id', updateFeature);
router.delete('/features/:id', deleteFeature);

// Action routes
router.post('/squads/:squadId/actions', addAction);
router.put('/actions/:id', updateAction);
router.delete('/actions/:id', deleteAction);

// Squad routes
router.put('/squads/:squadId', updateSquad);

export default router;
