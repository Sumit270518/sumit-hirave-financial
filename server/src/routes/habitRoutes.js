import express from 'express';
import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  recordHabitCompletion,
  undoHabitCompletion,
  getHabitHistory,
} from '../controllers/habitController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getHabits);
router.post('/', createHabit);
router.patch('/:id', updateHabit);
router.delete('/:id', deleteHabit);
router.post('/:id/completions', recordHabitCompletion);
router.delete('/:id/completions', undoHabitCompletion);
router.get('/:id/history', getHabitHistory);

export default router;
