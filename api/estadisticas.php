<?php
/**
 * API para estadísticas del panel de administración
 */

require_once __DIR__ . '/../config/database.php';
$db = new Database();
$pdo = $db->getConnection();

try {
    // Total de aplicaciones
    $total = $pdo->query("SELECT COUNT(*) as total FROM aplicaciones_trabajo")->fetch();
    
    // Aplicaciones nuevas hoy
    $hoy = $pdo->query("SELECT COUNT(*) as total FROM aplicaciones_trabajo WHERE DATE(fecha_creacion) = CURDATE()")->fetch();
    
    // CVs subidos
    $cvs = $pdo->query("SELECT COUNT(*) as total FROM archivos_subidos WHERE tipo_archivo = 'cv'")->fetch();
    
    echo json_encode([
        'total' => (int)$total['total'],
        'nuevas_hoy' => (int)$hoy['total'],
        'cvs_subidos' => (int)$cvs['total']
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'total' => 0,
        'nuevas_hoy' => 0,
        'cvs_subidos' => 0
    ]);
}
?>