// Models
import SystemConfig from './models/SystemConfig';

// Controllers
import palletsController from './controllers/pallets';
import boxesController from './controllers/boxes';
import adminController from './controllers/admin';

// Utils
import createApiResponse from './utils/response';
import AWS from 'aws-sdk';
import { LambdaEvent, ApiResponse } from './types';

const codepipeline = new AWS.CodePipeline();

// Constants from models
const LOCATIONS = SystemConfig.getLocations();
const ITEM_TYPES = SystemConfig.getItemTypes();

// Import the handlers with the new names
import registerBox from './handlers/registerBox';
import moveBox from './handlers/moveBox';
import { getIssues } from './controllers/issues/read';
import { updateIssueStatus } from './controllers/issues/update';
import deleteIssue from './controllers/issues/delete';

// Missing function imports or declarations
// These would need proper implementations or imports
const getBoxesInPallet = async (event: any) => {
  // Implementation needed
  return createApiResponse(501, "Not implemented yet");
};

const getBoxByCode = async (code: string) => {
  // Implementation needed
  return createApiResponse(501, "Not implemented yet");
};

const postIssue = async (descripcion: string) => {
  // Implementation needed
  return createApiResponse(501, "Not implemented yet");
};

const updateIssueStatusHandler = async (issueId: string, status: string, resolution?: string) => {
  // Implementation needed
  return createApiResponse(501, "Not implemented yet");
};

const auditAndFixData = async () => {
  // Implementation needed
  return createApiResponse(501, "Not implemented yet");
};

const backupData = async () => {
  // Implementation needed
  return createApiResponse(501, "Not implemented yet");
};

const generateReportHandler = async (event: any) => {
  // Implementation needed
  return createApiResponse(501, "Not implemented yet");
};

const generateExcelReportHandler = async (event: any) => {
  // Implementation needed
  return createApiResponse(501, "Not implemented yet");
};

const generateCustomReportHandler = async (event: any) => {
  // Implementation needed
  return createApiResponse(501, "Not implemented yet");
};

const deleteBox = async (code: string) => {
  // Implementation needed
  return createApiResponse(501, "Not implemented yet");
};

const deletePallet = async (code: string) => {
  // Implementation needed
  return createApiResponse(501, "Not implemented yet");
};

const movePallet = async (code: string, location: string) => {
  // Implementation needed
  return createApiResponse(501, "Not implemented yet");
};

const closePallet = async (code: string) => {
  // Implementation needed
  return createApiResponse(501, "Not implemented yet");
};

const createPallet = async (code: string) => {
  // Implementation needed
  return createApiResponse(501, "Not implemented yet");
};

const updateBoxDescription = async (code: string, description: string) => {
  // Implementation needed
  return createApiResponse(501, "Not implemented yet");
};

const assignPallet = async (code: string) => {
  // Implementation needed
  return createApiResponse(501, "Not implemented yet");
};

const setSystemConfig = async (key: string, value: string) => {
  // Implementation needed
  return createApiResponse(501, "Not implemented yet");
};

const getSystemConfig = async (key: string) => {
  // Implementation needed
  return null;
};

// Replace CONFIG with proper SystemConfig reference
const CONFIG = {
  LOCATIONS,
  ITEM_TYPES
};

// Helper functions
const helpers = {
  parseBody: (event: LambdaEvent): Record<string, any> => {
    if (!event.body) return {};
    try {
      return typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } catch {
      throw new Error("Invalid request body: unable to parse JSON");
    }
  },
  getQueryParams: (event: LambdaEvent): Record<string, string> => event.queryStringParameters || {},
  validateRequired: (data: Record<string, any>, requiredParams: string[]): void => {
    const missing = requiredParams.filter((param) => !data[param]);
    if (missing.length > 0) {
      throw new Error(`Missing parameters: ${missing.join(", ")}`);
    }
  },
  validateLocation: (location: string, allowed: string[]): void => {
    if (!allowed.includes(location)) {
      throw new Error(`Invalid location: ${location}. Valid options: ${allowed.join(", ")}`);
    }
  },
};

// Create a handler wrapper to standardize error handling
const createHandler = (handlerFn: (event: LambdaEvent, options?: any) => Promise<any>, options = {}) => {
  return async (event: LambdaEvent): Promise<ApiResponse> => {
    try {
      return await handlerFn(event, options);
    } catch (error) {
      console.error("❌ Error in route handler:", error);
      return createApiResponse((error as any).statusCode || 500, (error as Error).message);
    }
  };
};

