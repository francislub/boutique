"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"

interface ProductFiltersProps {
  categories: Array<{ id: string; name: string }>
  initialValues: {
    search?: string
    category?: string
    minPrice?: number
    maxPrice?: number
    isFeatured?: boolean
    onSale?: boolean
    sort?: string
  }
}

export function ProductFilters({ categories, initialValues }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(initialValues.search || "")
  const [category, setCategory] = useState(initialValues.category || "")
  const [minPrice, setMinPrice] = useState(initialValues.minPrice || 0)
  const [maxPrice, setMaxPrice] = useState(initialValues.maxPrice || 1000)
  const [isFeatured, setIsFeatured] = useState(initialValues.isFeatured || false)
  const [onSale, setOnSale] = useState(initialValues.onSale || false)
  const [sort, setSort] = useState(initialValues.sort || "newest")

  const applyFilters = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())

      // Update search params
      if (search) params.set("search", search)
      else params.delete("search")

      if (category && category !== "all") params.set("category", category)
      else params.delete("category")

      if (minPrice > 0) params.set("min", minPrice.toString())
      else params.delete("min")

      if (maxPrice < 1000) params.set("max", maxPrice.toString())
      else params.delete("max")

      if (isFeatured) params.set("featured", "true")
      else params.delete("featured")

      if (onSale) params.set("sale", "true")
      else params.delete("sale")

      if (sort !== "newest") params.set("sort", sort)
      else params.delete("sort")

      router.push(`/products?${params.toString()}`)
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Filters</h3>
        <div className="space-y-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="text-sm font-medium mb-2 block">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search products..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Categories */}
          <div>
            <label htmlFor="category" className="text-sm font-medium mb-2 block">
              Category
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div>
            <label className="text-sm font-medium mb-2 block">Price Range</label>
            <div className="pt-4 px-2">
              <Slider
                value={[minPrice, maxPrice]}
                max={1000}
                step={10}
                className="mb-6"
                onValueChange={([min, max]) => {
                  setMinPrice(min)
                  setMaxPrice(max)
                }}
              />
              <div className="flex items-center justify-between">
                <Input
                  type="number"
                  placeholder="Min"
                  className="w-20"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  className="w-20"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Featured */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={isFeatured}
              onCheckedChange={(checked) => setIsFeatured(checked === true)}
            />
            <label
              htmlFor="featured"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Featured Products
            </label>
          </div>

          {/* On Sale */}
          <div className="flex items-center space-x-2">
            <Checkbox id="sale" checked={onSale} onCheckedChange={(checked) => setOnSale(checked === true)} />
            <label
              htmlFor="sale"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              On Sale
            </label>
          </div>

          <Button className="w-full" onClick={applyFilters} disabled={isPending}>
            {isPending ? "Applying..." : "Apply Filters"}
          </Button>
        </div>
      </div>
    </div>
  )
}

