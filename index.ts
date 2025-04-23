import SystemConfig from './models/SystemConfig';
import palletsController from './controllers/pallets';
import boxesController from './controllers/boxes';
import adminController from './controllers/admin';
import createApiResponse from './utils/response';
import * as AWS from 'aws-sdk';

import registerBox from './handlers/registerBox';
import moveBox from './handlers/moveBox';
import { getIssues } from './controllers/issues/read';
import { updateIssueStatus as updateIssueStatusHandler } from './controllers/issues/update';
import deleteIssue from './controllers/issues/delete';
import { IssueStatus } from './types';
const codepipeline = new AWS.CodePipeline();

// Constants from models
const LOCATIONS = SystemConfig.getLocations();
const ITEM_TYPES = SystemConfig.getItemTypes();
const CONFIG = { LOCATIONS, ITEM_TYPES };

// Placeholder implementations (replace with real ones where available)
async function getBoxesInPallet(event: any) {
  return createApiResponse(501, 'Not implemented yet');
}
async function getBoxByCode(code: string) {
  return createApiResponse(501, 'Not implemented yet');
}
async function postIssue(descripcion: string) {
  return createApiResponse(501, 'Not implemented yet');
}
async function auditAndFixData() {
  return createApiResponse(501, 'Not implemented yet');
}
async function backupData() {
  return createApiResponse(501, 'Not implemented yet');
}
async function generateReportHandler(event: any) {
  return createApiResponse(501, 'Not implemented yet');
}
async function generateExcelReportHandler(event: any) {
  return createApiResponse(501, 'Not implemented yet');
}
async function generateCustomReportHandler(event: any) {
  return createApiResponse(501, 'Not implemented yet');
}
async function deleteBox(code: string) {
  return createApiResponse(501, 'Not implemented yet');
}
async function deletePallet(code: string) {
  return createApiResponse(501, 'Not implemented yet');
}
async function movePallet(code: string, location: string) {
  return createApiResponse(501, 'Not implemented yet');
}
async function closePallet(code: string) {
  return createApiResponse(501, 'Not implemented yet');
}
async function createPallet(code: string) {
  return createApiResponse(501, 'Not implemented yet');
}
async function updateBoxDescription(code: string, description: string) {
  return createApiResponse(501, 'Not implemented yet');
}
async function assignPallet(code: string) {
  return createApiResponse(501, 'Not implemented yet');
}
async function setSystemConfig(key: string, value: any) {
  return createApiResponse(501, 'Not implemented yet');
}
async function getSystemConfig(key: string) {
  return null;
}

// Helper functions
const helpers = {
  parseBody(event: any): any {
    if (!event.body) return {};
    try {
      return typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } catch {
      throw new Error('Invalid request body: unable to parse JSON');
    }
  },
  getQueryParams(event: any): Record<string, string> {
    return event.queryStringParameters || {};
  },
  validateRequired(data: Record<string, any>, required: string[]) {
    const missing = required.filter((k) => !data[k]);
    if (missing.length) {
      throw new Error(`Missing parameters: ${missing.join(', ')}`);
    }
  },
  validateLocation(location: string, allowed: string[]) {
    if (!allowed.includes(location)) {
      throw new Error(`Invalid location: ${location}. Valid options: ${allowed.join(', ')}`);
    }
  },
};

// Create a handler wrapper to standardize error handling
function createHandler(
  handlerFn: (event: any) => Promise<any>
) {
  return async (event: any) => {
    try {
      return await handlerFn(event);
    } catch (err: any) {
      console.error('❌ Error in route handler:', err);
      return createApiResponse(err.statusCode || 500, err.message);
    }
  };
}

// Define GET routes
const getRoutes: Record<string, (event: any) => Promise<any>> = {
  '/getBodegaEggs': createHandler(async () => {
    return await boxesController.read.getBoxesByLocation(LOCATIONS.BODEGA);
  }),
  '/getPackingData': createHandler(async () => {
    return await boxesController.read.getBoxesByLocation(LOCATIONS.PACKING);
  }),
  '/getVentaData': createHandler(async () => {
    return await boxesController.read.getBoxesByLocation(LOCATIONS.VENTA);
  }),
  '/getEggsByDate': createHandler(async (event) => {
    const { date } = helpers.getQueryParams(event);
    helpers.validateRequired({ date }, ['date']);
    return await boxesController.read.getBoxesByDate(date);
  }),
  '/production': createHandler(async () => {
    return await boxesController.read.getAllBoxes();
  }),
  '/getPallets': createHandler(async () => {
    return await palletsController.read.getAllPallets();
  }),
  '/getActivePallets': createHandler(async () => {
    return await palletsController.read.getActivePallets();
  }),
  '/getClosedPallets': createHandler(async (event) => {
    const { ubicacion } = helpers.getQueryParams(event);
    return await palletsController.read.getClosedPallets(ubicacion);
  }),
  '/getEggsByCodigo': createHandler(async (event) => {
    const { codigo } = helpers.getQueryParams(event);
    helpers.validateRequired({ codigo }, ['codigo']);
    return event;
  }),
  '/getUnassignedBoxesInPacking': createHandler(async () => {
    return await boxesController.read.getUnassignedBoxesInPacking();
  }),
  '/admin/dashboard': createHandler(async () => {
    return await adminController.getSystemDashboard();
  }),
  '/admin/issues': createHandler(async (event) => {
    const { status, startDate, endDate } = helpers.getQueryParams(event);
    const result = await getIssues({ status: status as IssueStatus, startDate, endDate });
    return createApiResponse(200, 'Issues fetched successfully', result);
  }),
};

