"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { CreatePlanDialog } from '@/components/subscription/CreatePlanDialog'
import { PlanCard } from '@/components/subscription/PlanCard'
import { api } from '@/utils/api'
import { useAuth } from '@/context/AuthContext'

export default function AdminSubscriptionPlansPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 1,
    totalElements: 0,
    pageSize: 20
  })
  
  const { toast } = useToast()
  const { token } = useAuth()

  // Fetch subscription plans on component mount or page change
  useEffect(() => {
    const fetchSubscriptionPlans = async () => {
      try {
        setLoading(true)
        const response = await api.subscriptionPlans.list( pagination.currentPage, pagination.pageSize)
        setPlans(response.content)
        setPagination({
          currentPage: response.number,
          totalPages: response.totalPages,
          totalElements: response.totalElements,
          pageSize: response.size
        })
        setError(null)
      } catch (err) {
        console.error('Error fetching subscription plans:', err)
        setError('Failed to load subscription plans. Please try again later.')
        toast({
          title: "Error",
          description: "Failed to load subscription plans. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptionPlans()
  }, [pagination.currentPage, pagination.pageSize, token, toast])

  const handleDeletePlan = async (planId: number) => {
    if (!token) return
    if (!window.confirm('Are you sure you want to delete this plan?')) return
    
    try {
      await api.subscriptionPlans.delete(planId, token)
      // Refresh plans list after deletion
      const response = await api.subscriptionPlans.list( pagination.currentPage, pagination.pageSize)
      setPlans(response.content)
      setPagination({
        currentPage: response.number,
        totalPages: response.totalPages,
        totalElements: response.totalElements,
        pageSize: response.size
      })
      
      toast({
        title: "Success",
        description: "Plan deleted successfully.",
      })
    } catch (err) {
      console.error('Error deleting plan:', err)
      toast({
        title: "Error",
        description: "Failed to delete the plan. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = async (planId: number) => {
    if (!token) return
    
    try {
      await api.subscriptionPlans.toggleActive(planId, token)
      // Update the local state to reflect the change
      setPlans(prevPlans => prevPlans.map(plan => 
        plan.id === planId ? { ...plan, active: !plan.active, isActive: !plan.isActive } : plan
      ))
      
      toast({
        title: "Success",
        description: "Plan status updated successfully.",
      })
    } catch (err) {
      console.error('Error toggling plan status:', err)
      toast({
        title: "Error",
        description: "Failed to update plan status. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Process features from string to array and normalize active property
  const processPlans = plans.map(plan => ({
    ...plan,
    // Handle different property names (active vs isActive)
    isActive: plan.isActive ?? plan.active ?? false,
    // Convert comma-separated features string to array
    features: typeof plan.features === 'string' ? plan.features.split(',') : plan.features
  }))

  // Filter plans based on search query
  const filteredPlans = processPlans.filter(plan => 
    plan.planName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDialogClose = (success?: boolean) => {
    setIsDialogOpen(false)
    if (success) {
      // Refresh the plans list after creating a new plan
      api.subscriptionPlans.list( 0, pagination.pageSize)
        .then(response => {
          setPlans(response.content)
          setPagination({
            currentPage: response.number,
            totalPages: response.totalPages,
            totalElements: response.totalElements,
            pageSize: response.size
          })
          toast({
            title: "Success",
            description: "Plan created successfully.",
          })
        })
        .catch(err => {
          console.error('Error refreshing plans:', err)
        })
    }
  }

  const changePage = (newPage: number) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        currentPage: newPage
      }))
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Fixed header section */}
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Subscription Plans</h1>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="bg-[#2E2883] hover:bg-[#2E2883]/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Plan
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] w-4 h-4" />
            <Input
              placeholder="Search plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border border-[#D1D5DB] focus:border-[#2E2883] focus:ring-[#2E2883]"
            />
          </div>
          <Button variant="outline" className="border-[#2E2883] text-[#2E2883] hover:bg-[#2E2883]/10">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Scrollable content section */}
      <div className="flex-1 overflow-y-auto p-6 pt-0">
        {loading ? (
          <div className="text-center py-10">
            <p>Loading subscription plans...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">
            <p>{error}</p>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>No subscription plans found. Create your first plan to get started.</p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PlanCard 
                    plan={plan}
                    onDelete={handleDeletePlan}
                    onToggleActive={handleToggleActive}
                  />
                </motion.div>
              ))}
            </div>

            {/* Pagination controls */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="text-sm">
                  Page {pagination.currentPage + 1} of {pagination.totalPages}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <CreatePlanDialog 
        open={isDialogOpen} 
        onOpenChange={handleDialogClose}
      />
    </div>
  )
}