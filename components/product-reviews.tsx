import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

interface Review {
  id: string
  rating: number
  title?: string | null
  comment: string
  createdAt: Date
  user: {
    id: string
    name: string | null
  }
}

interface ProductReviewsProps {
  productSlug: string
  reviews: Review[]
}

export function ProductReviews({ productSlug, reviews }: ProductReviewsProps) {
  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Customer Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center mt-1">
              <div className="flex mr-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </span>
            </div>
          )}
        </div>
        <Button asChild>
          <Link href={`/products/${productSlug}/review`}>Write a Review</Link>
        </Button>
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-6 divide-y">
          {reviews.map((review) => (
            <div key={review.id} className="pt-6 first:pt-0">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium">{review.user.name || "Anonymous"}</span>
                  <div className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</div>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              {review.title && <h4 className="font-medium mb-1">{review.title}</h4>}
              <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">No reviews yet. Be the first to review this product!</p>
          <Button asChild>
            <Link href={`/products/${productSlug}/review`}>Write a Review</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

