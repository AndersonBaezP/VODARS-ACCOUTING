-- ESTRUCTURA FINAL DE LA BASE DE DATOS - VODARS ACCOUNTING
-- Versión limpia para producción

-- Base de datos
CREATE DATABASE IF NOT EXISTS vodars_accounting 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE vodars_accounting;

-- Tabla de contactos (ya existe y funciona)
CREATE TABLE IF NOT EXISTS contactos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    asunto VARCHAR(255),
    mensaje TEXT NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    estado ENUM('nuevo', 'en_proceso', 'respondido', 'cerrado') DEFAULT 'nuevo',
    ip_address VARCHAR(45),
    user_agent TEXT,
    INDEX idx_email (email),
    INDEX idx_fecha (fecha_creacion),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla principal de aplicaciones
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
    cv_ruta VARCHAR(500),  -- Ruta del archivo guardado
    carta_presentacion_ruta VARCHAR(500),  -- Ruta opcional
    motivacion TEXT NOT NULL,
    pretension_salarial DECIMAL(10,2),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    estado ENUM('recibido', 'en_revision', 'entrevista', 'seleccionado', 'rechazado') DEFAULT 'recibido',
    ip_address VARCHAR(45),
    user_agent TEXT,
    INDEX idx_email (email),
    INDEX idx_posicion (posicion_interes),
    INDEX idx_fecha (fecha_creacion),
    INDEX idx_estado (estado),
    INDEX idx_experiencia (anos_experiencia)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de archivos subidos
CREATE TABLE IF NOT EXISTS archivos_subidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_original VARCHAR(255) NOT NULL,  -- Nombre original del archivo
    nombre_archivo VARCHAR(255) NOT NULL,  -- Nombre único guardado
    ruta VARCHAR(500) NOT NULL,  -- Ruta completa del archivo
    tamano_bytes INT NOT NULL,  -- Tamaño en bytes
    tipo_mime VARCHAR(100) NOT NULL,  -- Tipo MIME
    tipo_archivo ENUM('cv', 'carta_presentacion', 'otro') NOT NULL,
    id_aplicacion_trabajo INT NULL,
    fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_aplicacion_trabajo) REFERENCES aplicaciones_trabajo(id) ON DELETE SET NULL,
    INDEX idx_tipo (tipo_archivo),
    INDEX idx_aplicacion (id_aplicacion_trabajo),
    INDEX idx_fecha (fecha_subida)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vista para administradores
CREATE VIEW IF NOT EXISTS vista_aplicaciones_completas AS
SELECT 
    a.id,
    a.nombre_completo,
    a.email,
    a.telefono,
    a.ciudad,
    a.posicion_interes,
    a.anos_experiencia,
    a.nivel_educacion,
    a.certificaciones,
    a.software_contable,
    a.nivel_ingles,
    a.disponibilidad_horario,
    a.motivacion,
    a.pretension_salarial,
    a.estado,
    a.fecha_creacion,
    -- Información de archivos
    cv.nombre_archivo as cv_nombre,
    cv.ruta as cv_ruta_real,
    cv.tamano_bytes as cv_tamano,
    cv.fecha_subida as cv_fecha,
    carta.nombre_archivo as carta_nombre,
    carta.ruta as carta_ruta_real
FROM aplicaciones_trabajo a
LEFT JOIN archivos_subidos cv ON a.id = cv.id_aplicacion_trabajo AND cv.tipo_archivo = 'cv'
LEFT JOIN archivos_subidos carta ON a.id = carta.id_aplicacion_trabajo AND carta.tipo_archivo = 'carta_presentacion'
ORDER BY a.fecha_creacion DESC;

-- Insertar datos de prueba (opcional)
INSERT IGNORE INTO aplicaciones_trabajo (
    nombre_completo, email, telefono, ciudad, posicion_interes, 
    anos_experiencia, nivel_educacion, certificaciones, 
    software_contable, nivel_ingles, disponibilidad_horario, 
    motivacion, cv_ruta
) VALUES (
    'Sistema Funcionando - Prueba', 
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
    'Sistema de pruebas funcionando correctamente.', 
    'uploads/cv_test.pdf'
);

-- Consultas útiles para verificación
SELECT 
    'Tablas creadas exitosamente' as resultado,
    COUNT(*) as total_aplicaciones
FROM aplicaciones_trabajo;

SELECT 
    'Archivos subidos recientemente' as resultado,
    COUNT(*) as total_archivos
FROM archivos_subidos;

-- Consulta para ver aplicaciones con sus archivos
SELECT 
    a.id,
    a.nombre_completo,
    a.email,
    a.posicion_interes,
    a.fecha_creacion,
    COUNT(cv.id) as cantidad_cv,
    COUNT(carta.id) as cantidad_cartas
FROM aplicaciones_trabajo a
LEFT JOIN archivos_subidos cv ON a.id = cv.id_aplicacion_trabajo AND cv.tipo_archivo = 'cv'
LEFT JOIN archivos_subidos carta ON a.id = carta.id_aplicacion_trabajo AND carta.tipo_archivo = 'carta_presentacion'
GROUP BY a.id, a.nombre_completo, a.email, a.posicion_interes, a.fecha_creacion
ORDER BY a.fecha_creacion DESC
LIMIT 10;