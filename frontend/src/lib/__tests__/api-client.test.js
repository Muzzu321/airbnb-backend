import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeApiError, describeError, ApiError } from '../api-error.js';
import { createSingleFlight } from '../single-flight.js';

test('uses backend error.message and subErrors', () => {
  const err = normalizeApiError({
    response: {
      status: 400,
      data: { data: null, error: { status: 'BAD_REQUEST', message: 'Validation failed', subErrors: ['email: must be a well-formed email address'] } },
    },
  });
  assert.ok(err instanceof ApiError);
  assert.equal(err.status, 400);
  assert.equal(err.code, 'BAD_REQUEST');
  assert.equal(err.message, 'Validation failed');
  assert.match(describeError(err), /well-formed/);
});

test('does not throw when the body has no error object (the original interceptor crashed here)', () => {
  const err = normalizeApiError({
    response: { status: 500, data: { data: { status: 500, error: 'Internal Server Error' }, error: null } },
  });
  assert.equal(err.status, 500);
  assert.match(err.message, /server/i);
});

test('handles empty / non-object bodies', () => {
  assert.equal(normalizeApiError({ response: { status: 403, data: '' } }).message, 'You do not have permission to do this.');
  assert.equal(normalizeApiError({ response: { status: 404, data: null } }).status, 404);
  assert.equal(normalizeApiError({ response: { status: 409, data: '<html>' } }).status, 409);
  assert.equal(normalizeApiError({ response: { status: 422, data: {} } }).status, 422);
});

test('network failure vs timeout', () => {
  const net = normalizeApiError({ message: 'Network Error' });
  assert.equal(net.isNetworkError, true);
  assert.equal(net.status, null);
  const to = normalizeApiError({ code: 'ECONNABORTED', message: 'timeout of 15000ms exceeded' });
  assert.equal(to.isTimeout, true);
  assert.equal(to.isNetworkError, false);
});

test('single flight shares ONE in-flight call and then allows a new one', async () => {
  let calls = 0;
  const refresh = createSingleFlight(async () => {
    calls++;
    await new Promise((r) => setTimeout(r, 10));
    return 'token-' + calls;
  });
  const results = await Promise.all([refresh(), refresh(), refresh()]);
  assert.deepEqual(results, ['token-1', 'token-1', 'token-1']);
  assert.equal(calls, 1);
  assert.equal(await refresh(), 'token-2');
});

test('single flight resets after a failure', async () => {
  let n = 0;
  const f = createSingleFlight(async () => {
    n++;
    if (n === 1) throw new Error('boom');
    return 'ok';
  });
  await assert.rejects(f(), /boom/);
  assert.equal(await f(), 'ok');
});
