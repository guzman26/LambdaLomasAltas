"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
// Models
const SystemConfig_1 = __importDefault(require("./models/SystemConfig"));
// Controllers
const pallets_1 = __importDefault(require("./controllers/pallets"));
const boxes_1 = __importDefault(require("./controllers/boxes"));
const admin_1 = __importDefault(require("./controllers/admin"));
// Utils
const response_1 = __importDefault(require("./utils/response"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const codepipeline = new aws_sdk_1.default.CodePipeline();
// Constants from models
const LOCATIONS = SystemConfig_1.default.getLocations();
const ITEM_TYPES = SystemConfig_1.default.getItemTypes();
// Import the handlers with the new names
const registerBox_1 = __importDefault(require("./handlers/registerBox"));
const moveBox_1 = __importDefault(require("./handlers/moveBox"));
const read_1 = require("./controllers/issues/read");
const delete_1 = __importDefault(require("./controllers/issues/delete"));
// Missing function imports or declarations
// These would need proper implementations or imports
const getBoxesInPallet = async (event) => {
    // Implementation needed
    return (0, response_1.default)(501, "Not implemented yet");
};
const getBoxByCode = async (code) => {
    // Implementation needed
    return (0, response_1.default)(501, "Not implemented yet");
};
const postIssue = async (descripcion) => {
    // Implementation needed
    return (0, response_1.default)(501, "Not implemented yet");
};
const updateIssueStatusHandler = async (issueId, status, resolution) => {
    // Implementation needed
    return (0, response_1.default)(501, "Not implemented yet");
};
const auditAndFixData = async () => {
    // Implementation needed
    return (0, response_1.default)(501, "Not implemented yet");
};
const backupData = async () => {
    // Implementation needed
    return (0, response_1.default)(501, "Not implemented yet");
};
const generateReportHandler = async (event) => {
    // Implementation needed
    return (0, response_1.default)(501, "Not implemented yet");
};
const generateExcelReportHandler = async (event) => {
    // Implementation needed
    return (0, response_1.default)(501, "Not implemented yet");
};
const generateCustomReportHandler = async (event) => {
    // Implementation needed
    return (0, response_1.default)(501, "Not implemented yet");
};
const deleteBox = async (code) => {
    // Implementation needed
    return (0, response_1.default)(501, "Not implemented yet");
};
const deletePallet = async (code) => {
    // Implementation needed
    return (0, response_1.default)(501, "Not implemented yet");
};
const movePallet = async (code, location) => {
    // Implementation needed
    return (0, response_1.default)(501, "Not implemented yet");
};
const closePallet = async (code) => {
    // Implementation needed
    return (0, response_1.default)(501, "Not implemented yet");
};
const createPallet = async (code) => {
    // Implementation needed
    return (0, response_1.default)(501, "Not implemented yet");
};
const updateBoxDescription = async (code, description) => {
    // Implementation needed
    return (0, response_1.default)(501, "Not implemented yet");
};
const assignPallet = async (code) => {
    // Implementation needed
    return (0, response_1.default)(501, "Not implemented yet");
};
const setSystemConfig = async (key, value) => {
    // Implementation needed
    return (0, response_1.default)(501, "Not implemented yet");
};
const getSystemConfig = async (key) => {
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
    parseBody: (event) => {
        if (!event.body)
            return {};
        try {
            return typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        }
        catch (_a) {
            throw new Error("Invalid request body: unable to parse JSON");
        }
    },
    getQueryParams: (event) => event.queryStringParameters || {},
    validateRequired: (data, requiredParams) => {
        const missing = requiredParams.filter((param) => !data[param]);
        if (missing.length > 0) {
            throw new Error(`Missing parameters: ${missing.join(", ")}`);
        }
    },
    validateLocation: (location, allowed) => {
        if (!allowed.includes(location)) {
            throw new Error(`Invalid location: ${location}. Valid options: ${allowed.join(", ")}`);
        }
    },
};
// Create a handler wrapper to standardize error handling
const createHandler = (handlerFn, options = {}) => {
    return async (event) => {
        try {
            return await handlerFn(event, options);
        }
        catch (error) {
            console.error("❌ Error in route handler:", error);
            return (0, response_1.default)(error.statusCode || 500, error.message);
        }
    };
};
// Define GET routes
const getRoutes = {
    "/getBodegaEggs": createHandler(async () => {
        return await boxes_1.default.read.getBoxesByLocation(LOCATIONS.BODEGA);
    }),
    "/getPackingData": createHandler(async () => {
        return await boxes_1.default.read.getBoxesByLocation(LOCATIONS.PACKING);
    }),
    "/getVentaData": createHandler(async () => {
        return await boxes_1.default.read.getBoxesByLocation(LOCATIONS.VENTA);
    }),
    "/getEggsByDate": createHandler(async (event) => {
        const { date } = helpers.getQueryParams(event);
        helpers.validateRequired({ date }, ['date']);
        return await boxes_1.default.read.getBoxesByDate(date);
    }),
    "/production": createHandler(async () => {
        return await boxes_1.default.read.getAllBoxes();
    }),
    "/getPallets": createHandler(async () => {
        return await pallets_1.default.read.getAllPallets();
    }),
    "/getActivePallets": createHandler(async () => {
        return await pallets_1.default.read.getActivePallets();
    }),
    "/getClosedPallets": createHandler(async (event) => {
        const { ubicacion } = helpers.getQueryParams(event);
        return await pallets_1.default.read.getClosedPallets(ubicacion);
    }),
    "/getEggsByCodigo": createHandler(async (event) => {
        const { codigo } = helpers.getQueryParams(event);
        helpers.validateRequired({ codigo }, ['codigo']);
        return event;
    }),
    "/getUnassignedBoxesInPacking": createHandler(async () => {
        return await boxes_1.default.read.getUnassignedBoxesInPacking();
    }),
    "/admin/dashboard": createHandler(async () => {
        return await admin_1.default.getSystemDashboard();
    }),
    "/admin/issues": createHandler(async (event) => {
        const { status, startDate, endDate } = helpers.getQueryParams(event);
        const result = await (0, read_1.getIssues)({ status: status, startDate, endDate });
        return (0, response_1.default)(200, "Issues fetched successfully", result);
    }),
};
const postRoutes = {
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
        }
        else {
            if (ubicacion === CONFIG.LOCATIONS.PACKING) {
                return palletCodigo
                    ? await (0, registerBox_1.default)(codigo, palletCodigo, palletCodigo, scannedCodes)
                    : await (0, registerBox_1.default)(codigo);
            }
            else {
                return await (0, moveBox_1.default)(codigo, ubicacion);
            }
        }
    }),
    "/AssignPallet": createHandler(async (event) => {
        const { codigo } = helpers.parseBody(event);
        helpers.validateRequired({ codigo }, ['codigo']);
        await assignPallet(codigo);
        await setSystemConfig("ACTIVE_PALLET_CODE", codigo);
        return (0, response_1.default)(200, "Pallet assigned successfully", { palletCode: codigo });
    }),
    "/AssignBoxToPallet": createHandler(async (event) => {
        const { codigo, customInfo } = helpers.parseBody(event);
        helpers.validateRequired({ codigo }, ['codigo']);
        const pallet = await getSystemConfig("ACTIVE_PALLET_CODE");
        if (!pallet)
            throw { statusCode: 400, message: "No active pallet found. Please assign one." };
        return await (0, registerBox_1.default)(codigo, pallet, customInfo);
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
        return (0, response_1.default)(200, "Pallet closed successfully", result);
    }),
    "/createPallet": createHandler(async (event) => {
        const { codigo } = helpers.parseBody(event);
        helpers.validateRequired({ codigo }, ['codigo']);
        const result = await createPallet(codigo);
        return (0, response_1.default)(200, "Pallet created successfully", result);
    }),
    "/updateBoxDescription": createHandler(async (event) => {
        const { codigo, customInfo } = helpers.parseBody(event);
        helpers.validateRequired({ codigo, customInfo }, ['codigo', 'customInfo']);
        const result = await updateBoxDescription(codigo, customInfo);
        return (0, response_1.default)(200, "Box description updated successfully", result);
    }),
    "/getBoxesInPallet": createHandler(async (event) => {
        return await getBoxesInPallet(event);
    }),
    "/getBoxByCode": createHandler(async (event) => {
        const { codigo } = helpers.parseBody(event);
        helpers.validateRequired({ codigo }, ['codigo']);
        const result = await getBoxByCode(codigo);
        return (0, response_1.default)(200, "Box data fetched successfully", result);
    }),
    "/postIssue": createHandler(async (event) => {
        const { descripcion } = helpers.parseBody(event);
        return await postIssue(descripcion);
    }),
    "/admin/updateIssueStatus": createHandler(async (event) => {
        const { issueId, status, resolution } = helpers.parseBody(event);
        helpers.validateRequired({ issueId, status }, ['issueId', 'status']);
        const result = await updateIssueStatusHandler(issueId, status, resolution);
        return (0, response_1.default)(200, "Issue status updated successfully", result);
    }),
    "/admin/auditAndFix": createHandler(async () => {
        const result = await auditAndFixData();
        return (0, response_1.default)(200, "Audit and fix completed successfully", result);
    }),
    "/admin/backup": createHandler(async () => {
        const result = await backupData();
        return (0, response_1.default)(200, "Backup completed successfully", result);
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
        return (0, response_1.default)(result.success ? 200 : 400, result.message);
    }),
    "/admin/deletePallet": createHandler(async (event) => {
        const { codigo } = helpers.parseBody(event);
        helpers.validateRequired({ codigo }, ['codigo']);
        const result = await deletePallet(codigo);
        return (0, response_1.default)(result.success ? 200 : 400, result.message);
    }),
    "/admin/issues/{issueId}/status": createHandler(async (event) => {
        const { issueId } = event.pathParameters || {};
        const { status, resolution } = helpers.parseBody(event);
        helpers.validateRequired({ issueId, status }, ['issueId', 'status']);
        const result = await updateIssueStatusHandler(issueId, status, resolution);
        return (0, response_1.default)(200, "Estado de la incidencia actualizado correctamente", result);
    }),
    // New endpoint for updating issue status
    "/admin/issues/update-status": createHandler(async (event) => {
        const { issueId, status, resolution } = JSON.parse(event.body || "{}");
        if (!issueId || !status) {
            return (0, response_1.default)(400, "Faltan campos requeridos: issueId y status son obligatorios");
        }
        const result = await updateIssueStatusHandler(issueId, status, resolution);
        return (0, response_1.default)(200, "Estado de la incidencia actualizado correctamente", result);
    }),
    // New endpoint for deleting issues
    "/admin/issues/delete": createHandler(async (event) => {
        const { issueId } = JSON.parse(event.body || "{}");
        if (!issueId) {
            return (0, response_1.default)(400, "Falta el campo requerido: issueId es obligatorio");
        }
        const result = await (0, delete_1.default)(issueId);
        return (0, response_1.default)(200, "Incidencia eliminada correctamente", result);
    }),
};
const putRoutes = {
    // Dynamic route matching for issue status updates
    "/admin/issues/{issueId}/status": createHandler(async (event) => {
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
            return (0, response_1.default)(400, "Missing issueId in path");
        }
        const { status, resolution } = helpers.parseBody(event);
        helpers.validateRequired({ status }, ['status']);
        console.log(`Processing PUT request for issue ${issueId}, status: ${status}`);
        const result = await updateIssueStatusHandler(issueId, status, resolution);
        return (0, response_1.default)(200, "Estado de la incidencia actualizado correctamente", result);
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
                    return (0, response_1.default)(400, "Missing status in request body");
                }
                console.log(`Fallback handler: Processing PUT request for issue ${issueId}, status: ${status}`);
                const result = await updateIssueStatusHandler(issueId, status, resolution);
                return (0, response_1.default)(200, "Estado de la incidencia actualizado correctamente", result);
            }
        }
        return (0, response_1.default)(404, `Route not found for PUT: ${event.path}`);
    }),
};
const optionsRoutes = {
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
const handler = async (event) => {
    var _a, _b, _c, _d, _e;
    // CodePipeline integration
    if (event['CodePipeline.job']) {
        const jobId = event['CodePipeline.job'].id;
        try {
            // Realiza aquí la lógica de despliegue u operación que necesitas
            // ✅ Reporta éxito explícitamente
            await codepipeline.putJobSuccessResult({ jobId }).promise();
        }
        catch (error) {
            console.error("❌ Error en ejecución Lambda desde CodePipeline:", error);
            await codepipeline.putJobFailureResult({
                jobId,
                failureDetails: {
                    message: JSON.stringify(error.message),
                    type: 'JobFailed',
                    externalExecutionId: ((_a = global.context) === null || _a === void 0 ? void 0 : _a.awsRequestId) || 'unknown',
                },
            }).promise();
        }
        return;
    }
    try {
        console.log('Event received:', {
            method: event.httpMethod || ((_c = (_b = event.requestContext) === null || _b === void 0 ? void 0 : _b.http) === null || _c === void 0 ? void 0 : _c.method),
            path: event.rawPath || event.path,
            queryParams: event.queryStringParameters,
            pathParams: event.pathParameters,
        });
        const method = event.httpMethod || ((_e = (_d = event.requestContext) === null || _d === void 0 ? void 0 : _d.http) === null || _e === void 0 ? void 0 : _e.method);
        const path = event.rawPath || event.path;
        if (!method || !path) {
            return (0, response_1.default)(400, "Invalid request: missing method or path");
        }
        // Handle OPTIONS method for CORS preflight
        if (method === "OPTIONS") {
            return await optionsRoutes["*"]();
        }
        // Get the appropriate routes object based on HTTP method
        const routes = method === "GET" ? getRoutes :
            method === "POST" ? postRoutes :
                method === "PUT" ? putRoutes : null;
        if (!routes)
            return (0, response_1.default)(405, `Method not supported: ${method}`);
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
                    const paramNames = [];
                    // Extract parameter names and build regex
                    routePath.split('/').forEach(part => {
                        if (part.startsWith('{') && part.endsWith('}')) {
                            const paramName = part.substring(1, part.length - 1);
                            paramNames.push(paramName);
                            pattern = pattern.replace(part, '([^/]+)');
                        }
                    });
                    // Escape special regex chars in the pattern except the capture groups
                    pattern = pattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, char => (char === '(' || char === ')') ? char : '\\' + char);
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
            return (0, response_1.default)(404, `Route not found: ${path}`);
        }
        console.log(`Invoking handler for ${method} ${path}`);
        return await handler(event);
    }
    catch (error) {
        console.error("❌ Unhandled Error:", error);
        return (0, response_1.default)(500, "Internal server error", { error: error.message });
    }
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxTQUFTO0FBQ1QseUVBQWlEO0FBRWpELGNBQWM7QUFDZCxvRUFBc0Q7QUFDdEQsZ0VBQWtEO0FBQ2xELGdFQUFrRDtBQUVsRCxRQUFRO0FBQ1IsZ0VBQWlEO0FBQ2pELHNEQUEwQjtBQUcxQixNQUFNLFlBQVksR0FBRyxJQUFJLGlCQUFHLENBQUMsWUFBWSxFQUFFLENBQUM7QUFFNUMsd0JBQXdCO0FBQ3hCLE1BQU0sU0FBUyxHQUFHLHNCQUFZLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDOUMsTUFBTSxVQUFVLEdBQUcsc0JBQVksQ0FBQyxZQUFZLEVBQUUsQ0FBQztBQUUvQyx5Q0FBeUM7QUFDekMseUVBQWlEO0FBQ2pELGlFQUF5QztBQUN6QyxvREFBc0Q7QUFFdEQseUVBQXNEO0FBRXRELDJDQUEyQztBQUMzQyxxREFBcUQ7QUFDckQsTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLEVBQUUsS0FBVSxFQUFFLEVBQUU7SUFDNUMsd0JBQXdCO0lBQ3hCLE9BQU8sSUFBQSxrQkFBaUIsRUFBQyxHQUFHLEVBQUUscUJBQXFCLENBQUMsQ0FBQztBQUN2RCxDQUFDLENBQUM7QUFFRixNQUFNLFlBQVksR0FBRyxLQUFLLEVBQUUsSUFBWSxFQUFFLEVBQUU7SUFDMUMsd0JBQXdCO0lBQ3hCLE9BQU8sSUFBQSxrQkFBaUIsRUFBQyxHQUFHLEVBQUUscUJBQXFCLENBQUMsQ0FBQztBQUN2RCxDQUFDLENBQUM7QUFFRixNQUFNLFNBQVMsR0FBRyxLQUFLLEVBQUUsV0FBbUIsRUFBRSxFQUFFO0lBQzlDLHdCQUF3QjtJQUN4QixPQUFPLElBQUEsa0JBQWlCLEVBQUMsR0FBRyxFQUFFLHFCQUFxQixDQUFDLENBQUM7QUFDdkQsQ0FBQyxDQUFDO0FBRUYsTUFBTSx3QkFBd0IsR0FBRyxLQUFLLEVBQUUsT0FBZSxFQUFFLE1BQWMsRUFB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LENBQUM7Z0JBQy9CLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztvQkFDeEIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQzt3QkFDdkQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO29CQUN2QyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixJQUFJLG9CQUFvQixTQUFTLEVBQUUsQ0FBQyxDQUFDO29CQUNqRSxPQUFPLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUM1QixNQUFNO2dCQUNSLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztRQUVELElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNiLE9BQU8sSUFBQSxrQkFBaUIsRUFBQyxHQUFHLEVBQUUsb0JBQW9CLElBQUksRUFBRSxDQUFDLENBQUM7UUFDNUQsQ0FBQztRQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLE1BQU0sSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3RELE9BQU8sTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLG9CQUFvQixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzNDLE9BQU8sSUFBQSxrQkFBaUIsRUFBQyxHQUFHLEVBQUUsdUJBQXVCLEVBQUUsRUFBRSxLQUFLLEVBQUcsS0FBZSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDOUYsQ0FBQztBQUNILENBQUMsQ0FBQztBQWhJVyxRQUFBLE9BQU8sV0FnSWxCIiwic291cmNlc0NvbnRlbnQiOlsiLy8gTW9kZWxzXG5pbXBvcnQgU3lzdGVtQ29uZmlnIGZyb20gJy4vbW9kZWxzL1N5c3RlbUNvbmZpZyc7XG5cbi8vIENvbnRyb2xsZXJzXG5pbXBvcnQgcGFsbGV0c0NvbnRyb2xsZXIgZnJvbSAnLi9jb250cm9sbGVycy9wYWxsZXRzJztcbmltcG9ydCBib3hlc0NvbnRyb2xsZXIgZnJvbSAnLi9jb250cm9sbGVycy9ib3hlcyc7XG5pbXBvcnQgYWRtaW5Db250cm9sbGVyIGZyb20gJy4vY29udHJvbGxlcnMvYWRtaW4nO1xuXG4vLyBVdGlsc1xuaW1wb3J0IGNyZWF0ZUFwaVJlc3BvbnNlIGZyb20gJy4vdXRpbHMvcmVzcG9uc2UnO1xuaW1wb3J0IEFXUyBmcm9tICdhd3Mtc2RrJztcbmltcG9ydCB7IExhbWJkYUV2ZW50LCBBcGlSZXNwb25zZSB9IGZyb20gJy4vdHlwZXMnO1xuXG5jb25zdCBjb2RlcGlwZWxpbmUgPSBuZXcgQVdTLkNvZGVQaXBlbGluZSgpO1xuXG4vLyBDb25zdGFudHMgZnJvbSBtb2RlbHNcbmNvbnN0IExPQ0FUSU9OUyA9IFN5c3RlbUNvbmZpZy5nZXRMb2NhdGlvbnMoKTtcbmNvbnN0IElURU1fVFlQRVMgPSBTeXN0ZW1Db25maWcuZ2V0SXRlbVR5cGVzKCk7XG5cbi8vIEltcG9ydCB0aGUgaGFuZGxlcnMgd2l0aCB0aGUgbmV3IG5hbWVzXG5pbXBvcnQgcmVnaXN0ZXJCb3ggZnJvbSAnLi9oYW5kbGVycy9yZWdpc3RlckJveCc7XG5pbXBvcnQgbW92ZUJveCBmcm9tICcuL2hhbmRsZXJzL21vdmVCb3gnO1xuaW1wb3J0IHsgZ2V0SXNzdWVzIH0gZnJvbSAnLi9jb250cm9sbGVycy9pc3N1ZXMvcmVhZCc7XG5pbXBvcnQgeyB1cGRhdGVJc3N1ZVN0YXR1cyB9IGZyb20gJy4vY29udHJvbGxlcnMvaXNzdWVzL3VwZGF0ZSc7XG5pbXBvcnQgZGVsZXRlSXNzdWUgZnJvbSAnLi9jb250cm9sbGVycy9pc3N1ZXMvZGVsZXRlJztcblxuLy8gTWlzc2luZyBmdW5jdGlvbiBpbXBvcnRzIG9yIGRlY2xhcmF0aW9uc1xuLy8gVGhlc2Ugd291bGQgbmVlZCBwcm9wZXIgaW1wbGVtZW50YXRpb25zIG9yIGltcG9ydHNcbmNvbnN0IGdldEJveGVzSW5QYWxsZXQgPSBhc3luYyAoZXZlbnQ6IGFueSkgPT4ge1xuICAvLyBJbXBsZW1lbnRhdGlvbiBuZWVkZWRcbiAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDUwMSwgXCJOb3QgaW1wbGVtZW50ZWQgeWV0XCIpO1xufTtcblxuY29uc3QgZ2V0Qm94QnlDb2RlID0gYXN5bmMgKGNvZGU6IHN0cmluZykgPT4ge1xuICAvLyBJbXBsZW1lbnRhdGlvbiBuZWVkZWRcbiAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDUwMSwgXCJOb3QgaW1wbGVtZW50ZWQgeWV0XCIpO1xufTtcblxuY29uc3QgcG9zdElzc3VlID0gYXN5bmMgKGRlc2NyaXBjaW9uOiBzdHJpbmcpID0+IHtcbiAgLy8gSW1wbGVtZW50YXRpb24gbmVlZGVkXG4gIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSg1MDEsIFwiTm90IGltcGxlbWVudGVkIHlldFwiKTtcbn07XG5cbmNvbnN0IHVwZGF0ZUlzc3VlU3RhdHVzSGFuZGxlciA9IGFzeW5jIChpc3N1ZUlkOiBzdHJpbmcsIHN0YXR1czogc3RyaW5nLCByZXNvbHV0aW9uPzogc3RyaW5nKSA9PiB7XG4gIC8vIEltcGxlbWVudGF0aW9uIG5lZWRlZFxuICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoNTAxLCBcIk5vdCBpbXBsZW1lbnRlZCB5ZXRcIik7XG59O1xuXG5jb25zdCBhdWRpdEFuZEZpeERhdGEgPSBhc3luYyAoKSA9PiB7XG4gIC8vIEltcGxlbWVudGF0aW9uIG5lZWRlZFxuICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoNTAxLCBcIk5vdCBpbXBsZW1lbnRlZCB5ZXRcIik7XG59O1xuXG5jb25zdCBiYWNrdXBEYXRhID0gYXN5bmMgKCkgPT4ge1xuICAvLyBJbXBsZW1lbnRhdGlvbiBuZWVkZWRcbiAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDUwMSwgXCJOb3QgaW1wbGVtZW50ZWQgeWV0XCIpO1xufTtcblxuY29uc3QgZ2VuZXJhdGVSZXBvcnRIYW5kbGVyID0gYXN5bmMgKGV2ZW50OiBhbnkpID0+IHtcbiAgLy8gSW1wbGVtZW50YXRpb24gbmVlZGVkXG4gIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSg1MDEsIFwiTm90IGltcGxlbWVudGVkIHlldFwiKTtcbn07XG5cbmNvbnN0IGdlbmVyYXRlRXhjZWxSZXBvcnRIYW5kbGVyID0gYXN5bmMgKGV2ZW50OiBhbnkpID0+IHtcbiAgLy8gSW1wbGVtZW50YXRpb24gbmVlZGVkXG4gIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSg1MDEsIFwiTm90IGltcGxlbWVudGVkIHlldFwiKTtcbn07XG5cbmNvbnN0IGdlbmVyYXRlQ3VzdG9tUmVwb3J0SGFuZGxlciA9IGFzeW5jIChldmVudDogYW55KSA9PiB7XG4gIC8vIEltcGxlbWVudGF0aW9uIG5lZWRlZFxuICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoNTAxLCBcIk5vdCBpbXBsZW1lbnRlZCB5ZXRcIik7XG59O1xuXG5jb25zdCBkZWxldGVCb3ggPSBhc3luYyAoY29kZTogc3RyaW5nKSA9PiB7XG4gIC8vIEltcGxlbWVudGF0aW9uIG5lZWRlZFxuICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoNTAxLCBcIk5vdCBpbXBsZW1lbnRlZCB5ZXRcIik7XG59O1xuXG5jb25zdCBkZWxldGVQYWxsZXQgPSBhc3luYyAoY29kZTogc3RyaW5nKSA9PiB7XG4gIC8vIEltcGxlbWVudGF0aW9uIG5lZWRlZFxuICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoNTAxLCBcIk5vdCBpbXBsZW1lbnRlZCB5ZXRcIik7XG59O1xuXG5jb25zdCBtb3ZlUGFsbGV0ID0gYXN5bmMgKGNvZGU6IHN0cmluZywgbG9jYXRpb246IHN0cmluZykgPT4ge1xuICAvLyBJbXBsZW1lbnRhdGlvbiBuZWVkZWRcbiAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDUwMSwgXCJOb3QgaW1wbGVtZW50ZWQgeWV0XCIpO1xufTtcblxuY29uc3QgY2xvc2VQYWxsZXQgPSBhc3luYyAoY29kZTogc3RyaW5nKSA9PiB7XG4gIC8vIEltcGxlbWVudGF0aW9uIG5lZWRlZFxuICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoNTAxLCBcIk5vdCBpbXBsZW1lbnRlZCB5ZXRcIik7XG59O1xuXG5jb25zdCBjcmVhdGVQYWxsZXQgPSBhc3luYyAoY29kZTogc3RyaW5nKSA9PiB7XG4gIC8vIEltcGxlbWVudGF0aW9uIG5lZWRlZFxuICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoNTAxLCBcIk5vdCBpbXBsZW1lbnRlZCB5ZXRcIik7XG59O1xuXG5jb25zdCB1cGRhdGVCb3hEZXNjcmlwdGlvbiA9IGFzeW5jIChjb2RlOiBzdHJpbmcsIGRlc2NyaXB0aW9uOiBzdHJpbmcpID0+IHtcbiAgLy8gSW1wbGVtZW50YXRpb24gbmVlZGVkXG4gIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSg1MDEsIFwiTm90IGltcGxlbWVudGVkIHlldFwiKTtcbn07XG5cbmNvbnN0IGFzc2lnblBhbGxldCA9IGFzeW5jIChjb2RlOiBzdHJpbmcpID0+IHtcbiAgLy8gSW1wbGVtZW50YXRpb24gbmVlZGVkXG4gIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSg1MDEsIFwiTm90IGltcGxlbWVudGVkIHlldFwiKTtcbn07XG5cbmNvbnN0IHNldFN5c3RlbUNvbmZpZyA9IGFzeW5jIChrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZykgPT4ge1xuICAvLyBJbXBsZW1lbnRhdGlvbiBuZWVkZWRcbiAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDUwMSwgXCJOb3QgaW1wbGVtZW50ZWQgeWV0XCIpO1xufTtcblxuY29uc3QgZ2V0U3lzdGVtQ29uZmlnID0gYXN5bmMgKGtleTogc3RyaW5nKSA9PiB7XG4gIC8vIEltcGxlbWVudGF0aW9uIG5lZWRlZFxuICByZXR1cm4gbnVsbDtcbn07XG5cbi8vIFJlcGxhY2UgQ09ORklHIHdpdGggcHJvcGVyIFN5c3RlbUNvbmZpZyByZWZlcmVuY2VcbmNvbnN0IENPTkZJRyA9IHtcbiAgTE9DQVRJT05TLFxuICBJVEVNX1RZUEVTXG59O1xuXG4vLyBIZWxwZXIgZnVuY3Rpb25zXG5jb25zdCBoZWxwZXJzID0ge1xuICBwYXJzZUJvZHk6IChldmVudDogTGFtYmRhRXZlbnQpOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0+IHtcbiAgICBpZiAoIWV2ZW50LmJvZHkpIHJldHVybiB7fTtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBldmVudC5ib2R5ID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2UoZXZlbnQuYm9keSkgOiBldmVudC5ib2R5O1xuICAgIH0gY2F0Y2gge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCByZXF1ZXN0IGJvZHk6IHVuYWJsZSB0byBwYXJzZSBKU09OXCIpO1xuICAgIH1cbiAgfSxcbiAgZ2V0UXVlcnlQYXJhbXM6IChldmVudDogTGFtYmRhRXZlbnQpOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0+IGV2ZW50LnF1ZXJ5U3RyaW5nUGFyYW1ldGVycyB8fCB7fSxcbiAgdmFsaWRhdGVSZXF1aXJlZDogKGRhdGE6IFJlY29yZDxzdHJpbmcsIGFueT4sIHJlcXVpcmVkUGFyYW1zOiBzdHJpbmdbXSk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IG1pc3NpbmcgPSByZXF1aXJlZFBhcmFtcy5maWx0ZXIoKHBhcmFtKSA9PiAhZGF0YVtwYXJhbV0pO1xuICAgIGlmIChtaXNzaW5nLmxlbmd0aCA+IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTWlzc2luZyBwYXJhbWV0ZXJzOiAke21pc3Npbmcuam9pbihcIiwgXCIpfWApO1xuICAgIH1cbiAgfSxcbiAgdmFsaWRhdGVMb2NhdGlvbjogKGxvY2F0aW9uOiBzdHJpbmcsIGFsbG93ZWQ6IHN0cmluZ1tdKTogdm9pZCA9PiB7XG4gICAgaWYgKCFhbGxvd2VkLmluY2x1ZGVzKGxvY2F0aW9uKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGxvY2F0aW9uOiAke2xvY2F0aW9ufS4gVmFsaWQgb3B0aW9uczogJHthbGxvd2VkLmpvaW4oXCIsIFwiKX1gKTtcbiAgICB9XG4gIH0sXG59O1xuXG4vLyBDcmVhdGUgYSBoYW5kbGVyIHdyYXBwZXIgdG8gc3RhbmRhcmRpemUgZXJyb3IgaGFuZGxpbmdcbmNvbnN0IGNyZWF0ZUhhbmRsZXIgPSAoaGFuZGxlckZuOiAoZXZlbnQ6IExhbWJkYUV2ZW50LCBvcHRpb25zPzogYW55KSA9PiBQcm9taXNlPGFueT4sIG9wdGlvbnMgPSB7fSkgPT4ge1xuICByZXR1cm4gYXN5bmMgKGV2ZW50OiBMYW1iZGFFdmVudCk6IFByb21pc2U8QXBpUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZXJGbihldmVudCwgb3B0aW9ucyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCLinYwgRXJyb3IgaW4gcm91dGUgaGFuZGxlcjpcIiwgZXJyb3IpO1xuICAgICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKChlcnJvciBhcyBhbnkpLnN0YXR1c0NvZGUgfHwgNTAwLCAoZXJyb3IgYXMgRXJyb3IpLm1lc3NhZ2UpO1xuICAgIH1cbiAgfTtcbn07XG5cbi8vIERlZmluZSBHRVQgcm91dGVzXG5jb25zdCBnZXRSb3V0ZXM6IFJlY29yZDxzdHJpbmcsIChldmVudDogTGFtYmRhRXZlbnQpID0+IFByb21pc2U8QXBpUmVzcG9uc2U+PiA9IHtcbiAgXCIvZ2V0Qm9kZWdhRWdnc1wiOiBjcmVhdGVIYW5kbGVyKGFzeW5jICgpID0+IHtcbiAgICByZXR1cm4gYXdhaXQgYm94ZXNDb250cm9sbGVyLnJlYWQuZ2V0Qm94ZXNCeUxvY2F0aW9uKExPQ0FUSU9OUy5CT0RFR0EpO1xuICB9KSxcbiAgXG4gIFwiL2dldFBhY2tpbmdEYXRhXCI6IGNyZWF0ZUhhbmRsZXIoYXN5bmMgKCkgPT4ge1xuICAgIHJldHVybiBhd2FpdCBib3hlc0NvbnRyb2xsZXIucmVhZC5nZXRCb3hlc0J5TG9jYXRpb24oTE9DQVRJT05TLlBBQ0tJTkcpO1xuICB9KSxcbiAgXG4gIFwiL2dldFZlbnRhRGF0YVwiOiBjcmVhdGVIYW5kbGVyKGFzeW5jICgpID0+IHtcbiAgICByZXR1cm4gYXdhaXQgYm94ZXNDb250cm9sbGVyLnJlYWQuZ2V0Qm94ZXNCeUxvY2F0aW9uKExPQ0FUSU9OUy5WRU5UQSk7XG4gIH0pLFxuICBcbiAgXCIvZ2V0RWdnc0J5RGF0ZVwiOiBjcmVhdGVIYW5kbGVyKGFzeW5jIChldmVudCkgPT4ge1xuICAgIGNvbnN0IHsgZGF0ZSB9ID0gaGVscGVycy5nZXRRdWVyeVBhcmFtcyhldmVudCk7XG4gICAgaGVscGVycy52YWxpZGF0ZVJlcXVpcmVkKHsgZGF0ZSB9LCBbJ2RhdGUnXSk7XG4gICAgcmV0dXJuIGF3YWl0IGJveGVzQ29udHJvbGxlci5yZWFkLmdldEJveGVzQnlEYXRlKGRhdGUpO1xuICB9KSxcbiAgXG4gIFwiL3Byb2R1Y3Rpb25cIjogY3JlYXRlSGFuZGxlcihhc3luYyAoKSA9PiB7XG4gICAgcmV0dXJuIGF3YWl0IGJveGVzQ29udHJvbGxlci5yZWFkLmdldEFsbEJveGVzKCk7XG4gIH0pLFxuICBcbiAgXCIvZ2V0UGFsbGV0c1wiOiBjcmVhdGVIYW5kbGVyKGFzeW5jICgpID0+IHtcbiAgICByZXR1cm4gYXdhaXQgcGFsbGV0c0NvbnRyb2xsZXIucmVhZC5nZXRBbGxQYWxsZXRzKCk7XG4gIH0pLFxuICBcbiAgXCIvZ2V0QWN0aXZlUGFsbGV0c1wiOiBjcmVhdGVIYW5kbGVyKGFzeW5jICgpID0+IHtcbiAgICByZXR1cm4gYXdhaXQgcGFsbGV0c0NvbnRyb2xsZXIucmVhZC5nZXRBY3RpdmVQYWxsZXRzKCk7XG4gIH0pLFxuICBcbiAgXCIvZ2V0Q2xvc2VkUGFsbGV0c1wiOiBjcmVhdGVIYW5kbGVyKGFzeW5jIChldmVudCkgPT4ge1xuICAgIGNvbnN0IHsgdWJpY2FjaW9uIH0gPSBoZWxwZXJzLmdldFF1ZXJ5UGFyYW1zKGV2ZW50KTtcbiAgICByZXR1cm4gYXdhaXQgcGFsbGV0c0NvbnRyb2xsZXIucmVhZC5nZXRDbG9zZWRQYWxsZXRzKHViaWNhY2lvbik7XG4gIH0pLFxuICBcbiAgXCIvZ2V0RWdnc0J5Q29kaWdvXCI6IGNyZWF0ZUhhbmRsZXIoYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgeyBjb2RpZ28gfSA9IGhlbHBlcnMuZ2V0UXVlcnlQYXJhbXMoZXZlbnQpO1xuICAgIGhlbHBlcnMudmFsaWRhdGVSZXF1aXJlZCh7IGNvZGlnbyB9LCBbJ2NvZGlnbyddKTtcbiAgICByZXR1cm4gZXZlbnQ7XG4gIH0pLFxuICBcbiAgXCIvZ2V0VW5hc3NpZ25lZEJveGVzSW5QYWNraW5nXCI6IGNyZWF0ZUhhbmRsZXIoYXN5bmMgKCkgPT4ge1xuICAgIHJldHVybiBhd2FpdCBib3hlc0NvbnRyb2xsZXIucmVhZC5nZXRVbmFzc2lnbmVkQm94ZXNJblBhY2tpbmcoKTtcbiAgfSksXG4gIFxuICBcIi9hZG1pbi9kYXNoYm9hcmRcIjogY3JlYXRlSGFuZGxlcihhc3luYyAoKSA9PiB7XG4gICAgcmV0dXJuIGF3YWl0IGFkbWluQ29udHJvbGxlci5nZXRTeXN0ZW1EYXNoYm9hcmQoKTtcbiAgfSksXG4gIFxuICBcIi9hZG1pbi9pc3N1ZXNcIjogY3JlYXRlSGFuZGxlcihhc3luYyAoZXZlbnQpID0+IHtcbiAgICBjb25zdCB7IHN0YXR1cywgc3RhcnREYXRlLCBlbmREYXRlIH0gPSBoZWxwZXJzLmdldFF1ZXJ5UGFyYW1zKGV2ZW50KTtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBnZXRJc3N1ZXMoeyBzdGF0dXM6IHN0YXR1cyBhcyBhbnksIHN0YXJ0RGF0ZSwgZW5kRGF0ZSB9KTtcbiAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoMjAwLCBcIklzc3VlcyBmZXRjaGVkIHN1Y2Nlc3NmdWxseVwiLCByZXN1bHQpO1xuICB9KSxcbn07XG5cbmNvbnN0IHBvc3RSb3V0ZXM6IFJlY29yZDxzdHJpbmcsIChldmVudDogTGFtYmRhRXZlbnQpID0+IFByb21pc2U8QXBpUmVzcG9uc2U+PiA9IHtcbiAgXCIvcHJvY2VzYXItZXNjYW5lb1wiOiBjcmVhdGVIYW5kbGVyKGFzeW5jIChldmVudCkgPT4ge1xuICAgIGNvbnN0IGRhdGEgPSBoZWxwZXJzLnBhcnNlQm9keShldmVudCk7XG4gICAgbGV0IHsgY29kaWdvLCB1YmljYWNpb24sIHRpcG8sIHBhbGxldENvZGlnbywgc2Nhbm5lZENvZGVzIH0gPSBkYXRhO1xuXG4gICAgY29uc29sZS5sb2coXCJEYXRvcyByZWNpYmlkb3M6XCIsIEpTT04uc3RyaW5naWZ5KGRhdGEsIG51bGwsIDIpKTtcblxuICAgIGhlbHBlcnMudmFsaWRhdGVSZXF1aXJlZChkYXRhLCBbJ2NvZGlnbycsICd1YmljYWNpb24nXSk7XG4gICAgaGVscGVycy52YWxpZGF0ZUxvY2F0aW9uKHViaWNhY2lvbiwgT2JqZWN0LnZhbHVlcyhDT05GSUcuTE9DQVRJT05TKSk7XG4gICAgXG4gICAgLy8gRGV0ZXJtaW5hciBlbCB0aXBvIGJhc2FkbyBlbiBsYSBsb25naXR1ZCBkZWwgY8OzZGlnbyBzaSBubyBzZSBwcm9wb3JjaW9uYVxuICAgIGlmICghdGlwbykge1xuICAgICAgdGlwbyA9IGNvZGlnby5sZW5ndGggPT09IDE1ID8gQ09ORklHLklURU1fVFlQRVMuQk9YIDogQ09ORklHLklURU1fVFlQRVMuUEFMTEVUO1xuICAgICAgY29uc29sZS5sb2coYFRpcG8gZGV0ZXJtaW5hZG8gYXV0b23DoXRpY2FtZW50ZTogJHt0aXBvfWApO1xuICAgIH1cblxuICAgIGlmICh0aXBvID09PSBDT05GSUcuSVRFTV9UWVBFUy5QQUxMRVQpIHtcbiAgICAgIGlmICh1YmljYWNpb24gPT09IENPTkZJRy5MT0NBVElPTlMuUEFDS0lORykge1xuICAgICAgICB0aHJvdyB7IHN0YXR1c0NvZGU6IDQwMCwgbWVzc2FnZTogXCJQYWxsZXRzIGNhbm5vdCBiZSBtb3ZlZCB0byBQQUNLSU5HIGRpcmVjdGx5LlwiIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gYXdhaXQgbW92ZVBhbGxldChjb2RpZ28sIHViaWNhY2lvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh1YmljYWNpb24gPT09IENPTkZJRy5MT0NBVElPTlMuUEFDS0lORykge1xuICAgICAgICByZXR1cm4gcGFsbGV0Q29kaWdvXG4gICAgICAgICAgPyBhd2FpdCByZWdpc3RlckJveChjb2RpZ28sIHBhbGxldENvZGlnbywgcGFsbGV0Q29kaWdvLCBzY2FubmVkQ29kZXMpXG4gICAgICAgICAgOiBhd2FpdCByZWdpc3RlckJveChjb2RpZ28pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IG1vdmVCb3goY29kaWdvLCB1YmljYWNpb24pO1xuICAgICAgfVxuICAgIH1cbiAgfSksXG5cbiAgXCIvQXNzaWduUGFsbGV0XCI6IGNyZWF0ZUhhbmRsZXIoYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgeyBjb2RpZ28gfSA9IGhlbHBlcnMucGFyc2VCb2R5KGV2ZW50KTtcbiAgICBoZWxwZXJzLnZhbGlkYXRlUmVxdWlyZWQoeyBjb2RpZ28gfSwgWydjb2RpZ28nXSk7XG4gICAgYXdhaXQgYXNzaWduUGFsbGV0KGNvZGlnbyk7XG4gICAgYXdhaXQgc2V0U3lzdGVtQ29uZmlnKFwiQUNUSVZFX1BBTExFVF9DT0RFXCIsIGNvZGlnbyk7XG4gICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDIwMCwgXCJQYWxsZXQgYXNzaWduZWQgc3VjY2Vzc2Z1bGx5XCIsIHsgcGFsbGV0Q29kZTogY29kaWdvIH0pO1xuICB9KSxcblxuICBcIi9Bc3NpZ25Cb3hUb1BhbGxldFwiOiBjcmVhdGVIYW5kbGVyKGFzeW5jIChldmVudCkgPT4ge1xuICAgIGNvbnN0IHsgY29kaWdvLCBjdXN0b21JbmZvIH0gPSBoZWxwZXJzLnBhcnNlQm9keShldmVudCk7XG4gICAgaGVscGVycy52YWxpZGF0ZVJlcXVpcmVkKHsgY29kaWdvIH0sIFsnY29kaWdvJ10pO1xuICAgIGNvbnN0IHBhbGxldCA9IGF3YWl0IGdldFN5c3RlbUNvbmZpZyhcIkFDVElWRV9QQUxMRVRfQ09ERVwiKTtcbiAgICBpZiAoIXBhbGxldCkgdGhyb3cgeyBzdGF0dXNDb2RlOiA0MDAsIG1lc3NhZ2U6IFwiTm8gYWN0aXZlIHBhbGxldCBmb3VuZC4gUGxlYXNlIGFzc2lnbiBvbmUuXCIgfTtcbiAgICByZXR1cm4gYXdhaXQgcmVnaXN0ZXJCb3goY29kaWdvLCBwYWxsZXQsIGN1c3RvbUluZm8pO1xuICB9KSxcblxuICBcIi9tb3ZlUGFsbGV0XCI6IGNyZWF0ZUhhbmRsZXIoYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgeyBjb2RpZ28sIHViaWNhY2lvbiB9ID0gaGVscGVycy5wYXJzZUJvZHkoZXZlbnQpO1xuICAgIGhlbHBlcnMudmFsaWRhdGVSZXF1aXJlZCh7IGNvZGlnbywgdWJpY2FjaW9uIH0sIFsnY29kaWdvJywgJ3ViaWNhY2lvbiddKTtcbiAgICBoZWxwZXJzLnZhbGlkYXRlTG9jYXRpb24odWJpY2FjaW9uLCBbXCJUUkFOU0lUT1wiLCBcIkJPREVHQVwiLCBcIlZFTlRBXCJdKTtcbiAgICByZXR1cm4gYXdhaXQgbW92ZVBhbGxldChjb2RpZ28sIHViaWNhY2lvbik7XG4gIH0pLFxuXG4gIFwiL2Nsb3NlUGFsbGV0XCI6IGNyZWF0ZUhhbmRsZXIoYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgeyBjb2RpZ28gfSA9IGhlbHBlcnMucGFyc2VCb2R5KGV2ZW50KTtcbiAgICBoZWxwZXJzLnZhbGlkYXRlUmVxdWlyZWQoeyBjb2RpZ28gfSwgWydjb2RpZ28nXSk7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2xvc2VQYWxsZXQoY29kaWdvKTtcbiAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoMjAwLCBcIlBhbGxldCBjbG9zZWQgc3VjY2Vzc2Z1bGx5XCIsIHJlc3VsdCk7XG4gIH0pLFxuXG4gIFwiL2NyZWF0ZVBhbGxldFwiOiBjcmVhdGVIYW5kbGVyKGFzeW5jIChldmVudCkgPT4ge1xuICAgIGNvbnN0IHsgY29kaWdvIH0gPSBoZWxwZXJzLnBhcnNlQm9keShldmVudCk7XG4gICAgaGVscGVycy52YWxpZGF0ZVJlcXVpcmVkKHsgY29kaWdvIH0sIFsnY29kaWdvJ10pO1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNyZWF0ZVBhbGxldChjb2RpZ28pO1xuICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSgyMDAsIFwiUGFsbGV0IGNyZWF0ZWQgc3VjY2Vzc2Z1bGx5XCIsIHJlc3VsdCk7XG4gIH0pLFxuXG4gIFwiL3VwZGF0ZUJveERlc2NyaXB0aW9uXCI6IGNyZWF0ZUhhbmRsZXIoYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgeyBjb2RpZ28sIGN1c3RvbUluZm8gfSA9IGhlbHBlcnMucGFyc2VCb2R5KGV2ZW50KTtcbiAgICBoZWxwZXJzLnZhbGlkYXRlUmVxdWlyZWQoeyBjb2RpZ28sIGN1c3RvbUluZm8gfSwgWydjb2RpZ28nLCAnY3VzdG9tSW5mbyddKTtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB1cGRhdGVCb3hEZXNjcmlwdGlvbihjb2RpZ28sIGN1c3RvbUluZm8pO1xuICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSgyMDAsIFwiQm94IGRlc2NyaXB0aW9uIHVwZGF0ZWQgc3VjY2Vzc2Z1bGx5XCIsIHJlc3VsdCk7XG4gIH0pLFxuXG4gIFwiL2dldEJveGVzSW5QYWxsZXRcIjogY3JlYXRlSGFuZGxlcihhc3luYyAoZXZlbnQpID0+IHtcbiAgICByZXR1cm4gYXdhaXQgZ2V0Qm94ZXNJblBhbGxldChldmVudCk7XG4gIH0pLFxuXG4gIFwiL2dldEJveEJ5Q29kZVwiOiBjcmVhdGVIYW5kbGVyKGFzeW5jIChldmVudCkgPT4ge1xuICAgIGNvbnN0IHsgY29kaWdvIH0gPSBoZWxwZXJzLnBhcnNlQm9keShldmVudCk7XG4gICAgaGVscGVycy52YWxpZGF0ZVJlcXVpcmVkKHsgY29kaWdvIH0sIFsnY29kaWdvJ10pO1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGdldEJveEJ5Q29kZShjb2RpZ28pO1xuICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSgyMDAsIFwiQm94IGRhdGEgZmV0Y2hlZCBzdWNjZXNzZnVsbHlcIiwgcmVzdWx0KTtcbiAgfSksXG4gIFxuICBcIi9wb3N0SXNzdWVcIjogY3JlYXRlSGFuZGxlcihhc3luYyAoZXZlbnQpID0+IHtcbiAgICBjb25zdCB7IGRlc2NyaXBjaW9uIH0gPSBoZWxwZXJzLnBhcnNlQm9keShldmVudCk7XG4gICAgcmV0dXJuIGF3YWl0IHBvc3RJc3N1ZShkZXNjcmlwY2lvbik7XG4gIH0pLFxuICBcbiAgXCIvYWRtaW4vdXBkYXRlSXNzdWVTdGF0dXNcIjogY3JlYXRlSGFuZGxlcihhc3luYyAoZXZlbnQpID0+IHtcbiAgICBjb25zdCB7IGlzc3VlSWQsIHN0YXR1cywgcmVzb2x1dGlvbiB9ID0gaGVscGVycy5wYXJzZUJvZHkoZXZlbnQpO1xuICAgIGhlbHBlcnMudmFsaWRhdGVSZXF1aXJlZCh7IGlzc3VlSWQsIHN0YXR1cyB9LCBbJ2lzc3VlSWQnLCAnc3RhdHVzJ10pO1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHVwZGF0ZUlzc3VlU3RhdHVzSGFuZGxlcihpc3N1ZUlkLCBzdGF0dXMsIHJlc29sdXRpb24pO1xuICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSgyMDAsIFwiSXNzdWUgc3RhdHVzIHVwZGF0ZWQgc3VjY2Vzc2Z1bGx5XCIsIHJlc3VsdCk7XG4gIH0pLFxuICBcbiAgXCIvYWRtaW4vYXVkaXRBbmRGaXhcIjogY3JlYXRlSGFuZGxlcihhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXVkaXRBbmRGaXhEYXRhKCk7XG4gICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDIwMCwgXCJBdWRpdCBhbmQgZml4IGNvbXBsZXRlZCBzdWNjZXNzZnVsbHlcIiwgcmVzdWx0KTtcbiAgfSksXG4gIFxuICBcIi9hZG1pbi9iYWNrdXBcIjogY3JlYXRlSGFuZGxlcihhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYmFja3VwRGF0YSgpO1xuICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSgyMDAsIFwiQmFja3VwIGNvbXBsZXRlZCBzdWNjZXNzZnVsbHlcIiwgcmVzdWx0KTtcbiAgfSksXG4gIFxuICBcIi9hZG1pbi9nZW5lcmF0ZVJlcG9ydFwiOiBjcmVhdGVIYW5kbGVyKGFzeW5jIChldmVudCkgPT4ge1xuICAgIHJldHVybiBhd2FpdCBnZW5lcmF0ZVJlcG9ydEhhbmRsZXIoZXZlbnQpO1xuICB9KSxcbiAgXG4gIFwiL2FkbWluL2dlbmVyYXRlRXhjZWxSZXBvcnRcIjogY3JlYXRlSGFuZGxlcihhc3luYyAoZXZlbnQpID0+IHtcbiAgICByZXR1cm4gYXdhaXQgZ2VuZXJhdGVFeGNlbFJlcG9ydEhhbmRsZXIoZXZlbnQpO1xuICB9KSxcbiAgXG4gIFwiL2FkbWluL2dlbmVyYXRlQ3VzdG9tUmVwb3J0XCI6IGNyZWF0ZUhhbmRsZXIoYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgcmV0dXJuIGF3YWl0IGdlbmVyYXRlQ3VzdG9tUmVwb3J0SGFuZGxlcihldmVudCk7XG4gIH0pLFxuICBcbiAgXCIvYWRtaW4vZGVsZXRlQm94XCI6IGNyZWF0ZUhhbmRsZXIoYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgeyBjb2RpZ28gfSA9IGhlbHBlcnMucGFyc2VCb2R5KGV2ZW50KTtcbiAgICBoZWxwZXJzLnZhbGlkYXRlUmVxdWlyZWQoeyBjb2RpZ28gfSwgWydjb2RpZ28nXSk7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZGVsZXRlQm94KGNvZGlnbyk7XG4gICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKChyZXN1bHQgYXMgYW55KS5zdWNjZXNzID8gMjAwIDogNDAwLCAocmVzdWx0IGFzIGFueSkubWVzc2FnZSk7XG4gIH0pLFxuICBcbiAgXCIvYWRtaW4vZGVsZXRlUGFsbGV0XCI6IGNyZWF0ZUhhbmRsZXIoYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgeyBjb2RpZ28gfSA9IGhlbHBlcnMucGFyc2VCb2R5KGV2ZW50KTtcbiAgICBoZWxwZXJzLnZhbGlkYXRlUmVxdWlyZWQoeyBjb2RpZ28gfSwgWydjb2RpZ28nXSk7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZGVsZXRlUGFsbGV0KGNvZGlnbyk7XG4gICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKChyZXN1bHQgYXMgYW55KS5zdWNjZXNzID8gMjAwIDogNDAwLCAocmVzdWx0IGFzIGFueSkubWVzc2FnZSk7XG4gIH0pLFxuXG4gIFwiL2FkbWluL2lzc3Vlcy97aXNzdWVJZH0vc3RhdHVzXCI6IGNyZWF0ZUhhbmRsZXIoYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgeyBpc3N1ZUlkIH0gPSBldmVudC5wYXRoUGFyYW1ldGVycyB8fCB7fTtcbiAgICBjb25zdCB7IHN0YXR1cywgcmVzb2x1dGlvbiB9ID0gaGVscGVycy5wYXJzZUJvZHkoZXZlbnQpO1xuICAgIGhlbHBlcnMudmFsaWRhdGVSZXF1aXJlZCh7IGlzc3VlSWQsIHN0YXR1cyB9LCBbJ2lzc3VlSWQnLCAnc3RhdHVzJ10pO1xuICAgIFxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHVwZGF0ZUlzc3VlU3RhdHVzSGFuZGxlcihpc3N1ZUlkIGFzIHN0cmluZywgc3RhdHVzLCByZXNvbHV0aW9uKTtcbiAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoMjAwLCBcIkVzdGFkbyBkZSBsYSBpbmNpZGVuY2lhIGFjdHVhbGl6YWRvIGNvcnJlY3RhbWVudGVcIiwgcmVzdWx0KTtcbiAgfSksXG5cbiAgLy8gTmV3IGVuZHBvaW50IGZvciB1cGRhdGluZyBpc3N1ZSBzdGF0dXNcbiAgXCIvYWRtaW4vaXNzdWVzL3VwZGF0ZS1zdGF0dXNcIjogY3JlYXRlSGFuZGxlcihhc3luYyAoZXZlbnQpID0+IHtcbiAgICBjb25zdCB7IGlzc3VlSWQsIHN0YXR1cywgcmVzb2x1dGlvbiB9ID0gSlNPTi5wYXJzZShldmVudC5ib2R5IHx8IFwie31cIik7XG4gICAgXG4gICAgaWYgKCFpc3N1ZUlkIHx8ICFzdGF0dXMpIHtcbiAgICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSg0MDAsIFwiRmFsdGFuIGNhbXBvcyByZXF1ZXJpZG9zOiBpc3N1ZUlkIHkgc3RhdHVzIHNvbiBvYmxpZ2F0b3Jpb3NcIik7XG4gICAgfVxuICAgIFxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHVwZGF0ZUlzc3VlU3RhdHVzSGFuZGxlcihpc3N1ZUlkLCBzdGF0dXMsIHJlc29sdXRpb24pO1xuICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSgyMDAsIFwiRXN0YWRvIGRlIGxhIGluY2lkZW5jaWEgYWN0dWFsaXphZG8gY29ycmVjdGFtZW50ZVwiLCByZXN1bHQpO1xuICB9KSxcbiAgXG4gIC8vIE5ldyBlbmRwb2ludCBmb3IgZGVsZXRpbmcgaXNzdWVzXG4gIFwiL2FkbWluL2lzc3Vlcy9kZWxldGVcIjogY3JlYXRlSGFuZGxlcihhc3luYyAoZXZlbnQpID0+IHtcbiAgICBjb25zdCB7IGlzc3VlSWQgfSA9IEpTT04ucGFyc2UoZXZlbnQuYm9keSB8fCBcInt9XCIpO1xuICAgIFxuICAgIGlmICghaXNzdWVJZCkge1xuICAgICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDQwMCwgXCJGYWx0YSBlbCBjYW1wbyByZXF1ZXJpZG86IGlzc3VlSWQgZXMgb2JsaWdhdG9yaW9cIik7XG4gICAgfVxuICAgIFxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRlbGV0ZUlzc3VlKGlzc3VlSWQpO1xuICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSgyMDAsIFwiSW5jaWRlbmNpYSBlbGltaW5hZGEgY29ycmVjdGFtZW50ZVwiLCByZXN1bHQpO1xuICB9KSxcbn07XG5cbmNvbnN0IHB1dFJvdXRlczogUmVjb3JkPHN0cmluZywgKGV2ZW50OiBMYW1iZGFFdmVudCkgPT4gUHJvbWlzZTxBcGlSZXNwb25zZT4+ID0ge1xuICAvLyBEeW5hbWljIHJvdXRlIG1hdGNoaW5nIGZvciBpc3N1ZSBzdGF0dXMgdXBkYXRlc1xuICBcIi9hZG1pbi9pc3N1ZXMve2lzc3VlSWR9L3N0YXR1c1wiOiBjcmVhdGVIYW5kbGVyKGFzeW5jIChldmVudCkgPT4ge1xuICAgIC8vIEV4dHJhY3QgaXNzdWVJZCBmcm9tIHBhdGhcbiAgICBsZXQgaXNzdWVJZDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIFxuICAgIC8vIEZpcnN0IHRyeSBmcm9tIHBhdGggcGFyYW1ldGVycyAoaWYgb3VyIGN1c3RvbSByb3V0aW5nIHdvcmtlZClcbiAgICBpZiAoZXZlbnQucGF0aFBhcmFtZXRlcnMgJiYgZXZlbnQucGF0aFBhcmFtZXRlcnMuaXNzdWVJZCkge1xuICAgICAgaXNzdWVJZCA9IGV2ZW50LnBhdGhQYXJhbWV0ZXJzLmlzc3VlSWQ7XG4gICAgfSBcbiAgICAvLyBPdGhlcndpc2UgZXh0cmFjdCBpdCBmcm9tIHRoZSBwYXRoXG4gICAgZWxzZSB7XG4gICAgICBjb25zdCBwYXRoUGFydHMgPSBldmVudC5wYXRoLnNwbGl0KCcvJyk7XG4gICAgICBjb25zdCBpc3N1ZUlkSW5kZXggPSBwYXRoUGFydHMuZmluZEluZGV4KHBhcnQgPT4gcGFydCA9PT0gJ2lzc3VlcycpICsgMTtcbiAgICAgIGlmIChpc3N1ZUlkSW5kZXggPiAwICYmIGlzc3VlSWRJbmRleCA8IHBhdGhQYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgaXNzdWVJZCA9IHBhdGhQYXJ0c1tpc3N1ZUlkSW5kZXhdO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpZiAoIWlzc3VlSWQpIHtcbiAgICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSg0MDAsIFwiTWlzc2luZyBpc3N1ZUlkIGluIHBhdGhcIik7XG4gICAgfVxuICAgIFxuICAgIGNvbnN0IHsgc3RhdHVzLCByZXNvbHV0aW9uIH0gPSBoZWxwZXJzLnBhcnNlQm9keShldmVudCk7XG4gICAgaGVscGVycy52YWxpZGF0ZVJlcXVpcmVkKHsgc3RhdHVzIH0sIFsnc3RhdHVzJ10pO1xuICAgIFxuICAgIGNvbnNvbGUubG9nKGBQcm9jZXNzaW5nIFBVVCByZXF1ZXN0IGZvciBpc3N1ZSAke2lzc3VlSWR9LCBzdGF0dXM6ICR7c3RhdHVzfWApO1xuICAgIFxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHVwZGF0ZUlzc3VlU3RhdHVzSGFuZGxlcihpc3N1ZUlkLCBzdGF0dXMsIHJlc29sdXRpb24pO1xuICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSgyMDAsIFwiRXN0YWRvIGRlIGxhIGluY2lkZW5jaWEgYWN0dWFsaXphZG8gY29ycmVjdGFtZW50ZVwiLCByZXN1bHQpO1xuICB9KSxcbiAgXG4gIC8vIEZhbGxiYWNrIHRvIGhhbmRsZSBhbGwgUFVUIHJlcXVlc3RzIHRoYXQgaW5jbHVkZSBcIi9hZG1pbi9pc3N1ZXMvXCIgYW5kIFwiL3N0YXR1c1wiXG4gIC8vIFRoaXMgaGVscHMgd2l0aCBwb3RlbnRpYWwgZW5jb2Rpbmcgb3IgQVBJIEdhdGV3YXkgcGF0aCBoYW5kbGluZyBkaWZmZXJlbmNlc1xuICBcIi9hZG1pbi9pc3N1ZXNcIjogY3JlYXRlSGFuZGxlcihhc3luYyAoZXZlbnQpID0+IHtcbiAgICAvLyBDaGVjayBpZiB0aGlzIGlzIGFuIGlzc3VlIHN0YXR1cyB1cGRhdGUgcmVxdWVzdFxuICAgIGlmIChldmVudC5wYXRoLmluY2x1ZGVzKCcvc3RhdHVzJykpIHtcbiAgICAgIC8vIEV4dHJhY3QgaXNzdWVJZCBmcm9tIHBhdGggc2VnbWVudHNcbiAgICAgIGNvbnN0IHBhdGhQYXJ0cyA9IGV2ZW50LnBhdGguc3BsaXQoJy8nKTtcbiAgICAgIGNvbnN0IGlzc3VlSWRJbmRleCA9IHBhdGhQYXJ0cy5maW5kSW5kZXgocGFydCA9PiBwYXJ0ID09PSAnaXNzdWVzJykgKyAxO1xuICAgICAgXG4gICAgICBpZiAoaXNzdWVJZEluZGV4ID4gMCAmJiBpc3N1ZUlkSW5kZXggPCBwYXRoUGFydHMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IGlzc3VlSWQgPSBwYXRoUGFydHNbaXNzdWVJZEluZGV4XTtcbiAgICAgICAgY29uc3QgeyBzdGF0dXMsIHJlc29sdXRpb24gfSA9IGhlbHBlcnMucGFyc2VCb2R5KGV2ZW50KTtcbiAgICAgICAgXG4gICAgICAgIGlmICghc3RhdHVzKSB7XG4gICAgICAgICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDQwMCwgXCJNaXNzaW5nIHN0YXR1cyBpbiByZXF1ZXN0IGJvZHlcIik7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKGBGYWxsYmFjayBoYW5kbGVyOiBQcm9jZXNzaW5nIFBVVCByZXF1ZXN0IGZvciBpc3N1ZSAke2lzc3VlSWR9LCBzdGF0dXM6ICR7c3RhdHVzfWApO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdXBkYXRlSXNzdWVTdGF0dXNIYW5kbGVyKGlzc3VlSWQsIHN0YXR1cywgcmVzb2x1dGlvbik7XG4gICAgICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSgyMDAsIFwiRXN0YWRvIGRlIGxhIGluY2lkZW5jaWEgYWN0dWFsaXphZG8gY29ycmVjdGFtZW50ZVwiLCByZXN1bHQpO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoNDA0LCBgUm91dGUgbm90IGZvdW5kIGZvciBQVVQ6ICR7ZXZlbnQucGF0aH1gKTtcbiAgfSksXG59O1xuXG5jb25zdCBvcHRpb25zUm91dGVzOiBSZWNvcmQ8c3RyaW5nLCAoKSA9PiBQcm9taXNlPGFueT4+ID0ge1xuICAvLyBIYW5kbGUgYWxsIE9QVElPTlMgcmVxdWVzdHMgd2l0aCBhIENPUlMtZnJpZW5kbHkgcmVzcG9uc2VcbiAgXCIqXCI6IGFzeW5jICgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzQ29kZTogMjAwLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxuICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6ICdPUFRJT05TLEdFVCxQT1NULFBVVCxERUxFVEUnLFxuICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6ICdDb250ZW50LVR5cGUsQXV0aG9yaXphdGlvbixYLUFtei1EYXRlLFgtQXBpLUtleScsXG4gICAgICAgICdBY2Nlc3MtQ29udHJvbC1NYXgtQWdlJzogJzg2NDAwJywgLy8gMjQgaG91cnMgY2FjaGUgZm9yIHByZWZsaWdodCByZXF1ZXN0c1xuICAgICAgfSxcbiAgICAgIGJvZHk6ICcnLFxuICAgIH07XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBoYW5kbGVyID0gYXN5bmMgKGV2ZW50OiBhbnkpOiBQcm9taXNlPGFueT4gPT4ge1xuICAvLyBDb2RlUGlwZWxpbmUgaW50ZWdyYXRpb25cbiAgaWYgKGV2ZW50WydDb2RlUGlwZWxpbmUuam9iJ10pIHtcbiAgICBjb25zdCBqb2JJZCA9IGV2ZW50WydDb2RlUGlwZWxpbmUuam9iJ10uaWQ7XG4gICAgdHJ5IHtcbiAgICAgIC8vIFJlYWxpemEgYXF1w60gbGEgbMOzZ2ljYSBkZSBkZXNwbGllZ3VlIHUgb3BlcmFjacOzbiBxdWUgbmVjZXNpdGFzXG5cbiAgICAgIC8vIOKchSBSZXBvcnRhIMOpeGl0byBleHBsw61jaXRhbWVudGVcbiAgICAgIGF3YWl0IGNvZGVwaXBlbGluZS5wdXRKb2JTdWNjZXNzUmVzdWx0KHsgam9iSWQgfSkucHJvbWlzZSgpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwi4p2MIEVycm9yIGVuIGVqZWN1Y2nDs24gTGFtYmRhIGRlc2RlIENvZGVQaXBlbGluZTpcIiwgZXJyb3IpO1xuICAgICAgYXdhaXQgY29kZXBpcGVsaW5lLnB1dEpvYkZhaWx1cmVSZXN1bHQoe1xuICAgICAgICBqb2JJZCxcbiAgICAgICAgZmFpbHVyZURldGFpbHM6IHtcbiAgICAgICAgICBtZXNzYWdlOiBKU09OLnN0cmluZ2lmeSgoZXJyb3IgYXMgRXJyb3IpLm1lc3NhZ2UpLFxuICAgICAgICAgIHR5cGU6ICdKb2JGYWlsZWQnLFxuICAgICAgICAgIGV4dGVybmFsRXhlY3V0aW9uSWQ6IChnbG9iYWwgYXMgYW55KS5jb250ZXh0Py5hd3NSZXF1ZXN0SWQgfHwgJ3Vua25vd24nLFxuICAgICAgICB9LFxuICAgICAgfSkucHJvbWlzZSgpO1xuICAgIH1cblxuICAgIHJldHVybjtcbiAgfVxuXG4gIHRyeSB7XG4gICAgY29uc29sZS5sb2coJ0V2ZW50IHJlY2VpdmVkOicsIHtcbiAgICAgIG1ldGhvZDogZXZlbnQuaHR0cE1ldGhvZCB8fCBldmVudC5yZXF1ZXN0Q29udGV4dD8uaHR0cD8ubWV0aG9kLFxuICAgICAgcGF0aDogZXZlbnQucmF3UGF0aCB8fCBldmVudC5wYXRoLFxuICAgICAgcXVlcnlQYXJhbXM6IGV2ZW50LnF1ZXJ5U3RyaW5nUGFyYW1ldGVycyxcbiAgICAgIHBhdGhQYXJhbXM6IGV2ZW50LnBhdGhQYXJhbWV0ZXJzLFxuICAgIH0pO1xuXG4gICAgY29uc3QgbWV0aG9kID0gZXZlbnQuaHR0cE1ldGhvZCB8fCBldmVudC5yZXF1ZXN0Q29udGV4dD8uaHR0cD8ubWV0aG9kO1xuICAgIGNvbnN0IHBhdGggPSBldmVudC5yYXdQYXRoIHx8IGV2ZW50LnBhdGg7XG5cbiAgICBpZiAoIW1ldGhvZCB8fCAhcGF0aCkge1xuICAgICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDQwMCwgXCJJbnZhbGlkIHJlcXVlc3Q6IG1pc3NpbmcgbWV0aG9kIG9yIHBhdGhcIik7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIE9QVElPTlMgbWV0aG9kIGZvciBDT1JTIHByZWZsaWdodFxuICAgIGlmIChtZXRob2QgPT09IFwiT1BUSU9OU1wiKSB7XG4gICAgICByZXR1cm4gYXdhaXQgb3B0aW9uc1JvdXRlc1tcIipcIl0oKTtcbiAgICB9XG5cbiAgICAvLyBHZXQgdGhlIGFwcHJvcHJpYXRlIHJvdXRlcyBvYmplY3QgYmFzZWQgb24gSFRUUCBtZXRob2RcbiAgICBjb25zdCByb3V0ZXMgPSBcbiAgICAgIG1ldGhvZCA9PT0gXCJHRVRcIiA/IGdldFJvdXRlcyA6IFxuICAgICAgbWV0aG9kID09PSBcIlBPU1RcIiA/IHBvc3RSb3V0ZXMgOiBcbiAgICAgIG1ldGhvZCA9PT0gXCJQVVRcIiA/IHB1dFJvdXRlcyA6IG51bGw7XG4gICAgICBcbiAgICBpZiAoIXJvdXRlcykgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDQwNSwgYE1ldGhvZCBub3Qgc3VwcG9ydGVkOiAke21ldGhvZH1gKTtcblxuICAgIC8vIFRyeSBleGFjdCBwYXRoIG1hdGNoIGZpcnN0XG4gICAgbGV0IGhhbmRsZXIgPSByb3V0ZXNbcGF0aF07XG4gICAgXG4gICAgLy8gU3BlY2lhbCBjYXNlIGZvciBQVVQgdG8gL2FkbWluL2lzc3Vlcy86aXNzdWVJZC9zdGF0dXMgd2hpY2ggaXMgb2Z0ZW4gcHJvYmxlbWF0aWNcbiAgICBpZiAoIWhhbmRsZXIgJiYgbWV0aG9kID09PSBcIlBVVFwiICYmIHBhdGguaW5jbHVkZXMoJy9hZG1pbi9pc3N1ZXMvJykgJiYgcGF0aC5pbmNsdWRlcygnL3N0YXR1cycpKSB7XG4gICAgICBjb25zb2xlLmxvZygnRGV0ZWN0ZWQgaXNzdWUgc3RhdHVzIHVwZGF0ZSByZXF1ZXN0LCB1c2luZyBzcGVjaWFsIGhhbmRsZXInKTtcbiAgICAgIGhhbmRsZXIgPSBwdXRSb3V0ZXNbXCIvYWRtaW4vaXNzdWVzL3tpc3N1ZUlkfS9zdGF0dXNcIl07XG4gICAgfVxuICAgIFxuICAgIC8vIElmIHN0aWxsIG5vIGhhbmRsZXIsIHRyeSBwYXRoIHBhcmFtZXRlciBtYXRjaGluZ1xuICAgIGlmICghaGFuZGxlcikge1xuICAgICAgY29uc29sZS5sb2coYE5vIGRpcmVjdCBoYW5kbGVyIGZvciAke3BhdGh9LCB0cnlpbmcgcGF0aCBwYXJhbWV0ZXIgbWF0Y2hpbmdgKTtcbiAgICAgIFxuICAgICAgLy8gRm9yIGVhY2ggcm91dGUgcGF0aCB0aGF0IGNvbnRhaW5zIGEgcGFyYW1ldGVyXG4gICAgICBmb3IgKGNvbnN0IHJvdXRlUGF0aCBpbiByb3V0ZXMpIHtcbiAgICAgICAgaWYgKHJvdXRlUGF0aC5pbmNsdWRlcygneycpICYmIHJvdXRlUGF0aC5pbmNsdWRlcygnfScpKSB7XG4gICAgICAgICAgLy8gQ29udmVydCByb3V0ZSB0ZW1wbGF0ZSB0byByZWdleCBwYXR0ZXJuXG4gICAgICAgICAgbGV0IHBhdHRlcm4gPSByb3V0ZVBhdGg7XG4gICAgICAgICAgY29uc3QgcGFyYW1OYW1lczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBFeHRyYWN0IHBhcmFtZXRlciBuYW1lcyBhbmQgYnVpbGQgcmVnZXhcbiAgICAgICAgICByb3V0ZVBhdGguc3BsaXQoJy8nKS5mb3JFYWNoKHBhcnQgPT4ge1xuICAgICAgICAgICAgaWYgKHBhcnQuc3RhcnRzV2l0aCgneycpICYmIHBhcnQuZW5kc1dpdGgoJ30nKSkge1xuICAgICAgICAgICAgICBjb25zdCBwYXJhbU5hbWUgPSBwYXJ0LnN1YnN0cmluZygxLCBwYXJ0Lmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgICBwYXJhbU5hbWVzLnB1c2gocGFyYW1OYW1lKTtcbiAgICAgICAgICAgICAgcGF0dGVybiA9IHBhdHRlcm4ucmVwbGFjZShwYXJ0LCAnKFteL10rKScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIEVzY2FwZSBzcGVjaWFsIHJlZ2V4IGNoYXJzIGluIHRoZSBwYXR0ZXJuIGV4Y2VwdCB0aGUgY2FwdHVyZSBncm91cHNcbiAgICAgICAgICBwYXR0ZXJuID0gcGF0dGVybi5yZXBsYWNlKC9bLVxcL1xcXFxeJCorPy4oKXxbXFxde31dL2csIGNoYXIgPT4gXG4gICAgICAgICAgICAoY2hhciA9PT0gJygnIHx8IGNoYXIgPT09ICcpJykgPyBjaGFyIDogJ1xcXFwnICsgY2hhclxuICAgICAgICAgICk7XG4gICAgICAgICAgXG4gICAgICAgICAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKGBeJHtwYXR0ZXJufSRgKTtcbiAgICAgICAgICBjb25zdCBtYXRjaCA9IHBhdGgubWF0Y2gocmVnZXgpO1xuICAgICAgICAgIFxuICAgICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgLy8gRXh0cmFjdCBwYXJhbWV0ZXJzIGZyb20gcmVnZXggbWF0Y2hcbiAgICAgICAgICAgIGNvbnN0IHBhdGhQYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcbiAgICAgICAgICAgIHBhcmFtTmFtZXMuZm9yRWFjaCgobmFtZSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgcGF0aFBhcmFtc1tuYW1lXSA9IG1hdGNoW2luZGV4ICsgMV07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc29sZS5sb2coYE1hdGNoZWQgcGF0aCAke3BhdGh9IHRvIHJvdXRlICR7cm91dGVQYXRofSB3aXRoIHBhcmFtczpgLCBwYXRoUGFyYW1zKTtcbiAgICAgICAgICAgIGV2ZW50LnBhdGhQYXJhbWV0ZXJzID0gcGF0aFBhcmFtcztcbiAgICAgICAgICAgIGhhbmRsZXIgPSByb3V0ZXNbcm91dGVQYXRoXTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvLyBJZiBzdGlsbCBubyBoYW5kbGVyLCB0cnkgcHJlZml4IG1hdGNoaW5nIGFzIGEgbGFzdCByZXNvcnRcbiAgICBpZiAoIWhhbmRsZXIpIHtcbiAgICAgIGZvciAoY29uc3Qgcm91dGVQYXRoIGluIHJvdXRlcykge1xuICAgICAgICBpZiAoIXJvdXRlUGF0aC5pbmNsdWRlcygneycpICYmIFxuICAgICAgICAgICAgKChyb3V0ZVBhdGguZW5kc1dpdGgoJy8nKSAmJiBwYXRoLnN0YXJ0c1dpdGgocm91dGVQYXRoKSkgfHwgXG4gICAgICAgICAgICAgcGF0aC5zdGFydHNXaXRoKHJvdXRlUGF0aCArICcvJykpKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYE1hdGNoZWQgcGF0aCAke3BhdGh9IHRvIHByZWZpeCByb3V0ZSAke3JvdXRlUGF0aH1gKTtcbiAgICAgICAgICBoYW5kbGVyID0gcm91dGVzW3JvdXRlUGF0aF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYgKCFoYW5kbGVyKSB7XG4gICAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoNDA0LCBgUm91dGUgbm90IGZvdW5kOiAke3BhdGh9YCk7XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coYEludm9raW5nIGhhbmRsZXIgZm9yICR7bWV0aG9kfSAke3BhdGh9YCk7XG4gICAgcmV0dXJuIGF3YWl0IGhhbmRsZXIoZXZlbnQpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCLinYwgVW5oYW5kbGVkIEVycm9yOlwiLCBlcnJvcik7XG4gICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDUwMCwgXCJJbnRlcm5hbCBzZXJ2ZXIgZXJyb3JcIiwgeyBlcnJvcjogKGVycm9yIGFzIEVycm9yKS5tZXNzYWdlIH0pO1xuICB9XG59OyAiXX0=