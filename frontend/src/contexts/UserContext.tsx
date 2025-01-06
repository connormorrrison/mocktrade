// src/contexts/UserContext.tsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const navigate = useNavigate();

  // Memoize refreshUserData to prevent unnecessary recreations
  const refreshUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUserData(null);
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:8000/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Not authenticated');
      }

      const data = await response.json();
      setUserData(data);
    } catch (error) {
      localStorage.removeItem('token');
      setUserData(null);
      navigate('/login');
    }
  }, [navigate]);

  // Initial data fetch - only run once on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !userData) {
      refreshUserData();
    }
  }, [refreshUserData]);

  const value = {
    userData,
    setUserData,
    refreshUserData
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