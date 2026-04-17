# AI Kisan Salahkar - Backend Setup Guide

## Quick Start

### Prerequisites
- Node.js 18+ and npm/bun
- MongoDB (Atlas or local)
- Git

### 1. Clone and Navigate to Server
```bash
cd server
```

### 2. Install Dependencies
```bash
npm install
# or
bun install
```

### 3. Set Up Environment Variables

Create a `.env` file in the `server` directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kisan_db?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (change this in production!)
JWT_SECRET=your_super_secret_key_change_in_production

# Weather API (optional for future weather integration)
WEATHER_API_KEY=get_from_openweathermap_org
WEATHER_API_BASE_URL=https://api.openweathermap.org/data/2.5

# CORS
CORS_ORIGIN=http://localhost:8080
```

### 4. MongoDB Setup

**Option A: MongoDB Atlas (Recommended for Cloud)**
1. Go to [mongodb.com/cloud](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Get the connection string
5. Replace `username:password` with your credentials

**Option B: Local MongoDB**
```bash
# Install MongoDB Community Edition
# macOS: brew install mongodb-community
# Windows: Download from MongoDB.com
# Linux: apt-get install mongodb

# Start MongoDB
mongod
```

For local MongoDB, use: `mongodb://localhost:27017/kisan_db`

### 5. Start the Server

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

The server will run at: **http://localhost:5000**

## API Documentation

### Authentication Endpoints

**POST `/api/auth/signup`**
```json
{
  "email": "farmer@example.com",
  "password": "password123",
  "language": "en",
  "location": "Indore, MP"
}
```

**POST `/api/auth/login`**
```json
{
  "email": "farmer@example.com",
  "password": "password123"
}
```

**GET `/api/auth/me`** (Requires auth token)
Returns current user info

**PUT `/api/auth/preferences`** (Requires auth token)
```json
{
  "language": "hi",
  "location": "Indore, MP",
  "latitude": 22.7196,
  "longitude": 75.8577
}
```

### Profile Endpoints

**GET `/api/profiles`** (Requires auth token)
Get user's profile

**PUT `/api/profiles`** (Requires auth token)
```json
{
  "name": "Farmer Name",
  "village": "Indore",
  "district": "Indore",
  "state": "Madhya Pradesh",
  "land_size": 5,
  "land_unit": "acre",
  "main_crops": ["wheat", "rice"]
}
```

### Experiment Endpoints

**GET `/api/experiments`** (Requires auth token)
Get all experiments

**POST `/api/experiments`** (Requires auth token)
```json
{
  "crop": "wheat",
  "season": "rabi",
  "sowing_date": "2026-04-14",
  "plot_size": 5,
  "plot_unit": "acre",
  "method_a": "Traditional method",
  "method_b": "New high-yield technique"
}
```

**PUT `/api/experiments/:id`** (Requires auth token)
Update experiment details

**POST `/api/experiments/:id/harvest`** (Requires auth token)
```json
{
  "harvest_date": "2026-10-14",
  "harvest_amount_a": 50,
  "harvest_amount_b": 65,
  "profit_a": 25000,
  "profit_b": 35000
}
```

**DELETE `/api/experiments/:id`** (Requires auth token)
Delete experiment

### Recommendations Endpoints

**GET `/api/recommendations/:crop/:state/:district`** (Requires auth token)
Get crop-specific recommendations

Example: `/api/recommendations/wheat/Madhya%20Pradesh/Indore`

Returns:
```json
{
  "crop": "wheat",
  "state": "Madhya Pradesh",
  "district": "Indore",
  "recommended_varieties": ["PBW 723", "HD 3086"],
  "fertilizer_recommendations": [
    {
      "type": "Urea",
      "quantity": "100-120 kg/ha",
      "timing": "At sowing and 60 DAS"
    }
  ],
  "pesticide_recommendations": [...],
  "watering_schedule": [...],
  "expected_yield": "40-50 quintals/hectare",
  "profit_margin": "₹40,000-50,000/hectare"
}
```

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed with bcrypt),
  language: String (en|hi|pa|mr),
  location: String,
  latitude: Number,
  longitude: Number,
  createdAt: Date
}
```

### Profiles Collection
```javascript
{
  _id: ObjectId,
  user_id: String (unique),
  name: String,
  village: String,
  district: String,
  state: String,
  land_size: Number,
  land_unit: String,
  main_crops: Array,
  language: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Experiments Collection
```javascript
{
  _id: ObjectId,
  user_id: String,
  crop: String,
  season: String,
  sowing_date: Date,
  status: String (active|completed|cancelled),
  plot_size: Number,
  plot_unit: String,
  method_a: String,
  method_b: String,
  harvest_date: Date,
  harvest_amount_a: Number,
  harvest_amount_b: Number,
  profit_a: Number,
  profit_b: Number,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Recommendations Collection
```javascript
{
  _id: ObjectId,
  user_id: String,
  crop: String,
  state: String,
  district: String,
  recommended_varieties: Array,
  fertilizer_recommendations: Array,
  pesticide_recommendations: Array,
  watering_schedule: Array,
  expected_yield: String,
  profit_margin: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Deployment

### Heroku
```bash
heroku login
heroku create your-app-name
heroku config:set MONGODB_URI="your_mongodb_uri"
heroku config:set JWT_SECRET="your_secret"
git push heroku main
```

### Railway/Render
1. Push to GitHub
2. Connect repository
3. Set environment variables
4. Deploy

### Linux Server (VPS)
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone your-repo
cd server
npm install

# Run with PM2
npm install -g pm2
pm2 start src/index.ts --interpreter tsx
pm2 save
```

## Troubleshooting

**Connection refused on http://localhost:5000**
- Check if server is running: `npm run dev`
- Check CORS_ORIGIN in .env

**MongoDB connection error**
- Verify MONGODB_URI in .env
- Check MongoDB network access (Atlas)
- For Atlas: Add your IP to whitelist

**Token invalid/expired**
- Regenerate token by logging in again
- Check JWT_SECRET is same on server and client

**CORS errors**
- Update CORS_ORIGIN to match frontend URL
- Default: `http://localhost:8080`

## Production Checklist

- [ ] Use strong JWT_SECRET (change from default)
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS
- [ ] Set up MongoDB backups
- [ ] Add rate limiting
- [ ] Set up logging
- [ ] Enable MongoDB authentication
- [ ] Use connection pooling
- [ ] Set up monitoring/alerts
- [ ] Regular security updates

## Support

For issues, create an issue on GitHub or contact the development team.
