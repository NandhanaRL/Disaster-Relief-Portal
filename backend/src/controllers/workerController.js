import db from '../config/database.js';

// Get worker statistics
export const getWorkerStats = async (req, res) => {
  try {
    const workerId = req.user?.userId;

    db.get(
      `SELECT 
        SUM(CASE WHEN status = 'ASSIGNED' THEN 1 ELSE 0 END) as assigned,
        SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgress,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed
       FROM relief_requests
       WHERE assigned_worker_id = ?`,
      [workerId],
      (err, row) => {
        if (err) {
          console.error('Error fetching worker stats:', err.message);
          return res.status(500).json({ success: false, message: 'Failed to retrieve worker statistics' });
        }

        return res.status(200).json({
          success: true,
          stats: {
            assigned: row?.assigned || 0,
            inProgress: row?.inProgress || 0,
            completed: row?.completed || 0
          }
        });
      }
    );
  } catch (error) {
    console.error('getWorkerStats handler error:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get requests assigned to authenticated worker
export const getWorkerRequests = async (req, res) => {
  try {
    const workerId = req.user?.userId;

    db.all(
      `SELECT 
        r.id, r.user_id, r.request_type, r.description, r.priority, r.location, r.contact_number, r.needed_by, r.status, r.created_at, r.updated_at,
        u.name as victim_name, u.phone as victim_phone
       FROM relief_requests r
       JOIN users u ON r.user_id = u.id
       WHERE r.assigned_worker_id = ?
       ORDER BY r.created_at DESC`,
      [workerId],
      (err, rows) => {
        if (err) {
          console.error('Error fetching worker requests:', err.message);
          return res.status(500).json({ success: false, message: 'Failed to retrieve assigned requests' });
        }

        const requests = rows.map((row) => ({
          id: row.id,
          requestCode: `REQ-${String(row.id).padStart(3, '0')}`,
          requestType: row.request_type,
          description: row.description,
          priority: row.priority,
          location: row.location,
          contactNumber: row.contact_number,
          neededBy: row.needed_by,
          status: row.status,
          victim: {
            id: row.user_id,
            name: row.victim_name,
            phone: row.victim_phone
          },
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }));

        return res.status(200).json({
          success: true,
          requests
        });
      }
    );
  } catch (error) {
    console.error('getWorkerRequests handler error:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get single request details for assigned worker
export const getWorkerRequestById = async (req, res) => {
  try {
    const workerId = req.user?.userId;
    const requestId = req.params.id;

    db.get(
      `SELECT 
        r.id, r.user_id, r.request_type, r.description, r.priority, r.location, r.contact_number, r.needed_by, r.status, r.assigned_worker_id, r.created_at, r.updated_at,
        u.name as victim_name, u.phone as victim_phone
       FROM relief_requests r
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [requestId],
      (err, row) => {
        if (err) {
          console.error('Error fetching worker request details:', err.message);
          return res.status(500).json({ success: false, message: 'Failed to retrieve request details' });
        }

        if (!row || row.assigned_worker_id !== workerId) {
          return res.status(403).json({ success: false, message: 'Relief request not found or access denied' });
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
            victim: {
              id: row.user_id,
              name: row.victim_name,
              phone: row.victim_phone
            },
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }
        });
      }
    );
  } catch (error) {
    console.error('getWorkerRequestById handler error:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Start working on request (ASSIGNED -> IN_PROGRESS)
export const startRequest = async (req, res) => {
  try {
    const workerId = req.user?.userId;
    const requestId = req.params.id;

    db.get('SELECT id, assigned_worker_id, status FROM relief_requests WHERE id = ?', [requestId], (err, row) => {
      if (err) {
        console.error('Error checking request status before start:', err.message);
        return res.status(500).json({ success: false, message: 'Server error checking request' });
      }

      if (!row || row.assigned_worker_id !== workerId) {
        return res.status(403).json({ success: false, message: 'Relief request not found or access denied' });
      }

      if (row.status !== 'ASSIGNED') {
        return res.status(400).json({
          success: false,
          message: `Cannot start request. Current status is ${row.status}, must be ASSIGNED.`
        });
      }

      db.run(
        `UPDATE relief_requests SET status = 'IN_PROGRESS', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [requestId],
        function (updateErr) {
          if (updateErr) {
            console.error('Error starting request:', updateErr.message);
            return res.status(500).json({ success: false, message: 'Failed to update request status' });
          }

          return res.status(200).json({
            success: true,
            message: 'Request status updated to IN_PROGRESS',
            status: 'IN_PROGRESS'
          });
        }
      );
    });
  } catch (error) {
    console.error('startRequest handler error:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Add progress update to request (must be IN_PROGRESS)
export const addUpdate = async (req, res) => {
  try {
    const workerId = req.user?.userId;
    const requestId = req.params.id;
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Progress update message is required' });
    }

    db.get('SELECT id, assigned_worker_id, status FROM relief_requests WHERE id = ?', [requestId], (err, row) => {
      if (err) {
        console.error('Error checking request status for update:', err.message);
        return res.status(500).json({ success: false, message: 'Server error checking request' });
      }

      if (!row || row.assigned_worker_id !== workerId) {
        return res.status(403).json({ success: false, message: 'Relief request not found or access denied' });
      }

      if (row.status !== 'IN_PROGRESS') {
        return res.status(400).json({
          success: false,
          message: 'Progress updates can only be added to requests that are IN_PROGRESS'
        });
      }

      db.run(
        `INSERT INTO worker_updates (request_id, worker_id, message) VALUES (?, ?, ?)`,
        [requestId, workerId, message.trim()],
        function (insertErr) {
          if (insertErr) {
            console.error('Error inserting worker update:', insertErr.message);
            return res.status(500).json({ success: false, message: 'Failed to add progress update' });
          }

          return res.status(201).json({
            success: true,
            message: 'Progress update added successfully',
            update: {
              id: this.lastID,
              requestId: parseInt(requestId, 10),
              workerId,
              message: message.trim(),
              createdAt: new Date().toISOString()
            }
          });
        }
      );
    });
  } catch (error) {
    console.error('addUpdate handler error:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get progress updates for a request
export const getUpdates = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const requestId = req.params.id;

    // Check ownership/access
    db.get('SELECT id, user_id, assigned_worker_id FROM relief_requests WHERE id = ?', [requestId], (err, row) => {
      if (err) {
        console.error('Error checking request for updates:', err.message);
        return res.status(500).json({ success: false, message: 'Server error checking request' });
      }

      if (!row) {
        return res.status(404).json({ success: false, message: 'Relief request not found' });
      }

      // Check access permission: user must be assigned worker, victim owner, or admin
      const isOwnerWorker = row.assigned_worker_id === userId;
      const isOwnerVictim = row.user_id === userId;
      const isAdmin = userRole === 'ADMIN';

      if (!isOwnerWorker && !isOwnerVictim && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      db.all(
        `SELECT id, request_id, worker_id, message, created_at 
         FROM worker_updates 
         WHERE request_id = ? 
         ORDER BY created_at ASC`,
        [requestId],
        (fetchErr, rows) => {
          if (fetchErr) {
            console.error('Error fetching updates:', fetchErr.message);
            return res.status(500).json({ success: false, message: 'Failed to retrieve progress updates' });
          }

          const updates = rows.map((r) => ({
            id: r.id,
            requestId: r.request_id,
            workerId: r.worker_id,
            message: r.message,
            createdAt: r.created_at
          }));

          return res.status(200).json({
            success: true,
            updates
          });
        }
      );
    });
  } catch (error) {
    console.error('getUpdates handler error:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Complete request (IN_PROGRESS -> COMPLETED)
export const completeRequest = async (req, res) => {
  try {
    const workerId = req.user?.userId;
    const requestId = req.params.id;

    db.get('SELECT id, assigned_worker_id, status FROM relief_requests WHERE id = ?', [requestId], (err, row) => {
      if (err) {
        console.error('Error checking request status before complete:', err.message);
        return res.status(500).json({ success: false, message: 'Server error checking request' });
      }

      if (!row || row.assigned_worker_id !== workerId) {
        return res.status(403).json({ success: false, message: 'Relief request not found or access denied' });
      }

      if (row.status !== 'IN_PROGRESS') {
        return res.status(400).json({
          success: false,
          message: `Cannot complete request. Current status is ${row.status}, must be IN_PROGRESS.`
        });
      }

      db.run(
        `UPDATE relief_requests SET status = 'COMPLETED', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [requestId],
        function (updateErr) {
          if (updateErr) {
            console.error('Error completing request:', updateErr.message);
            return res.status(500).json({ success: false, message: 'Failed to complete request' });
          }

          return res.status(200).json({
            success: true,
            message: 'Request completed successfully',
            status: 'COMPLETED'
          });
        }
      );
    });
  } catch (error) {
    console.error('completeRequest handler error:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
