<template>
  <q-page class="q-pa-md bg-green-1">
    
    
    
    <q-card flat class="chart-card q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold text-primary">Grafik Keuangan (Mingguan)</div>
      </q-card-section>
      <q-separator />
      <q-card-section class="chart-area bg-white text-center">
        <div class="chart-visual chart-line-glow" @mousemove="updateTooltip($event)" @mouseleave="hideTooltip">
            <svg viewBox="0 0 100 50" class="chart-svg">
                <polyline 
                    class="chart-line-glow-primary" 
                    fill="none" 
                    stroke="#21ba45" 
                    stroke-width="3" 
                    points="0,40 25,10 50,35 75,20 100,5"
                />
                <polygon fill="rgba(33, 186, 69, 0.2)" points="0,50 0,40 25,10 50,35 75,20 100,5 100,50" />
            </svg>
            
            <q-tooltip 
                v-model="tooltipVisible"
                :style="{ transform: `translateX(${tooltipX}px)`, top: `${tooltipY}px` }"
                class="bg-dark text-white q-pa-sm rounded-borders tooltip-custom"
                anchor="top middle"
                self="bottom middle"
                offset="[10, 10]"
            >
                <div>Tgl: {{ tooltipDate }}</div>
                <div class="text-weight-bold">Rp {{ tooltipValue }}</div>
            </q-tooltip>
        </div>
        <div class="text-caption text-grey-6 q-mt-sm">Peningkatan 12% Minggu Ini | Rp 2.5 Juta</div>
      </q-card-section>
    </q-card>

    <q-card flat class="chart-card q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold text-primary">Grafik Volume Sampah (Kg)</div>
      </q-card-section>
      <q-separator />
      <q-card-section class="chart-area bg-white text-center">
        <div class="chart-visual chart-bar-3d">
            <div 
                v-for="(height, index) in barHeights" 
                :key="index"
                class="bar"
                :style="{ height: `${height}%`, background: barColors[index] }"
            >
                <span>{{ height }}%</span>
            </div>
        </div>
        
        <div class="q-px-lg q-mt-lg full-width">
            <q-slider
                v-model="dataModifier"
                :min="0"
                :max="100"
                :step="5"
                label
                color="blue-7"
                label-text-color="white"
                track-size="8px"
                thumb-size="16px"
            />
            <div class="text-caption text-grey-6 q-mt-sm">Geser untuk melihat perubahan volume</div>
        </div>
      </q-card-section>
    </q-card>

    <div class="row q-col-gutter-sm q-mt-lg">
      <div class="col-6">
        <q-card class="stat-card bg-white stat-income">
          <q-icon name="attach_money" color="green-8" size="sm" />
          <div class="text-h6 text-weight-bold text-dark q-mt-xs">Rp. 250.000</div>
          <div class="text-caption text-grey-7">Total pendapatan hari ini</div>
        </q-card>
      </div>
      <div class="col-6">
        <q-card class="stat-card bg-white stat-shipment">
          <q-icon name="local_shipping" color="blue-8" size="sm" />
          <div class="text-h6 text-weight-bold text-dark q-mt-xs">24</div>
          <div class="text-caption text-grey-7">Pengambilan hari ini</div>
        </q-card>
      </div>
      <div class="col-6">
        <q-card class="stat-card bg-white stat-petugas">
          <q-icon name="support_agent" color="orange-8" size="sm" />
          <div class="text-h6 text-weight-bold text-dark q-mt-xs">{{ petugasCount }}</div>
          <div class="text-caption text-grey-7">Petugas aktif</div>
        </q-card>
      </div>
      <div class="col-6">
        <q-card class="stat-card bg-white stat-user">
          <q-icon name="group" color="red-8" size="sm" />
          <div class="text-h6 text-weight-bold text-dark q-mt-xs">{{ userCount }}</div>
          <div class="text-caption text-grey-7">User terdaftar</div>
        </q-card>
      </div>
    </div>

  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import { petugasList, userList } from 'stores/adminStore';

// --- Logika Statistik Statis ---
const petugasCount = computed(() => {
    return petugasList.value.filter(p => p.status === 'Aktif').length;
});
const userCount = computed(() => {
    return userList.value.length;
});

