import { getAllProducts } from "@/lib/actions/product"
import { getAllCategories } from "@/lib/actions/category"
import { formatPrice } from "@/lib/utils"
import { ShoppingBag, Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProductFilters } from "@/components/products/product-filters"
import { ProductSort } from "@/components/products/product-sort"

// This is a server component that fetches data

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: {
    search?: string
    category?: string
    sort?: string
    min?: string
    max?: string
    featured?: string
    sale?: string
  }
}) {
  // Get filter parameters - properly handle searchParams
  const search = searchParams?.search || ""
  const categoryId = searchParams?.category
  const sort = searchParams?.sort || "newest"
  const minPrice = searchParams?.min ? Number.parseFloat(searchParams.min) : undefined
  const maxPrice = searchParams?.max ? Number.parseFloat(searchParams.max) : undefined
  const isFeatured = searchParams?.featured === "true" ? true : undefined
  const onSale = searchParams?.sale === "true"

  // Fetch products with filters
  const { data: products, meta } = await getAllProducts({
    search,
    categoryId,
    sort:
      sort === "price-asc"
        ? { field: "price", direction: "asc" }
        : sort === "price-desc"
          ? { field: "price", direction: "desc" }
          : { field: "createdAt", direction: "desc" },
    isFeatured,
    // We'll filter by price range in the component since Prisma doesn't support this directly
  })

  // Fetch categories for filter
  const { data: categories } = await getAllCategories()

  // Filter products by price range if needed
  const filteredProducts =
    products?.filter((product) => {
      if (minPrice && product.price < minPrice) return false
      if (maxPrice && product.price > maxPrice) return false
      if (onSale && (!product.compareAtPrice || product.compareAtPrice <= product.price)) return false
      return true
    }) || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full md:w-64">
          <ProductFilters
            categories={categories || []}
            initialValues={{
              search,
              category: categoryId,
              minPrice: minPrice || 0,
              maxPrice: maxPrice || 1000,
              isFeatured: isFeatured || false,
              onSale,
              sort,
            }}
          />
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Products</h1>
            <ProductSort initialSort={sort} />
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.slug}`} className="group">
                  <Card className="overflow-hidden h-full transition-all hover:shadow-md">
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
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingBag className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Try adjusting your search or filter criteria to find what you're looking for.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

