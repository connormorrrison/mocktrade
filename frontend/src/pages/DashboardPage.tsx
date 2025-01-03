// src/pages/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import mockTradeLogo from '../assets/MockTrade-logo-v1-size1.001.png';
import TradePage from './TradePage'; // Import the TradePage component

const menuItems = [
  {
    title: "Home",
    icon: Home,
    page: 'home',
    className: 'font-normal'
  },
  {
    title: "Portfolio",
    icon: PieChart,
    page: 'portfolio',
    className: 'font-normal'
  },
  {
    title: "Trade",
    icon: ArrowRightLeft,
    page: 'trade',
    className: 'font-normal'
  },
  {
    title: "Transactions",
    icon: FileText,
    page: 'transactions',
    className: 'font-normal'
  },
  {
    title: "Profile",
    icon: User,
    page: 'profile',
    className: 'font-normal'
  }
];

export default function DashboardPage() {
  const [userData, setUserData] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    fetch('http://localhost:8000/api/v1/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      if (!res.ok) throw new Error('Not authenticated');
      return res.json();
    })
    .then(data => setUserData(data))
    .catch(() => {
      localStorage.removeItem('token');
      window.location.href = '/login';
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (!userData) return <div>Loading...</div>;

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return (
          <Card className="bg-white shadow-md flex flex-col justify-center items-center">
            <CardHeader>
              <CardTitle className="text-4xl text-center font-normal">Welcome back, {userData.first_name}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p>The market is up today</p>
            </CardContent>
          </Card>
        );
      case 'trade':
        return <TradePage />;
      case 'portfolio':
        return <div>Portfolio content coming soon</div>;
      case 'transactions':
        return <div>Transactions content coming soon</div>;
      case 'profile':
        return <div>Profile content coming soon</div>;
      default:
        return null;
    }
  };

  return (
    <div className="relative flex w-full min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white flex flex-col">
        {/* Logo */}
        <div className="p-4">
          <div className="flex items-center justify-center">
            <img 
              src={mockTradeLogo}
              alt="MockTrade" 
              className="h-28 w-auto" 
            />
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-500 mb-2 px-2">Menu</p>
            {menuItems.map((item) => (
              <Button
                key={item.title}
                className={`w-full justify-start bg-white text-gray-700 hover:bg-blue-100 ${item.className} ${
                  currentPage === item.page ? "bg-white font-semibold bg-blue-100" : ""
                }`}
                onClick={() => setCurrentPage(item.page)}
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
      <main className="flex-1 bg-white w-full p-8 pb-20">
        {renderContent()}
      </main>

      {/* Absolutely positioned copyright */}
      <div className="absolute bottom-0 left-0 w-full py-4 text-center text-sm text-gray-600">
        © 2025 MockTrade
      </div>
    </div>
  );
}
