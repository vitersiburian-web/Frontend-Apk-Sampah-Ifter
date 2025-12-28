<template>
  <q-page class="q-pa-md bg-green-1">
    <!-- Header berdasarkan jenis operasi -->
    <div class="q-mb-md">
      <div class="text-h6 text-weight-bold text-primary">
        <q-icon :name="headerIcon" size="md" class="q-mr-sm" :color="headerColor" />
        {{ headerTitle }}
      </div>
      <div class="text-caption text-grey-7">
        {{ headerSubtitle }}
      </div>
    </div>

    <q-card flat class="rounded-borders q-mb-xl q-pa-md card-form">
      <!-- Informasi Operasi -->
      <div class="q-mb-lg info-section">
        <div class="row items-center q-mb-sm">
          <q-icon name="info" color="info" size="sm" class="q-mr-xs" />
          <span class="text-caption text-grey-7">Informasi Operasi</span>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <div class="text-caption text-grey-7">Jenis Operasi</div>
            <div class="text-body2 text-weight-medium">{{ operationTypeLabel }}</div>
          </div>

          <div class="info-item" v-if="wilayah">
            <div class="text-caption text-grey-7">Wilayah</div>
            <div class="text-body2 text-weight-medium">{{ wilayah }}</div>
          </div>

          <div class="info-item">
            <div class="text-caption text-grey-7">Tanggal</div>
            <div class="text-body2 text-weight-medium">{{ selectedDateLabel }}</div>
          </div>

          <div class="info-item" v-if="namaPelanggan">
            <div class="text-caption text-grey-7">Pelanggan</div>
            <div class="text-body2 text-weight-medium">{{ namaPelanggan }}</div>
          </div>
        </div>
      </div>

      <!-- Form Input Data Sampah -->
      <div class="form-section">
        <div class="text-subtitle1 text-weight-bold text-grey-8 q-mb-sm">Data Sampah</div>

        <!-- Jenis Sampah (hanya untuk patroli dan manual) -->
        <q-select
          v-if="operationType !== 'laporan'"
          outlined
          v-model="form.jenisSampah"
          :options="jenisSampahOptions"
          label="Jenis Sampah"
          class="q-mb-md input-field"
          :rules="[(val) => !!val || 'Pilih jenis sampah']"
        />

        <!-- Jumlah Karung -->
        <div class="q-mb-md">
          <div class="row items-center justify-between q-mb-xs">
            <label class="text-caption text-grey-7">Jumlah Karung</label>
            <div class="text-caption text-blue">
              Harga per karung: {{ formatCurrency(pricePerBag) }}
            </div>
          </div>
          <q-input
            outlined
            v-model.number="form.jumlahKarung"
            type="number"
            min="1"
            class="input-field"
            placeholder="Masukkan jumlah karung"
            :rules="[(val) => val > 0 || 'Minimal 1 karung']"
          >
            <template v-slot:append>
              <q-btn
                flat
                dense
                icon="remove"
                @click="form.jumlahKarung > 1 ? form.jumlahKarung-- : null"
              />
              <q-btn flat dense icon="add" @click="form.jumlahKarung++" />
            </template>
          </q-input>
        </div>

        <!-- Keterangan (opsional) -->
        <q-input
          outlined
          v-model="form.keterangan"
          label="Keterangan (opsional)"
          type="textarea"
          rows="2"
          class="q-mb-md input-field"
          placeholder="Contoh: Sampah organik dari warung, sampah plastik dari rumah makan..."
        />

        <!-- Total Harga -->
        <div class="q-mb-lg">
          <q-input
            outlined
            v-model="formattedTotalHarga"
            label="Total Harga"
            readonly
            prefix="Rp."
            class="input-field"
          />
          <div v-if="operationType !== 'laporan'" class="text-caption text-grey-7 q-mt-xs">
            *Biaya akan dicatat untuk laporan keuangan
          </div>
        </div>

        <!-- Metode Pembayaran -->
        <div v-if="operationType === 'laporan'" class="q-mb-lg">
          <div class="text-subtitle1 text-weight-bold text-grey-8 q-mb-sm">Metode Pembayaran</div>
          <q-option-group
            v-model="form.metodePembayaran"
            :options="paymentOptions"
            color="primary"
            type="radio"
            class="payment-group"
          />
        </div>
      </div>

      <!-- Tombol Aksi -->
      <div class="action-buttons">
        <q-btn
          :label="submitButtonLabel"
          :color="submitButtonColor"
          unelevated
          class="full-width text-weight-bold"
          size="lg"
          @click="handleSubmit"
          :loading="loading"
          :disable="loading"
        />

        <q-btn label="Batal" flat color="grey" class="full-width q-mt-sm" @click="goBack" />
      </div>
    </q-card>

    <!-- Modal QRIS untuk pembayaran -->
    <q-dialog v-model="showQrisModal">
      <q-card class="qris-modal">
        <q-card-section class="text-center">
          <div class="text-h6 text-weight-bold text-primary q-mb-sm">Pembayaran QRIS</div>
          <div class="text-body2 text-grey-7 q-mb-md">
            Scan QR code untuk membayar sebesar:<br />
            <span class="text-h6 text-weight-bold text-green">{{ formattedTotalHarga }}</span>
          </div>

          <!-- QR Code Placeholder -->
          <div class="qrcode-placeholder q-mb-md">
            <q-icon name="qr_code" size="120px" color="grey-6" />
            <div class="text-caption text-grey-6 q-mt-sm">QR Code akan tampil di sini</div>
          </div>

          <div class="text-caption text-grey-7">
            Pembayaran akan otomatis terverifikasi setelah 1-2 menit
          </div>
        </q-card-section>

        <q-card-actions align="center" class="q-pb-md">
          <q-btn
            label="Sudah Bayar"
            color="primary"
            @click="confirmQrisPayment"
            :loading="loading"
          />
          <q-btn label="Batal" flat color="grey" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar, date } from 'quasar'
