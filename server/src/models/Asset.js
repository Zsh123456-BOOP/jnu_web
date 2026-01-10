import { DataTypes, Model } from 'sequelize';

// Table: asset
// Columns: id, original_name, mime, size, relative_path, kind, width, height, created_at
export class Asset extends Model {}

export function initAsset(sequelize) {
  Asset.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      original_name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      mime: {
        type: DataTypes.STRING(128),
        allowNull: false
      },
      size: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      },
      relative_path: {
        type: DataTypes.STRING(512),
        allowNull: false
      },
      kind: {
        type: DataTypes.ENUM('image', 'file'),
        allowNull: false,
        defaultValue: 'file'
      },
      width: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      height: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      tableName: 'asset',
      timestamps: false,
      indexes: [
        {
          name: 'idx_asset_created_at',
          fields: ['created_at']
        }
      ]
    }
  );

  return Asset;
}
