/**
 * Generación de reportes Excel para la aplicación
 */
const AWS = require('aws-sdk');
const ExcelJS = require('exceljs');
const { 
  generateProductionReport, 
  generateInventoryReport, 
  generateIssuesReport 
} = require('./generateReports');
const createApiResponse = require('../../utils/response');

const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const REPORTS_BUCKET = process.env.REPORTS_BUCKET || 'huevos-app-reports';
const EGG_TABLE = 'Boxes';
const PALLETS_TABLE = 'Pallets';

/**
 * Genera un reporte Excel a partir de datos
 * @param {string} reportType - Tipo de reporte (production, inventory, issues)
 * @param {string} startDate - Fecha de inicio para reportes por período
 * @param {string} endDate - Fecha fin para reportes por período
 * @returns {Promise<Object>} Información del reporte generado
 */
async function generateExcelReport(reportType, startDate, endDate) {
  try {
    // 1. Obtener datos según el tipo de reporte
    let reportData;
    let reportTitle;
    
    switch (reportType) {
      case 'production':
        if (!startDate || !endDate) {
          throw new Error('Se requieren fechas de inicio y fin para el reporte de producción');
        }
        reportData = await generateProductionReport(startDate, endDate);
        reportTitle = `Reporte de Producción ${startDate} - ${endDate}`;
        break;
      case 'inventory':
        reportData = await generateInventoryReport();
        reportTitle = `Reporte de Inventario ${new Date().toISOString().split('T')[0]}`;
        break;
      case 'issues':
        reportData = await generateIssuesReport(startDate, endDate);
        reportTitle = `Reporte de Problemas ${startDate ? `${startDate} - ${endDate}` : 'Completo'}`;
        break;
      default:
        throw new Error(`Tipo de reporte no soportado: ${reportType}`);
    }

    // 2. Crear un workbook Excel
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Gestión de Huevos';
    workbook.created = new Date();
    
    // 3. Generar hojas según el tipo de reporte
    switch (reportType) {
      case 'production':
        generateProductionWorksheets(workbook, reportData);
        break;
      case 'inventory':
        generateInventoryWorksheets(workbook, reportData);
        break;
      case 'issues':
        generateIssuesWorksheets(workbook, reportData);
        break;
    }
    
    // 4. Guardar el archivo Excel en un buffer
    const excelBuffer = await workbook.xlsx.writeBuffer();
    
    // 5. Subir a S3
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFileName = `${reportType}_${timestamp}.xlsx`;
    const s3Key = `excel-reports/${reportFileName}`;
    
    await s3.putObject({
      Bucket: REPORTS_BUCKET,
      Key: s3Key,
      Body: excelBuffer,
      ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }).promise();
    
    // 6. Generar URL firmada para descarga
    const expirationSeconds = 60 * 60 * 24; // 24 horas
    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: REPORTS_BUCKET,
      Key: s3Key,
      Expires: expirationSeconds
    });
    
    return {
      reportName: reportTitle,
      fileName: reportFileName,
      downloadUrl: signedUrl,
      expiresIn: `${expirationSeconds / 3600} horas`
    };
  } catch (error) {
    console.error('❌ Error al generar reporte Excel:', error);
    throw new Error(`Error al generar reporte Excel: ${error.message}`);
  }
}

/**
 * Genera las hojas de cálculo para un reporte de producción
 * @param {ExcelJS.Workbook} workbook - Libro de trabajo Excel
 * @param {Object} data - Datos del reporte de producción
 */
