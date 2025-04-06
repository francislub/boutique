import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getUserAddresses } from "@/lib/actions/address"
import { MapPin, Edit, Plus, Trash } from "lucide-react"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { deleteAddress, setDefaultAddress } from "@/lib/actions/address"

export default async function AddressesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin?callbackUrl=/profile/addresses")
  }

  const userId = session.user.id
  const { data: addresses } = await getUserAddresses(userId)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Addresses</h1>
        <Button asChild>
          <Link href="/profile/addresses/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Address
          </Link>
        </Button>
      </div>

      {addresses && addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <Card key={address.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    {address.isDefault && <Badge className="mr-2">Default</Badge>}
                    {address.name || "Shipping Address"}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/profile/addresses/${address.id}`}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                    <form
                      action={async () => {
                        "use server"
                        await deleteAddress(userId, address.id)
                      }}
                    >
                      <Button variant="ghost" size="icon" type="submit" className="text-red-500 hover:text-red-700">
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </form>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p>{address.street}</p>
                  <p>
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p>{address.country}</p>
                  {address.phone && <p>Phone: {address.phone}</p>}
                </div>

                {!address.isDefault && (
                  <form
                    action={async () => {
                      "use server"
                      await setDefaultAddress(userId, address.id)
                    }}
                    className="mt-4"
                  >
                    <Button type="submit" variant="outline" size="sm">
                      Set as Default
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No addresses found</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              You haven't added any addresses yet. Add an address to make checkout faster.
            </p>
            <Button asChild>
              <Link href="/profile/addresses/new">
                <Plus className="mr-2 h-4 w-4" />
                Add New Address
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

