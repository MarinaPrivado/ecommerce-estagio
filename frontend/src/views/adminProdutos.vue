<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { formatCurrency } from '@/data/catalog'
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getClients,
  updateClient,
  deleteClient,
} from '@/data/api'
import type { Product, Client } from '@/data/catalog'

const productList = ref<Product[]>([])
const editingId = ref<number | null>(null)
const form = reactive({
  name: '',
  brand: '',
  category: 'Notebooks',
  price: 0,
  oldPrice: null as number | null,
  stock: 0,
  badge: '',
  icon: 'pi-box',
  description: '',
})

const resetForm = () => {
  form.name = ''
  form.brand = ''
  form.category = 'Notebooks'
  form.price = 0
  form.oldPrice = null
  form.stock = 0
  form.badge = ''
  form.icon = 'pi-box'
  form.description = ''
  editingId.value = null
}

const saveProduct = async () => {
  if (!form.name || !form.brand || !form.category) return

  try {
    if (editingId.value) {
      await updateProduct(editingId.value, form)
    } else {
      await createProduct(form)
    }
    productList.value = await getProducts()
    resetForm()
  } catch {
    alert('Erro ao salvar produto.')
  }
}

const editProduct = (product: Product) => {
  editingId.value = product.id
  form.name = product.name
  form.brand = product.brand
  form.category = product.category
  form.price = product.price
  form.oldPrice = product.oldPrice ?? null
  form.stock = product.stock
  form.badge = product.badge || ''
  form.icon = product.icon
  form.description = product.description
}

const removeProduct = async (id: number) => {
  try {
    await deleteProduct(id)
    productList.value = await getProducts()
    if (editingId.value === id) resetForm()
  } catch {
    alert('Erro ao remover produto.')
  }
}

const clientList = ref<Client[]>([])
const editingClientId = ref<number | null>(null)
const clientForm = reactive({
  name: '',
  email: '',
  phone: '',
  city: '',
  status: 'Ativo' as 'Ativo' | 'Inativo',
})

const resetClientForm = () => {
  clientForm.name = ''
  clientForm.email = ''
  clientForm.phone = ''
  clientForm.city = ''
  clientForm.status = 'Ativo'
  editingClientId.value = null
}

const editClient = (client: Client) => {
  editingClientId.value = client.id
  clientForm.name = client.name
  clientForm.email = client.email
  clientForm.phone = client.phone
  clientForm.city = client.city
  clientForm.status = client.status
}

const saveClient = async () => {
  if (!clientForm.name || !clientForm.email) return

  try {
    if (editingClientId.value) {
      await updateClient(editingClientId.value, {
        ...clientForm,
        document: '',
        address: '',
      })
    }
    clientList.value = await getClients()
    resetClientForm()
  } catch {
    alert('Erro ao salvar cliente.')
  }
}

const removeClient = async (id: number) => {
  try {
    await deleteClient(id)
    clientList.value = await getClients()
    if (editingClientId.value === id) resetClientForm()
  } catch {
    alert('Erro ao remover cliente.')
  }
}

onMounted(async () => {
  try {
    productList.value = await getProducts()
    clientList.value = await getClients()
  } catch {
    // silent
  }
})
</script>

