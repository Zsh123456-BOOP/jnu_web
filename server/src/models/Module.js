import { DataTypes, Model } from 'sequelize';

// Table: module
// Columns: id, name, slug, type, enabled, nav_visible, sort_order, config_json, created_at, updated_at
export class Module extends Model {}

export function initModule(sequelize) {
  Module.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(128),
        allowNull: false
      },
      slug: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: true
      },
      type: {
        type: DataTypes.ENUM(
          'SinglePage',
          'ListDetail',
          'ExternalLink',
          'LandingGrid',
          'Contact'
        ),
        allowNull: false
      },
      enabled: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1
      },
      nav_visible: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1
      },
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100
      },
      config_json: {
        type: DataTypes.JSON,
        allowNull: true
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
      tableName: 'module',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscored: true,
      indexes: [
        {
          unique: true,
          name: 'uk_module_slug',
          fields: ['slug']
        },
        {
          name: 'idx_module_enabled_sort',
          fields: ['enabled', 'sort_order']
        }
      ]
    }
  );

  return Module;
}
