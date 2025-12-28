<template>
  <q-page class="q-pa-md bg-green-1">
    <!-- Header dengan Info Jadwal -->
    <q-card flat class="rounded-borders q-mb-md card-status">
      <q-card-section class="q-pb-sm">
        <div class="row items-center justify-between">
          <div>
            <div class="text-h6 text-weight-bold text-primary">Tugas Pengambilan Sampah</div>
            <div v-if="jadwalInfo" class="text-caption text-grey-7">
              {{ jadwalInfo.wilayah }} • {{ formatJam(jadwalInfo.jam_mulai) }} -
              {{ formatJam(jadwalInfo.jam_selesai) }}
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

      <!-- List Tugas -->
      <q-list separator>
        <!-- Tugas dari Laporan User -->
        <q-item
          v-for="task in tugasList.filter((t) => t.type === 'laporan')"
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

        <!-- Tugas Patroli (jika tidak ada laporan) -->
        <q-item
          v-for="task in tugasList.filter((t) => t.type === 'patroli')"
          :key="task.id"
          class="q-py-md bg-blue-1"
          clickable
          v-ripple
          @click="goToPatroli(task)"
        >
          <q-item-section avatar>
            <q-avatar color="blue" text-color="white" size="md">
              <q-icon name="explore" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-bold text-blue-9">{{ task.name }}</q-item-label>
            <q-item-label caption>{{ task.address }}</q-item-label>
            <q-item-label caption class="text-blue-7">
              <q-icon name="location_on" size="xs" />
              Patroli wilayah {{ jadwalInfo?.wilayah || 'tugas' }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge color="blue" label="Patroli" />
          </q-item-section>
        </q-item>

        <!-- Empty State -->
        <q-item v-if="tugasList.length === 0" class="text-center text-grey-5 q-py-lg">
          <q-item-section>
            <q-icon name="event_busy" size="xl" color="grey-4" class="q-mb-sm" />
            <div>Tidak ada tugas untuk hari ini.</div>
            <div class="text-caption">Hubungi administrator untuk penugasan</div>
          </q-item-section>
        </q-item>
      </q-list>
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
            >
              <template v-slot:loading>
                <q-spinner-hourglass class="on-left" />
                Loading...
              </template>
            </q-btn>
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
const filterDate = ref(date.formatDate(today, 'YYYY-MM-DD'))
const currentDate = ref(date.formatDate(today, 'DD MMM YYYY'))
const tugasList = ref([])
const jadwalInfo = ref(null)
const petugasId = ref(null)
const loading = ref(false)

// Token
const rawToken = localStorage.getItem('token') || ''
const token = rawToken.startsWith('Bearer ') ? rawToken.slice(7) : rawToken

// Helper Functions
const parseJwt = (tokenStr) => {
  try {
    const base64Url = tokenStr.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

const formatJam = (timeString) => {
  if (!timeString) return ''
  return timeString.slice(0, 5)
}

// Computed
const hasLaporanPending = computed(() => {
  return tugasList.value.some((t) => t.type === 'laporan' && t.status === 'Belum diambil')
})

const getActionLabel = () => {
  if (hasLaporanPending.value) {
    return `Ada ${tugasList.value.filter((t) => t.type === 'laporan' && t.status === 'Belum diambil').length} laporan menunggu`
  }
  return 'Lakukan patroli rutin di wilayah yang ditugaskan'
}

// Load petugas ID
const loadPetugasId = async () => {
  if (!token) {
    $q.notify({
      color: 'negative',
      message: 'Token tidak ditemukan. Silakan login ulang.',
    })
    router.push({ name: 'LoginPage' })
    return false
  }

  const payload = parseJwt(token)
  const userId =
    payload?.user_id ||
    payload?.id ||
    payload?.userId ||
    payload?.sub ||
    payload?.uid ||
    payload?.id_user

  if (!userId) {
    $q.notify({
      color: 'negative',
      message: 'Token tidak valid. Silakan login ulang.',
    })
    router.push({ name: 'LoginPage' })
    return false
  }

  try {
    const res = await api.get(`/api/petugas/by-user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const petugasData = res.data?.data
    if (!petugasData) {
      throw new Error('Data petugas tidak ditemukan')
    }

    petugasId.value = petugasData.id
    return true
  } catch (error) {
    console.error('Error load petugas:', error)
    $q.notify({
      color: 'negative',
      message: 'Gagal memuat data petugas',
    })
    return false
  }
}

// Fetch tugas
// Fetch laporan untuk hari ini (tanpa filter wilayah)
const fetchTugas = async () => {
  loading.value = true
  try {
    // Gunakan endpoint laporan dengan filter tanggal
    const res = await api.get('/api/laporan', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        tanggal: filterDate.value, // Filter by tanggal
        status: 'menunggu,dijemput', // ambil yang masih aktif
      },
    })

    if (res.data.success) {
      // Transform data dari API laporan ke format tugas
      tugasList.value = (res.data.data || []).map((laporan) => ({
        id: `laporan_${laporan.id}`,
        name: laporan.nama_warga || 'Pelanggan',
        address: laporan.alamat || '-',
        jenis_sampah: laporan.jenis_sampah || '-',
        jumlah_karung: laporan.jumlah_karung || 0,
        status: laporan.status === 'selesai' ? 'Sudah diambil' : 'Belum diambil',
        type: 'laporan',
        original_id: laporan.id,
      }))

      // Coba dapatkan jadwal info (opsional)
      await fetchJadwalInfo()

      // Jika tidak ada laporan, tambahkan patroli default
      if (tugasList.value.length === 0) {
        tugasList.value = [
          {
            id: `patroli_${petugasId.value}_${filterDate.value}`,
            name: 'Patroli Rutin',
            address: 'Area layanan',
            jenis_sampah: 'Campuran',
            jumlah_karung: 0,
            status: 'Belum diambil',
            type: 'patroli',
            original_id: null,
          },
        ]
      }
    }
  } catch (err) {
    console.error('Error fetch tugas:', err)
    $q.notify({
      color: 'negative',
      message: 'Gagal memuat data laporan',
    })
  } finally {
    loading.value = false
  }
}

// Fungsi untuk mendapatkan info jadwal (opsional)
const fetchJadwalInfo = async () => {
  if (!petugasId.value) return

  try {
    const res = await api.get('/api/petugas/jadwal/hari-ini', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        petugas_id: petugasId.value,
        tanggal: filterDate.value,
      },
    })

    if (res.data.success && res.data.data) {
      jadwalInfo.value = res.data.data
    }
  } catch (err) {
    console.error('Error fetch jadwal:', err)
    // Tetap lanjut meski error
  }
}

// Navigation functions
const goToForm = (task) => {
  if (!task?.original_id) return

  if (task.type === 'laporan') {
    router.push({
      name: 'FormPengambilanSampah',
      query: {
        laporan_id: task.original_id,
        date: filterDate.value,
        type: 'laporan',
      },
    })
  } else {
    // Untuk patroli, buat laporan baru
    mulaiPatroli()
  }
}

const goToPatroli = (task) => {
  router.push({
    name: 'FormPengambilanSampah',
    query: {
      patroli: 'true',
      wilayah: task.address,
      date: filterDate.value,
      type: 'patroli',
    },
  })
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
      wilayah: jadwalInfo.value?.wilayah || 'Wilayah Tugas',
      date: filterDate.value,
      petugas_id: petugasId.value,
      type: 'patroli',
    },
  })
}

const tambahLaporanManual = () => {
  $q.dialog({
    title: 'Tambah Laporan Manual',
    message: 'Apakah Anda menemukan sampah yang tidak dilaporkan?',
    cancel: true,
    persistent: true,
    ok: {
      label: 'Ya, Tambah',
      color: 'primary',
    },
  }).onOk(() => {
    router.push({
      name: 'FormPengambilanSampah',
      query: {
        manual: 'true',
        wilayah: jadwalInfo.value?.wilayah || 'Wilayah Tugas',
        date: filterDate.value,
        type: 'manual',
      },
    })
  })
}

const lihatPeta = () => {
  $q.notify({
    type: 'info',
    message: 'Fitur peta akan segera tersedia',
    position: 'top',
    timeout: 2000,
  })
}

// Lifecycle
onMounted(async () => {
  try {
    const ok = await loadPetugasId()
    if (!ok) return
    await fetchTugas()
  } catch (err) {
    console.error('Error init:', err)
    $q.notify({
      color: 'negative',
      message: 'Gagal memuat dashboard',
    })
  }
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
