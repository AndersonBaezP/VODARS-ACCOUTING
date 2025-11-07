document.addEventListener("DOMContentLoaded", () => {
  // ===============================
  // ANIMACIÓN AL HACER SCROLL
  // ===============================
  const observerOptions = { threshold: 0.15 };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animated");
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll(".animate-on-scroll").forEach(el => {
    revealObserver.observe(el);
  });

  // ===============================
  // EFECTO HOVER EN CARDS DE SERVICIO
  // ===============================
  const serviceCards = document.querySelectorAll(".service-card");

  serviceCards.forEach(card => {
    const icon = card.querySelector("i");

    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-12px) scale(1.03)";
      if (icon) icon.style.transform = "scale(1.2) rotate(6deg)";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0) scale(1)";
      if (icon) icon.style.transform = "scale(1) rotate(0)";
    });
  });

  // ===============================
  // ANIMACIÓN ESCALONADA (STAGGER)
  // ===============================
  const staggerElements = document.querySelectorAll(".service-card, .about-content");
  staggerElements.forEach((el, i) => {
    el.style.animationDelay = `${i * 0.2}s`;
    el.classList.add("animate-on-scroll");
  });

  // ===============================
  // PARALLAX SUAVE
  // ===============================
  const parallaxElements = document.querySelectorAll(".about-content");
  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset * 0.1;
    parallaxElements.forEach(el => {
      el.style.transform = `translateY(${scrolled}px)`;
    });
  });

  // ===============================
  // EFECTO CONTADOR
  // ===============================
  const animateCounter = (el, target, duration = 2000) => {
    let start = 0;
    const increment = target / (duration / 16);
    const counter = setInterval(() => {
      start += increment;
      el.textContent = Math.floor(start);
      if (start >= target) {
        el.textContent = target;
        clearInterval(counter);
      }
    }, 16);
  };

  document.querySelectorAll("[data-counter]").forEach(counter => {
    const target = +counter.getAttribute("data-counter");
    const counterObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateCounter(counter, target);
        counterObserver.disconnect();
      }
    });
    counterObserver.observe(counter);
  });

  // ===============================
  // SMOOTH SCROLL
  // ===============================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", e => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // ===============================
// EFECTO PROFESIONAL DE ENTRADA (FADE + SLIDE)
// ===============================
document.querySelectorAll("h2").forEach((title, i) => {
  title.style.opacity = "0";
  title.style.transform = "translateY(30px)";
  title.style.transition = "all 0.8s ease-out";

  const titleObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      setTimeout(() => {
        title.style.opacity = "1";
        title.style.transform = "translateY(0)";
      }, i * 200); // retardo pequeño entre títulos
      titleObserver.disconnect();
    }
  });

  titleObserver.observe(title);
});
  // ===============================
  // EFECTO LOADING PAGE
  // ===============================
  window.addEventListener("load", () => {
    document.body.classList.add("loaded");
    document.querySelectorAll(".animate-on-scroll").forEach((el, i) => {
      setTimeout(() => {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, i * 200);
    });
  });
});

// JavaScript mejorado para el formulario dinámico
let currentStep = 1;
const totalSteps = 5;

// Inicializar el formulario
document.addEventListener('DOMContentLoaded', function() {
    showStep(1);
    updateProgressBar();
    
    // Inicializar validación en tiempo real
    initializeValidation();
});

function showStep(step) {
    // Ocultar todos los pasos
    for (let i = 1; i <= totalSteps; i++) {
        const stepElement = document.getElementById('step' + i);
        if (stepElement) {
            stepElement.classList.remove('active');
        }
    }
    
    // Mostrar el paso actual con animación
    const currentStepElement = document.getElementById('step' + step);
    if (currentStepElement) {
        setTimeout(() => {
            currentStepElement.classList.add('active');
        }, 100);
    }
    
    currentStep = step;
}

function nextStep(step) {
    if (validateStep(step)) {
        if (step < totalSteps) {
            // Animación de salida
            const currentStepElement = document.getElementById('step' + step);
            currentStepElement.style.animation = 'slideOutLeft 0.3s ease-out';
            
            setTimeout(() => {
                showStep(step + 1);
                updateProgressBar();
                
                // Generar resumen en el último paso
                if (step + 1 === 5) {
                    generateSummary();
                }
            }, 300);
        }
    } else {
        // Shake animation para errores
        const currentStepElement = document.getElementById('step' + step);
        currentStepElement.style.animation = 'shake 0.5s ease-out';
        setTimeout(() => {
            currentStepElement.style.animation = '';
        }, 500);
    }
}

