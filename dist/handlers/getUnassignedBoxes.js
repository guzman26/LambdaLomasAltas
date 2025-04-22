"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const EGGS_TABLE = "Huevos";
const dynamoDB = new aws_sdk_1.default.DynamoDB.DocumentClient();
/**
 * Returns all boxes that have not yet been assigned to a pallet.
 * Assumes each box has a `palletId` attribute set to "UNASSIGNED" when unassigned.
 */
async function findBoxesWithoutPallet() {
    const params = {
        TableName: EGGS_TABLE,
        IndexName: "palletId-index",
        KeyConditionExpression: "palletId = :unassigned",
        ExpressionAttributeValues: {
            ":unassigned": "UNASSIGNED"
        }
    };
    try {
        const results = [];
        let lastEvaluatedKey = undefined;
        do {
            const data = await dynamoDB.query({
                ...params,
                ExclusiveStartKey: lastEvaluatedKey || undefined
            }).promise();
            if (data.Items) {
                results.push(...data.Items);
            }
            lastEvaluatedKey = data.LastEvaluatedKey;
        } while (lastEvaluatedKey);
        console.log(`📦 Found ${results.length} unassigned boxes`);
        return results;
    }
    catch (error) {
        console.error("❌ Error finding unassigned boxes:", error);
        throw new Error("Failed to retrieve unassigned boxes.");
    }
}
exports.default = findBoxesWithoutPallet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0VW5hc3NpZ25lZEJveGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vaGFuZGxlcnMvZ2V0VW5hc3NpZ25lZEJveGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsc0RBQTBCO0FBSTFCLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQztBQUM1QixNQUFNLFFBQVEsR0FBRyxJQUFJLGlCQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBRW5EOzs7R0FHRztBQUNILEtBQUssVUFBVSxzQkFBc0I7SUFDbkMsTUFBTSxNQUFNLEdBQThCO1FBQ3hDLFNBQVMsRUFBRSxVQUFVO1FBQ3JCLFNBQVMsRUFBRSxnQkFBZ0I7UUFDM0Isc0JBQXNCLEVBQUUsd0JBQXdCO1FBQ2hELHlCQUF5QixFQUFFO1lBQ3pCLGFBQWEsRUFBRSxZQUFZO1NBQzVCO0tBQ0YsQ0FBQztJQUVGLElBQUksQ0FBQztRQUNILE1BQU0sT0FBTyxHQUFtQixFQUFFLENBQUM7UUFDbkMsSUFBSSxnQkFBZ0IsR0FBbUMsU0FBUyxDQUFDO1FBRWpFLEdBQUcsQ0FBQztZQUNGLE1BQU0sSUFBSSxHQUErQixNQUFNLFFBQVEsQ0FBQyxLQUFLLENBQUM7Z0JBQzVELEdBQUcsTUFBTTtnQkFDVCxpQkFBaUIsRUFBRSxnQkFBZ0IsSUFBSSxTQUFTO2FBQ2pELENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUViLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNmLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBdUIsQ0FBQyxDQUFDO1lBQ2hELENBQUM7WUFDRCxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7UUFDM0MsQ0FBQyxRQUFRLGdCQUFnQixFQUFFO1FBRzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxPQUFPLENBQUMsTUFBTSxtQkFBbUIsQ0FBQyxDQUFDO1FBQzNELE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyxtQ0FBbUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMxRCxNQUFNLElBQUksS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7SUFDMUQsQ0FBQztBQUNILENBQUM7QUFFRCxrQkFBZSxzQkFBc0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBBV1MgZnJvbSBcImF3cy1zZGtcIjtcbmltcG9ydCB7IERvY3VtZW50Q2xpZW50IH0gZnJvbSBcImF3cy1zZGsvY2xpZW50cy9keW5hbW9kYlwiO1xuaW1wb3J0IHsgRHluYW1vRGJJdGVtIH0gZnJvbSBcIi4uL3R5cGVzXCI7XG5cbmNvbnN0IEVHR1NfVEFCTEUgPSBcIkh1ZXZvc1wiO1xuY29uc3QgZHluYW1vREIgPSBuZXcgQVdTLkR5bmFtb0RCLkRvY3VtZW50Q2xpZW50KCk7XG5cbi8qKlxuICogUmV0dXJucyBhbGwgYm94ZXMgdGhhdCBoYXZlIG5vdCB5ZXQgYmVlbiBhc3NpZ25lZCB0byBhIHBhbGxldC5cbiAqIEFzc3VtZXMgZWFjaCBib3ggaGFzIGEgYHBhbGxldElkYCBhdHRyaWJ1dGUgc2V0IHRvIFwiVU5BU1NJR05FRFwiIHdoZW4gdW5hc3NpZ25lZC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZmluZEJveGVzV2l0aG91dFBhbGxldCgpOiBQcm9taXNlPER5bmFtb0RiSXRlbVtdPiB7XG4gIGNvbnN0IHBhcmFtczogRG9jdW1lbnRDbGllbnQuUXVlcnlJbnB1dCA9IHtcbiAgICBUYWJsZU5hbWU6IEVHR1NfVEFCTEUsXG4gICAgSW5kZXhOYW1lOiBcInBhbGxldElkLWluZGV4XCIsXG4gICAgS2V5Q29uZGl0aW9uRXhwcmVzc2lvbjogXCJwYWxsZXRJZCA9IDp1bmFzc2lnbmVkXCIsXG4gICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczoge1xuICAgICAgXCI6dW5hc3NpZ25lZFwiOiBcIlVOQVNTSUdORURcIlxuICAgIH1cbiAgfTtcblxuICB0cnkge1xuICAgIGNvbnN0IHJlc3VsdHM6IER5bmFtb0RiSXRlbVtdID0gW107XG4gICAgbGV0IGxhc3RFdmFsdWF0ZWRLZXk6IERvY3VtZW50Q2xpZW50LktleSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICAgIGRvIHtcbiAgICAgIGNvbnN0IGRhdGE6IERvY3VtZW50Q2xpZW50LlF1ZXJ5T3V0cHV0ID0gYXdhaXQgZHluYW1vREIucXVlcnkoe1xuICAgICAgICAuLi5wYXJhbXMsXG4gICAgICAgIEV4Y2x1c2l2ZVN0YXJ0S2V5OiBsYXN0RXZhbHVhdGVkS2V5IHx8IHVuZGVmaW5lZFxuICAgICAgfSkucHJvbWlzZSgpO1xuXG4gICAgICBpZiAoZGF0YS5JdGVtcykge1xuICAgICAgICByZXN1bHRzLnB1c2goLi4uZGF0YS5JdGVtcyBhcyBEeW5hbW9EYkl0ZW1bXSk7XG4gICAgICB9XG4gICAgICBsYXN0RXZhbHVhdGVkS2V5ID0gZGF0YS5MYXN0RXZhbHVhdGVkS2V5O1xuICAgIH0gd2hpbGUgKGxhc3RFdmFsdWF0ZWRLZXkpO1xuXG5cbiAgICBjb25zb2xlLmxvZyhg8J+TpiBGb3VuZCAke3Jlc3VsdHMubGVuZ3RofSB1bmFzc2lnbmVkIGJveGVzYCk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIuKdjCBFcnJvciBmaW5kaW5nIHVuYXNzaWduZWQgYm94ZXM6XCIsIGVycm9yKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gcmV0cmlldmUgdW5hc3NpZ25lZCBib3hlcy5cIik7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgZmluZEJveGVzV2l0aG91dFBhbGxldDsiXX0=