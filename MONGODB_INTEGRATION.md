# MongoDB Integration Guide for AI Kisan Salahkar

## Current Setup
- ✅ Login: Email + Password (localStorage)
- ✅ User Data: localStorage
- ✅ Preferences: localStorage

## MongoDB Integration Steps

### 1. Install MongoDB Package
```bash
npm install mongodb dotenv
```

### 2. Add MongoDB Connection String to .env
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kisan_db?retryWrites=true&w=majority
```

### 3. Create MongoDB Helper (src/utils/mongodb.ts)
```typescript
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!);

export async function connectDB() {
  if (!client.isConnected()) {
    await client.connect();
  }
  return client.db('kisan_db');
}

export async function getUsers(db) {
  const collection = db.collection('users');
  return collection;
}

export async function getProfiles(db) {
  const collection = db.collection('profiles');
  return collection;
}
```

### 4. Update Authentication Hook (src/hooks/use-auth.tsx)
Replace localStorage calls with MongoDB:

```typescript
import { connectDB, getUsers } from '@/utils/mongodb';

// In handleSubmit function:
const db = await connectDB();
const users = await getUsers(db);

if (isSignup) {
  const userExists = await users.findOne({ email: email.trim() });
  if (userExists) {
    // Handle existing user
  }
  
  const newUser = {
    email: email.trim(),
    password, // Hash this with bcrypt in production!
    language: selectedLanguage,
    location: preferences?.location,
    createdAt: new Date(),
  };
  
  const result = await users.insertOne(newUser);
  localStorage.setItem('kisan_user_id', result.insertedId.toString());
  localStorage.setItem('kisan_email', newUser.email);
} else {
  const user = await users.findOne({ 
    email: email.trim(), 
    password 
  });
  if (!user) {
    // Handle invalid credentials
  }
  localStorage.setItem('kisan_user_id', user._id.toString());
  localStorage.setItem('kisan_email', user.email);
}
```

### 5. Update Profile Hook (src/hooks/use-profile.tsx)
```typescript
import { connectDB, getProfiles } from '@/utils/mongodb';

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const db = await connectDB();
      const profiles = await getProfiles(db);
      const profile = await profiles.findOne({ user_id: user!.id });
      return profile || { 
        id: user!.id, 
        user_id: user!.id, 
        name: '', 
        // ... other fields
      };
    },
    enabled: !!user,
  });
}
```

### 6. MongoDB Collections Schema

**users collection:**
```javascript
{
  _id: ObjectId,
  email: String,
  password: String, // Should be hashed with bcrypt
  language: String,
  location: String,
  createdAt: Date
}
```

**profiles collection:**
```javascript
{
  _id: ObjectId,
  user_id: String,
  name: String,
  village: String,
  district: String,
  state: String,
  land_size: Number,
  land_unit: String,
  main_crops: Array,
  language: String
}
```

**experiments collection:**
```javascript
{
  _id: ObjectId,
  user_id: String,
  crop: String,
  season: String,
  sowing_date: Date,
  status: String,
  plot_size: Number,
  method_a: String,
  method_b: String,
  createdAt: Date
}
```

## Production Checklist

- ⚠️ **Hash passwords** using bcrypt before storing
- ⚠️ **Use MongoDB Atlas** (cloud) for production
- ⚠️ **Set up API routes** instead of client-side MongoDB calls
- ⚠️ **Add authentication middleware** to protect API endpoints
- ⚠️ **Use environment variables** for sensitive data
- ⚠️ **Add data validation** on all inputs
- ⚠️ **Implement rate limiting** on API endpoints

## Quick Start with MongoDB Atlas

1. Go to [mongodb.com/products/platform/atlas](https://mongodb.com)
2. Create free account
3. Create cluster
4. Get connection string
5. Add to .env file
6. Done!

## For Backend Integration

See: [src/routes](./src/routes) for API route examples after server setup