// Define POST routes
const postRoutes: Record<string, (event: any) => Promise<any>> = {
  '/procesar-escaneo': createHandler(async (event) => {
    const data = helpers.parseBody(event);
    let { codigo, ubicacion, tipo, palletCodigo, scannedCodes } = data;
    helpers.validateRequired(data, ['codigo', 'ubicacion']);
    helpers.validateLocation(ubicacion, Object.values(CONFIG.LOCATIONS));
    if (!tipo) {
      tipo = codigo.length === 15 ? CONFIG.ITEM_TYPES.BOX : CONFIG.ITEM_TYPES.PALLET;
    }
    if (tipo === CONFIG.ITEM_TYPES.PALLET) {
      if (ubicacion === CONFIG.LOCATIONS.PACKING) {
        throw { statusCode: 400, message: 'Pallets cannot be moved to PACKING directly.' };
      }
      return await movePallet(codigo, ubicacion);
    } else {
      if (ubicacion === CONFIG.LOCATIONS.PACKING) {
        return palletCodigo
          ? await registerBox(codigo, palletCodigo, palletCodigo, scannedCodes)
          : await registerBox(codigo);
      } else {
        return await moveBox(codigo, ubicacion);
      }
    }
  }),
  '/AssignPallet': createHandler(async (event) => {
    const { codigo } = helpers.parseBody(event);
    helpers.validateRequired({ codigo }, ['codigo']);
    await assignPallet(codigo);
    await setSystemConfig('ACTIVE_PALLET_CODE', codigo);
    return createApiResponse(200, 'Pallet assigned successfully', { palletCode: codigo });
  }),
  '/AssignBoxToPallet': createHandler(async (event) => {
    const { codigo, customInfo } = helpers.parseBody(event);
    helpers.validateRequired({ codigo }, ['codigo']);
    const pallet = await getSystemConfig('ACTIVE_PALLET_CODE');
    if (!pallet) {
      throw { statusCode: 400, message: 'No active pallet found. Please assign one.' };
    }
    return await registerBox(codigo, pallet, customInfo);
  }),
  '/movePallet': createHandler(async (event) => {
    const { codigo, ubicacion } = helpers.parseBody(event);
    helpers.validateRequired({ codigo, ubicacion }, ['codigo', 'ubicacion']);
    helpers.validateLocation(ubicacion, ['TRANSITO', 'BODEGA', 'VENTA']);
    return await movePallet(codigo, ubicacion);
  }),
  '/closePallet': createHandler(async (event) => {
    const { codigo } = helpers.parseBody(event);
    helpers.validateRequired({ codigo }, ['codigo']);
    return await closePallet(codigo);
  }),
  '/createPallet': createHandler(async (event) => {
    const { codigo } = helpers.parseBody(event);
    helpers.validateRequired({ codigo }, ['codigo']);
    return await createPallet(codigo);
  }),
  '/updateBoxDescription': createHandler(async (event) => {
    const { codigo, customInfo } = helpers.parseBody(event);
    helpers.validateRequired({ codigo, customInfo }, ['codigo', 'customInfo']);
    return await updateBoxDescription(codigo, customInfo);
  }),
  '/getBoxesInPallet': createHandler(getBoxesInPallet),
  '/getBoxByCode': createHandler(async (event) => {
    const { codigo } = helpers.parseBody(event);
    helpers.validateRequired({ codigo }, ['codigo']);
    return await getBoxByCode(codigo);
  }),
  '/postIssue': createHandler(async (event) => {
    const { descripcion } = helpers.parseBody(event);
    return await postIssue(descripcion);
  }),
  '/admin/updateIssueStatus': createHandler(async (event) => {
    const { issueId, status, resolution } = helpers.parseBody(event);
    helpers.validateRequired({ issueId, status }, ['issueId', 'status']);
    return await updateIssueStatusHandler(issueId, status, resolution);
  }),
  '/admin/auditAndFix': createHandler(auditAndFixData),
  '/admin/backup': createHandler(backupData),
  '/admin/generateReport': createHandler(generateReportHandler),
  '/admin/generateExcelReport': createHandler(generateExcelReportHandler),
  '/admin/generateCustomReport': createHandler(generateCustomReportHandler),
  '/admin/deleteBox': createHandler(async (event) => {
    const { codigo } = helpers.parseBody(event);
    helpers.validateRequired({ codigo }, ['codigo']);
    return await deleteBox(codigo);
  }),
  '/admin/deletePallet': createHandler(async (event) => {
    const { codigo } = helpers.parseBody(event);
    helpers.validateRequired({ codigo }, ['codigo']);
    return await deletePallet(codigo);
  }),
  '/admin/issues/{issueId}/status': createHandler(async (event) => {
    const { issueId } = event.pathParameters || {};
    const { status, resolution } = helpers.parseBody(event);
    helpers.validateRequired({ issueId, status }, ['issueId', 'status']);
    return await updateIssueStatusHandler(issueId, status, resolution);
  }),
  '/admin/issues/update-status': createHandler(async (event) => {
    const { issueId, status, resolution } = JSON.parse(event.body || '{}');
    if (!issueId || !status) {
      return createApiResponse(400, 'Faltan campos requeridos: issueId y status son obligatorios');
    }
    return await updateIssueStatusHandler(issueId, status, resolution);
  }),
  '/admin/issues/delete': createHandler(async (event) => {
    const { issueId } = JSON.parse(event.body || '{}');
    if (!issueId) {
      return createApiResponse(400, 'Falta el campo requerido: issueId es obligatorio');
    }
    return await deleteIssue(issueId);
  }),
};

