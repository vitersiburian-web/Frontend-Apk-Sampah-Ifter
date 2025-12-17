<template>
  <q-page class="q-pa-md bg-green-1">
    <div class="q-mb-md text-h6 text-weight-bold text-primary">Form Pengambilan Sampah</div>
    
    <q-card flat class="rounded-borders q-mb-xl q-pa-md card-form">
      
      <div class="row justify-end items-center q-mb-md">
        <q-btn icon="event" label="19 oct 2025" flat dense color="primary" class="text-weight-medium" />
      </div>

      <q-input outlined v-model="form.name" label="Nama:" class="q-mb-md input-field" />
      <q-input outlined v-model="form.address" label="Alamat:" class="q-mb-md input-field" />
      <q-input outlined v-model="form.bags" label="Jumlah Karung" type="number" class="q-mb-md input-field" min="1" />
      
      <div class="q-mb-lg input-field">
        <q-input outlined v-model="formattedTotalHarga" label="Total Harga" readonly prefix="Rp." />
      </div>

      <div class="text-subtitle1 text-weight-bold text-grey-8 q-mb-sm">Pilih Metode Pembayaran</div>
      <q-option-group
        v-model="form.paymentMethod"
        :options="paymentOptions"
        color="primary"
        type="radio"
        class="q-mb-xl payment-group"
      />
      
      <q-btn 
        label="Konfirmasi" 
        color="yellow-8" 
        text-color="black"
        unelevated 
        class="full-width text-weight-bold btn-konfirmasi"
        size="lg"
        @click="handleKonfirmasi"
      />
    </q-card>

    <q-dialog v-model="showQrisModal">
      <QrisModal :amount="formattedTotalHarga" @close="finalizeTransaction" />
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { addTask } from 'stores/taskStore'
import { useQuasar } from 'quasar'
import QrisModal from 'components/QrisModal.vue'

const $q = useQuasar()
const router = useRouter()

const showQrisModal = ref(false)

const form = ref({
  name: '',
  address: '',
  bags: 1,
  paymentMethod: 'cash'
})

const pricePerBag = 5000; 

const computedTotalHarga = computed(() => {
    return form.value.bags * pricePerBag;
})

const formattedTotalHarga = computed(() => {
    return computedTotalHarga.value.toLocaleString('id-ID'); 
})

const paymentOptions = [
  { label: 'Cash', value: 'cash' },
  { label: 'Qris', value: 'qris' }
]

const handleKonfirmasi = () => {
  if (!form.value.name || !form.value.address || form.value.bags <= 0) {
    $q.notify({
      color: 'negative',
      message: 'Semua field wajib diisi dengan benar!'
    })
    return
  }
  
  if (form.value.paymentMethod === 'qris') {
    showQrisModal.value = true;
  } else {
    finalizeTransaction();
  }
}

const finalizeTransaction = () => {
    addTask({
        name: form.value.name,
        address: form.value.address,
        bags: form.value.bags,
        paymentMethod: form.value.paymentMethod,
        total: computedTotalHarga.value.toString()
    });

    showQrisModal.value = false;
    $q.notify({
        color: 'positive',
        message: `Pengambilan sampah dari ${form.value.name} berhasil dicatat!`
    })
    
    form.value.name = '';
    form.value.address = '';
    form.value.bags = 1;
    router.push({ name: 'PetugasDashboard' })
}
</script>

<style scoped>
.q-page {
  background-color: #f1f8e9 !important; 
}
.text-primary {
  color: #006837 !important; 
}

.card-form {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.btn-konfirmasi {
    background: #FFC107; 
    border-radius: 12px;
    height: 50px;
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
</style>