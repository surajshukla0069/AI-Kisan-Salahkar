import { Router, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../db.js';
import { authMiddleware, AuthRequest } from '../auth.js';

const router = Router();

interface Profile {
  _id?: ObjectId;
  user_id: string;
  name: string;
  village: string;
  district: string;
  state: string;
  land_size: number;
  land_unit: string;
  main_crops: string[];
  language: string;
  latitude?: number;
  longitude?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Get user profile
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const profilesCollection = db.collection<Profile>('profiles');

    const profile = await profilesCollection.findOne({ user_id: req.userId });
    
    if (!profile) {
      return res.json({
        user_id: req.userId,
        name: '',
        village: '',
        district: '',
        state: '',
        land_size: 0,
        land_unit: 'acre',
        main_crops: [],
        language: 'en',
      });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Create or update profile
router.put('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, village, district, state, land_size, land_unit, main_crops, language, latitude, longitude } = req.body;
    const db = getDB();
    const profilesCollection = db.collection<Profile>('profiles');

    const profile: Profile = {
      user_id: req.userId!,
      name: name || '',
      village: village || '',
      district: district || '',
      state: state || '',
      land_size: land_size || 0,
      land_unit: land_unit || 'acre',
      main_crops: main_crops || [],
      language: language || 'en',
      latitude: latitude,
      longitude: longitude,
      updatedAt: new Date(),
    };

    const result = await profilesCollection.findOneAndUpdate(
      { user_id: req.userId },
      { $set: profile },
      { upsert: true, returnDocument: 'after' }
    );

    res.json(result || profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
