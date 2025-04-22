"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const response_1 = __importDefault(require("../utils/response"));
const dynamoDB = new aws_sdk_1.default.DynamoDB.DocumentClient();
const TABLE_NAME = 'Boxes';
/**
 * Lambda handler to get full details of multiple boxes
 * @param {Object} event - Lambda event
 * @returns {Object} API response
 */
const getBoxesInPallet = async (event) => {
    var _a;
    try {
        const body = JSON.parse(event.body);
        const { codigos } = body;
        console.log('🔎 Searching for boxes:', codigos);
        if (!Array.isArray(codigos) || codigos.length === 0) {
            return (0, response_1.default)(400, "Debe proporcionar una lista de códigos en 'codigos'.");
        }
        // DynamoDB allows max 100 keys per batch request
        const batches = [];
        for (let i = 0; i < codigos.length; i += 100) {
            const batch = codigos.slice(i, i + 100).map(codigo => ({ codigo }));
            batches.push(batch);
        }
        const allResults = [];
        for (const batch of batches) {
            const params = {
                RequestItems: {
                    [TABLE_NAME]: {
                        Keys: batch
                    }
                }
            };
            const result = await dynamoDB.batchGet(params).promise();
            console.log('🔍 DynamoDB result:', JSON.stringify(result, null, 2));
            const foundItems = ((_a = result.Responses) === null || _a === void 0 ? void 0 : _a[TABLE_NAME]) || [];
            allResults.push(...foundItems);
        }
        return (0, response_1.default)(200, `✅ Se encontraron ${allResults.length} cajas`, allResults);
    }
    catch (error) {
        console.error('❌ Error fetching box details:', error);
        return (0, response_1.default)(500, 'Error interno al obtener detalles de las cajas', { error: error.message });
    }
};
module.exports = getBoxesInPallet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0Qm94ZXNJblBhbGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2hhbmRsZXJzL2dldEJveGVzSW5QYWxsZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxzREFBMEI7QUFDMUIsaUVBQWtEO0FBRWxELE1BQU0sUUFBUSxHQUFHLElBQUksaUJBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDbkQsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDO0FBRTNCOzs7O0dBSUc7QUFDSCxNQUFNLGdCQUFnQixHQUFHLEtBQUssRUFBRSxLQUFVLEVBQUUsRUFBRTs7SUFDNUMsSUFBSSxDQUFDO1FBQ0gsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEMsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQztRQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixFQUFFLE9BQU8sQ0FBQyxDQUFBO1FBRy9DLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDcEQsT0FBTyxJQUFBLGtCQUFpQixFQUFDLEdBQUcsRUFBRSxzREFBc0QsQ0FBQyxDQUFDO1FBQ3hGLENBQUM7UUFFRCxpREFBaUQ7UUFDakQsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ25CLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUM3QyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNwRSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RCLENBQUM7UUFFRCxNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFFdEIsS0FBSyxNQUFNLEtBQUssSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUM1QixNQUFNLE1BQU0sR0FBRztnQkFDYixZQUFZLEVBQUU7b0JBQ1osQ0FBQyxVQUFVLENBQUMsRUFBRTt3QkFDWixJQUFJLEVBQUUsS0FBSztxQkFDWjtpQkFDRjthQUNGLENBQUM7WUFFRixNQUFNLE1BQU0sR0FBRyxNQUFNLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDekQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwRSxNQUFNLFVBQVUsR0FBRyxDQUFBLE1BQUEsTUFBTSxDQUFDLFNBQVMsMENBQUcsVUFBVSxDQUFDLEtBQUksRUFBRSxDQUFDO1lBQ3hELFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBRUQsT0FBTyxJQUFBLGtCQUFpQixFQUFDLEdBQUcsRUFBRSxvQkFBb0IsVUFBVSxDQUFDLE1BQU0sUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQzNGLENBQUM7SUFBQyxPQUFPLEtBQVUsRUFBRSxDQUFDO1FBQ3BCLE9BQU8sQ0FBQyxLQUFLLENBQUMsK0JBQStCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdEQsT0FBTyxJQUFBLGtCQUFpQixFQUFDLEdBQUcsRUFBRSxnREFBZ0QsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUM1RyxDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBRUYsTUFBTSxDQUFDLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBBV1MgZnJvbSBcImF3cy1zZGtcIjtcbmltcG9ydCBjcmVhdGVBcGlSZXNwb25zZSBmcm9tIFwiLi4vdXRpbHMvcmVzcG9uc2VcIjtcblxuY29uc3QgZHluYW1vREIgPSBuZXcgQVdTLkR5bmFtb0RCLkRvY3VtZW50Q2xpZW50KCk7XG5jb25zdCBUQUJMRV9OQU1FID0gJ0JveGVzJztcblxuLyoqXG4gKiBMYW1iZGEgaGFuZGxlciB0byBnZXQgZnVsbCBkZXRhaWxzIG9mIG11bHRpcGxlIGJveGVzXG4gKiBAcGFyYW0ge09iamVjdH0gZXZlbnQgLSBMYW1iZGEgZXZlbnRcbiAqIEByZXR1cm5zIHtPYmplY3R9IEFQSSByZXNwb25zZVxuICovXG5jb25zdCBnZXRCb3hlc0luUGFsbGV0ID0gYXN5bmMgKGV2ZW50OiBhbnkpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBib2R5ID0gSlNPTi5wYXJzZShldmVudC5ib2R5KTtcbiAgICBjb25zdCB7IGNvZGlnb3MgfSA9IGJvZHk7XG4gICAgY29uc29sZS5sb2coJ/CflI4gU2VhcmNoaW5nIGZvciBib3hlczonLCBjb2RpZ29zKVxuXG5cbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoY29kaWdvcykgfHwgY29kaWdvcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSg0MDAsIFwiRGViZSBwcm9wb3JjaW9uYXIgdW5hIGxpc3RhIGRlIGPDs2RpZ29zIGVuICdjb2RpZ29zJy5cIik7XG4gICAgfVxuXG4gICAgLy8gRHluYW1vREIgYWxsb3dzIG1heCAxMDAga2V5cyBwZXIgYmF0Y2ggcmVxdWVzdFxuICAgIGNvbnN0IGJhdGNoZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvZGlnb3MubGVuZ3RoOyBpICs9IDEwMCkge1xuICAgICAgY29uc3QgYmF0Y2ggPSBjb2RpZ29zLnNsaWNlKGksIGkgKyAxMDApLm1hcChjb2RpZ28gPT4gKHsgY29kaWdvIH0pKTtcbiAgICAgIGJhdGNoZXMucHVzaChiYXRjaCk7XG4gICAgfVxuXG4gICAgY29uc3QgYWxsUmVzdWx0cyA9IFtdO1xuXG4gICAgZm9yIChjb25zdCBiYXRjaCBvZiBiYXRjaGVzKSB7XG4gICAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICAgIFJlcXVlc3RJdGVtczoge1xuICAgICAgICAgIFtUQUJMRV9OQU1FXToge1xuICAgICAgICAgICAgS2V5czogYmF0Y2hcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGR5bmFtb0RCLmJhdGNoR2V0KHBhcmFtcykucHJvbWlzZSgpO1xuICAgICAgY29uc29sZS5sb2coJ/CflI0gRHluYW1vREIgcmVzdWx0OicsIEpTT04uc3RyaW5naWZ5KHJlc3VsdCwgbnVsbCwgMikpO1xuICAgICAgY29uc3QgZm91bmRJdGVtcyA9IHJlc3VsdC5SZXNwb25zZXM/LltUQUJMRV9OQU1FXSB8fCBbXTtcbiAgICAgIGFsbFJlc3VsdHMucHVzaCguLi5mb3VuZEl0ZW1zKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoMjAwLCBg4pyFIFNlIGVuY29udHJhcm9uICR7YWxsUmVzdWx0cy5sZW5ndGh9IGNhamFzYCwgYWxsUmVzdWx0cyk7XG4gIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICBjb25zb2xlLmVycm9yKCfinYwgRXJyb3IgZmV0Y2hpbmcgYm94IGRldGFpbHM6JywgZXJyb3IpO1xuICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSg1MDAsICdFcnJvciBpbnRlcm5vIGFsIG9idGVuZXIgZGV0YWxsZXMgZGUgbGFzIGNhamFzJywgeyBlcnJvcjogZXJyb3IubWVzc2FnZSB9KTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZXRCb3hlc0luUGFsbGV0O1xuIl19