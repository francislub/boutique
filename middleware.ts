import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
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

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/orders/:path*", "/cart", "/wishlist", "/checkout"],
}

