"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { getProductById } from "@/lib/actions/product"
import { updateInventory, updateInventoryItem } from "@/lib/actions/inventory"
import { Loader2, ArrowLeft, Plus, Minus } from "lucide-react"

export default function InventoryEditPage({ params }: { params: { id: string } }) {
  const productId = params.id
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [product, setProduct] = useState(null)

  const [formData, setFormData] = useState({
    lowStockThreshold: "",
    items: [],
  })

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const result = await getProductById(productId)
        if (result.success) {
          setProduct(result.data)

          // Initialize form data
          if (result.data.inventory) {
            setFormData({
              lowStockThreshold: result.data.inventory.lowStockThreshold.toString(),
              items: result.data.inventory.items.map((item) => ({
                id: item.id,
                variantId: item.variantId,
                quantity: item.quantity.toString(),
                location: item.location || "",
              })),
            })
          }
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to load product",
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

    fetchProduct()
  }, [productId, toast])

  const handleThresholdChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      lowStockThreshold: e.target.value,
    }))
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    }

    setFormData((prev) => ({
      ...prev,
      items: newItems,
    }))
  }

  const handleQuantityAdjust = (index, amount) => {
    const newItems = [...formData.items]
    const currentQuantity = Number.parseInt(newItems[index].quantity) || 0
    const newQuantity = Math.max(0, currentQuantity + amount)

    newItems[index] = {
      ...newItems[index],
      quantity: newQuantity.toString(),
    }

    setFormData((prev) => ({
      ...prev,
      items: newItems,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      if (!product.inventory) {
        toast({
          title: "Error",
          description: "No inventory found for this product",
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }

      // Update inventory threshold
      await updateInventory(product.inventory.id, {
        lowStockThreshold: Number.parseInt(formData.lowStockThreshold),
      })

      // Update each inventory item
      for (const item of formData.items) {
        await updateInventoryItem(item.id, {
          quantity: Number.parseInt(item.quantity),
          location: item.location,
        })
      }

      toast({
        title: "Inventory updated",
        description: "The inventory has been updated successfully.",
      })

      router.push("/admin/inventory")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update inventory",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.push("/admin/inventory")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inventory
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-[50vh]">
            <h2 className="text-2xl font-bold">Product Not Found</h2>
            <p className="text-muted-foreground">The product you're looking for doesn't exist or has been deleted.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!product.inventory) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.push("/admin/inventory")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inventory
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-[50vh]">
            <h2 className="text-2xl font-bold">No Inventory Found</h2>
            <p className="text-muted-foreground">This product doesn't have inventory tracking enabled.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push("/admin/inventory")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inventory
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Inventory</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{product.name}</CardTitle>
            <CardDescription>
              SKU: {product.sku} | Category: {product.category?.name || "Uncategorized"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                min="0"
                value={formData.lowStockThreshold}
                onChange={handleThresholdChange}
                className="max-w-xs"
              />
              <p className="text-sm text-muted-foreground">You will be alerted when stock falls below this level</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Inventory Items</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Variant</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.items.map((item, index) => {
                      // Find the variant for this item
                      const variant = product.variants?.find((v) => v.id === item.variantId)

                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            {variant ? (
                              <div>
                                <div className="font-medium">
                                  {Object.entries(variant.attributes)
                                    .map(([key, value]) => `${key}: ${value}`)
                                    .join(", ")}
                                </div>
                                <div className="text-xs text-muted-foreground">SKU: {variant.sku}</div>
                              </div>
                            ) : (
                              <div className="font-medium">Default</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleQuantityAdjust(index, -1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <Input
                                type="number"
                                min="0"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                                className="w-20"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleQuantityAdjust(index, 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.location}
                              onChange={(e) => handleItemChange(index, "location", e.target.value)}
                              placeholder="e.g., Warehouse A"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="text-xs text-muted-foreground">
                              Last updated: {new Date().toLocaleDateString()}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/inventory")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

