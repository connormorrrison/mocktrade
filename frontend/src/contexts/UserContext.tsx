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
  refreshUserData: () => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);

  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      console.log('UserContext: refreshUserData called, token exists:', !!token);
      if (!token) {
        console.log('UserContext: No token found, clearing user data');
        setUserData(null);
        return;
      }

      console.log('UserContext: Calling /auth/me endpoint');
      const response = await fetch('http://localhost:8000/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('UserContext: /auth/me response status:', response.status);
      if (response.ok) {
        const userData = await response.json();
        console.log('UserContext: Successfully fetched user data:', userData);
        setUserData({
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          username: userData.username,
          created_at: userData.created_at
        });
      } else {
        // Token is invalid, clear it
        console.log('UserContext: /auth/me failed, clearing token. Status:', response.status);
        const errorText = await response.text();
        console.log('UserContext: Error response:', errorText);
        localStorage.removeItem('access_token');
        setUserData(null);
      }
    } catch (error) {
      console.error('UserContext: Error fetching user data:', error);
      // Clear user data on error
      setUserData(null);
    }
  };

  const logout = () => {
    setUserData(null);
    // Clear any stored tokens/session data
    localStorage.removeItem('access_token');
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    // Navigate to landing page
    window.location.href = '/';
  };

  useEffect(() => {
    refreshUserData();
  }, []);

  return (
    <UserContext.Provider value={{ userData, refreshUserData, logout }}>
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