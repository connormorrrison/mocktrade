// src/services/auth.ts

const API_URL = 'http://localhost:8000/api/v1'

interface LoginCredentials {
  email: string
  password: string
}

interface LoginResponse {
  access_token: string
  token_type: string
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username: credentials.email,
        password: credentials.password,
      }),
    })

    if (!response.ok) {
      throw new Error('Login failed')
    }

    return response.json()
  },

  async getCurrentUser(token: string) {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get user data')
    }

    return response.json()
  }
}