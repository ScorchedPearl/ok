"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Search, Filter, Loader2, RefreshCcw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TenantCard } from "@/components/admin/TenantCard"
import { TextGenerateEffect } from "@/components/ui/aceternity"
import { CreateTenantDialog } from "@/components/admin/CreateTenantDialog"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from '@/context/AuthContext'
import { api } from '@/utils/api'

interface Tenant {
  id: number;
  tenantName: string;
  subscriptionPlanId: string;
  adminEmail: string;
  adminFullName: string;
  metadata: string;
  createdAt: string;
}

export default function TenantsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { token } = useAuth()
  const { toast } = useToast()

  const fetchTenants = async () => {
    if (!token) return;
    try {
      setIsLoading(true)
      const data = await api.tenants.list(token)
      setTenants(data)
    } catch (error) {
      console.error('Failed to fetch tenants:', error)
      toast({
        title: "Error",
        description: "Failed to load tenants. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTenants()
  }, [token])

  const filteredTenants = tenants.filter(tenant => 
    tenant.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.adminEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.adminFullName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-screen flex flex-col">
      {/* Fixed header section */}
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <TextGenerateEffect words="Tenant Management" className="text-2xl" />
          <div className="flex gap-2">
            <Button 
              variant="outline"
              size="icon"
              onClick={fetchTenants}
              disabled={isLoading}
              className="hover:bg-[#2E2883]/10"
              title="Refresh tenants"
            >
              <RefreshCcw className="w-4 h-4" />
            </Button>
            <Button 
              className="bg-[#2E2883] hover:bg-[#2E2883]/90" 
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Tenant
            </Button>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search tenants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Scrollable content section */}
      <div className="flex-1 overflow-y-auto p-6 pt-0">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#2E2883]" />
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchQuery ? "No tenants found matching your search." : "No tenants added yet."}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTenants.map((tenant, index) => (
              <motion.div
                key={tenant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TenantCard key={index} tenant={tenant} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Use the updated CreateTenantDialog with onSuccess callback */}
      <CreateTenantDialog 
        open={isDialogOpen} 
        onOpenChange={(open) => setIsDialogOpen(open)}
        onSuccess={fetchTenants} // This will refresh the tenant list after successful creation
      />
    </div>
  )
}