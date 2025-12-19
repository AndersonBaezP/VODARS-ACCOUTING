<?php
/**
 * Backend FINAL LIMPIO para formulario de carreras
 * VODARS ACCOUNTING - Versión producción
 */

// Incluir configuración
require_once __DIR__ . '/../config/database.php';

// Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Solo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    die(json_encode(['success' => false, 'message' => 'Método no permitido']));
}

try {
    // Conexión a BD
    $db = new Database();
    $pdo = $db->getConnection();
    
    // Obtener datos del formulario
    $nombre_completo = trim($_POST['nombre_completo'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $telefono = trim($_POST['telefono'] ?? '');
    $ciudad = trim($_POST['ciudad'] ?? '');
    $posicion_interes = trim($_POST['position'] ?? '');
    $anos_experiencia = trim($_POST['experience'] ?? '');
    $nivel_educacion = trim($_POST['education'] ?? '');
    $nivel_ingles = trim($_POST['nivel_ingles'] ?? '');
    $disponibilidad_horario = trim($_POST['disponibilidad_horario'] ?? '');
    $motivacion = trim($_POST['motivation'] ?? '');
    $pretension_salarial = !empty($_POST['pretension_salarial']) ? floatval($_POST['pretension_salarial']) : null;
    
    // Arrays
    $certificaciones = isset($_POST['certificaciones']) ? $_POST['certificaciones'] : [];
    $software_contable = isset($_POST['software_contable']) ? $_POST['software_contable'] : [];
    
    // Procesar archivos
    $cv_ruta = null;
    $carta_presentacion_ruta = null;
    
    // Crear directorio de uploads si no existe
    $upload_dir = __DIR__ . '/../uploads/aplicaciones/' . date('Y/m/');
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }
    
    // Procesar CV (obligatorio)
    if (isset($_FILES['cv']) && $_FILES['cv']['error'] === UPLOAD_ERR_OK) {
        $file_info = pathinfo($_FILES['cv']['name']);
        $extension = strtolower($file_info['extension']);
        
        if (in_array($extension, ['pdf', 'doc', 'docx'])) {
            // Generar nombre único
            $email_clean = preg_replace('/[^a-zA-Z0-9]/', '_', $email);
            $timestamp = date('Y-m-d_H-i-s');
            $filename = "cv_{$email_clean}_{$timestamp}.{$extension}";
            $filepath = $upload_dir . $filename;
            
            if (move_uploaded_file($_FILES['cv']['tmp_name'], $filepath)) {
                $cv_ruta = 'uploads/aplicaciones/' . date('Y/m/') . $filename;
                
                // Guardar en BD la tabla de archivos
                $sql_archivo = "INSERT INTO archivos_subidos (
                    nombre_original, nombre_archivo, ruta, tamano_bytes, 
                    tipo_mime, tipo_archivo
                ) VALUES (?, ?, ?, ?, ?, ?)";
                
                $stmt_archivo = $pdo->prepare($sql_archivo);
                $stmt_archivo->execute([
                    $_FILES['cv']['name'],
                    $filename,
                    $filepath,
                    $_FILES['cv']['size'],
                    $_FILES['cv']['type'],
                    'cv'
                ]);
                
                $id_archivo_cv = $pdo->lastInsertId();
            }
        }
    }
    
    // Procesar carta de presentación (opcional)
    if (isset($_FILES['carta_presentacion']) && $_FILES['carta_presentacion']['error'] === UPLOAD_ERR_OK) {
        $file_info = pathinfo($_FILES['carta_presentacion']['name']);
        $extension = strtolower($file_info['extension']);
        
        if (in_array($extension, ['pdf', 'doc', 'docx'])) {
            $email_clean = preg_replace('/[^a-zA-Z0-9]/', '_', $email);
            $timestamp = date('Y-m-d_H-i-s');
            $filename = "carta_{$email_clean}_{$timestamp}.{$extension}";
            $filepath = $upload_dir . $filename;
            
            if (move_uploaded_file($_FILES['carta_presentacion']['tmp_name'], $filepath)) {
                $carta_presentacion_ruta = 'uploads/aplicaciones/' . date('Y/m/') . $filename;
                
                // Guardar en BD
                $sql_archivo = "INSERT INTO archivos_subidos (
                    nombre_original, nombre_archivo, ruta, tamano_bytes, 
                    tipo_mime, tipo_archivo
                ) VALUES (?, ?, ?, ?, ?, ?)";
                
                $stmt_archivo = $pdo->prepare($sql_archivo);
                $stmt_archivo->execute([
                    $_FILES['carta_presentacion']['name'],
                    $filename,
                    $filepath,
                    $_FILES['carta_presentacion']['size'],
                    $_FILES['carta_presentacion']['type'],
                    'carta_presentacion'
                ]);
            }
        }
    }
    
    // Validaciones básicas
    $errors = [];
    if (empty($nombre_completo)) $errors[] = 'El nombre completo es obligatorio';
    if (empty($email)) $errors[] = 'El email es obligatorio';
    if (empty($telefono)) $errors[] = 'El teléfono es obligatorio';
    if (empty($posicion_interes)) $errors[] = 'La posición es obligatoria';
    if (empty($motivacion)) $errors[] = 'La motivación es obligatoria';
    if (!$cv_ruta) $errors[] = 'Debe adjuntar su CV';
    
    if (!empty($errors)) {
        die(json_encode(['success' => false, 'message' => 'Errores de validación', 'errors' => $errors]));
    }
    
    // Insertar aplicación en la base de datos
    $sql = "INSERT INTO aplicaciones_trabajo (
        nombre_completo, email, telefono, ciudad, posicion_interes, 
        anos_experiencia, nivel_educacion, certificaciones, 
        software_contable, nivel_ingles, disponibilidad_horario, 
        cv_ruta, carta_presentacion_ruta, motivacion, pretension_salarial, 
        ip_address, user_agent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $params = [
        $nombre_completo,
        $email,
        $telefono,
        $ciudad,
        $posicion_interes,
        $anos_experiencia,
        $nivel_educacion,
        json_encode($certificaciones),
        json_encode($software_contable),
        $nivel_ingles,
        $disponibilidad_horario,
        $cv_ruta,
        $carta_presentacion_ruta,
        $motivacion,
        $pretension_salarial,
        $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
    ];
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute($params);
    
    if ($result) {
        $aplicacion_id = $pdo->lastInsertId();
        
        // Actualizar la referencia del archivo CV
        if (isset($id_archivo_cv)) {
            $update_archivo = "UPDATE archivos_subidos SET id_aplicacion_trabajo = ? WHERE id = ?";
            $stmt_update = $pdo->prepare($update_archivo);
            $stmt_update->execute([$aplicacion_id, $id_archivo_cv]);
        }
        
        echo json_encode([
            'success' => true, 
            'message' => 'Aplicación guardada exitosamente. Nos pondremos en contacto con usted.',
            'data' => [
                'id' => $aplicacion_id,
                'nombre' => $nombre_completo,
                'email' => $email,
                'posicion' => $posicion_interes,
                'cv_guardado' => $cv_ruta ? true : false
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false, 
            'message' => 'Error al guardar la aplicación'
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Error interno: ' . $e->getMessage()
    ]);
}
?>