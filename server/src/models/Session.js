import { DataTypes, Model } from 'sequelize';

// Table: sessions
// Columns: session_id, expires, data
export class Session extends Model {}

export function initSession(sequelize) {
  Session.init(
    {
      session_id: {
        type: DataTypes.STRING(128),
        primaryKey: true
      },
      expires: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },
      data: {
        type: DataTypes.TEXT('medium'),
        allowNull: false
      }
    },
    {
      sequelize,
      tableName: 'sessions',
      timestamps: false
    }
  );

  return Session;
}