// Define PUT routes
const putRoutes: Record<string, (event: any) => Promise<any>> = {
  '/admin/issues/{issueId}/status': createHandler(async (event) => {
    let issueId: string | undefined;
    if (event.pathParameters?.issueId) {
      issueId = event.pathParameters.issueId;
    } else {
      const parts = event.path.split('/');
      const idx = parts.indexOf('issues');
      if (idx >= 0 && idx + 1 < parts.length) {
        issueId = parts[idx + 1];
      }
    }
    if (!issueId) {
      return createApiResponse(400, 'Missing issueId in path');
    }
    const { status, resolution } = helpers.parseBody(event);
    helpers.validateRequired({ status }, ['status']);
    return await updateIssueStatusHandler(issueId, status, resolution);
  }),
  '/admin/issues': createHandler(async (event) => {
    if (event.path.includes('/status')) {
      const parts = event.path.split('/');
      const idx = parts.indexOf('issues');
      if (idx >= 0 && idx + 1 < parts.length) {
        const issueId = parts[idx + 1];
        const { status, resolution } = helpers.parseBody(event);
        helpers.validateRequired({ status }, ['status']);
        return await updateIssueStatusHandler(issueId, status, resolution);
      }
    }
    return createApiResponse(404, `Route not found for PUT: ${event.path}`);
  }),
};

// CORS preflight handler
const optionsRoutes = {
  '*': async () => ({
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key',
      'Access-Control-Max-Age': '86400',
    },
    body: '',
  }),
};

export const handler = async (event: any, context: any): Promise<any> => {
  // CodePipeline integration
  if (event['CodePipeline.job']) {
    const jobId = event['CodePipeline.job'].id;
    try {
      await codepipeline.putJobSuccessResult({ jobId }).promise();
    } catch (err) {
      console.error('❌ Error en CodePipeline:', err);
      await codepipeline.putJobFailureResult({
        jobId,
        failureDetails: {
          message: JSON.stringify((err as Error).message),
          type: 'JobFailed',
          externalExecutionId: context.awsRequestId,
        },
      }).promise();
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
    if (method === 'OPTIONS') {
      return await optionsRoutes['*']();
    }

    const routes = method === 'GET'
      ? getRoutes
      : method === 'POST'
      ? postRoutes
      : method === 'PUT'
      ? putRoutes
      : null;
    if (!routes) {
      return createApiResponse(405, `Method not supported: ${method}`);
    }

    let routeHandler = routes[path];
    // fallback matching for parameterized paths...
    if (!routeHandler && method === 'PUT' && path.includes('/admin/issues/') && path.includes('/status')) {
      routeHandler = putRoutes['/admin/issues/{issueId}/status'];
    }
    if (!routeHandler) {
      // try matching `{param}` patterns...
      for (const routePath of Object.keys(routes)) {
        if (routePath.includes('{')) {
          let pattern = routePath.replace(/\{[^}]+\}/g, '([^/]+)');
          const regex = new RegExp(`^${pattern}$`);
          const match = path.match(regex);
          if (match) {
            const names = Array.from(routePath.matchAll(/\{([^}]+)\}/g)).map(m => m[1]);
            event.pathParameters = {};
            names.forEach((n, i) => {
              event.pathParameters[n] = match[i + 1];
            });
            routeHandler = routes[routePath];
            break;
          }
        }
      }
    }
    if (!routeHandler) {
      // prefix fallback
      for (const routePath of Object.keys(routes)) {
        if (!routePath.includes('{') && (path === routePath || path.startsWith(routePath + '/'))) {
          routeHandler = routes[routePath];
          break;
        }
      }
    }
    if (!routeHandler) {
      return createApiResponse(404, `Route not found: ${path}`);
    }

    return await routeHandler(event);
  } catch (err) {
    console.error('❌ Unhandled error:', err);
    return createApiResponse(500, 'Internal server error', { error: (err as Error).message });
  }
};
