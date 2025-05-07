const getBoxes = require('./handlers/getBoxes');
const getBodegaEggs = require('./handlers/getBodegaEggs');
const getPackingEggs = require('./handlers/getPackingEggs');
const getVentaBoxesHandler = require('./handlers/getVentaBoxes');
const getEggByCodigo = require('./handlers/getEggsByCodigo');
const getEggsByDate = require('./handlers/getEggsByDate');
const registerEggHandler = require('./handlers/registerEgg');
const getPalletsHandler = require('./handlers/getPallets');
const { moveEgg } = require('./handlers/moveBox');
const { movePallet } = require('./handlers/movePallet');
const createApiResponse = require('./utils/response');
const assignPalletHandler = require('./handlers/assignPallet');
const addBoxToPalletHandler = require('./handlers/addBoxToPallet');
const { setSystemConfig, getSystemConfig } = require('./models/systemConfig');
const closePalletHandler = require('./handlers/closePallet');
const createPalletHandler = require('./handlers/createPallet');
const updateBoxDescription = require('./handlers/updateBoxDescription');
const getActivePalletsHandler = require('./handlers/getActivePallets');
const getClosedPallets = require('./handlers/getClosedPallets');
const getBoxesInPallet = require('./handlers/getBoxesInPallet');
const getBoxByCode = require('./handlers/getBoxByCode');
const getUnassignedBoxesInPackingHandler = require('./handlers/getUnassignedBoxesInPacking');
const postIssue = require('./handlers/postIssue');
const deleteBoxHandler = require('./handlers/deleteBox');
const deletePallet = require('./handlers/deletePallet');
const updateIssueStatusHandler = require('./handlers/updateIssueStatus');
const getItemHistoryHandler = require('./handlers/getItemHistory');
const getAllHistory = require('./handlers/getMovementHistory');
const AWS = require('aws-sdk');
const codepipeline = new AWS.CodePipeline();

const {
  auditAndFixData,
  backupData,
  deleteIssue,
} = require('./handlers/admin');
const { getSystemDashboard } = require('./handlers/admin/getSystemDashboard');
const { getIssues } = require('./handlers/admin/getIssues');
const { updateIssueStatus } = require('./handlers/admin/updateIssueStatus');
const { generateReportHandler } = require('./handlers/generateReports');
const {
  generateExcelReportHandler,
  generateCustomReportHandler,
} = require('./handlers/generateExcelReports');

const CONFIG = {
  LOCATIONS: {
    PACKING: 'PACKING',
    BODEGA: 'BODEGA',
    VENTA: 'VENTA',
    TRANSITO: 'TRANSITO',
  },
  ITEM_TYPES: {
    BOX: 'BOX',
    PALLET: 'PALLET',
  },
};

const helpers = {
  parseBody: event => {
    if (!event.body) return {};
    try {
      return typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } catch {
      throw new Error('Invalid request body: unable to parse JSON');
    }
  },
  getQueryParams: event => event.queryStringParameters || {},
  validateRequired: (data, requiredParams) => {
    const missing = requiredParams.filter(param => !data[param]);
    if (missing.length > 0) {
      throw new Error(`Missing parameters: ${missing.join(', ')}`);
    }
  },
  validateLocation: (location, allowed) => {
    if (!allowed.includes(location)) {
      throw new Error(`Invalid location: ${location}. Valid options: ${allowed.join(', ')}`);
    }
  },
};

const createHandler = (handlerFn, options = {}) => {
  return async event => {
    try {
      return await handlerFn(event, options);
    } catch (error) {
      console.error('❌ Error in route handler:', error);
      return createApiResponse(error.statusCode || 500, error.message);
    }
  };
};

const getRoutes = {
  '/getBodegaEggs': getBodegaEggs,
  '/getPackingData': getPackingEggs,
  '/getVentaData': createHandler(getVentaBoxesHandler),
  '/getEggsByDate': getEggsByDate,
  '/production': getBoxes,
  '/getPallets': createHandler(getPalletsHandler),
  '/getActivePallets': createHandler(getActivePalletsHandler),
  '/getClosedPallets': createHandler(async event => {
    const { ubicacion } = helpers.getQueryParams(event);
    const result = await getClosedPallets(ubicacion);
    return createApiResponse(200, 'Closed pallets fetched successfully', result);
  }),
  '/getEggsByCodigo': createHandler(async event => {
    const { codigo } = helpers.getQueryParams(event);
    helpers.validateRequired({ codigo }, ['codigo']);
    const result = await getEggByCodigo(codigo);
    return createApiResponse(200, 'Egg data fetched successfully', result);
  }),
  '/getUnassignedBoxesInPacking': createHandler(async () => {
    const result = await getUnassignedBoxesInPackingHandler();
    return createApiResponse(200, 'Unassigned boxes in packing fetched successfully', result);
  }),
  '/admin/dashboard': createHandler(async () => {
    console.log('getSystemDashboard');
    const result = await getSystemDashboard();
    return createApiResponse(200, 'Dashboard data fetched successfully', result);
  }),
  '/admin/issues': createHandler(async event => {
    const { status, startDate, endDate } = helpers.getQueryParams(event);
    const result = await getIssues({ status, startDate, endDate });
    return createApiResponse(200, 'Issues fetched successfully', result);
  }),
  '/getItemHistory': createHandler(getItemHistoryHandler),
  '/getMovementHistory': createHandler(async event => {
    const { startDate, endDate } = helpers.getQueryParams(event);
    const result = await getAllHistory(startDate, endDate);
    return createApiResponse(200, 'Movement history fetched successfully', result);
  }),
};

