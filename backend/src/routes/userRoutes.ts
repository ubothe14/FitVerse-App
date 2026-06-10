import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { authMiddleware } from '../middleware/authMiddleware';

export const createUserRouter = () => {
  const router = express.Router();

  // GET user profile
  router.get('/profile', authMiddleware, async (req, res) => {
    try {
      const email = req.userEmail;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ error: 'User profile not found in database' });
      }

      return res.json(user);
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ error: err.message || 'Failed to fetch user profile' });
    }
  });

  // POST upsert profile (Registration & Update)
  router.post('/profile', async (req, res) => {
    try {
      let email = String(req.body.email || '').toLowerCase().trim();
      if (!email) {
        return res.status(400).json({ error: 'Email is required in request body' });
      }

      // Check if this is an authenticated request (update)
      let isAuthenticatedUpdate = false;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { email: string };
          if (decoded.email === email) {
            isAuthenticatedUpdate = true;
          }
        } catch (e) {
          // Token invalid, ignore or reject
        }
      }

      const {
        name,
        phone,
        password, // Optional password from body
        age,
        weight,
        height,
        gender,
        activityLevel,
        authProvider,
        macroTargets,
      } = req.body;

      if (!name || !age || !weight || !height || !gender || !activityLevel || !authProvider || !macroTargets) {
        return res.status(400).json({ error: 'Missing required profile fields' });
      }

      const existingUser = await User.findOne({ email });

      if (existingUser && !isAuthenticatedUpdate) {
        return res.status(401).json({ error: 'Email already registered. Please log in.' });
      }

      let updateData: any = {
        email,
        name,
        phone: phone || undefined,
        age: Number(age),
        weight: Number(weight),
        height: Number(height),
        gender,
        activityLevel,
        authProvider,
        macroTargets,
      };

      if (!existingUser && authProvider === 'email') {
        if (!password) {
          return res.status(400).json({ error: 'Password is required for email registration' });
        }
        updateData.password = await bcrypt.hash(String(password), 10);
      }

      const updatedUser = await User.findOneAndUpdate(
        { email },
        updateData,
        { new: true, upsert: true }
      );

      // Generate JWT if this is a new registration
      let token;
      if (!existingUser) {
        token = jwt.sign(
          { email: updatedUser.email },
          process.env.JWT_SECRET || 'fallback_secret',
          { expiresIn: '7d' }
        );
      }

      return res.json({ profile: updatedUser, token });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ error: err.message || 'Failed to update user profile' });
    }
  });

  // POST update macro targets manually
  router.post('/macros', authMiddleware, async (req, res) => {
    try {
      const email = req.userEmail;
      const { macroTargets } = req.body;

      if (!macroTargets || typeof macroTargets !== 'object') {
        return res.status(400).json({ error: 'Missing macroTargets object' });
      }

      const updatedUser = await User.findOneAndUpdate(
        { email },
        { macroTargets },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json(updatedUser.macroTargets);
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ error: err.message || 'Failed to update macro targets' });
    }
  });

  return router;
};
