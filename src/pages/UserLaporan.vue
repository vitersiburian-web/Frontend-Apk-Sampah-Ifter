<template>
  <q-page padding>
    <h4 class="text-h4 text-dark-green q-my-md q-ml-sm">Ajukan Pengambilan</h4>
    <p class="text-body1 text-dark-green q-my-sm q-ml-sm">
      Mengajukan pengambilan sampah kepada petugas, pastikan sampah sudah dipilah
    </p>

    <q-form @submit.prevent="onSubmit" class="q-gutter-md q-mt-lg">
      <!-- Jadwal -->
      <div>
        <label class="text-dark-green q-ml-sm text-body1 text-weight-medium">
          Jadwal Pengambilan Sampah
        </label>
        <q-input outlined readonly :value="jadwalDisplay" class="q-mt-xs form-input" />
      </div>

      <!-- Jenis Sampah -->
      <div>
        <label class="text-dark-green q-ml-sm text-body1 text-weight-medium">Jenis Sampah</label>
        <q-select
          v-model="jenisSampah"
          outlined
          :options="jenisSampahOptions"
          placeholder="Pilih Jenis Sampah"
          class="q-mt-xs form-input"
          dense
          :rules="[(val) => !!val || 'Jenis sampah tidak boleh kosong']"
        />
      </div>

      <!-- Jumlah Karung -->
      <div>
        <label class="text-dark-green q-ml-sm text-body1 text-weight-medium">Jumlah Karung</label>
        <q-input
          v-model.number="jumlahKarung"
          type="number"
          outlined
          dense
          min="1"
          class="q-mt-xs form-input"
          placeholder="Masukkan jumlah karung"
        >
          <template v-slot:append>
            <q-btn flat dense icon="remove" @click="jumlahKarung > 1 ? jumlahKarung-- : null" />
            <q-btn flat dense icon="add" @click="jumlahKarung++" />
          </template>
        </q-input>
        <div class="text-caption text-dark-green q-mt-xs q-ml-sm">
          Harga per karung: {{ formatRupiah(hargaPerKarung) }}
        </div>
      </div>

      <!-- Total Harga -->
      <div class="q-mt-sm">
        <label class="text-dark-green q-ml-sm text-body1 text-weight-medium">
          Total Pembayaran
        </label>
        <q-input
          outlined
          dense
          readonly
          :model-value="formatRupiah(totalPembayaran)"
          class="q-mt-xs form-input"
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
        </q-card-section>

        <!-- Preview Data -->
        <q-card-section>
          <q-card flat bordered class="preview-box q-mt-md">
            <q-card-section class="q-pa-md">
              <div class="q-mb-sm">
                <div class="text-caption text-grey-7">Jadwal</div>
                <div class="text-body2 text-weight-bold text-dark-green">{{ jadwalDisplay }}</div>
              </div>
              <q-separator class="q-my-sm" />
              <div class="q-mb-sm">
                <div class="text-caption text-grey-7">Jenis Sampah</div>
                <div class="text-body2 text-weight-bold text-dark-green">{{ jenisSampah }}</div>
              </div>
              <q-separator class="q-my-sm" />
              <div class="q-mb-sm">
                <div class="text-caption text-grey-7">Jumlah Karung</div>
                <div class="text-body2 text-weight-bold text-dark-green">
                  {{ jumlahKarung }} karung
                </div>
              </div>
              <q-separator class="q-my-sm" />
              <div>
                <div class="text-caption text-grey-7">Total Pembayaran</div>
                <div class="text-body2 text-weight-bold text-dark-green">
                  {{ formatRupiah(totalPembayaran) }}
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-card-section>

        <!-- Metode Pembayaran -->
        <q-card-section>
          <div class="text-caption text-grey-7 q-mb-sm">Metode Pembayaran</div>
          <q-option-group
            v-model="metodePembayaran"
            :options="[
              { label: 'Cash', value: 'cash' },
              { label: 'QRIS', value: 'qris' },
            ]"
            color="primary"
          />
          <div v-if="metodePembayaran === 'qris'" class="text-center q-mt-md">
            <img src="../assets/qris-example.jpg" alt="QRIS" style="width: 180px" />
            <div class="text-grey-7 q-mt-sm">
              Silakan scan QRIS dan lakukan pembayaran sebesar <br />{{
                formatRupiah(totalPembayaran)
              }}
            </div>
          </div>
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
            v-if="metodePembayaran === 'cash'"
            label="Ya, Ajukan"
            class="full-width confirm-btn"
            rounded
            no-caps
            @click="submitPengajuan"
          />
          <q-btn
            v-if="metodePembayaran === 'qris'"
            label="Sudah Bayar"
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
          <div class="text-h5 text-weight-bold text-dark-green q-mb-sm">Pengajuan Berhasil!</div>
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
              <div class="text-body2 text-dark-green q-mb-xs">
                <strong>Jumlah Karung:</strong> {{ jumlahKarung }}
              </div>
              <div class="text-body2 text-dark-green q-mb-xs">
                <strong>Total Pembayaran:</strong> {{ formatRupiah(totalPembayaran) }}
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
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { setPengajuan } from 'src/stores/laporanStore'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()

