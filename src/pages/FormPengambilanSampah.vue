<template>
  <q-page class="q-pa-md">
    <!-- Loading State -->
    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
      <div class="text-caption text-grey-7 q-mt-md">Memuat data...</div>
    </div>

    <!-- Form Container -->
    <div v-else class="max-width-lg q-mx-auto">
      <!-- Header -->
      <div class="text-center q-mb-lg">
        <div class="text-h5 text-weight-bold text-primary">Form Pengambilan Sampah</div>
        <div class="text-caption text-grey-7">
          {{ formTitle }}
        </div>
      </div>

      <!-- Form Card -->
      <q-card flat class="rounded-borders q-mb-md">
        <q-card-section>
          <!-- Informasi Laporan -->
          <div v-if="laporanData" class="q-mb-lg">
            <div class="text-subtitle1 text-weight-bold q-mb-sm">Informasi Laporan</div>
            <q-list separator dense class="bg-grey-1 rounded-borders q-pa-sm">
              <q-item>
                <q-item-section>
                  <q-item-label caption>Nama Pemohon</q-item-label>
                  <q-item-label class="text-weight-medium">{{
                    laporanData.nama_pemohon || laporanData.nama_warga
                  }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Alamat</q-item-label>
                  <q-item-label class="text-weight-medium">{{
                    laporanData.alamat_detail
                  }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Jenis Sampah</q-item-label>
                  <q-item-label class="text-weight-medium">{{
                    laporanData.jenis_sampah
                  }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- Form Input -->
          <q-form @submit="submitForm">
            <!-- Jumlah Karung -->
            <div class="q-mb-md">
              <q-input
                v-model="formData.total_karung"
                label="Jumlah Karung *"
                type="number"
                min="1"
                max="100"
                filled
                :rules="[(val) => val > 0 || 'Jumlah karung harus lebih dari 0']"
              >
                <template v-slot:append>
                  <span class="text-caption text-grey-7">karung</span>
                </template>
              </q-input>
            </div>

            <!-- Harga per Karung -->
            <div class="q-mb-md">
              <q-input
                v-model="formData.harga_per_karung"
                label="Harga per Karung *"
                type="number"
                min="1000"
                max="100000"
                filled
                prefix="Rp"
                :rules="[(val) => val >= 1000 || 'Harga minimal Rp 1.000']"
              >
                <template v-slot:after>
                  <q-btn
                    flat
                    dense
                    label="Standar"
                    color="primary"
                    @click="setHargaStandar"
                    size="sm"
                  />
                </template>
              </q-input>
              <div class="text-caption text-grey-7 q-mt-xs">Harga standar: Rp 5.000 per karung</div>
            </div>

            <!-- Total Pembayaran -->
            <div class="q-mb-md">
              <q-input
                :model-value="totalPembayaran"
                label="Total Pembayaran"
                type="text"
                filled
                readonly
                prefix="Rp"
                class="bg-green-1"
              >
                <template v-slot:after>
                  <div class="text-h6 text-green-8 text-weight-bold">
                    {{ formatCurrency(totalPembayaran) }}
                  </div>
                </template>
              </q-input>
            </div>

            <!-- Metode Pembayaran -->
            <div class="q-mb-md">
              <q-select
                v-model="formData.metode_bayar"
                label="Metode Pembayaran *"
                :options="metodeBayarOptions"
                filled
                :rules="[(val) => !!val || 'Pilih metode pembayaran']"
              />
            </div>

            <!-- Status Pembayaran -->
            <div class="q-mb-md">
              <q-select
                v-model="formData.status_bayar"
                label="Status Pembayaran *"
                :options="statusBayarOptions"
                filled
                :rules="[(val) => !!val || 'Pilih status pembayaran']"
              />
            </div>

            <!-- Keterangan -->
            <div class="q-mb-lg">
              <q-input
                v-model="formData.keterangan"
                label="Keterangan"
                type="textarea"
                filled
                rows="3"
                placeholder="Tambahkan keterangan jika perlu..."
              />
            </div>

            <!-- Tombol Aksi -->
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-btn label="Batal" color="grey" unelevated class="full-width" @click="goBack" />
              </div>
              <div class="col-6">
                <q-btn
                  label="Simpan"
                  color="primary"
                  unelevated
                  class="full-width"
                  type="submit"
                  :loading="submitting"
                />
              </div>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, onMounted, watch } from 'vue'
import { date, useQuasar } from 'quasar'
import api from 'src/services/api'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()

// Data
const loading = ref(true)
const submitting = ref(false)
const laporanData = ref(null)
const formType = ref('') // 'laporan', 'patroli', 'manual'

// Form Data
const formData = ref({
  laporan_id: null,
  total_karung: 1,
  harga_per_karung: 5000,
  metode_bayar: 'cash',
  status_bayar: 'lunas',
  keterangan: '',
  jenis: 'pemasukan',
  kategori: 'Pengambilan Sampah',
})

// Options
const metodeBayarOptions = [
  { label: 'Cash', value: 'cash' },
  { label: 'QRIS', value: 'qris' },
  { label: 'Transfer', value: 'transfer' },
  { label: 'Saldo', value: 'saldo' },
]

const statusBayarOptions = [
  { label: 'Lunas', value: 'lunas' },
  { label: 'Pending', value: 'pending' },
  { label: 'Gagal', value: 'gagal' },
]

// Computed
const formTitle = computed(() => {
  if (formType.value === 'laporan') return 'Pengambilan dari Laporan'
  if (formType.value === 'patroli') return 'Pengambilan Patroli Rutin'
  if (formType.value === 'manual') return 'Tambah Laporan Manual'
  return 'Form Pengambilan'
})

const totalPembayaran = computed(() => {
  return formData.value.total_karung * formData.value.harga_per_karung
})

// Functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID').format(amount)
}

const setHargaStandar = () => {
  formData.value.harga_per_karung = 5000
}

const goBack = () => {
  router.go(-1)
}

// Load laporan data jika dari laporan
// Load laporan data jika dari laporan
const loadLaporanData = async (laporanId) => {
  try {
    console.log('📋 Loading laporan data ID:', laporanId)

    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Token tidak ditemukan')
    }

    // Coba endpoint yang berbeda
    let laporanDetail = null

    try {
      // Coba endpoint /laporan/{id} dulu
      console.log('🔍 Trying endpoint: /api/laporan/' + laporanId)
      const response = await api.get(`/api/laporan/${laporanId}`, {
        headers: { Authorization: token },
      })

      console.log('📋 Response from /laporan/{id}:', response.data)

      if (response.data.success) {
        laporanDetail = response.data.data
      } else {
        console.log('❌ Endpoint /laporan/{id} failed:', response.data.message)
      }
    } catch (error1) {
      console.log('❌ Endpoint /laporan/{id} error:', error1.message)

      // Coba endpoint detail yang lain
      try {
        console.log('🔍 Trying endpoint: /api/laporan/detail/' + laporanId)
        const response = await api.get(`/api/laporan/detail/${laporanId}`, {
          headers: { Authorization: token },
        })

        console.log('📋 Response from /laporan/detail/{id}:', response.data)

        if (response.data.success) {
          laporanDetail = response.data.data
        }
      } catch (error2) {
        console.log('❌ Endpoint /laporan/detail/{id} error:', error2.message)
      }
    }

    if (!laporanDetail) {
      throw new Error('Tidak dapat memuat detail laporan')
    }

    console.log('✅ Laporan data loaded:', {
      id: laporanDetail.id,
      nama: laporanDetail.nama_pemohon || laporanDetail.nama_warga,
      alamat: laporanDetail.alamat_detail,
      jenis_sampah: laporanDetail.jenis_sampah,
    })

    laporanData.value = laporanDetail
    formData.value.laporan_id = laporanId

    // Set keterangan default
    const kodeLaporan = laporanDetail.kode_laporan || `LAP-${laporanId}`
    formData.value.keterangan = `Pengambilan sampah dari laporan ${kodeLaporan}`

    // Auto-set jumlah karung berdasarkan estimasi volume
    if (laporanDetail.estimasi_volume) {
      const karungMap = {
        sedikit: 1,
        sedang: 3,
        banyak: 5,
        'sedang (3-5 karung)': 4,
        'banyak (>5 karung)': 6,
      }
      formData.value.total_karung = karungMap[laporanDetail.estimasi_volume] || 1
      console.log(
        `✅ Auto-set karung: ${formData.value.total_karung} (dari ${laporanDetail.estimasi_volume})`,
      )
    }
  } catch (error) {
    console.error('❌ Error loading laporan data:', error)

    // Tampilkan error yang lebih spesifik
    let errorMsg = 'Gagal memuat data laporan'
    if (error.message.includes('Token')) {
      errorMsg = 'Sesi login habis. Silakan login kembali.'
    } else if (error.message.includes('404')) {
      errorMsg = 'Laporan tidak ditemukan. Mungkin sudah diproses.'
    }

    $q.notify({
      type: 'negative',
      message: errorMsg,
      timeout: 3000,
      position: 'top',
    })

    // Redirect back setelah 2 detik
    setTimeout(() => {
      router.go(-1)
    }, 2000)
  }
}

