import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price)
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(new Date(date))
}

export function truncate(str: string, length: number) {
  if (str.length <= length) {
    return str
  }
  return str.slice(0, length) + "..."
}

export function generateOrderNumber() {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

export function calculateDiscount(price: number, discountType: string, discountValue: number) {
  if (discountType === "percentage") {
    return price * (discountValue / 100)
  }

  if (discountType === "fixed_amount") {
    return discountValue
  }

  return 0
}

