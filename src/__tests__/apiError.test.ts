import { ApiError, getErrorMessage } from '@/lib/apiError';

/** Builds a `Response` with the given status and headers for `fromResponse`. */
function res(status: number, headers: Record<string, string> = {}): Response {
  return new Response(null, { status: status === 0 ? 500 : status, headers }) as Response;
}

describe('ApiError.fromResponse', () => {
  it('keys on the envelope error.code rather than the message text', () => {
    const error = ApiError.fromResponse(res(403), {
      success: false,
      error: { code: 'TENANT_MISMATCH', message: 'Wrong school' },
    });

    expect(error.code).toBe('TENANT_MISMATCH');
    expect(error.message).toBe('Wrong school');
    expect(error.status).toBe(403);
  });

  it('falls back to a code derived from the status when the body has none', () => {
    expect(ApiError.fromResponse(res(404), null).code).toBe('NOT_FOUND');
    expect(ApiError.fromResponse(res(409), null).code).toBe('CONFLICT');
    expect(ApiError.fromResponse(res(429), null).code).toBe('RATE_LIMITED');
  });

  it("ignores a code the client doesn't know, keeping the status-derived one", () => {
    const error = ApiError.fromResponse(res(400), {
      error: { code: 'SOMETHING_NEW', message: 'nope' },
    });
    expect(error.code).toBe('BAD_REQUEST');
  });

  it("maps Nest's legacy array message onto field-less validation details", () => {
    const error = ApiError.fromResponse(res(400), {
      message: ['email must be an email', 'password is too short'],
    });

    expect(error.code).toBe('VALIDATION_FAILED');
    expect(error.details).toHaveLength(2);
    expect(error.fieldErrors()).toEqual({});
  });

  it('maps details onto fields for form binding, keeping the first per field', () => {
    const error = ApiError.fromResponse(res(400), {
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Some fields need attention.',
        details: [
          { field: 'email', reason: 'must be an email' },
          { field: 'email', reason: 'is already taken' },
          { reason: 'unrelated' },
        ],
      },
    });

    expect(error.fieldErrors()).toEqual({ email: 'must be an email' });
  });

  it('narrows a 401 mentioning expiry to TOKEN_EXPIRED', () => {
    const error = ApiError.fromResponse(res(401), { message: 'jwt expired' });
    expect(error.code).toBe('TOKEN_EXPIRED');
    expect(error.isAuthError).toBe(true);
  });

  it('carries the request id through for support', () => {
    const error = ApiError.fromResponse(res(500, { 'x-request-id': 'req-9' }), null);
    expect(error.requestId).toBe('req-9');
  });
});

describe('ApiError classification', () => {
  it('treats network, timeout, rate limit and 5xx as transient', () => {
    expect(ApiError.offline().isTransient).toBe(true);
    expect(ApiError.timeout().isTransient).toBe(true);
    expect(ApiError.unreachable().isTransient).toBe(true);
    expect(new ApiError('RATE_LIMITED', 'slow down', 429).isTransient).toBe(true);
    expect(new ApiError('INTERNAL_ERROR', 'boom', 500).isTransient).toBe(true);
  });

  it('does not treat client errors as transient', () => {
    expect(new ApiError('VALIDATION_FAILED', 'bad', 400).isTransient).toBe(false);
    expect(new ApiError('FORBIDDEN', 'no', 403).isTransient).toBe(false);
  });

  it('recognises only the two auth codes as auth errors', () => {
    expect(new ApiError('UNAUTHENTICATED', 'x', 401).isAuthError).toBe(true);
    expect(new ApiError('TOKEN_EXPIRED', 'x', 401).isAuthError).toBe(true);
    // FORBIDDEN means "signed in, but not allowed" — never sign the user out.
    expect(new ApiError('FORBIDDEN', 'x', 403).isAuthError).toBe(false);
  });
});

describe('getErrorMessage', () => {
  it('prefers the ApiError message', () => {
    expect(getErrorMessage(new ApiError('CONFLICT', 'Already exists', 409))).toBe('Already exists');
  });

  it('hides raw fetch failures behind the fallback', () => {
    expect(getErrorMessage(new TypeError('Failed to fetch'), 'Could not load')).toBe('Could not load');
  });

  it('falls back for values that are not errors at all', () => {
    expect(getErrorMessage(undefined, 'Could not load')).toBe('Could not load');
    expect(getErrorMessage({ nope: true }, 'Could not load')).toBe('Could not load');
  });
});
