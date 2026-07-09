const API_BASE_URL = '/api/v1'

export type School = {
  id?: string | number
  schoolId?: string | number
  name?: string
  schoolName?: string
  code?: string
  schoolCode?: string
}

export type Department = {
  id?: string | number
  departmentId?: string | number
  schoolId?: string | number
  name?: string
  departmentName?: string
  code?: string
  departmentCode?: string
  schoolName?: string
  schoolCode?: string
}

export type Program = {
  id?: string | number
  programId?: string | number
  schoolId?: string | number
  departmentId?: string | number
  name?: string
  programName?: string
  code?: string
  programCode?: string
  schoolName?: string
  schoolCode?: string
  departmentName?: string
  departmentCode?: string
}

export type Course = {
  id?: string | number
  courseId?: string | number
  schoolId?: string | number
  departmentId?: string | number
  title?: string
  courseTitle?: string
  code?: string
  courseCode?: string
  creditUnits?: number
  schoolName?: string
  schoolCode?: string
  departmentName?: string
  departmentCode?: string
  courseType?: string
  yearOfStudy?: number
}

export type User = {
  id?: string | number
  userId?: string | number
  firstName?: string
  lastName?: string
  email?: string
  role?: string
  schoolId?: string | number
  programId?: string | number
}

export type AcademicYear = {
  id?: string | number
  academicYearId?: string | number
  name?: string
  active?: boolean
}

export type Semester = {
  id?: string | number
  semesterId?: string | number
  name?: string
  number?: number
  active?: boolean
}

export type DashboardSummary = {
  totalSchools: number
  totalDepartments: number
  totalPrograms: number
  totalCourses: number
  totalStudents: number
  totalAdmins: number
  totalFaculty: number
  activeAcademicYear: string
  activeSemester: string
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  token: string
  body?: unknown
}