const postRoutes = {
  '/procesar-escaneo': createHandler(async event => {
    const data = helpers.parseBody(event);
    let { codigo, ubicacion, tipo, palletCodigo, scannedCodes } = data;

    console.log('Datos recibidos:', JSON.stringify(data, null, 2));

    helpers.validateRequired(data, ['codigo', 'ubicacion']);
    helpers.validateLocation(ubicacion, Object.values(CONFIG.LOCATIONS));

    // Determinar el tipo basado en la longitud del código si no se proporciona
    if (!tipo) {
      tipo = codigo.length === 15 ? CONFIG.ITEM_TYPES.BOX : CONFIG.ITEM_TYPES.PALLET;
      console.log(`Tipo determinado automáticamente: ${tipo}`);
    }

    if (tipo === CONFIG.ITEM_TYPES.PALLET) {
      if (ubicacion === CONFIG.LOCATIONS.PACKING) {
        throw { statusCode: 400, message: 'Pallets cannot be moved to PACKING directly.' };
      }
      return await movePallet(codigo, ubicacion);
    } else {
      if (ubicacion === CONFIG.LOCATIONS.PACKING) {
        return palletCodigo
          ? await registerEggHandler(codigo, palletCodigo, palletCodigo, scannedCodes)
          : await registerEggHandler(codigo);
      } else {
        return await moveEgg(codigo, ubicacion);
      }
    }
  }),

  '/AssignPallet': createHandler(async event => {
    const { codigo } = helpers.parseBody(event);
    helpers.validateRequired({ codigo }, ['codigo']);
    await assignPalletHandler(codigo);
    await setSystemConfig('ACTIVE_PALLET_CODE', codigo);
    return createApiResponse(200, 'Pallet assigned successfully', { palletCode: codigo });
  }),

  '/AssignBoxToPallet': createHandler(async event => {
    const { codigo, customInfo } = helpers.parseBody(event);
    helpers.validateRequired({ codigo }, ['codigo']);
    const pallet = await getSystemConfig('ACTIVE_PALLET_CODE');
    if (!pallet) throw { statusCode: 400, message: 'No active pallet found. Please assign one.' };
    return await registerEggHandler(codigo, pallet, customInfo);
  }),

  '/movePallet': createHandler(async event => {
    const { codigo, ubicacion } = helpers.parseBody(event);
    helpers.validateRequired({ codigo, ubicacion }, ['codigo', 'ubicacion']);
    helpers.validateLocation(ubicacion, ['TRANSITO', 'BODEGA', 'VENTA']);
    return await movePallet(codigo, ubicacion);
  }),

  '/closePallet': createHandler(async event => {
    const { codigo } = helpers.parseBody(event);
    helpers.validateRequired({ codigo }, ['codigo']);
    const result = await closePalletHandler(codigo);
    return createApiResponse(200, 'Pallet closed successfully', result);
  }),

  '/createPallet': createHandler(async event => {
    const { codigo } = helpers.parseBody(event);
    helpers.validateRequired({ codigo }, ['codigo']);
    const result = await createPalletHandler(codigo);
    return createApiResponse(200, 'Pallet created successfully', result);
  }),

  '/updateBoxDescription': createHandler(async event => {
    const { codigo, customInfo } = helpers.parseBody(event);
    helpers.validateRequired({ codigo, customInfo }, ['codigo', 'customInfo']);
    const result = await updateBoxDescription(codigo, customInfo);
    return createApiResponse(200, 'Box description updated successfully', result);
  }),

  '/getBoxesInPallet': createHandler(async event => {
    return await getBoxesInPallet(event);
  }),

  '/getBoxByCode': createHandler(async event => {
    const { codigo } = helpers.parseBody(event);
    helpers.validateRequired({ codigo }, ['codigo']);
    const result = await getBoxByCode(codigo);
    return createApiResponse(200, 'Box data fetched successfully', result);
  }),
  '/postIssue': createHandler(async event => {
    const { descripcion } = helpers.parseBody(event);
    console.log('Descripción recibida:', descripcion);
    return await postIssue(descripcion);
  }),

  '/admin/updateIssueStatus': createHandler(async event => {
    const { issueId, status, resolution } = helpers.parseBody(event);
    helpers.validateRequired({ issueId, status }, ['issueId', 'status']);
    const result = await updateIssueStatus(issueId, status, resolution);
    return createApiResponse(200, 'Issue status updated successfully', result);
  }),

  '/admin/auditAndFix': createHandler(async () => {
    const result = await auditAndFixData();
    return createApiResponse(200, 'Audit and fix completed successfully', result);
  }),

  '/admin/backup': createHandler(async () => {
    const result = await backupData();
    return createApiResponse(200, 'Backup completed successfully', result);
  }),

  '/admin/generateReport': createHandler(async event => {
    return await generateReportHandler(event);
  }),

  '/admin/generateExcelReport': createHandler(async event => {
    return await generateExcelReportHandler(event);
  }),

  '/admin/generateCustomReport': createHandler(async event => {
    return await generateCustomReportHandler(event);
  }),

  '/admin/deleteBox': createHandler(async event => {
    const { codigo } = helpers.parseBody(event);
    helpers.validateRequired({ codigo }, ['codigo']);
    const result = await deleteBoxHandler(codigo);
    return createApiResponse(result.success ? 200 : 400, result.message);
  }),

  '/admin/deletePallet': createHandler(async event => {
    const { codigo } = helpers.parseBody(event);
    helpers.validateRequired({ codigo }, ['codigo']);
    const result = await deletePallet(codigo);
    return createApiResponse(result.success ? 200 : 400, result.message);
  }),

  '/admin/issues/{issueId}/status': createHandler(async event => {
    const { issueId } = event.pathParameters || {};
    const { status, resolution } = helpers.parseBody(event);
    helpers.validateRequired({ issueId, status }, ['issueId', 'status']);

    const result = await updateIssueStatusHandler(issueId, status, resolution);
    return createApiResponse(200, 'Estado de la incidencia actualizado correctamente', result);
  }),

  // New endpoint for updating issue status
  '/admin/issues/update-status': createHandler(async event => {
    const { issueId, status, resolution } = JSON.parse(event.body || '{}');

    if (!issueId || !status) {
      return createApiResponse(400, 'Faltan campos requeridos: issueId y status son obligatorios');
    }

    const result = await updateIssueStatusHandler(issueId, status, resolution);
    return createApiResponse(200, 'Estado de la incidencia actualizado correctamente', result);
  }),

  // New endpoint for deleting issues
  '/admin/issues/delete': createHandler(async event => {
    const { issueId } = JSON.parse(event.body || '{}');

    if (!issueId) {
      return createApiResponse(400, 'Falta el campo requerido: issueId es obligatorio');
    }

    const result = await deleteIssue(issueId);
    return createApiResponse(200, 'Incidencia eliminada correctamente', result);
  }),
};

