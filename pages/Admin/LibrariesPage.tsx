"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Filter, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LibraryCard } from "@/components/admin/LibraryCard"
import { TextGenerateEffect } from "@/components/ui/aceternity"
import { api } from "@/utils/api" // Adjust the import path based on your project structure

// Updated Library interface to match the API response
interface Library {
  libraryId: number;
  libraryName: string;
  description: string;
  createdAt: string;
  tags: string[];
  timeRequired: number;
  questions: any[];
}

// Updated LibraryCardProps to match our new interface
interface LibraryCardProps {
  library: {
    id: number;
    name: string;
    questions: number;
    lastUpdated: string;
    categories: string[];
  }
}

export default function LibrariesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [libraries, setLibraries] = useState<Library[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLibraries = async () => {
      try {
        setLoading(true)
        // Get token from localStorage or your auth state management
        const token = localStorage.getItem('token') || ''
        
        // Fetch libraries from API
        const response = await api.libraries.list(token)
        setLibraries(response)
        setError(null)
      } catch (err) {
        console.error('Error fetching libraries:', err)
        setError('Failed to load libraries. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchLibraries()
  }, [])

  // Filter libraries based on search query
  const filteredLibraries = libraries.filter(library => 
    library.libraryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    library.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    library.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Convert API library format to card format
  const mapLibraryToCardFormat = (library: Library) => ({
    id: library.libraryId,
    name: library.libraryName,
    questions: library.questions?.length || 0,
    lastUpdated: new Date(library.createdAt).toLocaleDateString(),
    categories: library.tags || []
  })

  return (
    // Container with fixed height and overflow handling
    <div className="h-screen flex flex-col">
      {/* Fixed header section */}
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <TextGenerateEffect words="Question Libraries" className="text-2xl text-[#2E2883]" />
      
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] w-4 h-4" />
            <Input
              placeholder="Search libraries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border border-[#D1D5DB] focus:border-[#2E2883] focus:ring-[#2E2883]"
            />
          </div>
         
        </div>
      </div>

      {/* Scrollable content section */}
      <div className="flex-1 overflow-y-auto p-6 pt-0">
        {loading ? (
          <div className="text-center py-10">
            <p>Loading libraries...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">
            <p>{error}</p>
          </div>
        ) : filteredLibraries.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>No libraries found. Try a different search term or create a new library.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLibraries.map((library, index) => (
              <motion.div
                key={library.libraryId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <LibraryCard library={mapLibraryToCardFormat(library)} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}