import * as userModel from '../../../admin/models/userModel.js';
import { API_BASE_URL } from '../../../scripts/models/apiConfig.js';

describe('Admin User Model', () => {
  const mockToken = 'test-token';
  const mockPayload = { name: 'Test User', email: 'test@example.com' };

  beforeEach(() => {
    spyOn(window, 'fetch');
  });

  it('should create a user successfully', async () => {
    const mockResponse = new Response(JSON.stringify({ id: 1, ...mockPayload }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await userModel.createUser(mockPayload, mockToken);

    expect(window.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/users/createuser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mockToken}`
      },
      body: JSON.stringify(mockPayload)
    });
    expect(result.id).toBe(1);
    expect(result.name).toBe('Test User');
  });

  it('should throw an error when creating user fails', async () => {
    const mockResponse = new Response(JSON.stringify({ message: 'Error' }), { status: 400 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    try {
      await userModel.createUser(mockPayload, mockToken);
      fail('Expected an error to be thrown');
    } catch (e) {
      expect(e.message).toBe('Error');
    }
  });

  it('should fetch all users', async () => {
    const mockData = [{ id: 1, name: 'User 1' }, { id: 2, name: 'User 2' }];
    const mockResponse = new Response(JSON.stringify(mockData), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await userModel.fetchAllUsers(mockToken);

    expect(window.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/users/allusers`, {
      method: "GET",
      headers: { Authorization: `Bearer ${mockToken}` }
    });
    expect(result.length).toBe(2);
  });

  it('should fetch user by ID', async () => {
    const mockData = { id: 1, name: 'User 1' };
    const mockResponse = new Response(JSON.stringify(mockData), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await userModel.fetchUserById(1, mockToken);

    expect(window.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/users/1`, {
      method: "GET",
      headers: { Authorization: `Bearer ${mockToken}` }
    });
    expect(result.id).toBe(1);
  });

  it('should fetch user by email', async () => {
    const mockData = { id: 1, email: 'test@example.com' };
    const mockResponse = new Response(JSON.stringify(mockData), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const email = 'test@example.com';
    const result = await userModel.fetchUserByEmail(email, mockToken);

    expect(window.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/users/email/${encodeURIComponent(email)}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${mockToken}` }
    });
    expect(result.email).toBe(email);
  });

  it('should update user', async () => {
    const mockResponse = new Response(JSON.stringify({ id: 1, ...mockPayload }), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await userModel.updateUser(1, mockPayload, mockToken);

    expect(window.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/users/1`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mockToken}`
      },
      body: JSON.stringify(mockPayload)
    });
    expect(result.id).toBe(1);
  });

  it('should delete user', async () => {
    const mockResponse = new Response(null, { status: 204 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    await userModel.deleteUser(1, mockToken);

    expect(window.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/users/1`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${mockToken}` }
    });
  });

  it('should restore deleted user', async () => {
    const mockResponse = new Response(null, { status: 204 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    await userModel.restoreDeletedUser(1, mockToken);

    expect(window.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/users/1/restore`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${mockToken}` }
    });
  });

  it('should fetch all deleted users', async () => {
    const mockData = [{ id: 1, name: 'Deleted' }];
    const mockResponse = new Response(JSON.stringify(mockData), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await userModel.fetchAllDeletedUsers(mockToken);
    expect(result.length).toBe(1);
  });

  it('should update student user', async () => {
    const mockData = { id: 1, regNo: '123' };
    const mockResponse = new Response(JSON.stringify(mockData), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await userModel.updateStudentUser(1, { regNo: '123' }, mockToken);
    expect(result.regNo).toBe('123');
  });

  it('should fetch all schools', async () => {
    const mockData = [{ id: 1, name: 'School 1' }];
    const mockResponse = new Response(JSON.stringify(mockData), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await userModel.fetchAllSchools(mockToken);
    expect(result.length).toBe(1);
  });

  it('should fetch programs by school', async () => {
    const mockData = [{ id: 1, name: 'Program 1' }];
    const mockResponse = new Response(JSON.stringify(mockData), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await userModel.fetchProgramsBySchool(1, mockToken);
    expect(result.length).toBe(1);
  });

  it('should handle delete user errors', async () => {
    const mockResponse = new Response(JSON.stringify({ message: 'Fail' }), { status: 500 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    try {
      await userModel.deleteUser(1, mockToken);
      fail();
    } catch (e) {
      expect(e.status).toBe(500);
      expect(e.message).toBe('Fail');
    }
  });

  it('should handle restore user errors', async () => {
    const mockResponse = new Response(JSON.stringify({ message: 'Fail' }), { status: 500 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    try {
      await userModel.restoreDeletedUser(1, mockToken);
      fail();
    } catch (e) {
      expect(e.status).toBe(500);
    }
  });

  it('should handle non-json in buildApiError', async () => {
    const mockResponse = new Response('text', { status: 403 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    try {
      await userModel.createUser({}, mockToken);
      fail();
    } catch (e) {
      expect(e.message).toContain('403');
    }
  });
});
