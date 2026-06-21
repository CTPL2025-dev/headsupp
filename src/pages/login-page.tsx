import * as React from "react"
import { Navigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"

export function LoginPage() {
  const { session, loading, signInWithOtp } = useAuth()
  const [email, setEmail] = React.useState("")
  const [sending, setSending] = React.useState(false)
  const [sent, setSent] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  if (!loading && session) {
    return <Navigate to="/board" replace />
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSending(true)
    const { error: signInError } = await signInWithOtp(email.trim())
    setSending(false)
    if (signInError) {
      setError(signInError)
      return
    }
    setSent(true)
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Heads Up</CardTitle>
          <CardDescription>
            Sign in with your team email to triage and track feedback tickets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <p className="text-sm text-muted-foreground">
              Check <span className="font-medium text-foreground">{email}</span> for a magic
              sign-in link.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={sending || !email.trim()} className="w-full">
                {sending ? "Sending link…" : "Send magic link"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
