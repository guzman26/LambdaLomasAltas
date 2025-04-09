/**
 * Generación de informes administrativos para la aplicación
 */
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const createApiResponse = require('../utils/response');

// Tablas de la base de datos
const EGG_TABLE = 'Huevos';
const PALLETS_TABLE = 'Pallets';
const ISSUES_TABLE = 'Issues';
const ADMIN_LOGS_TABLE = 'AdminLogs';

/**
 * Genera un informe de producción por fecha
 * @param {string} startDate - Fecha de inicio (ISO format)
 * @param {string} endDate - Fecha de fin (ISO format)
 * @returns {Promise<Object>} Datos del informe
 */
async function generateProductionReport(startDate, endDate) {
  try {
    // Validar fechas
    if (!startDate || !endDate) {
      throw new Error('Se requieren fechas de inicio y fin para el informe');
    }

    // Consultar huevos producidos en el rango de fechas
    const eggParams = {
      TableName: EGG_TABLE,
      FilterExpression: 'fechaRegistro BETWEEN :startDate AND :endDate',
      ExpressionAttributeValues: {
        ':startDate': startDate,
        ':endDate': endDate
      }
    };

    const eggResults = await dynamoDB.scan(eggParams).promise();
    const eggs = eggResults.Items || [];

    // Agrupar por fecha, calibre y formato
    const productionByDay = {};
    const productionByCalibra = {};
    const productionByFormato = {};

    eggs.forEach(egg => {
      // Por fecha
      const date = egg.fechaRegistro.split('T')[0];
      productionByDay[date] = (productionByDay[date] || 0) + 1;

      // Por calibre
      const calibre = egg.calibre || 'N/A';
      productionByCalibra[calibre] = (productionByCalibra[calibre] || 0) + 1;

      // Por formato
      const formato = egg.formato || 'N/A';
      productionByFormato[formato] = (productionByFormato[formato] || 0) + 1;
    });

    // Generar informe
    return {
      periodo: {
        inicio: startDate,
        fin: endDate
      },
      totalProduccion: eggs.length,
      produccionDiaria: Object.entries(productionByDay).map(([fecha, cantidad]) => ({
        fecha,
        cantidad
      })),
      produccionPorCalibre: Object.entries(productionByCalibra).map(([calibre, cantidad]) => ({
        calibre,
        cantidad
      })),
      produccionPorFormato: Object.entries(productionByFormato).map(([formato, cantidad]) => ({
        formato,
        cantidad
      }))
    };
  } catch (error) {
    console.error('❌ Error al generar informe de producción:', error);
    throw new Error(`Error al generar informe: ${error.message}`);
  }
}

/**
 * Genera un informe de inventario actual
 * @returns {Promise<Object>} Datos del informe de inventario
 */
async function generateInventoryReport() {
  try {
    // Consultar huevos por ubicación
    const [packingEggs, bodegaEggs, ventaEggs, transitoEggs] = await Promise.all([
      dynamoDB.scan({
        TableName: EGG_TABLE,
        IndexName: 'ubicacion-index',
        KeyConditionExpression: '#ubicacion = :locationValue',
        ExpressionAttributeNames: { '#ubicacion': 'ubicacion' },
        ExpressionAttributeValues: { ':locationValue': 'PACKING' }
      }).promise(),
      
      dynamoDB.scan({
        TableName: EGG_TABLE,
        IndexName: 'ubicacion-index',
        KeyConditionExpression: '#ubicacion = :locationValue',
        ExpressionAttributeNames: { '#ubicacion': 'ubicacion' },
        ExpressionAttributeValues: { ':locationValue': 'BODEGA' }
      }).promise(),
      
      dynamoDB.scan({
        TableName: EGG_TABLE,
        IndexName: 'ubicacion-index',
        KeyConditionExpression: '#ubicacion = :locationValue',
        ExpressionAttributeNames: { '#ubicacion': 'ubicacion' },
        ExpressionAttributeValues: { ':locationValue': 'VENTA' }
      }).promise(),
      
      dynamoDB.scan({
        TableName: EGG_TABLE,
        IndexName: 'ubicacion-index',
        KeyConditionExpression: '#ubicacion = :locationValue',
        ExpressionAttributeNames: { '#ubicacion': 'ubicacion' },
        ExpressionAttributeValues: { ':locationValue': 'TRANSITO' }
      }).promise()
    ]);

    // Consultar pallets
    const pallets = await dynamoDB.scan({ TableName: PALLETS_TABLE }).promise();
    
    // Calcular estadísticas de pallets
    const activePallets = pallets.Items.filter(p => !p.fechaCierre);
    const closedPallets = pallets.Items.filter(p => p.fechaCierre);
    
    // Calcular ocupación promedio de pallets
    const avgOccupation = pallets.Items.length > 0
      ? pallets.Items.reduce((sum, p) => sum + (p.cantidadCajas || 0), 0) / pallets.Items.length
      : 0;
    
    // Generar informe
    return {
      fechaGeneracion: new Date().toISOString(),
      totalInventario: {
        packing: packingEggs.Items.length,
        bodega: bodegaEggs.Items.length,
        venta: ventaEggs.Items.length,
        transito: transitoEggs.Items.length,
        total: packingEggs.Items.length + bodegaEggs.Items.length + ventaEggs.Items.length + transitoEggs.Items.length
      },
      pallets: {
        total: pallets.Items.length,
        activos: activePallets.length,
        cerrados: closedPallets.length,
        ocupacionPromedio: avgOccupation.toFixed(2)
      },
      distribuciones: {
        porCalibre: calcularDistribucion(packingEggs.Items.concat(bodegaEggs.Items, ventaEggs.Items, transitoEggs.Items), 'calibre'),
        porFormato: calcularDistribucion(packingEggs.Items.concat(bodegaEggs.Items, ventaEggs.Items, transitoEggs.Items), 'formato')
      }
    };
  } catch (error) {
    console.error('❌ Error al generar informe de inventario:', error);
    throw new Error(`Error al generar informe de inventario: ${error.message}`);
  }
}

