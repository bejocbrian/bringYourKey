"use client"

import { useState } from "react"
import { AlertTriangle, Database, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useApiKeysStore } from "@/lib/store/api-keys-store"
import { useGenerationStore } from "@/lib/store/generation-store"
import { PROVIDERS } from "@/lib/services/providers"
import { useToast } from "@/components/hooks/use-toast"

export default function SettingsPage() {
  const { apiKeys } = useApiKeysStore()
  const { generations } = useGenerationStore()
  const { toast } = useToast()
  const [clearDataDialog, setClearDataDialog] = useState(false)

  const connectedProviders = Object.values(apiKeys).filter(Boolean).length

  const handleClearAllData = () => {
    localStorage.removeItem("byok-api-keys")
    localStorage.removeItem("byok-generations")
    setClearDataDialog(false)
    toast({
      title: "Local data cleared",
      description: "Reloading to apply changes.",
    })
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Review how BYOK stores your data and manage local storage.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Privacy & Security</CardTitle>
            </div>
            <CardDescription>
              BYOK keeps everything encrypted and stored locally in your browser.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              API keys are encrypted with AES before they are stored in localStorage. They are never sent to our servers.
            </p>
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="font-medium text-foreground">Supported providers</p>
              <ul className="mt-2 space-y-1">
                {Object.values(PROVIDERS).map((provider) => (
                  <li key={provider.name}>• {provider.name}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <CardTitle>Local Data Overview</CardTitle>
            </div>
            <CardDescription>
              All data stays on your device unless you clear it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4">
                <div className="text-2xl font-bold">{connectedProviders}</div>
                <div className="text-sm text-muted-foreground">Connected Providers</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-2xl font-bold">{generations.length}</div>
                <div className="text-sm text-muted-foreground">Stored Generations</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-2xl font-bold">{(JSON.stringify({ apiKeys, generations }).length / 1024).toFixed(2)} KB</div>
                <div className="text-sm text-muted-foreground">Approx. Storage Used</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/40">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <CardTitle>Clear Local Data</CardTitle>
            </div>
            <CardDescription>
              This will delete API keys and generation history stored in your browser.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={clearDataDialog} onOpenChange={setClearDataDialog}>
              <Button variant="destructive" onClick={() => setClearDataDialog(true)}>
                Clear All Data
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Clear all data?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. Your API keys and generations will be removed from localStorage.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setClearDataDialog(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleClearAllData}>
                    Clear Data
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
