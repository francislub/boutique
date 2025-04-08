import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getCategoryBySlug } from "@/lib/actions/category"
import { formatPrice } from "@/lib/utils"
import { ShoppingBag, Heart, ArrowLeft, Grid3X3, Grid2X2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function CategoryPage({
  params,
}: {
  params: { slug: string }
}) {
  const { data: category } = await getCategoryBySlug(params.slug)

  if (!category) {
    notFound()
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-10">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          {category.parent && (
            <div className="mb-2">
              <Link
                href={`/categories/${category.parent.slug}`}
                className="text-primary hover:underline flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to {category.parent.name}
              </Link>
            </div>
          )}

          {/* Hero section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mb-8">
            <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
            {category.description && (
              <p className="text-gray-600 dark:text-gray-400 max-w-3xl">{category.description}</p>
            )}
          </div>
        </div>

        {/* Subcategories if any */}
        {category.subCategories && category.subCategories.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-xl font-bold mb-6">Browse Subcategories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {category.subCategories.map((subCategory) => (
                <Link key={subCategory.id} href={`/categories/${subCategory.slug}`}>
                  <Card className="overflow-hidden h-full transition-all hover:shadow-md border-0 shadow-sm">
                    <div className="aspect-square relative bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <div className="text-3xl p-4 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {subCategory.name.charAt(0)}
                      </div>
                    </div>
                    <CardContent className="p-4 text-center">
                      <h3 className="font-medium text-sm">{subCategory.name}</h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold">Products</h2>
              <p className="text-muted-foreground text-sm">
                {category.products?.length || 0} products in this category
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select className="border rounded-md px-3 py-1 text-sm bg-background">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
              </select>
              <div className="flex border rounded-md overflow-hidden">
                <Button variant="ghost" size="icon" className="rounded-none border-r">
                  <Grid2X2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-none">
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {category.products && category.products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {category.products.map((product) => (
                <Link key={product.id} href={`/products/${product.slug}`} className="group">
                  <Card className="overflow-hidden h-full transition-all hover:shadow-md border-0 shadow-sm">
                    <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gray-200 dark:bg-gray-700">
                          <ShoppingBag className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          Sale
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
                      >
                        <Heart className="h-4 w-4" />
                        <span className="sr-only">Add to wishlist</span>
                      </Button>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-lg mb-1 line-clamp-1">{product.name}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{formatPrice(product.price)}</span>
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(product.compareAtPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <ShoppingBag className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                There are no products in this category yet.
              </p>
              <Button asChild>
                <Link href="/products">Browse All Products</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
