import { afterEach, describe, expect, it, vi } from 'vitest';
import { log } from './logger';

// TOR-01-LWNJkRM
// Given the application is running,
// When a message is logged at each of the four levels,
// Then the corresponding console method receives "[LEVEL] message".
describe('logger', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('emits "[DEBUG] message" via console.debug', () => {
    const debug = vi.spyOn(console, 'debug').mockImplementation(() => {});
    log.debug('message');
    expect(debug).toHaveBeenCalledWith('[DEBUG] message');
  });

  it('emits "[INFO] message" via console.info', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});
    log.info('message');
    expect(info).toHaveBeenCalledWith('[INFO] message');
  });

  it('emits "[WARN] message" via console.warn', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    log.warn('message');
    expect(warn).toHaveBeenCalledWith('[WARN] message');
  });

  it('emits "[ERROR] message" via console.error', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    log.error('message');
    expect(error).toHaveBeenCalledWith('[ERROR] message');
  });
});
