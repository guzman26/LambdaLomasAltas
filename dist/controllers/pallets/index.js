"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const create_1 = __importDefault(require("./create"));
const read_1 = __importDefault(require("./read"));
const update_1 = __importDefault(require("./update"));
const delete_1 = __importDefault(require("./delete"));
exports.default = {
    create: {
        createPallet: create_1.default
    },
    read: read_1.default,
    update: update_1.default,
    delete: delete_1.default
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9jb250cm9sbGVycy9wYWxsZXRzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsc0RBQW9DO0FBQ3BDLGtEQUEwQjtBQUMxQixzREFBOEI7QUFDOUIsc0RBQW9DO0FBRXBDLGtCQUFlO0lBQ2IsTUFBTSxFQUFFO1FBQ04sWUFBWSxFQUFaLGdCQUFZO0tBQ2I7SUFDRCxJQUFJLEVBQUosY0FBSTtJQUNKLE1BQU0sRUFBTixnQkFBTTtJQUNOLE1BQU0sRUFBRSxnQkFBWTtDQUNyQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNyZWF0ZVBhbGxldCBmcm9tICcuL2NyZWF0ZSc7XG5pbXBvcnQgcmVhZCBmcm9tICcuL3JlYWQnO1xuaW1wb3J0IHVwZGF0ZSBmcm9tICcuL3VwZGF0ZSc7XG5pbXBvcnQgZGVsZXRlUGFsbGV0IGZyb20gJy4vZGVsZXRlJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBjcmVhdGU6IHtcbiAgICBjcmVhdGVQYWxsZXRcbiAgfSxcbiAgcmVhZCxcbiAgdXBkYXRlLFxuICBkZWxldGU6IGRlbGV0ZVBhbGxldFxufTsgIl19