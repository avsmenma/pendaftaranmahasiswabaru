// profile-sidebar.js - Enhanced Profile Sidebar Display

// Global profile data
let profileData = null;

// Load profile data on page load
document.addEventListener('DOMContentLoaded', function() {
  initProfileSidebar();
});

/**
 * Initialize Profile Sidebar
 */
async function initProfileSidebar() {
  const user = app.getCurrentUser();

  if (!user) {
    console.log('No user logged in');
    return;
  }

  // Show loading state
  showProfileLoading();

  try {
    // Fetch complete profile data
    const response = await fetch(`${app.API_URL}/api/profile-data/${user.id}`);
    const result = await response.json();

    if (result.success && result.data) {
      profileData = result.data;
      renderProfileSidebar(profileData);
    } else {
      showProfileError('Gagal memuat data profil');
    }
  } catch (error) {
    console.error('Error loading profile data:', error);
    showProfileError('Tidak dapat terhubung ke server');
  }
}

/**
 * Render Profile Sidebar
 */
function renderProfileSidebar(data) {
  const profileSection = document.querySelector('.profile-section');

  if (!profileSection) {
    console.warn('Profile section not found');
    return;
  }

  const user = data.user;
  const pribadi = data.pribadi;
  const akademik = data.akademik;
  const orangtua = data.orangtua;
  const dokumen = data.dokumen;
  const progress = data.progress;

  // Get display name and initials
  const displayName = pribadi?.nama_lengkap || user.nama_lengkap || user.email.split('@')[0];
  const initials = displayName.substring(0, 2).toUpperCase();
  const email = pribadi?.email || user.email;

  // Build HTML
  const html = `
    <div class="profile-header">
      <div class="profile-avatar">${initials}</div>
      <div class="profile-info">
        <h3 class="profile-name">${displayName}</h3>
        <p class="profile-email">${email}</p>
        <span class="profile-role">${user.role || 'Mahasiswa'}</span>
      </div>
    </div>

    <!-- Progress Section -->
    <div class="profile-progress">
      <div class="progress-header">
        <span class="progress-title">Progress Pendaftaran</span>
        <span class="progress-percentage">${progress.totalProgress}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress.totalProgress}%"></div>
      </div>
      <div class="progress-steps">
        <div class="progress-step ${progress.dataPribadi ? 'completed' : ''}" title="Data Pribadi"></div>
        <div class="progress-step ${progress.dataAkademik ? 'completed' : ''}" title="Data Akademik"></div>
        <div class="progress-step ${progress.dataOrangTua ? 'completed' : ''}" title="Data Orang Tua"></div>
        <div class="progress-step ${progress.uploadDokumen ? 'completed' : ''}" title="Upload Dokumen"></div>
      </div>
    </div>

    <!-- Profile Details Toggle -->
    <div class="profile-details">
      <button class="profile-toggle" onclick="toggleProfileDetails()">
        <span>Detail Profil</span>
        <i class="fas fa-chevron-down"></i>
      </button>

      <div class="profile-content" id="profileContent">
        ${renderProfileDetails(data)}
      </div>
    </div>
  `;

  profileSection.innerHTML = html;
}

/**
 * Render Profile Details
 */
