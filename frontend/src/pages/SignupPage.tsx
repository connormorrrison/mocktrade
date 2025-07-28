import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicLayout } from "@/components/public-layout";
import { AuthTile } from "@/components/auth-tile";
import { ErrorTile } from "@/components/error-tile";
import { Text2 } from "@/components/text-2";
import { Text4 } from "@/components/text-4";
import { Text5 } from "@/components/text-5";
import { TextField } from "@/components/text-field";
import { Button1 } from "@/components/button-1";
import { Link } from "react-router-dom";

export default function SignupPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const registrationData = {
        email: formData.email,
        username: formData.username,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName
      };

      // Make API call to backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      // Auto-login after successful registration
      const loginResponse = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: formData.email,
          password: formData.password,
        }),
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        localStorage.setItem('access_token', loginData.access_token);
        navigate('/home');
      } else {
        navigate('/login');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicLayout showAuthButtons={false}>
      <AuthTile>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Text2>Sign Up</Text2>
              <Text5>Sign up for a MockTrade account</Text5>
            </div>
            
            {error && (
              <ErrorTile description={error} className="mt-4" />
            )}
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <TextField 
                  label="First Name" 
                  placeholder="First Name" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                <TextField 
                  label="Last Name" 
                  placeholder="Last Name" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
              <TextField 
                label="Email" 
                placeholder="Email" 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <TextField 
                label="Username" 
                placeholder="Username" 
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <TextField 
                label="Password" 
                placeholder="Password" 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <TextField 
                label="Confirm Password" 
                placeholder="Confirm Password" 
                type="password" 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            
            <Button1 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button1>
            
            <div className="text-center">
              <Text4>
                Already have an account?{" "}
                <Link to="/login" className="!text-blue-600 hover:!text-blue-700">
                  Login
                </Link>
              </Text4>
            </div>
          </div>
        </form>
      </AuthTile>
    </PublicLayout>
  );
}