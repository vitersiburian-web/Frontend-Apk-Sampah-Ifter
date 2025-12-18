<template>
  <q-page class="q-pa-lg bg-grey-1">
    <!-- Header -->
    <div class="row items-center q-mb-xl">
      <q-btn
        flat
        round
        icon="arrow_back"
        color="primary"
        @click="$router.back()"
        class="bg-white shadow-2 q-mr-md"
        size="md"
      />
      <div>
        <div class="text-h5 text-weight-bold text-primary q-mb-xs">Penjadwalan Pengambilan</div>
        <div class="text-body2 text-grey-6">
          Atur waktu, petugas, dan lokasi operasional pengambilan sampah
        </div>
      </div>
    </div>

    <!-- Form Jadwal -->
    <div class="q-mb-xl">
      <q-card class="shadow-5" style="border-radius: 16px; overflow: hidden">
        <!-- Card Header -->
        <q-card-section class="bg-primary-gradient text-white q-pb-lg">
          <div class="row items-center">
            <q-icon name="calendar_month" size="28px" class="q-mr-sm" />
            <div class="text-h6 text-weight-bold">
              {{ isEdit ? 'Edit Jadwal' : 'Buat Jadwal Baru' }}
            </div>
          </div>
          <div class="text-caption q-mt-xs opacity-80">
            {{
              isEdit
                ? 'Edit jadwal yang sudah ada'
                : 'Isi form berikut untuk membuat jadwal pengambilan baru'
            }}
          </div>
        </q-card-section>

        <!-- Form Content -->
        <q-card-section class="q-px-xl q-pt-xl q-pb-lg">
          <q-form @submit.prevent="onSave" class="q-gutter-y-xl">
            <!-- Tanggal Section -->
            <div class="form-section">
              <div class="section-label">
                <q-icon name="calendar_today" size="sm" class="q-mr-sm" color="primary" />
                <div class="text-subtitle1 text-weight-bold text-grey-9">Tanggal Pengambilan</div>
              </div>
              <q-input
                filled
                v-model="tanggalDisplay"
                placeholder="Pilih tanggal"
                bg-color="grey-2"
                class="input-field"
                :rules="[(val) => !!val || 'Tanggal wajib diisi']"
              >
                <template v-slot:prepend>
                  <q-icon name="event" color="primary" />
                </template>
                <template v-slot:append>
                  <q-icon name="keyboard_arrow_down" class="cursor-pointer" />
                </template>
                <template v-slot:after>
                  <q-btn
                    round
                    dense
                    flat
                    icon="event"
                    color="primary"
                    @click="showDatePicker = true"
                  >
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date
                        v-model="form.tanggal"
                        color="primary"
                        today-btn
                        mask="YYYY-MM-DD"
                        @update:model-value="showDatePicker = false"
                      >
                        <div class="row items-center justify-end q-pa-sm">
                          <q-btn v-close-popup label="Pilih" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-btn>
                </template>
              </q-input>
            </div>

            <!-- Jam Section -->
            <div class="form-section">
              <div class="section-label">
                <q-icon name="schedule" size="sm" class="q-mr-sm" color="primary" />
                <div class="text-subtitle1 text-weight-bold text-grey-9">Waktu Operasional</div>
              </div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6">
                  <q-input
                    filled
                    v-model="form.jam_mulai"
                    placeholder="00:00"
                    bg-color="grey-2"
                    class="input-field"
                    :rules="[(val) => !!val || 'Jam mulai wajib diisi']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="play_circle" color="green-7" />
                    </template>
                    <template v-slot:after>
                      <q-btn round dense flat icon="access_time" color="primary">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-time v-model="form.jam_mulai" format24h color="primary" />
                        </q-popup-proxy>
                      </q-btn>
                    </template>
                  </q-input>
                  <div class="text-caption text-grey-6 q-mt-xs">Jam Mulai</div>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input
                    filled
                    v-model="form.jam_selesai"
                    placeholder="23:59"
                    bg-color="grey-2"
                    class="input-field"
                    :rules="[(val) => !!val || 'Jam selesai wajib diisi']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="stop_circle" color="red-7" />
                    </template>
                    <template v-slot:after>
                      <q-btn round dense flat icon="access_time" color="primary">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-time v-model="form.jam_selesai" format24h color="primary" />
                        </q-popup-proxy>
                      </q-btn>
                    </template>
                  </q-input>
                  <div class="text-caption text-grey-6 q-mt-xs">Jam Selesai</div>
                </div>
              </div>
            </div>

            <!-- Petugas Section -->
            <div class="form-section">
              <div class="section-label">
                <q-icon name="groups" size="sm" class="q-mr-sm" color="primary" />
                <div class="text-subtitle1 text-weight-bold text-grey-9">Petugas Bertugas</div>
              </div>
              <q-select
                filled
                v-model="form.petugas_ids"
                multiple
                :options="opsiPetugas"
                use-chips
                stack-label
                option-label="nama_petugas"
                option-value="id"
                emit-value
                map-options
                bg-color="grey-2"
                class="input-field"
                :rules="[(val) => (val && val.length > 0) || 'Minimal pilih 1 petugas']"
              >
                <template v-slot:prepend>
                  <q-icon name="person" color="primary" />
                </template>
                <template v-slot:selected-item="scope">
                  <q-chip
                    dense
                    removable
                    @remove="scope.removeAtIndex(scope.index)"
                    color="primary"
                    text-color="white"
                    class="q-ma-xs"
                  >
                    {{ scope.opt.nama_petugas }}
                  </q-chip>
                </template>
              </q-select>
              <div class="text-caption text-grey-6 q-mt-xs">
                Pilih petugas yang akan bertugas pada jadwal ini
              </div>
            </div>

            <!-- Wilayah Section -->
            <div class="form-section">
              <div class="section-label">
                <q-icon name="location_on" size="sm" class="q-mr-sm" color="primary" />
                <div class="text-subtitle1 text-weight-bold text-grey-9">Lokasi & Wilayah</div>
              </div>
              <q-input
                filled
                v-model="form.keterangan"
                type="textarea"
                rows="3"
                bg-color="grey-2"
                class="input-field"
                placeholder="Contoh: Blok A Perumahan Griya Asri, Fokus pada RT 01-05"
                :rules="[(val) => !!val || 'Lokasi wajib diisi']"
              >
                <template v-slot:prepend>
                  <q-icon name="place" color="primary" />
                </template>
              </q-input>
            </div>

            <!-- Submit Button -->
            <div class="row q-col-gutter-md q-mt-lg">
              <div class="col-12 col-sm-8 offset-sm-2">
                <q-btn
                  :label="isEdit ? 'Update Jadwal' : 'Publikasikan Jadwal'"
                  :color="isEdit ? 'warning' : 'primary'"
                  :icon="isEdit ? 'update' : 'publish'"
                  class="full-width q-py-md"
                  size="lg"
                  rounded
                  unelevated
                  type="submit"
                />
              </div>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>

    <!-- Info & Statistik Section -->
    <div class="row q-col-gutter-lg q-mb-xl">
      <!-- Tips Card -->
      <div class="col-12 col-md-6">
        <q-card class="shadow-3" style="border-radius: 16px; border-left: 4px solid #4caf50">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-mb-sm">
              <q-icon name="info" color="green-7" size="24px" class="q-mr-md" />
              <div class="text-subtitle2 text-weight-bold text-grey-9">Tips Penjadwalan</div>
            </div>
            <div class="text-caption text-grey-7 q-pl-lg">
              • Pastikan tanggal dan waktu sesuai dengan ketersediaan petugas<br />
              • Beri keterangan lokasi yang jelas untuk memudahkan operasional<br />
              • Minimal 1 petugas harus ditugaskan untuk setiap jadwal<br />
              • Periksa jadwal yang sudah ada agar tidak bertabrakan
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Statistik Card -->
      <div class="col-12 col-md-6">
        <q-card class="shadow-3" style="border-radius: 16px">
          <q-card-section class="q-pa-md">
            <div class="text-subtitle2 text-weight-bold text-grey-9 q-mb-md">Statistik Jadwal</div>
            <div class="row q-col-gutter-md">
              <div class="col-6">
                <div class="text-center q-pa-sm bg-blue-1 rounded-borders">
                  <div class="text-h6 text-weight-bold text-primary">{{ jadwals.length }}</div>
                  <div class="text-caption text-grey-7">Total Jadwal</div>
                </div>
              </div>
              <div class="col-6">
                <div class="text-center q-pa-sm bg-green-1 rounded-borders">
                  <div class="text-h6 text-weight-bold text-green-9">
                    {{ activeSchedules }}
                  </div>
                  <div class="text-caption text-grey-7">Aktif</div>
                </div>
              </div>
              <div class="col-6">
                <div class="text-center q-pa-sm bg-orange-1 rounded-borders">
                  <div class="text-h6 text-weight-bold text-orange-9">
                    {{ opsiPetugas.length }}
                  </div>
                  <div class="text-caption text-grey-7">Petugas Tersedia</div>
                </div>
              </div>
              <div class="col-6">
                <div class="text-center q-pa-sm bg-purple-1 rounded-borders">
                  <div class="text-h6 text-weight-bold text-purple-9">
                    {{ todaySchedules }}
                  </div>
                  <div class="text-caption text-grey-7">Hari Ini</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Daftar Jadwal Section -->
    <div class="q-mb-lg">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h5 text-weight-bold text-primary">Daftar Jadwal</div>
        <div class="row items-center q-gutter-sm">
          <q-btn round flat icon="refresh" color="primary" size="sm" @click="fetchJadwals" />
          <q-badge color="primary" :label="`${jadwals.length} Jadwal`" />
        </div>
      </div>

      <q-card class="shadow-5" style="border-radius: 16px; overflow: hidden">
        <q-card-section class="q-pa-none">
          <q-table
            :rows="jadwals"
            :columns="columns"
            row-key="id"
            flat
            bordered
            :pagination="{ rowsPerPage: 10 }"
            class="schedule-table"
            :loading="loading"
          >
            <!-- Loading State -->
            <template v-slot:loading>
              <q-inner-loading showing color="primary" />
            </template>

            <!-- Tanggal Column -->
            <template v-slot:body-cell-tanggal="props">
              <q-td :props="props">
                <div class="column">
                  <div class="text-weight-medium text-primary">
                    {{ formatTanggal(props.row.tanggal) }}
                  </div>
                  <div class="text-caption text-grey-6">
                    {{ getDayName(props.row.tanggal) }}
                  </div>
                </div>
              </q-td>
            </template>

            <!-- Jam Column -->
            <template v-slot:body-cell-jam="props">
              <q-td :props="props">
                <div class="row items-center no-wrap">
                  <div class="column q-mr-md">
                    <div class="row items-center q-mb-xs">
                      <q-icon name="schedule" size="14px" class="q-mr-xs text-green-7" />
                      <span class="text-weight-medium">{{ props.row.jam_mulai }}</span>
                    </div>
                    <div class="row items-center">
                      <q-icon name="update" size="14px" class="q-mr-xs text-red-7" />
                      <span class="text-weight-medium">{{ props.row.jam_selesai }}</span>
                    </div>
                  </div>
                </div>
              </q-td>
            </template>

            <!-- Wilayah Column -->
            <template v-slot:body-cell-wilayah="props">
              <q-td :props="props">
                <div class="text-body2" style="max-width: 200px; white-space: normal">
                  {{ props.row.wilayah }}
                </div>
              </q-td>
            </template>

            <!-- Status Column -->
            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <q-badge
                  :color="props.row.status === 'aktif' ? 'green' : 'grey'"
                  :label="props.row.status === 'aktif' ? 'Aktif' : 'Nonaktif'"
                  rounded
                />
              </q-td>
            </template>

            <!-- Actions Column -->
            <template v-slot:body-cell-actions="props">
              <q-td :props="props" align="center">
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  color="primary"
                  size="sm"
                  @click="loadJadwal(props.row)"
                  class="q-mr-xs"
                />
                <q-btn
                  flat
                  round
                  dense
                  :icon="props.row.status === 'aktif' ? 'pause' : 'play_arrow'"
                  :color="props.row.status === 'aktif' ? 'warning' : 'green'"
                  size="sm"
                  @click="toggleStatus(props.row)"
                />
              </q-td>
            </template>

            <!-- Empty State -->
            <template v-slot:no-data>
              <div class="full-width row flex-center text-grey q-gutter-sm q-pa-xl">
                <q-icon name="calendar_today" size="3em" color="grey-5" />
                <div class="text-center">
                  <div class="text-subtitle1 text-grey-7 q-mb-xs">Belum ada jadwal yang dibuat</div>
                  <div class="text-caption text-grey-5">
                    Mulai dengan membuat jadwal baru di atas
                  </div>
                </div>
              </div>
            </template>

            <!-- Pagination Customization -->
            <template v-slot:pagination="scope">
              <q-btn
                v-if="scope.pagesNumber > 2"
                icon="first_page"
                color="grey"
                round
                flat
                dense
                :disable="scope.isFirstPage"
                @click="scope.firstPage"
              />
              <q-btn
                icon="chevron_left"
                color="grey"
                round
                flat
                dense
                :disable="scope.isFirstPage"
                @click="scope.prevPage"
              />

              <div class="q-mx-lg text-caption text-grey-7">
                Halaman {{ scope.pagination.page }} dari {{ scope.pagesNumber }}
              </div>

              <q-btn
                icon="chevron_right"
                color="grey"
                round
                flat
                dense
                :disable="scope.isLastPage"
                @click="scope.nextPage"
              />
              <q-btn
                v-if="scope.pagesNumber > 2"
                icon="last_page"
                color="grey"
                round
                flat
                dense
                :disable="scope.isLastPage"
                @click="scope.lastPage"
              />
            </template>
          </q-table>
        </q-card-section>

        <q-card-section class="q-pt-md bg-grey-1">
          <div class="text-caption text-grey-7 text-center">
            <q-icon name="info" size="xs" class="q-mr-xs" />
            Klik ikon edit untuk mengubah jadwal atau ikon play/pause untuk mengubah status
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import axios from 'axios'

