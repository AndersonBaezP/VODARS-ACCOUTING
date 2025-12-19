-- SOLUCIÓN DEFINITIVA - Tabla aplicaciones_trabajo
-- Ejecutar este script en MySQL Workbench para solucionar el problema

-- Eliminar tabla si existe (para empezar de cero)
DROP TABLE IF EXISTS aplicaciones_trabajo;

-- Crear tabla con la estructura correcta
CREATE TABLE IF NOT EXISTS aplicaciones_trabajo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    ciudad VARCHAR(100),
    posicion_interes VARCHAR(255) NOT NULL,
    anos_experiencia VARCHAR(50) NOT NULL,
    nivel_educacion VARCHAR(100) NOT NULL,
    certificaciones JSON,
    especializacion_auditoria VARCHAR(255),
    software_contable JSON,
    nivel_ingles VARCHAR(50),
    disponibilidad_horario VARCHAR(100),
    cv_ruta VARCHAR(500),
    carta_presentacion_ruta VARCHAR(500),
    motivacion TEXT NOT NULL,
    pretension_salarial DECIMAL(10,2),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    estado ENUM('recibido', 'en_revision', 'entrevista', 'seleccionado', 'rechazado') DEFAULT 'recibido',
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Índices para mejor rendimiento
    INDEX idx_email (email),
    INDEX idx_posicion (posicion_interes),
    INDEX idx_fecha (fecha_creacion),
    INDEX idx_estado (estado),
    INDEX idx_experiencia (anos_experiencia)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar un registro de prueba para verificar que todo funciona
INSERT INTO aplicaciones_trabajo (
    nombre_completo, email, telefono, ciudad, posicion_interes, 
    anos_experiencia, nivel_educacion, certificaciones, 
    software_contable, nivel_ingles, disponibilidad_horario, 
    motivacion, pretension_salarial, ip_address, user_agent
) VALUES (
    'PRUEBA - Sistema Funcionando', 
    'test@vodars.com', 
    '0991234567', 
    'Quito', 
    'contador-senior', 
    '5-6', 
    'licenciatura', 
    '["cpa"]', 
    '["excel", "quickbooks"]', 
    'avanzado', 
    'tiempo-completo', 
    'Esta es una prueba para verificar que la inserción funciona correctamente.', 
    1500.00, 
    '127.0.0.1', 
    'Prueba Manual'
);

-- Verificar que el registro se insertó correctamente
SELECT 
    id, 
    nombre_completo, 
    email, 
    posicion_interes, 
    fecha_creacion,
    estado
FROM aplicaciones_trabajo 
ORDER BY id DESC 
LIMIT 1;

-- Mensaje de confirmación
SELECT 
    '✅ TABLA CREADA EXITOSAMENTE' as mensaje,
    COUNT(*) as total_registros
FROM aplicaciones_trabajo;