import express from 'express';
import {
  getStats,
  getAllRequests,
  getRequestById,
  getWorkers,
  createWorker,
  assignWorker
} from '../controllers/adminController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Enforce JWT Authentication and ADMIN Role for all admin routes
router.use(authenticateToken);
router.use(authorizeRoles('ADMIN'));

router.get('/stats', getStats);
router.get('/requests', getAllRequests);
router.get('/requests/:id', getRequestById);
router.get('/workers', getWorkers);
router.post('/workers', createWorker);
router.patch('/requests/:id/assign', assignWorker);

export default router;
