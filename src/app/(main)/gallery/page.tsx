"use client"

import { useState } from "react"
import Link from "next/link"
import { Download, Search, Trash2, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PROVIDERS } from "@/lib/services/providers"
import { useGenerationStore } from "@/lib/store/generation-store"
import { GenerationRequest, Provider } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export default function GalleryPage() {
  const { generations, removeGeneration } = useGenerationStore()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterProvider, setFilterProvider] = useState<Provider | "all">("all")

  const filteredGenerations = generations.filter((generation) => {
    const matchesSearch = generation.prompt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesProvider = filterProvider === "all" || generation.provider === filterProvider
    return matchesSearch && matchesProvider
  })

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

  const handleDelete = (id: string) => {
    removeGeneration(id)
    toast({
      title: "Deleted",
      description: "Generation removed from your gallery.",
    })
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Video Gallery</h1>
        <p className="text-muted-foreground">
          Browse, filter, and manage all of your generated videos.
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by prompt..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterProvider} onValueChange={(value) => setFilterProvider(value as Provider | "all")}> 
              <SelectTrigger className="md:w-[220px]">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {Object.entries(PROVIDERS).map(([providerId, provider]) => (
                  <SelectItem key={providerId} value={providerId}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filteredGenerations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Video className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              {generations.length === 0
                ? "Start by generating your first video on the Generate page."
                : "Try adjusting your filters or search query."}
            </p>
            {generations.length === 0 && (
              <Button className="mt-4" asChild>
                <Link href="/generate">Generate Video</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGenerations.map((generation) => (
            <Card key={generation.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">
                    {PROVIDERS[generation.provider].name}
                  </CardTitle>
                  <span className="text-xs rounded-full border px-2 py-1 capitalize">
                    {generation.status}
                  </span>
                </div>
                <CardDescription className="line-clamp-2">
                  {generation.prompt}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                {generation.resultUrl ? (
                  <video
                    src={generation.resultUrl}
                    controls
                    className="w-full rounded-lg bg-black aspect-video"
                  />
                ) : (
                  <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                    <Video className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  {generation.settings.duration}s • {generation.settings.aspectRatio} • {format(new Date(generation.createdAt), "MMM d, yyyy")}
                </div>

                {generation.status === "failed" && generation.error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                    {generation.error}
                  </div>
                )}

                <div className="mt-auto flex gap-2">
                  {generation.status === "completed" && generation.resultUrl && (
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
                    className={generation.status === "completed" ? "" : "flex-1"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
