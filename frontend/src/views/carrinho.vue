<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { formatCurrency } from '@/data/catalog'
import { getClients, createOrder } from '@/data/api'
import { useAuthStore } from '@/stores/auth'
import { cart } from '@/stores/cart'

const router = useRouter()
const auth = useAuthStore()

const subtotal = computed(() =>
  cart.reduce((total, item) => total + item.price * item.quantity, 0),
)
const shipping = computed(() => (subtotal.value >= 299 ? 0 : 29.9))
const total = computed(() => subtotal.value + shipping.value)

const increase = (id: number) => {
  const item = cart.find((cartItem) => cartItem.id === id)
  if (item) item.quantity += 1
}

const decrease = (id: number) => {
  const idx = cart.findIndex((cartItem) => cartItem.id === id)
  if (idx === -1) return
  if (cart[idx].quantity <= 1) {
    cart.splice(idx, 1)
  } else {
    cart[idx].quantity -= 1
  }
}

const checkout = async () => {
  if (!auth.isAuthenticated || !auth.user) {
    router.push('/login')
    return
  }

  try {
    const clients = await getClients()
    const client = clients.find((c) => c.email === auth.user!.email)

    if (!client) {
      alert('Nenhum cliente encontrado com este e-mail. Cadastre-se como cliente primeiro.')
      return
    }

    await createOrder({
      client_id: client.id,
      total: total.value,
      status: 'Pendente',
      items: JSON.stringify(
        cart.map((item) => ({
          product_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      ),
    })

    alert('Pedido realizado com sucesso!')
    cart.splice(0, cart.length)
    router.push('/')
  } catch {
    alert('Erro ao finalizar pedido. Tente novamente.')
  }
}
</script>

<template>
  <section class="page-hero">
      <RouterLink class="ghost-button" to="/listagem">
        <i class="pi pi-arrow-left"></i>
        Continuar comprando
      </RouterLink>
      <h1>Carrinho de <span>compras</span></h1>
      
    </section>

    <section class="page-section cart-layout">
      <div v-if="cart.length === 0" class="cart-card" style="text-align:center;padding:3rem 1rem;">
        <i class="pi pi-shopping-cart" style="font-size:3rem;opacity:0.3;margin-bottom:1rem;"></i>
        <p class="muted">Seu carrinho está vazio.</p>
        <RouterLink class="primary-button" to="/listagem" style="margin-top:1rem;display:inline-flex;">
          <i class="pi pi-arrow-left"></i>
          Ver produtos
        </RouterLink>
      </div>
      <template v-else>
      <div class="cart-card">
        <div v-for="item in cart" :key="item.id" class="cart-item">
          <div class="item-icon">
            <i class="pi" :class="item.icon"></i>
          </div>
          <div>
            <strong>{{ item.name }}</strong>
            <p class="muted">{{ item.brand }} / {{ formatCurrency(item.price) }}</p>
            <div class="quantity-control" aria-label="Controle de quantidade">
              <button type="button" @click="decrease(item.id)">-</button>
              <span>{{ item.quantity }}</span>
              <button type="button" @click="increase(item.id)">+</button>
            </div>
          </div>
          <strong>{{ formatCurrency(item.price * item.quantity) }}</strong>
        </div>
      </div>

      <aside class="summary-card">
        <h2>Resumo do pedido</h2>
        <div class="summary-row">
          <span>Subtotal</span>
          <strong>{{ formatCurrency(subtotal) }}</strong>
        </div>
        <div class="summary-row">
          <span>Frete</span>
          <strong>{{ shipping === 0 ? 'Grátis' : formatCurrency(shipping) }}</strong>
        </div>
        <div class="summary-row total">
          <span>Total</span>
          <strong>{{ formatCurrency(total) }}</strong>
        </div>
        <button class="primary-button" type="button" @click="checkout">
          Finalizar compra
          <i class="pi pi-arrow-right"></i>
        </button>
      </aside>
      </template>
    </section>
</template>
