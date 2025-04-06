"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { getProductById, updateProduct, deleteProduct } from "@/lib/actions/product"
import { getAllCategories } from "@/lib/actions/category"
import { Loader2, ArrowLeft, Trash } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function EditProductPage({ params }: { params: { id: string } }) {
  const productId = params.id
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [product, setProduct] = useState(null)
  const [categories, setCategories] = useState([])

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
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch product
        const productResult = await getProductById(productId)
        if (productResult.success) {
          setProduct(productResult.data)

          // Initialize form data
          setFormData({
            name: productResult.data.name,
            description: productResult.data.description,
            price: productResult.data.price.toString(),
            compareAtPrice: productResult.data.compareAtPrice?.toString() || "",
            cost: productResult.data.cost?.toString() || "",
            sku: productResult.data.sku,
            barcode: productResult.data.barcode || "",
            weight: productResult.data.weight?.toString() || "",
            dimensions: {
              length: productResult.data.dimensions?.length?.toString() || "",
              width: productResult.data.dimensions?.width?.toString() || "",
              height: productResult.data.dimensions?.height?.toString() || "",
            },
            images: productResult.data.images.length > 0 ? productResult.data.images : [""],
            isActive: productResult.data.isActive,
            isFeatured: productResult.data.isFeatured,
            categoryId: productResult.data.categoryId,
          })
        } else {
          toast({
            title: "Error",
            description: productResult.error || "Failed to load product",
            variant: "destructive",
          })
        }

        // Fetch categories
        const categoriesResult = await getAllCategories()
        if (categoriesResult.success) {
          setCategories(categoriesResult.data)
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

    fetchData()
  }, [productId, toast])

  const handleChange = (e) => {
    const { name, value } = e.target
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)

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
      }

      const result = await updateProduct(productId, productData)

      if (result.success) {
        toast({
          title: "Product updated",
          description: "The product has been updated successfully.",
        })
        router.push("/admin/products")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update product",
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
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const result = await deleteProduct(productId)

      if (result.success) {
        toast({
          title: "Product deleted",
          description: "The product has been deleted successfully.",
        })
        router.push("/admin/products")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete product",
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
      setIsDeleting(false)
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
          <Button variant="ghost" onClick={() => router.push("/admin/products")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push("/admin/products")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Product"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the product and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
                  <Input id="sku" name="sku" value={formData.sku} onChange={handleChange} required />
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
                Add Image
              </Button>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}

