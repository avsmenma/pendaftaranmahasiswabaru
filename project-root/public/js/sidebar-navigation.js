// sidebar-navigation.js - Script untuk navigasi sidebar

document.addEventListener('DOMContentLoaded', function() {
  
  // Setup sidebar navigation
  setupSidebarNavigation();
  
  // Highlight active menu based on current page
  highlightActiveMenu();
});

function setupSidebarNavigation() {
  const menuItems = document.querySelectorAll('.menu-item');
  
  menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      
      const icon = this.querySelector('i');
      const text = this.querySelector('span').textContent.trim();
      
      // Determine target page based on menu text
      let targetPage = '';
      
      switch(text) {
        case 'Dashboard':
          targetPage = 'dashboard.html';
          break;
        case 'Formulir Pendaftaran':
          targetPage = 'formulir_pendaftaran.html';
          break;
        case 'Informasi':
          alert('Halaman Informasi sedang dalam pengembangan');
          return;
        case 'Pengumuman':
          alert('Halaman Pengumuman sedang dalam pengembangan');
          return;
        case 'Profil':
          alert('Halaman Profil sedang dalam pengembangan');
          return;
        default:
          console.warn('Unknown menu item:', text);
          return;
      }
      
      // Navigate to target page
      if (targetPage) {
        window.location.href = targetPage;
      }
    });
  });
}

function highlightActiveMenu() {
  const currentPage = window.location.pathname.split('/').pop();
  const menuItems = document.querySelectorAll('.menu-item');
  
  menuItems.forEach(item => {
    item.classList.remove('active');
    
    const text = item.querySelector('span').textContent.trim();
    
    // Check which menu should be active
    if (currentPage === 'dashboard.html' && text === 'Dashboard') {
      item.classList.add('active');
    } else if (currentPage.includes('formulir_pendaftaran') && text === 'Formulir Pendaftaran') {
      item.classList.add('active');
    }
  });
}

// Export for use in other scripts
window.sidebarNav = {
  setupSidebarNavigation,
  highlightActiveMenu
};