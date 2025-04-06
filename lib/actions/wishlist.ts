"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function addToWishlist(userId: string, productId: string) {
  try {
    // Check if the user has a wishlist
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId },
      include: { items: true },
    })

    // If no wishlist exists, create one
    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: {
          userId,
          items: {
            create: {
              productId,
            },
          },
        },
        include: { items: true },
      })
    } else {
      // Check if the item already exists in the wishlist
      const existingItem = wishlist.items.find((item) => item.productId === productId)

      if (!existingItem) {
        // Add a new item to the wishlist
        await prisma.wishlistItem.create({
          data: {
            wishlistId: wishlist.id,
            productId,
          },
        })
      }
    }

    revalidatePath("/wishlist")

    return { success: true }
  } catch (error) {
    console.error("Failed to add item to wishlist:", error)
    return { success: false, error: "Failed to add item to wishlist" }
  }
}

export async function removeFromWishlist(userId: string, wishlistItemId: string) {
  try {
    // Verify the wishlist item belongs to the user
    const wishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        id: wishlistItemId,
        wishlist: { userId },
      },
    })

    if (!wishlistItem) {
      return { success: false, error: "Wishlist item not found" }
    }

    // Delete the wishlist item
    await prisma.wishlistItem.delete({
      where: { id: wishlistItemId },
    })

    revalidatePath("/wishlist")

    return { success: true }
  } catch (error) {
    console.error("Failed to remove wishlist item:", error)
    return { success: false, error: "Failed to remove wishlist item" }
  }
}

export async function getWishlist(userId: string) {
  try {
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                inventory: true,
              },
            },
          },
        },
      },
    })

    if (!wishlist) {
      return { success: true, data: { items: [] } }
    }

    return { success: true, data: wishlist }
  } catch (error) {
    console.error("Failed to fetch wishlist:", error)
    return { success: false, error: "Failed to fetch wishlist" }
  }
}

