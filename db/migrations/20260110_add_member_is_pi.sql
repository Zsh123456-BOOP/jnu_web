-- Add is_pi column and index for existing databases
ALTER TABLE `member`
  ADD COLUMN `is_pi` tinyint(1) NOT NULL DEFAULT 0 AFTER `position`,
  ADD INDEX `idx_member_pi_enabled_sort` (`is_pi`, `enabled`, `sort_order`, `id`);

-- Example: mark a specific member as PI (edit the name)
-- UPDATE `member` SET `is_pi` = 1 WHERE `name` = 'REPLACE_WITH_NAME';
