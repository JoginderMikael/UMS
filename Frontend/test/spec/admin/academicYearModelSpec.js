import * as academicYearModel from '../../../admin/models/academicYearModel.js';
import { API_BASE_URL } from '../../../scripts/models/apiConfig.js';

describe('Admin Academic Year Model', () => {
  const mockToken = 'test-token';

  beforeEach(() => {
    spyOn(window, 'fetch');
  });

  it('should create an academic year successfully', async () => {
    const mockData = { id: 1, name: '2023-2024' };
    const mockResponse = new Response(JSON.stringify(mockData), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await academicYearModel.createAcademicYear('2023-2024', mockToken);

    expect(window.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/academic-years/add`, jasmine.objectContaining({
      method: "POST",
      body: JSON.stringify({ name: '2023-2024' }),
      headers: jasmine.objectContaining({ Authorization: `Bearer ${mockToken}` })
    }));
    expect(result).toEqual(mockData);
  });

  it('should throw error when create fails', async () => {
    const mockResponse = new Response(JSON.stringify({ message: 'Exists' }), { status: 400 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    try {
      await academicYearModel.createAcademicYear('2023-2024', mockToken);
      fail();
    } catch (e) {
      expect(e.message).toBe('Exists');
    }
  });

  it('should fetch all academic years', async () => {
    const mockData = [{ id: 1 }];
    const mockResponse = new Response(JSON.stringify(mockData), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await academicYearModel.fetchAllAcademicYears(mockToken);
    expect(result).toEqual(mockData);
  });

  it('should activate an academic year', async () => {
    const mockResponse = new Response(JSON.stringify({ success: true }), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    await academicYearModel.activateAcademicYear(1, mockToken);
    expect(window.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/academic-years/1/activate`, jasmine.objectContaining({
      method: "PUT"
    }));
  });

  it('should fetch semesters by academic year', async () => {
    const mockData = [{ id: 1, number: 1 }];
    const mockResponse = new Response(JSON.stringify(mockData), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await academicYearModel.fetchSemestersByAcademicYear(1, mockToken);
    expect(result).toEqual(mockData);
  });

  it('should create a semester', async () => {
    const mockData = { id: 1, number: 2 };
    const mockResponse = new Response(JSON.stringify(mockData), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await academicYearModel.createSemester(1, 2, mockToken);
    expect(window.fetch).toHaveBeenCalledWith(jasmine.stringMatching(/\/academic-years\/1\/semesters\?number=2/), jasmine.objectContaining({
      method: "POST"
    }));
    expect(result).toEqual(mockData);
  });

  it('should activate a semester', async () => {
    const mockResponse = new Response(JSON.stringify({ success: true }), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    await academicYearModel.activateSemester(1, mockToken);
    expect(window.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/semesters/1/activate`, jasmine.objectContaining({
      method: "PUT"
    }));
  });

  it('should return null on invalid json in buildApiError', async () => {
    const mockResponse = new Response('not json', { status: 500 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    try {
      await academicYearModel.fetchAllAcademicYears(mockToken);
      fail();
    } catch (e) {
      expect(e.message).toContain('500');
    }
  });

  it('should return null on json error in createAcademicYear', async () => {
    const mockResponse = new Response('not-json', { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));
    const result = await academicYearModel.createAcademicYear('test', mockToken);
    expect(result).toBeNull();
  });

  it('should return null on json error in createSemester', async () => {
    const mockResponse = new Response('not-json', { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));
    const result = await academicYearModel.createSemester(1, 1, mockToken);
    expect(result).toBeNull();
  });

  it('should return null on json error in activateSemester', async () => {
    const mockResponse = new Response('not-json', { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));
    const result = await academicYearModel.activateSemester(1, mockToken);
    expect(result).toBeNull();
  });
});
