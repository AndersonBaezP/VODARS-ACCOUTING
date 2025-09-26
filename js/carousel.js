class Carousel {
  constructor() {
    this.currentSlide = 0;
    this.slides = document.querySelectorAll('.slide');
    this.totalSlides = this.slides.length;
    this.dots = document.querySelectorAll('.dot');
    
    if (this.slides.length === 0) return; // Salir si no hay slides
    
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
    
    // Auto-play cada 5 segundos
    this.startAutoPlay();
    
    // Pausar auto-play al hover
    const carousel = document.querySelector('.carousel-container');
    if (carousel) {
      carousel.addEventListener('mouseenter', () => {
        this.stopAutoPlay();
      });
      
      carousel.addEventListener('mouseleave', () => {
        this.startAutoPlay();
      });
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
    
    // Mover el carrusel
    const slidesContainer = document.querySelector('.carousel-slides');
    if (slidesContainer) {
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