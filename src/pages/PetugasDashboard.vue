<template>
  <q-page class="q-pa-md bg-green-1">
    <q-card flat class="rounded-borders q-mb-md card-status">
      <q-card-section class="q-pb-sm">
        <div class="text-h6 text-weight-bold text-primary">Status Pengambilan Sampah</div>
      </q-card-section>

      <q-card-section class="q-pt-sm row justify-between items-center">
        <div class="text-subtitle1 text-grey-8">Hari Ini</div>
        <q-btn
          icon="event"
          :label="currentDate"
          flat
          dense
          color="primary"
          class="text-weight-medium"
        />
      </q-card-section>

      <q-separator />

      <q-list separator>
        <q-item
          v-for="task in todayTasks"
          :key="task.id"
          :class="{
            'bg-white': task.status === 'Belum diambil',
            'bg-green-1': task.status === 'Sudah diambil',
          }"
          clickable
          v-ripple
          @click="task.status === 'Belum diambil' && goToForm(task)"
          class="q-py-md"
        >
          <q-item-section>
            <q-item-label class="text-weight-bold text-name-color">{{ task.name }}</q-item-label>
            <q-item-label caption>{{ task.address }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge
              :color="task.status === 'Sudah diambil' ? 'green-7' : 'red-5'"
              :label="task.status"
            />
          </q-item-section>
        </q-item>

        <q-item v-if="todayTasks.length === 0" class="text-center text-grey-5 q-py-lg">
          <q-item-section>Tidak ada tugas hari ini.</q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <q-card flat class="rounded-borders q-mb-xl card-map">
      <div class="map-placeholder">
        <q-icon name="place" size="xl" color="red" class="map-pin" />
      </div>

      <q-card-section class="q-pa-md bg-white">
        <q-btn
          label="PENGAMBILAN SAMPAH"
          color="yellow-8"
          text-color="black"
          unelevated
          class="full-width text-weight-bold"
          :disable="!firstPendingTask"
          @click="goToFirstPending"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { date, useQuasar } from 'quasar'
import { api } from 'src/services/api'

// =========================
// Helpers JWT (tanpa library)
// =========================
function parseJwt(tokenStr) {
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

const $q = useQuasar()
const router = useRouter()

// tanggal hari ini REAL
const today = new Date()
const filterDate = ref(date.formatDate(today, 'YYYY-MM-DD'))
const currentDate = ref(date.formatDate(today, 'DD MMM YYYY'))

const tasks = ref([])
const petugasId = ref(null)

// token login
const rawToken = localStorage.getItem('token') || ''
const token = rawToken.startsWith('Bearer ') ? rawToken.slice(7) : rawToken

// ambil id petugas berdasarkan user_id dari token
const loadPetugasId = async () => {
  if (!token) {
    $q.notify({ color: 'negative', message: 'Token tidak ditemukan. Silakan login ulang.' })
    router.push({ name: 'LoginPage' })
    return false
  }

  const payload = parseJwt(token)
  const userId =
    payload?.user_id ||
    payload?.id ||
    payload?.userId ||
    payload?.sub ||
    payload?.uid || // tambahan
    payload?.id_user // tambahan

  if (!userId) {
    $q.notify({ color: 'negative', message: 'Token tidak valid. Silakan login ulang.' })
    router.push({ name: 'LoginPage' })
    return false
  }

  const res = await api.get(`/api/petugas/by-user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  const id = res.data?.data?.id
  if (!id) throw new Error('petugasId tidak ditemukan dari endpoint by-user')

  petugasId.value = id
  return true
}

// ambil tugas dari backend
const fetchTasks = async () => {
  if (!petugasId.value) return

  const res = await api.get('/api/petugas/tugas', {
    headers: { Authorization: `Bearer ${token}` },
    params: { date: filterDate.value, petugas_id: petugasId.value },
  })

  tasks.value = res.data?.data || []
}

// todayTasks = hasil API
const todayTasks = computed(() => tasks.value || [])

// tugas pertama yang belum diambil (untuk tombol kuning)
const firstPendingTask = computed(() => {
  return (tasks.value || []).find((t) => t.status === 'Belum diambil') || null
})

const goToForm = (task) => {
  if (!task?.id) return
  router.push({
    name: 'FormPengambilanSampah',
    query: {
      laporan_id: task.id,
      date: filterDate.value,
    },
  })
}

const goToFirstPending = () => {
  if (!firstPendingTask.value) return
  goToForm(firstPendingTask.value)
}

onMounted(async () => {
  try {
    const ok = await loadPetugasId()
    if (!ok) return
    await fetchTasks()
  } catch (err) {
    console.error(err)
    $q.notify({ color: 'negative', message: 'Gagal memuat data petugas/tugas.' })
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

.map-placeholder {
  height: 200px;
  background-color: #e6ee9c;
  position: relative;
  border-radius: 16px 16px 0 0;
  overflow: hidden;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><text x="10%" y="80%" font-size="14" font-family="Arial" fill="#555">Cimahi</text><text x="70%" y="30%" font-size="14" font-family="Arial" fill="#555">Bandung</text></svg>');
  background-repeat: no-repeat;
  background-position: center;
}

.map-pin {
  position: absolute;
  top: 50%;
  left: 45%;
  transform: translate(-50%, -50%);
}

.btn-ambil {
  background: #ffc107;
  border-radius: 12px;
  height: 50px;
}
</style>
