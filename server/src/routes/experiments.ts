import { Router, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../db.js';
import { authMiddleware, AuthRequest } from '../auth.js';

const router = Router();

interface Experiment {
  _id?: ObjectId;
  user_id: string;
  crop: string;
  season: string;
  sowing_date: Date;
  status: 'active' | 'completed' | 'cancelled';
  plot_size: number;
  plot_unit: string;
  method_a: string;
  method_b: string;
  method_a_details?: any;
  method_b_details?: any;
  harvest_date?: Date;
  harvest_amount_a?: number;
  harvest_amount_b?: number;
  profit_a?: number;
  profit_b?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Get all experiments for user
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const experimentsCollection = db.collection<Experiment>('experiments');

    const experiments = await experimentsCollection
      .find({ user_id: req.userId })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(experiments);
  } catch (error) {
    console.error('Error fetching experiments:', error);
    res.status(500).json({ error: 'Failed to fetch experiments' });
  }
});

// Get single experiment
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const experimentsCollection = db.collection<Experiment>('experiments');

    const experiment = await experimentsCollection.findOne({
      _id: new ObjectId(req.params.id),
      user_id: req.userId,
    });

    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }

    res.json(experiment);
  } catch (error) {
    console.error('Error fetching experiment:', error);
    res.status(500).json({ error: 'Failed to fetch experiment' });
  }
});

// Create experiment
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const {
      crop,
      season,
      sowing_date,
      plot_size,
      plot_unit,
      method_a,
      method_b,
      method_a_details,
      method_b_details,
      notes,
    } = req.body;

    if (!crop || !season || !sowing_date || !plot_size || !method_a || !method_b) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getDB();
    const experimentsCollection = db.collection<Experiment>('experiments');

    const experiment: Experiment = {
      user_id: req.userId!,
      crop,
      season,
      sowing_date: new Date(sowing_date),
      status: 'active',
      plot_size,
      plot_unit: plot_unit || 'acre',
      method_a,
      method_b,
      method_a_details: method_a_details || {},
      method_b_details: method_b_details || {},
      notes: notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await experimentsCollection.insertOne(experiment);

    res.status(201).json({ ...experiment, _id: result.insertedId });
  } catch (error) {
    console.error('Error creating experiment:', error);
    res.status(500).json({ error: 'Failed to create experiment' });
  }
});

// Update experiment
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const experimentsCollection = db.collection<Experiment>('experiments');

    const updateData = {
      ...req.body,
      updatedAt: new Date(),
    };

    if (req.body.sowing_date) {
      updateData.sowing_date = new Date(req.body.sowing_date);
    }

    if (req.body.harvest_date) {
      updateData.harvest_date = new Date(req.body.harvest_date);
    }

    const result = await experimentsCollection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id), user_id: req.userId },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: 'Experiment not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error updating experiment:', error);
    res.status(500).json({ error: 'Failed to update experiment' });
  }
});

// Update harvest data
router.post('/:id/harvest', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { harvest_date, harvest_amount_a, harvest_amount_b, profit_a, profit_b } = req.body;

    const db = getDB();
    const experimentsCollection = db.collection<Experiment>('experiments');

    const result = await experimentsCollection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id), user_id: req.userId },
      {
        $set: {
          status: 'completed',
          harvest_date: new Date(harvest_date),
          harvest_amount_a,
          harvest_amount_b,
          profit_a,
          profit_b,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: 'Experiment not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error updating harvest:', error);
    res.status(500).json({ error: 'Failed to update harvest data' });
  }
});

// Delete experiment
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const experimentsCollection = db.collection('experiments');

    const result = await experimentsCollection.deleteOne({
      _id: new ObjectId(req.params.id),
      user_id: req.userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Experiment not found' });
    }

    res.json({ message: 'Experiment deleted' });
  } catch (error) {
    console.error('Error deleting experiment:', error);
    res.status(500).json({ error: 'Failed to delete experiment' });
  }
});

export default router;
