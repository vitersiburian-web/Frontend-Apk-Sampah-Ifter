<template>
  <q-page class="q-pa-md bg-green-1">
    <div class="text-h6 text-weight-bold text-primary q-mb-sm">Pendapatan</div>
    <div class="text-caption text-grey-7 q-mb-md">Lihat total pendapatan dan aktivitas kerja berdasarkan tanggal.</div>
    
    <q-card flat class="q-pa-sm q-mb-lg date-card" @click="showDatePicker = true">
      <div class="row items-center justify-between cursor-pointer">
        <div class="text-subtitle1 text-grey-8">{{ formattedDate }}</div>
        <q-icon name="event" color="primary" size="sm" />
      </div>
    </q-card>

    <q-dialog v-model="showDatePicker">
      <q-date v-model="selectedDateModel" mask="DD MMM YYYY" />
    </q-dialog>

    <q-card flat class="q-pa-md detail-card">
      <q-list separator>
        <q-item-label header class="text-weight-bold text-grey-9">Rincian Komisi</q-item-label>

        <q-item v-for="task in filteredIncomeTasks" :key="task.id" class="q-py-sm">
          <q-item-section>
            <q-item-label class="text-weight-medium">{{ task.name }}</q-item-label>
            <q-item-label caption>{{ task.bags }} karung • {{ task.payment }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="text-weight-bold text-green-8">Rp. {{ task.amount.toLocaleString('id-ID') }}</div>
          </q-item-section>
          <q-item-section side>
            <q-icon name="check_circle" color="green-8" size="xs" />
          </q-item-section>
        </q-item>

        <q-item v-if="filteredIncomeTasks.length === 0" class="text-center text-grey-5 q-py-lg">
            <q-item-section>Tidak ada pendapatan tercatat pada tanggal ini.</q-item-section>
        </q-item>
      </q-list>
      
      <q-separator class="q-my-md" />

      <div class="q-pa-sm">
        <div class="row justify-between q-mb-sm">
          <div>Total Pendapatan :</div>
          <div class="text-weight-bold">Rp. {{ totalIncome.toLocaleString('id-ID') }}</div>
        </div>
        <div class="row justify-between q-mb-md">
          <div class="text-green-8">Bonus :</div>
          <div class="text-weight-bold text-green-8">Rp. {{ bonus.toLocaleString('id-ID') }}</div>
        </div>
        
        <q-separator class="q-my-sm" />

        <div class="row justify-between text-h6 text-weight-bold text-primary">
          <div>Total Akhir :</div>
          <div>Rp. {{ totalAkhir.toLocaleString('id-ID') }}</div>
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import { date } from 'quasar';
import { tasks } from 'stores/taskStore';

// Default tanggal yang dipilih
const selectedDateModel = ref('19 Oct 2025'); 
const showDatePicker = ref(false);
const bonus = 2500;

const formattedDate = computed(() => {
    return selectedDateModel.value;
});

const filteredIncomeTasks = computed(() => {
    const filterDate = date.formatDate(selectedDateModel.value, 'YYYY-MM-DD');
    // Hanya menampilkan tugas yang sudah lunas
    return tasks.value.filter(task => 
        date.formatDate(task.date, 'YYYY-MM-DD') === filterDate && 
        task.status === 'Sudah diambil' && 
        task.amount > 0
    );
});

const totalIncome = computed(() => {
    return filteredIncomeTasks.value.reduce((sum, task) => sum + task.amount, 0);
});

const totalAkhir = computed(() => {
    return totalIncome.value + bonus;
});
</script>

<style scoped>
.q-page {
  background-color: #f1f8e9 !important;
}
.text-primary {
  color: #006837 !important;
}
.text-green-8 {
    color: #4CAF50 !important;
}

.date-card, .detail-card {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
</style>