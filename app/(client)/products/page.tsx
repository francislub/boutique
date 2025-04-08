"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { getAllProducts } from "@/lib/actions/product"
import { getAllCategories } from "@/lib/actions/category"
import { formatPrice } from "@/lib/utils"
import { ShoppingBag, Heart, Search, Filter } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

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
    page?: string
  }
}) {
  // Get filter parameters
  const search = searchParams?.search || ""
  const categoryId = searchParams?.category
  const sort = searchParams?.sort || "newest"
  const minPrice = searchParams?.min ? Number.parseFloat(searchParams.min) : undefined
  const maxPrice = searchParams?.max ? Number.parseFloat(searchParams.max) : undefined
  const isFeatured = searchParams?.featured === "true" ? true : undefined
  const onSale = searchParams?.sale === "true"
  const page = searchParams?.page ? Number.parseInt(searchParams.page) : 1
  const pageSize = 12

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
    page,
    pageSize,
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

  // Calculate total pages
  const totalProducts = meta?.total || 0
  const totalPages = Math.ceil(totalProducts / pageSize)

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-10">
      <div className="container mx-auto px-4">
        {/* Hero section */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold mb-4">Our Products</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our curated collection of high-quality products designed to elevate your style and comfort.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-64 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Filters</h3>
                <Button variant="ghost" size="sm" className="text-xs">
                  Reset
                </Button>
              </div>
              <div className="space-y-5">
                {/* Search */}
                <div>
                  <label htmlFor="search" className="text-sm font-medium mb-2 block">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="search" placeholder="Search products..." className="pl-8" defaultValue={search} />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label htmlFor="category" className="text-sm font-medium mb-2 block">
                    Category
                  </label>
                  <Select defaultValue={categoryId}>
                    <SelectTrigger id="category" className="w-full">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Price Range</label>
                  <div className="pt-4 px-2">
                    <Slider defaultValue={[0, 1000]} max={1000} step={10} className="mb-6" />
                    <div className="flex items-center justify-between">
                      <Input type="number" placeholder="Min" className="w-20" defaultValue={minPrice} />
                      <span className="text-muted-foreground">to</span>
                      <Input type="number" placeholder="Max" className="w-20" defaultValue={maxPrice} />
                    </div>
                  </div>
                </div>

                {/* Featured */}
                <div className="flex items-center space-x-2">
                  <Checkbox id="featured" defaultChecked={isFeatured} />
                  <label
                    htmlFor="featured"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Featured Products
                  </label>
                </div>

                {/* On Sale */}
                <div className="flex items-center space-x-2">
                  <Checkbox id="sale" defaultChecked={onSale} />
                  <label
                    htmlFor="sale"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    On Sale
                  </label>
                </div>

                <Button className="w-full mt-4">Apply Filters</Button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold">All Products</h2>
                  <p className="text-muted-foreground text-sm">
                    Showing {filteredProducts.length} of {totalProducts} products
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue={sort}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" className="lg:hidden">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {filteredProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
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

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          disabled={page <= 1}
                          onClick={() => {
                            // Handle pagination
                          }}
                        >
                          Previous
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                          <Button
                            key={pageNum}
                            variant={pageNum === page ? "default" : "outline"}
                            className={pageNum === page ? "bg-primary text-primary-foreground" : ""}
                          >
                            {pageNum}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          disabled={page >= totalPages}
                          onClick={() => {
                            // Handle pagination
                          }}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <ShoppingBag className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No products found</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    Try adjusting your search or filter criteria to find what you're looking for.
                  </p>
                  <Button asChild>
                    <Link href="/products">View All Products</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
