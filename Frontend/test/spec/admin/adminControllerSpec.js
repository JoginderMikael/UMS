import { initAdminController } from '../../../admin/controllers/adminController.js';
import { API_BASE_URL } from '../../../scripts/models/apiConfig.js';
import * as sessionModel from '../../../scripts/models/sessionModel.js';

describe('Admin Controller', () => {

  beforeEach(() => {
    // Clear localStorage to ensure a clean state
    localStorage.clear();
    localStorage.setItem('token', 'mock-token');

    // Setup the DOM sandbox
    let sandbox = document.getElementById('test-sandbox');
    if (!sandbox) {
      sandbox = document.createElement('div');
      sandbox.id = 'test-sandbox';
      document.body.appendChild(sandbox);
    }
    sandbox.innerHTML = `
      <div class="hero"></div>
      <button class="js-menu-toggle"></button>
      <div class="sidebar"></div>
      <div class="js-menu-backdrop"></div>
      <a href="#" class="js-create-user">Create User</a>
      <a href="#" class="js-view-user-details">View Details</a>
      <a href="#" class="js-view-all-users">View All Users</a>
      <a href="#" class="js-view-deleted-users">View Deleted Users</a>
      <div class="content"></div>
    `;

    // Spy on window.fetch and provide a default response
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response(JSON.stringify([]), { status: 200 })));
  });

  afterEach(() => {
    const sandbox = document.getElementById('test-sandbox');
    if (sandbox) sandbox.innerHTML = '';
    localStorage.clear();
  });

  const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 100));

  it('should handle user creation success', async () => {
    initAdminController();
    document.querySelector('.js-create-user').dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const form = document.querySelector('#create-user-form');
    const newUser = { id: 1, firstName: 'John', lastName: 'Doe', email: 'j@d.com', role: 'ADMIN' };
    window.fetch.and.returnValue(Promise.resolve(new Response(JSON.stringify(newUser), { status: 200 })));

    form.querySelector('#firstName').value = 'John';
    form.querySelector('#lastName').value = 'Doe';
    form.querySelector('#email').value = 'j@d.com';
    form.querySelector('#password').value = 'pass';
    form.querySelector('#role').value = 'ADMIN';

    form.dispatchEvent(new Event('submit', { cancelable: true }));

    await waitForAsync();

    expect(window.fetch).toHaveBeenCalledWith(jasmine.stringMatching(/\/users\/createuser/), jasmine.any(Object));
    const resultContainer = document.querySelector('#created-user-result');
    expect(resultContainer.hidden).toBe(false);
    expect(resultContainer.textContent).toContain('John');
  });

  it('should handle fetch all users success', async () => {
    initAdminController();
    const mockUsers = [{ id: '123', firstName: 'Test', lastName: 'User', email: 'test@u.com', role: 'FACULTY' }];
    window.fetch.and.returnValue(Promise.resolve(new Response(JSON.stringify(mockUsers), { status: 200 })));

    document.querySelector('.js-view-all-users').dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await waitForAsync();

    expect(window.fetch).toHaveBeenCalledWith(jasmine.stringMatching(/\/users\/all/), jasmine.any(Object));
    const tableBody = document.querySelector('.js-users-table-body');
    expect(tableBody.innerHTML).toContain('Test');
  });

  it('should handle user lookup success', async () => {
    initAdminController();
    document.querySelector('.js-view-user-details').dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const form = document.querySelector('#user-lookup-form');
    form.querySelector('#user-lookup-search-by').value = 'email';
    form.querySelector('#user-lookup-query').value = 'test@u.com';

    const foundUser = { id: '456', firstName: 'Found', email: 'test@u.com' };
    window.fetch.and.returnValue(Promise.resolve(new Response(JSON.stringify(foundUser), { status: 200 })));

    form.dispatchEvent(new Event('submit', { cancelable: true }));

    await waitForAsync();

    expect(window.fetch).toHaveBeenCalledWith(jasmine.stringMatching(/test@u.com/), jasmine.any(Object));
    const resultContainer = document.querySelector('#user-lookup-result');
    expect(resultContainer.innerHTML).toContain('Found');
  });

  it('should show error when token is missing', async () => {
    localStorage.clear(); // Remove the token
    initAdminController();

    document.querySelector('.js-create-user').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const form = document.querySelector('#create-user-form');
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    await waitForAsync();
    expect(document.querySelector('#create-user-message').textContent).toContain('Session expired');
  });
});
