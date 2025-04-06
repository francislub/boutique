import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getWishlist } from "@/lib/actions/wishlist"
import { formatPrice } from "@/lib/utils"
import { ShoppingBag, Heart, Trash, ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { removeFromWishlist } from "@/lib/actions/wishlist"
import { addToCart } from "@/lib/actions/cart"

export default async function WishlistPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin?callbackUrl=/wishlist")
  }

  const userId = session.user.id
  const { data: wishlist } = await getWishlist(userId)

  const isEmpty = !wishlist || !wishlist.items || wishlist.items.length === 0

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Wishlist</h1>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg">
          <Heart className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-medium mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Save items you love to your wishlist and they'll be waiting for you here.
          </p>
          <Button asChild size="lg">
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.items.map((item) => (
            <Card key={item.id} className="overflow-hidden h-full">
              <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                <Link href={`/products/${item.product.slug}`}>
                  {item.product.images && item.product.images.length > 0 ? (
                    <Image
                      src={item.product.images[0] || "/placeholder.svg"}
                      alt={item.product.name}
                      fill
                      className="object-cover transition-transform hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-200 dark:bg-gray-700">
                      <ShoppingBag className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  {item.product.compareAtPrice && item.product.compareAtPrice > item.product.price && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      Sale
                    </div>
                  )}
                </Link>
                <form
                  action={async () => {
                    "use server"
                    await removeFromWishlist(userId, item.id)
                  }}
                >
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 text-red-500 hover:text-red-700"
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Remove from wishlist</span>
                  </Button>
                </form>
              </div>
              <CardContent className="p-4">
                <Link href={`/products/${item.product.slug}`} className="hover:underline">
                  <h3 className="font-medium text-lg mb-1 line-clamp-1">{item.product.name}</h3>
                </Link>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{formatPrice(item.product.price)}</span>
                    {item.product.compareAtPrice && item.product.compareAtPrice > item.product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(item.product.compareAtPrice)}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-sm ${item.product.inventory?.totalQuantity ? "text-green-600" : "text-red-600"}`}
                  >
                    {item.product.inventory?.totalQuantity ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <form
                    action={async () => {
                      "use server"
                      await addToCart(userId, {
                        productId: item.product.id,
                        quantity: 1,
                      })
                    }}
                    className="flex-1"
                  >
                    <Button type="submit" className="w-full" disabled={!item.product.inventory?.totalQuantity}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

