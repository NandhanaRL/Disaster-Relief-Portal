import app from './app.js';
import { initDb } from './config/database.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Initialize Database and Tables
    await initDb();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Disaster Relief Portal Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start backend server:', error);
    process.exit(1);
  }
};

startServer();
