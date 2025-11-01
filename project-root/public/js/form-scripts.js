// form-scripts.js - Script untuk semua halaman formulir

// ==================== FORMULIR DATA PRIBADI ====================
function initFormPribadi() {
  const user = app.requireAuth();
  if (!user) return;

  const form = document.getElementById('dataForm');
  if (!form) return;

  // Load saved data
  const savedData = app.getFormData('pribadi');
  if (savedData) {
    document.getElementById('namaLengkap').value = savedData.namaLengkap || '';
    document.getElementById('nik').value = savedData.nik || '';
    document.getElementById('tempatLahir').value = savedData.tempatLahir || '';
    document.getElementById('tanggalLahir').value = savedData.tanggalLahir || '';
    if (savedData.jenisKelamin) {
      document.querySelector(`input[name="jenisKelamin"][value="${savedData.jenisKelamin}"]`).checked = true;
    }
    document.getElementById('agama').value = savedData.agama || '';
    document.getElementById('noHP').value = savedData.noHP || '';
    document.getElementById('email').value = savedData.email || '';
    document.getElementById('alamat').value = savedData.alamat || '';
    document.getElementById('provinsi').value = savedData.provinsi || '';
    document.getElementById('kabupatenKota').value = savedData.kabupatenKota || '';
    document.getElementById('kecamatan').value = savedData.kecamatan || '';
    document.getElementById('kodePos').value = savedData.kodePos || '';
  }

  // Form submission
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const jenisKelaminEl = document.querySelector('input[name="jenisKelamin"]:checked');
    
    const formData = {
      namaLengkap: document.getElementById('namaLengkap').value,
      nik: document.getElementById('nik').value,
      tempatLahir: document.getElementById('tempatLahir').value,
      tanggalLahir: document.getElementById('tanggalLahir').value,
      jenisKelamin: jenisKelaminEl ? jenisKelaminEl.value : '',
      agama: document.getElementById('agama').value,
      noHP: document.getElementById('noHP').value,
      email: document.getElementById('email').value,
      alamat: document.getElementById('alamat').value,
      provinsi: document.getElementById('provinsi').value,
      kabupatenKota: document.getElementById('kabupatenKota').value,
      kecamatan: document.getElementById('kecamatan').value,
      kodePos: document.getElementById('kodePos').value
    };

    // Validate
    if (!formData.namaLengkap || !formData.nik || !formData.email) {
      app.showNotification('error', 'Error', 'Mohon lengkapi semua field yang diperlukan');
      return;
    }

    app.showLoading(true);

    // Save to database
    const result = await app.saveDataPribadi(user.id, formData);
    
    app.showLoading(false);

    if (result.success) {
      // Save to memory
      app.saveFormData('pribadi', formData);
    
    const result = await app.saveDataPribadi(user.id, formData);
    
    if (result.success) {
      app.showNotification('success', 'Berhasil', 'Draft berhasil disimpan!');
    } else {
      app.showNotification('error', 'Error', 'Gagal menyimpan draft');
    }
  };

  window.handlePrevious = function() {
    if (confirm('Kembali ke dashboard?')) {
      app.navigateTo('dashboard.html');
    }
  };
}

