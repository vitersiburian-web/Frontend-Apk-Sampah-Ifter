// Import halaman umum
const SplashPage = () => import('pages/SplashPage.vue')
const LoginPage = () => import('pages/LoginPage.vue')
const ErrorNotFound = () => import('pages/ErrorNotFound.vue')

// Import Layouts
const AdminLayout = () => import('layouts/AdminLayout.vue')
const PetugasLayout = () => import('layouts/PetugasLayout.vue')
const UserLayout = () => import('layouts/UserLayout.vue')

// Import Dashboard Pages
const AdminDashboard = () => import('pages/AdminDashboard.vue')
const PetugasDashboard = () => import('pages/PetugasDashboard.vue')

// Import Pages User
const UserDashboard = () => import('pages/UserDashboard.vue')
const UserLaporan = () => import('pages/UserLaporan.vue')
const UserMaps = () => import('pages/UserMaps.vue')
const UserNotifikasi = () => import('pages/UserNotifikasi.vue')
const UserRiwayat = () => import('pages/UserRiwayat.vue')

export default [
  // Landing/Splash Page
  {
    path: '/',
    component: SplashPage,
    name: 'Splash'
  },

  // Login Page
  {
    path: '/login',
    component: LoginPage,
    name: 'Login'
  },

  // Admin Routes
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: '',
        component: AdminDashboard,
        name: 'AdminDashboard'
      }
    ]
  },

  // Petugas Routes
  {
    path: '/petugas',
    component: PetugasLayout,
    meta: { requiresAuth: true, role: 'petugas' },
    children: [
      {
        path: '',
        component: PetugasDashboard,
        name: 'PetugasDashboard'
      }
    ]
  },

  // User/Warga Routes
  {
    path: '/user',
    component: UserLayout,
    meta: { requiresAuth: true, role: 'user' },
    children: [
      {
        path: '',
        redirect: { name: 'UserDashboard' }
      },
      {
        path: 'dashboard',
        component: UserDashboard,
        name: 'UserDashboard',
        meta: { title: 'Dashboard' }
      },
      {
        path: 'laporan',
        component: UserLaporan,
        name: 'UserLaporan',
        meta: { title: 'Laporan Pengambilan Sampah' }
      },
      {
        path: 'maps',
        component: UserMaps,
        name: 'UserMaps',
        meta: { title: 'Peta Lokasi' }
      },
      {
        path: 'notifikasi',
        component: UserNotifikasi,
        name: 'UserNotifikasi',
        meta: { title: 'Notifikasi' }
      },
      {
        path: 'riwayat',
        component: UserRiwayat,
        name: 'UserRiwayat',
        meta: { title: 'Riwayat Pengambilan' }
      }
    ]
  },

  // 404 - Not Found
  {
    path: '/:catchAll(.*)*',
    component: ErrorNotFound,
    name: 'ErrorNotFound'
  }
]