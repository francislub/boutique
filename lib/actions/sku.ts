"use server"

import prisma from "@/lib/prisma"

/**
 * Generates a unique SKU based on a base SKU
 * If the base SKU is already taken, it appends a number to make it unique
 */
export async function generateUniqueSku(baseSku: string): Promise<string> {
  // Check if the base SKU is already taken
  const existingProduct = await prisma.product.findUnique({
    where: { sku: baseSku },
  })

  // If not taken, return the base SKU
  if (!existingProduct) {
    return baseSku
  }

  // If taken, find all SKUs that start with the base SKU followed by a dash and number
  const similarSkus = await prisma.product.findMany({
    where: {
      sku: {
        startsWith: `${baseSku}-`,
      },
    },
    select: {
      sku: true,
    },
  })

  // Extract the numbers from the similar SKUs
  const numbers = similarSkus
    .map((product) => {
      const match = product.sku.match(new RegExp(`^${baseSku}-([0-9]+)$`))
      return match ? Number.parseInt(match[1], 10) : 0
    })
    .filter((num) => !isNaN(num))

  // Find the highest number
  const highestNumber = numbers.length > 0 ? Math.max(...numbers) : 0

  // Return the base SKU with the next number
  return `${baseSku}-${highestNumber + 1}`
}
