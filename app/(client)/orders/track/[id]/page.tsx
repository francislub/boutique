"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getOrderById } from "@/lib/actions/order"
import { formatPrice, formatDateTime } from "@/lib/utils"
import { ShoppingBag, ArrowLeft, Package, Truck, CheckCircle, XCircle, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function OrderTrackingPage({
  params,
}: {
  params: { id: string }
}) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await getOrderById(params.id)
        if (response.data) {
          setOrder(response.data)
        } else {
          setError("Order not found")
        }
      } catch (err) {
        setError("Failed to load order")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="mb-6">{error || "Order not found"}</p>
          <Button asChild>
            <Link href="/orders">Back to Orders</Link>
          </Button>
        </div>
      </div>
    )
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

  // Calculate estimated delivery date (for demo purposes)
  const orderDate = new Date(order.createdAt)
  const estimatedDelivery = new Date(orderDate)
  estimatedDelivery.setDate(orderDate.getDate() + 5) // 5 days from order date

  // Mock tracking data
  const trackingEvents = [
    {
      status: "Order Placed",
      location: "Online",
      timestamp: order.createdAt,
      description: "Your order has been received and is being processed.",
      completed: true,
    },
    {
      status: "Payment Confirmed",
      location: "Payment Gateway",
      timestamp: new Date(new Date(order.createdAt).getTime() + 1000 * 60 * 30).toISOString(), // 30 mins after order
      description: "Payment has been confirmed and verified.",
      completed: order.payment.status === "COMPLETED",
    },
    {
      status: "Processing",
      location: "Warehouse",
      timestamp: new Date(new Date(order.createdAt).getTime() + 1000 * 60 * 60 * 2).toISOString(), // 2 hours after order
      description: "Your order is being prepared for shipping.",
      completed: ["PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status),
    },
    {
      status: "Shipped",
      location: "Distribution Center",
      timestamp: new Date(new Date(order.createdAt).getTime() + 1000 * 60 * 60 * 24).toISOString(), // 1 day after order
      description: "Your order has been shipped and is on its way.",
      completed: ["SHIPPED", "DELIVERED"].includes(order.status),
    },
    {
      status: "Out for Delivery",
      location: "Local Courier",
      timestamp: new Date(new Date(order.createdAt).getTime() + 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days after order
      description: "Your order is out for delivery to your address.",
      completed: order.status === "DELIVERED",
    },
    {
      status: "Delivered",
      location: order.shippingAddress.city,
      timestamp: new Date(new Date(order.createdAt).getTime() + 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days after order
      description: "Your order has been delivered successfully.",
      completed: order.status === "DELIVERED",
    },
  ]

  // If order is cancelled, add cancellation event
  if (order.status === "CANCELLED") {
    trackingEvents.push({
      status: "Cancelled",
      location: "System",
      timestamp: new Date().toISOString(), // Current time as placeholder
      description: "Your order has been cancelled.",
      completed: true,
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Button variant="ghost" asChild className="mr-4">
          <Link href={`/orders/${order.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Order Details
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Track Order</h1>
        <Badge className={`ml-4 ${getOrderStatusColor(order.status)}`}>{order.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Tracking Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Tracking Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l-2 border-gray-200 dark:border-gray-800 pl-8 space-y-10">
                {trackingEvents.map((event, index) => (
                  <div key={index} className="relative">
                    <div
                      className={`absolute w-4 h-4 rounded-full -left-[10px] -top-1 ${
                        event.completed ? "bg-primary" : "bg-gray-300 dark:bg-gray-700"
                      }`}
                    ></div>
                    <div className="mb-1 flex items-center">
                      <h3 className="font-medium text-lg">{event.status}</h3>
                      {event.completed && (
                        <Badge variant="outline" className="ml-2">
                          {getStatusIcon(event.status === "Shipped" ? "SHIPPED" : event.status.toUpperCase())}
                          <span className="ml-1">Completed</span>
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-1">
                      {event.location} • {formatDateTime(event.timestamp)}
                    </p>
                    <p className="text-sm">{event.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Map (Placeholder) */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-md h-64 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Delivering to:</p>
                  <p className="font-medium">{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                </div>
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
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Order Number:</span>
                  <span>#{order.orderNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Order Date:</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Items:</span>
                  <span>{order.items.reduce((acc, item) => acc + item.quantity, 0)} items</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold">{formatPrice(order.total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Estimated Delivery:</span>
                  <span>{estimatedDelivery.toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Items in Your Order</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-16 h-16 relative rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
                      {item.product.images && item.product.images.length > 0 ? (
                        <Image
                          src={item.product.images[0] || "/placeholder.svg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gray-200 dark:bg-gray-700">
                          <ShoppingBag className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">{item.product.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <Button variant="outline" asChild className="w-full">
                    <Link href={`/orders/${order.id}`}>View All Items ({order.items.length})</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                If you have any questions about your order or delivery, our customer support team is here to help.
              </p>
              <Button className="w-full" asChild>
                <Link href="/support">Contact Support</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href={`/orders/${order.id}/receipt`}>Print Receipt</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/orders">View All Orders</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
