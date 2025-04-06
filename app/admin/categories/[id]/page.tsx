"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { updateCategory, deleteCategory, getAllCategories } from "@/lib/actions/category"
import { Loader2, AlertTriangle } from "lucide-react"
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

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const categoryId = params.id
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all categories
        const categoriesResult = await getAllCategories()
        if (categoriesResult.success) {
          setCategories(categoriesResult.data)

          // Find the current category
          const currentCategory = categoriesResult.data.find((cat) => cat.id === categoryId)
          if (currentCategory) {
            setCategory(currentCategory)
            setFormData({
              name: currentCategory.name,
              description: currentCategory.description || "",
              parentId: currentCategory.parentId || "",
            })
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load category data",
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [categoryId, toast])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await updateCategory(categoryId, {
        name: formData.name,
        description: formData.description,
        parentId: formData.parentId || null,
      })

      if (result.success) {
        toast({
          title: "Category updated",
          description: "The category has been updated successfully.",
        })
        router.push("/admin/categories")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update category",
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

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const result = await deleteCategory(categoryId)

      if (result.success) {
        toast({
          title: "Category deleted",
          description: "The category has been deleted successfully.",
        })
        router.push("/admin/categories")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete category",
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

  if (!category) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Category"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the category
                {category.subCategories?.length > 0 && " and affect its subcategories"}
                {category.products?.length > 0 && " and associated products"}.
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
        <Card>
          <CardHeader>
            <CardTitle>Category Information</CardTitle>
            <CardDescription>Edit the category details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentId">Parent Category (Optional)</Label>
              <Select
                value={formData.parentId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, parentId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Top Level Category)</SelectItem>
                  {categories
                    .filter((cat) => !cat.parentId && cat.id !== categoryId) // Only show top-level categories as parents and exclude self
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {category.subCategories?.length > 0 && (
              <div className="rounded-md bg-amber-50 p-4 dark:bg-amber-950">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mr-2" />
                  <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">Warning</h4>
                </div>
                <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                  This category has {category.subCategories.length} subcategories. Changes to this category may affect
                  its subcategories.
                </div>
              </div>
            )}

            {category.products?.length > 0 && (
              <div className="rounded-md bg-amber-50 p-4 dark:bg-amber-950">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mr-2" />
                  <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">Warning</h4>
                </div>
                <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                  This category has {category.products.length} products. Changes to this category may affect these
                  products.
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/categories")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

