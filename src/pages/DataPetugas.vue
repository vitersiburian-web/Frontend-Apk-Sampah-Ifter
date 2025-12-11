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

    <q-list separator class="data-list">
      <q-item-label header class="text-weight-bold text-grey-8"
        >Daftar Petugas ({{ filteredPetugas.length }})</q-item-label
      >

      <q-item
        v-for="petugas in filteredPetugas"
        :key="petugas.id"
        class="q-py-md bg-white data-item"
      >
        <q-item-section avatar>
          <q-icon name="support_agent" color="primary" size="sm" />
        </q-item-section>

        <q-item-section>
          <q-item-label class="text-weight-bold text-dark text-lg">{{
            petugas.nama_petugas
          }}</q-item-label>
          <q-item-label caption>{{ petugas.no_telp }}</q-item-label>
          <q-item-label caption
            >Status:
            <q-badge
              :color="petugas.status === 'Aktif' ? 'green-7' : 'red-5'"
              :label="petugas.status"
              class="status-badge"
            />
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-btn
            label="Shift"
            size="sm"
            color="yellow-8"
            text-color="black"
            unelevated
            dense
            class="q-px-sm q-mb-xs rounded-btn"
          />
        </q-item-section>

        <q-item-section side>
          <q-btn
            icon="edit"
            size="sm"
            flat
            color="blue"
            dense
            @click="editItem(petugas)"
            class="q-mb-xs"
          />
          <q-btn icon="delete" size="sm" flat color="red" dense @click="deleteItem(petugas.id)" />
        </q-item-section>
      </q-item>

      <q-item v-if="filteredPetugas.length === 0" class="text-center text-grey-5 q-py-lg">
        <q-item-section>Tidak ada data petugas yang ditemukan.</q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
//import { petugasList, deletePetugas } from 'stores/adminStore'
import { useQuasar } from 'quasar'
import axios from 'axios'

const router = useRouter()
const $q = useQuasar()
const dataType = ref('petugas') // Default tab aktif
const searchQuery = ref('')
const petugasList = ref([])
const loading = ref(true)

const loadPetugas = async () => {
  try {
    const res = await axios.get('http://127.0.0.1:5000/api/petugas/')
    if (res.data.success) {
      petugasList.value = res.data.data
    }
  } catch (err) {
    console.error('Gagal mengambil data petugas:', err)
    $q.notify({ type: 'negative', message: 'Gagal mengambil data petugas' })
  } finally {
    loading.value = false
  }
}

loadPetugas()

const filteredPetugas = computed(() => {
  if (!searchQuery.value) return petugasList.value
  const q = searchQuery.value.toLowerCase()

  return petugasList.value.filter(
    (p) => p.nama_petugas.toLowerCase().includes(q) || String(p.no_telp).includes(q),
  )
})

const deleteItem = (id) => {
  $q.dialog({
    title: 'Konfirmasi Hapus',
    message: 'Yakin ingin menghapus petugas ini?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await axios.delete(`http://127.0.0.1:5000/api/petugas/${id}`)
      petugasList.value = petugasList.value.filter((p) => p.id !== id)

      $q.notify({ type: 'positive', message: 'Petugas dihapus!' })
    } catch (err) {
      console.error(err)
      $q.notify({ type: 'negative', message: 'Gagal menghapus petugas' })
    }
  })
}

const goToAddPetugas = () => {
  router.push({ name: 'TambahPetugas' })
}

const editItem = (petugas) => {
  $q.notify({ message: `Edit Petugas: ${petugas.name}`, color: 'blue' })
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.data-item {
  padding: 12px 16px;
}
.status-badge {
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 8px;
  font-weight: 500;
}
</style>
