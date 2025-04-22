import { createPallet } from './create';
import * as read from './read';
import * as update from './update';
import deletePallet from './delete';
declare const _default: {
    create: {
        createPallet: typeof createPallet;
    };
    read: typeof read;
    update: typeof update;
    delete: typeof deletePallet;
};
export default _default;
