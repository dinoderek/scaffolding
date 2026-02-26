#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const { rawColorLiteralRule } = require('./ui-guardrails.config');

const RAW_COLOR_LITERAL_REGEX =
  /#[0-9A-Fa-f]{3,8}\b|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)/g;

function toPosixPath(value) {
  return value.split(path.sep).join('/');
}

function collectUiFiles(rootDir) {
  const targets = ['app', 'components'];
  const results = [];

  for (const target of targets) {
    const absoluteTarget = path.join(rootDir, target);
    if (!fs.existsSync(absoluteTarget)) {
      continue;
    }

    walkDirectory(absoluteTarget, (absoluteFilePath) => {
      const relativePath = toPosixPath(path.relative(rootDir, absoluteFilePath));
      if (!isUiSourceFile(relativePath)) {
        return;
      }

      results.push(relativePath);
    });
  }

  return results.sort();
}

function walkDirectory(directoryPath, onFile) {
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.expo') {
      continue;
    }

    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      walkDirectory(entryPath, onFile);
      continue;
    }

    if (entry.isFile()) {
      onFile(entryPath);
    }
  }
}

function isUiSourceFile(relativePath) {
  if (!(relativePath.startsWith('app/') || relativePath.startsWith('components/'))) {
    return false;
  }

  if (!relativePath.endsWith('.tsx')) {
    return false;
  }

  if (relativePath.includes('/__tests__/') || relativePath.includes('/__snapshots__/')) {
    return false;
  }

  if (
    relativePath.endsWith('.test.tsx') ||
    relativePath.endsWith('.spec.tsx') ||
    relativePath.endsWith('.stories.tsx')
  ) {
    return false;
  }

  return true;
}

function normalizeAllowlistEntries(allowlistedFiles = []) {
  const map = new Map();
  for (const entry of allowlistedFiles) {
    if (!entry || !entry.path) {
      continue;
    }

    map.set(toPosixPath(entry.path), entry.reason || 'No reason provided.');
  }
  return map;
}

function findRawColorLiteralViolations({
  rootDir,
  includeAllowlisted = false,
  allowlistedFiles = rawColorLiteralRule?.allowlistedFiles ?? [],
} = {}) {
  const resolvedRootDir = rootDir || path.resolve(__dirname, '..');
  const allowlist = normalizeAllowlistEntries(allowlistedFiles);
  const files = collectUiFiles(resolvedRootDir);

  const violations = [];
  const skippedAllowlistedFiles = [];

  for (const relativePath of files) {
    const allowlistReason = allowlist.get(relativePath);
    if (allowlistReason && !includeAllowlisted) {
      skippedAllowlistedFiles.push({ path: relativePath, reason: allowlistReason });
      continue;
    }

    const absolutePath = path.join(resolvedRootDir, relativePath);
    const source = fs.readFileSync(absolutePath, 'utf8');
    const lines = source.split(/\r?\n/);

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      const matches = [...line.matchAll(RAW_COLOR_LITERAL_REGEX)];

      for (const match of matches) {
        violations.push({
          file: relativePath,
          line: index + 1,
          literal: match[0],
          allowlisted: Boolean(allowlistReason),
          reason: allowlistReason || null,
          lineText: line.trim(),
        });
      }
    }
  }

  return {
    rootDir: resolvedRootDir,
    filesScanned: files.length,
    skippedAllowlistedFiles,
    violations,
    blockingViolations: violations.filter((violation) => !violation.allowlisted),
  };
}

function formatSummary(result) {
  const lines = [];
  lines.push('UI guardrail: raw color literal scan (screens/components)');
  lines.push(`Files scanned: ${result.filesScanned}`);
  lines.push(`Allowlisted files skipped: ${result.skippedAllowlistedFiles.length}`);
  lines.push(`Violations found: ${result.violations.length}`);
  lines.push(`Blocking violations: ${result.blockingViolations.length}`);

  if (result.violations.length > 0) {
    lines.push('');
    const grouped = new Map();
    for (const violation of result.violations) {
      const group = grouped.get(violation.file) ?? [];
      group.push(violation);
      grouped.set(violation.file, group);
    }

    for (const [file, fileViolations] of grouped.entries()) {
      const fileLabel = fileViolations[0].allowlisted ? `${file} (allowlisted)` : file;
      lines.push(fileLabel);
      for (const violation of fileViolations.slice(0, 8)) {
        lines.push(`  L${violation.line}: ${violation.literal} -> ${violation.lineText}`);
      }
      if (fileViolations.length > 8) {
        lines.push(`  ... ${fileViolations.length - 8} more`);
      }
      if (fileViolations[0].allowlisted && fileViolations[0].reason) {
        lines.push(`  reason: ${fileViolations[0].reason}`);
      }
    }
  }

  if (result.skippedAllowlistedFiles.length > 0) {
    lines.push('');
    lines.push('Skipped allowlisted files:');
    for (const skipped of result.skippedAllowlistedFiles) {
      lines.push(`  - ${skipped.path}: ${skipped.reason}`);
    }
  }

  return lines.join('\n');
}

function runUiGuardrailCheck(options = {}) {
  const result = findRawColorLiteralViolations(options);
  const output = formatSummary(result);

  if (options.stdout) {
    options.stdout.write(`${output}\n`);
  } else {
    process.stdout.write(`${output}\n`);
  }

  return {
    ...result,
    ok: result.blockingViolations.length === 0,
  };
}

function parseArgs(argv) {
  return {
    includeAllowlisted: argv.includes('--include-allowlisted'),
  };
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const result = runUiGuardrailCheck(args);
  process.exitCode = result.ok ? 0 : 1;
}

module.exports = {
  RAW_COLOR_LITERAL_REGEX,
  collectUiFiles,
  findRawColorLiteralViolations,
  formatSummary,
  runUiGuardrailCheck,
};
