"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ShieldAlert } from "lucide-react"
import Link from "next/link"
import { createUser } from "@/lib/actions/user"
import { UserRole } from "@prisma/client"

export default function AdminSignUp() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    adminCode: "", // Admin registration code for security
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    // Validate admin code (this is a simple example - in production, use a more secure method)
    // In a real application, this would be a secure code or invite-only system
    if (formData.adminCode !== "ADMIN123") {
      setError("Invalid admin registration code")
      setIsLoading(false)
      return
    }

    try {
      const result = await createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: UserRole.ADMIN, // Set role to ADMIN
      })

      if (!result.success) {
        setError(result.error || "Failed to create admin account")
        setIsLoading(false)
        return
      }

      // Redirect to admin dashboard or sign in page
      router.push("/auth/signin?registered=true&admin=true")
    } catch (error) {
      setError("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md border-2 border-amber-500">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <ShieldAlert className="h-10 w-10 text-amber-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Admin Registration</CardTitle>
          <CardDescription className="text-center">
            Create an administrator account for the boutique management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Admin Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (optional)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminCode">Admin Registration Code</Label>
              <Input
                id="adminCode"
                name="adminCode"
                type="password"
                placeholder="Enter admin registration code"
                value={formData.adminCode}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">This code is provided by the system administrator</p>
            </div>
            <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600" disabled={isLoading}>
              {isLoading ? "Creating admin account..." : "Create admin account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-muted-foreground text-center">
            Already have an admin account?{" "}
            <Link href="/auth/signin" className="text-amber-500 hover:underline">
              Sign in
            </Link>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            Need a customer account instead?{" "}
            <Link href="/auth/signup" className="text-primary hover:underline">
              Register as customer
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

