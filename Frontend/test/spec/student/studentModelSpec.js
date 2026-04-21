import * as studentModel from '../../../student/models/studentDashboardModel.js';
import { API_BASE_URL } from '../../../scripts/models/apiConfig.js';

describe('Student Dashboard Model', () => {
  const mockToken = 'test-token';

  beforeEach(() => {
    spyOn(window, 'fetch');
  });

  it('should fetch student registered courses', async () => {
    const mockData = [{ courseId: 1, title: 'Math' }];
    const mockResponse = new Response(JSON.stringify(mockData), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await studentModel.fetchStudentRegisteredCourses('S123', mockToken);

    expect(window.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/students/me/courses/S123`, {
      method: "GET",
      headers: { Authorization: `Bearer ${mockToken}` }
    });
    expect(result.length).toBe(1);
    expect(result[0].courseId).toBe(1);
  });

  it('should fetch student exam statuses', async () => {
    const mockData = [{ courseId: 1, examRegistered: true }];
    const mockResponse = new Response(JSON.stringify(mockData), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await studentModel.fetchStudentExamStatuses('S123', mockToken);

    expect(window.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/students/me/courses/S123/exam-status`, {
      method: "GET",
      headers: { Authorization: `Bearer ${mockToken}` }
    });
    expect(result[0].examRegistered).toBeTrue();
  });

  it('should throw error on fetch failure', async () => {
    const mockResponse = new Response('{}', { status: 404 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    try {
      await studentModel.fetchStudentRegisteredCourses('S123', mockToken);
      fail('Expected an error to be thrown');
    } catch (e) {
      expect(e.message).toContain('failed with status 404');
    }
  });

  it('should fetch student fee status', async () => {
    const mockData = { balance: 5000, requiredAmount: 10000 };
    const mockResponse = new Response(JSON.stringify(mockData), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await studentModel.fetchStudentFeeStatus('S123', 'SEM1', mockToken);

    expect(window.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/students/S123/fees/SEM1/status`, {
      method: "GET",
      headers: { Authorization: `Bearer ${mockToken}` }
    });
    expect(result.balance).toBe(5000);
  });
});
