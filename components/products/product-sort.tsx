"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SlidersHorizontal } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"

interface ProductSortProps {
  initialSort: string
}

export function ProductSort({ initialSort }: ProductSortProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [sort, setSort] = useState(initialSort || "newest")

  const handleSortChange = (value: string) => {
    setSort(value)

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())

      if (value !== "newest") params.set("sort", value)
      else params.delete("sort")

      router.push(`/products?${params.toString()}`)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={sort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="price-asc">Price: Low to High</SelectItem>
          <SelectItem value="price-desc">Price: High to Low</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" size="icon">
        <SlidersHorizontal className="h-4 w-4" />
      </Button>
    </div>
  )
}

