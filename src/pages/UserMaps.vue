<template>
  <q-page class="full-height q-pa-none">
    <!-- Header Title -->
    <div class="header-container absolute-top q-pa-md">
      <div class="text-h5 text-weight-bold text-primary">Maps</div>
    </div>

    <!-- Map Container -->
    <div class="map-container">
      <div id="map" class="map-view"></div>
    </div>
    <!-- Map Info (tetap tampil mewah) -->
    <div class="map-info absolute-bottom q-ma-md">
      <q-card flat bordered class="info-card">
        <q-card-section class="q-pa-md">
          <div class="row items-center q-gutter-sm">
            <q-icon name="location_on" color="primary" size="24px" />
            <div>
              <div class="text-body2 text-weight-bold text-primary">Lokasi Petugas</div>
              <div class="text-caption text-grey-7">Diambil dari database</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Location Button -->
    <q-page-sticky position="bottom-right" :offset="[18, 100]">
      <q-btn fab icon="my_location" color="primary" @click="centerMap" class="shadow-2" />
    </q-page-sticky>
  </q-page>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// FIX leaflet icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default {
  data() {
    return {
      map: null,
      markers: [],
    }
  },

  async mounted() {
    this.initMap()

    const lokasi = await this.fetchLokasi()
    this.addAllMarkers(lokasi)

    // FIX tile map tidak tampil
    setTimeout(() => {
      this.map.invalidateSize()
    }, 500)
  },

  methods: {
    initMap() {
      this.map = L.map('map').setView([-7.0, 107.59], 14)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(this.map)
    },

    async fetchLokasi() {
      const res = await fetch('http://localhost:5000/api/lokasi/petugas')
      const json = await res.json()
      return json.data
    },

    addAllMarkers(data) {
      data.forEach((p) => {
        if (p.latitude === 0 || p.longitude === 0) return

        const marker = L.marker([p.latitude, p.longitude])
          .addTo(this.map)
          .bindPopup(`<b>${p.nama_petugas}</b><br>${p.username}`)

        this.markers.push(marker)
      })

      if (this.markers.length > 0) {
        this.map.setView(this.markers[0].getLatLng(), 15)
      }
    },

    centerMap() {
      if (this.markers.length > 0) {
        this.map.setView(this.markers[0].getLatLng(), 15)
      }
    },
  },
}
</script>

<style scoped>
.header-container {
  backdrop-filter: blur(1px);
  z-index: 1001;
  border-bottom: 1px solid rgba(8, 96, 46, 0.1);
  height: 56px;
}

.text-primary {
  color: #08602e !important;
}

.map-container {
  position: relative;
  height: calc(100vh - 56px);
  margin-top: 56px;
}

#map {
  width: 100%;
  height: 100%;
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

:deep(.q-btn.bg-primary) {
  background: #08602e !important;
}

:deep(.q-btn.bg-primary:hover) {
  background: #0a7838 !important;
}

.full-height {
  height: 100vh;
  overflow: hidden;
}

.map-view {
  width: 100%;
  height: 100%;
}

.map-info {
  bottom: 70px !important; /* geser ke atas navbar */
  z-index: 999;
}
</style>
