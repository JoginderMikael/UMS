import * as programModel from '../../../admin/models/programModel.js';
import { API_BASE_URL } from '../../../scripts/models/apiConfig.js';

describe('Admin Program Model', () => {
  const mockToken = 'test-token';

  beforeEach(() => {
    spyOn(window, 'fetch');
  });

  it('should create a program', async () => {
    const payload = { name: 'CS' };
    const mockResponse = new Response(JSON.stringify({ id: 1, ...payload }), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await programModel.createProgram(payload, mockToken);
    expect(result.id).toBe(1);
  });

  it('should fetch all schools', async () => {
    const mockResponse = new Response(JSON.stringify([{ id: 1 }]), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await programModel.fetchAllSchoolsForPrograms(mockToken);
    expect(result.length).toBe(1);
  });

  it('should fetch departments by school', async () => {
    const mockResponse = new Response(JSON.stringify([{ id: 1 }]), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await programModel.fetchDepartmentsBySchoolForPrograms(1, mockToken);
    expect(result.length).toBe(1);
  });

  it('should fetch programs minimal', async () => {
    const mockResponse = new Response(JSON.stringify([{ id: 1 }]), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await programModel.fetchAllProgramsMinimal(mockToken);
    expect(result.length).toBe(1);
  });

  it('should fetch program by ID', async () => {
    const mockResponse = new Response(JSON.stringify({ id: 1 }), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await programModel.fetchProgramById(1, mockToken);
    expect(result.id).toBe(1);
  });

  it('should fetch programs by school', async () => {
    const mockResponse = new Response(JSON.stringify([{ id: 1 }]), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await programModel.fetchProgramsBySchool(1, mockToken);
    expect(result.length).toBe(1);
  });

  it('should fetch programs by department', async () => {
    const mockResponse = new Response(JSON.stringify([{ id: 1 }]), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await programModel.fetchProgramsByDepartment(1, mockToken);
    expect(result.length).toBe(1);
  });

  it('should update program', async () => {
    const mockResponse = new Response(JSON.stringify({ id: 1 }), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await programModel.updateProgram(1, { name: 'New' }, mockToken);
    expect(result.id).toBe(1);
  });

  it('should delete program', async () => {
    const mockResponse = new Response(JSON.stringify({ success: true }), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await programModel.deleteProgram(1, mockToken);
    expect(result.success).toBe(true);
  });

  it('should fetch courses by school', async () => {
    const mockResponse = new Response(JSON.stringify([{ id: 1 }]), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await programModel.fetchCoursesBySchool(1, mockToken);
    expect(result.length).toBe(1);
  });

  it('should add course to program', async () => {
    const mockResponse = new Response(JSON.stringify({ id: 1 }), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await programModel.addCourseToProgram(1, 10, {}, mockToken);
    expect(result.id).toBe(1);
  });

  it('should fetch program courses', async () => {
    const mockResponse = new Response(JSON.stringify([{ id: 1 }]), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await programModel.fetchProgramCourses(1, mockToken);
    expect(result.length).toBe(1);
  });

  it('should remove course from program', async () => {
    const mockResponse = new Response(JSON.stringify({ success: true }), { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));

    const result = await programModel.removeCourseFromProgram(1, 10, mockToken);
    expect(result.success).toBe(true);
  });

  it('should return null on json error in updateProgramCourseAssociation', async () => {
    const mockResponse = new Response('not-json', { status: 200 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));
    const result = await programModel.updateProgramCourseAssociation(1, 10, {}, mockToken);
    expect(result).toBeNull();
  });

  it('should handle api error in updateProgramCourseAssociation', async () => {
    const mockResponse = new Response(JSON.stringify({ message: 'Err' }), { status: 400 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));
    try {
      await programModel.updateProgramCourseAssociation(1, 10, {}, mockToken);
      fail();
    } catch (e) {
      expect(e.message).toBe('Err');
    }
  });

  it('should handle non-json in buildApiError', async () => {
    const mockResponse = new Response('text', { status: 500 });
    window.fetch.and.returnValue(Promise.resolve(mockResponse));
    try {
      await programModel.fetchAllSchoolsForPrograms(mockToken);
      fail();
    } catch (e) {
      expect(e.message).toContain('500');
    }
  });
});
