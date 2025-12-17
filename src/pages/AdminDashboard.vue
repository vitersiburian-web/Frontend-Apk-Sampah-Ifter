<template>
  <q-page class="q-pa-md bg-green-1">
    <!-- HEADER -->
    <div class="q-mb-lg">
      <div class="text-h6 text-weight-bold text-primary">Dashboard Admin</div>
      <div class="text-caption text-grey-7">Ringkasan keuangan dan aktivitas terbaru</div>
    </div>

    <!-- STAT CARDS -->
    <div class="row q-col-gutter-sm q-mb-lg">
      <div class="col-6 col-md-3">
        <q-card class="stat-card">
          <q-card-section class="text-center">
            <q-icon name="attach_money" color="green-8" size="md" class="q-mb-sm" />
            <div class="text-h6 text-weight-bold text-dark">
              Rp {{ formatCurrency(totalHariIni) }}
            </div>
            <div class="text-caption text-grey-7">Pendapatan Hari Ini</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-6 col-md-3">
        <q-card class="stat-card">
          <q-card-section class="text-center">
            <q-icon name="local_shipping" color="blue-8" size="md" class="q-mb-sm" />
            <div class="text-h6 text-weight-bold text-dark">
              {{ pengambilanHariIni }}
            </div>
            <div class="text-caption text-grey-7">Pengambilan Hari Ini</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-6 col-md-3">
        <q-card class="stat-card">
          <q-card-section class="text-center">
            <q-icon name="support_agent" color="orange-8" size="md" class="q-mb-sm" />
            <div class="text-h6 text-weight-bold text-dark">
              {{ petugasCount }}
            </div>
            <div class="text-caption text-grey-7">Petugas Aktif</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-6 col-md-3">
        <q-card class="stat-card">
          <q-card-section class="text-center">
            <q-icon name="group" color="red-8" size="md" class="q-mb-sm" />
            <div class="text-h6 text-weight-bold text-dark">
              {{ userCount }}
            </div>
            <div class="text-caption text-grey-7">User Terdaftar</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- CHARTS SECTION -->
    <div class="row q-col-gutter-md q-mb-lg">
      <!-- Grafik Keuangan -->
      <div class="col-12 col-md-6">
        <q-card class="chart-card">
          <q-card-section class="q-pb-sm">
            <div class="text-subtitle1 text-weight-bold text-primary">
              Tren Saldo (7 Hari Terakhir)
            </div>
            <div class="text-caption text-grey-7">Perkembangan saldo mingguan</div>
          </q-card-section>

          <q-separator />

          <q-card-section class="chart-container">
            <div class="chart-wrapper" @mouseleave="hideTooltip">
              <svg viewBox="0 0 100 50" class="chart-svg">
                <!-- Area background -->
                <polygon :points="areaPoints" fill="rgba(33, 186, 69, 0.15)" />

                <!-- Chart line -->
                <polyline
                  :points="chartPoints"
                  fill="none"
                  stroke="#21ba45"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />

                <!-- Data points -->
                <circle
                  v-for="(p, idx) in pointList"
                  :key="idx"
                  :cx="p.x"
                  :cy="p.y"
                  r="2.5"
                  fill="#21ba45"
                  stroke="white"
                  stroke-width="1"
                  class="data-point"
                  @mouseenter="showTooltipAt(idx)"
                />
              </svg>

              <!-- Tooltip -->
              <div
                v-if="tooltipVisible"
                class="chart-tooltip"
                :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
              >
                <div class="tooltip-date">{{ tooltipDate }}</div>
                <div class="tooltip-value text-weight-bold">
                  Rp {{ formatCurrency(tooltipValue) }}
                </div>
              </div>
            </div>

            <div class="text-caption text-grey-6 q-mt-md text-center">
              Update terakhir: {{ formatDateDisplay(today) }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Grafik Jumlah Karung -->
      <div class="col-12 col-md-6">
        <q-card class="chart-card">
          <q-card-section class="q-pb-sm">
            <div class="text-subtitle1 text-weight-bold text-primary">
              Volume Karung (7 Hari Terakhir)
            </div>
            <div class="text-caption text-grey-7">Jumlah karung per hari</div>
          </q-card-section>

          <q-separator />

          <q-card-section class="chart-container">
            <div class="bar-chart-wrapper">
              <div class="chart-bar-3d">
                <div
                  v-for="(item, idx) in weeklyKarungData"
                  :key="idx"
                  class="bar-container"
                  @mouseenter="showKarungTooltip(idx)"
                  @mouseleave="hideKarungTooltip"
                >
                  <div class="bar-wrapper">
                    <div
                      class="bar"
                      :style="{
                        height: (item.value / maxKarung) * 100 + '%',
                        backgroundColor: item.value > 0 ? '#21ba45' : '#e0e0e0',
                      }"
                    >
                      <span v-if="item.value > 0" class="bar-value">
                        {{ item.value }}
                      </span>
                    </div>
                  </div>
                  <div class="bar-label">{{ item.date }}</div>
                </div>
              </div>

              <!-- Karung Tooltip -->
              <div
                v-if="tooltipKarungVisible"
                class="chart-tooltip"
                :style="{ left: tooltipKarungX + 'px', top: tooltipKarungY + 'px' }"
              >
                <div class="tooltip-date">{{ tooltipKarungDate }}</div>
                <div class="tooltip-value text-weight-bold">{{ tooltipKarungValue }} karung</div>
              </div>
            </div>

            <div class="text-caption text-grey-6 q-mt-md text-center">
              Total karung 7 hari: {{ totalKarungMingguan }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- WEEKLY SUMMARY -->
    <q-card class="q-mb-lg">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold text-primary q-mb-sm">Ringkasan Mingguan</div>
        <div class="row items-center">
          <div class="col-md-8 col-12">
            <div class="text-caption text-grey-7">Periode: {{ weeklyDateRange }}</div>
          </div>
          <div class="col-md-4 col-12 text-right">
            <q-badge color="green" class="q-px-sm q-py-xs">
              Saldo: Rp {{ formatCurrency(weeklySaldo) }}
            </q-badge>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="row">
          <div class="col-6 text-center">
            <div class="text-h5 text-weight-bold text-green-8">
              Rp {{ formatCurrency(weeklyPemasukan) }}
            </div>
            <div class="text-caption text-grey-7">Total Pemasukan</div>
          </div>
          <div class="col-6 text-center">
            <div class="text-h5 text-weight-bold text-red-8">
              Rp {{ formatCurrency(weeklyPengeluaran) }}
            </div>
            <div class="text-caption text-grey-7">Total Pengeluaran</div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { date } from 'quasar'

// Reactive state
const today = new Date()
const petugasCount = ref(0)
const userCount = ref(0)
const totalHariIni = ref(0)
const pengambilanHariIni = ref(0)
const pemasukanList = ref([])
const pengeluaranList = ref([])
const loading = ref(false)

// Tooltip state
const tooltipVisible = ref(false)
const tooltipX = ref(0)
const tooltipY = ref(0)
const tooltipValue = ref(0)
const tooltipDate = ref('')

const tooltipKarungVisible = ref(false)
const tooltipKarungX = ref(0)
const tooltipKarungY = ref(0)
const tooltipKarungValue = ref(0)
const tooltipKarungDate = ref('')

// Format helpers
const formatCurrency = (value) => {
  return Number(value).toLocaleString('id-ID')
}

const formatDateDisplay = (dateObj) => {
  return date.formatDate(dateObj, 'DD MMM YYYY')
}

// Fetch data
const fetchData = async () => {
  loading.value = true
  try {
    const [petugasRes, userRes, pemasukanRes, pengeluaranRes] = await Promise.all([
      axios.get('http://localhost:5000/api/petugas'),
      axios.get('http://localhost:5000/api/warga'),
      axios.get('http://localhost:5000/api/pemasukan'),
      axios.get('http://localhost:5000/api/pengeluaran'),
    ])

    // Process petugas data
    petugasCount.value = petugasRes.data.data?.filter((p) => p.status === 'Aktif').length || 0

    // Process user data
    userCount.value = userRes.data.data?.length || 0

    // Process pemasukan data
    pemasukanList.value =
      pemasukanRes.data.data?.map((x) => ({
        amount: Number(x.jumlah_pembayaran) || 0,
        karung: Number(x.jumlah_karung) || 0,
        date: x.tanggal,
        nama_warga: x.nama_warga || '',
      })) || []

    // Process pengeluaran data
    pengeluaranList.value =
      pengeluaranRes.data.data?.map((x) => ({
        amount: Number(x.jumlah_pengeluaran) || 0,
        date: x.tanggal,
        nama_pengeluaran: x.nama_pengeluaran || '',
      })) || []

    // Calculate today's data
    const todayFormatted = date.formatDate(today, 'YYYY-MM-DD')
    const pemasukanHariIni = pemasukanList.value.filter(
      (x) => x.date && x.date.slice(0, 10) === todayFormatted,
    )

    totalHariIni.value = pemasukanHariIni.reduce((sum, x) => sum + x.amount, 0)
    pengambilanHariIni.value = pemasukanHariIni.length
  } catch (error) {
    console.error('Dashboard fetch error:', error)
  } finally {
    loading.value = false
  }
}

// Weekly data computations
const weeklyData = computed(() => {
  const list = []
  for (let d = 0; d < 7; d++) {
    const currentDate = new Date()
    currentDate.setDate(today.getDate() - (6 - d))
    const formattedDate = date.formatDate(currentDate, 'YYYY-MM-DD')

    const income = pemasukanList.value
      .filter((i) => i.date && i.date.slice(0, 10) === formattedDate)
      .reduce((sum, i) => sum + i.amount, 0)

    const expense = pengeluaranList.value
      .filter((i) => i.date && i.date.slice(0, 10) === formattedDate)
      .reduce((sum, i) => sum + i.amount, 0)

    list.push({
      date: date.formatDate(currentDate, 'ddd'),
      dateFull: date.formatDate(currentDate, 'DD MMM'),
      value: income - expense,
      income,
      expense,
    })
  }
  return list
})

const weeklyKarungData = computed(() => {
  const list = []
  for (let d = 0; d < 7; d++) {
    const currentDate = new Date()
    currentDate.setDate(today.getDate() - (6 - d))
    const formattedDate = date.formatDate(currentDate, 'YYYY-MM-DD')

    const totalKarung = pemasukanList.value
      .filter((i) => i.date && i.date.slice(0, 10) === formattedDate)
      .reduce((sum, i) => sum + i.karung, 0)

    list.push({
      date: date.formatDate(currentDate, 'ddd'),
      dateFull: date.formatDate(currentDate, 'DD MMM'),
      value: totalKarung,
    })
  }
  return list
})

// Weekly summary computations
const weeklyPemasukan = computed(() => {
  return weeklyData.value.reduce((sum, item) => sum + item.income, 0)
})

const weeklyPengeluaran = computed(() => {
  return weeklyData.value.reduce((sum, item) => sum + item.expense, 0)
})

const weeklySaldo = computed(() => {
  return weeklyPemasukan.value - weeklyPengeluaran.value
})

const totalKarungMingguan = computed(() => {
  return weeklyKarungData.value.reduce((sum, item) => sum + item.value, 0)
})

const weeklyDateRange = computed(() => {
  const startDate = new Date()
  startDate.setDate(today.getDate() - 6)

  return `${date.formatDate(startDate, 'DD MMM')} - ${date.formatDate(today, 'DD MMM YYYY')}`
})

// Chart computations
const maxKarung = computed(() => {
  const values = weeklyKarungData.value.map((item) => item.value)
  const max = Math.max(...values)
  return max > 0 ? max : 1 // Prevent division by zero
})

const pointList = computed(() => {
  if (!weeklyData.value.length) return []

  const values = weeklyData.value.map((x) => x.value)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1

  return weeklyData.value.map((item, idx) => {
    const x = weeklyData.value.length === 1 ? 50 : (idx / (weeklyData.value.length - 1)) * 100
    const y = 50 - ((item.value - min) / range) * 45

    return {
      x,
      y,
      value: item.value,
      date: item.date,
      dateFull: item.dateFull,
    }
  })
})

const chartPoints = computed(() => pointList.value.map((p) => `${p.x},${p.y}`).join(' '))

const areaPoints = computed(() => {
  if (pointList.value.length === 0) return ''
  const start = '0,50'
  const end = '100,50'
  return `${start} ${chartPoints.value} ${end}`
})

// Tooltip functions
const showTooltipAt = (idx) => {
  const p = pointList.value[idx]
  tooltipValue.value = p.value
  tooltipDate.value = p.dateFull
  tooltipX.value = (p.x / 100) * 250
  tooltipY.value = (p.y / 50) * 120 - 40
  tooltipVisible.value = true
}

const hideTooltip = () => {
  tooltipVisible.value = false
}

const showKarungTooltip = (idx) => {
  const p = weeklyKarungData.value[idx]
  tooltipKarungValue.value = p.value
  tooltipKarungDate.value = p.dateFull

  const barContainer = document.querySelectorAll('.bar-container')[idx]
  if (barContainer) {
    const rect = barContainer.getBoundingClientRect()
    const containerRect = barContainer.parentElement.getBoundingClientRect()

    tooltipKarungX.value = rect.left + rect.width / 2 - containerRect.left
    tooltipKarungY.value = -20
  }

  tooltipKarungVisible.value = true
}

const hideKarungTooltip = () => {
  tooltipKarungVisible.value = false
}

// Lifecycle
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* Base styles */
.q-page {
  background-color: #f8faf9 !important;
}

.text-primary {
  color: #006837 !important;
}

/* Stat cards */
.stat-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
  padding: 12px;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

/* Chart cards */
.chart-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  height: 100%;
}

