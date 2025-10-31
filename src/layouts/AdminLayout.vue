<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-dark-green text-white">
      <q-toolbar>
        <q-toolbar-title>Admin Dashboard</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.bg-dark-green {
  background-color: #006837;
}
</style>
