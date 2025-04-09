import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Mail, MessageSquare, Phone } from "lucide-react"

export default function SupportPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Customer Support</h1>
        <p className="text-gray-500 mb-8">We're here to help with any questions or concerns</p>

        <Tabs defaultValue="contact" className="mb-12">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="contact">Contact Us</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="returns">Returns & Refunds</TabsTrigger>
          </TabsList>

          <TabsContent value="contact" className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Phone className="mr-2 h-5 w-5" />
                    Phone Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-2">Available Monday-Friday, 9am-5pm</p>
                  <p className="font-medium">+1 (555) 123-4567</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Mail className="mr-2 h-5 w-5" />
                    Email Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-2">We'll respond within 24 hours</p>
                  <p className="font-medium">support@boutiquestore.com</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Live Chat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-2">Available 24/7</p>
                  <Button size="sm" className="mt-1">
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="Your email" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="What is this regarding?" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="How can we help you?" rows={5} />
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button>Submit</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="faq" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Find answers to our most commonly asked questions.</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>How long does shipping take?</AccordionTrigger>
                    <AccordionContent>
                      Standard shipping typically takes 3-5 business days. Express shipping is available for 1-2
                      business day delivery. International shipping may take 7-14 business days depending on the
                      destination.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>What is your return policy?</AccordionTrigger>
                    <AccordionContent>
                      We accept returns within 30 days of purchase for items in their original condition with tags
                      attached. Please visit our Returns & Refunds tab for more detailed information.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Do you ship internationally?</AccordionTrigger>
                    <AccordionContent>
                      Yes, we ship to most countries worldwide. International shipping rates and delivery times vary by
                      location. You can see the shipping options available to your country during checkout.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                    <AccordionTrigger>How do I track my order?</AccordionTrigger>
                    <AccordionContent>
                      Once your order ships, you'll receive a confirmation email with tracking information. You can also
                      view your order status and tracking details in your account under "Orders".
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-5">
                    <AccordionTrigger>Are the sizes true to fit?</AccordionTrigger>
                    <AccordionContent>
                      We provide detailed size guides for each product. Please refer to the size chart on the product
                      page for specific measurements. If you're between sizes, we generally recommend sizing up.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-6">
                    <AccordionTrigger>Do you offer gift wrapping?</AccordionTrigger>
                    <AccordionContent>
                      Yes, we offer gift wrapping services for a small additional fee. You can select this option during
                      checkout and include a personalized message for the recipient.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-gray-500">
                  Can't find what you're looking for?{" "}
                  <Button variant="link" className="p-0 h-auto">
                    Contact us
                  </Button>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="returns" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Returns & Refunds Policy</CardTitle>
                <CardDescription>Learn about our return process and refund policies.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Return Policy</h3>
                  <p className="text-sm text-gray-600">
                    We want you to be completely satisfied with your purchase. If for any reason you're not happy with
                    your order, you can return it within 30 days of delivery for a full refund or exchange.
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-sm text-gray-600 space-y-1">
                    <li>Items must be in original condition with tags attached</li>
                    <li>Unworn, unwashed, and undamaged</li>
                    <li>In the original packaging if applicable</li>
                    <li>With proof of purchase (order number or receipt)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">How to Return</h3>
                  <ol className="list-decimal pl-5 text-sm text-gray-600 space-y-1">
                    <li>Log in to your account and go to your Orders</li>
                    <li>Select the order and items you wish to return</li>
                    <li>Fill out the return form with your reason for return</li>
                    <li>Print the prepaid return shipping label</li>
                    <li>Package your items securely with the return form</li>
                    <li>Drop off the package at any authorized shipping location</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Refund Process</h3>
                  <p className="text-sm text-gray-600">
                    Once we receive your return, we'll inspect the items and process your refund. This typically takes
                    3-5 business days.
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-sm text-gray-600 space-y-1">
                    <li>Refunds will be issued to the original payment method</li>
                    <li>Shipping costs are non-refundable unless the return is due to our error</li>
                    <li>You'll receive an email confirmation when your refund is processed</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Exchanges</h3>
                  <p className="text-sm text-gray-600">
                    If you'd like to exchange an item for a different size or color, please indicate this on your return
                    form. If the item you want is in stock, we'll ship it to you as soon as we receive your return.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="mr-2">
                  Download Return Form
                </Button>
                <Button>Start a Return</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
