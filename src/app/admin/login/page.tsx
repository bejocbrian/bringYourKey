"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Lock, Mail, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { useAdminStore } from "@/lib/store/admin-store"
import { useToast } from "@/hooks/use-toast"
import { isDisposableEmail } from "@/lib/auth/disposable-domains"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { login } = useAdminStore()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate email
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    // Check for disposable email
    if (isDisposableEmail(email)) {
      setError("Disposable email addresses are not allowed.")
      return
    }

    setIsLoading(true)

    try {
      // Sign in with Supabase
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setIsLoading(false)
        return
      }

      if (!authData.user) {
        setError("Authentication failed")
        setIsLoading(false)
        return
      }

      // Check if user has admin role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single()

      if (profileError || !profile) {
        setError("Failed to verify admin privileges")
        setIsLoading(false)
        return
      }

      if (profile.role !== "admin" && profile.role !== "superadmin") {
        setError("You do not have admin privileges")
        await supabase.auth.signOut()
        setIsLoading(false)
        return
      }

      // Also set the local admin store for backward compatibility
      login("admin", "admin123") // This sets isAuthenticated to true

      toast({
        title: "Login successful",
        description: "Welcome to the admin panel.",
      })
      router.push("/admin")
    } catch (err) {
      console.error("Admin login error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-2 mb-8">
        <Shield className="h-8 w-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          BYOK <span className="text-indigo-600">Admin</span>
        </h1>
      </div>

      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Admin Sign in</CardTitle>
          <CardDescription>
            Sign in with your admin account to access the panel
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@company.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <p className="mt-8 text-sm text-slate-500 max-w-md text-center">
        Admin access requires a Supabase account with admin or superadmin role.
        Regular user accounts cannot access this panel.
      </p>
    </div>
  )
}