const $q = useQuasar()
const router = useRouter()

const jadwals = ref([])
const opsiPetugas = reactive([])
const showDatePicker = ref(false)
const loading = ref(false)

const form = reactive({
  tanggal: '',
  jam_mulai: '',
  jam_selesai: '',
  petugas_ids: [],
  keterangan: '',
})

const isEdit = ref(false)
const editingId = ref(null)

// Computed properties
const tanggalForDatePicker = computed({
  get: () => (form.tanggal ? form.tanggal.replace(/-/g, '/') : ''),
  set: (val) => {
    form.tanggal = val.replace(/\//g, '-')
  },
})

const tanggalDisplay = computed({
  get: () => {
    if (!form.tanggal) return ''
    try {
      const date = new Date(form.tanggal)
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return form.tanggal
    }
  },
  set: (val) => {
    form.tanggal = val.replace(/\//g, '-')
  },
})

const activeSchedules = computed(() => {
  return jadwals.value.filter((j) => j.status === 'aktif').length
})

const todaySchedules = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return jadwals.value.filter((j) => {
    const jadwalDate = j.tanggal.split(' ')[0] // Ambil hanya tanggalnya
    return jadwalDate === today && j.status === 'aktif'
  }).length
})

// Columns QTable
const columns = [
  {
    name: 'tanggal',
    label: 'Tanggal',
    field: 'tanggal',
    align: 'left',
    sortable: true,
    style: 'min-width: 150px;',
  },
  {
    name: 'jam',
    label: 'Waktu',
    field: 'jam_mulai',
    align: 'left',
    sortable: true,
  },
  {
    name: 'wilayah',
    label: 'Lokasi',
    field: 'wilayah',
    align: 'left',
    sortable: true,
    style: 'min-width: 200px; max-width: 300px;',
  },
  {
    name: 'nama_petugas',
    label: 'Petugas',
    field: 'nama_petugas',
    align: 'left',
    sortable: true,
    style: 'min-width: 150px;',
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'center',
    sortable: true,
    style: 'width: 100px;',
  },
  {
    name: 'actions',
    label: 'Aksi',
    align: 'center',
    style: 'width: 120px;',
  },
]

