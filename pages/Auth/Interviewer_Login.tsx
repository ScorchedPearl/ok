import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Eye, EyeOff, Users, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useAuth } from '@/context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SparklesCore } from "@/components/ui/sparkles"

export default function InterviewerLoginPage() {
  
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {      
        await login('tenant-realm', email, password)
        const from = (location.state)?.from?.pathname || '/job/interviewer/interview'
        navigate(from, { replace: true })
      
    } catch (err) {
      setError('Invalid credentials. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleLoginForm = () => {
    
    setEmail('')
    setPassword('')
    setError('')
  }

  return (
    <div className="min-h-screen flex relative">
      {/* Company Logo */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-8 left-8 z-20 flex items-center space-x-2"
      >
        <span className="text-3xl font-bold text-white flex items-center gap-2">
          <span>✴</span>Screenera
        </span>
      </motion.div>

      {/* Left Section with Background Image and Text */}
      <div className="hidden lg:flex w-1/2 relative bg-[#2E2883] items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/api/placeholder/1200/800"
            alt="Background" 
            className="w-full h-full object-cover opacity-10 scale-105 hover:scale-110 transition-transform duration-700"
          />
          {/* Animated Gradient Overlay */}
          <motion.div 
            animate={{
              background: [
                "linear-gradient(to br, rgba(46,40,131,0.9), rgba(26,22,72,0.95))",
                "linear-gradient(to br, rgba(46,40,131,0.95), rgba(26,22,72,0.9))",
                "linear-gradient(to br, rgba(46,40,131,0.9), rgba(26,22,72,0.95))"
              ]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute inset-0"
          />
          
          {/* Sparkles Effect */}
          <SparklesCore
            background="transparent"
            minSize={0.3}
            maxSize={1.0}
            particleDensity={80}
            className="absolute top-0 left-0 w-full h-full"
            particleColor="#ffffff"
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-white text-center px-12 max-w-2xl"
        >
          <div className="flex justify-center mb-6"></div>
          <h1 className="text-6xl font-bold leading-tight mb-6 tracking-tight">
            Skills tests to hire the best with{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-200 relative inline-block">
              AI Precision
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-lg"
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
            </span>
          </h1>
          <p className="text-xl text-gray-200 leading-relaxed">
            Transform your hiring process with data-driven insights and AI-powered assessments
          </p>
        </motion.div>
      </div>

      {/* Right Section with Login Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="bg-[#2E2883]/10 p-4 rounded-2xl inline-block mx-auto"
            >
              
                <Users className="w-12 h-12 text-[#2E2883]" />
             
            </motion.div>

            <div className="space-y-2">
              <motion.h1
                key={"admin"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold text-gray-900"
              >
                Interviewer Login
              </motion.h1>
              <p className="text-lg text-gray-500">
                Please enter your credentials to access your account
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={ "admin-form"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium text-gray-700">
                  Email address
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder={"employer@screenera.ai"} 
                  required 
                  className="h-14 text-lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="h-14 pr-10 text-lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                  </motion.button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Alert variant="destructive" className="rounded-lg">
                      <AlertDescription className="text-base">{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" className="h-5 w-5" />
                  <Label htmlFor="remember" className="text-base text-gray-600">
                    Keep me logged in
                  </Label>
                </div>
                <motion.button 
                  type="button" 
                  whileHover={{ scale: 1.05 }}
                  className="text-base text-[#2E2883] hover:text-[#1a1648] font-medium transition-colors"
                >
                  <a href="/reset-password">Forgot password?</a>   
                </motion.button>
              </div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  type="submit"
                  className={cn(
                    "w-full h-14 text-lg font-medium text-white",
                    "bg-gradient-to-r from-[#2E2883] to-[#1a1648]",
                    "hover:from-[#2E2883]/90 hover:to-[#1a1648]/90",
                    "transition-all duration-300 shadow-lg hover:shadow-xl",
                    "rounded-lg relative overflow-hidden"
                  )}
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 0.5,
                    }}
                  />
                </Button>
              </motion.div>
              
              <div className="text-center pt-4 space-y-2">
                <p className="text-gray-600 font-medium">Not a Interviewer?</p>
                <div className="flex flex-col gap-2">
                  <motion.a
                    href="/login-candidate"
                    whileHover={{ scale: 1.05 }}
                    className="text-[#2E2883] font-medium hover:underline"
                  >
                    Click here to login as Candidate
                  </motion.a>
                  <motion.a
                    href="/login-partner"
                    whileHover={{ scale: 1.05 }}
                    className="text-[#2E2883] font-medium hover:underline"
                  >
                    Click here to login as Partner
                  </motion.a>
                  <motion.a
                    href="/login"
                    whileHover={{ scale: 1.05 }}
                    className="text-[#2E2883] font-medium hover:underline"
                  >
                    Click here to login as Tenant
                  </motion.a>
                </div>
              </div>
            </motion.form>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}