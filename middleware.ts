import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get the token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Check if the path starts with /admin
  const isAdminPath = pathname.startsWith("/admin")

  // If the path is admin and the user is not an admin, redirect to signin
  if (isAdminPath) {
    if (!token) {
      const url = new URL("/signin", request.url)
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }

    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  // Protected client routes that require authentication
  const protectedClientPaths = ["/profile", "/orders", "/wishlist", "/checkout"]

  const isProtectedClientPath = protectedClientPaths.some((path) => pathname.startsWith(path) || pathname === path)

  if (isProtectedClientPath && !token) {
    const url = new URL("/signin", request.url)
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/orders/:path*", "/wishlist/:path*", "/checkout/:path*"],
}

