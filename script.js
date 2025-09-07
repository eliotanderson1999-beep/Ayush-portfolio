// Enhanced Portfolio JavaScript - Complete & Optimized
// Author: Ayush Portfolio
// Version: 3.0 - Enhanced from existing codebase

class PortfolioManager {
  constructor() {
    this.currentSlide = 0;
    this.isTransitioning = false;
    this.autoPlayInterval = null;
    this.observers = new Map();
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.lastScrollY = 0;

    this.init();
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  async init() {
    try {
      await this.waitForDOM();

      // Initialize all components in order
      this.showLoadingScreen();
      this.initCarousel();
      this.initNavigation();
      this.initArtworkGallery();
      this.initContactForm();
      this.initScrollAnimations();
      this.initAccessibilityFeatures();
      this.initPerformanceOptimizations();
      this.initBackToTop();

      // Hide loading screen after initialization
      setTimeout(() => this.hideLoadingScreen(), 1500);
    } catch (error) {
      console.error("Portfolio initialization failed:", error);
      this.showNotification(
        "Some features may not work properly. Please refresh the page.",
        "error"
      );
    }
  }

  waitForDOM() {
    return new Promise((resolve) => {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", resolve);
      } else {
        resolve();
      }
    });
  }

  // ==========================================================================
  // LOADING SCREEN
  // ==========================================================================