function generateProductionWorksheets(workbook, data) {
  // Hoja de resumen
  const summarySheet = workbook.addWorksheet('Resumen de Producción');
  
  summarySheet.columns = [
    { header: 'Concepto', key: 'concepto', width: 30 },
    { header: 'Valor', key: 'valor', width: 15 }
  ];
  
  summarySheet.addRows([
    { concepto: 'Período', valor: `${data.periodo.inicio} a ${data.periodo.fin}` },
    { concepto: 'Total Producción', valor: data.totalProduccion }
  ]);
  
  // Aplicar estilos
  summarySheet.getRow(1).font = { bold: true };
  
  // Hoja de producción diaria
  const dailySheet = workbook.addWorksheet('Producción Diaria');
  
  dailySheet.columns = [
    { header: 'Fecha', key: 'fecha', width: 15 },
    { header: 'Cantidad', key: 'cantidad', width: 15 }
  ];
  
  dailySheet.addRows(data.produccionDiaria);
  
  // Aplicar estilos
  dailySheet.getRow(1).font = { bold: true };
  
  // Hoja de producción por calibre
  const caliberSheet = workbook.addWorksheet('Por Calibre');
  
  caliberSheet.columns = [
    { header: 'Calibre', key: 'calibre', width: 15 },
    { header: 'Cantidad', key: 'cantidad', width: 15 }
  ];
  
  caliberSheet.addRows(data.produccionPorCalibre);
  
  // Aplicar estilos
  caliberSheet.getRow(1).font = { bold: true };
  
  // Hoja de producción por formato
  const formatSheet = workbook.addWorksheet('Por Formato');
  
  formatSheet.columns = [
    { header: 'Formato', key: 'formato', width: 15 },
    { header: 'Cantidad', key: 'cantidad', width: 15 }
  ];
  
  formatSheet.addRows(data.produccionPorFormato);
  
  // Aplicar estilos
  formatSheet.getRow(1).font = { bold: true };
}

/**
 * Genera las hojas de cálculo para un reporte de inventario
 * @param {ExcelJS.Workbook} workbook - Libro de trabajo Excel
 * @param {Object} data - Datos del reporte de inventario
 */
function generateInventoryWorksheets(workbook, data) {
  // Hoja de resumen
  const summarySheet = workbook.addWorksheet('Resumen de Inventario');
  
  summarySheet.columns = [
    { header: 'Concepto', key: 'concepto', width: 30 },
    { header: 'Valor', key: 'valor', width: 15 }
  ];
  
  summarySheet.addRows([
    { concepto: 'Fecha de Generación', valor: data.fechaGeneracion.split('T')[0] },
    { concepto: 'Total Huevos', valor: data.totalInventario.total },
    { concepto: 'Huevos en Packing', valor: data.totalInventario.packing },
    { concepto: 'Huevos en Bodega', valor: data.totalInventario.bodega },
    { concepto: 'Huevos en Venta', valor: data.totalInventario.venta },
    { concepto: 'Huevos en Tránsito', valor: data.totalInventario.transito },
    { concepto: 'Total Pallets', valor: data.pallets.total },
    { concepto: 'Pallets Activos', valor: data.pallets.activos },
    { concepto: 'Pallets Cerrados', valor: data.pallets.cerrados },
    { concepto: 'Ocupación Promedio', valor: data.pallets.ocupacionPromedio }
  ]);
  
  // Aplicar estilos
  summarySheet.getRow(1).font = { bold: true };
  
  // Hoja de distribución por calibre
  const caliberSheet = workbook.addWorksheet('Distribución por Calibre');
  
  caliberSheet.columns = [
    { header: 'Calibre', key: 'valor', width: 15 },
    { header: 'Cantidad', key: 'cantidad', width: 15 },
    { header: 'Porcentaje', key: 'porcentaje', width: 15 }
  ];
  
  caliberSheet.addRows(data.distribuciones.porCalibre);
  
  // Aplicar estilos
  caliberSheet.getRow(1).font = { bold: true };
  
  // Hoja de distribución por formato
  const formatSheet = workbook.addWorksheet('Distribución por Formato');
  
  formatSheet.columns = [
    { header: 'Formato', key: 'valor', width: 15 },
    { header: 'Cantidad', key: 'cantidad', width: 15 },
    { header: 'Porcentaje', key: 'porcentaje', width: 15 }
  ];
  
  formatSheet.addRows(data.distribuciones.porFormato);
  
  // Aplicar estilos
  formatSheet.getRow(1).font = { bold: true };
}

