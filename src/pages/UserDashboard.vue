<template>
  <q-page class="q-pa-md">
    <!-- Welcome Header -->
    <div class="q-mb-lg">
      <div class="text-h5 text-weight-bold text-dark-green q-mb-xs">
        Selamat datang, {{ username }}
      </div>
      <div class="text-caption text-grey-7">
        {{ getGreeting() }} | Terakhir login: {{ formatTime(lastLogin) }}
      </div>
    </div>

    <!-- Pengajuan Status Card -->
    <q-card v-if="hasPengajuan" flat class="status-card q-mb-lg" :class="{ 'bg-orange-1': true }">
      <q-card-section class="q-pa-md">
        <div class="row items-center justify-between">
          <div class="col">
            <div class="text-subtitle1 text-weight-bold text-dark">Laporan Pengajuan Anda</div>
            <div class="text-caption text-grey-7 q-mt-xs">Status pengajuan terbaru</div>
          </div>
          <q-btn
            flat
            dense
            round
            icon="close"
            color="grey-7"
            size="sm"
            @click="clearPengajuanData"
          />
        </div>

        <div class="row items-center q-mt-md">
          <q-badge color="orange" class="status-badge">
            <q-icon name="schedule" size="14px" class="q-mr-xs" />
            Menunggu Konfirmasi
          </q-badge>
        </div>

        <div class="q-mt-md">
          <div class="row items-center q-gutter-sm q-mb-xs">
            <q-icon name="event" color="primary" size="16px" />
            <div class="text-body2 text-dark">
              {{ formatJadwal(jadwalDiajukan) }}
            </div>
          </div>
          <div class="row items-center q-gutter-sm">
            <q-icon name="recycling" color="primary" size="16px" />
            <div class="text-body2 text-dark">
              {{ jenisSampahDiajukan }}
            </div>
          </div>
        </div>

        <div class="text-caption text-grey-7 q-mt-sm">
          <q-icon name="info" size="14px" class="q-mr-xs" />
          Petugas akan menghubungi Anda dalam 1-2 jam
        </div>
      </q-card-section>
    </q-card>

    <!-- Jadwal Pengambilan Card -->
    <q-card flat class="schedule-card q-mb-lg">
      <q-card-section class="q-pa-none">
        <!-- Header dengan icon -->
        <div class="schedule-header q-pa-md bg-green-1">
          <div class="row items-center">
            <q-icon name="calendar_month" color="primary" size="28px" class="q-mr-md" />
            <div>
              <div class="text-subtitle1 text-weight-bold text-dark-green">Jadwal Pengambilan</div>
              <div class="text-caption text-grey-7">Jadwal pengambilan sampah terdekat</div>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="q-pa-md">
          <div v-if="jadwalList.length > 0">
            <div class="row items-center q-mb-sm">
              <q-icon name="today" color="green" size="20px" class="q-mr-sm" />
              <div class="text-h6 text-weight-bold text-dark-green">
                {{ formatDay(jadwalList[0].tanggal) }}
              </div>
            </div>

            <div class="jadwal-details">
              <div class="detail-item">
                <q-icon name="place" color="grey" size="16px" />
                <div>
                  <div class="text-caption text-grey-7">Lokasi</div>
                  <div class="text-body2 text-weight-medium text-dark">
                    {{ jadwalList[0].wilayah || 'Area Anda' }}
                  </div>
                </div>
              </div>

              <div class="detail-item">
                <q-icon name="person" color="grey" size="16px" />
                <div>
                  <div class="text-caption text-grey-7">Petugas</div>
                  <div class="text-body2 text-weight-medium text-dark">
                    {{ jadwalList[0].nama_petugas || 'Menunggu penugasan' }}
                  </div>
                </div>
              </div>

              <div class="detail-item">
                <q-icon name="access_time" color="grey" size="16px" />
                <div>
                  <div class="text-caption text-grey-7">Waktu</div>
                  <div class="text-body2 text-weight-medium text-dark">
                    {{ getPickupTime(jadwalList[0].tanggal) }}
                  </div>
                </div>
              </div>
            </div>

            <q-badge
              :color="getStatusColor(jadwalList[0].status)"
              class="status-badge-large q-mt-md"
            >
              <q-icon :name="getStatusIcon(jadwalList[0].status)" size="14px" class="q-mr-xs" />
              {{ jadwalList[0].status || 'Menunggu penjemputan' }}
            </q-badge>
          </div>

          <div v-else class="text-center q-py-lg">
            <q-icon name="event_busy" size="48px" color="grey-4" />
            <div class="text-subtitle2 text-grey-6 q-mt-md">Belum ada jadwal pengambilan</div>
            <div class="text-caption text-grey-5">Jadwal akan muncul ketika ada penugasan</div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Action Button -->
    <div class="action-section">
      <q-btn
        label="Ajukan Pengambilan"
        icon="add"
        size="lg"
        class="action-button full-width"
        rounded
        no-caps
        :disable="!canAjukan"
        :loading="loadingAction"
        @click="handleAjukan"
      />

      <div v-if="!canAjukan" class="text-center q-mt-sm">
        <div class="text-caption text-grey-7">
          Pengajuan hanya dapat dilakukan pada hari jadwal pengambilan
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="row q-col-gutter-sm q-mt-lg">
      <div class="col-6">
        <q-card flat class="stat-card">
          <q-card-section class="text-center">
            <q-icon name="history" color="primary" size="md" class="q-mb-xs" />
            <div class="text-h6 text-weight-bold text-dark">{{ totalRiwayat }}</div>
            <div class="text-caption text-grey-7">Total Pengambilan</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6">
        <q-card flat class="stat-card">
          <q-card-section class="text-center">
            <q-icon name="pending_actions" color="orange" size="md" class="q-mb-xs" />
            <div class="text-h6 text-weight-bold text-dark">{{ pendingCount }}</div>
            <div class="text-caption text-grey-7">Menunggu</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Dialog Konfirmasi -->
    <q-dialog v-model="showDialog" persistent>
      <q-card class="dialog-card">
        <q-card-section class="text-center">
          <q-avatar color="primary-1" text-color="primary" size="lg" class="q-mb-sm">
            <q-icon name="recycling" />
          </q-avatar>
          <div class="text-h6 text-weight-bold text-dark-green q-mb-sm">
            Apakah Sampah Sudah Dipilah?
          </div>
          <div class="text-body2 text-grey-7 q-mb-md">
            Pastikan sampah sudah dipilah sesuai jenisnya (organik, anorganik, B3) sebelum
            pengambilan.
          </div>
        </q-card-section>

        <q-card-actions align="center" class="q-pb-md">
          <q-btn
            label="Belum, Batal"
            flat
            color="grey"
            @click="showDialog = false"
            class="q-px-lg"
          />
          <q-btn
            label="Sudah, Lanjut"
            color="primary"
            unelevated
            @click="goToLaporan"
            class="q-px-lg"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { date } from 'quasar'
