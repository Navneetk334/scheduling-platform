import { describe, expect, it } from 'vitest';

import { err, isErr, isOk, ok } from './result';

describe('Result helpers', () => {
  it('constructs and narrows success', () => {
    const r = ok(42);
    expect(isOk(r)).toBe(true);
    expect(isErr(r)).toBe(false);
    if (isOk(r)) expect(r.value).toBe(42);
  });

  it('constructs and narrows failure', () => {
    const r = err('nope');
    expect(isErr(r)).toBe(true);
    expect(isOk(r)).toBe(false);
    if (isErr(r)) expect(r.error).toBe('nope');
  });
});
