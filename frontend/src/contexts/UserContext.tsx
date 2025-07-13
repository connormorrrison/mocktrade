import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback
} from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

interface UserData {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_image_url?: string;
  created_at: string;
}

interface UserContextType {
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
  refreshUserData: () => Promise<void>;
  logout: () => void;
  login: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
  isInitialized: boolean;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();

  // ----- refreshUserData -----
  const refreshUserData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUserData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Not authenticated');
      }

      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('token');
      setUserData(null);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // ----- login -----
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Clear existing user data and token first
      localStorage.removeItem('token');
      setUserData(null);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password })
      });

      if (!response.ok) throw new Error('Login failed');
      
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      
      // Fetch user data
      const userResponse = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${data.access_token}`
        }
      });

      if (!userResponse.ok) throw new Error('Failed to fetch user data');
      
      const userData = await userResponse.json();
      setUserData(userData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setUserData(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // ----- logout -----
  const logout = useCallback(() => {
    setIsLoading(true);
    localStorage.removeItem('token');
    setUserData(null);
    setIsLoading(false);
    navigate('/login');
  }, [navigate]);

  // ----- Initial load -----
  useEffect(() => {
    const initializeAuth = async () => {
      await refreshUserData();
      setIsInitialized(true);
    };
    
    initializeAuth();
  }, [refreshUserData]);

  const value: UserContextType = {
    userData,
    setUserData,
    refreshUserData,
    logout,
    login,
    isLoading,
    isInitialized
  };

  // Don't render anything until we've completed our initial auth check
  if (!isInitialized) {
    return <div className="w-full h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>;
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};