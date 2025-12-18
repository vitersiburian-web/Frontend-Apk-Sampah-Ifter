<template>
  <q-page class="q-pa-md bg-green-1">
    <div class="q-mb-md text-h6 text-weight-bold text-primary">Form Pengambilan Sampah</div>

    <q-card flat class="rounded-borders q-mb-xl q-pa-md card-form">
      <div class="row justify-end items-center q-mb-md">
        <q-btn
          icon="event"
          :label="selectedDateLabel"
          flat
          dense
          color="primary"
          class="text-weight-medium"
        />
      </div>

      <q-input outlined v-model="form.name" label="Nama:" class="q-mb-md input-field" readonly />
      <q-input
        outlined
        v-model="form.address"
        label="Alamat:"
        class="q-mb-md input-field"
        readonly
      />
      <q-input
        outlined
        v-model="form.bags"
        label="Jumlah Karung"
        type="number"
        class="q-mb-md input-field"
        min="1"
      />

      <div class="q-mb-lg input-field">
        <q-input outlined v-model="formattedTotalHarga" label="Total Harga" readonly prefix="Rp." />
      </div>

      <div class="text-subtitle1 text-weight-bold text-grey-8 q-mb-sm">Pilih Metode Pembayaran</div>
      <q-option-group
        v-model="form.paymentMethod"
        :options="paymentOptions"
        color="primary"
        type="radio"
        class="q-mb-xl payment-group"
      />

      <q-btn
        label="Konfirmasi"
        :loading="loading"
        :disable="loading"
        color="yellow-8"
        text-color="black"
        unelevated
        class="full-width text-weight-bold btn-konfirmasi"
        size="lg"
        @click="handleKonfirmasi"
      />
    </q-card>

    <q-dialog v-model="showQrisModal">
      <QrisModal
        :amount="formattedTotalHarga"
        @success="finalizeTransaction"
        @close="showQrisModal = false"
      />
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar, date } from 'quasar'
import { api } from 'src/services/api'
import QrisModal from 'components/QrisModal.vue'

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
const route = useRoute()

const showQrisModal = ref(false)
const loading = ref(false)

// laporan_id harus dikirim dari dashboard (query param)
const laporanId = Number(route.query.laporan_id)

// token login (wajib)
const token = localStorage.getItem('token')

// tanggal harus dikirim dari dashboard; fallback hari ini kalau tidak ada
const selectedDate = ref(route.query.date || date.formatDate(new Date(), 'YYYY-MM-DD'))

// label untuk tombol tanggal
const selectedDateLabel = computed(() => date.formatDate(selectedDate.value, 'DD MMM YYYY'))

// petugasId FIX dari DB (bukan hardcode)
const petugasId = ref(null)

// data form
const form = ref({
  name: '',
  address: '',
  bags: 1,
  paymentMethod: 'cash',
})

const pricePerBag = 5000

const computedTotalHarga = computed(() => {
  const bags = Number(form.value.bags || 0)
  return bags * pricePerBag
})

const formattedTotalHarga = computed(() => computedTotalHarga.value.toLocaleString('id-ID'))

const paymentOptions = [
  { label: 'Cash', value: 'cash' },
  { label: 'Qris', value: 'qris' },
]

// =========================
// Ambil petugasId dari token -> /api/petugas/by-user/<user_id>
// =========================
const loadPetugasId = async () => {
  if (!token) {
    $q.notify({ color: 'negative', message: 'Token tidak ditemukan. Silakan login ulang.' })
    router.push({ name: 'LoginPage' })
    throw new Error('TOKEN_MISSING')
  }

  const payload = parseJwt(token)
  if (!payload || !payload.user_id) {
    $q.notify({ color: 'negative', message: 'Token tidak valid. Silakan login ulang.' })
    router.push({ name: 'LoginPage' })
    throw new Error('TOKEN_INVALID')
  }

  const res = await api.get(`/api/petugas/by-user/${payload.user_id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res?.data?.success || !res?.data?.data?.id) {
    throw new Error('PETUGAS_NOT_FOUND')
  }

  petugasId.value = res.data.data.id
}

// =========================
// Ambil detail tugas dari /api/petugas/tugas
// sesuai backend: params date & petugas_id
// =========================
const loadTask = async () => {
  if (!petugasId.value) throw new Error('PETUGAS_ID_EMPTY')

  const res = await api.get('/api/petugas/tugas', {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      date: selectedDate.value,
      petugas_id: petugasId.value,
    },
  })

  const list = res?.data?.data || []
  const task = list.find((t) => Number(t.id) === Number(laporanId))

  if (!task) {
    $q.notify({
      color: 'negative',
      message: 'Tugas tidak ditemukan. Pastikan laporan_id & tanggal sesuai.',
    })
    router.push({ name: 'PetugasDashboard' })
    throw new Error('TASK_NOT_FOUND')
  }

  form.value.name = task.name || ''
  form.value.address = task.address || ''
}

// =========================
// Submit konfirmasi (ambil) -> /api/petugas/tugas/<id>/ambil
// sesuai backend: body petugas_id & jumlah_karung
// =========================
const finalizeTransaction = async () => {
  if (!petugasId.value) {
    $q.notify({ color: 'negative', message: 'Petugas belum terbaca. Silakan coba lagi.' })
    return
  }

  const bags = Number(form.value.bags)
  if (!bags || bags <= 0) {
    $q.notify({ color: 'negative', message: 'Jumlah karung harus lebih dari 0' })
    return
  }

  loading.value = true
  try {
    await api.post(
      `/api/petugas/tugas/${laporanId}/ambil`,
      {
        petugas_id: petugasId.value,
        jumlah_karung: bags,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )

    showQrisModal.value = false
    $q.notify({
      color: 'positive',
      message: `Pengambilan sampah dari ${form.value.name} berhasil dikonfirmasi.`,
    })

    router.push({ name: 'PetugasDashboard' })
  } catch (err) {
    console.error(err)
    $q.notify({ color: 'negative', message: 'Gagal konfirmasi pengambilan.' })
  } finally {
    loading.value = false
  }
}

const handleKonfirmasi = () => {
  const bags = Number(form.value.bags)
  if (!bags || bags <= 0) {
    $q.notify({ color: 'negative', message: 'Jumlah karung harus lebih dari 0' })
    return
  }

  if (form.value.paymentMethod === 'qris') {
    showQrisModal.value = true
  } else {
    finalizeTransaction()
  }
}

// =========================
// Init
// =========================
onMounted(async () => {
  if (!laporanId) {
    $q.notify({
      color: 'negative',
      message: 'laporan_id tidak ditemukan. Pilih tugas dari dashboard.',
    })
    router.push({ name: 'PetugasDashboard' })
    return
  }

  try {
    await loadPetugasId()
    await loadTask()
  } catch (err) {
    console.error(err)
    // notifikasi spesifik sudah ditangani di fungsi masing-masing
  }
})
</script>

<style scoped>
.q-page {
  background-color: #f1f8e9 !important;
}
.text-primary {
  color: #006837 !important;
}

.card-form {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.btn-konfirmasi {
  background: #ffc107;
  border-radius: 12px;
  height: 50px;
}

.input-field :deep(.q-field__control) {
  background-color: white;
  border-radius: 12px;
}

.payment-group {
  background-color: white;
  padding: 16px;
  border-radius: 12px;
}
</style>