// Define GET routes
const getRoutes: Record<string, (event: LambdaEvent) => Promise<ApiResponse>> = {
  "/getBodegaEggs": createHandler(async () => {
    return await boxesController.read.getBoxesByLocation(LOCATIONS.BODEGA);
  }),
  
  "/getPackingData": createHandler(async () => {
    return await boxesController.read.getBoxesByLocation(LOCATIONS.PACKING);
  }),
  
  "/getVentaData": createHandler(async () => {
    return await boxesController.read.getBoxesByLocation(LOCATIONS.VENTA);
  }),
  
  "/getEggsByDate": createHandler(async (event) => {
    const { date } = helpers.getQueryParams(event);
    helpers.validateRequired({ date }, ['date']);
    return await boxesController.read.getBoxesByDate(date);
  }),
  
  "/production": createHandler(async () => {
    return await boxesController.read.getAllBoxes();
  }),
  
  "/getPallets": createHandler(async () => {
    return await palletsController.read.getAllPallets();
  }),
  
  "/getActivePallets": createHandler(async () => {
    return await palletsController.read.getActivePallets();
  }),
  
  "/getClosedPallets": createHandler(async (event) => {
    const { ubicacion } = helpers.getQueryParams(event);
    return await palletsController.read.getClosedPallets(ubicacion);
  }),
  
  "/getEggsByCodigo": createHandler(async (event) => {
    const { codigo } = helpers.getQueryParams(event);
    helpers.validateRequired({ codigo }, ['codigo']);
    return event;
  }),
  
  "/getUnassignedBoxesInPacking": createHandler(async () => {
    return await boxesController.read.getUnassignedBoxesInPacking();
  }),
  
  "/admin/dashboard": createHandler(async () => {
    return await adminController.getSystemDashboard();
  }),
  
  "/admin/issues": createHandler(async (event) => {
    const { status, startDate, endDate } = helpers.getQueryParams(event);
    const result = await getIssues({ status: status as any, startDate, endDate });
    return createApiResponse(200, "Issues fetched successfully", result);
  }),
};

