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
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get filter parameters
  const search = searchParams.get("search") || ""
  const categoryId = searchParams.get("category") || ""
  const sort = searchParams.get("sort") || "newest"
  const minPriceParam = searchParams.get("min")
  const maxPriceParam = searchParams.get("max")
  const minPrice = minPriceParam ? Number.parseFloat(minPriceParam) : undefined
  const maxPrice = maxPriceParam ? Number.parseFloat(maxPriceParam) : undefined
  const isFeatured = searchParams.get("featured") === "true"
  const onSale = searchParams.get("sale") === "true"
  const pageParam = searchParams.get("page")
  const page = pageParam ? Number.parseInt(pageParam) : 1
  const pageSize = 12

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [loading, setLoading] = useState(true)

  // Form state
  const [searchValue, setSearchValue] = useState(search)
  const [categoryValue, setCategoryValue] = useState(categoryId)
  const [sortValue, setSortValue] = useState(sort)
  const [minPriceValue, setMinPriceValue] = useState(minPrice || 0)
  const [maxPriceValue, setMaxPriceValue] = useState(maxPrice || 1000)
  const [isFeaturedValue, setIsFeaturedValue] = useState(isFeatured)
  const [onSaleValue, setOnSaleValue] = useState(onSale)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      try {
        // Fetch products with filters
        const productsResponse = await getAllProducts({
          search,
          categoryId: categoryId || undefined,
          sort:
            sort === "price-asc"
              ? { field: "price", direction: "asc" }
              : sort === "price-desc"
                ? { field: "price", direction: "desc" }
                : { field: "createdAt", direction: "desc" },
          isFeatured: isFeatured || undefined,
          page,
          pageSize,
        })

        // Fetch categories for filter
        const categoriesResponse = await getAllCategories()

        setProducts(productsResponse.data || [])
        setTotalProducts(productsResponse.meta?.total || 0)
        setCategories(categoriesResponse.data || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [search, categoryId, sort, isFeatured, page, pageSize])

  // Filter products by price range if needed
  const filteredProducts = products.filter((product) => {
    if (minPrice && product.price < minPrice) return false
    if (maxPrice && product.price > maxPrice) return false
    if (onSale && (!product.compareAtPrice || product.compareAtPrice <= product.price)) return false
    return true
  })

  // Calculate total pages
  const totalPages = Math.ceil(totalProducts / pageSize)

  const applyFilters = () => {
    const params = new URLSearchParams()

    if (searchValue) params.set("search", searchValue)
    if (categoryValue && categoryValue !== "all") params.set("category", categoryValue)
    if (sortValue !== "newest") params.set("sort", sortValue)
    if (minPriceValue > 0) params.set("min", minPriceValue.toString())
    if (maxPriceValue < 1000) params.set("max", maxPriceValue.toString())
    if (isFeaturedValue) params.set("featured", "true")
    if (onSaleValue) params.set("sale", "true")

    router.push(`/products?${params.toString()}`)
  }

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    router.push(`/products?${params.toString()}`)
  }

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
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setSearchValue("")
                    setCategoryValue("")
                    setSortValue("newest")
                    setMinPriceValue(0)
                    setMaxPriceValue(1000)
                    setIsFeaturedValue(false)
                    setOnSaleValue(false)
                    router.push("/products")
                  }}
                >
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
                    <Input
                      id="search"
                      placeholder="Search products..."
                      className="pl-8"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                    />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label htmlFor="category" className="text-sm font-medium mb-2 block">
                    Category
                  </label>
                  <Select value={categoryValue} onValueChange={setCategoryValue}>
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
                    <Slider
                      value={[minPriceValue, maxPriceValue]}
                      max={1000}
                      step={10}
                      className="mb-6"
                      onValueChange={(values) => {
                        setMinPriceValue(values[0])
                        setMaxPriceValue(values[1])
                      }}
                    />
                    <div className="flex items-center justify-between">
                      <Input
                        type="number"
                        placeholder="Min"
                        className="w-20"
                        value={minPriceValue}
                        onChange={(e) => setMinPriceValue(Number(e.target.value))}
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="number"
                        placeholder="Max"
                        className="w-20"
                        value={maxPriceValue}
                        onChange={(e) => setMaxPriceValue(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                {/* Featured */}
                <div className="flex items-center space-x-2">
                  <Checkbox id="featured" checked={isFeaturedValue} onCheckedChange={setIsFeaturedValue} />
                  <label
                    htmlFor="featured"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Featured Products
                  </label>
                </div>

                {/* On Sale */}
                <div className="flex items-center space-x-2">
                  <Checkbox id="sale" checked={onSaleValue} onCheckedChange={setOnSaleValue} />
                  <label
                    htmlFor="sale"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    On Sale
                  </label>
                </div>

                <Button className="w-full mt-4" onClick={applyFilters}>
                  Apply Filters
                </Button>
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
                  <Select value={sortValue} onValueChange={setSortValue}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => {
                      // Toggle mobile filters
                    }}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : filteredProducts.length > 0 ? (
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
                        <Button variant="outline" disabled={page <= 1} onClick={() => handlePageChange(page - 1)}>
                          Previous
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                          <Button
                            key={pageNum}
                            variant={pageNum === page ? "default" : "outline"}
                            className={pageNum === page ? "bg-primary text-primary-foreground" : ""}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          disabled={page >= totalPages}
                          onClick={() => handlePageChange(page + 1)}
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
