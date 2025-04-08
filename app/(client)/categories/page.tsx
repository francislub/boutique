import { Card, CardContent } from "@/components/ui/card"
import { getAllCategories } from "@/lib/actions/category"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default async function CategoriesPage() {
  const { data: categories } = await getAllCategories()

  // Separate parent categories and subcategories
  const parentCategories = categories?.filter((cat) => !cat.parentId) || []

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-10">
      <div className="container mx-auto px-4">
        {/* Hero section */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold mb-4">Shop by Category</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse our collections by category to find exactly what you're looking for.
          </p>
        </div>

        <div className="space-y-16">
          {parentCategories.map((category) => (
            <div key={category.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{category.name}</h2>
                <Link
                  href={`/categories/${category.slug}`}
                  className="text-primary hover:underline flex items-center text-sm font-medium"
                >
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>

              {category.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-3xl">{category.description}</p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {/* Parent category card */}
                <Link href={`/categories/${category.slug}`}>
                  <Card className="overflow-hidden h-full transition-all hover:shadow-md border-0 shadow-sm">
                    <div className="aspect-square relative bg-blue-50 dark:bg-blue-900 flex items-center justify-center">
                      <div className="text-6xl p-8 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300">
                        {category.name.charAt(0)}
                      </div>
                    </div>
                    <CardContent className="p-4 text-center">
                      <h3 className="font-medium text-lg">All {category.name}</h3>
                    </CardContent>
                  </Card>
                </Link>

                {/* Subcategories */}
                {category.subCategories &&
                  category.subCategories.map((subCategory) => (
                    <Link key={subCategory.id} href={`/categories/${subCategory.slug}`}>
                      <Card className="overflow-hidden h-full transition-all hover:shadow-md border-0 shadow-sm">
                        <div className="aspect-square relative bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <div className="text-4xl p-6 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            {subCategory.name.charAt(0)}
                          </div>
                        </div>
                        <CardContent className="p-4 text-center">
                          <h3 className="font-medium">{subCategory.name}</h3>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
