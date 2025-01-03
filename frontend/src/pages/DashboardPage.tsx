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
import mockTradeLogo from '../assets/MockTrade-logo-v1-size1.001.png'

const menuItems = [
  {
    title: "Home",
    icon: Home,
    page: 'home'
  },
  {
    title: "Portfolio",
    icon: PieChart,
    page: 'portfolio'
  },
  {
    title: "Trade",
    icon: ArrowRightLeft,
    page: 'trade'
  },
  {
    title: "Transactions",
    icon: FileText,
    page: 'transactions'
  },
  {
    title: "Profile",
    icon: User,
    page: 'profile'
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-80 border-r bg-white flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-center">
            <img 
              src={mockTradeLogo}
              alt="MockTrade" 
              className="h-24 w-auto" 
            />
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500 mb-2 px-2">Menu</p>
            {menuItems.map((item) => (
              <Button
              key={item.title}
              className={`w-full justify-start bg-white text-gray-700 hover:bg-blue-100 ${
                currentPage === item.page ? "bg-white font-bold bg-blue-100" : ""
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
      <main className="flex-1 items-center justify-center p-12">
        <Card className="bg-white shadow-md flex flex-col justify-center items-center">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Welcome back, {userData.first_name}</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>The market is up today</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}