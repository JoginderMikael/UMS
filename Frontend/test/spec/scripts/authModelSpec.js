import * as authModel from '../../../scripts/models/authModel.js';
import { API_BASE_URL } from '../../../scripts/models/apiConfig.js';

describe('Auth Model', () => {
  const mockToken = 'test-token';
  const mockUser = { id: 1, name: 'Test User' };

  beforeEach(() => {
    spyOn(window, 'fetch');
  });

  it('should login with credentials successfully', async () => {
    const mockResponse = new Response(JSON.stringify({ token: mockToken }), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await authModel.loginWithCredentials('test@example.com', 'password');

    expect(window.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/auth/login`, jasmine.objectContaining({
      method: "POST",
      body: JSON.stringify({ email: 'test@example.com', password: 'password' })
    }));
    expect(result.token).toBe(mockToken);
  });

  it('should throw error on login failure', async () => {
    const mockResponse = new Response(null, { status: 401 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    try {
      await authModel.loginWithCredentials('test@example.com', 'wrong');
      fail('Should have thrown an error');
    } catch (e) {
      expect(e.message).toContain('401');
      expect(e.status).toBe(401);
    }
  });

  it('should fetch current user and unwrap it', async () => {
    const mockPayload = { data: mockUser };
    const mockResponse = new Response(JSON.stringify(mockPayload), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await authModel.fetchCurrentUser(mockToken);

    expect(window.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/users/me`, jasmine.objectContaining({
      headers: { Authorization: `Bearer ${mockToken}` }
    }));
    expect(result).toEqual(mockUser);
  });

  it('should handle deeply nested entities during unwrap', async () => {
    const nestedPayload = { result: { record: mockUser } };
    const mockResponse = new Response(JSON.stringify(nestedPayload), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await authModel.fetchCurrentUser(mockToken);
    expect(result).toEqual(mockUser);
  });

  it('should logout successfully', async () => {
    const mockResponse = new Response(null, { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    await authModel.logoutAuthenticatedUser(mockToken);

    expect(window.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/auth/logout`, jasmine.objectContaining({
      method: "POST",
      headers: { Authorization: `Bearer ${mockToken}` }
    }));
  });

  it('should throw error on fetchCurrentUser failure', async () => {
    const mockResponse = new Response(null, { status: 404 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    try {
      await authModel.fetchCurrentUser(mockToken);
      fail('Should have thrown an error');
    } catch (e) {
      expect(e.status).toBe(404);
    }
  });

  it('should throw error on logout failure', async () => {
    const mockResponse = new Response(null, { status: 500 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    try {
      await authModel.logoutAuthenticatedUser(mockToken);
      fail('Should have thrown an error');
    } catch (e) {
      expect(e.status).toBe(500);
    }
  });

  it('should return original value in unwrapEntity if not an object or is array', async () => {
    const mockResponse = new Response(JSON.stringify([1, 2, 3]), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));
    const result = await authModel.fetchCurrentUser(mockToken);
    expect(result).toEqual([1, 2, 3]);
  });
});
