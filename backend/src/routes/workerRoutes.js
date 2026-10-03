import express from 'express';
import {
  getWorkerStats,
  getWorkerRequests,
  getWorkerRequestById,
  startRequest,
  addUpdate,
  getUpdates,
  completeRequest
} from '../controllers/workerController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

// Worker stats
router.get('/stats', authorizeRoles('WORKER'), getWorkerStats);

// Worker request listing & details
router.get('/requests', authorizeRoles('WORKER'), getWorkerRequests);
router.get('/requests/:id', authorizeRoles('WORKER'), getWorkerRequestById);

// Start working on request (ASSIGNED -> IN_PROGRESS)
router.patch('/requests/:id/start', authorizeRoles('WORKER'), startRequest);

// Progress updates
router.post('/requests/:id/updates', authorizeRoles('WORKER'), addUpdate);
router.get('/requests/:id/updates', getUpdates); // Accessible to assigned worker, victim owner, or admin

// Complete request (IN_PROGRESS -> COMPLETED)
router.patch('/requests/:id/complete', authorizeRoles('WORKER'), completeRequest);

export default router;
