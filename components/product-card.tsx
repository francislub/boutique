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
import { useToast } from "@/components/ui/use-toast"

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
  const { toast } = useToast()
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
        toast({
          title: "Added to cart",
          description: `${product.name} has been added to your cart.`,
        })
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: "Failed to add product to cart.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to add to cart:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
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
        toast({
          title: "Added to wishlist",
          description: `${product.name} has been added to your wishlist.`,
        })
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: "Failed to add product to wishlist.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to add to wishlist:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsAddingToWishlist(false)
    }
  }

  return (
    <Card className="overflow-hidden h-full transition-all hover:shadow-md border-0 shadow-sm">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-800">
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
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/products/${product.slug}`} className="block">
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

        <div className="flex gap-2">
          <Button className="flex-1" onClick={handleAddToCart} disabled={!isInStock || isAddingToCart}>
            {isAddingToCart ? "Adding..." : isInStock ? "Add to Cart" : "Out of Stock"}
          </Button>
          <Button variant="outline" size="icon" onClick={handleAddToWishlist} disabled={isAddingToWishlist}>
            <Heart className="h-4 w-4" />
            <span className="sr-only">Add to wishlist</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
