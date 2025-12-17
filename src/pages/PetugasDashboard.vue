<template>
  <q-page class="q-pa-md bg-green-1">
    
    <q-card flat class="rounded-borders q-mb-md card-status">
      <q-card-section class="q-pb-sm">
        <div class="text-h6 text-weight-bold text-primary">Status Pengambilan Sampah</div>
      </q-card-section>

      <q-card-section class="q-pt-sm row justify-between items-center">
        <div class="text-subtitle1 text-grey-8">Hari Ini</div>
        <q-btn icon="event" :label="currentDate" flat dense color="primary" class="text-weight-medium" />
      </q-card-section>
      
      <q-separator />

      <q-list separator>
        <q-item
          v-for="task in todayTasks"
          :key="task.id"
          :class="{'bg-white': task.status === 'Belum diambil', 'bg-green-1': task.status === 'Sudah diambil'}"
          clickable 
          v-ripple 
          @click="task.status === 'Belum diambil' && goToForm()"
          class="q-py-md"
        >
          <q-item-section>
            <q-item-label class="text-weight-bold text-name-color">{{ task.name }}</q-item-label>
            <q-item-label caption>{{ task.address }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge 
              :color="task.status === 'Sudah diambil' ? 'green-7' : 'red-5'" 
              :label="task.status" 
            />
          </q-item-section>
        </q-item>
        
        <q-item v-if="todayTasks.length === 0" class="text-center text-grey-5 q-py-lg">
            <q-item-section>Tidak ada tugas hari ini.</q-item-section>
        </q-item>
        
      </q-list>
    </q-card>

    <q-card flat class="rounded-borders q-mb-xl card-map">
      <div class="map-placeholder">
        <q-icon name="place" size="xl" color="red" class="map-pin" />
      </div>
      
      <q-card-section class="q-pa-md bg-white">
        <q-btn 
          label="Pengambilan Sampah" 
          color="yellow-8" 
          text-color="black"
          unelevated 
          class="full-width text-weight-bold btn-ambil"
          size="lg"
          @click="goToForm"
        />
      </q-card-section>
    </q-card>
    
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { computed } from 'vue';
import { tasks } from 'stores/taskStore'
import { date } from 'quasar';

const router = useRouter()
const currentDate = '19 oct 2025' // Tanggal dummy sesuai Figma

const todayTasks = computed(() => {
    // Filter tasks untuk tanggal dummy 2025-10-19
    const filterDate = date.formatDate('2025-10-19', 'YYYY-MM-DD');
    return tasks.value.filter(task => date.formatDate(task.date, 'YYYY-MM-DD') === filterDate);
});

const goToForm = () => {
  router.push({ name: 'FormPengambilanSampah' })
}
</script>

<style scoped>
.q-page {
  background-color: #f1f8e9 !important;
}

.rounded-borders {
  border-radius: 16px;
}

.text-primary {
  color: #006837 !important;
}

.text-name-color {
  color: #1a237e !important;
}

.q-badge {
  padding: 6px 10px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 11px;
}

.card-status, .card-map {
    border-radius: 16px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.map-placeholder {
    height: 200px;
    background-color: #E6EE9C; 
    position: relative;
    border-radius: 16px 16px 0 0;
    overflow: hidden;
    /* Simulasi Peta dengan Pin di area Cimahi/Bandung */
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><text x="10%" y="80%" font-size="14" font-family="Arial" fill="#555">Cimahi</text><text x="70%" y="30%" font-size="14" font-family="Arial" fill="#555">Bandung</text></svg>');
    background-repeat: no-repeat;
    background-position: center;
}

.map-pin {
    position: absolute;
    top: 50%;
    left: 45%; 
    transform: translate(-50%, -50%);
}

.btn-ambil {
  background: #FFC107; 
  border-radius: 12px; 
  height: 50px;
}
</style>