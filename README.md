# 🌾 AI Kisan Salahkar - Smart Farmer Advisor

An intelligent agricultural advisory platform designed for Indian farmers, providing multilingual support, experiment tracking, and location-based recommendations.

## 🎯 Project Overview

**AI Kisan Salahkar** (AI Smart Farmer Advisor) helps farmers:
- 🌐 Choose their preferred language (English, Hindi, Punjabi, Marathi)
- 📍 Get location-based agricultural advice
- 🧪 Run farming experiments comparing different methods
- 📊 Track harvest data and calculate profits
- 🌾 Get crop, fertilizer, and water management recommendations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (free tier on Atlas)
- npm or bun

### Installation & Running

```bash
# 1. Clone the repository
git clone <repo-url>
cd building-blocks-main

# 2. Install frontend dependencies
npm install

# 3. Set up backend
cd server
npm install

# 4. Create backend .env file
cp .env.example .env
# Edit .env with your MongoDB connection string

# 5. Start both services (in separate terminals)

# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd server && npm run dev
```

**Frontend**: http://localhost:8080  
**Backend**: http://localhost:5000

## 📋 Features

### 🔐 Authentication
- Email/password registration and login
- JWT-based sessions
- Secure password hashing with bcrypt

### 🗣️ Multilingual UI
- English, Hindi (हिंदी), Punjabi (ਪੰਜਾਬੀ), Marathi (मराठी)
- Language selection on first login
- All UI strings translated

### 👤 User Profiles
- Store farming information
- Land details (size, type)
- Crop preferences
- Customizable preferences

### 📍 Location Intelligence
- Automatic location detection
- Manual location input
- Location-specific recommendations

### 🧪 Experiment Tracking
- Create farming experiments
- Compare two different methods
- Track progress over time
- Record harvest data
- Calculate profit margins
- View detailed results

### 🌾 Crop Recommendations
Personalized guidance for:
- **Crop Varieties**: Best-suited varieties for your region
- **Fertilizers**: Recommended types, quantities, and application timing
- **Pesticides**: Target pests, application methods, safety periods
- **Watering**: Irrigation schedules and water requirements
- **Yield Estimates**: Expected harvest and profit margins

Supported crops: Wheat, Rice, Cotton, Sugarcane, Corn, Soybean, Chickpea, and more

### 📱 Mobile-Friendly
- Responsive design
- Works on all screen sizes
- Touch-optimized interface

## 🏗️ Architecture

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Routing**: TanStack Router
- **State Management**: React Context + React Query
- **Styling**: Tailwind CSS + Radix UI components
- **UI Components**: 30+ pre-built components

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB (Atlas or local)
- **Authentication**: JWT tokens
- **Security**: bcryptjs for password hashing

### Database Schema
- **Users**: Authentication & preferences
- **Profiles**: Farmer information
- **Experiments**: Tracking experiments & results
- **Recommendations**: Cached crop recommendations

## 📁 Project Structure

```
building-blocks-main/
├── src/
│   ├── components/           # React components
│   │   ├── ExperimentForm.tsx
│   │   ├── ExperimentCard.tsx
│   │   └── ui/              # UI library components
│   ├── hooks/
│   │   ├── use-auth.tsx      # Authentication context
│   │   ├── use-user-preferences.tsx
│   │   └── use-profile.tsx
│   ├── lib/
│   │   ├── api.ts           # API client
│   │   ├── translations.ts  # 4-language strings
│   │   └── utils.ts
│   ├── routes/              # Page components
│   │   ├── login.tsx
│   │   ├── index.tsx        # Home
│   │   ├── experiments.index.tsx
│   │   └── ...
│   └── styles.css
├── server/
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   │   ├── auth.ts
│   │   │   ├── profiles.ts
│   │   │   ├── experiments.ts
│   │   │   └── recommendations.ts
│   │   ├── db.ts            # MongoDB connection
│   │   ├── auth.ts          # JWT & middleware
│   │   └── index.ts         # Express app
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── BACKEND_SETUP.md         # Backend guide
├── MONGODB_INTEGRATION.md   # MongoDB guide
├── package.json
└── .env
```

## 🔌 API Endpoints

All endpoints require authentication except `/api/auth/signup` and `/api/auth/login`.

