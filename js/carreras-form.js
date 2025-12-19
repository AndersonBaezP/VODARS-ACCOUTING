/**
 * Funciones para el formulario de carreras - VODARS ACCOUNTING
 */

let currentStep = 1;
const totalSteps = 5;

// Avanzar al siguiente paso
function nextStep(step) {
    if (validateStep(step)) {
        // Ocultar paso actual
        document.getElementById(`step${step}`).classList.remove('active');
        
        // Mostrar siguiente paso
        currentStep = step + 1;
        document.getElementById(`step${currentStep}`).classList.add('active');
        
        // Actualizar barra de progreso
        updateProgress();
        
        // Scroll al principio del formulario
        document.querySelector('.dynamic-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Retroceder al paso anterior
function prevStep(step) {
    // Ocultar paso actual
    document.getElementById(`step${step}`).classList.remove('active');
    
    // Mostrar paso anterior
    currentStep = step - 1;
    document.getElementById(`step${currentStep}`).classList.add('active');
    
    // Actualizar barra de progreso
    updateProgress();
    
    // Scroll al principio del formulario
    document.querySelector('.dynamic-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Validar paso actual
function validateStep(step) {
    const currentStepElement = document.getElementById(`step${step}`);
    const inputs = currentStepElement.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('is-invalid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
        }
        
        // Validación específica para email
        if (input.type === 'email' && input.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                input.classList.add('is-invalid');
                isValid = false;
            }
        }
        
        // Validación específica para teléfono
        if (input.type === 'tel' && input.value) {
            const phoneClean = input.value.replace(/\D/g, '');
            if (phoneClean.length < 7) {
                input.classList.add('is-invalid');
                isValid = false;
            }
        }
    });
    
    if (!isValid) {
        // Mostrar mensaje de error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger mt-3';
        errorDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Por favor complete todos los campos obligatorios correctamente.';
        
        // Eliminar mensajes de error anteriores
        const existingError = currentStepElement.querySelector('.alert-danger');
        if (existingError) {
            existingError.remove();
        }
        
        currentStepElement.appendChild(errorDiv);
        
        // Ocultar el error después de 5 segundos
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }
    
    return isValid;
}

// Actualizar barra de progreso
function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const percentage = (currentStep / totalSteps) * 100;
    progressFill.style.width = percentage + '%';
}

// Mostrar campos condicionales según la posición
function toggleConditionalFields() {
    const positionSelect = document.getElementById('position');
    const seniorFields = document.getElementById('seniorFields');
    const auditField = document.getElementById('auditField');
    
    const selectedPosition = positionSelect.value;
    
    // Resetear todos los campos condicionales
    seniorFields.classList.remove('show');
    auditField.classList.remove('show');
    
    // Mostrar campos si aplica
    if (selectedPosition === 'contador-senior' || selectedPosition === 'consultor-tributario') {
        seniorFields.classList.add('show');
    }
    
    if (selectedPosition === 'auditor') {
        auditField.classList.add('show');
    }
}

// Preparar todos los datos del formulario para el envío
function prepareFormData() {
    const form = document.getElementById('careerForm');
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
    
    return formData;
}

// Recopilar datos para el resumen
function collectFormData() {
    const data = {};
    
    // Paso 1: Información Personal
    data.nombre_completo = document.getElementById('fullName')?.value || '';
    data.email = document.getElementById('email')?.value || '';
    data.telefono = document.getElementById('phone')?.value || '';
    data.ciudad = document.getElementById('city')?.value || '';
    
    // Paso 2: Información Profesional
    const positionSelect = document.getElementById('position');
    data.posicion_interes = positionSelect?.options[positionSelect?.selectedIndex]?.text || '';
    
    const experienceSelect = document.getElementById('experience');
    data.anos_experiencia = experienceSelect?.options[experienceSelect?.selectedIndex]?.text || '';
    
    const educationSelect = document.getElementById('education');
    data.nivel_educacion = educationSelect?.options[educationSelect?.selectedIndex]?.text || '';
    
    // Certificaciones
    const certificaciones = [];
    const certCheckboxes = document.querySelectorAll('input[name="certificaciones[]"]:checked');
    certCheckboxes.forEach(cb => {
        const label = document.querySelector(`label[for="${cb.id}"]`);
        if (label) certificaciones.push(label.textContent.trim());
    });
    data.certificaciones = certificaciones.join(', ');
    
    // Especialización en auditoría
    const auditSelect = document.getElementById('auditSpecialty');
    if (auditSelect?.value) {
        data.especializacion_auditoria = auditSelect.options[auditSelect.selectedIndex]?.text || '';
    }
    
    // Paso 3: Habilidades Técnicas
    // Software contable
    const software = [];
    const softwareCheckboxes = document.querySelectorAll('input[name="software_contable[]"]:checked');
    softwareCheckboxes.forEach(cb => {
        const label = document.querySelector(`label[for="${cb.id}"]`);
        if (label) software.push(label.textContent.trim());
    });
    data.software_contable = software.join(', ');
    
    const englishSelect = document.getElementById('englishLevel');
    data.nivel_ingles = englishSelect?.options[englishSelect?.selectedIndex]?.text || '';
    
    const availabilitySelect = document.getElementById('availability');
    data.disponibilidad_horario = availabilitySelect?.options[availabilitySelect?.selectedIndex]?.text || '';
    
    // Paso 4: Documentos y Motivación
    const cvFile = document.getElementById('cvFile');
    if (cvFile?.files.length > 0) {
        data.cv = cvFile.files[0].name;
    }
    
    const coverLetterFile = document.getElementById('coverLetter');
    if (coverLetterFile?.files.length > 0) {
        data.carta_presentacion = coverLetterFile.files[0].name;
    }
    
    data.motivacion = document.getElementById('motivation')?.value || '';
    data.pretension_salarial = document.getElementById('salary')?.value || '';
    
    return data;
}

// Actualizar resumen en el paso 5
function updateSummary() {
    const data = collectFormData();
    const summaryContainer = document.getElementById('applicationSummary');
    
    const summaryHTML = `
        <div class="row g-3">
            <div class="col-md-6">
                <strong>Nombre:</strong> ${data.nombre_completo}
            </div>
            <div class="col-md-6">
                <strong>Email:</strong> ${data.email}
            </div>
            <div class="col-md-6">
                <strong>Teléfono:</strong> ${data.telefono}
            </div>
            <div class="col-md-6">
                <strong>Ciudad:</strong> ${data.ciudad || 'No especificada'}
            </div>
            <div class="col-md-6">
                <strong>Posición:</strong> ${data.posicion_interes}
            </div>
            <div class="col-md-6">
                <strong>Experiencia:</strong> ${data.anos_experiencia}
            </div>
            <div class="col-md-6">
                <strong>Educación:</strong> ${data.nivel_educacion}
            </div>
            <div class="col-md-6">
                <strong>Nivel Inglés:</strong> ${data.nivel_ingles}
            </div>
            ${data.certificaciones ? `
            <div class="col-12">
                <strong>Certificaciones:</strong> ${data.certificaciones}
            </div>
            ` : ''}
            ${data.software_contable ? `
            <div class="col-12">
                <strong>Software:</strong> ${data.software_contable}
            </div>
            ` : ''}
            ${data.cv ? `
            <div class="col-md-6">
                <strong>CV:</strong> ${data.cv}
            </div>
            ` : ''}
            ${data.carta_presentacion ? `
            <div class="col-md-6">
                <strong>Carta:</strong> ${data.carta_presentacion}
            </div>
            ` : ''}
            ${data.pretension_salarial ? `
            <div class="col-md-6">
                <strong>Pretensión Salarial:</strong> $${data.pretension_salarial} USD
            </div>
            ` : ''}
        </div>
    `;
    
    summaryContainer.innerHTML = summaryHTML;
}

// Resetear formulario al inicio
function resetForm() {
    currentStep = 1;
    
    // Ocultar todos los pasos
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Mostrar primer paso
    document.getElementById('step1').classList.add('active');
    
    // Resetear formulario
    document.getElementById('careerForm').reset();
    
    // Limpiar validaciones
    document.querySelectorAll('.is-invalid').forEach(element => {
        element.classList.remove('is-invalid');
    });
    
    // Ocultar campos condicionales
    document.querySelectorAll('.conditional-field').forEach(field => {
        field.classList.remove('show');
    });
    
    // Resetear barra de progreso
    updateProgress();
    
    // Scroll al principio
    document.querySelector('.dynamic-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Event listeners cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Configurar envío del formulario
    const form = document.getElementById('careerForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validar el paso 4 antes de pasar al resumen
            if (currentStep === 4) {
                if (validateStep(4)) {
                    nextStep(4);
                    updateSummary();
                }
            } else if (currentStep === 5) {
                // En el paso 5, cuando se hace clic en el botón de enviar, 
                // el form-handler.js se encargará del envío AJAX
                // pero necesitamos preparar los datos correctamente
                console.log('Enviando formulario...');
            }
        });
    }
    
    // Actualizar resumen cuando llegamos al paso 5
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.id === 'step5' && mutation.target.classList.contains('active')) {
                updateSummary();
            }
        });
    });
    
    const step5 = document.getElementById('step5');
    if (step5) {
        observer.observe(step5, { attributes: true, attributeFilter: ['class'] });
    }
});

// Hacer funciones globales para que puedan ser llamadas desde HTML
window.nextStep = nextStep;
window.prevStep = prevStep;
window.toggleConditionalFields = toggleConditionalFields;
window.updateSummary = updateSummary;
window.resetForm = resetForm;