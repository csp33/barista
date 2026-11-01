import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SRC_DIR = path.resolve(__dirname, '../../src');
const MAX_LINES_PER_FILE = 200;

function getAllFiles(dir: string, extensions: string[] = ['.ts', '.tsx']): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, extensions));
    } else if (extensions.some(ext => entry.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  return files;
}

function extractImports(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const importLines = content.match(/import\s+(?:type\s+)?(?:[\s\S]*?from\s+)?['"](.*?)['"]/g) || [];
  const results: string[] = [];
  for (const line of importLines) {
    const match = line.match(/from\s+['"](.*?)['"]/);
    if (match && match[1]) {
      results.push(match[1]);
    }
  }
  return results;
}

describe('Clean & Hexagonal Architecture Enforcement', () => {
  it('enforces maximum 200 lines per file in src/', () => {
    const files = getAllFiles(SRC_DIR);
    const violations: { file: string; lines: number }[] = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const lineCount = content.split('\n').length;
      if (lineCount > MAX_LINES_PER_FILE) {
        violations.push({
          file: path.relative(SRC_DIR, file),
          lines: lineCount,
        });
      }
    }

    expect(
      violations,
      `The following files exceed the ${MAX_LINES_PER_FILE} lines limit:\n` +
      violations.map(v => ` - ${v.file}: ${v.lines} lines`).join('\n')
    ).toEqual([]);
  });

  it('enforces Domain layer purity (no application, infrastructure, or framework imports)', () => {
    const domainDir = path.join(SRC_DIR, 'core/domain');
    const domainFiles = getAllFiles(domainDir);
    const violations: { file: string; illegalImport: string }[] = [];

    const forbiddenPatterns = [
      /application/,
      /adapters/,
      /@\/adapters/,
      /infrastructure/,
      /@\/infrastructure/,
      /@\/core\/application/,
      /^react$/,
      /^next/,
      /@prisma\/client/,
      /^pg$/
    ];

    for (const file of domainFiles) {
      const imports = extractImports(file);
      for (const imp of imports) {
        if (forbiddenPatterns.some(pat => pat.test(imp))) {
          violations.push({
            file: path.relative(SRC_DIR, file),
            illegalImport: imp,
          });
        }
      }
    }

    expect(
      violations,
      `Domain layer violations found:\n` +
      violations.map(v => ` - ${v.file} imports "${v.illegalImport}"`).join('\n')
    ).toEqual([]);
  });

  it('enforces Application layer purity (no infrastructure, React, or framework imports)', () => {
    const appDir = path.join(SRC_DIR, 'core/application');
    const appFiles = getAllFiles(appDir);
    const violations: { file: string; illegalImport: string }[] = [];

    const forbiddenPatterns = [
      /adapters/,
      /@\/adapters/,
      /infrastructure/,
      /@\/infrastructure/,
      /^react$/,
      /^next/,
      /@prisma\/client/,
      /^pg$/
    ];

    for (const file of appFiles) {
      const imports = extractImports(file);
      for (const imp of imports) {
        if (forbiddenPatterns.some(pat => pat.test(imp))) {
          violations.push({
            file: path.relative(SRC_DIR, file),
            illegalImport: imp,
          });
        }
      }
    }

    expect(
      violations,
      `Application layer violations found:\n` +
      violations.map(v => ` - ${v.file} imports "${v.illegalImport}"`).join('\n')
    ).toEqual([]);
  });
});
