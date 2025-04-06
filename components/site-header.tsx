"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import { Search, ShoppingBag, Heart, User, Menu } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { signOut, useSession } from "next-auth/react"

export function SiteHeader() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-4 mt-8">
              <Link href="/" className="text-lg font-medium transition-colors hover:text-primary">
                Home
              </Link>
              <Link href="/products" className="text-lg font-medium transition-colors hover:text-primary">
                Products
              </Link>
              <Link href="/categories" className="text-lg font-medium transition-colors hover:text-primary">
                Categories
              </Link>
              {session ? (
                <>
                  <Link href="/profile" className="text-lg font-medium transition-colors hover:text-primary">
                    My Account
                  </Link>
                  <Link href="/orders" className="text-lg font-medium transition-colors hover:text-primary">
                    Orders
                  </Link>
                  <Link href="/wishlist" className="text-lg font-medium transition-colors hover:text-primary">
                    Wishlist
                  </Link>
                  <Link href="/cart" className="text-lg font-medium transition-colors hover:text-primary">
                    Cart
                  </Link>
                  <Button variant="ghost" className="justify-start px-2" onClick={() => signOut({ callbackUrl: "/" })}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" className="text-lg font-medium transition-colors hover:text-primary">
                    Sign In
                  </Link>
                  <Link href="/auth/signup" className="text-lg font-medium transition-colors hover:text-primary">
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="hidden font-bold sm:inline-block">Online Boutique</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link
            href="/products"
            className={`transition-colors hover:text-primary ${pathname === "/products" ? "text-primary" : ""}`}
          >
            Products
          </Link>
          <Link
            href="/categories"
            className={`transition-colors hover:text-primary ${pathname === "/categories" ? "text-primary" : ""}`}
          >
            Categories
          </Link>
        </nav>

        <div className="flex-1 flex items-center justify-end space-x-4">
          <form onSubmit={handleSearch} className="hidden md:flex items-center w-full max-w-sm space-x-2 mr-4">
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" size="icon" variant="ghost">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          </form>

          <div className="flex items-center space-x-1">
            <Link href="/search">
              <Button variant="ghost" size="icon" className="md:hidden">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            </Link>

            <Link href="/wishlist">
              <Button variant="ghost" size="icon">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Wishlist</span>
              </Button>
            </Link>

            <Link href="/cart">
              <Button variant="ghost" size="icon">
                <ShoppingBag className="h-5 w-5" />
                <span className="sr-only">Cart</span>
              </Button>
            </Link>

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist">Wishlist</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
            )}

            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}

