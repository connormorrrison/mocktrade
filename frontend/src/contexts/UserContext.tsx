import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserData {
  first_name: string;
  last_name: string;
  email: string;
}

interface UserContextType {
  userData: UserData | null;
  refreshUserData: () => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);

  const refreshUserData = () => {
    // Mock user data for now
    setUserData({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com'
    });
  };

  const logout = () => {
    setUserData(null);
    // Clear any stored tokens/session data
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