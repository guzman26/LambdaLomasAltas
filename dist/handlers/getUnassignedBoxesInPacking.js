"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const EGGS_TABLE = "Huevos";
const dynamoDB = new aws_sdk_1.default.DynamoDB.DocumentClient();
/**
 * Obtiene las cajas con ubicación "PACKING" y sin pallet asignado.
 * Usa un GSI en `ubicacion` para hacer un query eficiente.
 *
 * @returns {Promise<Array>} Lista de cajas sin pallet
 */
const getUnassignedBoxesInPacking = async () => {
    const params = {
        TableName: EGGS_TABLE,
        IndexName: "ubicacion-index", // Asegúrate que este GSI existe
        KeyConditionExpression: "ubicacion = :packing",
        FilterExpression: "attribute_not_exists(palletId)",
        ExpressionAttributeValues: {
            ":packing": "PACKING",
        },
    };
    const results = [];
    let lastKey = undefined;
    do {
        const data = await dynamoDB.query({
            ...params,
            ExclusiveStartKey: lastKey,
        }).promise();
        if (data.Items) {
            results.push(...data.Items);
        }
        lastKey = data.LastEvaluatedKey;
    } while (lastKey);
    return results;
};
exports.default = getUnassignedBoxesInPacking;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0VW5hc3NpZ25lZEJveGVzSW5QYWNraW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vaGFuZGxlcnMvZ2V0VW5hc3NpZ25lZEJveGVzSW5QYWNraW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsc0RBQTBCO0FBSTFCLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQztBQUM1QixNQUFNLFFBQVEsR0FBRyxJQUFJLGlCQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBRW5EOzs7OztHQUtHO0FBQ0gsTUFBTSwyQkFBMkIsR0FBRyxLQUFLLElBQTZCLEVBQUU7SUFDdEUsTUFBTSxNQUFNLEdBQThCO1FBQ3hDLFNBQVMsRUFBRSxVQUFVO1FBQ3JCLFNBQVMsRUFBRSxpQkFBaUIsRUFBRSxnQ0FBZ0M7UUFDOUQsc0JBQXNCLEVBQUUsc0JBQXNCO1FBQzlDLGdCQUFnQixFQUFFLGdDQUFnQztRQUNsRCx5QkFBeUIsRUFBRTtZQUN6QixVQUFVLEVBQUUsU0FBUztTQUN0QjtLQUNGLENBQUM7SUFFRixNQUFNLE9BQU8sR0FBbUIsRUFBRSxDQUFDO0lBQ25DLElBQUksT0FBTyxHQUFtQyxTQUFTLENBQUM7SUFFeEQsR0FBRyxDQUFDO1FBQ0YsTUFBTSxJQUFJLEdBQStCLE1BQU0sUUFBUSxDQUFDLEtBQUssQ0FBQztZQUM1RCxHQUFHLE1BQU07WUFDVCxpQkFBaUIsRUFBRSxPQUFPO1NBQzNCLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUViLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2YsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUF1QixDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUNELE9BQU8sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7SUFDbEMsQ0FBQyxRQUFRLE9BQU8sRUFBRTtJQUVsQixPQUFPLE9BQU8sQ0FBQztBQUNqQixDQUFDLENBQUM7QUFFRixrQkFBZSwyQkFBMkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBBV1MgZnJvbSBcImF3cy1zZGtcIjtcbmltcG9ydCB7IERvY3VtZW50Q2xpZW50IH0gZnJvbSBcImF3cy1zZGsvY2xpZW50cy9keW5hbW9kYlwiO1xuaW1wb3J0IHsgRHluYW1vRGJJdGVtIH0gZnJvbSBcIi4uL3R5cGVzXCI7XG5cbmNvbnN0IEVHR1NfVEFCTEUgPSBcIkh1ZXZvc1wiO1xuY29uc3QgZHluYW1vREIgPSBuZXcgQVdTLkR5bmFtb0RCLkRvY3VtZW50Q2xpZW50KCk7XG5cbi8qKlxuICogT2J0aWVuZSBsYXMgY2FqYXMgY29uIHViaWNhY2nDs24gXCJQQUNLSU5HXCIgeSBzaW4gcGFsbGV0IGFzaWduYWRvLlxuICogVXNhIHVuIEdTSSBlbiBgdWJpY2FjaW9uYCBwYXJhIGhhY2VyIHVuIHF1ZXJ5IGVmaWNpZW50ZS5cbiAqIFxuICogQHJldHVybnMge1Byb21pc2U8QXJyYXk+fSBMaXN0YSBkZSBjYWphcyBzaW4gcGFsbGV0XG4gKi9cbmNvbnN0IGdldFVuYXNzaWduZWRCb3hlc0luUGFja2luZyA9IGFzeW5jICgpOiBQcm9taXNlPER5bmFtb0RiSXRlbVtdPiA9PiB7XG4gIGNvbnN0IHBhcmFtczogRG9jdW1lbnRDbGllbnQuUXVlcnlJbnB1dCA9IHtcbiAgICBUYWJsZU5hbWU6IEVHR1NfVEFCTEUsXG4gICAgSW5kZXhOYW1lOiBcInViaWNhY2lvbi1pbmRleFwiLCAvLyBBc2Vnw7pyYXRlIHF1ZSBlc3RlIEdTSSBleGlzdGVcbiAgICBLZXlDb25kaXRpb25FeHByZXNzaW9uOiBcInViaWNhY2lvbiA9IDpwYWNraW5nXCIsXG4gICAgRmlsdGVyRXhwcmVzc2lvbjogXCJhdHRyaWJ1dGVfbm90X2V4aXN0cyhwYWxsZXRJZClcIixcbiAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7XG4gICAgICBcIjpwYWNraW5nXCI6IFwiUEFDS0lOR1wiLFxuICAgIH0sXG4gIH07XG5cbiAgY29uc3QgcmVzdWx0czogRHluYW1vRGJJdGVtW10gPSBbXTtcbiAgbGV0IGxhc3RLZXk6IERvY3VtZW50Q2xpZW50LktleSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICBkbyB7XG4gICAgY29uc3QgZGF0YTogRG9jdW1lbnRDbGllbnQuUXVlcnlPdXRwdXQgPSBhd2FpdCBkeW5hbW9EQi5xdWVyeSh7XG4gICAgICAuLi5wYXJhbXMsXG4gICAgICBFeGNsdXNpdmVTdGFydEtleTogbGFzdEtleSxcbiAgICB9KS5wcm9taXNlKCk7XG5cbiAgICBpZiAoZGF0YS5JdGVtcykge1xuICAgICAgcmVzdWx0cy5wdXNoKC4uLmRhdGEuSXRlbXMgYXMgRHluYW1vRGJJdGVtW10pO1xuICAgIH1cbiAgICBsYXN0S2V5ID0gZGF0YS5MYXN0RXZhbHVhdGVkS2V5O1xuICB9IHdoaWxlIChsYXN0S2V5KTtcblxuICByZXR1cm4gcmVzdWx0cztcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGdldFVuYXNzaWduZWRCb3hlc0luUGFja2luZztcbiJdfQ==