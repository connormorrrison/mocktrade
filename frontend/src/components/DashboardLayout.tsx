// src/components/DashboardLayout.tsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  PieChart, 
  ArrowRightLeft, 
  FileText, 
  LogOut, 
  User,
  ChevronDown 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useUser } from '../contexts/UserContext';
import mockTradeLogo from '../assets/MockTrade-logo-v1-size1.001.png';
import Profile from '@/components/Profile';


const menuItems = [
  {
    title: "Home",
    icon: Home,
    path: '/home',
    className: 'font-normal'
  },
  {
    title: "Portfolio",
    icon: PieChart,
    path: '/portfolio',
    className: 'font-normal'
  },
  {
    title: "Trade",
    icon: ArrowRightLeft,
    path: '/trade',
    className: 'font-normal'
  },
  {
    title: "Transactions",
    icon: FileText,
    path: '/transactions',
    className: 'font-normal'
  },
  {
    title: "Profile",
    icon: User,
    path: '/profile',
    className: 'font-normal'
  }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { userData, refreshUserData } = useUser();
  
    // Add useEffect for initial data fetch
    useEffect(() => {
      console.log('DashboardLayout: Component mounted');
      const fetchData = async () => {
        console.log('DashboardLayout: Fetching user data');
        try {
          await refreshUserData();
        } catch (error) {
          console.error('DashboardLayout: Error fetching user data:', error);
        }
      };
      fetchData();
    }, []);
  
    useEffect(() => {
      console.log('DashboardLayout: userData changed:', !!userData);
    }, [userData]);
  
    const handleLogout = () => {
      localStorage.removeItem('token');
      navigate('/login');
    };
  
    // Add loading state
    if (!userData) {
      console.log('DashboardLayout: No userData, showing loading state');
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl text-gray-500">Loading...</div>
        </div>
      );
    }
  
    // ... rest of your render code stays the same ...

  console.log('DashboardLayout: Rendering layout with userData');
  return (
    <div className="flex w-full min-h-screen bg-gray-50 overflow-hidden">
      <aside className="w-64 border-r bg-white flex flex-col fixed h-screen">
        <div className="p-4">
          <div className="flex flex-col items-center justify-center">
            <img 
              src={mockTradeLogo}
              alt="MockTrade" 
              className="h-30 w-auto" 
            />
          </div>
        </div>
        
        <nav className="flex-1 p-4">
          <div className="space-y-3">
            <p className="text-base font-medium text-gray-500 mb-2 px-2">Menu</p>
            {menuItems.map((item) => (
              <Button
                key={item.title}
                className={`w-full justify-start bg-white text-gray-700 text-base hover:bg-blue-100 hover:shadow-lg transition-shadow ${item.className} ${
                  location.pathname === item.path ? "bg-blue-100 font-medium" : ""
                }`}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
              </Button>
            ))}
          </div>
        </nav>
        
        <div className="border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full flex items-center justify-between">
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>{userData.first_name} {userData.last_name}</span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
  
      <div className="flex-1 flex flex-col min-h-screen ml-64 overflow-y-auto">
        <main className="flex-1 bg-gray-50 w-full p-8">
          {children}
        </main>
  
        <Profile />

        <footer className="w-full py-4 text-center text-base text-gray-500 bg-gray-50">
          © 2025 MockTrade
        </footer>
      </div>
    </div>
  );
}