<template>
  <q-page class="q-pa-md bg-green-1">
    <div class="row q-mb-md">
      <q-btn-toggle
        v-model="dataType"
        toggle-color="green"
        color="white"
        text-color="primary"
        :options="[
          { label: 'Data Petugas', value: 'petugas' },
          { label: 'Data User', value: 'user', to: { name: 'DataUser' } },
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
        @click="goToAddPetugas"
        class="q-px-md text-weight-bold rounded-btn"
      />
      <q-input
        v-model="searchQuery"
        placeholder="Cari Petugas..."
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
        <div class="text-weight-bold text-grey-8">
          Daftar Petugas ({{ filteredPetugas.length }})
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-list separator class="q-mt-sm">
          <q-item
            v-for="petugas in filteredPetugas"
            :key="petugas.id"
            class="q-py-md data-item"
            clickable
            v-ripple
          >
            <q-item-section avatar>
              <q-avatar color="primary-1" text-color="primary-8" size="md">
                <q-icon name="support_agent" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-bold text-dark">
                {{ petugas.nama_petugas }}
              </q-item-label>
              <q-item-label caption class="text-grey-7">
                <q-icon name="phone" size="12px" class="q-mr-xs" />
                {{ petugas.no_telp || '-' }}
              </q-item-label>
              <q-item-label caption class="text-grey-7 q-mt-xs">
                <q-badge
                  :color="petugas.status === 'Aktif' ? 'green' : 'red'"
                  :label="petugas.status || 'Tidak Aktif'"
                  class="status-badge"
                />
              </q-item-label>
            </q-item-section>

            <q-item-section side top>
              <div class="row q-gutter-xs">
                <q-btn
                  label="Shift"
                  size="sm"
                  color="yellow-8"
                  text-color="black"
                  unelevated
                  dense
                  class="rounded-btn-sm"
                />
                <q-btn
                  icon="edit"
                  size="sm"
                  color="blue"
                  flat
                  dense
                  @click.stop="editItem(petugas)"
                />
                <q-btn
                  icon="delete"
                  size="sm"
                  color="red"
                  flat
                  dense
                  @click.stop="deleteItem(petugas.id)"
                />
              </div>
            </q-item-section>
          </q-item>

          <div v-if="filteredPetugas.length === 0" class="text-center q-py-xl">
            <q-icon name="people" size="50px" color="grey-4" />
            <div class="text-h6 text-grey-5 q-mt-md">Tidak ada data petugas</div>
            <div class="text-caption text-grey-6">
              {{
                searchQuery
                  ? `Tidak ditemukan petugas dengan kata kunci "${searchQuery}"`
                  : 'Belum ada petugas terdaftar'
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

const dataType = ref('petugas')
const searchQuery = ref('')
const petugasList = ref([])
const loading = ref(true)

// Fetch data petugas
const loadPetugas = async () => {
  loading.value = true
  try {
    const res = await axios.get('http://127.0.0.1:5000/api/petugas/')
    if (res.data.success) {
      petugasList.value = res.data.data.map((petugas) => ({
        ...petugas,
        status: petugas.status || 'Tidak Aktif',
      }))
    }
  } catch (err) {
    console.error('Gagal mengambil data petugas:', err)
    $q.notify({
      type: 'negative',
      message: 'Gagal mengambil data petugas',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

// Filter petugas berdasarkan pencarian
const filteredPetugas = computed(() => {
  if (!searchQuery.value.trim()) return petugasList.value

  const query = searchQuery.value.toLowerCase()
  return petugasList.value.filter((petugas) => {
    return (
      petugas.nama_petugas?.toLowerCase().includes(query) ||
      petugas.no_telp?.toLowerCase().includes(query) ||
      petugas.status?.toLowerCase().includes(query)
    )
  })
})

// Hapus petugas
const deleteItem = async (id) => {
  $q.dialog({
    title: 'Konfirmasi Hapus',
    message: 'Yakin ingin menghapus petugas ini?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await axios.delete(`http://127.0.0.1:5000/api/petugas/${id}`)

      // Remove from local list
      petugasList.value = petugasList.value.filter((p) => p.id !== id)

      $q.notify({
        type: 'positive',
        message: 'Petugas berhasil dihapus!',
        position: 'top',
      })
    } catch (err) {
      console.error(err)
      $q.notify({
        type: 'negative',
        message: 'Gagal menghapus petugas',
        position: 'top',
      })
    }
  })
}

// Navigasi
const goToAddPetugas = () => {
  router.push({ name: 'TambahPetugas' })
}

const editItem = (petugas) => {
  router.push({
    name: 'EditPetugas',
    params: { id: petugas.id },
  })
}

// Lifecycle
onMounted(() => {
  loadPetugas()
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

.rounded-btn-sm {
  border-radius: 8px;
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

.status-badge {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 10px;
  font-weight: 500;
}

.text-primary {
  color: #006837 !important;
}
</style>
