<template>
  <q-page class="q-pa-md bg-green-1">
    <!-- HEADER -->
    <div class="q-mb-lg">
      <div class="text-h6 text-weight-bold text-primary q-mb-sm">Dashboard Keuangan</div>
      <div class="text-caption text-grey-7">
        Monitor pemasukan, pengeluaran, dan saldo berdasarkan rentang tanggal
      </div>
    </div>

    <!-- RANGE SELECTOR -->
    <q-card flat class="q-pa-md q-mb-md shadow-1">
      <div class="text-subtitle2 text-grey-8 q-mb-sm">Pilih Rentang Tanggal</div>
      <div class="row items-center q-col-gutter-md">
        <div class="col-md-5 col-12">
          <q-input
            filled
            dense
            v-model="range.start"
            label="Dari Tanggal"
            type="date"
            stack-label
          />
        </div>
        <div class="col-md-5 col-12">
          <q-input
            filled
            dense
            v-model="range.end"
            label="Sampai Tanggal"
            type="date"
            stack-label
          />
        </div>
        <div class="col-md-2 col-12 text-center">
          <q-btn
            color="primary"
            label="Terapkan"
            @click="applyDateRange"
            :disable="!isDateRangeValid"
            unelevated
          />
        </div>
      </div>
    </q-card>

    <!-- OVERVIEW CARDS -->
    <div class="row q-col-gutter-md q-mb-lg">
      <!-- SALDO KARTU UTAMA -->
      <div class="col-12">
        <q-card class="balance-card bg-gradient-primary text-white">
          <div class="row items-center">
            <div class="col-8">
              <q-card-section>
                <div class="text-subtitle2 text-weight-medium opacity-80">Saldo Keseluruhan</div>
                <div class="text-h4 text-weight-bold q-mt-sm">
                  Rp {{ formatCurrency(totalKeseluruhan.saldo) }}
                </div>
                <div class="text-caption q-mt-xs opacity-80">
                  Periode: {{ formatDateDisplay(range.start) }} - {{ formatDateDisplay(range.end) }}
                </div>
              </q-card-section>
            </div>
            <div class="col-4 text-right">
              <q-icon name="account_balance_wallet" size="80px" class="opacity-20" />
            </div>
          </div>
        </q-card>
      </div>

      <!-- INCOME & EXPENSE CARDS -->
      <div class="col-md-6 col-12">
        <q-card class="stat-card bg-white">
          <q-card-section>
            <div class="row items-center">
              <div class="col-3">
                <q-avatar color="green-1" text-color="green-8" size="lg">
                  <q-icon name="trending_up" />
                </q-avatar>
              </div>
              <div class="col-9">
                <div class="text-subtitle2 text-grey-7">Total Pemasukan</div>
                <div class="text-h6 text-weight-bold text-green-8">
                  Rp {{ formatCurrency(totalKeseluruhan.income) }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-md-6 col-12">
        <q-card class="stat-card bg-white">
          <q-card-section>
            <div class="row items-center">
              <div class="col-3">
                <q-avatar color="red-1" text-color="red-8" size="lg">
                  <q-icon name="trending_down" />
                </q-avatar>
              </div>
              <div class="col-9">
                <div class="text-subtitle2 text-grey-7">Total Pengeluaran</div>
                <div class="text-h6 text-weight-bold text-red-8">
                  Rp {{ formatCurrency(totalKeseluruhan.expense) }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- CHART SECTION -->
    <q-card class="q-mb-lg">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold text-primary">Trend Keuangan</div>
        <div class="text-caption text-grey-7 q-mb-md">
          Perkembangan saldo dalam periode terpilih
        </div>

        <div class="chart-container">
          <div class="chart-wrapper" @mouseleave="hideTooltip">
            <svg :width="chartWidth" :height="chartHeight" viewBox="0 0 100 60" class="chart-svg">
              <!-- Grid lines -->
              <line
                x1="0"
                y1="15"
                x2="100"
                y2="15"
                stroke="#e0e0e0"
                stroke-width="0.5"
                stroke-dasharray="2"
              />
              <line
                x1="0"
                y1="30"
                x2="100"
                y2="30"
                stroke="#e0e0e0"
                stroke-width="0.5"
                stroke-dasharray="2"
              />
              <line
                x1="0"
                y1="45"
                x2="100"
                y2="45"
                stroke="#e0e0e0"
                stroke-width="0.5"
                stroke-dasharray="2"
              />

              <!-- Area fill -->
              <polygon :points="areaPoints" fill="rgba(0, 104, 55, 0.15)" />

              <!-- Line -->
              <polyline
                :points="chartPoints"
                fill="none"
                stroke="#006837"
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
                fill="#006837"
                stroke="white"
                stroke-width="1"
                class="data-point"
                @mouseenter="showTooltipAt(idx)"
              />

              <!-- Date labels -->
              <g v-for="(p, idx) in pointList" :key="'label-' + idx">
                <text :x="p.x" y="58" font-size="4" text-anchor="middle" fill="#666">
                  {{ formatChartDate(p.date) }}
                </text>
              </g>
            </svg>

            <!-- Tooltip -->
            <div
              v-if="tooltipVisible"
              class="chart-tooltip"
              :style="{
                left: tooltipPosition.x + 'px',
                top: tooltipPosition.y + 'px',
              }"
            >
              <div class="tooltip-date">{{ formatTooltipDate(tooltipData.date) }}</div>
              <div class="tooltip-amount text-weight-bold">
                Rp {{ formatCurrency(tooltipData.value) }}
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- DAILY DETAIL SECTION -->
    <div class="row items-center justify-between q-mb-md">
      <div class="col-8">
        <div class="text-subtitle1 text-weight-bold text-primary">Detail Transaksi Harian</div>
        <div class="text-caption text-grey-7">Transaksi pada tanggal terpilih</div>
      </div>
      <div class="col-4 text-right">
        <q-btn
          flat
          color="primary"
          icon="event"
          @click="showDatePicker = true"
          label="Pilih Tanggal"
          size="sm"
        />
      </div>
    </div>

    <!-- DATE PICKER -->
    <q-dialog v-model="showDatePicker">
      <q-card style="width: 300px">
        <q-card-section>
          <div class="text-h6">Pilih Tanggal</div>
        </q-card-section>
        <q-date v-model="selectedDateModel" mask="DD MMM YYYY" minimal />
        <q-card-actions align="right">
          <q-btn flat label="Tutup" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DAILY SUMMARY -->
    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-12 col-md-4">
        <q-card flat class="daily-card bg-blue-1">
          <q-card-section class="text-center">
            <q-icon name="today" color="blue-8" size="sm" class="q-mb-xs" />
            <div class="text-subtitle2 text-blue-8">{{ formattedDate }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-md-4">
        <q-card flat class="daily-card bg-green-1">
          <q-card-section class="text-center">
            <div class="text-h6 text-weight-bold text-green-8">
              Rp {{ formatCurrency(dailySummary.income) }}
            </div>
            <div class="text-caption text-grey-7">Pemasukan</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-md-4">
        <q-card flat class="daily-card bg-red-1">
          <q-card-section class="text-center">
            <div class="text-h6 text-weight-bold text-red-8">
              Rp {{ formatCurrency(dailySummary.expense) }}
            </div>
            <div class="text-caption text-grey-7">Pengeluaran</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- TRANSACTION LIST -->
    <q-card class="transaction-list-card">
      <q-card-section>
        <div class="text-weight-bold text-grey-9 q-mb-md">
          Daftar Transaksi ({{ filteredTransactions.length }})
        </div>

        <div v-if="loading" class="text-center q-py-lg">
          <q-spinner color="primary" size="2em" />
          <div class="text-grey-7 q-mt-sm">Memuat transaksi...</div>
        </div>

        <div v-else-if="filteredTransactions.length === 0" class="text-center q-py-xl">
          <q-icon name="receipt" size="50px" color="grey-4" />
          <div class="text-h6 text-grey-5 q-mt-md">Tidak ada transaksi</div>
          <div class="text-caption text-grey-6">
            Tidak ada transaksi tercatat pada tanggal {{ formattedDate }}
          </div>
        </div>

        <q-list separator v-else>
          <q-item
            v-for="item in filteredTransactions"
            :key="item.id"
            class="transaction-item q-py-md"
            clickable
            v-ripple
          >
            <q-item-section avatar>
              <q-avatar
                :icon="item.type === 'Pemasukan' ? 'arrow_downward' : 'arrow_upward'"
                :color="item.type === 'Pemasukan' ? 'green-1' : 'red-1'"
                :text-color="item.type === 'Pemasukan' ? 'green-8' : 'red-8'"
                size="md"
              />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-medium text-dark">{{ item.desc }}</q-item-label>
              <q-item-label caption class="text-grey-7">
                <q-icon name="person" size="12px" class="q-mr-xs" />
                {{ item.source }}
                <span v-if="item.time" class="q-ml-sm">
                  <q-icon name="schedule" size="12px" class="q-mr-xs" />
                  {{ item.time }}
                </span>
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="text-right">
                <div
                  :class="item.type === 'Pemasukan' ? 'text-green-8' : 'text-red-8'"
                  class="text-weight-bold"
                >
                  {{ item.type === 'Pemasukan' ? '+' : '-' }} Rp {{ formatCurrency(item.amount) }}
                </div>
                <q-chip
                  :color="getStatusColor(item.status)"
                  text-color="white"
                  dense
                  size="xs"
                  class="q-mt-xs"
                >
                  {{ item.status }}
                </q-chip>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { date } from 'quasar'
import axios from 'axios'

// Reactive state
const loading = ref(false)
const selectedDateModel = ref(date.formatDate(Date.now(), 'DD MMM YYYY'))
const showDatePicker = ref(false)
const pemasukanList = ref([])
const pengeluaranList = ref([])

// Date range
const range = ref({
  start: date.formatDate(Date.now() - 6 * 24 * 60 * 60 * 1000, 'YYYY-MM-DD'),
  end: date.formatDate(Date.now(), 'YYYY-MM-DD'),
})

// Chart settings
const chartWidth = ref(300)
const chartHeight = ref(180)

// Tooltip
const tooltipVisible = ref(false)
const tooltipData = ref({ value: 0, date: '' })
const tooltipPosition = ref({ x: 0, y: 0 })

// Format helpers
const formatCurrency = (value) => {
  return Number(value).toLocaleString('id-ID')
}

const formatDateDisplay = (dateStr) => {
  return date.formatDate(dateStr, 'DD MMM YYYY')
}

const formatChartDate = (dateStr) => {
  return date.formatDate(dateStr, 'DD/MM')
}

const formatTooltipDate = (dateStr) => {
  return date.formatDate(dateStr, 'DD MMM YYYY')
}

// Date range validation
const isDateRangeValid = computed(() => {
  if (!range.value.start || !range.value.end) return false
  return range.value.start <= range.value.end
})

// Apply date range
const applyDateRange = () => {
  if (isDateRangeValid.value) {
    // Force recomputation by triggering a watch
    fetchData()
  }
}

// Fetch data
const fetchData = async () => {
  loading.value = true
  try {
    await Promise.all([fetchPemasukan(), fetchPengeluaran()])
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
}

const fetchPemasukan = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/pemasukan')
    pemasukanList.value = res.data.data.map((x) => ({
      id: x.id,
      date: x.tanggal,
      type: 'Pemasukan',
      amount: Number(x.jumlah_pembayaran) || 0,
      desc: `Pembayaran dari ${x.nama_warga || 'Warga'}`,
      source: x.nama_warga || 'Warga',
      status: Number(x.kekurangan) > 0 ? 'Belum Lunas' : 'Lunas',
      time: x.tanggal ? date.formatDate(x.tanggal, 'HH:mm') : '',
    }))
  } catch (error) {
    console.error('Error fetching pemasukan:', error)
  }
}

const fetchPengeluaran = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/pengeluaran')
    pengeluaranList.value = res.data.data.map((x) => ({
      id: x.id,
      date: x.tanggal,
      type: 'Pengeluaran',
      amount: Number(x.jumlah_pengeluaran) || 0,
      desc: `${x.jenis_pengeluaran || 'Pengeluaran'}: ${x.nama_pengeluaran || ''}`,
      source: 'Admin',
      status: 'Selesai',
      time: x.tanggal ? date.formatDate(x.tanggal, 'HH:mm') : '',
    }))
  } catch (error) {
    console.error('Error fetching pengeluaran:', error)
  }
}

