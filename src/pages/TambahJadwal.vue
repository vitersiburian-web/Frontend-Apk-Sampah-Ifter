<template>
  <q-page class="q-pa-md bg-green-1">
    <div class="row items-center q-mb-lg">
      <q-btn
        flat
        round
        icon="arrow_back"
        color="primary"
        @click="$router.back()"
        class="bg-white shadow-1"
      />
      <div class="q-ml-md">
        <div class="text-h6 text-weight-bold text-primary">Penjadwalan Pengambilan</div>
        <div class="text-caption text-grey-7">Atur waktu, petugas, dan lokasi operasional</div>
      </div>
    </div>

    <q-card flat class="form-card shadow-15">
      <q-card-section class="q-pa-xl">
        <q-form @submit.prevent="onSave" class="q-gutter-y-lg">
          <!-- Tanggal -->
          <div>
            <div class="row items-center q-mb-sm text-primary">
              <q-icon name="calendar_today" size="xs" class="q-mr-xs" />
              <div class="text-subtitle2 text-weight-bold">Tanggal Pengambilan</div>
            </div>
            <q-input filled v-model="form.tanggal" mask="date" placeholder="YYYY-MM-DD">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer text-primary">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="form.tanggal" color="green-9">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Pilih" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <!-- Jam Mulai & Jam Selesai -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <div class="row items-center q-mb-sm text-primary">
                <q-icon name="schedule" size="xs" class="q-mr-xs" />
                <div class="text-subtitle2 text-weight-bold">Jam Mulai</div>
              </div>
              <q-input filled v-model="form.jam_mulai" mask="time">
                <template v-slot:append>
                  <q-icon name="access_time" class="cursor-pointer text-primary">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-time v-model="form.jam_mulai" format24h color="green-9">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="OK" color="primary" flat />
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-12 col-sm-6">
              <div class="row items-center q-mb-sm text-red">
                <q-icon name="update" size="xs" class="q-mr-xs" />
                <div class="text-subtitle2 text-weight-bold">Jam Selesai</div>
              </div>
              <q-input filled v-model="form.jam_selesai" mask="time">
                <template v-slot:append>
                  <q-icon name="access_time" class="cursor-pointer text-primary">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-time v-model="form.jam_selesai" format24h color="green-9">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="OK" color="primary" flat />
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </div>

          <!-- Petugas -->
          <div>
            <div class="row items-center q-mb-sm text-primary">
              <q-icon name="engineering" size="xs" class="q-mr-xs" />
              <div class="text-subtitle2 text-weight-bold">Petugas Bertugas</div>
            </div>
            <q-select
              filled
              v-model="form.petugas_ids"
              multiple
              :options="opsiPetugas"
              use-chips
              option-label="nama_petugas"
              option-value="id"
              emit-value
              map-options
              :rules="[(val) => (val && val.length > 0) || 'Minimal pilih 1 petugas']"
            />
          </div>

          <!-- Wilayah -->
          <div>
            <div class="row items-center q-mb-sm text-primary">
              <q-icon name="place" size="xs" class="q-mr-xs" />
              <div class="text-subtitle2 text-weight-bold">Catatan Lokasi / Wilayah</div>
            </div>
            <q-input
              filled
              v-model="form.keterangan"
              type="textarea"
              rows="3"
              placeholder="Contoh: Fokus di Blok A, B, fasum"
            />
          </div>

          <div class="q-pt-lg">
            <q-btn
              label="Publikasikan Jadwal"
              color="primary"
              class="full-width q-py-md"
              rounded
              unelevated
              type="submit"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
    <q-page class="q-pa-md bg-green-1">
      <div class="text-h6 text-primary q-mb-md">Daftar Jadwal Pengambilan</div>

      <q-table :rows="jadwals" :columns="columns" row-key="id" flat bordered dense />
    </q-page>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import axios from 'axios'

const $q = useQuasar()
const router = useRouter()
const jadwals = ref([])

const form = reactive({
  tanggal: '',
  jam_mulai: '',
  jam_selesai: '',
  petugas_ids: [],
  keterangan: '',
})

const columns = [
  { name: 'tanggal', label: 'Tanggal', field: 'tanggal', align: 'left' },
  { name: 'jam_mulai', label: 'Mulai', field: 'jam_mulai', align: 'left' },
  { name: 'jam_selesai', label: 'Selesai', field: 'jam_selesai', align: 'left' },
  { name: 'wilayah', label: 'Wilayah', field: 'wilayah', align: 'left' },
  { name: 'nama_petugas', label: 'Petugas', field: 'nama_petugas', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
]

// List petugas dari backend
const opsiPetugas = reactive([])

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/petugas')
    if (res.data.success) {
      opsiPetugas.push(...res.data.data)
    }
  } catch (err) {
    console.error('Gagal ambil petugas:', err)
    $q.notify({ type: 'negative', message: 'Gagal ambil data petugas', position: 'top' })
  }
})

onMounted(async () => {
  $q.loading.show({ message: 'Mengambil data jadwal...' })
  try {
    const res = await axios.get('http://localhost:5000/api/jadwal/list')
    if (res.data.success) {
      jadwals.value = res.data.data
    } else {
      $q.notify({ type: 'negative', message: res.data.message, position: 'top' })
    }
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Gagal ambil data jadwal', position: 'top' })
  } finally {
    $q.loading.hide()
  }
})

const onSave = async () => {
  // Validasi sederhana
  if (
    !form.tanggal ||
    !form.jam_mulai ||
    !form.jam_selesai ||
    !form.keterangan ||
    form.petugas_ids.length === 0
  ) {
    return $q.notify({ type: 'negative', message: 'Mohon lengkapi semua field', position: 'top' })
  }

  // Format jam: HH:MM -> HH:MM:SS
  const jam_mulai = form.jam_mulai.length === 5 ? form.jam_mulai + ':00' : form.jam_mulai
  const jam_selesai = form.jam_selesai.length === 5 ? form.jam_selesai + ':00' : form.jam_selesai

  const tanggalFormatted = form.tanggal.replace(/\//g, '-')

  const payload = {
    tanggal: tanggalFormatted,
    jam_mulai,
    jam_selesai,
    wilayah: form.keterangan,
    petugas_ids: form.petugas_ids,
    status: 'aktif',
  }

  $q.loading.show({ message: 'Menyimpan jadwal...' })

  try {
    const res = await axios.post('http://localhost:5000/api/jadwal/multi', payload)
    if (res.data.success) {
      $q.notify({ type: 'positive', message: res.data.message, position: 'top' })
      router.push('/admin/riwayat')
    } else {
      $q.notify({ type: 'negative', message: res.data.message, position: 'top' })
    }
  } catch (err) {
    console.error(err)
    $q.notify({
      type: 'negative',
      message: err.response?.data?.message || 'Terjadi kesalahan server',
      position: 'top',
    })
  } finally {
    $q.loading.hide()
  }
}
</script>

<style scoped>
.text-primary {
  color: #006837;
}
.form-card {
  max-width: 650px;
  margin: 0 auto;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}
</style>
