"use server"

import { hash } from "bcryptjs"
import prisma from "@/lib/prisma"
import { UserRole } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function createUser(data: {
  name: string
  email: string
  password: string
  phone?: string
  role?: UserRole
}) {
  const hashedPassword = await hash(data.password, 10)

  try {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        role: data.role || UserRole.CLIENT,
      },
    })

    // Remove password from the returned object
    const { password, ...userWithoutPassword } = user

    return { success: true, data: userWithoutPassword }
  } catch (error) {
    console.error("Failed to create user:", error)
    return { success: false, error: "Failed to create user" }
  }
}

export async function updateUser(
  userId: string,
  data: {
    name?: string
    email?: string
    phone?: string
    password?: string
  },
) {
  try {
    const updateData: any = { ...data }

    // If password is being updated, hash it
    if (data.password) {
      updateData.password = await hash(data.password, 10)
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    // Remove password from the returned object
    const { password, ...userWithoutPassword } = user

    revalidatePath("/admin/users")
    revalidatePath(`/admin/users/${userId}`)
    revalidatePath("/profile")

    return { success: true, data: userWithoutPassword }
  } catch (error) {
    console.error("Failed to update user:", error)
    return { success: false, error: "Failed to update user" }
  }
}

export async function deleteUser(userId: string) {
  try {
    await prisma.user.delete({
      where: { id: userId },
    })

    revalidatePath("/admin/users")

    return { success: true }
  } catch (error) {
    console.error("Failed to delete user:", error)
    return { success: false, error: "Failed to delete user" }
  }
}

export async function getAllUsers(role?: UserRole) {
  try {
    const whereClause = role ? { role } : {}

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { success: true, data: users }
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return { success: false, error: "Failed to fetch users" }
  }
}

export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        addresses: true,
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!user) {
      return { success: false, error: "User not found" }
    }

    return { success: true, data: user }
  } catch (error) {
    console.error("Failed to fetch user:", error)
    return { success: false, error: "Failed to fetch user" }
  }
}

