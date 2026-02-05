"use client"

import { useState } from "react"
import { Video, Film, Play, Plus, Trash2, Eye, EyeOff, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PROVIDER_CONFIGS } from "@/lib/services/providers"
import { useApiKeysStore } from "@/lib/store/api-keys-store"
import { useToast } from "@/components/hooks/use-toast"

export default function ApiKeysPage() {
  const { apiKeys, hasApiKey, addApiKey, removeApiKey } = useApiKeysStore()
  const { toast } = useToast()
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<string>('google-veo')
  const [apiKey, setApiKey] = useState('')
  const [keyName, setKeyName] = useState('')
  const [showKey, setShowKey] = useState<Record<string, boolean>>({})

  const handleAddKey = () => {
    if (!apiKey.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an API key",
      })
      return
    }

    addApiKey(selectedProvider as 'google-veo' | 'meta-movie-gen' | 'runway', apiKey, keyName || undefined)
    
    toast({
      title: "Success",
      description: `${PROVIDER_CONFIGS[selectedProvider]?.name} API key added successfully`,
    })

    setApiKey('')
    setKeyName('')
    setOpenDialog(false)
  }

  const handleRemoveKey = (provider: string) => {
    removeApiKey(provider as 'google-veo' | 'meta-movie-gen' | 'runway')
    toast({
      title: "Success",
      description: `${PROVIDER_CONFIGS[provider]?.name} API key removed`,
    })
  }

  const toggleShowKey = (provider: string) => {
    setShowKey(prev => ({ ...prev, [provider]: !prev[provider] }))
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API Keys</h1>
        <p className="text-muted-foreground">
          Manage your API keys for video generation providers. All keys are encrypted and stored locally in your browser.
        </p>
      </div>

      <div className="mb-8">
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add API Key</DialogTitle>
              <DialogDescription>
                Add your API key for a video generation provider.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <select
                  id="provider"
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="google-veo">Google Veo 2</option>
                  <option value="meta-movie-gen">Meta Movie Gen</option>
                  <option value="runway">Runway Gen-3</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="key-name">Key Name (Optional)</Label>
                <Input
                  id="key-name"
                  placeholder="e.g., Personal Account"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Your API key will be encrypted and stored locally in your browser.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddKey}>
                Add Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {Object.values(PROVIDER_CONFIGS).map((provider) => {
          const hasKey = hasApiKey(provider.id)
          const keyData = apiKeys.find(k => k.provider === provider.id)

          const Icon = provider.icon === 'Video' ? Video : provider.icon === 'Film' ? Film : Play

          return (
            <Card key={provider.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${hasKey ? 'bg-primary/10' : 'bg-muted'}`}>
                      <Icon className={`h-5 w-5 ${hasKey ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {provider.name}
                        {hasKey && (
                          <span className="flex items-center text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            <Check className="h-3 w-3 mr-1" />
                            Connected
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {provider.description}
                      </CardDescription>
                    </div>
                  </div>
                  {hasKey && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveKey(provider.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              {hasKey && keyData && (
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>API Key</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleShowKey(provider.id)}
                        className="h-8"
                      >
                        {showKey[provider.id] ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-1" />
                            Hide
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-1" />
                            Show
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="font-mono text-sm bg-muted p-3 rounded-md break-all">
                      {showKey[provider.id]
                        ? keyData.key
                        : '•'.repeat(Math.min(keyData.key.length, 40))
                      }
                    </div>
                    <div className="flex items-start gap-2 text-xs text-muted-foreground mt-2">
                      <AlertCircle className="h-4 w-4 mt-0.5" />
                      <div>
                        <p>Added on {new Date(keyData.createdAt).toLocaleDateString()}</p>
                        {keyData.name && <p className="mt-1">Name: {keyData.name}</p>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      <div className="mt-8 rounded-lg border bg-muted/50 p-6">
        <h3 className="font-semibold mb-2">About API Key Security</h3>
        <p className="text-sm text-muted-foreground mb-4">
          All API keys are encrypted using AES encryption before being stored in your browser&apos;s localStorage.
          Your keys are never sent to any server other than the provider&apos;s API for video generation.
        </p>
        <div className="text-xs text-muted-foreground">
          <p>Max duration per video:</p>
          <ul className="mt-2 space-y-1">
            <li>• Google Veo 2: Up to {PROVIDER_CONFIGS['google-veo'].maxDuration} seconds</li>
            <li>• Meta Movie Gen: Up to {PROVIDER_CONFIGS['meta-movie-gen'].maxDuration} seconds</li>
            <li>• Runway Gen-3: Up to {PROVIDER_CONFIGS['runway'].maxDuration} seconds</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
