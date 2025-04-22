declare const _default: {
    create: (boxData: Partial<import("../../types").Box>) => Promise<import("../../types").Box>;
    read: {
        getUnassignedBoxesInPacking: typeof import("./read").getUnassignedBoxesInPacking;
        getBoxesByLocation: typeof import("./read").getBoxesByLocation;
        getAllBoxes: typeof import("./read").getAllBoxes;
        getBoxesByDate: typeof import("./read").getBoxesByDate;
    };
    update: (codigo: string, updateData: Partial<import("../../types").Box>) => Promise<import("../../types").Box>;
    delete: (codigo: string) => Promise<import("./delete").DeleteResult>;
};
export default _default;