// ==================== FORMULIR DATA AKADEMIK ====================
function initFormAkademik() {
  const user = app.requireAuth();
  if (!user) return;

  const form = document.getElementById('akademikForm');
  if (!form) return;

  // Load saved data
  const savedData = app.getFormData('akademik');
  if (savedData) {
    document.getElementById('asalSekolah').value = savedData.asalSekolah || '';
    document.getElementById('nilaiRataRata').value = savedData.nilaiRataRata || '';
    document.getElementById('jurusanDipilih').value = savedData.jurusanDipilih || '';
    document.getElementById('prodiDipilih').value = savedData.prodiDipilih || '';
    document.getElementById('alamatSekolah').value = savedData.alamatSekolah || '';
  }

  // Form submission
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = {
      asalSekolah: document.getElementById('asalSekolah').value,
      nilaiRataRata: document.getElementById('nilaiRataRata').value,
      jurusanDipilih: document.getElementById('jurusanDipilih').value,
      prodiDipilih: document.getElementById('prodiDipilih').value,
      alamatSekolah: document.getElementById('alamatSekolah').value
    };

    if (!formData.asalSekolah || !formData.nilaiRataRata || !formData.jurusanDipilih) {
      app.showNotification('error', 'Error', 'Mohon lengkapi semua field');
      return;
    }

    app.showLoading(true);
    const result = await app.saveDataAkademik(user.id, formData);
    app.showLoading(false);

    if (result.success) {
      app.saveFormData('akademik', formData);
      app.showNotification('success', 'Berhasil', 'Data akademik berhasil disimpan!');
      
      setTimeout(() => {
        app.navigateTo('formulir_pendaftaran_dataorangtua.html');
      }, 1500);
    } else {
      app.showNotification('error', 'Error', result.message);
    }
  });

  window.handleSaveDraft = async function() {
    const formData = {
      asalSekolah: document.getElementById('asalSekolah').value,
      nilaiRataRata: document.getElementById('nilaiRataRata').value,
      jurusanDipilih: document.getElementById('jurusanDipilih').value,
      prodiDipilih: document.getElementById('prodiDipilih').value,
      alamatSekolah: document.getElementById('alamatSekolah').value
    };

    app.saveFormData('akademik', formData);
    const result = await app.saveDataAkademik(user.id, formData);
    
    if (result.success) {
      app.showNotification('success', 'Berhasil', 'Draft berhasil disimpan!');
    }
  };

  window.handlePrevious = function() {
    if (confirm('Kembali ke Data Pribadi?')) {
      app.navigateTo('formulir_pendaftaran.html');
    }
  };
}

// ==================== FORMULIR DATA ORANG TUA ====================
function initFormOrangTua() {
  const user = app.requireAuth();
  if (!user) return;

  const form = document.getElementById('orangTuaForm');
  if (!form) return;

  // Load saved data
  const savedData = app.getFormData('orangTua');
  if (savedData) {
    document.getElementById('namaAyah').value = savedData.namaAyah || '';
    document.getElementById('pekerjaanAyah').value = savedData.pekerjaanAyah || '';
    document.getElementById('noTeleponAyah').value = savedData.noTeleponAyah || '';
    document.getElementById('pendidikanAyah').value = savedData.pendidikanAyah || '';
    document.getElementById('namaIbu').value = savedData.namaIbu || '';
    document.getElementById('pekerjaanIbu').value = savedData.pekerjaanIbu || '';
    document.getElementById('noTeleponIbu').value = savedData.noTeleponIbu || '';
    document.getElementById('pendidikanIbu').value = savedData.pendidikanIbu || '';
    document.getElementById('alamatOrangTua').value = savedData.alamatOrangTua || '';
    document.getElementById('penghasilanOrtu').value = savedData.penghasilanOrtu || '';
    document.getElementById('jumlahTanggungan').value = savedData.jumlahTanggungan || '';
  }

  // Form submission
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = {
      namaAyah: document.getElementById('namaAyah').value,
      pekerjaanAyah: document.getElementById('pekerjaanAyah').value,
      noTeleponAyah: document.getElementById('noTeleponAyah').value,
      pendidikanAyah: document.getElementById('pendidikanAyah').value,
      namaIbu: document.getElementById('namaIbu').value,
      pekerjaanIbu: document.getElementById('pekerjaanIbu').value,
      noTeleponIbu: document.getElementById('noTeleponIbu').value,
      pendidikanIbu: document.getElementById('pendidikanIbu').value,
      alamatOrangTua: document.getElementById('alamatOrangTua').value,
      penghasilanOrtu: document.getElementById('penghasilanOrtu').value,
      jumlahTanggungan: document.getElementById('jumlahTanggungan').value
    };

    if (!formData.namaAyah || !formData.namaIbu) {
      app.showNotification('error', 'Error', 'Mohon lengkapi data orang tua');
      return;
    }

    app.showLoading(true);
    const result = await app.saveDataOrangTua(user.id, formData);
    app.showLoading(false);

    if (result.success) {
      app.saveFormData('orangTua', formData);
      app.showNotification('success', 'Berhasil', 'Data orang tua berhasil disimpan!');
      
      setTimeout(() => {
        app.navigateTo('formulir_pendaftaran_uploaddokumen.html');
      }, 1500);
    } else {
      app.showNotification('error', 'Error', result.message);
    }
  });

  window.handleSaveDraft = async function() {
    const formData = {
      namaAyah: document.getElementById('namaAyah').value,
      pekerjaanAyah: document.getElementById('pekerjaanAyah').value,
      noTeleponAyah: document.getElementById('noTeleponAyah').value,
      pendidikanAyah: document.getElementById('pendidikanAyah').value,
      namaIbu: document.getElementById('namaIbu').value,
      pekerjaanIbu: document.getElementById('pekerjaanIbu').value,
      noTeleponIbu: document.getElementById('noTeleponIbu').value,
      pendidikanIbu: document.getElementById('pendidikanIbu').value,
      alamatOrangTua: document.getElementById('alamatOrangTua').value,
      penghasilanOrtu: document.getElementById('penghasilanOrtu').value,
      jumlahTanggungan: document.getElementById('jumlahTanggungan').value
    };

    app.saveFormData('orangTua', formData);
    const result = await app.saveDataOrangTua(user.id, formData);
    
    if (result.success) {
      app.showNotification('success', 'Berhasil', 'Draft berhasil disimpan!');
    }
  };

  window.handlePrevious = function() {
    if (confirm('Kembali ke Data Akademik?')) {
      app.navigateTo('formulir_pendaftaran_dataakademik.html');
    }
  };

  // Phone validation
  ['noTeleponAyah', 'noTeleponIbu'].forEach(id => {
    document.getElementById(id).addEventListener('input', function(e) {
      this.value = this.value.replace(/[^0-9]/g, '');
    });
  });
}

