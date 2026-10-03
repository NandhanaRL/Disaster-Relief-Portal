import express from 'express';
import { checkDbConnection } from '../config/database.js';

const router = express.Router();

router.get('/health', async (req, res) => {
  const dbStatus = await checkDbConnection();

  if (dbStatus.connected) {
    return res.status(200).json({
      success: true,
      message: 'Disaster Relief Portal API is running',
      database: 'connected'
    });
  } else {
    return res.status(500).json({
      success: false,
      message: 'Disaster Relief Portal API is running with database errors',
      database: 'disconnected',
      error: dbStatus.error
    });
  }
});

export default router;
