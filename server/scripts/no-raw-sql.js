import fs from 'fs';
import path from 'path';

const cwd = process.cwd();
const candidateRoots = [
  path.resolve(cwd, 'server', 'src'),
  path.resolve(cwd, 'src')
];

const srcRoot = candidateRoots.find((root) => fs.existsSync(root));
if (!srcRoot) {
  console.error('Cannot locate src directory to scan.');
  process.exit(2);
}

const roots = [path.join(srcRoot, 'routes'), path.join(srcRoot, 'controllers')];

const keywordRe = /\b(SELECT|INSERT|UPDATE|DELETE)\b\s/i;

const allowlist = [];

const isAllowed = (filePath, lineNumber, line) => {
  return allowlist.some((rule) => {
    if (rule.file && rule.file !== filePath) return false;
    if (rule.line && rule.line !== lineNumber) return false;
    if (rule.pattern && !rule.pattern.test(line)) return false;
    return true;
  });
};

const scanFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  return lines.flatMap((line, index) => {
    if (keywordRe.test(line) && !isAllowed(filePath, index + 1, line)) {
      return [{ filePath, lineNumber: index + 1, line }];
    }
    return [];
  });
};

const walk = (dir) => {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return walk(fullPath);
    }
    if (entry.isFile() && fullPath.endsWith('.js')) {
      return scanFile(fullPath);
    }
    return [];
  });
};

const violations = roots.flatMap((root) => walk(root));

if (violations.length) {
  console.error('Raw SQL detected in routes/controllers:');
  for (const violation of violations) {
    console.error(`${violation.filePath}:${violation.lineNumber} ${violation.line.trim()}`);
  }
  process.exit(1);
}

console.log('No raw SQL found in routes/controllers.');
