<template>
  <q-page class="q-pa-md bg-green-1">
    <div class="row q-mb-md">
      <q-btn-toggle
        v-model="dataType"
        toggle-color="green"
        color="white"
        text-color="primary"
        :options="[
          { label: 'Data Petugas', value: 'petugas', to: { name: 'DataPetugas' } },
          { label: 'Data User', value: 'user' },
        ]"
        unelevated
        spread
        class="rounded-toggle"
      />
    </div>

    <div class="row items-center q-gutter-sm q-mb-md">
      <q-btn
        label="Tambah"
        color="yellow-8"
        text-color="black"
        unelevated
        @click="goToAddUser"
        class="q-px-md text-weight-bold rounded-btn"
      />
      <q-input
        v-model="searchQuery"
        placeholder="Cari User..."
        dense
        outlined
        clearable
        class="col search-input"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <q-list separator class="data-list">
      <q-item-label header class="text-weight-bold text-grey-8"
        >Daftar User ({{ filteredUsers.length }})</q-item-label
      >

      <q-item v-for="user in filteredUsers" :key="user.id" class="q-py-md bg-white data-item">
        <q-item-section avatar>
          <q-icon name="person" color="grey-8" size="sm" />
        </q-item-section>

        <q-item-section>
          <q-item-label class="text-weight-bold text-dark text-lg">{{ user.name }}</q-item-label>
          <q-item-label caption>{{ user.address }}</q-item-label>
          <q-item-label caption>{{ user.phone }}</q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-btn
            icon="edit"
            size="sm"
            flat
            color="blue"
            dense
            @click="editItem(user)"
            class="q-mb-xs"
          />
          <q-btn icon="delete" size="sm" flat color="red" dense @click="deleteItem(user.id)" />
        </q-item-section>
      </q-item>

      <q-item v-if="filteredUsers.length === 0" class="text-center text-grey-5 q-py-lg">
        <q-item-section>Tidak ada data user yang ditemukan.</q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const router = useRouter()
const $q = useQuasar()

// state halaman
const searchQuery = ref('')
const users = ref([])

// Ambil data dari backend Flask
const fetchUsers = async () => {
  try {
    const res = await api.get('/warga/')
    if (res.data.success) {
      users.value = res.data.data.map((u) => ({
        id: u.id,
        name: u.nama_warga,
        address: u.alamat,
        phone: u.no_telp || u.lokasi || '-', // fallback jika tidak ada field
      }))
    }
  } catch (err) {
    console.log(err)
    $q.notify({ message: 'Gagal memuat data warga', color: 'negative' })
  }
}

onMounted(() => {
  fetchUsers()
})

// Filter pencarian
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value

  const q = searchQuery.value.toLowerCase()
  return users.value.filter(
    (u) =>
      u.name.toLowerCase().includes(q) ||
      u.address.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q),
  )
})

// Tombol Tambah
const goToAddUser = () => {
  router.push({ name: 'TambahUser' })
}

// Tombol Edit
const editItem = (user) => {
  router.push({ name: 'EditUser', params: { id: user.id } })
}

// Tombol Hapus
const deleteItem = (id) => {
  $q.dialog({
    title: 'Konfirmasi Hapus',
    message: 'Apakah Anda yakin ingin menghapus user ini?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await api.delete(`/warga/${id}`)
      users.value = users.value.filter((u) => u.id !== id)
      $q.notify({ message: 'Berhasil dihapus', color: 'positive' })
    } catch {
      $q.notify({ message: 'Gagal menghapus data', color: 'negative' })
    }
  })
}
</script>

<style scoped>
.q-page {
  background-color: #f1f8e9 !important;
}
.rounded-toggle {
  border-radius: 12px;
  border: 1px solid #006837;
}
.rounded-btn {
  border-radius: 12px;
}
.search-input :deep(.q-field__control) {
  border-radius: 12px;
  background: white;
}
.data-list {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* Shadow halus */
}
.data-item {
  padding: 12px 16px;
}
</style>
