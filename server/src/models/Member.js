import { DataTypes, Model } from 'sequelize';

// Table: member
// Columns: id, name, position, is_pi, research_interests, hobbies, email, image_asset_id,
//          sort_order, enabled, created_at, updated_at
export class Member extends Model { }

export function initMember(sequelize) {
  Member.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      position: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      type: {
        type: DataTypes.ENUM('in_service', 'student', 'alumni'),
        allowNull: false,
        defaultValue: 'student'
      },
      is_pi: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
      },
      research_interests: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      hobbies: {
        type: DataTypes.STRING(200),
        allowNull: true
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      image_asset_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true
      },
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      enabled: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      tableName: 'member',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscored: true,
      indexes: [
        {
          name: 'idx_member_enabled_sort',
          fields: ['enabled', 'sort_order', 'id']
        },
        {
          name: 'idx_member_pi_enabled_sort',
          fields: ['is_pi', 'enabled', 'sort_order', 'id']
        },
        {
          name: 'fk_member_image_asset',
          fields: ['image_asset_id']
        }
      ]
    }
  );

  return Member;
}
