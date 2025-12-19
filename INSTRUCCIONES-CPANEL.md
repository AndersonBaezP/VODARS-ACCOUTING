# INSTRUCCIONES PARA SUBIR A CPANEL - VODARS ACCOUNTING

## 🚀 PASOS ANTES DE SUBIR

### 1. Preparar la Base de Datos
- Accede a cPanel > phpMyAdmin
- Crea una nueva base de datos llamada `vodars_accounting`
- Crea un usuario de base de datos con contraseña segura
- Asigna todos los privilegios al usuario sobre la base de datos
- Importa el archivo SQL: `database/vodars_database_final.sql`

### 2. Configurar Archivos
1. **Configuración de Base de Datos:**
   - Edita `config/database_production.php`
   - Cambia `DB_USER`, `DB_PASS`, `DB_NAME` con tus datos reales
   - Cambia `APP_URL` a tu dominio (ej: `https://tudominio.com`)
   - Verifica que `DEBUG_MODE` esté en `false`

2. **Permisos de Carpetas:**
   - La carpeta `uploads/` necesita permisos 755
   - La carpeta `logs/` necesita permisos 755
   - Archivos PHP necesitan permisos 644

### 3. Subir Archivos
- Comprime toda la carpeta del proyecto en ZIP
- En cPanel > Administrador de archivos > Subir
- Descomprime el archivo ZIP en el directorio principal (`public_html`)
- O usa FTP para subir los archivos directamente

## 🔧 CONFIGURACIÓN POST-SUBIDA

### 1. Verificar Configuración
- Accede a `tudominio.com/config/test-connection.php` (si existe)
- Revisa que todos los enlaces funcionen correctamente
- Prueba el formulario de contacto y el de carreras

### 2. Configurar SSL (Recomendado)
- En cPanel > SSL/TLS > Instalar Certificado SSL
- Activa "Forzar HTTPS" si tu hosting lo permite
- Actualiza el .htaccess para forzar HTTPS (descomenta las líneas)

### 3. Optimizar Rendimiento
- Activa caché en cPanel > Optimización de Sitios
- Configura Cloudflare si está disponible
- Revisa que las imágenes estén optimizadas

## 📁 ESTRUCTURA DE ARCHIVOS IMPORTANTE

```
public_html/
├── index.html
├── carreras.html
├── contacto.html
├── servicios.html
├── nosotros.html
├── personasjuridicas.html
├── personasnaturales.html
├── admin.php
├── .htaccess
├── config/
│   └── database_production.php
├── css/
│   ├── styles.css
│   ├── carrer.css
│   ├── contacto.css
│   └── nosotros.css
├── js/
│   ├── app.js
│   ├── carousel.js
│   ├── carreras-form.js
│   └── form-handler.js
├── img/
│   └── [todas las imágenes]
├── api/
│   ├── carreras.php
│   ├── contacto.php
│   ├── estadisticas.php
│   └── ver_aplicacion.php
├── uploads/
│   └── aplicaciones/
│       └── 2025/
└── logs/
    └── app.log
```

## ⚠️ PROBLEMAS COMUNES Y SOLUCIONES

### Error 500 - Internal Server Error
- Revisa los permisos de archivos (644 para PHP, 755 para carpetas)
- Verifica el archivo `.htaccess`
- Revisa el log de errores en cPanel

### Error de Conexión a Base de Datos
- Verifica credenciales en `config/database_production.php`
- Confirma que la base de datos existe
- Revisa que el usuario tenga los privilegios correctos

### Archivos No Se Suben
- Verifica permisos de la carpeta `uploads/` (755)
- Revisa el tamaño máximo de subida en php.ini
- Confirma que `MAX_FILE_SIZE` sea adecuado

### Estilos No Cargan
- Verifica que las rutas en los archivos HTML sean correctas
- Revisa los permisos de la carpeta `css/`
- Limpia la caché del navegador

## 🔄 MANTENIMIENTO

### 1. Backups Regulares
- Exporta la base de datos semanalmente
- Haz backup de los archivos importantes
- Guarda los backups fuera del servidor

### 2. Actualizaciones
- Revisa actualizaciones de seguridad de PHP
- Actualiza las dependencias si es necesario
- Monitorea el log de errores

### 3. Monitoreo
- Revisa el archivo `logs/app.log` regularmente
- Monitorea el espacio en disco
- Verifica el rendimiento del sitio

## 📞 SOPORTE

Si tienes problemas:
1. Revisa los logs de errores en cPanel
2. Verifica la configuración de PHP
3. Contacta a soporte de tu hosting
4. Revisa la documentación oficial de cPanel

---

## ✅ CHECKLIST FINAL ANTES DE LANZAR

- [ ] Base de datos configurada e importada
- [ ] Archivos de configuración actualizados
- [ ] Permisos de archivos y carpetas correctos
- [ ] SSL configurado y HTTPS forzado
- [ ] Todos los formularios funcionan
- [ ] Las imágenes cargan correctamente
- [ ] El carrusel funciona en móviles
- [ ] Los colores están correctos (empresarial #084a89)
- [ ] No hay errores de JavaScript
- [ ] El sitio es responsivo
- [ ] Los enlaces funcionan correctamente
- [ ] DEBUG_MODE está en false
- [ ] Los backups están configurados

¡Listo para lanzar! 🎉