import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    const isAuthenticated = !!token
    const isAdmin = token?.role === "ADMIN"
    const isClient = token?.role === "CLIENT"

    // Admin routes protection
    if (request.nextUrl.pathname.startsWith("/admin")) {
      if (!isAuthenticated || !isAdmin) {
        const url = new URL("/auth/signin", request.url)
        url.searchParams.set("callbackUrl", request.nextUrl.pathname)
        return NextResponse.redirect(url)
      }
    }

    // Client routes protection
    if (
      request.nextUrl.pathname.startsWith("/profile") ||
      request.nextUrl.pathname.startsWith("/orders") ||
      request.nextUrl.pathname.startsWith("/cart") ||
      request.nextUrl.pathname.startsWith("/wishlist") ||
      request.nextUrl.pathname.startsWith("/checkout")
    ) {
      if (!isAuthenticated) {
        const url = new URL("/auth/signin", request.url)
        url.searchParams.set("callbackUrl", request.nextUrl.pathname)
        return NextResponse.redirect(url)
      }
    }

    // Redirect authenticated users away from auth pages
    if (request.nextUrl.pathname.startsWith("/auth/")) {
      if (isAuthenticated) {
        if (isAdmin) {
          return NextResponse.redirect(new URL("/admin", request.url))
        } else if (isClient) {
          return NextResponse.redirect(new URL("/", request.url))
        }
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/orders/:path*", "/cart", "/wishlist", "/checkout", "/auth/:path*"],
}
