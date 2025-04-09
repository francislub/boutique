import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getOrderById } from "@/lib/actions/order"
import { formatPrice, formatDateTime } from "@/lib/utils"
import { ShoppingBag, ArrowLeft, Package, Truck, CheckCircle, XCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin?callbackUrl=/orders")
  }

  const { data: order } = await getOrderById(params.id)

  if (!order) {
    notFound()
  }

  // Verify the order belongs to the current user
  if (order.userId !== session.user.id) {
    redirect("/orders")
  }

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

  function getPaymentStatusColor(status: string) {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "PENDING":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      case "FAILED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "REFUNDED":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "PENDING":
        return <Package className="h-5 w-5 text-amber-600" />
      case "PROCESSING":
        return <Package className="h-5 w-5 text-blue-600" />
      case "SHIPPED":
        return <Truck className="h-5 w-5 text-purple-600" />
      case "DELIVERED":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "CANCELLED":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Button variant="ghost" asChild className="mr-4">
          <Link href="/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Order #{order.orderNumber}</h1>
        <Badge className={`ml-4 ${getOrderStatusColor(order.status)}`}>{order.status}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-4 py-4 border-b last:border-0">
                    <div className="w-full sm:w-24 h-24 relative rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
                      {item.product.images && item.product.images.length > 0 ? (
                        <Image
                          src={item.product.images[0] || "/placeholder.svg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gray-200 dark:bg-gray-700">
                          <ShoppingBag className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between">
                        <Link href={`/products/${item.product.slug}`} className="font-medium hover:underline">
                          {item.product.name}
                        </Link>
                        <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                      </div>

                      {item.variant && (
                        <div className="text-sm text-gray-500 mt-1">
                          {Object.entries(item.variant.attributes)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(", ")}
                        </div>
                      )}

                      <div className="mt-2 text-sm text-gray-500">
                        Quantity: {item.quantity} × {formatPrice(item.price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l-2 border-gray-200 dark:border-gray-800 pl-8 pb-2 space-y-8">
                <div className="absolute w-4 h-4 rounded-full bg-blue-600 -left-[9px] top-0"></div>
                <div>
                  <h3 className="font-medium">Order Placed</h3>
                  <p className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</p>
                </div>

                {order.status !== "PENDING" && (
                  <>
                    <div className="absolute w-4 h-4 rounded-full bg-blue-600 -left-[9px] top-[100px]"></div>
                    <div>
                      <h3 className="font-medium">Processing</h3>
                      <p className="text-sm text-gray-500">Your order is being processed</p>
                    </div>
                  </>
                )}

                {(order.status === "SHIPPED" || order.status === "DELIVERED") && (
                  <>
                    <div className="absolute w-4 h-4 rounded-full bg-blue-600 -left-[9px] top-[200px]"></div>
                    <div>
                      <h3 className="font-medium">Shipped</h3>
                      <p className="text-sm text-gray-500">Your order has been shipped</p>
                    </div>
                  </>
                )}

                {order.status === "DELIVERED" && (
                  <>
                    <div className="absolute w-4 h-4 rounded-full bg-blue-600 -left-[9px] top-[300px]"></div>
                    <div>
                      <h3 className="font-medium">Delivered</h3>
                      <p className="text-sm text-gray-500">Your order has been delivered</p>
                    </div>
                  </>
                )}

                {order.status === "CANCELLED" && (
                  <>
                    <div className="absolute w-4 h-4 rounded-full bg-red-600 -left-[9px] top-[100px]"></div>
                    <div>
                      <h3 className="font-medium">Cancelled</h3>
                      <p className="text-sm text-gray-500">Your order has been cancelled</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{formatPrice(order.shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Payment Status</span>
                  <Badge className={getPaymentStatusColor(order.payment.status)}>{order.payment.status}</Badge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium">Payment Method</span>
                  <span className="text-sm">{order.payment.method}</span>
                </div>
                {order.payment.transactionId && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-medium">Transaction ID</span>
                    <span className="text-sm">{order.payment.transactionId}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href={`/products`}>Continue Shopping</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/orders/${order.id}/receipt`}>Print Receipt</Link>
            </Button>
            {order.status === "DELIVERED" && <Button variant="outline">Write a Review</Button>}
          </div>
        </div>
      </div>
    </div>
  )
}