// Helper functions
const padTime = (time) => {
  if (!time) return ''
  const [h, m] = time.split(':')
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`
}

const formatTanggal = (tgl) => {
  if (!tgl || tgl === '0000-00-00') return ''
  try {
    if (typeof tgl === 'string') {
      const datePart = tgl.split(' ')[0] // Ambil hanya tanggal jika ada waktu
      const [year, month, day] = datePart.split('-')
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
    }
    return tgl
  } catch {
    return tgl
  }
}

const getDayName = (tgl) => {
  if (!tgl) return ''
  try {
    const date = new Date(tgl.split(' ')[0])
    return date.toLocaleDateString('id-ID', { weekday: 'long' })
  } catch {
    return ''
  }
}

// API Functions
const fetchJadwals = async () => {
  loading.value = true
  try {
    const res = await axios.get('http://localhost:5000/api/jadwal/list')
    if (res.data.success) {
      jadwals.value = res.data.data
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Gagal mengambil data jadwal',
      position: 'top',
      timeout: 3000,
    })
  } finally {
    loading.value = false
  }
}

const fetchPetugas = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/petugas')
    if (res.data.success) {
      opsiPetugas.length = 0
      opsiPetugas.push(...res.data.data)
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Gagal mengambil data petugas',
      position: 'top',
      timeout: 3000,
    })
  }
}

const toggleStatus = async (jadwal) => {
  $q.dialog({
    title: 'Konfirmasi',
    message: `Apakah Anda yakin ingin ${jadwal.status === 'aktif' ? 'menonaktifkan' : 'mengaktifkan'} jadwal ini?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await axios.patch(`http://localhost:5000/api/jadwal/${jadwal.id}/toggle-status`)

      $q.notify({
        type: 'positive',
        message: `Jadwal berhasil ${jadwal.status === 'aktif' ? 'dinonaktifkan' : 'diaktifkan'}`,
        position: 'top',
        timeout: 3000,
        icon: 'check_circle',
      })

      fetchJadwals()
    } catch (error) {
      console.error('Error toggling status:', error)
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Gagal mengubah status jadwal',
        position: 'top',
        timeout: 3000,
      })
    }
  })
}

