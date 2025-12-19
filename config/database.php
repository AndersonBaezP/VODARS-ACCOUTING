<?php
/**
 * Configuración de la base de datos para VODARS ACCOUNTING
 * 
 * Este archivo contiene las credenciales y configuración para conectar
 * a la base de datos MySQL local.
 */

// Configuración de la base de datos
define('DB_HOST', 'localhost');     // O '127.0.0.1' si tienes problemas
define('DB_NAME', 'vodars_accounting');
define('DB_USER', 'root');          // Usuario por defecto de MySQL Workbench
define('DB_PASS', '123456');              // Contraseña de MySQL Workbench (déjala vacía si no tienes)
define('DB_CHARSET', 'utf8mb4');

// Configuración de la aplicación
define('APP_NAME', 'VODARS ACCOUNTING');
define('APP_URL', 'http://localhost/vodar');  // Ajusta esta URL según tu configuración local
define('APP_VERSION', '1.0.0');

// Configuración de archivos subidos
define('UPLOAD_PATH', __DIR__ . '/../uploads/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024);  // 5MB
define('ALLOWED_FILE_TYPES', ['pdf', 'doc', 'docx']);

// Configuración de zona horaria
date_default_timezone_set('America/Guayaquil');  // Zona horaria de Ecuador

// Modo de desarrollo (cambiar a false en producción)
define('DEBUG_MODE', true);

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
        // Intentar diferentes configuraciones de conexión
        $connection_attempts = [
            // Intento 1: Configuración principal
            [
                'dsn' => "mysql:host={$this->host};dbname={$this->db_name};charset={$this->charset}",
                'description' => "Configuración principal"
            ],
            // Intento 2: 127.0.0.1 en lugar de localhost
            [
                'dsn' => "mysql:host=127.0.0.1;dbname={$this->db_name};charset={$this->charset}",
                'description' => "Usando 127.0.0.1"
            ],
            // Intento 3: Con puerto explícito
            [
                'dsn' => "mysql:host={$this->host};port=3306;dbname={$this->db_name};charset={$this->charset}",
                'description' => "Puerto 3306 explícito"
            ],
            // Intento 4: 127.0.0.1 con puerto explícito
            [
                'dsn' => "mysql:host=127.0.0.1;port=3306;dbname={$this->db_name};charset={$this->charset}",
                'description' => "127.0.0.1 con puerto 3306"
            ],
            // Intento 5: Sin charset (para MySQL más antiguos)
            [
                'dsn' => "mysql:host={$this->host};dbname={$this->db_name}",
                'description' => "Sin charset"
            ]
        ];
        
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        
        // Agregar charset init command si está disponible
        if (version_compare(PHP_VERSION, '5.3.6', '>=')) {
            $options[PDO::MYSQL_ATTR_INIT_COMMAND] = "SET NAMES {$this->charset}";
        }

        $last_error = null;
        
        foreach ($connection_attempts as $attempt) {
            try {
                if (DEBUG_MODE) {
                    error_log("Intentando conectar: " . $attempt['description'] . " - DSN: " . $attempt['dsn']);
                }
                
                $this->pdo = new PDO($attempt['dsn'], $this->username, $this->password, $options);
                
                if (DEBUG_MODE) {
                    error_log("Conexión exitosa usando: " . $attempt['description']);
                }
                
                // Conexión exitosa, salir del bucle
                return;
                
            } catch (PDOException $e) {
                $last_error = $e->getMessage();
                
                if (DEBUG_MODE) {
                    error_log("Error en " . $attempt['description'] . ": " . $e->getMessage());
                }
                
                // Continuar con el siguiente intento
                continue;
            }
        }
        
        // Si todos los intentos fallaron
        if (DEBUG_MODE) {
            $debug_info = "
            <h3>🔍 Información de Depuración</h3>
            <p><strong>Todos los intentos de conexión fallaron</strong></p>
            <p><strong>Host:</strong> {$this->host}</p>
            <p><strong>Base de datos:</strong> {$this->db_name}</p>
            <p><strong>Usuario:</strong> {$this->username}</p>
            <p><strong>Contraseña:</strong> " . (!empty($this->password) ? str_repeat('*', strlen($this->password)) : '(vacía)') . "</p>
            <p><strong>PHP Version:</strong> " . PHP_VERSION . "</p>
            <p><strong>Último error:</strong> $last_error</p>
            
            <h4>🔧 Posibles soluciones:</h4>
            <ul>
                <li>Verifica que MySQL/XAMPP está corriendo</li>
                <li>Intenta acceder a <a href='test-simple-connection.php'>test-simple-connection.php</a> para diagnóstico</li>
                <li>Revisa las credenciales en config/database.php</li>
                <li>Asegúrate que la base de datos 'vodars_accounting' existe</li>
            </ul>
            ";
            
            die("Error de conexión a la base de datos: $last_error $debug_info");
        } else {
            die("Error en el servidor. Por favor, inténtelo más tarde.");
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
        logMessage("Error verificando tabla: " . $e->getMessage(), 'ERROR');
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