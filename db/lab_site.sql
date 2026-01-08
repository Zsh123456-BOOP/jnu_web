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

 Date: 08/01/2026 22:50:33
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
INSERT INTO `admin_user` VALUES (1, 'admin', '$2b$12$RcrFKorZmrdidqC.slgQbeFa11RaumCYa8eXWGrnhrDO3X1W7gzim', 1, '2026-01-07 13:33:07', '2025-12-31 23:17:38', '2026-01-07 13:33:07');

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
) ENGINE = InnoDB AUTO_INCREMENT = 17 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of asset
-- ----------------------------
INSERT INTO `asset` VALUES (1, 'éæ´è.jpg', 'image/jpeg', 221283, 'uploads/2026/01/d22dfe65-fff7-43f7-a2d7-6daba4c6ea56__________.jpg', 'image', NULL, NULL, '2026-01-07 13:34:10');
INSERT INTO `asset` VALUES (2, 'èµææ®.jpg', 'image/jpeg', 41587, 'uploads/2026/01/0cdb53e1-8009-4c1c-93f8-1e077afca59f__________.jpg', 'image', NULL, NULL, '2026-01-07 14:19:05');
INSERT INTO `asset` VALUES (3, 'èç«é¹.png', 'image/png', 455072, 'uploads/2026/01/90d819b9-cae1-4bb6-b251-d24d2828a06b__________.png', 'image', NULL, NULL, '2026-01-07 14:19:33');
INSERT INTO `asset` VALUES (4, 'é»åäº.jpg', 'image/jpeg', 147039, 'uploads/2026/01/84bf61de-5aac-4a40-8745-1763b832d470__________.jpg', 'image', NULL, NULL, '2026-01-07 14:19:56');
INSERT INTO `asset` VALUES (5, 'æ±æ¦.jpg', 'image/jpeg', 4192837, 'uploads/2026/01/6795381a-022e-4638-b7c1-fe06dd3a5ff7_______.jpg', 'image', NULL, NULL, '2026-01-07 14:20:16');
INSERT INTO `asset` VALUES (6, 'ä½äººå¯.jpg', 'image/jpeg', 413721, 'uploads/2026/01/98456c80-8ff7-4ff5-9feb-34a3e613944a__________.jpg', 'image', NULL, NULL, '2026-01-07 14:20:41');
INSERT INTO `asset` VALUES (7, 'é»å¤ç.jpg', 'image/jpeg', 98445, 'uploads/2026/01/d9051f73-4dd8-4d2c-a3bd-e3b82b3adf19__________.jpg', 'image', NULL, NULL, '2026-01-07 14:21:04');
INSERT INTO `asset` VALUES (8, 'è®¸ç§ä¸½.jpg', 'image/jpeg', 47064, 'uploads/2026/01/0c5c24ce-8b9a-4257-9624-2aeac3e641f0__________.jpg', 'image', NULL, NULL, '2026-01-07 14:21:24');
INSERT INTO `asset` VALUES (9, 'æå¤©ä¸.jpg', 'image/jpeg', 1434787, 'uploads/2026/01/dd51bf52-343b-4a4e-b3b8-cd6fa88a716d__________.jpg', 'image', NULL, NULL, '2026-01-07 14:21:44');
INSERT INTO `asset` VALUES (10, 'æå¯ç.png', 'image/png', 44085, 'uploads/2026/01/0331d56c-9088-455b-95ea-806fdfc64fd0__________.png', 'image', NULL, NULL, '2026-01-07 14:22:04');
INSERT INTO `asset` VALUES (11, 'ææ¨é³.jpg', 'image/jpeg', 4899905, 'uploads/2026/01/f7abf310-0820-4aac-b3e3-9cd6ceba86c1__________.jpg', 'image', NULL, NULL, '2026-01-07 14:22:31');
INSERT INTO `asset` VALUES (12, 'å´é æ¦.jpg', 'image/jpeg', 165931, 'uploads/2026/01/4d2f560e-2cc0-498d-a568-709546f8fbaf__________.jpg', 'image', NULL, NULL, '2026-01-07 14:22:51');
INSERT INTO `asset` VALUES (13, 'ä½è.jpg', 'image/jpeg', 177874, 'uploads/2026/01/87c0d544-a55f-4283-9558-6971cebe4583_______.jpg', 'image', NULL, NULL, '2026-01-07 14:23:29');
INSERT INTO `asset` VALUES (14, 'å»å½±ä».jpg', 'image/jpeg', 925092, 'uploads/2026/01/ad537473-ba7d-4bd0-8fae-bd759ec3f1e3__________.jpg', 'image', NULL, NULL, '2026-01-07 14:23:51');
INSERT INTO `asset` VALUES (15, 'æè.jpg', 'image/jpeg', 184277, 'uploads/2026/01/95cda82d-c61a-47b2-91f6-4b8c7d49f78f_______.jpg', 'image', NULL, NULL, '2026-01-07 14:24:10');
INSERT INTO `asset` VALUES (16, 'éç´.jpg', 'image/jpeg', 97254, 'uploads/2026/01/1b941c59-0ae6-40be-b047-79a09863e621_______.jpg', 'image', NULL, NULL, '2026-01-07 14:24:30');

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
) ENGINE = InnoDB AUTO_INCREMENT = 15 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of content
-- ----------------------------
INSERT INTO `content` VALUES (1, 2, 'About the Laboratory', 'overview', 'published', 'markdown', 'We are an interdisciplinary lab working at the intersection of bioinformatics, machine learning, and biomedical data systems.\n\n## Focus Areas\n- Single-cell and spatial omics analysis\n- AI-assisted biomedical knowledge extraction\n- Reproducible data pipelines and tooling\n\n## Values\nReproducibility, openness, and rigorous evaluation.\n', NULL, 'Short overview of the laboratory mission, focus areas, and values.', NULL, NULL, '[\"about\", \"lab\", \"mission\"]', '[\"Lab Admin\"]', '{\"page\": \"about\", \"layout\": \"single\"}', '2025-12-20 10:00:00', '2026-01-01 16:21:17', '2026-01-01 20:11:47');
INSERT INTO `content` VALUES (2, 9, 'Editorial Services', 'services', 'published', 'richtext', NULL, '<h1>Editorial Services</h1>\r\n<p>We provide scientific editing and technical review support for manuscripts, grant proposals, and technical reports.</p>\r\n<h2>Scope</h2>\r\n<ul>\r\n  <li>Clarity and structure improvements</li>\r\n  <li>Consistency checks for figures/tables/citations</li>\r\n  <li>Reproducibility and methods review</li>\r\n</ul>\r\n<p><strong>Note:</strong> We do not guarantee acceptance outcomes.</p>', 'Editing and technical review support scope and process.', NULL, NULL, '[\"editorial\", \"service\", \"manuscript\"]', '[{\"name\": \"Editorial Team\", \"affiliation\": \"Lab Site\"}]', '{\"page\": \"editorial-services\", \"layout\": \"single\"}', '2025-12-22 09:30:00', '2026-01-01 16:21:17', '2026-01-01 16:21:17');
INSERT INTO `content` VALUES (3, 3, 'AI for Educational Video Understanding', 'ai-edu-video-understanding', 'published', 'markdown', '# AI for Educational Video Understanding\r\nWe study long-form instructional video structuring, semantic indexing, and reliable stage segmentation from ASR transcripts.\r\n\r\n## Highlights\r\n- Structure-aware retrieval augmentation\r\n- Semantic-time alignment evaluation\r\n- Lightweight models under constrained compute\r\n', NULL, 'Long-form instructional video structuring and segmentation from transcripts.', NULL, 2025, '[\"research\", \"rag\", \"video\"]', '[{\"name\": \"Siu Ki Cheung\", \"role\": \"Lead\"}]', '{\"topic\": \"education-ai\", \"keywords\": [\"RAG\", \"segmentation\", \"ASR\"]}', '2025-11-15 14:00:00', '2026-01-01 16:21:17', '2026-01-01 16:21:17');
INSERT INTO `content` VALUES (4, 3, 'Single-cell Omics Pipeline Engineering', 'single-cell-pipeline-engineering', 'published', 'markdown', '# Single-cell Omics Pipeline Engineering\r\nWe build end-to-end pipelines for QC, normalization, clustering, and downstream differential analysis with reproducible outputs.\r\n\r\n## Components\r\n- Data ingestion (10x / AnnData)\r\n- QC metrics and filtering\r\n- Doublet detection\r\n- UMAP + clustering\r\n', NULL, 'Reproducible engineering of scanpy-based single-cell pipelines.', NULL, 2025, '[\"research\", \"scRNA-seq\", \"pipeline\"]', '[{\"name\": \"Lab Admin\", \"role\": \"Maintainer\"}]', '{\"stack\": [\"scanpy\", \"anndata\"], \"topic\": \"single-cell\"}', '2025-10-08 16:30:00', '2026-01-01 16:21:17', '2026-01-01 16:21:17');
INSERT INTO `content` VALUES (5, 4, 'Scanpy MCP Server', 'scanpy-mcp-server', 'published', 'richtext', NULL, '<h1>Scanpy MCP Server</h1>\r\n<p>A tool server exposing a standardized interface for running common single-cell analysis steps.</p>\r\n<h2>Features</h2>\r\n<ul>\r\n  <li>QC summaries and plots</li>\r\n  <li>Doublet detection hooks</li>\r\n  <li>Standardized outputs for downstream apps</li>\r\n</ul>', 'Tool server exposing standardized endpoints for single-cell analysis.', NULL, 2025, '[\"software\", \"tooling\", \"single-cell\"]', '[{\"name\": \"Lab Admin\", \"role\": \"Author\"}]', '{\"repo\": \"scanpy-mcp-server\", \"status\": \"active\", \"license\": \"MIT\"}', '2025-09-01 12:00:00', '2026-01-01 16:21:17', '2026-01-01 16:21:17');
INSERT INTO `content` VALUES (6, 4, 'ForestRAG Teaching Toolkit', 'forestrag-teaching-toolkit', 'published', 'markdown', 'A prototype toolkit for structure-aware retrieval-augmented generation over long instructional transcripts.\n\n## Status\nDraft / under active development.\n', NULL, 'Prototype toolkit for structure-aware RAG over instructional transcripts.', NULL, 2026, '[\"software\", \"rag\", \"education\"]', '[\"Siu Ki Cheung\"]', '{\"repo\": \"ForestRAG-Teaching\", \"status\": \"draft\"}', '2026-01-01 20:10:47', '2026-01-01 16:21:17', '2026-01-01 20:11:01');
INSERT INTO `content` VALUES (7, 5, 'ForestRAG: Structure-aware Retrieval Augmentation for Long Instructional Transcripts', 'forestrag-structure-aware-rag', 'published', 'markdown', '# ForestRAG\r\nThis work proposes a structure-aware retrieval-augmented generation framework for long instructional transcripts with semantic-time alignment constraints.\r\n\r\n## Artifact\r\nCode and dataset will be released after review.\r\n', NULL, 'Structure-aware RAG framework for long instructional transcripts.', NULL, 2025, '[\"publication\", \"rag\", \"education\"]', '[{\"name\": \"Siu Ki Cheung\", \"affiliation\": \"Lab Site\"}, {\"name\": \"Lab Collaborator\", \"affiliation\": \"Partner Institute\"}]', '{\"doi\": null, \"links\": [], \"venue\": \"Preprint\"}', '2025-12-01 08:00:00', '2026-01-01 16:21:17', '2026-01-01 16:21:17');
INSERT INTO `content` VALUES (8, 5, 'Evidential Uncertainty Modeling for Knowledge Tracing', 'evidential-uncertainty-kt', 'published', 'richtext', NULL, '<h1>Evidential Uncertainty Modeling for Knowledge Tracing</h1>\r\n<p>We study uncertainty estimation and calibration for student modeling, including selective prediction analyses.</p>\r\n<p><em>Keywords:</em> calibration, EDL, knowledge tracing</p>', 'Uncertainty estimation and calibration for knowledge tracing.', NULL, 2024, '[\"publication\", \"kt\", \"uncertainty\"]', '[{\"name\": \"Lab Admin\", \"affiliation\": \"Lab Site\"}]', '{\"doi\": null, \"links\": [], \"venue\": \"Workshop\"}', '2024-06-10 10:00:00', '2026-01-01 16:21:17', '2026-01-01 16:21:17');
INSERT INTO `content` VALUES (9, 6, 'Siu Ki Cheung', 'siu-ki-cheung', 'published', 'richtext', NULL, '<h1>Siu Ki Cheung</h1>\r\n<p><strong>Role:</strong> Research Lead</p>\r\n<p><strong>Interests:</strong> Retrieval-augmented generation, long-form understanding, evaluation, reproducibility.</p>\r\n<p><strong>Email:</strong> admin@lab.local</p>', 'Research lead focusing on RAG and long-form understanding.', NULL, NULL, '[\"people\", \"lead\"]', '[]', '{\"person\": {\"email\": \"admin@lab.local\", \"links\": [], \"position\": \"Research Lead\"}}', '2025-12-15 09:00:00', '2026-01-01 16:21:17', '2026-01-01 16:21:17');
INSERT INTO `content` VALUES (10, 6, 'Lab Engineer', 'lab-engineer', 'published', 'markdown', '# Lab Engineer\r\n**Role:** Infrastructure & Data Engineering\r\n\r\n## Responsibilities\r\n- Deployment and CI\r\n- Dataset versioning and backups\r\n- Performance monitoring\r\n', NULL, 'Infrastructure and data engineering for lab systems.', NULL, NULL, '[\"people\", \"engineering\"]', '[]', '{\"person\": {\"email\": \"eng@lab.local\", \"position\": \"Engineer\"}}', '2025-11-20 11:00:00', '2026-01-01 16:21:17', '2026-01-01 16:21:17');
INSERT INTO `content` VALUES (11, 7, 'Partner Institute A', 'partner-institute-a', 'published', 'markdown', '# Partner Institute A\r\nCollaboration on multi-center data integration and benchmarking.\r\n\r\n- Focus: translational bioinformatics\r\n- Joint projects: pipeline standardization\r\n', NULL, 'Collaboration on data integration and benchmarking.', NULL, NULL, '[\"collaboration\", \"partner\"]', '[{\"name\": \"Coordinator\", \"affiliation\": \"Partner Institute A\"}]', '{\"org\": \"Partner Institute A\", \"type\": \"institute\"}', '2025-08-05 15:00:00', '2026-01-01 16:21:17', '2026-01-01 16:21:17');
INSERT INTO `content` VALUES (12, 8, 'Intro to Bioinformatics Pipelines', 'intro-bioinformatics-pipelines', 'published', 'richtext', NULL, '<h1>Intro to Bioinformatics Pipelines</h1>\r\n<p>A short course covering reproducible analysis workflows, data QC, and reporting.</p>\r\n<ul>\r\n  <li>Module 1: Data formats and ingestion</li>\r\n  <li>Module 2: QC and filtering</li>\r\n  <li>Module 3: Reporting and reproducibility</li>\r\n</ul>', 'Short course on reproducible analysis workflows and QC.', NULL, 2025, '[\"course\", \"bioinformatics\"]', '[{\"name\": \"Lab Admin\", \"role\": \"Instructor\"}]', '{\"course\": {\"level\": \"beginner\", \"duration\": \"4 weeks\"}}', '2025-09-12 09:00:00', '2026-01-01 16:21:17', '2026-01-01 16:21:17');
INSERT INTO `content` VALUES (13, 10, 'NeurIPS 2025 Workshop: Reliable LLM Systems', 'neurips-2025-reliable-llm-systems', 'published', 'markdown', '# NeurIPS 2025 Workshop: Reliable LLM Systems\r\nWe presented work on evaluation and reliability for long-context RAG.\r\n\r\n## Talk\r\n- Title: Structure-aware evidence selection\r\n- Format: poster + short talk\r\n', NULL, 'Workshop entry for a reliable LLM systems event.', NULL, 2025, '[\"conference\", \"neurips\"]', '[{\"name\": \"Siu Ki Cheung\", \"role\": \"Presenter\"}]', '{\"conference\": {\"name\": \"NeurIPS\", \"type\": \"workshop\"}}', '2025-12-10 13:00:00', '2026-01-01 16:21:17', '2026-01-01 16:21:17');
INSERT INTO `content` VALUES (14, 11, 'Useful Links', 'useful-links', 'published', 'markdown', '# Useful Links\r\nA curated list of external resources used by the lab.\r\n', NULL, 'Curated external resources.', NULL, NULL, '[\"links\", \"resources\"]', '[]', '{\"links\": [{\"url\": \"https://github.com/\", \"label\": \"GitHub\"}, {\"url\": \"https://scanpy.readthedocs.io/\", \"label\": \"Scanpy\"}]}', '2025-07-01 10:00:00', '2026-01-01 16:21:17', '2026-01-01 16:21:17');

