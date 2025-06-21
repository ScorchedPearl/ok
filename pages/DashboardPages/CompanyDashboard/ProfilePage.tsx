"use client"

import { useAuth } from "@/context/AuthContext"
import {
  UserCircle,
  Building2,
  Mail,
  Shield,
  Activity,
  Key,
  Clock,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useEffect, useState } from "react"

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    active: "bg-green-100 text-green-700 border-green-200",
    inactive: "bg-gray-100 text-gray-700 border-gray-200",
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
      styles[status as keyof typeof styles] || styles.inactive
    }`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

const ProfileSection = ({ 
  icon: Icon, 
  title, 
  children 
}: { 
  icon: React.ElementType; 
  title: string; 
  children: React.ReactNode 
}) => (
  <div className="flex gap-4 p-4 bg-white rounded-lg border border-gray-100">
    <div className="flex-shrink-0">
      <div className="w-10 h-10 rounded-full bg-[#2E2883]/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-[#2E2883]" />
      </div>
    </div>
    <div className="flex-grow">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      {children}
    </div>
  </div>
)

export default function ProfilePage() {
  const { user,token } = useAuth()
  const tenantMetadata = user?.tenant?.metadata ? JSON.parse(user.tenant.metadata) : {}
  const [fullName, setFullName] = useState(user?.fullName || "")
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  useEffect(() => {
    if (user?.fullName) {
      setFullName(user.fullName)
    }
  }, [user?.fullName])
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile Overview</h1>
            <p className="text-gray-500 mt-1">
              View and manage your profile information
            </p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Activity className="w-4 h-4" />
                  View Activity Log
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                View your recent account activities
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Personal Info */}
          <div className="col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#2E2883]">
                  <UserCircle className="w-5 h-5 text-[#2E2883]" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6">
                    

                    <ProfileSection icon={UserCircle} title="Full Name">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          onKeyDown={async (e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              try {
                                await fetch(
                                  `${import.meta.env.VITE_AUTH_SERVICE_URL}/candidate/update-profile`,
                                  {
                                  method: "PUT",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token?.access_token || ""}`,
                                  },
                                  body: JSON.stringify({ fullName }),
                                  }
                                )
                              } catch (error) {
                                // Optionally handle error
                              }
                            }
                          }}
                          className="text-lg font-semibold text-gray-900 bg-transparent border-none focus:ring-0 focus:outline-none"
                          style={{ minWidth: 0, flex: 1 }}
                        />
                        {/* You can add a save button here if you want to trigger an update */}
                      </div>
                    </ProfileSection>

                  <ProfileSection icon={Mail} title="Email">
                    <p className="text-lg font-semibold text-gray-900">
                      {user?.email}
                    </p>
                  </ProfileSection>

                  <ProfileSection icon={Shield} title="Role & Status">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-gray-900">
                        {user?.role.replace(/_/g, ' ')}
                      </span>
                      <StatusBadge status={user?.status || 'inactive'} />
                    </div>
                  </ProfileSection>

                  <ProfileSection icon={Key} title="Keycloak ID">
                    <p className="text-lg font-medium text-gray-600 font-mono">
                      {user?.keycloakId}
                    </p>
                  </ProfileSection>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Organization & Activity */}
          <div className="space-y-6">
            {user?.tenant && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#2E2883]">
                    <Building2 className="w-5 h-5 text-[#2E2883]" />
                    Organization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tenant Name</p>
                    <p className="text-lg font-semibold text-gray-900">{user.tenant.tenantName}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Subscription Plan</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {user.tenant.subscriptionPlanId.charAt(0).toUpperCase() + 
                       user.tenant.subscriptionPlanId.slice(1)}
                    </p>
                  </div>
                  {tenantMetadata.industry && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Industry</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {tenantMetadata.industry}
                        </p>
                      </div>
                    </>
                  )}
                  {tenantMetadata.size && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Company Size</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {tenantMetadata.size}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#2E2883]">
                  <Clock className="w-5 h-5 text-[#2E2883]" />
                  Account Timeline
                </CardTitle>
                <CardDescription>Important dates for your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Created At</p>
                  <p className="text-sm text-gray-900">{formatDate(user?.createdAt || '')}</p>
                </div>
                {user?.tenant && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500">Last Updated</p>
                      <p className="text-sm text-gray-900">{formatDate(user.tenant.updatedAt)}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}