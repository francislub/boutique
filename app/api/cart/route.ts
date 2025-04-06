import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { addToCart, updateCartItem, removeCartItem } from "@/lib/actions/cart"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const data = await request.json()

  try {
    const result = await addToCart(userId, {
      productId: data.productId,
      variantId: data.variantId,
      quantity: data.quantity || 1,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error adding to cart:", error)
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const data = await request.json()

  try {
    const result = await updateCartItem(userId, data.cartItemId, data.quantity)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating cart item:", error)
    return NextResponse.json({ error: "Failed to update cart item" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const { searchParams } = new URL(request.url)
  const cartItemId = searchParams.get("id")

  if (!cartItemId) {
    return NextResponse.json({ error: "Cart item ID is required" }, { status: 400 })
  }

  try {
    const result = await removeCartItem(userId, cartItemId)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error removing cart item:", error)
    return NextResponse.json({ error: "Failed to remove cart item" }, { status: 500 })
  }
}