function renderProfileDetails(data) {
  const pribadi = data.pribadi;
  const akademik = data.akademik;
  const orangtua = data.orangtua;
  const dokumen = data.dokumen;

  let html = '';

  // Data Pribadi Section
  if (pribadi) {
    html += `
      <div class="profile-section-wrapper">
        <div class="profile-section-title">
          <i class="fas fa-user"></i>
          Data Pribadi
        </div>
        ${renderField('Nama Lengkap', pribadi.nama_lengkap)}
        ${renderField('NIK', pribadi.nik)}
        ${renderField('Tempat, Tanggal Lahir', pribadi.tempat_lahir && pribadi.tanggal_lahir ? `${pribadi.tempat_lahir}, ${formatDate(pribadi.tanggal_lahir)}` : null)}
        ${renderField('Jenis Kelamin', pribadi.jenis_kelamin)}
        ${renderField('Agama', pribadi.agama)}
        ${renderField('No. HP', pribadi.no_hp)}
        ${renderField('Email', pribadi.email)}
        ${renderField('Alamat', pribadi.alamat_mahasiswa)}
        ${renderField('Kode Pos', pribadi.kode_pos)}
      </div>
    `;
  } else {
    html += `
      <div class="profile-section-wrapper">
        <div class="profile-section-title">
          <i class="fas fa-user"></i>
          Data Pribadi
        </div>
        <div class="profile-empty">
          <i class="fas fa-inbox"></i>
          <p>Belum ada data pribadi</p>
        </div>
      </div>
    `;
  }

  // Data Akademik Section
  if (akademik) {
    html += `
      <div class="profile-section-wrapper">
        <div class="profile-section-title">
          <i class="fas fa-graduation-cap"></i>
          Data Akademik
        </div>
        ${renderField('Asal Sekolah', akademik.asal_sekolah)}
        ${renderField('Nilai Rata-rata', akademik.nilai_rata_rata)}
        ${renderField('Tahun Lulus', akademik.tahun_lulus)}
        ${renderField('Jurusan', akademik.nama_jurusan)}
        ${renderField('Program Studi', akademik.nama_prodi)}
      </div>
    `;
  } else {
    html += `
      <div class="profile-section-wrapper">
        <div class="profile-section-title">
          <i class="fas fa-graduation-cap"></i>
          Data Akademik
        </div>
        <div class="profile-empty">
          <i class="fas fa-inbox"></i>
          <p>Belum ada data akademik</p>
        </div>
      </div>
    `;
  }

  // Data Orang Tua Section
  if (orangtua) {
    html += `
      <div class="profile-section-wrapper">
        <div class="profile-section-title">
          <i class="fas fa-users"></i>
          Data Orang Tua
        </div>
        <div style="margin-bottom: 0.75rem;">
          <div style="font-size: 0.75rem; color: #60a5fa; font-weight: 600; margin-bottom: 0.5rem;">
            <i class="fas fa-male"></i> Data Ayah
          </div>
          ${renderField('Nama Ayah', orangtua.nama_ayah)}
          ${renderField('Pekerjaan', orangtua.pekerjaan_ayah)}
          ${renderField('Penghasilan', orangtua.penghasilan_ayah)}
          ${renderField('No. HP', orangtua.nohp_ayah)}
        </div>
        <div>
          <div style="font-size: 0.75rem; color: #60a5fa; font-weight: 600; margin-bottom: 0.5rem;">
            <i class="fas fa-female"></i> Data Ibu
          </div>
          ${renderField('Nama Ibu', orangtua.nama_ibu)}
          ${renderField('Pekerjaan', orangtua.pekerjaan_ibu)}
          ${renderField('Penghasilan', orangtua.penghasilan_ibu)}
          ${renderField('No. HP', orangtua.nohp_ibu)}
        </div>
      </div>
    `;
  } else {
    html += `
      <div class="profile-section-wrapper">
        <div class="profile-section-title">
          <i class="fas fa-users"></i>
          Data Orang Tua
        </div>
        <div class="profile-empty">
          <i class="fas fa-inbox"></i>
          <p>Belum ada data orang tua</p>
        </div>
      </div>
    `;
  }

  // Dokumen Section
  html += `
    <div class="profile-section-wrapper">
      <div class="profile-section-title">
        <i class="fas fa-file-alt"></i>
        Dokumen
      </div>
      ${dokumen && dokumen.length > 0 ? renderDokumenList(dokumen) : `
        <div class="profile-empty">
          <i class="fas fa-inbox"></i>
          <p>Belum ada dokumen</p>
        </div>
      `}
    </div>
  `;

  // Stats Section
  html += `
    <div class="profile-stats">
      <div class="profile-stat">
        <span class="profile-stat-value">${dokumen?.length || 0}</span>
        <span class="profile-stat-label">Dokumen</span>
      </div>
      <div class="profile-stat">
        <span class="profile-stat-value">${data.progress.totalProgress}%</span>
        <span class="profile-stat-label">Progress</span>
      </div>
    </div>
  `;

  return html;
}

/**
 * Render single field
 */
function renderField(label, value) {
  const isEmpty = !value || value === '' || value === 'null' || value === 'undefined';

  return `
    <div class="profile-field">
      <div class="profile-field-label">${label}</div>
      <div class="profile-field-value ${isEmpty ? 'empty' : ''}">
        ${isEmpty ? 'Belum diisi' : value}
      </div>
    </div>
  `;
}

/**
 * Render dokumen list
 */
function renderDokumenList(dokumen) {
  return dokumen.map(doc => {
    const statusColor = doc.status_verifikasi === 'Terverifikasi' ? '#4ade80' : '#fbbf24';
    const statusIcon = doc.status_verifikasi === 'Terverifikasi' ? 'check-circle' : 'clock';

    return `
      <div class="profile-field">
        <div class="profile-field-label">
          <i class="fas fa-file-${doc.format_file === 'pdf' ? 'pdf' : 'image'}"></i>
          ${doc.jenis_dokumen}
        </div>
        <div class="profile-field-value">
          ${doc.nama_file}
        </div>
        <div style="margin-top: 0.25rem;">
          <span style="font-size: 0.7rem; color: ${statusColor};">
            <i class="fas fa-${statusIcon}"></i>
            ${doc.status_verifikasi || 'Menunggu'}
          </span>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Toggle profile details
 */
function toggleProfileDetails() {
  const content = document.getElementById('profileContent');
  const toggle = document.querySelector('.profile-toggle');

  if (!content || !toggle) return;

  content.classList.toggle('expanded');
  toggle.classList.toggle('active');
}

/**
 * Format date to Indonesian format
 */
function formatDate(dateString) {
  if (!dateString) return '-';

  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    return dateString;
  }
}

/**
 * Show loading state
 */
function showProfileLoading() {
  const profileSection = document.querySelector('.profile-section');

  if (!profileSection) return;

  profileSection.innerHTML = `
    <div class="profile-loading">
      <i class="fas fa-spinner"></i>
      <p>Memuat data profil...</p>
    </div>
  `;
}

/**
 * Show error state
 */
function showProfileError(message) {
  const profileSection = document.querySelector('.profile-section');

  if (!profileSection) return;

  profileSection.innerHTML = `
    <div class="profile-error">
      <i class="fas fa-exclamation-triangle"></i>
      <p>${message}</p>
    </div>
  `;
}

/**
 * Refresh profile data
 */
async function refreshProfileData() {
  await initProfileSidebar();
}

// Export functions for use in other scripts
window.profileSidebar = {
  init: initProfileSidebar,
  refresh: refreshProfileData,
  toggle: toggleProfileDetails
};
