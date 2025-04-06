"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateInventory(
  inventoryId: string,
  data: {
    totalQuantity?: number
    lowStockThreshold?: number
  },
) {
  try {
    const inventory = await prisma.inventory.update({
      where: { id: inventoryId },
      data,
    })

    const product = await prisma.product.findFirst({
      where: { inventory: { id: inventoryId } },
    })

    if (product) {
      revalidatePath(`/admin/products/${product.id}`)
      revalidatePath(`/products/${product.slug}`)
    }

    revalidatePath("/admin/inventory")

    return { success: true, data: inventory }
  } catch (error) {
    console.error("Failed to update inventory:", error)
    return { success: false, error: "Failed to update inventory" }
  }
}

export async function updateInventoryItem(
  inventoryItemId: string,
  data: {
    quantity: number
    location?: string
  },
) {
  try {
    const inventoryItem = await prisma.inventoryItem.update({
      where: { id: inventoryItemId },
      data,
      include: {
        inventory: true,
      },
    })

    // Update the total quantity in the inventory
    const allItems = await prisma.inventoryItem.findMany({
      where: { inventoryId: inventoryItem.inventoryId },
    })

    const totalQuantity = allItems.reduce((sum, item) => sum + item.quantity, 0)

    await prisma.inventory.update({
      where: { id: inventoryItem.inventoryId },
      data: { totalQuantity },
    })

    const product = await prisma.product.findFirst({
      where: { inventory: { id: inventoryItem.inventoryId } },
    })

    if (product) {
      revalidatePath(`/admin/products/${product.id}`)
      revalidatePath(`/products/${product.slug}`)
    }

    revalidatePath("/admin/inventory")

    return { success: true, data: inventoryItem }
  } catch (error) {
    console.error("Failed to update inventory item:", error)
    return { success: false, error: "Failed to update inventory item" }
  }
}

export async function getLowStockProducts() {
  try {
    const lowStockProducts = await prisma.product.findMany({
      where: {
        inventory: {
          totalQuantity: {
            lte: prisma.inventory.fields.lowStockThreshold,
          },
        },
      },
      include: {
        inventory: true,
        category: true,
      },
    })

    return { success: true, data: lowStockProducts }
  } catch (error) {
    console.error("Failed to fetch low stock products:", error)
    return { success: false, error: "Failed to fetch low stock products" }
  }
}

export async function getAllInventory() {
  try {
    const inventory = await prisma.product.findMany({
      include: {
        inventory: {
          include: {
            items: true,
          },
        },
        category: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return { success: true, data: inventory }
  } catch (error) {
    console.error("Failed to fetch inventory:", error)
    return { success: false, error: "Failed to fetch inventory" }
  }
}

