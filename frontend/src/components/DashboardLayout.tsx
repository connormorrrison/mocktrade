// src/components/DashboardLayout.tsx

import React from 'react';
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

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useUser();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!userData) return null;

  return (
    <div className="flex w-full min-h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white flex flex-col fixed h-screen">
        {/* Logo Section */}
        <div className="p-4">
          <div className="flex flex-col items-center justify-center">
            <img 
              src={mockTradeLogo}
              alt="MockTrade" 
              className="h-30 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/home')}
            />
          </div>
        </div>
        
        {/* Navigation Menu */}
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
        
        {/* User Menu */}
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
  
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen ml-64 overflow-y-auto">
        <main className="flex-1 bg-gray-50 w-full p-8">
          {children}
        </main>
  
        <Profile />

        {/* Footer */}
        <footer className="w-full py-4 text-center text-base text-gray-500 bg-gray-50">
          © 2025 MockTrade
        </footer>
      </div>
    </div>
  );
}