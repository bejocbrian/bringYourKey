"use client"

import { useState } from "react"
import { Settings, Shield, Database, Trash2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useApiKeysStore } from "@/lib/store/api-keys-store"
import { useGenerationStore } from "@/lib/store/generation-store"
import { useToast } from "@/components/hooks/use-toast"

export default function SettingsPage() {
  const { apiKeys, usageStats, resetApiKeys } = useApiKeysStore()
  const { generations, resetAll } = useGenerationStore()
  const { toast } = useToast()
  const [clearDataDialog, setClearDataDialog] = useState(false)

  const handleClearAllData = () => {
    resetApiKeys()
    resetAll()
    
    localStorage.clear()
    sessionStorage.clear()
    
    setClearDataDialog(false)
    toast({
      title: "Success",
      description: "All data has been cleared. The page will now reload.",
    })
    
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const totalGenerations = usageStats.reduce((sum, stat) => sum + stat.totalGenerations, 0)
  const successfulGenerations = usageStats.reduce((sum, stat) => sum + stat.successfulGenerations, 0)
  const totalDuration = usageStats.reduce((sum, stat) => sum + stat.totalDuration, 0)

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings and data.
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
              Information about how your data is handled securely
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="font-semibold mb-2">API Key Storage</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Your API keys are encrypted using AES-256 encryption before being stored in your browser's localStorage. 
                They are never sent to any server other than the provider's API endpoint when generating videos.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Keys are encrypted before storage</li>
                <li>• Encryption key is stored locally</li>
                <li>• No server-side key storage</li>
                <li>• Keys can be deleted at any time</li>
              </ul>
            </div>

            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="font-semibold mb-2">Video Data</h4>
              <p className="text-sm text-muted-foreground">
                Generated videos are streamed directly to your browser. We do not store any videos on our servers. 
                You can download videos to your device for permanent storage.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <CardTitle>Usage Statistics</CardTitle>
            </div>
            <CardDescription>
              Your video generation usage across providers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <div className="rounded-lg border p-4">
                <div className="text-2xl font-bold">{totalGenerations}</div>
                <div className="text-sm text-muted-foreground">Total Generations</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-2xl font-bold text-green-600">{successfulGenerations}</div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-2xl font-bold">{totalDuration}s</div>
                <div className="text-sm text-muted-foreground">Total Duration</div>
              </div>
            </div>

            {usageStats.length > 0 ? (
              <div className="space-y-3">
                {usageStats.map(stat => (
                  <div key={stat.provider} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{stat.provider}</span>
                      <span className="text-sm text-muted-foreground">
                        {stat.lastUsed ? `Last used: ${new Date(stat.lastUsed).toLocaleDateString()}` : 'Never used'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Total</div>
                        <div className="font-medium">{stat.totalGenerations}</div>
                      </div>
                      <div>
                        <div className="text-green-600">Success</div>
                        <div className="font-medium">{stat.successfulGenerations}</div>
                      </div>
                      <div>
                        <div className="text-destructive">Failed</div>
                        <div className="font-medium">{stat.failedGenerations}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No usage data yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <CardTitle>Application Data</CardTitle>
            </div>
            <CardDescription>
              Information about data stored on your device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>API Keys</span>
                <span className="font-medium">{apiKeys.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Stored Generations</span>
                <span className="font-medium">{generations.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Storage Used</span>
                <span className="font-medium">~{(JSON.stringify({ apiKeys, generations }).length / 1024).toFixed(2)} KB</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <CardTitle>Danger Zone</CardTitle>
            </div>
            <CardDescription>
              Irreversible actions that will delete your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={clearDataDialog} onOpenChange={setClearDataDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Clear All Data?</DialogTitle>
                  <DialogDescription>
                    This will permanently delete all your API keys, generation history, and usage statistics.
                    This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setClearDataDialog(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleClearAllData}>
                    Clear All Data
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium">1.0.0 (MVP Phase 1)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Providers Supported</span>
              <span className="font-medium">Google Veo 2, Meta Movie Gen, Runway Gen-3</span>
            </div>
            <p className="text-muted-foreground pt-2">
              BYOK (Bring Your Own Key) is a client-side application that lets you use your own API keys 
              to generate videos from multiple AI video generation providers. All data is stored locally in your browser.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
