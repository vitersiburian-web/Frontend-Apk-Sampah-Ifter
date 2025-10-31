<template>
  <q-page padding>
    
    <h4 class="text-h4 text-dark-green q-my-md q-ml-sm">Laporan</h4>
    <h5 class="text-h5 text-dark-green q-my-sm q-ml-sm">Halo, Bapak ....</h5>

    <q-form @submit.prevent="onSubmit" class="q-gutter-md q-mt-lg">
      
      <div>
        <label class="text-dark-green q-ml-sm text-body1 text-weight-medium">Jadwal Pengambilan Sampah</label>
        <q-input
          v-model="jadwal"
          outlined
          placeholder="Pilih Tanggal dan Waktu"
          class="q-mt-xs form-input"
          dense
          readonly
          :rules="[val => !!val || 'Jadwal tidak boleh kosong']"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer icon-green">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="jadwal" mask="YYYY-MM-DD HH:mm">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Tutup" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
            <q-icon name="access_time" class="cursor-pointer icon-green">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-time v-model="jadwal" mask="YYYY-MM-DD HH:mm" format24h>
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Tutup" color="primary" flat />
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <div>
        <label class="text-dark-green q-ml-sm text-body1 text-weight-medium">Jenis Sampah</label>
        <q-select
          v-model="jenisSampah"
          outlined
          :options="jenisSampahOptions"
          placeholder="Pilih Jenis Sampah"
          class="q-mt-xs form-input"
          dense
          :rules="[val => !!val || 'Jenis sampah tidak boleh kosong']"
        />
      </div>

      <q-btn
        label="+ Ajukan Pengambilan"
        type="submit"
        size="lg"
        class="full-width q-mt-lg action-button"
        rounded
        no-caps
      />

    </q-form>

    <!-- Dialog Konfirmasi -->
    <q-dialog v-model="confirmDialog" persistent>
      <q-card class="confirm-card">
        <q-card-section class="text-center q-pt-lg">
          <q-icon name="help_outline" size="64px" class="icon-green" />
          <div class="text-h6 text-weight-bold text-dark-green q-mt-md">
            Ajukan Pengambilan Sampah?
          </div>
          <div class="text-body2 text-grey-7 q-mt-sm q-px-md">
            Pastikan data yang Anda masukkan sudah benar
          </div>
          
          <!-- Preview Data -->
          <q-card flat bordered class="preview-box q-mt-md q-mx-md">
            <q-card-section class="q-pa-md text-left">
              <div class="q-mb-sm">
                <div class="text-caption text-grey-7">Jadwal</div>
                <div class="text-body2 text-weight-bold text-dark-green">
                  {{ formatJadwal(jadwal) }}
                </div>
              </div>
              <q-separator class="q-my-sm" />
              <div>
                <div class="text-caption text-grey-7">Jenis Sampah</div>
                <div class="text-body2 text-weight-bold text-dark-green">
                  {{ jenisSampah }}
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-card-section>

        <q-card-actions class="q-px-md q-pb-lg q-pt-none q-gutter-sm">
          <q-btn
            label="Batal"
            flat
            class="full-width"
            color="grey-7"
            rounded
            no-caps
            v-close-popup
          />
          <q-btn
            label="Ya, Ajukan"
            class="full-width confirm-btn"
            rounded
            no-caps
            @click="submitPengajuan"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Success -->
    <q-dialog v-model="successDialog" persistent>
      <q-card class="success-card">
        <q-card-section class="text-center q-pt-xl q-pb-lg">
          <div class="success-icon-wrapper q-mb-md">
            <q-icon name="check_circle" size="80px" color="positive" class="success-icon" />
          </div>
          <div class="text-h5 text-weight-bold text-dark-green q-mb-sm">
            Pengajuan Berhasil!
          </div>
          <div class="text-body1 text-grey-7 q-px-md">
            Pengajuan pengambilan sampah Anda telah diterima
          </div>
          
          <q-card flat bordered class="info-box q-mt-lg q-mx-md">
            <q-card-section class="q-pa-md">
              <div class="row items-center q-gutter-sm q-mb-sm">
                <q-icon name="schedule" class="icon-green" size="20px" />
                <span class="text-caption text-grey-7">Detail Pengajuan</span>
              </div>
              <div class="text-body2 text-dark-green q-mb-xs">
                <strong>Jadwal:</strong> {{ formatJadwal(jadwal) }}
              </div>
              <div class="text-body2 text-dark-green">
                <strong>Jenis:</strong> {{ jenisSampah }}
              </div>
              <q-separator class="q-my-sm" />
              <div class="text-body2 text-weight-bold text-orange q-mt-sm">
                Status: Menunggu Konfirmasi
              </div>
            </q-card-section>
          </q-card>

          <div class="text-caption text-grey-6 q-mt-md q-px-lg">
            Petugas akan segera mengkonfirmasi jadwal pengambilan sampah Anda
          </div>
        </q-card-section>

        <q-card-actions class="q-px-lg q-pb-lg">
          <q-btn
            label="Kembali ke Dashboard"
            class="full-width success-btn"
            size="lg"
            rounded
            no-caps
            @click="closeSuccessDialog"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
