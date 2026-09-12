/**
 * Main Interaction Logic
 * Rising Women of Virtue - Non-Profit Organization
 */

document.addEventListener("DOMContentLoaded", function() {
  
  // ==========================================================================
  // 1. Sticky Header Scroll Effect
  // ==========================================================================
  const header = document.getElementById("main-header");
  
  // Some pages (like subpages) have header with 'scrolled' class pre-set to avoid jarring overlay.
  // We only toggle based on scroll if it's on the homepage, or always check scroll position.
  function checkScroll() {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      // Only remove if it's the homepage hero section (where we want overlay style)
      // We can check if the current page has a hero-home element
      if (document.querySelector(".hero-home")) {
        header.classList.remove("scrolled");
      }
    }
  }
  
  // Initialize scroll state
  checkScroll();
  window.addEventListener("scroll", checkScroll);

  // ==========================================================================
  // 2. Mobile Menu Toggle & Overlay
  // ==========================================================================
  const mobileToggle = document.getElementById("mobile-toggle");
  const navMenu = document.getElementById("nav-menu");
  
  if (mobileToggle && navMenu) {
    // Create backdrop overlay element dynamically if not present
    let backdrop = document.querySelector(".nav-backdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "nav-backdrop";
      document.body.appendChild(backdrop);
    }
    
    function toggleMenu(show) {
      const isOpen = show !== undefined ? show : !navMenu.classList.contains("open");
      mobileToggle.classList.toggle("open", isOpen);
      navMenu.classList.toggle("open", isOpen);
      backdrop.classList.toggle("active", isOpen);
      document.body.classList.toggle("menu-open", isOpen);
    }
    
    mobileToggle.addEventListener("click", function(e) {
      e.stopPropagation();
      toggleMenu();
    });
    
    backdrop.addEventListener("click", function() {
      toggleMenu(false);
    });
    
    // Close menu when clicking links
    const navLinks = document.querySelectorAll(".nav-link, .nav-cta");
    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        toggleMenu(false);
      });
    });
  }

  // ==========================================================================
  // 3. Scroll-Driven Fade In Animations (Intersection Observer)
  // ==========================================================================
  const animatedElements = document.querySelectorAll(".fade-in-element");
  
  if ("IntersectionObserver" in window) {
    const animationObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          // Once animated, we don't need to observe it anymore
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null, // use viewport
      threshold: 0.15, // trigger when 15% of the element is visible
      rootMargin: "0px 0px -50px 0px" // trigger slightly before entering viewport fully
    });
    
    animatedElements.forEach(element => {
      // Remove the pre-set visible class on load so observer can trigger it (except if element is above the fold)
      const rect = element.getBoundingClientRect();
      if (rect.top > window.innerHeight) {
        element.classList.remove("visible");
      }
      animationObserver.observe(element);
    });
  } else {
    // Fallback: make all visible if observer is not supported
    animatedElements.forEach(element => {
      element.classList.add("visible");
    });
  }

  // ==========================================================================
  // 4. Navigation Menu Active Highlight Loop
  // ==========================================================================
  const currentPath = window.location.pathname.split("/").pop();
  const navLinks = document.querySelectorAll(".nav-link");
  
  navLinks.forEach(link => {
    const linkPath = link.getAttribute("href");
    if (linkPath === currentPath) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
    
    // Default to active on home if path is empty
    if (currentPath === "" && linkPath === "index.html") {
      link.classList.add("active");
    }
  });

  // ==========================================================================
  // 5. Dynamic Lavender Petal Spawner
  // ==========================================================================
  const petalContainers = document.querySelectorAll(".petal-container");
  if (petalContainers.length > 0) {
    petalContainers.forEach(container => {
      const petalCount = 45; // Increased density of falling leaves/petals
      for (let i = 0; i < petalCount; i++) {
        createPetal(container);
      }
    });
  }

  function createPetal(container) {
    const petal = document.createElement("div");
    petal.classList.add("petal");
    
    // Randomize starting properties for organic motion
    const startLeft = Math.random() * 100; // 0% to 100% width
    const animationDelay = Math.random() * -25; // negative delay so they are pre-spawned and continuous
    const animationDuration = 10 + Math.random() * 14; // 10s to 24s speed
    const size = 12 + Math.random() * 20; // 12px to 32px size
    const rotation = Math.random() * 360; // 0deg to 360deg
    
    // Apply styling rules
    petal.style.left = `${startLeft}%`;
    petal.style.width = `${size}px`;
    petal.style.height = `${size * 0.75}px`; // oval leaf petal shape
    petal.style.animationDelay = `${animationDelay}s`;
    petal.style.animationDuration = `${animationDuration}s`;
    petal.style.transform = `rotate(${rotation}deg)`;
    
    // Apply random brand colors
    const colors = [
      "linear-gradient(135deg, var(--color-terracotta) 0%, var(--color-sage) 100%)", 
      "linear-gradient(135deg, var(--color-sage-light) 0%, var(--color-terracotta) 100%)", 
      "linear-gradient(135deg, var(--color-gold) 0%, var(--color-terracotta) 100%)",
      "linear-gradient(135deg, #C57B91 0%, #531B3F 100%)"
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    petal.style.background = randomColor;

    container.appendChild(petal);
  }

});
