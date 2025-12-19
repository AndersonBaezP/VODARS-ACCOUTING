<?php
/**
 * Script de limpieza - VODARS ACCOUNTING
 * Elimina archivos innecesarios y optimiza el proyecto
 */

echo "<h1>🧹 LIMPIEZA DE ARCHIVOS INNECESARIOS</h1>";

// Archivos innecesarios a eliminar
$files_to_delete = [
    // Scripts de prueba y diagnóstico
    'test-db-connection.php',
    'test-simple-connection.php',
    'test-carreras-form.php',
    'test-carreras-form.html',
    'check-mysql-status.php',
    'diagnostico-carreras.php',
    
    // Backups viejos o duplicados
    'api/carreras-simple.php',
    'api/carreras-final.php',
    
    // Logs y archivos temporales
    'logs/app.log'
];

echo "<h2>📁 Archivos a eliminar:</h2>";
$eliminados = 0;
$errores = 0;

foreach ($files_to_delete as $file) {
    if (file_exists($file)) {
        if (unlink($file)) {
            echo "<p style='color: green;'>✅ Eliminado: $file</p>";
            $eliminados++;
        } else {
            echo "<p style='color: red;'>❌ Error eliminando: $file</p>";
            $errores++;
        }
    } else {
        echo "<p style='color: orange;'>⚠️ No existe: $file</p>";
    }
}

echo "<h2>📊 Resumen:</h2>";
echo "<p><strong>Archivos eliminados:</strong> $eliminados</p>";
echo "<p><strong>Errores:</strong> $errores</p>";

// Limpiar directorios vacíos
echo "<h2>📂 Limpiando directorios vacíos:</h2>";

$directories_to_check = [
    'logs',
    'uploads/aplicaciones/' . date('Y/m/')
];

foreach ($directories_to_check as $dir) {
    if (is_dir($dir)) {
        $files = glob($dir . '*');
        if (empty($files)) {
            if (rmdir($dir)) {
                echo "<p style='color: green;'>✅ Directorio vacío eliminado: $dir</p>";
            }
        } else {
            echo "<p style='color: blue;'>📁 Directorio no vacío: $dir (" . count($files) . " archivos)</p>";
        }
    }
}

// Verificar archivos importantes que deben permanecer
echo "<h2>✅ Verificando archivos importantes:</h2>";

$important_files = [
    'config/database.php',
    'api/contacto.php',
    'api/carreras.php',
    'js/form-handler.js',
    'js/carreras-form.js',
    'database/vodars_database.sql'
];

$existent = 0;
$missing = 0;

foreach ($important_files as $file) {
    if (file_exists($file)) {
        echo "<p style='color: green;'>✅ Existe: $file</p>";
        $existent++;
    } else {
        echo "<p style='color: red;'>❌ FALTA: $file</p>";
        $missing++;
    }
}

echo "<h2>🎯 Estado final:</h2>";
echo "<p><strong>Archivos importantes:</strong> $existent</p>";
echo "<p><strong>Archivos faltantes:</strong> $missing</p>";

if ($missing === 0) {
    echo "<p style='color: green; font-weight: bold;'>🎉 ¡Proyecto limpio y listo para producción!</p>";
} else {
    echo "<p style='color: orange;'>⚠️ Faltan $missing archivos importantes. Revísalos.</p>";
}

?>