import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getUserById } from "@/lib/actions/user"
import { getUserAddresses } from "@/lib/actions/address"
import { getAllOrders } from "@/lib/actions/order"
import { formatDate, formatPrice } from "@/lib/utils"
import { MapPin, ShoppingBag, Edit, Plus } from "lucide-react"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin?callbackUrl=/profile")
  }

  const userId = session.user.id
  const { data: user } = await getUserById(userId)
  const { data: addresses } = await getUserAddresses(userId)
  const { data: orders } = await getAllOrders({ userId, limit: 5 })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue={user?.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user?.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" defaultValue={user?.phone || ""} />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Update Password</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="addresses">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Your Addresses</h2>
            <Button asChild>
              <Link href="/profile/addresses/new">
                <Plus className="mr-2 h-4 w-4" />
                Add New Address
              </Link>
            </Button>
          </div>

          {addresses && addresses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((address) => (
                <Card key={address.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">
                        {address.isDefault && <Badge className="mr-2">Default</Badge>}
                        Shipping Address
                      </CardTitle>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/profile/addresses/${address.id}`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p>{address.street}</p>
                      <p>
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p>{address.country}</p>
                    </div>
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
        </TabsContent>

        <TabsContent value="orders">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <Button asChild variant="outline">
              <Link href="/orders">View All Orders</Link>
            </Button>
          </div>

          {orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                      <Badge variant="outline">{order.status}</Badge>
                    </div>
                    <CardDescription>Placed on {formatDate(order.createdAt)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {order.items.length} {order.items.length === 1 ? "item" : "items"}
                        </p>
                        <p className="font-medium">{formatPrice(order.total)}</p>
                      </div>
                      <Button asChild size="sm">
                        <Link href={`/orders/${order.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ShoppingBag className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No orders found</h3>
                <p className="text-muted-foreground text-center max-w-md mb-4">You haven't placed any orders yet.</p>
                <Button asChild>
                  <Link href="/products">Start Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

