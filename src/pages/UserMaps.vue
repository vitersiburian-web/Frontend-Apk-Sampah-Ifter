<template>
  <q-page class="full-height">
    <div class="header-container absolute-top q-pa-md">
      <div class="text-h5 text-weight-bold text-primary">Maps</div>
    </div>

    <div class="map-container">
      <div id="map" class="full-height"></div>
    </div>

    <q-page-sticky position="bottom-right" :offset="[18, 100]">
      <q-btn fab icon="my_location" color="primary" @click="centerMap" />
    </q-page-sticky>
  </q-page>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// FIX leaflet icon tidak muncul
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

    // FIX TILE NGECRENG / BOLONG
    this.$nextTick(() => {
      setTimeout(() => {
        this.map.invalidateSize()
      }, 600)
    })
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
        // Lewati lokasi kosong 0,0
        if (p.latitude === 0 || p.longitude === 0) return

        const marker = L.marker([p.latitude, p.longitude])
          .addTo(this.map)
          .bindPopup(`<b>${p.nama_petugas}</b><br>${p.username}`)

        this.markers.push(marker)
      })

      // Fokus ke marker pertama
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
  background: white;
  border-bottom: 1px solid #ccc;
}

.map-container {
  position: relative;
  height: calc(100vh - 72px);
  margin-top: 72px;
}

#map {
  width: 100%;
  height: 100%;
}
</style>
