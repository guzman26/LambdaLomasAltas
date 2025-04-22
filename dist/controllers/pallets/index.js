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
const create_1 = require("./create");
const read = __importStar(require("./read"));
const update = __importStar(require("./update"));
const delete_1 = __importDefault(require("./delete"));
exports.default = {
    create: {
        createPallet: create_1.createPallet
    },
    read,
    update,
    delete: delete_1.default
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9jb250cm9sbGVycy9wYWxsZXRzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEscUNBQXdDO0FBQ3hDLDZDQUErQjtBQUMvQixpREFBbUM7QUFDbkMsc0RBQW9DO0FBRXBDLGtCQUFlO0lBQ2IsTUFBTSxFQUFFO1FBQ04sWUFBWSxFQUFaLHFCQUFZO0tBQ2I7SUFDRCxJQUFJO0lBQ0osTUFBTTtJQUNOLE1BQU0sRUFBRSxnQkFBWTtDQUNyQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY3JlYXRlUGFsbGV0IH0gZnJvbSAnLi9jcmVhdGUnO1xuaW1wb3J0ICogYXMgcmVhZCBmcm9tICcuL3JlYWQnO1xuaW1wb3J0ICogYXMgdXBkYXRlIGZyb20gJy4vdXBkYXRlJztcbmltcG9ydCBkZWxldGVQYWxsZXQgZnJvbSAnLi9kZWxldGUnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGNyZWF0ZToge1xuICAgIGNyZWF0ZVBhbGxldFxuICB9LFxuICByZWFkLFxuICB1cGRhdGUsXG4gIGRlbGV0ZTogZGVsZXRlUGFsbGV0XG59OyAiXX0=