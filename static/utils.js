// Utility Functions for Portfolio

// Load profile images from data file
function loadProfileImages() {
  if (typeof PROFILE_IMAGES !== 'undefined' && PROFILE_IMAGES.length > 0) {
    return PROFILE_IMAGES.map(img => `images/profile/${img}`);
  }
  
  // Fallback if data file not loaded
  console.warn('PROFILE_IMAGES not found. Make sure data/profile-images.js is loaded.');
  return [];
}

// Initialize profile avatar with rotation
function initProfileAvatar() {
  const avatarInner = document.querySelector('.avatar-inner');
  if (!avatarInner) return;
  
  const imagePaths = loadProfileImages();
  if (imagePaths.length === 0) {
    showFallback();
    return;
  }
  
  let loadedImages = [];
  let loadedCount = 0;
  let totalImages = imagePaths.length;
  
  // Try to load each image
  imagePaths.forEach((imagePath, index) => {
    const img = document.createElement('img');
    img.src = imagePath;
    img.alt = `Profile ${index + 1}`;
    img.className = 'avatar-image';
    
    img.onload = function() {
      loadedCount++;
      loadedImages.push(img);
      avatarInner.appendChild(img);
      
      // Show first loaded image immediately
      if (loadedImages.length === 1) {
        img.classList.add('active');
      }
      
      // Start rotation when we have multiple images loaded
      if (loadedImages.length === 3) {
        startAvatarRotation();
      }
    };
    
    img.onerror = function() {
      console.warn(`Failed to load: ${imagePath}`);
      loadedCount++;
      
      // If all images failed, show fallback
      if (loadedCount >= totalImages && loadedImages.length === 0) {
        showFallback();
      }
    };
  });
}

// Show fallback avatar
function showFallback() {
  const avatarInner = document.querySelector('.avatar-inner');
  if (avatarInner) {
    avatarInner.classList.add('show-fallback');
  }
}

// Rotate avatar images
function startAvatarRotation() {
  const avatarImages = document.querySelectorAll('.avatar-image');
  if (avatarImages.length <= 1) return;
  
  let currentIndex = 0;
  
  setInterval(() => {
    if (avatarImages.length === 0) return;
    
    // Hide current
    avatarImages[currentIndex].classList.remove('active');
    
    // Next image
    currentIndex = (currentIndex + 1) % avatarImages.length;
    
    // Show next
    avatarImages[currentIndex].classList.add('active');
  }, 3000); // Rotate every 3 seconds
}

// Starfield Canvas Animation
function initStarfield() {
  const canvas = document.getElementById('starfield-canvas');
  if (!canvas) {
    console.warn('Starfield canvas not found');
    return;
  }
  
  const ctx = canvas.getContext('2d');
  let width, height;
  let stars = [];

  function initCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    stars = [];
    
    const starCount = width < 768 ? 50 : 100; // Fewer stars on mobile
    
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5
      });
    }
  }

  function drawStars() {
    ctx.clearRect(0, 0, width, height);
    
    const connectionDistance = 120;
    const maxConnectionsPerStar = 3; // Limit connections for performance
    
    // Draw connections (optimized)
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < stars.length; i++) {
      let connectionsCount = 0;
      
      for (let j = i + 1; j < stars.length && connectionsCount < maxConnectionsPerStar; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < connectionDistance) {
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.stroke();
          connectionsCount++;
        }
      }
    }

    // Draw stars
    ctx.fillStyle = '#ffffff';
    stars.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      
      s.x += s.dx;
      s.y += s.dy;
      if (s.x < 0) s.x = width;
      if (s.x > width) s.x = 0;
      if (s.y < 0) s.y = height;
      if (s.y > height) s.y = 0;
    });

    requestAnimationFrame(drawStars);
  }

  initCanvas();
  drawStars();
  
  // Debounce resize event
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(initCanvas, 250);
  });
}

// Reveal animation on scroll
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  
  if (revealElements.length === 0) return;
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  }, { 
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));
}

// Mobile menu toggle
function initMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!menuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.add('hidden');
      }
    });
    
    // Close menu when clicking a link
    const menuLinks = mobileMenu.querySelectorAll('a');
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }
}

// Print CV (remove navbar before printing)
function setupPrintCV() {
  // Add print button if on CV page
  const cvPage = document.querySelector('.cv-page');
  if (cvPage) {
    window.addEventListener('beforeprint', () => {
      document.querySelector('nav')?.classList.add('no-print');
    });
    
    window.addEventListener('afterprint', () => {
      document.querySelector('nav')?.classList.remove('no-print');
    });
  }
}

// Initialize all utilities
function initPortfolio() {
  initStarfield();
  initScrollReveal();
  initMobileMenu();
  setupPrintCV();
  
  // Load profile images if on home page
  if (document.querySelector('.avatar-container')) {
    initProfileAvatar();
  }
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
  initPortfolio();
}
