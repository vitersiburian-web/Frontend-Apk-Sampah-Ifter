<template>
  <q-page class="q-pa-md bg-green-1">
    <div class="text-caption text-grey-7 q-mb-md">
      Daftar lengkap riwayat transaksi dan aktivitas sistem.
    </div>

    <!-- Loading Indicator -->
    <div v-if="loading" class="text-center q-py-lg">
      <q-spinner color="primary" size="2em" />
      <div class="text-grey-7 q-mt-sm">Memuat data...</div>
    </div>

    <div v-else>
      <q-card flat class="q-pa-sm q-mb-md date-card" @click="showDatePicker = true">
        <div class="row items-center justify-between cursor-pointer">
          <div class="text-subtitle1 text-grey-8">{{ formattedDate }}</div>
          <q-icon name="event" color="primary" size="sm" />
        </div>
      </q-card>

      <q-dialog v-model="showDatePicker">
        <q-date v-model="selectedDateModel" mask="DD MMM YYYY" />
      </q-dialog>

      <!-- Filter Pemasukan/Pengeluaran -->
      <div class="q-mb-md">
        <q-btn-toggle
          v-model="filterType"
          toggle-color="green-8"
          color="white"
          text-color="primary"
          :options="filterOptions"
          unelevated
          spread
          class="rounded-toggle-filter"
        />
      </div>

      <q-card flat class="q-pa-sm q-mb-lg detail-card">
        <q-list separator>
          <q-item-label header class="text-weight-bold text-grey-9">
            Log {{ filterTypeLabel }} Harian ({{ filteredRiwayat.length }})
          </q-item-label>

          <q-item v-for="item in filteredRiwayat" :key="item.id" class="q-py-md riwayat-item">
            <q-item-section avatar>
              <q-avatar
                :icon="getIcon(item.type)"
                :color="getColor(item.type) + '-1'"
                :text-color="getColor(item.type) + '-8'"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">{{ item.desc }}</q-item-label>
              <q-item-label caption class="text-status">
                <q-chip
                  :color="item.type === 'Pemasukan' ? 'green-2' : 'red-2'"
                  text-color="black"
                  square
                  dense
                  size="xs"
                  class="q-mr-xs"
                >
                  {{ item.type }}
                </q-chip>
                <span v-if="item.amount > 0">
                  {{ item.type === 'Pemasukan' ? '+' : '-' }} Rp
                  {{ item.amount.toLocaleString('id-ID') }}
                </span>
                <span v-if="item.jumlah_karung && item.jumlah_karung > 0" class="q-ml-xs">
                  • {{ item.jumlah_karung }} karung
                </span>
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label caption class="text-right">{{ formatTime(item.date) }}</q-item-label>
              <q-chip
                :color="
                  item.status === 'Completed'
                    ? 'green'
                    : item.status === 'Pending'
                      ? 'orange'
                      : 'green'
                "
                text-color="white"
                square
                dense
                size="xs"
                class="q-mt-xs status-chip-side"
              >
                {{ item.status }}
              </q-chip>
            </q-item-section>
          </q-item>
        </q-list>

        <div v-if="filteredRiwayat.length === 0" class="text-center text-grey-5 q-py-lg">
          Tidak ada {{ filterType.toLowerCase() }} pada tanggal ini.
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { date } from 'quasar'
import axios from 'axios'

const selectedDateModel = ref(date.formatDate(Date.now(), 'DD MMM YYYY'))
const showDatePicker = ref(false)
const filterType = ref('Semua') // Default: Semua
const riwayatList = ref([])
const loading = ref(false)

// Filter options: Semua, Pemasukan, Pengeluaran
const filterOptions = [
  { label: 'Semua', value: 'Semua' },
  { label: 'Pemasukan', value: 'Pemasukan' },
  { label: 'Pengeluaran', value: 'Pengeluaran' },
]

// Label untuk header
const filterTypeLabel = computed(() => {
  if (filterType.value === 'Semua') return 'Transaksi'
  return filterType.value
})

// Fetch data dari API
const fetchRiwayat = async () => {
  loading.value = true
  try {
    // Coba endpoint riwayat_admin dulu
    const response = await axios.get('http://localhost:5000/api/riwayat_admin')
    if (response.data.success) {
      // Filter hanya Pemasukan dan Pengeluaran, hilangkan Aktivitas
      const filteredData = response.data.data.filter(
        (item) => item.type === 'Pemasukan' || item.type === 'Pengeluaran',
      )

      riwayatList.value = filteredData.map((item) => ({
        id: item.id,
        tanggal: new Date(item.tanggal),
        date: item.tanggal,
        type: item.type,
        desc: item.description,
        amount: item.amount || 0,
        status: item.status || 'Completed',
        jumlah_karung: item.jumlah_karung || 0,
      }))
    }
  } catch (error) {
    console.error('Error fetching riwayat_admin, trying fallback...', error)
    // Fallback ke multiple API calls
    await fetchMultipleAPIs()
  } finally {
    loading.value = false
  }
}

