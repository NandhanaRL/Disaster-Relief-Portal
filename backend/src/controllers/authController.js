import db from '../config/database.js';
import { hashPassword, comparePassword, generateToken, isValidEmail, isValidPhone } from '../utils/auth.js';

// Register public user (forced to VICTIM role)
export const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // 1. Validation
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Name is required' });
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

    // 2. Check duplicate email
    db.get('SELECT id FROM users WHERE email = ?', [normalizedEmail], async (err, existingUser) => {
      if (err) {
        console.error('Database query error during registration:', err.message);
        return res.status(500).json({ success: false, message: 'Registration failed due to a server error' });
      }

      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email is already registered' });
      }

      try {
        // 3. Hash Password
        const hashedPassword = await hashPassword(password);

        // 4. Force role to VICTIM regardless of what was passed in request
        const assignedRole = 'VICTIM';

        // 5. Insert User into SQLite
        db.run(
          `INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)`,
          [name.trim(), normalizedEmail, phone.trim(), hashedPassword, assignedRole],
          function (insertErr) {
            if (insertErr) {
              console.error('Database insert error during registration:', insertErr.message);
              return res.status(500).json({ success: false, message: 'Failed to create user account' });
            }

            return res.status(201).json({
              success: true,
              message: 'User registered successfully',
              user: {
                id: this.lastID,
                name: name.trim(),
                email: normalizedEmail,
                phone: phone.trim(),
                role: assignedRole
              }
            });
          }
        );
      } catch (hashError) {
        console.error('Password hashing error:', hashError.message);
        return res.status(500).json({ success: false, message: 'Server error processing credentials' });
      }
    });
  } catch (error) {
    console.error('Registration handler error:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user by normalized email
    db.get('SELECT * FROM users WHERE email = ?', [normalizedEmail], async (err, user) => {
      if (err) {
        console.error('Database query error during login:', err.message);
        return res.status(500).json({ success: false, message: 'Login failed due to a server error' });
      }

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      // Verify password hash
      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      // Generate JWT Token (payload: userId, email, role)
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      });
    });
  } catch (error) {
    console.error('Login handler error:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
