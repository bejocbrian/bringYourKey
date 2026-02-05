"use client"

import { useState } from "react"
import { Save, Globe, Palette, Database, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAdminStore } from "@/lib/store/admin-store"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { settings, updateSettings } = useAdminStore()
  const { toast } = useToast()
  const [formData, setFormData] = useState(settings)

  const handleSave = () => {
    updateSettings(formData)
    toast({
      title: "Settings saved",
      description: "Application configuration has been updated successfully.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
          <p className="text-slate-500 mt-1">Configure global application preferences.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="storage" className="gap-2">
            <Database className="h-4 w-4" />
            Storage
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>Basic application settings and branding.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="appName">Application Name</Label>
                  <Input 
                    id="appName" 
                    value={formData.appName} 
                    onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input 
                    id="logoUrl" 
                    placeholder="https://example.com/logo.png"
                    value={formData.logoUrl || ''} 
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage how the application sends notifications.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-slate-500">Send reports and alerts via email.</p>
                  </div>
                  <Switch checked={true} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Slack Integration</Label>
                    <p className="text-sm text-slate-500">Post updates to a Slack channel.</p>
                  </div>
                  <Switch checked={false} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme Settings</CardTitle>
                <CardDescription>Customize the look and feel of the app.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="primaryColor" 
                      value={formData.theme.primaryColor} 
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        theme: { ...formData.theme, primaryColor: e.target.value } 
                      })}
                    />
                    <div 
                      className="w-10 h-10 rounded border" 
                      style={{ backgroundColor: formData.theme.primaryColor }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dark Mode by Default</Label>
                    <p className="text-sm text-slate-500">Set the default theme for new users.</p>
                  </div>
                  <Switch 
                    checked={formData.theme.darkMode} 
                    onCheckedChange={(checked) => setFormData({ 
                      ...formData, 
                      theme: { ...formData.theme, darkMode: checked } 
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="storage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Retention</CardTitle>
                <CardDescription>Configure how long user data and videos are stored.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="maxGenerations">Max Generations Per User</Label>
                  <Input 
                    id="maxGenerations" 
                    type="number"
                    value={formData.storage.maxGenerationsPerUser} 
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      storage: { ...formData.storage, maxGenerationsPerUser: parseInt(e.target.value) } 
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="autoDelete">Auto-delete after (days)</Label>
                  <Input 
                    id="autoDelete" 
                    type="number"
                    value={formData.storage.autoDeleteAfterDays} 
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      storage: { ...formData.storage, autoDeleteAfterDays: parseInt(e.target.value) } 
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Security</CardTitle>
                <CardDescription>Configure security settings for the admin panel.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-slate-500">Require 2FA for all admin accounts.</p>
                  </div>
                  <Switch checked={false} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input id="sessionTimeout" type="number" defaultValue={60} />
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50">
                  Force Logout All Admins
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
