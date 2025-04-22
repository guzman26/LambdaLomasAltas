"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const dynamoDB = new aws_sdk_1.default.DynamoDB.DocumentClient();
const BOX_REGEX = /^[0-9]{15}$/;
/**
 * Modelo para la entidad Caja (Box)
 */
class Box {
    /**
     * Validates a box code
     * @param code - Box code
     * @returns Is valid
     */
    static isValidBoxCode(code) {
        return BOX_REGEX.test(code);
    }
    /**
     * Extracts the fecha-calibre-formato from a box code
     * @param boxCode - Complete box code
     * @returns 9-digit FCF code
     */
    static extractFCF(boxCode) {
        if (!this.isValidBoxCode(boxCode)) {
            throw new Error(`Invalid box code: ${boxCode}`);
        }
        return boxCode.slice(0, 9);
    }
    /**
     * Returns the name of the DynamoDB table for boxes
     * @returns Table name
     */
    static getTableName() {
        return process.env.BOXES_TABLE_NAME || 'Boxes';
    }
}
exports.default = Box;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQm94LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbW9kZWxzL0JveC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHNEQUEwQjtBQUMxQixNQUFNLFFBQVEsR0FBRyxJQUFJLGlCQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBRW5ELE1BQU0sU0FBUyxHQUFHLGFBQWEsQ0FBQztBQUVoQzs7R0FFRztBQUNILE1BQU0sR0FBRztJQUNQOzs7O09BSUc7SUFDSCxNQUFNLENBQUMsY0FBYyxDQUFDLElBQVk7UUFDaEMsT0FBTyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFlO1FBQy9CLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDbEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQkFBcUIsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBQ0QsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsTUFBTSxDQUFDLFlBQVk7UUFDakIsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixJQUFJLE9BQU8sQ0FBQztJQUNqRCxDQUFDO0NBQ0Y7QUFFRCxrQkFBZSxHQUFHLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQVdTIGZyb20gJ2F3cy1zZGsnO1xuY29uc3QgZHluYW1vREIgPSBuZXcgQVdTLkR5bmFtb0RCLkRvY3VtZW50Q2xpZW50KCk7XG5cbmNvbnN0IEJPWF9SRUdFWCA9IC9eWzAtOV17MTV9JC87XG5cbi8qKlxuICogTW9kZWxvIHBhcmEgbGEgZW50aWRhZCBDYWphIChCb3gpXG4gKi9cbmNsYXNzIEJveCB7XG4gIC8qKlxuICAgKiBWYWxpZGF0ZXMgYSBib3ggY29kZVxuICAgKiBAcGFyYW0gY29kZSAtIEJveCBjb2RlXG4gICAqIEByZXR1cm5zIElzIHZhbGlkXG4gICAqL1xuICBzdGF0aWMgaXNWYWxpZEJveENvZGUoY29kZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIEJPWF9SRUdFWC50ZXN0KGNvZGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4dHJhY3RzIHRoZSBmZWNoYS1jYWxpYnJlLWZvcm1hdG8gZnJvbSBhIGJveCBjb2RlXG4gICAqIEBwYXJhbSBib3hDb2RlIC0gQ29tcGxldGUgYm94IGNvZGVcbiAgICogQHJldHVybnMgOS1kaWdpdCBGQ0YgY29kZVxuICAgKi9cbiAgc3RhdGljIGV4dHJhY3RGQ0YoYm94Q29kZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAoIXRoaXMuaXNWYWxpZEJveENvZGUoYm94Q29kZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBib3ggY29kZTogJHtib3hDb2RlfWApO1xuICAgIH1cbiAgICByZXR1cm4gYm94Q29kZS5zbGljZSgwLCA5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBuYW1lIG9mIHRoZSBEeW5hbW9EQiB0YWJsZSBmb3IgYm94ZXNcbiAgICogQHJldHVybnMgVGFibGUgbmFtZVxuICAgKi9cbiAgc3RhdGljIGdldFRhYmxlTmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBwcm9jZXNzLmVudi5CT1hFU19UQUJMRV9OQU1FIHx8ICdCb3hlcyc7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQm94OyAiXX0=