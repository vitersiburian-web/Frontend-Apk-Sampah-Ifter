<template>
  <q-layout view="lHh lpr lFf">
    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer bordered class="bg-white text-primary q-pt-xs">
      <q-tabs 
        no-caps 
        active-color="primary" 
        indicator-color="transparent" 
        class="text-grey-7" 
        align="justify"
      >
        <q-route-tab
          to="/petugas"
          icon="home"
          label="Dashboard"
          name="dashboard"
        />
        <q-route-tab
          to="/petugas/rekap"
          icon="list_alt"
          label="Rekap"
          name="rekap"
        />
        <q-route-tab
          to="/petugas/pendapatan"
          icon="paid"
          label="Pendapatan"
          name="pendapatan"
        />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup>
// OK
</script>

<style scoped>
.q-footer {
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
  border-top: 1px solid #eee;
}

.q-tabs .q-tab {
  padding: 8px 0;
}

.q-tabs .q-tab--active {
  color: #006837 !important; /* Warna Hijau Primer */
}
</style>