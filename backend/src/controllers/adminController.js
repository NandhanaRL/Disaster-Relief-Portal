import db from '../config/database.js';
import { hashPassword, isValidEmail, isValidPhone } from '../utils/auth.js';

// Get system request statistics
export const getStats = async (req, res) => {
  try {
    db.get(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'ASSIGNED' THEN 1 ELSE 0 END) as assigned,
        SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgress,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed
       FROM relief_requests`,
      [],
      (err, row) => {
        if (err) {
          console.error('Error fetching admin stats:', err.message);
          return res.status(500).json({ success: false, message: 'Failed to retrieve statistics' });
        }

        return res.status(200).json({
          success: true,
          stats: {
            total: row?.total || 0,
            pending: row?.pending || 0,
            assigned: row?.assigned || 0,
            inProgress: row?.inProgress || 0,
            completed: row?.completed || 0
          }
        });
      }
    );
  } catch (error) {
    console.error('getStats handler error:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get all relief requests with Victim and Worker details
export const getAllRequests = async (req, res) => {
  try {
    db.all(
      `SELECT 
        r.id, r.user_id, r.request_type, r.description, r.priority, r.location, r.contact_number, r.needed_by, r.status, r.assigned_worker_id, r.created_at, r.updated_at,
        u.name as victim_name, u.email as victim_email, u.phone as victim_phone,
        w.name as worker_name, w.email as worker_email, w.phone as worker_phone
       FROM relief_requests r
       JOIN users u ON r.user_id = u.id
       LEFT JOIN users w ON r.assigned_worker_id = w.id
       ORDER BY r.created_at DESC`,
      [],
      (err, rows) => {
        if (err) {
          console.error('Error fetching all requests for admin:', err.message);
          return res.status(500).json({ success: false, message: 'Failed to retrieve requests' });
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
            email: row.victim_email,
            phone: row.victim_phone
          },
          assignedWorker: row.assigned_worker_id
            ? {
                id: row.assigned_worker_id,
                name: row.worker_name,
                email: row.worker_email,
                phone: row.worker_phone
              }
            : null,
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
    console.error('getAllRequests handler error:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get single request details by ID
export const getRequestById = async (req, res) => {
  try {
    const requestId = req.params.id;

    db.get(
      `SELECT 
        r.id, r.user_id, r.request_type, r.description, r.priority, r.location, r.contact_number, r.needed_by, r.status, r.assigned_worker_id, r.created_at, r.updated_at,
        u.name as victim_name, u.email as victim_email, u.phone as victim_phone,
        w.name as worker_name, w.email as worker_email, w.phone as worker_phone
       FROM relief_requests r
       JOIN users u ON r.user_id = u.id
       LEFT JOIN users w ON r.assigned_worker_id = w.id
       WHERE r.id = ?`,
      [requestId],
      (err, row) => {
        if (err) {
          console.error('Error fetching admin request details:', err.message);
          return res.status(500).json({ success: false, message: 'Failed to retrieve request details' });
        }

        if (!row) {
          return res.status(404).json({ success: false, message: 'Relief request not found' });
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
              email: row.victim_email,
              phone: row.victim_phone
            },
            assignedWorker: row.assigned_worker_id
              ? {
                  id: row.assigned_worker_id,
                  name: row.worker_name,
                  email: row.worker_email,
                  phone: row.worker_phone
                }
              : null,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }
        });
      }
    );
  } catch (error) {
    console.error('getRequestById handler error:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get list of all relief workers
export const getWorkers = async (req, res) => {
  try {
    db.all(
      `SELECT id, name, email, phone, created_at FROM users WHERE role = 'WORKER' ORDER BY name ASC`,
      [],
      (err, rows) => {
        if (err) {
          console.error('Error fetching workers:', err.message);
          return res.status(500).json({ success: false, message: 'Failed to retrieve workers' });
        }

        return res.status(200).json({
          success: true,
          workers: rows.map((r) => ({
            id: r.id,
            name: r.name,
            email: r.email,
            phone: r.phone,
            createdAt: r.created_at
          }))
        });
      }
    );
  } catch (error) {
    console.error('getWorkers handler error:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Create a new relief worker (ADMIN only)
export const createWorker = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Valid email address is required' });
    }

    if (!phone || typeof phone !== 'string' || !isValidPhone(phone)) {
      return res.status(400).json({ success: false, message: 'Valid phone number is required' });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check duplicate email
    db.get('SELECT id FROM users WHERE email = ?', [normalizedEmail], async (err, existingUser) => {
      if (err) {
        console.error('Database query error checking worker email:', err.message);
        return res.status(500).json({ success: false, message: 'Server error checking account' });
      }

      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email is already registered' });
      }

      try {
        const hashedPassword = await hashPassword(password);
        const forcedRole = 'WORKER';

        db.run(
          `INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)`,
          [name.trim(), normalizedEmail, phone.trim(), hashedPassword, forcedRole],
          function (insertErr) {
            if (insertErr) {
              console.error('Error inserting worker into database:', insertErr.message);
              return res.status(500).json({ success: false, message: 'Failed to create worker account' });
            }

            return res.status(201).json({
              success: true,
              message: 'Relief worker account created successfully',
              worker: {
                id: this.lastID,
                name: name.trim(),
                email: normalizedEmail,
                phone: phone.trim(),
                role: forcedRole
              }
            });
          }
        );
      } catch (hashError) {
        console.error('Password hashing error for worker:', hashError.message);
        return res.status(500).json({ success: false, message: 'Server error processing password' });
      }
    });
  } catch (error) {
    console.error('createWorker handler error:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Assign a Relief Worker to a Request (ADMIN only)
export const assignWorker = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { workerId } = req.body;

    if (!workerId || isNaN(parseInt(workerId, 10))) {
      return res.status(400).json({ success: false, message: 'Valid workerId is required' });
    }

    const parsedWorkerId = parseInt(workerId, 10);

    // 1. Check if request exists
    db.get('SELECT id, status FROM relief_requests WHERE id = ?', [requestId], (reqErr, requestRow) => {
      if (reqErr) {
        console.error('Error checking request existence:', reqErr.message);
        return res.status(500).json({ success: false, message: 'Server error checking request' });
      }

      if (!requestRow) {
        return res.status(404).json({ success: false, message: 'Relief request not found' });
      }

      // 2. Check if selected user exists AND has role WORKER
      db.get('SELECT id, name, email, role FROM users WHERE id = ?', [parsedWorkerId], (userErr, userRow) => {
        if (userErr) {
          console.error('Error checking worker existence:', userErr.message);
          return res.status(500).json({ success: false, message: 'Server error checking worker user' });
        }

        if (!userRow || userRow.role !== 'WORKER') {
          return res.status(400).json({
            success: false,
            message: 'Selected user is not a valid Relief Worker'
          });
        }

        // 3. Update request: assign worker, change status to ASSIGNED
        db.run(
          `UPDATE relief_requests 
           SET assigned_worker_id = ?, status = 'ASSIGNED', updated_at = CURRENT_TIMESTAMP 
           WHERE id = ?`,
          [parsedWorkerId, requestId],
          function (updateErr) {
            if (updateErr) {
              console.error('Error assigning worker to request:', updateErr.message);
              return res.status(500).json({ success: false, message: 'Failed to assign worker' });
            }

            return res.status(200).json({
              success: true,
              message: 'Worker assigned successfully',
              request: {
                id: parseInt(requestId, 10),
                requestCode: `REQ-${String(requestId).padStart(3, '0')}`,
                status: 'ASSIGNED',
                assignedWorker: {
                  id: userRow.id,
                  name: userRow.name,
                  email: userRow.email
                }
              }
            });
          }
        );
      });
    });
  } catch (error) {
    console.error('assignWorker handler error:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
