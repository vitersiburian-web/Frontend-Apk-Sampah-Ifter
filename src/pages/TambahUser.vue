<template>
  <q-page class="q-pa-md bg-green-1">
    <!-- Toggle -->
    <div class="row q-mb-md">
      <q-btn-toggle
        v-model="dataType"
        toggle-color="primary"
        color="white"
        text-color="primary"
        :options="[
          { label: 'Data Petugas', value: 'petugas', to: { name: 'TambahPetugas' } },
          { label: 'Data User', value: 'user' },
        ]"
        unelevated
        spread
        class="rounded-toggle"
      />
    </div>

    <q-card flat class="form-card q-pa-md">
      <!-- ========================= -->
      <!--  BAGIAN 1 — DATA AKUN     -->
      <!-- ========================= -->
      <div class="text-subtitle1 text-grey-8 q-mb-md text-weight-bold">Data Akun</div>

      <q-input outlined v-model="form.username" label="Username" class="q-mb-md input-field" />
      <q-input
        outlined
        v-model="form.password"
        type="password"
        label="Password"
        class="q-mb-md input-field"
      />
      <q-input
        outlined
        v-model="form.confirmPassword"
        type="password"
        label="Konfirmasi Password"
        class="q-mb-xl input-field"
      />

      <!-- ========================= -->
      <!--  BAGIAN 2 — DATA WARGA    -->
      <!-- ========================= -->
      <div class="text-subtitle1 text-grey-8 q-mb-md text-weight-bold">Data Warga</div>

      <q-input outlined v-model="form.nama_warga" label="Nama Warga" class="q-mb-md input-field" />

      <div class="row q-col-gutter-sm q-mb-md">
        <div class="col-6">
          <q-input outlined v-model="form.rt" label="RT" class="input-field" />
        </div>
        <div class="col-6">
          <q-input outlined v-model="form.rw" label="RW" class="input-field" />
        </div>
      </div>

      <q-input
        outlined
        v-model="form.lokasi"
        label="Detail Lokasi"
        autogrow
        type="textarea"
        class="q-mb-xl input-field"
      />

      <!-- ========================= -->
      <!--  BAGIAN 3 — PIN LOKASI    -->
      <!-- ========================= -->
      <div class="text-subtitle1 text-grey-8 q-mb-md text-weight-bold">Pilih Lokasi di Map</div>

      <div id="map" class="map-box q-mb-md"></div>

      <q-input
        outlined
        v-model="form.latitude"
        label="Latitude"
        class="q-mb-md input-field"
        readonly
      />
      <q-input
        outlined
        v-model="form.longitude"
        label="Longitude"
        class="q-mb-xl input-field"
        readonly
      />

      <!-- BUTTON -->
      <div class="row q-gutter-sm justify-center">
        <q-btn
          label="Tambah"
          color="yellow-8"
          text-color="black"
          unelevated
          @click="submitForm"
          class="col rounded-btn text-weight-bold"
        />

        <q-btn
          label="Cancel"
          color="red-5"
          text-color="white"
          unelevated
          @click="router.back()"
          class="col rounded-btn text-weight-bold"
        />
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import axios from 'axios'

const router = useRouter()
const $q = useQuasar()
const dataType = ref('user')

const form = ref({
  username: '',
  password: '',
  confirmPassword: '',
  nama_warga: '',
  rt: '',
  rw: '',
  lokasi: '',
  latitude: '',
  longitude: '',
})

let map, marker

// =======================
// MAP PICKER
// =======================
onMounted(() => {
  map = L.map('map').setView([-6.9175, 107.6191], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map)

  map.on('click', (e) => {
    const { lat, lng } = e.latlng
    form.value.latitude = lat
    form.value.longitude = lng

    if (marker) {
      marker.setLatLng(e.latlng)
    } else {
      marker = L.marker(e.latlng).addTo(map)
    }
  })
})

// =======================
// SUBMIT
// =======================
const submitForm = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    $q.notify({ message: 'Password tidak sama!', color: 'red' })
    return
  }

  if (!form.value.latitude || !form.value.longitude) {
    $q.notify({ message: 'Silahkan pilih lokasi di map!', color: 'red' })
    return
  }

  try {
    const lokasi_gabungan = `RT ${form.value.rt} / RW ${form.value.rw}`

    const payload = {
      username: form.value.username,
      password: form.value.password,
      nama_warga: form.value.nama_warga,
      rt: form.value.rt,
      rw: form.value.rw,
      lokasi: lokasi_gabungan,
      latitude: form.value.latitude,
      longitude: form.value.longitude,
    }

    const res = await axios.post('http://localhost:5000/api/warga/create', payload)

    if (res.data.success) {
      $q.notify({ message: 'Berhasil menambahkan user!', color: 'positive' })
      router.push({ name: 'DataUser' })
    }
  } catch {
    $q.notify({ message: 'Gagal menambahkan user!', color: 'negative' })
  }
}
</script>

<style scoped>
.map-box {
  width: 100%;
  height: 250px;
  border-radius: 12px;
  overflow: hidden;
}

.form-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.rounded-toggle {
  border-radius: 12px;
}

.input-field :deep(.q-field__control) {
  background-color: white;
  border-radius: 12px;
}
</style>