-- ----------------------------
-- Table structure for member
-- ----------------------------
DROP TABLE IF EXISTS `member`;
CREATE TABLE `member`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `position` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
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
  CONSTRAINT `fk_member_image_asset` FOREIGN KEY (`image_asset_id`) REFERENCES `asset` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 17 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of member
-- ----------------------------
INSERT INTO `member` VALUES (1, '邓洁萍', '博士后', '免疫衰老|多组学', '阅读|音乐', 'dengjp01@jnu.edu.cn', 1, 0, 1, '2026-01-07 13:34:18', '2026-01-07 14:18:43');
INSERT INTO `member` VALUES (2, '赖文普', '博士后', 'AI for science|多组学|肿瘤免疫', '吉他', 'kyzy850520@163.com', 2, 0, 1, '2026-01-07 14:19:07', '2026-01-07 14:19:07');
INSERT INTO `member` VALUES (3, '茅立鹏', '博士后', '衰老|多组学|人工智能', '读书', 'iammaolipeng@foxmail.com', 3, 0, 1, '2026-01-07 14:19:34', '2026-01-07 14:19:34');
INSERT INTO `member` VALUES (4, '黄博亚', '博士', '脑膜瘤|脑转移瘤', '羽毛球', 'xiaonuo0917@163.com', 4, 0, 1, '2026-01-07 14:19:57', '2026-01-07 14:19:57');
INSERT INTO `member` VALUES (5, '朱悦', '博士', '三维基因组学', '美食|旅游', 'yuezhu1113@163.com', 5, 0, 1, '2026-01-07 14:20:18', '2026-01-07 14:20:18');
INSERT INTO `member` VALUES (6, '何人可', '博士', '肿瘤免疫|衰老', '旅行|美食', 'hrk1996@stu2023.jnu.edu.cn', 6, 0, 1, '2026-01-07 14:20:42', '2026-01-07 14:20:42');
INSERT INTO `member` VALUES (7, '黄夏璇', '博士', '心脏瓣膜病的发病机制', '健身', 'hxx0601@stu2021.jnu.edu.cn', 7, 0, 1, '2026-01-07 14:21:05', '2026-01-07 14:21:05');
INSERT INTO `member` VALUES (8, '许秀丽', '博士', '急性淋巴细胞白血病', '撸猫', 'xuxiuli725@163.com', 8, 0, 1, '2026-01-07 14:21:25', '2026-01-07 14:21:25');
INSERT INTO `member` VALUES (9, '李天一', '博士', '衰老时钟|单细胞多组学', '篮球|电影', '723432253@qq.com', 9, 0, 1, '2026-01-07 14:21:45', '2026-01-07 14:21:45');
INSERT INTO `member` VALUES (10, '李启煜', '硕士', '肿瘤免疫|单细胞测序', '乒乓球', 'm15302808910@126.com', 10, 0, 1, '2026-01-07 14:22:06', '2026-01-07 14:22:06');
INSERT INTO `member` VALUES (11, '李晨阳', '硕士', '多组学|人工智能', '健身|旅游', 'eden96211@gmail.com', 11, 0, 1, '2026-01-07 14:22:33', '2026-01-07 14:22:33');
INSERT INTO `member` VALUES (12, '吴铠悦', '硕士', '三维基因组|转录组', '看书|网球', 'w2353046666@163.com', 12, 0, 1, '2026-01-07 14:22:52', '2026-01-07 14:22:52');
INSERT INTO `member` VALUES (13, '何莉', '硕士', '药学', '羽毛球', 'hlll2003@outlook.com', 13, 0, 1, '2026-01-07 14:23:30', '2026-01-07 14:23:30');
INSERT INTO `member` VALUES (14, '廖影仙', '硕士', '免疫|生信', '搞抽象', '1596741873@qq.com', 14, 0, 1, '2026-01-07 14:23:52', '2026-01-07 14:23:52');
INSERT INTO `member` VALUES (15, '文蕊', '硕士', '硕士', '硕士', '1440764559@qq.com', 15, 0, 1, '2026-01-07 14:24:11', '2026-01-07 14:24:11');
INSERT INTO `member` VALUES (16, '邓琴', '硕士', 'CRISPR-cas9', '无', '18342604969@163.com', 16, 0, 1, '2026-01-07 14:24:31', '2026-01-07 14:24:31');

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
INSERT INTO `module` VALUES (6, 'People', 'people', 'ListDetail', 1, 1, 50, '{}', '2025-12-31 23:17:38', '2025-12-31 23:17:38');
INSERT INTO `module` VALUES (7, 'Collaborators', 'collaborators', 'ListDetail', 1, 1, 60, '{}', '2025-12-31 23:17:38', '2025-12-31 23:17:38');
INSERT INTO `module` VALUES (8, 'Courses', 'courses', 'ListDetail', 1, 1, 70, '{}', '2025-12-31 23:17:38', '2025-12-31 23:17:38');
INSERT INTO `module` VALUES (9, 'Editorial Services', 'editorial-services', 'SinglePage', 1, 1, 80, '{}', '2025-12-31 23:17:38', '2025-12-31 23:17:38');
INSERT INTO `module` VALUES (10, 'Conferences', 'conferences', 'ListDetail', 1, 1, 90, '{\"filters\": [\"year\"]}', '2025-12-31 23:17:38', '2025-12-31 23:17:38');
INSERT INTO `module` VALUES (11, 'Links', 'links', 'ListDetail', 1, 1, 100, '{}', '2025-12-31 23:17:38', '2025-12-31 23:17:38');
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
INSERT INTO `settings` VALUES ('site', '{\"logoText\": \"Research, people, and publications\", \"siteName\": \"Bioinfo Lab\", \"homeModules\": [{\"slug\": \"research\", \"title\": \"Research Areas\", \"description\": \"Explore our current projects and scientific focus.\"}, {\"slug\": \"software\", \"title\": \"Software & Tools\", \"description\": \"Open-source bioinformatics tools developed by our lab.\"}, {\"slug\": \"people\", \"title\": \"Meet the Team\", \"description\": \"Faculty, students, and alumni.\"}]}', '2026-01-01 21:28:23');

SET FOREIGN_KEY_CHECKS = 1;
