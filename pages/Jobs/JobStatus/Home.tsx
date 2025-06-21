"use client"

import { motion } from "framer-motion"
import MainContent from "./MainContent"
import WelcomeSidebar from "./WelcomeSidebar"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="container mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-4"
          >
            <div className="h-12 w-12 rounded-full bg-[#6366F1] flex items-center justify-center">
              <span className="text-white font-semibold text-lg">JD</span>
            </div>
            <div>
              <h1 className="text-[#1E293B] text-3xl font-bold mb-1">
                Welcome back, Sanjay Paul
              </h1>
              <p className="text-[#64748B]">
                Last login: Today at 9:42 AM
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hidden lg:block"
          >
            <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-lg shadow-sm">
              <div className="w-2 h-2 bg-[#22C55E] rounded-full"></div>
              <span className="text-[#64748B] text-sm">Application Status: Active</span>
            </div>
          </motion.div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="lg:flex-1 order-2 lg:order-1"
          >
            <MainContent />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="lg:w-96 order-1 lg:order-2"
          >
            <WelcomeSidebar />
          </motion.div>
        </div>
      </div>
    </div>
  )
}