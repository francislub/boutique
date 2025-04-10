"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { searchProducts } from "@/lib/actions/search"
import { formatPrice } from "@/lib/utils"
import { ShoppingBag, Heart, SearchIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { addToCart } from "@/lib/actions/cart"
import { addToWishlist } from "@/lib/actions/wishlist"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""

  const [products, setProducts] = useState([])
  const [meta, setMeta] = useState({ total: 0 })
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const userId = session?.user?.id

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const result = await searchProducts(query)
        if (result.success) {
          setProducts(result.data || [])
          setMeta({ total: result.data?.length || 0 })
        }
      } catch (error) {
        console.error("Error searching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [query])

  const handleAddToCart = async (productId) => {
    if (!userId) return

    try {
      await addToCart(userId, {
        productId,
        quantity: 1,
      })
    } catch (error) {
      console.error("Failed to add to cart:", error)
    }
  }

  const handleAddToWishlist = async (productId) => {
    if (!userId) return

    try {
      await addToWishlist(userId, productId)
    } catch (error) {
      console.error("Failed to add to wishlist:", error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Search Results</h1>
        <p className="text-muted-foreground">
          {meta?.total || 0} results for "{query}"
        </p>
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden h-full transition-all hover:shadow-md">
              <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                <Link href={`/products/${product.slug}`}>
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform hover:scale-105"
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
                </Link>
                {userId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
                    onClick={() => handleAddToWishlist(product.id)}
                  >
                    <Heart className="h-4 w-4" />
                    <span className="sr-only">Add to wishlist</span>
                  </Button>
                )}
              </div>
              <CardContent className="p-4">
                <Link href={`/products/${product.slug}`}>
                  <h3 className="font-medium text-lg mb-1 line-clamp-1">{product.name}</h3>
                </Link>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{formatPrice(product.price)}</span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">{formatPrice(product.compareAtPrice)}</span>
                    )}
                  </div>
                </div>
                {userId ? (
                  <Button
                    className="w-full"
                    onClick={() => handleAddToCart(product.id)}
                    disabled={!product.inventory?.totalQuantity}
                  >
                    Add to Cart
                  </Button>
                ) : (
                  <Button asChild className="w-full">
                    <Link href={`/auth/signin?callbackUrl=/search?q=${query}`}>Add to Cart</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg">
          <SearchIcon className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-medium mb-2">No results found</h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            We couldn't find any products matching "{query}". Try using different keywords or browse our categories.
          </p>
          <Button asChild size="lg">
            <Link href="/products">Browse All Products</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
