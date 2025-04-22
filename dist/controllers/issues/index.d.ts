import * as read from './read';
import * as update from './update';
declare const _default: {
    create: (descripcion: string) => Promise<import("../../types").ApiResponse>;
    read: typeof read;
    update: typeof update;
    delete: (issueId: string) => Promise<import("../../types").ApiResponse>;
};
export default _default;
