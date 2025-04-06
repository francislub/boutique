"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createReview(data: {
  userId: string
  productId: string
  rating: number
  comment?: string
}) {
  try {
    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: data.userId,
        productId: data.productId,
      },
    })

    if (existingReview) {
      return {
        success: false,
        error: "You have already reviewed this product",
      }
    }

    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      return {
        success: false,
        error: "Rating must be between 1 and 5",
      }
    }

    const review = await prisma.review.create({
      data: {
        userId: data.userId,
        productId: data.productId,
        rating: data.rating,
        comment: data.comment,
      },
    })

    revalidatePath(`/products/${data.productId}`)

    return { success: true, data: review }
  } catch (error) {
    console.error("Failed to create review:", error)
    return { success: false, error: "Failed to create review" }
  }
}

export async function updateReview(
  reviewId: string,
  userId: string,
  data: {
    rating?: number
    comment?: string
  },
) {
  try {
    // Verify the review belongs to the user
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId,
      },
    })

    if (!review) {
      return { success: false, error: "Review not found" }
    }

    // Validate rating if provided
    if (data.rating && (data.rating < 1 || data.rating > 5)) {
      return {
        success: false,
        error: "Rating must be between 1 and 5",
      }
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: data.rating,
        comment: data.comment,
      },
    })

    revalidatePath(`/products/${review.productId}`)

    return { success: true, data: updatedReview }
  } catch (error) {
    console.error("Failed to update review:", error)
    return { success: false, error: "Failed to update review" }
  }
}

export async function deleteReview(reviewId: string, userId: string) {
  try {
    // Verify the review belongs to the user
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId,
      },
    })

    if (!review) {
      return { success: false, error: "Review not found" }
    }

    await prisma.review.delete({
      where: { id: reviewId },
    })

    revalidatePath(`/products/${review.productId}`)

    return { success: true }
  } catch (error) {
    console.error("Failed to delete review:", error)
    return { success: false, error: "Failed to delete review" }
  }
}

export async function getProductReviews(productId: string) {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { success: true, data: reviews }
  } catch (error) {
    console.error("Failed to fetch reviews:", error)
    return { success: false, error: "Failed to fetch reviews" }
  }
}

