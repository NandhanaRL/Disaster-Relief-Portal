import app from './app.js';
import { initDb } from './config/database.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Initialize Database and Tables
    await initDb();
    
    app.listen(PORT, () => {
      console.log(`Disaster Relief Portal Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start backend server:', error);
    process.exit(1);
  }
};

startServer();
