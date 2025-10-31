<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-dark-green text-white">
      <q-toolbar>
        <q-btn flat round dense icon="menu" @click="$emit('toggle-left')" />
        <q-toolbar-title>Petugas - Suraja Peduli Sampah</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: 'PetugasLayout'
}
</script>

<style scoped>
.bg-dark-green { background-color: #006837; }
</style>
