"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createProduct(data: {
  name: string
  description: string
  price: number
  compareAtPrice?: number
  cost?: number
  sku: string
  barcode?: string
  weight?: number
  dimensions?: { length: number; width: number; height: number }
  images: string[]
  isActive?: boolean
  isFeatured?: boolean
  categoryId: string
  variants?: Array<{
    sku: string
    price?: number
    attributes: Record<string, any>
    images?: string[]
  }>
  inventory?: {
    totalQuantity: number
    lowStockThreshold?: number
    items: Array<{
      variantId?: string
      quantity: number
      location?: string
    }>
  }
}) {
  try {
    // Generate a slug from the product name
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Create the product
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        slug,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        cost: data.cost,
        sku: data.sku,
        barcode: data.barcode,
        weight: data.weight,
        dimensions: data.dimensions,
        images: data.images,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        categoryId: data.categoryId,
      },
    })

    // Create a default variant for the product
    const defaultVariant = await prisma.productVariant.create({
      data: {
        sku: `${data.sku}-default`,
        price: data.price,
        attributes: {},
        images: data.images,
        productId: product.id,
      },
    })

    // Create variants if provided
    if (data.variants && data.variants.length > 0) {
      await prisma.productVariant.createMany({
        data: data.variants.map((variant) => ({
          sku: variant.sku,
          price: variant.price,
          attributes: variant.attributes,
          images: variant.images || [],
          productId: product.id,
        })),
      })
    }

    // Create inventory if provided
    if (data.inventory) {
      const inventory = await prisma.inventory.create({
        data: {
          productId: product.id,
          totalQuantity: data.inventory.totalQuantity,
          lowStockThreshold: data.inventory.lowStockThreshold || 5,
        },
      })

      // Create inventory items
      if (data.inventory.items && data.inventory.items.length > 0) {
        await prisma.inventoryItem.createMany({
          data: data.inventory.items.map((item) => {
            return {
              inventoryId: inventory.id,
              variantId: defaultVariant.id, // Use the default variant we created
              quantity: item.quantity,
              location: item.location,
            }
          }),
        })
      }
    }

    revalidatePath("/admin/products")
    revalidatePath(`/products/${slug}`)

    return { success: true, data: product }
  } catch (error) {
    console.error("Failed to create product:", error)
    return { success: false, error: "Failed to create product" }
  }
}

export async function updateProduct(
  productId: string,
  data: {
    name?: string
    description?: string
    price?: number
    compareAtPrice?: number
    cost?: number
    sku?: string
    barcode?: string
    weight?: number
    dimensions?: { length: number; width: number; height: number }
    images?: string[]
    isActive?: boolean
    isFeatured?: boolean
    categoryId?: string
  },
) {
  try {
    // If name is being updated, update the slug as well
    const updateData: any = { ...data }
    if (data.name) {
      updateData.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    })

    revalidatePath("/admin/products")
    revalidatePath(`/admin/products/${productId}`)
    revalidatePath(`/products/${product.slug}`)

    return { success: true, data: product }
  } catch (error) {
    console.error("Failed to update product:", error)
    return { success: false, error: "Failed to update product" }
  }
}

export async function deleteProduct(productId: string) {
  try {
    // Get the product to get its slug for revalidation
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return { success: false, error: "Product not found" }
    }

    // Delete the product (this will cascade delete variants, inventory, etc.)
    await prisma.product.delete({
      where: { id: productId },
    })

    revalidatePath("/admin/products")
    revalidatePath(`/products/${product.slug}`)

    return { success: true }
  } catch (error) {
    console.error("Failed to delete product:", error)
    return { success: false, error: "Failed to delete product" }
  }
}

export async function getAllProducts(options?: {
  categoryId?: string
  isActive?: boolean
  isFeatured?: boolean
  search?: string
  sort?: { field: string; direction: "asc" | "desc" }
  limit?: number
  offset?: number
}) {
  try {
    const whereClause: any = {}

    if (options?.categoryId) {
      whereClause.categoryId = options.categoryId
    }

    if (options?.isActive !== undefined) {
      whereClause.isActive = options.isActive
    }

    if (options?.isFeatured !== undefined) {
      whereClause.isFeatured = options.isFeatured
    }

    if (options?.search) {
      whereClause.OR = [
        { name: { contains: options.search, mode: "insensitive" } },
        { description: { contains: options.search, mode: "insensitive" } },
        { sku: { contains: options.search, mode: "insensitive" } },
      ]
    }

    const orderBy: any = {}
    if (options?.sort) {
      orderBy[options.sort.field] = options.sort.direction
    } else {
      orderBy.createdAt = "desc"
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          category: true,
          inventory: true,
          variants: true,
        },
        orderBy,
        skip: options?.offset || 0,
        take: options?.limit || 50,
      }),
      prisma.product.count({ where: whereClause }),
    ])

    return {
      success: true,
      data: products,
      meta: {
        total,
        limit: options?.limit || 50,
        offset: options?.offset || 0,
      },
    }
  } catch (error) {
    console.error("Failed to fetch products:", error)
    return { success: false, error: "Failed to fetch products" }
  }
}

export async function getProductById(productId: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        variants: true,
        inventory: {
          include: {
            items: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    if (!product) {
      return { success: false, error: "Product not found" }
    }

    return { success: true, data: product }
  } catch (error) {
    console.error("Failed to fetch product:", error)
    return { success: false, error: "Failed to fetch product" }
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: true,
        inventory: {
          include: {
            items: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    if (!product) {
      return { success: false, error: "Product not found" }
    }

    return { success: true, data: product }
  } catch (error) {
    console.error("Failed to fetch product:", error)
    return { success: false, error: "Failed to fetch product" }
  }
}
