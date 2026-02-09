"use client"

import { useEffect, useState } from "react"
import { Save, Globe, Palette, Database, ShieldCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAdminStore } from "@/lib/store/admin-store"
import { useToast } from "@/hooks/use-toast"
import { AppSettings } from "@/lib/types"

export default function SettingsPage() {
  const { settings, isLoadingSettings, updateSettings } = useAdminStore()
  const { toast } = useToast()

  // Initialize with settings if available, or empty structure
  const [formData, setFormData] = useState<AppSettings | null>(settings)

  // Sync formData with settings when settings load
  useEffect(() => {
    if (settings) {
      setFormData(settings)
    }
  }, [settings])

  const handleSave = async () => {
    if (!formData) return

    // Save each key that changed or just simple one-by-one for now since updateSettings takes (key, value)
    // Ideally we batch update or update specific sections
    // For now, let's just update the known keys
    const keys: (keyof AppSettings)[] = ['appName', 'logoUrl', 'theme', 'storage', 'defaults']

    for (const key of keys) {
      if (formData[key]) {
        await updateSettings(key, formData[key])
      }
    }

    toast({
      title: "Settings saved",
      description: "Application configuration has been updated successfully.",
    })
  }

  if (isLoadingSettings && !settings) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!formData) return null;

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
          {/* Form content mapping formData */}
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
              <CardContent className="pt-6">
                <p className="text-slate-500">Security settings are managed in your auth provider.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
