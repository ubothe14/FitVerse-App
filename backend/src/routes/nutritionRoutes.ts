import express from 'express';
import { FoodLog } from '../models/FoodLog';
import { authMiddleware } from '../middleware/authMiddleware';

export const createNutritionRouter = () => {
  const router = express.Router();

  // GET daily food logs
  router.get('/log', authMiddleware, async (req, res) => {
    try {
      const email = req.userEmail;
      const dateStr = String(req.query.date ?? '').trim();

      if (!dateStr) {
        return res.status(400).json({ error: 'Missing date parameter' });
      }

      // Find all logged meals for this user on the selected date
      const logs = await FoodLog.find({ userEmail: email, dateStr }).sort({ createdAt: -1 });
      return res.json(logs);
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ error: err.message || 'Failed to fetch food logs' });
    }
  });

  // POST create / save food log
  router.post('/log', authMiddleware, async (req, res) => {
    try {
      const email = req.userEmail;
      const {
        id,
        foodName,
        calories,
        protein,
        carbs,
        fat,
        explanation,
        imageUrl,
        dateStr,
      } = req.body;

      if (!id || !foodName || calories === undefined || protein === undefined || carbs === undefined || fat === undefined || !dateStr) {
        return res.status(400).json({ error: 'Missing required food log fields' });
      }

      // Save or update log (identifying by client id and user email)
      const savedLog = await FoodLog.findOneAndUpdate(
        { id, userEmail: email },
        {
          id,
          userEmail: email,
          foodName,
          calories: Number(calories),
          protein: Number(protein),
          carbs: Number(carbs),
          fat: Number(fat),
          explanation: explanation || undefined,
          imageUrl: imageUrl || undefined,
          dateStr,
        },
        { new: true, upsert: true }
      );

      return res.json(savedLog);
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ error: err.message || 'Failed to save food log' });
    }
  });

  // DELETE food log by client-side string id
  router.delete('/log/:id', authMiddleware, async (req, res) => {
    try {
      const email = req.userEmail;
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'Missing food log id parameter' });
      }

      const deletedLog = await FoodLog.findOneAndDelete({ id, userEmail: email });

      if (!deletedLog) {
        return res.status(404).json({ error: 'Food log entry not found or unauthorized' });
      }

      return res.json({ success: true, message: 'Food log entry deleted successfully', id });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ error: err.message || 'Failed to delete food log entry' });
    }
  });

  return router;
};
