import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react"
import { useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'
import mocktradeLogo from '../../../assets/mocktrade-logo.png'
import DynamicBackground from '../components/DynamicBackground'

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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const baseCardClass = "transform transition-all duration-500 ease-out";
  const hiddenCardClass = "opacity-0 translate-y-4 scale-95";
  const visibleCardClass = "opacity-100 translate-y-0 scale-100";

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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)
    try {
      const registrationData = {
        email: formData.email,
        username: formData.username,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName
      }

      await authApi.register(registrationData)
      const loginResponse = await authApi.login(formData.email, formData.password)
      localStorage.setItem('token', loginResponse.access_token)
      navigate('/dashboard')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DynamicBackground>
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 w-full flex items-center justify-center mt-8">
          <div className="w-full max-w-md">
          <Card className={`
            shadow-lg hover:shadow-xl backdrop-blur-sm bg-white/90
            ${baseCardClass}
            ${isVisible ? visibleCardClass : hiddenCardClass}
          `}>
              <CardHeader className="pt-2 pb-2 -mb-4">
                <div className="flex flex-col items-center">
                  <img
                    src={mocktradeLogo}
                    alt="MockTrade"
                    className="h-28 w-auto"
                  />
                </div>
              </CardHeader>

              <CardContent className="px-8 pb-8">
                {error && (
                  <Alert variant="destructive" className="text-center mb-4 mt-2">
                    <AlertDescription className="text-base">{error}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="text-base font-medium text-gray-700">
                        First Name*
                      </label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/50 backdrop-blur-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-base font-medium text-gray-700">
                        Last Name*
                      </label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/50 backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-base font-medium text-gray-700">
                      Email*
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/50 backdrop-blur-sm"
                      autoComplete="email"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="username" className="text-base font-medium text-gray-700">
                      Username*
                    </label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/50 backdrop-blur-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-base font-medium text-gray-700">
                      Password*
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full pr-10 bg-white/50 backdrop-blur-sm"
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                      >
                        {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-base font-medium text-gray-700">
                      Confirm Password*
                    </label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full pr-10 bg-white/50 backdrop-blur-sm"
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                      >
                        {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-base"
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
                  </div>
                </form>
              </CardContent>

              <CardFooter className="flex justify-center pb-8 text-base text-gray-500">
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
        </main>

        <footer className="w-full py-4 text-center text-base text-white/80 backdrop-blur-sm">
          © 2025 MockTrade
        </footer>
      </div>
    </DynamicBackground>
  )
}