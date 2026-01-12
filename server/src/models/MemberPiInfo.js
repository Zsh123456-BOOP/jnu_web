import { DataTypes, Model } from 'sequelize';

// Table: member_pi_info
export class MemberPiInfo extends Model { }

export function initMemberPiInfo(sequelize) {
    MemberPiInfo.init(
        {
            id: {
                type: DataTypes.BIGINT.UNSIGNED,
                primaryKey: true,
                autoIncrement: true
            },
            member_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                unique: true
            },
            content_md: {
                type: DataTypes.TEXT('medium'),
                allowNull: true
            },
            content_html: {
                type: DataTypes.TEXT('medium'),
                allowNull: true
            },
            content_format: {
                type: DataTypes.ENUM('markdown', 'richtext'),
                allowNull: false,
                defaultValue: 'markdown'
            }
        },
        {
            sequelize,
            tableName: 'member_pi_info',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            underscored: true
        }
    );

    return MemberPiInfo;
}