function prevStep(step) {
    if (step > 1) {
        const currentStepElement = document.getElementById('step' + step);
        currentStepElement.style.animation = 'slideOutRight 0.3s ease-out';
        
        setTimeout(() => {
            showStep(step - 1);
            updateProgressBar();
        }, 300);
    }
}

function updateProgressBar() {
    const progress = (currentStep / totalSteps) * 100;
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        progressFill.style.width = progress + '%';
    }
}

function validateStep(step) {
    const currentStepElement = document.getElementById('step' + step);
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        const fieldValue = field.type === 'file' ? field.files.length > 0 : field.value.trim();
        
        if (!fieldValue || (field.type === 'checkbox' && !field.checked)) {
            field.classList.add('is-invalid');
            field.classList.remove('is-valid');
            isValid = false;
            
            // Mostrar mensaje de error
            showFieldError(field);
        } else {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
            hideFieldError(field);
        }
    });
    
    // Validaciones específicas
    if (step === 1) {
        const email = document.getElementById('email');
        if (email.value && !isValidEmail(email.value)) {
            email.classList.add('is-invalid');
            isValid = false;
        }
    }
    
    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showFieldError(field) {
    const feedback = field.nextElementSibling;
    if (feedback && feedback.classList.contains('invalid-feedback')) {
        feedback.style.display = 'block';
    }
}

function hideFieldError(field) {
    const feedback = field.nextElementSibling;
    if (feedback && feedback.classList.contains('invalid-feedback')) {
        feedback.style.display = 'none';
    }
}

function toggleConditionalFields() {
    const position = document.getElementById('position').value;
    const seniorFields = document.getElementById('seniorFields');
    const auditField = document.getElementById('auditField');
    
    // Ocultar todos los campos condicionales primero
    seniorFields.classList.remove('show');
    auditField.classList.remove('show');
    
    // Mostrar campos según la posición seleccionada
    setTimeout(() => {
        if (position === 'contador-senior' || position === 'consultor-tributario') {
            seniorFields.classList.add('show');
        }
        
        if (position === 'auditor') {
            auditField.classList.add('show');
        }
    }, 100);
}

function generateSummary() {
    const data = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        position: document.getElementById('position').value,
        experience: document.getElementById('experience').value,
        education: document.getElementById('education').value,
        cvFile: document.getElementById('cvFile').files[0]?.name
    };
    
    const positionNames = {
        'contador-senior': 'Contador Senior',
        'contador-junior': 'Contador Junior',
        'auditor': 'Auditor',
        'asistente-contable': 'Asistente Contable',
        'analista-financiero': 'Analista Financiero',
        'consultor-tributario': 'Consultor Tributario'
    };
    
    const educationNames = {
        'bachiller': 'Bachiller',
        'tecnico': 'Técnico Superior',
        'licenciatura': 'Licenciatura/Ingeniería',
        'maestria': 'Maestría',
        'doctorado': 'Doctorado'
    };
    
    const summaryHTML = `
        <div class="row g-3">
            <div class="col-md-6">
                <strong>Nombre:</strong><br>
                <span class="text-muted">${data.fullName}</span>
            </div>
            <div class="col-md-6">
                <strong>Email:</strong><br>
                <span class="text-muted">${data.email}</span>
            </div>
            <div class="col-md-6">
                <strong>Teléfono:</strong><br>
                <span class="text-muted">${data.phone}</span>
            </div>
            <div class="col-md-6">
                <strong>Posición:</strong><br>
                <span class="text-muted">${positionNames[data.position] || data.position}</span>
            </div>
            <div class="col-md-6">
                <strong>Experiencia:</strong><br>
                <span class="text-muted">${data.experience} años</span>
            </div>
            <div class="col-md-6">
                <strong>Educación:</strong><br>
                <span class="text-muted">${educationNames[data.education] || data.education}</span>
            </div>
            <div class="col-12">
                <strong>CV:</strong><br>
                <span class="text-muted">${data.cvFile ? `✓ ${data.cvFile}` : '❌ No subido'}</span>
            </div>
        </div>
    `;
    
    document.getElementById('applicationSummary').innerHTML = summaryHTML;
}

function initializeValidation() {
    // Validación en tiempo real para campos de texto
    const textInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea');
    textInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required')) {
                if (this.value.trim()) {
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                } else {
                    this.classList.add('is-invalid');
                    this.classList.remove('is-valid');
                }
            }
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('is-invalid') && this.value.trim()) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            }
        });
    });
    
    // Validación para selects
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        select.addEventListener('change', function() {
            if (this.hasAttribute('required')) {
                if (this.value) {
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                } else {
                    this.classList.add('is-invalid');
                    this.classList.remove('is-valid');
                }
            }
        });
    });
}

