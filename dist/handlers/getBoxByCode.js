"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const dynamoDB = new aws_sdk_1.default.DynamoDB.DocumentClient();
const BOXES_TABLE = "Boxes";
/**
 * Gets a box by its unique code
 * @param {string} code - The box code
 * @returns {Promise<object>} - The response object
 */
const getBoxByCode = async (code) => {
    try {
        const { Item } = await dynamoDB.get({
            TableName: BOXES_TABLE,
            Key: { codigo: code }
        }).promise();
        if (!Item) {
            return { success: false, message: `No box found with code ${code}` };
        }
        return { success: true, data: Item };
    }
    catch (error) {
        console.error(`Error retrieving box with code ${code}:`, error);
        return { success: false, error: error.message };
    }
};
module.exports = getBoxByCode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0Qm94QnlDb2RlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vaGFuZGxlcnMvZ2V0Qm94QnlDb2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsc0RBQTBCO0FBRzFCLE1BQU0sUUFBUSxHQUFHLElBQUksaUJBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDbkQsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDO0FBRTVCOzs7O0dBSUc7QUFDSCxNQUFNLFlBQVksR0FBRyxLQUFLLEVBQUUsSUFBWSxFQUFFLEVBQUU7SUFDMUMsSUFBSSxDQUFDO1FBQ0gsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLE1BQU0sUUFBUSxDQUFDLEdBQUcsQ0FBQztZQUNsQyxTQUFTLEVBQUUsV0FBVztZQUN0QixHQUFHLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO1NBQ3RCLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUViLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNWLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSwwQkFBMEIsSUFBSSxFQUFFLEVBQUUsQ0FBQztRQUN2RSxDQUFDO1FBRUQsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDO0lBQ3ZDLENBQUM7SUFBQyxPQUFPLEtBQVUsRUFBRSxDQUFDO1FBQ3BCLE9BQU8sQ0FBQyxLQUFLLENBQUMsa0NBQWtDLElBQUksR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2hFLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDbEQsQ0FBQztBQUNILENBQUMsQ0FBQztBQUVGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEFXUyBmcm9tIFwiYXdzLXNka1wiO1xuaW1wb3J0IHsgRG9jdW1lbnRDbGllbnQgfSBmcm9tIFwiYXdzLXNkay9jbGllbnRzL2R5bmFtb2RiXCI7XG5cbmNvbnN0IGR5bmFtb0RCID0gbmV3IEFXUy5EeW5hbW9EQi5Eb2N1bWVudENsaWVudCgpO1xuY29uc3QgQk9YRVNfVEFCTEUgPSBcIkJveGVzXCI7XG5cbi8qKlxuICogR2V0cyBhIGJveCBieSBpdHMgdW5pcXVlIGNvZGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb2RlIC0gVGhlIGJveCBjb2RlXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxvYmplY3Q+fSAtIFRoZSByZXNwb25zZSBvYmplY3RcbiAqL1xuY29uc3QgZ2V0Qm94QnlDb2RlID0gYXN5bmMgKGNvZGU6IHN0cmluZykgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IHsgSXRlbSB9ID0gYXdhaXQgZHluYW1vREIuZ2V0KHtcbiAgICAgIFRhYmxlTmFtZTogQk9YRVNfVEFCTEUsXG4gICAgICBLZXk6IHsgY29kaWdvOiBjb2RlIH1cbiAgICB9KS5wcm9taXNlKCk7XG4gICAgXG4gICAgaWYgKCFJdGVtKSB7XG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgbWVzc2FnZTogYE5vIGJveCBmb3VuZCB3aXRoIGNvZGUgJHtjb2RlfWAgfTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogSXRlbSB9O1xuICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgY29uc29sZS5lcnJvcihgRXJyb3IgcmV0cmlldmluZyBib3ggd2l0aCBjb2RlICR7Y29kZX06YCwgZXJyb3IpO1xuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdldEJveEJ5Q29kZTtcbiJdfQ==