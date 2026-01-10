import { DataTypes, Model } from 'sequelize';

// Table: settings
// Columns: key, value_json, updated_at
export class Settings extends Model {}

export function initSettings(sequelize) {
  Settings.init(
    {
      key: {
        type: DataTypes.STRING(128),
        primaryKey: true
      },
      value_json: {
        type: DataTypes.JSON,
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      tableName: 'settings',
      timestamps: false
    }
  );

  return Settings;
}
