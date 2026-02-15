import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { PublicLayout } from "@/components/PublicLayout";
import { CustomError } from "@/components/CustomError";
import { CustomSkeleton } from "@/components/CustomSkeleton";
import { Text2 } from "@/components/Text2";
import { Text4 } from "@/components/Text4";
import { Text5 } from "@/components/Text5";
import { TextField } from "@/components/TextField";
import { Button1 } from "@/components/Button1";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const { refreshUserData } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (credential: string) => {
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        await refreshUserData();
        navigate('/home');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Google login failed.');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login: Starting login process');
    setError('');
    setIsLoading(true);
    
    try {
      console.log('Login: Calling auth API');
      
      // make API call to backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
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
        
        // verify the token was stored
        const storedToken = localStorage.getItem('access_token');
        console.log('Login: Verified stored token:', storedToken ? storedToken.substring(0, 20) + '...' : 'NO TOKEN FOUND');
        
        // refresh user data immediately after login
        console.log('Login: Refreshing user data...');
        await refreshUserData();
        
        console.log('Login: Navigating to /home');
        navigate('/home');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed.');
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
      <div className="h-screen flex items-center justify-center p-8">
        {isLoading ? (
          <CustomSkeleton />
        ) : (
          <div className="w-full max-w-3xl">
            <div className="text-center space-y-2 mb-8">
              <Text2>Login</Text2>
              <Text5>Log in to your MockTrade account</Text5>
            </div>

            <CustomError error={error} onClose={() => setError('')} />

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 items-center">
              {/* left pane — Google sign-in */}
              <div className="flex flex-col items-center justify-center space-y-6">
                <GoogleSignInButton onSuccess={handleGoogleSuccess} onStart={() => setIsLoading(true)} />
                <Text4>
                  Don't have an account?{" "}
                  <Link to="/signup" className="!text-blue-600 hover:!text-blue-700">
                    Sign Up
                  </Link>
                </Text4>
              </div>

              {/* divider */}
              <div className="md:hidden h-px w-full bg-zinc-700" />
              <div className="hidden md:block w-px self-stretch bg-zinc-700" />

              {/* right pane — email/password form */}
              <form onSubmit={handleLogin}>
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
                  <Button1
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    Log In
                  </Button1>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}