// Manejo de carga de archivos mejorado
function setupFileUpload(inputId, areaClass) {
    const fileInput = document.getElementById(inputId);
    const uploadArea = fileInput.closest('.file-upload-area');
    
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Validar tamaño (5MB máximo)
            if (file.size > 5 * 1024 * 1024) {
                alert('El archivo es muy grande. Máximo 5MB permitido.');
                this.value = '';
                return;
            }
            
            // Actualizar UI
            const fileInfo = uploadArea.querySelector('p');
            const icon = uploadArea.querySelector('i');
            
            fileInfo.innerHTML = `<strong>${file.name}</strong><br><small>(${(file.size/1024/1024).toFixed(2)} MB)</small>`;
            icon.className = 'fas fa-check-circle fa-2x mb-2 text-success';
            uploadArea.classList.add('file-selected');
            
            // Marcar como válido
            this.classList.remove('is-invalid');
            this.classList.add('is-valid');
        }
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.background = 'rgba(102, 126, 234, 0.1)';
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.background = '';
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.background = '';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            fileInput.dispatchEvent(new Event('change'));
        }
    });
}

// Inicializar carga de archivos
document.addEventListener('DOMContentLoaded', function() {
    setupFileUpload('cvFile');
    setupFileUpload('coverLetter');
});

// Manejo del envío del formulario
document.getElementById('careerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (validateStep(5) && document.getElementById('termsAccept').checked) {
        // Mostrar loading
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;
        
        // Simular envío (reemplaza con tu lógica de envío real)
        setTimeout(() => {
            Swal.fire({
                title: '¡Aplicación Enviada!',
                text: 'Gracias por tu interés en VODARS ACCOUNTING. Te contactaremos pronto.',
                icon: 'success',
                confirmButtonText: 'Continuar',
                confirmButtonColor: '#667eea'
            }).then(() => {
                // Resetear formulario o redirigir
                window.location.href = 'index.html';
            });
        }, 2000);
    }
});

// Animaciones adicionales
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes slideOutRight {
        0% { opacity: 1; transform: translateX(0); }
        100% { opacity: 0; transform: translateX(50px); }
    }
`;
document.head.appendChild(style);

//Contacto

// ===== VALIDACIÓN Y FUNCIONALIDAD DEL FORMULARIO =====
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-contacto');
    const submitBtn = form.querySelector('.btn-submit');
    const successMessage = form.querySelector('.success-message');
    
    // Validación en tiempo real
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearErrors);
    });
    
    function validateField(e) {
        const field = e.target;
        const value = field.value.trim();
        
        // Limpiar estados anteriores
        field.classList.remove('is-valid', 'is-invalid');
        
        if (field.hasAttribute('required') && !value) {
            field.classList.add('is-invalid');
            return false;
        }
        
        // Validación específica para email
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                field.classList.add('is-invalid');
                return false;
            }
        }
        
        // Validación específica para select
        if (field.tagName === 'SELECT' && field.hasAttribute('required') && !value) {
            field.classList.add('is-invalid');
            return false;
        }
        
        field.classList.add('is-valid');
        return true;
    }
    
    function clearErrors(e) {
        const field = e.target;
        if (field.classList.contains('is-invalid') && field.value.trim()) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
        }
    }
    
    // Envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validar todos los campos
        let isFormValid = true;
        inputs.forEach(input => {
            if (!validateField({ target: input })) {
                isFormValid = false;
            }
        });
        
        if (!isFormValid) {
            // Shake animation para errores
            form.style.animation = 'shake 0.5s ease-out';
            setTimeout(() => {
                form.style.animation = '';
            }, 500);
            return;
        }
        
        // Mostrar loading
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        // Simular envío (reemplaza con tu lógica real)
        setTimeout(() => {
            // Resetear botón
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            
            // Mostrar mensaje de éxito
            successMessage.classList.add('show');
            
            // Limpiar formulario
            form.reset();
            inputs.forEach(input => {
                input.classList.remove('is-valid', 'is-invalid');
            });
            
            // Ocultar mensaje después de 5 segundos
            setTimeout(() => {
                successMessage.classList.remove('show');
            }, 5000);
            
        }, 2000);
    });
    
    // Animaciones de scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observar elementos para animación
    document.querySelectorAll('.contact-form-container, .contact-info, .social-section').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.165, 0.84, 0.44, 1)';
        observer.observe(el);
    });
});


