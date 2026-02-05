"use client"

import { useState } from "react"
import { Key, ShieldAlert, CheckCircle2, AlertTriangle, Link2, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PROVIDERS } from "@/lib/services/providers"
import { useApiKeysStore } from "@/lib/store/api-keys-store"
import { Provider } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function ApiKeysPage() {
  const { apiKeys, addKey, removeKey, getDecryptedKey, hasKey } = useApiKeysStore()
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeProvider, setActiveProvider] = useState<Provider>("google-veo")
  const [keyName, setKeyName] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [showKey, setShowKey] = useState<Record<Provider, boolean>>({
    "google-veo": false,
    "meta-moviegen": false,
    "runway-gen3": false,
  })
  const [dialogShowKey, setDialogShowKey] = useState(false)

  const openDialog = (provider: Provider) => {
    const existing = apiKeys[provider]
    setActiveProvider(provider)
    setKeyName(existing?.name ?? "")
    setApiKey(existing ? getDecryptedKey(provider) ?? "" : "")
    setDialogShowKey(false)
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast({
        variant: "destructive",
        title: "API key required",
        description: "Please paste an API key before saving.",
      })
      return
    }

    addKey(activeProvider, apiKey.trim(), keyName.trim() || PROVIDERS[activeProvider].name)
    setDialogOpen(false)
    toast({
      title: "API key saved",
      description: `${PROVIDERS[activeProvider].name} is now connected.`,
    })
  }

  const handleRemove = (provider: Provider) => {
    removeKey(provider)
    toast({
      title: "API key removed",
      description: `${PROVIDERS[provider].name} has been disconnected.`,
    })
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API Keys</h1>
        <p className="text-muted-foreground">
          Manage your API keys for video generation providers. Keys are AES-encrypted before being stored in your browser.
        </p>
      </div>

      <div className="grid gap-6">
        {Object.entries(PROVIDERS).map(([providerId, provider]) => {
          const providerKey = apiKeys[providerId as Provider]
          const decrypted = providerKey ? getDecryptedKey(providerId as Provider) : null
          const status = !providerKey
            ? "unset"
            : decrypted
            ? "valid"
            : "invalid"

          return (
            <Card key={providerId}>
              <CardHeader className="flex flex-col gap-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {provider.name}
                      <span
                        className={
                          status === "valid"
                            ? "text-xs rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5"
                            : status === "invalid"
                            ? "text-xs rounded-full bg-red-100 text-red-700 px-2 py-0.5"
                            : "text-xs rounded-full bg-muted px-2 py-0.5"
                        }
                      >
                        {status === "valid" ? "Connected" : status === "invalid" ? "Invalid" : "Not set"}
                      </span>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {provider.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => openDialog(providerId as Provider)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      {providerKey ? "Edit" : "Add"} Key
                    </Button>
                    {providerKey && (
                      <Button variant="ghost" onClick={() => handleRemove(providerId as Provider)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4">
                  {status === "valid" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : status === "invalid" ? (
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  ) : (
                    <Key className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div className="text-sm text-muted-foreground">
                    {status === "valid"
                      ? "Your key is stored locally and ready to use."
                      : status === "invalid"
                      ? "We couldn't decrypt this key. Please re-save it."
                      : "No key stored yet. Add one to enable generation."}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Link2 className="h-4 w-4" />
                  <a
                    href={provider.docsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    Provider docs & key setup
                  </a>
                </div>

                {providerKey && decrypted && (
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">Stored Key</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setShowKey((prev) => ({
                            ...prev,
                            [providerId as Provider]: !prev[providerId as Provider],
                          }))
                        }
                      >
                        {showKey[providerId as Provider] ? "Hide" : "Show"}
                      </Button>
                    </div>
                    <div className="mt-2 break-all rounded-md bg-muted p-3 font-mono text-xs">
                      {showKey[providerId as Provider]
                        ? decrypted
                        : "•".repeat(Math.min(decrypted.length, 42))}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Added on {new Date(providerKey.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-2">Key guidance</p>
                  <ul className="space-y-1">
                    <li>• Max duration: {provider.maxDuration} seconds</li>
                    <li>• Supported ratios: {provider.supportedRatios.join(", ")}</li>
                    <li>• API usage is billed directly to your provider account.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-8 rounded-lg border bg-muted/50 p-6">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Heads up about costs</p>
            <p className="mt-1">
              BYOK never stores keys server-side. All API usage is billed directly to your provider account. Make sure your
              billing is configured before generating videos.
            </p>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{PROVIDERS[activeProvider].name} API Key</DialogTitle>
            <DialogDescription>
              Add your API key. It will be encrypted before being stored in localStorage.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="key-name">Key Label</Label>
              <Input
                id="key-name"
                placeholder="e.g. Primary account"
                value={keyName}
                onChange={(event) => setKeyName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type={dialogShowKey ? "text" : "password"}
                placeholder="Paste your API key"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
              />
              <button
                type="button"
                onClick={() => setDialogShowKey((prev) => !prev)}
                className="text-xs text-primary hover:underline"
              >
                {dialogShowKey ? "Hide" : "Show"} key
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Key</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
