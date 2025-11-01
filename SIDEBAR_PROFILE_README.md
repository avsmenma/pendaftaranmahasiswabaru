# Sidebar Profile - Dokumentasi Implementasi

## Deskripsi
Implementasi fitur sidebar profile yang menampilkan data lengkap calon mahasiswa yang telah mereka isi di formulir pendaftaran. Sidebar ini akan menampilkan:
- Data Pribadi (Nama, NIK, Tempat/Tanggal Lahir, Jenis Kelamin, Agama, Kontak, Alamat)
- Data Akademik (Asal Sekolah, Nilai Rata-rata, Jurusan, Program Studi)
- Data Orang Tua (Data Ayah dan Ibu termasuk nama, pekerjaan, penghasilan, kontak)
- Dokumen yang telah diupload
- Progress pendaftaran dengan visualisasi

## File yang Dibuat/Dimodifikasi

### Backend (server.js)
**File:** `project-root/server.js`

**Endpoint Baru:**
```javascript
GET /api/profile-data/:userId
```

**Deskripsi:** Endpoint ini mengambil semua data profil mahasiswa dari berbagai tabel:
- Tabel `user` - Data user dasar
- Tabel `mahasiswa` - Data pribadi mahasiswa
- Tabel `data_akademik` - Data akademik
- Tabel `data_orangtua` - Data orang tua
- Tabel `dokumen` - Dokumen yang diupload

