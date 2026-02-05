"use client"

import Link from "next/link"
import { Key, Shield, Zap, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useApiKeysStore } from "@/lib/store/api-keys-store"
import { useGenerationStore } from "@/lib/store/generation-store"
import { PROVIDERS } from "@/lib/services/providers"

export default function HomePage() {
  const { apiKeys } = useApiKeysStore()
  const { generations } = useGenerationStore()

  const connectedProviders = Object.values(apiKeys).filter(Boolean).length
  const recentGenerations = generations.slice(0, 3)

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-2 text-xs font-medium text-muted-foreground mb-6">
              Bring Your Own Key for AI Video Generation
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Generate AI Videos with Your Own Keys
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Connect Google Veo, Meta Movie Gen, and Runway Gen-3 to a unified workspace. Your keys stay encrypted on your device.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/generate">
                <Button size="lg">
                  <Zap className="mr-2 h-5 w-5" />
                  Start Generating
                </Button>
              </Link>
              <Link href="/api-keys">
                <Button variant="outline" size="lg">
                  <Key className="mr-2 h-5 w-5" />
                  Manage API Keys
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-12">
            <Card>
              <CardHeader>
                <CardDescription>Connected Providers</CardDescription>
                <CardTitle className="text-3xl">{connectedProviders}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {connectedProviders === 0
                  ? "Connect your first provider to begin generating."
                  : `${connectedProviders} of ${Object.keys(PROVIDERS).length} providers ready.`}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Videos Generated</CardDescription>
                <CardTitle className="text-3xl">{generations.length}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Track every generation across providers in one place.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Security Status</CardDescription>
                <CardTitle className="text-3xl">Encrypted</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                All API keys are AES-encrypted before they touch localStorage.
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Key className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Bring Your Own Keys</CardTitle>
                <CardDescription>
                  Use your own API keys from multiple providers. We never store your keys on our servers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Supports Google Veo 2, Meta Movie Gen, Runway Gen-3, and more coming soon.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  All API keys are encrypted locally in your browser using AES encryption.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your keys never leave your device unencrypted. Complete control over your data.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Unified Generation</CardTitle>
                <CardDescription>
                  One workflow for all providers with a consistent prompt and settings interface.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Compare outputs and iterate faster with a single generation queue.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Recent Generations</CardTitle>
                <CardDescription>Latest outputs across all providers.</CardDescription>
              </CardHeader>
              <CardContent>
                {recentGenerations.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No videos generated yet.</p>
                    <p className="text-sm mt-1">Generate your first video to see it here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentGenerations.map((generation) => (
                      <div key={generation.id} className="flex items-start justify-between rounded-lg border p-4">
                        <div>
                          <p className="text-sm font-medium line-clamp-2">{generation.prompt}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {PROVIDERS[generation.provider].name} • {generation.settings.duration}s • {generation.status}
                          </p>
                        </div>
                        <span className="text-xs rounded-full border px-2 py-1 capitalize text-muted-foreground">
                          {generation.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
                <CardDescription>
                  Add keys, set prompts, and start generating with full cost transparency.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  All API usage is billed directly to your provider accounts. Keep an eye on usage limits and costs.
                </p>
                <Link href="/api-keys">
                  <Button size="lg" className="w-full">
                    Connect Providers
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
