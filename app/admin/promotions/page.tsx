import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getAllPromotions } from "@/lib/actions/promotion"
import { formatPrice, formatDate } from "@/lib/utils"
import { Edit, Plus, Search, Tag, Trash } from "lucide-react"
import Link from "next/link"

export default async function PromotionsPage({
  searchParams,
}: {
  searchParams: { includeInactive?: string }
}) {
  const includeInactive = searchParams.includeInactive === "true"
  const { data: promotions } = await getAllPromotions(includeInactive)

  function getPromotionStatusColor(isActive: boolean, isExpired: boolean) {
    if (!isActive) {
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }

    if (isExpired) {
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    }

    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
  }

  function isPromotionExpired(endDate: string) {
    return new Date(endDate) < new Date()
  }

  function formatDiscountValue(type: string, value: number) {
    if (type === "percentage") {
      return `${value}%`
    }
    return formatPrice(value)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Promotions</h1>
        <Button asChild>
          <Link href="/admin/promotions/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Promotion
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Promotion Management</CardTitle>
          <CardDescription>Create and manage promotional codes, discounts, and special offers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search promotions..."
                className="pl-8 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <Link href={`/admin/promotions?includeInactive=${!includeInactive}`}>
              <Button variant="outline">{includeInactive ? "Hide Inactive" : "Show Inactive"}</Button>
            </Link>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Valid Period</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions?.length ? (
                  promotions.map((promotion) => {
                    const isExpired = isPromotionExpired(promotion.endDate)

                    return (
                      <TableRow key={promotion.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-primary" />
                            {promotion.code}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDiscountValue(promotion.discountType, promotion.discountValue)}
                          {promotion.minPurchase && (
                            <div className="text-xs text-muted-foreground">
                              Min. purchase: {formatPrice(promotion.minPurchase)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>{formatDate(promotion.startDate)}</div>
                          <div className="text-xs text-muted-foreground">to {formatDate(promotion.endDate)}</div>
                        </TableCell>
                        <TableCell>
                          {promotion.usedCount}
                          {promotion.maxUses && (
                            <span className="text-xs text-muted-foreground">/{promotion.maxUses}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getPromotionStatusColor(promotion.isActive, isExpired)}>
                            {!promotion.isActive ? "Inactive" : isExpired ? "Expired" : "Active"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/admin/promotions/${promotion.id}`}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No promotions found.
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

