/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 80040 (8.0.40)
 Source Host           : localhost:3306
 Source Schema         : lab_site

 Target Server Type    : MySQL
 Target Server Version : 80040 (8.0.40)
 File Encoding         : 65001

 Date: 23/01/2026 14:59:21
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for admin_user
-- ----------------------------
DROP TABLE IF EXISTS `admin_user`;
CREATE TABLE `admin_user`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login_at` datetime NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_admin_username`(`username` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of admin_user
-- ----------------------------
INSERT INTO `admin_user` VALUES (1, 'admin', '$2b$12$RcrFKorZmrdidqC.slgQbeFa11RaumCYa8eXWGrnhrDO3X1W7gzim', 1, '2026-01-23 06:47:43', '2025-12-31 23:17:38', '2026-01-23 06:47:43');

-- ----------------------------
-- Table structure for asset
-- ----------------------------
DROP TABLE IF EXISTS `asset`;
CREATE TABLE `asset`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `original_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `mime` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `size` bigint UNSIGNED NOT NULL,
  `relative_path` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `kind` enum('image','file') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'file',
  `width` int NULL DEFAULT NULL,
  `height` int NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_asset_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 44 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of asset
-- ----------------------------
INSERT INTO `asset` VALUES (25, '邓洁萍.jpg', 'image/jpeg', 221283, 'uploads/2026/01/3011d593-bc75-4f21-9e81-8c923e266c4d____.jpg', 'image', NULL, NULL, '2026-01-08 23:20:07');
INSERT INTO `asset` VALUES (26, '赖文普.jpg', 'image/jpeg', 41587, 'uploads/2026/01/4cb35d52-ecfb-4ea0-a93c-a718850524c3____.jpg', 'image', NULL, NULL, '2026-01-08 23:20:13');
INSERT INTO `asset` VALUES (27, '茅立鹏.png', 'image/png', 455072, 'uploads/2026/01/7bdf3a0d-174e-431f-a256-341fdb1e7763____.png', 'image', NULL, NULL, '2026-01-08 23:20:22');
INSERT INTO `asset` VALUES (28, '黄博亚.jpg', 'image/jpeg', 147039, 'uploads/2026/01/4a01ea7a-3f9c-4a6b-880c-f8765fbed0b0____.jpg', 'image', NULL, NULL, '2026-01-08 23:20:33');
INSERT INTO `asset` VALUES (29, '朱悦.jpg', 'image/jpeg', 4192837, 'uploads/2026/01/e28e7622-1cbd-4a25-ba20-9220a655bda4___.jpg', 'image', NULL, NULL, '2026-01-08 23:20:39');
INSERT INTO `asset` VALUES (30, '何人可.jpg', 'image/jpeg', 413721, 'uploads/2026/01/5352ca0a-d934-4614-b5cf-f92cab059af6____.jpg', 'image', NULL, NULL, '2026-01-08 23:20:46');
INSERT INTO `asset` VALUES (31, '黄夏璇.jpg', 'image/jpeg', 98445, 'uploads/2026/01/38324481-5414-43e3-9d02-329cf907bd4b____.jpg', 'image', NULL, NULL, '2026-01-08 23:20:56');
INSERT INTO `asset` VALUES (32, '许秀丽.jpg', 'image/jpeg', 47064, 'uploads/2026/01/a5f5dfe2-d8cc-460e-9b62-b1f8d17eb7e7____.jpg', 'image', NULL, NULL, '2026-01-08 23:21:03');
INSERT INTO `asset` VALUES (33, '李天一.jpg', 'image/jpeg', 1434787, 'uploads/2026/01/9f52ed8f-caf9-4806-94e9-95961cc04b85____.jpg', 'image', NULL, NULL, '2026-01-08 23:21:10');
INSERT INTO `asset` VALUES (34, '李启煜.png', 'image/png', 44085, 'uploads/2026/01/c4ede923-13b4-43b0-8916-e7a293fa6267____.png', 'image', NULL, NULL, '2026-01-08 23:21:19');
INSERT INTO `asset` VALUES (35, '李晨阳.jpg', 'image/jpeg', 4899905, 'uploads/2026/01/085e667b-d57b-4210-8fd2-395388c15d1e____.jpg', 'image', NULL, NULL, '2026-01-08 23:21:31');
INSERT INTO `asset` VALUES (36, '吴铠悦.jpg', 'image/jpeg', 165931, 'uploads/2026/01/b30038b7-fb1b-4e6e-a8af-12c2b362ebb6____.jpg', 'image', NULL, NULL, '2026-01-08 23:21:40');
INSERT INTO `asset` VALUES (37, '何莉.jpg', 'image/jpeg', 177874, 'uploads/2026/01/2b8e3026-acc1-4f32-a2b5-3c7adc68b0ce___.jpg', 'image', NULL, NULL, '2026-01-08 23:21:48');
INSERT INTO `asset` VALUES (38, '廖影仙.jpg', 'image/jpeg', 925092, 'uploads/2026/01/3bc8eae0-b109-41f8-8125-7446c2971feb____.jpg', 'image', NULL, NULL, '2026-01-08 23:21:55');
INSERT INTO `asset` VALUES (39, '文蕊.jpg', 'image/jpeg', 184277, 'uploads/2026/01/5fbd11c4-bbb4-44de-b145-d730bc9825fa___.jpg', 'image', NULL, NULL, '2026-01-08 23:22:03');
INSERT INTO `asset` VALUES (40, '邓琴.jpg', 'image/jpeg', 97254, 'uploads/2026/01/993e34dd-76ee-4cb4-9c8a-0fcafd711a4f___.jpg', 'image', NULL, NULL, '2026-01-08 23:22:10');
INSERT INTO `asset` VALUES (41, '199ab489-2c13-43dd-93b1-a3dc7b2ae21f_s.png', 'image/png', 68051, 'uploads/2026/01/23aece31-311c-4e9f-8f1f-233b3186addf_199ab489-2c13-43dd-93b1-a3dc7b2ae21f_s.png', 'image', NULL, NULL, '2026-01-16 11:45:35');
INSERT INTO `asset` VALUES (42, '858a4953-b61c-40ce-bec3-576ab7239812_s.jpg', 'image/jpeg', 7429, 'uploads/2026/01/a2493006-5e3c-4eb7-96bd-69beffa1e4a9_858a4953-b61c-40ce-bec3-576ab7239812_s.jpg', 'image', NULL, NULL, '2026-01-16 12:02:05');
INSERT INTO `asset` VALUES (43, '5d3fa8f6-4a49-4e60-aee5-5e13719f0313.png', 'image/png', 83422, 'uploads/2026/01/0c75dfdf-81f8-445a-8a6b-464acff066d5_5d3fa8f6-4a49-4e60-aee5-5e13719f0313.png', 'image', NULL, NULL, '2026-01-17 02:02:00');

-- ----------------------------
-- Table structure for content
-- ----------------------------
DROP TABLE IF EXISTS `content`;
CREATE TABLE `content`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `module_id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `status` enum('draft','published') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'draft',
  `content_format` enum('markdown','richtext') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'markdown',
  `content_md` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `content_html` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `summary` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `cover_asset_id` bigint UNSIGNED NULL DEFAULT NULL,
  `year` int NULL DEFAULT NULL,
  `tags_json` json NULL,
  `authors_json` json NULL,
  `meta_json` json NULL,
  `published_at` datetime NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_content_module_slug`(`module_id` ASC, `slug` ASC) USING BTREE,
  INDEX `idx_content_module_status`(`module_id` ASC, `status` ASC) USING BTREE,
  INDEX `idx_content_year`(`year` ASC) USING BTREE,
  INDEX `idx_content_published_at`(`published_at` ASC) USING BTREE,
  INDEX `fk_content_cover_asset`(`cover_asset_id` ASC) USING BTREE,
  CONSTRAINT `fk_content_cover_asset` FOREIGN KEY (`cover_asset_id`) REFERENCES `asset` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_content_module` FOREIGN KEY (`module_id`) REFERENCES `module` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 20 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of content
-- ----------------------------
INSERT INTO `content` VALUES (1, 2, 'About the Laboratory', 'overview', 'published', 'markdown', 'We are an interdisciplinary lab working at the intersection of bioinformatics, machine learning, and biomedical data systems.\n\n## Focus Areas\n- Single-cell and spatial omics analysis\n- AI-assisted biomedical knowledge extraction\n- Reproducible data pipelines and tooling\n\n## Values\nReproducibility, openness, and rigorous evaluation.\n', NULL, 'Short overview of the laboratory mission, focus areas, and values.', NULL, NULL, '[\"about\", \"lab\", \"mission\"]', '[\"Lab Admin\"]', '{\"page\": \"about\", \"layout\": \"single\"}', '2025-12-20 10:00:00', '2026-01-01 16:21:17', '2026-01-01 20:11:47');
INSERT INTO `content` VALUES (2, 9, 'Editorial Services', 'services', 'published', 'richtext', NULL, '<h1>Editorial Services</h1>\r\n<p>We provide scientific editing and technical review support for manuscripts, grant proposals, and technical reports.</p>\r\n<h2>Scope</h2>\r\n<ul>\r\n  <li>Clarity and structure improvements</li>\r\n  <li>Consistency checks for figures/tables/citations</li>\r\n  <li>Reproducibility and methods review</li>\r\n</ul>\r\n<p><strong>Note:</strong> We do not guarantee acceptance outcomes.</p>', 'Editing and technical review support scope and process.', NULL, NULL, '[\"editorial\", \"service\", \"manuscript\"]', '[{\"name\": \"Editorial Team\", \"affiliation\": \"Lab Site\"}]', '{\"page\": \"editorial-services\", \"layout\": \"single\"}', '2025-12-22 09:30:00', '2026-01-01 16:21:17', '2026-01-01 16:21:17');
INSERT INTO `content` VALUES (3, 3, 'AI for Educational Video Understanding', 'ai-edu-video-understanding', 'published', 'markdown', '# AI for Educational Video Understanding\r\nWe study long-form instructional video structuring, semantic indexing, and reliable stage segmentation from ASR transcripts.\r\n\r\n## Highlights\r\n- Structure-aware retrieval augmentation\r\n- Semantic-time alignment evaluation\r\n- Lightweight models under constrained compute\r\n', NULL, 'Long-form instructional video structuring and segmentation from transcripts.', NULL, 2025, '[\"research\", \"rag\", \"video\"]', '[{\"name\": \"Siu Ki Cheung\", \"role\": \"Lead\"}]', '{\"topic\": \"education-ai\", \"keywords\": [\"RAG\", \"segmentation\", \"ASR\"]}', '2025-11-15 14:00:00', '2026-01-01 16:21:17', '2026-01-01 16:21:17');
INSERT INTO `content` VALUES (4, 3, 'Single-cell Omics Pipeline Engineering', 'single-cell-pipeline-engineering', 'published', 'markdown', '# Single-cell Omics Pipeline Engineering\r\nWe build end-to-end pipelines for QC, normalization, clustering, and downstream differential analysis with reproducible outputs.\r\n\r\n## Components\r\n- Data ingestion (10x / AnnData)\r\n- QC metrics and filtering\r\n- Doublet detection\r\n- UMAP + clustering\r\n', NULL, 'Reproducible engineering of scanpy-based single-cell pipelines.', NULL, 2025, '[\"research\", \"scRNA-seq\", \"pipeline\"]', '[{\"name\": \"Lab Admin\", \"role\": \"Maintainer\"}]', '{\"stack\": [\"scanpy\", \"anndata\"], \"topic\": \"single-cell\"}', '2025-10-08 16:30:00', '2026-01-01 16:21:17', '2026-01-01 16:21:17');
INSERT INTO `content` VALUES (5, 4, 'Adobe Photoshop', 'scanpy-mcp-server', 'published', 'markdown', 'Adobe Photoshop（简称PS）是Adobe公司开发的专业图像处理软件，自1990年发布以来，凭借其强大的功能与广泛的应用领域，成为图像处理领域的标杆。它支持图像编辑、合成、校色、特效制作及绘画等功能，提供图层管理、蒙版、滤镜等核心工具，能精准处理像素级图像细节。PS广泛应用于平面设计、广告摄影、网页设计、影像创意及后期修饰等领域，无论是修复照片瑕疵、创作艺术作品，还是设计海报、界面，都能为用户提供高效支持。\n\n下载链接：\n通过网盘分享的文件：Adobe_Photoshop_2025_26.10.0.7_x64.zip\n链接: https://pan.baidu.com/s/1UWhCjhW8JWtqXm8KXH1LVg?pwd=u2e7 提取码: u2e7 \n--来自百度网盘超级会员v7的分享', NULL, 'Adobe Photoshop（简称PS）是Adobe公司开发的专业图像处理软件，自1990年发布以来，凭借其强大的功能与广泛的应用领域，成为图像处理领域的标杆。', NULL, 2025, '[\"software\", \"tooling\", \"single-cell\"]', '[\"Lab Admin\"]', '{\"repo\": \"scanpy-mcp-server\", \"status\": \"active\", \"license\": \"MIT\"}', '2025-09-01 12:00:00', '2026-01-01 16:21:17', '2026-01-16 11:44:20');
INSERT INTO `content` VALUES (6, 4, 'Adobe Ilustrator', 'forestrag-teaching-toolkit', 'published', 'markdown', 'Adobe Illustrator（简称AI）是Adobe公司开发的矢量图形设计软件，自1987年发布以来，凭借其强大的功能和广泛的应用领域，成为设计师们的首选工具。它支持通过钢笔工具和贝塞尔曲线精确绘制矢量图形，图形可无限缩放而不失真，适用于印刷出版、海报设计、品牌标识、UI设计及插画创作等领域。软件集成文字处理、上色、渐变、图层管理等功能，支持Pantone国际标准色卡，并与Photoshop等Adobe软件无缝协作，极大提升了设计效率与创意实现能力。\n\n下载链接：\n通过网盘分享的文件：Adobe_Illustrator_2025_29.7.1.8_x64.zip\n链接: https://pan.baidu.com/s/1Alt0KiBEk34D80zQeJw8bA?pwd=qfyg 提取码: qfyg \n--来自百度网盘超级会员v7的分享', NULL, 'Adobe Illustrator（简称AI）是Adobe公司开发的矢量图形设计软件，自1987年发布以来，凭借其强大的功能和广泛的应用领域，成为设计师们的首选工具。', NULL, 2026, '[\"software\", \"rag\", \"education\"]', '[\"Siu Ki Cheung\"]', '{\"repo\": \"ForestRAG-Teaching\", \"status\": \"draft\"}', '2026-01-01 20:10:47', '2026-01-01 16:21:17', '2026-01-16 11:44:07');
INSERT INTO `content` VALUES (7, 5, 'MIST: An interpretable and flexible deep learning framework for single-T cell transcriptome and receptor analysis', 'forestrag-structure-aware-rag', 'published', 'markdown', 'Wenpu Lai*, Yangqiu Li, Oscar Junhong Luo#\n\nAbstract:\nJoint analysis of transcriptomic and T cell receptor (TCR) features at single-cell resolution provides a powerful approach for in-depth T cell immune function research. Here, we introduce a deep learning framework for single-T cell transcriptome and receptor analysis, MIST (Multi-insight for T cell). MIST features three latent spaces: gene expression, TCR, and a joint latent space. Through analyses of antigen-specific T cells, and T cell datasets related to lung cancer immunotherapy and COVID19, we demonstrate MIST\'s interpretability and flexibility. MIST easily and accurately resolves cell function and antigen specificity by vectorizing and integrating transcriptome and TCR data of T cells. In addition, using MIST, we identified the heterogeneity of CXCL13+ subsets in lung cancer infiltrating CD8+ T cells and their association with immunotherapy, providing additional insights into the functional transition of CXCL13+ T cells related to anti-PD-1 therapy that were not reported in the original study.', NULL, 'Sci Adv. 2025 Apr 4;11(14):eadr7134. doi: 10.1126/sciadv.adr7134. Epub 2025 Apr 4.', NULL, 2025, '[\"publication\", \"rag\", \"education\"]', '[\"Siu Ki Cheung\", \"Lab Collaborator\"]', '{\"doi\": null, \"links\": [], \"venue\": \"Preprint\"}', '2025-04-11 00:00:00', '2026-01-01 16:21:17', '2026-01-20 09:06:01');
INSERT INTO `content` VALUES (8, 5, 'Deciphering Immunosenescence From Child to Frailty: Transcriptional Changes, Inflammation Dynamics, and Adaptive Immune Alterations', 'evidential-uncertainty-kt', 'published', 'markdown', 'Wenpu Lai*, Qiuyue Feng*, Wen Lei*, Chanchan Xiao, Juan Wang, Yi Zhu, Lipeng Mao, Yue Zhu, Jiacheng He, Yangqiu Li, Hao Wang#, Zhenhua Li#, Guobing Chen#, Oscar Junhong Luo#\n\nAbstract:\nAging induces significant alterations in the immune system, with immunosenescence contributing to age-related diseases. Peripheral blood mononuclear cells (PBMCs) offer a convenient and comprehensive snapshot of the body\'s immune status. In this study, we performed an integrated analysis of PBMCs using both bulk-cell and single-cell RNA-seq data, spanning from children to frail elderlies, to investigate age-related changes. We observed dynamic changes in the PBMC transcriptome during healthy aging, including dramatic shifts in inflammation, myeloid cells, and lymphocyte features during early life, followed by relative stability in later stages. Conversely, frail elderly individuals exhibited notable disruptions in peripheral immune cells, including an increased senescent phenotype in monocytes with elevated inflammatory cytokine expression, heightened effector activation in regulatory T cells, and functional impairment of cytotoxic lymphocytes. Overall, this study provides valuable insights into the complex dynamics of immunosenescence, elucidating the mechanisms driving abnormal inflammation and immunosuppression in frailty.', NULL, 'Aging Cell. 2025 Jul;24(7):e70082. doi: 10.1111/acel.70082. Epub 2025 Apr 26.', NULL, 2024, '[\"publication\", \"kt\", \"uncertainty\"]', '[\"Lab Admin\"]', '{\"doi\": null, \"links\": [], \"venue\": \"Workshop\"}', '2025-07-24 02:00:00', '2026-01-01 16:21:17', '2026-01-20 09:06:31');
INSERT INTO `content` VALUES (9, 6, 'Siu Ki Cheung', 'siu-ki-cheung', 'published', 'richtext', NULL, '<h1>Siu Ki Cheung</h1>\r\n<p><strong>Role:</strong> Research Lead</p>\r\n<p><strong>Interests:</strong> Retrieval-augmented generation, long-form understanding, evaluation, reproducibility.</p>\r\n<p><strong>Email:</strong> admin@lab.local</p>', 'Research lead focusing on RAG and long-form understanding.', NULL, NULL, '[\"people\", \"lead\"]', '[]', '{\"person\": {\"email\": \"admin@lab.local\", \"links\": [], \"position\": \"Research Lead\"}}', '2025-12-15 09:00:00', '2026-01-01 16:21:17', '2026-01-01 16:21:17');
INSERT INTO `content` VALUES (10, 6, 'Lab Engineer', 'lab-engineer', 'published', 'markdown', '# Lab Engineer\r\n**Role:** Infrastructure & Data Engineering\r\n\r\n## Responsibilities\r\n- Deployment and CI\r\n- Dataset versioning and backups\r\n- Performance monitoring\r\n', NULL, 'Infrastructure and data engineering for lab systems.', NULL, NULL, '[\"people\", \"engineering\"]', '[]', '{\"person\": {\"email\": \"eng@lab.local\", \"position\": \"Engineer\"}}', '2025-11-20 11:00:00', '2026-01-01 16:21:17', '2026-01-01 16:21:17');
INSERT INTO `content` VALUES (11, 7, 'Partner Institute A', 'partner-institute-a', 'published', 'markdown', '# Partner Institute A\r\nCollaboration on multi-center data integration and benchmarking.\r\n\r\n- Focus: translational bioinformatics\r\n- Joint projects: pipeline standardization\r\n', NULL, 'Collaboration on data integration and benchmarking.', NULL, NULL, '[\"collaboration\", \"partner\"]', '[{\"name\": \"Coordinator\", \"affiliation\": \"Partner Institute A\"}]', '{\"org\": \"Partner Institute A\", \"type\": \"institute\"}', '2025-08-05 15:00:00', '2026-01-01 16:21:17', '2026-01-01 16:21:17');
INSERT INTO `content` VALUES (12, 8, 'Intro to Bioinformatics Pipelines', 'intro-bioinformatics-pipelines', 'published', 'richtext', NULL, '<h1>Intro to Bioinformatics Pipelines</h1>\r\n<p>A short course covering reproducible analysis workflows, data QC, and reporting.</p>\r\n<ul>\r\n  <li>Module 1: Data formats and ingestion</li>\r\n  <li>Module 2: QC and filtering</li>\r\n  <li>Module 3: Reporting and reproducibility</li>\r\n</ul>', 'Short course on reproducible analysis workflows and QC.', NULL, 2025, '[\"course\", \"bioinformatics\"]', '[{\"name\": \"Lab Admin\", \"role\": \"Instructor\"}]', '{\"course\": {\"level\": \"beginner\", \"duration\": \"4 weeks\"}}', '2025-09-12 09:00:00', '2026-01-01 16:21:17', '2026-01-01 16:21:17');
INSERT INTO `content` VALUES (14, 11, 'Useful Links', 'useful-links', 'published', 'markdown', '# Useful Links\r\nA curated list of external resources used by the lab.\r\n', NULL, 'Curated external resources.', NULL, NULL, '[\"links\", \"resources\"]', '[]', '{\"links\": [{\"url\": \"https://github.com/\", \"label\": \"GitHub\"}, {\"url\": \"https://scanpy.readthedocs.io/\", \"label\": \"Scanpy\"}]}', '2025-07-01 10:00:00', '2026-01-01 16:21:17', '2026-01-01 16:21:17');
INSERT INTO `content` VALUES (15, 4, 'Endnote X9', 'software', 'published', 'markdown', 'EndNote X9是由Clarivate Analytics公司开发的专业文献管理与参考文献引用软件，广泛应用于学术研究和出版领域。它支持从在线数据库、图书馆目录及PDF文件等多种来源导入文献，并可对文献进行分类、标记、搜索和排序。EndNote X9内置数千种参考文献格式，能根据不同期刊要求自动格式化引用信息，与Microsoft Word等文字处理软件无缝集成，方便用户在写作时插入和管理参考文献。此外，它还支持多人协作、PDF标注、笔记添加及云同步等功能，极大提升了学术研究与论文撰写的效率。\n下载链接：\n通过网盘分享的文件：EndNote x9 for windows.zip\n链接: https://pan.baidu.com/s/1WNUt51vEqPtCNs2W38TXsA?pwd=xy6i 提取码: xy6i \n--来自百度网盘超级会员v7的分享', NULL, 'EndNote X9是由Clarivate Analytics公司开发的专业文献管理与参考文献引用软件，广泛应用于学术研究和出版领域。', NULL, 2024, '[\"AI\"]', '[]', '{}', '2026-01-14 16:00:00', '2026-01-16 12:06:07', '2026-01-16 12:07:17');
INSERT INTO `content` VALUES (16, 4, 'GraphPad Prism9', '', 'published', 'markdown', 'GraphPad Prism 9是一款专为科研设计的医学生物数据处理与绘图软件，集统计分析、曲线拟合及科技绘图于一体。它支持多种统计方法，如t检验、方差分析、非线性回归等，适用于不同类型的数据分析。软件提供丰富的图表类型，如柱状图、折线图、气泡图等，并支持自定义样式和配色方案，满足用户多样化需求。此外，Prism 9新增了主成分分析（PCA）等功能，优化了数据分析流程，提高了工作效率。其直观的用户界面和强大的功能，使得数据分析和图表制作变得更加简单高效。\n\n下载链接：\n通过网盘分享的文件：GraphPad Prism 9 for windows.zip\n链接: https://pan.baidu.com/s/1d9iF5YYH4-tMFQntkgobKQ?pwd=r79u 提取码: r79u \n--来自百度网盘超级会员v7的分享', NULL, 'GraphPad Prism 9是一款专为科研设计的医学生物数据处理与绘图软件，集统计分析、曲线拟合及科技绘图于一体。', NULL, 2026, '[\"AI\"]', '[]', '{}', '2026-01-15 16:00:00', '2026-01-16 13:03:30', '2026-01-17 09:44:39');
INSERT INTO `content` VALUES (19, 4, 'FlowJo 10.8', 'FlowJo 10.8', 'published', 'markdown', 'FlowJo 10.8 是一款专业的流式细胞数据分析软件，凭借其强大的兼容性、直观的操作界面和丰富的功能，成为科研人员的首选工具。它支持多种流式细胞仪数据格式，无需转换即可直接分析。软件采用阶梯式设门，简化复杂逻辑关系，提升分析效率。同时，它提供一维直方图、二维散点图及三维动态图表等多种可视化方式，满足不同分析需求。此外，FlowJo 10.8 还具备强大的批量处理功能，支持门的批处理和图形分析的批处理，大幅提高工作效率，是流式细胞数据分析领域的标杆软件。\n\n下载链接：\n通过网盘分享的文件：FlowJo_10.8.1 for windows.rar\n链接: https://pan.baidu.com/s/1OtmxUEzwZqeb8p3fTaDcQQ?pwd=j2pz 提取码: j2pz \n--来自百度网盘超级会员v7的分享', NULL, 'FlowJo 10.8 是一款专业的流式细胞数据分析软件，凭借其强大的兼容性、直观的操作界面和丰富的功能，成为科研人员的首选工具。', NULL, 2026, '[\"AI\"]', '[]', '{}', '2026-01-15 16:00:00', '2026-01-16 13:07:44', '2026-01-16 13:07:44');

-- ----------------------------
-- Table structure for member
-- ----------------------------
DROP TABLE IF EXISTS `member`;
CREATE TABLE `member`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `position` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `type` enum('in_service','student','alumni') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'student' COMMENT 'member type: in_service, student, alumni',
  `is_pi` tinyint(1) NOT NULL DEFAULT 0,
  `research_interests` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `hobbies` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `image_asset_id` bigint UNSIGNED NULL DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_member_enabled_sort`(`enabled` ASC, `sort_order` ASC, `id` ASC) USING BTREE,
  INDEX `fk_member_image_asset`(`image_asset_id` ASC) USING BTREE,
  INDEX `idx_member_pi_enabled_sort`(`is_pi` ASC, `enabled` ASC, `sort_order` ASC, `id` ASC) USING BTREE,
  CONSTRAINT `fk_member_image_asset` FOREIGN KEY (`image_asset_id`) REFERENCES `asset` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 20 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of member
-- ----------------------------
INSERT INTO `member` VALUES (1, '邓洁萍', '博士后', 'in_service', 0, '免疫衰老|多组学', '阅读|音乐', 'dengjp01@jnu.edu.cn', 25, 0, 1, '2026-01-07 13:34:18', '2026-01-18 07:06:09');
INSERT INTO `member` VALUES (2, '赖文普', '博士后', 'in_service', 0, 'AI for science|多组学|肿瘤免疫', '吉他', 'kyzy850520@163.com', 26, 0, 1, '2026-01-07 14:19:07', '2026-01-18 07:05:57');
INSERT INTO `member` VALUES (3, '茅立鹏', '博士后', 'in_service', 0, '衰老|多组学|人工智能', '读书', 'iammaolipeng@foxmail.com', 27, 0, 1, '2026-01-07 14:19:34', '2026-01-18 07:06:20');
INSERT INTO `member` VALUES (4, '黄博亚', '博士', 'student', 0, '脑膜瘤|脑转移瘤', '羽毛球', 'xiaonuo0917@163.com', 28, 0, 1, '2026-01-07 14:19:57', '2026-01-10 13:45:13');
INSERT INTO `member` VALUES (5, '朱悦', '博士', 'student', 0, '三维基因组学', '美食|旅游', 'yuezhu1113@163.com', 29, 0, 1, '2026-01-07 14:20:18', '2026-01-10 13:50:02');
INSERT INTO `member` VALUES (6, '何人可', '博士', 'student', 0, '肿瘤免疫|衰老', '旅行|美食', 'hrk1996@stu2023.jnu.edu.cn', 30, 0, 1, '2026-01-07 14:20:42', '2026-01-08 23:20:47');
INSERT INTO `member` VALUES (7, '黄夏璇', '博士', 'student', 0, '心脏瓣膜病的发病机制', '健身', 'hxx0601@stu2021.jnu.edu.cn', 31, 0, 1, '2026-01-07 14:21:05', '2026-01-08 23:20:57');
INSERT INTO `member` VALUES (8, '许秀丽', '博士', 'student', 0, '急性淋巴细胞白血病', '撸猫', 'xuxiuli725@163.com', 32, 0, 1, '2026-01-07 14:21:25', '2026-01-08 23:21:04');
INSERT INTO `member` VALUES (9, '李天一', '博士', 'student', 0, '衰老时钟|单细胞多组学', '篮球|电影', '723432253@qq.com', 33, 0, 1, '2026-01-07 14:21:45', '2026-01-08 23:21:11');
INSERT INTO `member` VALUES (10, '李启煜', '硕士', 'student', 0, '肿瘤免疫|单细胞测序', '乒乓球', 'm15302808910@126.com', 34, 0, 1, '2026-01-07 14:22:06', '2026-01-08 23:21:20');
INSERT INTO `member` VALUES (11, '李晨阳', '硕士', 'student', 0, '多组学|人工智能', '健身|旅游', 'eden96211@gmail.com', 35, 0, 1, '2026-01-07 14:22:33', '2026-01-08 23:21:32');
INSERT INTO `member` VALUES (12, '吴铠悦', '硕士', 'student', 0, '三维基因组|转录组', '看书|网球', 'w2353046666@163.com', 36, 0, 1, '2026-01-07 14:22:52', '2026-01-08 23:21:41');
INSERT INTO `member` VALUES (13, '何莉', '硕士', 'student', 0, '药学', '羽毛球', 'hlll2003@outlook.com', 37, 0, 1, '2026-01-07 14:23:30', '2026-01-17 01:32:26');
INSERT INTO `member` VALUES (14, '廖影仙', '硕士', 'student', 0, '免疫|生信', '搞抽象', '1596741873@qq.com', 38, 0, 1, '2026-01-07 14:23:52', '2026-01-08 23:21:56');
INSERT INTO `member` VALUES (15, '文蕊', '硕士', 'student', 0, '临床药理', '运动', '1440764559@qq.com', 39, 0, 1, '2026-01-07 14:24:11', '2026-01-16 12:03:06');
INSERT INTO `member` VALUES (16, '邓琴', '硕士', 'student', 0, 'CRISPR-cas9', '音乐', '18342604969@163.com', 40, 0, 1, '2026-01-07 14:24:31', '2026-01-16 12:02:48');
INSERT INTO `member` VALUES (17, '罗钧洪', '教授', 'in_service', 1, '系统生物医学，三维基因组学，人工智能', '足球（已挂靴）', 'luojh@jnu.edu.cn', 41, 0, 1, '2026-01-16 11:45:38', '2026-01-18 07:10:08');
INSERT INTO `member` VALUES (18, '李振华', '副教授', 'student', 1, '系统免疫学，多组学', '乒乓球', 'lizhenhua915@jnu.edu.cn', 42, 0, 1, '2026-01-16 12:02:08', '2026-01-16 12:02:08');
INSERT INTO `member` VALUES (19, '刘辰宇', '本科', 'student', 0, '人工智能', '代码算法', NULL, 43, 0, 1, '2026-01-17 02:02:04', '2026-01-18 07:07:11');

-- ----------------------------
-- Table structure for member_pi_info
-- ----------------------------
DROP TABLE IF EXISTS `member_pi_info`;
CREATE TABLE `member_pi_info`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `member_id` bigint UNSIGNED NOT NULL,
  `content_md` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `content_html` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `content_format` enum('markdown','richtext') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'markdown',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_member_pi_info_member_id`(`member_id` ASC) USING BTREE,
  CONSTRAINT `fk_member_pi_info_member` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of member_pi_info
-- ----------------------------
INSERT INTO `member_pi_info` VALUES (1, 17, '', NULL, 'markdown', '2026-01-17 01:42:14', '2026-01-17 01:59:36');

-- ----------------------------
-- Table structure for module
-- ----------------------------
DROP TABLE IF EXISTS `module`;
CREATE TABLE `module`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `slug` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `type` enum('SinglePage','ListDetail','ExternalLink','LandingGrid','Contact') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `nav_visible` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int NOT NULL DEFAULT 100,
  `config_json` json NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_module_slug`(`slug` ASC) USING BTREE,
  INDEX `idx_module_enabled_sort`(`enabled` ASC, `sort_order` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 14 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of module
-- ----------------------------
INSERT INTO `module` VALUES (1, 'Home', 'home', 'LandingGrid', 1, 0, 0, '{\"layout\": \"home\"}', '2025-12-31 23:17:38', '2025-12-31 23:17:38');
INSERT INTO `module` VALUES (2, 'About the Laboratory', 'about', 'SinglePage', 1, 0, 10, '{}', '2025-12-31 23:17:38', '2026-01-01 21:25:33');
INSERT INTO `module` VALUES (3, 'Research', 'research', 'ListDetail', 1, 1, 20, '{\"listFields\": [\"title\", \"summary\"]}', '2025-12-31 23:17:38', '2026-01-01 16:35:58');
INSERT INTO `module` VALUES (4, 'Software', 'software', 'ListDetail', 1, 1, 30, '{}', '2025-12-31 23:17:38', '2026-01-01 21:25:57');
INSERT INTO `module` VALUES (5, 'Publications', 'publications', 'ListDetail', 1, 1, 40, '{\"filters\": [\"year\", \"keyword\"]}', '2025-12-31 23:17:38', '2025-12-31 23:17:38');
INSERT INTO `module` VALUES (6, 'People', 'people', 'ListDetail', 0, 0, 50, '{}', '2025-12-31 23:17:38', '2026-01-18 07:04:17');
INSERT INTO `module` VALUES (7, 'Collaborators', 'collaborators', 'ListDetail', 1, 1, 60, '{}', '2025-12-31 23:17:38', '2026-01-18 07:13:54');
INSERT INTO `module` VALUES (8, 'Courses', 'courses', 'ListDetail', 0, 0, 70, '{}', '2025-12-31 23:17:38', '2026-01-18 07:04:49');
INSERT INTO `module` VALUES (9, 'Editorial Services', 'editorial-services', 'SinglePage', 0, 0, 80, '{}', '2025-12-31 23:17:38', '2026-01-18 07:02:21');
INSERT INTO `module` VALUES (10, 'Conferences', 'conferences', 'ListDetail', 0, 0, 90, '{\"filters\": [\"year\"]}', '2025-12-31 23:17:38', '2026-01-18 07:03:14');
INSERT INTO `module` VALUES (11, 'Links', 'links', 'ListDetail', 0, 0, 100, '{}', '2025-12-31 23:17:38', '2026-01-18 07:03:18');
INSERT INTO `module` VALUES (12, 'CPH', 'cph', 'ExternalLink', 1, 1, 120, '{\"url\": \"https://www.uth.edu/cph/\"}', '2025-12-31 23:17:38', '2026-01-01 14:08:16');
INSERT INTO `module` VALUES (13, 'Contact', 'contact', 'Contact', 1, 1, 110, '{}', '2025-12-31 23:17:38', '2026-01-01 14:08:15');

-- ----------------------------
-- Table structure for sessions
-- ----------------------------
DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions`  (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `expires` int UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`session_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sessions
-- ----------------------------
INSERT INTO `sessions` VALUES ('AIjlUlngkBJ7RrfGdnBslqZhJkIw01QC', 1769220877, '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2026-01-23T02:30:48.821Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"adminId\":1,\"username\":\"admin\"}');
INSERT INTO `sessions` VALUES ('BVSiNn52zwc-pEZSLQbGxP8rwGgEupQi', 1769237906, '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2026-01-24T06:47:43.538Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"adminId\":1,\"username\":\"admin\"}');
INSERT INTO `sessions` VALUES ('Jn_9sqRn8LbBRkABW6gP5B26qDdNwQUO', 1769236742, '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2026-01-24T06:28:39.270Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"adminId\":1,\"username\":\"admin\"}');

-- ----------------------------
-- Table structure for settings
-- ----------------------------
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings`  (
  `key` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `value_json` json NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of settings
-- ----------------------------
INSERT INTO `settings` VALUES ('site', '{\"logoText\": \"Research, people, and publications\", \"siteName\": \"Luo-Lab\", \"homeModules\": [{\"slug\": \"research\", \"title\": \"Research Areas\", \"description\": \"Explore our current projects and scientific focus.\"}, {\"slug\": \"software\", \"title\": \"Software & Tools\", \"description\": \"Open-source bioinformatics tools developed by our lab.\"}, {\"slug\": \"people\", \"title\": \"Meet the Team\", \"description\": \"Faculty, students, and alumni.\"}]}', '2026-01-23 06:48:56');
INSERT INTO `settings` VALUES ('site.footer', '{\"links\": [{\"items\": [{\"url\": \"/\", \"label\": \"Home\"}, {\"url\": \"/research\", \"label\": \"Research\"}, {\"url\": \"/people\", \"label\": \"Team\"}], \"title\": \"Quick Links\"}], \"contact\": {\"email\": \"lab@example.com\", \"address\": \"123 Research Road, City\"}}', '2026-01-01 21:28:23');
INSERT INTO `settings` VALUES ('site.meta', '{\"site_title\": \"JNU Web\", \"favicon_url\": \"\"}', '2026-01-23 14:58:06');

SET FOREIGN_KEY_CHECKS = 1;
