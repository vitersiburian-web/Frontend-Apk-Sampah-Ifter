<template>
  <div class="flex flex-center bg-dark-green text-white fullscreen column">
    <img src="../assets/Logo_SPS_BG-remove.png" alt="Logo" style="width: 150px; height: auto;" />
    <h5 class="q-mt-md text-yellow text-bold">Suraja Peduli Sampah.</h5>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  setTimeout(() => {
    router.push('/login')
  }, 3000)
})
</script>

<style scoped>
.bg-dark-green {
  background-color: #006837;
}
.text-yellow {
  color: #FFD84D;
}
</style>
