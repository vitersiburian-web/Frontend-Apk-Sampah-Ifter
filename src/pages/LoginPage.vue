<template>
  <div class="login-page">
    <div class="bg-pattern"></div>

    <div class="content">
      <h1 class="title">Suraja<br />Peduli Sampah.</h1>

      <q-card class="login-card">
        <h3>Masuk</h3>

        <q-input
          v-model="username"
          outlined
          placeholder="Username"
          class="mb input-glow"
          bg-color="white"
        >
          <template v-slot:prepend>
            <q-icon name="people" color="primary" />
          </template>
        </q-input>

        <q-input
          v-model="password"
          outlined
          :type="showPwd ? 'text' : 'password'"
          placeholder="Kata Sandi"
          class="mb input-glow"
          bg-color="white"
        >
          <template v-slot:prepend>
            <q-icon name="lock" color="primary" />
          </template>
          <template v-slot:append>
            <q-icon
              :name="showPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              color="grey"
              @click="showPwd = !showPwd"
            />
          </template>
        </q-input>

        <div class="text-right q-mb-md">
          <span class="link" @click="lupaSandi">Lupa Sandi?</span>
        </div>

        <q-btn label="Masuk" class="btn-login" unelevated no-caps @click="handleLogin" />

        <div class="q-mt-lg text-center">
          <div class="text-grey-7 q-mb-sm text-caption">Ada kendala saat masuk?</div>
          <q-btn flat dense no-caps class="btn-hubungi" @click="goToLaporan">
            <q-icon name="support_agent" class="q-mr-xs" size="xs" />
            Hubungi Admin / Laporkan Masalah
          </q-btn>
        </div>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()

const username = ref('')
const password = ref('')
const showPwd = ref(false)

const handleLogin = async () => {
  if (!username.value || !password.value) {
    $q.notify({
      message: 'Email dan Kata Sandi wajib diisi!',
      color: 'negative',
      icon: 'warning',
      position: 'top',
    })
    return
  }

  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      username: username.value,
      password: password.value,
    })

    const token = response.data.token
    localStorage.setItem('token', token)

    const payload = JSON.parse(atob(token.split('.')[1]))
    localStorage.setItem('username', payload.username)
    localStorage.setItem('role', payload.role)
    localStorage.setItem('user_id', payload.id)

    if (payload.role === 'admin') {
      router.push('/admin')
    } else if (payload.role === 'petugas') {
      router.push('/petugas')
    } else {
      router.push('/user')
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      message: 'Username atau kata sandi salah!',
      color: 'negative',
    })
  }
}

const lupaSandi = () => {
  $q.notify({
    message: 'Silahkan gunakan tombol "Hubungi Admin" di bawah untuk bantuan reset sandi.',
    color: 'info',
    icon: 'info',
  })
}

const goToLaporan = () => {
  router.push({ name: 'LaporanAdmin' })
}
</script>

<style scoped>
.login-page {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #00513b 0%, #006837 50%, #008749 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.bg-pattern {
  position: absolute;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 10% 20%, rgba(255, 193, 7, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 90% 10%, rgba(0, 229, 255, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 193, 7, 0.1) 0%, transparent 40%);
}

.content {
  position: relative;
  z-index: 1;
  width: 90%;
  max-width: 400px;
  padding: 20px;
}

.title {
  font-size: 48px;
  font-weight: 800;
  color: #ffc107;
  margin: 0 0 48px 0;
  line-height: 1.1;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 32px 24px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.login-card h3 {
  font-size: 28px;
  font-weight: 700;
  color: #006837;
  margin: 0 0 24px 0;
}

.mb {
  margin-bottom: 20px;
}

.login-card :deep(.q-field__control) {
  border-radius: 12px;
  background: white;
  transition: box-shadow 0.3s ease;
}

.input-glow:focus-within :deep(.q-field__control) {
  box-shadow: 0 0 0 2px rgba(0, 104, 55, 0.2);
  border-color: #006837;
}

.link {
  color: #006837;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s;
}

.link:hover {
  text-decoration: underline;
  color: #008749;
}

.btn-login {
  width: 100%;
  background: linear-gradient(135deg, #006837 0%, #00513b 100%);
  color: white;
  font-size: 16px;
  font-weight: 600;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 104, 55, 0.3);
  transition: transform 0.2s;
}

.btn-login:active {
  transform: scale(0.98);
}

.btn-hubungi {
  color: #ffc107; /* Warna Kuning agar kontras */
  font-weight: 600;
  border: 1px dashed #ffc107;
  border-radius: 8px;
  width: 100%;
  transition: all 0.3s;
}

.btn-hubungi:hover {
  background-color: #fff8e1;
  color: #ffa000;
  border-style: solid;
}

@media (max-width: 600px) {
  .title {
    font-size: 40px;
  }
}
</style>