const putRoutes = {
  // Dynamic route matching for issue status updates
  '/admin/issues/{issueId}/status': createHandler(async event => {
    // Extract issueId from path
    let issueId;

    // First try from path parameters (if our custom routing worked)
    if (event.pathParameters && event.pathParameters.issueId) {
      issueId = event.pathParameters.issueId;
    }
    // Otherwise extract it from the path
    else {
      const pathParts = event.path.split('/');
      const issueIdIndex = pathParts.findIndex(part => part === 'issues') + 1;
      if (issueIdIndex > 0 && issueIdIndex < pathParts.length) {
        issueId = pathParts[issueIdIndex];
      }
    }

    if (!issueId) {
      return createApiResponse(400, 'Missing issueId in path');
    }

    const { status, resolution } = helpers.parseBody(event);
    helpers.validateRequired({ status }, ['status']);

    console.log(`Processing PUT request for issue ${issueId}, status: ${status}`);

    const result = await updateIssueStatusHandler(issueId, status, resolution);
    return createApiResponse(200, 'Estado de la incidencia actualizado correctamente', result);
  }),

  // Fallback to handle all PUT requests that include "/admin/issues/" and "/status"
  // This helps with potential encoding or API Gateway path handling differences
  '/admin/issues': createHandler(async event => {
    // Check if this is an issue status update request
    if (event.path.includes('/status')) {
      // Extract issueId from path segments
      const pathParts = event.path.split('/');
      const issueIdIndex = pathParts.findIndex(part => part === 'issues') + 1;

      if (issueIdIndex > 0 && issueIdIndex < pathParts.length) {
        const issueId = pathParts[issueIdIndex];
        const { status, resolution } = helpers.parseBody(event);

        if (!status) {
          return createApiResponse(400, 'Missing status in request body');
        }

        console.log(
          `Fallback handler: Processing PUT request for issue ${issueId}, status: ${status}`
        );

        const result = await updateIssueStatusHandler(issueId, status, resolution);
        return createApiResponse(200, 'Estado de la incidencia actualizado correctamente', result);
      }
    }

    return createApiResponse(404, `Route not found for PUT: ${event.path}`);
  }),
};