**Response Format:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id_pengguna": 1,
      "email": "user@example.com",
      "nama_lengkap": "John Doe",
      "role": "mahasiswa"
    },
    "pribadi": {
      "id_mahasiswa": 1,
      "nama_lengkap": "John Doe",
      "nik": "1234567890123456",
      "tempat_lahir": "Jakarta",
      "tanggal_lahir": "2000-01-01",
      "jenis_kelamin": "Laki-Laki",
      "agama": "Islam",
      "no_hp": "081234567890",
      "email": "john@example.com",
      "alamat_mahasiswa": "Jl. Example No. 123",
      "kode_pos": "12345"
    },
    "akademik": {
      "asal_sekolah": "SMA Negeri 1 Jakarta",
      "nilai_rata_rata": "85.5",
      "tahun_lulus": "2020",
      "nama_jurusan": "Teknik Informatika",
      "nama_prodi": "S1 Teknik Informatika"
    },
    "orangtua": {
      "nama_ayah": "Bapak Doe",
      "pekerjaan_ayah": "Pegawai Swasta",
      "penghasilan_ayah": "5000000",
      "nohp_ayah": "081234567891",
      "nama_ibu": "Ibu Doe",
      "pekerjaan_ibu": "Ibu Rumah Tangga",
      "penghasilan_ibu": "0",
      "nohp_ibu": "081234567892"
    },
    "dokumen": [
      {
        "jenis_dokumen": "Ijazah/SKL",
        "nama_file": "ijazah.pdf",
        "format_file": "pdf",
        "status_verifikasi": "Menunggu Verifikasi"
      }
    ],
    "progress": {
      "dataPribadi": true,
      "dataAkademik": true,
      "dataOrangTua": true,
      "uploadDokumen": false,
      "totalProgress": 75
    }
  }
}
```

### Frontend

#### 1. CSS - Profile Sidebar Styling
**File:** `project-root/public/style/profile-sidebar.css`

Berisi semua styling untuk:
- Enhanced profile header dengan avatar dan info
- Progress bar dengan visualisasi 4 steps
- Collapsible profile details
- Field display dengan label dan value
- Loading, error, dan empty states
- Responsive design
- Smooth animations dan transitions

#### 2. JavaScript - Profile Sidebar Logic
**File:** `project-root/public/js/profile-sidebar.js`

**Fungsi Utama:**

1. `initProfileSidebar()` - Inisialisasi sidebar dan load data
2. `renderProfileSidebar(data)` - Render HTML sidebar dengan data
3. `renderProfileDetails(data)` - Render detail profil yang bisa di-expand
4. `toggleProfileDetails()` - Toggle expand/collapse details
5. `renderField(label, value)` - Render single field dengan label dan value
6. `renderDokumenList(dokumen)` - Render list dokumen
7. `formatDate(dateString)` - Format tanggal ke format Indonesia
8. `refreshProfileData()` - Refresh data profil

**Global Functions:**
```javascript
window.profileSidebar = {
  init: initProfileSidebar,
  refresh: refreshProfileData,
  toggle: toggleProfileDetails
};
```

#### 3. HTML Files Updated
File-file berikut telah diupdate untuk include CSS dan JavaScript baru:

1. `project-root/public/dashboard.html`
2. `project-root/public/formulir_pendaftaran.html`
3. `project-root/public/formulir_pendaftaran_dataakademik.html`
4. `project-root/public/formulir_pendaftaran_dataorangtua.html`
5. `project-root/public/formulir_pendaftaran_uploaddokumen.html`
6. `project-root/public/formulir_pendaftaran_reviewandsubmit.html`

**Penambahan di `<head>`:**
```html
<link rel="stylesheet" href="style/profile-sidebar.css" />
<script src="js/app.js"></script>
<script src="js/profile-sidebar.js" defer></script>
```

## Fitur-fitur

### 1. Profile Header
- Avatar dengan inisial nama
- Nama lengkap mahasiswa
- Email mahasiswa
- Role badge (Mahasiswa)

### 2. Progress Tracking
- Progress bar dengan persentase
- 4 step indicators (Data Pribadi, Data Akademik, Data Orang Tua, Upload Dokumen)
- Visual feedback untuk step yang completed
- Real-time calculation berdasarkan data yang ada

### 3. Collapsible Profile Details
- Toggle button untuk expand/collapse details
- Smooth animation saat expand/collapse
- Organized sections dengan icons

### 4. Data Pribadi Section
Menampilkan:
- Nama Lengkap
- NIK
- Tempat, Tanggal Lahir
- Jenis Kelamin
- Agama
- No. HP
- Email
- Alamat
- Kode Pos

### 5. Data Akademik Section
Menampilkan:
- Asal Sekolah
- Nilai Rata-rata
- Tahun Lulus
- Jurusan
- Program Studi

### 6. Data Orang Tua Section
Menampilkan data terpisah untuk Ayah dan Ibu:
- Nama
- Pekerjaan
- Penghasilan
- No. HP

### 7. Dokumen Section
Menampilkan list dokumen dengan:
- Icon berdasarkan format file (PDF/Image)
- Jenis dokumen
- Nama file
- Status verifikasi dengan color coding

### 8. Profile Stats
Mini statistics menampilkan:
- Jumlah dokumen yang diupload
- Total progress pendaftaran

### 9. States Handling
- **Loading State:** Menampilkan spinner saat data sedang dimuat
- **Error State:** Menampilkan pesan error jika gagal load data
- **Empty State:** Menampilkan pesan "Belum ada data" untuk section yang kosong

## Cara Kerja

### Flow Diagram

```
User Login
    ↓
Dashboard/Form Page Load
    ↓
profile-sidebar.js initProfileSidebar()
    ↓
Fetch API: GET /api/profile-data/:userId
    ↓
Backend Query:
  - user table
  - mahasiswa table
  - data_akademik table
  - data_orangtua table
  - dokumen table
    ↓
Compile & Calculate Progress
    ↓
Return JSON Response
    ↓
Frontend renderProfileSidebar()
    ↓
Display in Sidebar with:
  - Profile Header
  - Progress Bar
  - Collapsible Details
