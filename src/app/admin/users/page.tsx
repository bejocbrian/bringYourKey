"use client"

import { useState } from "react"
import { Search, Filter, MoreVertical, Ban, Eye, Mail, Users, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAdminStore } from "@/lib/store/admin-store"
import { PROVIDERS } from "@/lib/services/providers"
import { Provider, User } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

type UserFormState = {
  name: string
  email: string
  status: User["status"]
  lastActive: string
  generationsCount: string
  allowedProviders: Provider[]
}

const getDateTimeLocalValue = (date: Date) => date.toISOString().slice(0, 16)

export default function UsersPage() {
  const { users, toggleUserProviderAccess, addUser } = useAdminStore()
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState<UserFormState>({
    name: "",
    email: "",
    status: "active",
    lastActive: getDateTimeLocalValue(new Date()),
    generationsCount: "0",
    allowedProviders: ["meta-moviegen"],
  })

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      status: "active",
      lastActive: getDateTimeLocalValue(new Date()),
      generationsCount: "0",
      allowedProviders: ["meta-moviegen"],
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

  const handleAddUser = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.lastActive || !formData.generationsCount.trim()) {
      toast({
        variant: "destructive",
        title: "Missing details",
        description: "Fill out all fields before creating the user.",
      })
      return
    }

    const generations = Number.parseInt(formData.generationsCount, 10)
    if (Number.isNaN(generations) || generations < 0) {
      toast({
        variant: "destructive",
        title: "Invalid generations",
        description: "Enter a valid generations count.",
      })
      return
    }

    if (formData.allowedProviders.length === 0) {
      toast({
        variant: "destructive",
        title: "Select a provider",
        description: "Choose at least one provider for this user.",
      })
      return
    }

    const userId = globalThis.crypto?.randomUUID
      ? globalThis.crypto.randomUUID()
      : `user-${Date.now()}`

    const newUser: User = {
      id: userId,
      name: formData.name.trim(),
      email: formData.email.trim(),
      status: formData.status,
      allowedProviders: formData.allowedProviders,
      lastActive: new Date(formData.lastActive).toISOString(),
      generationsCount: generations,
    }

    addUser(newUser)
    setDialogOpen(false)
    resetForm()
    toast({
      title: "User created",
      description: `${newUser.name} can now access the platform.`,
    })
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
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">No users yet</h3>
              <p className="text-sm text-slate-500 max-w-md">
                Users will appear here when they sign up for the application.
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
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{user.name}</div>
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
                              const isAllowed = user.allowedProviders.includes(providerId)
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
                        <td className="px-6 py-4 font-medium text-slate-700">{user.generationsCount}</td>
                        <td className="px-6 py-4 text-xs">
                          {format(new Date(user.lastActive), "MMM d, yyyy")}
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
                value={formData.name}
                onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
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
                onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as User["status"] }))}
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
                value={formData.lastActive}
                onChange={(event) => setFormData((prev) => ({ ...prev, lastActive: event.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user-generations">Generations count</Label>
              <Input
                id="user-generations"
                type="number"
                min="0"
                value={formData.generationsCount}
                onChange={(event) => setFormData((prev) => ({ ...prev, generationsCount: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Provider access</Label>
              <div className="flex flex-wrap gap-3">
                {(Object.entries(PROVIDERS) as [Provider, { name: string }][]).map(([providerId, provider]) => (
                  <div key={providerId} className="flex items-center gap-2 rounded-md border px-3 py-2">
                    <Switch
                      checked={formData.allowedProviders.includes(providerId)}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          allowedProviders: checked
                            ? [...prev.allowedProviders, providerId]
                            : prev.allowedProviders.filter((allowed) => allowed !== providerId),
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
            <Button variant="outline" onClick={() => handleDialogChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
