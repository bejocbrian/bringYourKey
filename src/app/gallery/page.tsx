"use client"

import { useState } from "react"
import { Video, Film, Play, Download, Trash2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PROVIDER_CONFIGS } from "@/lib/services/providers"
import { useGenerationStore } from "@/lib/store/generation-store"
import { VideoGenerationRequest, VideoProvider } from "@/lib/types"
import { useToast } from "@/components/hooks/use-toast"
import { format } from "date-fns"

export default function GalleryPage() {
  const { generations, removeGeneration, clearFailedGenerations } = useGenerationStore()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterProvider, setFilterProvider] = useState<VideoProvider | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'failed' | 'processing'>('all')

  const filteredGenerations = generations.filter(gen => {
    const matchesSearch = gen.prompt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesProvider = filterProvider === 'all' || gen.provider === filterProvider
    const matchesStatus = filterStatus === 'all' || gen.status === filterStatus
    return matchesSearch && matchesProvider && matchesStatus
  })

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

  const handleClearFailed = () => {
    clearFailedGenerations()
    toast({
      title: "Success",
      description: "Failed generations cleared",
    })
  }

  const completedCount = generations.filter(g => g.status === 'completed').length
  const failedCount = generations.filter(g => g.status === 'failed').length
  const processingCount = generations.filter(g => g.status === 'processing').length

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Video Gallery</h1>
        <p className="text-muted-foreground">
          Browse and manage all your generated videos.
        </p>
      </div>

      <div className="grid gap-6 mb-8 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-3xl">{generations.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-green-600">Completed</CardDescription>
            <CardTitle className="text-3xl">{completedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-600">Processing</CardDescription>
            <CardTitle className="text-3xl">{processingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-destructive">Failed</CardDescription>
            <CardTitle className="text-3xl">{failedCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by prompt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterProvider} onValueChange={(v) => setFilterProvider(v as VideoProvider | 'all')}>
              <SelectTrigger className="md:w-[200px]">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {Object.values(PROVIDER_CONFIGS).map(provider => (
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
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as 'all' | 'completed' | 'failed' | 'processing')}>
              <SelectTrigger className="md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            {failedCount > 0 && (
              <Button variant="outline" onClick={handleClearFailed}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Failed
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {filteredGenerations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Video className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No videos found</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              {generations.length === 0
                ? "Start by generating your first video on the Generate page."
                : "Try adjusting your filters or search query."}
            </p>
            {generations.length === 0 && (
              <Button className="mt-4" asChild>
                <a href="/generate">Generate Video</a>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGenerations.map(generation => {
            const Icon = PROVIDER_CONFIGS[generation.provider]?.icon === 'Video' 
              ? Video 
              : PROVIDER_CONFIGS[generation.provider]?.icon === 'Film' 
              ? Film 
              : Play

            const statusColors = {
              completed: 'bg-green-100 text-green-700',
              processing: 'bg-blue-100 text-blue-700',
              failed: 'bg-red-100 text-red-700',
              pending: 'bg-gray-100 text-gray-700',
            }

            return (
              <Card key={generation.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {PROVIDER_CONFIGS[generation.provider]?.name}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[generation.status]}`}>
                      {generation.status}
                    </span>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {generation.prompt}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {generation.videoUrl ? (
                    <video
                      src={generation.videoUrl}
                      controls
                      className="w-full rounded-lg bg-black aspect-video"
                    />
                  ) : (
                    <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                      <Video className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {generation.settings.duration}s • {generation.settings.aspectRatio}
                    </span>
                    <span>
                      {format(new Date(generation.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>

                  {generation.status === 'processing' && (
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${generation.progress}%` }}
                      />
                    </div>
                  )}

                  {generation.status === 'failed' && (
                    <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                      {generation.errorMessage}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {generation.status === 'completed' && (
                      <Button
                        onClick={() => handleDownload(generation)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDelete(generation.id)}
                      variant="ghost"
                      size="sm"
                      className={generation.status === 'completed' ? '' : 'flex-1'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
