import { DataTypes, Model } from 'sequelize';

// Table: content
// Columns: id, module_id, title, slug, status, content_format, content_md, content_html, summary,
//          cover_asset_id, year, tags_json, authors_json, meta_json, published_at, created_at, updated_at
export class Content extends Model {}

export function initContent(sequelize) {
  Content.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      module_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('draft', 'published'),
        allowNull: false,
        defaultValue: 'draft'
      },
      content_format: {
        type: DataTypes.ENUM('markdown', 'richtext'),
        allowNull: false,
        defaultValue: 'markdown'
      },
      content_md: {
        type: DataTypes.TEXT('medium'),
        allowNull: true
      },
      content_html: {
        type: DataTypes.TEXT('medium'),
        allowNull: true
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      cover_asset_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      tags_json: {
        type: DataTypes.JSON,
        allowNull: true
      },
      authors_json: {
        type: DataTypes.JSON,
        allowNull: true
      },
      meta_json: {
        type: DataTypes.JSON,
        allowNull: true
      },
      published_at: {
        type: DataTypes.DATE,
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
      tableName: 'content',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscored: true,
      indexes: [
        {
          unique: true,
          name: 'uk_content_module_slug',
          fields: ['module_id', 'slug']
        },
        {
          name: 'idx_content_module_status',
          fields: ['module_id', 'status']
        },
        {
          name: 'idx_content_year',
          fields: ['year']
        },
        {
          name: 'idx_content_published_at',
          fields: ['published_at']
        },
        {
          name: 'fk_content_cover_asset',
          fields: ['cover_asset_id']
        }
      ]
    }
  );

  return Content;
}
