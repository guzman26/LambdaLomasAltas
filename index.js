const getEggs = require("./handlers/getEggs");
const getBodegaEggs = require("./handlers/getBodegaEggs");
const getPackingEggs = require("./handlers/getPackingEggs");
const getVentaEggs = require("./handlers/getVentaEggs");
const getEggByCodigo = require("./handlers/getEggsByCodigo");
const getEggsByDate = require("./handlers/getEggsByDate");
const registerEgg = require("./handlers/registerEgg");
const getPallets = require("./handlers/getPallets");
const { moveEgg } = require("./handlers/moveEgg");
const { movePallet } = require("./handlers/movePallet");
const createApiResponse = require("./utils/response");
const assignPallet = require("./handlers/assignPallet");
const addBoxToPallet = require("./handlers/addBoxToPallet");
const { setSystemConfig, getSystemConfig } = require("./handlers/systemConfig");
const closePallet = require("./handlers/closePallet");
const createPallet = require("./handlers/createPallet");
const updateBoxDescription = require("./handlers/updateBoxDescription");
const getActivePallets = require("./handlers/getActivePallets");
const getClosedPallets = require("./handlers/getClosedPallets");
const getBoxesInPallet = require("./handlers/getBoxesInPallet");
const getBoxByCode = require("./handlers/getBoxByCode");
const getUnassignedBoxesInPacking = require("./handlers/getUnassignedBoxesInPacking");
const postIssue = require("./handlers/postIssue");
const deleteBox = require("./handlers/deleteBox");
const deletePallet = require("./handlers/deletePallet");
const AWS = require('aws-sdk');
const codepipeline = new AWS.CodePipeline();

const { 
  getSystemDashboard, 
  getIssues,
  updateIssueStatus, 
  auditAndFixData, 
  backupData 
} = require("./handlers/admin");
const { generateReportHandler } = require("./handlers/generateReports");
const { generateExcelReportHandler, generateCustomReportHandler } = require("./handlers/generateExcelReports");

const CONFIG = {
  LOCATIONS: {
    PACKING: "PACKING",
    BODEGA: "BODEGA",
    VENTA: "VENTA",
    TRANSITO: "TRANSITO",
  },
  ITEM_TYPES: {
    BOX: "BOX",
    PALLET: "PALLET",
  },
};

const helpers = {
  parseBody: (event) => {
    if (!event.body) return {};
    try {
      return typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } catch {
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


const createHandler = (handlerFn, options = {}) => {
  return async (event) => {
    try {
      return await handlerFn(event, options);
    } catch (error) {
      console.error("❌ Error in route handler:", error);
      return createApiResponse(error.statusCode || 500, error.message);
    }
  };
};

const getRoutes = {
  "/getBodegaEggs": getBodegaEggs,
  "/getPackingData": getPackingEggs,
  "/getVentaData": getVentaEggs,
  "/getEggsByDate": getEggsByDate,
  "/production": getEggs,
  "/getPallets": getPallets,
  "/getActivePallets": createHandler(async () => {
    const result = await getActivePallets();
    return createApiResponse(200, "Active pallets fetched successfully", result);
  }),
  "/getClosedPallets": createHandler(async (event) => {
    const { ubicacion } = helpers.getQueryParams(event);
    const result = await getClosedPallets(ubicacion);
    return createApiResponse(200, "Closed pallets fetched successfully", result);
  }),
  "/getEggsByCodigo": createHandler(async (event) => {
    const { codigo } = helpers.getQueryParams(event);
    helpers.validateRequired({ codigo }, ['codigo']);
    const result = await getEggByCodigo(codigo);
    return createApiResponse(200, "Egg data fetched successfully", result);
  }),
  "/getUnassignedBoxesInPacking": createHandler(async () => {
    const result = await getUnassignedBoxesInPacking();
    return createApiResponse(200, "Unassigned boxes in packing fetched successfully", result);
  }),
  "/admin/dashboard": createHandler(async () => {
    const result = await getSystemDashboard();
    return createApiResponse(200, "Dashboard data fetched successfully", result);
  }),
  "/admin/issues": createHandler(async (event) => {
    const { status, startDate, endDate } = helpers.getQueryParams(event);
    const result = await getIssues({ status, startDate, endDate });
    return createApiResponse(200, "Issues fetched successfully", result);
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
    } else {
      if (ubicacion === CONFIG.LOCATIONS.PACKING) {
        return palletCodigo
          ? await registerEgg(codigo, palletCodigo, palletCodigo, scannedCodes)
          : await registerEgg(codigo);
      } else {
        return await moveEgg(codigo, ubicacion);
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
    return await registerEgg(codigo, pallet, customInfo);
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
    const result = await updateIssueStatus(issueId, status, resolution);
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
    return createApiResponse(result.success ? 200 : 400, result.message);
  }),
  
  "/admin/deletePallet": createHandler(async (event) => {
    const { codigo } = helpers.parseBody(event);
    helpers.validateRequired({ codigo }, ['codigo']);
    const result = await deletePallet(codigo);
    return createApiResponse(result.success ? 200 : 400, result.message);
  }),
};

exports.handler = async (event) => {

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
          message: JSON.stringify(error.message),
          type: 'JobFailed',
          externalExecutionId: context.awsRequestId,
        },
      }).promise();
    }

    return;
  }

  try {
    const method = event.httpMethod || event.requestContext?.http?.method;
    const path = event.rawPath || event.path;

    if (!method || !path) {
      return createApiResponse(400, "Invalid request: missing method or path");
    }

    const routes = method === "GET" ? getRoutes : method === "POST" ? postRoutes : null;
    if (!routes) return createApiResponse(405, `Method not supported: ${method}`);

    const handler = routes[path];
    if (!handler) return createApiResponse(404, `Route not found: ${path}`);

    return await handler(event);
  } catch (error) {
    console.error("❌ Unhandled Error:", error);
    return createApiResponse(500, "Internal server error", { error: error.message });
  }
};
