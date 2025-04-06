import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAllOrders } from "@/lib/actions/order"
import { formatPrice, formatDate } from "@/lib/utils"
import { ShoppingBag, Eye } from "lucide-react"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin?callbackUrl=/orders")
  }

  const userId = session.user.id
  const { data: orders } = await getAllOrders({ userId })

  function getOrderStatusColor(status: string) {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      case "PROCESSING":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "SHIPPED":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "DELIVERED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>

      {orders && orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Order #{order.orderNumber}</CardTitle>
                  <p className="text-sm text-muted-foreground">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <Badge className={getOrderStatusColor(order.status)}>{order.status}</Badge>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/orders/${order.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="font-medium text-sm mb-1">Items</h3>
                      <p>{order.items.length} items</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm mb-1">Payment</h3>
                      <Badge variant="outline">{order.payment.status}</Badge>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm mb-1">Total</h3>
                      <p className="font-bold">{formatPrice(order.total)}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-medium text-sm mb-2">Order Items</h3>
                    <div className="grid gap-2">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
                            <ShoppingBag className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-sm text-muted-foreground">+{order.items.length - 3} more items</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg">
          <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-medium mb-2">No orders yet</h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            You haven't placed any orders yet. Start shopping to place your first order.
          </p>
          <Button asChild size="lg">
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

