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
          <!-- Informasi Laporan (HANYA untuk tipe laporan) -->
          <div v-if="formType === 'laporan' && laporanData" class="q-mb-lg">
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
            <!-- Pilih Warga (HANYA untuk patroli & manual) -->
            <div v-if="formType !== 'laporan'" class="q-mb-md">
              <q-select
                v-model="selectedWarga"
                :options="wargaOptions"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                filled
                use-input
                input-debounce="300"
                @filter="filterWarga"
                :rules="[(val) => !!val || 'Pilih warga yang mengambil sampah']"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey-7"> Tidak ada warga ditemukan </q-item-section>
                  </q-item>
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                      <q-item-label caption>
                        RT {{ scope.opt.rt }}/RW {{ scope.opt.rw }} - {{ scope.opt.alamat }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-badge color="green" v-if="scope.opt.saldo > 0">
                        Rp {{ formatCurrency(scope.opt.saldo) }}
                      </q-badge>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <!-- Nama Warga Manual (jika tidak ada di dropdown) -->
            <div v-if="formType !== 'laporan' && !selectedWarga" class="q-mb-md">
              <q-input
                v-model="formData.nama_warga_manual"
                label="Nama Warga (jika tidak ada dalam daftar)"
                filled
                placeholder="Masukkan nama warga..."
              />
            </div>

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
                :placeholder="getKeteranganPlaceholder"
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
const wargaList = ref([])
const selectedWarga = ref(null)
const wargaOptions = ref([])

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
  nama_warga_manual: '',
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

const getKeteranganPlaceholder = computed(() => {
  if (formType.value === 'laporan') {
    const kode = laporanData.value?.kode_laporan || 'LAP-XXX'
    return `Pengambilan sampah dari laporan ${kode}...`
  }
  if (formType.value === 'patroli') return 'Pengambilan sampah patroli rutin...'
  return 'Catatan tambahan tentang pengambilan sampah...'
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

const filterWarga = (val, update) => {
  update(() => {
    const needle = val.toLowerCase()

    wargaOptions.value = wargaList.value
      .filter((w) => {
        return (
          w.nama_lengkap.toLowerCase().includes(needle) ||
          (w.alamat_lengkap || '').toLowerCase().includes(needle) ||
          String(w.rt).includes(needle) ||
          String(w.rw).includes(needle)
        )
      })
      .map((w) => ({
        value: w.id,
        label: w.nama_lengkap,
        alamat: w.alamat_lengkap || '-',
        rt: w.rt || '-',
        rw: w.rw || '-',
        saldo: w.saldo || 0,
      }))
  })
}

// Load data warga untuk dropdown
// Load data warga untuk dropdown
const loadWargaList = async () => {
  try {
    console.log('Memulai load warga list...')

    const token = localStorage.getItem('token')
    if (!token) {
      console.error('Token tidak ditemukan di localStorage')
      $q.notify({
        type: 'warning',
        message: 'Silakan login kembali',
        timeout: 3000,
      })
      return
    }

    // Log untuk debugging
    console.log('Mengambil data warga dengan token:', token.substring(0, 20) + '...')

    const response = await api.get('/api/warga/list', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('Response warga list:', response)

    if (response.data && response.data.success) {
      wargaList.value = response.data.data || []
      console.log('Jumlah warga yang didapat:', wargaList.value.length)

      // Map data untuk options
      wargaOptions.value = wargaList.value.map((w) => ({
        value: w.id,
        label: w.nama_lengkap,
        alamat: w.alamat_lengkap || w.alamat || '-',
        rt: w.rt || '-',
        rw: w.rw || '-',
        saldo: w.saldo || 0,
        no_telepon: w.no_telepon || '-',
      }))

      console.log('Warga options:', wargaOptions.value)

      if (wargaList.value.length === 0) {
        $q.notify({
          type: 'info',
          message: 'Belum ada data warga tersedia',
          timeout: 3000,
        })
      }
    } else {
      console.error('Format response tidak valid:', response.data)
      $q.notify({
        type: 'warning',
        message: 'Format data warga tidak valid',
        timeout: 3000,
      })
    }
  } catch (error) {
    console.error('Error loading warga list:', error)

    // Log detail error
    if (error.response) {
      console.error('Response error:', error.response.data)
      console.error('Status:', error.response.status)
    }

    $q.notify({
      type: 'negative',
      message: 'Gagal memuat data warga: ' + (error.message || 'Unknown error'),
      timeout: 5000,
    })

    // Fallback data untuk testing
    wargaOptions.value = [
      {
        value: 0,
        label: 'Test Warga',
        alamat: 'Jl. Test',
        rt: '01',
        rw: '01',
        saldo: 0,
      },
    ]
  }
}

// Load laporan data jika dari laporan
const loadLaporanData = async (laporanId) => {
  try {
    const token = localStorage.getItem('token')
    const response = await api.get(`/api/laporan/${laporanId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (response.data.success) {
      laporanData.value = response.data.data
      formData.value.laporan_id = laporanId

      const kodeLaporan = laporanData.value.kode_laporan || `LAP-${laporanId}`
      formData.value.keterangan = `Pengambilan sampah dari laporan ${kodeLaporan}`

      if (laporanData.value.estimasi_volume) {
        const karungMap = {
          sedikit: 1,
          sedang: 3,
          banyak: 5,
        }
        formData.value.total_karung = karungMap[laporanData.value.estimasi_volume] || 1
      }
    }
  } catch (error) {
    console.error('Error loading laporan data:', error)
    $q.notify({
      type: 'negative',
      message: 'Gagal memuat data laporan',
      timeout: 3000,
    })
    setTimeout(() => router.go(-1), 2000)
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
      throw new Error('Petugas ID tidak ditemukan')
    }

    // Tentukan warga_id berdasarkan form type
    let wargaId = null
    let namaWarga = ''

    if (formType.value === 'laporan') {
      wargaId = laporanData.value?.id_warga
      namaWarga = laporanData.value?.nama_pemohon || laporanData.value?.nama_warga
    }
    if (formType.value === 'patroli' || formType.value === 'manual') {
      if (selectedWarga.value) {
        const selected = wargaOptions.value.find((w) => w.value === selectedWarga.value)

        wargaId = selected?.value
        namaWarga = selected?.label
      } else if (formData.value.nama_warga_manual) {
        namaWarga = formData.value.nama_warga_manual
      }
    }

    // Data transaksi
    const transaksiData = {
      laporan_id: formType.value === 'laporan' ? formData.value.laporan_id : null,
      petugas_id: parseInt(petugasId),
      warga_id: wargaId,
      jenis: 'pemasukan',
      kategori: formType.value === 'patroli' ? 'Patroli Rutin' : 'Pengambilan Sampah',
      jumlah: totalPembayaran.value,
      harga_per_karung: formData.value.harga_per_karung,
      total_karung: parseInt(formData.value.total_karung),
      metode_bayar: formData.value.metode_bayar,
      status_bayar: formData.value.status_bayar,
      keterangan:
        formData.value.keterangan ||
        `Pengambilan ${formType.value === 'patroli' ? 'patroli' : 'sampah'} oleh ${petugasNama} ${namaWarga ? 'dari ' + namaWarga : ''}`,
      tanggal: date.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
    }

    console.log('Data transaksi:', transaksiData)

    // Kirim ke backend
    const response = await api.post('/api/transaksi/pengambilan', transaksiData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.data.success) {
      // JIKA DARI LAPORAN: HAPUS LAPORAN
      if (formType.value === 'laporan' && laporanData.value?.id) {
        try {
          await api.delete(`/api/laporan/${laporanData.value.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          console.log('Laporan berhasil dihapus setelah pengambilan')
        } catch (deleteError) {
          console.error('Gagal menghapus laporan:', deleteError)
        }
      }

      $q.notify({
        type: 'positive',
        message: '✅ Pengambilan berhasil dicatat!',
        timeout: 3000,
      })

      setTimeout(() => {
        router.push({
          name: 'PetugasDashboard',
          query: { refresh: new Date().getTime() },
        })
      }, 2000)
    } else {
      throw new Error(response.data.message || 'Gagal menyimpan data')
    }
  } catch (error) {
    console.error('Error submitting form:', error)

    let errorMessage = 'Gagal menyimpan data pengambilan'
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }

    $q.notify({
      type: 'negative',
      message: errorMessage,
      timeout: 5000,
    })
  } finally {
    submitting.value = false
  }
}

// Initialize
const initialize = async () => {
  loading.value = true
  console.log('Initializing form...')

  try {
    formType.value = route.query.type || 'laporan'
    console.log('Form type:', formType.value)
    console.log('Route query:', route.query)

    // Load data berdasarkan tipe form
    if (formType.value === 'laporan' && route.query.laporan_id) {
      console.log('Loading laporan data:', route.query.laporan_id)
      await loadLaporanData(route.query.laporan_id)
    } else if (formType.value === 'patroli' || formType.value === 'manual') {
      console.log('Loading warga list for type:', formType.value)
      await loadWargaList()

      // Set default keterangan
      if (formType.value === 'patroli') {
        formData.value.keterangan = `Pengambilan patroli rutin di ${route.query.wilayah || 'Wilayah Tugas'}`
      } else if (formType.value === 'manual') {
        formData.value.keterangan = 'Pengambilan sampah tidak terjadwal'
      }
    }
  } catch (error) {
    console.error('Error initializing form:', error)
    $q.notify({
      type: 'negative',
      message: 'Gagal menginisialisasi form',
      timeout: 3000,
    })
  } finally {
    loading.value = false
    console.log('Initialization complete')
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
// Lifecycle
onMounted(() => {
  console.log('Component mounted, route query:', route.query)
  initialize()
})

// Tambahkan watcher untuk formType
watch(
  () => formType.value,
  (newVal) => {
    console.log('Form type changed to:', newVal)
    if (newVal === 'patroli' || newVal === 'manual') {
      loadWargaList()
    }
  },
)
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