// Fallback function jika endpoint riwayat_admin belum ada
const fetchMultipleAPIs = async () => {
  try {
    const [pemasukanRes, pengeluaranRes] = await Promise.all([
      axios.get('http://localhost:5000/api/pemasukan'),
      axios.get('http://localhost:5000/api/pengeluaran'),
    ])

    const allData = []

    // Process pemasukan
    if (pemasukanRes.data.success) {
      pemasukanRes.data.data.forEach((item) => {
        allData.push({
          id: `pemasukan_${item.id}`,
          tanggal: new Date(item.tanggal),
          date: item.tanggal,
          type: 'Pemasukan',
          desc: `Pembayaran dari ${item.nama_warga || 'warga'} - ${item.jumlah_karung || 0} karung`,
          amount: item.jumlah_pembayaran || 0,
          status: 'Completed',
          jumlah_karung: item.jumlah_karung || 0,
        })
      })
    }

    // Process pengeluaran
    if (pengeluaranRes.data.success) {
      pengeluaranRes.data.data.forEach((item) => {
        allData.push({
          id: `pengeluaran_${item.id}`,
          tanggal: new Date(item.tanggal),
          date: item.tanggal,
          type: 'Pengeluaran',
          desc: `${item.jenis_pengeluaran || 'Pengeluaran'} - ${item.nama_pengeluaran || ''}`,
          amount: item.jumlah_pengeluaran || 0,
          status: 'Completed',
          jumlah_karung: 0,
        })
      })
    }

    // Sort by date (newest first)
    allData.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
    riwayatList.value = allData
  } catch (error) {
    console.error('Error fetching multiple APIs:', error)
  }
}

// Format tanggal untuk display
const formattedDate = computed(() => {
  return selectedDateModel.value
})

// Format time dari datetime string
const formatTime = (datetimeStr) => {
  if (!datetimeStr) return ''
  try {
    return date.formatDate(datetimeStr, 'HH:mm')
  } catch (error) {
    console.error('Error formatting time:', datetimeStr, error)
    return ''
  }
}

// Filter riwayat berdasarkan tanggal dan type
const filteredRiwayat = computed(() => {
  if (!riwayatList.value.length) return []

  const selectedDate = date.formatDate(selectedDateModel.value, 'YYYY-MM-DD')

  return riwayatList.value.filter((item) => {
    // Format tanggal item ke YYYY-MM-DD
    let itemDate = ''
    try {
      itemDate = date.formatDate(item.tanggal, 'YYYY-MM-DD')
    } catch (error) {
      console.error('Error formatting date:', item.tanggal, error)
      return false
    }

    const isDateMatch = itemDate === selectedDate

    // Filter berdasarkan type
    let isTypeMatch = true
    if (filterType.value === 'Pemasukan') {
      isTypeMatch = item.type === 'Pemasukan'
    } else if (filterType.value === 'Pengeluaran') {
      isTypeMatch = item.type === 'Pengeluaran'
    }
    // Jika 'Semua', tidak perlu filter type

    return isDateMatch && isTypeMatch
  })
})

// Untuk icon dan color
const getIcon = (type) => {
  if (type === 'Pemasukan') return 'arrow_downward' // atau 'attach_money'
  if (type === 'Pengeluaran') return 'arrow_upward' // atau 'payment'
  return 'circle'
}

const getColor = (type) => {
  if (type === 'Pemasukan') return 'green'
  if (type === 'Pengeluaran') return 'red'
  return 'grey'
}

// Fetch data saat komponen dimount
onMounted(() => {
  fetchRiwayat()
})
</script>

<style scoped>
/* Style RiwayatAdmin.vue */
.q-page {
  background-color: #f1f8e9 !important;
}
.text-primary {
  color: #006837 !important;
}
.date-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  background: white;
}
.rounded-toggle-filter {
  border-radius: 12px;
  border: 1px solid #006837;
}
.detail-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.riwayat-item {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.riwayat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.text-status {
  font-size: 11px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}
.status-chip-side {
  min-width: 50px;
}
</style>
