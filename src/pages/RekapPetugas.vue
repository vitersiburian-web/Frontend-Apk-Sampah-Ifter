<template>
  <q-page class="q-pa-md bg-green-1">
    <div class="text-h6 text-weight-bold text-primary q-mb-md">Rekap Pengambilan Sampah</div>

    <q-card flat class="q-pa-sm q-mb-md date-card" @click="showDatePicker = true">
      <div class="row items-center justify-between cursor-pointer">
        <div class="text-subtitle1 text-grey-8">{{ formattedDate }}</div>
        <q-icon name="event" color="primary" size="sm" />
      </div>
    </q-card>

    <q-dialog v-model="showDatePicker">
      <q-date v-model="selectedDateModel" mask="DD MMM YYYY" />
    </q-dialog>

    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-4">
        <q-card flat class="summary-card bg-white text-center">
          <q-icon name="paid" color="blue-8" size="md" class="q-mb-xs" />
          <div class="text-subtitle2 text-weight-bold text-blue-8">Rp. {{ summaryRef.income }}</div>
          <div class="text-caption text-grey-7">Pemasukan hari ini</div>
        </q-card>
      </div>
      <div class="col-4">
        <q-card flat class="summary-card bg-white text-center">
          <q-icon name="error" color="red-8" size="md" class="q-mb-xs" />
          <div class="text-subtitle2 text-weight-bold text-red-8">{{ summaryRef.pending }}</div>
          <div class="text-caption text-grey-7">Total nunggak</div>
        </q-card>
      </div>
      <div class="col-4">
        <q-card flat class="summary-card bg-white text-center">
          <q-icon name="assignment" color="teal-8" size="md" class="q-mb-xs" />
          <div class="text-subtitle2 text-weight-bold text-teal-8">{{ summaryRef.totalTasks }}</div>
          <div class="text-caption text-grey-7">Pengambilan sampah</div>
        </q-card>
      </div>
    </div>

    <q-card flat class="q-pa-sm q-mb-lg detail-card">
      <q-list separator>
        <q-item-label header class="text-weight-bold text-grey-9">Detail Transaksi</q-item-label>

        <q-item class="bg-grey-2 text-weight-bold text-caption">
          <q-item-section>Nama</q-item-section>
          <q-item-section>Jumlah karung</q-item-section>
          <q-item-section>Pembayaran</q-item-section>
          <q-item-section side>Status</q-item-section>
        </q-item>

        <q-item v-for="task in filteredCompletedTasks" :key="task.id" class="q-py-sm">
          <q-item-section>{{ task.name }}</q-item-section>
          <q-item-section>{{ task.bags }}</q-item-section>
          <q-item-section>{{ task.payment }}</q-item-section>
          <q-item-section side>
            <q-badge
              :color="task.payment === 'Nunggak' ? 'red-5' : 'green-7'"
              :label="task.payment === 'Nunggak' ? 'Nunggak' : 'Lunas'"
            />
          </q-item-section>
        </q-item>

        <q-item v-if="filteredCompletedTasks.length === 0" class="text-center text-grey-5">
          <q-item-section>Tidak ada data rekap pada tanggal ini.</q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <q-btn
      label="Pengambilan Sampah"
      color="yellow-8"
      text-color="black"
      unelevated
      class="full-width text-weight-bold btn-form"
      size="lg"
      @click="goToForm"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { date } from 'quasar'
import { api } from 'src/services/api'
import { useRouter } from 'vue-router'

const router = useRouter()

// UI state untuk date picker
const showDatePicker = ref(false)

// Model date picker sesuai template kamu: mask "DD MMM YYYY"
const selectedDateModel = ref(date.formatDate(new Date(), 'DD MMM YYYY'))

// Tanggal untuk request ke backend harus format YYYY-MM-DD
const selectedDate = computed(() => {
  // convert "17 Dec 2025" -> "2025-12-17"
  return date.formatDate(selectedDateModel.value, 'YYYY-MM-DD')
})

// Label tanggal di card
const formattedDate = computed(() => selectedDateModel.value)

// sementara hardcode dulu
const petugasId = 1

// State data dari backend
const summary = ref({
  pemasukan_hari_ini: 0,
  total_tunggak_kasus: 0,
  pengambilan_sampah: 0,
  detail: [],
})

// Ambil data rekap dari backend
const fetchRekap = async () => {
  try {
    const res = await api.get('/api/petugas/rekap', {
      params: { date: selectedDate.value, petugas_id: petugasId },
    })
    summary.value = res.data.data
  } catch (err) {
    console.error('Gagal ambil rekap:', err)
    summary.value = {
      pemasukan_hari_ini: 0,
      total_tunggak_kasus: 0,
      pengambilan_sampah: 0,
      detail: [],
    }
  }
}

onMounted(fetchRekap)

// Kalau user ganti tanggal, otomatis fetch ulang
watch(selectedDateModel, () => {
  showDatePicker.value = false
  fetchRekap()
})

// Adapter agar template kamu tidak perlu banyak diubah
const summaryUI = computed(() => ({
  income: summary.value.pemasukan_hari_ini || 0,
  pending: summary.value.total_tunggak_kasus || 0,
  totalTasks: summary.value.pengambilan_sampah || 0,
}))

// Data tabel untuk template kamu (task.name, task.bags, task.payment)
const filteredCompletedTasks = computed(() => {
  return (summary.value.detail || []).map((d) => ({
    id: d.id_laporan,
    name: d.nama,
    bags: d.jumlah_karung,
    // kita pakai status untuk badge "Lunas/Nunggak" tapi template kamu cek task.payment
    // supaya tidak ubah template banyak, kita isi payment dengan "Nunggak" / "Lunas"
    payment: d.kekurangan > 0 ? 'Nunggak' : 'Lunas',
    metode: d.pembayaran,
  }))
})

const goToForm = () => {
  router.push({ name: 'FormPengambilanSampah' })
}

// IMPORTANT: supaya template kamu tetap pakai "summary.xxx"
const summaryRef = summaryUI
</script>

<style scoped>
.q-page {
  background-color: #f1f8e9 !important;
}
.text-primary {
  color: #006837 !important;
}

.date-card,
.summary-card,
.detail-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.summary-card {
  padding: 12px 6px;
}

.btn-form {
  background: #ffc107;
  border-radius: 12px;
}
</style>
