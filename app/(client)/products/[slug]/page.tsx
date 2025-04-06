import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getProductBySlug, getAllProducts } from "@/lib/actions/product"
import { formatPrice } from "@/lib/utils"
import { ShoppingBag, Heart, Share2, Star, Truck, RotateCcw, Shield, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ProductReviews } from "@/components/product-reviews"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { addToCart } from "@/lib/actions/cart"
import { addToWishlist } from "@/lib/actions/wishlist"

export default async function ProductPage({
  params,
}: {
  params: { slug: string }
}) {
  const { data: product } = await getProductBySlug(params.slug)

  if (!product) {
    notFound()
  }

  // Fetch related products from the same category
  const { data: relatedProducts } = await getAllProducts({
    categoryId: product.categoryId,
    limit: 4,
  })

  // Filter out the current product from related products
  const filteredRelatedProducts = relatedProducts?.filter((p) => p.id !== product.id) || []

  // Calculate discount percentage if on sale
  const discountPercentage =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null

  // Check if product is in stock
  const isInStock = product.inventory && product.inventory.totalQuantity > 0

  // Get user session
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square relative overflow-hidden rounded-lg border bg-gray-100 dark:bg-gray-800">
            {product.images && product.images.length > 0 ? (
              <Image src={product.images[0] || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-200 dark:bg-gray-700">
                <ShoppingBag className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.slice(0, 4).map((image, index) => (
                <div
                  key={index}
                  className="aspect-square relative overflow-hidden rounded-md border bg-gray-100 dark:bg-gray-800"
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= (product.reviews?.reduce((sum, r) => sum + r.rating, 0) / (product.reviews?.length || 1))
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">({product.reviews?.length || 0})</span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">{product.reviews?.length || 0} reviews</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <>
                <span className="text-xl text-gray-500 line-through">{formatPrice(product.compareAtPrice)}</span>
                <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">
                  {discountPercentage}% OFF
                </span>
              </>
            )}
          </div>

          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p>{product.description}</p>
          </div>

          {/* Variants (if any) */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-4">
              {/* Group variants by attribute type */}
              {Object.entries(
                product.variants.reduce(
                  (acc, variant) => {
                    Object.entries(variant.attributes).forEach(([key, value]) => {
                      if (!acc[key]) acc[key] = new Set()
                      acc[key].add(value)
                    })
                    return acc
                  },
                  {} as Record<string, Set<any>>,
                ),
              ).map(([attributeName, values]) => (
                <div key={attributeName}>
                  <label className="block text-sm font-medium mb-2 capitalize">{attributeName}</label>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(values).map((value) => (
                      <Button key={`${attributeName}-${value}`} variant="outline" className="rounded-md">
                        {value}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity and Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center">
              <label htmlFor="quantity" className="block text-sm font-medium mr-4">
                Quantity
              </label>
              <div className="flex items-center">
                <Button variant="outline" size="icon" className="rounded-r-none">
                  -
                </Button>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max={product.inventory?.totalQuantity || 99}
                  defaultValue="1"
                  className="w-12 h-10 border-y text-center"
                />
                <Button variant="outline" size="icon" className="rounded-l-none">
                  +
                </Button>
              </div>
              <div className="ml-4">
                <span className={`text-sm font-medium ${isInStock ? "text-green-600" : "text-red-600"}`}>
                  {isInStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {userId ? (
                <form
                  action={async () => {
                    "use server"
                    await addToCart(userId, {
                      productId: product.id,
                      quantity: 1,
                    })
                  }}
                >
                  <Button type="submit" size="lg" className="flex-1 md:flex-none" disabled={!isInStock}>
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>
                </form>
              ) : (
                <Button size="lg" className="flex-1 md:flex-none" disabled={!isInStock} asChild>
                  <Link href={`/auth/signin?callbackUrl=/products/${params.slug}`}>
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Link>
                </Button>
              )}

              {userId ? (
                <form
                  action={async () => {
                    "use server"
                    await addToWishlist(userId, product.id)
                  }}
                >
                  <Button type="submit" variant="outline" size="lg" className="flex-1 md:flex-none">
                    <Heart className="mr-2 h-5 w-5" />
                    Add to Wishlist
                  </Button>
                </form>
              ) : (
                <Button variant="outline" size="lg" className="flex-1 md:flex-none" asChild>
                  <Link href={`/auth/signin?callbackUrl=/products/${params.slug}`}>
                    <Heart className="mr-2 h-5 w-5" />
                    Add to Wishlist
                  </Link>
                </Button>
              )}

              <Button variant="outline" size="icon" className="ml-auto">
                <Share2 className="h-5 w-5" />
                <span className="sr-only">Share</span>
              </Button>
            </div>
          </div>

          {/* Product Meta */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">SKU:</span>
              <span>{product.sku}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Category:</span>
              <Link href={`/categories/${product.category.slug}`} className="text-blue-600 hover:underline">
                {product.category.name}
              </Link>
            </div>
          </div>

          {/* Shipping & Returns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-gray-600" />
              <span className="text-sm">Free shipping over $100</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-gray-600" />
              <span className="text-sm">30-day returns</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-gray-600" />
              <span className="text-sm">Secure checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <Tabs defaultValue="description" className="mb-12">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
          <TabsTrigger
            value="description"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            Description
          </TabsTrigger>
          <TabsTrigger
            value="specifications"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            Specifications
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            Reviews ({product.reviews?.length || 0})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="pt-4">
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <p>{product.description}</p>
          </div>
        </TabsContent>
        <TabsContent value="specifications" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Product Details</h3>
              <ul className="space-y-2">
                <li className="flex justify-between py-2 border-b">
                  <span className="font-medium">Material</span>
                  <span>Cotton</span>
                </li>
                <li className="flex justify-between py-2 border-b">
                  <span className="font-medium">Weight</span>
                  <span>{product.weight ? `${product.weight} kg` : "N/A"}</span>
                </li>
                <li className="flex justify-between py-2 border-b">
                  <span className="font-medium">Dimensions</span>
                  <span>
                    {product.dimensions
                      ? `${product.dimensions.length} × ${product.dimensions.width} × ${product.dimensions.height} cm`
                      : "N/A"}
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Shipping Information</h3>
              <ul className="space-y-2">
                <li className="flex justify-between py-2 border-b">
                  <span className="font-medium">Shipping</span>
                  <span>Free over $100</span>
                </li>
                <li className="flex justify-between py-2 border-b">
                  <span className="font-medium">Delivery</span>
                  <span>3-5 business days</span>
                </li>
                <li className="flex justify-between py-2 border-b">
                  <span className="font-medium">Returns</span>
                  <span>30-day returns</span>
                </li>
              </ul>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="reviews" className="pt-4">
          <ProductReviews productSlug={params.slug} reviews={product.reviews || []} />
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {filteredRelatedProducts.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Related Products</h2>
            <Button asChild variant="ghost" className="gap-1">
              <Link href={`/categories/${product.category.slug}`}>
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredRelatedProducts.map((relatedProduct) => (
              <Link key={relatedProduct.id} href={`/products/${relatedProduct.slug}`} className="group">
                <Card className="overflow-hidden h-full transition-all hover:shadow-md">
                  <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {relatedProduct.images && relatedProduct.images.length > 0 ? (
                      <Image
                        src={relatedProduct.images[0] || "/placeholder.svg"}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gray-200 dark:bg-gray-700">
                        <ShoppingBag className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    {relatedProduct.compareAtPrice && relatedProduct.compareAtPrice > relatedProduct.price && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        Sale
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-lg mb-1 line-clamp-1">{relatedProduct.name}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{formatPrice(relatedProduct.price)}</span>
                        {relatedProduct.compareAtPrice && relatedProduct.compareAtPrice > relatedProduct.price && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(relatedProduct.compareAtPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

