import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">About Boutique Store</h1>
        <p className="text-gray-500 mb-8">Our story, mission, and the team behind the brand</p>

        {/* Hero Section */}
        <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden mb-12">
          <Image src="/placeholder.svg?height=400&width=800" alt="Boutique Store" fill className="object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white p-4">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Redefining Fashion Since 2010</h2>
              <p className="text-lg">Curated collections for the modern lifestyle</p>
            </div>
          </div>
        </div>

        {/* Our Story */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Our Story</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="mb-4">
                Boutique Store was founded in 2010 with a simple mission: to provide high-quality, stylish clothing that
                empowers individuals to express their unique personality through fashion.
              </p>
              <p className="mb-4">
                What began as a small shop in downtown New York has grown into a beloved brand with a global presence,
                but our core values remain unchanged. We believe in sustainable practices, ethical manufacturing, and
                creating timeless pieces that transcend seasonal trends.
              </p>
              <p>
                Our journey has been shaped by our customers, whose feedback and loyalty have guided our evolution.
                We're proud to have built a community that shares our passion for quality, style, and conscious
                consumption.
              </p>
            </div>
            <div className="relative h-64 rounded-lg overflow-hidden">
              <Image src="/placeholder.svg?height=300&width=400" alt="Our first store" fill className="object-cover" />
            </div>
          </div>
        </section>

        <Separator className="my-12" />

        {/* Our Values */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">Quality</h3>
                <p className="text-gray-600">
                  We believe in creating products that last. Every item is crafted with attention to detail and made
                  from premium materials.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">Sustainability</h3>
                <p className="text-gray-600">
                  We're committed to reducing our environmental impact through responsible sourcing, eco-friendly
                  packaging, and ethical production.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">Inclusivity</h3>
                <p className="text-gray-600">
                  Fashion is for everyone. We design for diverse body types, styles, and preferences to ensure all
                  customers feel represented.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Meet the Team */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Meet the Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Founder & Creative Director",
                image: "/placeholder.svg?height=200&width=200",
              },
              {
                name: "Michael Chen",
                role: "Head of Design",
                image: "/placeholder.svg?height=200&width=200",
              },
              {
                name: "Olivia Rodriguez",
                role: "Chief Operating Officer",
                image: "/placeholder.svg?height=200&width=200",
              },
            ].map((member, index) => (
              <div key={index} className="text-center">
                <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden mb-4">
                  <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
                </div>
                <h3 className="text-lg font-semibold">{member.name}</h3>
                <p className="text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Our Locations */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Our Locations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">Kampala Uganda</h3>
              <p className="text-gray-600 mb-1">123 Fashion Avenue</p>
              <p className="text-gray-600 mb-1">Kampala, NY 10001</p>
              <p className="text-gray-600 mb-4">+1 (212) 555-1234</p>
              <p className="text-gray-600">
                <strong>Hours:</strong> Mon-Sat 10am-8pm, Sun 11am-6pm
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Bugema Store</h3>
              <p className="text-gray-600 mb-1">456 Style Boulevard</p>
              <p className="text-gray-600 mb-1">Bugema, CA 90210</p>
              <p className="text-gray-600 mb-4">+1 (310) 555-5678</p>
              <p className="text-gray-600">
                <strong>Hours:</strong> Mon-Sat 10am-9pm, Sun 11am-7pm
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
