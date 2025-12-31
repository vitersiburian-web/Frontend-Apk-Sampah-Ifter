<template>
  <q-page class="q-pa-md bg-green-1">
    <!-- Header dengan Info Jadwal -->
    <q-card flat class="rounded-borders q-mb-md card-status">
      <q-card-section class="q-pb-sm">
        <div class="row items-center justify-between">
          <div>
            <div class="text-h6 text-weight-bold text-primary">Tugas Pengambilan Sampah</div>
            <div class="text-caption text-grey-7">
              {{ currentDate }}
            </div>
          </div>
          <q-btn
            icon="event"
            :label="currentDate"
            flat
            dense
            color="primary"
            class="text-weight-medium"
          />
        </div>
      </q-card-section>

      <q-separator />

      <!-- Loading State -->
      <div v-if="loading" class="text-center q-pa-lg">
        <q-spinner color="primary" size="3em" />
        <div class="text-caption text-grey-7 q-mt-md">Memuat data...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center q-pa-lg">
        <q-icon name="error_outline" size="3em" color="negative" />
        <div class="text-h6 text-negative q-mt-md">Gagal memuat data</div>
        <div class="text-caption text-grey-7 q-mt-sm">{{ errorMessage }}</div>
        <q-btn color="primary" label="Coba Lagi" @click="fetchData" class="q-mt-md" />
      </div>

      <!-- List Tugas -->
      <q-list separator v-else-if="tugasList.length > 0">
        <!-- Tugas dari Laporan -->
        <q-item
          v-for="task in tugasList"
          :key="task.id"
          :class="{
            'bg-white': task.status === 'Belum diambil',
            'bg-green-1': task.status === 'Sudah diambil',
          }"
          clickable
          v-ripple
          @click="goToForm(task)"
          class="q-py-md"
        >
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white" size="md">
              {{ task.name.charAt(0) }}
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-bold text-name-color">{{ task.name }}</q-item-label>
            <q-item-label caption>{{ task.address }}</q-item-label>
            <q-item-label caption class="text-blue">
              <q-icon name="recycling" size="xs" />
              {{ task.jenis_sampah }} • {{ task.jumlah_karung }} karung
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge
              :color="task.status === 'Sudah diambil' ? 'green-7' : 'red-5'"
              :label="task.status"
            />
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Empty State -->
      <div v-else class="text-center q-pa-lg">
        <q-icon name="event_busy" size="3em" color="grey-4" class="q-mb-sm" />
        <div class="text-grey-7">Tidak ada tugas untuk hari ini</div>
        <div class="text-caption text-grey-5 q-mt-xs">Silakan hubungi administrator</div>
      </div>
    </q-card>

    <!-- Quick Actions -->
    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-6">
        <q-card
          flat
          class="rounded-borders text-center q-pa-sm action-card"
          clickable
          @click="tambahLaporanManual"
        >
          <q-icon name="add_circle" size="md" color="primary" class="q-mb-xs" />
          <div class="text-caption text-weight-medium">Tambah Laporan</div>
        </q-card>
      </div>
      <div class="col-6">
        <q-card
          flat
          class="rounded-borders text-center q-pa-sm action-card"
          clickable
          @click="lihatPeta"
        >
          <q-icon name="map" size="md" color="green-7" class="q-mb-xs" />
          <div class="text-caption text-weight-medium">Lihat Peta</div>
        </q-card>
      </div>
    </div>

    <!-- Tombol Aksi Utama -->
    <q-card flat class="rounded-borders q-mb-xl card-map">
      <q-card-section class="q-pa-md bg-white">
        <div class="text-center q-mb-sm">
          <div class="text-subtitle1 text-weight-bold text-primary">Mulai Pengambilan</div>
          <div class="text-caption text-grey-7">
            {{ getActionLabel() }}
          </div>
        </div>

        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-btn
              label="AMBIL DARI LAPORAN"
              color="yellow-8"
              text-color="black"
              unelevated
              class="full-width text-weight-bold q-py-sm"
              :disable="!hasLaporanPending"
              @click="goToLaporanPending"
            />
          </div>
          <div class="col-6">
            <q-btn
              label="MULAI PATROLI"
              color="primary"
              unelevated
              class="full-width text-weight-bold q-py-sm"
              @click="mulaiPatroli"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { date, useQuasar } from 'quasar'
import { api } from 'src/services/api'

const $q = useQuasar()
const router = useRouter()

// Data
const today = new Date()
const currentDate = ref(date.formatDate(today, 'DD MMM YYYY'))
const tugasList = ref([])
const loading = ref(false)
const error = ref(false)
const errorMessage = ref('')
const petugasData = ref(null)

// Token
const getToken = () => {
  const rawToken = localStorage.getItem('token') || ''
  return rawToken.startsWith('Bearer ') ? rawToken.slice(7) : rawToken
}