const optionsRoutes = {
  // Handle all OPTIONS requests with a CORS-friendly response
  '*': async () => {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key',
        'Access-Control-Max-Age': '86400', // 24 hours cache for preflight requests
      },
      body: '',
    };
  },
};

exports.handler = async event => {
  if (event['CodePipeline.job']) {
    const jobId = event['CodePipeline.job'].id;
    try {
      // Realiza aquí la lógica de despliegue u operación que necesitas

      // ✅ Reporta éxito explícitamente
      await codepipeline.putJobSuccessResult({ jobId }).promise();
    } catch (error) {
      console.error('❌ Error en ejecución Lambda desde CodePipeline:', error);
      await codepipeline
        .putJobFailureResult({
          jobId,
          failureDetails: {
            message: JSON.stringify(error.message),
            type: 'JobFailed',
            externalExecutionId: context.awsRequestId,
          },
        })
        .promise();
    }

    return;
  }

  try {
    console.log('Event received:', {
      method: event.httpMethod || event.requestContext?.http?.method,
      path: event.rawPath || event.path,
      queryParams: event.queryStringParameters,
      pathParams: event.pathParameters,
    });

    const method = event.httpMethod || event.requestContext?.http?.method;
    const path = event.rawPath || event.path;

    if (!method || !path) {
      return createApiResponse(400, 'Invalid request: missing method or path');
    }

    // Handle OPTIONS method for CORS preflight
    if (method === 'OPTIONS') {
      return await optionsRoutes['*']();
    }

    // Get the appropriate routes object based on HTTP method
    const routes =
      method === 'GET'
        ? getRoutes
        : method === 'POST'
          ? postRoutes
          : method === 'PUT'
            ? putRoutes
            : null;

    if (!routes) return createApiResponse(405, `Method not supported: ${method}`);

    // Try exact path match first
    let handler = routes[path];

    // Special case for PUT to /admin/issues/:issueId/status which is often problematic
    if (
      !handler &&
      method === 'PUT' &&
      path.includes('/admin/issues/') &&
      path.includes('/status')
    ) {
      console.log('Detected issue status update request, using special handler');
      handler = putRoutes['/admin/issues/:issueId/status'];
    }

    // If still no handler, try path parameter matching
    if (!handler) {
      console.log(`No direct handler for ${path}, trying path parameter matching`);

      // For each route path that contains a parameter
      for (const routePath in routes) {
        if (routePath.includes(':')) {
          // Convert route template to regex pattern
          let pattern = routePath;
          const paramNames = [];

          // Extract parameter names and build regex
          routePath.split('/').forEach(part => {
            if (part.startsWith(':')) {
              const paramName = part.substring(1);
              paramNames.push(paramName);
              pattern = pattern.replace(part, '([^/]+)');
            }
          });

          // Escape special regex chars in the pattern except the capture groups
          pattern = pattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, char =>
            char === '(' || char === ')' ? char : '\\' + char
          );

          const regex = new RegExp(`^${pattern}$`);
          const match = path.match(regex);

          if (match) {
            // Extract parameters from regex match
            const pathParams = {};
            paramNames.forEach((name, index) => {
              pathParams[name] = match[index + 1];
            });

            console.log(`Matched path ${path} to route ${routePath} with params:`, pathParams);
            event.pathParameters = pathParams;
            handler = routes[routePath];
            break;
          }
        }
      }
    }

    // If still no handler, try prefix matching as a last resort
    if (!handler) {
      for (const routePath in routes) {
        if (
          !routePath.includes(':') &&
          ((routePath.endsWith('/') && path.startsWith(routePath)) ||
            path.startsWith(routePath + '/'))
        ) {
          console.log(`Matched path ${path} to prefix route ${routePath}`);
          handler = routes[routePath];
          break;
        }
      }
    }

    if (!handler) {
      return createApiResponse(404, `Route not found: ${path}`);
    }

    console.log(`Invoking handler for ${method} ${path}`);
    return await handler(event);
  } catch (error) {
    console.error('❌ Unhandled Error:', error);
    return createApiResponse(500, 'Internal server error', { error: error.message });
  }
};