// ==================== FORMULIR UPLOAD DOKUMEN ====================
function initFormUpload() {
  const user = app.requireAuth();
  if (!user) return;

  const form = document.getElementById('uploadForm');
  if (!form) return;

  const uploadedFiles = {
    ijazah: null,
    kk: null,
    akta: null,
    pasFoto: null
  };

  // Load saved data
  const savedData = app.getFormData('uploads');
  if (savedData) {
    Object.keys(savedData).forEach(type => {
      if (savedData[type]) {
        uploadedFiles[type] = savedData[type];
        const card = document.getElementById(`${type}Card`);
        const info = document.getElementById(`${type}Info`);
        if (card && info) {
          card.classList.add('uploaded');
          info.textContent = `✓ ${savedData[type].name}`;
        }
      }
    });
  }

  window.handleFileUpload = function(type, input) {
    const file = input.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      app.showNotification('error', 'Error', 'Ukuran file maksimal 2 MB');
      input.value = '';
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      app.showNotification('error', 'Error', 'Format file tidak didukung');
      input.value = '';
      return;
    }

    uploadedFiles[type] = {
      name: file.name,
      size: file.size,
      type: file.type
    };

    const card = document.getElementById(`${type}Card`);
    const info = document.getElementById(`${type}Info`);
    card.classList.add('uploaded');
    info.textContent = `✓ ${file.name} (${app.formatFileSize(file.size)})`;

    app.saveFormData('uploads', uploadedFiles);
    checkAllFilesUploaded();
  };

  window.removeFile = function(type) {
    uploadedFiles[type] = null;
    const card = document.getElementById(`${type}Card`);
    const info = document.getElementById(`${type}Info`);
    const input = document.getElementById(`${type}Input`);
    
    card.classList.remove('uploaded');
    info.textContent = '';
    input.value = '';

    app.saveFormData('uploads', uploadedFiles);
    checkAllFilesUploaded();
  };

  function checkAllFilesUploaded() {
    const allUploaded = Object.values(uploadedFiles).every(file => file !== null);
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = !allUploaded;
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const allUploaded = Object.values(uploadedFiles).every(file => file !== null);
    if (!allUploaded) {
      app.showNotification('error', 'Error', 'Mohon upload semua dokumen');
      return;
    }

    app.saveFormData('uploads', uploadedFiles);
    app.showNotification('success', 'Berhasil', 'Dokumen berhasil diupload!');
    
    setTimeout(() => {
      app.navigateTo('formulir_pendaftaran_reviewandsubmit.html');
    }, 1500);
  });

  window.handleSaveDraft = function() {
    app.saveFormData('uploads', uploadedFiles);
    app.showNotification('success', 'Berhasil', 'Draft berhasil disimpan!');
  };

  window.handlePrevious = function() {
    if (confirm('Kembali ke Data Orang Tua?')) {
      app.navigateTo('formulir_pendaftaran_dataorangtua.html');
    }
  };

  checkAllFilesUploaded();
}