  showLoadingScreen() {
    const loader = document.createElement("div");
    loader.id = "portfolio-loader";
    loader.innerHTML = `
      <div class="loader-content">
        <div class="loader-spinner"></div>
        <h3>Loading Ayush's Portfolio</h3>
        <p>Preparing beautiful art for you...</p>
      </div>
    `;

    const styles = `
      #portfolio-loader {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #8B0000, #DC143C);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        color: white;
        text-align: center;
        font-family: 'Inter', sans-serif;
      }
      
      .loader-content h3 {
        margin: 20px 0 10px;
        font-size: 1.5rem;
        font-weight: 600;
      }
      
      .loader-content p {
        margin: 0;
        opacity: 0.8;
      }
      
      .loader-spinner {
        width: 50px;
        height: 50px;
        border: 4px solid rgba(255,255,255,0.3);
        border-top: 4px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    document.body.appendChild(loader);
  }

  hideLoadingScreen() {
    const loader = document.getElementById("portfolio-loader");
    if (loader) {
      loader.style.opacity = "0";
      loader.style.transition = "opacity 0.5s ease";
      setTimeout(() => {
        loader.remove();
        this.showNotification("Portfolio loaded successfully!", "success");
      }, 500);
    }
  }

  // ==========================================================================
  // ENHANCED CAROUSEL
  // ==========================================================================

  initCarousel() {
    const slides = document.querySelectorAll(".carousel-slide");
    const indicators = document.querySelectorAll(".indicator");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const heroSection = document.querySelector(".hero");

    if (!slides.length) return;

    // Preload images
    this.preloadCarouselImages(slides);

    // Set up controls
    this.setupCarouselControls(prevBtn, nextBtn, indicators, heroSection);

    // Initialize first slide
    this.showSlide(0);
    this.startAutoPlay();

    // Handle visibility changes
    document.addEventListener("visibilitychange", () => {
      document.hidden ? this.stopAutoPlay() : this.startAutoPlay();
    });
  }

  preloadCarouselImages(slides) {
    slides.forEach((slide, index) => {
      const bgImage = slide.dataset.bg;
      if (bgImage) {
        const img = new Image();
        img.onload = () => {
          slide.style.backgroundImage = `url('${bgImage}')`;
          slide.style.backgroundSize = "cover";
          slide.style.backgroundPosition = "center";
          slide.style.backgroundRepeat = "no-repeat";
          slide.classList.add("loaded");
        };
        img.onerror = () => {
          console.warn(`Failed to load carousel image: ${bgImage}`);
          slide.classList.add("error");
        };
        img.src = bgImage;
      }
    });
  }

  setupCarouselControls(prevBtn, nextBtn, indicators, heroSection) {
    // Navigation buttons
    prevBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      this.previousSlide();
    });

    nextBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      this.nextSlide();
    });

    // Indicators
    indicators.forEach((indicator, index) => {
      indicator.addEventListener("click", (e) => {
        e.preventDefault();
        this.showSlide(index);
      });
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (this.isInputFocused()) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          this.previousSlide();
          break;
        case "ArrowRight":
          e.preventDefault();
          this.nextSlide();
          break;
      }
    });

    // Touch/swipe support
    if (heroSection) {
      heroSection.addEventListener(
        "touchstart",
        (e) => {
          this.touchStartX = e.touches[0].clientX;
          this.touchStartY = e.touches[0].clientY;
        },
        { passive: true }
      );

      heroSection.addEventListener(
        "touchend",
        (e) => {
          if (!this.touchStartX || !this.touchStartY) return;

          const touchEndX = e.changedTouches[0].clientX;
          const touchEndY = e.changedTouches[0].clientY;
          const deltaX = this.touchStartX - touchEndX;
          const deltaY = this.touchStartY - touchEndY;

          // Only handle horizontal swipes
          if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            deltaX > 0 ? this.nextSlide() : this.previousSlide();
          }

          this.touchStartX = this.touchStartY = 0;
        },
        { passive: true }
      );

      // Pause autoplay on hover/focus
      heroSection.addEventListener("mouseenter", () => this.stopAutoPlay());
      heroSection.addEventListener("mouseleave", () => this.startAutoPlay());
      heroSection.addEventListener("focusin", () => this.stopAutoPlay());
      heroSection.addEventListener("focusout", () => this.startAutoPlay());
    }
  }

  showSlide(index) {
    if (this.isTransitioning) return;

    const slides = document.querySelectorAll(".carousel-slide");
    const indicators = document.querySelectorAll(".indicator");

    if (!slides[index]) return;

    this.isTransitioning = true;
    this.currentSlide = index;

    // Update slides
    slides.forEach((slide, i) => {
      slide.classList.remove("active", "prev");
      if (i < index) slide.classList.add("prev");
      if (i === index) slide.classList.add("active");
    });

    // Update indicators
    indicators.forEach((indicator, i) => {
      indicator.classList.toggle("active", i === index);
    });

    // Reset transition flag
    setTimeout(() => {
      this.isTransitioning = false;
    }, 1000);
  }

  nextSlide() {
    if (this.isTransitioning) return;
    const slides = document.querySelectorAll(".carousel-slide");
    this.currentSlide = (this.currentSlide + 1) % slides.length;
    this.showSlide(this.currentSlide);
  }

  previousSlide() {
    if (this.isTransitioning) return;
    const slides = document.querySelectorAll(".carousel-slide");
    this.currentSlide = (this.currentSlide - 1 + slides.length) % slides.length;
    this.showSlide(this.currentSlide);
  }

  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayInterval = setInterval(() => this.nextSlide(), 5000);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  // ==========================================================================
  // NAVIGATION SYSTEM
  // ==========================================================================

  initNavigation() {
    const navbar = document.getElementById("navbar");
    const navLinks = document.querySelectorAll('nav a[href^="#"]');

    if (!navbar || !navLinks.length) return;

    this.setupSmoothScrolling(navLinks, navbar);
    this.setupActiveNavigation(navLinks);
    this.setupNavbarBehavior(navbar);
  }

  setupSmoothScrolling(navLinks, navbar) {
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();

        const targetId = link.getAttribute("href");
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
          const offsetTop = targetSection.offsetTop - navbar.offsetHeight;

          window.scrollTo({
            top: offsetTop,
            behavior: "smooth",
          });

          // Update URL without triggering scroll
          history.pushState(null, null, targetId);
        }
      });
    });
  }

  setupActiveNavigation(navLinks) {
    const updateActiveNav = this.throttle(() => {
      const sections = document.querySelectorAll("section[id]");
      const scrollPos = window.scrollY + 150;

      sections.forEach((section) => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute("id");
        const navLink = document.querySelector(`nav a[href="#${id}"]`);

        if (scrollPos >= top && scrollPos < top + height) {
          navLinks.forEach((link) => link.classList.remove("active"));
          navLink?.classList.add("active");
        }
      });
    }, 100);

    window.addEventListener("scroll", updateActiveNav, { passive: true });
  }

  setupNavbarBehavior(navbar) {
    const updateNavbar = () => {
      const currentScrollY = window.scrollY;

      if (Math.abs(currentScrollY - this.lastScrollY) > 10) {
        if (currentScrollY > this.lastScrollY && currentScrollY > 100) {
          navbar.style.transform = "translateY(-100%)";
        } else {
          navbar.style.transform = "translateY(0)";
        }
        this.lastScrollY = currentScrollY;
      }
    };

    const throttledUpdate = this.throttle(updateNavbar, 100);
    window.addEventListener("scroll", throttledUpdate, { passive: true });
  }

  // ==========================================================================
  // ARTWORK GALLERY
  // ==========================================================================

  initArtworkGallery() {
    const galleryData = this.getGalleryData();
    const categoryBtns = document.querySelectorAll(".category-btn");

    if (!categoryBtns.length) return;

    this.setupGalleryControls(categoryBtns, galleryData);
    this.setupGalleryModals();
  }

  getGalleryData() {
    return {
      abstract: {
        title: "Abstract Acrylic",
        images: [
          "./assets/Abstract-Acrylic.jpg",
          "./assets/Abstract-Acrylic-2.jpg",
          "./assets/Abstract-Acrylic-3.jpg",
          "./assets/Abstract-Acrylic-4.jpg",
          "./assets/Abstract-Acrylic-5.jpg",
        ],
      },
      "bw-portrait": {
        title: "Black and White Portrait",
        images: [
          "./assets/Black & White potrait.jpg",
          "./assets/Black & White potrait-2.jpg",
          "./assets/Black & White potrait-3.png",
        ],
      },
      "color-portrait": {
        title: "Colour Portrait",
        images: ["/assets/coloyr-portrait.jpg"],
      },
      watercolor: {
        title: "Water Colour",
        images: [
          "./assets/Water-Colour.jpg",
          "./assets/Water-Colour-2.jpg",
          "./assets/Water-Colour-3.jpg",
        ],
      },
    };
  }

  setupGalleryControls(categoryBtns, galleryData) {
    categoryBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const category = btn.dataset.category;
        const data = galleryData[category];

        if (data) {
          this.showGallery(data);
        }
      });
    });
  }

  setupGalleryModals() {
    const galleryModal = document.getElementById("galleryModal");
    const imageModal = document.getElementById("imageModal");
    const closeButtons = document.querySelectorAll(".close-btn");

    // Close button handlers
    closeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.closeActiveModal();
      });
    });

    // Outside click handlers
    [galleryModal, imageModal].forEach((modal) => {
      modal?.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closeActiveModal();
        }
      });
    });

    // Keyboard handlers
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeActiveModal();
      }
    });
  }

  showGallery(data) {
    const galleryModal = document.getElementById("galleryModal");
    const modalTitle = document.getElementById("modalTitle");
    const galleryGrid = document.getElementById("galleryGrid");

    if (!galleryModal || !galleryGrid) return;

    // Set title
    if (modalTitle) modalTitle.textContent = data.title;

    // Clear and populate grid
    galleryGrid.innerHTML = "";

    data.images.forEach((imageUrl, index) => {
      const galleryItem = this.createGalleryItem(imageUrl, data.title, index);
      galleryGrid.appendChild(galleryItem);
    });

    // Show modal
    galleryModal.classList.add("active");
    document.body.style.overflow = "hidden";

    // Focus first item
    const firstItem = galleryGrid.querySelector(".gallery-item");
    setTimeout(() => firstItem?.focus(), 100);
  }

  createGalleryItem(imageUrl, title, index) {
    const galleryItem = document.createElement("div");
    galleryItem.className = "gallery-item";
    galleryItem.innerHTML = `
      <img src="${imageUrl}" alt="${title} ${index + 1}" loading="lazy">
      <div class="gallery-item-overlay">
        <i class="fas fa-expand-alt"></i>
      </div>
    `;

    // Add interaction handlers
    const showFullImage = () =>
      this.showFullImage(imageUrl, `${title} ${index + 1}`);

    galleryItem.addEventListener("click", showFullImage);
    galleryItem.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        showFullImage();
      }
    });

    // Make focusable
    galleryItem.setAttribute("tabindex", "0");
    galleryItem.setAttribute("role", "button");

    return galleryItem;
  }

  showFullImage(imageUrl, alt) {
    const imageModal = document.getElementById("imageModal");
    const modalImage = document.getElementById("modalImage");

    if (!imageModal || !modalImage) return;

    modalImage.src = imageUrl;
    modalImage.alt = alt;
    imageModal.classList.add("active");

    // Focus close button
    const closeBtn = imageModal.querySelector(".close-btn");
    setTimeout(() => closeBtn?.focus(), 100);
  }

  closeActiveModal() {
    const modals = document.querySelectorAll(
      ".gallery-modal.active, .image-modal.active"
    );
    modals.forEach((modal) => modal.classList.remove("active"));
    document.body.style.overflow = "auto";
  }

  // ==========================================================================
  // CONTACT FORM
  // ==========================================================================

  initContactForm() {
    const form = document.getElementById("commissionForm");
    if (!form) return;

    this.setupFormValidation(form);
    this.setupFormSubmission(form);
  }

  setupFormValidation(form) {
    const inputs = form.querySelectorAll("input, textarea");

    inputs.forEach((input) => {
      input.addEventListener("blur", () => this.validateField(input));
      input.addEventListener("input", () => this.clearFieldError(input.name));
    });
  }

  setupFormSubmission(form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (await this.handleFormSubmission(form)) {
        this.resetForm(form);
        this.showNotification(
          "Commission request sent successfully!",
          "success"
        );
      }
    });
  }

  async handleFormSubmission(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Validate all fields
    if (!this.validateForm(data)) {
      this.showNotification("Please fix the errors above", "error");
      return false;
    }

    // Show loading state
    const submitBtn = form.querySelector(".submit-btn");
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;

    try {
      // Handle submission based on whether photo is attached
      const photoFile = formData.get("photo");
      const hasPhoto = photoFile && photoFile.name && photoFile.size > 0;

      if (hasPhoto) {
        this.showSubmissionOptions(data, photoFile);
      } else {
        this.sendToWhatsApp(data);
      }

      return true;
    } catch (error) {
      console.error("Form submission error:", error);
      this.showNotification(
        "Failed to send request. Please try again.",
        "error"
      );
      return false;
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }

  validateForm(data) {
    let isValid = true;

    const validators = {
      name: (value) => value.trim().length >= 2,
      email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
      mobile: (value) => /^\+?[\d\s\-()]{8,15}$/.test(value.trim()),
      message: (value) => value.trim().length >= 20,
    };

    const errorMessages = {
      name: "Name must be at least 2 characters",
      email: "Please enter a valid email address",
      mobile: "Please enter a valid mobile number",
      message: "Please provide more details (minimum 20 characters)",
    };

    Object.entries(validators).forEach(([field, validator]) => {
      if (!validator(data[field] || "")) {
        this.showFieldError(field, errorMessages[field]);
        isValid = false;
      }
    });

    return isValid;
  }

  validateField(field) {
    const value = field.value.trim();
    const name = field.name;

    this.clearFieldError(name);

    const validators = {
      name: () => value.length >= 2,
      email: () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      mobile: () => /^\+?[\d\s\-()]{8,15}$/.test(value),
      message: () => value.length >= 20,
    };

    const errorMessages = {
      name: value ? "Name must be at least 2 characters" : "Name is required",
      email: value ? "Please enter a valid email address" : "Email is required",
      mobile: value
        ? "Please enter a valid mobile number"
        : "Mobile number is required",
      message: value
        ? `Please provide more details (${value.length}/20 characters minimum)`
        : "Commission details are required",
    };

    if (value && validators[name] && !validators[name]()) {
      this.showFieldError(name, errorMessages[name]);
    } else if (!value && name !== "photo") {
      this.showFieldError(name, errorMessages[name]);
    }
  }

  showFieldError(fieldName, message) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (!field) return;

    field.classList.add("error");

    let errorElement = field.parentNode.querySelector(".error-message");
    if (!errorElement) {
      errorElement = document.createElement("div");
      errorElement.className = "error-message";
      field.parentNode.appendChild(errorElement);
    }
    errorElement.textContent = message;
  }

  clearFieldError(fieldName) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (!field) return;

    field.classList.remove("error");
    const errorElement = field.parentNode.querySelector(".error-message");
    errorElement?.remove();
  }

  showSubmissionOptions(data, photoFile) {
    const modal = document.createElement("div");
    modal.className = "submission-options-modal";
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    `;

    modal.innerHTML = `
      <div class="modal-content" style="
        background: white;
        padding: 2rem;
        border-radius: 15px;
        max-width: 500px;
        width: 90%;
        text-align: center;
      ">
        <h3>Choose Submission Method</h3>
        <p>You've attached a photo. Please choose how to send your request:</p>
        
        <div class="submission-options" style="
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin: 2rem 0;
        ">
          <button class="option-btn whatsapp-option" style="
            padding: 1rem;
            border: 2px solid #25D366;
            border-radius: 10px;
            background: #25D366;
            color: white;
            cursor: pointer;
          ">
            <i class="fab fa-whatsapp"></i>
            <span>WhatsApp</span>
            <small style="display: block; margin-top: 0.5rem; opacity: 0.8;">You'll need to send the photo separately</small>
          </button>
          
          <button class="option-btn email-option" style="
            padding: 1rem;
            border: 2px solid #007bff;
            border-radius: 10px;
            background: #007bff;
            color: white;
            cursor: pointer;
          ">
            <i class="fas fa-envelope"></i>
            <span>Email</span>
            <small style="display: block; margin-top: 0.5rem; opacity: 0.8;">Photo will be attached automatically</small>
          </button>
        </div>
        
        <button class="close-options" style="
          background: #6c757d;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 5px;
          cursor: pointer;
        ">Cancel</button>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    modal.querySelector(".whatsapp-option").addEventListener("click", () => {
      this.sendToWhatsApp(data, photoFile);
      modal.remove();
    });

    modal.querySelector(".email-option").addEventListener("click", () => {
      this.sendViaEmail(data, photoFile);
      modal.remove();
    });

    modal.querySelector(".close-options").addEventListener("click", () => {
      modal.remove();
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  sendToWhatsApp(data, photoFile = null) {
    const photoNote = photoFile
      ? `\n📸 Reference Photo: ${photoFile.name} (will send separately)`
      : "";

    const message = `🎨 New Commission Request

👤 Name: ${data.name}
📧 Email: ${data.email}
📱 Mobile: ${data.mobile}${photoNote}

💬 Commission Details:
${data.message}

${
  photoFile
    ? "⚠️ Note: Please send your reference photo in the next message!"
    : ""
}

---
Sent from Ayush Artist Portfolio`;

    const phoneNumber = "916207806187";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank");

    this.showNotification(
      photoFile
        ? "Request sent to WhatsApp! Don't forget to send your photo in the next message."
        : "Request sent to WhatsApp!",
      "success"
    );
  }

  sendViaEmail(data, photoFile = null) {
    const subject = `New Commission Request from ${data.name}`;
    const body = `Commission Request Details:

Name: ${data.name}
Email: ${data.email}
Mobile: ${data.mobile}

Commission Details:
${data.message}

${photoFile ? "Reference photo is attached to this email." : ""}

---
Sent from Ayush Artist Portfolio`;

    const mailtoUrl = `mailto:ayush@artist.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    if (photoFile) {
      this.showEmailInstructions(mailtoUrl, photoFile);
    } else {
      window.open(mailtoUrl, "_blank");
      this.showNotification(
        "Email client opened! Please send your request.",
        "success"
      );
    }
  }

