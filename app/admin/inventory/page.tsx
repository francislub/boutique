import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getAllInventory } from "@/lib/actions/inventory"
import { Edit, Search } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function InventoryPage() {
  const { data: products } = await getAllInventory()

  function getStockStatus(product: any) {
    const inventory = product.inventory
    if (!inventory)
      return { label: "No Inventory", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" }

    const quantity = inventory.totalQuantity
    const threshold = inventory.lowStockThreshold

    if (quantity <= 0) {
      return { label: "Out of Stock", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" }
    } else if (quantity <= threshold) {
      return { label: "Low Stock", color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300" }
    } else {
      return { label: "In Stock", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" }
    }
  }

  function getStockPercentage(product: any) {
    const inventory = product.inventory
    if (!inventory) return 0

    const quantity = inventory.totalQuantity
    const threshold = inventory.lowStockThreshold

    // Consider 5x the threshold as "full stock" for the progress bar
    const fullStock = threshold * 5

    return Math.min(Math.round((quantity / fullStock) * 100), 100)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
        <Button asChild>
          <Link href="/admin/products/new">Add Product</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Management</CardTitle>
          <CardDescription>Monitor stock levels, update quantities, and manage product availability.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search products..."
                className="pl-8 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.length ? (
                  products.map((product) => {
                    const stockStatus = getStockStatus(product)
                    const stockPercentage = getStockPercentage(product)

                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="h-12 w-12 rounded-md border overflow-hidden">
                            {product.images && product.images.length > 0 ? (
                              <Image
                                src={product.images[0] || "/placeholder.svg"}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-muted">
                                <span className="text-xs text-muted-foreground">No image</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>{product.category?.name || "—"}</TableCell>
                        <TableCell>
                          <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={stockPercentage} className="h-2 w-[100px]" />
                            <span className="text-sm">
                              {product.inventory?.totalQuantity || 0}
                              {product.inventory?.lowStockThreshold ? ` / ${product.inventory.lowStockThreshold}` : ""}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/inventory/${product.id}`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No products found.
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

