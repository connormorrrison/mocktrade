import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef
} from 'react';
import { useNavigate } from 'react-router-dom';

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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Keep track of the current token to detect changes
  const currentTokenRef = useRef<string | null>(localStorage.getItem('token'));

  // Token change listener
  const handleTokenChange = useCallback((newToken: string | null) => {
    if (newToken !== currentTokenRef.current) {
      currentTokenRef.current = newToken;
      if (newToken) {
        refreshUserData();
      } else {
        setUserData(null);
      }
    }
  }, []);

  const refreshUserData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUserData(null);
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/me', {
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
      handleTokenChange(null);
      setUserData(null);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  }, [navigate, handleTokenChange]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    handleTokenChange(null);
    setUserData(null);
    navigate('/login');
  }, [navigate, handleTokenChange]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      handleTokenChange(data.access_token);
      
      // Navigate after successful data fetch to ensure UI consistency
      await refreshUserData();
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Allow the component to handle the error
    } finally {
      setIsLoading(false);
    }
  }, [navigate, handleTokenChange, refreshUserData]);

  // Monitor token changes in localStorage
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token');
      handleTokenChange(token);
    };

    // Check for token changes periodically
    const intervalId = setInterval(checkToken, 1000);

    // Initial check
    checkToken();

    return () => clearInterval(intervalId);
  }, [handleTokenChange]);

  const value: UserContextType = {
    userData,
    setUserData,
    refreshUserData,
    logout,
    login,
    isLoading
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};