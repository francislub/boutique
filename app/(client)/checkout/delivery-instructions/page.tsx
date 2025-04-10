"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight, Home, Building, MapPin } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function DeliveryInstructionsPage() {
  const router = useRouter()
  const [buildingType, setBuildingType] = useState("house")
  const [instructions, setInstructions] = useState("")
  const [contactPreference, setContactPreference] = useState("call")
  const [leaveAtDoor, setLeaveAtDoor] = useState(false)
  const [requireSignature, setRequireSignature] = useState(true)

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real app, you would save these instructions to the order
    // For now, we'll just redirect to the next step
    router.push("/checkout/payment")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Delivery Instructions</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Help us deliver your order successfully by providing additional details.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Building Type</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={buildingType}
                onValueChange={setBuildingType}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div className="flex flex-col items-center space-y-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Home className="h-8 w-8 mb-2" />
                  <RadioGroupItem value="house" id="house" className="sr-only" />
                  <Label htmlFor="house" className="font-medium">
                    House
                  </Label>
                  <p className="text-sm text-gray-500 text-center">Single-family home or townhouse</p>
                </div>

                <div className="flex flex-col items-center space-y-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Building className="h-8 w-8 mb-2" />
                  <RadioGroupItem value="apartment" id="apartment" className="sr-only" />
                  <Label htmlFor="apartment" className="font-medium">
                    Apartment
                  </Label>
                  <p className="text-sm text-gray-500 text-center">Apartment or condominium building</p>
                </div>

                <div className="flex flex-col items-center space-y-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <MapPin className="h-8 w-8 mb-2" />
                  <RadioGroupItem value="business" id="business" className="sr-only" />
                  <Label htmlFor="business" className="font-medium">
                    Business
                  </Label>
                  <p className="text-sm text-gray-500 text-center">Office or commercial location</p>
                </div>
              </RadioGroup>

              {buildingType === "apartment" && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unit" className="mb-2 block">
                      Apartment/Unit Number
                    </Label>
                    <Input id="unit" placeholder="e.g., Apt 301" />
                  </div>
                  <div>
                    <Label htmlFor="access-code" className="mb-2 block">
                      Access Code (if any)
                    </Label>
                    <Input id="access-code" placeholder="e.g., #1234" />
                  </div>
                </div>
              )}

              {buildingType === "business" && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company" className="mb-2 block">
                      Company Name
                    </Label>
                    <Input id="company" placeholder="e.g., Acme Inc." />
                  </div>
                  <div>
                    <Label htmlFor="floor" className="mb-2 block">
                      Floor/Suite
                    </Label>
                    <Input id="floor" placeholder="e.g., Floor 5, Suite 501" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Delivery Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="instructions" className="mb-2 block">
                  Special Instructions
                </Label>
                <Textarea
                  id="instructions"
                  placeholder="Provide any special instructions for the delivery person..."
                  className="min-h-[100px]"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="leave-at-door" checked={leaveAtDoor} onCheckedChange={setLeaveAtDoor} />
                  <Label htmlFor="leave-at-door">Leave package at door/reception</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="signature" checked={requireSignature} onCheckedChange={setRequireSignature} />
                  <Label htmlFor="signature">Require signature for delivery</Label>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Contact Preference</Label>
                <RadioGroup value={contactPreference} onValueChange={setContactPreference} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="call" id="call" />
                    <Label htmlFor="call">Call upon arrival</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="text" id="text" />
                    <Label htmlFor="text">Text message upon arrival</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="none" />
                    <Label htmlFor="none">No contact needed</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/checkout/shipping">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Shipping
              </Link>
            </Button>
            <Button type="submit">
              Continue to Payment
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
