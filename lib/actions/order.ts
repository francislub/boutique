"use server"

import prisma from "@/lib/prisma"
import { OrderStatus, type PaymentMethod, PaymentStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function createOrder(data: {
  userId: string
  addressId: string
  items: Array<{
    productId: string
    variantId?: string
    quantity: number
    price: number
  }>
  paymentMethod: PaymentMethod
}) {
  try {
    // Calculate order totals
    const subtotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const tax = subtotal * 0.1 // Assuming 10% tax
    const shipping = 10 // Flat shipping rate
    const total = subtotal + tax + shipping

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Create the order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: data.userId,
        addressId: data.addressId,
        subtotal,
        tax,
        shipping,
        discount: 0,
        total,
        status: OrderStatus.PENDING,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
        payment: {
          create: {
            amount: total,
            method: data.paymentMethod,
            status: PaymentStatus.PENDING,
          },
        },
      },
      include: {
        items: true,
        payment: true,
      },
    })

    // Update inventory
    for (const item of data.items) {
      if (item.variantId) {
        // Update variant inventory
        const inventoryItem = await prisma.inventoryItem.findFirst({
          where: { variantId: item.variantId },
        })

        if (inventoryItem) {
          await prisma.inventoryItem.update({
            where: { id: inventoryItem.id },
            data: { quantity: inventoryItem.quantity - item.quantity },
          })
        }
      } else {
        // Update product inventory
        const inventory = await prisma.inventory.findUnique({
          where: { productId: item.productId },
          include: { items: true },
        })

        if (inventory && inventory.items.length > 0) {
          await prisma.inventoryItem.update({
            where: { id: inventory.items[0].id },
            data: { quantity: inventory.items[0].quantity - item.quantity },
          })

          // Update total quantity
          await prisma.inventory.update({
            where: { id: inventory.id },
            data: { totalQuantity: inventory.totalQuantity - item.quantity },
          })
        }
      }
    }

    // Clear the user's cart
    await prisma.cart
      .delete({
        where: { userId: data.userId },
      })
      .catch(() => {
        // Ignore if cart doesn't exist
      })

    revalidatePath("/orders")
    revalidatePath(`/orders/${order.id}`)
    revalidatePath("/admin/orders")

    return { success: true, data: order }
  } catch (error) {
    console.error("Failed to create order:", error)
    return { success: false, error: "Failed to create order" }
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    })

    revalidatePath("/orders")
    revalidatePath(`/orders/${orderId}`)
    revalidatePath("/admin/orders")

    return { success: true, data: order }
  } catch (error) {
    console.error("Failed to update order status:", error)
    return { success: false, error: "Failed to update order status" }
  }
}

export async function updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus, transactionId?: string) {
  try {
    const payment = await prisma.payment.update({
      where: { orderId },
      data: {
        status: paymentStatus,
        transactionId,
        ...(paymentStatus === PaymentStatus.COMPLETED ? { paymentDate: new Date() } : {}),
      },
    })

    // If payment is completed, update order status to PROCESSING
    if (paymentStatus === PaymentStatus.COMPLETED) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.PROCESSING },
      })
    }

    revalidatePath("/orders")
    revalidatePath(`/orders/${orderId}`)
    revalidatePath("/admin/orders")

    return { success: true, data: payment }
  } catch (error) {
    console.error("Failed to update payment status:", error)
    return { success: false, error: "Failed to update payment status" }
  }
}

export async function getAllOrders(options?: {
  userId?: string
  status?: OrderStatus
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}) {
  try {
    const whereClause: any = {}

    if (options?.userId) {
      whereClause.userId = options.userId
    }

    if (options?.status) {
      whereClause.status = options.status
    }

    if (options?.startDate || options?.endDate) {
      whereClause.createdAt = {}

      if (options?.startDate) {
        whereClause.createdAt.gte = options.startDate
      }

      if (options?.endDate) {
        whereClause.createdAt.lte = options.endDate
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
          payment: true,
          shippingAddress: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: options?.offset || 0,
        take: options?.limit || 50,
      }),
      prisma.order.count({ where: whereClause }),
    ])

    return {
      success: true,
      data: orders,
      meta: {
        total,
        limit: options?.limit || 50,
        offset: options?.offset || 0,
      },
    }
  } catch (error) {
    console.error("Failed to fetch orders:", error)
    return { success: false, error: "Failed to fetch orders" }
  }
}

export async function getOrderById(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        payment: true,
        shippingAddress: true,
      },
    })

    if (!order) {
      return { success: false, error: "Order not found" }
    }

    return { success: true, data: order }
  } catch (error) {
    console.error("Failed to fetch order:", error)
    return { success: false, error: "Failed to fetch order" }
  }
}

export async function getOrderByNumber(orderNumber: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        payment: true,
        shippingAddress: true,
      },
    })

    if (!order) {
      return { success: false, error: "Order not found" }
    }

    return { success: true, data: order }
  } catch (error) {
    console.error("Failed to fetch order:", error)
    return { success: false, error: "Failed to fetch order" }
  }
}