<template>
  <section class="page-hero">
      <RouterLink class="ghost-button" to="/">
        <i class="pi pi-arrow-left"></i>
        Home
      </RouterLink>
      <h1>Área do <span>admin</span></h1>
     
     <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
      <button class="primary-button" type="button" @click="resetForm">
       
      <a class="primary-button" href="#produtos-lista">
        <i class="pi pi-box"></i>
        Produtos cadastrados
      </a>
      </button>
      <a class="primary-button" href="#clientes">
        <i class="pi pi-users"></i>
        Clientes cadastrados
      </a>
      </div>
    </section>

    <section class="page-section crud-layout">
      <form class="crud-panel" @submit.prevent="saveProduct">
        <div class="page-header">
          <div>
            <h2>{{ editingId ? 'Editar produto' : 'Novo produto' }}</h2>
            <p>Campos principais da tabela produtos.</p>
          </div>
        </div>

        <div class="form-grid">
          <label class="form-field">
            Produto
            <input v-model="form.name" required />
          </label>
          <label class="form-field">
            Marca
            <input v-model="form.brand" required />
          </label>
          <label class="form-field">
            Categoria
            <select v-model="form.category">
              <option>Notebooks</option>
              <option>Smartphones</option>
              <option>Periféricos</option>
              <option>Componentes</option>
              <option>Áudio</option>
              <option>Acessórios</option>
            </select>
          </label>
          
          <label class="form-field">
            Preco
            <input v-model.number="form.price" min="0" step="0.01" type="number" />
          </label>
          <label class="form-field">
            Estoque
            <input v-model.number="form.stock" min="0" type="number" />
          </label>
          <label class="form-field full">
            Descricao
            <textarea v-model="form.description"></textarea>
          </label>
        </div>

        <div class="form-actions">
          <button class="primary-button" type="submit">
            <i class="pi pi-save"></i>
            Salvar
          </button>
          <button class="secondary-button" type="button" @click="resetForm">
            Limpar
          </button>
        </div>
      </form>

      <div id="produtos-lista" class="crud-panel">
        <div class="page-header">
          <div>
            <h2>Produtos cadastrados</h2>
            <p>{{ productList.length }} itens no catalogo.</p>
          </div>
        </div>

        <div v-for="product in productList" :key="product.id" class="admin-row">
          <div class="item-icon">
            <i class="pi" :class="product.icon"></i>
          </div>
          <div>
            <strong>{{ product.name }}</strong>
            <p class="muted">
              {{ product.category }} / {{ formatCurrency(product.price) }} /
              {{ product.stock }} un.
            </p>
          </div>
          <div class="table-actions">
            <button class="secondary-button" type="button" @click="editProduct(product)">
              <i class="pi pi-pencil"></i>
            </button>
            <button class="danger-button" type="button" @click="removeProduct(product.id)">
              <i class="pi pi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </section>


    <section id="clientes" class="page-section" :class="{ 'crud-layout': editingClientId }">
      <form v-if="editingClientId" class="crud-panel" @submit.prevent="saveClient">
        <div class="page-header">
          <div>
            <h2>Editar cliente</h2>
            <p>Altere os dados do cliente.</p>
          </div>
        </div>

        <div class="form-grid">
          <label class="form-field">
            Nome
            <input v-model="clientForm.name" required />
          </label>
          <label class="form-field">
            Email
            <input v-model="clientForm.email" type="email" required />
          </label>
          <label class="form-field">
            Telefone
            <input v-model="clientForm.phone" />
          </label>
          <label class="form-field">
            Cidade
            <input v-model="clientForm.city" />
          </label>
          <label class="form-field">
            Status
            <select v-model="clientForm.status">
              <option>Ativo</option>
              <option>Inativo</option>
            </select>
          </label>
        </div>

        <div class="form-actions">
          <button class="primary-button" type="submit">
            <i class="pi pi-save"></i>
            Salvar
          </button>
          <button class="secondary-button" type="button" @click="resetClientForm">
            Cancelar
          </button>
        </div>
      </form>

      <div class="crud-panel">
        <div class="page-header">
          <div>
            <h2>Clientes cadastrados</h2>
            <p>{{ clientList.length }} clientes.</p>
          </div>
        </div>

        <div v-for="client in clientList" :key="client.id" class="admin-row">
          <div class="item-icon">
            <i class="pi pi-user"></i>
          </div>
          <div>
            <strong>{{ client.name }}</strong>
            <p class="muted">{{ client.email }} / {{ client.phone }} / {{ client.city }}</p>
            <span class="status-pill" :class="{ inactive: client.status === 'Inativo' }">
              {{ client.status }}
            </span>
          </div>
          <div class="table-actions">
            <button class="secondary-button" type="button" @click="editClient(client)">
              <i class="pi pi-pencil"></i>
            </button>
            <button class="danger-button" type="button" @click="removeClient(client.id)">
              <i class="pi pi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
</template>
