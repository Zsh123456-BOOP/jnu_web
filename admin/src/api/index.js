import * as auth from './modules/auth';
import * as modules from './modules/modules';
import * as members from './modules/members';
import * as contents from './modules/contents';
import * as assets from './modules/assets';
import * as settings from './modules/settings';

const api = {
  auth,
  modules,
  members,
  contents,
  assets,
  settings
};

export { auth, modules, members, contents, assets, settings };
export default api;
