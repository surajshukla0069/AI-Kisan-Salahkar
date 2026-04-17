import { authAPI } from "@/lib/api.js";

// Global reference for auth functions
let globalAuthContext: any = null;

export function setGlobalAuthContext(context: any) {
  globalAuthContext = context;
}

export async function signUp(email: string, password: string) {
  try {
    console.log('Starting signup for:', email);
    const response = await authAPI.signup(email, password, 'en', 'Unknown');
    console.log('Signup API response:', response);
    
    // Update context if available
    if (globalAuthContext) {
      console.log('Updating global auth context with user:', response.user);
      globalAuthContext.setUser({ id: response.user.id, email: response.user.email });
    } else {
      console.warn('globalAuthContext not available');
    }
    return response.user;
  } catch (error: any) {
    console.error('Signup error:', error);
    throw new Error(error.message || 'Sign up failed');
  }
}

export async function signIn(email: string, password: string) {
  try {
    console.log('Starting login for:', email);
    const response = await authAPI.login(email, password);
    console.log('Login API response:', response);
    
    // Update context if available
    if (globalAuthContext) {
      console.log('Updating global auth context with user:', response.user);
      globalAuthContext.setUser({ id: response.user.id, email: response.user.email });
    } else {
      console.warn('globalAuthContext not available');
    }
    return response.user;
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.message || 'Sign in failed');
  }
}

export function signOut() {
  localStorage.removeItem('kisan_auth_token');
  localStorage.removeItem('kisan_user_id');
  localStorage.removeItem('kisan_email');
  authAPI.logout();
  window.location.href = '/login';
}
