import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { ArrowLeft, Mail, Key, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useNavigate, useLocation } from 'react-router-dom'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SparklesCore } from "@/components/ui/sparkles"

export default function ForgotPasswordFlow() {
  const [stage, setStage] = useState("request") // request, validate, reset, success
  const [email, setEmail] = useState("")
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  const navigate = useNavigate()
  const location = useLocation()
  
  // Check for token in URL when component mounts
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tokenFromUrl = params.get('token')
    
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
      validateToken(tokenFromUrl)
    }
  }, [location])
  
  // Request password reset email
  const handleRequestReset = async (e:any) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      const response = await fetch('https://api.screenera.ai/api/api/auth-service/api/password/forgot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email')
      }
      
      setSuccess("Password reset email has been sent if the email exists in our system")
      
      // Give user time to read the success message before showing input for token
      setTimeout(() => {
        setStage("validate")
      }, 3000)
      
    } catch (err:any) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Validate token
  const validateToken = async (tokenToValidate:any) => {
    setIsLoading(true)
    setError("")
    
    try {
      const response = await fetch(`https://api.screenera.ai/api/api/auth-service/api/password/validate-token?token=${tokenToValidate}`)
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to validate token')
      }
      
      if (data.valid) {
        setStage("reset")
      } else {
        setError("Invalid or expired token. Please request a new password reset link.")
        setStage("request")
      }
      
    } catch (err:any) {
      setError(err.message || 'An error occurred. Please try again.')
      setStage("request")
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle token submission from manual input
  const handleTokenSubmit = (e:any) => {
    e.preventDefault()
    validateToken(token)
  }
  
  // Reset password
  const handleResetPassword = async (e:any) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }
    
    try {
      const response = await fetch('https://api.screenera.ai/api/api/auth-service/api/password/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
          confirmPassword
        }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to reset password')
      }
      
      setSuccess("Your password has been successfully reset!")
      setStage("success")
      
      // Redirect to login after showing success message
      setTimeout(() => {
        navigate('/login')
      }, 3000)
      
    } catch (err:any) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Render different forms based on stage
  const renderStageContent = () => {
    switch (stage) {
      case "request":
        return (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleRequestReset}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium text-gray-700">
                Email address
              </Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter your email address" 
                required 
                className="h-14 text-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                We'll send you a link to reset your password
              </p>
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
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending Email...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
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
            
            <div className="text-center pt-4">
              <motion.a
                href="/login"
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center text-[#2E2883] font-medium hover:underline"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Login
              </motion.a>
            </div>
          </motion.form>
        )
        
      case "validate":
        return (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleTokenSubmit}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="token" className="text-base font-medium text-gray-700">
                Reset Code
              </Label>
              <Input 
                id="token" 
                type="text" 
                placeholder="Enter the reset code from your email" 
                required 
                className="h-14 text-lg"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                Check your email for the password reset code
              </p>
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
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  "Verify Code"
                )}
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
              <p className="text-gray-600">Didn't receive the email?</p>
              <motion.button
                type="button"
                onClick={() => setStage("request")}
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center text-[#2E2883] font-medium hover:underline"
              >
                Try again
              </motion.button>
            </div>
          </motion.form>
        )
        
      case "reset":
        return (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleResetPassword}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-medium text-gray-700">
                New Password
              </Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Enter your new password" 
                required 
                className="h-14 text-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-base font-medium text-gray-700">
                Confirm New Password
              </Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                placeholder="Confirm your new password" 
                required 
                className="h-14 text-lg"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
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
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Resetting Password...
                  </span>
                ) : (
                  "Reset Password"
                )}
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
          </motion.form>
        )
        
      case "success":
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
            >
              <CheckCircle className="w-12 h-12 text-green-600" />
            </motion.div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Complete!</h3>
              <p className="text-gray-600">Your password has been successfully updated.</p>
            </div>
            
            <p className="text-sm text-gray-500">Redirecting to login page...</p>
            
            <motion.a
              href="/login"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={cn(
                "inline-block w-full h-14 text-lg font-medium text-white",
                "bg-gradient-to-r from-[#2E2883] to-[#1a1648]",
                "hover:from-[#2E2883]/90 hover:to-[#1a1648]/90",
                "transition-all duration-300 shadow-lg hover:shadow-xl",
                "rounded-lg flex items-center justify-center"
              )}
            >
              Return to Login
            </motion.a>
          </motion.div>
        )
        
      default:
        return null
    }
  }
  
  // Get title based on current stage
  const getStageTitle = () => {
    switch (stage) {
      case "request":
        return "Forgot Password"
      case "validate":
        return "Verify Reset Code"
      case "reset":
        return "Reset Password"
      case "success":
        return "Password Reset Complete"
      default:
        return "Forgot Password"
    }
  }
  
  // Get icon based on current stage
  const getStageIcon = () => {
    switch (stage) {
      case "request":
        return <Mail className="w-12 h-12 text-[#2E2883]" />
      case "validate":
        return <Key className="w-12 h-12 text-[#2E2883]" />
      case "reset":
        return <Key className="w-12 h-12 text-[#2E2883]" />
      case "success":
        return <CheckCircle className="w-12 h-12 text-[#2E2883]" />
      default:
        return <Mail className="w-12 h-12 text-[#2E2883]" />
    }
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
            Account recovery is{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-200 relative inline-block">
              just a few steps away
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
            We'll help you reset your password and get back to showcasing your skills
          </p>
        </motion.div>
      </div>

      {/* Right Section with Form */}
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
              <AnimatePresence mode="wait">
                <motion.div
                  key={stage}
                  initial={{ rotate: -180, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 180, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {getStageIcon()}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            <div className="space-y-2">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={stage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-bold text-gray-900"
                >
                  {getStageTitle()}
                </motion.h1>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                {stage === "request" && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-lg text-gray-500"
                  >
                    Enter your email to receive a password reset link
                  </motion.p>
                )}
                {stage === "validate" && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-lg text-gray-500"
                  >
                    Enter the reset code from your email
                  </motion.p>
                )}
                {stage === "reset" && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-lg text-gray-500"
                  >
                    Create a new password for your account
                  </motion.p>
                )}
              </AnimatePresence>
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
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <AlertDescription className="text-base">{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
            
            {success && stage !== "success" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert className="rounded-lg bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  <AlertDescription className="text-base text-green-800">{success}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {renderStageContent()}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}