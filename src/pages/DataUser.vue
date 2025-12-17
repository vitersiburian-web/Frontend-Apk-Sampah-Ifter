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

    <!-- Loading State -->
    <div v-if="loading" class="text-center q-py-lg">
      <q-spinner color="primary" size="2em" />
      <div class="text-grey-7 q-mt-sm">Memuat data...</div>
    </div>

    <!-- Data List -->
    <q-card class="data-card" v-else>
      <q-card-section class="q-pb-none">
        <div class="text-weight-bold text-grey-8">Daftar User ({{ filteredUsers.length }})</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-list separator class="q-mt-sm">
          <q-item
            v-for="user in filteredUsers"
            :key="user.id"
            class="q-py-md data-item"
            clickable
            v-ripple
          >
            <q-item-section avatar>
              <q-avatar color="grey-1" text-color="grey-8" size="md">
                <q-icon name="person" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-bold text-dark">
                {{ user.nama_warga }}
              </q-item-label>
              <q-item-label caption class="text-grey-7">
                <q-icon name="location_on" size="12px" class="q-mr-xs" />
                {{ user.alamat || '-' }}
              </q-item-label>
              <q-item-label caption class="text-grey-7 q-mt-xs">
                <q-icon name="phone" size="12px" class="q-mr-xs" />
                {{ user.no_telp || '-' }}
              </q-item-label>
            </q-item-section>

            <q-item-section side top>
              <div class="row q-gutter-xs">
                <q-btn icon="edit" size="sm" color="blue" flat dense @click.stop="editItem(user)" />
                <q-btn
                  icon="delete"
                  size="sm"
                  color="red"
                  flat
                  dense
                  @click.stop="deleteItem(user.id)"
                />
              </div>
            </q-item-section>
          </q-item>

          <div v-if="filteredUsers.length === 0" class="text-center q-py-xl">
            <q-icon name="people_outline" size="50px" color="grey-4" />
            <div class="text-h6 text-grey-5 q-mt-md">Tidak ada data user</div>
            <div class="text-caption text-grey-6">
              {{
                searchQuery
                  ? `Tidak ditemukan user dengan kata kunci "${searchQuery}"`
                  : 'Belum ada user terdaftar'
              }}
            </div>
          </div>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import axios from 'axios'

const router = useRouter()
const $q = useQuasar()

const dataType = ref('user')
const searchQuery = ref('')
const users = ref([])
const loading = ref(true)

// Fetch data user (warga)
const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await axios.get('http://127.0.0.1:5000/api/warga/')
    if (res.data.success) {
      users.value = res.data.data.map((user) => ({
        ...user,
        nama_warga: user.nama_warga || '-',
        alamat: user.alamat || '-',
        no_telp: user.no_telp || '-',
      }))
    }
  } catch (err) {
    console.error('Gagal mengambil data user:', err)
    $q.notify({
      type: 'negative',
      message: 'Gagal mengambil data user',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

// Filter users berdasarkan pencarian
const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) return users.value

  const query = searchQuery.value.toLowerCase()
  return users.value.filter((user) => {
    return (
      user.nama_warga?.toLowerCase().includes(query) ||
      user.alamat?.toLowerCase().includes(query) ||
      user.no_telp?.toLowerCase().includes(query)
    )
  })
})

// Hapus user
const deleteItem = async (id) => {
  $q.dialog({
    title: 'Konfirmasi Hapus',
    message: 'Apakah Anda yakin ingin menghapus user ini?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await axios.delete(`http://127.0.0.1:5000/api/warga/${id}`)

      // Remove from local list
      users.value = users.value.filter((u) => u.id !== id)

      $q.notify({
        type: 'positive',
        message: 'User berhasil dihapus!',
        position: 'top',
      })
    } catch (err) {
      console.error(err)
      $q.notify({
        type: 'negative',
        message: 'Gagal menghapus user',
        position: 'top',
      })
    }
  })
}

// Navigasi
const goToAddUser = () => {
  router.push({ name: 'TambahUser' })
}

const editItem = (user) => {
  router.push({
    name: 'EditUser',
    params: { id: user.id },
  })
}

// Lifecycle
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.q-page {
  background-color: #f8faf9 !important;
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

.data-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.data-item {
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.2s ease;
}

.data-item:hover {
  background-color: #f5f9f7;
  transform: translateX(2px);
}

.text-primary {
  color: #006837 !important;
}
</style>
