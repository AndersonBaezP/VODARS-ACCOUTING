<?php
/**
 * Panel de Administración - VODARS ACCOUNTING
 * Ver aplicaciones y descargar archivos
 */

require_once __DIR__ . '/config/database.php';
$db = new Database();
$pdo = $db->getConnection();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel de Administración - VODARS ACCOUNTING</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <style>
        body { background: #f8f9fa; }
        .navbar { background: #084a89 !important; }
        .table-container { background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .badge-new { background: #28a745; }
        .file-link { color: #084a89; text-decoration: none; }
        .file-link:hover { text-decoration: underline; }
        .stats-card { 
            background: linear-gradient(135deg, #084a89, #19213C); 
            color: white; 
            border-radius: 10px; 
            padding: 20px; 
            margin-bottom: 20px;
        }
        .download-btn {
            background: #6df5c1;
            color: #084a89;
            border: none;
            padding: 5px 10px;
            border-radius: 5px;
            text-decoration: none;
            font-size: 12px;
        }
        .download-btn:hover {
            background: #5ae8b3;
            color: #084a89;
        }
    </style>
</head>
<body>
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark">
        <div class="container">
            <a class="navbar-brand" href="index.html">
                <i class="fas fa-briefcase"></i> VODARS ADMIN
            </a>
            <div class="navbar-nav ms-auto">
                <a class="nav-link" href="index.html">
                    <i class="fas fa-home"></i> Volver al sitio
                </a>
            </div>
        </div>
    </nav>

    <div class="container mt-4">
        <!-- Estadísticas -->
        <div class="row">
            <div class="col-md-4">
                <div class="stats-card">
                    <h3><i class="fas fa-file-alt"></i></h3>
                    <h2 id="totalAplicaciones">0</h2>
                    <p>Total Aplicaciones</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stats-card">
                    <h3><i class="fas fa-user-clock"></i></h3>
                    <h2 id="aplicacionesNuevas">0</h2>
                    <p>Nuevas (Hoy)</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stats-card">
                    <h3><i class="fas fa-download"></i></h3>
                    <h2 id="totalCVs">0</h2>
                    <p>CVs Subidos</p>
                </div>
            </div>
        </div>

        <!-- Tabla de aplicaciones -->
        <div class="table-container p-4">
            <h2 class="mb-4">
                <i class="fas fa-users"></i> Aplicaciones Recibidas
                <small class="text-muted"> - Últimos 30 días</small>
            </h2>

            <!-- Filtros -->
            <div class="row mb-3">
                <div class="col-md-4">
                    <select class="form-select" id="filtroPosicion">
                        <option value="">Todas las posiciones</option>
                        <?php
                        $posiciones = $pdo->query("SELECT DISTINCT posicion_interes FROM aplicaciones_trabajo ORDER BY posicion_interes");
                        while ($row = $posiciones->fetch()) {
                            echo "<option value='{$row['posicion_interes']}'>{$row['posicion_interes']}</option>";
                        }
                        ?>
                    </select>
                </div>
                <div class="col-md-4">
                    <select class="form-select" id="filtroEstado">
                        <option value="">Todos los estados</option>
                        <option value="recibido">Recibido</option>
                        <option value="en_revision">En Revisión</option>
                        <option value="entrevista">Entrevista</option>
                        <option value="seleccionado">Seleccionado</option>
                        <option value="rechazado">Rechazado</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <button class="btn btn-primary w-100" onclick="filtrarAplicaciones()">
                        <i class="fas fa-filter"></i> Filtrar
                    </button>
                </div>
            </div>

            <!-- Tabla -->
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Posición</th>
                            <th>Estado</th>
                            <th>CV</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="tablaAplicaciones">
                        <?php
                        $sql = "
                            SELECT 
                                a.*,
                                cv.nombre_archivo as cv_nombre,
                                cv.ruta as cv_ruta,
                                carta.nombre_archivo as carta_nombre
                            FROM aplicaciones_trabajo a
                            LEFT JOIN archivos_subidos cv ON a.id = cv.id_aplicacion_trabajo AND cv.tipo_archivo = 'cv'
                            LEFT JOIN archivos_subidos carta ON a.id = carta.id_aplicacion_trabajo AND carta.tipo_archivo = 'carta_presentacion'
                            WHERE a.fecha_creacion >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                            ORDER BY a.fecha_creacion DESC
                            LIMIT 50
                        ";
                        
                        $stmt = $pdo->query($sql);
                        
                        while ($row = $stmt->fetch()) {
                            $esHoy = date('Y-m-d', strtotime($row['fecha_creacion'])) === date('Y-m-d');
                            $badgeClass = $esHoy ? 'badge-new' : 'bg-secondary';
                            
                            echo "<tr>";
                            echo "<td><strong>#{$row['id']}</strong></td>";
                            echo "<td>{$row['nombre_completo']}</td>";
                            echo "<td>{$row['email']}</td>";
                            echo "<td>{$row['telefono']}</td>";
                            echo "<td><small>{$row['posicion_interes']}</small></td>";
                            echo "<td><span class='badge {$badgeClass}'>" . ucfirst(str_replace('_', ' ', $row['estado'])) . "</span></td>";
                            
                            // CV
                            if ($row['cv_ruta']) {
                                echo "<td><a href='{$row['cv_ruta']}' class='download-btn' target='_blank'><i class='fas fa-download'></i> CV</a></td>";
                            } else {
                                echo "<td><span class='text-muted'>No subido</span></td>";
                            }
                            
                            echo "<td><small>" . date('d/m/Y H:i', strtotime($row['fecha_creacion'])) . "</small></td>";
                            
                            // Acciones
                            echo "<td>";
                            echo "<button class='btn btn-sm btn-primary me-1' onclick='verDetalles({$row['id']})'><i class='fas fa-eye'></i></button>";
                            echo "<button class='btn btn-sm btn-success' onclick='cambiarEstado({$row['id']})'><i class='fas fa-edit'></i></button>";
                            echo "</td>";
                            
                            echo "</tr>";
                        }
                        ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Modal de detalles -->
    <div class="modal fade" id="detallesModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Detalles de Aplicación</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" id="detallesContenido">
                    <!-- Se llenará dinámicamente -->
                </div>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Estadísticas
        async function cargarEstadisticas() {
            try {
                const response = await fetch('./api/estadisticas.php');
                const stats = await response.json();
                
                document.getElementById('totalAplicaciones').textContent = stats.total;
                document.getElementById('aplicacionesNuevas').textContent = stats.nuevas_hoy;
                document.getElementById('totalCVs').textContent = stats.cvs_subidos;
            } catch (error) {
                console.error('Error cargando estadísticas:', error);
            }
        }

        // Ver detalles
        async function verDetalles(id) {
            try {
                const response = await fetch(`./api/ver_aplicacion.php?id=${id}`);
                const datos = await response.json();
                
                if (datos.success) {
                    const app = datos.aplicacion;
                    
                    let html = `
                        <div class="row">
                            <div class="col-md-6">
                                <h6>Información Personal</h6>
                                <p><strong>Nombre:</strong> ${app.nombre_completo}</p>
                                <p><strong>Email:</strong> ${app.email}</p>
                                <p><strong>Teléfono:</strong> ${app.telefono}</p>
                                <p><strong>Ciudad:</strong> ${app.ciudad || 'No especificada'}</p>
                            </div>
                            <div class="col-md-6">
                                <h6>Información Profesional</h6>
                                <p><strong>Posición:</strong> ${app.posicion_interes}</p>
                                <p><strong>Experiencia:</strong> ${app.anos_experiencia}</p>
                                <p><strong>Educación:</strong> ${app.nivel_educacion}</p>
                                <p><strong>Estado:</strong> <span class="badge bg-primary">${app.estado}</span></p>
                            </div>
                        </div>
                        
                        <div class="row mt-3">
                            <div class="col-12">
                                <h6>Motivación</h6>
                                <p>${app.motivacion}</p>
                            </div>
                        </div>
                        
                        <div class="row mt-3">
                            <div class="col-md-6">
                                <h6>Archivos</h6>
                                ${app.cv_ruta ? `<a href="${app.cv_ruta}" class="btn btn-success btn-sm me-2" target="_blank"><i class="fas fa-download"></i> CV</a>` : '<span class="text-muted">No hay CV</span>'}
                                ${app.carta_presentacion_ruta ? `<a href="${app.carta_presentacion_ruta}" class="btn btn-info btn-sm" target="_blank"><i class="fas fa-download"></i> Carta</a>` : ''}
                            </div>
                            <div class="col-md-6">
                                <h6>Skills</h6>
                                ${app.software_contable ? `<p><strong>Software:</strong> ${JSON.parse(app.software_contable).join(', ')}</p>` : ''}
                                <p><strong>Inglés:</strong> ${app.nivel_ingles || 'No especificado'}</p>
                            </div>
                        </div>
                    `;
                    
                    document.getElementById('detallesContenido').innerHTML = html;
                    new bootstrap.Modal(document.getElementById('detallesModal')).show();
                }
            } catch (error) {
                console.error('Error cargando detalles:', error);
            }
        }

        // Cambiar estado
        function cambiarEstado(id) {
            const nuevoEstado = prompt('Nuevo estado (recibido/en_revision/entrevista/seleccionado/rechazado):');
            if (nuevoEstado) {
                // Aquí implementar el cambio de estado
                alert('Función de cambio de estado implementación pendiente');
            }
        }

        // Filtrar aplicaciones
        function filtrarAplicaciones() {
            const posicion = document.getElementById('filtroPosicion').value;
            const estado = document.getElementById('filtroEstado').value;
            
            // Construir URL con filtros
            let url = location.pathname;
            const params = new URLSearchParams();
            
            if (posicion) params.append('posicion', posicion);
            if (estado) params.append('estado', estado);
            
            if (params.toString()) {
                url += '?' + params.toString();
            }
            
            location.reload();
        }

        // Cargar estadísticas al iniciar
        document.addEventListener('DOMContentLoaded', cargarEstadisticas);
    </script>
</body>
</html>