// Import store kita
import { setPengajuan } from 'src/stores/laporanStore'

const $q = useQuasar()
const router = useRouter()
const jadwal = ref('')
const jenisSampah = ref('')

// Options untuk jenis sampah
const jenisSampahOptions = [
  'Organik',
  'Anorganik',
  'B3 (Bahan Berbahaya dan Beracun)',
  'Kertas',
  'Plastik',
  'Logam',
  'Kaca',
  'Elektronik'
]

// Dialog states
const confirmDialog = ref(false)
const successDialog = ref(false)

// Format jadwal untuk ditampilkan
const formatJadwal = (dateString) => {
  if (!dateString) return '-'
  
  try {
    const [datePart, timePart] = dateString.split(' ')
    const [year, month, day] = datePart.split('-')
    
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const date = new Date(year, month - 1, day)
    const dayName = dayNames[date.getDay()]
    
    return `${dayName}, ${day} ${monthNames[month - 1]} ${year}${timePart ? ' • ' + timePart + ' WIB' : ''}`
  } catch {
    return dateString
  }
}

const onSubmit = () => {
  // Validasi form
  if (!jadwal.value || !jenisSampah.value) {
    $q.notify({
      type: 'negative',
      message: 'Mohon lengkapi semua data',
      position: 'top',
      timeout: 2000
    })
    return
  }
  
  confirmDialog.value = true
}

const submitPengajuan = () => {
  confirmDialog.value = false
  
  // Simulasi loading
  $q.loading.show({
    message: 'Mengirim pengajuan...',
    spinnerColor: 'primary'
  })
  
  setTimeout(() => {
    // 1. Simpan data ke store
    setPengajuan(jadwal.value, jenisSampah.value)
    
    $q.loading.hide()
    
    // 2. Tampilkan Success Dialog
    successDialog.value = true
  }, 1500)
}

const closeSuccessDialog = () => {
  successDialog.value = false
  // Reset form
  jadwal.value = ''
  jenisSampah.value = ''
  // 3. Redirect ke Dashboard
  router.push({ name: 'UserDashboard' })
}
</script>

<style lang="scss" scoped>
$dark-green: #08602E;
$dark-green-hover: #06481f;
$yellow-accent: #FFD155;

.text-dark-green {
  color: $dark-green;
}

.icon-green {
  color: $dark-green;
}

.action-button {
  background-color: $yellow-accent !important;
  color: $dark-green !important;
  font-weight: 700;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 209, 85, 0.4);
  }
}

.form-input {
  :deep(.q-field__control) {
    border-radius: 12px;
    color: $dark-green;
  }
  
  :deep(.q-field__native) {
    color: $dark-green;
  }
  
  :deep(.q-field__label) {
    color: $dark-green;
  }
}

// Dialog Styles
.confirm-card {
  border-radius: 20px;
  min-width: 320px;
  max-width: 400px;
}

.preview-box {
  border-radius: 12px;
  border-color: rgba(8, 96, 46, 0.2);
  background: #f9fafb;
}

.confirm-btn {
  background-color: $dark-green !important;
  color: white !important;
  font-weight: 600;
}

.success-card {
  border-radius: 24px;
  min-width: 340px;
  max-width: 420px;
}

.success-icon-wrapper {
  animation: scaleIn 0.5s ease-out;
}

.success-icon {
  filter: drop-shadow(0 4px 8px rgba(76, 175, 80, 0.3));
}

.info-box {
  border-radius: 12px;
  border-color: rgba(8, 96, 46, 0.2);
  background: linear-gradient(135deg, #f1f8f4 0%, #ffffff 100%);
}

.success-btn {
  background-color: $dark-green !important;
  color: white !important;
  font-weight: 700;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: $dark-green-hover !important;
  }
}

// Animations
@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

// Color utilities
.text-orange {
  color: #FF9800;
}
</style>