import axios from 'axios'
import {
  jadwalPengajuan,
  jenisSampahPengajuan,
  statusPengajuan,
  clearPengajuan,
} from 'src/stores/laporanStore'

const router = useRouter()

// State
const showDialog = ref(false)
const jadwalList = ref([])
const username = ref('')
const jadwalToday = ref(null)
const loadingAction = ref(false)
const totalRiwayat = ref(0)
const pendingCount = ref(0)
const lastLogin = ref(new Date())

// Data dari store
const jadwalDiajukan = jadwalPengajuan
const jenisSampahDiajukan = jenisSampahPengajuan
const hasPengajuan = statusPengajuan

// Computed
const canAjukan = computed(() => {
  if (!jadwalToday.value) return false
  if (hasPengajuan.value) return false // Sudah ada pengajuan

  // Cek apakah hari ini ada jadwal
  const today = date.formatDate(new Date(), 'YYYY-MM-DD')
  const jadwalDate = date.formatDate(jadwalToday.value.tanggal, 'YYYY-MM-DD')

  return jadwalDate === today
})

// Methods
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Selamat pagi!'
  if (hour < 15) return 'Selamat siang!'
  if (hour < 18) return 'Selamat sore!'
  return 'Selamat malam!'
}

const formatTime = (dateTime) => {
  return date.formatDate(dateTime, 'HH:mm')
}

const formatJadwal = (dateString) => {
  if (!dateString) return '-'
  try {
    return date.formatDate(dateString, 'dddd, D MMMM YYYY')
  } catch {
    return dateString
  }
}

const formatDay = (dateString) => {
  if (!dateString) return '-'
  try {
    return date.formatDate(dateString, 'dddd, D MMMM')
  } catch {
    return dateString
  }
}

