import Link from "next/link"
import { Key, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Generate AI Videos with Your Own Keys
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Bring Your Own Key - Connect Google Veo, Meta Movie Gen, and other providers to generate amazing videos securely.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/generate">
                <Button size="lg">
                  <Zap className="mr-2 h-5 w-5" />
                  Start Generating
                </Button>
              </Link>
              <Link href="/api-keys">
                <Button variant="outline" size="lg">
                  <Key className="mr-2 h-5 w-5" />
                  Add API Keys
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
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
                <CardTitle>Fast Generation</CardTitle>
                <CardDescription>
                  Direct API calls to providers for the fastest possible video generation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Queue multiple generations and track progress in real-time.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 rounded-lg border bg-muted/50 p-8">
            <h3 className="text-2xl font-semibold mb-4">How it works</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">1</div>
                <h4 className="font-semibold mb-2">Add API Keys</h4>
                <p className="text-sm text-muted-foreground">
                  Go to API Keys page and add your keys from supported providers.
                </p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">2</div>
                <h4 className="font-semibold mb-2">Generate Videos</h4>
                <p className="text-sm text-muted-foreground">
                  Enter your prompt, select a provider, and start generating.
                </p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">3</div>
                <h4 className="font-semibold mb-2">Download & Share</h4>
                <p className="text-sm text-muted-foreground">
                  View, download, and manage all your generated videos in the gallery.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Ready to get started?</CardTitle>
                <CardDescription>
                  Add your API keys and start generating amazing AI videos today.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/api-keys">
                  <Button size="lg" className="w-full">
                    Get Started
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
