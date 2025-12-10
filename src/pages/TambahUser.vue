<template>
  <q-page class="q-pa-md bg-green-1">
    
    <div class="row q-mb-md">
      <q-btn-toggle
        v-model="dataType"
        toggle-color="primary"
        color="white"
        text-color="primary"
        :options="[
          { label: 'Data Petugas', value: 'petugas', to: { name: 'TambahPetugas' } },
          { label: 'Data User', value: 'user' }
        ]"
        unelevated
        spread
        class="rounded-toggle"
      />
    </div>

    <q-card flat class="form-card q-pa-md">
        <div class="text-subtitle1 text-grey-8 q-mb-lg text-weight-bold">Masukkan data user</div>

        <q-input outlined v-model="form.name" label="Nama" class="q-mb-md input-field" />
        <q-input outlined v-model="form.phone" label="No Telepon" type="tel" class="q-mb-md input-field" />
        <q-input outlined v-model="form.address" label="Alamat" type="textarea" autogrow class="q-mb-xl input-field" />

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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { addUser } from 'stores/adminStore';
import { useQuasar } from 'quasar';

const router = useRouter();
const $q = useQuasar();
const dataType = ref('user'); 
const form = ref({
    name: '',
    phone: '',
    address: ''
});

const submitForm = () => {
    if (!form.value.name || !form.value.phone || !form.value.address) {
        $q.notify({ message: 'Semua field wajib diisi!', color: 'negative' });
        return;
    }

    addUser({
        name: form.value.name,
        phone: form.value.phone,
        address: form.value.address
    });

    $q.notify({ message: `User ${form.value.name} berhasil ditambahkan.`, color: 'positive' });
    router.push({ name: 'DataUser' });
};
</script>

<style scoped>
.q-page {
  background-color: #f1f8e9 !important;
}
.rounded-toggle {
    border-radius: 12px;
    border: 1px solid #006837;
}
.form-card {
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.rounded-btn {
    border-radius: 12px;
    height: 48px;
}
.input-field :deep(.q-field__control) {
    background-color: white;
    border-radius: 12px;
}
</style>