"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, Users, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { TextReveal } from "@/components/ui/aceternity"

const benefits = [
  {
    title: "Discover your results.",
    description: "Uncover your strengths and showcase your skills.",
  },
  {
    title: "Take control with self-testing.",
    description: "Highlight verified skills that employers trust.",
  },
  {
    title: "Connect with top employers.",
    description: "Stand out to recruiters who value skills over resumes.",
  },
  {
    title: "Showcase your expertise.",
    description: "Let your profile speak for you and stand out amongst other job seekers.",
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState("")

  const checkPassword = (value: string) => {
    setPassword(value)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Registration Form */}
      <div className="flex-1 bg-gradient-to-br from-[#2E2883] to-[#1a1648] p-4 lg:p-8 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-2 bg-white/20 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Screenera</h1>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Create your Profile</h2>
            <p className="text-white/80">Enter the email address to which you received an assessment invite.</p>
          </div>

          <form className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="Enter Password"
                  onChange={(e) => checkPassword(e.target.value)}
                  className="mt-1 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="password" className="text-white">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="Enter Password Again"
                  onChange={(e) => checkPassword(e.target.value)}
                  className="mt-1 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:border-white"
              />
              <Label htmlFor="terms" className="text-sm text-white/80">
                I have read and accepted the{" "}
                <a href="#" className="text-white hover:underline">
                  candidate terms
                </a>{" "}
                and{" "}
                <a href="#" className="text-white hover:underline">
                  privacy policy
                </a>
              </Label>
            </div>

            <TextReveal>
              <Button className="w-full bg-white hover:bg-white/90 text-[#2E2883]">Create Account</Button>
            </TextReveal>

            <p className="text-center text-sm text-white/80">
              Already have an account?{" "}
              <a href="/candidate/login" className="text-white hover:underline">
                Log in here
              </a>
            </p>
          </form>
        </motion.div>
      </div>

      {/* Right Side - Content */}
      <div className="hidden lg:flex flex-1 bg-white">
        <div className="w-full max-w-2xl mx-auto px-12 py-16 flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-[2.5rem] font-bold leading-tight tracking-tight text-[#2E2883]">
              GET CLOSER TO
              <br />
              YOUR DREAM JOB
            </h2>
            <p className="text-xl text-gray-600">
              Join 1M+ candidates who've unlocked new career opportunities through skills-based hiring!
            </p>

            <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 mt-8">
              {benefits.map((benefit, index) => (
                <motion.div key={index} variants={item} className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-6 h-6 text-[#2E2883]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-[#2E2883]">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-12">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-gMDMJsg5s9guSXoDlCodFj4fq1OSWK.png"
                alt="Profile Stats"
                className="w-full max-w-md mx-auto"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

