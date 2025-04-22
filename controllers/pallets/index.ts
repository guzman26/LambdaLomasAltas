import { createPallet } from './create';
import * as read from './read';
import * as update from './update';
import deletePallet from './delete';

export default {
  create: {
    createPallet
  },
  read,
  update,
  delete: deletePallet
}; 