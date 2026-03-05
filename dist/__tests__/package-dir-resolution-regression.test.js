import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, '..', '..');
function getFunctionSnippet(source, functionName) {
    const marker = `function ${functionName}(): string {`;
    const start = source.indexOf(marker);
    if (start === -1)
        return '';
    // The function is small; a bounded snippet is enough for ordering assertions.
    return source.slice(start, start + 1400);
}
describe('package dir resolution regression (#1322, #1324)', () => {
    it('src/agents/utils.ts checks __dirname before import.meta.url', () => {
        const source = readFileSync(join(REPO_ROOT, 'src', 'agents', 'utils.ts'), 'utf-8');
        const snippet = getFunctionSnippet(source, 'getPackageDir');
        expect(snippet).toContain("typeof __dirname !== 'undefined'");
        expect(snippet).toContain("currentDirName === 'bridge'");
        expect(snippet).toContain('fileURLToPath(import.meta.url)');
        expect(snippet.indexOf("typeof __dirname !== 'undefined'")).toBeLessThan(snippet.indexOf('fileURLToPath(import.meta.url)'));
    });
    it('src/agents/prompt-helpers.ts checks __dirname before import.meta.url', () => {
        const source = readFileSync(join(REPO_ROOT, 'src', 'agents', 'prompt-helpers.ts'), 'utf-8');
        const snippet = getFunctionSnippet(source, 'getPackageDir');
        expect(snippet).toContain("typeof __dirname !== 'undefined'");
        expect(snippet).toContain("currentDirName === 'bridge'");
        expect(snippet).toContain('fileURLToPath(import.meta.url)');
        expect(snippet.indexOf("typeof __dirname !== 'undefined'")).toBeLessThan(snippet.indexOf('fileURLToPath(import.meta.url)'));
    });
});
//# sourceMappingURL=package-dir-resolution-regression.test.js.map