### Authentication
- `POST /api/auth/signup` - Register new account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/preferences` - Update preferences

### Profiles
- `GET /api/profiles` - Get user profile
- `PUT /api/profiles` - Update profile

### Experiments
- `GET /api/experiments` - List experiments
- `POST /api/experiments` - Create experiment
- `GET /api/experiments/:id` - Get details
- `PUT /api/experiments/:id` - Update experiment
- `POST /api/experiments/:id/harvest` - Record harvest
- `DELETE /api/experiments/:id` - Delete experiment

### Recommendations
- `GET /api/recommendations/:crop/:state/:district` - Get crop recommendations
- `GET /api/recommendations` - List user recommendations

See `server/README.md` for detailed API documentation.

## 🗄️ MongoDB Collections

### users
```javascript
{
  email: String (unique),
  password: String (hashed),
  language: String,
  location: String,
  latitude: Number,
  longitude: Number,
  createdAt: Date
}
```

### profiles
```javascript
{
  user_id: String (unique),
  name: String,
  village: String,
  district: String,
  state: String,
  land_size: Number,
  land_unit: String,
  main_crops: [String],
  createdAt: Date
}
```

### experiments
```javascript
{
  user_id: String,
  crop: String,
  season: String,
  sowing_date: Date,
  status: String (active|completed|cancelled),
  plot_size: Number,
  method_a: String,
  method_b: String,
  harvest_date: Date,
  profit_a: Number,
  profit_b: Number,
  createdAt: Date
}
```

### recommendations
```javascript
{
  user_id: String,
  crop: String,
  state: String,
  district: String,
  recommended_varieties: [String],
  fertilizer_recommendations: [Object],
  pesticide_recommendations: [Object],
  watering_schedule: [Object],
  expected_yield: String,
  profit_margin: String
}
```

## 🔑 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

### Backend (server/.env)
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/kisan_db
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:8080
```

## 📖 Documentation

- [Backend Setup Guide](./server/README.md)
- [Complete Setup Instructions](./BACKEND_SETUP.md)
- [MongoDB Integration](./MONGODB_INTEGRATION.md)

## 🌍 Translations

UI supports 4 languages with 160+ translation strings:
- 🇬🇧 English
- 🇮🇳 हिंदी (Hindi)
- 🇮🇳 ਪੰਜਾਬੀ (Punjabi)
- 🇮🇳 मराठी (Marathi)

Translation source: `src/lib/translations.ts`

## 🧪 Testing the App

### Test Flow
1. Open http://localhost:8080
2. Select language (Hindi for example)
3. Enter location (e.g., "Indore, MP")
4. Sign up with email: `farmer@test.com` / Password: `test123`
5. View home page with recommendation cards
6. Click "Experiments" → "New Experiment"
7. Create experiment comparing two farming methods
8. View experiment details and track progress

## 💡 Key Technologies

| Area | Technology |
|------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, MongoDB |
| Auth | JWT, bcryptjs |
| UI Components | Radix UI, Lucide Icons |
| Animations | Framer Motion |
| Notifications | Sonner toasts |
| Forms | React Hook Form, Zod |
| Data Fetching | Fetch API, React Query |

## 📊 Development Stats

- **Frontend**: ~800 lines of React components
- **Backend**: ~500 lines of Node.js/Express code
- **Database**: 5 MongoDB collections
- **Languages**: 4 supported languages
- **API Endpoints**: 20+ endpoints
- **UI Components**: 30+ reusable components

## 🚀 Production Deployment

### Frontend
```bash
npm run build
# Deploy dist/ folder to Vercel, Netlify, or any static host
```

### Backend
See `server/README.md` for deployment options:
- Heroku
- Railway (recommended)
- DigitalOcean
- AWS/Azure/GCP

## 📝 License

MIT License - See LICENSE file

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Open a pull request

## 🐛 Known Issues & Roadmap

### Current Limitations
- Weather API not yet integrated (placeholder recommendations)
- No real-time notifications
- No offline mode

### Roadmap
- [ ] Weather API integration
- [ ] Push notifications for seasonal alerts
- [ ] Export reports functionality
- [ ] Mobile app (React Native)
- [ ] Marketplace for agricultural products
- [ ] AI-powered pest detection via image analysis
- [ ] Market price tracking

## 📞 Support

For issues and questions:
1. Check documentation in README files
2. Review GitHub issues
3. Contact development team

## 👨‍💼 About

**AI Kisan Salahkar** is developed as a solution to help Indian farmers:
- Access agricultural knowledge in their native language
- Make data-driven farming decisions
- Improve crop yields through experimentation
- Reduce costs and increase profits

---

**🌾 Built with ❤️ for Indian Farmers**

Last Updated: April 2026  
Version: 1.0.0
