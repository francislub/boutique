"use server"

import prisma from "@/lib/prisma"
import { type OrderStatus, PaymentStatus } from "@prisma/client"

// Add this function to calculate month-over-month growth
export async function getMonthOverMonthGrowth() {
  try {
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()

    // Calculate start and end dates for current month
    const currentMonthStart = new Date(currentYear, currentMonth, 1)
    const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0)

    // Calculate start and end dates for previous month
    const prevMonthStart = new Date(currentYear, currentMonth - 1, 1)
    const prevMonthEnd = new Date(currentYear, currentMonth, 0)

    // Get current month sales
    const currentMonthSales = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        createdAt: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
        payment: {
          status: "COMPLETED",
        },
      },
    })

    // Get previous month sales
    const prevMonthSales = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        createdAt: {
          gte: prevMonthStart,
          lte: prevMonthEnd,
        },
        payment: {
          status: "COMPLETED",
        },
      },
    })

    // Get current month customers
    const currentMonthCustomers = await prisma.user.count({
      where: {
        role: "CLIENT",
        createdAt: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
    })

    // Get previous month customers
    const prevMonthCustomers = await prisma.user.count({
      where: {
        role: "CLIENT",
        createdAt: {
          gte: prevMonthStart,
          lte: prevMonthEnd,
        },
      },
    })

    // Calculate growth percentages
    const currentMonthTotal = currentMonthSales._sum.total || 0
    const prevMonthTotal = prevMonthSales._sum.total || 0

    const salesGrowth = prevMonthTotal === 0 ? 100 : ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100

    const customerGrowth =
      prevMonthCustomers === 0 ? 100 : ((currentMonthCustomers - prevMonthCustomers) / prevMonthCustomers) * 100

    return {
      salesGrowth: Number.parseFloat(salesGrowth.toFixed(1)),
      customerGrowth: Number.parseFloat(customerGrowth.toFixed(1)),
      newCustomers: currentMonthCustomers,
    }
  } catch (error) {
    console.error("Failed to calculate growth:", error)
    return {
      salesGrowth: 0,
      customerGrowth: 0,
      newCustomers: 0,
    }
  }
}

// Update the getDashboardStats function to include the growth data
export async function getDashboardStats() {
  try {
    // Get growth data
    const growth = await getMonthOverMonthGrowth()

    // Get total sales
    const totalSales = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        payment: {
          status: PaymentStatus.COMPLETED,
        },
      },
    })

    // Get total orders
    const totalOrders = await prisma.order.count()

    // Get total customers
    const totalCustomers = await prisma.user.count({
      where: {
        role: "CLIENT",
      },
    })

    // Get total products
    const totalProducts = await prisma.product.count()

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        payment: true,
      },
    })

    // Get low stock products
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
      },
      take: 5,
    })

    // Get sales by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    })

    // Get monthly sales for the current year
    const currentYear = new Date().getFullYear()
    const startOfYear = new Date(currentYear, 0, 1)
    const endOfYear = new Date(currentYear, 11, 31)

    const monthlySales = await prisma.order.groupBy({
      by: ["createdAt"],
      _sum: {
        total: true,
      },
      where: {
        createdAt: {
          gte: startOfYear,
          lte: endOfYear,
        },
        payment: {
          status: PaymentStatus.COMPLETED,
        },
      },
    })

    // Format monthly sales data
    const monthlyData = Array(12).fill(0)

    monthlySales.forEach((sale) => {
      const month = new Date(sale.createdAt).getMonth()
      monthlyData[month] = sale._sum.total || 0
    })

    // Get top selling products
    const topSellingProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    })

    const topProducts = await Promise.all(
      topSellingProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            images: true,
          },
        })

        return {
          ...product,
          totalSold: item._sum.quantity,
        }
      }),
    )

    // Add growth data to the returned object
    return {
      success: true,
      data: {
        totalSales: totalSales._sum.total || 0,
        totalOrders,
        totalCustomers,
        totalProducts,
        recentOrders,
        lowStockProducts,
        ordersByStatus: ordersByStatus.reduce(
          (acc, curr) => {
            acc[curr.status] = curr._count.id
            return acc
          },
          {} as Record<OrderStatus, number>,
        ),
        monthlySales: monthlyData,
        topSellingProducts: topProducts,
        salesGrowth: growth.salesGrowth,
        customerGrowth: growth.customerGrowth,
        newCustomers: growth.newCustomers,
      },
    }
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error)
    return { success: false, error: "Failed to fetch dashboard stats" }
  }
}

