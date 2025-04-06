import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { addToWishlist, removeFromWishlist } from "@/lib/actions/wishlist"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const data = await request.json()

  try {
    const result = await addToWishlist(userId, data.productId)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error adding to wishlist:", error)
    return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const { searchParams } = new URL(request.url)
  const wishlistItemId = searchParams.get("id")

  if (!wishlistItemId) {
    return NextResponse.json({ error: "Wishlist item ID is required" }, { status: 400 })
  }

  try {
    const result = await removeFromWishlist(userId, wishlistItemId)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error removing wishlist item:", error)
    return NextResponse.json({ error: "Failed to remove wishlist item" }, { status: 500 })
  }
}

