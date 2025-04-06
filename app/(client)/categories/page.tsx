import { Card, CardContent } from "@/components/ui/card"
import { getAllCategories } from "@/lib/actions/category"
import Link from "next/link"

export default async function CategoriesPage() {
  const { data: categories } = await getAllCategories()

  // Separate parent categories and subcategories
  const parentCategories = categories?.filter((cat) => !cat.parentId) || []

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shop by Category</h1>

      <div className="space-y-12">
        {parentCategories.map((category) => (
          <div key={category.id}>
            <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
            {category.description && <p className="text-gray-600 dark:text-gray-400 mb-6">{category.description}</p>}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {/* Parent category card */}
              <Link href={`/categories/${category.slug}`}>
                <Card className="overflow-hidden h-full transition-all hover:shadow-md">
                  <div className="aspect-square relative bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <div className="text-6xl p-8 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-600 dark:text-blue-300">
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
                    <Card className="overflow-hidden h-full transition-all hover:shadow-md">
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
  )
}

