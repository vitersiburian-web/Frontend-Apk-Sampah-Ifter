<template>
  <q-page class="bg-grey-2">
    <div class="q-pa-md">
      <!-- Header -->
      <div class="text-h5 text-weight-bold q-mb-md text-dark-green">
        Riwayat Pengambilan Sampah
      </div>

      <!-- Filter Periode -->
      <div class="row q-mb-md">
        <div class="col">
          <q-btn-toggle
            v-model="periode"
            toggle-color="primary"
            :options="[
              { label: 'April 2025', value: 'april' },
              { label: 'Mei 2025', value: 'mei' }
            ]"
            unelevated
            spread
            class="periode-toggle"
          />
        </div>
      </div>

      <!-- Riwayat List April 2025 -->
      <div v-if="periode === 'april'">
        <div class="text-subtitle1 text-weight-bold q-mb-sm">April 2025</div>
        
        <q-card flat class="riwayat-card q-mb-md">
          <q-card-section class="row items-center">
            <div class="col-auto">
              <q-icon name="check_circle" color="green" size="32px" />
            </div>
            <div class="col q-ml-md">
              <div class="text-subtitle2 text-weight-bold">
                Pengambilan selesai
              </div>
              <div class="text-caption text-grey-7">
                Selasa, 15 April · 2 Karung
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat class="riwayat-card q-mb-md">
          <q-card-section class="row items-center">
            <div class="col-auto">
              <q-icon name="check_circle" color="green" size="32px" />
            </div>
            <div class="col q-ml-md">
              <div class="text-subtitle2 text-weight-bold">
                Pengambilan selesai
              </div>
              <div class="text-caption text-grey-7">
                Selasa, 8 April · 1 Karung
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat class="riwayat-card q-mb-md">
          <q-card-section class="row items-center">
            <div class="col-auto">
              <q-icon name="check_circle" color="green" size="32px" />
            </div>
            <div class="col q-ml-md">
              <div class="text-subtitle2 text-weight-bold">
                Pengambilan selesai
              </div>
              <div class="text-caption text-grey-7">
                Senin, 8 April · 1 Karung
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Riwayat List Mei 2025 -->
      <div v-if="periode === 'mei'">
        <div class="text-subtitle1 text-weight-bold q-mb-sm">Mei 2025</div>
        
        <q-card flat class="riwayat-card q-mb-md">
          <q-card-section class="row items-center">
            <div class="col-auto">
              <q-icon name="check_circle" color="green" size="32px" />
            </div>
            <div class="col q-ml-md">
              <div class="text-subtitle2 text-weight-bold">
                Pengambilan selesai
              </div>
              <div class="text-caption text-grey-7">
                Senin, 8 April · 3 Karung
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat class="riwayat-card q-mb-md">
          <q-card-section class="row items-center">
            <div class="col-auto">
              <q-icon name="warning" color="orange" size="32px" />
            </div>
            <div class="col q-ml-md">
              <div class="text-subtitle2 text-weight-bold">
                Pengambilan tertunda
              </div>
              <div class="text-caption text-grey-7">
                Senin, 8 April · 1 Karung
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat class="riwayat-card q-mb-md">
          <q-card-section class="row items-center">
            <div class="col-auto">
              <q-icon name="check_circle" color="green" size="32px" />
            </div>
            <div class="col q-ml-md">
              <div class="text-subtitle2 text-weight-bold">
                Pengambilan selesai
              </div>
              <div class="text-caption text-grey-7">
                Senin, 8 April · 2 Karung
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'UserRiwayat',
  setup() {
    const periode = ref('april')

    return {
      periode
    }
  }
}
</script>

<style scoped>
.riwayat-card {
  border-radius: 12px;
  border-left: 4px solid #4CAF50;
}

.periode-toggle {
  border-radius: 12px;
}
</style>