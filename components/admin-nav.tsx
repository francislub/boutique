"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, Package, ShoppingCart, Users, Settings, Tag, Layers, LogOut, Home } from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

const adminRoutes = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Home,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: Layers,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    title: "Inventory",
    href: "/admin/inventory",
    icon: Tag,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="grid gap-2 p-2">
      {adminRoutes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
            pathname === route.href ? "bg-muted text-primary" : "text-muted-foreground",
          )}
        >
          <route.icon className="h-4 w-4" />
          {route.title}
        </Link>
      ))}
      <Button
        variant="ghost"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-destructive justify-start"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </nav>
  )
}