// Submit form
const submitForm = async () => {
  submitting.value = true

  try {
    const token = localStorage.getItem('token').replace('Bearer ', '')
    const petugasId = localStorage.getItem('petugas_id')
    const petugasNama = localStorage.getItem('petugas_nama')

    if (!petugasId) {
      throw new Error('Petugas ID tidak ditemukan. Silakan login ulang.')
    }

    console.log('📦 Data yang akan dikirim:')
    console.log('- Petugas ID:', petugasId)
    console.log('- Laporan ID:', laporanData.value?.id)
    console.log('- Warga ID:', laporanData.value?.id_warga)
    console.log('- Total Karung:', formData.value.total_karung)
    console.log('- Harga/Karung:', formData.value.harga_per_karung)

    // 1. Buat data transaksi
    const transaksiData = {
      laporan_id: formData.value.laporan_id,
      petugas_id: parseInt(petugasId),
      warga_id: laporanData.value?.id_warga || null,
      jenis: 'pemasukan',
      kategori: 'Pengambilan Sampah',
      jumlah: totalPembayaran.value,
      harga_per_karung: formData.value.harga_per_karung,
      total_karung: parseInt(formData.value.total_karung),
      metode_bayar: formData.value.metode_bayar,
      status_bayar: formData.value.status_bayar,
      keterangan: formData.value.keterangan || `Pengambilan oleh ${petugasNama}`,
      tanggal: date.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
    }

    console.log('📤 Data transaksi lengkap:', JSON.stringify(transaksiData, null, 2))

    // 2. Kirim ke backend
    console.log('🚀 Mengirim ke backend...')
    const response = await api.post('/api/transaksi/pengambilan', transaksiData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('📥 Response dari backend:', response.data)

    if (response.data.success) {
      $q.notify({
        type: 'positive',
        message: response.data.message || '✅ Pengambilan berhasil dicatat!',
        timeout: 3000,
        position: 'top',
      })

      // Auto-refresh dashboard setelah 2 detik
      setTimeout(() => {
        router.push({
          name: 'PetugasDashboard',
          query: { refresh: new Date().getTime() }, // Force refresh
        })
      }, 2000)
    } else {
      throw new Error(response.data.message || '❌ Gagal menyimpan data')
    }
  } catch (error) {
    console.error('❌ Error submitting form:', error)

    // Tampilkan error detail
    let errorMessage = 'Gagal menyimpan data pengambilan'
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }

    $q.notify({
      type: 'negative',
      message: errorMessage,
      timeout: 5000,
      position: 'top',
    })
  } finally {
    submitting.value = false
  }
}
// Initialize
// Initialize
const initialize = async () => {
  loading.value = true

  try {
    console.log('🚀 FormPengambilanSampah initialized')
    console.log('📱 Route query:', route.query)

    // Tentukan tipe form dari route query
    formType.value = route.query.type || 'laporan'
    console.log('📋 Form type:', formType.value)

    if (route.query.laporan_id) {
      const laporanId = route.query.laporan_id
      console.log('📋 Laporan ID from query:', laporanId)

      await loadLaporanData(laporanId)
    } else if (route.query.patroli === 'true') {
      console.log('🚓 Form untuk patroli')
      formData.value.keterangan = `Pengambilan patroli rutin di ${route.query.wilayah || 'Wilayah Tugas'}`
    } else if (route.query.manual === 'true') {
      console.log('📝 Form untuk laporan manual')
      formData.value.keterangan = 'Pengambilan sampah tidak terjadwal'
    }
  } catch (error) {
    console.error('❌ Error initializing form:', error)
  } finally {
    loading.value = false
  }
}

// Watch untuk update total pembayaran
watch(
  () => [formData.value.total_karung, formData.value.harga_per_karung],
  () => {
    // Update otomatis
  },
)

// Lifecycle
onMounted(() => {
  initialize()
})
</script>

<style scoped>
.max-width-lg {
  max-width: 600px;
}

.rounded-borders {
  border-radius: 16px;
}

.text-primary {
  color: #006837 !important;
}

.q-field--filled.bg-green-1 {
  background-color: #f1f8e9 !important;
}
</style>