const getPickupTime = (dateString) => {
  try {
    const dateObj = new Date(dateString)
    const hour = dateObj.getHours()

    if (hour < 12) return 'Pagi (08:00-12:00)'
    if (hour < 15) return 'Siang (12:00-15:00)'
    return 'Sore (15:00-18:00)'
  } catch {
    return '08:00-12:00'
  }
}

const getStatusColor = (status) => {
  if (!status) return 'blue'
  const statusLower = status.toLowerCase()
  if (statusLower.includes('selesai') || statusLower.includes('diambil')) return 'green'
  if (statusLower.includes('proses') || statusLower.includes('menunggu')) return 'orange'
  if (statusLower.includes('batal')) return 'red'
  return 'blue'
}

const getStatusIcon = (status) => {
  if (!status) return 'pending'
  const statusLower = status.toLowerCase()
  if (statusLower.includes('selesai') || statusLower.includes('diambil')) return 'check_circle'
  if (statusLower.includes('proses') || statusLower.includes('menunggu')) return 'schedule'
  if (statusLower.includes('batal')) return 'cancel'
  return 'pending'
}

const clearPengajuanData = () => {
  clearPengajuan()
}

const handleAjukan = () => {
  showDialog.value = true
}

const goToLaporan = () => {
  showDialog.value = false
  if (jadwalToday.value) {
    router.push({
      name: 'UserLaporan',
      query: { id_jadwal: jadwalToday.value.id },
    })
  }
}

// Fetch functions
const fetchUserName = async () => {
  try {
    const user_id = localStorage.getItem('user_id')
    if (!user_id) {
      username.value = 'Pengguna'
      return
    }

    const token = localStorage.getItem('token')
    const res = await axios.get(`http://localhost:5000/api/warga/by-user/${user_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    username.value = res.data.data?.nama_warga || 'Pengguna'
  } catch (err) {
    console.error('Gagal memuat nama warga:', err)
    username.value = 'Pengguna'
  }
}

const fetchJadwalWeek = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/jadwal/week')
    jadwalList.value = res.data.data || []
  } catch (err) {
    console.error('Gagal ambil jadwal week:', err)
  }
}

const fetchJadwalToday = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/jadwal/today')
    if (res.data.success && res.data.data.length > 0) {
      jadwalToday.value = res.data.data[0]
    } else {
      jadwalToday.value = null
    }
  } catch (err) {
    console.error('Gagal ambil jadwal today:', err)
    jadwalToday.value = null
  }
}

const fetchStats = async () => {
  try {
    const user_id = localStorage.getItem('user_id')
    if (!user_id) return

    // Fetch riwayat untuk menghitung stats
    const res = await axios.get('http://localhost:5000/api/riwayat', {
      params: { id_warga: user_id },
    })

    if (res.data.success) {
      const riwayatData = res.data.data || []
      totalRiwayat.value = riwayatData.length
      pendingCount.value = riwayatData.filter(
        (r) =>
          r.status?.toLowerCase().includes('menunggu') ||
          r.status?.toLowerCase().includes('pending'),
      ).length
    }
  } catch (err) {
    console.error('Gagal memuat stats:', err)
  }
}

// Lifecycle
onMounted(async () => {
  await fetchUserName()
  await fetchJadwalWeek()
  await fetchJadwalToday()
  await fetchStats()
})
</script>

<style scoped>
.text-dark-green {
  color: #08602e !important;
}

/* Status Card */
.status-card {
  border-radius: 16px;
  border-left: 4px solid #ff9800;
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.1);
}

.status-badge {
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
}

/* Schedule Card */
.schedule-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.schedule-header {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-bottom: 1px solid rgba(0, 104, 55, 0.1);
}

.jadwal-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-item div:last-child {
  flex: 1;
}

.status-badge-large {
  border-radius: 10px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
}

/* Action Section */
.action-section {
  margin-top: 24px;
}

.action-button {
  background: linear-gradient(135deg, #ffd155 0%, #ffca28 100%) !important;
  color: #08602e !important;
  font-weight: 600;
  height: 48px;
  box-shadow: 0 4px 15px rgba(255, 209, 85, 0.3);
  transition: all 0.3s ease;
}

.action-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 209, 85, 0.4);
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Stat Cards */
.stat-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

/* Dialog */
.dialog-card {
  border-radius: 20px;
  min-width: 320px;
  max-width: 400px;
}
</style>
