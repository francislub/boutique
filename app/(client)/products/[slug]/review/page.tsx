import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getProductBySlug } from "@/lib/actions/product"
import { createReview } from "@/lib/actions/review"
import { Star, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"

export default async function WriteReviewPage({
  params,
}: {
  params: { slug: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect(`/auth/signin?callbackUrl=/products/${params.slug}/review`)
  }

  const { data: product } = await getProductBySlug(params.slug)

  if (!product) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Button variant="ghost" asChild className="mr-4">
          <Link href={`/products/${params.slug}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Product
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Write a Review</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Product</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 relative rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-200 dark:bg-gray-700">
                      <Star className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.category.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Review</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                action={async (formData) => {
                  "use server"

                  const rating = Number.parseInt(formData.get("rating") as string)
                  const title = formData.get("title") as string
                  const comment = formData.get("comment") as string

                  if (!rating || !comment) {
                    // Handle validation error
                    return
                  }

                  const result = await createReview({
                    userId: session.user.id,
                    productId: product.id,
                    rating,
                    title,
                    comment,
                  })

                  if (result.success) {
                    redirect(`/products/${params.slug}`)
                  }
                }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <label key={value} className="cursor-pointer">
                        <input
                          type="radio"
                          name="rating"
                          value={value}
                          className="sr-only peer"
                          defaultChecked={value === 5}
                        />
                        <Star className="h-8 w-8 text-gray-300 peer-checked:text-yellow-400 peer-checked:fill-yellow-400 hover:text-yellow-400 hover:fill-yellow-400" />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Review Title</Label>
                  <Input id="title" name="title" placeholder="Summarize your experience" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comment">Review</Label>
                  <Textarea
                    id="comment"
                    name="comment"
                    placeholder="Share your experience with this product..."
                    rows={5}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Submit Review
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

