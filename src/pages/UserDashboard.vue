<template>
  <q-page padding>
    
    <h4 class="text-h4 text-dark-green q-my-md q-ml-sm">Halo, Bapak ....</h4>

    <!-- Card Pengajuan User (Muncul setelah submit) -->
    <q-card 
      v-if="hasPengajuan"
      flat 
      class="bg-white schedule-card q-mb-lg"
      bordered
    >
      <q-card-section class="q-pa-md">
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-h6 text-weight-bold text-dark-green">
            Laporan Pengajuan Anda
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
        <q-badge color="orange" text-color="white" class="q-my-sm">
          Menunggu Konfirmasi
        </q-badge>
        <div class="text-body1 text-dark-green q-mt-sm">
          <strong>Jadwal:</strong> {{ formatJadwal(jadwalDiajukan) }}
        </div>
        <div class="text-body1 text-dark-green q-mt-xs">
          <strong>Jenis Sampah:</strong> {{ jenisSampahDiajukan }}
        </div>
        <div class="text-caption text-grey-7 q-mt-sm">
          <q-icon name="info" size="16px" class="q-mr-xs" />
          Petugas akan segera menghubungi Anda
        </div>
      </q-card-section>
    </q-card>

    <!-- Card Jadwal Pengambilan Sampah -->
    <q-card flat class="bg-white schedule-card" bordered>
      <q-card-section 
        horizontal 
        class="illustration-section q-pa-md items-center justify-center q-gutter-xl"
      >
        <q-icon name="event" color="blue-8" size="60px" />
        
        <!-- Icon Truck Sampah dengan Animasi -->
        <div class="truck-container">
          <svg width="100" height="80" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="25" width="45" height="30" fill="#08602E" rx="3"/>
            <rect x="12" y="27" width="41" height="26" fill="#0a7838" rx="2"/>
            <path d="M55 35 L55 55 L75 55 L75 40 L65 35 Z" fill="#08602E"/>
            <path d="M57 37 L57 53 L73 53 L73 42 L65 37 Z" fill="#0a7838"/>
            <rect x="59" y="39" width="8" height="8" fill="#87CEEB" rx="1"/>
            <circle cx="25" cy="58" r="7" fill="#333"/>
            <circle cx="25" cy="58" r="4" fill="#666"/>
            <circle cx="65" cy="58" r="7" fill="#333"/>
            <circle cx="65" cy="58" r="4" fill="#666"/>
            <line x1="20" y1="35" x2="20" y2="45" stroke="#FFD155" stroke-width="2"/>
            <line x1="30" y1="35" x2="30" y2="45" stroke="#FFD155" stroke-width="2"/>
            <line x1="40" y1="35" x2="40" y2="45" stroke="#FFD155" stroke-width="2"/>
          </svg>
        </div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="text-h6 text-weight-bold text-dark-green">
          Jadwal Pengambilan Sampah
        </div>
        <div class="text-body1 text-dark-green q-mt-sm">
          Kamis, 31 Oktober 2025
        </div>
        <div class="text-body2 text-weight-medium text-dark-green q-mt-xs">
          09.00 - 10.00 WIB
        </div>
        <div class="text-body2 text-weight-bold text-dark-green q-mt-sm">
          Akan dijemput besok pagi
        </div>
      </q-card-section>
    </q-card>

    <q-btn
      label="+ Ajukan Pengambilan"
      size="lg"
      class="full-width q-mt-lg action-button"
      rounded
      no-caps
      @click="dialog = true"
    />

    <!-- Popup Konfirmasi Pemilahan Sampah -->
    <q-dialog v-model="dialog" persistent>
      <q-card class="dialog-card">
        <q-icon name="inventory_2" size="56px" class="icon" />
        <h4>Apakah Sampah Sudah Dipilah?</h4>
        <p>Pastikan sampah sudah dipilah sesuai dengan jenisnya sebelum diserahkan kepada petugas, untuk memudahkan pengolahan lanjut.</p>
        <div class="actions">
          <q-btn label="Belum" flat no-caps class="btn-secondary" @click="dialog = false" />
          <q-btn label="Sudah" flat no-caps class="btn-primary" @click="confirmAction" />
        </div>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { jadwalPengajuan, jenisSampahPengajuan, statusPengajuan, clearPengajuan } from 'src/stores/laporanStore'

const router = useRouter()
const dialog = ref(false)

// Data dari store
const jadwalDiajukan = jadwalPengajuan
const jenisSampahDiajukan = jenisSampahPengajuan
const hasPengajuan = statusPengajuan

const formatJadwal = (dateString) => {
  if (!dateString) return '-'
  try {
    const [datePart, timePart] = dateString.split(' ')
    const [year, month, day] = datePart.split('-')
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const date = new Date(year, month - 1, day)
    const dayName = dayNames[date.getDay()]
    return `${dayName}, ${day} ${monthNames[month - 1]} ${year}${timePart ? ' • ' + timePart + ' WIB' : ''}`
  } catch {
    return dateString
  }
}

const clearPengajuanData = () => {
  clearPengajuan()
}

const confirmAction = () => {
  dialog.value = false
  router.push({ name: 'UserLaporan' })
}
</script>

<style lang="scss" scoped>
$dark-green: #08602E;
$dark-green-hover: #06481f;
$yellow-accent: #FFD155;

.text-dark-green {
  color: $dark-green;
}

.schedule-card {
  border-radius: 20px;
  overflow: hidden;
  border-color: #E0E0E0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.illustration-section {
  background: linear-gradient(135deg, #E0F5EE 0%, #C8E6D9 100%);
  position: relative;
}

.truck-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: truckMove 3s ease-in-out infinite;
}

@keyframes truckMove {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(10px); }
}

.action-button {
  background-color: $yellow-accent !important;
  color: $dark-green !important;
  font-weight: 700;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(8, 96, 46, 0.3);
  }
}

/* --- Style untuk dialog popup --- */
.dialog-card {
  min-width: 320px;
  max-width: 380px;
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
}

.icon {
  color: #757575;
  margin-bottom: 16px;
}

.dialog-card h4 {
  font-size: 20px;
  font-weight: 700;
  color: #006837;
  margin: 0 0 12px 0;
}

.dialog-card p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 24px 0;
}

.actions {
  display: flex;
  gap: 12px;
}

.btn-secondary {
  flex: 1;
  color: #FFC107;
  font-weight: 600;
  font-size: 15px;
}

.btn-primary {
  flex: 1;
  color: #006837;
  font-weight: 600;
  font-size: 15px;
}
</style>
