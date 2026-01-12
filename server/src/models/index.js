import { sequelize } from '../db/sequelize.js';
import { initAdminUser, AdminUser } from './AdminUser.js';
import { initAsset, Asset } from './Asset.js';
import { initContent, Content } from './Content.js';
import { initMember, Member } from './Member.js';
import { initMemberPiInfo, MemberPiInfo } from './MemberPiInfo.js';
import { initModule, Module } from './Module.js';
import { initSettings, Settings } from './Settings.js';
import { initSession, Session } from './Session.js';

initAdminUser(sequelize);
initAsset(sequelize);
initContent(sequelize);
initMember(sequelize);
initMemberPiInfo(sequelize);
initModule(sequelize);
initSettings(sequelize);
initSession(sequelize);

Module.hasMany(Content, { foreignKey: 'module_id' });
Content.belongsTo(Module, { foreignKey: 'module_id' });
Content.belongsTo(Asset, { foreignKey: 'cover_asset_id', as: 'cover_asset' });
Member.belongsTo(Asset, { foreignKey: 'image_asset_id', as: 'image' });
Member.hasOne(MemberPiInfo, { foreignKey: 'member_id', as: 'pi_info' });
MemberPiInfo.belongsTo(Member, { foreignKey: 'member_id' });

export { sequelize, AdminUser, Asset, Content, Member, MemberPiInfo, Module, Settings, Session };
