<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getClients, createClient, updateClient, deleteClient } from '@/data/api'
import type { Client } from '@/data/catalog'

const clientList = ref<Client[]>([])
const editingId = ref<number | null>(null)
const form = reactive({
  name: '',
  email: '',
  phone: '',
  status: 'Ativo' as 'Ativo' | 'Inativo',
  city: '',
  document: '',
  address: '',
})

const resetForm = () => {
  form.name = ''
  form.email = ''
  form.phone = ''
  form.status = 'Ativo'
  form.city = ''
  form.document = ''
  form.address = ''
  editingId.value = null
}

const saveClient = async () => {
  if (!form.name || !form.email) return

  try {
    if (editingId.value) {
      await updateClient(editingId.value, { ...form })
    } else {
      await createClient({ ...form })
    }
    clientList.value = await getClients()
    resetForm()
  } catch {
    alert('Erro ao salvar cliente.')
  }
}

const editClient = (client: Client) => {
  editingId.value = client.id
  form.name = client.name
  form.email = client.email
  form.phone = client.phone
  form.status = client.status
  form.city = client.city
  form.document = client.document
  form.address = client.address
}

const removeClient = async (id: number) => {
  try {
    await deleteClient(id)
    clientList.value = await getClients()
    if (editingId.value === id) resetForm()
  } catch {
    alert('Erro ao remover cliente.')
  }
}

onMounted(async () => {
  try {
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
      <h1>Área de <span>clientes</span></h1>
      >
    </section>

    <section class="page-section crud-layout">
      <form class="crud-panel" @submit.prevent="saveClient">
        <div class="page-header">
          <div>
            <h2>{{ editingId ? 'Editar cliente' : 'Novo cliente' }}</h2>
            <p>Dados principais dos clientes.</p>
          </div>
        </div>

        <div class="form-grid">
          <label class="form-field">
            Nome
            <input v-model="form.name" required />
          </label>
          <label class="form-field">
            E-mail
            <input v-model="form.email" required type="email" />
          </label>
          <label class="form-field">
            Telefone
            <input v-model="form.phone" />
          </label>
          <label class="form-field">
            Cidade
            <input v-model="form.city" />
          </label>
          <label class="form-field">
            Status
            <select v-model="form.status">
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
          <button class="secondary-button" type="button" @click="resetForm">
            Limpar
          </button>
        </div>
      </form>

       

        
      
    </section>
</template>