```

### Automatic Loading
Sidebar profile akan otomatis load saat halaman dibuka karena:
```javascript
document.addEventListener('DOMContentLoaded', function() {
  initProfileSidebar();
});
```

### Refresh Data
Untuk refresh data profile secara manual:
```javascript
// Call dari JavaScript lain
window.profileSidebar.refresh();
```

## Styling & Design

### Color Scheme
- **Primary Blue:** `#60a5fa` dan `#3b82f6`
- **Background Dark:** `#365368` dan `#2a3f4f`
- **Success Green:** `#4ade80` dan `#22c55e`
- **Warning Yellow:** `#fbbf24`
- **Error Red:** `#f87171` dan `#ef4444`

### Responsive Design
- Desktop: Full sidebar dengan semua informasi
- Mobile (<768px): Compressed layout dengan smaller avatars

### Animations
- Progress bar fill animation
- Smooth expand/collapse transitions
- Fade in/out untuk loading states
- Rotating chevron icon saat toggle

## Testing

### Manual Testing Checklist

1. **Load Testing**
   - [ ] Buka dashboard.html - sidebar muncul
   - [ ] Buka formulir_pendaftaran.html - sidebar muncul
   - [ ] Check loading state saat data dimuat

2. **Data Display**
   - [ ] Nama dan email tampil dengan benar
   - [ ] Avatar menampilkan inisial yang benar
   - [ ] Progress bar menunjukkan persentase yang tepat
   - [ ] Semua field data pribadi tampil
   - [ ] Data akademik tampil jika sudah diisi
   - [ ] Data orang tua tampil jika sudah diisi
   - [ ] List dokumen tampil dengan format yang benar

3. **Interactions**
   - [ ] Klik toggle button - details expand
   - [ ] Klik lagi - details collapse
   - [ ] Icon chevron berputar saat toggle
   - [ ] Smooth animation saat expand/collapse

4. **Empty States**
   - [ ] Test dengan user baru (belum isi data)
   - [ ] Verify "Belum ada data" muncul di section kosong
   - [ ] Progress bar menunjukkan 0%

5. **Error Handling**
   - [ ] Test dengan user ID invalid
   - [ ] Verify error message muncul
   - [ ] Test dengan server down
   - [ ] Verify connection error message

## Troubleshooting

### Issue: Sidebar tidak muncul
**Solusi:**
1. Check browser console untuk error
2. Pastikan file CSS dan JS ter-include di HTML
3. Pastikan user sudah login (ada data di sessionStorage)
4. Check API endpoint `/api/profile-data/:userId` berfungsi

### Issue: Progress tidak akurat
**Solusi:**
1. Refresh halaman
2. Check data di database (gunakan endpoint `/api/debug-user-data/:userId`)
3. Verify logic calculation di backend (server.js line 1811-1820)

### Issue: Data tidak update setelah isi formulir
**Solusi:**
1. Call `window.profileSidebar.refresh()` setelah save data
2. Atau refresh halaman untuk reload semua data

### Issue: Styling tidak sesuai
**Solusi:**
1. Clear browser cache
2. Check file `profile-sidebar.css` ter-load dengan benar
3. Check tidak ada CSS conflict dengan existing styles

## Future Enhancements

Potensi peningkatan di masa depan:

1. **Real-time Updates**
   - WebSocket untuk update otomatis saat data berubah
   - Tidak perlu refresh manual

2. **Profile Photo Upload**
   - Replace avatar text dengan foto profil
   - Upload dan crop functionality

3. **Edit Inline**
   - Edit data langsung dari sidebar
   - Quick edit tanpa ke form page

4. **Notifications**
   - Badge untuk notifikasi di sidebar
   - Alert untuk dokumen yang perlu diverifikasi

5. **Export Data**
   - Export profile ke PDF
   - Print-friendly version

6. **Data Validation Status**
   - Visual indicator untuk field yang perlu diperbaiki
   - Warning untuk data yang tidak lengkap

## Support

Untuk pertanyaan atau issue, silakan hubungi tim development atau buat issue di repository.

---

**Created:** November 2025
**Version:** 1.0.0
**Author:** Claude Code Assistant
