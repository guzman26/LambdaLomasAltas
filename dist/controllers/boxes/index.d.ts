import { Location } from '../../types';
declare const _default: {
    read: {
        getBoxesByLocation: (location: Location) => Promise<import("../../types").ApiResponse>;
        getBoxesByDate: (date: string) => Promise<import("../../types").ApiResponse>;
        getAllBoxes: () => Promise<import("../../types").ApiResponse>;
        getBoxByCode: (code: string) => Promise<import("../../types").ApiResponse>;
        getUnassignedBoxesInPacking: () => Promise<import("../../types").ApiResponse>;
    };
};
export default _default;