import { api } from 'src/services/api'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()

// State
const loading = ref(false)
const showQrisModal = ref(false)
const petugasId = ref(null)
const laporanData = ref(null)

// Token
const token = localStorage.getItem('token')

// Determine operation type from route
const operationType = computed(() => {
  if (route.query.type === 'patroli') return 'patroli'
  if (route.query.type === 'manual') return 'manual'
  return 'laporan' // default
})

// Data dari route query
const wilayah = route.query.wilayah || ''
const laporanId = route.query.laporan_id
const selectedDate = ref(route.query.date || date.formatDate(new Date(), 'YYYY-MM-DD'))

// Form data
const form = ref({
  jenisSampah: 'Campuran',
  jumlahKarung: 1,
  keterangan: '',
  metodePembayaran: 'cash',
})

// Constants
const pricePerBag = 5000
const jenisSampahOptions = [
  'Organik',
  'Anorganik',
  'Plastik',
  'Kertas',
  'Logam',
  'Kaca',
  'B3 (Bahan Berbahaya)',
  'Campuran',
  'Elektronik',
]

const paymentOptions = [
  { label: 'Cash', value: 'cash' },
  { label: 'QRIS', value: 'qris' },
]

// Computed Properties
const headerTitle = computed(() => {
  switch (operationType.value) {
    case 'patroli':
      return 'Patroli Pengambilan Sampah'
    case 'manual':
      return 'Laporan Pengambilan Manual'
    default:
      return 'Form Pengambilan Sampah'
  }
})

const headerSubtitle = computed(() => {
  switch (operationType.value) {
    case 'patroli':
      return 'Mencatat pengambilan sampah selama patroli rutin'
    case 'manual':
      return 'Menambahkan data pengambilan sampah yang tidak dilaporkan'
    default:
      return 'Konfirmasi pengambilan sampah berdasarkan laporan'
  }
})

const headerIcon = computed(() => {
  switch (operationType.value) {
    case 'patroli':
      return 'explore'
    case 'manual':
      return 'add_circle'
    default:
      return 'recycling'
  }
})

const headerColor = computed(() => {
  switch (operationType.value) {
    case 'patroli':
      return 'blue'
    case 'manual':
      return 'orange'
    default:
      return 'primary'
  }
})

const operationTypeLabel = computed(() => {
  switch (operationType.value) {
    case 'patroli':
      return 'Patroli Rutin'
    case 'manual':
      return 'Laporan Manual'
    default:
      return 'Pengambilan dari Laporan'
  }
})

const namaPelanggan = computed(() => {
  return laporanData.value?.nama_warga || ''
})

const selectedDateLabel = computed(() => {
  return date.formatDate(selectedDate.value, 'dddd, D MMMM YYYY')
})

const totalHarga = computed(() => {
  return form.value.jumlahKarung * pricePerBag
})

const formattedTotalHarga = computed(() => {
  return formatCurrency(totalHarga.value)
})

const submitButtonLabel = computed(() => {
  if (operationType.value === 'patroli') return 'Simpan Hasil Patroli'
  if (operationType.value === 'manual') return 'Simpan Laporan Manual'
  return 'Konfirmasi Pengambilan'
})

const submitButtonColor = computed(() => {
  switch (operationType.value) {
    case 'patroli':
      return 'blue'
    case 'manual':
      return 'orange'
    default:
      return 'yellow-8'
  }
})

// Helper Functions
const formatCurrency = (amount) => {
  return 'Rp ' + amount.toLocaleString('id-ID')
}

const goBack = () => {
  router.push({ name: 'PetugasDashboard' })
}

