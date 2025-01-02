// src/pages/RegisterPage.tsx

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react"
import { useNavigate } from 'react-router-dom'
import mockTradeLogo from '../assets/MockTrade-logo-v1-size1.jpeg'

export default function RegisterPage() {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: ''
    })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      console.log('Attempting registration with:', formData)
      // Simulated delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      // We'll implement actual registration later
    } catch (error) {
      setError('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
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
                alt="MockTrade Logo"
                className="h-14 w-auto"
              />
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    //placeholder="Enter first name"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    //placeholder="Enter last name"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  //placeholder="Enter your email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Username
                </label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  //placeholder="Choose a username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    //placeholder="Create password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pr-10"
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  //placeholder="Confirm password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center pb-8 text-sm text-gray-600">
            <span>Already have an account?</span>
            <span
              onClick={() => navigate('/login')}
              className="ml-2 text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              Sign in
            </span>
          </CardFooter>
        </Card>
      </div>
      <div className="absolute bottom-0 left-0 w-full py-6 text-center text-sm text-gray-600">
        © 2025 MockTrade
      </div>
    </div>
  )
}