/**
 * Genera un informe de problemas y mantenimiento
 * @param {string} startDate - Fecha de inicio (ISO format)
 * @param {string} endDate - Fecha de fin (ISO format)
 * @returns {Promise<Object>} Datos del informe
 */
async function generateIssuesReport(startDate, endDate) {
  try {
    // Consultar problemas en el rango de fechas
    const issuesParams = {
      TableName: ISSUES_TABLE
    };
    
    if (startDate && endDate) {
      issuesParams.FilterExpression = 'timestamp BETWEEN :startDate AND :endDate';
      issuesParams.ExpressionAttributeValues = {
        ':startDate': startDate,
        ':endDate': endDate
      };
    }
    
    const issuesResults = await dynamoDB.scan(issuesParams).promise();
    const issues = issuesResults.Items || [];
    
    // Agrupar por estado
    const issuesByStatus = {
      PENDING: issues.filter(i => !i.status || i.status === 'PENDING'),
      IN_PROGRESS: issues.filter(i => i.status === 'IN_PROGRESS'),
      RESOLVED: issues.filter(i => i.status === 'RESOLVED')
    };
    
    // Calcular tiempo promedio de resolución (para los que tienen resolución)
    const resolvedIssues = issues.filter(i => i.status === 'RESOLVED' && i.lastUpdated);
    let avgResolutionTime = 0;
    
    if (resolvedIssues.length > 0) {
      avgResolutionTime = resolvedIssues.reduce((sum, issue) => {
        const createdAt = new Date(issue.timestamp);
        const resolvedAt = new Date(issue.lastUpdated);
        return sum + (resolvedAt - createdAt) / (1000 * 60 * 60); // Horas
      }, 0) / resolvedIssues.length;
    }
    
    // Generar informe
    return {
      periodo: startDate && endDate ? { inicio: startDate, fin: endDate } : 'Todos los tiempos',
      totalIssues: issues.length,
      porEstado: {
        pendientes: issuesByStatus.PENDING.length,
        enProgreso: issuesByStatus.IN_PROGRESS.length,
        resueltos: issuesByStatus.RESOLVED.length
      },
      tiempoPromedioResolucion: `${avgResolutionTime.toFixed(2)} horas`,
      issuesRecientes: issues
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10)
        .map(i => ({
          id: i.IssueNumber,
          descripcion: i.descripcion,
          fecha: i.timestamp,
          estado: i.status || 'PENDING'
        }))
    };
  } catch (error) {
    console.error('❌ Error al generar informe de problemas:', error);
    throw new Error(`Error al generar informe de problemas: ${error.message}`);
  }
}

/**
 * Calcula la distribución de un campo específico en un conjunto de datos
 * @param {Array} items - Elementos a analizar
 * @param {string} field - Campo para calcular distribución
 * @returns {Array} Distribución del campo
 */
function calcularDistribucion(items, field) {
  const distribution = {};
  
  items.forEach(item => {
    const value = item[field] || 'N/A';
    distribution[value] = (distribution[value] || 0) + 1;
  });
  
  return Object.entries(distribution).map(([valor, cantidad]) => ({
    valor,
    cantidad,
    porcentaje: items.length > 0 ? ((cantidad / items.length) * 100).toFixed(2) + '%' : '0%'
  }));
}

/**
 * Handler para generar informes
 * @param {Object} event - Evento de API Gateway
 * @returns {Promise<Object>} Respuesta de API
 */
async function generateReportHandler(event) {
  try {
    const { reportType, startDate, endDate } = JSON.parse(event.body || '{}');
    
    if (!reportType) {
      return createApiResponse(400, 'Tipo de informe no especificado');
    }
    
    let reportData;
    
    switch (reportType) {
      case 'production':
        reportData = await generateProductionReport(startDate, endDate);
        break;
      case 'inventory':
        reportData = await generateInventoryReport();
        break;
      case 'issues':
        reportData = await generateIssuesReport(startDate, endDate);
        break;
      default:
        return createApiResponse(400, `Tipo de informe no válido: ${reportType}`);
    }
    
    // Registrar la generación del informe
    await dynamoDB.put({
      TableName: ADMIN_LOGS_TABLE,
      Item: {
        operacion: `REPORT_${reportType.toUpperCase()}`,
        timestamp: new Date().toISOString(),
        parametros: { startDate, endDate }
      }
    }).promise();
    
    return createApiResponse(200, `Informe de ${reportType} generado correctamente`, reportData);
  } catch (error) {
    console.error('❌ Error al generar informe:', error);
    return createApiResponse(500, `Error al generar informe: ${error.message}`);
  }
}

module.exports = {
  generateProductionReport,
  generateInventoryReport,
  generateIssuesReport,
  generateReportHandler
}; 