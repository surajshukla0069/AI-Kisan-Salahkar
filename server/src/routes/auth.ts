import { Router, Response } from 'express';
import { getDB } from '../db.js';
import { generateToken, AuthRequest, authMiddleware } from '../auth.js';
import bcrypt from 'bcryptjs';

const router = Router();

interface User {
  _id?: string;
  email: string;
  password: string;
  language: string;
  location: string;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
}

// Signup
router.post('/signup', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, language, location, latitude, longitude } = req.body;

    if (!email || !password || !language) {
      return res.status(400).json({ error: 'Email, password, and language are required' });
    }

    const db = getDB();
    const usersCollection = db.collection<User>('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser: User = {
      email: email.toLowerCase(),
      password: hashedPassword,
      language,
      location: location || '',
      latitude,
      longitude,
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);
    const token = generateToken(result.insertedId.toString(), email.toLowerCase());

    res.status(201).json({
      token,
      user: {
        id: result.insertedId.toString(),
        email: newUser.email,
        language: newUser.language,
        location: newUser.location,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Login
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = getDB();
    const usersCollection = db.collection<User>('users');

    // Find user
    const user = await usersCollection.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id!.toString(), user.email);

    res.json({
      token,
      user: {
        id: user._id!.toString(),
        email: user.email,
        language: user.language,
        location: user.location,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const usersCollection = db.collection<User>('users');

    const user = await usersCollection.findOne({ email: req.userEmail });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id!.toString(),
      email: user.email,
      language: user.language,
      location: user.location,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user preferences
router.put('/preferences', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { language, location, latitude, longitude } = req.body;
    const db = getDB();
    const usersCollection = db.collection<User>('users');

    const updateData: any = {};
    if (language) updateData.language = language;
    if (location) updateData.location = location;
    if (latitude) updateData.latitude = latitude;
    if (longitude) updateData.longitude = longitude;

    const result = await usersCollection.findOneAndUpdate(
      { email: req.userEmail },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: result._id!.toString(),
      email: result.email,
      language: result.language,
      location: result.location,
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

export default router;