  showEmailInstructions(mailtoUrl, photoFile) {
    const modal = document.createElement("div");
    modal.className = "email-instructions-modal";
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;

    modal.innerHTML = `
      <div class="modal-content" style="
        background: white;
        padding: 2rem;
        border-radius: 15px;
        max-width: 500px;
        width: 90%;
      ">
        <h3>Email Instructions</h3>
        <p>Your email client will open with the request details. Please:</p>
        <ol>
          <li>Click "Open Email Client" below</li>
          <li>Manually attach your photo: <strong>${photoFile.name}</strong></li>
          <li>Send the email</li>
        </ol>
        
        <div class="modal-actions" style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: center;">
          <button class="btn-primary open-email" style="
            background: #007bff;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
          ">Open Email Client</button>
          <button class="btn-secondary close-instructions" style="
            background: #6c757d;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
          ">Cancel</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector(".open-email").addEventListener("click", () => {
      window.open(mailtoUrl, "_blank");
      modal.remove();
      this.showNotification(
        "Email client opened! Don't forget to attach your photo.",
        "success"
      );
    });

    modal.querySelector(".close-instructions").addEventListener("click", () => {
      modal.remove();
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    document.addEventListener("keydown", function handleEscape(e) {
      if (e.key === "Escape") {
        modal.remove();
        document.removeEventListener("keydown", handleEscape);
      }
    });
  }

  resetForm(form) {
    form.reset();
    form.querySelectorAll(".error-message").forEach((el) => el.remove());
    form
      .querySelectorAll(".error")
      .forEach((el) => el.classList.remove("error"));
  }

  // ==========================================================================
  // SCROLL ANIMATIONS
  // ==========================================================================

  initScrollAnimations() {
    if (!window.IntersectionObserver) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    // Observe elements for animation
    const animatedElements = document.querySelectorAll(
      ".about-text, .pricing-card, .contact-info, .commission-form, .featured-artwork"
    );

    animatedElements.forEach((el) => {
      el.classList.add("animate-ready");
      observer.observe(el);
    });

    this.observers.set("scroll-animations", observer);
  }

  // ==========================================================================
  // ACCESSIBILITY FEATURES
  // ==========================================================================

  initAccessibilityFeatures() {
    this.addSkipLinks();
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.addARIALabels();
  }

  addSkipLinks() {
    const skipLink = document.createElement("a");
    skipLink.href = "#home";
    skipLink.textContent = "Skip to main content";
    skipLink.className = "skip-link";
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #8B0000;
      color: white;
      padding: 8px;
      text-decoration: none;
      border-radius: 4px;
      z-index: 10000;
      transition: top 0.3s;
    `;

    skipLink.addEventListener("focus", function () {
      this.style.top = "6px";
    });

    skipLink.addEventListener("blur", function () {
      this.style.top = "-40px";
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  setupKeyboardNavigation() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        document.body.classList.add("keyboard-navigation");
      }
    });

