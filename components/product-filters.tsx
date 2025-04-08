"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

interface ProductFiltersProps {
  categories: {
    id: string
    name: string
  }[]
  initialValues?: {
    search?: string
    category?: string
    minPrice?: number
    maxPrice?: number
    featured?: boolean
    sale?: boolean
  }
}

export function ProductFilters({ categories, initialValues }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState({
    search: initialValues?.search || "",
    category: initialValues?.category || "",
    minPrice: initialValues?.minPrice || 0,
    maxPrice: initialValues?.maxPrice || 1000,
    featured: initialValues?.featured || false,
    sale: initialValues?.sale || false,
  })

  const handleChange = (name: string, value: string | number | boolean) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleApplyFilters = () => {
    const params = new URLSearchParams()

    if (filters.search) params.set("search", filters.search)
    if (filters.category) params.set("category", filters.category)
    if (filters.minPrice > 0) params.set("min", filters.minPrice.toString())
    if (filters.maxPrice < 1000) params.set("max", filters.maxPrice.toString())
    if (filters.featured) params.set("featured", "true")
    if (filters.sale) params.set("sale", "true")

    router.push(`/products?${params.toString()}`)
  }

  const handleReset = () => {
    setFilters({
      search: "",
      category: "",
      minPrice: 0,
      maxPrice: 1000,
      featured: false,
      sale: false,
    })
    router.push("/products")
  }

  return (
    <div className="space-y-5">
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
            value={filters.search}
            onChange={(e) => handleChange("search", e.target.value)}
          />
        </div>
      </div>

      {/* Categories */}
      <div>
        <label htmlFor="category" className="text-sm font-medium mb-2 block">
          Category
        </label>
        <Select value={filters.category} onValueChange={(value) => handleChange("category", value)}>
          <SelectTrigger id="category" className="w-full">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
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
            value={[filters.minPrice, filters.maxPrice]}
            max={1000}
            step={10}
            className="mb-6"
            onValueChange={(values) => {
              handleChange("minPrice", values[0])
              handleChange("maxPrice", values[1])
            }}
          />
          <div className="flex items-center justify-between">
            <Input
              type="number"
              placeholder="Min"
              className="w-20"
              value={filters.minPrice}
              onChange={(e) => handleChange("minPrice", Number.parseInt(e.target.value) || 0)}
            />
            <span className="text-muted-foreground">to</span>
            <Input
              type="number"
              placeholder="Max"
              className="w-20"
              value={filters.maxPrice}
              onChange={(e) => handleChange("maxPrice", Number.parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>

      {/* Featured */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="featured"
          checked={filters.featured}
          onCheckedChange={(checked) => handleChange("featured", checked === true)}
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
        <Checkbox
          id="sale"
          checked={filters.sale}
          onCheckedChange={(checked) => handleChange("sale", checked === true)}
        />
        <label
          htmlFor="sale"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          On Sale
        </label>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <Button className="w-full" onClick={handleApplyFilters}>
          Apply Filters
        </Button>
        <Button variant="outline" className="w-full" onClick={handleReset}>
          Reset Filters
        </Button>
      </div>
    </div>
  )
}
