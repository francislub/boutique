"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createCategory(data: {
  name: string
  description?: string
  parentId?: string
}) {
  try {
    // Generate a slug from the category name
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const category = await prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
        slug,
        parentId: data.parentId,
      },
    })

    revalidatePath("/admin/categories")
    revalidatePath("/categories")

    return { success: true, data: category }
  } catch (error) {
    console.error("Failed to create category:", error)
    return { success: false, error: "Failed to create category" }
  }
}

export async function updateCategory(
  categoryId: string,
  data: {
    name?: string
    description?: string
    parentId?: string | null
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

    // Handle removing parent (setting to null)
    if (data.parentId === null) {
      updateData.parentId = null
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
    })

    revalidatePath("/admin/categories")
    revalidatePath("/categories")

    return { success: true, data: category }
  } catch (error) {
    console.error("Failed to update category:", error)
    return { success: false, error: "Failed to update category" }
  }
}

export async function deleteCategory(categoryId: string) {
  try {
    // Check if category has products
    const productsCount = await prisma.product.count({
      where: { categoryId },
    })

    if (productsCount > 0) {
      return {
        success: false,
        error: "Cannot delete category with associated products",
      }
    }

    // Check if category has subcategories
    const subCategoriesCount = await prisma.category.count({
      where: { parentId: categoryId },
    })

    if (subCategoriesCount > 0) {
      return {
        success: false,
        error: "Cannot delete category with subcategories",
      }
    }

    await prisma.category.delete({
      where: { id: categoryId },
    })

    revalidatePath("/admin/categories")
    revalidatePath("/categories")

    return { success: true }
  } catch (error) {
    console.error("Failed to delete category:", error)
    return { success: false, error: "Failed to delete category" }
  }
}

export async function getAllCategories(options?: {
  parentId?: string | null
  includeProducts?: boolean
}) {
  try {
    const whereClause: any = {}

    if (options?.parentId !== undefined) {
      whereClause.parentId = options.parentId
    }

    const categories = await prisma.category.findMany({
      where: whereClause,
      include: {
        parent: true,
        subCategories: true,
        products: options?.includeProducts || false,
      },
      orderBy: {
        name: "asc",
      },
    })

    return { success: true, data: categories }
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    return { success: false, error: "Failed to fetch categories" }
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        subCategories: true,
        products: {
          where: { isActive: true },
          include: {
            inventory: true,
          },
        },
      },
    })

    if (!category) {
      return { success: false, error: "Category not found" }
    }

    return { success: true, data: category }
  } catch (error) {
    console.error("Failed to fetch category:", error)
    return { success: false, error: "Failed to fetch category" }
  }
}

