/**
 * Tests for non-Claude provider auto-detection (issue #1201)
 *
 * When CC Switch or similar tools route requests to non-Claude providers,
 * OMC should auto-enable forceInherit to avoid passing Claude-specific
 * model tier names (sonnet/opus/haiku) that cause 400 errors.
 */
export {};
//# sourceMappingURL=non-claude-provider-detection.test.d.ts.map