// Load data petugas
const loadPetugasData = async () => {
  try {
    const token = getToken()
    const userId = localStorage.getItem('user_id')

    if (!userId) {
      throw new Error('User ID tidak ditemukan')
    }

    // Coba endpoint alternatif jika endpoint /petugas/by-user tidak ada
    let petugasInfo = null

    try {
      // Method 1: Coba endpoint spesifik
      const response = await api.get(`/api/petugas/by-user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data.success) {
        petugasInfo = response.data.data
      }
    } catch (apiError) {
      console.log('Method 1 failed, trying method 2...', apiError)

      // Method 2: Coba get semua petugas dan filter
      try {
        const allPetugas = await api.get('/api/petugas', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (allPetugas.data.success) {
          petugasInfo = allPetugas.data.data.find((p) => p.user_id == userId)
        }
      } catch (secondError) {
        console.log('Method 2 failed', secondError)
      }
    }

    // Method 3: Jika masih gagal, buat data dummy
    if (!petugasInfo) {
      console.log('Creating dummy petugas data...')
      petugasInfo = {
        id: userId,
        nama_lengkap: localStorage.getItem('username') || 'Petugas',
        no_telepon: '',
        alamat: '',
        status_kerja: 'aktif',
      }
    }

    petugasData.value = petugasInfo

    // Simpan ke localStorage untuk akses mudah
    localStorage.setItem('petugas_id', petugasInfo.id)
    localStorage.setItem('petugas_nama', petugasInfo.nama_lengkap)

    return true
  } catch (err) {
    console.error('Error loading petugas data:', err)
    errorMessage.value = 'Gagal memuat data petugas'
    return false
  }
}

// Fetch laporan tugas
const fetchTugas = async () => {
  loading.value = true
  error.value = false

  try {
    const token = getToken()

    // Get laporan yang menunggu pengambilan
    const response = await api.get('/api/laporan', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        status: 'menunggu,diproses', // Hanya yang belum selesai
        limit: 10,
      },
    })

    if (response.data.success) {
      tugasList.value = response.data.data.map((laporan) => ({
        id: laporan.id,
        name: laporan.nama_pemohon || laporan.nama_warga || 'Pelanggan',
        address: laporan.alamat_detail || laporan.alamat || '-',
        jenis_sampah: laporan.jenis_sampah || 'Campuran',
        jumlah_karung: laporan.jumlah_karung || 1,
        status: laporan.status === 'diproses' ? 'Sedang Diproses' : 'Belum diambil',
        type: 'laporan',
        original_id: laporan.id,
      }))

      // Jika tidak ada laporan, tambahkan patroli default
      if (tugasList.value.length === 0) {
        tugasList.value = [
          {
            id: 'patroli_1',
            name: 'Patroli Rutin',
            address: 'Wilayah Tugas',
            jenis_sampah: 'Campuran',
            jumlah_karung: 0,
            status: 'Belum diambil',
            type: 'patroli',
            original_id: null,
          },
        ]
      }
    } else {
      throw new Error('Response tidak sukses')
    }
  } catch (err) {
    console.error('Error fetching tugas:', err)
    error.value = true
    errorMessage.value = 'Gagal memuat data tugas'

    // Fallback data untuk testing
    tugasList.value = [
      {
        id: 'test_1',
        name: 'Budi Santoso',
        address: 'Jl. Melati No. 10, RT 01/RW 02',
        jenis_sampah: 'Plastik & Organik',
        jumlah_karung: 2,
        status: 'Belum diambil',
        type: 'laporan',
        original_id: 1,
      },
      {
        id: 'patroli_1',
        name: 'Patroli Rutin',
        address: 'Wilayah Suraja',
        jenis_sampah: 'Campuran',
        jumlah_karung: 0,
        status: 'Belum diambil',
        type: 'patroli',
        original_id: null,
      },
    ]
  } finally {
    loading.value = false
  }
}

// Computed properties
const hasLaporanPending = computed(() => {
  return tugasList.value.some((t) => t.type === 'laporan' && t.status === 'Belum diambil')
})

const getActionLabel = () => {
  const pendingCount = tugasList.value.filter(
    (t) => t.type === 'laporan' && t.status === 'Belum diambil',
  ).length
  if (pendingCount > 0) {
    return `Ada ${pendingCount} laporan menunggu pengambilan`
  }
  return 'Lakukan patroli rutin di wilayah tugas'
}

// Navigation functions
const goToForm = (task) => {
  if (task.type === 'laporan') {
    router.push({
      name: 'FormPengambilanSampah',
      query: {
        laporan_id: task.original_id,
        type: 'laporan',
      },
    })
  } else {
    mulaiPatroli()
  }
}

const goToLaporanPending = () => {
  const pendingTask = tugasList.value.find(
    (t) => t.type === 'laporan' && t.status === 'Belum diambil',
  )
  if (pendingTask) {
    goToForm(pendingTask)
  }
}

const mulaiPatroli = () => {
  router.push({
    name: 'FormPengambilanSampah',
    query: {
      patroli: 'true',
      wilayah: 'Wilayah Tugas',
      type: 'patroli',
    },
  })
}

const tambahLaporanManual = () => {
  $q.dialog({
    title: 'Tambah Laporan Manual',
    message: 'Apakah Anda menemukan sampah yang tidak dilaporkan?',
    cancel: true,
    ok: {
      label: 'Ya, Tambah',
      color: 'primary',
    },
  }).onOk(() => {
    router.push({
      name: 'FormPengambilanSampah',
      query: {
        manual: 'true',
        type: 'manual',
      },
    })
  })
}

const lihatPeta = () => {
  router.push({ name: 'PetugasMaps' })
}

// Initialize
const fetchData = async () => {
  await loadPetugasData()
  await fetchTugas()
}

// Lifecycle
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.q-page {
  background-color: #f1f8e9 !important;
}

.rounded-borders {
  border-radius: 16px;
}

.text-primary {
  color: #006837 !important;
}

.text-name-color {
  color: #1a237e !important;
}

.q-badge {
  padding: 6px 10px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 11px;
}

.card-status,
.card-map {
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.action-card {
  transition: all 0.2s ease;
  cursor: pointer;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}
</style>
