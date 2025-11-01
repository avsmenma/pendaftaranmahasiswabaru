// app.js - Global JavaScript untuk semua halaman
const API_URL = 'http://localhost:3000';

// ==================== SESSION MANAGEMENT ====================
function getCurrentUser() {
  const userStr = sessionStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

function setCurrentUser(user) {
  sessionStorage.setItem('user', JSON.stringify(user));
}

function clearCurrentUser() {
  sessionStorage.removeItem('user');
}

function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return null;
  }
  return user;
}

// ==================== FORM DATA STORAGE ====================
window.formDataStorage = window.formDataStorage || {};

function saveFormData(step, data) {
  window.formDataStorage[step] = data;
  console.log('Data saved for step:', step);
}

function getFormData(step) {
  return window.formDataStorage[step] || null;
}

function getAllFormData() {
  return window.formDataStorage;
}

function clearAllFormData() {
  window.formDataStorage = {};
}

// ==================== API CALLS ====================
async function apiCall(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, message: 'Tidak dapat terhubung ke server' };
  }
}

// Save Data Pribadi
async function saveDataPribadi(userId, formData) {
  return await apiCall('/api/save-pribadi', 'POST', { userId, ...formData });
}

// Save Data Akademik
async function saveDataAkademik(userId, formData) {
  return await apiCall('/api/save-akademik', 'POST', { userId, ...formData });
}

// Save Data Orang Tua
async function saveDataOrangTua(userId, formData) {
  return await apiCall('/api/save-orangtua', 'POST', { userId, ...formData });
}

// Submit Final
async function submitFinal(userId) {
  return await apiCall('/api/submit-final', 'POST', { userId });
}

// Get User Data
async function getUserData(userId) {
  return await apiCall(`/api/user-data/${userId}`, 'GET');
}

// ==================== NOTIFICATION SYSTEM ====================
function showNotification(type, title, message) {
  const notification = document.getElementById('notification');
  if (!notification) {
    console.warn('Notification element not found');
    return;
  }

  const icon = notification.querySelector('i');
  const titleElement = document.getElementById('notification-title');
  const messageElement = document.getElementById('notification-message');
  
  if (titleElement) titleElement.textContent = title;
  if (messageElement) messageElement.textContent = message;
  
  notification.className = 'notification ' + type;
  
  if (icon) {
    if (type === 'success') {
      icon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
      icon.className = 'fas fa-exclamation-circle';
    } else if (type === 'info') {
      icon.className = 'fas fa-info-circle';
    }
  }
  
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// ==================== LOADING OVERLAY ====================
function showLoading(show) {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.style.display = show ? 'flex' : 'none';
  }
}

// ==================== PROFILE UPDATE ====================
function updateProfileInfo(user) {
  const profileName = document.querySelectorAll('.profile-name');
  const profileAvatar = document.querySelectorAll('.profile-avatar');
  const welcomeName = document.querySelector('.welcome-text h2');
  
  if (user) {
    const displayName = user.username.split('@')[0] || user.username;
    const initials = displayName.substring(0, 2).toUpperCase();
    
    profileName.forEach(el => {
      el.textContent = displayName;
    });
    
    profileAvatar.forEach(el => {
      el.textContent = initials;
    });
    
    if (welcomeName) {
      welcomeName.textContent = `Selamat Datang, ${displayName}`;
    }
  }
}

// ==================== NAVIGATION ====================
function navigateTo(page) {
  window.location.href = page;
}

function handleLogout() {
  if (confirm('Apakah Anda yakin ingin keluar?')) {
    clearCurrentUser();
    clearAllFormData();
    navigateTo('index.html');
  }
}

// ==================== FORM VALIDATION ====================
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validateRequired(fields) {
  for (let field of fields) {
    if (!field.value || field.value.trim() === '') {
      field.style.borderColor = '#ef4444';
      return false;
    } else {
      field.style.borderColor = '#e2e8f0';
    }
  }
  return true;
}

// ==================== PROGRESS CALCULATION ====================
function calculateProgress() {
  const formData = getAllFormData();
  let completedSteps = 0;
  const totalSteps = 4; // pribadi, akademik, orangtua, dokumen

  if (formData.pribadi) completedSteps++;
  if (formData.akademik) completedSteps++;
  if (formData.orangTua) completedSteps++;
  if (formData.uploads && Object.values(formData.uploads).every(file => file !== null)) {
    completedSteps++;
  }

  return Math.round((completedSteps / totalSteps) * 100);
}

function updateProgressBar() {
  const progress = calculateProgress();
  const progressFill = document.getElementById('progressFill');
  const progressPercentage = document.querySelector('.progress-percentage');
  
  if (progressFill) {
    progressFill.style.width = progress + '%';
  }
  
  if (progressPercentage) {
    progressPercentage.textContent = progress + '%';
  }
}

// ==================== MENU NAVIGATION ====================
function setupMenuNavigation() {
  const menuItems = document.querySelectorAll('.menu-item');
  menuItems.forEach(item => {
    // Remove href="#" to prevent default behavior
    if (item.getAttribute('href') === '#') {
      item.removeAttribute('href');
      item.style.cursor = 'pointer';
    }
    
    item.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // If href exists and is not #, navigate normally
      if (href && href !== '#') {
        return;
      }
      
      e.preventDefault();
      
      // Get menu text to determine navigation
      const menuText = this.querySelector('span').textContent.trim();
      
      switch(menuText) {
        case 'Dashboard':
          navigateTo('dashboard.html');
          break;
        case 'Formulir Pendaftaran':
          navigateTo('formulir_pendaftaran.html');
          break;
        case 'Informasi':
          showNotification('info', 'Info', 'Halaman Informasi sedang dalam pengembangan');
          break;
        case 'Pengumuman':
          showNotification('info', 'Info', 'Halaman Pengumuman sedang dalam pengembangan');
          break;
        case 'Profil':
          showNotification('info', 'Info', 'Halaman Profil sedang dalam pengembangan');
          break;
      }
    });
  });
  
  // Highlight active menu
  highlightActiveMenu();
}

function highlightActiveMenu() {
  const currentPage = window.location.pathname.split('/').pop();
  const menuItems = document.querySelectorAll('.menu-item');
  
  menuItems.forEach(item => {
    item.classList.remove('active');
    const menuText = item.querySelector('span')?.textContent.trim();
    
    if (currentPage === 'dashboard.html' && menuText === 'Dashboard') {
      item.classList.add('active');
    } else if (currentPage.includes('formulir_pendaftaran') && menuText === 'Formulir Pendaftaran') {
      item.classList.add('active');
    }
  });
}

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', function() {
  // Setup menu navigation
  setupMenuNavigation();
  
  // Update profile info if user is logged in
  const user = getCurrentUser();
  if (user) {
    updateProfileInfo(user);
  }
  
  // Setup logout buttons
  const logoutBtns = document.querySelectorAll('.logout-btn');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', handleLogout);
  });
});

// ==================== UTILITY FUNCTIONS ====================
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function animateCounter(elementId, target) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  let current = 0;
  const increment = target / 50;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current);
  }, 30);
}

// Export functions for use in other scripts
window.app = {
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser,
  requireAuth,
  saveFormData,
  getFormData,
  getAllFormData,
  clearAllFormData,
  saveDataPribadi,
  saveDataAkademik,
  saveDataOrangTua,
  submitFinal,
  getUserData,
  showNotification,
  showLoading,
  updateProfileInfo,
  navigateTo,
  handleLogout,
  validateEmail,
  validateRequired,
  calculateProgress,
  updateProgressBar,
  formatDate,
  formatFileSize,
  animateCounter,
  API_URL
};