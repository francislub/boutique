import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getAllCategories } from "@/lib/actions/category"
import { Edit, Folder, FolderPlus, Plus } from "lucide-react"
import Link from "next/link"
import { DeleteCategoryButton } from "@/components/delete-category-button"

export default async function CategoriesPage() {
  const { data: categories } = await getAllCategories()

  // Separate parent categories and subcategories
  const parentCategories = categories?.filter((category) => !category.parentId) || []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <Button asChild>
          <Link href="/admin/categories/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Management</CardTitle>
          <CardDescription>Organize your products with categories and subcategories.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Subcategories</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parentCategories.length > 0 ? (
                  parentCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Folder className="h-4 w-4 mr-2 text-blue-500" />
                          {category.name}
                        </div>
                      </TableCell>
                      <TableCell>{category.description || "—"}</TableCell>
                      <TableCell>{category.subCategories?.length || 0}</TableCell>
                      <TableCell>{category.products?.length || 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/categories/${category.id}`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/categories/new?parentId=${category.id}`}>
                              <FolderPlus className="h-4 w-4" />
                              <span className="sr-only">Add Subcategory</span>
                            </Link>
                          </Button>
                          <DeleteCategoryButton categoryId={category.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No categories found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {parentCategories.map(
        (parentCategory) =>
          parentCategory.subCategories &&
          parentCategory.subCategories.length > 0 && (
            <Card key={`subcategories-${parentCategory.id}`}>
              <CardHeader>
                <CardTitle>Subcategories of {parentCategory.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Products</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parentCategory.subCategories.map((subcategory) => (
                        <TableRow key={subcategory.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <Folder className="h-4 w-4 mr-2 text-amber-500" />
                              {subcategory.name}
                            </div>
                          </TableCell>
                          <TableCell>{subcategory.description || "—"}</TableCell>
                          <TableCell>{subcategory.products?.length || 0}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" asChild>
                                <Link href={`/admin/categories/${subcategory.id}`}>
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Link>
                              </Button>
                              <DeleteCategoryButton categoryId={subcategory.id} />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ),
      )}
    </div>
  )
}
