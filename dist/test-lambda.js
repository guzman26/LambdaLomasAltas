"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Set environment variables
process.env.PALLETS_TABLE = 'Pallets';
process.env.HUEVOS_TABLE = 'Huevos';
// Mock AWS SDK
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const mockDb_1 = __importDefault(require("./utils/mockDb"));
const path_1 = __importDefault(require("path"));
const lambda_local_1 = __importDefault(require("lambda-local"));
// Save original
const originalDocumentClient = aws_sdk_1.default.DynamoDB.DocumentClient;
// Override for testing
aws_sdk_1.default.DynamoDB.DocumentClient = function () {
    return mockDb_1.default;
};
// Run lambda-local
lambda_local_1.default.execute({
    event: require('./event.json'),
    lambdaPath: path_1.default.join(__dirname, 'dist/index.js'),
    profilePath: '~/.aws/credentials',
    profileName: 'default',
    timeoutMs: 3000,
    callback: function (err, result) {
        if (err) {
            console.error('Lambda execution failed:', err);
        }
        else {
            console.log('Lambda execution result:', JSON.stringify(result, null, 2));
        }
        // Restore original AWS SDK
        aws_sdk_1.default.DynamoDB.DocumentClient = originalDocumentClient;
    }
}).catch(err => {
    console.error('Lambda-local execution error:', err);
    // Restore original AWS SDK
    aws_sdk_1.default.DynamoDB.DocumentClient = originalDocumentClient;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC1sYW1iZGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi90ZXN0LWxhbWJkYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDRCQUE0QjtBQUM1QixPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUM7QUFDdEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDO0FBRXBDLGVBQWU7QUFDZixzREFBMEI7QUFDMUIsNERBQTBDO0FBRTFDLGdEQUF3QjtBQUN4QixnRUFBdUM7QUFFdkMsZ0JBQWdCO0FBQ2hCLE1BQU0sc0JBQXNCLEdBQUcsaUJBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDO0FBRTNELHVCQUF1QjtBQUN2QixpQkFBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEdBQUc7SUFDNUIsT0FBTyxnQkFBWSxDQUFDO0FBQ3RCLENBQVEsQ0FBQztBQUVULG1CQUFtQjtBQUNuQixzQkFBVyxDQUFDLE9BQU8sQ0FBQztJQUNsQixLQUFLLEVBQUUsT0FBTyxDQUFDLGNBQWMsQ0FBZ0I7SUFDN0MsVUFBVSxFQUFFLGNBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLGVBQWUsQ0FBQztJQUNqRCxXQUFXLEVBQUUsb0JBQW9CO0lBQ2pDLFdBQVcsRUFBRSxTQUFTO0lBQ3RCLFNBQVMsRUFBRSxJQUFJO0lBQ2YsUUFBUSxFQUFFLFVBQVMsR0FBaUIsRUFBRSxNQUFXO1FBQy9DLElBQUksR0FBRyxFQUFFLENBQUM7WUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLDBCQUEwQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2pELENBQUM7YUFBTSxDQUFDO1lBQ04sT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzRSxDQUFDO1FBRUQsMkJBQTJCO1FBQzNCLGlCQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsR0FBRyxzQkFBc0IsQ0FBQztJQUN2RCxDQUFDO0NBQ0YsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRTtJQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsK0JBQStCLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDcEQsMkJBQTJCO0lBQzNCLGlCQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsR0FBRyxzQkFBc0IsQ0FBQztBQUN2RCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIFNldCBlbnZpcm9ubWVudCB2YXJpYWJsZXNcbnByb2Nlc3MuZW52LlBBTExFVFNfVEFCTEUgPSAnUGFsbGV0cyc7XG5wcm9jZXNzLmVudi5IVUVWT1NfVEFCTEUgPSAnSHVldm9zJztcblxuLy8gTW9jayBBV1MgU0RLXG5pbXBvcnQgQVdTIGZyb20gJ2F3cy1zZGsnO1xuaW1wb3J0IG1vY2tEeW5hbW9EYiBmcm9tICcuL3V0aWxzL21vY2tEYic7XG5pbXBvcnQgeyBMYW1iZGFFdmVudCB9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgbGFtYmRhTG9jYWwgZnJvbSAnbGFtYmRhLWxvY2FsJztcblxuLy8gU2F2ZSBvcmlnaW5hbFxuY29uc3Qgb3JpZ2luYWxEb2N1bWVudENsaWVudCA9IEFXUy5EeW5hbW9EQi5Eb2N1bWVudENsaWVudDtcblxuLy8gT3ZlcnJpZGUgZm9yIHRlc3RpbmdcbkFXUy5EeW5hbW9EQi5Eb2N1bWVudENsaWVudCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbW9ja0R5bmFtb0RiO1xufSBhcyBhbnk7XG5cbi8vIFJ1biBsYW1iZGEtbG9jYWxcbmxhbWJkYUxvY2FsLmV4ZWN1dGUoe1xuICBldmVudDogcmVxdWlyZSgnLi9ldmVudC5qc29uJykgYXMgTGFtYmRhRXZlbnQsXG4gIGxhbWJkYVBhdGg6IHBhdGguam9pbihfX2Rpcm5hbWUsICdkaXN0L2luZGV4LmpzJyksXG4gIHByb2ZpbGVQYXRoOiAnfi8uYXdzL2NyZWRlbnRpYWxzJyxcbiAgcHJvZmlsZU5hbWU6ICdkZWZhdWx0JyxcbiAgdGltZW91dE1zOiAzMDAwLFxuICBjYWxsYmFjazogZnVuY3Rpb24oZXJyOiBFcnJvciB8IG51bGwsIHJlc3VsdDogYW55KSB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignTGFtYmRhIGV4ZWN1dGlvbiBmYWlsZWQ6JywgZXJyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ0xhbWJkYSBleGVjdXRpb24gcmVzdWx0OicsIEpTT04uc3RyaW5naWZ5KHJlc3VsdCwgbnVsbCwgMikpO1xuICAgIH1cbiAgICBcbiAgICAvLyBSZXN0b3JlIG9yaWdpbmFsIEFXUyBTREtcbiAgICBBV1MuRHluYW1vREIuRG9jdW1lbnRDbGllbnQgPSBvcmlnaW5hbERvY3VtZW50Q2xpZW50O1xuICB9XG59KS5jYXRjaChlcnIgPT4ge1xuICBjb25zb2xlLmVycm9yKCdMYW1iZGEtbG9jYWwgZXhlY3V0aW9uIGVycm9yOicsIGVycik7XG4gIC8vIFJlc3RvcmUgb3JpZ2luYWwgQVdTIFNES1xuICBBV1MuRHluYW1vREIuRG9jdW1lbnRDbGllbnQgPSBvcmlnaW5hbERvY3VtZW50Q2xpZW50O1xufSk7ICJdfQ==