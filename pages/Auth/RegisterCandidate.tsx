import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Eye, EyeOff, User, ArrowLeft, Mail, Lock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useNavigate } from 'react-router-dom'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SparklesCore } from "@/components/ui/sparkles"
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'

type RegistrationStep = 'email' | 'otp' | 'details';

interface RegistrationResponse {
  userId: number;
  email: string;
  fullName: string;
  role: string;
  status: string;
  createdAt: string;
}

const AUTH_SERVICE_URL = import.meta.env.VITE_AUTH_SERVICE_URL;

export default function RegisterPageCandidate() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<RegistrationStep>('email')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    otp: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<RegistrationResponse | null>(null)
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleInitiateRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await axios.post(`${AUTH_SERVICE_URL}/candidate/initiate-registration`, {
        email: formData.email
      });
      
      toast.success(`OTP sent successfully to ${formData.email}!`, {
        duration: 4000,
        position: 'top-center',
      })
      
      setStep('otp')
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await axios.post(`${AUTH_SERVICE_URL}/candidate/verify-otp`, {
        email: formData.email,
        otp: formData.otp
      });

      if (response.data.verified) {
        toast.success('Email verified successfully!', {
          duration: 3000,
          position: 'top-center',
        })
        setStep('details')
      } else {
        throw new Error('Invalid OTP')
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'OTP verification failed. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await axios.post(`${AUTH_SERVICE_URL}/candidate/complete-registration`, {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName
      });

      setSuccess(response.data)
      
      toast.success('Registration completed successfully!', {
        duration: 3000,
        position: 'top-center',
        icon: '🎉',
      })
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login-candidate')
      }, 2000)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred during registration. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setIsLoading(true)
    setError('')

    try {
      await axios.post(`${AUTH_SERVICE_URL}/candidate/resend-otp`, {
        email: formData.email
      });
      
      toast.success('OTP resent successfully!', {
        duration: 3000,
        position: 'top-center',
      })
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to resend OTP. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex relative">
      <Toaster />
      
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
            {step === 'email' && "Join our talent platform"}
            {step === 'otp' && "Verify your email"}
            {step === 'details' && "Complete your profile"}
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-200 relative inline-block">
              {step === 'email' && "one simple step"}
              {step === 'otp' && "secure access"}
              {step === 'details' && "final touches"}
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
            {step === 'email' && "Start your journey by providing your email address"}
            {step === 'otp' && "Enter the verification code sent to your email"}
            {step === 'details' && "Provide your details to complete registration"}
          </p>
        </motion.div>
      </div>

      {/* Right Section with Registration Form */}
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
              {step === 'email' && <Mail className="w-12 h-12 text-[#2E2883]" />}
              {step === 'otp' && <Lock className="w-12 h-12 text-[#2E2883]" />}
              {step === 'details' && <User className="w-12 h-12 text-[#2E2883]" />}
            </motion.div>

            <div className="space-y-2">
              <motion.h1
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold text-gray-900"
              >
                {step === 'email' && "Get Started"}
                {step === 'otp' && "Verify Email"}
                {step === 'details' && "Create Account"}
              </motion.h1>
              <p className="text-lg text-gray-500">
                {step === 'email' && "Enter your email to begin registration"}
                {step === 'otp' && "We've sent a code to your email"}
                {step === 'details' && "Complete your profile to finish"}
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Registration Successful!</h3>
                <p className="text-sm text-gray-500">Redirecting to login page...</p>
              </motion.div>
            ) : (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {step === 'email' && (
                  <form onSubmit={handleInitiateRegistration} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-base font-medium text-gray-700">
                        Email address
                      </Label>
                      <Input 
                        id="email" 
                        name="email"
                        type="email" 
                        placeholder="you@example.com" 
                        required 
                        className="h-14 text-lg"
                        value={formData.email}
                        onChange={handleChange}
                      />
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
                        {isLoading ? "Sending..." : "Continue"}
                      </Button>
                    </motion.div>
                  </form>
                )}

                {step === 'otp' && (
                  <form onSubmit={handleVerifyOTP} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="otp" className="text-base font-medium text-gray-700">
                        Verification Code
                      </Label>
                      <Input 
                        id="otp" 
                        name="otp"
                        type="text" 
                        placeholder="Enter 6-digit code" 
                        required 
                        maxLength={6}
                        className="h-14 text-lg text-center tracking-widest"
                        value={formData.otp}
                        onChange={handleChange}
                      />
                      <p className="text-sm text-gray-500">
                        We sent a code to {formData.email}
                      </p>
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
                        {isLoading ? "Verifying..." : "Verify Code"}
                      </Button>
                    </motion.div>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={isLoading}
                        className="text-[#2E2883] hover:underline text-sm font-medium"
                      >
                        Didn't receive the code? Resend
                      </button>
                    </div>
                  </form>
                )}

                {step === 'details' && (
                  <form onSubmit={handleCompleteRegistration} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-base font-medium text-gray-700">
                        Full Name
                      </Label>
                      <Input 
                        id="fullName" 
                        name="fullName"
                        type="text" 
                        placeholder="Enter your full name" 
                        required 
                        className="h-14 text-lg"
                        value={formData.fullName}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-base font-medium text-gray-700">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          required
                          className="h-14 pr-10 text-lg"
                          value={formData.password}
                          onChange={handleChange}
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
                        {isLoading ? "Creating Account..." : "Complete Registration"}
                      </Button>
                    </motion.div>
                  </form>
                )}
                
                <div className="text-center pt-4 space-y-2">
                  <p className="text-gray-600 font-medium">Already have an account?</p>
                  <motion.a
                    href="/login-candidate"
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex items-center text-[#2E2883] font-medium hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Return to login
                  </motion.a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}