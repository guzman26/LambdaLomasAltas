"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const response_1 = __importDefault(require("../../utils/response"));
const dynamoDB = new aws_sdk_1.default.DynamoDB.DocumentClient();
const ISSUES_TABLE = "Issues"; // Asegúrate de crear esta tabla en DynamoDB
const createIssue = async (descripcion) => {
    try {
        if (!descripcion || descripcion.trim() === "") {
            return (0, response_1.default)(400, "⚠️ La descripción es obligatoria.");
        }
        const issue = {
            IssueNumber: (0, uuid_1.v4)(),
            descripcion,
            timestamp: new Date().toISOString(),
            estado: "PENDING",
        };
        const params = {
            TableName: ISSUES_TABLE,
            Item: issue,
        };
        await dynamoDB.put(params).promise();
        return (0, response_1.default)(200, "✅ Reporte Enviado", issue);
    }
    catch (error) {
        console.error("❌ Error al reportar issue:", error);
        return (0, response_1.default)(500, "❌ Error al reportar issue:", error.message);
    }
};
exports.default = createIssue;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vY29udHJvbGxlcnMvaXNzdWVzL2NyZWF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLCtCQUFvQztBQUNwQyxzREFBMEI7QUFFMUIsb0VBQXFEO0FBRXJELE1BQU0sUUFBUSxHQUFHLElBQUksaUJBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDbkQsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLENBQUMsNENBQTRDO0FBUzNFLE1BQU0sV0FBVyxHQUFHLEtBQUssRUFBRSxXQUFtQixFQUF3QixFQUFFO0lBQ3RFLElBQUksQ0FBQztRQUNILElBQUksQ0FBQyxXQUFXLElBQUksV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDO1lBQzlDLE9BQU8sSUFBQSxrQkFBaUIsRUFBQyxHQUFHLEVBQUUsbUNBQW1DLENBQUMsQ0FBQztRQUNyRSxDQUFDO1FBRUQsTUFBTSxLQUFLLEdBQWdCO1lBQ3pCLFdBQVcsRUFBRSxJQUFBLFNBQU0sR0FBRTtZQUNyQixXQUFXO1lBQ1gsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFO1lBQ25DLE1BQU0sRUFBRSxTQUFTO1NBQ2xCLENBQUM7UUFFRixNQUFNLE1BQU0sR0FBRztZQUNiLFNBQVMsRUFBRSxZQUFZO1lBQ3ZCLElBQUksRUFBRSxLQUFLO1NBQ1osQ0FBQztRQUVGLE1BQU0sUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUVyQyxPQUFPLElBQUEsa0JBQWlCLEVBQUMsR0FBRyxFQUFFLG1CQUFtQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNuRCxPQUFPLElBQUEsa0JBQWlCLEVBQUMsR0FBRyxFQUFFLDRCQUE0QixFQUFHLEtBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN4RixDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBRUYsa0JBQWUsV0FBVyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdjQgYXMgdXVpZHY0IH0gZnJvbSAndXVpZCc7XG5pbXBvcnQgQVdTIGZyb20gJ2F3cy1zZGsnO1xuaW1wb3J0IHsgQXBpUmVzcG9uc2UsIElzc3VlIH0gZnJvbSAnLi4vLi4vdHlwZXMnO1xuaW1wb3J0IGNyZWF0ZUFwaVJlc3BvbnNlIGZyb20gXCIuLi8uLi91dGlscy9yZXNwb25zZVwiO1xuXG5jb25zdCBkeW5hbW9EQiA9IG5ldyBBV1MuRHluYW1vREIuRG9jdW1lbnRDbGllbnQoKTtcbmNvbnN0IElTU1VFU19UQUJMRSA9IFwiSXNzdWVzXCI7IC8vIEFzZWfDunJhdGUgZGUgY3JlYXIgZXN0YSB0YWJsYSBlbiBEeW5hbW9EQlxuXG5pbnRlcmZhY2UgSXNzdWVDcmVhdGUge1xuICBJc3N1ZU51bWJlcjogc3RyaW5nO1xuICBkZXNjcmlwY2lvbjogc3RyaW5nO1xuICB0aW1lc3RhbXA6IHN0cmluZztcbiAgZXN0YWRvOiAnUEVORElORycgfCAnSU5fUFJPR1JFU1MnIHwgJ1JFU09MVkVEJztcbn1cblxuY29uc3QgY3JlYXRlSXNzdWUgPSBhc3luYyAoZGVzY3JpcGNpb246IHN0cmluZyk6IFByb21pc2U8QXBpUmVzcG9uc2U+ID0+IHtcbiAgdHJ5IHtcbiAgICBpZiAoIWRlc2NyaXBjaW9uIHx8IGRlc2NyaXBjaW9uLnRyaW0oKSA9PT0gXCJcIikge1xuICAgICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDQwMCwgXCLimqDvuI8gTGEgZGVzY3JpcGNpw7NuIGVzIG9ibGlnYXRvcmlhLlwiKTtcbiAgICB9XG5cbiAgICBjb25zdCBpc3N1ZTogSXNzdWVDcmVhdGUgPSB7XG4gICAgICBJc3N1ZU51bWJlcjogdXVpZHY0KCksXG4gICAgICBkZXNjcmlwY2lvbixcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgZXN0YWRvOiBcIlBFTkRJTkdcIixcbiAgICB9O1xuXG4gICAgY29uc3QgcGFyYW1zID0ge1xuICAgICAgVGFibGVOYW1lOiBJU1NVRVNfVEFCTEUsXG4gICAgICBJdGVtOiBpc3N1ZSxcbiAgICB9O1xuXG4gICAgYXdhaXQgZHluYW1vREIucHV0KHBhcmFtcykucHJvbWlzZSgpO1xuXG4gICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDIwMCwgXCLinIUgUmVwb3J0ZSBFbnZpYWRvXCIsIGlzc3VlKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwi4p2MIEVycm9yIGFsIHJlcG9ydGFyIGlzc3VlOlwiLCBlcnJvcik7XG4gICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDUwMCwgXCLinYwgRXJyb3IgYWwgcmVwb3J0YXIgaXNzdWU6XCIsIChlcnJvciBhcyBFcnJvcikubWVzc2FnZSk7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZUlzc3VlOyAiXX0=