const loadJadwal = async (jadwal) => {
  isEdit.value = true
  editingId.value = jadwal.id

  if (jadwal.tanggal) {
    if (jadwal.tanggal.match(/^\d{4}-\d{2}-\d{2}$/)) {
      form.tanggal = jadwal.tanggal
    } else if (jadwal.tanggal.includes(' ')) {
      form.tanggal = jadwal.tanggal.split(' ')[0]
    } else {
      form.tanggal = jadwal.tanggal
    }
  }

  form.jam_mulai = padTime(jadwal.jam_mulai?.slice(0, 5) || '')
  form.jam_selesai = padTime(jadwal.jam_selesai?.slice(0, 5) || '')
  form.keterangan = jadwal.wilayah || ''

  try {
    const res = await axios.get(`http://localhost:5000/api/jadwal/${jadwal.id}`)
    if (res.data.success) form.petugas_ids = res.data.data.petugas_ids || []

    // Scroll ke form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Gagal memuat data petugas',
      position: 'top',
      timeout: 3000,
    })
  }
}

const onSave = async () => {
  if (
    !form.tanggal ||
    !form.jam_mulai ||
    !form.jam_selesai ||
    !form.keterangan ||
    form.petugas_ids.length === 0
  ) {
    $q.notify({
      type: 'warning',
      message: 'Mohon lengkapi semua field yang wajib diisi',
      position: 'top',
      timeout: 3000,
    })
    return
  }

  const tanggal = form.tanggal.includes('/') ? form.tanggal.replace(/\//g, '-') : form.tanggal

  const payload = {
    tanggal: tanggal,
    jam_mulai: form.jam_mulai.length === 5 ? form.jam_mulai + ':00' : form.jam_mulai,
    jam_selesai: form.jam_selesai.length === 5 ? form.jam_selesai + ':00' : form.jam_selesai,
    wilayah: form.keterangan,
    petugas_ids: form.petugas_ids,
    status: 'aktif',
  }

  $q.loading.show({
    message: isEdit.value ? 'Memperbarui jadwal...' : 'Menyimpan jadwal...',
    boxClass: 'bg-grey-2 text-grey-9',
  })

  try {
    let res
    if (isEdit.value) {
      res = await axios.patch(`http://localhost:5000/api/jadwal/${editingId.value}`, payload)
    } else {
      res = await axios.post('http://localhost:5000/api/jadwal/multi', payload)
    }

    if (res.data.success) {
      $q.notify({
        type: 'positive',
        message: res.data.message,
        position: 'top',
        timeout: 3000,
        icon: 'check_circle',
      })

      resetForm()
      fetchJadwals()
    }
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.response?.data?.message || 'Terjadi kesalahan server',
      position: 'top',
      timeout: 3000,
    })
  } finally {
    $q.loading.hide()
  }
}

