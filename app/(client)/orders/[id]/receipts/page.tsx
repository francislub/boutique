"use client"

import { getOrderById } from "@/lib/actions/order"
import { formatPrice, formatDateTime } from "@/lib/utils"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { ShoppingBag } from "lucide-react"
import Image from "next/image"

export default async function OrderReceiptPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin?callbackUrl=/orders")
  }

  const { data: order } = await getOrderById(params.id)

  if (!order) {
    notFound()
  }

  // Verify the order belongs to the current user or is being accessed by an admin
  if (order.userId !== session.user.id && session.user.role !== "ADMIN") {
    redirect("/orders")
  }

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white print:p-4">
      {/* Print Button - Hidden when printing */}
      <div className="mb-8 print:hidden">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Print Receipt
        </button>
      </div>

      {/* Receipt Header */}
      <div className="flex justify-between items-start border-b pb-6 mb-6">
        <div>
          <h1 className="text-2xl font-bold">RECEIPT</h1>
          <p className="text-gray-600">Order #{order.orderNumber}</p>
          <p className="text-gray-600">{formatDateTime(order.createdAt)}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold">Boutique Store</h2>
          <p className="text-gray-600">123 Fashion Street</p>
          <p className="text-gray-600">New York, NY 10001</p>
          <p className="text-gray-600">contact@boutiquestore.com</p>
        </div>
      </div>

      {/* Customer Information */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Customer Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-medium">Name:</p>
            <p>{order.user.name}</p>
          </div>
          <div>
            <p className="font-medium">Email:</p>
            <p>{order.user.email}</p>
          </div>
          <div>
            <p className="font-medium">Phone:</p>
            <p>{order.user.phone || "N/A"}</p>
          </div>
          <div>
            <p className="font-medium">Order Date:</p>
            <p>{formatDateTime(order.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Shipping Address</h2>
        <p>{order.shippingAddress.street}</p>
        <p>
          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
        </p>
        <p>{order.shippingAddress.country}</p>
      </div>

      {/* Order Items */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Order Items</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">Item</th>
              <th className="py-2 text-right">Price</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-3">
                  <div className="flex items-center">
                    <div className="w-12 h-12 relative rounded overflow-hidden bg-gray-100 mr-3 hidden sm:block">
                      {item.product.images && item.product.images.length > 0 ? (
                        <Image
                          src={item.product.images[0] || "/placeholder.svg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gray-200">
                          <ShoppingBag className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      {item.variant && (
                        <p className="text-xs text-gray-500">
                          {Object.entries(item.variant.attributes)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 text-right">{formatPrice(item.price)}</td>
                <td className="py-3 text-right">{item.quantity}</td>
                <td className="py-3 text-right">{formatPrice(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Summary */}
      <div className="mb-6">
        <div className="w-full sm:w-1/2 ml-auto">
          <div className="flex justify-between py-2">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span>Shipping</span>
            <span>{formatPrice(order.shipping)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span>Tax</span>
            <span>{formatPrice(order.tax)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between py-2 text-green-600">
              <span>Discount</span>
              <span>-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 font-bold border-t border-gray-300 mt-2">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Payment Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-medium">Payment Method:</p>
            <p>{order.payment.method.replace("_", " ")}</p>
          </div>
          <div>
            <p className="font-medium">Payment Status:</p>
            <p>{order.payment.status}</p>
          </div>
          {order.payment.transactionId && (
            <div>
              <p className="font-medium">Transaction ID:</p>
              <p>{order.payment.transactionId}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm mt-8 pt-6 border-t">
        <p>Thank you for shopping with Boutique Store!</p>
        <p>For any questions or concerns, please contact our customer service at support@boutiquestore.com</p>
        <p>This receipt was generated on {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  )
}
