"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function addToCart(
  userId: string,
  data: {
    productId: string
    variantId?: string
    quantity: number
  },
) {
  try {
    // Check if the user has a cart
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    })

    // If no cart exists, create one
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
          items: {
            create: {
              productId: data.productId,
              variantId: data.variantId,
              quantity: data.quantity,
            },
          },
        },
        include: { items: true },
      })
    } else {
      // Check if the item already exists in the cart
      const existingItem = cart.items.find(
        (item) => item.productId === data.productId && item.variantId === data.variantId,
      )

      if (existingItem) {
        // Update the quantity of the existing item
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + data.quantity },
        })
      } else {
        // Add a new item to the cart
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: data.productId,
            variantId: data.variantId,
            quantity: data.quantity,
          },
        })
      }

      // Update the cart's updatedAt timestamp
      await prisma.cart.update({
        where: { id: cart.id },
        data: { updatedAt: new Date() },
      })
    }

    revalidatePath("/cart")

    return { success: true }
  } catch (error) {
    console.error("Failed to add item to cart:", error)
    return { success: false, error: "Failed to add item to cart" }
  }
}

export async function updateCartItem(userId: string, cartItemId: string, quantity: number) {
  try {
    // Verify the cart item belongs to the user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        cart: { userId },
      },
    })

    if (!cartItem) {
      return { success: false, error: "Cart item not found" }
    }

    if (quantity <= 0) {
      // Remove the item if quantity is 0 or negative
      await prisma.cartItem.delete({
        where: { id: cartItemId },
      })
    } else {
      // Update the quantity
      await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity },
      })
    }

    // Update the cart's updatedAt timestamp
    await prisma.cart.update({
      where: { userId },
      data: { updatedAt: new Date() },
    })

    revalidatePath("/cart")

    return { success: true }
  } catch (error) {
    console.error("Failed to update cart item:", error)
    return { success: false, error: "Failed to update cart item" }
  }
}

export async function removeCartItem(userId: string, cartItemId: string) {
  try {
    // Verify the cart item belongs to the user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        cart: { userId },
      },
    })

    if (!cartItem) {
      return { success: false, error: "Cart item not found" }
    }

    // Delete the cart item
    await prisma.cartItem.delete({
      where: { id: cartItemId },
    })

    // Update the cart's updatedAt timestamp
    await prisma.cart.update({
      where: { userId },
      data: { updatedAt: new Date() },
    })

    revalidatePath("/cart")

    return { success: true }
  } catch (error) {
    console.error("Failed to remove cart item:", error)
    return { success: false, error: "Failed to remove cart item" }
  }
}

export async function clearCart(userId: string) {
  try {
    // Delete all cart items
    await prisma.cartItem.deleteMany({
      where: { cart: { userId } },
    })

    // Update the cart's updatedAt timestamp
    await prisma.cart
      .update({
        where: { userId },
        data: { updatedAt: new Date() },
      })
      .catch(() => {
        // Ignore if cart doesn't exist
      })

    revalidatePath("/cart")

    return { success: true }
  } catch (error) {
    console.error("Failed to clear cart:", error)
    return { success: false, error: "Failed to clear cart" }
  }
}

export async function getCart(userId: string) {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    })

    if (!cart) {
      return { success: true, data: { items: [] } }
    }

    return { success: true, data: cart }
  } catch (error) {
    console.error("Failed to fetch cart:", error)
    return { success: false, error: "Failed to fetch cart" }
  }
}

