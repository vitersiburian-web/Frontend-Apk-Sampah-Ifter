// Import halaman umum
const SplashPage = () => import('pages/SplashPage.vue')
const LoginPage = () => import('pages/LoginPage.vue')
const ErrorNotFound = () => import('pages/ErrorNotFound.vue')
const FormLaporanAdmin = () => import('pages/FormLaporanAdmin.vue') 

// Import Layouts
const AdminLayout = () => import('layouts/AdminLayout.vue')
const PetugasLayout = () => import('layouts/PetugasLayout.vue')
const UserLayout = () => import('layouts/UserLayout.vue')

// Import Dashboard Pages
const AdminDashboard = () => import('pages/AdminDashboard.vue')
const PetugasDashboard = () => import('pages/PetugasDashboard.vue')

// Import Pages Petugas
const FormPengambilanSampah = () => import('pages/FormPengambilanSampah.vue')
const RekapPetugas = () => import('pages/RekapPetugas.vue')
const PendapatanPetugas = () => import('pages/PendapatanPetugas.vue')

// Import Pages User
const UserDashboard = () => import('pages/UserDashboard.vue')
const UserLaporan = () => import('pages/UserLaporan.vue')
const UserMaps = () => import('pages/UserMaps.vue')
const UserNotifikasi = () => import('pages/UserNotifikasi.vue')
const UserRiwayat = () => import('pages/UserRiwayat.vue')

// Import Pages Admin
const DataPetugas = () => import('pages/DataPetugas.vue')
const DataUser = () => import('pages/DataUser.vue')
const KeuanganAdmin = () => import('pages/KeuanganAdmin.vue')
const RiwayatAdmin = () => import('pages/RiwayatAdmin.vue')
const TambahUser = () => import('pages/TambahUser.vue')
const TambahPetugas = () => import('pages/TambahPetugas.vue')
const TambahJadwal = () => import('pages/TambahJadwal.vue')

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
  
  // Rute Laporan Masalah (Akses tanpa login)
  {
    path: '/lapor-admin',
    component: FormLaporanAdmin,
    name: 'LaporanAdmin',
    meta: { title: 'Laporan Masalah' }
  },

  // Admin Routes (Grup rute untuk Admin)
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: '', 
        component: AdminDashboard,
        name: 'AdminDashboard',
        meta: { title: 'Dashboard Admin' }
      },
      {
        path: 'data', 
        redirect: { name: 'DataPetugas' },
        meta: { title: 'Data Manajemen' }
      },
      {
        path: 'data/petugas', 
        component: DataPetugas,
        name: 'DataPetugas',
        meta: { title: 'Data Petugas' }
      },
      {
        path: 'data/user', 
        component: DataUser,
        name: 'DataUser',
        meta: { title: 'Data User' }
      },
      // HALAMAN JADWAL (Navigasi ke-3)
      {
        path: 'tambah-jadwal', 
        component: TambahJadwal,
        name: 'TambahJadwal',
        meta: { title: 'Jadwal Pengambilan' }
      },
      {
        path: 'keuangan', 
        component: KeuanganAdmin,
        name: 'KeuanganAdmin',
        meta: { title: 'Keuangan' }
      },
      {
        path: 'riwayat', 
        component: RiwayatAdmin,
        name: 'RiwayatAdmin',
        meta: { title: 'Riwayat' }
      },
      // Form Tambahan
      {
        path: 'tambah-user', 
        component: TambahUser,
        name: 'TambahUser',
        meta: { title: 'Tambah User' }
      },
      {
        path: 'tambah-petugas', 
        component: TambahPetugas,
        name: 'TambahPetugas',
        meta: { title: 'Tambah Petugas' }
      }
    ]
  },

  // Petugas Routes
  {
    path: '/petugas',
    component: PetugasLayout,
    meta: { requiresAuth: true, role: 'petugas' },
    children: [
      { path: '', component: PetugasDashboard, name: 'PetugasDashboard' },
      { path: 'form', component: FormPengambilanSampah, name: 'FormPengambilanSampah' },
      { path: 'rekap', component: RekapPetugas, name: 'RekapPetugas' },
      { path: 'pendapatan', component: PendapatanPetugas, name: 'PendapatanPetugas' }
    ]
  },

  // User/Warga Routes
  {
    path: '/user',
    component: UserLayout,
    meta: { requiresAuth: true, role: 'user' },
    children: [
      { path: '', redirect: { name: 'UserDashboard' } },
      { path: 'dashboard', component: UserDashboard, name: 'UserDashboard', meta: { title: 'Dashboard' } },
      { path: 'laporan', component: UserLaporan, name: 'UserLaporan', meta: { title: 'Laporan Pengambilan' } },
      { path: 'maps', component: UserMaps, name: 'UserMaps', meta: { title: 'Peta Lokasi' } },
      { path: 'notifikasi', component: UserNotifikasi, name: 'UserNotifikasi', meta: { title: 'Notifikasi' } },
      { path: 'riwayat', component: UserRiwayat, name: 'UserRiwayat', meta: { title: 'Riwayat' } }
    ]
  },

  // 404 - Not Found
  {
    path: '/:catchAll(.*)*',
    component: ErrorNotFound,
    name: 'ErrorNotFound'
  }
]