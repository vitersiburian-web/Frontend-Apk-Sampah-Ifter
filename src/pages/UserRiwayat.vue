<template>
  <q-page class="bg-grey-1">
    <div class="q-pa-md">
      <!-- Header -->
      <div class="q-mb-lg">
        <div class="text-h5 text-weight-bold text-dark-green">Riwayat Pengambilan Sampah</div>
        <div class="text-caption text-grey-7">Riwayat pengambilan sampah Anda</div>
      </div>

      <!-- Filter Section -->
      <q-card flat class="q-mb-lg filter-card">
        <q-card-section>
          <div class="row items-center q-col-gutter-md">
            <div class="col-md-6 col-12">
              <q-select
                v-model="bulanDipilih"
                :options="opsiBulan"
                label="Pilih Bulan"
                filled
                dense
                emit-value
                map-options
                clearable
                class="rounded-select"
                :loading="loadingBulan"
                @update:model-value="handleBulanChange"
              >
                <template v-slot:prepend>
                  <q-icon name="calendar_month" color="primary" />
                </template>

                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label class="text-weight-medium">
                        {{ scope.opt.label }}
                      </q-item-label>
                      <q-item-label caption> {{ scope.opt.count }} riwayat </q-item-label>
                    </q-item-section>

                    <q-item-section side v-if="scope.opt.isCurrent">
                      <q-badge color="primary" label="Bulan ini" />
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <div class="col-md-6 col-12">
              <q-input
                v-model="searchQuery"
                placeholder="Cari riwayat..."
                filled
                dense
                clearable
                class="rounded-select"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Loading State -->
      <div v-if="loading" class="text-center q-py-xl">
        <q-spinner color="primary" size="3em" />
        <div class="text-grey-7 q-mt-md">Memuat riwayat...</div>
      </div>

      <!-- Data Section -->
      <div v-else>
        <!-- Header Info -->
        <div class="row items-center justify-between q-mb-md">
          <div class="col">
            <div class="text-subtitle1 text-weight-bold">
              {{ tampilJudulBulan }}
              <q-badge v-if="filteredRiwayat.length > 0" color="green" class="q-ml-sm">
                {{ filteredRiwayat.length }} riwayat
              </q-badge>
            </div>
            <div class="text-caption text-grey-7">Total karung: {{ totalKarung }} karung</div>
          </div>

          <div class="col-auto">
            <q-btn
              flat
              round
              icon="refresh"
              color="primary"
              @click="loadRiwayat"
              :loading="loading"
            />
          </div>
        </div>

        <!-- Riwayat List -->
        <div v-if="filteredRiwayat.length > 0">
          <q-card
            v-for="item in filteredRiwayat"
            :key="item.id"
            class="riwayat-card q-mb-sm"
            flat
            bordered
          >
            <q-card-section class="q-pa-md">
              <div class="row items-center">
                <!-- Status Icon -->
                <div class="col-auto">
                  <q-avatar
                    :color="getStatusColor(item.status)"
                    text-color="white"
                    size="md"
                    class="shadow-1"
                  >
                    <q-icon :name="getStatusIcon(item.status)" />
                  </q-avatar>
                </div>

                <!-- Content -->
                <div class="col q-ml-md">
                  <div class="row items-center">
                    <div class="col">
                      <div class="text-weight-bold text-dark">
                        {{
                          item.status === 'selesai' ? 'Pengambilan Selesai' : 'Menunggu Pengambilan'
                        }}
                      </div>
                      <div class="text-caption text-grey-7 q-mt-xs">
                        <q-icon name="schedule" size="12px" class="q-mr-xs" />
                        {{ formatWaktu(item.tanggal) }}
                      </div>
                    </div>

                    <div class="col-auto">
                      <q-badge :color="getStatusColor(item.status)" class="status-badge">
                        {{ item.status }}
                      </q-badge>
                    </div>
                  </div>

                  <!-- Details -->
                  <div class="row q-mt-sm">
                    <div class="col-12 col-md-8">
                      <div class="text-caption text-grey-8">
                        <q-icon name="person" size="12px" class="q-mr-xs" />
                        Petugas: {{ item.nama_petugas || 'Belum ditugaskan' }}
                      </div>
                      <div class="text-caption text-grey-8 q-mt-xs" v-if="item.catatan">
                        <q-icon name="notes" size="12px" class="q-mr-xs" />
                        Catatan: {{ item.catatan }}
                      </div>
                    </div>

                    <div class="col-12 col-md-4 text-right">
                      <div class="text-h6 text-weight-bold text-primary">
                        {{ item.jumlah_karung }} karung
                      </div>
                      <div class="text-caption text-grey-7">
                        {{ formatTanggal(item.tanggal) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center q-py-xl">
          <q-icon name="history" size="80px" color="grey-4" />
          <div class="text-h6 text-grey-5 q-mt-md">
            {{ searchQuery ? 'Tidak ditemukan riwayat' : 'Tidak ada riwayat' }}
          </div>
          <div class="text-caption text-grey-6 q-mt-sm">
            {{
              searchQuery
                ? `Tidak ada riwayat dengan kata kunci "${searchQuery}"`
                : bulanDipilih
                  ? `Tidak ada riwayat pengambilan pada bulan ini`
                  : 'Belum ada riwayat pengambilan sampah'
            }}
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'

const $q = useQuasar()

// State
const bulanDipilih = ref('')
const searchQuery = ref('')
const semuaRiwayat = ref([])
const opsiBulan = ref([])
const loading = ref(false)
const loadingBulan = ref(false)

// Format helpers
const formatWaktu = (datetimeStr) => {
  if (!datetimeStr) return ''
  try {
    const date = new Date(datetimeStr)
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

const formatTanggal = (datetimeStr) => {
  if (!datetimeStr) return ''
  try {
    const date = new Date(datetimeStr)
    const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const bulan = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ]
    return `${hari[date.getDay()]}, ${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`
  } catch {
    return ''
  }
}

// Status helpers
const getStatusColor = (status) => {
  const statusMap = {
    selesai: 'green',
    proses: 'blue',
    pending: 'orange',
    ditolak: 'red',
  }
  return statusMap[status] || 'grey'
}

const getStatusIcon = (status) => {
  const iconMap = {
    selesai: 'check_circle',
    proses: 'pending',
    pending: 'schedule',
    ditolak: 'cancel',
  }
  return iconMap[status] || 'help'
}

// Load daftar bulan tersedia
const loadDaftarBulan = async () => {
  loadingBulan.value = true
  try {
    const userId = localStorage.getItem('user_id')
    if (!userId) {
      $q.notify({
        type: 'warning',
        message: 'Silakan login terlebih dahulu',
        position: 'top',
      })
      loadingBulan.value = false
      return
    }

    // 1. Dapatkan data warga
    const wargaRes = await axios.get(`http://localhost:5000/api/warga/by-user/${userId}`)
    if (!wargaRes.data.success) {
      throw new Error('Gagal mendapatkan data warga')
    }

    const idWarga = wargaRes.data.data.id

    // 2. Coba endpoint bulan-tersedia dengan error handling
    let bulanData = []
    try {
      const res = await axios.get('http://localhost:5000/api/riwayat/bulan-tersedia', {
        params: { id_warga: idWarga },
        timeout: 5000, // Timeout 5 detik
      })

      if (res.data.success) {
        bulanData = res.data.data
      } else {
        console.warn('API returned success: false', res.data)
      }
    } catch (apiError) {
      console.warn('Error fetching bulan-tersedia, using fallback:', apiError)
      // Gunakan fallback data
      bulanData = generateFallbackBulanData()
    }

    // 3. Format data untuk dropdown
    const namaBulan = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ]

    const bulanSekarang = new Date()
    const tahunSekarang = bulanSekarang.getFullYear()
    const bulanSekarangStr = String(bulanSekarang.getMonth() + 1).padStart(2, '0')
    const bulanSekarangValue = `${tahunSekarang}-${bulanSekarangStr}`

    if (bulanData.length === 0) {
      // Jika tidak ada data, buat opsi untuk bulan ini saja
      opsiBulan.value = [
        {
          label: `${namaBulan[bulanSekarang.getMonth()]} ${tahunSekarang}`,
          value: bulanSekarangValue,
          count: 0,
          isCurrent: true,
        },
      ]
    } else {
      opsiBulan.value = bulanData.map((item) => {
        const [tahun, bulan] = item.bulan_tahun
          ? item.bulan_tahun.split('-')
          : [tahunSekarang, bulanSekarangStr]
        const namaBulanFull = namaBulan[parseInt(bulan) - 1] || 'Bulan'

        return {
          label: `${namaBulanFull} ${tahun}`,
          value: item.bulan_tahun || bulanSekarangValue,
          count: item.count || 0,
          isCurrent: (item.bulan_tahun || '') === bulanSekarangValue,
        }
      })
    }

    // 4. Set default value
    if (opsiBulan.value.length > 0) {
      const bulanIni = opsiBulan.value.find((b) => b.isCurrent)
      bulanDipilih.value = bulanIni ? bulanIni.value : opsiBulan.value[0].value
    }
  } catch (error) {
    console.error('Error loading bulan:', error)

    // Fallback: buat opsi bulan default
    const currentDate = new Date()
    const namaBulan = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktob er',
      'November',
      'Desember',
    ]

    opsiBulan.value = [
      {
        label: `${namaBulan[currentDate.getMonth()]} ${currentDate.getFullYear()}`,
        value: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`,
        count: 0,
        isCurrent: true,
      },
    ]

    bulanDipilih.value = opsiBulan.value[0].value

    $q.notify({
      type: 'warning',
      message: 'Menggunakan data bulan default',
      position: 'top',
    })
  } finally {
    loadingBulan.value = false
  }
}

// Helper function untuk fallback data
const generateFallbackBulanData = () => {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const bulanList = []

  // Generate 3 bulan terakhir
  for (let i = 2; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - i, 1)
    if (date.getFullYear() > 0) {
      // Valid date
      bulanList.push({
        bulan_tahun: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        tahun: date.getFullYear(),
        bulan: String(date.getMonth() + 1).padStart(2, '0'),
        count: 0,
      })
    }
  }

  return bulanList
}

// Load riwayat data
const loadRiwayat = async () => {
  loading.value = true
  try {
    const userId = localStorage.getItem('user_id')
    if (!userId) {
      $q.notify({
        type: 'warning',
        message: 'Silakan login terlebih dahulu',
        position: 'top',
      })
      loading.value = false
      return
    }

    // Get warga data
    const wargaRes = await axios.get(`http://localhost:5000/api/warga/by-user/${userId}`)
    if (!wargaRes.data.success) throw new Error('Gagal mendapatkan data warga')

    const idWarga = wargaRes.data.data.id

    // Prepare params
    const params = { id_warga: idWarga }
    if (bulanDipilih.value) {
      params.bulan = bulanDipilih.value
    }

    // Fetch riwayat
    const res = await axios.get('http://localhost:5000/api/riwayat', { params })

    if (res.data.success) {
      semuaRiwayat.value = res.data.data
    }
  } catch (error) {
    console.error('Error loading riwayat:', error)
    $q.notify({
      type: 'negative',
      message: 'Gagal memuat riwayat',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

// Handle bulan change
const handleBulanChange = () => {
  loadRiwayat()
}

// Computed properties
const filteredRiwayat = computed(() => {
  let filtered = semuaRiwayat.value

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((item) => {
      return (
        (item.nama_petugas || '').toLowerCase().includes(query) ||
        (item.status || '').toLowerCase().includes(query) ||
        (item.catatan || '').toLowerCase().includes(query) ||
        String(item.jumlah_karung || '').includes(query)
      )
    })
  }

  return filtered
})

const totalKarung = computed(() => {
  return filteredRiwayat.value.reduce((total, item) => {
    return total + (parseInt(item.jumlah_karung) || 0)
  }, 0)
})

const tampilJudulBulan = computed(() => {
  if (!bulanDipilih.value) return 'Semua Riwayat'

  const [tahun, bulan] = bulanDipilih.value.split('-')
  const namaBulan = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ]
  return `${namaBulan[parseInt(bulan) - 1]} ${tahun}`
})

// Lifecycle
onMounted(async () => {
  await loadDaftarBulan()
  if (bulanDipilih.value) {
    await loadRiwayat()
  }
})
</script>

<style scoped>
.bg-grey-1 {
  background-color: #f8f9fa;
}

.text-dark-green {
  color: #006837;
}

.filter-card {
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.rounded-select :deep(.q-field__control) {
  border-radius: 12px;
}

.riwayat-card {
  border-radius: 12px;
  border-left: 4px solid #4caf50;
  transition: all 0.2s ease;
}

.riwayat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.status-badge {
  border-radius: 10px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 500;
}
</style>
