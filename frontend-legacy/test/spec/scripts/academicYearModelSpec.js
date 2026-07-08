import * as academicYearModel from '../../../scripts/models/academicYearModel.js';
import { API_BASE_URL } from '../../../scripts/models/apiConfig.js';

describe('Academic Year Model (Shared)', () => {
  beforeEach(() => {
    spyOn(window, 'fetch');
  });

  it('should fetch all academic years with token', async () => {
    const mockData = [{ id: 1, year: '2023/2024' }];
    const mockResponse = new Response(JSON.stringify(mockData), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await academicYearModel.fetchAllAcademicYears('test-token');

    expect(window.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/academic-years/all`, jasmine.objectContaining({
      headers: { Authorization: 'Bearer test-token' }
    }));
    expect(result).toEqual(mockData);
  });

  it('should fetch all academic years without token', async () => {
    const mockData = [{ id: 1, year: '2023/2024' }];
    const mockResponse = new Response(JSON.stringify(mockData), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await academicYearModel.fetchAllAcademicYears();

    expect(window.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/academic-years/all`, jasmine.objectContaining({
      method: "GET"
    }));
    expect(result).toEqual(mockData);
  });

  it('should throw error on fetch failure', async () => {
    const mockResponse = new Response(null, { status: 500 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    try {
      await academicYearModel.fetchAllAcademicYears();
      fail('Should have thrown an error');
    } catch (e) {
      expect(e.message).toContain('500');
    }
  });

  it('should return empty array on invalid json', async () => {
    const mockResponse = new Response('invalid json', { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await academicYearModel.fetchAllAcademicYears();
    expect(result).toEqual([]);
  });
});
