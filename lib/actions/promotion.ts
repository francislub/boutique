"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createPromotion(data: {
  code: string
  description?: string
  discountType: string
  discountValue: number
  minPurchase?: number
  maxUses?: number
  startDate: Date
  endDate: Date
  isActive?: boolean
}) {
  try {
    const promotion = await prisma.promotion.create({
      data: {
        code: data.code.toUpperCase(),
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minPurchase: data.minPurchase,
        maxUses: data.maxUses,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive ?? true,
      },
    })

    revalidatePath("/admin/promotions")

    return { success: true, data: promotion }
  } catch (error) {
    console.error("Failed to create promotion:", error)
    return { success: false, error: "Failed to create promotion" }
  }
}

export async function updatePromotion(
  promotionId: string,
  data: {
    code?: string
    description?: string
    discountType?: string
    discountValue?: number
    minPurchase?: number | null
    maxUses?: number | null
    startDate?: Date
    endDate?: Date
    isActive?: boolean
  },
) {
  try {
    // If code is provided, convert to uppercase
    const updateData: any = { ...data }
    if (data.code) {
      updateData.code = data.code.toUpperCase()
    }

    const promotion = await prisma.promotion.update({
      where: { id: promotionId },
      data: updateData,
    })

    revalidatePath("/admin/promotions")

    return { success: true, data: promotion }
  } catch (error) {
    console.error("Failed to update promotion:", error)
    return { success: false, error: "Failed to update promotion" }
  }
}

export async function deletePromotion(promotionId: string) {
  try {
    await prisma.promotion.delete({
      where: { id: promotionId },
    })

    revalidatePath("/admin/promotions")

    return { success: true }
  } catch (error) {
    console.error("Failed to delete promotion:", error)
    return { success: false, error: "Failed to delete promotion" }
  }
}

export async function getAllPromotions(includeInactive = false) {
  try {
    const whereClause: any = {}

    if (!includeInactive) {
      whereClause.isActive = true
    }

    const promotions = await prisma.promotion.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    })

    return { success: true, data: promotions }
  } catch (error) {
    console.error("Failed to fetch promotions:", error)
    return { success: false, error: "Failed to fetch promotions" }
  }
}

export async function getPromotionByCode(code: string) {
  try {
    const promotion = await prisma.promotion.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    })

    if (!promotion) {
      return { success: false, error: "Promotion not found or expired" }
    }

    // Check if promotion has reached max uses
    if (promotion.maxUses && promotion.usedCount >= promotion.maxUses) {
      return { success: false, error: "Promotion has reached maximum usage limit" }
    }

    return { success: true, data: promotion }
  } catch (error) {
    console.error("Failed to fetch promotion:", error)
    return { success: false, error: "Failed to fetch promotion" }
  }
}

export async function incrementPromotionUsage(promotionId: string) {
  try {
    const promotion = await prisma.promotion.update({
      where: { id: promotionId },
      data: {
        usedCount: {
          increment: 1,
        },
      },
    })

    return { success: true, data: promotion }
  } catch (error) {
    console.error("Failed to increment promotion usage:", error)
    return { success: false, error: "Failed to increment promotion usage" }
  }
}

