import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserData {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  created_at?: string;
}

interface UserContextType {
  userData: UserData | null;
  isLoading: boolean;
  refreshUserData: () => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUserData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUserData(null);
        setIsLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8000/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUserData({
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          username: userData.username,
          created_at: userData.created_at
        });
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('token');
        setUserData(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Clear user data on error
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUserData(null);
    // Clear any stored tokens/session data
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    // Navigate to landing page
    window.location.href = '/';
  };

  useEffect(() => {
    refreshUserData();
  }, []);

  return (
    <UserContext.Provider value={{ userData, isLoading, refreshUserData, logout }}>
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