"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { getUserById, updateUser } from "@/lib/actions/user"
import { Loader2, ArrowLeft } from "lucide-react"

export default function EditCustomerPage({ params }: { params: { id: string } }) {
  const userId = params.id
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [user, setUser] = useState(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await getUserById(userId)
        if (result.success) {
          setUser(result.data)
          setFormData({
            name: result.data.name,
            email: result.data.email,
            phone: result.data.phone || "",
            password: "",
          })
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to load customer",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [userId, toast])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Only include password if it's not empty
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      }

      if (formData.password) {
        updateData.password = formData.password
      }

      const result = await updateUser(userId, updateData)

      if (result.success) {
        toast({
          title: "Customer updated",
          description: "The customer has been updated successfully.",
        })
        router.push(`/admin/customers/${userId}`)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update customer",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.push("/admin/customers")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-[50vh]">
            <h2 className="text-2xl font-bold">Customer Not Found</h2>
            <p className="text-muted-foreground">The customer you're looking for doesn't exist or has been deleted.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push(`/admin/customers/${userId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customer
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Customer</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>Edit customer details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password (Leave blank to keep current)</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
              <p className="text-sm text-muted-foreground">
                Only enter a new password if you want to change the current one.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => router.push(`/admin/customers/${userId}`)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

