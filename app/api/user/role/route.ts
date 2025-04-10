import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ role: null }, { status: 401 })
    }

    return NextResponse.json({ role: session.user.role })
  } catch (error) {
    console.error("Error fetching user role:", error)
    return NextResponse.json({ role: null, error: "Failed to fetch user role" }, { status: 500 })
  }
}
