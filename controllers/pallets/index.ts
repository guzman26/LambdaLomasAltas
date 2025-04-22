import createPallet from './create';
import read from './read';
import update from './update';
import deletePallet from './delete';

export default {
  create: {
    createPallet
  },
  read,
  update,
  delete: deletePallet
}; 