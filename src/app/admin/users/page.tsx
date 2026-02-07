"use client"

import { useEffect, useState } from "react"
import { Search, Filter, MoreVertical, Ban, Eye, Mail, Users, UserPlus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PROVIDERS } from "@/lib/services/providers"
import { Profile, Provider } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

type UserFormState = {
  full_name: string
  email: string
  status: Profile["status"]
  last_active: string
  generations_count: string
  allowed_providers: Provider[]
}

const getDateTimeLocalValue = (date: Date) => date.toISOString().slice(0, 16)

export default function UsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState<UserFormState>({
    full_name: "",
    email: "",
    status: "active",
    last_active: getDateTimeLocalValue(new Date()),
    generations_count: "0",
    allowed_providers: ["meta-moviegen"],
  })

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/users")
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      status: "active",
      last_active: getDateTimeLocalValue(new Date()),
      generations_count: "0",
      allowed_providers: ["meta-moviegen"],
    })
  }

  const openAddUserDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  const handleAddUser = async () => {
    if (!formData.full_name.trim() || !formData.email.trim() || !formData.last_active || !formData.generations_count.trim()) {
      toast({
        variant: "destructive",
        title: "Missing details",
        description: "Fill out all fields before creating the user.",
      })
      return
    }

    const generations = Number.parseInt(formData.generations_count, 10)
    if (Number.isNaN(generations) || generations < 0) {
      toast({
        variant: "destructive",
        title: "Invalid generations",
        description: "Enter a valid generations count.",
      })
      return
    }

    if (formData.allowed_providers.length === 0) {
      toast({
        variant: "destructive",
        title: "Select a provider",
        description: "Choose at least one provider for this user.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          full_name: formData.full_name.trim(),
          status: formData.status,
          allowed_providers: formData.allowed_providers,
          generations_count: generations,
          last_active: new Date(formData.last_active).toISOString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create user")
      }

      const data = await response.json()
      setUsers((prev) => [data.user, ...prev])
      setDialogOpen(false)
      resetForm()
      toast({
        title: "User created",
        description: `${data.user.full_name} will receive an invite email to set their password.`,
      })
    } catch (error) {
      console.error("Error creating user:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleUserProviderAccess = async (userId: string, provider: Provider) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return

    const isAllowed = user.allowed_providers.includes(provider)
    const newAllowedProviders = isAllowed
      ? user.allowed_providers.filter((p) => p !== provider)
      : [...user.allowed_providers, provider]

    // Optimistically update UI
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, allowed_providers: newAllowedProviders } : u
      )
    )

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          allowed_providers: newAllowedProviders,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update user")
      }

      const data = await response.json()
      // Update with server response
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? data.user : u))
      )
      
      toast({
        title: "Provider access updated",
        description: `${user.full_name}'s access to ${PROVIDERS[provider].name} has been ${isAllowed ? "revoked" : "granted"}.`,
      })
    } catch (error) {
      console.error("Error updating user:", error)
      // Revert optimistic update
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, allowed_providers: user.allowed_providers } : u
        )
      )
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update provider access. Please try again.",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800'
      case 'inactive':
        return 'bg-amber-100 text-amber-800'
      case 'suspended':
        return 'bg-rose-100 text-rose-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Users</h1>
          <p className="text-slate-500 mt-1">Manage and monitor application users. Toggle provider access per user.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={openAddUserDialog}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>User Directory</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input placeholder="Search users..." className="pl-10" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-4" />
              <p className="text-sm text-slate-500">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">No users yet</h3>
              <p className="text-sm text-slate-500 max-w-md">
                Users will appear here when they sign up for the application or when you add them.
              </p>
            </div>
          ) : (
            <>
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                  <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 font-semibold">User</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                      <th className="px-6 py-3 font-semibold">Provider Access</th>
                      <th className="px-6 py-3 font-semibold">Generations</th>
                      <th className="px-6 py-3 font-semibold">Last Active</th>
                      <th className="px-6 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                              {user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{user.full_name || "Unnamed User"}</div>
                              <div className="text-xs text-slate-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {(Object.keys(PROVIDERS) as Provider[]).map((providerId) => {
                              const isAllowed = user.allowed_providers.includes(providerId)
                              const providerName = PROVIDERS[providerId].name
                              return (
                                <div
                                  key={providerId}
                                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100"
                                  title={providerName}
                                >
                                  <span className="text-xs font-medium text-slate-700 truncate max-w-[80px]">
                                    {providerName.split(' ')[0]}
                                  </span>
                                  <Switch
                                    checked={isAllowed}
                                    onCheckedChange={() => toggleUserProviderAccess(user.id, providerId)}
                                    className="h-4 w-7 data-[state=checked]:bg-emerald-500"
                                  />
                                </div>
                              )
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">{user.generations_count}</td>
                        <td className="px-6 py-4 text-xs">
                          {user.last_active ? format(new Date(user.last_active), "MMM d, yyyy") : "Never"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" title="View Details">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Send Email">
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-rose-600" title="Ban User">
                              <Ban className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-slate-500">Showing {users.length} of {users.length} users</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>Previous</Button>
                  <Button variant="outline" size="sm" disabled>Next</Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Provider Access Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            {(Object.entries(PROVIDERS) as [Provider, { name: string }][]).map(([id, provider]) => (
              <div key={id} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>{provider.name}</span>
                <span className="text-xs text-slate-400">({id})</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Toggle switches in the Provider Access column to enable or disable specific providers for each user. 
            Users can only generate videos with providers they have been granted access to.
          </p>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new user</DialogTitle>
            <DialogDescription>Invite a user and configure their provider access.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="user-name">Name</Label>
              <Input
                id="user-name"
                placeholder="Jane Doe"
                value={formData.full_name}
                onChange={(event) => setFormData((prev) => ({ ...prev, full_name: event.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                placeholder="jane@company.com"
                value={formData.email}
                onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as Profile["status"] }))}
              >
                <SelectTrigger id="user-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user-last-active">Last active</Label>
              <Input
                id="user-last-active"
                type="datetime-local"
                value={formData.last_active}
                onChange={(event) => setFormData((prev) => ({ ...prev, last_active: event.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user-generations">Generations count</Label>
              <Input
                id="user-generations"
                type="number"
                min="0"
                value={formData.generations_count}
                onChange={(event) => setFormData((prev) => ({ ...prev, generations_count: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Provider access</Label>
              <div className="flex flex-wrap gap-3">
                {(Object.entries(PROVIDERS) as [Provider, { name: string }][]).map(([providerId, provider]) => (
                  <div key={providerId} className="flex items-center gap-2 rounded-md border px-3 py-2">
                    <Switch
                      checked={formData.allowed_providers.includes(providerId)}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          allowed_providers: checked
                            ? [...prev.allowed_providers, providerId]
                            : prev.allowed_providers.filter((allowed) => allowed !== providerId),
                        }))
                      }
                      className="data-[state=checked]:bg-emerald-500"
                    />
                    <span className="text-sm text-slate-700">{provider.name}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500">Defaults to Meta Movie Gen access.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleDialogChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
