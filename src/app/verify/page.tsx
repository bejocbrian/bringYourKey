"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, RefreshCw, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function VerifyPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Get current user's email
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || null)
        
        // If email is already verified, redirect to home
        if (user.email_confirmed_at) {
          router.push('/')
        }
      } else {
        // If no user, redirect to login
        router.push('/login')
      }
    }

    getUser()
  }, [router, supabase.auth])

  const handleResendEmail = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      if (!userEmail) {
        setMessage({ type: 'error', text: 'No email found. Please sign up again.' })
        setIsLoading(false)
        return
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Verification email sent! Please check your inbox.' })
      }
    } catch (err) {
      console.error("Resend error:", err)
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckVerification = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      // Refresh the session to get the latest user data
      const { data: { session }, error } = await supabase.auth.refreshSession()

      if (error) {
        setMessage({ type: 'error', text: 'Failed to check verification status. Please try again.' })
        setIsLoading(false)
        return
      }

      if (session?.user?.email_confirmed_at) {
        setMessage({ type: 'success', text: 'Email verified! Redirecting...' })
        setTimeout(() => {
          router.push('/')
          router.refresh()
        }, 1500)
      } else {
        setMessage({ type: 'error', text: 'Email not verified yet. Please check your inbox and click the verification link.' })
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Check verification error:", err)
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' })
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
          <CardDescription>
            We&apos;ve sent a verification link to{" "}
            <span className="font-medium text-foreground">{userEmail}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Please check your email inbox and click the verification link to activate your account.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button
              onClick={handleCheckVerification}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {isLoading ? "Checking..." : "I've verified my email"}
            </Button>

            <Button
              onClick={handleResendEmail}
              disabled={isLoading}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Mail className="mr-2 h-4 w-4" />
              Resend verification email
            </Button>

            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="w-full"
              size="lg"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Didn&apos;t receive the email? Check your spam folder or click the resend button above.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
