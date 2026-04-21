import * as sessionModel from '../../../scripts/models/sessionModel.js';

describe('Session Model', () => {
  beforeEach(() => {
    localStorage.clear();
    spyOn(localStorage, 'setItem').and.callThrough();
    spyOn(localStorage, 'getItem').and.callThrough();
    spyOn(localStorage, 'removeItem').and.callThrough();
  });

  it('should save and load token', () => {
    sessionModel.saveToken('test-token');
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'test-token');
    expect(sessionModel.loadToken()).toBe('test-token');
  });

  it('should save and load current user', () => {
    const user = { id: 1, name: 'Test' };
    sessionModel.saveCurrentUser(user);
    expect(localStorage.setItem).toHaveBeenCalledWith('currentUserData', JSON.stringify(user));
    expect(sessionModel.loadCurrentUser()).toEqual(user);
  });

  it('should return null if user data is missing or invalid', () => {
    expect(sessionModel.loadCurrentUser()).toBeNull();

    localStorage.setItem('currentUserData', 'invalid-json');
    expect(sessionModel.loadCurrentUser()).toBeNull();
  });

  it('should clear session', () => {
    sessionModel.saveToken('token');
    sessionModel.saveCurrentUser({ id: 1 });

    sessionModel.clearSession();

    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('currentUserData');
    expect(sessionModel.loadToken()).toBeNull();
    expect(sessionModel.loadCurrentUser()).toBeNull();
  });
});