/**
 * Genera las hojas de cálculo para un reporte de problemas
 * @param {ExcelJS.Workbook} workbook - Libro de trabajo Excel
 * @param {Object} data - Datos del reporte de problemas
 */
function generateIssuesWorksheets(workbook, data) {
  // Hoja de resumen
  const summarySheet = workbook.addWorksheet('Resumen de Problemas');
  
  summarySheet.columns = [
    { header: 'Concepto', key: 'concepto', width: 30 },
    { header: 'Valor', key: 'valor', width: 15 }
  ];
  
  summarySheet.addRows([
    { concepto: 'Período', valor: typeof data.periodo === 'string' ? data.periodo : `${data.periodo.inicio} a ${data.periodo.fin}` },
    { concepto: 'Total de Problemas', valor: data.totalIssues },
    { concepto: 'Problemas Pendientes', valor: data.porEstado.pendientes },
    { concepto: 'Problemas En Progreso', valor: data.porEstado.enProgreso },
    { concepto: 'Problemas Resueltos', valor: data.porEstado.resueltos },
    { concepto: 'Tiempo Promedio de Resolución', valor: data.tiempoPromedioResolucion }
  ]);
  
  // Aplicar estilos
  summarySheet.getRow(1).font = { bold: true };
  
  // Hoja de problemas recientes
  const recentSheet = workbook.addWorksheet('Problemas Recientes');
  
  recentSheet.columns = [
    { header: 'ID', key: 'id', width: 40 },
    { header: 'Descripción', key: 'descripcion', width: 50 },
    { header: 'Fecha', key: 'fecha', width: 20 },
    { header: 'Estado', key: 'estado', width: 15 }
  ];
  
  // Formatear fechas para el reporte
  const formattedIssues = data.issuesRecientes.map(issue => ({
    ...issue,
    fecha: new Date(issue.fecha).toLocaleString()
  }));
  
  recentSheet.addRows(formattedIssues);
  
  // Aplicar estilos
  recentSheet.getRow(1).font = { bold: true };
}

/**
 * Handler para la generación de reportes Excel
 * @param {Object} event - Evento de API Gateway
 * @returns {Promise<Object>} Respuesta de API con URL de descarga
 */
async function generateExcelReportHandler(event) {
  try {
    const { reportType, startDate, endDate, accessToken } = JSON.parse(event.body || '{}');
    
    if (!reportType) {
      return createApiResponse(400, 'Tipo de reporte no especificado');
    }
    
    // Aquí podríamos agregar validación de token de acceso si es necesario
    
    const reportInfo = await generateExcelReport(reportType, startDate, endDate);
    return createApiResponse(200, 'Reporte Excel generado exitosamente', reportInfo);
  } catch (error) {
    console.error('❌ Error al generar reporte Excel:', error);
    return createApiResponse(500, `Error al generar reporte Excel: ${error.message}`);
  }
}

/**
 * Genera un reporte Excel detallado y personalizado de huevos
 * @param {Object} params - Parámetros para la generación del reporte
 * @param {string} params.title - Título del reporte
 * @param {string} params.ubicacion - Ubicación de los huevos a incluir (opcional)
 * @param {string} params.startDate - Fecha inicial (opcional)
 * @param {string} params.endDate - Fecha final (opcional)
 * @param {string} params.calibre - Filtrar por calibre (opcional)
 * @param {string} params.formato - Filtrar por formato (opcional)
 * @param {string} params.palletId - Filtrar por ID de pallet (opcional)
 * @param {Array} params.campos - Campos a incluir en el reporte
 * @param {Array} params.agrupacion - Cómo agrupar los datos (opcional)
 * @returns {Promise<Object>} Información del reporte generado
 */
