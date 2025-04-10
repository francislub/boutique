import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { getAllProducts } from "@/lib/actions/product"
import { getAllCategories } from "@/lib/actions/category"
import { formatPrice } from "@/lib/utils"
import { ArrowRight, ShoppingBag, Star, Truck, Shield, Clock } from "lucide-react"

export default async function Home() {
  // Fetch featured products
  const { data: featuredProducts } = await getAllProducts({
    isFeatured: true,
    limit: 4,
  })

  // Fetch new arrivals
  const { data: newArrivals } = await getAllProducts({
    sort: "newest",
    limit: 3,
  })

  // Fetch categories
  const { data: categories } = await getAllCategories()
  const mainCategories = categories?.filter((cat) => !cat.parentId).slice(0, 6) || []

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-full bg-white/10 transform skew-x-12 -mr-32"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Discover Your <span className="text-yellow-300">Perfect Style</span>
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8 leading-relaxed">
              Explore our curated collection of premium clothing and accessories for every occasion. Elevate your
              wardrobe with the latest trends and timeless classics.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-gray-100 font-semibold">
                <Link href="/products">Shop Now</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 font-semibold"
              >
                <Link href="/categories">Browse Categories</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Featured Products</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Handpicked selections from our collection</p>
            </div>
            <Button asChild variant="ghost" className="gap-1">
              <Link href="/products?featured=true">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts?.map((product) => (
              <Link key={product.id} href={`/products/${product.slug}`} className="group">
                <Card className="overflow-hidden h-full transition-all hover:shadow-lg border-0 bg-white dark:bg-gray-800">
                  <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-110 duration-500"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gray-200 dark:bg-gray-700">
                        <ShoppingBag className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        Sale
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <Button size="sm" variant="secondary" className="w-full">
                        Quick View
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-lg mb-1 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{formatPrice(product.price)}</span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.compareAtPrice)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="ml-1 text-sm font-medium">4.8</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Banner */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">New Arrivals</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                Discover the latest additions to our collection. Fresh styles that just landed this week.
              </p>
              <Button asChild className="gap-2">
                <Link href="/products?sort=newest">
                  Shop New Arrivals <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {newArrivals?.map((product, index) => (
                <Link key={product.id} href={`/products/${product.slug}`} className="group">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gray-200 dark:bg-gray-700">
                        <ShoppingBag className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-3 w-full">
                        <h3 className="text-white font-medium text-sm line-clamp-1">{product.name}</h3>
                        <p className="text-white/90 font-bold text-sm">{formatPrice(product.price)}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Shop by Category</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Find exactly what you're looking for</p>
            </div>
            <Button asChild variant="ghost" className="gap-1">
              <Link href="/categories">
                All Categories <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {mainCategories.map((category) => (
              <Link key={category.id} href={`/categories/${category.slug}`}>
                <Card className="overflow-hidden h-full transition-all hover:shadow-md hover:scale-105 duration-300 border-0">
                  <div className="aspect-square relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-950 flex items-center justify-center">
                    <div className="text-4xl p-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 transition-transform group-hover:scale-110 duration-300">
                      {category.name.charAt(0)}
                    </div>
                  </div>
                  <CardContent className="p-4 text-center">
                    <h3 className="font-medium">{category.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gray-50 dark:bg-gray-900 border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex text-yellow-500 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                  "The quality of the clothes exceeded my expectations. The fabric is luxurious and the fit is perfect.
                  Will definitely be shopping here again!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold mr-3">
                    S
                  </div>
                  <div>
                    <h4 className="font-semibold">Sarah Johnson</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loyal Customer</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 dark:bg-gray-900 border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex text-yellow-500 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                  "Fast shipping and excellent customer service. The attention to detail in packaging shows how much
                  they care about their products and customers."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold mr-3">
                    M
                  </div>
                  <div>
                    <h4 className="font-semibold">Michael Chen</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Verified Buyer</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 dark:bg-gray-900 border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex text-yellow-500 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                  "I've been shopping here for years and have never been disappointed. The styles are always on trend
                  and the quality is consistent. Highly recommend!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold mr-3">
                    A
                  </div>
                  <div>
                    <h4 className="font-semibold">Amelia Rodriguez</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Fashion Enthusiast</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Shop With Us</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 mb-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 group-hover:scale-110 transition-transform duration-300">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Premium Quality
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Curated selection of high-quality clothing and accessories from top brands.
              </p>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 mb-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 group-hover:scale-110 transition-transform duration-300">
                <Truck className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Fast Shipping
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Quick delivery to your doorstep with careful packaging and tracking.
              </p>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 mb-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Secure Payments
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your transactions are protected with industry-leading security protocols.
              </p>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 mb-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                24/7 Support
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our customer service team is always ready to assist you with any questions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=500&width=1920')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-0 left-0 w-full h-12 bg-white/10 transform -skew-y-3"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="mb-6 opacity-90 text-lg">
              Stay updated with the latest products, exclusive offers, and fashion tips. Be the first to know about our
              seasonal sales and new arrivals.
            </p>
            <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              />
              <Button type="submit" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold">
                Subscribe
              </Button>
            </form>
            <p className="mt-4 text-sm opacity-80">
              By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Online Boutique</h3>
              <p className="text-gray-400">Your destination for premium fashion and accessories.</p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Shop</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/products" className="text-gray-400 hover:text-white">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link href="/categories" className="text-gray-400 hover:text-white">
                    Categories
                  </Link>
                </li>
                <li>
                  <Link href="/products?featured=true" className="text-gray-400 hover:text-white">
                    Featured
                  </Link>
                </li>
                <li>
                  <Link href="/products?sale=true" className="text-gray-400 hover:text-white">
                    Sale
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Account</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/profile" className="text-gray-400 hover:text-white">
                    My Account
                  </Link>
                </li>
                <li>
                  <Link href="/orders" className="text-gray-400 hover:text-white">
                    Orders
                  </Link>
                </li>
                <li>
                  <Link href="/wishlist" className="text-gray-400 hover:text-white">
                    Wishlist
                  </Link>
                </li>
                <li>
                  <Link href="/cart" className="text-gray-400 hover:text-white">
                    Cart
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>123 Fashion Street</li>
                <li>Kampala, NY 10001</li>
                <li>ka@boutique.com</li>
                <li>+1 (555) 123-4567</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© {new Date().getFullYear()} Online Boutique. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>

          {/* Admin Access Section */}
          <div className="mt-8 pt-4 border-t border-gray-800">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <p className="text-gray-500 text-sm">Admin Portal:</p>
              <div className="flex gap-4">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="text-gray-400 hover:text-white border-gray-700 hover:border-gray-500"
                >
                  <Link href="/auth/signin">Admin Login</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="text-gray-400 hover:text-white border-gray-700 hover:border-gray-500"
                >
                  <Link href="/auth/signup">Admin Register</Link>
                </Button>
                {/* <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="text-gray-400 hover:text-white border-gray-700 hover:border-gray-500"
                >
                  <Link href="/admin">Admin Dashboard</Link>
                </Button> */}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

