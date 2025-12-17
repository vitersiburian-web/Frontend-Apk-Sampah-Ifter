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
      <!--  BAGIAN 2 — DATA PETUGAS  -->
      <!-- ========================= -->
      <div class="text-subtitle1 text-grey-8 q-mb-md text-weight-bold">Data Petugas</div>

      <q-input
        outlined
        v-model="form.nama_petugas"
        label="Nama Petugas"
        class="q-mb-md input-field"
      />
      <q-input outlined v-model="form.no_telp" label="No Telepon" class="q-mb-md input-field" />
      <div class="row q-col-gutter-sm q-mb-md">
        <div class="col-3">
          <q-input outlined v-model="form.rt" label="RT" class="input-field" />
        </div>
        <div class="col-3">
          <q-input outlined v-model="form.rw" label="RW" class="input-field" />
        </div>
        <div class="col-3">
          <q-input outlined v-model="form.no" label="No" class="input-field" />
        </div>
        <div class="col-3">
          <q-input outlined v-model="form.jalan" label="Nama Jalan" class="input-field" />
        </div>
      </div>

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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import axios from 'axios'

const router = useRouter()
const $q = useQuasar()
const dataType = ref('petugas')

const form = ref({
  username: '',
  password: '',
  confirmPassword: '',
  nama_petugas: '',
  no_telp: '',
  rt: '',
  rw: '',
  no: '',
  jalan: '',
})

const submitForm = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    $q.notify({ message: 'Password tidak sama!', color: 'red' })
    return
  }

  if (
    !form.value.username ||
    !form.value.password ||
    !form.value.nama_petugas ||
    !form.value.no_telp ||
    !form.value.rt ||
    !form.value.rw ||
    !form.value.no ||
    !form.value.jalan
  ) {
    $q.notify({ message: 'Semua field wajib diisi!', color: 'red' })
    return
  }

  try {
    const alamat_gabungan = `RT ${form.value.rt} / RW ${form.value.rw} - No. ${form.value.no} - ${form.value.jalan}`

    const payload = {
      username: form.value.username,
      password: form.value.password,
      nama_petugas: form.value.nama_petugas,
      no_telp: form.value.no_telp,
      alamat: alamat_gabungan,
    }

    const res = await axios.post('http://localhost:5000/api/petugas/create', payload)

    if (res.data.success) {
      $q.notify({ message: 'Berhasil menambahkan petugas!', color: 'positive' })
      router.push({ name: 'DataPetugas' })
    }
  } catch {
    $q.notify({ message: 'Gagal menambahkan petugas!', color: 'negative' })
  }
}
</script>

<style scoped>
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

.rounded-btn {
  border-radius: 12px;
  height: 48px;
}
</style>
