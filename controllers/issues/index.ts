import create from './create';
import * as read from './read';
import * as update from './update';
import deleteIssue from './delete';

export default {
  create,
  read,
  update,
  delete: deleteIssue
}; 