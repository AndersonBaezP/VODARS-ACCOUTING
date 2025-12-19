<?php
/**
 * Configuración de la base de datos para VODARS ACCOUNTING - Versión Producción
 * 
 * INSTRUCCIONES PARA SUBIR A CPANEL:
 * 1. Cambia las credenciales de la base de datos según tu hosting
 * 2. Actualiza APP_URL con tu dominio real
 * 3. Cambia DEBUG_MODE a false para producción
 */

// Configuración de la base de datos - CAMBIAR ESTOS VALORES
define('DB_HOST', 'localhost');     // Generalmente 'localhost' en cPanel
define('DB_NAME', 'vodars_accounting');  // Nombre de tu base de datos en cPanel
define('DB_USER', 'tu_usuario_db');   // Usuario de la base de datos en cPanel
define('DB_PASS', 'tu_contraseña');  // Contraseña de la base de datos en cPanel
define('DB_CHARSET', 'utf8mb4');

// Configuración de la aplicación - ACTUALIZAR TU DOMINIO
define('APP_NAME', 'VODARS ACCOUNTING');
define('APP_URL', 'https://tudominio.com');  // CAMBIAR por tu dominio real
define('APP_VERSION', '1.0.0');

// Configuración de archivos subidos
define('UPLOAD_PATH', __DIR__ . '/../uploads/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024);  // 5MB
define('ALLOWED_FILE_TYPES', ['pdf', 'doc', 'docx']);

// Configuración de zona horaria
date_default_timezone_set('America/Guayaquil');  // Zona horaria de Ecuador

// MODO DE PRODUCCIÓN - CAMBIAR A false EN PRODUCCIÓN
define('DEBUG_MODE', false);  // Importante: cambiar a false en producción

if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

/**
 * Clase para manejar la conexión a la base de datos
 */
class Database {
    private $host = DB_HOST;
    private $db_name = DB_NAME;
    private $username = DB_USER;
    private $password = DB_PASS;
    private $charset = DB_CHARSET;
    private $pdo;

    /**
     * Constructor - Establece la conexión a la base de datos
     */
    public function __construct() {
        $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset={$this->charset}";
        
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            $this->pdo = new PDO($dsn, $this->username, $this->password, $options);
            
            if (DEBUG_MODE) {
                error_log("Conexión a base de datos exitosa");
            }
            
        } catch (PDOException $e) {
            if (DEBUG_MODE) {
                die("Error de conexión a la base de datos: " . $e->getMessage());
            } else {
                die("Error en el servidor. Por favor, inténtelo más tarde.");
            }
        }
    }

    /**
     * Obtener la conexión PDO
     * 
     * @return PDO
     */
    public function getConnection() {
        return $this->pdo;
    }

    /**
     * Ejecutar una consulta preparada
     * 
     * @param string $sql La consulta SQL
     * @param array $params Los parámetros para la consulta
     * @return PDOStatement
     */
    public function query($sql, $params = []) {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            if (DEBUG_MODE) {
                die("Error en la consulta: " . $e->getMessage() . "<br>SQL: " . $sql);
            } else {
                die("Error en el servidor. Por favor, inténtelo más tarde.");
            }
        }
    }

    /**
     * Obtener el último ID insertado
     * 
     * @return string
     */
    public function lastInsertId() {
        return $this->pdo->lastInsertId();
    }

    /**
     * Iniciar una transacción
     */
    public function beginTransaction() {
        return $this->pdo->beginTransaction();
    }

    /**
     * Confirmar una transacción
     */
    public function commit() {
        return $this->pdo->commit();
    }

    /**
     * Revertir una transacción
     */
    public function rollBack() {
        return $this->pdo->rollBack();
    }

    /**
     * Verificar si una tabla existe
     * 
     * @param string $table_name
     * @return boolean
     */
    public function tableExists($table_name) {
        try {
            $sql = "SELECT COUNT(*) as count FROM information_schema.tables 
                    WHERE table_schema = :database 
                    AND table_name = :table_name";
            
            $stmt = $this->query($sql, [
                ':database' => $this->db_name,
                ':table_name' => $table_name
            ]);
            
            $result = $stmt->fetch();
            return $result['count'] > 0;
            
        } catch (PDOException $e) {
            if (DEBUG_MODE) {
                error_log("Error verificando tabla: " . $e->getMessage());
            }
            return false;
        }
    }

    /**
     * Destructor - Cierra la conexión
     */
    public function __destruct() {
        $this->pdo = null;
    }
}

/**
 * Funciones de utilidad
 */

/**
 * Limpiar y sanitizar datos de entrada
 * 
 * @param string $data
 * @return string
 */
function cleanInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

/**
 * Validar email
 * 
 * @param string $email
 * @return boolean
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Enviar respuesta JSON
 * 
 * @param boolean $success
 * @param string $message
 * @param mixed $data
 * @param int $http_code
 */
function sendJsonResponse($success, $message, $data = null, $http_code = 200) {
    http_response_code($http_code);
    header('Content-Type: application/json; charset=utf-8');
    
    $response = [
        'success' => $success,
        'message' => $message,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Registrar en log (solo en modo debug)
 * 
 * @param string $message
 * @param string $type
 */
function logMessage($message, $type = 'INFO') {
    if (DEBUG_MODE) {
        $log_file = __DIR__ . '/../logs/app.log';
        $log_dir = dirname($log_file);
        
        if (!is_dir($log_dir)) {
            mkdir($log_dir, 0755, true);
        }
        
        $timestamp = date('Y-m-d H:i:s');
        $log_entry = "[{$timestamp}] [{$type}] {$message}" . PHP_EOL;
        file_put_contents($log_file, $log_entry, FILE_APPEND | LOCK_EX);
    }
}

// Crear directorios necesarios si no existen
if (!is_dir(UPLOAD_PATH)) {
    mkdir(UPLOAD_PATH, 0755, true);
}

$log_dir = __DIR__ . '/../logs';
if (!is_dir($log_dir)) {
    mkdir($log_dir, 0755, true);
}

?>