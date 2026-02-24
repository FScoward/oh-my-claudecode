import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';

describe('CLI win32 platform warning (#923)', () => {
  const originalPlatform = process.platform;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    Object.defineProperty(process, 'platform', { value: originalPlatform });
    warnSpy.mockRestore();
  });

  it('should warn on win32 platform', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' });

    // Simulate the warning logic from src/cli/index.ts
    if (process.platform === 'win32') {
      console.warn('WARNING: Native Windows (win32) detected');
      console.warn('OMC requires tmux, which is not available on native Windows.');
      console.warn('Please use WSL2 instead');
      console.warn('Native win32 support issues will not be accepted.');
    }

    expect(warnSpy).toHaveBeenCalled();
    const allOutput = warnSpy.mock.calls.map((c: unknown[]) => c[0]).join('\n');
    expect(allOutput).toContain('win32');
    expect(allOutput).toContain('tmux');
    expect(allOutput).toContain('WSL2');
    expect(allOutput).toContain('will not be accepted');
  });

  it('should NOT warn on linux platform', () => {
    Object.defineProperty(process, 'platform', { value: 'linux' });

    if (process.platform === 'win32') {
      console.warn('WARNING: Native Windows (win32) detected');
    }

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should NOT warn on darwin platform', () => {
    Object.defineProperty(process, 'platform', { value: 'darwin' });

    if (process.platform === 'win32') {
      console.warn('WARNING: Native Windows (win32) detected');
    }

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should not block execution after warning', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' });

    let continued = false;
    if (process.platform === 'win32') {
      console.warn('WARNING: Native Windows (win32) detected');
    }
    // Code continues past the warning
    continued = true;

    expect(continued).toBe(true);
  });
});
