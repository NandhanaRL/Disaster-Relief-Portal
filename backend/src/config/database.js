import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, '../../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'disaster_relief.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Seed development admin user safely
const seedAdminUser = (db) => {
  const adminEmail = 'admin@disasterrelief.local';
  db.get('SELECT id FROM users WHERE email = ?', [adminEmail], async (err, row) => {
    if (err) {
      console.error('Error checking admin seed status:', err.message);
      return;
    }
    if (!row) {
      try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin@12345', salt);
        db.run(
          `INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)`,
          ['System Administrator', adminEmail, '0000000000', hashedPassword, 'ADMIN'],
          (insertErr) => {
            if (insertErr) {
              console.error('Error seeding admin user:', insertErr.message);
            } else {
              console.log('Development admin account seeded successfully.');
            }
          }
        );
      } catch (hashErr) {
        console.error('Error hashing admin password during seed:', hashErr.message);
      }
    }
  });
};

export const initDb = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Enable Foreign Keys
      db.run('PRAGMA foreign_keys = ON;', (err) => {
        if (err) {
          console.error('Failed to enable foreign keys:', err.message);
        }
      });

      // Table 1: users
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          phone TEXT NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('VICTIM', 'WORKER', 'ADMIN')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Table 2: relief_requests
      db.run(`
        CREATE TABLE IF NOT EXISTS relief_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          request_type TEXT NOT NULL CHECK(request_type IN ('FOOD', 'WATER', 'MEDICAL', 'SHELTER', 'RESCUE', 'OTHER')),
          description TEXT NOT NULL,
          priority TEXT NOT NULL CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH')),
          location TEXT NOT NULL,
          contact_number TEXT NOT NULL,
          needed_by DATETIME,
          status TEXT NOT NULL CHECK(status IN ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED')),
          assigned_worker_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (assigned_worker_id) REFERENCES users(id)
        );
      `);

      // Table 3: worker_updates
      db.run(`
        CREATE TABLE IF NOT EXISTS worker_updates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          request_id INTEGER NOT NULL,
          worker_id INTEGER NOT NULL,
          message TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (request_id) REFERENCES relief_requests(id),
          FOREIGN KEY (worker_id) REFERENCES users(id)
        );
      `, (err) => {
        if (err) {
          console.error('Error creating database tables:', err.message);
          reject(err);
        } else {
          console.log('Database tables initialized successfully.');
          seedAdminUser(db);
          resolve();
        }
      });
    });
  });
};

export const checkDbConnection = () => {
  return new Promise((resolve) => {
    db.get('SELECT 1', (err) => {
      if (err) {
        resolve({ connected: false, error: err.message });
      } else {
        resolve({ connected: true });
      }
    });
  });
};

export default db;
