// frontend/src/pages/LoginPage.tsx

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react"
import { useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'
import mockTradeLogo from '../assets/MockTrade-logo-v1-size1.001.png'

export default function LoginPage() {
  const navigate = useNavigate()  // Add this line
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const data = await authApi.login(email, password)
      // Store the token
      localStorage.setItem('token', data.access_token)
      // Navigate to dashboard (we'll create this later)
      navigate('/dashboard')
    } catch (error) {
      setError('Invalid email or password. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
        <Card className="shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex flex-col items-center">
              <img
                src={mockTradeLogo}
                alt="MockTrade"
                className="h-24 w-auto"
              />
              <p className="text-center -mt-2 text-gray-600 text-sm">
                Develop trading skills and test strategies, risk-free, only on MockTrade.
              </p>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  //placeholder="Enter your email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                  autoComplete="email"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <span
                    onClick={() => alert('Reset password functionality')}
                    className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    //placeholder="Enter your password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pr-10"
                    autoComplete="current-password"
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </span>
                </div>
              </div>
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center pb-8 text-sm text-gray-600">
            <span>Don't have an account?</span>
            <span
              onClick={() => navigate('/register')}  // Replace this line
              className="ml-2 text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              Sign up
            </span>
          </CardFooter>
        </Card>
      </div>
      {/* Absolutely positioned copyright */}
      <div className="absolute bottom-0 left-0 w-full py-4 text-center text-sm text-gray-600">
        © 2025 MockTrade
      </div>
    </div>
  )
}