const postRoutes: Record<string, (event: LambdaEvent) => Promise<ApiResponse>> = {
  "/procesar-escaneo": createHandler(async (event) => {
    const data = helpers.parseBody(event);
    let { codigo, ubicacion, tipo, palletCodigo, scannedCodes } = data;

    console.log("Datos recibidos:", JSON.stringify(data, null, 2));

    helpers.validateRequired(data, ['codigo', 'ubicacion']);
    helpers.validateLocation(ubicacion, Object.values(CONFIG.LOCATIONS));
    
    // Determinar el tipo basado en la longitud del código si no se proporciona
    if (!tipo) {
      tipo = codigo.length === 15 ? CONFIG.ITEM_TYPES.BOX : CONFIG.ITEM_TYPES.PALLET;
      console.log(`Tipo determinado automáticamente: ${tipo}`);
    }

    if (tipo === CONFIG.ITEM_TYPES.PALLET) {
      if (ubicacion === CONFIG.LOCATIONS.PACKING) {
        throw { statusCode: 400, message: "Pallets cannot be moved to PACKING directly." };
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

  "/AssignPallet": createHandler(async (event) => {
    const { codigo } = helpers.parseBody(event);
    helpers.validateRequired({ codigo }, ['codigo']);
    await assignPallet(codigo);
    await setSystemConfig("ACTIVE_PALLET_CODE", codigo);
    return createApiResponse(200, "Pallet assigned successfully", { palletCode: codigo });
  }),

  "/AssignBoxToPallet": createHandler(async (event) => {
    const { codigo, customInfo } = helpers.parseBody(event);
    helpers.validateRequired({ codigo }, ['codigo']);
    const pallet = await getSystemConfig("ACTIVE_PALLET_CODE");
    if (!pallet) throw { statusCode: 400, message: "No active pallet found. Please assign one." };
    return await registerBox(codigo, pallet, customInfo);
  }),

  "/movePallet": createHandler(async (event) => {
    const { codigo, ubicacion } = helpers.parseBody(event);
    helpers.validateRequired({ codigo, ubicacion }, ['codigo', 'ubicacion']);
    helpers.validateLocation(ubicacion, ["TRANSITO", "BODEGA", "VENTA"]);
    return await movePallet(codigo, ubicacion);
  }),

  "/closePallet": createHandler(async (event) => {
    const { codigo } = helpers.parseBody(event);
    helpers.validateRequired({ codigo }, ['codigo']);
    const result = await closePallet(codigo);
    return createApiResponse(200, "Pallet closed successfully", result);
  }),

  "/createPallet": createHandler(async (event) => {
    const { codigo } = helpers.parseBody(event);
    helpers.validateRequired({ codigo }, ['codigo']);
    const result = await createPallet(codigo);
    return createApiResponse(200, "Pallet created successfully", result);
  }),

  "/updateBoxDescription": createHandler(async (event) => {
    const { codigo, customInfo } = helpers.parseBody(event);
    helpers.validateRequired({ codigo, customInfo }, ['codigo', 'customInfo']);
    const result = await updateBoxDescription(codigo, customInfo);
    return createApiResponse(200, "Box description updated successfully", result);
  }),

  "/getBoxesInPallet": createHandler(async (event) => {
    return await getBoxesInPallet(event);
  }),

  "/getBoxByCode": createHandler(async (event) => {
    const { codigo } = helpers.parseBody(event);
    helpers.validateRequired({ codigo }, ['codigo']);
    const result = await getBoxByCode(codigo);
    return createApiResponse(200, "Box data fetched successfully", result);
  }),
  
  "/postIssue": createHandler(async (event) => {
    const { descripcion } = helpers.parseBody(event);
    return await postIssue(descripcion);
  }),
  
  "/admin/updateIssueStatus": createHandler(async (event) => {
    const { issueId, status, resolution } = helpers.parseBody(event);
    helpers.validateRequired({ issueId, status }, ['issueId', 'status']);
    const result = await updateIssueStatusHandler(issueId, status, resolution);
    return createApiResponse(200, "Issue status updated successfully", result);
  }),
  
  "/admin/auditAndFix": createHandler(async () => {
    const result = await auditAndFixData();
    return createApiResponse(200, "Audit and fix completed successfully", result);
  }),
  
  "/admin/backup": createHandler(async () => {
    const result = await backupData();
    return createApiResponse(200, "Backup completed successfully", result);
  }),
  
  "/admin/generateReport": createHandler(async (event) => {
    return await generateReportHandler(event);
  }),
  
  "/admin/generateExcelReport": createHandler(async (event) => {
    return await generateExcelReportHandler(event);
  }),
  
  "/admin/generateCustomReport": createHandler(async (event) => {
    return await generateCustomReportHandler(event);
  }),
  
  "/admin/deleteBox": createHandler(async (event) => {
    const { codigo } = helpers.parseBody(event);
    helpers.validateRequired({ codigo }, ['codigo']);
    const result = await deleteBox(codigo);
    return createApiResponse((result as any).success ? 200 : 400, (result as any).message);
  }),
  
  "/admin/deletePallet": createHandler(async (event) => {
    const { codigo } = helpers.parseBody(event);
    helpers.validateRequired({ codigo }, ['codigo']);
    const result = await deletePallet(codigo);
    return createApiResponse((result as any).success ? 200 : 400, (result as any).message);
  }),

  "/admin/issues/{issueId}/status": createHandler(async (event) => {
    const { issueId } = event.pathParameters || {};
    const { status, resolution } = helpers.parseBody(event);
    helpers.validateRequired({ issueId, status }, ['issueId', 'status']);
    
    const result = await updateIssueStatusHandler(issueId as string, status, resolution);
    return createApiResponse(200, "Estado de la incidencia actualizado correctamente", result);
  }),

  // New endpoint for updating issue status
  "/admin/issues/update-status": createHandler(async (event) => {
    const { issueId, status, resolution } = JSON.parse(event.body || "{}");
    
    if (!issueId || !status) {
      return createApiResponse(400, "Faltan campos requeridos: issueId y status son obligatorios");
    }
    
    const result = await updateIssueStatusHandler(issueId, status, resolution);
    return createApiResponse(200, "Estado de la incidencia actualizado correctamente", result);
  }),
  
  // New endpoint for deleting issues
  "/admin/issues/delete": createHandler(async (event) => {
    const { issueId } = JSON.parse(event.body || "{}");
    
    if (!issueId) {
      return createApiResponse(400, "Falta el campo requerido: issueId es obligatorio");
    }
    
    const result = await deleteIssue(issueId);
    return createApiResponse(200, "Incidencia eliminada correctamente", result);
  }),
};

const putRoutes: Record<string, (event: LambdaEvent) => Promise<ApiResponse>> = {
  // Dynamic route matching for issue status updates
  "/admin/issues/{issueId}/status": createHandler(async (event) => {
    // Extract issueId from path
    let issueId: string | undefined;
    
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
      return createApiResponse(400, "Missing issueId in path");
    }
    
    const { status, resolution } = helpers.parseBody(event);
    helpers.validateRequired({ status }, ['status']);
    
    console.log(`Processing PUT request for issue ${issueId}, status: ${status}`);
    
    const result = await updateIssueStatusHandler(issueId, status, resolution);
    return createApiResponse(200, "Estado de la incidencia actualizado correctamente", result);
  }),
  
  // Fallback to handle all PUT requests that include "/admin/issues/" and "/status"
  // This helps with potential encoding or API Gateway path handling differences
  "/admin/issues": createHandler(async (event) => {
    // Check if this is an issue status update request
    if (event.path.includes('/status')) {
      // Extract issueId from path segments
      const pathParts = event.path.split('/');
      const issueIdIndex = pathParts.findIndex(part => part === 'issues') + 1;
      
      if (issueIdIndex > 0 && issueIdIndex < pathParts.length) {
        const issueId = pathParts[issueIdIndex];
        const { status, resolution } = helpers.parseBody(event);
        
        if (!status) {
          return createApiResponse(400, "Missing status in request body");
        }
        
        console.log(`Fallback handler: Processing PUT request for issue ${issueId}, status: ${status}`);
        
        const result = await updateIssueStatusHandler(issueId, status, resolution);
        return createApiResponse(200, "Estado de la incidencia actualizado correctamente", result);
      }
    }
    
    return createApiResponse(404, `Route not found for PUT: ${event.path}`);
  }),
};

const optionsRoutes: Record<string, () => Promise<any>> = {
  // Handle all OPTIONS requests with a CORS-friendly response
  "*": async () => {
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
  }
};

export const handler = async (event: any): Promise<any> => {
  // CodePipeline integration
  if (event['CodePipeline.job']) {
    const jobId = event['CodePipeline.job'].id;
    try {
      // Realiza aquí la lógica de despliegue u operación que necesitas

      // ✅ Reporta éxito explícitamente
      await codepipeline.putJobSuccessResult({ jobId }).promise();
    } catch (error) {
      console.error("❌ Error en ejecución Lambda desde CodePipeline:", error);
      await codepipeline.putJobFailureResult({
        jobId,
        failureDetails: {
          message: JSON.stringify((error as Error).message),
          type: 'JobFailed',
          externalExecutionId: (global as any).context?.awsRequestId || 'unknown',
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
      return createApiResponse(400, "Invalid request: missing method or path");
    }

    // Handle OPTIONS method for CORS preflight
    if (method === "OPTIONS") {
      return await optionsRoutes["*"]();
    }

    // Get the appropriate routes object based on HTTP method
    const routes = 
      method === "GET" ? getRoutes : 
      method === "POST" ? postRoutes : 
      method === "PUT" ? putRoutes : null;
      
    if (!routes) return createApiResponse(405, `Method not supported: ${method}`);

    // Try exact path match first
    let handler = routes[path];
    
    // Special case for PUT to /admin/issues/:issueId/status which is often problematic
    if (!handler && method === "PUT" && path.includes('/admin/issues/') && path.includes('/status')) {
      console.log('Detected issue status update request, using special handler');
      handler = putRoutes["/admin/issues/{issueId}/status"];
    }
    
    // If still no handler, try path parameter matching
    if (!handler) {
      console.log(`No direct handler for ${path}, trying path parameter matching`);
      
      // For each route path that contains a parameter
      for (const routePath in routes) {
        if (routePath.includes('{') && routePath.includes('}')) {
          // Convert route template to regex pattern
          let pattern = routePath;
          const paramNames: string[] = [];
          
          // Extract parameter names and build regex
          routePath.split('/').forEach(part => {
            if (part.startsWith('{') && part.endsWith('}')) {
              const paramName = part.substring(1, part.length - 1);
              paramNames.push(paramName);
              pattern = pattern.replace(part, '([^/]+)');
            }
          });
          
          // Escape special regex chars in the pattern except the capture groups
          pattern = pattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, char => 
            (char === '(' || char === ')') ? char : '\\' + char
          );
          
          const regex = new RegExp(`^${pattern}$`);
          const match = path.match(regex);
          
          if (match) {
            // Extract parameters from regex match
            const pathParams: Record<string, string> = {};
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
        if (!routePath.includes('{') && 
            ((routePath.endsWith('/') && path.startsWith(routePath)) || 
             path.startsWith(routePath + '/'))) {
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
    console.error("❌ Unhandled Error:", error);
    return createApiResponse(500, "Internal server error", { error: (error as Error).message });
  }
}; 