<template>
  <q-page class="full-height">
    <!-- Header Title -->
    <div class="header-container absolute-top q-pa-md">
      <div class="text-h5 text-weight-bold text-primary">Maps</div>
    </div>

    <!-- Map Container -->
    <div class="map-container">
      <div id="map" class="full-height"></div>
      
      <!-- Map Legend / Info -->
      <div class="map-info absolute-bottom q-ma-md">
        <q-card flat bordered class="info-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-gutter-sm">
              <q-icon name="location_on" color="primary" size="24px" />
              <div>
                <div class="text-body2 text-weight-bold text-primary">Jl Gambung</div>
                <div class="text-caption text-grey-7">Lokasi Anda</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Location Button -->
    <q-page-sticky position="bottom-right" :offset="[18, 100]">
      <q-btn
        fab
        icon="my_location"
        color="primary"
        @click="centerMap"
        class="shadow-2"
      >
        <q-tooltip>Pusatkan Lokasi</q-tooltip>
      </q-btn>
    </q-page-sticky>
  </q-page>
</template>

<script>
import { onMounted } from 'vue'
import { useQuasar } from 'quasar'

export default {
  name: 'UserMaps',
  setup() {
    const $q = useQuasar()

    const initMap = () => {
      const mapElement = document.getElementById('map')
      if (mapElement) {
        mapElement.style.background = 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)'
        mapElement.innerHTML = `
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            width: 90%;
            max-width: 400px;
          ">
            <div style="
              background: white;
              border-radius: 16px;
              padding: 32px 24px;
              box-shadow: 0 4px 20px rgba(8, 96, 46, 0.15);
            ">
              <div style="font-size: 64px; margin-bottom: 16px;">🗺️</div>
              <div style="font-size: 20px; font-weight: bold; margin-bottom: 8px; color: #08602E;">
                Jl Gambung
              </div>
              <div style="font-size: 14px; color: #666; margin-bottom: 24px;">
                Peta lokasi pengambilan sampah
              </div>
              
              <div style="
                padding: 16px;
                background: linear-gradient(135deg, #08602E 0%, #0a7838 100%);
                border-radius: 12px;
                color: white;
              ">
                <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
                  Koordinat
                </div>
                <div style="font-size: 16px; font-weight: bold;">
                  -7.0051, 107.5937
                </div>
              </div>
              
              <div style="
                margin-top: 20px;
                padding: 12px;
                background: #f1f8f4;
                border-radius: 8px;
                border-left: 4px solid #08602E;
              ">
                <div style="font-size: 12px; color: #08602E; display: flex; align-items: center; justify-content: center; gap: 6px;">
                  <span style="font-size: 16px;">📍</span>
                  <span>Bandung, Jawa Barat</span>
                </div>
              </div>
            </div>
          </div>
        `
      }
    }

    const centerMap = () => {
      $q.notify({
        type: 'positive',
        message: 'Memusatkan peta ke lokasi Anda',
        position: 'top',
        timeout: 1500,
        color: 'primary',
        icon: 'my_location'
      })
    }

    onMounted(() => {
      initMap()
    })

    return {
      centerMap
    }
  }
}
</script>

<style scoped>
.header-container {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  z-index: 1001;
  border-bottom: 1px solid rgba(8, 96, 46, 0.1);
}

.text-primary {
  color: #08602E !important;
}

.map-container {
  position: relative;
  height: calc(100vh - 72px);
  margin-top: 72px;
}

#map {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-info {
  z-index: 1000;
  left: 0;
  right: 0;
  margin: 0 auto;
  max-width: calc(100% - 32px);
}

.info-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(8, 96, 46, 0.2);
}

/* Button styling */
:deep(.q-btn.bg-primary) {
  background: #08602E !important;
}

:deep(.q-btn.bg-primary:hover) {
  background: #0a7838 !important;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .map-container {
    height: calc(100vh - 64px);
    margin-top: 64px;
  }
  
  .header-container {
    padding: 12px 16px !important;
  }
  
  .text-h5 {
    font-size: 1.25rem !important;
  }
  
  .map-info {
    bottom: 80px !important;
  }
}

@media (max-width: 400px) {
  .info-card {
    font-size: 0.9em;
  }
}
</style>