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
  const navigate = useNavigate()
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
      localStorage.setItem('token', data.access_token)
      navigate('/dashboard')
    } catch (error) {
      setError('Invalid email or password. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex w-full min-h-screen bg-gray-50 overflow-hidden">
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <main className="flex-1 bg-gray-50 w-full flex items-center justify-center mt-8">
          <div className="w-full max-w-md">
            <Card className="shadow-xl">
              <CardHeader className="pt-2 pb-2">
                <div className="flex flex-col items-center">
                  <img
                    src={mockTradeLogo}
                    alt="MockTrade"
                    className="h-28 w-auto"
                  />
                  <p className="text-center -mt-4 mb-2 text-gray-600 text-base">
                    Develop trading skills and test market strategies, risk-free, only on MockTrade.
                  </p>
                </div>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                {error && (
                  <Alert variant="destructive" className="text-center mb-4 mt-2">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-base font-medium text-gray-700">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
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
                      <label htmlFor="password" className="text-base font-medium text-gray-700">
                        Password
                      </label>
                      <span
                        onClick={() => alert('Reset password functionality')}
                        className="text-base text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        Forgot password?
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
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
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-base"
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
              <CardFooter className="flex justify-center pb-8 text-base text-gray-600">
                <span>Don't have an account?</span>
                <span
                  onClick={() => navigate('/register')}
                  className="ml-2 text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  Sign up
                </span>
              </CardFooter>
            </Card>
          </div>
        </main>

        <footer className="w-full py-4 text-center text-base text-gray-600 bg-gray-50">
          © 2025 MockTrade
        </footer>
      </div>
    </div>
  )
}