import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getDashboardStats } from "@/lib/actions/dashboard"
import { formatPrice } from "@/lib/utils"
import {
  BarChart3,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { OrderStatus } from "@prisma/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { OverviewChart } from "@/components/dashboard/overview-chart"
import { ProductSalesChart } from "@/components/dashboard/product-sales-chart"
import { OrderStatusChart } from "@/components/dashboard/order-status-chart"

export default async function AdminDashboard() {
  const { data: stats } = await getDashboardStats()

  if (!stats) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-[50vh]">
            <h2 className="text-2xl font-bold">Error Loading Dashboard Data</h2>
            <p className="text-muted-foreground">There was a problem fetching data from the database.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Format top selling products data for the chart
  const topProductsData =
    stats.topSellingProducts?.map((product) => ({
      name: product.name,
      totalSold: product.totalSold,
    })) || []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/admin/products/new">Add Product</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(stats.totalSales)}</div>
                <div className="flex items-center pt-1 text-xs text-green-600 dark:text-green-400">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>+{stats.salesGrowth}% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <div className="flex items-center pt-1 text-xs text-amber-600 dark:text-amber-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>{stats.ordersByStatus?.[OrderStatus.PENDING] || 0} pending orders</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Products</CardTitle>
                <Package className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <div className="flex items-center pt-1 text-xs text-red-600 dark:text-red-400">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  <span>{stats.lowStockProducts?.length || 0} low stock items</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customers</CardTitle>
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                <div className="flex items-center pt-1 text-xs text-green-600 dark:text-green-400">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>+{stats.newCustomers} new this month</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>You made {stats.recentOrders?.length || 0} sales this month.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {stats.recentOrders?.map((order) => (
                    <div key={order.id} className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{order.user.name}</p>
                        <p className="text-sm text-muted-foreground">Order #{order.orderNumber}</p>
                      </div>
                      <div className="ml-auto font-medium">{formatPrice(order.total)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Low Stock Products</CardTitle>
                <CardDescription>Products that need to be restocked soon.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {stats.lowStockProducts?.map((product) => (
                    <div key={product.id} className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{product.name}</p>
                        <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                      </div>
                      <div className="ml-auto font-medium">{product.inventory?.totalQuantity || 0} left</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <OverviewChart data={stats.monthlySales || []} />
            <OrderStatusChart data={stats.ordersByStatus || {}} />
          </div>

          <ProductSalesChart data={topProductsData} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analysis</CardTitle>
                <CardDescription>Compare revenue across different time periods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <BarChart3 className="h-16 w-16 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Acquisition</CardTitle>
                <CardDescription>New customers over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <Users className="h-16 w-16 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Performance</CardTitle>
                <CardDescription>Sales by product category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <Package className="h-16 w-16 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Generate and download reports for your business.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <span>Sales Report</span>
                  <span className="text-xs text-muted-foreground">Daily, Weekly, Monthly</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <span>Inventory Report</span>
                  <span className="text-xs text-muted-foreground">Stock Levels</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <span>Customer Report</span>
                  <span className="text-xs text-muted-foreground">Activity & Orders</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <span>Product Performance</span>
                  <span className="text-xs text-muted-foreground">Sales by Product</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <span>Revenue Report</span>
                  <span className="text-xs text-muted-foreground">Income & Expenses</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <span>Tax Report</span>
                  <span className="text-xs text-muted-foreground">Tax Calculations</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

