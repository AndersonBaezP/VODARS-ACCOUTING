# VODARS ACCOUNTING - Configuración Base de Datos y Formularios

## 📋 Requisitos Previos

1. **Servidor Web Local**: XAMPP, WAMP, MAMP o similar
2. **MySQL**: Versión 8.0 o superior
3. **PHP**: Versión 7.4 o superior
4. **MySQL Workbench**: Para administración de la base de datos

## 🗄️ Configuración de la Base de Datos

### Paso 1: Crear la Base de Datos

1. Abre **MySQL Workbench**
2. Conéctate a tu servidor MySQL local
3. Ejecuta el siguiente script SQL:

```sql
-- Abrir y ejecutar el archivo: database/vodars_database.sql
```

O ejecuta manualmente:
```sql
CREATE DATABASE IF NOT EXISTS vodars_accounting 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE vodars_accounting;

-- (El resto del script SQL del archivo vodars_database.sql)
```

### Paso 2: Verificar Credenciales

Edita el archivo `config/database.php` y ajusta tus credenciales:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'vodars_accounting');
define('DB_USER', 'root');          // Ajusta tu usuario MySQL
define('DB_PASS', '');              // Ajusta tu contraseña MySQL
```

### Paso 3: Crear Directorios Necesarios

Crea estos directorios en tu proyecto:

```
vodar/
├── uploads/
│   └── aplicaciones/
│       └── 2025/
│           └── 12/
├── logs/
└── api/
    ├── contacto.php
    └── carreras.php
```

## 🌐 Configuración del Servidor Web

### Opción A: XAMPP/WAMP

1. Copia la carpeta `vodar` a:
   - **XAMPP**: `C:/xampp/htdocs/vodar/`
   - **WAMP**: `C:/wamp64/www/vodar/`

2. Inicia Apache y MySQL

3. Accede a la aplicación:
   ```
   http://localhost/vodar/
   ```

### Opción B: Servidor PHP Integrado

1. Abre terminal/cmd
2. Navega a la carpeta del proyecto:
   ```bash
   cd C:/Users/magod/Downloads/vodar
   ```

3. Inicia el servidor:
   ```bash
   php -S localhost:8000
   ```

4. Accede a:
   ```
   http://localhost:8000/
   ```

## 🧪 Probando los Formularios

### Formulario de Contacto

1. Navega a: `http://localhost/vodar/contacto.html`
2. Completa el formulario con datos de prueba
3. Verifica la respuesta en la consola del navegador
4. Revisa la base de datos:

```sql
USE vodars_accounting;
SELECT * FROM contactos ORDER BY fecha_creacion DESC LIMIT 5;
```

### Formulario de "Trabaja con Nosotros"

1. Navega a: `http://localhost/vodar/carreras.html`
2. Completa todos los campos del formulario
3. Adjunta un archivo PDF o DOC (máx. 5MB)
4. Envía el formulario
5. Verifica la base de datos:

```sql
USE vodars_accounting;
SELECT * FROM aplicaciones_trabajo ORDER BY fecha_creacion DESC LIMIT 5;

-- Ver archivos subidos
SELECT * FROM archivos_subidos ORDER BY fecha_subida DESC LIMIT 5;
```

## 🔍 Depuración y Logs

### Habilitar Modo Debug

En `config/database.php`:
```php
define('DEBUG_MODE', true);  // Cambiar a false en producción
```

### Ver Logs de Errores

Los logs se guardan en:
```
logs/app.log
```

### Ver Logs de PHP

En XAMPP/WAMP, revisa:
```
C:/xampp/apache/logs/error.log
```

## 📧 Configuración de Email (Opcional)

Para enviar notificaciones por email, puedes integrar:

1. **PHPMailer** (recomendado)
2. **SendGrid**
3. **Amazon SES**

Ejemplo con PHPMailer:

```php
// En api/contacto.php y api/carreras.php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

function enviarEmailNotificacion($datos) {
    $mail = new PHPMailer(true);
    
    try {
        // Configuración del servidor SMTP
        $mail->SMTPDebug = SMTP::DEBUG_OFF;
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'tu-email@gmail.com';
        $mail->Password   = 'tu-contraseña';
        $mail->SMTPSecure = PHPMailer::SMTP::TLS;
        $mail->Port       = 587;
        
        // Destinatarios
        $mail->setFrom('from@vodars.com', 'VODARS ACCOUNTING');
        $mail->addAddress('gerencia@vodarsaaccounting.com');
        
        // Contenido
        $mail->isHTML(true);
        $mail->Subject = 'Nuevo contacto de VODARS ACCOUNTING';
        $mail->Body    = generarEmailHTML($datos);
        
        $mail->send();
        return true;
    } catch (Exception $e) {
        return false;
    }
}
```

## 🚀 Preparación para Producción (CPanel)

### 1. Subir Archivos

- Sube todos los archivos al servidor via FTP o cPanel File Manager
- Asegúrate de mantener la estructura de directorios

### 2. Configurar Base de Datos

1. Crea la base de datos en cPanel
2. Importa el archivo SQL
3. Actualiza credenciales en `config/database.php`

### 3. Permisos

Establece permisos correctos:
```bash
chmod 755 uploads/
chmod 644 uploads/*
chmod 755 logs/
chmod 644 logs/*
```

### 4. Desactivar Debug

```php
define('DEBUG_MODE', false);
```

### 5. HTTPS

Asegúrate que el sitio use HTTPS y actualiza las URLs si es necesario.

## 🛠️ Solución de Problemas Comunes

### Error de Conexión a BD

```php
// Verifica credenciales en config/database.php
define('DB_HOST', 'localhost');  // O '127.0.0.1'
define('DB_USER', 'root');
define('DB_PASS', '');  // Tu contraseña de MySQL
```

### Error 404 en API

Verifica que:
- Los archivos PHP estén en la carpeta `api/`
- El servidor web permita archivos .PHP
- Las rutas en JavaScript sean correctas

### Archivos No Se Suben

Verifica:
- Permisos del directorio `uploads/`
- Tamaño máximo en `php.ini` (`upload_max_filesize`)
- Tipos MIME permitidos

### CORS Error

Los endpoints PHP ya incluyen headers CORS. Si aún tienes problemas, agrega en `.htaccess`:

```apache
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, Authorization"
```

## 📊 Consultas Útiles

### Estadísticas de Contactos

```sql
-- Contactos por día
SELECT DATE(fecha_creacion) as fecha, COUNT(*) as total
FROM contactos 
WHERE fecha_creacion >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(fecha_creacion)
ORDER BY fecha DESC;

-- Contactos por estado
SELECT estado, COUNT(*) as total
FROM contactos 
GROUP BY estado;
```

### Estadísticas de Aplicaciones

```sql
-- Aplicaciones por posición
SELECT posicion_interes, COUNT(*) as total
FROM aplicaciones_trabajo 
GROUP BY posicion_interes
ORDER BY total DESC;

-- Aplicaciones por mes
SELECT DATE_FORMAT(fecha_creacion, '%Y-%m') as mes, COUNT(*) as total
FROM aplicaciones_trabajo 
GROUP BY DATE_FORMAT(fecha_creacion, '%Y-%m')
ORDER BY mes DESC;
```

## 🎯 Próximos Pasos

1. ✅ Configurar base de datos local
2. ✅ Probar formularios en local
3. ✅ Verificar registros en BD
4. 🔄 Integrar envío de emails
5. 🔄 Implementar panel administrativo
6. 🔄 Desplegar a producción

---

**Soporte**: Si tienes problemas, revisa los logs en `logs/app.log` o contacta al equipo de desarrollo.