"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const dynamoDB = new aws_sdk_1.default.DynamoDB.DocumentClient();
const ISSUES_TABLE = 'Issues';
/**
 * Modelo para la entidad Incidencia (Issue)
 */
class Issue {
    static getTableName() {
        return ISSUES_TABLE;
    }
    static getStatusValues() {
        return ['PENDING', 'IN_PROGRESS', 'RESOLVED'];
    }
    static isValidStatus(status) {
        return this.getStatusValues().includes(status);
    }
}
exports.default = Issue;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSXNzdWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9tb2RlbHMvSXNzdWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxzREFBMEI7QUFDMUIsTUFBTSxRQUFRLEdBQUcsSUFBSSxpQkFBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUVuRCxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUM7QUFJOUI7O0dBRUc7QUFDSCxNQUFNLEtBQUs7SUFDVCxNQUFNLENBQUMsWUFBWTtRQUNqQixPQUFPLFlBQVksQ0FBQztJQUN0QixDQUFDO0lBRUQsTUFBTSxDQUFDLGVBQWU7UUFDcEIsT0FBTyxDQUFDLFNBQVMsRUFBRSxhQUFhLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVELE1BQU0sQ0FBQyxhQUFhLENBQUMsTUFBYztRQUNqQyxPQUFPLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBcUIsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7Q0FDRjtBQUVELGtCQUFlLEtBQUssQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBBV1MgZnJvbSAnYXdzLXNkayc7XG5jb25zdCBkeW5hbW9EQiA9IG5ldyBBV1MuRHluYW1vREIuRG9jdW1lbnRDbGllbnQoKTtcblxuY29uc3QgSVNTVUVTX1RBQkxFID0gJ0lzc3Vlcyc7XG5cbnR5cGUgSXNzdWVTdGF0dXMgPSAnUEVORElORycgfCAnSU5fUFJPR1JFU1MnIHwgJ1JFU09MVkVEJztcblxuLyoqXG4gKiBNb2RlbG8gcGFyYSBsYSBlbnRpZGFkIEluY2lkZW5jaWEgKElzc3VlKVxuICovXG5jbGFzcyBJc3N1ZSB7XG4gIHN0YXRpYyBnZXRUYWJsZU5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gSVNTVUVTX1RBQkxFO1xuICB9XG4gIFxuICBzdGF0aWMgZ2V0U3RhdHVzVmFsdWVzKCk6IElzc3VlU3RhdHVzW10ge1xuICAgIHJldHVybiBbJ1BFTkRJTkcnLCAnSU5fUFJPR1JFU1MnLCAnUkVTT0xWRUQnXTtcbiAgfVxuXG4gIHN0YXRpYyBpc1ZhbGlkU3RhdHVzKHN0YXR1czogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U3RhdHVzVmFsdWVzKCkuaW5jbHVkZXMoc3RhdHVzIGFzIElzc3VlU3RhdHVzKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBJc3N1ZTsgIl19