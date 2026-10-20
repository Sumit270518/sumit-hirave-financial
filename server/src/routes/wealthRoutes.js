import express from 'express';
import {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  getLiabilities,
  createLiability,
  updateLiability,
  deleteLiability,
  getWealthSummary,
  getWealthHistory,
  captureSnapshot,
} from '../controllers/wealthController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Asset routes
router.get('/assets', getAssets);
router.post('/assets', createAsset);
router.patch('/assets/:id', updateAsset);
router.delete('/assets/:id', deleteAsset);

// Liability routes
router.get('/liabilities', getLiabilities);
router.post('/liabilities', createLiability);
router.patch('/liabilities/:id', updateLiability);
router.delete('/liabilities/:id', deleteLiability);

// Wealth analytics & history
router.get('/summary', getWealthSummary);
router.get('/history', getWealthHistory);
router.post('/snapshot', captureSnapshot);

export default router;
