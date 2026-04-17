import { Router, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../db.js';
import { authMiddleware, AuthRequest } from '../auth.js';
import axios from 'axios';

const router = Router();

interface Recommendation {
  _id?: ObjectId;
  user_id: string;
  location: string;
  state: string;
  district: string;
  crop: string;
  season: string;
  recommended_varieties: string[];
  fertilizer_recommendations: Array<{
    type: string;
    quantity: string;
    timing: string;
  }>;
  pesticide_recommendations: Array<{
    name: string;
    target_pests: string[];
    application_method: string;
    safety_period: string;
  }>;
  watering_schedule: Array<{
    stage: string;
    frequency: string;
    quantity: string;
  }>;
  expected_yield: string;
  profit_margin: string;
  weather_forecast?: any;
  soil_type?: string;
  ph_level?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Crop and fertilizer recommendation database
const cropRecommendations: Record<string, any> = {
  wheat: {
    varieties: ['PBW 723', 'HD 3086', 'DBW 187'],
    fertilizer: [
      { type: 'Urea', quantity: '100-120 kg/ha', timing: 'At sowing and 60 DAS' },
      { type: 'DAP', quantity: '60 kg/ha', timing: 'At sowing' },
      { type: 'MOP', quantity: '40 kg/ha', timing: 'At sowing' },
    ],
    pesticides: [
      { name: 'Propiconazole', target_pests: ['Leaf rust', 'Stripe rust'], application_method: 'Foliar spray', safety_period: '14 days' },
      { name: 'Chlorpyrifos', target_pests: ['Armyworm', 'Cutworm'], application_method: 'Soil application', safety_period: '21 days' },
    ],
    watering: [
      { stage: 'Crown root initiation', frequency: '1 irrigation', quantity: '5-6 cm' },
      { stage: 'Tillering', frequency: '1 irrigation', quantity: '5-6 cm' },
      { stage: 'Grain filling', frequency: '1 irrigation', quantity: '5-6 cm' },
    ],
    expected_yield: '40-50 quintals/hectare',
    profit_margin: '₹40,000-50,000/hectare',
  },
  rice: {
    varieties: ['Basmati 370', 'Pusa 1509', 'MTU 1010'],
    fertilizer: [
      { type: 'Urea', quantity: '80-100 kg/ha', timing: '3 splits: at planting, 40 DAS, 70 DAS' },
      { type: 'DAP', quantity: '50 kg/ha', timing: 'At planting' },
      { type: 'MOP', quantity: '40 kg/ha', timing: 'At planting' },
    ],
    pesticides: [
      { name: 'Carbofuran', target_pests: ['Stem borer', 'Gall midge'], application_method: 'Soil application', safety_period: '42 days' },
      { name: 'Tricyclazole', target_pests: ['Blast'], application_method: 'Foliar spray', safety_period: '14 days' },
    ],
    watering: [
      { stage: 'Nursery', frequency: 'Daily', quantity: 'Maintenance of 5 cm water' },
      { stage: 'Main field', frequency: 'Management', quantity: '5-7 cm standing water' },
    ],
    expected_yield: '45-55 quintals/hectare',
    profit_margin: '₹35,000-45,000/hectare',
  },
  cotton: {
    varieties: ['BT Cotton', 'H-4', 'MCU 5'],
    fertilizer: [
      { type: 'Urea', quantity: '120-150 kg/ha', timing: '3-4 splits' },
      { type: 'DAP', quantity: '60 kg/ha', timing: 'At sowing' },
      { type: 'MOP', quantity: '60 kg/ha', timing: 'At sowing' },
      { type: 'Magnesium sulfate', quantity: '25 kg/ha', timing: 'At 90 DAS' },
    ],
    pesticides: [
      { name: 'Spinosad', target_pests: ['Bollworm', 'Tuta absoluta'], application_method: 'Foliar spray', safety_period: '3 days' },
      { name: 'Chlorpyrifos', target_pests: ['Aphids', 'Whiteflies'], application_method: 'Foliar spray', safety_period: '21 days' },
    ],
    watering: [
      { stage: 'Vegetative', frequency: 'Every 7-10 days', quantity: '6-8 cm' },
      { stage: 'Fruiting', frequency: 'Every 7-10 days', quantity: '6-8 cm' },
    ],
    expected_yield: '15-20 quintals/hectare',
    profit_margin: '₹60,000-80,000/hectare',
  },
  sugarcane: {
    varieties: ['Co 0238', 'Co 9301', 'IS 97-74-52'],
    fertilizer: [
      { type: 'Urea', quantity: '150-180 kg/ha', timing: '4-5 splits' },
      { type: 'SSP', quantity: '100-150 kg/ha', timing: 'At sowing' },
      { type: 'MOP', quantity: '80-100 kg/ha', timing: 'At sowing' },
    ],
    pesticides: [
      { name: 'Fipronil', target_pests: ['Early shoot borer', 'Top shoot borer'], application_method: 'Soil drench', safety_period: '21 days' },
    ],
    watering: [
      { stage: 'Germination', frequency: 'Every 5-7 days', quantity: '5-6 cm' },
      { stage: 'Grand growth period', frequency: 'Every 7-10 days', quantity: '6-8 cm' },
    ],
    expected_yield: '350-400 quintals/hectare',
    profit_margin: '₹80,000-100,000/hectare',
  },
};

// Get recommendations for a crop and location
router.get('/:crop/:state/:district', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { crop, state, district } = req.params;
    const db = getDB();
    const recommendationsCollection = db.collection<Recommendation>('recommendations');

    // Check cache first
    const cached = await recommendationsCollection.findOne({
      user_id: req.userId,
      crop: crop.toLowerCase(),
      state,
      district,
    });

    if (cached && new Date().getTime() - cached.updatedAt.getTime() < 86400000) {
      // If cached data is less than 24 hours old
      return res.json(cached);
    }

    // Get crop recommendations from database
    const cropData = cropRecommendations[crop.toLowerCase()];
    if (!cropData) {
      return res.status(404).json({ error: 'Crop recommendations not found' });
    }

    const recommendation: Recommendation = {
      user_id: req.userId!,
      location: `${district}, ${state}`,
      state,
      district,
      crop: crop.toLowerCase(),
      season: req.query.season as string || 'kharif',
      recommended_varieties: cropData.varieties,
      fertilizer_recommendations: cropData.fertilizer,
      pesticide_recommendations: cropData.pesticides,
      watering_schedule: cropData.watering,
      expected_yield: cropData.expected_yield,
      profit_margin: cropData.profit_margin,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Try to get weather data
    try {
      const weatherRec = { ...recommendation };
      // In production, integrate with OpenWeatherMap API
      res.json(weatherRec);
    } catch (weatherError) {
      res.json(recommendation);
    }
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Get all recommendations for user
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const recommendationsCollection = db.collection<Recommendation>('recommendations');

    const recommendations = await recommendationsCollection
      .find({ user_id: req.userId })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Save recommendation for user
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const {
      crop,
      state,
      district,
      season,
      recommended_varieties,
      fertilizer_recommendations,
      pesticide_recommendations,
      watering_schedule,
      expected_yield,
      profit_margin,
    } = req.body;

    const db = getDB();
    const recommendationsCollection = db.collection<Recommendation>('recommendations');

    const recommendation: Recommendation = {
      user_id: req.userId!,
      location: `${district}, ${state}`,
      state,
      district,
      crop: crop.toLowerCase(),
      season,
      recommended_varieties,
      fertilizer_recommendations,
      pesticide_recommendations,
      watering_schedule,
      expected_yield,
      profit_margin,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await recommendationsCollection.insertOne(recommendation);

    res.status(201).json({ ...recommendation, _id: result.insertedId });
  } catch (error) {
    console.error('Error saving recommendation:', error);
    res.status(500).json({ error: 'Failed to save recommendation' });
  }
});

export default router;
