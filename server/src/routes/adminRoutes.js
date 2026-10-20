import express from 'express';
import {
  getAdminStats,
  getUsers,
  updateUserStatus,
  getAllFeedback,
  updateFeedback,
  getAuditLogs,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Strict security: all admin routes require authenticated session with 'admin' role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/feedback', getAllFeedback);
router.patch('/feedback/:id', updateFeedback);
router.get('/audit-logs', getAuditLogs);

export default router;
