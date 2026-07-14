<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { formatCurrency } from '@/data/catalog'
import { getProduct } from '@/data/api'
import { addToCart } from '@/stores/cart'
import type { Product } from '@/data/catalog'

const route = useRoute()
const router = useRouter()
const product = ref<Product | null>(null)
const error = ref(false)

onMounted(async () => {
  try {
    product.value = await getProduct(Number(route.params.id))
  } catch {
    error.value = true
  }
})

const handleAddToCart = () => {
  if (!product.value) return
  addToCart(product.value)
  router.push('/carrinho')
}
</script>

<template>
  <section class="page-hero">
      <RouterLink class="ghost-button" to="/listagem">
        <i class="pi pi-arrow-left"></i>
        Voltar para vitrine
      </RouterLink>
      <h1>Detalhes do <span>produto</span></h1>
      <p>Pagina de descrição, ficha técnica e chamada para adicionar ao carrinho.</p>
    </section>

    <section class="page-section">
      <p v-if="error" class="muted">Produto não encontrado.</p>
      <article v-else-if="product" class="detail-card">
        <div class="detail-visual">
          <i class="pi" :class="product.icon"></i>
        </div>

        <div>
          <span class="eyebrow">{{ product.brand }} / {{ product.category }}</span>
          <h2>{{ product.name }}</h2>
          <p class="muted">{{ product.description }}</p>

          <div class="price-row">
            <span class="price">{{ formatCurrency(product.price) }}</span>
            <span v-if="product.oldPrice" class="old-price">
              {{ formatCurrency(product.oldPrice) }}
            </span>
          </div>

          <ul class="spec-list">
            <li v-for="spec in product.specs" :key="spec">
              <i class="pi pi-check-circle"></i>
              <span>{{ spec }}</span>
            </li>
          </ul>

          <p><strong>Estoque:</strong> {{ product.stock }} unidades disponiveis</p>
          <p><strong>Avaliacao:</strong> <span class="rating">{{ product.rating }} / 5</span></p>

          <div class="hero-actions">
            <button class="primary-button" type="button" @click="handleAddToCart">
              <i class="pi pi-shopping-cart"></i>
              Adicionar ao carrinho
            </button>
          </div>
        </div>
      </article>
      <p v-else class="muted">Carregando...</p>
    </section>
</template>
