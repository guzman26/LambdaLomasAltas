import createPallet from './create';
declare const _default: {
    create: {
        createPallet: typeof createPallet;
    };
    read: {
        getAllPallets: () => Promise<import("../../types").ApiResponse>;
        getActivePallets: () => Promise<import("../../types").ApiResponse>;
        getClosedPallets: (ubicacion?: string) => Promise<import("../../types").ApiResponse>;
    };
    update: {
        updatePalletLocation: (codigo: string, location: import("../../types").Location) => Promise<import("../../types").Pallet>;
        updatePalletStatus: (codigo: string, status: "ACTIVE" | "CLOSED") => Promise<import("../../types").Pallet>;
        addBoxToPallet: (palletCodigo: string, boxCodigo: string) => Promise<import("../../types").Pallet>;
    };
    delete: {
        deletePallet: (palletCode: string) => Promise<import("./delete").DeleteResult>;
    };
};
export default _default;
