<?php
/**
 * API para ver detalles de una aplicación
 */

require_once __DIR__ . '/../config/database.php';
$db = new Database();
$pdo = $db->getConnection();

$id = $_GET['id'] ?? 0;

try {
    $sql = "
        SELECT 
            a.*,
            cv.nombre_archivo as cv_nombre,
            cv.ruta as cv_ruta,
            cv.tamano_bytes as cv_tamano,
            carta.nombre_archivo as carta_nombre,
            carta.ruta as carta_ruta
        FROM aplicaciones_trabajo a
        LEFT JOIN archivos_subidos cv ON a.id = cv.id_aplicacion_trabajo AND cv.tipo_archivo = 'cv'
        LEFT JOIN archivos_subidos carta ON a.id = carta.id_aplicacion_trabajo AND carta.tipo_archivo = 'carta_presentacion'
        WHERE a.id = ?
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id]);
    $aplicacion = $stmt->fetch();
    
    if ($aplicacion) {
        echo json_encode([
            'success' => true,
            'aplicacion' => $aplicacion
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Aplicación no encontrada'
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>