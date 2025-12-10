<template>
  <q-page class="q-pa-md bg-green-1">
    
    <div class="text-caption text-grey-7 q-mb-md">Kelola dan pantau arus kas pendapatan dan pengeluaran.</div>
    
    <q-card flat class="q-pa-sm q-mb-lg date-card" @click="showDatePicker = true">
      <div class="row items-center justify-between cursor-pointer">
        <div class="text-subtitle1 text-grey-8">{{ formattedDate }}</div>
        <q-icon name="event" color="primary" size="sm" />
      </div>
    </q-card>

    <q-dialog v-model="showDatePicker">
      <q-date v-model="selectedDateModel" mask="DD MMM YYYY" />
    </q-dialog>

    <q-card flat class="balance-card bg-primary text-white q-mb-lg">
        <q-card-section>
            <div class="text-subtitle2">Saldo Aktif Kas Utama</div>
            <div class="text-h4 text-weight-bold">Rp {{ currentBalance.toLocaleString('id-ID') }}</div>
        </q-card-section>
        <q-icon name="account_balance_wallet" size="xl" class="wallet-icon" />
    </q-card>

    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-6">
        <q-card flat class="summary-card bg-white text-center shadow-2">
          <q-icon name="trending_up" color="green-7" size="sm" class="q-mb-xs" />
          <div class="text-h6 text-weight-bold text-green-8">Rp {{ summary.income.toLocaleString('id-ID') }}</div>
          <div class="text-caption text-grey-7">Pemasukan Hari Ini</div>
        </q-card>
      </div>
      <div class="col-6">
        <q-card flat class="summary-card bg-white text-center shadow-2">
          <q-icon name="trending_down" color="red-7" size="sm" class="q-mb-xs" />
          <div class="text-h6 text-weight-bold text-red-8">Rp {{ summary.expense.toLocaleString('id-ID') }}</div>
          <div class="text-caption text-grey-7">Pengeluaran Hari Ini</div>
        </q-card>
      </div>
    </div>
    
    <q-card flat class="chart-card q-mb-md">
      <q-card-section class="q-pb-none">
        <div class="text-subtitle1 text-weight-bold text-primary">Tren Saldo Mingguan</div>
      </q-card-section>
      <q-card-section class="chart-area bg-white text-center">
        <div class="chart-visual chart-line-glow">
            <svg viewBox="0 0 100 50" class="chart-svg">
                <polyline 
                    class="chart-line-glow-primary" 
                    fill="none" 
                    stroke="#006837" 
                    stroke-width="3" 
                    points="0,45 14,35 28,40 42,25 56,15 70,10 84,5 100,10"
                />
                <polygon fill="rgba(0, 104, 55, 0.2)" points="0,50 0,45 14,35 28,40 42,25 56,15 70,10 84,5 100,10 100,50" />
            </svg>
            <div class="text-caption text-grey-6 q-mt-sm">Total Saldo Naik 8% dalam 7 Hari</div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat class="q-pa-md detail-card">
        <div class="text-weight-bold text-grey-9 q-mb-md">Detail Transaksi Hari Ini ({{ filteredTransactions.length }})</div>
        
        <div v-if="filteredTransactions.length === 0" class="text-center text-grey-5 q-py-md">
            Tidak ada transaksi tercatat pada tanggal ini.
        </div>
        
        <q-list separator v-else>
            <q-item v-for="item in filteredTransactions" :key="item.id" class="q-py-sm transaction-item">
                <q-item-section avatar>
                    <q-avatar :icon="item.type === 'Pemasukan' ? 'arrow_downward' : 'arrow_upward'" 
                              :color="item.type === 'Pemasukan' ? 'green-1' : 'red-1'" 
                              :text-color="item.type === 'Pemasukan' ? 'green-8' : 'red-8'" />
                </q-item-section>
                <q-item-section>
                    <q-item-label class="text-weight-medium">{{ item.desc }}</q-item-label>
                    <q-item-label caption class="text-status">{{ item.source }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                    <div class="text-right">
                        <div :class="item.type === 'Pemasukan' ? 'text-green-8' : 'text-red-8'" class="text-weight-bold text-lg">
                            {{ item.type === 'Pemasukan' ? '+' : '-' }} Rp {{ item.amount.toLocaleString('id-ID') }}
                        </div>
                        <q-chip :color="item.status === 'Lunas' ? 'green' : 'red'" square dense text-color="white" size="xs" class="q-mt-xs status-chip">
                            {{ item.status }}
                        </q-chip>
                    </div>
                </q-item-section>
            </q-item>
        </q-list>
    </q-card>
    
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import { date } from 'quasar';
import { riwayatAdminList, currentBalance } from 'stores/adminStore';

const selectedDateModel = ref(date.formatDate(Date.now(), 'DD MMM YYYY')); 
const showDatePicker = ref(false);

const formattedDate = computed(() => {
    return selectedDateModel.value;
});

const filteredTransactions = computed(() => {
    const today = date.formatDate(selectedDateModel.value, 'YYYY-MM-DD');
    return riwayatAdminList.value.filter(item => 
        date.formatDate(item.date, 'YYYY-MM-DD') === today && 
        item.type !== 'Aktivitas'
    );
});

const summary = computed(() => {
    const today = date.formatDate(selectedDateModel.value, 'YYYY-MM-DD');
    const todayItems = riwayatAdminList.value.filter(item => 
        date.formatDate(item.date, 'YYYY-MM-DD') === today && item.type !== 'Aktivitas'
    );
    
    const income = todayItems
        .filter(item => item.type === 'Pemasukan')
        .reduce((sum, item) => sum + item.amount, 0);
        
    const expense = todayItems
        .filter(item => item.type === 'Pengeluaran')
        .reduce((sum, item) => sum + item.amount, 0);

    return { income, expense };
});
</script>

<style scoped>
/* Style KeuanganAdmin.vue */
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
.balance-card {
    background: linear-gradient(135deg, #006837 0%, #008749 100%) !important;
    border-radius: 16px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 8px 18px rgba(0, 104, 55, 0.4);
}
.wallet-icon {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0.2;
}
.summary-card {
    padding: 15px 10px;
    border-radius: 12px;
}
.detail-card {
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.text-green-8 { color: #2E7D32; }
.text-red-8 { color: #C62828; }

/* Grafik */
.chart-card {
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); 
}
.chart-area {
  min-height: 150px;
  padding: 15px;
  background: linear-gradient(145deg, #f0fdf4, #ffffff); 
  border-radius: 0 0 16px 16px;
}
.chart-visual {
    width: 100%; 
    height: 100px;
}
.chart-svg {
    width: 100%;
    height: 100%;
    overflow: visible;
}
.chart-line-glow-primary {
    filter: drop-shadow(0 0 5px rgba(0, 104, 55, 0.6));
}
.transaction-item {
    transition: background-color 0.2s;
}
.transaction-item:hover {
    background-color: #f5f5f5;
}
.text-lg { font-size: 16px; }
.status-chip {
    min-width: 50px;
    text-align: center;
}
</style>