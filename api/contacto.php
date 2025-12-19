<?php
/**
 * Backend para procesar el formulario de contacto
 * VODARS ACCOUNTING
 */

// Incluir configuración de la base de datos
require_once __DIR__ . '/../config/database.php';

// Configurar headers para CORS y JSON
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Manejar preflight request de CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Solo permitir método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(false, 'Método no permitido', null, 405);
}

try {
    // Crear instancia de la base de datos
    $db = new Database();
    $pdo = $db->getConnection();

    // Leer datos JSON del body
    $json_input = file_get_contents('php://input');
    $data = json_decode($json_input, true);

    // Obtener y validar datos del formulario
    $nombre = isset($data['nombre']) ? cleanInput($data['nombre']) : '';
    $email = isset($data['email']) ? cleanInput($data['email']) : '';
    $telefono = isset($data['telefono']) ? cleanInput($data['telefono']) : '';
    $asunto = isset($data['asunto']) ? cleanInput($data['asunto']) : '';
    $mensaje = isset($data['mensaje']) ? cleanInput($data['mensaje']) : '';

    // Validaciones
    $errors = [];

    // Validar nombre
    if (empty($nombre)) {
        $errors[] = 'El nombre es obligatorio';
    } elseif (strlen($nombre) < 3) {
        $errors[] = 'El nombre debe tener al menos 3 caracteres';
    } elseif (strlen($nombre) > 255) {
        $errors[] = 'El nombre no puede exceder 255 caracteres';
    }

    // Validar email
    if (empty($email)) {
        $errors[] = 'El email es obligatorio';
    } elseif (!validateEmail($email)) {
        $errors[] = 'El formato del email no es válido';
    } elseif (strlen($email) > 255) {
        $errors[] = 'El email no puede exceder 255 caracteres';
    }

    // Validar teléfono (opcional pero si se proporciona debe ser válido)
    if (!empty($telefono)) {
        // Eliminar caracteres no numéricos excepto + y espacios
        $telefono_limpio = preg_replace('/[^0-9+\s]/', '', $telefono);
        if (strlen($telefono_limpio) < 7) {
            $errors[] = 'El teléfono debe tener al menos 7 dígitos';
        }
        $telefono = $telefono_limpio;
    }

    // Validar asunto (opcional)
    if (!empty($asunto) && strlen($asunto) > 255) {
        $errors[] = 'El asunto no puede exceder 255 caracteres';
    }

    // Validar mensaje
    if (empty($mensaje)) {
        $errors[] = 'El mensaje es obligatorio';
    } elseif (strlen($mensaje) < 10) {
        $errors[] = 'El mensaje debe tener al menos 10 caracteres';
    } elseif (strlen($mensaje) > 5000) {
        $errors[] = 'El mensaje no puede exceder 5000 caracteres';
    }

    // Si hay errores de validación, devolverlos
    if (!empty($errors)) {
        sendJsonResponse(false, 'Errores de validación', ['errors' => $errors], 400);
    }

    // Verificar si la tabla existe
    if (!$db->tableExists('contactos')) {
        logMessage('La tabla contactos no existe', 'ERROR');
        sendJsonResponse(false, 'Error en la configuración de la base de datos', null, 500);
    }

    // Preparar la consulta SQL
    $sql = "INSERT INTO contactos (nombre, email, telefono, asunto, mensaje, ip_address, user_agent) 
            VALUES (:nombre, :email, :telefono, :asunto, :mensaje, :ip_address, :user_agent)";

    // Obtener información del cliente
    $ip_address = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';

    // Ejecutar la consulta
    $stmt = $db->query($sql, [
        ':nombre' => $nombre,
        ':email' => $email,
        ':telefono' => $telefono,
        ':asunto' => $asunto,
        ':mensaje' => $mensaje,
        ':ip_address' => $ip_address,
        ':user_agent' => $user_agent
    ]);

    // Obtener el ID del registro insertado
    $contacto_id = $db->lastInsertId();

    // Registrar en el log
    logMessage("Nuevo contacto registrado: ID {$contacto_id}, Email: {$email}", 'SUCCESS');

    // Enviar email de notificación (opcional)
    $email_enviado = false;
    if (function_exists('enviarEmailNotificacion')) {
        $email_enviado = enviarEmailNotificacion($nombre, $email, $telefono, $asunto, $mensaje);
    }

    // Preparar respuesta exitosa
    $response_data = [
        'contacto_id' => $contacto_id,
        'nombre' => $nombre,
        'email' => $email,
        'email_notificacion_enviada' => $email_enviado,
        'mensaje' => 'Su mensaje ha sido enviado correctamente. Nos pondremos en contacto con usted a la brevedad.'
    ];

    sendJsonResponse(true, 'Mensaje enviado exitosamente', $response_data, 201);

} catch (Exception $e) {
    // Registrar error
    logMessage("Error en procesamiento de contacto: " . $e->getMessage(), 'ERROR');
    
    // Enviar respuesta de error
    if (DEBUG_MODE) {
        sendJsonResponse(false, 'Error al procesar el formulario: ' . $e->getMessage(), null, 500);
    } else {
        sendJsonResponse(false, 'Error interno del servidor. Por favor, inténtelo más tarde.', null, 500);
    }
}

/**
 * Función para enviar email de notificación (opcional)
 * 
 * @param string $nombre
 * @param string $email
 * @param string $telefono
 * @param string $asunto
 * @param string $mensaje
 * @return boolean
 */
function enviarEmailNotificacion($nombre, $email, $telefono, $asunto, $mensaje) {
    try {
        // Aquí puedes implementar el envío de email usando PHPMailer, SendGrid, etc.
        // Por ahora solo registraremos en el log
        
        $email_content = "
        Nuevo contacto de VODARS ACCOUNTING:
        
        Nombre: {$nombre}
        Email: {$email}
        Teléfono: {$telefono}
        Asunto: {$asunto}
        
        Mensaje:
        {$mensaje}
        
        Fecha: " . date('Y-m-d H:i:s') . "
        ";
        
        logMessage("Email de notificación para contacto: \n" . $email_content, 'EMAIL');
        
        return true; // Simulamos que el email se envió correctamente
        
    } catch (Exception $e) {
        logMessage("Error al enviar email de notificación: " . $e->getMessage(), 'ERROR');
        return false;
    }
}

?>