async function generateCustomEggReport(params) {
  try {
    const {
      title,
      ubicacion,
      startDate,
      endDate,
      calibre,
      formato,
      palletId,
      campos = ['codigo', 'ubicacion', 'fechaRegistro', 'calibre', 'formato'],
      agrupacion = []
    } = params;

    // Construir la consulta
    let queryParams = {
      TableName: EGG_TABLE
    };

    // Agregar filtros si existen
    let filterExpressions = [];
    let expressionAttributeNames = {};
    let expressionAttributeValues = {};

    // Si hay ubicación, usamos el índice GSI
    if (ubicacion) {
      queryParams.IndexName = 'ubicacion-index';
      queryParams.KeyConditionExpression = '#ubicacion = :ubicacionValue';
      expressionAttributeNames['#ubicacion'] = 'ubicacion';
      expressionAttributeValues[':ubicacionValue'] = ubicacion;
    }

    // Filtrar por fecha
    if (startDate && endDate) {
      filterExpressions.push('fechaRegistro BETWEEN :startDate AND :endDate');
      expressionAttributeValues[':startDate'] = startDate;
      expressionAttributeValues[':endDate'] = endDate;
    } else if (startDate) {
      filterExpressions.push('fechaRegistro >= :startDate');
      expressionAttributeValues[':startDate'] = startDate;
    } else if (endDate) {
      filterExpressions.push('fechaRegistro <= :endDate');
      expressionAttributeValues[':endDate'] = endDate;
    }

    // Filtrar por calibre
    if (calibre) {
      filterExpressions.push('calibre = :calibre');
      expressionAttributeValues[':calibre'] = calibre;
    }

    // Filtrar por formato
    if (formato) {
      filterExpressions.push('formato = :formato');
      expressionAttributeValues[':formato'] = formato;
    }

    // Filtrar por pallet
    if (palletId) {
      filterExpressions.push('palletId = :palletId');
      expressionAttributeValues[':palletId'] = palletId;
    }

    // Agregar filtros a la consulta
    if (filterExpressions.length > 0) {
      queryParams.FilterExpression = filterExpressions.join(' AND ');
      queryParams.ExpressionAttributeValues = expressionAttributeValues;
      if (Object.keys(expressionAttributeNames).length > 0) {
        queryParams.ExpressionAttributeNames = expressionAttributeNames;
      }
    }

    // Ejecutar la consulta
    let eggData;
    if (ubicacion) {
      eggData = await dynamoDB.query(queryParams).promise();
    } else {
      eggData = await dynamoDB.scan(queryParams).promise();
    }

    const eggs = eggData.Items || [];

    // Crear workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Gestión de Huevos';
    workbook.created = new Date();
    
    // Crear worksheet principal
    const mainSheet = workbook.addWorksheet('Datos Detallados');
    
    // Definir columnas
    const columns = campos.map(campo => {
      const width = campo === 'codigo' || campo === 'palletId' ? 20 :
                  campo === 'descripcion' ? 40 : 15;
                  
      return {
        header: campo.charAt(0).toUpperCase() + campo.slice(1),
        key: campo,
        width
      };
    });
    
    mainSheet.columns = columns;
    
    // Agregar datos
    mainSheet.addRows(eggs);
    
    // Aplicar estilos
    mainSheet.getRow(1).font = { bold: true };
    mainSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    
    // Si hay agrupaciones, crear hojas adicionales
    if (agrupacion.length > 0) {
      agrupacion.forEach(campoAgrupacion => {
        // Crear objeto para agrupar
        const groupedData = {};
        
        eggs.forEach(egg => {
          const groupValue = egg[campoAgrupacion] || 'N/A';
          
          if (!groupedData[groupValue]) {
            groupedData[groupValue] = [];
          }
          
          groupedData[groupValue].push(egg);
        });
        
        // Crear worksheet para esta agrupación
        const groupSheet = workbook.addWorksheet(`Por ${campoAgrupacion}`);
        
        // Columnas para el resumen
        groupSheet.columns = [
          { header: campoAgrupacion.charAt(0).toUpperCase() + campoAgrupacion.slice(1), key: 'grupo', width: 20 },
          { header: 'Cantidad', key: 'cantidad', width: 15 },
          { header: 'Porcentaje', key: 'porcentaje', width: 15 }
        ];
        
        // Agregar filas
        const rows = Object.entries(groupedData).map(([grupo, items]) => ({
          grupo,
          cantidad: items.length,
          porcentaje: `${((items.length / eggs.length) * 100).toFixed(2)}%`
        }));
        
        groupSheet.addRows(rows);
        
        // Aplicar estilos
        groupSheet.getRow(1).font = { bold: true };
      });
    }
    
    // Crear hoja de resumen
    const summarySheet = workbook.addWorksheet('Resumen');
    
    summarySheet.columns = [
      { header: 'Concepto', key: 'concepto', width: 30 },
      { header: 'Valor', key: 'valor', width: 15 }
    ];
    
    const summaryRows = [
      { concepto: 'Título del Reporte', valor: title },
      { concepto: 'Fecha de Generación', valor: new Date().toLocaleString() },
      { concepto: 'Total de Registros', valor: eggs.length }
    ];
    
    if (ubicacion) {
      summaryRows.push({ concepto: 'Ubicación', valor: ubicacion });
    }
    
    if (startDate && endDate) {
      summaryRows.push({ concepto: 'Período', valor: `${startDate} a ${endDate}` });
    }
    
    if (calibre) {
      summaryRows.push({ concepto: 'Calibre', valor: calibre });
    }
    
    if (formato) {
      summaryRows.push({ concepto: 'Formato', valor: formato });
    }
    
    if (palletId) {
      summaryRows.push({ concepto: 'Pallet ID', valor: palletId });
    }
    
    summarySheet.addRows(summaryRows);
    summarySheet.getRow(1).font = { bold: true };
    
    // Guardar el archivo Excel en un buffer
    const excelBuffer = await workbook.xlsx.writeBuffer();
    
    // Subir a S3
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFileName = `custom_${timestamp}.xlsx`;
    const s3Key = `excel-reports/${reportFileName}`;
    
    await s3.putObject({
      Bucket: REPORTS_BUCKET,
      Key: s3Key,
      Body: excelBuffer,
      ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }).promise();
    
    // Generar URL firmada para descarga
    const expirationSeconds = 60 * 60 * 24; // 24 horas
    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: REPORTS_BUCKET,
      Key: s3Key,
      Expires: expirationSeconds
    });
    
    return {
      reportName: title,
      fileName: reportFileName,
      downloadUrl: signedUrl,
      expiresIn: `${expirationSeconds / 3600} horas`,
      totalRecords: eggs.length
    };
  } catch (error) {
    console.error('❌ Error al generar reporte Excel personalizado:', error);
    throw new Error(`Error al generar reporte Excel personalizado: ${error.message}`);
  }
}

/**
 * Handler para la generación de reportes Excel personalizados
 * @param {Object} event - Evento de API Gateway
 * @returns {Promise<Object>} Respuesta de API con URL de descarga
 */
async function generateCustomReportHandler(event) {
  try {
    const params = JSON.parse(event.body || '{}');
    
    if (!params.title) {
      return createApiResponse(400, 'Se requiere un título para el reporte');
    }
    
    const reportInfo = await generateCustomEggReport(params);
    return createApiResponse(200, 'Reporte Excel personalizado generado exitosamente', reportInfo);
  } catch (error) {
    console.error('❌ Error al generar reporte Excel personalizado:', error);
    return createApiResponse(500, `Error al generar reporte Excel personalizado: ${error.message}`);
  }
}

module.exports = {
  generateExcelReport,
  generateExcelReportHandler,
  generateCustomEggReport,
  generateCustomReportHandler
}; 