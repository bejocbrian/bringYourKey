"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Download, Loader2, Sparkles, Video, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateVideo } from "@/lib/providers"
import { PROVIDERS } from "@/lib/services/providers"
import { useApiKeysStore } from "@/lib/store/api-keys-store"
import { useGenerationStore } from "@/lib/store/generation-store"
import { useProfileStore } from "@/lib/store/profile-store"
import { GenerationRequest, Provider } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export default function GeneratePage() {
  const { hasKey, getDecryptedKey } = useApiKeysStore()
  const { generations, addGeneration, updateGeneration, activeGenerations } = useGenerationStore()
  const { profile, isProviderAllowed, getAllowedProviders } = useProfileStore()
  const { toast } = useToast()

  const [prompt, setPrompt] = useState("")
  const [selectedProvider, setSelectedProvider] = useState<Provider>("google-veo")
  const [duration, setDuration] = useState(4)
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1">("16:9")
  const [isGenerating, setIsGenerating] = useState(false)

  const allowedProviders = getAllowedProviders()

  const promptLimit = 500
  const providerConfig = PROVIDERS[selectedProvider]
  const durationOptions = useMemo(
    () => providerConfig.supportedDurations ?? Array.from({ length: providerConfig.maxDuration }, (_, index) => index + 1),
    [providerConfig]
  )
  const hasApiKey = hasKey(selectedProvider)
  const isAllowed = isProviderAllowed(selectedProvider)
  const canGenerate = hasApiKey && isAllowed

  useEffect(() => {
    if (!providerConfig.supportedRatios.includes(aspectRatio)) {
      setAspectRatio(providerConfig.supportedRatios[0])
    }
    if (!durationOptions.includes(duration)) {
      setDuration(durationOptions[0])
    }
  }, [providerConfig, aspectRatio, duration, durationOptions])

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Prompt required",
        description: "Tell us what you want to generate before starting.",
      })
      return
    }

    if (!isAllowed) {
      toast({
        variant: "destructive",
        title: "Provider access denied",
        description: "You do not have permission to use this provider. Contact your administrator.",
      })
      return
    }

    const apiKey = getDecryptedKey(selectedProvider)
    if (!apiKey) {
      toast({
        variant: "destructive",
        title: "No API key",
        description: "Add an API key for the selected provider first.",
      })
      return
    }

    const generationId = `gen-${Date.now()}`
    const newGeneration: GenerationRequest = {
      id: generationId,
      provider: selectedProvider,
      prompt: prompt.trim(),
      settings: {
        duration,
        aspectRatio,
      },
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    addGeneration(newGeneration)
    updateGeneration(generationId, { status: "generating" })
    setIsGenerating(true)

    try {
      const result = await generateVideo({
        provider: selectedProvider,
        prompt: prompt.trim(),
        settings: {
          duration,
          aspectRatio,
        },
        accessToken: apiKey,
      })

      updateGeneration(generationId, {
        status: "completed",
        resultUrl: result.resultUrl,
      })
      toast({
        title: "Generation complete",
        description: "Your video is ready to preview and download.",
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Generation failed. Please try again."
      updateGeneration(generationId, {
        status: "failed",
        error: message,
      })
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: message,
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async (generation: GenerationRequest) => {
    if (!generation.resultUrl) return

    try {
      const response = await fetch(generation.resultUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = `video-${generation.id}.mp4`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(url)
      toast({
        title: "Downloaded",
        description: "The video has been saved to your device.",
      })
    } catch {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "We couldn't download that video. Try again.",
      })
    }
  }

  const latestGeneration = generations[0]

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Generate Videos</h1>
        <p className="text-muted-foreground">
          Select a provider, write a prompt, and generate with your own API keys.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Prompt & Settings</CardTitle>
            <CardDescription>Configure your prompt and output settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select value={selectedProvider} onValueChange={(value) => setSelectedProvider(value as Provider)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROVIDERS).map(([providerId, provider]) => {
                    const hasAccess = allowedProviders.includes(providerId as Provider)
                    return (
                      <SelectItem 
                        key={providerId} 
                        value={providerId}
                        disabled={!hasAccess}
                      >
                        <div className="flex items-center gap-2">
                          {provider.name}
                          {!hasAccess && (
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {!hasApiKey && (
                <p className="text-xs text-muted-foreground">
                  No API key found. <Link className="text-primary hover:underline" href="/api-keys">Add a key</Link> to enable generation.
                </p>
              )}
              {!isAllowed && hasApiKey && (
                <p className="text-xs text-destructive">
                  You do not have access to this provider. Contact your administrator.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="prompt">Prompt</Label>
                <span className="text-xs text-muted-foreground">{prompt.length}/{promptLimit}</span>
              </div>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value.slice(0, promptLimit))}
                placeholder="Describe the video you want to generate..."
                className="flex min-h-[140px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select value={duration.toString()} onValueChange={(value) => setDuration(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((value) => (
                      <SelectItem key={value} value={value.toString()}>
                        {value} second{value > 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Aspect Ratio</Label>
                <Select value={aspectRatio} onValueChange={(value) => setAspectRatio(value as "16:9" | "9:16" | "1:1")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {providerConfig.supportedRatios.map((ratio) => (
                      <SelectItem key={ratio} value={ratio}>
                        {ratio}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Cost warning</p>
              <p className="mt-1">
                API usage is billed directly by the provider. Generations run against your BYOK access tokens.
              </p>
            </div>

            <Button className="w-full" onClick={handleGenerate} disabled={!canGenerate || isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Video
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generation Status</CardTitle>
            <CardDescription>Track progress and view results.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestGeneration ? (
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{PROVIDERS[latestGeneration.provider].name}</p>
                    <span className="text-xs rounded-full border px-2 py-1 capitalize">
                      {latestGeneration.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {latestGeneration.prompt}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {latestGeneration.settings.duration}s • {latestGeneration.settings.aspectRatio} • {format(new Date(latestGeneration.createdAt), "MMM d, HH:mm")}
                  </p>
                </div>

                {(latestGeneration.status === "generating" || latestGeneration.status === "pending") && (
                  <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {latestGeneration.status === "pending" ? "Preparing request..." : "Generating video..."}
                    </div>
                    <div className="mt-3 h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-1/2 rounded-full bg-primary animate-pulse" />
                    </div>
                  </div>
                )}

                {latestGeneration.status === "completed" && latestGeneration.resultUrl && (
                  <div className="space-y-3">
                    <video
                      src={latestGeneration.resultUrl}
                      controls
                      className="w-full rounded-lg bg-black"
                    />
                    <Button variant="outline" onClick={() => handleDownload(latestGeneration)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download Video
                    </Button>
                  </div>
                )}

                {latestGeneration.status === "failed" && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    {latestGeneration.error ?? "Generation failed. Please try again."}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No generations yet.</p>
                <p className="text-sm mt-1">Start your first video to see status updates here.</p>
              </div>
            )}

            {activeGenerations.length > 1 && (
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium">Active generations</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeGenerations.length} videos are currently generating.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