// Computed properties
const formattedDate = computed(() => selectedDateModel.value)

const filteredTransactions = computed(() => {
  const selected = date.formatDate(selectedDateModel.value, 'YYYY-MM-DD')

  const allTransactions = [...pemasukanList.value, ...pengeluaranList.value]

  return allTransactions
    .filter((item) => {
      if (!item.date) return false
      const itemDate = date.formatDate(item.date, 'YYYY-MM-DD')
      return itemDate === selected
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
})

const totalKeseluruhan = computed(() => {
  const income = pemasukanList.value
    .filter((item) => {
      if (!range.value.start || !range.value.end) return true
      const itemDate = date.formatDate(item.date, 'YYYY-MM-DD')
      return itemDate >= range.value.start && itemDate <= range.value.end
    })
    .reduce((sum, item) => sum + item.amount, 0)

  const expense = pengeluaranList.value
    .filter((item) => {
      if (!range.value.start || !range.value.end) return true
      const itemDate = date.formatDate(item.date, 'YYYY-MM-DD')
      return itemDate >= range.value.start && itemDate <= range.value.end
    })
    .reduce((sum, item) => sum + item.amount, 0)

  return {
    income,
    expense,
    saldo: income - expense,
  }
})

const dailySummary = computed(() => {
  const selected = date.formatDate(selectedDateModel.value, 'YYYY-MM-DD')

  const income = pemasukanList.value
    .filter((item) => {
      if (!item.date) return false
      const itemDate = date.formatDate(item.date, 'YYYY-MM-DD')
      return itemDate === selected
    })
    .reduce((sum, item) => sum + item.amount, 0)

  const expense = pengeluaranList.value
    .filter((item) => {
      if (!item.date) return false
      const itemDate = date.formatDate(item.date, 'YYYY-MM-DD')
      return itemDate === selected
    })
    .reduce((sum, item) => sum + item.amount, 0)

  return {
    income,
    expense,
    saldo: income - expense,
  }
})

const weeklyTrend = computed(() => {
  const list = []

  if (!range.value.start || !range.value.end) return list

  const startDate = new Date(range.value.start)
  const endDate = new Date(range.value.end)

  let currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const dateStr = date.formatDate(currentDate, 'YYYY-MM-DD')

    const income = pemasukanList.value
      .filter((item) => {
        if (!item.date) return false
        const itemDate = date.formatDate(item.date, 'YYYY-MM-DD')
        return itemDate === dateStr
      })
      .reduce((sum, item) => sum + item.amount, 0)

    const expense = pengeluaranList.value
      .filter((item) => {
        if (!item.date) return false
        const itemDate = date.formatDate(item.date, 'YYYY-MM-DD')
        return itemDate === dateStr
      })
      .reduce((sum, item) => sum + item.amount, 0)

    list.push({
      date: dateStr,
      value: income - expense,
      income,
      expense,
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return list
})

const pointList = computed(() => {
  if (weeklyTrend.value.length === 0) return []

  const values = weeklyTrend.value.map((x) => x.value)
  const maxValue = Math.max(...values)
  const minValue = Math.min(...values)
  const rangeValue = maxValue - minValue || 1

  const padding = 0.1 * rangeValue
  const adjustedMax = maxValue + padding
  const adjustedMin = minValue - padding

  return weeklyTrend.value.map((item, idx) => {
    const x = weeklyTrend.value.length === 1 ? 50 : (idx / (weeklyTrend.value.length - 1)) * 100
    const y = 50 - ((item.value - adjustedMin) / (adjustedMax - adjustedMin || 1)) * 45

    return {
      x,
      y,
      value: item.value,
      date: item.date,
    }
  })
})

const chartPoints = computed(() => pointList.value.map((p) => `${p.x},${p.y}`).join(' '))

const areaPoints = computed(() => {
  if (pointList.value.length === 0) return ''
  const start = `0,50`
  const points = pointList.value.map((p) => `${p.x},${p.y}`).join(' ')
  const end = `100,50`
  return `${start} ${points} ${end}`
})

// Tooltip functions
const showTooltipAt = (idx) => {
  const p = pointList.value[idx]
  tooltipData.value = {
    value: p.value,
    date: p.date,
  }

  tooltipPosition.value = {
    x: (p.x / 100) * chartWidth.value,
    y: (p.y / 60) * chartHeight.value - 40,
  }

  tooltipVisible.value = true
}

const hideTooltip = () => {
  tooltipVisible.value = false
}

// Status helper
const getStatusColor = (status) => {
  switch (status) {
    case 'Lunas':
      return 'green'
    case 'Selesai':
      return 'green'
    case 'Belum Lunas':
      return 'red'
    case 'Pending':
      return 'orange'
    default:
      return 'grey'
  }
}

// Watchers
watch([range], () => {
  if (isDateRangeValid.value) {
    // Data akan direcompute otomatis
  }
})

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

/* Card styles */
.balance-card {
  background: linear-gradient(135deg, #006837 0%, #008749 100%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 104, 55, 0.25);
}

.stat-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.daily-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.transaction-list-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* Chart styles */
.chart-container {
  position: relative;
  width: 100%;
  height: 200px;
}

.chart-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
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
  fill: #004d2c;
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
  min-width: 140px;
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

.tooltip-amount {
  font-size: 14px;
}

/* Transaction item styles */
.transaction-item {
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.2s ease;
}

.transaction-item:hover {
  background-color: #f5f9f7;
  transform: translateX(2px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .text-h4 {
    font-size: 1.75rem;
  }

  .chart-container {
    height: 160px;
  }
}

.opacity-80 {
  opacity: 0.8;
}

.opacity-20 {
  opacity: 0.2;
}

.shadow-1 {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08) !important;
}
</style>
