<template>
  <q-page class="q-pa-md bg-green-1">
 
    <div class="text-caption text-grey-7 q-mb-md">Daftar lengkap riwayat aktivitas dan transaksi sistem.</div>
    
    <q-card flat class="q-pa-sm q-mb-md date-card" @click="showDatePicker = true">
      <div class="row items-center justify-between cursor-pointer">
        <div class="text-subtitle1 text-grey-8">{{ formattedDate }}</div>
        <q-icon name="event" color="primary" size="sm" />
      </div>
    </q-card>

    <q-dialog v-model="showDatePicker">
      <q-date v-model="selectedDateModel" mask="DD MMM YYYY" />
    </q-dialog>
    
    <div class="q-mb-md">
        <q-btn-toggle
            v-model="filterType"
            toggle-color="yellow-8"
            color="white"
            text-color="primary"
            :options="filterOptions"
            unelevated
            spread
            class="rounded-toggle-filter"
        />
    </div>

    <q-card flat class="q-pa-sm q-mb-lg detail-card">
        <q-list separator>
            <q-item-label header class="text-weight-bold text-grey-9">Log {{ filterType }} Harian ({{ filteredRiwayat.length }})</q-item-label>
            
            <q-item v-for="item in filteredRiwayat" :key="item.id" class="q-py-md riwayat-item">
                <q-item-section avatar>
                    <q-avatar :icon="getIcon(item.type)" 
                              :color="getColor(item.type) + '-1'" 
                              :text-color="getColor(item.type) + '-8'" />
                </q-item-section>
                <q-item-section>
                    <q-item-label class="text-weight-medium">{{ item.desc }}</q-item-label>
                    <q-item-label caption class="text-status">
                        <q-chip :color="item.type === 'Aktivitas' ? 'blue-2' : (item.type === 'Pemasukan' ? 'green-2' : 'red-2')" 
                                text-color="black" square dense size="xs" class="q-mr-xs">
                            {{ item.type }}
                        </q-chip>
                        <span v-if="item.amount > 0">
                            | {{ item.type === 'Pemasukan' ? '+' : '-' }} Rp {{ item.amount.toLocaleString('id-ID') }}
                        </span>
                    </q-item-label>
                </q-item-section>
                <q-item-section side>
                    <q-item-label caption class="text-right">{{ item.date }}</q-item-label>
                    <q-chip :color="item.status === 'Info' ? 'blue' : 'green'" text-color="white" square dense size="xs" class="q-mt-xs status-chip-side">
                        {{ item.status }}
                    </q-chip>
                </q-item-section>
            </q-item>
        </q-list>

        <div v-if="filteredRiwayat.length === 0" class="text-center text-grey-5 q-py-lg">
            Tidak ada riwayat aktivitas pada tanggal atau filter ini.
        </div>
    </q-card>
    
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import { date } from 'quasar';
import { riwayatAdminList } from 'stores/adminStore';

const selectedDateModel = ref(date.formatDate(Date.now(), 'DD MMM YYYY')); 
const showDatePicker = ref(false);
const filterType = ref('Semua'); 

const filterOptions = [
    { label: 'Semua', value: 'Semua' },
    { label: 'Transaksi', value: 'Transaksi' },
    { label: 'Aktivitas', value: 'Aktivitas' }
];

const formattedDate = computed(() => {
    return selectedDateModel.value;
});

const filteredRiwayat = computed(() => {
    const today = date.formatDate(selectedDateModel.value, 'YYYY-MM-DD');
    
    return riwayatAdminList.value.filter(item => {
        const isDateMatch = date.formatDate(item.date, 'YYYY-MM-DD') === today;
        
        let isTypeMatch = true;
        if (filterType.value === 'Transaksi') {
            isTypeMatch = item.type === 'Pemasukan' || item.type === 'Pengeluaran';
        } else if (filterType.value === 'Aktivitas') {
            isTypeMatch = item.type === 'Aktivitas';
        }
        
        return isDateMatch && isTypeMatch;
    });
});

const getIcon = (type) => {
    if (type === 'Pemasukan') return 'attach_money';
    if (type === 'Pengeluaran') return 'payment';
    if (type === 'Aktivitas') return 'info';
    return 'circle';
};

const getColor = (type) => {
    if (type === 'Pemasukan') return 'green';
    if (type === 'Pengeluaran') return 'red';
    if (type === 'Aktivitas') return 'blue';
    return 'grey';
};
</script>

<style scoped>
/* Style RiwayatAdmin.vue */
.q-page {
  background-color: #f1f8e9 !important;
}
.text-primary {
  color: #006837 !important;
}
.date-card {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    background: white;
}
.rounded-toggle-filter {
    border-radius: 12px;
    border: 1px solid #FFC107;
}
.detail-card {
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.riwayat-item {
    transition: transform 0.2s, box-shadow 0.2s;
}
.riwayat-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.text-status {
    font-size: 11px;
}
.status-chip-side {
    min-width: 50px;
}
</style>