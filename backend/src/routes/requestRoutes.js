import express from 'express';
import { createRequest, getMyRequests, getRequestById } from '../controllers/requestController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all request routes
router.use(authenticateToken);

// Create new request (VICTIM only)
router.post('/', authorizeRoles('VICTIM'), createRequest);

// Get my requests (VICTIM only)
router.get('/my', authorizeRoles('VICTIM'), getMyRequests);

// Get request details by ID (VICTIM only, ownership enforced)
router.get('/:id', authorizeRoles('VICTIM'), getRequestById);

export default router;
