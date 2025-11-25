<template>
  <q-page class="bg-grey-2">
    <div class="q-pa-md">
      <!-- Header -->
      <div class="text-h5 text-weight-bold q-mb-md text-dark-green">Riwayat Pengambilan Sampah</div>

      <!-- Pilih Bulan -->
      <!-- Dropdown Pilih Bulan -->
      <q-select
        v-model="bulanDipilih"
        :options="opsiBulan"
        label="Pilih Bulan"
        filled
        dense
        emit-value
        map-options
        clearable
        use-chips
        input-debounce="0"
        :popup-content-style="{ maxHeight: '260px' }"
        class="q-mb-lg shadow-1 rounded-lg"
      >
        <template v-slot:prepend>
          <q-icon name="event" color="primary" />
        </template>

        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section>
              <q-item-label class="text-weight-medium">
                {{ scope.opt.label }}
              </q-item-label>
            </q-item-section>

            <q-item-section side v-if="bulanAdaRiwayat.has(scope.opt.value)">
              <q-icon name="check_circle" color="green" />
            </q-item-section>
          </q-item>
        </template>
      </q-select>

      <!-- List Riwayat Dinamis -->
      <div v-if="riwayatTerseleksi.length > 0">
        <div class="text-subtitle1 text-weight-bold q-mb-sm">
          {{ tampilJudulBulan }}
        </div>

        <q-card v-for="item in riwayatTerseleksi" :key="item.id" flat class="riwayat-card q-mb-md">
          <q-card-section class="row items-center">
            <!-- Icon Status -->
            <div class="col-auto">
              <q-icon
                :name="item.status === 'selesai' ? 'check_circle' : 'warning'"
                :color="item.status === 'selesai' ? 'green' : 'orange'"
                size="32px"
              />
            </div>

            <!-- Info -->
            <div class="col q-ml-md">
              <div class="text-subtitle2 text-weight-bold">
                {{ item.status === 'selesai' ? 'Pengambilan selesai' : 'Pengambilan tertunda' }}
              </div>

              <div class="text-caption text-grey-7">
                {{ formatTanggal(item.tanggal) }} · {{ item.jumlah_karung }} Karung
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Jika Tidak Ada Data -->
      <div v-else class="text-center text-grey-6 q-mt-xl">Tidak ada riwayat untuk bulan ini.</div>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { api } from 'boot/axios'

export default {
  name: 'UserRiwayat',

  setup() {
    const bulanDipilih = ref(null)
    const opsiBulan = ref([])
    const semuaRiwayat = ref([])
    const bulanAdaRiwayat = new Set()

    /* -------------------------------------------------------
       Generate 12 Bulan satu tahun
       (otomatis ambil tahun dari data pertama)
    ------------------------------------------------------- */
    const generate12Bulan = (tahun) => {
      const namaBulan = [
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember',
      ]

      return namaBulan.map((b, index) => {
        const bulan = String(index + 1).padStart(2, '0')
        return {
          label: `${b} ${tahun}`,
          value: `${tahun}-${bulan}`,
        }
      })
    }

    /* -------------------------------------------------------
       Fetch data riwayat
    ------------------------------------------------------- */
    const loadRiwayat = async () => {
      try {
        const id_user = localStorage.getItem('user_id')
        const warga = await api.get(`/warga/by-user/${id_user}`)
        const id_warga = warga.data.data.id

        const riwayat = await api.get('/riwayat', {
          params: { id_warga },
        })

        semuaRiwayat.value = riwayat.data.data

        if (semuaRiwayat.value.length > 0) {
          const tahunPertama = new Date(semuaRiwayat.value[0].tanggal).getFullYear()

          // Buat dropdown 12 bulan
          opsiBulan.value = generate12Bulan(tahunPertama)

          // Cek bulan mana yang punya riwayat
          semuaRiwayat.value.forEach((item) => {
            const d = new Date(item.tanggal)
            const bulan = String(d.getMonth() + 1).padStart(2, '0')
            const tahun = d.getFullYear()
            bulanAdaRiwayat.add(`${tahun}-${bulan}`)
          })

          // Default select bulan saat ini
          const bulanNow = String(new Date().getMonth() + 1).padStart(2, '0')
          bulanDipilih.value = `${tahunPertama}-${bulanNow}`
        }
      } catch (err) {
        console.error('Gagal mengambil riwayat:', err)
      }
    }

    /* -------------------------------------------------------
       Filter data berdasarkan bulan
    ------------------------------------------------------- */
    const riwayatTerseleksi = computed(() => {
      if (!bulanDipilih.value) return []
      return semuaRiwayat.value.filter((item) => {
        const d = new Date(item.tanggal)
        const bulan = String(d.getMonth() + 1).padStart(2, '0')
        const tahun = d.getFullYear()
        return `${tahun}-${bulan}` === bulanDipilih.value
      })
    })

    const tampilJudulBulan = computed(() => {
      if (!bulanDipilih.value) return ''
      const [tahun, bulan] = bulanDipilih.value.split('-')
      const namaBulan = [
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember',
      ]
      return `${namaBulan[Number(bulan) - 1]} ${tahun}`
    })

    /* -------------------------------------------------------
       Formatter tanggal
    ------------------------------------------------------- */
    const formatTanggal = (tanggal) => {
      const d = new Date(tanggal)
      const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
      return `${hari[d.getDay()]}, ${d.getDate()}`
    }

    onMounted(() => {
      loadRiwayat()
    })

    return {
      bulanDipilih,
      opsiBulan,
      riwayatTerseleksi,
      tampilJudulBulan,
      formatTanggal,
      bulanAdaRiwayat,
    }
  },
}
</script>

<style scoped>
.q-select {
  border-radius: 12px !important;
}

.riwayat-card {
  border-radius: 12px;
  border-left: 4px solid #4caf50;
}
</style>
