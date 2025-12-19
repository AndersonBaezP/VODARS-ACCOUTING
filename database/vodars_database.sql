-- Base de datos para VODARS ACCOUNTING
-- Created: 2025-12-18
-- Engine: MySQL 8.0+

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS vodars_accounting 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE vodars_accounting;

-- Tabla para contactos
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

-- Tabla para aplicaciones de trabajo (carreras)
CREATE TABLE IF NOT EXISTS aplicaciones_trabajo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    ciudad VARCHAR(100),
    
    -- Información profesional
    posicion_interes VARCHAR(255) NOT NULL,
    anos_experiencia VARCHAR(50) NOT NULL,
    nivel_educacion VARCHAR(100) NOT NULL,
    
    -- Campos condicionales
    certificaciones JSON,
    especializacion_auditoria VARCHAR(255),
    
    -- Habilidades técnicas
    software_contable JSON,
    nivel_ingles VARCHAR(50),
    disponibilidad_horario VARCHAR(100),
    
    -- Documentos y motivación
    cv_ruta VARCHAR(500),
    carta_presentacion_ruta VARCHAR(500),
    motivacion TEXT NOT NULL,
    pretension_salarial DECIMAL(10,2),
    
    -- Metadatos
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

-- Tabla para registro de archivos subidos
CREATE TABLE IF NOT EXISTS archivos_subidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_original VARCHAR(255) NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta VARCHAR(500) NOT NULL,
    tamano_bytes INT NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    tipo_archivo ENUM('cv', 'carta_presentacion', 'otro') NOT NULL,
    id_aplicacion_trabajo INT NULL,
    fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_aplicacion_trabajo) REFERENCES aplicaciones_trabajo(id) ON DELETE SET NULL,
    INDEX idx_tipo (tipo_archivo),
    INDEX idx_aplicacion (id_aplicacion_trabajo),
    INDEX idx_fecha (fecha_subida)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vista para ver estadísticas de contactos
CREATE OR REPLACE VIEW vista_estadisticas_contactos AS
SELECT 
    COUNT(*) as total_contactos,
    COUNT(CASE WHEN estado = 'nuevo' THEN 1 END) as nuevos,
    COUNT(CASE WHEN estado = 'en_proceso' THEN 1 END) as en_proceso,
    COUNT(CASE WHEN estado = 'respondido' THEN 1 END) as respondidos,
    COUNT(CASE WHEN estado = 'cerrado' THEN 1 END) as cerrados,
    DATE(fecha_creacion) as fecha
FROM contactos 
GROUP BY DATE(fecha_creacion)
ORDER BY fecha DESC;

-- Vista para ver estadísticas de aplicaciones
CREATE OR REPLACE VIEW vista_estadisticas_aplicaciones AS
SELECT 
    COUNT(*) as total_aplicaciones,
    COUNT(CASE WHEN estado = 'recibido' THEN 1 END) as recibidos,
    COUNT(CASE WHEN estado = 'en_revision' THEN 1 END) as en_revision,
    COUNT(CASE WHEN estado = 'entrevista' THEN 1 END) as en_entrevista,
    COUNT(CASE WHEN estado = 'seleccionado' THEN 1 END) as seleccionados,
    COUNT(CASE WHEN estado = 'rechazado' THEN 1 END) as rechazados,
    posicion_interes,
    DATE(fecha_creacion) as fecha
FROM aplicaciones_trabajo 
GROUP BY posicion_interes, DATE(fecha_creacion)
ORDER BY fecha DESC;

-- Insertar datos de ejemplo (opcional)
-- INSERT INTO contactos (nombre, email, telefono, asunto, mensaje) VALUES 
-- ('Juan Pérez', 'juan.perez@email.com', '099123456', 'Consulta de servicios', 'Me gustaría conocer más sobre sus servicios contables.'),
-- ('María González', 'maria.gonzalez@email.com', '098765432', 'Cotización', 'Necesito una cotización para servicios de auditoría.');

-- INSERT INTO aplicaciones_trabajo (
--     nombre_completo, email, telefono, ciudad, posicion_interes, 
--     anos_experiencia, nivel_educacion, motivacion
-- ) VALUES 
-- ('Carlos Rodríguez', 'carlos.rodriguez@email.com', '099555777', 'Quito', 'Contador Senior', '5-6', 'Licenciatura/Ingeniería', 'Busco unirme a un equipo profesional donde pueda aplicar mis conocimientos y crecer profesionalmente.');

COMMIT;