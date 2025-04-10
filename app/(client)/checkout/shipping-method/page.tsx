"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Truck, Zap, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatPrice } from "@/lib/utils"

export default function ShippingMethodPage() {
  const router = useRouter()
  const [shippingMethod, setShippingMethod] = useState("standard")

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real app, you would save the shipping method to the order
    // For now, we'll just redirect to the next step
    router.push("/checkout/delivery-instructions")
  }

  // Shipping method options
  const shippingOptions = [
    {
      id: "standard",
      name: "Standard Shipping",
      description: "Delivery in 5-7 business days",
      price: 499, // $4.99
      icon: <Truck className="h-5 w-5" />,
      estimatedDelivery: "5-7 business days",
    },
    {
      id: "express",
      name: "Express Shipping",
      description: "Delivery in 2-3 business days",
      price: 999, // $9.99
      icon: <Zap className="h-5 w-5" />,
      estimatedDelivery: "2-3 business days",
    },
    {
      id: "overnight",
      name: "Overnight Shipping",
      description: "Delivery by tomorrow if ordered before 2PM",
      price: 1999, // $19.99
      icon: <Clock className="h-5 w-5" />,
      estimatedDelivery: "Next business day",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Shipping Method</h1>
          <p className="text-gray-600 dark:text-gray-400">Choose how you want your order delivered.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Select Shipping Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={shippingMethod} onValueChange={setShippingMethod} className="space-y-4">
                {shippingOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`flex items-center border rounded-lg p-4 cursor-pointer transition-colors ${
                      shippingMethod === option.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <RadioGroupItem value={option.id} id={option.id} className="sr-only" />
                    <div className="flex-1 flex items-center">
                      <div
                        className={`mr-4 p-2 rounded-full ${
                          shippingMethod === option.id
                            ? "bg-primary/10 text-primary"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                        }`}
                      >
                        {option.icon}
                      </div>
                      <div>
                        <Label htmlFor={option.id} className="font-medium text-base cursor-pointer">
                          {option.name}
                        </Label>
                        <p className="text-sm text-gray-500">{option.description}</p>
                        <p className="text-sm mt-1">
                          Estimated delivery: <span className="font-medium">{option.estimatedDelivery}</span>
                        </p>
                      </div>
                    </div>
                    <div className="font-medium">{formatPrice(option.price)}</div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/checkout">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Addresses
              </Link>
            </Button>
            <Button type="submit">
              Continue to Delivery Instructions
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