// --- Logika Interaktivitas Grafik Volume Sampah ---
const dataModifier = ref(50); // Nilai slider (0-100)
const baseData = [70, 40, 85, 60, 95];
const barColors = [
    'linear-gradient(to top, #4CAF50, #66BB6A)', // Hijau
    'linear-gradient(to top, #FFC107, #FFD54F)', // Kuning
    'linear-gradient(to top, #2196f3, #4dace7)', // Biru
    'linear-gradient(to top, #F44336, #E57373)', // Merah
    'linear-gradient(to top, #006837, #1B5E20)' // Hijau Tua
];

const barHeights = computed(() => {
    return baseData.map(val => Math.min(100, Math.max(10, val * (dataModifier.value / 50))));
});

// --- Logika Interaktivitas Grafik Keuangan (Hover Simulasi) ---
const tooltipVisible = ref(false);
const tooltipX = ref(0);
const tooltipY = ref(0);
const tooltipValue = ref('0');
const tooltipDate = ref('');

const dataPoints = [
    { date: 'Sen', value: 150000 },
    { date: 'Sel', value: 400000 },
    { date: 'Rab', value: 250000 },
    { date: 'Kam', value: 350000 },
    { date: 'Jum', value: 480000 }
];

const updateTooltip = (event) => {
    const chart = event.currentTarget.querySelector('.chart-svg');
    if (!chart) return;

    const rect = chart.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const chartWidth = rect.width;
    
    const segmentWidth = chartWidth / dataPoints.length;
    const nearestIndex = Math.floor(x / segmentWidth);
    const dataIndex = Math.min(dataPoints.length - 1, nearestIndex);
    
    const data = dataPoints[dataIndex];
    
    tooltipX.value = x;
    tooltipY.value = event.offsetY - 20; 
    tooltipValue.value = data.value.toLocaleString('id-ID');
    tooltipDate.value = data.date;
    tooltipVisible.value = true;
};

const hideTooltip = () => {
    tooltipVisible.value = false;
};
</script>

<style scoped>
.q-page {
  background-color: #f1f8e9 !important;
}
.text-primary {
  color: #006837 !important;
}
.chart-card {
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); 
}
.chart-area {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 15px;
  background: linear-gradient(145deg, #f0fdf4, #ffffff); 
  border-radius: 0 0 16px 16px;
  position: relative; 
}
.stat-card {
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

/* --- Visualisasi Grafik Garis GLOW (Hover Interaktif) --- */
.chart-visual {
    width: 100%; 
    height: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: crosshair; 
}
.chart-line-glow {
    width: 90%;
}
.chart-svg {
    width: 100%;
    height: 100%;
    overflow: visible;
}
.chart-line-glow-primary {
    filter: drop-shadow(0 0 5px rgba(33, 186, 69, 0.8));
    transition: all 0.2s ease-out; 
}
.tooltip-custom {
    padding: 8px 10px !important;
    border-radius: 8px !important;
    font-size: 11px;
    z-index: 1000;
    transition: opacity 0.1s;
    pointer-events: none; 
}

/* --- Visualisasi Grafik Batang 3D (Slider Interaktif) --- */
.chart-bar-3d {
    width: 100%;
    height: 100px;
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    padding: 0 10px 5px 10px;
    border-bottom: 2px solid #eee;
}
.chart-bar-3d .bar {
    width: 18px;
    position: relative;
    border-radius: 4px 4px 0 0;
    transition: height 0.5s cubic-bezier(0.25, 0.8, 0.5, 1); 
    display: flex;
    justify-content: center;
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.2); 
}
.chart-bar-3d .bar span {
    position: absolute;
    top: -18px;
    font-size: 10px;
    color: #333;
    font-weight: 600;
}
.bar-1 { background: linear-gradient(to top, #4CAF50, #66BB6A); }
.bar-2 { background: linear-gradient(to top, #FFC107, #FFD54F); }
.bar-3 { background: linear-gradient(to top, #2196f3, #4dace7); }
.bar-4 { background: linear-gradient(to top, #F44336, #E57373); }
.bar-5 { background: linear-gradient(to top, #006837, #1B5E20); }
</style>