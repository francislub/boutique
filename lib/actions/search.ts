"use server"

import prisma from "@/lib/prisma"

export async function searchProducts(query: string) {
  try {
    if (!query || query.trim() === "") {
      return { success: true, data: [] }
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
          { category: { name: { contains: query, mode: "insensitive" } } },
        ],
        isActive: true,
      },
      include: {
        category: true,
        inventory: true,
      },
      take: 10,
    })

    return { success: true, data: products }
  } catch (error) {
    console.error("Failed to search products:", error)
    return { success: false, error: "Failed to search products" }
  }
}

export async function searchOrders(query: string) {
  try {
    if (!query || query.trim() === "") {
      return { success: true, data: [] }
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { orderNumber: { contains: query, mode: "insensitive" } },
          { user: { name: { contains: query, mode: "insensitive" } } },
          { user: { email: { contains: query, mode: "insensitive" } } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        payment: true,
      },
      take: 10,
    })

    return { success: true, data: orders }
  } catch (error) {
    console.error("Failed to search orders:", error)
    return { success: false, error: "Failed to search orders" }
  }
}

export async function searchCustomers(query: string) {
  try {
    if (!query || query.trim() === "") {
      return { success: true, data: [] }
    }

    const customers = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } },
        ],
        role: "CLIENT",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
      take: 10,
    })

    return { success: true, data: customers }
  } catch (error) {
    console.error("Failed to search customers:", error)
    return { success: false, error: "Failed to search customers" }
  }
}