.chart-container {
  min-height: 220px;
  position: relative;
}

.chart-wrapper {
  width: 100%;
  height: 150px;
  position: relative;
}

.chart-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.data-point {
  cursor: pointer;
  transition: all 0.2s ease;
}

.data-point:hover {
  r: 4;
  fill: #198c3c;
}

.chart-tooltip {
  position: absolute;
  background: rgba(0, 104, 55, 0.95);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  pointer-events: none;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translate(-50%, -100%);
  white-space: nowrap;
  min-width: 120px;
  text-align: center;
}

.chart-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: rgba(0, 104, 55, 0.95);
}

.tooltip-date {
  font-size: 11px;
  opacity: 0.9;
  margin-bottom: 2px;
}

.tooltip-value {
  font-size: 14px;
}

/* Bar chart styles */
.bar-chart-wrapper {
  width: 100%;
  height: 150px;
  position: relative;
}

.chart-bar-3d {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  padding-bottom: 25px;
}

.bar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  flex: 1;
  position: relative;
  cursor: pointer;
}

.bar-wrapper {
  width: 100%;
  height: calc(100% - 25px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bar {
  width: 20px;
  min-height: 4px;
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: all 0.3s ease;
  background-color: #21ba45;
}

.bar:hover {
  background-color: #198c3c !important;
  transform: scale(1.05);
}

.bar-value {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
}

.bar-label {
  position: absolute;
  bottom: 0;
  font-size: 11px;
  color: #666;
  margin-top: 4px;
  text-align: center;
  width: 100%;
}

/* Weekly summary badge */
.q-badge {
  border-radius: 8px;
  font-weight: 600;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .stat-card {
    padding: 10px;
  }

  .chart-container {
    min-height: 200px;
  }

  .bar {
    width: 16px;
  }

  .bar-value {
    font-size: 10px;
  }
}
</style>
