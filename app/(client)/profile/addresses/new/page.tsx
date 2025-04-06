import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { createAddress } from "@/lib/actions/address"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function NewAddressPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin?callbackUrl=/profile/addresses/new")
  }

  const userId = session.user.id

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Button variant="ghost" asChild className="mr-4">
          <Link href="/profile/addresses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Addresses
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Add New Address</h1>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
          </CardHeader>
          <form
            action={async (formData) => {
              "use server"

              const name = formData.get("name") as string
              const street = formData.get("street") as string
              const city = formData.get("city") as string
              const state = formData.get("state") as string
              const postalCode = formData.get("postalCode") as string
              const country = formData.get("country") as string
              const phone = formData.get("phone") as string
              const isDefault = formData.get("isDefault") === "on"

              if (!street || !city || !state || !postalCode || !country) {
                // Handle validation error
                return
              }

              const result = await createAddress({
                userId,
                name,
                street,
                city,
                state,
                postalCode,
                country,
                phone,
                isDefault,
              })

              if (result.success) {
                redirect("/profile/addresses")
              }
            }}
          >
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Address Name (Optional)</Label>
                <Input id="name" name="name" placeholder="Home, Work, etc." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input id="street" name="street" placeholder="123 Main St" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" placeholder="New York" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input id="state" name="state" placeholder="NY" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input id="postalCode" name="postalCode" placeholder="10001" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" name="country" placeholder="United States" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input id="phone" name="phone" type="tel" placeholder="+1 (555) 123-4567" />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="isDefault" name="isDefault" />
                <Label htmlFor="isDefault">Set as default address</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit">Save Address</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

