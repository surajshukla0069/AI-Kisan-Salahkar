import { Router, Response } from 'express';
import { getDB } from '../db.js';
import { authMiddleware, AuthRequest } from '../auth.js';
import {
  getWeather,
  getWeatherForecast,
  generateWeatherAlerts,
  getWeatherSuitabilityScore,
  WeatherData,
  WeatherAlert,
} from '../services/weather.js';

const router = Router();

// Get current weather for user's location
router.get('/current', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const profilesCollection = db.collection('profiles');

    // Get user's profile to get their location
    const profile = await profilesCollection.findOne({ user_id: req.userId });

    if (!profile || !profile.latitude || !profile.longitude) {
      return res.status(400).json({
        error: 'User location not set. Please update your profile with coordinates.',
      });
    }

    const weather = await getWeather(profile.latitude, profile.longitude);

    // Cache weather data in the database for reference
    const weatherCollection = db.collection<WeatherData & { userId: string }>(
      'weather_cache'
    );
    await weatherCollection.insertOne({
      ...weather,
      userId: req.userId!,
    });

    res.json(weather);
  } catch (error: any) {
    console.error('Error fetching weather:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch weather' });
  }
});

// Get weather forecast (7 days)
router.get('/forecast', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const profilesCollection = db.collection('profiles');

    const profile = await profilesCollection.findOne({ user_id: req.userId });

    if (!profile || !profile.latitude || !profile.longitude) {
      return res.status(400).json({
        error: 'User location not set. Please update your profile with coordinates.',
      });
    }

    const forecast = await getWeatherForecast(
      profile.latitude,
      profile.longitude
    );

    res.json(forecast);
  } catch (error: any) {
    console.error('Error fetching forecast:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch forecast' });
  }
});

// Get weather-based alerts
router.get('/alerts', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const profilesCollection = db.collection('profiles');

    const profile = await profilesCollection.findOne({ user_id: req.userId });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    if (!profile.latitude || !profile.longitude) {
      return res.status(400).json({
        error: 'User location not set. Please update your profile with coordinates.',
      });
    }

    const weather = await getWeather(profile.latitude, profile.longitude);
    const alerts = generateWeatherAlerts(weather, profile.main_crops || []);

    // Store alerts in database
    const alertsCollection = db.collection<WeatherAlert & { userId: string }>(
      'weather_alerts'
    );
    for (const alert of alerts) {
      await alertsCollection.insertOne({
        ...alert,
        userId: req.userId!,
      });
    }

    res.json(alerts);
  } catch (error: any) {
    console.error('Error generating alerts:', error);
    res.status(500).json({ error: error.message || 'Failed to generate alerts' });
  }
});

// Get crop suitability scores based on current weather
router.get(
  '/crop-suitability/:crops',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const db = getDB();
      const profilesCollection = db.collection('profiles');

      const profile = await profilesCollection.findOne({ user_id: req.userId });

      if (!profile || !profile.latitude || !profile.longitude) {
        return res.status(400).json({
          error: 'User location not set. Please update your profile with coordinates.',
        });
      }

      const weather = await getWeather(profile.latitude, profile.longitude);
      const cropsList = req.params.crops.split(',').map((c: string) => c.trim());

      const suitability = cropsList.map((crop: string) => ({
        crop,
        ...getWeatherSuitabilityScore(weather, crop),
      }));

      res.json({ weather, suitability });
    } catch (error: any) {
      console.error('Error calculating suitability:', error);
      res
        .status(500)
        .json({ error: error.message || 'Failed to calculate suitability' });
    }
  }
);

export default router;
