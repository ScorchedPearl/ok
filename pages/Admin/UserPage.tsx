"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Search, 
  Filter, 
  Loader2, 
  MoreHorizontal,
  RefreshCcw, 
  CheckCircle2,
  XCircle,
  ChevronDown,
  User,
  Mail,
  CalendarIcon,
  ShieldCheck,
  Clock,
  UserCheck
} from "lucide-react"
import { useAuth } from '@/context/AuthContext'
import { api } from '@/utils/api'
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface User {
  userId: number;
  keycloakId: string;
  username: string | null;
  email: string;
  fullName: string;
  role: string;
  status: string;
  createdAt: string;
}

const roleColors = {
  SUPER_ADMIN: "text-purple-600",
  TENANT_ADMIN: "text-blue-600",
  HR_MANAGER: "text-green-600",
  RECRUITER: "text-orange-600",
}

const ROLE_FILTERS = [
  { label: "Tenant Admin", value: "TENANT_ADMIN" },
  { label: "HR Manager", value: "HR_MANAGER" },
  { label: "Recruiter", value: "RECRUITER" },
]

const STATUS_FILTERS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
]

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const { token } = useAuth()
  const { toast } = useToast()

  const fetchUsers = async () => {
    if (!token) return;
    try {
      setIsLoading(true)
      const data = await api.users.list(token)
      setUsers(data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [token])

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.username?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    
    const matchesRole = selectedRoles.length === 0 || selectedRoles.includes(user.role)
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(user.status)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const clearFilters = () => {
    setSelectedRoles([])
    setSelectedStatuses([])
  }

  const handleViewDetails = (user: User) => {
    setSelectedUser(user)
    setIsDetailsDialogOpen(true)
  }

  return (
    <div className="min-h-screen ">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#2E2883] to-[#1a1648] bg-clip-text text-transparent">
                  User Management
                </CardTitle>
                <CardDescription>
                  Manage all users across different roles and tenants
                </CardDescription>
              </div>
              <Button 
                onClick={fetchUsers}
                variant="outline"
                size="icon"
                className="hover:bg-[#2E2883]/10"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                    {(selectedRoles.length > 0 || selectedStatuses.length > 0) && (
                      <Badge 
                        variant="secondary" 
                        className="ml-2 bg-[#2E2883] text-white"
                      >
                        {selectedRoles.length + selectedStatuses.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px]">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Roles</h4>
                      {ROLE_FILTERS.map((role) => (
                        <div key={role.value} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={role.value}
                            checked={selectedRoles.includes(role.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRoles([...selectedRoles, role.value])
                              } else {
                                setSelectedRoles(selectedRoles.filter(r => r !== role.value))
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <label htmlFor={role.value}>{role.label}</label>
                        </div>
                      ))}
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Status</h4>
                      {STATUS_FILTERS.map((status) => (
                        <div key={status.value} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={status.value}
                            checked={selectedStatuses.includes(status.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStatuses([...selectedStatuses, status.value])
                              } else {
                                setSelectedStatuses(selectedStatuses.filter(s => s !== status.value))
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <label htmlFor={status.value}>{status.label}</label>
                        </div>
                      ))}
                    </div>

                    {(selectedRoles.length > 0 || selectedStatuses.length > 0) && (
                      <Button 
                        variant="ghost" 
                        className="w-full text-sm text-gray-500"
                        onClick={clearFilters}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[#2E2883]" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user, index) => (
                      <motion.tr
                        key={user.userId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-[#2E2883]/5"
                      >
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{user.fullName}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${roleColors[user.role as keyof typeof roleColors] || "text-gray-600"}`}>
                            {user.role.replace(/_/g, ' ')}
                          </span>
                        </TableCell>
                        <TableCell>
                          {user.status === 'active' ? (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle2 className="w-4 h-4" />
                              Active
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-red-600">
                              <XCircle className="w-4 h-4" />
                              Inactive
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* User Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected user
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-4">
                <div className="bg-[#2E2883]/10 w-20 h-20 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-[#2E2883]" />
                </div>
              </div>
              
              <div className="space-y-4">
                {/* User Name */}
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-[#2E2883]" />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{selectedUser.fullName}</p>
                  </div>
                </div>
                
                {/* Email */}
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-[#2E2883]" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                </div>
                
                <Separator />
                
                {/* Role */}
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-[#2E2883]" />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className={`font-medium ${roleColors[selectedUser.role as keyof typeof roleColors] || "text-gray-600"}`}>
                      {selectedUser.role.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
                
                {/* Status */}
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#2E2883]" />
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div className="flex items-center mt-1">
                      {selectedUser.status === 'active' ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-red-200 text-red-800 bg-red-50 hover:bg-red-100">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Creation Date */}
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-[#2E2883]" />
                  <div>
                    <p className="text-sm text-gray-500">Created On</p>
                    <p className="font-medium">{formatDateTime(selectedUser.createdAt)}</p>
                  </div>
                </div>
                
                {/* User ID Information */}
                <div className="bg-gray-50 p-3 rounded-md mt-4">
                  <div className="text-xs text-gray-500 mb-1">System IDs:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">User ID</p>
                      <p className="text-xs font-mono">{selectedUser.userId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Keycloak ID</p>
                      <p className="text-xs font-mono truncate" title={selectedUser.keycloakId}>
                        {selectedUser.keycloakId.substring(0, 8)}...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              onClick={() => setIsDetailsDialogOpen(false)}
              className="w-full bg-[#2E2883] hover:bg-[#2E2883]/90 text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}