import { initFacultyGradingController } from '../../../faculty/controllers/gradingController.js';

describe('Faculty Grading Controller', () => {

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
      <select class="js-faculty-scope-type"></select>
      <select class="js-faculty-school-select"></select>
      <select class="js-faculty-department-select"></select>
      <select class="js-faculty-program-select"></select>
      <select class="js-faculty-course-select"></select>
      <select class="js-faculty-academic-year-select"></select>
      <select class="js-faculty-semester-select"></select>
      <input type="number" class="js-faculty-marks-input" />
      <form class="js-faculty-grade-form">
        <button type="submit" class="js-faculty-submit-grade-btn">Submit</button>
      </form>
      <input type="text" class="js-faculty-student-search-input" />
      <button class="js-faculty-student-search-btn">Search</button>
      <div class="js-faculty-student-result"></div>
      <div id="faculty-grading-message"></div>
    `;

    // Spy on fetch to avoid actual API calls during initialization routines
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response('[]', { status: 200 })));
  });

  afterEach(() => {
    const sandbox = document.getElementById('test-sandbox');
    sandbox.innerHTML = '';
  });

  it('should initialize grading controller without throwing', () => {
    expect(() => {
      initFacultyGradingController();
    }).not.toThrow();
  });

  it('should bind grade form submit and prevent default', () => {
    initFacultyGradingController();

    const form = document.querySelector('.js-faculty-grade-form');
    const submitEvent = new Event('submit', { cancelable: true });
    form.dispatchEvent(submitEvent);

    // Should cancel the actual submission
    expect(submitEvent.defaultPrevented).toBe(true);
  });

  it('should bind student search button', () => {
    initFacultyGradingController();

    const searchBtn = document.querySelector('.js-faculty-student-search-btn');
    const input = document.querySelector('.js-faculty-student-search-input');
    input.value = 'TEST-REG';

    // Dispatch a click
    expect(() => {
      searchBtn.click();
    }).not.toThrow();
  });
});
