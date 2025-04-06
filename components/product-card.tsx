"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import { ShoppingBag, Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    compareAtPrice?: number | null
    images: string[]
    inventory?: {
      totalQuantity: number
    } | null
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false)

  const isInStock = product.inventory && product.inventory.totalQuantity > 0

  const handleAddToCart = async () => {
    if (!session) {
      router.push(`/auth/signin?callbackUrl=/products/${product.slug}`)
      return
    }

    setIsAddingToCart(true)

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      })

      if (response.ok) {
        // Show success message or update cart count
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to add to cart:", error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleAddToWishlist = async () => {
    if (!session) {
      router.push(`/auth/signin?callbackUrl=/products/${product.slug}`)
      return
    }

    setIsAddingToWishlist(true)

    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
        }),
      })

      if (response.ok) {
        // Show success message
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to add to wishlist:", error)
    } finally {
      setIsAddingToWishlist(false)
    }
  }

  return (
    <Card className="overflow-hidden h-full transition-all hover:shadow-md">
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
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">Sale</div>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
          onClick={handleAddToWishlist}
          disabled={isAddingToWishlist}
        >
          <Heart className="h-4 w-4" />
          <span className="sr-only">Add to wishlist</span>
        </Button>
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
        <Button className="w-full" onClick={handleAddToCart} disabled={!isInStock || isAddingToCart}>
          {isInStock ? "Add to Cart" : "Out of Stock"}
        </Button>
      </CardContent>
    </Card>
  )
}