async function request<T = unknown>(path: string, options: RequestOptions): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${options.token}`,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  if (!response.ok) {
    throw await buildApiError(response, `${options.method ?? 'GET'} ${path}`)
  }

  if (response.status === 204) {
    return null as T
  }

  const text = await response.text()
  if (!text.trim()) {
    return null as T
  }

  try {
    return JSON.parse(text) as T
  } catch {
    return text as T
  }
}

async function buildApiError(response: Response, action: string): Promise<Error> {
  let errorMessage = `${action} failed with status ${response.status}`

  try {
    const errorBody = (await response.json()) as { message?: string; error?: string }
    errorMessage = errorBody?.message || errorBody?.error || errorMessage
  } catch {
    // keep fallback
  }

  return new Error(errorMessage)
}

export function normalizeCollection<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[]
  }

  if (!value || typeof value !== 'object') {
    return []
  }

  const candidateKeys = [
    'data',
    'content',
    'items',
    'results',
    'users',
    'schools',
    'departments',
    'programs',
    'courses',
    'academicYears',
    'semesters',
  ]

  for (const key of candidateKeys) {
    const nested = (value as Record<string, unknown>)[key]
    if (Array.isArray(nested)) {
      return nested as T[]
    }

    if (nested && typeof nested === 'object') {
      const normalized = normalizeCollection<T>(nested)
      if (normalized.length > 0) {
        return normalized
      }
    }
  }

  for (const nested of Object.values(value as Record<string, unknown>)) {
    if (Array.isArray(nested)) {
      return nested as T[]
    }
  }

  for (const nested of Object.values(value as Record<string, unknown>)) {
    if (nested && typeof nested === 'object') {
      const normalized = normalizeCollection<T>(nested)
      if (normalized.length > 0) {
        return normalized
      }
    }
  }

  return []
}

// Users
export async function fetchAllUsers(token: string): Promise<User[]> {
  const response = await request('/users/allusers', { token })
  return normalizeCollection<User>(response)
}

export async function fetchAllDeletedUsers(token: string): Promise<User[]> {
  const response = await request('/users/allDeleted', { token })
  return normalizeCollection<User>(response)
}

export async function createUser(
  token: string,
  payload: {
    firstName: string
    lastName: string
    email: string
    role: string
    schoolId?: string
    programId?: string
  },
): Promise<User | null> {
  return request('/users/createuser', { method: 'POST', token, body: payload })
}

export async function fetchUserById(token: string, id: string): Promise<User | null> {
  return request(`/users/${id}`, { token })
}

export async function fetchUserByEmail(token: string, email: string): Promise<User | null> {
  return request(`/users/email/${encodeURIComponent(email)}`, { token })
}

export async function updateUser(
  token: string,
  id: string,
  payload: {
    firstName?: string
    lastName?: string
    email?: string
    role?: string
    schoolId?: string
    programId?: string
  },
): Promise<User | null> {
  return request(`/users/${id}`, { method: 'PUT', token, body: payload })
}

export async function deleteUser(token: string, id: string): Promise<void> {
  await request(`/users/${id}`, { method: 'DELETE', token })
}

export async function restoreDeletedUser(token: string, id: string): Promise<void> {
  await request(`/users/${id}/restore`, { method: 'PUT', token })
}

// Schools
export async function fetchAllSchools(token: string): Promise<School[]> {
  const response = await request('/schools/getAll', { token })
  return normalizeCollection<School>(response)
}

export async function createSchool(token: string, payload: { name: string; code: string }): Promise<School | null> {
  return request('/schools/addSchool', { method: 'POST', token, body: payload })
}

export async function updateSchool(token: string, schoolId: string, payload: { name: string; code: string }): Promise<School | null> {
  return request(`/schools/${schoolId}`, { method: 'PUT', token, body: payload })
}

export async function deleteSchool(token: string, schoolId: string): Promise<void> {
  await request(`/schools/${schoolId}`, { method: 'DELETE', token })
}

export async function fetchAllDeletedSchools(token: string): Promise<School[]> {
  const response = await request('/schools/deletedSchools', { token })
  return normalizeCollection<School>(response)
}

export async function restoreDeletedSchool(token: string, schoolId: string): Promise<void> {
  await request(`/schools/${schoolId}/restore`, { method: 'PUT', token })
}

// Departments
export async function fetchDepartmentsBySchool(token: string, schoolId: string): Promise<Department[]> {
  const response = await request(`/${schoolId}/departments/all`, { token })
  return normalizeCollection<Department>(response)
}

export async function createDepartment(
  token: string,
  schoolId: string,
  payload: { name: string; code: string },
): Promise<Department | null> {
  return request(`/${schoolId}/departments/addDepartment`, { method: 'POST', token, body: payload })
}

export async function updateDepartment(
  token: string,
  schoolId: string,
  departmentId: string,
  payload: { name: string; code: string },
): Promise<Department | null> {
  return request(`/${schoolId}/departments/${departmentId}`, { method: 'PUT', token, body: payload })
}

export async function deleteDepartment(token: string, schoolId: string, departmentId: string): Promise<void> {
  await request(`/${schoolId}/departments/${departmentId}`, { method: 'DELETE', token })
}

export async function fetchDeletedDepartmentsBySchool(token: string, schoolId: string): Promise<Department[]> {
  const response = await request(`/${schoolId}/departments/allDeleted`, { token })
  return normalizeCollection<Department>(response)
}

export async function restoreDeletedDepartment(token: string, schoolId: string, departmentId: string): Promise<void> {
  await request(`/${schoolId}/departments/${departmentId}/restore`, { method: 'PUT', token })
}

// Programs
export async function fetchAllProgramsMinimal(token: string): Promise<Program[]> {
  const response = await request('/programs/all', { token })
  return normalizeCollection<Program>(response)
}

export async function fetchProgramsBySchool(token: string, schoolId: string): Promise<Program[]> {
  const response = await request(`/programs/schools/${schoolId}`, { token })
  return normalizeCollection<Program>(response)
}

export async function fetchProgramsByDepartment(token: string, departmentId: string): Promise<Program[]> {
  const response = await request(`/programs/departments/${departmentId}`, { token })
  return normalizeCollection<Program>(response)
}

export async function fetchProgramById(token: string, programId: string): Promise<Program | null> {
  return request(`/programs/${programId}`, { token })
}

export async function createProgram(
  token: string,
  payload: { name: string; code: string; schoolId: string; departmentId: string },
): Promise<Program | null> {
  return request('/programs/add', { method: 'POST', token, body: payload })
}

export async function updateProgram(
  token: string,
  programId: string,
  payload: { name: string; code: string },
): Promise<Program | null> {
  return request(`/programs/${programId}`, { method: 'PUT', token, body: payload })
}

export async function deleteProgram(token: string, programId: string): Promise<void> {
  await request(`/programs/${programId}`, { method: 'DELETE', token })
}

export async function addCourseToProgram(
  token: string,
  programId: string,
  courseId: string,
  payload: { courseType: string; yearOfStudy: number },
): Promise<void> {
  await request(`/programs/${programId}/courses/${courseId}`, {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function fetchProgramCourses(token: string, programId: string): Promise<Course[]> {
  const response = await request(`/programs/${programId}/courses`, { token })
  return normalizeCollection<Course>(response)
}

export async function removeCourseFromProgram(token: string, programId: string, courseId: string): Promise<void> {
  await request(`/programs/${programId}/courses/${courseId}`, { method: 'DELETE', token })
}

// Courses
export async function fetchCoursesBySchool(token: string, schoolId: string): Promise<Course[]> {
  const response = await request(`/courses/schools/${schoolId}`, { token })
  return normalizeCollection<Course>(response)
}

export async function fetchCoursesByDepartment(token: string, departmentId: string): Promise<Course[]> {
  const response = await request(`/courses/departments/${departmentId}`, { token })
  return normalizeCollection<Course>(response)
}

export async function fetchCoursesByProgram(token: string, programId: string): Promise<Course[]> {
  const response = await request(`/courses/programs/${programId}`, { token })
  return normalizeCollection<Course>(response)
}

export async function fetchCourseById(token: string, courseId: string): Promise<Course | null> {
  return request(`/courses/${courseId}`, { token })
}

export async function createCourse(
  token: string,
  payload: {
    title: string
    code: string
    creditUnits: number
    schoolId: string
    departmentId: string
  },
): Promise<Course | null> {
  return request('/courses/add', { method: 'POST', token, body: payload })
}

export async function updateCourse(
  token: string,
  courseId: string,
  payload: { title: string; creditUnits: number },
): Promise<Course | null> {
  return request(`/courses/${courseId}`, { method: 'PUT', token, body: payload })
}

export async function deleteCourse(token: string, courseId: string): Promise<void> {
  await request(`/courses/${courseId}`, { method: 'DELETE', token })
}

export async function fetchAllUniversityCourses(token: string): Promise<Course[]> {
  const response = await request('/courses/university/all', { token })
  return normalizeCollection<Course>(response)
}

// Academic year / semester
export async function fetchAllAcademicYears(token: string): Promise<AcademicYear[]> {
  const response = await request('/academic-years/all', { token })
  return normalizeCollection<AcademicYear>(response)
}

export async function createAcademicYear(token: string, name: string): Promise<AcademicYear | null> {
  return request('/academic-years/add', { method: 'POST', token, body: { name } })
}

export async function activateAcademicYear(token: string, academicYearId: string): Promise<void> {
  await request(`/academic-years/${academicYearId}/activate`, { method: 'PUT', token })
}

export async function fetchSemestersByAcademicYear(token: string, academicYearId: string): Promise<Semester[]> {
  const response = await request(`/academic-years/${academicYearId}/semesters`, { token })
  return normalizeCollection<Semester>(response)
}

export async function createSemester(
  token: string,
  academicYearId: string,
  number: number,
): Promise<Semester | null> {
  const query = encodeURIComponent(String(number))
  return request(`/academic-years/${academicYearId}/semesters?number=${query}`, {
    method: 'POST',
    token,
    body: { number },
  })
}

export async function activateSemester(token: string, semesterId: string): Promise<void> {
  await request(`/semesters/${semesterId}/activate`, { method: 'PUT', token })
}

function countUsersByRole(users: User[], role: string): number {
  return users.filter((item) => String(item.role || '').toUpperCase() === role).length
}

export async function fetchDashboardSummary(token: string): Promise<DashboardSummary> {
  const [schools, allCourses, programs, users, academicYears] = await Promise.all([
    fetchAllSchools(token),
    fetchAllUniversityCourses(token),
    fetchAllProgramsMinimal(token),
    fetchAllUsers(token),
    fetchAllAcademicYears(token),
  ])

  const departmentsBySchool = await Promise.all(
    schools
      .map((school) => String(school.id || school.schoolId || ''))
      .filter(Boolean)
      .map((schoolId) => fetchDepartmentsBySchool(token, schoolId).catch(() => [])),
  )

  const totalDepartments = departmentsBySchool.flat().length

  const activeAcademicYear = academicYears.find((year) => Boolean(year.active)) || null
  let activeSemesterName = 'N/A'

  if (activeAcademicYear) {
    const activeYearId = String(activeAcademicYear.academicYearId || activeAcademicYear.id || '')
    if (activeYearId) {
      const semesters = await fetchSemestersByAcademicYear(token, activeYearId).catch(() => [])
      const activeSemester = semesters.find((semester) => Boolean(semester.active)) || null
      activeSemesterName = activeSemester?.name || 'N/A'
    }
  }

  return {
    totalSchools: schools.length,
    totalDepartments,
    totalPrograms: programs.length,
    totalCourses: allCourses.length,
    totalStudents: countUsersByRole(users, 'STUDENT'),
    totalAdmins: countUsersByRole(users, 'ADMIN'),
    totalFaculty: countUsersByRole(users, 'FACULTY'),
    activeAcademicYear: activeAcademicYear?.name || 'N/A',
    activeSemester: activeSemesterName,
  }
}