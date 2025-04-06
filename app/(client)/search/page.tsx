import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { searchProducts } from "@/lib/actions/search"
import { formatPrice } from "@/lib/utils"
import { ShoppingBag, Heart, SearchIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { addToCart } from "@/lib/actions/cart"
import { addToWishlist } from "@/lib/actions/wishlist"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const query = searchParams.q || ""
  const { data: products, meta } = await searchProducts(query)

  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

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
                  <form
                    action={async () => {
                      "use server"
                      await addToWishlist(userId, product.id)
                    }}
                  >
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
                    >
                      <Heart className="h-4 w-4" />
                      <span className="sr-only">Add to wishlist</span>
                    </Button>
                  </form>
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
                {userId && (
                  <form
                    action={async () => {
                      "use server"
                      await addToCart(userId, {
                        productId: product.id,
                        quantity: 1,
                      })
                    }}
                  >
                    <Button type="submit" className="w-full" disabled={!product.inventory?.totalQuantity}>
                      Add to Cart
                    </Button>
                  </form>
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

