import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';

export const createAuthRouter = () => {
  const router = express.Router();

  router.post('/google', async (req, res) => {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'No Google identity credential provided' });
    }

    try {
      // Validate Google Token using Google's lightweight verification API
      const googleVerifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`;
      const response = await fetch(googleVerifyUrl);

      if (!response.ok) {
        return res.status(401).json({ error: 'Failed to verify Google credential with identity server' });
      }

      const payload = await response.json();
      const clientID = process.env.GOOGLE_CLIENT_ID;

      // Verify audience matches our Google Client ID
      if (clientID && payload.aud !== clientID) {
        console.error(`❌ Google Client ID mismatch. Expected: ${clientID}, got: ${payload.aud}`);
        return res.status(401).json({ error: 'Audience mismatch. Invalid Client ID configuration.' });
      }

      const email = String(payload.email || '').toLowerCase().trim();
      const name = String(payload.name || '').trim();

      if (!email) {
        return res.status(401).json({ error: 'Google account is missing email address' });
      }

      // Check if user exists in database
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        // Generate JWT
        const token = jwt.sign(
          { email: existingUser.email },
          process.env.JWT_SECRET || 'fallback_secret',
          { expiresIn: '7d' }
        );
        // Set httpOnly cookie for secure sessions
        res.cookie('fitverse_auth', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.json({
          exists: true,
          token, // still return for clients that prefer header storage
          profile: {
            name: existingUser.name,
            email: existingUser.email,
            phone: existingUser.phone,
            age: existingUser.age,
            weight: existingUser.weight,
            height: existingUser.height,
            gender: existingUser.gender,
            activityLevel: existingUser.activityLevel,
            authProvider: existingUser.authProvider,
            macroTargets: existingUser.macroTargets,
          },
        });
      } else {
        // Return email and name so frontend can prepopulate signup form
        return res.json({
          exists: false,
          email,
          name,
        });
      }
    } catch (err) {
      const msg = (err as Error).message || 'Google Auth verification failed';
      console.error(`❌ Google auth error: ${msg}`);
      return res.status(500).json({ error: msg });
    }
  });

  router.post('/email/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
      if (!user || !user.password) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(String(password), user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate JWT
      const token = jwt.sign(
        { email: user.email },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      );

      // Set httpOnly cookie for secure sessions
      res.cookie('fitverse_auth', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        token,
        profile: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          age: user.age,
          weight: user.weight,
          height: user.height,
          gender: user.gender,
          activityLevel: user.activityLevel,
          authProvider: user.authProvider,
          macroTargets: user.macroTargets,
        },
      });
    } catch (err) {
      console.error(`❌ Email login error:`, err);
      return res.status(500).json({ error: 'Login failed due to server error' });
    }
  });

  // Logout route - clears cookie
  router.post('/logout', (_req, res) => {
    res.clearCookie('fitverse_auth', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
    res.json({ success: true });
  });

  return router;
};
