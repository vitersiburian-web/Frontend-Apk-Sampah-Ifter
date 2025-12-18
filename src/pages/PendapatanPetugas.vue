<template>
  <q-page class="q-pa-md bg-green-1">
    <div class="text-h6 text-weight-bold text-primary q-mb-sm">Pendapatan</div>
    <div class="text-caption text-grey-7 q-mb-md">
      Lihat total pendapatan dan aktivitas kerja berdasarkan tanggal.
    </div>

    <q-card flat class="q-pa-sm q-mb-lg date-card" @click="showDatePicker = true">
      <div class="row items-center justify-between cursor-pointer">
        <div class="text-subtitle1 text-grey-8">{{ formattedDate }}</div>
        <q-icon name="event" color="primary" size="sm" />
      </div>
    </q-card>

    <q-dialog v-model="showDatePicker">
      <q-date v-model="selectedDateModel" mask="DD MMM YYYY" />
    </q-dialog>

    <q-card flat class="q-pa-md detail-card">
      <q-list separator>
        <q-item-label header class="text-weight-bold text-grey-9">Rincian Komisi</q-item-label>

        <q-item v-for="task in filteredIncomeTasks" :key="task.id" class="q-py-sm">
          <q-item-section>
            <q-item-label class="text-weight-medium">{{ task.name }}</q-item-label>
            <q-item-label caption>{{ task.bags }} karung • {{ task.payment }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="text-weight-bold text-green-8">
              Rp. {{ task.amount.toLocaleString('id-ID') }}
            </div>
          </q-item-section>
          <q-item-section side>
            <q-icon name="check_circle" color="green-8" size="xs" />
          </q-item-section>
        </q-item>

        <q-item v-if="filteredIncomeTasks.length === 0" class="text-center text-grey-5 q-py-lg">
          <q-item-section>Tidak ada pendapatan tercatat pada tanggal ini.</q-item-section>
        </q-item>
      </q-list>

      <q-separator class="q-my-md" />

      <div class="q-pa-sm">
        <div class="row justify-between q-mb-sm">
          <div>Total Pendapatan :</div>
          <div class="text-weight-bold">Rp. {{ totalIncome.toLocaleString('id-ID') }}</div>
        </div>
        <div class="row justify-between q-mb-md">
          <div class="text-green-8">Bonus :</div>
          <div class="text-weight-bold text-green-8">Rp. {{ bonus.toLocaleString('id-ID') }}</div>
        </div>

        <q-separator class="q-my-sm" />

        <div class="row justify-between text-h6 text-weight-bold text-primary">
          <div>Total Akhir :</div>
          <div>Rp. {{ totalAkhir.toLocaleString('id-ID') }}</div>
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { date, useQuasar } from 'quasar'
import { api } from 'src/services/api'

// =========================
// Helpers JWT (tanpa library)
// =========================
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1]
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

const $q = useQuasar()
const router = useRouter()

// token login (wajib)
const rawToken = localStorage.getItem('token') || ''
const token = rawToken.startsWith('Bearer ') ? rawToken.slice(7) : rawToken

// UI state untuk date picker
const showDatePicker = ref(false)

// Default tanggal: hari ini (REAL, bukan dummy)
const selectedDateModel = ref(date.formatDate(new Date(), 'DD MMM YYYY'))

const formattedDate = computed(() => selectedDateModel.value)

// date untuk request backend harus YYYY-MM-DD
const selectedDateApi = computed(() => date.formatDate(selectedDateModel.value, 'YYYY-MM-DD'))

// petugasId FIX dari DB (bukan hardcode)
const petugasId = ref(null)

// data dari backend
const incomeTasks = ref([]) // list detail
const bonus = ref(0)

// =========================
// Load petugasId dari token
// =========================
const loadPetugasId = async () => {
  if (!token) {
    $q.notify({ color: 'negative', message: 'Token tidak ditemukan. Silakan login ulang.' })
    router.push({ name: 'LoginPage' })
    return
  }

  const payload = parseJwt(token)
  if (!payload?.user_id) {
    $q.notify({ color: 'negative', message: 'Token tidak valid. Silakan login ulang.' })
    router.push({ name: 'LoginPage' })
    return
  }

  const res = await api.get(`/api/petugas/by-user/${payload.user_id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  const id = res?.data?.data?.id
  if (!id) throw new Error('petugasId tidak ditemukan dari endpoint by-user')
  petugasId.value = id
}

// =========================
// Fetch pendapatan dari backend
// =========================
const fetchPendapatan = async () => {
  if (!petugasId.value) return

  try {
    const res = await api.get('/api/petugas/pendapatan', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        date: selectedDateApi.value,
        petugas_id: petugasId.value,
      },
    })

    const data = res?.data?.data || {}

    // detail: [{ id, name, bags, payment, amount, status, date }]
    const detail = Array.isArray(data.detail) ? data.detail : []

    // Pastikan semua angka benar-benar number (biar toLocaleString aman)
    incomeTasks.value = detail.map((t) => ({
      id: Number(t.id),
      name: t.name ?? '-',
      bags: Number(t.bags ?? 0),
      payment: t.payment ?? 'Cash',
      amount: Number(t.amount ?? 0),
      status: t.status ?? 'Sudah diambil',
      date: t.date ?? selectedDateApi.value,
    }))

    bonus.value = Number(data.bonus ?? 0)
  } catch (err) {
    console.error('Gagal ambil pendapatan:', err)
    incomeTasks.value = []
    bonus.value = 0
    $q.notify({ color: 'negative', message: 'Gagal memuat data pendapatan.' })
  }
}

// =========================
// Filtering & total (sesuai design awal)
// =========================
const filteredIncomeTasks = computed(() => {
  const filterDate = selectedDateApi.value

  return incomeTasks.value.filter(
    (task) =>
      date.formatDate(task.date, 'YYYY-MM-DD') === filterDate &&
      task.status === 'Sudah diambil' &&
      Number(task.amount) > 0,
  )
})

const totalIncome = computed(() => {
  return filteredIncomeTasks.value.reduce((sum, task) => sum + Number(task.amount || 0), 0)
})

const totalAkhir = computed(() => {
  return totalIncome.value + Number(bonus.value || 0)
})

// =========================
// Init + auto refresh saat ganti tanggal
// =========================
onMounted(async () => {
  try {
    await loadPetugasId()
    await fetchPendapatan()
  } catch (err) {
    console.error(err)
    $q.notify({ color: 'negative', message: 'Gagal memuat data petugas.' })
  }
})

watch(selectedDateModel, async () => {
  showDatePicker.value = false
  await fetchPendapatan()
})
</script>

<style scoped>
.q-page {
  background-color: #f1f8e9 !important;
}
.text-primary {
  color: #006837 !important;
}
.text-green-8 {
  color: #4caf50 !important;
}

.date-card,
.detail-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
</style>