const resetForm = () => {
  form.tanggal = ''
  form.jam_mulai = ''
  form.jam_selesai = ''
  form.keterangan = ''
  form.petugas_ids = []
  isEdit.value = false
  editingId.value = null
}

onMounted(() => {
  fetchJadwals()
  fetchPetugas()
})
</script>

<style scoped>
/* Custom Styles */
.bg-primary-gradient {
  background: linear-gradient(135deg, #006837 0%, #4caf50 100%);
}

.form-section {
  margin-bottom: 32px;
}

.section-label {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.input-field {
  border-radius: 10px;
  transition: all 0.3s ease;
}

.input-field:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.schedule-table {
  font-size: 0.95em;
}

.schedule-table :deep(.q-table__top) {
  border-bottom: 1px solid #e0e0e0;
  padding: 16px;
}

.schedule-table :deep(.q-table tbody tr:hover) {
  background-color: #f8f9fa !important;
  transition: background-color 0.2s ease;
}

.schedule-table :deep(.q-table th) {
  font-weight: 600;
  color: #424242;
  background-color: #f5f5f5;
}

.rounded-borders {
  border-radius: 10px;
  transition: transform 0.2s ease;
}

.rounded-borders:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.opacity-80 {
  opacity: 0.8;
}

/* Smooth transitions */
.q-card {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.q-card:hover {
  transform: translateY(-2px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .q-pa-lg {
    padding: 16px;
  }

  .form-section {
    margin-bottom: 24px;
  }

  .section-label {
    margin-bottom: 8px;
  }

  .text-h5 {
    font-size: 1.5rem;
  }
}

/* Custom scrollbar for table */
.schedule-table :deep(.q-table__container) {
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
}

.schedule-table :deep(.q-table__container::-webkit-scrollbar) {
  width: 8px;
  height: 8px;
}

.schedule-table :deep(.q-table__container::-webkit-scrollbar-track) {
  background: #f1f1f1;
  border-radius: 4px;
}

.schedule-table :deep(.q-table__container::-webkit-scrollbar-thumb) {
  background: #ccc;
  border-radius: 4px;
}

.schedule-table :deep(.q-table__container::-webkit-scrollbar-thumb:hover) {
  background: #aaa;
}
</style>
