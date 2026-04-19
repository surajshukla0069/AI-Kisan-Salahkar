// API client for communicating with the backend server
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get token from localStorage
export function getAuthToken(): string | null {
  return localStorage.getItem('kisan_auth_token');
}

// Set token to localStorage
export function setAuthToken(token: string) {
  localStorage.setItem('kisan_auth_token', token);
}

// Clear token from localStorage
export function clearAuthToken() {
  localStorage.removeItem('kisan_auth_token');
}

// API request helper
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (options.headers && typeof options.headers === 'object') {
    Object.assign(headers, options.headers);
  }

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    console.log(`[API] Making ${options.method || 'GET'} request to ${API_URL}${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    console.log(`[API] Response status: ${response.status} for ${endpoint}`);

    if (!response.ok) {
      let errorMsg = 'API request failed';
      try {
        const error = await response.json();
        errorMsg = error.error || error.message || errorMsg;
      } catch {
        errorMsg = `HTTP ${response.status}: ${response.statusText}`;
      }
      console.error(`[API] Error for ${endpoint}:`, errorMsg);
      throw new Error(errorMsg);
    }

    const data = await response.json();
    console.log(`[API] Success for ${endpoint}:`, data);
    return data;
  } catch (error: any) {
    console.error(`[API] Exception calling ${endpoint}:`, error);
    throw error;
  }
}

// Auth API calls
export const authAPI = {
  signup: async (email: string, password: string, language: string, location: string, latitude?: number, longitude?: number) => {
    const response = await apiCall<{
      token: string;
      user: { id: string; email: string; language: string; location: string };
    }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, language, location, latitude, longitude }),
    });
    setAuthToken(response.token);
    return response;
  },

  login: async (email: string, password: string) => {
    const response = await apiCall<{
      token: string;
      user: { id: string; email: string; language: string; location: string };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(response.token);
    return response;
  },

  logout: () => {
    clearAuthToken();
  },

  getCurrentUser: async () => {
    return apiCall('/auth/me', { method: 'GET' });
  },

  updatePreferences: async (language?: string, location?: string, latitude?: number, longitude?: number) => {
    return apiCall('/auth/preferences', {
      method: 'PUT',
      body: JSON.stringify({ language, location, latitude, longitude }),
    });
  },
};

// Profile API calls
export const profileAPI = {
  getProfile: async () => {
    return apiCall('/profiles', { method: 'GET' });
  },

  updateProfile: async (profile: any) => {
    return apiCall('/profiles', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  },
};

// Experiments API calls
export const experimentsAPI = {
  list: async () => {
    return apiCall('/experiments', { method: 'GET' });
  },

  get: async (id: string) => {
    return apiCall(`/experiments/${id}`, { method: 'GET' });
  },

  create: async (experiment: any) => {
    return apiCall('/experiments', {
      method: 'POST',
      body: JSON.stringify(experiment),
    });
  },

  update: async (id: string, experiment: any) => {
    return apiCall(`/experiments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(experiment),
    });
  },

  recordHarvest: async (id: string, harvest: any) => {
    return apiCall(`/experiments/${id}/harvest`, {
      method: 'POST',
      body: JSON.stringify(harvest),
    });
  },

  delete: async (id: string) => {
    return apiCall(`/experiments/${id}`, { method: 'DELETE' });
  },
};

// Recommendations API calls
export const recommendationsAPI = {
  list: async () => {
    return apiCall('/recommendations', { method: 'GET' });
  },

  get: async (crop: string, state: string, district: string, season?: string) => {
    const query = season ? `?season=${season}` : '';
    return apiCall(`/recommendations/${crop}/${state}/${district}${query}`, {
      method: 'GET',
    });
  },

  save: async (recommendation: any) => {
    return apiCall('/recommendations', {
      method: 'POST',
      body: JSON.stringify(recommendation),
    });
  },
};
