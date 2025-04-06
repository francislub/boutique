import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { getCart } from "@/lib/actions/cart"
import { getUserAddresses } from "@/lib/actions/address"
import { formatPrice } from "@/lib/utils"
import { ShoppingBag, CreditCard, Landmark, Smartphone, Truck, Check } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { createOrder } from "@/lib/actions/order"
import type { PaymentMethod } from "@prisma/client"

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin?callbackUrl=/checkout")
  }

  const userId = session.user.id
  const { data: cart } = await getCart(userId)
  const { data: addresses } = await getUserAddresses(userId)

  if (!cart || !cart.items || cart.items.length === 0) {
    redirect("/cart")
  }

  // Calculate cart totals
  const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  const shipping = subtotal > 100 ? 0 : 10
  const tax = subtotal * 0.1 // Assuming 10% tax
  const total = subtotal + shipping + tax

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="mr-2 h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {addresses && addresses.length > 0 ? (
                <RadioGroup defaultValue={addresses.find((a) => a.isDefault)?.id || addresses[0].id}>
                  {addresses.map((address) => (
                    <div key={address.id} className="flex items-start space-x-2 mb-4">
                      <RadioGroupItem value={address.id} id={`address-${address.id}`} className="mt-1" />
                      <div className="grid gap-1.5">
                        <Label htmlFor={`address-${address.id}`} className="font-medium">
                          {address.street}
                          {address.isDefault && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                              Default
                            </span>
                          )}
                        </Label>
                        <div className="text-sm text-gray-500">
                          {address.city}, {address.state} {address.postalCode}
                          <br />
                          {address.country}
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground">You don't have any saved addresses. Please add one below:</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="street">Street Address</Label>
                      <Input id="street" placeholder="123 Main St" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="New York" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input id="state" placeholder="NY" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input id="postalCode" placeholder="10001" />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" placeholder="United States" />
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <Button variant="outline" asChild>
                  <Link href="/profile/addresses">Manage Addresses</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup defaultValue="CARD">
                <div className="flex items-start space-x-2 mb-4">
                  <RadioGroupItem value="CARD" id="payment-card" className="mt-1" />
                  <div className="grid gap-1.5 w-full">
                    <Label htmlFor="payment-card" className="font-medium flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Credit/Debit Card
                    </Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input id="card-number" placeholder="1234 5678 9012 3456" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM/YY" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-2 mb-4">
                  <RadioGroupItem value="MOBILE_MONEY" id="payment-mobile" className="mt-1" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="payment-mobile" className="font-medium flex items-center">
                      <Smartphone className="mr-2 h-4 w-4" />
                      Mobile Money
                    </Label>
                  </div>
                </div>

                <div className="flex items-start space-x-2 mb-4">
                  <RadioGroupItem value="BANK_TRANSFER" id="payment-bank" className="mt-1" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="payment-bank" className="font-medium flex items-center">
                      <Landmark className="mr-2 h-4 w-4" />
                      Bank Transfer
                    </Label>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="PAY_ON_DELIVERY" id="payment-delivery" className="mt-1" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="payment-delivery" className="font-medium">
                      Pay on Delivery
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Order Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Order Notes (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea placeholder="Add any special instructions or delivery notes..." />
            </CardContent>
          </Card>
        </div>

        <div>
          {/* Order Summary */}
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <div className="space-y-3 max-h-60 overflow-auto pr-2">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 relative rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                      {item.product.images && item.product.images.length > 0 ? (
                        <Image
                          src={item.product.images[0] || "/placeholder.svg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gray-200 dark:bg-gray-700">
                          <ShoppingBag className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">{item.product.name}</p>
                      {item.variant && (
                        <p className="text-xs text-gray-500">
                          {Object.entries(item.variant.attributes)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(", ")}
                        </p>
                      )}
                      <div className="flex justify-between mt-1">
                        <p className="text-sm">
                          {item.quantity} × {formatPrice(item.product.price)}
                        </p>
                        <p className="font-medium">{formatPrice(item.product.price * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
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
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <form
                action={async (formData) => {
                  "use server"

                  // Get form data
                  const addressId = formData.get("addressId") as string
                  const paymentMethod = formData.get("paymentMethod") as PaymentMethod

                  if (!addressId) {
                    // Handle error - no address selected
                    return
                  }

                  // Create order items from cart
                  const orderItems = cart.items.map((item) => ({
                    productId: item.product.id,
                    variantId: item.variant?.id,
                    quantity: item.quantity,
                    price: item.product.price,
                  }))

                  // Create the order
                  const result = await createOrder({
                    userId,
                    addressId,
                    items: orderItems,
                    paymentMethod,
                  })

                  if (result.success) {
                    // Redirect to order confirmation
                    redirect(`/orders/${result.data.id}`)
                  } else {
                    // Handle error
                    console.error(result.error)
                  }
                }}
                className="w-full"
              >
                <input type="hidden" name="addressId" value={addresses?.[0]?.id || ""} />
                <input type="hidden" name="paymentMethod" value="CARD" />

                <Button type="submit" className="w-full">
                  <Check className="mr-2 h-4 w-4" />
                  Place Order
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

