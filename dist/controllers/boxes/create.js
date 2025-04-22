"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const Box_1 = __importDefault(require("../../models/Box"));
const dynamoDB = new aws_sdk_1.default.DynamoDB.DocumentClient();
/**
 * Creates a new box record in the database
 *
 * @param {Object} boxData - The box data to be created
 * @returns {Promise<Box>} - The created box data
 */
const createBox = async (boxData) => {
    try {
        // Generate a unique ID or use one provided in boxData
        const item = {
            ...boxData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        const params = {
            TableName: Box_1.default.getTableName(),
            Item: item
        };
        await dynamoDB.put(params).promise();
        return item;
    }
    catch (error) {
        console.error('Error creating box:', error);
        throw error;
    }
};
exports.default = createBox;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vY29udHJvbGxlcnMvYm94ZXMvY3JlYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsc0RBQTBCO0FBRzFCLDJEQUF3QztBQUV4QyxNQUFNLFFBQVEsR0FBRyxJQUFJLGlCQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBRW5EOzs7OztHQUtHO0FBQ0gsTUFBTSxTQUFTLEdBQUcsS0FBSyxFQUFFLE9BQXFCLEVBQWdCLEVBQUU7SUFDOUQsSUFBSSxDQUFDO1FBQ0gsc0RBQXNEO1FBQ3RELE1BQU0sSUFBSSxHQUFpQjtZQUN6QixHQUFHLE9BQU87WUFDVixTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUU7WUFDbkMsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFO1NBQ3BDLENBQUM7UUFFRixNQUFNLE1BQU0sR0FBRztZQUNiLFNBQVMsRUFBRSxhQUFRLENBQUMsWUFBWSxFQUFFO1lBQ2xDLElBQUksRUFBRSxJQUFJO1NBQ1gsQ0FBQztRQUVGLE1BQU0sUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNyQyxPQUFPLElBQVcsQ0FBQztJQUNyQixDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMscUJBQXFCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDNUMsTUFBTSxLQUFLLENBQUM7SUFDZCxDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBRUYsa0JBQWUsU0FBUyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEFXUyBmcm9tICdhd3Mtc2RrJztcbmltcG9ydCB7IER5bmFtb0RiSXRlbSB9IGZyb20gJy4uLy4uL3R5cGVzJztcbmltcG9ydCB0eXBlIHsgQm94IH0gZnJvbSAnLi4vLi4vdHlwZXMnO1xuaW1wb3J0IEJveE1vZGVsIGZyb20gJy4uLy4uL21vZGVscy9Cb3gnO1xuXG5jb25zdCBkeW5hbW9EQiA9IG5ldyBBV1MuRHluYW1vREIuRG9jdW1lbnRDbGllbnQoKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGJveCByZWNvcmQgaW4gdGhlIGRhdGFiYXNlXG4gKiBcbiAqIEBwYXJhbSB7T2JqZWN0fSBib3hEYXRhIC0gVGhlIGJveCBkYXRhIHRvIGJlIGNyZWF0ZWRcbiAqIEByZXR1cm5zIHtQcm9taXNlPEJveD59IC0gVGhlIGNyZWF0ZWQgYm94IGRhdGFcbiAqL1xuY29uc3QgY3JlYXRlQm94ID0gYXN5bmMgKGJveERhdGE6IFBhcnRpYWw8Qm94Pik6IFByb21pc2U8Qm94PiA9PiB7XG4gIHRyeSB7XG4gICAgLy8gR2VuZXJhdGUgYSB1bmlxdWUgSUQgb3IgdXNlIG9uZSBwcm92aWRlZCBpbiBib3hEYXRhXG4gICAgY29uc3QgaXRlbTogRHluYW1vRGJJdGVtID0ge1xuICAgICAgLi4uYm94RGF0YSxcbiAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICB9O1xuXG4gICAgY29uc3QgcGFyYW1zID0ge1xuICAgICAgVGFibGVOYW1lOiBCb3hNb2RlbC5nZXRUYWJsZU5hbWUoKSxcbiAgICAgIEl0ZW06IGl0ZW1cbiAgICB9O1xuXG4gICAgYXdhaXQgZHluYW1vREIucHV0KHBhcmFtcykucHJvbWlzZSgpO1xuICAgIHJldHVybiBpdGVtIGFzIEJveDtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjcmVhdGluZyBib3g6JywgZXJyb3IpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVCb3g7ICJdfQ==