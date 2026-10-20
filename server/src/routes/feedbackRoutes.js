import express from 'express';
import { submitFeedback, getMyFeedback } from '../controllers/feedbackController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', submitFeedback);
router.get('/my', getMyFeedback);

export default router;
