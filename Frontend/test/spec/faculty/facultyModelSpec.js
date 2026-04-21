import * as gradingModel from '../../../faculty/models/gradingModel.js';
import { API_BASE_URL } from '../../../scripts/models/apiConfig.js';

describe('Faculty Grading Model', () => {
  const mockToken = 'test-token';

  beforeEach(() => {
    spyOn(window, 'fetch');
  });

  it('should fetch schools successfully', async () => {
    const mockData = [{ id: 1, name: 'School 1', code: 'S1' }];
    const mockResponse = new Response(JSON.stringify(mockData), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await gradingModel.fetchSchools(mockToken);

    expect(window.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/schools/getAll`, {
      method: "GET",
      headers: { Authorization: `Bearer ${mockToken}` }
    });
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(1);
    expect(result[0].name).toBe('School 1');
  });

  it('should return empty when fetching departments without schoolId', async () => {
    const result = await gradingModel.fetchDepartmentsBySchool(null, mockToken);
    expect(result).toEqual([]);
    expect(window.fetch).not.toHaveBeenCalled();
  });

  it('should process normalizeSchool correctly', () => {
    const raw = { id: 2, name: 'Test', code: 'TS' };
    const normalized = gradingModel.normalizeSchool(raw);
    expect(normalized.schoolId).toBe('2');
    expect(normalized.name).toBe('Test');
    expect(normalized.code).toBe('TS');
  });

  it('should fetch student by registration number', async () => {
    const mockData = { id: 1, registrationNumber: 'REG123', firstName: 'John', lastName: 'Doe' };
    const mockResponse = new Response(JSON.stringify(mockData), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await gradingModel.fetchStudentByRegistrationNumber('REG123', mockToken);

    expect(window.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/students/registration/details?registrationNumber=REG123`,
      jasmine.any(Object)
    );
    expect(result.id).toBe(1);
  });

  it('should submit student grade', async () => {
    const payload = { studentId: 1, courseId: 2, semesterId: 3, marks: 85 };
    const mockResponse = new Response(JSON.stringify({ success: true }), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    await gradingModel.submitStudentGrade(payload, mockToken);

    expect(window.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/results/grade`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mockToken}`
      },
      body: JSON.stringify(payload)
    });
  });
});
