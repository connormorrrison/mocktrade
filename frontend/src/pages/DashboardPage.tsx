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
import { useUser } from '../contexts/UserContext';
import mockTradeLogo from '../assets/MockTrade-logo-v1-size1.001.png';
import TradePage from './TradePage';
import PortfolioPage from './PortfolioPage';
import TransactionPage from './TransactionPage';
import ProfilePage from './ProfilePage';
import Profile from '@/components/Profile';

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
  const { userData, refreshUserData } = useUser();
  const [currentPage, setCurrentPage] = useState('home');
  const [dow, setDow] = useState<number | null>(null);
  const [spx, setSpx] = useState<number | null>(null);
  const [nasdaq, setNasdaq] = useState<number | null>(null);
  const [isIndexLoading, setIsIndexLoading] = useState(false);
  const [indexError, setIndexError] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    
    refreshUserData();
  }, []);

  // Fetch indices on mount
  useEffect(() => {
    fetchIndexData();
  }, []);

  const fetchIndexData = async () => {
    setIsIndexLoading(true);
    setIndexError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in.');
      }

      const [dowResp, spxResp, nasdaqResp] = await Promise.all([
        fetch(`http://localhost:8000/api/v1/stocks/quote/^DJI`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:8000/api/v1/stocks/quote/^GSPC`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:8000/api/v1/stocks/quote/^IXIC`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!dowResp.ok) throw new Error('Failed to fetch DOW');
      if (!spxResp.ok) throw new Error('Failed to fetch S&P 500');
      if (!nasdaqResp.ok) throw new Error('Failed to fetch Nasdaq');

      const [dowData, spxData, nasdaqData] = await Promise.all([
        dowResp.json(),
        spxResp.json(),
        nasdaqResp.json()
      ]);

      if (!dowData.current_price || !spxData.current_price || !nasdaqData.current_price) {
        throw new Error('Missing or invalid price data in one of the responses');
      }

      setDow(dowData.current_price);
      setSpx(spxData.current_price);
      setNasdaq(nasdaqData.current_price);

    } catch (err: any) {
      console.error('Error fetching index data:', err);
      setIndexError(err.message || 'Error fetching indices');
    } finally {
      setIsIndexLoading(false);
    }
  };

  const formatMoney = (value: number | null, currency = 'USD') => {
    if (value === null) return 'Loading...';
    return `$${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)} ${currency}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (!userData) return <div></div>;

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
      return (
        <div className="flex flex-col justify-center items-center h-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
            <Card className="col-span-1 sm:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-4xl text-center font-normal text-blue-700 -mb-2 mt-2">
                  Welcome back, {userData.first_name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-center text-lg font-normal mb-2">
                  Today is {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Dow Jones Industrial Average</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-600 text-base font-medium mr-2 animate-pulse">Live</p>
                <p className="text-3xl font-normal">
                  {isIndexLoading ? 'Loading...' : formatMoney(dow)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">S&P 500</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-600 text-base font-medium mr-2 animate-pulse">Live</p>
                <p className="text-3xl font-normal">
                  {isIndexLoading ? 'Loading...' : formatMoney(spx)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Nasdaq Composite</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-600 text-base font-medium mr-2 animate-pulse">Live</p>
                <p className="text-3xl font-normal">
                  {isIndexLoading ? 'Loading...' : formatMoney(nasdaq)}
                </p>
              </CardContent>
            </Card>
          </div>

          {indexError && (
            <p className="text-red-600 mt-4">
              {indexError}
            </p>
          )}
        </div>
      );

      case 'trade':
        return <TradePage />;
      case 'portfolio':
        return <PortfolioPage />;
      case 'transactions':
        return <TransactionPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return null;
    }
  };

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
                className={`w-full justify-start bg-white text-gray-700 text-base hover:bg-blue-100 ${item.className} ${
                  currentPage === item.page ? "bg-blue-100 font-medium" : ""
                }`}
                onClick={() => setCurrentPage(item.page)}
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
          {renderContent()}
        </main>
  
        <Profile />

        <footer className="w-full py-4 text-center text-base text-gray-500 bg-gray-50">
          © 2025 MockTrade
        </footer>
      </div>
    </div>
  );
}