/**
 * Unit tests for session-idle notification cooldown (issue #826)
 * Verifies that idle notifications are rate-limited per session.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { getIdleNotificationCooldownSeconds, shouldSendIdleNotification, recordIdleNotificationSent, } from '../index.js';
// Mock fs and os modules
vi.mock('fs', async () => {
    const actual = await vi.importActual('fs');
    return {
        ...actual,
        existsSync: vi.fn(),
        readFileSync: vi.fn(),
        writeFileSync: vi.fn(),
        mkdirSync: vi.fn(),
        unlinkSync: vi.fn(),
    };
});
vi.mock('os', async () => {
    const actual = await vi.importActual('os');
    return {
        ...actual,
        homedir: vi.fn().mockReturnValue('/home/testuser'),
    };
});
const TEST_STATE_DIR = '/project/.omc/state';
const COOLDOWN_PATH = join(TEST_STATE_DIR, 'idle-notif-cooldown.json');
const CONFIG_PATH = '/home/testuser/.omc/config.json';
describe('getIdleNotificationCooldownSeconds', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('returns 60 when config file does not exist', () => {
        existsSync.mockReturnValue(false);
        expect(getIdleNotificationCooldownSeconds()).toBe(60);
    });
    it('returns configured value when set in config', () => {
        existsSync.mockReturnValue(true);
        readFileSync.mockReturnValue(JSON.stringify({ notificationCooldown: { sessionIdleSeconds: 120 } }));
        expect(getIdleNotificationCooldownSeconds()).toBe(120);
        expect(readFileSync).toHaveBeenCalledWith(CONFIG_PATH, 'utf-8');
    });
    it('returns 0 when cooldown is disabled in config', () => {
        existsSync.mockReturnValue(true);
        readFileSync.mockReturnValue(JSON.stringify({ notificationCooldown: { sessionIdleSeconds: 0 } }));
        expect(getIdleNotificationCooldownSeconds()).toBe(0);
    });
    it('returns 60 when notificationCooldown key is absent', () => {
        existsSync.mockReturnValue(true);
        readFileSync.mockReturnValue(JSON.stringify({ someOtherKey: true }));
        expect(getIdleNotificationCooldownSeconds()).toBe(60);
    });
    it('returns 60 when config is malformed JSON', () => {
        existsSync.mockReturnValue(true);
        readFileSync.mockReturnValue('not valid json{{');
        expect(getIdleNotificationCooldownSeconds()).toBe(60);
    });
    it('returns 60 when sessionIdleSeconds is not a number', () => {
        existsSync.mockReturnValue(true);
        readFileSync.mockReturnValue(JSON.stringify({ notificationCooldown: { sessionIdleSeconds: 'sixty' } }));
        expect(getIdleNotificationCooldownSeconds()).toBe(60);
    });
});
describe('shouldSendIdleNotification', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('returns true when no cooldown file exists', () => {
        // config exists but no cooldown file
        existsSync.mockImplementation((p) => {
            if (p === CONFIG_PATH)
                return false; // use default 60s
            if (p === COOLDOWN_PATH)
                return false;
            return false;
        });
        expect(shouldSendIdleNotification(TEST_STATE_DIR)).toBe(true);
    });
    it('returns false when last notification was sent within cooldown period', () => {
        const recentTimestamp = new Date(Date.now() - 30_000).toISOString(); // 30s ago
        existsSync.mockImplementation((p) => {
            if (p === COOLDOWN_PATH)
                return true;
            return false; // config missing → default 60s
        });
        readFileSync.mockImplementation((p) => {
            if (p === COOLDOWN_PATH)
                return JSON.stringify({ lastSentAt: recentTimestamp });
            throw new Error('not found');
        });
        expect(shouldSendIdleNotification(TEST_STATE_DIR)).toBe(false);
    });
    it('returns true when last notification was sent after cooldown has elapsed', () => {
        const oldTimestamp = new Date(Date.now() - 90_000).toISOString(); // 90s ago
        existsSync.mockImplementation((p) => {
            if (p === COOLDOWN_PATH)
                return true;
            return false; // config missing → default 60s
        });
        readFileSync.mockImplementation((p) => {
            if (p === COOLDOWN_PATH)
                return JSON.stringify({ lastSentAt: oldTimestamp });
            throw new Error('not found');
        });
        expect(shouldSendIdleNotification(TEST_STATE_DIR)).toBe(true);
    });
    it('returns true when cooldown is disabled (0 seconds)', () => {
        const recentTimestamp = new Date(Date.now() - 5_000).toISOString(); // 5s ago
        existsSync.mockImplementation((p) => {
            if (p === CONFIG_PATH)
                return true;
            if (p === COOLDOWN_PATH)
                return true;
            return false;
        });
        readFileSync.mockImplementation((p) => {
            if (p === CONFIG_PATH)
                return JSON.stringify({ notificationCooldown: { sessionIdleSeconds: 0 } });
            if (p === COOLDOWN_PATH)
                return JSON.stringify({ lastSentAt: recentTimestamp });
            throw new Error('not found');
        });
        expect(shouldSendIdleNotification(TEST_STATE_DIR)).toBe(true);
    });
    it('returns true when cooldown file has no lastSentAt field', () => {
        existsSync.mockImplementation((p) => {
            if (p === COOLDOWN_PATH)
                return true;
            return false;
        });
        readFileSync.mockImplementation((p) => {
            if (p === COOLDOWN_PATH)
                return JSON.stringify({ someOtherField: 'value' });
            throw new Error('not found');
        });
        expect(shouldSendIdleNotification(TEST_STATE_DIR)).toBe(true);
    });
    it('returns true when cooldown file is malformed JSON', () => {
        existsSync.mockImplementation((p) => {
            if (p === COOLDOWN_PATH)
                return true;
            return false;
        });
        readFileSync.mockImplementation((p) => {
            if (p === COOLDOWN_PATH)
                return 'not valid json{{';
            throw new Error('not found');
        });
        expect(shouldSendIdleNotification(TEST_STATE_DIR)).toBe(true);
    });
    it('respects a custom cooldown from config', () => {
        const recentTimestamp = new Date(Date.now() - 10_000).toISOString(); // 10s ago
        existsSync.mockImplementation((p) => {
            if (p === CONFIG_PATH)
                return true;
            if (p === COOLDOWN_PATH)
                return true;
            return false;
        });
        readFileSync.mockImplementation((p) => {
            if (p === CONFIG_PATH)
                return JSON.stringify({ notificationCooldown: { sessionIdleSeconds: 5 } });
            if (p === COOLDOWN_PATH)
                return JSON.stringify({ lastSentAt: recentTimestamp });
            throw new Error('not found');
        });
        // 10s elapsed, cooldown is 5s → should send
        expect(shouldSendIdleNotification(TEST_STATE_DIR)).toBe(true);
    });
    it('blocks notification when within custom shorter cooldown', () => {
        const recentTimestamp = new Date(Date.now() - 10_000).toISOString(); // 10s ago
        existsSync.mockImplementation((p) => {
            if (p === CONFIG_PATH)
                return true;
            if (p === COOLDOWN_PATH)
                return true;
            return false;
        });
        readFileSync.mockImplementation((p) => {
            if (p === CONFIG_PATH)
                return JSON.stringify({ notificationCooldown: { sessionIdleSeconds: 30 } });
            if (p === COOLDOWN_PATH)
                return JSON.stringify({ lastSentAt: recentTimestamp });
            throw new Error('not found');
        });
        // 10s elapsed, cooldown is 30s → should NOT send
        expect(shouldSendIdleNotification(TEST_STATE_DIR)).toBe(false);
    });
});
describe('recordIdleNotificationSent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('writes cooldown file with current timestamp', () => {
        existsSync.mockReturnValue(true); // dir exists
        const before = Date.now();
        recordIdleNotificationSent(TEST_STATE_DIR);
        const after = Date.now();
        expect(writeFileSync).toHaveBeenCalledOnce();
        const [calledPath, calledContent] = writeFileSync.mock.calls[0];
        expect(calledPath).toBe(COOLDOWN_PATH);
        const written = JSON.parse(calledContent);
        const ts = new Date(written.lastSentAt).getTime();
        expect(ts).toBeGreaterThanOrEqual(before);
        expect(ts).toBeLessThanOrEqual(after);
    });
    it('creates state directory if it does not exist', () => {
        existsSync.mockReturnValue(false);
        recordIdleNotificationSent(TEST_STATE_DIR);
        expect(mkdirSync).toHaveBeenCalledWith(TEST_STATE_DIR, { recursive: true });
        expect(writeFileSync).toHaveBeenCalledOnce();
    });
    it('does not throw when writeFileSync fails', () => {
        existsSync.mockReturnValue(true);
        writeFileSync.mockImplementation(() => {
            throw new Error('EACCES: permission denied');
        });
        expect(() => recordIdleNotificationSent(TEST_STATE_DIR)).not.toThrow();
    });
});
//# sourceMappingURL=idle-cooldown.test.js.map