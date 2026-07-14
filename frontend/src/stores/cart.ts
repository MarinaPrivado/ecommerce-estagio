import { reactive } from 'vue'
import type { Product } from '@/data/catalog'

export type CartItem = Product & { quantity: number }

export const cart = reactive<CartItem[]>([])

export const addToCart = (product: Product) => {
  const existing = cart.find((item) => item.id === product.id)
  if (existing) {
    existing.quantity += 1
  } else {
    cart.push({ ...product, quantity: 1 })
  }
}