// ==================== FORMULIR REVIEW & SUBMIT ====================
function initFormReview() {
  const user = app.requireAuth();
  if (!user) return;

  const form = document.getElementById('reviewForm');
  if (!form) return;

  // Load all data
  const allData = app.getAllFormData();

  // Display Data Pribadi
  if (allData.pribadi) {
    document.getElementById('namaPribadi').textContent = allData.pribadi.namaLengkap || '-';
    document.getElementById('nikPribadi').textContent = allData.pribadi.nik || '-';
    document.getElementById('tempatLahir').textContent = allData.pribadi.tempatLahir || '-';
    document.getElementById('tanggalLahir').textContent = app.formatDate(allData.pribadi.tanggalLahir) || '-';
    document.getElementById('jenisKelamin').textContent = allData.pribadi.jenisKelamin || '-';
    document.getElementById('email').textContent = allData.pribadi.email || '-';
  }

  // Display Data Akademik
  if (allData.akademik) {
    document.getElementById('asalSekolah').textContent = allData.akademik.asalSekolah || '-';
    document.getElementById('nilaiRataRata').textContent = allData.akademik.nilaiRataRata || '-';
    document.getElementById('jurusanDipilih').textContent = allData.akademik.jurusanDipilih || '-';
    document.getElementById('prodiDipilih').textContent = allData.akademik.prodiDipilih || '-';
  }

  // Display Data Orang Tua
  if (allData.orangTua) {
    document.getElementById('namaAyah').textContent = allData.orangTua.namaAyah || '-';
    document.getElementById('pekerjaanAyah').textContent = allData.orangTua.pekerjaanAyah || '-';
    document.getElementById('namaIbu').textContent = allData.orangTua.namaIbu || '-';
    document.getElementById('pekerjaanIbu').textContent = allData.orangTua.pekerjaanIbu || '-';
    document.getElementById('penghasilanOrtu').textContent = allData.orangTua.penghasilanOrtu || '-';
    document.getElementById('jumlahTanggungan').textContent = allData.orangTua.jumlahTanggungan || '-';
  }

  // Display Dokumen
  if (allData.uploads) {
    document.getElementById('ijazahFile').textContent = allData.uploads.ijazah ? `✓ ${allData.uploads.ijazah.name}` : '-';
    document.getElementById('kkFile').textContent = allData.uploads.kk ? `✓ ${allData.uploads.kk.name}` : '-';
    document.getElementById('aktaFile').textContent = allData.uploads.akta ? `✓ ${allData.uploads.akta.name}` : '-';
    document.getElementById('pasFotoFile').textContent = allData.uploads.pasFoto ? `✓ ${allData.uploads.pasFoto.name}` : '-';
  }

  window.toggleSection = function(sectionName) {
    const section = document.getElementById(`${sectionName}Section`);
    section.classList.toggle('expanded');
  };

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!allData.pribadi || !allData.akademik || !allData.orangTua || !allData.uploads) {
      app.showNotification('error', 'Error', 'Data tidak lengkap!');
      return;
    }

    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
    submitBtn.disabled = true;

    const result = await app.submitFinal(user.id);

    if (result.success) {
      document.getElementById('successModal').classList.add('show');
      app.updateProgressBar();
    } else {
      app.showNotification('error', 'Error', result.message);
      submitBtn.innerHTML = 'Submit <i class="fas fa-paper-plane"></i>';
      submitBtn.disabled = false;
    }
  });

  window.handlePrevious = function() {
    if (confirm('Kembali ke Upload Dokumen?')) {
      app.navigateTo('formulir_pendaftaran_uploaddokumen.html');
    }
  };

  window.handleSaveDraft = function() {
    app.showNotification('success', 'Berhasil', 'Draft berhasil disimpan!');
  };

  window.goToDashboard = function() {
    app.clearAllFormData();
    app.navigateTo('dashboard.html');
  };

  // Auto expand first section
  setTimeout(() => {
    document.getElementById('pribadiSection').classList.add('expanded');
  }, 500);
}

