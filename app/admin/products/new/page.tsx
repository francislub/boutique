"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useState, useEffect } from "react"
import { createProduct } from "@/lib/actions/product"
import { generateUniqueSku } from "@/lib/actions/sku"
import { getAllCategories } from "@/lib/actions/category"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Trash, RefreshCw } from "lucide-react"

export default function NewProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingSku, setIsGeneratingSku] = useState(false)
  const [categories, setCategories] = useState([])
  const [skuError, setSkuError] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    cost: "",
    sku: "",
    barcode: "",
    weight: "",
    dimensions: {
      length: "",
      width: "",
      height: "",
    },
    images: [""],
    isActive: true,
    isFeatured: false,
    categoryId: "",
    inventory: {
      totalQuantity: "",
      lowStockThreshold: "5",
    },
  })

  useEffect(() => {
    const fetchCategories = async () => {
      const result = await getAllCategories()
      if (result.success) {
        setCategories(result.data)
      }
    }

    fetchCategories()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target

    // Clear SKU error when SKU is changed
    if (name === "sku") {
      setSkuError("")
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDimensionChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [name]: value,
      },
    }))
  }

  const handleInventoryChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        [name]: value,
      },
    }))
  }

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images]
    newImages[index] = value
    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }))
  }

  const addImageField = () => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ""],
    }))
  }

  const removeImageField = (index) => {
    const newImages = [...formData.images]
    newImages.splice(index, 1)
    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }))
  }

  const generateSku = async () => {
    setIsGeneratingSku(true)
    try {
      // Generate a base SKU from the product name if it exists
      let baseSku = ""
      if (formData.name) {
        // Take first letters of each word and add a random number
        baseSku = formData.name
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase())
          .join("")
        baseSku += Math.floor(1000 + Math.random() * 9000) // Add a 4-digit number
      } else {
        // If no name, just use a random string
        baseSku = "SKU" + Math.floor(10000 + Math.random() * 90000)
      }

      // Get a unique SKU based on the base SKU
      const uniqueSku = await generateUniqueSku(baseSku)

      setFormData((prev) => ({
        ...prev,
        sku: uniqueSku,
      }))

      setSkuError("")
    } catch (error) {
      console.error("Error generating SKU:", error)
      toast({
        title: "Error",
        description: "Failed to generate a unique SKU",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingSku(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Format the data
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? Number.parseFloat(formData.compareAtPrice) : undefined,
        cost: formData.cost ? Number.parseFloat(formData.cost) : undefined,
        sku: formData.sku,
        barcode: formData.barcode || undefined,
        weight: formData.weight ? Number.parseFloat(formData.weight) : undefined,
        dimensions:
          formData.dimensions.length && formData.dimensions.width && formData.dimensions.height
            ? {
                length: Number.parseFloat(formData.dimensions.length),
                width: Number.parseFloat(formData.dimensions.width),
                height: Number.parseFloat(formData.dimensions.height),
              }
            : undefined,
        images: formData.images.filter((img) => img.trim() !== ""),
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        categoryId: formData.categoryId,
        inventory: {
          totalQuantity: Number.parseInt(formData.inventory.totalQuantity),
          lowStockThreshold: Number.parseInt(formData.inventory.lowStockThreshold),
          items: [
            {
              quantity: Number.parseInt(formData.inventory.totalQuantity),
            },
          ],
        },
      }

      const result = await createProduct(productData)

      if (result.success) {
        toast({
          title: "Product created",
          description: "The product has been created successfully.",
        })
        router.push("/admin/products")
      } else {
        // Check if the error is related to SKU
        if (result.error && result.error.includes("SKU")) {
          setSkuError(result.error)
          toast({
            title: "SKU Error",
            description: result.error,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to create product",
            variant: "destructive",
          })
        }
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>Basic information about the product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <div className="flex gap-2">
                    <Input
                      id="sku"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      required
                      className={skuError ? "border-red-500" : ""}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={generateSku}
                      disabled={isGeneratingSku}
                    >
                      {isGeneratingSku ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {skuError && <p className="text-sm text-red-500">{skuError}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode (Optional)</Label>
                  <Input id="barcode" name="barcode" value={formData.barcode} onChange={handleChange} />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isFeatured: checked }))}
                />
                <Label htmlFor="isFeatured">Featured</Label>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
                <CardDescription>Set the product pricing information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="compareAtPrice">Compare at Price ($)</Label>
                    <Input
                      id="compareAtPrice"
                      name="compareAtPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.compareAtPrice}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost">Cost per item ($)</Label>
                  <Input
                    id="cost"
                    name="cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
                <CardDescription>Manage product stock and inventory</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalQuantity">Quantity</Label>
                    <Input
                      id="totalQuantity"
                      name="totalQuantity"
                      type="number"
                      min="0"
                      value={formData.inventory.totalQuantity}
                      onChange={handleInventoryChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                    <Input
                      id="lowStockThreshold"
                      name="lowStockThreshold"
                      type="number"
                      min="0"
                      value={formData.inventory.lowStockThreshold}
                      onChange={handleInventoryChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dimensions & Weight</CardTitle>
                <CardDescription>Physical attributes of the product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.weight}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="length">Length (cm)</Label>
                    <Input
                      id="length"
                      name="length"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.dimensions.length}
                      onChange={handleDimensionChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="width">Width (cm)</Label>
                    <Input
                      id="width"
                      name="width"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.dimensions.width}
                      onChange={handleDimensionChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      name="height"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.dimensions.height}
                      onChange={handleDimensionChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Images</CardTitle>
              <CardDescription>Add product images (URLs)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.images.map((image, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder="Image URL"
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                  />
                  {formData.images.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeImageField(index)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addImageField}>
                <Plus className="mr-2 h-4 w-4" />
                Add Image
              </Button>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Product
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
