class Carousel {
  constructor() {
    this.currentSlide = 0;
    this.slides = document.querySelectorAll('.slide');
    this.totalSlides = this.slides.length;
    this.dots = document.querySelectorAll('.dot');
    
    if (this.slides.length === 0) return; // Salir si no hay slides
    
    // Touch support para móviles
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.isDragging = false;
    
    this.init();
  }
  
  init() {
    // Event listeners para flechas
    const leftArrow = document.querySelector('.left-arrow');
    const rightArrow = document.querySelector('.right-arrow');
    
    if (leftArrow) {
      leftArrow.addEventListener('click', () => {
        this.prevSlide();
      });
    }
    
    if (rightArrow) {
      rightArrow.addEventListener('click', () => {
        this.nextSlide();
      });
    }
    
    // Event listeners para dots
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.goToSlide(index);
      });
    });
    
    // Touch events para móviles
    this.initTouchSupport();
    
    // Auto-play cada 5 segundos
    this.startAutoPlay();
    
    // Pausar auto-play al hover (desktop) y touch (mobile)
    const carousel = document.querySelector('.carousel-container');
    if (carousel) {
      carousel.addEventListener('mouseenter', () => {
        this.stopAutoPlay();
      });
      
      carousel.addEventListener('mouseleave', () => {
        this.startAutoPlay();
      });

      // Pausar auto-play en touch start
      carousel.addEventListener('touchstart', () => {
        this.stopAutoPlay();
      }, { passive: true });

      // Reanudar auto-play en touch end
      carousel.addEventListener('touchend', () => {
        setTimeout(() => this.startAutoPlay(), 3000);
      }, { passive: true });
    }
  }

  initTouchSupport() {
    const carousel = document.querySelector('.carousel-container');
    if (!carousel) return;

    // Touch start
    carousel.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
      this.isDragging = true;
      carousel.style.transition = 'none';
    }, { passive: true });

    // Touch move
    carousel.addEventListener('touchmove', (e) => {
      if (!this.isDragging) return;
      
      const touchX = e.changedTouches[0].screenX;
      const diff = touchX - this.touchStartX;
      const slideWidth = carousel.offsetWidth;
      const movePercent = (diff / slideWidth) * 100;
      
      const currentTranslate = -this.currentSlide * 100;
      const newTranslate = currentTranslate + movePercent;
      
      const slidesContainer = document.querySelector('.carousel-slides');
      if (slidesContainer) {
        slidesContainer.style.transform = `translateX(${newTranslate}%)`;
      }
    }, { passive: true });

    // Touch end
    carousel.addEventListener('touchend', (e) => {
      if (!this.isDragging) return;
      
      this.touchEndX = e.changedTouches[0].screenX;
      this.isDragging = false;
      
      const slidesContainer = document.querySelector('.carousel-slides');
      if (slidesContainer) {
        slidesContainer.style.transition = 'transform 0.3s ease-in-out';
      }
      
      this.handleSwipe();
    }, { passive: true });
  }

  handleSwipe() {
    const swipeThreshold = 50;
    const diff = this.touchStartX - this.touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - siguiente slide
        this.nextSlide();
      } else {
        // Swipe right - slide anterior
        this.prevSlide();
      }
    } else {
      // No fue un swipe suficiente, volver al slide actual
      this.updateSlides();
    }
  }
  
updateSlides() {
    // Remover clase active de todos
    this.slides.forEach(slide => slide.classList.remove('active'));
    this.dots.forEach(dot => dot.classList.remove('active'));
    
    // Agregar clase active al actual
    this.slides[this.currentSlide].classList.add('active');
    if (this.dots[this.currentSlide]) {
      this.dots[this.currentSlide].classList.add('active');
    }
    
    // Mover el carrusel con transición suave
    const slidesContainer = document.querySelector('.carousel-slides');
    if (slidesContainer) {
      slidesContainer.style.transition = 'transform 0.3s ease-in-out';
      slidesContainer.style.transform = `translateX(-${this.currentSlide * 100}%)`;
    }
  }
  
  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
    this.updateSlides();
  }
  
  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    this.updateSlides();
  }
  
  goToSlide(index) {
    this.currentSlide = index;
    this.updateSlides();
  }
  
  startAutoPlay() {
    this.autoPlay = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }
  
  stopAutoPlay() {
    if (this.autoPlay) {
      clearInterval(this.autoPlay);
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new Carousel();
});