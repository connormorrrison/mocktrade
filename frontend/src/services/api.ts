// src/services/api.ts

const API_URL = 'http://localhost:8000/api/v1';  // Make sure this is exactly as shown

export const authApi = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username: email,  // backend expects 'username' field
        password: password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Login error:', errorData);
      throw new Error(errorData.detail || 'Login failed');
    }

    return response.json();
  },

  async register(userData: {
    email: string;
    username: string;
    password: string;
    first_name: string;
    last_name: string;
  }) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Registration error:', errorData);
      throw new Error(errorData.detail || 'Registration failed');
    }

    return response.json();
  },

  async getCurrentUser(token: string) {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Get user error:', errorData);
      throw new Error(errorData.detail || 'Failed to get user data');
    }

    return response.json();
  }
};

export default authApi;