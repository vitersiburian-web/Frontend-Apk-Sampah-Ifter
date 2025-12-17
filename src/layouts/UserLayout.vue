<template>
  <q-layout view="lHh LpR lFr">
    
    <q-page-container class="page-background-white">
      <router-view />
    </q-page-container>

    <q-footer 
      class="bg-white text-dark" 
      bordered
    >
      <q-tabs
        v-model="tab"
        class="text-grey-7"
        active-color="dark-green"
        indicator-color="transparent"
        dense
        align="justify"
      >
        <q-route-tab name="dashboard" :to="{ name: 'UserDashboard' }" icon="home" label="Dashboard" class="nav-tab" exact />
        <q-route-tab name="maps" :to="{ name: 'UserMaps' }" icon="location_on" label="Maps" class="nav-tab" exact />
        <q-route-tab name="notifikasi" :to="{ name: 'UserNotifikasi' }" icon="notifications" label="Notifikasi" class="nav-tab" exact />
        <q-route-tab name="riwayat" :to="{ name: 'UserRiwayat' }" icon="history" label="Riwayat" class="nav-tab" exact />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

const tab = ref('dashboard')
</script>

<style lang="scss">
$dark-green: #08602E;

// Background halaman putih (sesuai desain Figma)
.page-background-white {
  background-color: #FFFFFF; // Putih bersih
}

// Warna teks kustom
.text-dark-green {
  color: $dark-green !important;
}

// Mengatur warna aktif kustom untuk bottom nav
.q-tab--active {
  color: $dark-green !important;
}

// Styling untuk tab navigasi
.nav-tab {
  padding-top: 8px;
  padding-bottom: 8px;
  .q-tab__icon {
    font-size: 26px;
  }
  .q-tab__label {
    font-size: 10px;
    text-transform: capitalize;
    margin-top: 4px;
  }
}
</style>