// API client for communicating with the backend server
function resolveApiUrl(): string {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();

  if (configuredUrl) {
    const cleanedUrl = configuredUrl.replace(/\/$/, '');

    try {
      const parsed = new URL(cleanedUrl);
      const path = parsed.pathname.replace(/\/$/, '');

      // If only origin is provided, default to API namespace used by the backend.
      if (path === '') {
        return `${cleanedUrl}/api`;
      }

      return cleanedUrl;
    } catch {
      // Non-absolute URLs (like /api) are treated as-is.
      return cleanedUrl;
    }
  }

  // In local development, keep using local backend by default.
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }

    console.warn('[API] Missing VITE_API_URL in production build; defaulting to same-origin /api');
    return `${window.location.origin}/api`;
  }

  return 'http://localhost:5000/api';
}

const API_URL = resolveApiUrl();
const API_REQUEST_TIMEOUT_MS = 70000;

function buildAlternateApiUrl(baseUrl: string): string {
  if (/\/api$/i.test(baseUrl)) {
    return baseUrl.replace(/\/api$/i, '');
  }
  return `${baseUrl}/api`;
}

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

  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const makeRequest = async (baseUrl: string) => {
    console.log(`[API] Making ${options.method || 'GET'} request to ${baseUrl}${normalizedEndpoint}`);

    // Avoid infinite loading state when network/proxy keeps the request pending.
    if (options.signal) {
      return fetch(`${baseUrl}${normalizedEndpoint}`, {
        ...options,
        headers,
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT_MS);

    try {
      return await fetch(`${baseUrl}${normalizedEndpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  };

  try {
    let response = await makeRequest(API_URL);

    console.log(`[API] Response status: ${response.status} for ${endpoint}`);

    if (!response.ok) {
      let errorMsg = 'API request failed';
      try {
        const error = await response.json();
        errorMsg = error.error || error.message || errorMsg;

        // Common production misconfiguration: API URL points to root/auth instead of /api.
        // Retry once with alternate base URL before failing the request.
        if (response.status === 404 && /route not found/i.test(errorMsg)) {
          const fallbackApiUrl = buildAlternateApiUrl(API_URL);
          if (fallbackApiUrl !== API_URL) {
            console.warn(`[API] 404 Route not found. Retrying with fallback base URL: ${fallbackApiUrl}`);
            response = await makeRequest(fallbackApiUrl);
            if (response.ok) {
              const fallbackData = await response.json();
              console.log(`[API] Success after fallback for ${normalizedEndpoint}:`, fallbackData);
              return fallbackData;
            }
          }
        }
      } catch {
        errorMsg = `HTTP ${response.status}: ${response.statusText}`;
      }
      console.error(`[API] Error for ${normalizedEndpoint}:`, errorMsg);
      throw new Error(errorMsg);
    }

    const data = await response.json();
    console.log(`[API] Success for ${normalizedEndpoint}:`, data);
    return data;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error('Request timed out. Server is taking too long to respond, please try again.');
    }

    if (error instanceof TypeError) {
      throw new Error(
        `Network error: unable to reach backend at ${API_URL}. ` +
          'Check VITE_API_URL and backend CORS settings.'
      );
    }
    console.error(`[API] Exception calling ${normalizedEndpoint}:`, error);
    throw error;
  }
}

// Auth API calls
export const authAPI = {
  signup: async (email: string, password: string, language: string, location: string, latitude?: number, longitude?: number) => {
    const request = () => apiCall<{
      token: string;
      user: { id: string; email: string; language: string; location: string };
    }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, language, location, latitude, longitude }),
    });

    let response;
    try {
      response = await request();
    } catch (error: any) {
      if (/timed out/i.test(error?.message || '')) {
        // Render free instances may need one extra attempt after cold start.
        response = await request();
      } else {
        throw error;
      }
    }

    setAuthToken(response.token);
    return response;
  },

  login: async (email: string, password: string) => {
    const request = () => apiCall<{
      token: string;
      user: { id: string; email: string; language: string; location: string };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    let response;
    try {
      response = await request();
    } catch (error: any) {
      if (/timed out/i.test(error?.message || '')) {
        // Render free instances may need one extra attempt after cold start.
        response = await request();
      } else {
        throw error;
      }
    }

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
