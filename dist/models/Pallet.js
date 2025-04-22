"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const dynamoDB = new aws_sdk_1.default.DynamoDB.DocumentClient();
const PALLETS_TABLE = 'Pallets';
const MAX_BOXES_PER_PALLET = 60;
/**
 * Modelo para la entidad Pallet
 */
class Pallet {
    static getTableName() {
        return PALLETS_TABLE;
    }
    static getMaxBoxesPerPallet() {
        return MAX_BOXES_PER_PALLET;
    }
    /**
     * Validates a pallet id
     * @param palletId - Pallet ID
     * @returns Is valid
     */
    static isValidPalletId(palletId) {
        return !!palletId && typeof palletId === 'string';
    }
}
exports.default = Pallet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFsbGV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbW9kZWxzL1BhbGxldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHNEQUEwQjtBQUMxQixNQUFNLFFBQVEsR0FBRyxJQUFJLGlCQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBRW5ELE1BQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQztBQUNoQyxNQUFNLG9CQUFvQixHQUFHLEVBQUUsQ0FBQztBQUVoQzs7R0FFRztBQUNILE1BQU0sTUFBTTtJQUNWLE1BQU0sQ0FBQyxZQUFZO1FBQ2pCLE9BQU8sYUFBYSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxNQUFNLENBQUMsb0JBQW9CO1FBQ3pCLE9BQU8sb0JBQW9CLENBQUM7SUFDOUIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxNQUFNLENBQUMsZUFBZSxDQUFDLFFBQWlCO1FBQ3RDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRLENBQUM7SUFDcEQsQ0FBQztDQUNGO0FBRUQsa0JBQWUsTUFBTSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEFXUyBmcm9tICdhd3Mtc2RrJztcbmNvbnN0IGR5bmFtb0RCID0gbmV3IEFXUy5EeW5hbW9EQi5Eb2N1bWVudENsaWVudCgpO1xuXG5jb25zdCBQQUxMRVRTX1RBQkxFID0gJ1BhbGxldHMnO1xuY29uc3QgTUFYX0JPWEVTX1BFUl9QQUxMRVQgPSA2MDtcblxuLyoqXG4gKiBNb2RlbG8gcGFyYSBsYSBlbnRpZGFkIFBhbGxldFxuICovXG5jbGFzcyBQYWxsZXQge1xuICBzdGF0aWMgZ2V0VGFibGVOYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIFBBTExFVFNfVEFCTEU7XG4gIH1cblxuICBzdGF0aWMgZ2V0TWF4Qm94ZXNQZXJQYWxsZXQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gTUFYX0JPWEVTX1BFUl9QQUxMRVQ7XG4gIH1cblxuICAvKipcbiAgICogVmFsaWRhdGVzIGEgcGFsbGV0IGlkXG4gICAqIEBwYXJhbSBwYWxsZXRJZCAtIFBhbGxldCBJRFxuICAgKiBAcmV0dXJucyBJcyB2YWxpZFxuICAgKi9cbiAgc3RhdGljIGlzVmFsaWRQYWxsZXRJZChwYWxsZXRJZDogdW5rbm93bik6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIXBhbGxldElkICYmIHR5cGVvZiBwYWxsZXRJZCA9PT0gJ3N0cmluZyc7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGFsbGV0OyAiXX0=