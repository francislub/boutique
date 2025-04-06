import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { getCart } from "@/lib/actions/cart"
import { formatPrice } from "@/lib/utils"
import { Minus, Plus, ShoppingBag, Trash, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { updateCartItem, removeCartItem } from "@/lib/actions/cart"

export default async function CartPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin?callbackUrl=/cart")
  }

  const userId = session.user.id
  const { data: cart } = await getCart(userId)

  const isEmpty = !cart || !cart.items || cart.items.length === 0

  // Calculate cart totals
  const subtotal = cart?.items?.reduce((sum, item) => sum + item.product.price * item.quantity, 0) || 0

  const shipping = subtotal > 100 ? 0 : 10
  const tax = subtotal * 0.1 // Assuming 10% tax
  const total = subtotal + shipping + tax

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg">
          <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Button asChild size="lg">
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Shopping Cart ({cart?.items?.length || 0} items)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cart?.items?.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row gap-4 py-4 border-b">
                      <div className="w-full sm:w-24 h-24 relative rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {item.product.images && item.product.images.length > 0 ? (
                          <Image
                            src={item.product.images[0] || "/placeholder.svg"}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gray-200 dark:bg-gray-700">
                            <ShoppingBag className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between">
                          <Link href={`/products/${item.product.slug}`} className="font-medium hover:underline">
                            {item.product.name}
                          </Link>
                          <span className="font-medium">{formatPrice(item.product.price * item.quantity)}</span>
                        </div>

                        {item.variant && (
                          <div className="text-sm text-gray-500 mt-1">
                            {Object.entries(item.variant.attributes)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(", ")}
                          </div>
                        )}

                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center">
                            <form
                              action={async () => {
                                "use server"
                                if (item.quantity > 1) {
                                  await updateCartItem(userId, item.id, item.quantity - 1)
                                }
                              }}
                            >
                              <Button type="submit" variant="outline" size="icon" className="h-8 w-8 rounded-r-none">
                                <Minus className="h-3 w-3" />
                              </Button>
                            </form>
                            <div className="w-12 h-8 flex items-center justify-center border-y">{item.quantity}</div>
                            <form
                              action={async () => {
                                "use server"
                                await updateCartItem(userId, item.id, item.quantity + 1)
                              }}
                            >
                              <Button type="submit" variant="outline" size="icon" className="h-8 w-8 rounded-l-none">
                                <Plus className="h-3 w-3" />
                              </Button>
                            </form>
                          </div>

                          <form
                            action={async () => {
                              "use server"
                              await removeCartItem(userId, item.id)
                            }}
                          >
                            <Button type="submit" variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                              <Trash className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </form>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href="/products">Continue Shopping</Link>
                </Button>
                <form
                  action={async () => {
                    "use server"
                    // Clear cart functionality would go here
                  }}
                >
                  <Button type="submit" variant="ghost" className="text-red-500 hover:text-red-700">
                    Clear Cart
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>

                <div className="pt-4">
                  <div className="flex items-center">
                    <Input placeholder="Promo code" className="rounded-r-none" />
                    <Button className="rounded-l-none">Apply</Button>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

