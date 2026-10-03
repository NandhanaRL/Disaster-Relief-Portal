import db from '../config/database.js';
import { isValidPhone } from '../utils/auth.js';

const ALLOWED_TYPES = ['FOOD', 'WATER', 'MEDICAL', 'SHELTER', 'RESCUE', 'OTHER'];
const ALLOWED_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

// Create new relief request (VICTIM only)
export const createRequest = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { requestType, description, priority, location, contactNumber, neededBy } = req.body;

    // Validation
    if (!requestType || !ALLOWED_TYPES.includes(requestType.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid request type. Must be one of: ${ALLOWED_TYPES.join(', ')}`
      });
    }

    if (!description || typeof description !== 'string' || description.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }

    if (description.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Description exceeds maximum allowed length (1000 characters)'
      });
    }

    if (!priority || !ALLOWED_PRIORITIES.includes(priority.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid priority. Must be one of: ${ALLOWED_PRIORITIES.join(', ')}`
      });
    }

    if (!location || typeof location !== 'string' || location.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Location / Address is required'
      });
    }

    if (location.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Location exceeds maximum allowed length (500 characters)'
      });
    }

    if (!contactNumber || typeof contactNumber !== 'string' || !isValidPhone(contactNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Valid contact phone number is required'
      });
    }

    let parsedNeededBy = null;
    if (neededBy) {
      const dateVal = new Date(neededBy);
      if (isNaN(dateVal.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format for neededBy'
        });
      }
      parsedNeededBy = neededBy;
    }

    const normalizedType = requestType.toUpperCase();
    const normalizedPriority = priority.toUpperCase();
    const forcedStatus = 'PENDING';

    // Insert into SQLite database
    db.run(
      `INSERT INTO relief_requests (
        user_id, request_type, description, priority, location, contact_number, needed_by, status, assigned_worker_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
      [
        userId,
        normalizedType,
        description.trim(),
        normalizedPriority,
        location.trim(),
        contactNumber.trim(),
        parsedNeededBy,
        forcedStatus
      ],
      function (err) {
        if (err) {
          console.error('Error inserting relief request:', err.message);
          return res.status(500).json({
            success: false,
            message: 'Failed to submit relief request'
          });
        }

        const generatedId = this.lastID;
        const formattedCode = `REQ-${String(generatedId).padStart(3, '0')}`;

        return res.status(201).json({
          success: true,
          message: 'Relief request submitted successfully',
          requestId: formattedCode,
          request: {
            id: generatedId,
            userId,
            requestType: normalizedType,
            description: description.trim(),
            priority: normalizedPriority,
            location: location.trim(),
            contactNumber: contactNumber.trim(),
            neededBy: parsedNeededBy,
            status: forcedStatus,
            assignedWorker: null
          }
        });
      }
    );
  } catch (error) {
    console.error('createRequest handler error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get requests created by authenticated victim
export const getMyRequests = async (req, res) => {
  try {
    const userId = req.user?.userId;

    db.all(
      `SELECT id, user_id, request_type, description, priority, location, contact_number, needed_by, status, assigned_worker_id, created_at, updated_at 
       FROM relief_requests 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId],
      (err, rows) => {
        if (err) {
          console.error('Error fetching user requests:', err.message);
          return res.status(500).json({
            success: false,
            message: 'Failed to retrieve requests'
          });
        }

        const formattedRequests = rows.map((row) => ({
          id: row.id,
          requestCode: `REQ-${String(row.id).padStart(3, '0')}`,
          requestType: row.request_type,
          description: row.description,
          priority: row.priority,
          location: row.location,
          contactNumber: row.contact_number,
          neededBy: row.needed_by,
          status: row.status,
          assignedWorker: row.assigned_worker_id ? { id: row.assigned_worker_id } : null,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }));

        return res.status(200).json({
          success: true,
          requests: formattedRequests
        });
      }
    );
  } catch (error) {
    console.error('getMyRequests handler error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get request details by ID (Strict Ownership Enforced for Victims)
export const getRequestById = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const requestId = req.params.id;

    db.get(
      `SELECT id, user_id, request_type, description, priority, location, contact_number, needed_by, status, assigned_worker_id, created_at, updated_at 
       FROM relief_requests 
       WHERE id = ?`,
      [requestId],
      (err, row) => {
        if (err) {
          console.error('Error fetching request details:', err.message);
          return res.status(500).json({
            success: false,
            message: 'Failed to retrieve request details'
          });
        }

        // Strict ownership check: return 403/404 if request not found or belongs to another victim
        if (!row || row.user_id !== userId) {
          return res.status(403).json({
            success: false,
            message: 'Relief request not found or access denied'
          });
        }

        return res.status(200).json({
          success: true,
          request: {
            id: row.id,
            requestCode: `REQ-${String(row.id).padStart(3, '0')}`,
            requestType: row.request_type,
            description: row.description,
            priority: row.priority,
            location: row.location,
            contactNumber: row.contact_number,
            neededBy: row.needed_by,
            status: row.status,
            assignedWorker: row.assigned_worker_id ? { id: row.assigned_worker_id } : null,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }
        });
      }
    );
  } catch (error) {
    console.error('getRequestById handler error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
