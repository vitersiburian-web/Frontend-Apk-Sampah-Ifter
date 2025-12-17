<template>
  <q-page class="q-pa-md bg-green-1">
    <div class="row items-center q-mb-lg">
      <q-btn flat round icon="arrow_back" color="primary" @click="$router.back()" class="bg-white shadow-1" />
      <div class="q-ml-md">
        <div class="text-h6 text-weight-bold text-primary">Penjadwalan Pengambilan</div>
        <div class="text-caption text-grey-7">Atur waktu, petugas, dan lokasi operasional</div>
      </div>
    </div>

    <q-card flat class="form-card shadow-15" style="border-radius: 24px; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px);">
      <q-card-section class="q-pa-xl">
        <q-form @submit="onSave" class="q-gutter-y-lg">
          
          <div>
            <div class="row items-center q-mb-sm text-primary">
              <q-icon name="calendar_today" size="xs" class="q-mr-xs" />
              <div class="text-subtitle2 text-weight-bold">Tanggal Pengambilan</div>
            </div>
            <q-input filled v-model="form.tanggal" mask="date" :rules="['date']" class="futuristic-input">
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

          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <div class="row items-center q-mb-sm text-primary">
                <q-icon name="schedule" size="xs" class="q-mr-xs" />
                <div class="text-subtitle2 text-weight-bold">Jam Mulai</div>
              </div>
              <q-input filled v-model="form.jam_mulai" mask="time" :rules="['time']" class="futuristic-input">
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
              <q-input filled v-model="form.jam_selesai" mask="time" :rules="['time']" class="futuristic-input">
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
              stack-label
              option-label="nama"
              option-value="id"
              emit-value
              map-options
              class="futuristic-input"
              :rules="[val => val && val.length > 0 || 'Minimal pilih 1 petugas']"
            />
          </div>

          <div>
            <div class="row items-center q-mb-sm text-primary">
              <q-icon name="place" size="xs" class="q-mr-xs" />
              <div class="text-subtitle2 text-weight-bold">Catatan Lokasi / Wilayah</div>
            </div>
            <q-input 
              filled 
              v-model="form.keterangan" 
              type="textarea" 
              placeholder="Contoh: Fokus pengambilan di Blok A, B, dan area fasum dekat taman." 
              rows="3" 
              class="futuristic-input shadow-inner"
            />
          </div>

          <div class="q-pt-lg">
            <q-btn 
              label="Publikasikan Jadwal" 
              color="primary" 
              class="full-width q-py-md futuristic-btn" 
              rounded 
              unelevated 
              type="submit" 
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { reactive } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()

const opsiPetugas = [
  { id: 1, nama: 'Budi Santoso' },
  { id: 2, nama: 'Slamet Rizal' },
  { id: 3, nama: 'Andi Wijaya' },
  { id: 4, nama: 'Siti Aminah' }
]

const form = reactive({
  tanggal: '',
  jam_mulai: '',
  jam_selesai: '',
  petugas_ids: [],
  keterangan: ''
})

const onSave = () => {
  $q.loading.show({ message: 'Mengintegrasikan data ke sistem...' })
  setTimeout(() => {
    $q.loading.hide()
    $q.notify({
      color: 'positive',
      icon: 'verified',
      message: 'Jadwal operasional berhasil dibuat!',
      position: 'top',
      classes: 'futuristic-notify'
    })
    router.push('/admin/riwayat')
  }, 1200)
}
</script>

<style scoped>
.form-card {
  max-width: 650px;
  margin: 0 auto;
  border: 1px solid rgba(0, 104, 55, 0.1);
}
.futuristic-input :deep(.q-field__control) {
  border-radius: 16px !important;
  background: rgba(0, 104, 55, 0.04) !important;
  transition: all 0.3s ease;
}
.futuristic-input :deep(.q-field__control):hover {
  background: rgba(0, 104, 55, 0.08) !important;
}
.futuristic-btn {
  background: linear-gradient(135deg, #006837 0%, #009245 100%);
  box-shadow: 0 8px 20px rgba(0, 104, 55, 0.25);
  font-weight: bold;
  letter-spacing: 0.5px;
}
.text-primary { color: #006837 !important; }
</style>