const parseJwt = (tokenStr) => {
  try {
    const base64Url = tokenStr.split('.')[1]
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

// Load petugas ID
const loadPetugasId = async () => {
  if (!token) {
    $q.notify({ color: 'negative', message: 'Token tidak ditemukan. Silakan login ulang.' })
    router.push({ name: 'LoginPage' })
    throw new Error('Token missing')
  }

  const payload = parseJwt(token)
  const userId =
    payload?.user_id ||
    payload?.id ||
    payload?.userId ||
    payload?.sub ||
    payload?.uid ||
    payload?.id_user

  if (!userId) {
    $q.notify({ color: 'negative', message: 'Token tidak valid. Silakan login ulang.' })
    router.push({ name: 'LoginPage' })
    throw new Error('Token invalid')
  }

  const res = await api.get(`/api/petugas/by-user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res?.data?.success || !res?.data?.data?.id) {
    throw new Error('Petugas tidak ditemukan')
  }

  petugasId.value = res.data.data.id
}

// Load laporan data (hanya untuk jenis laporan)
const loadLaporanData = async () => {
  if (operationType.value !== 'laporan' || !laporanId) return

  try {
    const res = await api.get(`/api/laporan/${laporanId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.data.success) {
      laporanData.value = res.data.data
      // Pre-fill form dengan data laporan
      form.value.jumlahKarung = laporanData.value.jumlah_karung || 1
      form.value.keterangan = `Pengambilan dari laporan ${laporanData.value.nama_warga}`
    }
  } catch (error) {
    console.error('Gagal memuat data laporan:', error)
  }
}

// Submit berdasarkan jenis operasi
const handleSubmit = () => {
  // Validasi
  if (!form.value.jenisSampah) {
    $q.notify({ color: 'warning', message: 'Pilih jenis sampah' })
    return
  }

  if (form.value.jumlahKarung <= 0) {
    $q.notify({ color: 'warning', message: 'Jumlah karung harus lebih dari 0' })
    return
  }

  // Jika laporan dan pembayaran QRIS, tampilkan modal
  if (operationType.value === 'laporan' && form.value.metodePembayaran === 'qris') {
    showQrisModal.value = true
    return
  }

  // Langsung submit untuk lainnya
  submitForm()
}

const confirmQrisPayment = async () => {
  // Simulasi pembayaran QRIS
  loading.value = true
  await new Promise((resolve) => setTimeout(resolve, 2000))
  loading.value = false

  $q.notify({
    color: 'positive',
    message: 'Pembayaran QRIS berhasil diverifikasi',
    position: 'top',
  })

  showQrisModal.value = false
  submitForm()
}

const submitForm = async () => {
  loading.value = true

  try {
    await loadPetugasId() // Pastikan petugasId tersedia

    let response

    switch (operationType.value) {
      case 'laporan':
        // Update laporan yang sudah ada
        response = await api.post(
          `/api/petugas/tugas/${laporanId}/ambil`,
          {
            petugas_id: petugasId.value,
            jumlah_karung: form.value.jumlahKarung,
            metode_pembayaran: form.value.metodePembayaran,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        )
        break

      case 'patroli':
        // Buat laporan patroli baru
        response = await api.post(
          '/api/petugas/laporan/patroli',
          {
            petugas_id: petugasId.value,
            wilayah: wilayah,
            jenis_sampah: form.value.jenisSampah,
            jumlah_karung: form.value.jumlahKarung,
            keterangan: form.value.keterangan || 'Patroli rutin',
            tanggal: selectedDate.value,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        )
        break

      case 'manual':
        // Buat laporan manual
        response = await api.post(
          '/api/petugas/laporan/manual',
          {
            petugas_id: petugasId.value,
            wilayah: wilayah,
            jenis_sampah: form.value.jenisSampah,
            jumlah_karung: form.value.jumlahKarung,
            keterangan: form.value.keterangan || 'Laporan manual',
            tanggal: selectedDate.value,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        )
        break
    }

    if (response?.data?.success) {
      $q.notify({
        color: 'positive',
        message: getSuccessMessage(),
        position: 'top',
      })

      router.push({ name: 'PetugasDashboard' })
    } else {
      throw new Error(response?.data?.message || 'Gagal menyimpan data')
    }
  } catch (error) {
    console.error('Submit error:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || error.message || 'Gagal menyimpan data',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

const getSuccessMessage = () => {
  switch (operationType.value) {
    case 'patroli':
      return 'Hasil patroli berhasil dicatat'
    case 'manual':
      return 'Laporan manual berhasil disimpan'
    default:
      return 'Pengambilan sampah berhasil dikonfirmasi'
  }
}

// Initialize
onMounted(async () => {
  try {
    await loadPetugasId()
    await loadLaporanData()
  } catch (error) {
    console.error('Initialization error:', error)
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
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.info-section {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.info-item {
  padding: 8px 0;
}

.form-section {
  margin-top: 24px;
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

.action-buttons {
  margin-top: 32px;
}

.btn-konfirmasi {
  background: #ffc107;
  border-radius: 12px;
  height: 50px;
}

.qris-modal {
  border-radius: 16px;
  min-width: 320px;
  max-width: 400px;
}

.qrcode-placeholder {
  background-color: #f5f5f5;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  border: 2px dashed #ddd;
}
</style>