// ==================== DASHBOARD ====================
function initDashboard() {
  const user = app.requireAuth();
  if (!user) return;

  // Update progress
  app.updateProgressBar();

  // Continue form button
  window.handleContinueForm = function() {
    app.navigateTo('formulir_pendaftaran.html');
  };

  // Notification button
  const notifBtn = document.querySelector('.notification-btn');
  if (notifBtn) {
    notifBtn.addEventListener('click', function() {
      app.showNotification('info', 'Info', 'Tidak ada notifikasi baru');
    });
  }

  // Animate progress bar
  window.addEventListener('load', function() {
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
      const currentWidth = progressFill.style.width;
      progressFill.style.width = '0%';
      setTimeout(() => {
        progressFill.style.width = currentWidth;
      }, 100);
    }
  });
}

// ==================== AUTO INITIALIZE ====================
document.addEventListener('DOMContentLoaded', function() {
  const path = window.location.pathname;
  const page = path.split('/').pop();

  switch(page) {
    case 'formulir_pendaftaran.html':
      initFormPribadi();
      break;
    case 'formulir_pendaftaran_dataakademik.html':
      initFormAkademik();
      break;
    case 'formulir_pendaftaran_dataorangtua.html':
      initFormOrangTua();
      break;
    case 'formulir_pendaftaran_uploaddokumen.html':
      initFormUpload();
      break;
    case 'formulir_pendaftaran_reviewandsubmit.html':
      initFormReview();
      break;
    case 'dashboard.html':
      initDashboard();
      break;
  }
});pribadi', formData);
      app.showNotification('success', 'Berhasil', 'Data pribadi berhasil disimpan!');
      
      setTimeout(() => {
        app.navigateTo('formulir_pendaftaran_dataakademik.html');
      }, 1500);
    } else {
      app.showNotification('error', 'Error', result.message);
    }
  });

  // Save draft button
  window.handleSaveDraft = async function() {
    const jenisKelaminEl = document.querySelector('input[name="jenisKelamin"]:checked');
    
    const formData = {
      namaLengkap: document.getElementById('namaLengkap').value,
      nik: document.getElementById('nik').value,
      tempatLahir: document.getElementById('tempatLahir').value,
      tanggalLahir: document.getElementById('tanggalLahir').value,
      jenisKelamin: jenisKelaminEl ? jenisKelaminEl.value : '',
      agama: document.getElementById('agama').value,
      noHP: document.getElementById('noHP').value,
      email: document.getElementById('email').value,
      alamat: document.getElementById('alamat').value,
      provinsi: document.getElementById('provinsi').value,
      kabupatenKota: document.getElementById('kabupatenKota').value,
      kecamatan: document.getElementById('kecamatan').value,
      kodePos: document.getElementById('kodePos').value
    };

    app.saveFormData('