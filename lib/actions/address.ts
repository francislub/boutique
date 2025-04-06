"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createAddress(data: {
  userId: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault?: boolean
}) {
  try {
    // If this is the default address, unset any existing default
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: data.userId, isDefault: true },
        data: { isDefault: false },
      })
    }

    const address = await prisma.address.create({
      data: {
        userId: data.userId,
        street: data.street,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        isDefault: data.isDefault ?? false,
      },
    })

    revalidatePath("/profile/addresses")

    return { success: true, data: address }
  } catch (error) {
    console.error("Failed to create address:", error)
    return { success: false, error: "Failed to create address" }
  }
}

export async function updateAddress(
  addressId: string,
  userId: string,
  data: {
    street?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
    isDefault?: boolean
  },
) {
  try {
    // Verify the address belongs to the user
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    })

    if (!address) {
      return { success: false, error: "Address not found" }
    }

    // If setting as default, unset any existing default
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      })
    }

    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data,
    })

    revalidatePath("/profile/addresses")

    return { success: true, data: updatedAddress }
  } catch (error) {
    console.error("Failed to update address:", error)
    return { success: false, error: "Failed to update address" }
  }
}

export async function deleteAddress(userId: string, addressId: string) {
  try {
    // Verify the address belongs to the user
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    })

    if (!address) {
      return { success: false, error: "Address not found" }
    }

    await prisma.address.delete({
      where: { id: addressId },
    })

    revalidatePath("/profile/addresses")

    return { success: true }
  } catch (error) {
    console.error("Failed to delete address:", error)
    return { success: false, error: "Failed to delete address" }
  }
}

export async function getUserAddresses(userId: string) {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    })

    return { success: true, data: addresses }
  } catch (error) {
    console.error("Failed to fetch addresses:", error)
    return { success: false, error: "Failed to fetch addresses" }
  }
}

export async function getAddressById(addressId: string, userId: string) {
  try {
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    })

    if (!address) {
      return { success: false, error: "Address not found" }
    }

    return { success: true, data: address }
  } catch (error) {
    console.error("Failed to fetch address:", error)
    return { success: false, error: "Failed to fetch address" }
  }
}

export async function setDefaultAddress(userId: string, addressId: string) {
  try {
    // Unset any existing default
    await prisma.address.updateMany({
      where: { userId: userId, isDefault: true },
      data: { isDefault: false },
    })

    // Set the new default
    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    })

    revalidatePath("/profile/addresses")

    return { success: true, data: updatedAddress }
  } catch (error) {
    console.error("Failed to set default address:", error)
    return { success: false, error: "Failed to set default address" }
  }
}