    document.addEventListener("mousedown", () => {
      document.body.classList.remove("keyboard-navigation");
    });
  }

  setupFocusManagement() {
    document.addEventListener("focusin", (e) => {
      const activeModal = document.querySelector(
        ".gallery-modal.active, .image-modal.active"
      );
      if (activeModal && !activeModal.contains(e.target)) {
        const focusableElements = activeModal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    });
  }

  addARIALabels() {
    const carouselBtns = document.querySelectorAll(".carousel-btn");
    carouselBtns.forEach((btn) => {
      if (!btn.getAttribute("aria-label")) {
        btn.setAttribute(
          "aria-label",
          btn.classList.contains("prev-btn") ? "Previous slide" : "Next slide"
        );
      }
    });

    const galleryItems = document.querySelectorAll(".gallery-item");
    galleryItems.forEach((item, index) => {
      item.setAttribute("aria-label", `View artwork ${index + 1}`);
    });
  }

  // ==========================================================================
  // PERFORMANCE OPTIMIZATIONS
  // ==========================================================================

  initPerformanceOptimizations() {
    this.setupLazyLoading();
    this.setupImageOptimizations();
    this.monitorPerformance();
    this.preloadCriticalImages();
  }

  setupLazyLoading() {
    if (!("IntersectionObserver" in window)) return;

    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute("data-src");
            }
            img.classList.remove("loading");
            imageObserver.unobserve(img);
          }
        });
      },
      { rootMargin: "50px" }
    );

    document.querySelectorAll("img[data-src]").forEach((img) => {
      img.classList.add("loading");
      imageObserver.observe(img);
    });

    this.observers.set("lazy-loading", imageObserver);
  }

  setupImageOptimizations() {
    const images = document.querySelectorAll("img");

    images.forEach((img) => {
      if (img.complete) {
        img.style.opacity = "1";
        img.style.transform = "scale(1)";
        return;
      }

      img.style.opacity = "0";
      img.style.transform = "scale(0.95)";
      img.style.transition = "opacity 0.5s ease, transform 0.5s ease";

      img.addEventListener("load", function () {
        this.style.opacity = "1";
        this.style.transform = "scale(1)";
      });

      img.addEventListener("error", function () {
        this.style.opacity = "0.5";
        this.alt = "Image failed to load";
        console.warn(`Failed to load image: ${this.src}`);
      });
    });
  }

  preloadCriticalImages() {
    const criticalImages = [
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1920&h=1080&fit=crop",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&h=1080&fit=crop",
      "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=1920&h=1080&fit=crop",
    ];

    criticalImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }

  monitorPerformance() {
    if ("PerformanceObserver" in window) {
      const perfObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn(`Long task detected: ${entry.duration}ms`);
          }
        }
      });

      try {
        perfObserver.observe({ entryTypes: ["longtask"] });
      } catch (e) {
        console.warn("Performance monitoring not available");
      }
    }

    if (performance.memory) {
      const checkMemory = () => {
        const memory = performance.memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
        const totalMB = Math.round(memory.totalJSHeapSize / 1048576);

        if (usedMB > 50) {
          console.warn(`High memory usage: ${usedMB}MB / ${totalMB}MB`);
        }
      };

      setInterval(checkMemory, 30000);
    }
  }

  // ==========================================================================
  // BACK TO TOP BUTTON
  // ==========================================================================

  initBackToTop() {
    const backToTopBtn = document.createElement("button");
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopBtn.className = "back-to-top";
    backToTopBtn.setAttribute("aria-label", "Back to top");
    backToTopBtn.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 50px;
      height: 50px;
      background: linear-gradient(45deg, #8B0000, #20B2AA);
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 1000;
      font-size: 1.2rem;
    `;

    document.body.appendChild(backToTopBtn);

    const toggleBackToTop = this.throttle(() => {
      const isVisible = window.pageYOffset > 300;
      backToTopBtn.style.opacity = isVisible ? "1" : "0";
      backToTopBtn.style.visibility = isVisible ? "visible" : "hidden";
    }, 100);

    window.addEventListener("scroll", toggleBackToTop, { passive: true });

    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // Hover effects
    backToTopBtn.addEventListener("mouseenter", function () {
      this.style.transform = "scale(1.1) translateY(-2px)";
      this.style.boxShadow = "0 6px 20px rgba(0,0,0,0.4)";
    });

    backToTopBtn.addEventListener("mouseleave", function () {
      this.style.transform = "scale(1) translateY(0)";
      this.style.boxShadow = "0 4px 15px rgba(0,0,0,0.3)";
    });
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
      const context = this;
      const later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }

  isInputFocused() {
    const activeElement = document.activeElement;
    return (
      activeElement &&
      (activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.contentEditable === "true")
    );
  }

  showNotification(message, type = "info") {
    // Remove existing notifications
    document
      .querySelectorAll(".portfolio-notification")
      .forEach((n) => n.remove());

    const notification = document.createElement("div");
    notification.className = `portfolio-notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${
          type === "success" ? "check-circle" : "exclamation-circle"
        }"></i>
        <span>${message}</span>
        <button class="notification-close" aria-label="Close notification">&times;</button>
      </div>
    `;

    const bgColor =
      type === "success" ? "#27ae60" : type === "error" ? "#e74c3c" : "#007bff";

    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: ${bgColor};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 10px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      z-index: 9999;
      max-width: 400px;
      animation: slideInRight 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: 'Inter', sans-serif;
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    const autoRemove = setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = "slideOutRight 0.3s ease";
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);

    // Manual close
    const closeBtn = notification.querySelector(".notification-close");
    closeBtn?.addEventListener("click", () => {
      clearTimeout(autoRemove);
      notification.style.animation = "slideOutRight 0.3s ease";
      setTimeout(() => notification.remove(), 300);
    });
  }

  // ==========================================================================
  // ERROR HANDLING & CLEANUP
  // ==========================================================================

  setupErrorHandling() {
    window.addEventListener("error", (e) => {
      console.error("JavaScript Error:", e.error);

      if (
        e.error &&
        (e.error.message.includes("carousel") ||
          e.error.message.includes("gallery") ||
          e.error.message.includes("Cannot read"))
      ) {
        this.showNotification(
          "Some features may not be working properly. Please refresh the page.",
          "error"
        );
      }
    });

    window.addEventListener("unhandledrejection", (e) => {
      console.error("Unhandled promise rejection:", e.reason);
      e.preventDefault();
    });
  }

  cleanup() {
    // Clean up observers
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();

    // Clear intervals
    this.stopAutoPlay();

    // Remove event listeners if needed
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );
  }
}

// ==========================================================================
// INITIALIZATION AND CSS ANIMATIONS
// ==========================================================================

// Add CSS animations for notifications
const notificationStyles = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  .notification-close {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 1.2rem;
    margin-left: auto;
    opacity: 0.8;
    transition: opacity 0.2s ease;
  }

  .notification-close:hover {
    opacity: 1;
  }

  .animate-ready {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }

  .animate-in {
    opacity: 1;
    transform: translateY(0);
  }

  .keyboard-navigation *:focus {
    outline: 2px solid #007bff !important;
    outline-offset: 2px !important;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
    
    .carousel-slide {
      transition: none !important;
    }
  }
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Initialize the portfolio
let portfolioManager;

document.addEventListener("DOMContentLoaded", () => {
  portfolioManager = new PortfolioManager();
});

// Clean up on page unload
window.addEventListener("beforeunload", () => {
  if (portfolioManager) {
    portfolioManager.cleanup();
  }
});

// Service Worker registration for offline functionality
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("ServiceWorker registration successful");
      })
      .catch((err) => {
        console.log("ServiceWorker registration failed:", err);
      });
  });
}
