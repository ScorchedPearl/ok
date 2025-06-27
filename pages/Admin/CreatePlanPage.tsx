// "use client"

// import { useState, useEffect } from "react"
// import { motion } from "framer-motion"
// import { Plus, Search, Filter, Loader2 } from "lucide-react"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { TextGenerateEffect } from "@/components/ui/aceternity"
// import { useToast } from "@/components/ui/use-toast"
// import { useAuth } from '@/context/AuthContext'
// import { api } from '@/utils/api'
// import { CreatePlanDialog } from '@/components/subscription/CreatePlanDialog'
// import { PlanCard } from '@/components/subscription/PlanCard'
// import { SubscriptionPlan } from '@/context'

// export default function SubscriptionPlansPage() {
//   const [searchQuery, setSearchQuery] = useState("")
//   const [isDialogOpen, setIsDialogOpen] = useState(false)
//   const [plans, setPlans] = useState<SubscriptionPlan[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const { token } = useAuth()
//   const { toast } = useToast()

//   const fetchPlans = async () => {
//     if (!token) return;
//     try {
//       setIsLoading(true)
//       const data = await api.subscriptionPlans.list(token)
//       setPlans(data)
//     } catch (error) {
//       console.error('Failed to fetch plans:', error)
//       toast({
//         title: "Error",
//         description: "Failed to load subscription plans. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleDeletePlan = async (planId: string) => {
//     if (!token || !window.confirm('Are you sure you want to delete this plan?')) return;
    
//     try {
//       await api.subscriptionPlans.delete(planId, token);
//       toast({
//         title: "Success",
//         description: "Plan deleted successfully.",
//       });
//       fetchPlans();
//     } catch (error) {
//       console.error('Failed to delete plan:', error);
//       toast({
//         title: "Error",
//         description: "Failed to delete plan. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleToggleActive = async (planId: string) => {
//     if (!token) return;
    
//     try {
//       const updatedPlan = await api.subscriptionPlans.toggleActive(planId, token);
//       setPlans(plans.map(plan => 
//         plan.id === planId ? updatedPlan : plan
//       ));
//       toast({
//         title: "Success",
//         description: `Plan ${updatedPlan.isActive ? 'activated' : 'deactivated'} successfully.`,
//       });
//     } catch (error) {
//       console.error('Failed to toggle plan status:', error);
//       toast({
//         title: "Error",
//         description: "Failed to update plan status. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };

//   useEffect(() => {
//     fetchPlans()
//   }, [token])

//   const filteredPlans = plans.filter(plan => 
//     plan.planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     plan.description.toLowerCase().includes(searchQuery.toLowerCase())
//   )

//   const handleDialogClose = (success?: boolean) => {
//     setIsDialogOpen(false)
//     if (success) {
//       fetchPlans()
//     }
//   }

//   return (
//     <div className="space-y-8">
//       <div className="flex items-center justify-between">
//         <TextGenerateEffect words="Subscription Plans" className="text-2xl" />
//         <Button 
//           className="bg-[#2E2883] hover:bg-[#2E2883]/90" 
//           onClick={() => setIsDialogOpen(true)}
//         >
//           <Plus className="w-4 h-4 mr-2" />
//           Create Plan
//         </Button>
//       </div>

//       <div className="flex gap-4">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
//           <Input
//             placeholder="Search plans..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="pl-10"
//           />
//         </div>
//         <Button variant="outline">
//           <Filter className="w-4 h-4 mr-2" />
//           Filters
//         </Button>
//       </div>

//       {isLoading ? (
//         <div className="flex justify-center items-center h-64">
//           <Loader2 className="w-8 h-8 animate-spin text-[#2E2883]" />
//         </div>
//       ) : filteredPlans.length === 0 ? (
//         <div className="text-center py-12">
//           <p className="text-gray-500">
//             {searchQuery ? "No plans found matching your search." : "No subscription plans added yet."}
//           </p>
//         </div>
//       ) : (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredPlans.map((plan, index) => (
//             <motion.div
//               key={plan.id}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.1 }}
//             >
//               <PlanCard 
//                 plan={plan}
//                 onDelete={handleDeletePlan}
//                 onToggleActive={handleToggleActive}
//               />
//             </motion.div>
//           ))}
//         </div>
//       )}

//       <CreatePlanDialog 
//         open={isDialogOpen} 
//         onOpenChange={handleDialogClose}
//       />
//     </div>
//   )
// }