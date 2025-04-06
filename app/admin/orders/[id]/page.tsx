"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { getOrderById, updateOrderStatus, updatePaymentStatus } from "@/lib/actions/order"
import { formatPrice, formatDateTime } from "@/lib/utils"
import { Loader2, ArrowLeft, Printer, Package, Truck, CheckCircle, XCircle } from "lucide-react"
import { OrderStatus, PaymentStatus } from "@prisma/client"

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const orderId = params.id
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [order, setOrder] = useState(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const result = await getOrderById(orderId)
        if (result.success) {
          setOrder(result.data)
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to load order",
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

    fetchOrder()
  }, [orderId, toast])

  const handleStatusChange = async (status: OrderStatus) => {
    setIsUpdating(true)

    try {
      const result = await updateOrderStatus(orderId, status)

      if (result.success) {
        setOrder((prev) => ({ ...prev, status }))
        toast({
          title: "Order updated",
          description: "Order status has been updated successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update order status",
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
      setIsUpdating(false)
    }
  }

  const handlePaymentStatusChange = async (status: PaymentStatus) => {
    setIsUpdating(true)

    try {
      const result = await updatePaymentStatus(orderId, status)

      if (result.success) {
        setOrder((prev) => ({ ...prev, payment: { ...prev.payment, status } }))
        toast({
          title: "Payment updated",
          description: "Payment status has been updated successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update payment status",
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
      setIsUpdating(false)
    }
  }

  function getOrderStatusColor(status: OrderStatus) {
    switch (status) {
      case OrderStatus.PENDING:
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      case OrderStatus.PROCESSING:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case OrderStatus.SHIPPED:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case OrderStatus.DELIVERED:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case OrderStatus.CANCELLED:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  function getPaymentStatusColor(status: PaymentStatus) {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case PaymentStatus.PENDING:
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      case PaymentStatus.FAILED:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case PaymentStatus.REFUNDED:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  function getStatusIcon(status: OrderStatus) {
    switch (status) {
      case OrderStatus.PENDING:
        return <Package className="h-5 w-5 text-amber-600" />
      case OrderStatus.PROCESSING:
        return <Package className="h-5 w-5 text-blue-600" />
      case OrderStatus.SHIPPED:
        return <Truck className="h-5 w-5 text-purple-600" />
      case OrderStatus.DELIVERED:
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case OrderStatus.CANCELLED:
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.push("/admin/orders")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-[50vh]">
            <h2 className="text-2xl font-bold">Order Not Found</h2>
            <p className="text-muted-foreground">The order you're looking for doesn't exist or has been deleted.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push("/admin/orders")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Order #{order.orderNumber}</h1>
          <Badge className={getOrderStatusColor(order.status)}>{order.status}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
            <CardDescription>Placed on {formatDateTime(order.createdAt)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.product.name}
                          {item.variant && (
                            <div className="text-xs text-muted-foreground">
                              {Object.entries(item.variant.attributes)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(", ")}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{formatPrice(item.price)}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatPrice(item.price * item.quantity)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{formatPrice(order.shipping)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="font-medium">{order.user.name}</div>
                <div className="text-sm">{order.user.email}</div>
                {order.user.phone && <div className="text-sm">{order.user.phone}</div>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <div>{order.shippingAddress.street}</div>
                <div>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </div>
                <div>{order.shippingAddress.country}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Method</span>
                  <span className="text-sm font-medium">{order.payment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Status</span>
                  <Badge className={getPaymentStatusColor(order.payment.status)}>{order.payment.status}</Badge>
                </div>
                {order.payment.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-sm">Transaction ID</span>
                    <span className="text-sm font-medium">{order.payment.transactionId}</span>
                  </div>
                )}
                {order.payment.paymentDate && (
                  <div className="flex justify-between">
                    <span className="text-sm">Payment Date</span>
                    <span className="text-sm font-medium">{formatDateTime(order.payment.paymentDate)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Update Payment Status</label>
                <Select
                  value={order.payment.status}
                  onValueChange={(value) => handlePaymentStatusChange(value as PaymentStatus)}
                  disabled={isUpdating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PaymentStatus.PENDING}>Pending</SelectItem>
                    <SelectItem value={PaymentStatus.COMPLETED}>Completed</SelectItem>
                    <SelectItem value={PaymentStatus.FAILED}>Failed</SelectItem>
                    <SelectItem value={PaymentStatus.REFUNDED}>Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Status</CardTitle>
          <CardDescription>Update the current status of this order</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getStatusIcon(order.status)}
                <div>
                  <p className="font-medium">Current Status: {order.status}</p>
                  <p className="text-sm text-muted-foreground">Last updated: {formatDateTime(order.updatedAt)}</p>
                </div>
              </div>

              <div className="w-[200px]">
                <Select
                  value={order.status}
                  onValueChange={(value) => handleStatusChange(value as OrderStatus)}
                  disabled={isUpdating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={OrderStatus.PENDING}>Pending</SelectItem>
                    <SelectItem value={OrderStatus.PROCESSING}>Processing</SelectItem>
                    <SelectItem value={OrderStatus.SHIPPED}>Shipped</SelectItem>
                    <SelectItem value={OrderStatus.DELIVERED}>Delivered</SelectItem>
                    <SelectItem value={OrderStatus.CANCELLED}>Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" onClick={() => router.push("/admin/orders")}>
            Back to Orders
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

