<!-- src/pages/GajiAdmin.vue -->
<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-lg">
      <q-btn
        flat
        round
        icon="arrow_back"
        color="primary"
        @click="$router.back()"
        class="bg-white shadow-1"
      />
      <div class="q-ml-md">
        <div class="text-h6 text-weight-bold text-primary">Manajemen Gaji</div>
        <div class="text-caption text-grey-7">Kelola gaji petugas dan penggajian</div>
      </div>
    </div>

    <!-- Statistik Gaji -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card
          class="text-center q-pa-md"
          style="background: linear-gradient(135deg, #006837, #4caf50); color: white"
        >
          <div class="text-h5 text-weight-bold">{{ formatCurrency(totalGaji) }}</div>
          <div class="text-caption">Total Pengeluaran Gaji</div>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="text-center q-pa-md bg-blue-1">
          <div class="text-h5 text-weight-bold text-blue-9">{{ jumlahPetugas }}</div>
          <div class="text-caption">Jumlah Petugas</div>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="text-center q-pa-md bg-green-1">
          <div class="text-h5 text-weight-bold text-green-9">{{ formatCurrency(rataGaji) }}</div>
          <div class="text-caption">Rata-rata Gaji</div>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="text-center q-pa-md bg-orange-1">
          <div class="text-h5 text-weight-bold text-orange-9">{{ gajiTertunda }}</div>
          <div class="text-caption">Gaji Tertunda</div>
        </q-card>
      </div>
    </div>

    <!-- Tabel Daftar Gaji -->
    <q-card class="q-pa-md q-mb-lg">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6 text-weight-bold">Daftar Gaji Petugas</div>
        <q-btn color="primary" icon="add" label="Tambah Gaji" @click="tambahGaji" />
      </div>

      <q-table
        :rows="daftarGaji"
        :columns="columnsGaji"
        row-key="id"
        flat
        bordered
        :pagination="{ rowsPerPage: 10 }"
      >
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge
              :color="
                props.row.status === 'terbayar'
                  ? 'green'
                  : props.row.status === 'pending'
                    ? 'orange'
                    : 'red'
              "
              :label="props.row.status"
              rounded
            />
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props" align="center">
            <q-btn flat round dense icon="visibility" color="primary" size="sm" class="q-mr-xs" />
            <q-btn flat round dense icon="edit" color="warning" size="sm" />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- History Pembayaran -->
    <q-card class="q-pa-md">
      <div class="text-h6 text-weight-bold q-mb-md">Riwayat Pembayaran</div>
      <q-timeline color="primary">
        <q-timeline-entry
          v-for="item in riwayatPembayaran"
          :key="item.id"
          :title="item.nama_petugas"
          :subtitle="formatDate(item.tanggal)"
          :icon="item.status === 'terbayar' ? 'check_circle' : 'schedule'"
          :color="item.status === 'terbayar' ? 'green' : 'orange'"
        >
          <div>
            <div class="text-weight-medium">{{ formatCurrency(item.jumlah) }}</div>
            <div class="text-caption">{{ item.keterangan }}</div>
          </div>
        </q-timeline-entry>
      </q-timeline>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Data dummy untuk contoh
const totalGaji = ref(12500000)
const jumlahPetugas = ref(15)
const rataGaji = ref(computed(() => totalGaji.value / jumlahPetugas.value))
const gajiTertunda = ref(3)

const daftarGaji = ref([
  {
    id: 1,
    nama_petugas: 'Budi Santoso',
    gaji_pokok: 2500000,
    tunjangan: 500000,
    total: 3000000,
    status: 'terbayar',
    bulan: 'Desember 2024',
  },
  {
    id: 2,
    nama_petugas: 'Siti Aminah',
    gaji_pokok: 2300000,
    tunjangan: 450000,
    total: 2750000,
    status: 'terbayar',
    bulan: 'Desember 2024',
  },
  {
    id: 3,
    nama_petugas: 'Ahmad Rizki',
    gaji_pokok: 2400000,
    tunjangan: 400000,
    total: 2800000,
    status: 'pending',
    bulan: 'Januari 2025',
  },
  {
    id: 4,
    nama_petugas: 'Dewi Lestari',
    gaji_pokok: 2200000,
    tunjangan: 300000,
    total: 2500000,
    status: 'tertunda',
    bulan: 'Januari 2025',
  },
])

const riwayatPembayaran = ref([
  {
    id: 1,
    nama_petugas: 'Budi Santoso',
    jumlah: 3000000,
    tanggal: '2024-12-25',
    status: 'terbayar',
    keterangan: 'Gaji Desember 2024',
  },
  {
    id: 2,
    nama_petugas: 'Siti Aminah',
    jumlah: 2750000,
    tanggal: '2024-12-25',
    status: 'terbayar',
    keterangan: 'Gaji Desember 2024',
  },
  {
    id: 3,
    nama_petugas: 'Ahmad Rizki',
    jumlah: 2800000,
    tanggal: '2024-11-25',
    status: 'terbayar',
    keterangan: 'Gaji November 2024',
  },
])

const columnsGaji = [
  { name: 'nama_petugas', label: 'Nama Petugas', field: 'nama_petugas', align: 'left' },
  {
    name: 'gaji_pokok',
    label: 'Gaji Pokok',
    field: 'gaji_pokok',
    align: 'left',
    format: (val) => formatCurrency(val),
  },
  {
    name: 'tunjangan',
    label: 'Tunjangan',
    field: 'tunjangan',
    align: 'left',
    format: (val) => formatCurrency(val),
  },
  {
    name: 'total',
    label: 'Total',
    field: 'total',
    align: 'left',
    format: (val) => formatCurrency(val),
  },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'bulan', label: 'Periode', field: 'bulan', align: 'left' },
  { name: 'actions', label: 'Aksi', align: 'center' },
]

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const tambahGaji = () => {
  $q.notify({
    type: 'info',
    message: 'Fitur tambah gaji akan segera tersedia',
    position: 'top',
    timeout: 2000,
  })
}
</script>
