"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const SystemConfig_1 = __importDefault(require("./models/SystemConfig"));
const pallets_1 = __importDefault(require("./controllers/pallets"));
const boxes_1 = __importDefault(require("./controllers/boxes"));
const admin_1 = __importDefault(require("./controllers/admin"));
const response_1 = __importDefault(require("./utils/response"));
const AWS = __importStar(require("aws-sdk"));
const registerBox_1 = __importDefault(require("./handlers/registerBox"));
const moveBox_1 = __importDefault(require("./handlers/moveBox"));
const read_1 = require("./controllers/issues/read");
const update_1 = require("./controllers/issues/update");
const delete_1 = __importDefault(require("./controllers/issues/delete"));
const codepipeline = new AWS.CodePipeline();
// Constants from models
const LOCATIONS = SystemConfig_1.default.getLocations();
const ITEM_TYPES = SystemConfig_1.default.getItemTypes();
const CONFIG = { LOCATIONS, ITEM_TYPES };
// Placeholder implementations (replace with real ones where available)
async function getBoxesInPallet(event) {
    return (0, response_1.default)(501, 'Not implemented yet');
}
async function getBoxByCode(code) {
    return (0, response_1.default)(501, 'Not implemented yet');
}
async function postIssue(descripcion) {
    return (0, response_1.default)(501, 'Not implemented yet');
}
async function auditAndFixData() {
    return (0, response_1.default)(501, 'Not implemented yet');
}
async function backupData() {
    return (0, response_1.default)(501, 'Not implemented yet');
}
async function generateReportHandler(event) {
    return (0, response_1.default)(501, 'Not implemented yet');
}
async function generateExcelReportHandler(event) {
    return (0, response_1.default)(501, 'Not implemented yet');
}
async function generateCustomReportHandler(event) {
    return (0, response_1.default)(501, 'Not implemented yet');
}
async function deleteBox(code) {
    return (0, response_1.default)(501, 'Not implemented yet');
}
async function deletePallet(code) {
    return (0, response_1.default)(501, 'Not implemented yet');
}
async function movePallet(code, location) {
    return (0, response_1.default)(501, 'Not implemented yet');
}
async function closePallet(code) {
    return (0, response_1.default)(501, 'Not implemented yet');
}
async function createPallet(code) {
    return (0, response_1.default)(501, 'Not implemented yet');
}
async function updateBoxDescription(code, description) {
    return (0, response_1.default)(501, 'Not implemented yet');
}
async function assignPallet(code) {
    return (0, response_1.default)(501, 'Not implemented yet');
}
async function setSystemConfig(key, value) {
    return (0, response_1.default)(501, 'Not implemented yet');
}
async function getSystemConfig(key) {
    return null;
}
// Helper functions
const helpers = {
    parseBody(event) {
        if (!event.body)
            return {};
        try {
            return typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        }
        catch (_a) {
            throw new Error('Invalid request body: unable to parse JSON');
        }
    },
    getQueryParams(event) {
        return event.queryStringParameters || {};
    },
    validateRequired(data, required) {
        const missing = required.filter((k) => !data[k]);
        if (missing.length) {
            throw new Error(`Missing parameters: ${missing.join(', ')}`);
        }
    },
    validateLocation(location, allowed) {
        if (!allowed.includes(location)) {
            throw new Error(`Invalid location: ${location}. Valid options: ${allowed.join(', ')}`);
        }
    },
};
// Create a handler wrapper to standardize error handling
function createHandler(handlerFn) {
    return async (event) => {
        try {
            return await handlerFn(event);
        }
        catch (err) {
            console.error('❌ Error in route handler:', err);
            return (0, response_1.default)(err.statusCode || 500, err.message);
        }
    };
}
// Define GET routes
const getRoutes = {
    '/getBodegaEggs': createHandler(async () => {
        return await boxes_1.default.read.getBoxesByLocation(LOCATIONS.BODEGA);
    }),
    '/getPackingData': createHandler(async () => {
        return await boxes_1.default.read.getBoxesByLocation(LOCATIONS.PACKING);
    }),
    '/getVentaData': createHandler(async () => {
        return await boxes_1.default.read.getBoxesByLocation(LOCATIONS.VENTA);
    }),
    '/getEggsByDate': createHandler(async (event) => {
        const { date } = helpers.getQueryParams(event);
        helpers.validateRequired({ date }, ['date']);
        return await boxes_1.default.read.getBoxesByDate(date);
    }),
    '/production': createHandler(async () => {
        return await boxes_1.default.read.getAllBoxes();
    }),
    '/getPallets': createHandler(async () => {
        return await pallets_1.default.read.getAllPallets();
    }),
    '/getActivePallets': createHandler(async () => {
        return await pallets_1.default.read.getActivePallets();
    }),
    '/getClosedPallets': createHandler(async (event) => {
        const { ubicacion } = helpers.getQueryParams(event);
        return await pallets_1.default.read.getClosedPallets(ubicacion);
    }),
    '/getEggsByCodigo': createHandler(async (event) => {
        const { codigo } = helpers.getQueryParams(event);
        helpers.validateRequired({ codigo }, ['codigo']);
        return event;
    }),
    '/getUnassignedBoxesInPacking': createHandler(async () => {
        return await boxes_1.default.read.getUnassignedBoxesInPacking();
    }),
    '/admin/dashboard': createHandler(async () => {
        return await admin_1.default.getSystemDashboard();
    }),
    '/admin/issues': createHandler(async (event) => {
        const { status, startDate, endDate } = helpers.getQueryParams(event);
        const result = await (0, read_1.getIssues)({ status: status, startDate, endDate });
        return (0, response_1.default)(200, 'Issues fetched successfully', result);
    }),
};
// Define POST routes
const postRoutes = {
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
    '/AssignPallet': createHandler(async (event) => {
        const { codigo } = helpers.parseBody(event);
        helpers.validateRequired({ codigo }, ['codigo']);
        await assignPallet(codigo);
        await setSystemConfig('ACTIVE_PALLET_CODE', codigo);
        return (0, response_1.default)(200, 'Pallet assigned successfully', { palletCode: codigo });
    }),
    '/AssignBoxToPallet': createHandler(async (event) => {
        const { codigo, customInfo } = helpers.parseBody(event);
        helpers.validateRequired({ codigo }, ['codigo']);
        const pallet = await getSystemConfig('ACTIVE_PALLET_CODE');
        if (!pallet) {
            throw { statusCode: 400, message: 'No active pallet found. Please assign one.' };
        }
        return await (0, registerBox_1.default)(codigo, pallet, customInfo);
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
        return await (0, update_1.updateIssueStatus)(issueId, status, resolution);
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
        return await (0, update_1.updateIssueStatus)(issueId, status, resolution);
    }),
    '/admin/issues/update-status': createHandler(async (event) => {
        const { issueId, status, resolution } = JSON.parse(event.body || '{}');
        if (!issueId || !status) {
            return (0, response_1.default)(400, 'Faltan campos requeridos: issueId y status son obligatorios');
        }
        return await (0, update_1.updateIssueStatus)(issueId, status, resolution);
    }),
    '/admin/issues/delete': createHandler(async (event) => {
        const { issueId } = JSON.parse(event.body || '{}');
        if (!issueId) {
            return (0, response_1.default)(400, 'Falta el campo requerido: issueId es obligatorio');
        }
        return await (0, delete_1.default)(issueId);
    }),
};
// Define PUT routes
const putRoutes = {
    '/admin/issues/{issueId}/status': createHandler(async (event) => {
        var _a;
        let issueId;
        if ((_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a.issueId) {
            issueId = event.pathParameters.issueId;
        }
        else {
            const parts = event.path.split('/');
            const idx = parts.indexOf('issues');
            if (idx >= 0 && idx + 1 < parts.length) {
                issueId = parts[idx + 1];
            }
        }
        if (!issueId) {
            return (0, response_1.default)(400, 'Missing issueId in path');
        }
        const { status, resolution } = helpers.parseBody(event);
        helpers.validateRequired({ status }, ['status']);
        return await (0, update_1.updateIssueStatus)(issueId, status, resolution);
    }),
    '/admin/issues': createHandler(async (event) => {
        if (event.path.includes('/status')) {
            const parts = event.path.split('/');
            const idx = parts.indexOf('issues');
            if (idx >= 0 && idx + 1 < parts.length) {
                const issueId = parts[idx + 1];
                const { status, resolution } = helpers.parseBody(event);
                helpers.validateRequired({ status }, ['status']);
                return await (0, update_1.updateIssueStatus)(issueId, status, resolution);
            }
        }
        return (0, response_1.default)(404, `Route not found for PUT: ${event.path}`);
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
const handler = async (event, context) => {
    var _a, _b, _c, _d;
    // CodePipeline integration
    if (event['CodePipeline.job']) {
        const jobId = event['CodePipeline.job'].id;
        try {
            await codepipeline.putJobSuccessResult({ jobId }).promise();
        }
        catch (err) {
            console.error('❌ Error en CodePipeline:', err);
            await codepipeline.putJobFailureResult({
                jobId,
                failureDetails: {
                    message: JSON.stringify(err.message),
                    type: 'JobFailed',
                    externalExecutionId: context.awsRequestId,
                },
            }).promise();
        }
        return;
    }
    try {
        console.log('Event received:', {
            method: event.httpMethod || ((_b = (_a = event.requestContext) === null || _a === void 0 ? void 0 : _a.http) === null || _b === void 0 ? void 0 : _b.method),
            path: event.rawPath || event.path,
            queryParams: event.queryStringParameters,
            pathParams: event.pathParameters,
        });
        const method = event.httpMethod || ((_d = (_c = event.requestContext) === null || _c === void 0 ? void 0 : _c.http) === null || _d === void 0 ? void 0 : _d.method);
        const path = event.rawPath || event.path;
        if (!method || !path) {
            return (0, response_1.default)(400, 'Invalid request: missing method or path');
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
            return (0, response_1.default)(405, `Method not supported: ${method}`);
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
            return (0, response_1.default)(404, `Route not found: ${path}`);
        }
        return await routeHandler(event);
    }
    catch (err) {
        console.error('❌ Unhandled error:', err);
        return (0, response_1.default)(500, 'Internal server error', { error: err.message });
    }
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx5RUFBaUQ7QUFDakQsb0VBQXNEO0FBQ3RELGdFQUFrRDtBQUNsRCxnRUFBa0Q7QUFDbEQsZ0VBQWlEO0FBQ2pELDZDQUErQjtBQUUvQix5RUFBaUQ7QUFDakQsaUVBQXlDO0FBQ3pDLG9EQUFzRDtBQUN0RCx3REFBNEY7QUFDNUYseUVBQXNEO0FBRXRELE1BQU0sWUFBWSxHQUFHLElBQUksR0FBRyxDQUFDLFlBQVksRUFBRSxDQUFDO0FBRTVDLHdCQUF3QjtBQUN4QixNQUFNLFNBQVMsR0FBRyxzQkFBWSxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQzlDLE1BQU0sVUFBVSxHQUFHLHNCQUFZLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDL0MsTUFBTSxNQUFNLEdBQUcsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLENBQUM7QUFFekMsdUVBQXVFO0FBQ3ZFLEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxLQUFVO0lBQ3hDLE9BQU8sSUFBQSxrQkFBaUIsRUFBQyxHQUFHLEVBQUUscUJBQXFCLENBQUMsQ0FBQztBQUN2RCxDQUFDO0FBQ0QsS0FBSyxVQUFVLFlBQVksQ0FBQyxJQUFZO0lBQ3RDLE9BQU8sSUFBQSxrQkFBaUIsRUFBQyxHQUFHLEVBQUUscUJBQXFCLENBQUMsQ0FBQztBQUN2RCxDQUFDO0FBQ0QsS0FBSyxVQUFVLFNBQVMsQ0FBQyxXQUFtQjtJQUMxQyxPQUFPLElBQUEsa0JBQWlCLEVBQUMsR0FBRyxFQUFFLHFCQUFxQixDQUFDLENBQUM7QUFDdkQsQ0FBQztBQUNELEtBQUssVUFBVSxlQUFlO0lBQzVCLE9BQU8sSUFBQSxrQkFBaUIsRUFBQyxHQUFHLEVBQUUscUJBQXFCLENBQUMsQ0FBQztBQUN2RCxDQUFDO0FBQ0QsS0FBSyxVQUFVLFVBQVU7SUFD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Q2xCLEtBQUssTUFBTSxTQUFTLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO2dCQUM1QyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO29CQUN6RixZQUFZLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUNqQyxNQUFNO2dCQUNSLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztRQUNELElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNsQixPQUFPLElBQUEsa0JBQWlCLEVBQUMsR0FBRyxFQUFFLG9CQUFvQixJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzVELENBQUM7UUFFRCxPQUFPLE1BQU0sWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN6QyxPQUFPLElBQUEsa0JBQWlCLEVBQUMsR0FBRyxFQUFFLHVCQUF1QixFQUFFLEVBQUUsS0FBSyxFQUFHLEdBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQzVGLENBQUM7QUFDSCxDQUFDLENBQUM7QUExRlcsUUFBQSxPQUFPLFdBMEZsQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTeXN0ZW1Db25maWcgZnJvbSAnLi9tb2RlbHMvU3lzdGVtQ29uZmlnJztcbmltcG9ydCBwYWxsZXRzQ29udHJvbGxlciBmcm9tICcuL2NvbnRyb2xsZXJzL3BhbGxldHMnO1xuaW1wb3J0IGJveGVzQ29udHJvbGxlciBmcm9tICcuL2NvbnRyb2xsZXJzL2JveGVzJztcbmltcG9ydCBhZG1pbkNvbnRyb2xsZXIgZnJvbSAnLi9jb250cm9sbGVycy9hZG1pbic7XG5pbXBvcnQgY3JlYXRlQXBpUmVzcG9uc2UgZnJvbSAnLi91dGlscy9yZXNwb25zZSc7XG5pbXBvcnQgKiBhcyBBV1MgZnJvbSAnYXdzLXNkayc7XG5cbmltcG9ydCByZWdpc3RlckJveCBmcm9tICcuL2hhbmRsZXJzL3JlZ2lzdGVyQm94JztcbmltcG9ydCBtb3ZlQm94IGZyb20gJy4vaGFuZGxlcnMvbW92ZUJveCc7XG5pbXBvcnQgeyBnZXRJc3N1ZXMgfSBmcm9tICcuL2NvbnRyb2xsZXJzL2lzc3Vlcy9yZWFkJztcbmltcG9ydCB7IHVwZGF0ZUlzc3VlU3RhdHVzIGFzIHVwZGF0ZUlzc3VlU3RhdHVzSGFuZGxlciB9IGZyb20gJy4vY29udHJvbGxlcnMvaXNzdWVzL3VwZGF0ZSc7XG5pbXBvcnQgZGVsZXRlSXNzdWUgZnJvbSAnLi9jb250cm9sbGVycy9pc3N1ZXMvZGVsZXRlJztcbmltcG9ydCB7IElzc3VlU3RhdHVzIH0gZnJvbSAnLi90eXBlcyc7XG5jb25zdCBjb2RlcGlwZWxpbmUgPSBuZXcgQVdTLkNvZGVQaXBlbGluZSgpO1xuXG4vLyBDb25zdGFudHMgZnJvbSBtb2RlbHNcbmNvbnN0IExPQ0FUSU9OUyA9IFN5c3RlbUNvbmZpZy5nZXRMb2NhdGlvbnMoKTtcbmNvbnN0IElURU1fVFlQRVMgPSBTeXN0ZW1Db25maWcuZ2V0SXRlbVR5cGVzKCk7XG5jb25zdCBDT05GSUcgPSB7IExPQ0FUSU9OUywgSVRFTV9UWVBFUyB9O1xuXG4vLyBQbGFjZWhvbGRlciBpbXBsZW1lbnRhdGlvbnMgKHJlcGxhY2Ugd2l0aCByZWFsIG9uZXMgd2hlcmUgYXZhaWxhYmxlKVxuYXN5bmMgZnVuY3Rpb24gZ2V0Qm94ZXNJblBhbGxldChldmVudDogYW55KSB7XG4gIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSg1MDEsICdOb3QgaW1wbGVtZW50ZWQgeWV0Jyk7XG59XG5hc3luYyBmdW5jdGlvbiBnZXRCb3hCeUNvZGUoY29kZTogc3RyaW5nKSB7XG4gIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSg1MDEsICdOb3QgaW1wbGVtZW50ZWQgeWV0Jyk7XG59XG5hc3luYyBmdW5jdGlvbiBwb3N0SXNzdWUoZGVzY3JpcGNpb246IHN0cmluZykge1xuICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoNTAxLCAnTm90IGltcGxlbWVudGVkIHlldCcpO1xufVxuYXN5bmMgZnVuY3Rpb24gYXVkaXRBbmRGaXhEYXRhKCkge1xuICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoNTAxLCAnTm90IGltcGxlbWVudGVkIHlldCcpO1xufVxuYXN5bmMgZnVuY3Rpb24gYmFja3VwRGF0YSgpIHtcbiAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDUwMSwgJ05vdCBpbXBsZW1lbnRlZCB5ZXQnKTtcbn1cbmFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlUmVwb3J0SGFuZGxlcihldmVudDogYW55KSB7XG4gIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSg1MDEsICdOb3QgaW1wbGVtZW50ZWQgeWV0Jyk7XG59XG5hc3luYyBmdW5jdGlvbiBnZW5lcmF0ZUV4Y2VsUmVwb3J0SGFuZGxlcihldmVudDogYW55KSB7XG4gIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSg1MDEsICdOb3QgaW1wbGVtZW50ZWQgeWV0Jyk7XG59XG5hc3luYyBmdW5jdGlvbiBnZW5lcmF0ZUN1c3RvbVJlcG9ydEhhbmRsZXIoZXZlbnQ6IGFueSkge1xuICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoNTAxLCAnTm90IGltcGxlbWVudGVkIHlldCcpO1xufVxuYXN5bmMgZnVuY3Rpb24gZGVsZXRlQm94KGNvZGU6IHN0cmluZykge1xuICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoNTAxLCAnTm90IGltcGxlbWVudGVkIHlldCcpO1xufVxuYXN5bmMgZnVuY3Rpb24gZGVsZXRlUGFsbGV0KGNvZGU6IHN0cmluZykge1xuICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoNTAxLCAnTm90IGltcGxlbWVudGVkIHlldCcpO1xufVxuYXN5bmMgZnVuY3Rpb24gbW92ZVBhbGxldChjb2RlOiBzdHJpbmcsIGxvY2F0aW9uOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDUwMSwgJ05vdCBpbXBsZW1lbnRlZCB5ZXQnKTtcbn1cbmFzeW5jIGZ1bmN0aW9uIGNsb3NlUGFsbGV0KGNvZGU6IHN0cmluZykge1xuICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoNTAxLCAnTm90IGltcGxlbWVudGVkIHlldCcpO1xufVxuYXN5bmMgZnVuY3Rpb24gY3JlYXRlUGFsbGV0KGNvZGU6IHN0cmluZykge1xuICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoNTAxLCAnTm90IGltcGxlbWVudGVkIHlldCcpO1xufVxuYXN5bmMgZnVuY3Rpb24gdXBkYXRlQm94RGVzY3JpcHRpb24oY29kZTogc3RyaW5nLCBkZXNjcmlwdGlvbjogc3RyaW5nKSB7XG4gIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSg1MDEsICdOb3QgaW1wbGVtZW50ZWQgeWV0Jyk7XG59XG5hc3luYyBmdW5jdGlvbiBhc3NpZ25QYWxsZXQoY29kZTogc3RyaW5nKSB7XG4gIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSg1MDEsICdOb3QgaW1wbGVtZW50ZWQgeWV0Jyk7XG59XG5hc3luYyBmdW5jdGlvbiBzZXRTeXN0ZW1Db25maWcoa2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDUwMSwgJ05vdCBpbXBsZW1lbnRlZCB5ZXQnKTtcbn1cbmFzeW5jIGZ1bmN0aW9uIGdldFN5c3RlbUNvbmZpZyhrZXk6IHN0cmluZykge1xuICByZXR1cm4gbnVsbDtcbn1cblxuLy8gSGVscGVyIGZ1bmN0aW9uc1xuY29uc3QgaGVscGVycyA9IHtcbiAgcGFyc2VCb2R5KGV2ZW50OiBhbnkpOiBhbnkge1xuICAgIGlmICghZXZlbnQuYm9keSkgcmV0dXJuIHt9O1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gdHlwZW9mIGV2ZW50LmJvZHkgPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZShldmVudC5ib2R5KSA6IGV2ZW50LmJvZHk7XG4gICAgfSBjYXRjaCB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcmVxdWVzdCBib2R5OiB1bmFibGUgdG8gcGFyc2UgSlNPTicpO1xuICAgIH1cbiAgfSxcbiAgZ2V0UXVlcnlQYXJhbXMoZXZlbnQ6IGFueSk6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4ge1xuICAgIHJldHVybiBldmVudC5xdWVyeVN0cmluZ1BhcmFtZXRlcnMgfHwge307XG4gIH0sXG4gIHZhbGlkYXRlUmVxdWlyZWQoZGF0YTogUmVjb3JkPHN0cmluZywgYW55PiwgcmVxdWlyZWQ6IHN0cmluZ1tdKSB7XG4gICAgY29uc3QgbWlzc2luZyA9IHJlcXVpcmVkLmZpbHRlcigoaykgPT4gIWRhdGFba10pO1xuICAgIGlmIChtaXNzaW5nLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBNaXNzaW5nIHBhcmFtZXRlcnM6ICR7bWlzc2luZy5qb2luKCcsICcpfWApO1xuICAgIH1cbiAgfSxcbiAgdmFsaWRhdGVMb2NhdGlvbihsb2NhdGlvbjogc3RyaW5nLCBhbGxvd2VkOiBzdHJpbmdbXSkge1xuICAgIGlmICghYWxsb3dlZC5pbmNsdWRlcyhsb2NhdGlvbikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBsb2NhdGlvbjogJHtsb2NhdGlvbn0uIFZhbGlkIG9wdGlvbnM6ICR7YWxsb3dlZC5qb2luKCcsICcpfWApO1xuICAgIH1cbiAgfSxcbn07XG5cbi8vIENyZWF0ZSBhIGhhbmRsZXIgd3JhcHBlciB0byBzdGFuZGFyZGl6ZSBlcnJvciBoYW5kbGluZ1xuZnVuY3Rpb24gY3JlYXRlSGFuZGxlcihcbiAgaGFuZGxlckZuOiAoZXZlbnQ6IGFueSkgPT4gUHJvbWlzZTxhbnk+XG4pIHtcbiAgcmV0dXJuIGFzeW5jIChldmVudDogYW55KSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVyRm4oZXZlbnQpO1xuICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICBjb25zb2xlLmVycm9yKCfinYwgRXJyb3IgaW4gcm91dGUgaGFuZGxlcjonLCBlcnIpO1xuICAgICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKGVyci5zdGF0dXNDb2RlIHx8IDUwMCwgZXJyLm1lc3NhZ2UpO1xuICAgIH1cbiAgfTtcbn1cblxuLy8gRGVmaW5lIEdFVCByb3V0ZXNcbmNvbnN0IGdldFJvdXRlczogUmVjb3JkPHN0cmluZywgKGV2ZW50OiBhbnkpID0+IFByb21pc2U8YW55Pj4gPSB7XG4gICcvZ2V0Qm9kZWdhRWdncyc6IGNyZWF0ZUhhbmRsZXIoYXN5bmMgKCkgPT4ge1xuICAgIHJldHVybiBhd2FpdCBib3hlc0NvbnRyb2xsZXIucmVhZC5nZXRCb3hlc0J5TG9jYXRpb24oTE9DQVRJT05TLkJPREVHQSk7XG4gIH0pLFxuICAnL2dldFBhY2tpbmdEYXRhJzogY3JlYXRlSGFuZGxlcihhc3luYyAoKSA9PiB7XG4gICAgcmV0dXJuIGF3YWl0IGJveGVzQ29udHJvbGxlci5yZWFkLmdldEJveGVzQnlMb2NhdGlvbihMT0NBVElPTlMuUEFDS0lORyk7XG4gIH0pLFxuICAnL2dldFZlbnRhRGF0YSc6IGNyZWF0ZUhhbmRsZXIoYXN5bmMgKCkgPT4ge1xuICAgIHJldHVybiBhd2FpdCBib3hlc0NvbnRyb2xsZXIucmVhZC5nZXRCb3hlc0J5TG9jYXRpb24oTE9DQVRJT05TLlZFTlRBKTtcbiAgfSksXG4gICcvZ2V0RWdnc0J5RGF0ZSc6IGNyZWF0ZUhhbmRsZXIoYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgeyBkYXRlIH0gPSBoZWxwZXJzLmdldFF1ZXJ5UGFyYW1zKGV2ZW50KTtcbiAgICBoZWxwZXJzLnZhbGlkYXRlUmVxdWlyZWQoeyBkYXRlIH0sIFsnZGF0ZSddKTtcbiAgICByZXR1cm4gYXdhaXQgYm94ZXNDb250cm9sbGVyLnJlYWQuZ2V0Qm94ZXNCeURhdGUoZGF0ZSk7XG4gIH0pLFxuICAnL3Byb2R1Y3Rpb24nOiBjcmVhdGVIYW5kbGVyKGFzeW5jICgpID0+IHtcbiAgICByZXR1cm4gYXdhaXQgYm94ZXNDb250cm9sbGVyLnJlYWQuZ2V0QWxsQm94ZXMoKTtcbiAgfSksXG4gICcvZ2V0UGFsbGV0cyc6IGNyZWF0ZUhhbmRsZXIoYXN5bmMgKCkgPT4ge1xuICAgIHJldHVybiBhd2FpdCBwYWxsZXRzQ29udHJvbGxlci5yZWFkLmdldEFsbFBhbGxldHMoKTtcbiAgfSksXG4gICcvZ2V0QWN0aXZlUGFsbGV0cyc6IGNyZWF0ZUhhbmRsZXIoYXN5bmMgKCkgPT4ge1xuICAgIHJldHVybiBhd2FpdCBwYWxsZXRzQ29udHJvbGxlci5yZWFkLmdldEFjdGl2ZVBhbGxldHMoKTtcbiAgfSksXG4gICcvZ2V0Q2xvc2VkUGFsbGV0cyc6IGNyZWF0ZUhhbmRsZXIoYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgeyB1YmljYWNpb24gfSA9IGhlbHBlcnMuZ2V0UXVlcnlQYXJhbXMoZXZlbnQpO1xuICAgIHJldHVybiBhd2FpdCBwYWxsZXRzQ29udHJvbGxlci5yZWFkLmdldENsb3NlZFBhbGxldHModWJpY2FjaW9uKTtcbiAgfSksXG4gICcvZ2V0RWdnc0J5Q29kaWdvJzogY3JlYXRlSGFuZGxlcihhc3luYyAoZXZlbnQpID0+IHtcbiAgICBjb25zdCB7IGNvZGlnbyB9ID0gaGVscGVycy5nZXRRdWVyeVBhcmFtcyhldmVudCk7XG4gICAgaGVscGVycy52YWxpZGF0ZVJlcXVpcmVkKHsgY29kaWdvIH0sIFsnY29kaWdvJ10pO1xuICAgIHJldHVybiBldmVudDtcbiAgfSksXG4gICcvZ2V0VW5hc3NpZ25lZEJveGVzSW5QYWNraW5nJzogY3JlYXRlSGFuZGxlcihhc3luYyAoKSA9PiB7XG4gICAgcmV0dXJuIGF3YWl0IGJveGVzQ29udHJvbGxlci5yZWFkLmdldFVuYXNzaWduZWRCb3hlc0luUGFja2luZygpO1xuICB9KSxcbiAgJy9hZG1pbi9kYXNoYm9hcmQnOiBjcmVhdGVIYW5kbGVyKGFzeW5jICgpID0+IHtcbiAgICByZXR1cm4gYXdhaXQgYWRtaW5Db250cm9sbGVyLmdldFN5c3RlbURhc2hib2FyZCgpO1xuICB9KSxcbiAgJy9hZG1pbi9pc3N1ZXMnOiBjcmVhdGVIYW5kbGVyKGFzeW5jIChldmVudCkgPT4ge1xuICAgIGNvbnN0IHsgc3RhdHVzLCBzdGFydERhdGUsIGVuZERhdGUgfSA9IGhlbHBlcnMuZ2V0UXVlcnlQYXJhbXMoZXZlbnQpO1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGdldElzc3Vlcyh7IHN0YXR1czogc3RhdHVzIGFzIElzc3VlU3RhdHVzLCBzdGFydERhdGUsIGVuZERhdGUgfSk7XG4gICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDIwMCwgJ0lzc3VlcyBmZXRjaGVkIHN1Y2Nlc3NmdWxseScsIHJlc3VsdCk7XG4gIH0pLFxufTtcblxuLy8gRGVmaW5lIFBPU1Qgcm91dGVzXG5jb25zdCBwb3N0Um91dGVzOiBSZWNvcmQ8c3RyaW5nLCAoZXZlbnQ6IGFueSkgPT4gUHJvbWlzZTxhbnk+PiA9IHtcbiAgJy9wcm9jZXNhci1lc2NhbmVvJzogY3JlYXRlSGFuZGxlcihhc3luYyAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBkYXRhID0gaGVscGVycy5wYXJzZUJvZHkoZXZlbnQpO1xuICAgIGxldCB7IGNvZGlnbywgdWJpY2FjaW9uLCB0aXBvLCBwYWxsZXRDb2RpZ28sIHNjYW5uZWRDb2RlcyB9ID0gZGF0YTtcbiAgICBoZWxwZXJzLnZhbGlkYXRlUmVxdWlyZWQoZGF0YSwgWydjb2RpZ28nLCAndWJpY2FjaW9uJ10pO1xuICAgIGhlbHBlcnMudmFsaWRhdGVMb2NhdGlvbih1YmljYWNpb24sIE9iamVjdC52YWx1ZXMoQ09ORklHLkxPQ0FUSU9OUykpO1xuICAgIGlmICghdGlwbykge1xuICAgICAgdGlwbyA9IGNvZGlnby5sZW5ndGggPT09IDE1ID8gQ09ORklHLklURU1fVFlQRVMuQk9YIDogQ09ORklHLklURU1fVFlQRVMuUEFMTEVUO1xuICAgIH1cbiAgICBpZiAodGlwbyA9PT0gQ09ORklHLklURU1fVFlQRVMuUEFMTEVUKSB7XG4gICAgICBpZiAodWJpY2FjaW9uID09PSBDT05GSUcuTE9DQVRJT05TLlBBQ0tJTkcpIHtcbiAgICAgICAgdGhyb3cgeyBzdGF0dXNDb2RlOiA0MDAsIG1lc3NhZ2U6ICdQYWxsZXRzIGNhbm5vdCBiZSBtb3ZlZCB0byBQQUNLSU5HIGRpcmVjdGx5LicgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhd2FpdCBtb3ZlUGFsbGV0KGNvZGlnbywgdWJpY2FjaW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHViaWNhY2lvbiA9PT0gQ09ORklHLkxPQ0FUSU9OUy5QQUNLSU5HKSB7XG4gICAgICAgIHJldHVybiBwYWxsZXRDb2RpZ29cbiAgICAgICAgICA/IGF3YWl0IHJlZ2lzdGVyQm94KGNvZGlnbywgcGFsbGV0Q29kaWdvLCBwYWxsZXRDb2RpZ28sIHNjYW5uZWRDb2RlcylcbiAgICAgICAgICA6IGF3YWl0IHJlZ2lzdGVyQm94KGNvZGlnbyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYXdhaXQgbW92ZUJveChjb2RpZ28sIHViaWNhY2lvbik7XG4gICAgICB9XG4gICAgfVxuICB9KSxcbiAgJy9Bc3NpZ25QYWxsZXQnOiBjcmVhdGVIYW5kbGVyKGFzeW5jIChldmVudCkgPT4ge1xuICAgIGNvbnN0IHsgY29kaWdvIH0gPSBoZWxwZXJzLnBhcnNlQm9keShldmVudCk7XG4gICAgaGVscGVycy52YWxpZGF0ZVJlcXVpcmVkKHsgY29kaWdvIH0sIFsnY29kaWdvJ10pO1xuICAgIGF3YWl0IGFzc2lnblBhbGxldChjb2RpZ28pO1xuICAgIGF3YWl0IHNldFN5c3RlbUNvbmZpZygnQUNUSVZFX1BBTExFVF9DT0RFJywgY29kaWdvKTtcbiAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoMjAwLCAnUGFsbGV0IGFzc2lnbmVkIHN1Y2Nlc3NmdWxseScsIHsgcGFsbGV0Q29kZTogY29kaWdvIH0pO1xuICB9KSxcbiAgJy9Bc3NpZ25Cb3hUb1BhbGxldCc6IGNyZWF0ZUhhbmRsZXIoYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgeyBjb2RpZ28sIGN1c3RvbUluZm8gfSA9IGhlbHBlcnMucGFyc2VCb2R5KGV2ZW50KTtcbiAgICBoZWxwZXJzLnZhbGlkYXRlUmVxdWlyZWQoeyBjb2RpZ28gfSwgWydjb2RpZ28nXSk7XG4gICAgY29uc3QgcGFsbGV0ID0gYXdhaXQgZ2V0U3lzdGVtQ29uZmlnKCdBQ1RJVkVfUEFMTEVUX0NPREUnKTtcbiAgICBpZiAoIXBhbGxldCkge1xuICAgICAgdGhyb3cgeyBzdGF0dXNDb2RlOiA0MDAsIG1lc3NhZ2U6ICdObyBhY3RpdmUgcGFsbGV0IGZvdW5kLiBQbGVhc2UgYXNzaWduIG9uZS4nIH07XG4gICAgfVxuICAgIHJldHVybiBhd2FpdCByZWdpc3RlckJveChjb2RpZ28sIHBhbGxldCwgY3VzdG9tSW5mbyk7XG4gIH0pLFxuICAnL21vdmVQYWxsZXQnOiBjcmVhdGVIYW5kbGVyKGFzeW5jIChldmVudCkgPT4ge1xuICAgIGNvbnN0IHsgY29kaWdvLCB1YmljYWNpb24gfSA9IGhlbHBlcnMucGFyc2VCb2R5KGV2ZW50KTtcbiAgICBoZWxwZXJzLnZhbGlkYXRlUmVxdWlyZWQoeyBjb2RpZ28sIHViaWNhY2lvbiB9LCBbJ2NvZGlnbycsICd1YmljYWNpb24nXSk7XG4gICAgaGVscGVycy52YWxpZGF0ZUxvY2F0aW9uKHViaWNhY2lvbiwgWydUUkFOU0lUTycsICdCT0RFR0EnLCAnVkVOVEEnXSk7XG4gICAgcmV0dXJuIGF3YWl0IG1vdmVQYWxsZXQoY29kaWdvLCB1YmljYWNpb24pO1xuICB9KSxcbiAgJy9jbG9zZVBhbGxldCc6IGNyZWF0ZUhhbmRsZXIoYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgeyBjb2RpZ28gfSA9IGhlbHBlcnMucGFyc2VCb2R5KGV2ZW50KTtcbiAgICBoZWxwZXJzLnZhbGlkYXRlUmVxdWlyZWQoeyBjb2RpZ28gfSwgWydjb2RpZ28nXSk7XG4gICAgcmV0dXJuIGF3YWl0IGNsb3NlUGFsbGV0KGNvZGlnbyk7XG4gIH0pLFxuICAnL2NyZWF0ZVBhbGxldCc6IGNyZWF0ZUhhbmRsZXIoYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgeyBjb2RpZ28gfSA9IGhlbHBlcnMucGFyc2VCb2R5KGV2ZW50KTtcbiAgICBoZWxwZXJzLnZhbGlkYXRlUmVxdWlyZWQoeyBjb2RpZ28gfSwgWydjb2RpZ28nXSk7XG4gICAgcmV0dXJuIGF3YWl0IGNyZWF0ZVBhbGxldChjb2RpZ28pO1xuICB9KSxcbiAgJy91cGRhdGVCb3hEZXNjcmlwdGlvbic6IGNyZWF0ZUhhbmRsZXIoYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgeyBjb2RpZ28sIGN1c3RvbUluZm8gfSA9IGhlbHBlcnMucGFyc2VCb2R5KGV2ZW50KTtcbiAgICBoZWxwZXJzLnZhbGlkYXRlUmVxdWlyZWQoeyBjb2RpZ28sIGN1c3RvbUluZm8gfSwgWydjb2RpZ28nLCAnY3VzdG9tSW5mbyddKTtcbiAgICByZXR1cm4gYXdhaXQgdXBkYXRlQm94RGVzY3JpcHRpb24oY29kaWdvLCBjdXN0b21JbmZvKTtcbiAgfSksXG4gICcvZ2V0Qm94ZXNJblBhbGxldCc6IGNyZWF0ZUhhbmRsZXIoZ2V0Qm94ZXNJblBhbGxldCksXG4gICcvZ2V0Qm94QnlDb2RlJzogY3JlYXRlSGFuZGxlcihhc3luYyAoZXZlbnQpID0+IHtcbiAgICBjb25zdCB7IGNvZGlnbyB9ID0gaGVscGVycy5wYXJzZUJvZHkoZXZlbnQpO1xuICAgIGhlbHBlcnMudmFsaWRhdGVSZXF1aXJlZCh7IGNvZGlnbyB9LCBbJ2NvZGlnbyddKTtcbiAgICByZXR1cm4gYXdhaXQgZ2V0Qm94QnlDb2RlKGNvZGlnbyk7XG4gIH0pLFxuICAnL3Bvc3RJc3N1ZSc6IGNyZWF0ZUhhbmRsZXIoYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgeyBkZXNjcmlwY2lvbiB9ID0gaGVscGVycy5wYXJzZUJvZHkoZXZlbnQpO1xuICAgIHJldHVybiBhd2FpdCBwb3N0SXNzdWUoZGVzY3JpcGNpb24pO1xuICB9KSxcbiAgJy9hZG1pbi91cGRhdGVJc3N1ZVN0YXR1cyc6IGNyZWF0ZUhhbmRsZXIoYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgeyBpc3N1ZUlkLCBzdGF0dXMsIHJlc29sdXRpb24gfSA9IGhlbHBlcnMucGFyc2VCb2R5KGV2ZW50KTtcbiAgICBoZWxwZXJzLnZhbGlkYXRlUmVxdWlyZWQoeyBpc3N1ZUlkLCBzdGF0dXMgfSwgWydpc3N1ZUlkJywgJ3N0YXR1cyddKTtcbiAgICByZXR1cm4gYXdhaXQgdXBkYXRlSXNzdWVTdGF0dXNIYW5kbGVyKGlzc3VlSWQsIHN0YXR1cywgcmVzb2x1dGlvbik7XG4gIH0pLFxuICAnL2FkbWluL2F1ZGl0QW5kRml4JzogY3JlYXRlSGFuZGxlcihhdWRpdEFuZEZpeERhdGEpLFxuICAnL2FkbWluL2JhY2t1cCc6IGNyZWF0ZUhhbmRsZXIoYmFja3VwRGF0YSksXG4gICcvYWRtaW4vZ2VuZXJhdGVSZXBvcnQnOiBjcmVhdGVIYW5kbGVyKGdlbmVyYXRlUmVwb3J0SGFuZGxlciksXG4gICcvYWRtaW4vZ2VuZXJhdGVFeGNlbFJlcG9ydCc6IGNyZWF0ZUhhbmRsZXIoZ2VuZXJhdGVFeGNlbFJlcG9ydEhhbmRsZXIpLFxuICAnL2FkbWluL2dlbmVyYXRlQ3VzdG9tUmVwb3J0JzogY3JlYXRlSGFuZGxlcihnZW5lcmF0ZUN1c3RvbVJlcG9ydEhhbmRsZXIpLFxuICAnL2FkbWluL2RlbGV0ZUJveCc6IGNyZWF0ZUhhbmRsZXIoYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgeyBjb2RpZ28gfSA9IGhlbHBlcnMucGFyc2VCb2R5KGV2ZW50KTtcbiAgICBoZWxwZXJzLnZhbGlkYXRlUmVxdWlyZWQoeyBjb2RpZ28gfSwgWydjb2RpZ28nXSk7XG4gICAgcmV0dXJuIGF3YWl0IGRlbGV0ZUJveChjb2RpZ28pO1xuICB9KSxcbiAgJy9hZG1pbi9kZWxldGVQYWxsZXQnOiBjcmVhdGVIYW5kbGVyKGFzeW5jIChldmVudCkgPT4ge1xuICAgIGNvbnN0IHsgY29kaWdvIH0gPSBoZWxwZXJzLnBhcnNlQm9keShldmVudCk7XG4gICAgaGVscGVycy52YWxpZGF0ZVJlcXVpcmVkKHsgY29kaWdvIH0sIFsnY29kaWdvJ10pO1xuICAgIHJldHVybiBhd2FpdCBkZWxldGVQYWxsZXQoY29kaWdvKTtcbiAgfSksXG4gICcvYWRtaW4vaXNzdWVzL3tpc3N1ZUlkfS9zdGF0dXMnOiBjcmVhdGVIYW5kbGVyKGFzeW5jIChldmVudCkgPT4ge1xuICAgIGNvbnN0IHsgaXNzdWVJZCB9ID0gZXZlbnQucGF0aFBhcmFtZXRlcnMgfHwge307XG4gICAgY29uc3QgeyBzdGF0dXMsIHJlc29sdXRpb24gfSA9IGhlbHBlcnMucGFyc2VCb2R5KGV2ZW50KTtcbiAgICBoZWxwZXJzLnZhbGlkYXRlUmVxdWlyZWQoeyBpc3N1ZUlkLCBzdGF0dXMgfSwgWydpc3N1ZUlkJywgJ3N0YXR1cyddKTtcbiAgICByZXR1cm4gYXdhaXQgdXBkYXRlSXNzdWVTdGF0dXNIYW5kbGVyKGlzc3VlSWQsIHN0YXR1cywgcmVzb2x1dGlvbik7XG4gIH0pLFxuICAnL2FkbWluL2lzc3Vlcy91cGRhdGUtc3RhdHVzJzogY3JlYXRlSGFuZGxlcihhc3luYyAoZXZlbnQpID0+IHtcbiAgICBjb25zdCB7IGlzc3VlSWQsIHN0YXR1cywgcmVzb2x1dGlvbiB9ID0gSlNPTi5wYXJzZShldmVudC5ib2R5IHx8ICd7fScpO1xuICAgIGlmICghaXNzdWVJZCB8fCAhc3RhdHVzKSB7XG4gICAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoNDAwLCAnRmFsdGFuIGNhbXBvcyByZXF1ZXJpZG9zOiBpc3N1ZUlkIHkgc3RhdHVzIHNvbiBvYmxpZ2F0b3Jpb3MnKTtcbiAgICB9XG4gICAgcmV0dXJuIGF3YWl0IHVwZGF0ZUlzc3VlU3RhdHVzSGFuZGxlcihpc3N1ZUlkLCBzdGF0dXMsIHJlc29sdXRpb24pO1xuICB9KSxcbiAgJy9hZG1pbi9pc3N1ZXMvZGVsZXRlJzogY3JlYXRlSGFuZGxlcihhc3luYyAoZXZlbnQpID0+IHtcbiAgICBjb25zdCB7IGlzc3VlSWQgfSA9IEpTT04ucGFyc2UoZXZlbnQuYm9keSB8fCAne30nKTtcbiAgICBpZiAoIWlzc3VlSWQpIHtcbiAgICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSg0MDAsICdGYWx0YSBlbCBjYW1wbyByZXF1ZXJpZG86IGlzc3VlSWQgZXMgb2JsaWdhdG9yaW8nKTtcbiAgICB9XG4gICAgcmV0dXJuIGF3YWl0IGRlbGV0ZUlzc3VlKGlzc3VlSWQpO1xuICB9KSxcbn07XG5cbi8vIERlZmluZSBQVVQgcm91dGVzXG5jb25zdCBwdXRSb3V0ZXM6IFJlY29yZDxzdHJpbmcsIChldmVudDogYW55KSA9PiBQcm9taXNlPGFueT4+ID0ge1xuICAnL2FkbWluL2lzc3Vlcy97aXNzdWVJZH0vc3RhdHVzJzogY3JlYXRlSGFuZGxlcihhc3luYyAoZXZlbnQpID0+IHtcbiAgICBsZXQgaXNzdWVJZDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIGlmIChldmVudC5wYXRoUGFyYW1ldGVycz8uaXNzdWVJZCkge1xuICAgICAgaXNzdWVJZCA9IGV2ZW50LnBhdGhQYXJhbWV0ZXJzLmlzc3VlSWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHBhcnRzID0gZXZlbnQucGF0aC5zcGxpdCgnLycpO1xuICAgICAgY29uc3QgaWR4ID0gcGFydHMuaW5kZXhPZignaXNzdWVzJyk7XG4gICAgICBpZiAoaWR4ID49IDAgJiYgaWR4ICsgMSA8IHBhcnRzLmxlbmd0aCkge1xuICAgICAgICBpc3N1ZUlkID0gcGFydHNbaWR4ICsgMV07XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghaXNzdWVJZCkge1xuICAgICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDQwMCwgJ01pc3NpbmcgaXNzdWVJZCBpbiBwYXRoJyk7XG4gICAgfVxuICAgIGNvbnN0IHsgc3RhdHVzLCByZXNvbHV0aW9uIH0gPSBoZWxwZXJzLnBhcnNlQm9keShldmVudCk7XG4gICAgaGVscGVycy52YWxpZGF0ZVJlcXVpcmVkKHsgc3RhdHVzIH0sIFsnc3RhdHVzJ10pO1xuICAgIHJldHVybiBhd2FpdCB1cGRhdGVJc3N1ZVN0YXR1c0hhbmRsZXIoaXNzdWVJZCwgc3RhdHVzLCByZXNvbHV0aW9uKTtcbiAgfSksXG4gICcvYWRtaW4vaXNzdWVzJzogY3JlYXRlSGFuZGxlcihhc3luYyAoZXZlbnQpID0+IHtcbiAgICBpZiAoZXZlbnQucGF0aC5pbmNsdWRlcygnL3N0YXR1cycpKSB7XG4gICAgICBjb25zdCBwYXJ0cyA9IGV2ZW50LnBhdGguc3BsaXQoJy8nKTtcbiAgICAgIGNvbnN0IGlkeCA9IHBhcnRzLmluZGV4T2YoJ2lzc3VlcycpO1xuICAgICAgaWYgKGlkeCA+PSAwICYmIGlkeCArIDEgPCBwYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgaXNzdWVJZCA9IHBhcnRzW2lkeCArIDFdO1xuICAgICAgICBjb25zdCB7IHN0YXR1cywgcmVzb2x1dGlvbiB9ID0gaGVscGVycy5wYXJzZUJvZHkoZXZlbnQpO1xuICAgICAgICBoZWxwZXJzLnZhbGlkYXRlUmVxdWlyZWQoeyBzdGF0dXMgfSwgWydzdGF0dXMnXSk7XG4gICAgICAgIHJldHVybiBhd2FpdCB1cGRhdGVJc3N1ZVN0YXR1c0hhbmRsZXIoaXNzdWVJZCwgc3RhdHVzLCByZXNvbHV0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDQwNCwgYFJvdXRlIG5vdCBmb3VuZCBmb3IgUFVUOiAke2V2ZW50LnBhdGh9YCk7XG4gIH0pLFxufTtcblxuLy8gQ09SUyBwcmVmbGlnaHQgaGFuZGxlclxuY29uc3Qgb3B0aW9uc1JvdXRlcyA9IHtcbiAgJyonOiBhc3luYyAoKSA9PiAoe1xuICAgIHN0YXR1c0NvZGU6IDIwMCxcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnT1BUSU9OUyxHRVQsUE9TVCxQVVQsREVMRVRFJyxcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogJ0NvbnRlbnQtVHlwZSxBdXRob3JpemF0aW9uLFgtQW16LURhdGUsWC1BcGktS2V5JyxcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1NYXgtQWdlJzogJzg2NDAwJyxcbiAgICB9LFxuICAgIGJvZHk6ICcnLFxuICB9KSxcbn07XG5cbmV4cG9ydCBjb25zdCBoYW5kbGVyID0gYXN5bmMgKGV2ZW50OiBhbnksIGNvbnRleHQ6IGFueSk6IFByb21pc2U8YW55PiA9PiB7XG4gIC8vIENvZGVQaXBlbGluZSBpbnRlZ3JhdGlvblxuICBpZiAoZXZlbnRbJ0NvZGVQaXBlbGluZS5qb2InXSkge1xuICAgIGNvbnN0IGpvYklkID0gZXZlbnRbJ0NvZGVQaXBlbGluZS5qb2InXS5pZDtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgY29kZXBpcGVsaW5lLnB1dEpvYlN1Y2Nlc3NSZXN1bHQoeyBqb2JJZCB9KS5wcm9taXNlKCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCfinYwgRXJyb3IgZW4gQ29kZVBpcGVsaW5lOicsIGVycik7XG4gICAgICBhd2FpdCBjb2RlcGlwZWxpbmUucHV0Sm9iRmFpbHVyZVJlc3VsdCh7XG4gICAgICAgIGpvYklkLFxuICAgICAgICBmYWlsdXJlRGV0YWlsczoge1xuICAgICAgICAgIG1lc3NhZ2U6IEpTT04uc3RyaW5naWZ5KChlcnIgYXMgRXJyb3IpLm1lc3NhZ2UpLFxuICAgICAgICAgIHR5cGU6ICdKb2JGYWlsZWQnLFxuICAgICAgICAgIGV4dGVybmFsRXhlY3V0aW9uSWQ6IGNvbnRleHQuYXdzUmVxdWVzdElkLFxuICAgICAgICB9LFxuICAgICAgfSkucHJvbWlzZSgpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnNvbGUubG9nKCdFdmVudCByZWNlaXZlZDonLCB7XG4gICAgICBtZXRob2Q6IGV2ZW50Lmh0dHBNZXRob2QgfHwgZXZlbnQucmVxdWVzdENvbnRleHQ/Lmh0dHA/Lm1ldGhvZCxcbiAgICAgIHBhdGg6IGV2ZW50LnJhd1BhdGggfHwgZXZlbnQucGF0aCxcbiAgICAgIHF1ZXJ5UGFyYW1zOiBldmVudC5xdWVyeVN0cmluZ1BhcmFtZXRlcnMsXG4gICAgICBwYXRoUGFyYW1zOiBldmVudC5wYXRoUGFyYW1ldGVycyxcbiAgICB9KTtcblxuICAgIGNvbnN0IG1ldGhvZCA9IGV2ZW50Lmh0dHBNZXRob2QgfHwgZXZlbnQucmVxdWVzdENvbnRleHQ/Lmh0dHA/Lm1ldGhvZDtcbiAgICBjb25zdCBwYXRoID0gZXZlbnQucmF3UGF0aCB8fCBldmVudC5wYXRoO1xuICAgIGlmICghbWV0aG9kIHx8ICFwYXRoKSB7XG4gICAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoNDAwLCAnSW52YWxpZCByZXF1ZXN0OiBtaXNzaW5nIG1ldGhvZCBvciBwYXRoJyk7XG4gICAgfVxuICAgIGlmIChtZXRob2QgPT09ICdPUFRJT05TJykge1xuICAgICAgcmV0dXJuIGF3YWl0IG9wdGlvbnNSb3V0ZXNbJyonXSgpO1xuICAgIH1cblxuICAgIGNvbnN0IHJvdXRlcyA9IG1ldGhvZCA9PT0gJ0dFVCdcbiAgICAgID8gZ2V0Um91dGVzXG4gICAgICA6IG1ldGhvZCA9PT0gJ1BPU1QnXG4gICAgICA/IHBvc3RSb3V0ZXNcbiAgICAgIDogbWV0aG9kID09PSAnUFVUJ1xuICAgICAgPyBwdXRSb3V0ZXNcbiAgICAgIDogbnVsbDtcbiAgICBpZiAoIXJvdXRlcykge1xuICAgICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDQwNSwgYE1ldGhvZCBub3Qgc3VwcG9ydGVkOiAke21ldGhvZH1gKTtcbiAgICB9XG5cbiAgICBsZXQgcm91dGVIYW5kbGVyID0gcm91dGVzW3BhdGhdO1xuICAgIC8vIGZhbGxiYWNrIG1hdGNoaW5nIGZvciBwYXJhbWV0ZXJpemVkIHBhdGhzLi4uXG4gICAgaWYgKCFyb3V0ZUhhbmRsZXIgJiYgbWV0aG9kID09PSAnUFVUJyAmJiBwYXRoLmluY2x1ZGVzKCcvYWRtaW4vaXNzdWVzLycpICYmIHBhdGguaW5jbHVkZXMoJy9zdGF0dXMnKSkge1xuICAgICAgcm91dGVIYW5kbGVyID0gcHV0Um91dGVzWycvYWRtaW4vaXNzdWVzL3tpc3N1ZUlkfS9zdGF0dXMnXTtcbiAgICB9XG4gICAgaWYgKCFyb3V0ZUhhbmRsZXIpIHtcbiAgICAgIC8vIHRyeSBtYXRjaGluZyBge3BhcmFtfWAgcGF0dGVybnMuLi5cbiAgICAgIGZvciAoY29uc3Qgcm91dGVQYXRoIG9mIE9iamVjdC5rZXlzKHJvdXRlcykpIHtcbiAgICAgICAgaWYgKHJvdXRlUGF0aC5pbmNsdWRlcygneycpKSB7XG4gICAgICAgICAgbGV0IHBhdHRlcm4gPSByb3V0ZVBhdGgucmVwbGFjZSgvXFx7W159XStcXH0vZywgJyhbXi9dKyknKTtcbiAgICAgICAgICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAoYF4ke3BhdHRlcm59JGApO1xuICAgICAgICAgIGNvbnN0IG1hdGNoID0gcGF0aC5tYXRjaChyZWdleCk7XG4gICAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICBjb25zdCBuYW1lcyA9IEFycmF5LmZyb20ocm91dGVQYXRoLm1hdGNoQWxsKC9cXHsoW159XSspXFx9L2cpKS5tYXAobSA9PiBtWzFdKTtcbiAgICAgICAgICAgIGV2ZW50LnBhdGhQYXJhbWV0ZXJzID0ge307XG4gICAgICAgICAgICBuYW1lcy5mb3JFYWNoKChuLCBpKSA9PiB7XG4gICAgICAgICAgICAgIGV2ZW50LnBhdGhQYXJhbWV0ZXJzW25dID0gbWF0Y2hbaSArIDFdO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByb3V0ZUhhbmRsZXIgPSByb3V0ZXNbcm91dGVQYXRoXTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIXJvdXRlSGFuZGxlcikge1xuICAgICAgLy8gcHJlZml4IGZhbGxiYWNrXG4gICAgICBmb3IgKGNvbnN0IHJvdXRlUGF0aCBvZiBPYmplY3Qua2V5cyhyb3V0ZXMpKSB7XG4gICAgICAgIGlmICghcm91dGVQYXRoLmluY2x1ZGVzKCd7JykgJiYgKHBhdGggPT09IHJvdXRlUGF0aCB8fCBwYXRoLnN0YXJ0c1dpdGgocm91dGVQYXRoICsgJy8nKSkpIHtcbiAgICAgICAgICByb3V0ZUhhbmRsZXIgPSByb3V0ZXNbcm91dGVQYXRoXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIXJvdXRlSGFuZGxlcikge1xuICAgICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDQwNCwgYFJvdXRlIG5vdCBmb3VuZDogJHtwYXRofWApO1xuICAgIH1cblxuICAgIHJldHVybiBhd2FpdCByb3V0ZUhhbmRsZXIoZXZlbnQpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLmVycm9yKCfinYwgVW5oYW5kbGVkIGVycm9yOicsIGVycik7XG4gICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDUwMCwgJ0ludGVybmFsIHNlcnZlciBlcnJvcicsIHsgZXJyb3I6IChlcnIgYXMgRXJyb3IpLm1lc3NhZ2UgfSk7XG4gIH1cbn07XG4iXX0=