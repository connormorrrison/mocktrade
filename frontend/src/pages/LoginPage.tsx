import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { PublicLayout } from "@/components/public-layout";
import { AuthTile } from "@/components/auth-tile";
import { ErrorTile } from "@/components/error-tile";
import { Text2 } from "@/components/text-2";
import { Text4 } from "@/components/text-4";
import { Text5 } from "@/components/text-5";
import { TextField } from "@/components/text-field";
import { Button1 } from "@/components/button-1";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const { refreshUserData } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login: Starting login process');
    setError('');
    setIsLoading(true);
    
    try {
      console.log('Login: Calling auth API');
      
      // Make API call to backend
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login: Received response from auth API:', data);
        console.log('Login: Access token:', data.access_token);
        localStorage.setItem('access_token', data.access_token);
        console.log('Login: Token saved to localStorage');
        
        // Verify the token was stored
        const storedToken = localStorage.getItem('access_token');
        console.log('Login: Verified stored token:', storedToken ? storedToken.substring(0, 20) + '...' : 'NO TOKEN FOUND');
        
        // Refresh user data immediately after login
        console.log('Login: Refreshing user data...');
        await refreshUserData();
        
        console.log('Login: Navigating to /home');
        navigate('/home');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }
    } catch (error) {
      console.error('Login Error:', error);
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicLayout showAuthButtons={false}>
      <AuthTile>
        <form onSubmit={handleLogin}>
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Text2>Login</Text2>
              <Text5>Log in to your MockTrade account</Text5>
            </div>
            
            {error && (
              <ErrorTile description={error} className="mt-4" />
            )}
            
            <div className="space-y-4">
              <TextField 
                label="Email" 
                placeholder="Email" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
              <TextField 
                label="Password" 
                placeholder="Password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Button1 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Log In'}
            </Button1>
            
            <div className="text-center">
              <Text4>
                Don't have an account?{" "}
                <Link to="/signup" className="!text-blue-600 hover:!text-blue-700">
                  Sign Up
                </Link>
              </Text4>
            </div>
          </div>
        </form>
      </AuthTile>
    </PublicLayout>
  );
}