import { initStudentDashboardController } from '../../../student/controllers/studentDashboardController.js';

describe('Student Dashboard Controller', () => {

  beforeEach(() => {
    let sandbox = document.getElementById('test-sandbox');
    if (!sandbox) {
      sandbox = document.createElement('div');
      sandbox.id = 'test-sandbox';
      document.body.appendChild(sandbox);
    }
    // Mock token
    spyOn(localStorage, 'getItem').and.callFake((key) => {
      if (key === 'token') return 'mock-token';
      return null;
    });

    sandbox.innerHTML = `
      <div class="js-student-hero-summary"></div>
      <div class="wallet">
        <span class="amount"></span>
        <span></span>
      </div>
      <div class="js-student-dashboard-message"></div>
      
      <!-- Mocking elements needed by internal controllers to avoid DOM errors -->
      <a href="#register-exams" class="student-menu-link"></a>
      <div id="exam-registration-page"></div>
      <div id="register-courses"></div>
      <div id="fee-payment-page"></div>
      <div id="register-semester"></div>
      <div id="results-transcripts-page"></div>
    `;

    // Spy on fetch to avoid actual API calls during initialization routines
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response('[]', { status: 200 })));
  });

  afterEach(() => {
    const sandbox = document.getElementById('test-sandbox');
    sandbox.innerHTML = '';
  });

  it('should initialize student dashboard controller without throwing immediately', async () => {
    let errorThrown = false;
    try {
      await initStudentDashboardController();
    } catch (e) {
      errorThrown = true;
    }
    expect(errorThrown).toBeFalse();
  });
});
