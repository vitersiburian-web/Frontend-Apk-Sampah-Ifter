<template>
  <q-layout view="lHh lpr lFf">
    <q-header bordered class="bg-white text-dark q-py-sm header-custom">
        <q-toolbar>
            <q-toolbar-title class="text-h6 text-weight-bold text-primary">
                {{ currentRouteTitle }}
            </q-toolbar-title>
            
            <q-btn flat round dense icon="notifications_none" color="grey-8" class="q-mr-sm" @click="toggleDrawer" />
            
            <q-avatar size="md">
                <img src="https://via.placeholder.com/150/006837/FFFFFF?text=A" alt="Admin Avatar">
            </q-avatar>
        </q-toolbar>
    </q-header>
    
    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer bordered class="bg-white text-primary q-pt-xs footer-custom">
      <q-tabs 
        active-color="primary" 
        indicator-color="transparent" 
        class="text-grey-7" 
        align="justify"
      >
        <q-route-tab
          to="/admin"
          icon="home"
          label="Dashboard"
          exact
        />
        <q-route-tab
          to="/admin/data"
          icon="manage_accounts"
          label="Data"
          exact
        />
        <q-route-tab
          to="/admin/keuangan"
          icon="account_balance_wallet"
          label="Keuangan"
          exact
        />
        <q-route-tab
          to="/admin/riwayat"
          icon="history"
          label="Riwayat"
          exact
        />
      </q-tabs>
    </q-footer>
    
    <NotificationDrawer v-model="rightDrawerOpen" />

  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import NotificationDrawer from 'components/NotificationDrawer.vue'; 

const route = useRoute();
const rightDrawerOpen = ref(false);

const currentRouteTitle = computed(() => {
    const title = route.meta.title;
    if (title) return title;
    
    if (route.path.startsWith('/admin/data')) return 'Data Manajemen';
    if (route.path === '/admin/keuangan') return 'Keuangan';
    if (route.path === '/admin/riwayat') return 'Riwayat';
    return 'Dashboard Admin';
});

const toggleDrawer = () => {
    rightDrawerOpen.value = !rightDrawerOpen.value;
}
</script>

<style scoped>
.text-primary {
  color: #006837 !important; 
}
.header-custom {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.footer-custom {
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
  border-top: 1px solid #eee;
}
.q-tabs .q-route-tab--active {
  color: #006837 !important;
}
</style>