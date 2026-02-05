"use client"

import { useState, useEffect } from "react"
import { Video, Play, Film, Loader2, Download, Trash2, Clock, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PROVIDER_CONFIGS } from "@/lib/services/providers"
import { useApiKeysStore } from "@/lib/store/api-keys-store"
import { useGenerationStore } from "@/lib/store/generation-store"
import { VideoGenerationRequest, VideoProvider } from "@/lib/types"
import { generateVideo, checkGenerationStatus } from "@/lib/services/providers"
import { useToast } from "@/components/hooks/use-toast"
import { format } from "date-fns"

export default function GeneratePage() {
  const { hasApiKey, getApiKey, updateUsage } = useApiKeysStore()
  const { generations, addGeneration, updateGeneration, removeGeneration } = useGenerationStore()
  const { toast } = useToast()

  const [prompt, setPrompt] = useState('')
  const [selectedProvider, setSelectedProvider] = useState<VideoProvider>('google-veo')
  const [duration, setDuration] = useState(4)
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [quality, setQuality] = useState('standard')
  const [isGenerating, setIsGenerating] = useState(false)

  const availableProviders = Object.values(PROVIDER_CONFIGS).filter(p => hasApiKey(p.id))

  useEffect(() => {
    if (!hasApiKey(selectedProvider) && availableProviders.length > 0) {
      setSelectedProvider(availableProviders[0].id as VideoProvider)
    }
  }, [availableProviders, selectedProvider, hasApiKey])

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a prompt",
      })
      return
    }

    const apiKey = getApiKey(selectedProvider)
    if (!apiKey) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No API key found for selected provider",
      })
      return
    }

    setIsGenerating(true)
    
    const generation: VideoGenerationRequest = {
      id: `gen-${Date.now()}`,
      prompt,
      provider: selectedProvider,
      settings: { duration, aspectRatio, quality },
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
    }

    addGeneration(generation)

    try {
      const result = await generateVideo(selectedProvider, prompt, apiKey, { duration, aspectRatio, quality })
      
      updateGeneration(generation.id, {
        status: 'processing',
        progress: 10,
      })

      startPolling(generation.id, selectedProvider, result.generationId, apiKey)
    } catch (error) {
      updateGeneration(generation.id, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Failed to start generation',
      })
      updateUsage(selectedProvider, false, duration)
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error.message || "Failed to start video generation",
      })
      setIsGenerating(false)
    }
  }

  const startPolling = (generationId: string, provider: VideoProvider, apiGenerationId: string, apiKey: string) => {
    setActivePolling(prev => new Set(prev).add(generationId))

    const pollInterval = setInterval(async () => {
      try {
        const result = await checkGenerationStatus(provider, apiGenerationId, apiKey)
        
        if (result.status === 'completed') {
          updateGeneration(generationId, {
            status: 'completed',
            progress: 100,
            videoUrl: result.videoUrl,
            completedAt: new Date(),
          })
          updateUsage(provider, true, duration)
          toast({
            title: "Success",
            description: "Video generation completed!",
          })
          clearInterval(pollInterval)
          setActivePolling(prev => {
            const newSet = new Set(prev)
            newSet.delete(generationId)
            return newSet
          })
          setIsGenerating(false)
        } else if (result.status === 'failed') {
          updateGeneration(generationId, {
            status: 'failed',
            errorMessage: result.error || 'Generation failed',
          })
          updateUsage(provider, false, duration)
          toast({
            variant: "destructive",
            title: "Generation Failed",
            description: result.error || "Video generation failed",
          })
          clearInterval(pollInterval)
          setActivePolling(prev => {
            const newSet = new Set(prev)
            newSet.delete(generationId)
            return newSet
          })
          setIsGenerating(false)
        } else if (result.status === 'processing') {
          updateGeneration(generationId, {
            status: 'processing',
            progress: 50,
            videoUrl: result.videoUrl,
          })
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 3000)
  }

  const handleDownload = async (generation: VideoGenerationRequest) => {
    if (!generation.videoUrl) return

    try {
      const response = await fetch(generation.videoUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `video-${generation.id}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "Success",
        description: "Video downloaded successfully",
      })
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download video",
      })
    }
  }

  const handleDelete = (id: string) => {
    removeGeneration(id)
    toast({
      title: "Deleted",
      description: "Generation removed",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'completed':
        return <Video className="h-4 w-4 text-green-600" />
      case 'failed':
        return <Trash2 className="h-4 w-4 text-destructive" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Generate Videos</h1>
        <p className="text-muted-foreground">
          Create AI videos using your connected API keys.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Video Settings</CardTitle>
              <CardDescription>
                Configure your video generation parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select value={selectedProvider} onValueChange={(v) => setSelectedProvider(v as VideoProvider)} disabled={availableProviders.length === 0}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProviders.map(provider => (
                      <SelectItem key={provider.id} value={provider.id}>
                        <div className="flex items-center gap-2">
                          {provider.icon === 'Video' && <Video className="h-4 w-4" />}
                          {provider.icon === 'Film' && <Film className="h-4 w-4" />}
                          {provider.icon === 'Play' && <Play className="h-4 w-4" />}
                          {provider.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableProviders.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No API keys configured. <a href="/api-keys" className="text-primary hover:underline">Add API keys</a>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt</Label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the video you want to generate..."
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  disabled={isGenerating}
                />
              </div>

              <Tabs defaultValue="basic">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedProvider && Array.from({ length: PROVIDER_CONFIGS[selectedProvider]?.maxDuration || 4 }, (_, i) => i + 1).map(d => (
                          <SelectItem key={d} value={d.toString()}>{d} second{d > 1 ? 's' : ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Aspect Ratio</Label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                        <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                        <SelectItem value="1:1">1:1 (Square)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Quality</Label>
                    <Select value={quality} onValueChange={setQuality}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="rounded-lg border bg-muted/50 p-4">
                    <div className="flex items-start gap-2">
                      <Settings2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="text-sm">
                        <p className="font-medium">Provider-specific settings</p>
                        <p className="text-muted-foreground mt-1">
                          Additional settings vary by provider and may be added in future updates.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !prompt.trim() || availableProviders.length === 0}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Video className="mr-2 h-4 w-4" />
                    Generate Video
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generation Queue</CardTitle>
              <CardDescription>
                Track your video generations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generations.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No generations yet</p>
                    <p className="text-sm mt-1">Start by creating your first video</p>
                  </div>
                ) : (
                  generations.slice(0, 5).map(generation => (
                    <div key={generation.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(generation.status)}
                          <span className="text-sm font-medium capitalize">{generation.status}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(generation.id)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <p className="text-sm line-clamp-2">{generation.prompt}</p>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{PROVIDER_CONFIGS[generation.provider]?.name}</span>
                        <span>•</span>
                        <span>{format(new Date(generation.createdAt), 'MMM d, HH:mm')}</span>
                      </div>

                      {generation.status === 'processing' && (
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${generation.progress}%` }}
                          />
                        </div>
                      )}

                      {generation.status === 'completed' && generation.videoUrl && (
                        <div className="space-y-2">
                          <video
                            src={generation.videoUrl}
                            controls
                            className="w-full rounded-lg bg-black"
                          />
                          <Button
                            onClick={() => handleDownload(generation)}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Video
                          </Button>
                        </div>
                      )}

                      {generation.status === 'failed' && (
                        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                          {generation.errorMessage}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {generations.length > 5 && (
                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/gallery">View All Generations</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
