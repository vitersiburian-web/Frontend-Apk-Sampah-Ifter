<template>
  <div class="login-page">
    <div class="bg-pattern"></div>
    
    <div class="content">
      <h1 class="title">Suraja<br>Peduli Sampah.</h1>
      
      <q-card class="login-card">
        <h3>Masuk</h3>
        
        <q-input v-model="email" outlined placeholder="Email" class="mb">
          <template v-slot:prepend><q-icon name="mail" /></template>
        </q-input>
        
        <q-input v-model="password" outlined :type="showPwd ? 'text' : 'password'" placeholder="Kata Sandi" class="mb">
          <template v-slot:prepend><q-icon name="lock" /></template>
          <template v-slot:append>
            <q-icon :name="showPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="showPwd = !showPwd" />
          </template>
        </q-input>
        
        <div class="text-right mb"><span class="link" @click="lupaSandi">Lupa Sandi?</span></div>
        
        <q-btn label="Masuk" class="btn-login" unelevated no-caps @click="handleLogin" />
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const showPwd = ref(false)

const users = [
  { email: 'admin.com', password: 'admin123', role: 'admin' },
  { email: 'petugas.com', password: 'petugas123', role: 'petugas' },
  { email: 'user.com', password: 'user123', role: 'user' }
]

const handleLogin = () => {
  const user = users.find(u => u.email === email.value && u.password === password.value)
  
  if (!user) {
    alert('Email atau kata sandi salah!')
    return
  }

  // Langsung arahkan tanpa popup
  if (user.role === 'admin') {
    router.push('/admin')
  } else if (user.role === 'petugas') {
    router.push('/petugas')
  } else {
    router.push('/user')
  }
}

const lupaSandi = () => alert('Hubungi admin untuk reset sandi.')
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
  color: #FFC107;
  margin: 0 0 48px 0;
  line-height: 1.1;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
}

.login-card {
  background: rgba(232, 245, 233, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 32px 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.login-card h3 {
  font-size: 28px;
  font-weight: 700;
  color: #006837;
  margin: 0 0 24px 0;
}

.mb { margin-bottom: 16px; }

.login-card :deep(.q-field__control) {
  border-radius: 12px;
  background: white;
}

.link {
  color: #00BCD4;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.link:hover { text-decoration: underline; }

.btn-login {
  width: 100%;
  background: linear-gradient(135deg, #006837 0%, #00513b 100%);
  color: white;
  font-size: 16px;
  font-weight: 600;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 104, 55, 0.3);
}

@media (max-width: 600px) {
  .title { font-size: 40px; }
}
</style>
