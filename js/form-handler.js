/**
 * VODARS ACCOUNTING - Form Handler
 * Maneja el envío de formularios vía AJAX
 */

class FormHandler {
    constructor() {
        this.apiBaseUrl = './api'; // Ajusta esta ruta según tu configuración
        this.init();
    }

    init() {
        // Inicializar handlers cuando el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupFormHandlers());
        } else {
            this.setupFormHandlers();
        }
    }

    setupFormHandlers() {
        // Formulario de contacto
        const contactoForm = document.getElementById('contactoForm');
        if (contactoForm) {
            contactoForm.addEventListener('submit', (e) => this.handleContactoForm(e));
        }

        // Formulario de carreras (trabaja con nosotros)
        const carrerasForm = document.getElementById('careerForm');
        if (carrerasForm) {
            carrerasForm.addEventListener('submit', (e) => this.handleCarrerasForm(e));
        }
    }

    /**
     * Maneja el envío del formulario de contacto
     */
    async handleContactoForm(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Mostrar loading
        this.setButtonLoading(submitBtn, true);
        
        try {
            // Recopilar datos del formulario
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Validar lado del cliente
            const validation = this.validateContactoForm(data);
            if (!validation.valid) {
                this.showErrors(form, validation.errors);
                return;
            }
            
            // Enviar al servidor
            const response = await this.apiCall('contacto.php', data);
            
            if (response.success) {
                this.showSuccess(form, response.message);
                form.reset();
                
                // Opcional: Mostrar detalles de respuesta
                if (response.data) {
                    console.log('Contacto registrado:', response.data);
                }
            } else {
                this.showErrors(form, response.data?.errors || [response.message]);
            }
            
        } catch (error) {
            console.error('Error en formulario de contacto:', error);
            this.showErrors(form, ['Error de conexión. Por favor, inténtelo más tarde.']);
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    /**
     * Maneja el envío del formulario de carreras
     */
    async handleCarrerasForm(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Verificar que estamos en el paso 5 (confirmación)
        const currentStep = document.querySelector('.form-step.active');
        if (!currentStep || currentStep.id !== 'step5') {
            return; // No hacer nada si no estamos en el paso final
        }
        
        // Verificar términos y condiciones
        const termsCheckbox = document.getElementById('termsAccept');
        if (!termsCheckbox || !termsCheckbox.checked) {
            this.showErrors(form, ['Debes aceptar los términos y condiciones para enviar tu aplicación.']);
            return;
        }
        
        // Mostrar loading
        this.setButtonLoading(submitBtn, true);
        
        try {
            // Preparar FormData con todos los campos del formulario
            const formData = new FormData();
            
            // Recopilar todos los campos de todos los pasos
            const allInputs = form.querySelectorAll('input, select, textarea');
            
            allInputs.forEach(input => {
                if (input.name) {
                    // Manejar checkboxes
                    if (input.type === 'checkbox' && input.checked) {
                        formData.append(input.name, input.value);
                    } 
                    // Manejar files
                    else if (input.type === 'file' && input.files.length > 0) {
                        formData.append(input.name, input.files[0]);
                    } 
                    // Manejar inputs y selects normales
                    else if (input.type !== 'checkbox' && input.type !== 'file' && input.value) {
                        formData.append(input.name, input.value);
                    }
                }
            });
            
            console.log('Datos a enviar:', Array.from(formData.entries()));
            
            // Enviar al servidor
            const response = await this.apiCall('carreras.php', formData);
            
            if (response.success) {
                this.showSuccess(form, response.message);
                
                // Resetear el formulario después de 3 segundos
                setTimeout(() => {
                    if (typeof resetForm === 'function') {
                        resetForm();
                    }
                }, 3000);
                
                // Opcional: Mostrar detalles de respuesta
                if (response.data) {
                    console.log('Aplicación registrada:', response.data);
                }
            } else {
                this.showErrors(form, response.data?.errors || [response.message]);
            }
            
        } catch (error) {
            console.error('Error en formulario de carreras:', error);
            this.showErrors(form, ['Error de conexión. Por favor, inténtelo más tarde.']);
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    /**
     * Realiza una llamada a la API
     */
    async apiCall(endpoint, data) {
    const url = `${this.apiBaseUrl}/${endpoint}`;
    
    // Si data es FormData (para archivos), enviar como está
    // Si es objeto, convertir a JSON
    const isFormData = data instanceof FormData;
    
    const options = {
        method: 'POST',
        body: isFormData ? data : JSON.stringify(data),
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    };
    
    // Solo agregar Content-Type para JSON
    if (!isFormData) {
        options.headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

    /**
     * Valida el formulario de contacto
     */
    validateContactoForm(data) {
        const errors = [];
        
        if (!data.nombre || data.nombre.trim().length < 3) {
            errors.push('El nombre debe tener al menos 3 caracteres');
        }
        
        if (!data.email || !this.isValidEmail(data.email)) {
            errors.push('El email no es válido');
        }
        
        if (data.telefono && data.telefono.replace(/\D/g, '').length < 7) {
            errors.push('El teléfono debe tener al menos 7 dígitos');
        }
        
        if (!data.mensaje || data.mensaje.trim().length < 10) {
            errors.push('El mensaje debe tener al menos 10 caracteres');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Valida el formulario de carreras
     */
    validateCarrerasForm(formData) {
        const errors = [];
        
        // Validaciones básicas - solo para asegurar que los datos existan
        const nombre = formData.get('nombre_completo');
        const email = formData.get('email');
        const telefono = formData.get('telefono');
        const posicion = formData.get('position');
        const experiencia = formData.get('experience');
        const educacion = formData.get('education');
        const motivacion = formData.get('motivation');
        const cvFile = formData.get('cv');
        
        if (!nombre || nombre.trim().length < 3) {
            errors.push('El nombre completo debe tener al menos 3 caracteres');
        }
        
        if (!email || !this.isValidEmail(email)) {
            errors.push('El email no es válido');
        }
        
        if (!telefono || telefono.replace(/\D/g, '').length < 7) {
            errors.push('El teléfono debe tener al menos 7 dígitos');
        }
        
        if (!posicion) {
            errors.push('Debe seleccionar una posición de interés');
        }
        
        if (!experiencia) {
            errors.push('Debe seleccionar su nivel de experiencia');
        }
        
        if (!educacion) {
            errors.push('Debe seleccionar su nivel de educación');
        }
        
        if (!motivacion || motivacion.trim().length < 10) {
            errors.push('La motivación debe tener al menos 10 caracteres');
        }
        
        // Validar archivo CV
        if (!cvFile || (typeof cvFile === 'object' && cvFile.size === 0)) {
            errors.push('Debe adjuntar su CV');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Valida un email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Muestra los errores en el formulario
     */
    showErrors(form, errors) {
        // Limpiar errores anteriores
        this.clearErrors(form);
        
        // Crear contenedor de errores si no existe
        let errorContainer = form.querySelector('.form-errors');
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.className = 'form-errors alert alert-danger mt-3';
            form.insertBefore(errorContainer, form.firstChild);
        }
        
        // Agregar errores
        errorContainer.innerHTML = `
            <h6><i class="fas fa-exclamation-triangle"></i> Por favor corrija los siguientes errores:</h6>
            <ul class="mb-0">
                ${errors.map(error => `<li>${error}</li>`).join('')}
            </ul>
        `;
        
        // Resaltar campos inválidos
        errors.forEach(error => {
            if (error.toLowerCase().includes('nombre')) {
                this.markFieldInvalid(form, 'nombre') || this.markFieldInvalid(form, 'nombre_completo');
            } else if (error.toLowerCase().includes('email')) {
                this.markFieldInvalid(form, 'email');
            } else if (error.toLowerCase().includes('teléfono')) {
                this.markFieldInvalid(form, 'telefono');
            } else if (error.toLowerCase().includes('mensaje')) {
                this.markFieldInvalid(form, 'mensaje');
            } else if (error.toLowerCase().includes('cv')) {
                this.markFieldInvalid(form, 'cvFile');
            } else if (error.toLowerCase().includes('motivación')) {
                this.markFieldInvalid(form, 'motivation');
            }
        });
        
        // Scroll al principio del formulario
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * Marca un campo como inválido
     */
    markFieldInvalid(form, fieldName) {
        const field = form.querySelector(`[name="${fieldName}"], #${fieldName}`);
        if (field) {
            field.classList.add('is-invalid');
            return true;
        }
        return false;
    }

    /**
     * Limpia los errores del formulario
     */
    clearErrors(form) {
        // Remover contenedor de errores
        const errorContainer = form.querySelector('.form-errors');
        if (errorContainer) {
            errorContainer.remove();
        }
        
        // Remover clases de error de los campos
        const invalidFields = form.querySelectorAll('.is-invalid');
        invalidFields.forEach(field => field.classList.remove('is-invalid'));
    }

    /**
     * Muestra un mensaje de éxito
     */
    showSuccess(form, message) {
        // Limpiar errores
        this.clearErrors(form);
        
        // Crear contenedor de éxito
        let successContainer = form.querySelector('.form-success');
        if (!successContainer) {
            successContainer = document.createElement('div');
            successContainer.className = 'form-success alert alert-success mt-3';
            form.insertBefore(successContainer, form.firstChild);
        }
        
        successContainer.innerHTML = `
            <h6><i class="fas fa-check-circle"></i> ¡Éxito!</h6>
            <p class="mb-0">${message}</p>
        `;
        
        // Scroll al principio del formulario
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Ocultar mensaje después de 10 segundos
        setTimeout(() => {
            if (successContainer) {
                successContainer.remove();
            }
        }, 10000);
    }

    /**
     * Cambia el estado del botón (loading/normal)
     */
    setButtonLoading(button, loading) {
        if (loading) {
            button.disabled = true;
            const originalText = button.innerHTML;
            button.setAttribute('data-original-text', originalText);
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            button.classList.add('loading');
        } else {
            button.disabled = false;
            const originalText = button.getAttribute('data-original-text');
            if (originalText) {
                button.innerHTML = originalText;
            }
            button.classList.remove('loading');
        }
    }
}

// Instanciar el manejador de formularios
const formHandler = new FormHandler();

// Exportar para uso global
window.FormHandler = FormHandler;
window.formHandler = formHandler;