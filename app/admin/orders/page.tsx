import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getAllOrders } from "@/lib/actions/order"
import { formatPrice, formatDate } from "@/lib/utils"
import { Eye, Filter, Search } from "lucide-react"
import Link from "next/link"
import { OrderStatus } from "@prisma/client"

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { status?: OrderStatus }
}) {
  const status = searchParams.status
  const { data: orders } = await getAllOrders({
    status,
    limit: 10,
  })

  function getOrderStatusColor(status: OrderStatus) {
    switch (status) {
      case OrderStatus.PENDING:
        return "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-300"
      case OrderStatus.PROCESSING:
        return "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
      case OrderStatus.SHIPPED:
        return "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300"
      case OrderStatus.DELIVERED:
        return "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300"
      case OrderStatus.CANCELLED:
        return "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/admin/orders">
          <Badge variant="outline" className={!searchParams.status ? "bg-primary/10 text-primary" : ""}>
            All Orders
          </Badge>
        </Link>
        <Link href="/admin/orders?status=PENDING">
          <Badge
            variant="outline"
            className={
              searchParams.status === "PENDING"
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                : ""
            }
          >
            Pending
          </Badge>
        </Link>
        <Link href="/admin/orders?status=PROCESSING">
          <Badge
            variant="outline"
            className={
              searchParams.status === "PROCESSING"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                : ""
            }
          >
            Processing
          </Badge>
        </Link>
        <Link href="/admin/orders?status=SHIPPED">
          <Badge
            variant="outline"
            className={
              searchParams.status === "SHIPPED"
                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                : ""
            }
          >
            Shipped
          </Badge>
        </Link>
        <Link href="/admin/orders?status=DELIVERED">
          <Badge
            variant="outline"
            className={
              searchParams.status === "DELIVERED"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                : ""
            }
          >
            Delivered
          </Badge>
        </Link>
        <Link href="/admin/orders?status=CANCELLED">
          <Badge
            variant="outline"
            className={
              searchParams.status === "CANCELLED" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" : ""
            }
          >
            Cancelled
          </Badge>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>View and manage customer orders, update status, and process fulfillment.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search orders by number or customer..."
                className="pl-8 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.length ? (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{order.user.name}</TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        <Badge className={getOrderStatusColor(order.status)}>{order.status}</Badge>
                      </TableCell>
                      <TableCell>{formatPrice(order.total)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            order.payment?.status === "COMPLETED"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                          }
                        >
                          {order.payment?.status || "PENDING"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