const jadwal = ref('')
const jadwalDisplay = ref('Memuat jadwal...')
const jenisSampah = ref('')
const metodePembayaran = ref('cash')
const jumlahKarung = ref(0)
const hargaPerKarung = ref(5000)
const confirmDialog = ref(false)
const successDialog = ref(false)
const userId = localStorage.getItem('user_id') || null

const jenisSampahOptions = [
  'Organik',
  'Anorganik',
  'B3 (Bahan Berbahaya dan Beracun)',
  'Kertas',
  'Plastik',
  'Logam',
  'Kaca',
  'Elektronik',
]

const totalPembayaran = computed(() => jumlahKarung.value * hargaPerKarung.value)

const pad = (n) => n.toString().padStart(2, '0')

const formatRupiah = (value) => 'Rp ' + value.toLocaleString('id-ID')

// Format untuk tampilan
const formatJadwal = (dateString) => {
  if (!dateString) return '-'
  try {
    const [datePart, timePart] = dateString.split(' ')
    const [year, month, day] = datePart.split('-')
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const monthNames = [
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
    const date = new Date(year, month - 1, day)
    const dayName = dayNames[date.getDay()]
    return `${dayName}, ${day} ${monthNames[month - 1]} ${year}${timePart ? ' • ' + timePart + ' WIB' : ''}`
  } catch {
    return dateString
  }
}

onMounted(async () => {
  const idJadwal = route.query.id_jadwal
  if (!idJadwal) {
    jadwalDisplay.value = 'Jadwal tidak tersedia'
    return $q.notify({
      type: 'warning',
      message: 'ID jadwal tidak ditemukan',
      position: 'top',
      timeout: 2000,
    })
  }

  try {
    const res = await axios.get(`http://localhost:5000/api/jadwal/${idJadwal}`)
    if (res.data.success && res.data.data) {
      const j = res.data.data
      const rawTanggal = j.tanggal
      const dateObj = new Date(rawTanggal)
      if (isNaN(dateObj.getTime())) throw new Error('Tanggal dari API tidak valid')
      const formattedTanggal = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`
      let jamMulai = j.jam_mulai || '08:00:00'
      if (jamMulai.length === 5) jamMulai += ':00'

      // Display rapi
      const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
      const monthNames = [
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
      const dayName = dayNames[dateObj.getDay()]
      const day = dateObj.getDate()
      const month = monthNames[dateObj.getMonth()]
      const year = dateObj.getFullYear()
      jadwalDisplay.value = `${dayName}, ${day} ${month} ${year} • ${j.jam_mulai.slice(0, 5)} - ${j.jam_selesai.slice(0, 5)} WIB`

      // Simpan untuk validasi & backend
      window.currentJadwalData = { tanggal: formattedTanggal, jam_mulai: jamMulai }
      jadwal.value = formattedTanggal + ' ' + jamMulai
    } else {
      jadwalDisplay.value = 'Jadwal tidak ditemukan'
    }
  } catch (err) {
    console.error(err)
    jadwalDisplay.value = 'Gagal memuat jadwal'
  }
})

const onSubmit = () => {
  if (!jadwal.value || !jenisSampah.value) {
    return $q.notify({
      type: 'negative',
      message: 'Mohon lengkapi semua data',
      position: 'top',
      timeout: 2000,
    })
  }
  confirmDialog.value = true
}

async function submitPengajuan() {
  if (!userId) {
    return $q.notify({ type: 'negative', message: 'User belum login' })
  }
  if (jumlahKarung.value < 1) {
    return $q.notify({ type: 'negative', message: 'Jumlah karung minimal 1' })
  }

  try {
    const [tanggal, jam] = jadwal.value.split(' ')
    const payload = {
      user_id: userId,
      alamat: '',
      sudah_dipilah: 1,
      jumlah_karung: jumlahKarung.value,
      jenis_pembayaran: metodePembayaran.value,
      tanggal_pengambilan: tanggal,
      jam_pengambilan: jam,
      jenis_sampah: jenisSampah.value,
    }

    const res = await axios.post('http://localhost:5000/api/laporan', payload)
    if (res.data.success) {
      console.log('Laporan berhasil dibuat, ID:', res.data.laporan_id)
      confirmDialog.value = false
      successDialog.value = true
    } else {
      $q.notify({ type: 'negative', message: res.data.message })
    }
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Gagal mengajukan laporan' })
  }
}

const closeSuccessDialog = () => {
  successDialog.value = false
  jadwal.value = ''
  jenisSampah.value = ''
  router.push({ name: 'UserDashboard' })
}
</script>

<style lang="scss" scoped>
$dark-green: #08602e;
$dark-green-hover: #06481f;
$yellow-accent: #ffd155;

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
  color: #ff9800;
}
</style>
