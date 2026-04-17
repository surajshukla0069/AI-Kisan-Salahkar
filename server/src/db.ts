import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDB(): Promise<Db> {
  if (db) {
    return db;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  client = new MongoClient(mongoUri);
  await client.connect();
  db = client.db('kisan_db');
  
  console.log('✅ Connected to MongoDB');
  
  // Create collections if they don't exist
  await initializeCollections();
  
  return db;
}

async function initializeCollections() {
  if (!db) return;

  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map((c: any) => c.name);

  // Create collections if they don't exist
  if (!collectionNames.includes('users')) {
    await db.createCollection('users');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
  }

  if (!collectionNames.includes('profiles')) {
    await db.createCollection('profiles');
    await db.collection('profiles').createIndex({ user_id: 1 }, { unique: true });
  }

  if (!collectionNames.includes('experiments')) {
    await db.createCollection('experiments');
    await db.collection('experiments').createIndex({ user_id: 1 });
  }

  if (!collectionNames.includes('recommendations')) {
    await db.createCollection('recommendations');
    await db.collection('recommendations').createIndex({ user_id: 1 });
  }

  if (!collectionNames.includes('weather_cache')) {
    await db.createCollection('weather_cache');
    await db.collection('weather_cache').createIndex({ location_id: 1 });
    // Auto-expire weather cache after 6 hours
    await db.collection('weather_cache').createIndex({ createdAt: 1 }, { expireAfterSeconds: 21600 });
  }

  console.log('📚 Collections initialized');
}

export async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('🔌 Disconnected from MongoDB');
  }
}

export function getDB(): Db {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db;
}
