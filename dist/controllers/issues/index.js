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
const create_1 = __importDefault(require("./create"));
const read = __importStar(require("./read"));
const update = __importStar(require("./update"));
const delete_1 = __importDefault(require("./delete"));
exports.default = {
    create: create_1.default,
    read,
    update,
    delete: delete_1.default
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9jb250cm9sbGVycy9pc3N1ZXMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxzREFBOEI7QUFDOUIsNkNBQStCO0FBQy9CLGlEQUFtQztBQUNuQyxzREFBbUM7QUFFbkMsa0JBQWU7SUFDYixNQUFNLEVBQU4sZ0JBQU07SUFDTixJQUFJO0lBQ0osTUFBTTtJQUNOLE1BQU0sRUFBRSxnQkFBVztDQUNwQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNyZWF0ZSBmcm9tICcuL2NyZWF0ZSc7XG5pbXBvcnQgKiBhcyByZWFkIGZyb20gJy4vcmVhZCc7XG5pbXBvcnQgKiBhcyB1cGRhdGUgZnJvbSAnLi91cGRhdGUnO1xuaW1wb3J0IGRlbGV0ZUlzc3VlIGZyb20gJy4vZGVsZXRlJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBjcmVhdGUsXG4gIHJlYWQsXG4gIHVwZGF0ZSxcbiAgZGVsZXRlOiBkZWxldGVJc3N1ZVxufTsgIl19