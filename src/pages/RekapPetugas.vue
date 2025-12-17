<template>
  <q-page class="q-pa-md bg-green-1">
    <div class="text-h6 text-weight-bold text-primary q-mb-md">Rekap Pengambilan Sampah</div>
    
    <q-card flat class="q-pa-sm q-mb-md date-card" @click="showDatePicker = true">
      <div class="row items-center justify-between cursor-pointer">
        <div class="text-subtitle1 text-grey-8">{{ formattedDate }}</div>
        <q-icon name="event" color="primary" size="sm" />
      </div>
    </q-card>

    <q-dialog v-model="showDatePicker">
      <q-date v-model="selectedDateModel" mask="DD MMM YYYY" />
    </q-dialog>

    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-4">
        <q-card flat class="summary-card bg-white text-center">
          <q-icon name="paid" color="blue-8" size="md" class="q-mb-xs" />
          <div class="text-subtitle2 text-weight-bold text-blue-8">Rp. {{ summary.income }}</div>
          <div class="text-caption text-grey-7">Pemasukan hari ini</div>
        </q-card>
      </div>
      <div class="col-4">
        <q-card flat class="summary-card bg-white text-center">
          <q-icon name="error" color="red-8" size="md" class="q-mb-xs" />
          <div class="text-subtitle2 text-weight-bold text-red-8">{{ summary.pending }}</div>
          <div class="text-caption text-grey-7">Total nunggak</div>
        </q-card>
      </div>
      <div class="col-4">
        <q-card flat class="summary-card bg-white text-center">
          <q-icon name="assignment" color="teal-8" size="md" class="q-mb-xs" />
          <div class="text-subtitle2 text-weight-bold text-teal-8">{{ summary.totalTasks }}</div>
          <div class="text-caption text-grey-7">Pengambilan sampah</div>
        </q-card>
      </div>
    </div>

    <q-card flat class="q-pa-sm q-mb-lg detail-card">
      <q-list separator>
        <q-item-label header class="text-weight-bold text-grey-9">Detail Transaksi</q-item-label>
        
        <q-item class="bg-grey-2 text-weight-bold text-caption">
          <q-item-section>Nama</q-item-section>
          <q-item-section>Jumlah karung</q-item-section>
          <q-item-section>Pembayaran</q-item-section>
          <q-item-section side>Status</q-item-section>
        </q-item>
        
        <q-item v-for="task in filteredCompletedTasks" :key="task.id" class="q-py-sm">
          <q-item-section>{{ task.name }}</q-item-section>
          <q-item-section>{{ task.bags }}</q-item-section>
          <q-item-section>{{ task.payment }}</q-item-section>
          <q-item-section side>
            <q-badge :color="task.payment === 'Nunggak' ? 'red-5' : 'green-7'" :label="task.payment === 'Nunggak' ? 'Nunggak' : 'Lunas'" />
          </q-item-section>
        </q-item>

        <q-item v-if="filteredCompletedTasks.length === 0" class="text-center text-grey-5">
            <q-item-section>Tidak ada data rekap pada tanggal ini.</q-item-section>
        </q-item>
        
      </q-list>
    </q-card>
    
    <q-btn 
      label="Pengambilan Sampah" 
      color="yellow-8" 
      text-color="black"
      unelevated 
      class="full-width text-weight-bold btn-form"
      size="lg"
      @click="goToForm"
    />
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { date } from 'quasar';
import { tasks } from 'stores/taskStore';

const router = useRouter();

// Default tanggal yang dipilih
// Menggunakan string "DD MMM YYYY" agar sesuai dengan tampilan Quasar Date format
const selectedDateModel = ref('19 Oct 2025'); 
const showDatePicker = ref(false);

const goToForm = () => {
  router.push({ name: 'FormPengambilanSampah' });
};

const formattedDate = computed(() => {
    return selectedDateModel.value;
});

const filteredTasks = computed(() => {
    // Format tanggal terpilih ke YYYY-MM-DD untuk filtering data store
    const filterDate = date.formatDate(selectedDateModel.value, 'YYYY-MM-DD');
    return tasks.value.filter(task => date.formatDate(task.date, 'YYYY-MM-DD') === filterDate);
});

const filteredCompletedTasks = computed(() => {
    // Tugas yang sudah selesai dan akan muncul di tabel rekap
    return filteredTasks.value.filter(task => task.status === 'Sudah diambil' || task.payment === 'Nunggak'); 
});

const summary = computed(() => {
    const completedTasks = filteredCompletedTasks.value;
    
    // Total Pemasukan (hanya yang lunas/Cash/Transfer)
    const income = completedTasks.filter(t => t.payment !== 'Nunggak').reduce((sum, task) => sum + task.amount, 0);
    
    // Total Nunggak (Simulasi: hitung yang payment-nya Nunggak)
    const pending = completedTasks.filter(task => task.payment === 'Nunggak').length;

    return {
        income: income.toLocaleString('id-ID'),
        pending: pending,
        totalTasks: completedTasks.length
    };
});
</script>

<style scoped>
.q-page {
  background-color: #f1f8e9 !important;
}
.text-primary {
  color: #006837 !important;
}

.date-card, .summary-card, .detail-card {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.summary-card {
    padding: 12px 6px;
}

.btn-form {
    background: #FFC107; 
    border-radius: 12px;
}
</style>